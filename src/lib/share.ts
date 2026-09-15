import type { Currency, Gathering, Person, Transfer } from "./types";
import { currencyLabel, formatMoney } from "./format";

export function settlementText(opts: {
  gathering: Gathering;
  people: Person[];
  transfers: Transfer[];
  total: number;
  currency: Currency;
}): string {
  const { gathering, people, transfers, total, currency } = opts;
  const nameOf = (id: string) => {
    const p = people.find((x) => x.id === id);
    if (!p) return "دوست";
    return p.isMe ? "تو" : p.name;
  };
  const unit = currencyLabel(currency);
  const lines = [
    `دنگ‌پال · ${gathering.name}`,
    `جمع هزینه‌ها: ${formatMoney(total)} ${unit}`,
    "",
  ];
  if (transfers.length === 0) {
    lines.push("همه‌چیز آماده‌ست! موجودی‌ها با هم برابر می‌شود.");
  } else {
    lines.push("چه کسی به چه کسی بدهکار است؟");
    for (const t of transfers) {
      lines.push(
        `• ${nameOf(t.fromId)} باید ${formatMoney(t.amount)} ${unit} به ${nameOf(t.toId)} بدهد`,
      );
    }
  }
  lines.push("", "با دنگ‌پال حساب‌وکتاب دوستانه بمونه");
  return lines.join("\n");
}

export function reminderText(opts: {
  toName: string;
  amount: number;
  currency: Currency;
  gatheringName: string;
  toPayName: string;
}): string {
  const unit = currencyLabel(opts.currency);
  return [
    `سلام ${opts.toName}`,
    `سهم شما از هزینه‌های دورهمی ${opts.gatheringName} ${formatMoney(opts.amount)} ${unit} است.`,
    `لطفاً برای تسویه به ${opts.toPayName} پرداخت کنید.`,
    "",
    "ممنون که همیشه همراهی — دنگ‌پال",
  ].join("\n");
}

export function quickSplitText(opts: {
  rows: { name: string; amount: number }[];
  total: number;
  currency: Currency;
}): string {
  const unit = currencyLabel(opts.currency);
  const lines = [
    "دنگ‌پال · نتیجه تقسیم",
    `جمع: ${formatMoney(opts.total)} ${unit}`,
    "",
  ];
  for (const r of opts.rows) {
    lines.push(`${r.name}: ${formatMoney(r.amount)} ${unit}`);
  }
  lines.push("", "همه‌چیز آماده‌ست!");
  return lines.join("\n");
}

export async function nativeShare(
  title: string,
  text: string,
  url?: string,
): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share(url ? { title, text, url } : { title, text });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export function waLink(text: string) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function tgLink(text: string) {
  return `https://t.me/share/url?url=${encodeURIComponent("https://dangpal.app")}&text=${encodeURIComponent(text)}`;
}

export function smsLink(text: string) {
  return `sms:?&body=${encodeURIComponent(text)}`;
}

export function baleLink(text: string) {
  return `https://ble.ir/share?text=${encodeURIComponent(text)}`;
}

export function copyText(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
