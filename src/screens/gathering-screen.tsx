import { CategoryIcon } from "@/components/category-icon";
import { SyncPill } from "@/components/gathering-sync";
import { AvatarStack, PersonAvatar, youName } from "@/components/person";
import { AppScreen, TopBar } from "@/components/shell";
import { Sheet } from "@/components/sheet";
import { Button } from "@/components/ui/button";
import { currencyLabel, formatMoney, formatWhen } from "@/lib/format";
import { inviteUrl } from "@/lib/pack";
import { copyText, nativeShare, tgLink, waLink } from "@/lib/share";
import { equalPercents, gatheringTotal } from "@/lib/settle";
import { makeDraft, useDang } from "@/lib/store";
import { ensureGatheringRoom, flushGathering, useSyncStatus } from "@/lib/sync";
import type { Currency, Expense, Person } from "@/lib/types";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  FileText,
  Link2,
  Plus,
  Scale,
  ScanLine,
  Settings,
  Share2,
  Trash2,
  Users,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

export function GatheringScreen() {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  const gathering = useDang((s) => s.gatherings.find((g) => g.id === id));
  const allExpenses = useDang((s) => s.expenses);
  const people = useDang((s) => s.people);
  const setDraft = useDang((s) => s.setDraft);
  const deleteGathering = useDang((s) => s.deleteGathering);
  const syncStatus = useSyncStatus();
  const [menu, setMenu] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const expenses = allExpenses
    .filter((e) => e.gatheringId === id)
    .sort((a, b) => b.date - a.date);

  if (!gathering) {
    return (
      <AppScreen>
        <TopBar title="پیدا نشد" onBack={() => navigate({ to: "/" })} />
        <p className="px-5 text-sm text-muted">این دورهمی وجود ندارد.</p>
      </AppScreen>
    );
  }

  const members = gathering.memberIds
    .map((pid) => people.find((p) => p.id === pid))
    .filter((p): p is Person => !!p);
  const total = gatheringTotal(expenses);
  const me = people.find((p) => p.isMe) ?? people[0];
  const shareLink = inviteUrl(gathering, people, expenses);
  const shareText = `بیا تو دورهمی «${gathering.name}» توی دنگ‌پال. لینک دعوت:\n${shareLink}`;

  function startAdd() {
    const payerId =
      me && gathering!.memberIds.includes(me.id)
        ? me.id
        : gathering!.memberIds[0];
    setDraft(
      makeDraft(gathering!.id, {
        payerId,
        participantIds: gathering!.memberIds,
      }),
    );
    navigate({ to: "/g/$id/add", params: { id: gathering!.id } });
  }

  function startUnequal() {
    const payerId =
      me && gathering!.memberIds.includes(me.id)
        ? me.id
        : gathering!.memberIds[0];
    setDraft({
      ...makeDraft(gathering!.id, {
        payerId,
        participantIds: gathering!.memberIds,
      }),
      title: "تقسیم نابرابر",
      amount: total,
      split: "unequal",
      shares: equalPercents(gathering!.memberIds),
    });
    navigate({
      to: "/g/$id/split",
      params: { id: gathering!.id },
      search: { from: undefined },
    });
  }

  return (
    <AppScreen>
      <TopBar
        title={gathering.name}
        onBack={() => navigate({ to: "/" })}
        action={
          <>
            <button
              type="button"
              className="flex size-11 items-center justify-center"
              onClick={() => {
                setShareOpen(true);
                void flushGathering(gathering.id);
              }}
              aria-label="دعوت دوست"
            >
              <Share2 className="size-5 text-muted" />
            </button>
            <button
              type="button"
              className="flex size-11 items-center justify-center"
              onClick={() => setMenu(true)}
              aria-label="تنظیمات دورهمی"
            >
              <Settings className="size-5 text-muted" />
            </button>
          </>
        }
      />

      <div className="px-5 pb-8">
        <GatheringHero
          cover={gathering.cover}
          total={total}
          unit={currencyLabel(gathering.currency)}
          members={members}
          expenseCount={expenses.length}
          sync={<SyncPill status={syncStatus} />}
        />

        <div className="mt-4 grid grid-cols-3 gap-2">
          <ActionTile
            label="نوشتن هزینه"
            icon={<Plus className="size-5" />}
            tone="primary"
            onClick={startAdd}
          />
          <ActionTile
            label="اسکن رسید"
            icon={<ScanLine className="size-5" />}
            tone="soft"
            onClick={() =>
              navigate({ to: "/scan", search: { g: gathering.id } })
            }
          />
          <ActionTile
            label="تقسیم نابرابر"
            icon={<Scale className="size-5" />}
            tone="lavender"
            onClick={startUnequal}
          />
        </div>

        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-sm font-bold">آخرین هزینه‌ها</h2>
          <button
            type="button"
            className="text-xs font-medium text-primary"
            onClick={() =>
              navigate({ to: "/g/$id/expenses", params: { id: gathering.id } })
            }
          >
            مشاهده همه
          </button>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          {expenses.length === 0 ? (
            <p className="rounded-3xl bg-surface px-4 py-8 text-center text-sm text-muted shadow-card">
              هنوز هزینه‌ای ثبت نشده
            </p>
          ) : (
            expenses.slice(0, 6).map((e) => (
              <ExpenseRow
                key={e.id}
                expense={e}
                payer={people.find((p) => p.id === e.payerId)}
                currency={gathering.currency}
              />
            ))
          )}
        </div>

        <Button
          block
          className="mt-6"
          onClick={() =>
            navigate({ to: "/g/$id/settle", params: { id: gathering.id } })
          }
        >
          تسویه حساب
        </Button>
      </div>

      <Sheet open={menu} onClose={() => setMenu(false)} title="تنظیمات دورهمی">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-2xl px-2 py-3 text-sm"
          onClick={() => {
            setMenu(false);
            setShareOpen(true);
            void flushGathering(gathering.id);
          }}
        >
          <Share2 className="size-4 text-muted" />
          دعوت با لینک
        </button>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-2xl px-2 py-3 text-sm"
          onClick={() => {
            setMenu(false);
            navigate({ to: "/g/$id/expenses", params: { id: gathering.id } });
          }}
        >
          <FileText className="size-4 text-muted" />
          همه هزینه‌ها
        </button>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-2xl px-2 py-3 text-sm text-danger"
          onClick={() => {
            deleteGathering(gathering.id);
            navigate({ to: "/" });
          }}
        >
          <Trash2 className="size-4" />
          حذف دورهمی
        </button>
      </Sheet>

      <Sheet open={shareOpen} onClose={() => setShareOpen(false)} title="دعوت به دورهمی">
        <p className="mb-4 text-sm text-muted">
          لینک را برای دوستت بفرست. وقتی باز کند ازش می‌پرسیم کدوم عضو است تا سهم‌ها به‌اسم «تو» دیده شود. بعد از ورود، هزینه‌ها لحظه‌ای برای هر دو طرف آپدیت می‌شود.
        </p>
        <Button
          block
          onClick={async () => {
            try {
              await ensureGatheringRoom(gathering.id);
              await flushGathering(gathering.id);
            } catch {
              /* still share a snapshot link */
            }
            const latest = useDang.getState().gatherings.find((g) => g.id === gathering.id);
            const link = inviteUrl(latest || gathering, people, expenses);
            const text = `بیا تو دورهمی «${gathering.name}» توی دنگ‌پال. لینک دعوت:\n${link}`;
            const ok = await nativeShare(gathering.name, text, link);
            if (!ok) {
              await copyText(link);
              toast.success("لینک کپی شد");
            }
          }}
        >
          <Share2 className="size-4" />
          اشتراک‌گذاری لینک
        </Button>
        <Button
          variant="outline"
          block
          className="mt-2"
          onClick={async () => {
            try {
              await ensureGatheringRoom(gathering.id);
              await flushGathering(gathering.id);
            } catch {
              /* still share a snapshot link */
            }
            const latest = useDang.getState().gatherings.find((g) => g.id === gathering.id);
            const link = inviteUrl(latest || gathering, people, expenses);
            await copyText(link);
            toast.success("لینک کپی شد");
          }}
        >
          <Link2 className="size-4" />
          کپی لینک دعوت
        </Button>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a
            href={waLink(shareText)}
            target="_blank"
            rel="noreferrer"
            className="flex h-11 items-center justify-center rounded-2xl bg-[#E8F8EF] text-sm font-bold text-[#1FAD66]"
          >
            واتساپ
          </a>
          <a
            href={tgLink(shareText, shareLink)}
            target="_blank"
            rel="noreferrer"
            className="flex h-11 items-center justify-center rounded-2xl bg-[#E7F3FE] text-sm font-bold text-[#2A9EDC]"
          >
            تلگرام
          </a>
        </div>
      </Sheet>
    </AppScreen>
  );
}

