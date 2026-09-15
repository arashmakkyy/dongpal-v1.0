import { o as formatMoney, r as currencyLabel } from "./format-Bi7-O-sI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/share-DvHM8VOG.js
function settlementText(opts) {
	const { gathering, people, transfers, total, currency } = opts;
	const nameOf = (id) => {
		const p = people.find((x) => x.id === id);
		if (!p) return "دوست";
		return p.isMe ? "تو" : p.name;
	};
	const unit = currencyLabel(currency);
	const lines = [
		`دنگ‌پال · ${gathering.name}`,
		`جمع هزینه‌ها: ${formatMoney(total)} ${unit}`,
		""
	];
	if (transfers.length === 0) lines.push("همه‌چیز آماده‌ست! موجودی‌ها با هم برابر می‌شود.");
	else {
		lines.push("چه کسی به چه کسی بدهکار است؟");
		for (const t of transfers) lines.push(`• ${nameOf(t.fromId)} باید ${formatMoney(t.amount)} ${unit} به ${nameOf(t.toId)} بدهد`);
	}
	lines.push("", "با دنگ‌پال حساب‌وکتاب دوستانه بمونه");
	return lines.join("\n");
}
function reminderText(opts) {
	const unit = currencyLabel(opts.currency);
	return [
		`سلام ${opts.toName}`,
		`سهم شما از هزینه‌های دورهمی ${opts.gatheringName} ${formatMoney(opts.amount)} ${unit} است.`,
		`لطفاً برای تسویه به ${opts.toPayName} پرداخت کنید.`,
		"",
		"ممنون که همیشه همراهی — دنگ‌پال"
	].join("\n");
}
function quickSplitText(opts) {
	const unit = currencyLabel(opts.currency);
	const lines = [
		"دنگ‌پال · نتیجه تقسیم",
		`جمع: ${formatMoney(opts.total)} ${unit}`,
		""
	];
	for (const r of opts.rows) lines.push(`${r.name}: ${formatMoney(r.amount)} ${unit}`);
	lines.push("", "همه‌چیز آماده‌ست!");
	return lines.join("\n");
}
async function nativeShare(title, text, url) {
	if (typeof navigator !== "undefined" && navigator.share) try {
		await navigator.share(url ? {
			title,
			text,
			url
		} : {
			title,
			text
		});
		return true;
	} catch {
		return false;
	}
	return false;
}
function waLink(text) {
	return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
function tgLink(text) {
	return `https://t.me/share/url?url=${encodeURIComponent("https://dangpal.app")}&text=${encodeURIComponent(text)}`;
}
function smsLink(text) {
	return `sms:?&body=${encodeURIComponent(text)}`;
}
function baleLink(text) {
	return `https://ble.ir/share?text=${encodeURIComponent(text)}`;
}
function copyText(text) {
	return navigator.clipboard.writeText(text);
}
//#endregion
export { reminderText as a, tgLink as c, quickSplitText as i, waLink as l, copyText as n, settlementText as o, nativeShare as r, smsLink as s, baleLink as t };
