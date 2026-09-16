import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import { newSyncId, packFromState } from "./pack";
import { fingerprintPack, mergePacks, type RoomPayload } from "./sync-core";
import { supabase } from "./supabase";
import { useDang } from "./store";

export type SyncStatus = "off" | "connecting" | "live" | "syncing" | "offline";

type RoomRow = { id: string; rev: number; payload: string };
const PUSH_DEBOUNCE_MS = 220;
const statusMap = new Map<string, SyncStatus>();
const serverFp = new Map<string, string>();
const listeners = new Set<() => void>();
const channels = new Map<string, ReturnType<typeof supabase.channel>>();
const queues = new Map<string, Promise<void>>();
let applying = false;
const ignoredStoreFlushes = new Set<string>();
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let unsubStore: (() => void) | null = null;
let started = false;

function emit() { for (const fn of listeners) fn(); }
function setStatus(id: string, status: SyncStatus) { if (statusMap.get(id) !== status) { statusMap.set(id, status); emit(); } }
function enqueue(id: string, job: () => Promise<void>) {
  const next = (queues.get(id) ?? Promise.resolve()).then(job, job);
  queues.set(id, next.catch(() => {}));
  return next;
}
function snapshotOf(id: string): RoomPayload | null {
  const s = useDang.getState();
  const gathering = s.gatherings.find((g) => g.id === id);
  if (!gathering) return null;
  const pack = packFromState(gathering, s.people, s.expenses);
  pack.gathering.syncId = gathering.syncId;
  return { pack, tombstones: gathering.tombstones || [] };
}
function parseRow(row: RoomRow): RoomPayload | null {
  try { const value = JSON.parse(row.payload) as RoomPayload; return value?.pack ? value : null; } catch { return null; }
}

export async function ensureGatheringRoom(gatheringId: string): Promise<string | null> {
  const gathering = useDang.getState().gatherings.find((g) => g.id === gatheringId);
  if (!gathering) return null;
  if (gathering.syncId) return gathering.syncId;
  const syncId = newSyncId();
  useDang.getState().updateGathering(gatheringId, { syncId, syncRev: 0 });
  return syncId;
}

async function readRoom(syncId: string) {
  const { data, error } = await supabase.from("gathering_rooms").select("id, rev, payload").eq("id", syncId).maybeSingle<RoomRow>();
  if (error) throw error;
  return data;
}
async function writeRoom(syncId: string, payload: RoomPayload) {
  const text = JSON.stringify(payload);
  const current = await readRoom(syncId);
  const nextRev = (current?.rev ?? 0) + 1;
  const { data, error } = await supabase
    .from("gathering_rooms")
    .upsert({ id: syncId, rev: nextRev, payload: text, updated_at: new Date().toISOString() }, { onConflict: "id" })
    .select("id, rev, payload")
    .single<RoomRow>();
  if (error) throw error;
  return data;
}

function applyRemoteRow(gatheringId: string, row: RoomRow) {
  const remote = parseRow(row);
  const local = snapshotOf(gatheringId);
  if (!remote || !local) return;
  const remoteFp = fingerprintPack(remote.pack, remote.tombstones);
  const localFp = fingerprintPack(local.pack, local.tombstones);
  ignoredStoreFlushes.add(gatheringId);
  queueMicrotask(() => ignoredStoreFlushes.delete(gatheringId));
  if (remoteFp !== localFp) {
    const merged = mergePacks(remote.pack, local.pack, remote.tombstones, local.tombstones);
    applying = true;
    useDang.getState().applyRemoteSnapshot(gatheringId, merged.pack);
    useDang.getState().updateGathering(gatheringId, { tombstones: merged.tombstones, syncRev: row.rev });
    applying = false;
  } else {
    useDang.getState().updateGathering(gatheringId, { syncRev: row.rev });
  }
  const after = snapshotOf(gatheringId);
  if (after) serverFp.set(gatheringId, fingerprintPack(after.pack, after.tombstones));
  setStatus(gatheringId, "live");
}

