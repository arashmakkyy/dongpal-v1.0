import { SyncStatusContext, useGatheringSync, type SyncStatus } from "@/lib/sync";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GatheringSyncProvider({
  gatheringId,
  children,
}: {
  gatheringId: string;
  children: ReactNode;
}) {
  const status = useGatheringSync(gatheringId);
  return (
    <SyncStatusContext.Provider value={status}>{children}</SyncStatusContext.Provider>
  );
}

export function SyncPill({ status }: { status?: SyncStatus }) {
  const ctx = status;
  if (!ctx || ctx === "off") return null;
  const label =
    ctx === "live"
      ? "زنده با دوستات"
      : ctx === "offline"
        ? "آفلاین — ذخیره روی دستگاه"
        : "در حال همگام‌سازی";
  const dot =
    ctx === "live"
      ? "bg-primary"
      : ctx === "offline"
        ? "bg-danger"
        : "bg-accent";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-bold text-primary">
      <span
        className={cn(
          "size-1.5 rounded-full",
          dot,
          ctx === "live" && "animate-pulse",
        )}
      />
      {label}
    </span>
  );
}
