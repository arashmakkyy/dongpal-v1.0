import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { type ReactNode } from "react";
import { createPortal } from "react-dom";

export function Sheet({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  if (!open || typeof document === "undefined") return null;
  const host = document.getElementById("app-phone") ?? document.body;
  return createPortal(
    <div className="absolute inset-0 z-[70] flex items-end">
      <button
        type="button"
        aria-label="بستن"
        className="absolute inset-0 bg-fg/40"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-10 max-h-[86%] w-full overflow-y-auto rounded-t-3xl bg-surface p-5 pb-[max(20px,env(safe-area-inset-bottom))] shadow-float anim-pop",
          className,
        )}
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-border" />
        {title && (
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-bold">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="flex size-11 items-center justify-center rounded-xl text-muted"
              aria-label="بستن"
            >
              <X className="size-4" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>,
    host,
  );
}