function attachChannel(gatheringId: string, syncId: string) {
  if (channels.has(gatheringId)) return;
  const channel = supabase.channel(`gathering-room:${syncId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "gathering_rooms", filter: `id=eq.${syncId}` }, (payload) => {
      if (payload.new && typeof payload.new === "object") applyRemoteRow(gatheringId, payload.new as RoomRow);
    })
    .subscribe((status) => { if (status === "SUBSCRIBED") setStatus(gatheringId, "live"); if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") setStatus(gatheringId, "offline"); });
  channels.set(gatheringId, channel);
}

async function flushNow(gatheringId: string) {
  const gathering = useDang.getState().gatherings.find((g) => g.id === gatheringId);
  if (!gathering || gathering.archived) { setStatus(gatheringId, "off"); return; }
  setStatus(gatheringId, statusMap.get(gatheringId) === "live" ? "syncing" : "connecting");
  try {
    const syncId = gathering.syncId || (await ensureGatheringRoom(gatheringId));
    if (!syncId) throw new Error("missing_sync_id");
    attachChannel(gatheringId, syncId);
    const remote = await readRoom(syncId);
    const remotePayload = remote ? parseRow(remote) : null;
    const remoteFp = remotePayload ? fingerprintPack(remotePayload.pack, remotePayload.tombstones) : null;
    if (remote) applyRemoteRow(gatheringId, remote);
    const payload = snapshotOf(gatheringId);
    if (!payload) return;
    const fp = fingerprintPack(payload.pack, payload.tombstones);
    // A local member/expense may exist only on this device. Compare against
    // the server row, not serverFp: applyRemoteRow merges first and updates
    // serverFp, which previously caused the merged local change to be skipped.
    if (fp !== remoteFp && fp !== serverFp.get(gatheringId)) {
      const saved = await writeRoom(syncId, payload);
      useDang.getState().updateGathering(gatheringId, { syncRev: saved.rev });
      serverFp.set(gatheringId, fp);
    }
    setStatus(gatheringId, "live");
  } catch (err) { console.warn("[sync] Supabase flush failed", err); setStatus(gatheringId, "offline"); }
}
export function flushGathering(id: string) { return enqueue(id, () => flushNow(id)); }
function flushDirty() { for (const g of useDang.getState().gatherings) { if (!g.archived && snapshotOf(g.id)) void flushGathering(g.id); } }
function flushAllLive() { for (const g of useDang.getState().gatherings) if (!g.archived) void flushGathering(g.id); }

export function startSyncEngine() {
  if (typeof window === "undefined" || started) return () => {};
  started = true;
  unsubStore = useDang.subscribe((s, prev) => {
    if (applying || ignoredStoreFlushes.size > 0 || (s.people === prev.people && s.gatherings === prev.gatherings && s.expenses === prev.expenses)) return;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => { debounceTimer = null; flushDirty(); }, PUSH_DEBOUNCE_MS);
  });
  flushAllLive();
  const onVis = () => { if (!document.hidden) flushAllLive(); };
  document.addEventListener("visibilitychange", onVis);
  return () => { started = false; unsubStore?.(); unsubStore = null; document.removeEventListener("visibilitychange", onVis); for (const c of channels.values()) void supabase.removeChannel(c); channels.clear(); };
}

export async function fetchRoomPack(syncId: string): Promise<RoomPayload | null> {
  try { const row = await readRoom(syncId); return row ? parseRow(row) : null; } catch { return null; }
}
function subscribeStatus(fn: () => void) { listeners.add(fn); return () => listeners.delete(fn); }
export function useGatheringSync(gatheringId: string | undefined): SyncStatus {
  const status = useSyncExternalStore<SyncStatus>(subscribeStatus, () => gatheringId ? statusMap.get(gatheringId) || "connecting" : "off", () => "off");
  useEffect(() => { if (gatheringId) void flushGathering(gatheringId); }, [gatheringId]);
  return gatheringId ? status : "off";
}
export const SyncStatusContext = createContext<SyncStatus>("off");
export function useSyncStatus() { return useContext(SyncStatusContext); }
