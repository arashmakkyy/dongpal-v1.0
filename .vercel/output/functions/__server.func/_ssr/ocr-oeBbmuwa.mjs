import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ocr-oeBbmuwa.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function receiptGrand(p) {
	if (p.total && p.total > 0) return Math.round(p.total);
	const items = p.items.reduce((s, i) => s + (i.amount || 0), 0);
	return Math.round(items + (p.tax || 0) + (p.tip || 0));
}
function guessCategory(merchant = "") {
	const t = merchant.toLowerCase();
	if (/هتل|اقامت|hotel|villa|ویلا/.test(t)) return "lodging";
	if (/تاکسی|اسنپ|تپسی|uber|taxi|بنزین|metro|مترو/.test(t)) return "transport";
	if (/فروشگاه|مارکت|سوپر|digikala|store|mall/.test(t)) return "shopping";
	if (/رستوران|کافه|قهوه|food|cafe|restaurant/.test(t)) return "food";
	return "food";
}
function num(v) {
	if (typeof v === "number" && Number.isFinite(v)) return Math.round(v);
	if (typeof v === "string") {
		const n = Number(v.replace(/[^\d.-]/g, ""));
		return Number.isFinite(n) ? Math.round(n) : 0;
	}
	return 0;
}
function coerceUnit(v) {
	if (typeof v !== "string") return void 0;
	const s = v.toLowerCase();
	if (s === "rial" || s === "irr" || s === "ریال") return "IRR";
	if (s === "toman" || s === "irt" || s === "تومان") return "IRT";
	if (s === "other") return "other";
}
function coerceReceipt(raw) {
	const p = raw && typeof raw === "object" ? raw : {};
	const items = (Array.isArray(p.items) ? p.items : []).map((it) => {
		const row = it && typeof it === "object" ? it : {};
		return {
			title: String(row.title ?? row.name ?? "قلم").trim() || "قلم",
			amount: num(row.amount ?? row.price)
		};
	}).filter((it) => it.amount > 0 || it.title);
	const parsed = {
		merchant: String(p.merchant ?? p.store ?? "").trim() || void 0,
		items,
		tax: num(p.tax) || void 0,
		tip: num(p.tip) || void 0,
		total: num(p.total) || void 0,
		unit: coerceUnit(p.unit),
		category: guessCategory(String(p.merchant ?? ""))
	};
	if (!parsed.total) parsed.total = receiptGrand(parsed) || void 0;
	return parsed;
}
var parseReceiptImage_createServerFn_handler = createServerRpc({
	id: "3f7ec66f07736f43c16536dd8b61f701c5a527117b88d320cc85c9ad69ee24f2",
	name: "parseReceiptImage",
	filename: "src/lib/ocr.ts"
}, (opts) => parseReceiptImage.__executeServer(opts));
var parseReceiptImage = createServerFn({ method: "POST" }).validator((d) => d).handler(parseReceiptImage_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "no-ai"
	};
	if (!data.image || data.image.length > 24e5) return {
		ok: false,
		error: "image-too-large"
	};
	try {
		const res = await fetch("https://api.x.ai/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model: "grok-4.5",
				max_tokens: 900,
				messages: [{
					role: "user",
					content: [{
						type: "text",
						text: `این یک رسید خرید یا رستوران است؛ اغلب ایرانی.
فقط JSON برگردان، بدون markdown:
{"merchant":string,"items":[{"title":string,"amount":number}],"tax":number,"tip":number,"total":number,"unit":"toman"|"rial"|"other"}
قوانین:
- amount و total همان عدد چاپ‌شده روی رسید باشند (صحیح، بدون تبدیل تومان/ریال).
- اگر روی رسید «ریال» یا rial آمده unit=rial. اگر «تومان» یا toman آمده unit=toman. وگرنه other.
- عنوان‌ها را فارسی نگه دار اگر رسید فارسی است.
- tax و tip را جدا کن؛ در total اگر جمع کل چاپ شده همان را بگذار.`
					}, {
						type: "image_url",
						image_url: { url: data.image }
					}]
				}]
			})
		});
		if (!res.ok) return {
			ok: false,
			error: `xAI ${res.status}`
		};
		const json = ((await res.json()).choices[0]?.message.content ?? "").replace(/```json|```/g, "").trim();
		return {
			ok: true,
			data: coerceReceipt(JSON.parse(json))
		};
	} catch {
		return {
			ok: false,
			error: "parse-failed"
		};
	}
});
//#endregion
export { parseReceiptImage_createServerFn_handler };
