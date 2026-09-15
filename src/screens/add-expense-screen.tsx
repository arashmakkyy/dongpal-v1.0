import { PersonAvatar, AvatarStack, youName } from "@/components/person";
import { AppScreen, TopBar } from "@/components/shell";
import { Sheet } from "@/components/sheet";
import { Button } from "@/components/ui/button";
import {
  CATEGORIES,
  type Category,
  type Person,
} from "@/lib/types";
import {
  currencyLabel,
  formatJalali,
  formatJalaliPretty,
  formatMoney,
  gregorianFromJalali,
  jalaliParts,
  MONTHS,
  monthLength,
  parseAmount,
} from "@/lib/format";
import { equalPercents } from "@/lib/settle";
import { makeDraft, useDang } from "@/lib/store";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  Calendar,
  FileText,
  List,
  ScanLine,
  Scale,
  User,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

export function AddExpenseScreen() {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  const gathering = useDang((s) => s.gatherings.find((g) => g.id === id));
  const people = useDang((s) => s.people);
  const draft = useDang((s) => s.draft);
  const patchDraft = useDang((s) => s.patchDraft);
  const addExpense = useDang((s) => s.addExpense);
  const setDraft = useDang((s) => s.setDraft);

  const [payerOpen, setPayerOpen] = useState(false);
  const [partsOpen, setPartsOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);

  useEffect(() => {
    if (!gathering) return;
    if (draft && draft.gatheringId === id) return;
    const me = people.find((p) => p.isMe);
    setDraft(
      makeDraft(id, {
        payerId:
          me && gathering.memberIds.includes(me.id)
            ? me.id
            : gathering.memberIds[0],
        participantIds: gathering.memberIds,
      }),
    );
  }, [id, gathering, draft, people, setDraft]);

  const members = useMemo(() => {
    if (!gathering) return [];
    return gathering.memberIds
      .map((pid) => people.find((p) => p.id === pid))
      .filter((p): p is Person => !!p);
  }, [gathering, people]);

  if (!gathering) {
    return (
      <AppScreen>
        <TopBar title="هزینه" onBack={() => navigate({ to: "/" })} />
        <p className="px-5 text-sm text-muted">این دورهمی پیدا نشد.</p>
      </AppScreen>
    );
  }

  if (!draft || draft.gatheringId !== id) {
    return (
      <AppScreen>
        <TopBar title="هزینه" onBack={() => navigate({ to: "/g/$id", params: { id } })} />
        <p className="px-5 text-sm text-muted">در حال آماده‌سازی فرم...</p>
      </AppScreen>
    );
  }

  const payer = people.find((p) => p.id === draft.payerId);
  const selected = members.filter((m) => draft.participantIds.includes(m.id));
  const unit = currencyLabel(gathering.currency);

  function saveEqual() {
    if (!draft || !gathering) return;
    if (!draft.title.trim() || draft.amount <= 0) {
      toast.error("عنوان و مبلغ را وارد کن");
      return;
    }
    if (draft.participantIds.length === 0) {
      toast.error("حداقل یک نفر را انتخاب کن");
      return;
    }
    if (draft.split === "unequal") {
      patchDraft({ shares: equalPercents(draft.participantIds) });
      navigate({ to: "/g/$id/split", params: { id: gathering.id }, search: { from: "add" } });
      return;
    }
    addExpense({
      gatheringId: gathering.id,
      title: draft.title.trim(),
      amount: draft.amount,
      category: draft.category,
      payerId: draft.payerId,
      participantIds: draft.participantIds,
      split: "equal",
      note: draft.note || undefined,
      date: draft.date,
      receiptImage: draft.receiptImage,
    });
    setDraft(null);
    toast.success("هزینه ثبت شد");
    navigate({ to: "/g/$id", params: { id: gathering.id } });
  }

  return (
    <AppScreen>
      <TopBar
        title="نوشتن هزینه"
        subtitle="هزینه جدید را به این دورهمی اضافه کنید"
        onBack={() => navigate({ to: "/g/$id", params: { id } })}
      />
      <div className="px-5 pb-8">
        <div className="overflow-hidden rounded-3xl bg-surface shadow-card">
          <Row icon={<List className="size-4" />} label="عنوان هزینه">
            <input
              value={draft.title}
              onChange={(e) => patchDraft({ title: e.target.value })}
              placeholder="شام"
              className="w-full bg-transparent text-[15px] font-semibold outline-none"
            />
          </Row>
          <Row icon={<Wallet className="size-4" />} label="مبلغ">
            <div className="flex min-w-0 items-center justify-end gap-2">
              <input
                inputMode="numeric"
                dir="ltr"
                value={draft.amount ? formatMoney(draft.amount) : ""}
                onChange={(e) =>
                  patchDraft({ amount: parseAmount(e.target.value) })
                }
                placeholder="0"
                className="min-w-0 flex-1 bg-transparent text-start text-[15px] font-semibold tabular outline-none"
              />
              <span className="shrink-0 text-xs text-muted">{unit}</span>
            </div>
          </Row>
          <Row
            icon={<User className="size-4" />}
            label="پرداخت‌کننده"
            onClick={() => setPayerOpen(true)}
          >
            <span className="flex items-center justify-end gap-2 font-semibold">
              <span>{youName(payer)}</span>
              <PersonAvatar person={payer} size={28} />
            </span>
          </Row>
          <Row
            icon={<Calendar className="size-4" />}
            label="تاریخ"
            onClick={() => setDateOpen(true)}
          >
            <span className="text-sm font-semibold">
              {isToday(draft.date) ? "امروز — " : ""}
              {formatJalali(draft.date)}
            </span>
          </Row>
          <Row
            icon={<Users className="size-4" />}
            label="شرکت‌کننده‌ها"
            onClick={() => setPartsOpen(true)}
          >
            <span className="flex items-center justify-end gap-2">
              <span className="text-xs text-muted">
                {selected.length} نفر انتخاب شده
              </span>
              <AvatarStack people={selected} max={4} size={26} />
            </span>
          </Row>
          <Row icon={<Scale className="size-4" />} label="روش تقسیم">
            <div className="flex rounded-full bg-track p-1">
              <button
                type="button"
                onClick={() => patchDraft({ split: "equal" })}
                className={chip(draft.split === "equal", true)}
              >
                مساوی
              </button>
              <button
                type="button"
                onClick={() => patchDraft({ split: "unequal" })}
                className={chip(draft.split === "unequal")}
              >
                نابرابر
              </button>
            </div>
          </Row>
          <Row icon={<FileText className="size-4" />} label="یادداشت (اختیاری)">
            <input
              value={draft.note}
              onChange={(e) => patchDraft({ note: e.target.value })}
              placeholder="مثلاً شام در رستوران خوب"
              className="w-full bg-transparent text-sm outline-none"
            />
          </Row>
          <button
            type="button"
            onClick={() => setCatOpen(true)}
            className="flex w-full items-center justify-between px-4 py-3 text-sm text-muted"
          >
            دسته: {CATEGORIES.find((c) => c.id === draft.category)?.label}
          </button>
        </div>

        {draft.receiptImage ? (
          <div className="mt-3 overflow-hidden rounded-3xl bg-surface shadow-card">
            <img
              src={draft.receiptImage}
              alt="رسید"
              className="h-28 w-full object-cover"
            />
            <p className="px-4 py-2 text-xs text-muted">رسید پیوست‌شده</p>
          </div>
        ) : null}

        <div className="mt-6 flex gap-2">
          <Button className="flex-[1.3]" onClick={saveEqual}>
            {draft.split === "unequal" ? "ادامه — تقسیم نابرابر" : "ثبت هزینه"}
          </Button>
          <Button
            variant="lavender"
            className="flex-1"
            onClick={() =>
              navigate({ to: "/scan", search: { g: gathering.id } })
            }
          >
            <ScanLine className="size-4" />
            اسکن رسید
          </Button>
        </div>
      </div>

      <Sheet open={payerOpen} onClose={() => setPayerOpen(false)} title="پرداخت‌کننده">
        <div className="flex flex-col">
          {members.map((m) => (
            <button
              key={m.id}
              type="button"
              className="flex items-center gap-3 rounded-2xl px-2 py-2.5"
              onClick={() => {
                patchDraft({ payerId: m.id });
                setPayerOpen(false);
              }}
            >
              <PersonAvatar person={m} size={40} />
              <span className="flex-1 font-semibold">{youName(m)}</span>
              {draft.payerId === m.id ? (
                <span className="text-xs text-primary">انتخاب‌شده</span>
              ) : null}
            </button>
          ))}
        </div>
      </Sheet>

      <Sheet
        open={partsOpen}
        onClose={() => setPartsOpen(false)}
        title="چه کسانی سهیم‌اند؟"
      >
        <div className="flex flex-col">
          {members.map((m) => {
            const on = draft.participantIds.includes(m.id);
            return (
              <button
                key={m.id}
                type="button"
                className="flex items-center gap-3 rounded-2xl px-2 py-2.5"
                onClick={() => {
                  const next = on
                    ? draft.participantIds.filter((x) => x !== m.id)
                    : [...draft.participantIds, m.id];
                  patchDraft({ participantIds: next });
                }}
              >
                <PersonAvatar person={m} size={40} />
                <span className="flex-1 font-semibold">{youName(m)}</span>
                <span
                  className={`flex size-6 items-center justify-center rounded-full border ${
                    on
                      ? "border-primary bg-primary text-[10px] text-primary-fg"
                      : "border-border"
                  }`}
                >
                  {on ? "✓" : ""}
                </span>
              </button>
            );
          })}
        </div>
        <Button block className="mt-4" onClick={() => setPartsOpen(false)}>
          تأیید
        </Button>
      </Sheet>

      <Sheet open={dateOpen} onClose={() => setDateOpen(false)} title="تاریخ">
        <JalaliPicker
          value={draft.date}
          onChange={(ts) => {
            patchDraft({ date: ts });
            setDateOpen(false);
          }}
        />
      </Sheet>

      <Sheet open={catOpen} onClose={() => setCatOpen(false)} title="دسته‌بندی">
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                patchDraft({ category: c.id as Category });
                setCatOpen(false);
              }}
              className={`rounded-2xl px-3 py-3 text-sm font-semibold ${
                draft.category === c.id
                  ? "bg-primary text-primary-fg"
                  : "bg-bg"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </Sheet>
    </AppScreen>
  );
}

function chip(active: boolean, green = false) {
  return `rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
    active
      ? green
        ? "bg-primary text-primary-fg"
        : "bg-surface text-fg shadow-sm"
      : "text-muted"
  }`;
}

function Row({
  icon,
  label,
  children,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className="flex w-full items-center gap-3 border-b border-border px-4 py-3.5 last:border-0"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-bg text-muted">
        {icon}
      </span>
      <span className="shrink-0 text-sm text-muted">{label}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </Comp>
  );
}

function isToday(ts: number) {
  const a = new Date(ts);
  const b = new Date();
  return a.toDateString() === b.toDateString();
}

function JalaliPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (ts: number) => void;
}) {
  const cur = jalaliParts(value);
  const [jy, setJy] = useState(cur.jy);
  const [jm, setJm] = useState(cur.jm);
  const len = monthLength(jy, jm);
  const days = Array.from({ length: len }, (_, i) => i + 1);
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          className="px-3 py-2 text-sm"
          onClick={() => {
            if (jm === 1) {
              setJm(12);
              setJy(jy - 1);
            } else setJm(jm - 1);
          }}
        >
          قبلی
        </button>
        <p className="font-bold">
          {MONTHS[jm - 1]} {jy}
        </p>
        <button
          type="button"
          className="px-3 py-2 text-sm"
          onClick={() => {
            if (jm === 12) {
              setJm(1);
              setJy(jy + 1);
            } else setJm(jm + 1);
          }}
        >
          بعدی
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => onChange(gregorianFromJalali(jy, jm, d).getTime())}
            className={`rounded-xl py-2 text-sm ${
              cur.jy === jy && cur.jm === jm && cur.jd === d
                ? "bg-primary text-primary-fg"
                : "bg-bg"
            }`}
          >
            {d}
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-muted">
        {formatJalaliPretty(value)}
      </p>
    </div>
  );
}
