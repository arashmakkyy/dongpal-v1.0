import { AvatarStack } from "@/components/person";
import { AppScreen, HeartMark } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { formatMoney, currencyLabel } from "@/lib/format";
import { gatheringTotal } from "@/lib/settle";
import { useDang } from "@/lib/store";
import type { Gathering, Person } from "@/lib/types";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Plus, ScanLine, Settings, Sparkles } from "lucide-react";
import { WelcomeScreen } from "./welcome-screen";

export function HomeScreen() {
  const navigate = useNavigate();
  const allGatherings = useDang((s) => s.gatherings);
  const expenses = useDang((s) => s.expenses);
  const people = useDang((s) => s.people);
  const seen = useDang((s) => s.profile.seenWelcome);
  const gatherings = allGatherings.filter((g) => !g.archived);

  if (!seen) return <WelcomeScreen />;

  return (
    <AppScreen nav>
      <div className="px-5 pb-8 pt-5">
        <header className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-[32px] font-extrabold leading-none text-primary">
              دنگ‌پال
            </h1>
            <p className="mt-2 flex items-center gap-1 text-sm text-fg">
              خرج‌ها رو گروهی مدیریت کن
              <HeartMark />
            </p>
          </div>
          <Link
            to="/more"
            className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-surface text-muted shadow-card"
            aria-label="تنظیمات"
          >
            <Settings className="size-5" />
          </Link>
        </header>

        <button
          type="button"
          onClick={() => navigate({ to: "/quick" })}
          className="mb-5 flex w-full items-center gap-3 rounded-3xl bg-accent-soft px-4 py-3 transition-transform active:scale-[0.98]"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-surface text-accent">
            <Sparkles className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-accent">
              تقسیم سریع حساب
            </span>
            <span className="text-xs text-muted">
              رستوران، تاکسی، بدون ساختن دورهمی
            </span>
          </span>
          <ChevronLeft className="size-4 shrink-0 text-accent" />
        </button>

        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-fg">دورهمی‌های من</h2>
          <Link to="/gatherings" className="text-xs font-medium text-primary">
            همه
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          {gatherings.length === 0 ? (
            <EmptyGatherings />
          ) : (
            gatherings.map((g, i) => {
              const ex = expenses.filter((e) => e.gatheringId === g.id);
              const members = g.memberIds
                .map((pid) => people.find((p) => p.id === pid))
                .filter((p): p is Person => !!p);
              return (
                <GatheringCard
                  key={g.id}
                  gathering={g}
                  total={gatheringTotal(ex)}
                  expenseCount={ex.length}
                  members={members}
                  delay={i * 40}
                />
              );
            })
          )}
        </div>

        <Button
          block
          className="mt-5"
          onClick={() => navigate({ to: "/new" })}
        >
          <Plus className="size-5" />
          دورهمی جدید
        </Button>
      </div>
    </AppScreen>
  );
}

function EmptyGatherings() {
  const navigate = useNavigate();
  return (
    <div className="rounded-3xl bg-surface px-5 py-10 text-center shadow-card">
      <p className="font-bold">هنوز دورهمی نداری</p>
      <p className="mt-1 text-sm text-muted">
        یک سفر، تولد یا شام دوستانه بساز و هزینه‌ها را اضافه کن.
      </p>
      <div className="mt-4 flex gap-2">
        <Button block size="md" onClick={() => navigate({ to: "/new" })}>
          بساز
        </Button>
        <Button
          block
          size="md"
          variant="outline"
          onClick={() => navigate({ to: "/scan", search: { g: undefined } })}
        >
          <ScanLine className="size-4" />
          اسکن رسید
        </Button>
      </div>
    </div>
  );
}

function GatheringCard({
  gathering,
  total,
  expenseCount,
  members,
  delay,
}: {
  gathering: Gathering;
  total: number;
  expenseCount: number;
  members: Person[];
  delay: number;
}) {
  const unit = currencyLabel(gathering.currency);
  return (
    <Link
      to="/g/$id"
      params={{ id: gathering.id }}
      className="anim-fade-up flex items-center gap-3 rounded-3xl bg-surface p-3 shadow-card transition-transform active:scale-[0.98]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <img
        src={gathering.cover}
        alt=""
        className="size-[72px] shrink-0 rounded-2xl object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-[15px] font-bold">{gathering.name}</h3>
          <ChevronLeft className="mt-0.5 size-4 shrink-0 text-subtle" />
        </div>
        <p className="mt-0.5 text-xs text-muted">
          {members.length} نفر · {expenseCount} هزینه
        </p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <AvatarStack people={members} max={3} size={26} />
          <MoneyChip amount={total} unit={unit} />
        </div>
      </div>
    </Link>
  );
}

function MoneyChip({ amount, unit }: { amount: number; unit: string }) {
  return (
    <div className="min-w-0 shrink-0 text-end">
      <p className="text-[10px] font-medium leading-none text-muted">جمع هزینه</p>
      <p className="mt-1 flex items-baseline gap-1 whitespace-nowrap">
        <bdi className="text-[15px] font-extrabold leading-none tabular text-fg">
          {formatMoney(amount)}
        </bdi>
        <span className="rounded-full bg-primary-soft px-1.5 py-0.5 text-[10px] font-bold text-primary">
          {unit}
        </span>
      </p>
    </div>
  );
}
