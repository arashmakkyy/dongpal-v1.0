import { AppScreen, TopBar } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { ScanLine } from "lucide-react";

// Temporarily coming-soon: the OCR backend (src/lib/ocr.ts) is kept intact
// but disabled server-side until auth + rate limiting land. This page keeps
// the route/nav working without burning XAI quota.
export function ScanScreen() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { g?: string };
  return (
    <AppScreen nav={!search.g}>
      <TopBar
        title="اسکن رسید"
        subtitle="با یک عکس، همه‌چیز ساده‌تر"
        onBack={
          search.g
            ? () => navigate({ to: "/g/$id", params: { id: search.g! } })
            : () => navigate({ to: "/" })
        }
      />
      <div className="flex flex-col items-center px-5 pb-8 pt-10 text-center">
        <span className="flex size-20 items-center justify-center rounded-[28px] bg-primary-soft text-primary">
          <ScanLine className="size-10" />
        </span>
        <h2 className="mt-5 text-2xl font-extrabold">به‌زودی میاد</h2>
        <p className="mt-2 max-w-xs text-sm leading-6 text-muted">
          اسکن هوشمند رسید در حال آماده‌سازیه. فعلاً مبلغ رو دستی وارد کن —
          به محض آماده شدن همین‌جا خبرت می‌کنیم.
        </p>
        <Button
          block
          className="mt-6 max-w-xs"
          onClick={() =>
            search.g
              ? navigate({ to: "/g/$id/add", params: { id: search.g! } })
              : navigate({ to: "/" })
          }
        >
          ثبت دستی هزینه
        </Button>
      </div>
    </AppScreen>
  );
}
