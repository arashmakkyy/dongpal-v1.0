import { AvatarStack } from "@/components/person";
import { AppScreen } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { currencyLabel, formatMoney } from "@/lib/format";
import { gatheringTotal } from "@/lib/settle";
import { useDang } from "@/lib/store";
import type { Person } from "@/lib/types";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

export function GatheringsScreen() {
  const navigate = useNavigate();
  const allGatherings = useDang((s) => s.gatherings);
  const expenses = useDang((s) => s.expenses);
  const people = useDang((s) => s.people);
  const [q, setQ] = useState("");
  const gatherings = allGatherings.filter((g) => !g.archived);
  const filtered = useMemo(
    () =>
      gatherings.filter((g) => g.name.includes(q.trim()) || !q.trim()),
    [gatherings, q],
  );

  return (
    <AppScreen nav>
      <div className="px-5 pb-8 pt-6">
        <h1 className="mb-4 text-xl font-extrabold">دورهمی‌ها</h1>
        <div className="mb-4 flex items-center gap-2 rounded-2xl bg-surface px-3 py-2.5 shadow-card">
          <Search className="size-4 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="جستجو"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <div className="flex flex-col gap-2">
          {filtered.map((g) => {
            const ex = expenses.filter((e) => e.gatheringId === g.id);
            const members = g.memberIds
              .map((id) => people.find((p) => p.id === id))
              .filter((p): p is Person => !!p);
            return (
              <Link
                key={g.id}
                to="/g/$id"
                params={{ id: g.id }}
                className="flex items-center gap-3 rounded-3xl bg-surface p-3 shadow-card"
              >
                <img
                  src={g.cover}
                  alt=""
                  className="size-14 rounded-2xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{g.name}</p>
                  <p className="text-xs text-muted">
                    {members.length} نفر · {ex.length} هزینه
                  </p>
                  <div className="mt-1.5">
                    <p className="text-[10px] font-medium leading-none text-muted">
                      جمع هزینه
                    </p>
                    <p className="mt-1 flex items-baseline gap-1 whitespace-nowrap">
                      <bdi className="text-[14px] font-extrabold leading-none tabular text-fg">
                        {formatMoney(gatheringTotal(ex))}
                      </bdi>
                      <span className="rounded-full bg-primary-soft px-1.5 py-0.5 text-[10px] font-bold text-primary">
                        {currencyLabel(g.currency)}
                      </span>
                    </p>
                  </div>
                </div>
                <AvatarStack people={members} max={3} size={24} />
                <ChevronLeft className="size-4 text-subtle" />
              </Link>
            );
          })}
        </div>
        <Button block className="mt-5" onClick={() => navigate({ to: "/new" })}>
          <Plus className="size-4" />
          دورهمی جدید
        </Button>
      </div>
    </AppScreen>
  );
}
