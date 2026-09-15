import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import { packFromState } from "./pack";
import { createRoom, pullRoom, pushRoom } from "./room-api";
import { fingerprintPack, mergePacks, type RoomPayload } from "./sync-core";
import { useDang } from "./store";

export type SyncStatus = "off" | "connecting" | "live" | "syncing" | "offline";

const POLL_MS = 2000;
const PUSH_DEBOUNCE_MS = 280;

function snapshotOf(gatheringId: string): RoomPayload | null {
  const s = useDang.getState();
  const gathering = s.gatherings.find((g) => g.id === gatheringId);
  if (!gathering) return null;
  return {
    pack: packFromState(gathering, s.people, s.expenses),
    tombstones: gathering.tombstones || [],
  };
}

const statusMap = new Map<string, SyncStatus>();
const serverFp = new Map<string, string>();
const listeners = new Set<() => void>();
const queues = new Map<string, Promise<void>>();
let applying = false;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;
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
  const payload = snapshotOf(gatheringId);
  if (!payload) return null;
  const created = await createRoom({ data: { payload } });
  if (!created.ok) return null;
  useDang.getState().updateGathering(gatheringId, {
    syncId: created.id,
    syncRev: created.rev,
  });
  return created.id;
}

async function flushNow(gatheringId: string) {
  const gathering = useDang.getState().gatherings.find((g) => g.id === gatheringId);
  if (!gathering) {
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
    const pulled = await pullRoom({ data: { id: syncId } });
    if (!pulled.ok) {
      setStatus(gatheringId, "offline");
      return;
    }
    const local = snapshotOf(gatheringId);
    if (!local) return;
    const localRev = useDang.getState().gatherings.find((g) => g.id === gatheringId)?.syncRev ?? 0;
    pulled.payload.pack.gathering.syncId = syncId;

    if (pulled.rev !== localRev) {
      const merged = mergePacks(
        pulled.payload.pack,
        local.pack,
        pulled.payload.tombstones,
        local.tombstones,
      );
      merged.pack.gathering.syncId = syncId;
      applying = true;
      useDang.getState().applyRemoteSnapshot(gatheringId, merged.pack);
      useDang.getState().updateGathering(gatheringId, {
        syncRev: pulled.rev,
        tombstones: merged.tombstones,
        syncId,
      });
      applying = false;
    }

    let payload = snapshotOf(gatheringId);
    if (!payload) return;
    payload.pack.gathering.syncId = syncId;
    const localFp = fingerprintPack(payload.pack, payload.tombstones);
    const remoteFp = fingerprintPack(pulled.payload.pack, pulled.payload.tombstones);
    if (localFp === remoteFp) {
      serverFp.set(gatheringId, localFp);
      useDang.getState().updateGathering(gatheringId, {
        syncRev: pulled.rev,
        syncId,
      });
      setStatus(gatheringId, "live");
      return;
    }

    let expected =
      useDang.getState().gatherings.find((g) => g.id === gatheringId)?.syncRev ?? 0;
    for (let attempt = 0; attempt < 4; attempt++) {
      const res = await pushRoom({
        data: { id: syncId, rev: expected, payload },
      });
      if (res.ok) {
        useDang.getState().updateGathering(gatheringId, { syncRev: res.rev, syncId });
        const after = snapshotOf(gatheringId);
        if (after) serverFp.set(gatheringId, fingerprintPack(after.pack, after.tombstones));
        setStatus(gatheringId, "live");
        return;
      }
      const merged = mergePacks(
        res.payload.pack,
        payload.pack,
        res.payload.tombstones,
        payload.tombstones,
      );
      merged.pack.gathering.syncId = syncId;
      applying = true;
      useDang.getState().applyRemoteSnapshot(gatheringId, merged.pack);
      useDang.getState().updateGathering(gatheringId, {
        syncRev: res.rev,
        tombstones: merged.tombstones,
        syncId,
      });
      applying = false;
      payload = snapshotOf(gatheringId);
      if (!payload) return;
      payload.pack.gathering.syncId = syncId;
      expected = res.rev;
    }
    setStatus(gatheringId, "offline");
  } catch {
    applying = false;
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
    if (!g.syncId) {
      if (fp !== serverFp.get(g.id)) void flushGathering(g.id);
      continue;
    }
    if (fp !== serverFp.get(g.id)) void flushGathering(g.id);
  }
}

function flushAllLive() {
  const s = useDang.getState();
  for (const g of s.gatherings) {
    if (g.archived || !g.syncId) continue;
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
  pollTimer = setInterval(() => {
    if (document.hidden) return;
    flushAllLive();
  }, POLL_MS);
  const onVis = () => {
    if (!document.hidden) flushAllLive();
  };
  document.addEventListener("visibilitychange", onVis);
  return () => {
    started = false;
    unsubStore?.();
    unsubStore = null;
    if (debounceTimer) clearTimeout(debounceTimer);
    if (pollTimer) clearInterval(pollTimer);
    document.removeEventListener("visibilitychange", onVis);
  };
}

export async function fetchRoomPack(syncId: string): Promise<RoomPayload | null> {
  const res = await pullRoom({ data: { id: syncId } });
  if (!res.ok) return null;
  res.payload.pack.gathering.syncId = syncId;
  return res.payload;
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
