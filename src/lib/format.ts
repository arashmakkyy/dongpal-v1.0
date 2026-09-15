import { toJalaali, toGregorian, jalaaliMonthLength } from "jalaali-js";
import type { Currency } from "./types";

const MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function toEnDigits(raw: string): string {
  return raw.replace(/[۰-۹٠-٩]/g, (ch) => {
    const fa = FA_DIGITS.indexOf(ch);
    if (fa >= 0) return String(fa);
    const ar = AR_DIGITS.indexOf(ch);
    return ar >= 0 ? String(ar) : ch;
  });
}

export function formatMoney(n: number): string {
  const sign = n < 0 ? "−" : "";
  return sign + Math.round(Math.abs(n)).toLocaleString("en-US");
}

export function currencyLabel(c: Currency): string {
  switch (c) {
    case "IRT":
      return "تومان";
    case "IRR":
      return "ریال";
    case "USD":
      return "دلار";
    case "EUR":
      return "یورو";
  }
}

/** ۱ تومان = ۱۰ ریال. ارزهای دیگر را دست نمی‌زند. */
export function convertIrtIrr(
  amount: number,
  from: Currency,
  to: Currency,
): number {
  if (from === to) return Math.round(amount);
  if (from === "IRR" && to === "IRT") return Math.round(amount / 10);
  if (from === "IRT" && to === "IRR") return Math.round(amount * 10);
  return Math.round(amount);
}

export function jalaliParts(date: Date | number) {
  const d = typeof date === "number" ? new Date(date) : date;
  return toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

export function formatJalali(date: Date | number): string {
  const { jy, jm, jd } = jalaliParts(date);
  return `${jy}/${jm}/${jd}`;
}

export function formatJalaliPretty(date: Date | number): string {
  const { jy, jm, jd } = jalaliParts(date);
  return `${jd} ${MONTHS[jm - 1]} ${jy}`;
}

export function formatTime(date: Date | number): string {
  const d = typeof date === "number" ? new Date(date) : date;
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function startOfLocalDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function formatWhen(date: Date | number): string {
  const ts = typeof date === "number" ? date : date.getTime();
  const now = Date.now();
  const today = startOfLocalDay(now);
  const that = startOfLocalDay(ts);
  const diffDays = Math.round((today - that) / 86400000);
  const time = formatTime(ts);
  if (diffDays === 0) return `امروز · ${time}`;
  if (diffDays === 1) return `دیروز · ${time}`;
  if (diffDays > 1 && diffDays < 7) return `${diffDays} روز پیش`;
  return formatJalali(ts);
}

export function gregorianFromJalali(jy: number, jm: number, jd: number): Date {
  const g = toGregorian(jy, jm, jd);
  return new Date(g.gy, g.gm - 1, g.gd, 12, 0, 0);
}

export function monthLength(jy: number, jm: number): number {
  return jalaaliMonthLength(jy, jm);
}

export { MONTHS };

export function parseAmount(raw: string): number {
  const digits = toEnDigits(raw).replace(/[^\d.]/g, "");
  if (!digits) return 0;
  return Math.round(Number(digits));
}

export function pluralFa(n: number, word: string): string {
  return `${n.toLocaleString("en-US")} ${word}`;
}
