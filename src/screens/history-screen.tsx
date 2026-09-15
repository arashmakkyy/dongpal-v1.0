import { AppScreen } from "@/components/shell";
import { formatMoney, formatWhen, currencyLabel } from "@/lib/format";
import { useDang } from "@/lib/store";
import { CategoryIcon } from "@/components/category-icon";
import { PersonAvatar } from "@/components/person";
import { Link } from "@tanstack/react-router";

export function HistoryScreen() {
  const allExpenses = useDang((s) => s.expenses);
  const gatherings = useDang((s) => s.gatherings);
  const people = useDang((s) => s.people);
  const expenses = [...allExpenses].sort((a, b) => b.date - a.date);

  return (
    <AppScreen nav>
      <div className="px-5 pb-8 pt-6">
        <h1 className="mb-4 text-xl font-extrabold">تاریخچه</h1>
        {expenses.length === 0 ? (
          <p className="rounded-3xl bg-surface px-4 py-10 text-center text-sm text-muted shadow-card">
            هنوز هزینه‌ای ثبت نشده
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {expenses.map((e) => {
              const g = gatherings.find((x) => x.id === e.gatheringId);
              const payer = people.find((p) => p.id === e.payerId);
              if (!g) return null;
              return (
                <Link
                  key={e.id}
                  to="/g/$id"
                  params={{ id: g.id }}
                  className="flex items-center gap-3 rounded-3xl bg-surface px-3 py-3 shadow-card"
                >
                  <CategoryIcon category={e.category} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{e.title}</p>
                    <p className="text-xs text-muted">
                      {g.name} · {formatWhen(e.date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-extrabold tabular">
                      {formatMoney(e.amount)}
                    </p>
                    <p className="text-[11px] text-muted">
                      {currencyLabel(g.currency)}
                    </p>
                  </div>
                  <PersonAvatar person={payer} size={32} />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppScreen>
  );
}
