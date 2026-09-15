import { useEffect, useState, type ReactNode } from "react";
import { HeartMark } from "./shell";
import { useDang } from "@/lib/store";

export function HydrateGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const finish = () => {
      useDang.getState().setHydrated();
      setReady(true);
    };
    if (useDang.persist.hasHydrated()) {
      finish();
      return;
    }
    return useDang.persist.onFinishHydration(finish);
  }, []);

  if (!ready) return <Splash />;
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">{children}</div>
  );
}

export function Splash() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-bg">
      <div className="flex flex-col items-center gap-3">
        <div className="flex size-16 items-center justify-center rounded-3xl bg-primary text-2xl font-extrabold text-primary-fg shadow-[0_10px_24px_rgba(14,159,134,0.3)]">
          د
        </div>
        <h1 className="text-2xl font-extrabold text-primary">دنگ‌پال</h1>
        <p className="flex items-center gap-1 text-sm text-muted">
          خرج‌ها رو گروهی مدیریت کن
          <HeartMark />
        </p>
      </div>
    </div>
  );
}
