import { CURRENCIES, type Currency } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CurrencyPicker({
  value,
  onChange,
  className,
}: {
  value: Currency;
  onChange: (c: Currency) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-4 gap-0.5 rounded-2xl bg-track p-1",
        className,
      )}
      role="radiogroup"
      aria-label="ارز"
    >
      {CURRENCIES.map((c) => {
        const on = value === c.id;
        return (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(c.id)}
            className={cn(
              "h-10 rounded-xl text-[13px] font-bold transition-[background-color,color,box-shadow] duration-150",
              on
                ? "bg-surface text-primary shadow-card"
                : "text-muted",
            )}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
