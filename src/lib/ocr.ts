import { createServerFn } from "@tanstack/react-start";
import type { Category } from "./types";

export type ReceiptItem = { title: string; amount: number };

export type ReceiptUnit = "IRT" | "IRR" | "other";

export type ReceiptParse = {
  merchant?: string;
  items: ReceiptItem[];
  tax?: number;
  tip?: number;
  total?: number;
  unit?: ReceiptUnit;
  category?: Category;
};

export const SAMPLE_RECEIPT: ReceiptParse = {
  merchant: "رستوران خوب",
  items: [
    { title: "غذای اصلی", amount: 1_200_000 },
    { title: "سالاد", amount: 250_000 },
    { title: "نوشیدنی", amount: 250_000 },
    { title: "دسر", amount: 200_000 },
  ],
  tax: 189_000,
  total: 2_289_000,
  unit: "IRT",
  category: "food",
};

export function receiptGrand(p: ReceiptParse): number {
  if (p.total && p.total > 0) return Math.round(p.total);
  const items = p.items.reduce((s, i) => s + (i.amount || 0), 0);
  return Math.round(items + (p.tax || 0) + (p.tip || 0));
}

export function guessCategory(merchant = ""): Category {
  const t = merchant.toLowerCase();
  if (/هتل|اقامت|hotel|villa|ویلا/.test(t)) return "lodging";
  if (/تاکسی|اسنپ|تپسی|uber|taxi|بنزین|metro|مترو/.test(t)) return "transport";
  if (/فروشگاه|مارکت|سوپر|digikala|store|mall/.test(t)) return "shopping";
  if (/رستوران|کافه|قهوه|food|cafe|restaurant/.test(t)) return "food";
  return "food";
}

function num(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return Math.round(v);
  if (typeof v === "string") {
    const n = Number(v.replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? Math.round(n) : 0;
  }
  return 0;
}

function coerceUnit(v: unknown): ReceiptUnit | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.toLowerCase();
  if (s === "rial" || s === "irr" || s === "ریال") return "IRR";
  if (s === "toman" || s === "irt" || s === "تومان") return "IRT";
  if (s === "other") return "other";
  return undefined;
}

export function coerceReceipt(raw: unknown): ReceiptParse {
  const p = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const itemsRaw = Array.isArray(p.items) ? p.items : [];
  const items: ReceiptItem[] = itemsRaw
    .map((it) => {
      const row = (it && typeof it === "object" ? it : {}) as Record<string, unknown>;
      return {
        title: String(row.title ?? row.name ?? "قلم").trim() || "قلم",
        amount: num(row.amount ?? row.price),
      };
    })
    .filter((it) => it.amount > 0 || it.title);
  const parsed: ReceiptParse = {
    merchant: String(p.merchant ?? p.store ?? "").trim() || undefined,
    items,
    tax: num(p.tax) || undefined,
    tip: num(p.tip) || undefined,
    total: num(p.total) || undefined,
    unit: coerceUnit(p.unit),
    category: guessCategory(String(p.merchant ?? "")),
  };
  if (!parsed.total) parsed.total = receiptGrand(parsed) || undefined;
  return parsed;
}

export const parseReceiptImage = createServerFn({ method: "POST" })
  .validator((d: { image: string }) => d)
  .handler(async ({ data }): Promise<{ ok: true; data: ReceiptParse } | { ok: false; error: string }> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, error: "no-ai" };
    if (!data.image || data.image.length > 2_400_000) {
      return { ok: false, error: "image-too-large" };
    }
    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4.5",
          max_tokens: 900,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `این یک رسید خرید یا رستوران است؛ اغلب ایرانی.
فقط JSON برگردان، بدون markdown:
{"merchant":string,"items":[{"title":string,"amount":number}],"tax":number,"tip":number,"total":number,"unit":"toman"|"rial"|"other"}
قوانین:
- amount و total همان عدد چاپ‌شده روی رسید باشند (صحیح، بدون تبدیل تومان/ریال).
- اگر روی رسید «ریال» یا rial آمده unit=rial. اگر «تومان» یا toman آمده unit=toman. وگرنه other.
- عنوان‌ها را فارسی نگه دار اگر رسید فارسی است.
- tax و tip را جدا کن؛ در total اگر جمع کل چاپ شده همان را بگذار.`,
                },
                { type: "image_url", image_url: { url: data.image } },
              ],
            },
          ],
        }),
      });
      if (!res.ok) return { ok: false, error: `xAI ${res.status}` };
      const body = (await res.json()) as {
        choices: { message: { content: string } }[];
      };
      const raw = body.choices[0]?.message.content ?? "";
      const json = raw.replace(/```json|```/g, "").trim();
      const parsed = coerceReceipt(JSON.parse(json));
      return { ok: true, data: parsed };
    } catch {
      return { ok: false, error: "parse-failed" };
    }
  });