function GatheringHero({
  cover,
  total,
  unit,
  members,
  expenseCount,
  sync,
}: {
  cover: string;
  total: number;
  unit: string;
  members: Person[];
  expenseCount: number;
  sync?: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[28px] bg-surface shadow-card">
      <div className="relative">
        <img
          src={cover}
          alt=""
          className="h-[132px] w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />
        <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-fg shadow-sm">
            <Users className="size-3.5 text-primary" />
            {members.length} نفر
          </span>
          <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-fg shadow-sm">
            {expenseCount} هزینه
          </span>
        </div>
      </div>
      <div className="flex items-end justify-between gap-3 px-4 pb-4 pt-3.5">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted">جمع هزینه‌ها</p>
          <div className="mt-1 flex items-end gap-2">
            <span className="text-[30px] font-extrabold leading-none tracking-tight tabular">
              {formatMoney(total)}
            </span>
            <span className="mb-0.5 rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-bold text-primary">
              {unit}
            </span>
          </div>
          {sync ? <div className="mt-2">{sync}</div> : null}
        </div>
        <AvatarStack people={members} max={6} size={32} />
      </div>
    </section>
  );
}

function ActionTile({
  label,
  icon,
  tone,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  tone: "primary" | "soft" | "lavender";
  onClick: () => void;
}) {
  const cls =
    tone === "primary"
      ? "bg-primary text-primary-fg"
      : tone === "lavender"
        ? "bg-accent-soft text-accent"
        : "bg-chip text-accent";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-3xl px-2 text-center text-[12px] font-semibold transition-transform active:scale-[0.96] ${cls}`}
    >
      {icon}
      {label}
    </button>
  );
}

export function ExpenseRow({
  expense,
  payer,
}: {
  expense: Expense;
  payer?: Person;
  currency?: Currency;
}) {
  return (
    <div className="flex items-center gap-3 rounded-3xl bg-surface px-3 py-3 shadow-card">
      <CategoryIcon category={expense.category} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-bold">{expense.title}</p>
          <p className="tabular text-[15px] font-extrabold">
            {formatMoney(expense.amount)}
          </p>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2 text-xs text-muted">
          <span>پرداخت توسط {youName(payer)}</span>
          <span>{formatWhen(expense.date)}</span>
        </div>
      </div>
      <PersonAvatar person={payer} size={36} />
    </div>
  );
}
