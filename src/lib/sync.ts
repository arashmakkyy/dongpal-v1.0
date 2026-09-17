import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { newSyncId, packFromState } from "./pack";
import { fingerprintPack, mergePacks, type RoomPayload } from "./sync-core";
import { getSupabase } from "./supabase";
import { useDang } from "./store";

export type SyncStatus = "off" | "connecting" | "live" | "syncing" | "offline";

type RoomRow = { id: string; rev: number; payload: string };
const PUSH_DEBOUNCE_MS = 220;
/** Idle safety net: an owner with no local edits still learns about joiners. */
const POLL_MS = 15_000;
const WRITE_RETRIES = 3;
const REATTACH_MS = 4_000;

const statusMap = new Map<string, SyncStatus>();
/** Fingerprint of the last server payload we saw or wrote (per gathering). */
const lastServerFp = new Map<string, string>();
/** Fingerprint of the last local snapshot we flushed (per gathering). */
const localFpCache = new Map<string, string>();
const listeners = new Set<() => void>();
const channels = new Map<string, RealtimeChannel>();
const reattachTimers = new Map<string, ReturnType<typeof setTimeout>>();
const queues = new Map<string, Promise<void>>();
let applying = 0;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;
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
function fpOf(payload: RoomPayload) {
  return fingerprintPack(payload.pack, payload.tombstones);
}

export async function ensureGatheringRoom(gatheringId: string): Promise<string | null> {
  const gathering = useDang.getState().gatherings.find((g) => g.id === gatheringId);
  if (!gathering) return null;
  if (gathering.syncId) return gathering.syncId;
  const syncId = newSyncId();
  useDang.getState().updateGathering(gatheringId, { syncId, syncRev: 0 });
  return syncId;
}

async function readRoom(sup: SupabaseClient, syncId: string) {
  const { data, error } = await sup.from("gathering_rooms").select("id, rev, payload").eq("id", syncId).maybeSingle<RoomRow>();
  if (error) throw error;
  return (data ?? null) as RoomRow | null;
}

/**
 * Merge a server row into the local store (union of people/expenses).
 * Returns true when local shareable content actually changed.
 */
function applyRemoteRow(gatheringId: string, row: RoomRow): boolean {
  const remote = parseRow(row);
  const local = snapshotOf(gatheringId);
  if (!remote || !local) return false;
  const remoteFp = fpOf(remote);
  const localFp = fpOf(local);
  lastServerFp.set(gatheringId, remoteFp);
  if (remoteFp === localFp) {
    const g = useDang.getState().gatherings.find((x) => x.id === gatheringId);
    if (g && g.syncRev !== row.rev) {
      applying += 1;
      try { useDang.getState().updateGathering(gatheringId, { syncRev: row.rev }); }
      finally { applying -= 1; }
    }
    localFpCache.set(gatheringId, localFp);
    return false;
  }
  const merged = mergePacks(remote.pack, local.pack, remote.tombstones, local.tombstones);
  applying += 1;
  try {
    useDang.getState().applyRemoteSnapshot(gatheringId, merged.pack);
    useDang.getState().updateGathering(gatheringId, { tombstones: merged.tombstones, syncRev: row.rev });
  } finally {
    applying -= 1;
  }
  const after = snapshotOf(gatheringId);
  if (after) localFpCache.set(gatheringId, fpOf(after));
  return true;
}

/**
 * Converge server toward local state with optimistic concurrency:
 * every attempt re-reads, union-merges, then conditional-writes
 * (`where rev = <seen>`), so two devices writing at once can never
 * silently clobber each other — the loser re-merges and retries.
 */
