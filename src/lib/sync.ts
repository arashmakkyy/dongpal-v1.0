import { createContext, useContext, useEffect, useRef, useState } from "react";
import { packFromState } from "./pack";
import { createRoom, pullRoom, pushRoom } from "./room-api";
import { fingerprintPack, mergePacks, type RoomPayload } from "./sync-core";
import { useDang } from "./store";

export type SyncStatus = "off" | "connecting" | "live" | "syncing" | "offline";

const POLL_MS = 2500;
const PUSH_DEBOUNCE_MS = 350;

function snapshotOf(gatheringId: string): RoomPayload | null {
  const s = useDang.getState();
  const gathering = s.gatherings.find((g) => g.id === gatheringId);
  if (!gathering) return null;
  return {
    pack: packFromState(gathering, s.people, s.expenses),
    tombstones: gathering.tombstones || [],
  };
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

async function pullGathering(gatheringId: string): Promise<"same" | "need-push" | "offline"> {
  const gathering = useDang.getState().gatherings.find((g) => g.id === gatheringId);
  if (!gathering?.syncId) return "offline";
  const res = await pullRoom({ data: { id: gathering.syncId } });
  if (!res.ok) return "offline";
  const local = snapshotOf(gatheringId);
  if (!local) return "offline";
  if (res.rev === (gathering.syncRev ?? 0)) {
    const localFp = fingerprintPack(local.pack, local.tombstones);
    const remoteFp = fingerprintPack(res.payload.pack, res.payload.tombstones);
    return localFp === remoteFp ? "same" : "need-push";
  }
  const merged = mergePacks(
    res.payload.pack,
    local.pack,
    res.payload.tombstones,
    local.tombstones,
  );
  merged.pack.gathering.syncId = gathering.syncId;
  useDang.getState().applyRemoteSnapshot(gatheringId, merged.pack);
  useDang.getState().updateGathering(gatheringId, {
    syncRev: res.rev,
    tombstones: merged.tombstones,
    syncId: gathering.syncId,
  });
  const after = snapshotOf(gatheringId);
  if (!after) return "same";
  const afterFp = fingerprintPack(after.pack, after.tombstones);
  const remoteFp = fingerprintPack(res.payload.pack, res.payload.tombstones);
  return afterFp === remoteFp ? "same" : "need-push";
}

async function pushGathering(gatheringId: string): Promise<boolean> {
  const gathering = useDang.getState().gatherings.find((g) => g.id === gatheringId);
  if (!gathering?.syncId) return false;
  let payload = snapshotOf(gatheringId);
  if (!payload) return false;
  payload.pack.gathering.syncId = gathering.syncId;
  let expected = gathering.syncRev ?? 0;
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await pushRoom({
      data: { id: gathering.syncId, rev: expected, payload },
    });
    if (res.ok) {
      useDang.getState().updateGathering(gatheringId, { syncRev: res.rev });
      return true;
    }
    const merged = mergePacks(
      res.payload.pack,
      payload.pack,
      res.payload.tombstones,
      payload.tombstones,
    );
    merged.pack.gathering.syncId = gathering.syncId;
    useDang.getState().applyRemoteSnapshot(gatheringId, merged.pack);
    useDang.getState().updateGathering(gatheringId, {
      syncRev: res.rev,
      tombstones: merged.tombstones,
      syncId: gathering.syncId,
    });
    payload = merged;
    expected = res.rev;
  }
  return false;
}

export async function fetchRoomPack(syncId: string): Promise<RoomPayload | null> {
  const res = await pullRoom({ data: { id: syncId } });
  if (!res.ok) return null;
  res.payload.pack.gathering.syncId = syncId;
  return res.payload;
}

export function useGatheringSync(gatheringId: string | undefined) {
  const [status, setStatus] = useState<SyncStatus>(gatheringId ? "connecting" : "off");
  const applying = useRef(false);
  const lastFp = useRef("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const poll = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!gatheringId) {
      setStatus("off");
      return;
    }
    let cancelled = false;
    const id = gatheringId;
    setStatus("connecting");

    function clearPushTimer() {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
    }

    function schedulePush() {
      if (cancelled || applying.current) return;
      clearPushTimer();
      timer.current = setTimeout(async () => {
        if (cancelled || applying.current) return;
        const snap = snapshotOf(id);
        if (!snap) return;
        const fp = fingerprintPack(snap.pack, snap.tombstones);
        if (fp === lastFp.current) return;
        setStatus("syncing");
        try {
          applying.current = true;
          const ok = await pushGathering(id);
          const after = snapshotOf(id);
          if (after) lastFp.current = fingerprintPack(after.pack, after.tombstones);
          if (!cancelled) setStatus(ok ? "live" : "offline");
        } catch {
          if (!cancelled) setStatus("offline");
        } finally {
          applying.current = false;
        }
      }, PUSH_DEBOUNCE_MS);
    }

    async function runPull() {
      if (cancelled || document.hidden) return;
      try {
        applying.current = true;
        const result = await pullGathering(id);
        const snap = snapshotOf(id);
        if (snap && result === "same") {
          lastFp.current = fingerprintPack(snap.pack, snap.tombstones);
        }
        if (!cancelled) setStatus(result === "offline" ? "offline" : "live");
        applying.current = false;
        if (result === "need-push") schedulePush();
      } catch {
        applying.current = false;
        if (!cancelled) setStatus("offline");
      }
    }

    async function boot() {
      try {
        await ensureGatheringRoom(id);
        await runPull();
        const snap = snapshotOf(id);
        if (snap) {
          const fp = fingerprintPack(snap.pack, snap.tombstones);
          if (!lastFp.current) lastFp.current = fp;
          else if (fp !== lastFp.current) schedulePush();
        }
      } catch {
        if (!cancelled) setStatus("offline");
      }
    }

    const unsub = useDang.subscribe(() => {
      if (applying.current || cancelled) return;
      schedulePush();
    });

    function onVis() {
      if (document.hidden) return;
      void runPull();
    }

    void boot();
    poll.current = setInterval(() => void runPull(), POLL_MS);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelled = true;
      clearPushTimer();
      if (poll.current) clearInterval(poll.current);
      unsub();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [gatheringId]);

  return status;
}

export const SyncStatusContext = createContext<SyncStatus>("off");

export function useSyncStatus() {
  return useContext(SyncStatusContext);
}
