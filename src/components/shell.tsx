import { Link, useRouterState } from "@tanstack/react-router";
import {
  ChevronLeft,
  Clock3,
  Grid2x2,
  Home,
  ScanLine,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "خانه", icon: Home, id: "home" },
  { to: "/gatherings", label: "دورهمی‌ها", icon: Users, id: "g" },
  { to: "/scan", label: "اسکن رسید", icon: ScanLine, id: "scan" },
  { to: "/history", label: "تاریخچه", icon: Clock3, id: "hist" },
  { to: "/more", label: "بیشتر", icon: Grid2x2, id: "more" },
] as const;

export function AppScreen({
  children,
  nav,
  className,
}: {
  children: ReactNode;
  nav?: boolean;
  className?: string;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-bg">
      <div className={cn("min-h-0 flex-1 overflow-y-auto", className)}>
        {children}
      </div>
      {nav ? <BottomNav /> : null}
    </div>
  );
}

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="z-20 shrink-0 border-t border-border bg-surface px-1 pb-[max(8px,env(safe-area-inset-bottom))] pt-1">
      <ul className="grid grid-cols-5">
        {tabs.map((t) => {
          const active =
            t.to === "/"
              ? pathname === "/"
              : pathname === t.to || pathname.startsWith(`${t.to}/`);
          const Icon = t.icon;
          return (
            <li key={t.id}>
              <Link
                to={t.to}
                search={t.id === "scan" ? { g: undefined } : undefined}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-2xl py-2 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted",
                )}
              >
                <Icon
                  className="size-5"
                  strokeWidth={active ? 2.4 : 2}
                />
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function TopBar({
  title,
  subtitle,
  onBack,
  action,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  action?: ReactNode;
  right?: ReactNode;
}) {
  const extra = action ?? right;
  return (
    <header className="sticky top-0 z-20 flex items-center gap-2 bg-bg/90 px-3 py-3 backdrop-blur-md">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex size-11 shrink-0 items-center justify-center rounded-2xl text-fg"
          aria-label="بازگشت"
        >
          <ChevronLeft className="size-6 rtl:rotate-180" />
        </button>
      ) : (
        <span className="size-11 shrink-0" />
      )}
      <div className="min-w-0 flex-1 text-center">
        <h1 className="truncate text-[17px] font-bold">{title}</h1>
        {subtitle ? (
          <p className="truncate text-xs text-muted">{subtitle}</p>
        ) : null}
      </div>
      <div className="flex min-w-11 shrink-0 items-center justify-end">{extra}</div>
    </header>
  );
}

export function HeartMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("size-3.5 fill-pink text-pink", className)}
      aria-hidden
    >
      <path d="M12 21s-6.5-4.35-9.3-8.2C.7 9.7 1.6 6 4.7 4.8 6.6 4 8.7 4.6 12 7.4 15.3 4.6 17.4 4 19.3 4.8c3.1 1.2 4 4.9 2 8-2.8 3.85-9.3 8.2-9.3 8.2z" />
    </svg>
  );
}
