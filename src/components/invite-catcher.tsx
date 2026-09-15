import {
  decodePack,
  peekSyncId,
  readInviteFromLocation,
  readSyncIdFromLocation,
  stashInvite,
  stashSyncId,
} from "@/lib/pack";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

/** If a share URL lands on `/` (hash/query kept after a rewrite), send it to /join. */
export function InviteCatcher() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname !== "/" && pathname !== "/welcome") return;
    const syncId = readSyncIdFromLocation() || peekSyncId();
    if (syncId) {
      stashSyncId(syncId);
      navigate({ to: "/join", search: { s: syncId } });
      return;
    }
    const raw = readInviteFromLocation();
    if (!raw) return;
    if (!decodePack(raw)) return;
    stashInvite(raw);
    navigate({ to: "/join" });
  }, [pathname, navigate]);

  return null;
}
