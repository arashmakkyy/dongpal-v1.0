import { AppScreen, TopBar } from "@/components/shell";
import { CATEGORIES, type Category, type Person } from "@/lib/types";
import { useDang } from "@/lib/store";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ExpenseRow } from "./gathering-screen";

export function ExpensesScreen() {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  const gathering = useDang((s) => s.gatherings.find((g) => g.id === id));
  const allExpenses = useDang((s) => s.expenses);
  const people = useDang((s) => s.people);
  const deleteExpense = useDang((s) => s.deleteExpense);
  const [cat, setCat] = useState<Category | "all">("all");

  const expenses = useMemo(
    () =>
      allExpenses
        .filter((e) => e.gatheringId === id)
        .sort((a, b) => b.date - a.date),
    [allExpenses, id],
  );

  const filtered = useMemo(
    () => (cat === "all" ? expenses : expenses.filter((e) => e.category === cat)),
    [cat, expenses],
  );

  if (!gathering) {
    return (
      <AppScreen>
        <TopBar title="هزینه‌ها" onBack={() => navigate({ to: "/" })} />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <TopBar
        title="هزینه‌های این دورهمی"
        onBack={() => navigate({ to: "/g/$id", params: { id } })}
      />
      <div className="px-5 pb-8">
        <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
          <Chip
            active={cat === "all"}
            onClick={() => setCat("all")}
            label="همه"
          />
          {CATEGORIES.map((c) => (
            <Chip
              key={c.id}
              active={cat === c.id}
              onClick={() => setCat(c.id)}
              label={c.label}
            />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">
              هزینه‌ای در این دسته نیست
            </p>
          ) : (
            filtered.map((e) => (
              <div key={e.id} className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <ExpenseRow
                    expense={e}
                    payer={people.find((p) => p.id === e.payerId) as Person | undefined}
                    currency={gathering.currency}
                  />
                </div>
                <button
                  type="button"
                  className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-surface text-danger shadow-card"
                  aria-label="حذف هزینه"
                  onClick={() => {
                    deleteExpense(e.id);
                    toast.success("هزینه حذف شد");
                  }}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </AppScreen>
  );
}

function Chip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
        active ? "bg-primary text-primary-fg" : "bg-surface text-muted"
      }`}
    >
      {label}
    </button>
  );
}
