import { PersonAvatar, youName } from "@/components/person";
import { AppScreen, HeartMark, TopBar } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { currencyLabel, formatMoney } from "@/lib/format";
import { gatheringTotal, minimizeTransfers, nets } from "@/lib/settle";
import { settlementText } from "@/lib/share";
import { useDang } from "@/lib/store";
import type { Person } from "@/lib/types";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Check, ChevronLeft, Share2 } from "lucide-react";
import { toast } from "sonner";

export function SettleScreen() {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  const gathering = useDang((s) => s.gatherings.find((g) => g.id === id));
  const allExpenses = useDang((s) => s.expenses);
  const people = useDang((s) => s.people);
  const expenses = allExpenses.filter((e) => e.gatheringId === id);

  if (!gathering) {
    return (
      <AppScreen>
        <TopBar title="تسویه" onBack={() => navigate({ to: "/" })} />
      </AppScreen>
    );
  }

  const members = gathering.memberIds
    .map((pid) => people.find((p) => p.id === pid))
    .filter((p): p is Person => !!p);
  const net = nets(gathering.memberIds, expenses);
  const transfers = minimizeTransfers(net);
  const total = gatheringTotal(expenses);
  const unit = currencyLabel(gathering.currency);
  const settled = transfers.length === 0 && expenses.length > 0;

  const text = settlementText({
    gathering,
    people,
    transfers,
    total,
    currency: gathering.currency,
  });

  return (
    <AppScreen>
      <TopBar
        title="تسویه حساب"
        subtitle="وضعیت نهایی هر نفر در این دورهمی"
        onBack={() => navigate({ to: "/g/$id", params: { id } })}
      />
      <div className="px-5 pb-8">
        <div className="grid grid-cols-2 gap-3">
          {members.map((m) => {
            const v = net[m.id] ?? 0;
            const positive = v > 1;
            const negative = v < -1;
            return (
              <div
                key={m.id}
                className="flex flex-col items-center rounded-3xl bg-surface px-3 py-4 shadow-card"
              >
                <PersonAvatar person={m} size={56} />
                <p className="mt-2 text-sm font-bold">{youName(m)}</p>
                <p
                  className={`mt-1 text-[15px] font-extrabold tabular ${
                    positive
                      ? "text-primary"
                      : negative
                        ? "text-danger"
                        : "text-muted"
                  }`}
                >
                  {positive ? "+" : negative ? "−" : ""}
                  {formatMoney(Math.abs(v))}
                </p>
                <p className="mt-0.5 text-[11px] text-muted">
                  {positive
                    ? "دریافت می‌کند"
                    : negative
                      ? "بدهکار است"
                      : "تسویه"}
                </p>
              </div>
            );
          })}
        </div>

        <h2 className="mt-6 text-sm font-bold">چه کسی به چه کسی بدهکار است؟</h2>
        <div className="mt-3 flex flex-col gap-2">
          {transfers.length === 0 ? (
            <p className="rounded-3xl bg-surface px-4 py-6 text-center text-sm text-muted shadow-card">
              {expenses.length === 0
                ? "هنوز هزینه‌ای نیست"
                : "هیچ بدهی باقی نمانده"}
            </p>
          ) : (
            transfers.map((t) => {
              const from = people.find((p) => p.id === t.fromId);
              const to = people.find((p) => p.id === t.toId);
              return (
                <button
                  key={`${t.fromId}-${t.toId}`}
                  type="button"
                  onClick={() =>
                    navigate({
                      to: "/g/$id/remind",
                      params: { id },
                      search: {
                        from: t.fromId,
                        to: t.toId,
                        amount: String(t.amount),
                      },
                    })
                  }
                  className="flex items-center gap-3 rounded-3xl bg-surface px-3 py-3 shadow-card"
                >
                  <PersonAvatar person={from} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">{youName(from)}</p>
                    <p className="text-xs text-muted">
                      باید <bdi className="tabular">{formatMoney(t.amount)}</bdi>{" "}
                      {unit} به {youName(to)} بدهد
                    </p>
                  </div>
                  <ChevronLeft className="size-4 text-subtle" />
                </button>
              );
            })
          )}
        </div>

        {settled || transfers.length > 0 ? (
          <div className="mt-4 flex items-center gap-2 rounded-3xl bg-success-soft px-4 py-3 text-sm font-semibold text-primary">
            <span className="flex size-8 items-center justify-center rounded-full bg-surface text-primary">
              <Check className="size-4" />
            </span>
            <span className="flex items-center gap-1">
              {settled ? "همه‌چیز آماده‌ست!" : "موجودی‌ها با هم برابر می‌شود"}
              <HeartMark className="size-3.5" />
            </span>
          </div>
        ) : null}

        <Button
          variant="accent"
          block
          className="mt-6"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text);
              toast.success("متن تسویه کپی شد");
            } catch {
              toast.error("کپی نشد");
            }
            navigate({
              to: "/g/$id/remind",
              params: { id },
              search: transfers[0]
                ? {
                    from: transfers[0].fromId,
                    to: transfers[0].toId,
                    amount: String(transfers[0].amount),
                  }
                : { from: undefined, to: undefined, amount: undefined },
            });
          }}
        >
          <Share2 className="size-4" />
          اشتراک‌گذاری نتیجه
        </Button>
      </div>
    </AppScreen>
  );
}
