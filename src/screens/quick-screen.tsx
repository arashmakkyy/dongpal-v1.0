import { UnequalSliders, SPLIT_THUMB } from "@/components/unequal-sliders";
import { AppScreen, HeartMark, TopBar } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { PersonAvatar } from "@/components/person";
import { CurrencyPicker } from "@/components/currency-picker";
import { type Currency, type Person } from "@/lib/types";
import { currencyLabel, formatMoney, parseAmount } from "@/lib/format";
import { allocate, equalPercents } from "@/lib/settle";
import { copyText, quickSplitText, nativeShare, waLink, tgLink, smsLink } from "@/lib/share";
import { useDang } from "@/lib/store";
import { useNavigate } from "@tanstack/react-router";
import { Check, Copy, Link2, Minus, Plus, QrCode } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type Step = "form" | "unequal" | "result";

export function QuickScreen() {
  const navigate = useNavigate();
  const people = useDang((s) => s.people);
  const profile = useDang((s) => s.profile);
  const [step, setStep] = useState<Step>("form");
  const [amount, setAmount] = useState(2_450_000);
  const [currency, setCurrency] = useState<Currency>(profile.defaultCurrency);
  const [count, setCount] = useState(4);
  const [tip, setTip] = useState(0);
  const [tax, setTax] = useState(0);
  const friends = people.slice(0, Math.max(count, 1));
  const names = useMemo(() => {
    const list = friends.map((p) => p.name);
    while (list.length < count) list.push(`نفر ${list.length + 1}`);
    return list.slice(0, count);
  }, [friends, count]);
  const ids = names.map((_, i) => `q-${i}`);
  const [shares, setShares] = useState<Record<string, number>>({});
  const grand = Math.round(amount * (1 + tip / 100 + tax / 100));

  useEffect(() => {
    const next = Array.from({ length: count }, (_, i) => `q-${i}`);
    setShares(equalPercents(next));
  }, [count]);
  const percents = Object.keys(shares).length
    ? shares
    : equalPercents(ids);
  const rows = ids.map((id, i) => ({
    id,
    name: names[i],
    person: friends[i] as Person | undefined,
    percent: percents[id] ?? 0,
    amount: allocate(grand, ids, percents)[id] ?? 0,
  }));

  const text = quickSplitText({
    rows: rows.map((r) => ({ name: r.name, amount: r.amount })),
    total: grand,
    currency,
  });

  function startEqual() {
    setShares(equalPercents(ids));
    setStep("result");
  }

  return (
    <AppScreen>
      <TopBar
        title={step === "result" ? "نتیجه تقسیم" : step === "unequal" ? "تقسیم نابرابر" : "تقسیم سریع"}
        subtitle={step === "result" ? "همه‌چیز آماده‌ست!" : undefined}
        onBack={() => {
          if (step === "result") setStep("form");
          else if (step === "unequal") setStep("form");
          else navigate({ to: "/" });
        }}
      />
      {step === "form" && (
        <div className="px-5 pb-8">
          <div className="rounded-3xl bg-surface p-5 shadow-card">
            <p className="text-sm text-muted">مبلغ کل</p>
            <input
              inputMode="numeric"
              dir="ltr"
              value={amount ? formatMoney(amount) : ""}
              onChange={(e) => setAmount(parseAmount(e.target.value))}
              className="mt-1 w-full bg-transparent text-[34px] font-extrabold tabular outline-none"
            />
            <p className="text-sm text-muted">{currencyLabel(currency)}</p>
            <CurrencyPicker
              className="mt-4"
              value={currency}
              onChange={setCurrency}
            />
          </div>

          <div className="mt-3 flex items-center justify-between rounded-3xl bg-surface px-4 py-3 shadow-card">
            <span className="text-sm text-muted">تعداد نفرات</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex size-10 items-center justify-center rounded-2xl bg-bg"
                onClick={() => setCount((n) => Math.max(2, n - 1))}
                aria-label="کم کردن"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-6 text-center text-lg font-extrabold tabular">
                {count}
              </span>
              <button
                type="button"
                className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-fg"
                onClick={() => setCount((n) => Math.min(12, n + 1))}
                aria-label="اضافه کردن"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <PercentBox label="انعام (اختیاری)" value={tip} onChange={setTip} />
            <PercentBox label="مالیات (اختیاری)" value={tax} onChange={setTax} />
          </div>

          <div className="mt-4 rounded-3xl bg-surface px-4 py-3 text-sm shadow-card">
            <div className="flex justify-between text-muted">
              <span>جمع نهایی</span>
              <span className="font-bold text-fg">
                <bdi className="tabular">{formatMoney(grand)}</bdi>{" "}
                {currencyLabel(currency)}
              </span>
            </div>
          </div>

          <Button block className="mt-5" onClick={startEqual}>
            تقسیم کن
          </Button>
          <Button
            variant="soft"
            block
            className="mt-2"
            onClick={() => {
              setShares(equalPercents(ids));
              setStep("unequal");
            }}
          >
            تقسیم نابرابر
          </Button>
        </div>
      )}

      {step === "unequal" && (
        <div className="px-5 pb-8">
          <UnequalSliders
            rows={rows.map((r) => ({
              id: r.id,
              name: r.name,
              person: r.person,
              percent: r.percent,
              amount: r.amount,
              color: r.person ? SPLIT_THUMB[r.person.color] : "#0e9f86",
            }))}
            unit={currencyLabel(currency)}
            total={grand}
            onSharesChange={setShares}
            onEqualize={() => setShares(equalPercents(ids))}
          />
          <Button block className="mt-3 rounded-[22px]" onClick={() => setStep("result")}>
            تأیید تقسیم
          </Button>
        </div>
      )}

      {step === "result" && (
        <Result
          rows={rows}
          grand={grand}
          currency={currency}
          text={text}
        />
      )}
    </AppScreen>
  );
}