async function pushWithRetry(gatheringId: string, syncId: string): Promise<RoomRow | null> {
  const sup = getSupabase();
  if (!sup) return null;
  for (let attempt = 0; attempt < WRITE_RETRIES; attempt += 1) {
    const before = await readRoom(sup, syncId);
    const beforePayload = before ? parseRow(before) : null;
    const beforeFp = beforePayload ? fpOf(beforePayload) : null;
    if (before && beforePayload) {
      // Pull first: never overwrite a stranger's write.
      try { applyRemoteRow(gatheringId, before); } catch (err) {
        console.warn("[sync] apply remote failed", err);
      }
    }
    const payload = snapshotOf(gatheringId);
    if (!payload) return before;
    const fp = fpOf(payload);
    if (before && beforeFp === fp) {
      // Server already holds exactly this content (our echo / twin write).
      const g = useDang.getState().gatherings.find((x) => x.id === gatheringId);
      if (g && g.syncRev !== before.rev) {
        applying += 1;
        try { useDang.getState().updateGathering(gatheringId, { syncRev: before.rev }); }
        finally { applying -= 1; }
      }
      lastServerFp.set(gatheringId, fp);
      localFpCache.set(gatheringId, fp);
      return before;
    }
    const text = JSON.stringify(payload);
    const stamp = new Date().toISOString();
    if (!before) {
      const { data, error } = await sup
        .from("gathering_rooms")
        .insert({ id: syncId, rev: 1, payload: text, updated_at: stamp })
        .select("id, rev, payload")
        .single<RoomRow>();
      if (!error && data) {
        useDang.getState().updateGathering(gatheringId, { syncRev: (data as RoomRow).rev });
        lastServerFp.set(gatheringId, fp);
        localFpCache.set(gatheringId, fp);
        return data as RoomRow;
      }
      // A concurrent insert (or a transient error): re-read, merge, retry.
      if (error && (error as { code?: string }).code !== "23505" && attempt === WRITE_RETRIES - 1) throw error;
      continue;
    }
    const { data, error } = await sup
      .from("gathering_rooms")
      .update({ payload: text, rev: before.rev + 1, updated_at: stamp })
      .eq("id", syncId)
      .eq("rev", before.rev)
      .select("id, rev, payload")
      .maybeSingle<RoomRow>();
    if (error) throw error;
    if (data) {
      useDang.getState().updateGathering(gatheringId, { syncRev: (data as RoomRow).rev });
      lastServerFp.set(gatheringId, fp);
      localFpCache.set(gatheringId, fp);
      return data as RoomRow;
    }
    // Lost the race: someone bumped rev between our read and write — retry.
  }
  throw new Error("sync_conflict");
}

function detachChannel(gatheringId: string) {
  const ch = channels.get(gatheringId);
  if (!ch) return;
  channels.delete(gatheringId);
  const sup = getSupabase();
  if (!sup) return;
  try {
    void Promise.resolve(sup.removeChannel(ch)).catch(() => undefined);
  } catch {
    /* ignore */
  }
}

function scheduleReattach(gatheringId: string) {
  if (reattachTimers.has(gatheringId)) return;
  const t = setTimeout(() => {
    reattachTimers.delete(gatheringId);
    detachChannel(gatheringId);
    void flushGathering(gatheringId);
  }, REATTACH_MS);
  reattachTimers.set(gatheringId, t);
}

