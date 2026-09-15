import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import { newSyncId, packFromState } from "./pack";
import { fetchLivePack, openLiveSession, type LiveSession } from "./mqtt-room";
import { pullRoom } from "./room-api";
import { fingerprintPack, mergePacks, type RoomPayload } from "./sync-core";
import { useDang } from "./store";

export type SyncStatus = "off" | "connecting" | "live" | "syncing" | "offline";

const PUSH_DEBOUNCE_MS = 220;

function snapshotOf(gatheringId: string): RoomPayload | null {
  const s = useDang.getState();
  const gathering = s.gatherings.find((g) => g.id === gatheringId);
  if (!gathering) return null;
  const pack = packFromState(gathering, s.people, s.expenses);
  pack.gathering.syncId = gathering.syncId;
  return {
    pack,
    tombstones: gathering.tombstones || [],
  };
}

const statusMap = new Map<string, SyncStatus>();
const serverFp = new Map<string, string>();
const listeners = new Set<() => void>();
const sessions = new Map<string, LiveSession>();
const queues = new Map<string, Promise<void>>();
let applying = false;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let unsubStore: (() => void) | null = null;
let started = false;

function emit() {
  for (const fn of listeners) fn();
}

function setStatus(id: string, status: SyncStatus) {
  if (statusMap.get(id) === status) return;
  statusMap.set(id, status);
  emit();
}

function enqueue(id: string, job: () => Promise<void>) {
  const prev = queues.get(id) ?? Promise.resolve();
  const next = prev.then(job, job);
  queues.set(
    id,
    next.catch(() => {}),
  );
  return next;
}

export async function ensureGatheringRoom(gatheringId: string): Promise<string | null> {
  const gathering = useDang.getState().gatherings.find((g) => g.id === gatheringId);
  if (!gathering) return null;
  if (gathering.syncId) return gathering.syncId;
  const syncId = newSyncId();
  useDang.getState().updateGathering(gatheringId, { syncId, syncRev: 0 });
  return syncId;
}

function attachSession(gatheringId: string, syncId: string) {
  const existing = sessions.get(gatheringId);
  if (existing) return existing;
  const session = openLiveSession(syncId, (remote) => {
    const local = snapshotOf(gatheringId);
    if (!local) return;
    const remoteFp = fingerprintPack(remote.pack, remote.tombstones);
    const localFp = fingerprintPack(local.pack, local.tombstones);
    if (remoteFp === localFp) {
      serverFp.set(gatheringId, localFp);
      setStatus(gatheringId, "live");
      return;
    }
    const merged = mergePacks(
      remote.pack,
      local.pack,
      remote.tombstones,
      local.tombstones,
    );
    merged.pack.gathering.syncId = syncId;
    applying = true;
    useDang.getState().applyRemoteSnapshot(gatheringId, merged.pack);
    useDang.getState().updateGathering(gatheringId, {
      tombstones: merged.tombstones,
      syncId,
    });
    applying = false;
    const after = snapshotOf(gatheringId);
    if (!after) return;
    const afterFp = fingerprintPack(after.pack, after.tombstones);
    serverFp.set(gatheringId, afterFp);
    setStatus(gatheringId, "live");
    if (afterFp !== remoteFp) void session.publish(after);
  });
  sessions.set(gatheringId, session);
  return session;
}

async function flushNow(gatheringId: string) {
  const gathering = useDang.getState().gatherings.find((g) => g.id === gatheringId);
  if (!gathering || gathering.archived) {
    setStatus(gatheringId, "off");
    return;
  }
  setStatus(gatheringId, statusMap.get(gatheringId) === "live" ? "syncing" : "connecting");
  try {
    const syncId = gathering.syncId || (await ensureGatheringRoom(gatheringId));
    if (!syncId) {
      setStatus(gatheringId, "offline");
      return;
    }
    const session = attachSession(gatheringId, syncId);
    await session.ready;
    const payload = snapshotOf(gatheringId);
    if (!payload) return;
    payload.pack.gathering.syncId = syncId;
    const fp = fingerprintPack(payload.pack, payload.tombstones);
    if (fp !== serverFp.get(gatheringId)) {
      await session.publish(payload);
      serverFp.set(gatheringId, fp);
    }
    setStatus(gatheringId, "live");
  } catch (err) {
    console.warn("[sync] live flush failed", err);
    setStatus(gatheringId, "offline");
  }
}

export function flushGathering(gatheringId: string) {
  return enqueue(gatheringId, () => flushNow(gatheringId));
}

function flushDirty() {
  const s = useDang.getState();
  for (const g of s.gatherings) {
    if (g.archived) continue;
    const snap = snapshotOf(g.id);
    if (!snap) continue;
    const fp = fingerprintPack(snap.pack, snap.tombstones);
    if (fp !== serverFp.get(g.id)) void flushGathering(g.id);
  }
}

function flushAllLive() {
  const s = useDang.getState();
  for (const g of s.gatherings) {
    if (g.archived) continue;
    void flushGathering(g.id);
  }
}

export function startSyncEngine() {
  if (typeof window === "undefined") return () => {};
  if (started) return () => {};
  started = true;
  unsubStore = useDang.subscribe((s, prev) => {
    if (applying) return;
    if (
      s.people === prev.people &&
      s.gatherings === prev.gatherings &&
      s.expenses === prev.expenses
    ) {
      return;
    }
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      flushDirty();
    }, PUSH_DEBOUNCE_MS);
  });
  flushAllLive();
  const onVis = () => {
    if (!document.hidden) flushAllLive();
  };
  document.addEventListener("visibilitychange", onVis);
  return () => {
    started = false;
    unsubStore?.();
    unsubStore = null;
    if (debounceTimer) clearTimeout(debounceTimer);
    document.removeEventListener("visibilitychange", onVis);
    for (const session of sessions.values()) session.close();
    sessions.clear();
  };
}

export async function fetchRoomPack(syncId: string): Promise<RoomPayload | null> {
  const live = await fetchLivePack(syncId, 6000);
  if (live) {
    live.pack.gathering.syncId = syncId;
    return live;
  }
  try {
    const res = await pullRoom({ data: { id: syncId } });
    if (!res.ok) return null;
    res.payload.pack.gathering.syncId = syncId;
    return res.payload;
  } catch {
    return null;
  }
}

function subscribeStatus(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function useGatheringSync(gatheringId: string | undefined): SyncStatus {
  const status = useSyncExternalStore(
    subscribeStatus,
    (): SyncStatus =>
      gatheringId ? statusMap.get(gatheringId) || "connecting" : "off",
    (): SyncStatus => "off",
  );

  useEffect(() => {
    if (!gatheringId) return;
    void flushGathering(gatheringId);
  }, [gatheringId]);

  return gatheringId ? status : "off";
}

export const SyncStatusContext = createContext<SyncStatus>("off");

export function useSyncStatus() {
  return useContext(SyncStatusContext);
}