function PercentBox({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="rounded-3xl bg-surface px-3 py-3 shadow-card">
      <p className="text-[11px] text-muted">{label}</p>
      <div className="mt-1 flex items-center justify-between">
        <button
          type="button"
          className="size-8 rounded-xl bg-bg"
          onClick={() => onChange(Math.max(0, value - 1))}
        >
          −
        </button>
        <span className="font-extrabold tabular">{value}%</span>
        <button
          type="button"
          className="size-8 rounded-xl bg-bg"
          onClick={() => onChange(Math.min(40, value + 1))}
        >
          +
        </button>
      </div>
    </div>
  );
}

function Result({
  rows,
  grand,
  currency,
  text,
}: {
  rows: { id: string; name: string; person?: Person; amount: number }[];
  grand: number;
  currency: Currency;
  text: string;
}) {
  const [qr, setQr] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  async function showQr() {
    const QR = await import("qrcode");
    const url = await QR.toDataURL(text, { margin: 1, width: 280 });
    setQr(url);
  }

  return (
    <div className="px-5 pb-8">
      <div
        ref={cardRef}
        className="rounded-3xl bg-success-soft px-4 py-3 text-sm font-semibold text-primary"
      >
        <span className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-surface">
            <Check className="size-4" />
          </span>
          تقسیم با موفقیت انجام شد
          <HeartMark />
        </span>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {rows.map((r) => (
          <div
            key={r.id}
            className="flex items-center gap-3 rounded-3xl bg-surface px-3 py-3 shadow-card"
          >
            <PersonAvatar person={r.person} size={44} />
            <p className="flex-1 font-bold">{r.name}</p>
            <p className="font-extrabold">
              <bdi className="tabular">{formatMoney(r.amount)}</bdi>{" "}
              {currencyLabel(currency)}
            </p>
            <button
              type="button"
              className="flex size-10 items-center justify-center text-muted"
              onClick={async () => {
                await copyText(String(r.amount));
                toast.success("مبلغ کپی شد");
              }}
              aria-label="کپی"
            >
              <Copy className="size-4" />
            </button>
          </div>
        ))}
      </div>
      <Button
        variant="accent"
        block
        className="mt-5"
        onClick={async () => {
          const shared = await nativeShare("دنگ‌پال", text);
          if (!shared) {
            await copyText(text);
            toast.success("نتیجه کپی شد");
          }
        }}
      >
        اشتراک‌گذاری نتیجه
      </Button>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button variant="lavender" onClick={() => void copyText(text).then(() => toast.success("متن کپی شد"))}>
          <Link2 className="size-4" />
          کپی متن
        </Button>
        <Button variant="lavender" onClick={() => void showQr()}>
          <QrCode className="size-4" />
          کد QR
        </Button>
      </div>
      {qr && (
        <div className="mt-4 flex justify-center rounded-3xl bg-surface p-4 shadow-card">
          <img src={qr} alt="QR" className="size-48" />
        </div>
      )}
      <div className="mt-4 flex justify-center gap-3 text-xs text-muted">
        <a className="text-primary" href={waLink(text)} target="_blank" rel="noreferrer">
          واتساپ
        </a>
        <a className="text-primary" href={tgLink(text)} target="_blank" rel="noreferrer">
          تلگرام
        </a>
        <a className="text-primary" href={smsLink(text)} target="_blank" rel="noreferrer">
          پیامک
        </a>
      </div>
      <p className="mt-4 text-center text-xs text-muted">
        جمع <bdi className="tabular">{formatMoney(grand)}</bdi> {currencyLabel(currency)}
      </p>
    </div>
  );
}