function attachChannel(gatheringId: string, syncId: string) {
  const sup = getSupabase();
  if (!sup || typeof window === "undefined") return;
  if (channels.has(gatheringId)) return;
  const channel = sup.channel(`gathering-room:${syncId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "gathering_rooms", filter: `id=eq.${syncId}` }, (incoming) => {
      const row = (incoming as { new?: unknown }).new as RoomRow | undefined;
      if (!row || typeof row !== "object" || typeof (row as RoomRow).payload !== "string") return;
      let changed = false;
      try {
        changed = applyRemoteRow(gatheringId, row as RoomRow);
      } catch (err) {
        console.warn("[sync] apply remote failed", err);
        return;
      }
      setStatus(gatheringId, "live");
      if (changed) {
        // Union-merged server state with possible local-only edits:
        // push the union back only if we actually add something new.
        const snap = snapshotOf(gatheringId);
        const remoteParsed = parseRow(row as RoomRow);
        if (snap && remoteParsed && fpOf(snap) !== fpOf(remoteParsed)) {
          void flushGathering(gatheringId);
        }
      }
    })
    .subscribe((status) => {
      if (status === "SUBSCRIBED") setStatus(gatheringId, "live");
      else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        setStatus(gatheringId, "offline");
        scheduleReattach(gatheringId);
      }
    });
  channels.set(gatheringId, channel);
}

async function flushNow(gatheringId: string) {
  const gathering = useDang.getState().gatherings.find((g) => g.id === gatheringId);
  if (!gathering || gathering.archived) { setStatus(gatheringId, "off"); return; }
  const sup = getSupabase();
  if (!sup) { setStatus(gatheringId, "off"); return; }
  setStatus(gatheringId, statusMap.get(gatheringId) === "live" ? "syncing" : "connecting");
  try {
    const syncId = gathering.syncId || (await ensureGatheringRoom(gatheringId));
    if (!syncId) throw new Error("missing_sync_id");
    attachChannel(gatheringId, syncId);
    await pushWithRetry(gatheringId, syncId);
    setStatus(gatheringId, "live");
  } catch (err) { console.warn("[sync] Supabase flush failed", err); setStatus(gatheringId, "offline"); }
}
export function flushGathering(id: string) { return enqueue(id, () => flushNow(id)); }
function flushAllLive() {
  const sup = getSupabase();
  if (!sup) return;
  for (const g of useDang.getState().gatherings) if (!g.archived) void flushGathering(g.id);
}

export function startSyncEngine() {
  if (typeof window === "undefined" || started) return () => {};
  started = true;
  // Seed the content cache so the subscriber only flushes real edits —
  // syncRev-only store writes must not re-trigger network reads.
  try {
    for (const g of useDang.getState().gatherings) {
      if (g.archived) continue;
      const snap = snapshotOf(g.id);
      if (snap) localFpCache.set(g.id, fpOf(snap));
    }
  } catch {
    /* ignore */
  }
  unsubStore = useDang.subscribe((s, prev) => {
    if (applying > 0) return;
    if (s.people === prev.people && s.gatherings === prev.gatherings && s.expenses === prev.expenses) return;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      try {
        for (const g of useDang.getState().gatherings) {
          if (g.archived) continue;
          let fp: string | null = null;
          try {
            const snap = snapshotOf(g.id);
            fp = snap ? fpOf(snap) : null;
          } catch {
            continue;
          }
          if (fp === null) { localFpCache.delete(g.id); continue; }
          if (localFpCache.get(g.id) !== fp) {
            localFpCache.set(g.id, fp);
            void flushGathering(g.id);
          }
        }
      } catch {
        /* ignore */
      }
    }, PUSH_DEBOUNCE_MS);
  });
  flushAllLive();
  const onVis = () => { if (!document.hidden) flushAllLive(); };
  const onOnline = () => flushAllLive();
  document.addEventListener("visibilitychange", onVis);
  window.addEventListener("online", onOnline);
  window.addEventListener("focus", onOnline);
  pollTimer = setInterval(() => {
    try {
      const sup = getSupabase();
      if (!sup) return;
      for (const g of useDang.getState().gatherings) {
        if (g.archived || !g.syncId) continue;
        void flushGathering(g.id);
      }
    } catch {
      /* ignore */
    }
  }, POLL_MS);
  return () => {
    started = false;
    unsubStore?.(); unsubStore = null;
    if (debounceTimer) clearTimeout(debounceTimer);
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = null;
    document.removeEventListener("visibilitychange", onVis);
    window.removeEventListener("online", onOnline);
    window.removeEventListener("focus", onOnline);
    for (const id of [...reattachTimers.keys()]) {
      clearTimeout(reattachTimers.get(id));
      reattachTimers.delete(id);
    }
    const sup = getSupabase();
    for (const c of channels.values()) {
      if (sup) {
        try { void Promise.resolve(sup.removeChannel(c)).catch(() => undefined); }
        catch { /* ignore */ }
      }
    }
    channels.clear();
  };
}

export async function fetchRoomPack(syncId: string): Promise<RoomPayload | null> {
  try {
    const sup = getSupabase();
    if (!sup) return null;
    const row = await readRoom(sup, syncId);
    return row ? parseRow(row) : null;
  } catch { return null; }
}
function subscribeStatus(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }
export function useGatheringSync(gatheringId: string | undefined): SyncStatus {
  const status = useSyncExternalStore<SyncStatus>(subscribeStatus, () => gatheringId ? statusMap.get(gatheringId) || "connecting" : "off", () => "off");
  useEffect(() => { if (gatheringId) void flushGathering(gatheringId); }, [gatheringId]);
  return gatheringId ? status : "off";
}
export const SyncStatusContext = createContext<SyncStatus>("off");
export function useSyncStatus() { return useContext(SyncStatusContext); }
