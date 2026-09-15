import { PersonAvatar } from "@/components/person";
import { Button } from "@/components/ui/button";
import { formatMoney, parseAmount } from "@/lib/format";
import {
  percentFromAmount,
  redistributeShares,
  sharesSum,
} from "@/lib/settle";
import type { Person, PersonColor } from "@/lib/types";
import { Scale } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const SPLIT_THUMB: Record<PersonColor, string> = {
  "person-1": "#0e9f86",
  "person-2": "#7b67f6",
  "person-3": "#14b8a6",
  "person-4": "#a78bfa",
  "person-5": "#e85d8c",
  "person-6": "#f59e0b",
};

export type SplitRow = {
  id: string;
  name: string;
  person?: Person;
  percent: number;
  amount: number;
  color: string;
};

export function UnequalSliders({
  rows,
  unit,
  total,
  onSharesChange,
  onEqualize,
  showEqualize = true,
}: {
  rows: SplitRow[];
  unit: string;
  total: number;
  onSharesChange: (shares: Record<string, number>) => void;
  onEqualize: () => void;
  showEqualize?: boolean;
}) {
  const weightsRef = useRef<Record<string, number> | null>(null);
  const ids = rows.map((r) => r.id);
  const current = Object.fromEntries(rows.map((r) => [r.id, r.percent]));
  const sum = sharesSum(current, ids);
  const ok = sum === 100;

  function snapshot() {
    weightsRef.current = { ...current };
  }

  function clearSnapshot() {
    weightsRef.current = null;
  }

  function applyPercent(id: string, value: number, freeze = false) {
    const weights = freeze && weightsRef.current ? weightsRef.current : current;
    onSharesChange(redistributeShares(ids, id, value, weights));
  }

  function applyAmount(id: string, amount: number) {
    applyPercent(id, percentFromAmount(amount, total), false);
  }

  return (
    <div>
      <div className="flex flex-col gap-2.5">
        {rows.map((r) => (
          <div
            key={r.id}
            className="rounded-[22px] bg-surface px-4 py-3 shadow-card"
          >
            <div className="mb-2.5 flex items-center gap-3">
              <PersonAvatar person={r.person} size={48} />
              <p className="min-w-0 flex-1 truncate text-[16px] font-bold">
                {r.name}
              </p>
              <div className="shrink-0 text-end">
                <TapField
                  ariaLabel={`درصد ${r.name}`}
                  display={`${Math.round(r.percent)}%`}
                  color={r.color}
                  className="text-[16px] font-extrabold leading-none"
                  onCommit={(raw) => applyPercent(r.id, parseAmount(raw))}
                />
                <TapField
                  ariaLabel={`مبلغ ${r.name}`}
                  display={`${formatMoney(r.amount)} ${unit}`}
                  className="mt-1 text-[11px] text-muted"
                  onCommit={(raw) => applyAmount(r.id, parseAmount(raw))}
                />
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={r.percent}
              aria-label={`سهم ${r.name}`}
              onPointerDown={snapshot}
              onPointerUp={clearSnapshot}
              onPointerCancel={clearSnapshot}
              onChange={(e) => applyPercent(r.id, Number(e.target.value), true)}
              className="split-range"
              style={{
                ["--thumb" as string]: r.color,
                ["--track" as string]: `linear-gradient(to right, ${r.color} ${r.percent}%, #eef1f6 ${r.percent}%)`,
              }}
            />
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between rounded-[22px] bg-accent-soft px-4 py-3">
        <div className="flex items-center gap-2.5 font-bold">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-surface text-accent">
            <Scale className="size-4" />
          </span>
          مجموع
        </div>
        <div className="text-end">
          <p
            className={`text-[16px] font-extrabold leading-none ${
              ok ? "text-primary" : "text-danger"
            }`}
          >
            {Math.round(sum)}%
          </p>
          <p className="mt-1 text-[11px] text-muted">
            <bdi className="tabular">{formatMoney(total)}</bdi> {unit}
          </p>
        </div>
      </div>

      {showEqualize ? (
        <Button
          variant="soft"
          block
          className="mt-4 rounded-[22px]"
          onClick={onEqualize}
        >
          <Scale className="size-4" />
          به طور مساوی تقسیم کن
        </Button>
      ) : null}
    </div>
  );
}

function TapField({
  display,
  ariaLabel,
  onCommit,
  color,
  className,
}: {
  display: string;
  ariaLabel: string;
  onCommit: (raw: string) => void;
  color?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) ref.current?.select();
  }, [open]);

  function commit() {
    onCommit(raw);
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={() => {
          setRaw(display.replace(/[^\d۰-۹٠-٩.]/g, ""));
          setOpen(true);
        }}
        className={`block w-full rounded-lg px-1 py-0.5 text-end tabular hover:bg-bg ${className ?? ""}`}
        style={color ? { color } : undefined}
      >
        {display}
      </button>
    );
  }

  return (
    <input
      ref={ref}
      aria-label={ariaLabel}
      inputMode="numeric"
      dir="ltr"
      value={raw}
      onChange={(e) => setRaw(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
      className={`w-24 rounded-lg bg-bg px-1 py-0.5 text-end tabular outline-none ring-1 ring-primary ${className ?? ""}`}
      style={color ? { color } : undefined}
    />
  );
}
