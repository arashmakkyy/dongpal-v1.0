import { UnequalSliders, SPLIT_THUMB } from "@/components/unequal-sliders";
import { youName } from "@/components/person";
import { TopBar } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { currencyLabel, formatMoney, parseAmount } from "@/lib/format";
import { equalPercents, allocate } from "@/lib/settle";
import { makeDraft, useDang } from "@/lib/store";
import type { Person } from "@/lib/types";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { Scale } from "lucide-react";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";

export function SplitScreen() {
  const { id } = useParams({ strict: false }) as { id: string };
  const search = useSearch({ strict: false }) as { from?: string };
  const navigate = useNavigate();
  const gathering = useDang((s) => s.gatherings.find((g) => g.id === id));
  const people = useDang((s) => s.people);
  const draft = useDang((s) => s.draft);
  const patchDraft = useDang((s) => s.patchDraft);
  const addExpense = useDang((s) => s.addExpense);
  const setDraft = useDang((s) => s.setDraft);
  const fromAdd = search.from === "add";

  useEffect(() => {
    if (!gathering) return;
    if (draft && draft.gatheringId === id) {
      if (!draft.shares || Object.keys(draft.shares).length === 0) {
        patchDraft({
          split: "unequal",
          shares: equalPercents(draft.participantIds),
        });
      }
      return;
    }
    const me = people.find((p) => p.isMe);
    setDraft({
      ...makeDraft(id, {
        payerId:
          me && gathering.memberIds.includes(me.id)
            ? me.id
            : gathering.memberIds[0],
        participantIds: gathering.memberIds,
      }),
      title: "تقسیم نابرابر",
      amount: 0,
      split: "unequal",
      shares: equalPercents(gathering.memberIds),
    });
  }, [id, gathering, draft, people, patchDraft, setDraft]);

  const members = useMemo(() => {
    if (!draft) return [];
    return draft.participantIds
      .map((pid) => people.find((p) => p.id === pid))
      .filter((p): p is Person => !!p);
  }, [draft, people]);

  const shares = draft?.shares ?? {};
  const sum = members.reduce((s, m) => s + (shares[m.id] ?? 0), 0);

  if (!gathering || !draft) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-bg">
        <TopBar title="تقسیم نابرابر" onBack={() => navigate({ to: "/" })} />
      </div>
    );
  }

  const unit = currencyLabel(gathering.currency);

  function goBack() {
    if (fromAdd) {
      navigate({ to: "/g/$id/add", params: { id: gathering!.id } });
    } else {
      navigate({ to: "/g/$id", params: { id: gathering!.id } });
    }
  }

  function equalize() {
    patchDraft({ shares: equalPercents(draft!.participantIds) });
  }

  function confirm() {
    if (!draft!.amount || draft!.amount <= 0) {
      toast.error("مبلغ کل را وارد کن");
      return;
    }
    if (Math.abs(sum - 100) > 0.2) {
      toast.error("جمع درصدها باید ۱۰۰ باشد");
      return;
    }
    addExpense({
      gatheringId: gathering!.id,
      title: draft!.title.trim() || "تقسیم نابرابر",
      amount: draft!.amount,
      category: draft!.category,
      payerId: draft!.payerId,
      participantIds: draft!.participantIds,
      split: "unequal",
      shares: draft!.shares,
      note: draft!.note || undefined,
      date: draft!.date,
      receiptImage: draft!.receiptImage,
    });
    setDraft(null);
    toast.success("تقسیم ثبت شد");
    navigate({ to: "/g/$id", params: { id: gathering!.id } });
  }

  const allocated = allocate(draft.amount, members.map((m) => m.id), shares);
  const rows = members.map((m) => ({
    id: m.id,
    name: youName(m),
    person: m,
    percent: shares[m.id] ?? 0,
    amount: allocated[m.id] ?? 0,
    color: SPLIT_THUMB[m.color],
  }));

  return (
    <div className="flex h-full min-h-0 flex-col bg-bg">
      <TopBar
        title="تقسیم نابرابر"
        subtitle="سهم هر نفر را مشخص کن"
        onBack={goBack}
      />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-3">
        <div className="mb-3 rounded-[22px] bg-surface px-4 py-3 shadow-card">
          <p className="text-xs text-muted">مبلغ کل</p>
          <div className="mt-1 flex items-baseline gap-2">
            <input
              inputMode="numeric"
              dir="ltr"
              value={draft.amount ? formatMoney(draft.amount) : ""}
              onChange={(e) =>
                patchDraft({ amount: parseAmount(e.target.value) })
              }
              placeholder="0"
              className="min-w-0 flex-1 bg-transparent text-[26px] font-extrabold tabular outline-none"
            />
            <span className="text-sm text-muted">{unit}</span>
          </div>
        </div>
        <UnequalSliders
          rows={rows}
          unit={unit}
          total={draft.amount}
          onSharesChange={(next) => patchDraft({ shares: next })}
          onEqualize={equalize}
          showEqualize={false}
        />
      </div>
      <div className="shrink-0 bg-bg px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-2">
        <Button
          variant="soft"
          block
          className="rounded-[22px]"
          onClick={equalize}
        >
          <Scale className="size-4" />
          به طور مساوی تقسیم کن
        </Button>
        <Button
          block
          className="mt-3 rounded-[22px]"
          onClick={confirm}
          disabled={members.length === 0}
        >
          تأیید تقسیم
        </Button>
      </div>
    </div>
  );
}
