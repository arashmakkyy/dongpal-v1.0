import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import { newSyncId, packFromState } from "./pack";
import { fingerprintPack, mergePacks, type RoomPayload } from "./sync-core";
import { createRoom, pullRoom, pushRoom } from "./room-api";
import { useDang } from "./store";

export type SyncStatus = "off" | "connecting" | "live" | "syncing" | "offline";

type RoomRow = { id: string; rev: number; payload: RoomPayload };
const PUSH_DEBOUNCE_MS = 220;
/** Idle safety net: an owner with no local edits still learns about joiners. */
const POLL_MS = 15_000;
const WRITE_RETRIES = 3;

const statusMap = new Map<string, SyncStatus>();
/** Fingerprint of the last server payload we saw or wrote (per gathering). */
const lastServerFp = new Map<string, string>();
/** Fingerprint of the last local snapshot we flushed (per gathering). */
const localFpCache = new Map<string, string>();
const listeners = new Set<() => void>();
const queues = new Map<string, Promise<void>>();
let applying = 0;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let unsubStore: (() => void) | null = null;
let started = false;

// --- Per-room write secrets (capability for writes) -------------------------
const SECRETS_KEY = "dangpal-room-secrets";
function loadSecrets(): Record<string, string> {
  try {
    const raw = localStorage.getItem(SECRETS_KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw) as Record<string, string>;
    return obj && typeof obj === "object" ? obj : {};
  } catch {
    return {};
  }
}
function getSecret(syncId: string): string | null {
  try {
    return loadSecrets()[syncId] ?? null;
  } catch {
    return null;
  }
}
function setSecret(syncId: string, secret: string) {
  try {
    const all = loadSecrets();
    all[syncId] = secret;
    localStorage.setItem(SECRETS_KEY, JSON.stringify(all));
  } catch {
    /* private mode quota */
  }
}

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

async function readRoom(syncId: string): Promise<RoomRow | null> {
  try {
    const res = await pullRoom({ data: { id: syncId } });
    if (!res.ok) return null;
    return { id: res.id, rev: res.rev, payload: res.payload };
  } catch {
    return null;
  }
}

/**
 * Merge a server row into the local store (union of people/expenses).
 * Returns true when local shareable content actually changed.
 */
function applyRemoteRow(gatheringId: string, row: RoomRow): boolean {
  const remote = row.payload;
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
 * Converge server toward local state with optimistic concurrency via
 * server functions (no direct DB access from the browser).
 */
async function pushWithRetry(gatheringId: string, syncId: string): Promise<RoomRow | null> {
  for (let attempt = 0; attempt < WRITE_RETRIES; attempt += 1) {
    const before = await readRoom(syncId);
    // First push for a locally-created syncId: claim a server room.
    if (!before) {
      const payload = snapshotOf(gatheringId);
      if (!payload) return null;
      const fp = fpOf(payload);
      try {
        const created = await createRoom({ data: { payload } });
        if (created.ok) {
          setSecret(created.id, created.secret);
          // Server issued the canonical id — adopt it locally.
          if (created.id !== syncId) {
            applying += 1;
            try { useDang.getState().updateGathering(gatheringId, { syncId: created.id, syncRev: created.rev }); }
            finally { applying -= 1; }
          } else {
            useDang.getState().updateGathering(gatheringId, { syncRev: created.rev });
          }
          lastServerFp.set(gatheringId, fp);
          localFpCache.set(gatheringId, fp);
          return { id: created.id, rev: created.rev, payload };
        }
      } catch (err) {
        console.warn("[sync] create room failed", err);
        throw err;
      }
      continue;
    }
    const beforeFp = fpOf(before.payload);
    try { applyRemoteRow(gatheringId, before); } catch (err) {
      console.warn("[sync] apply remote failed", err);
    }
    const payload = snapshotOf(gatheringId);
    if (!payload) return before;
    const fp = fpOf(payload);
    if (beforeFp === fp) {
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
    const secret = getSecret(syncId);
    if (!secret) {
      // Legacy local syncId without a secret: adopt a fresh server room.
      const created = await createRoom({ data: { payload } });
      if (created.ok) {
        setSecret(created.id, created.secret);
        applying += 1;
        try { useDang.getState().updateGathering(gatheringId, { syncId: created.id, syncRev: created.rev }); }
        finally { applying -= 1; }
        lastServerFp.set(gatheringId, fp);
        localFpCache.set(gatheringId, fp);
        return { id: created.id, rev: created.rev, payload };
      }
      continue;
    }
    try {
      const res = await pushRoom({ data: { id: syncId, rev: before.rev, secret, payload } });
      if (res.ok) {
        useDang.getState().updateGathering(gatheringId, { syncRev: res.rev });
        lastServerFp.set(gatheringId, fp);
        localFpCache.set(gatheringId, fp);
        return { id: res.id, rev: res.rev, payload };
      }
      if ((res as { error?: string }).error === "forbidden") {
        console.warn("[sync] push forbidden — stale secret");
        return before;
      }
      if ((res as { error?: string }).error === "not_found") return before;
      // Conflict: server has newer rev — re-read, merge, retry.
      continue;
    } catch (err) {
      if (attempt === WRITE_RETRIES - 1) throw err;
      continue;
    }
  }
  throw new Error("sync_conflict");
}

async function flushNow(gatheringId: string) {
  const gathering = useDang.getState().gatherings.find((g) => g.id === gatheringId);
  if (!gathering || gathering.archived) { setStatus(gatheringId, "off"); return; }
  setStatus(gatheringId, statusMap.get(gatheringId) === "live" ? "syncing" : "connecting");
  try {
    const syncId = gathering.syncId || (await ensureGatheringRoom(gatheringId));
    if (!syncId) throw new Error("missing_sync_id");
    await pushWithRetry(gatheringId, syncId);
    setStatus(gatheringId, "live");
  } catch (err) { console.warn("[sync] server flush failed", err); setStatus(gatheringId, "offline"); }
}
export function flushGathering(id: string) { return enqueue(id, () => flushNow(id)); }
function flushAllLive() {
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
  };
}

export async function fetchRoomPack(syncId: string): Promise<RoomPayload | null> {
  try {
    const res = await pullRoom({ data: { id: syncId } });
    return res.ok ? res.payload : null;
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
