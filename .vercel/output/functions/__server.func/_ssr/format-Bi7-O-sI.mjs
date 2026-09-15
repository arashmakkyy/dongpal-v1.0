import { n as toGregorian, r as toJalaali, t as jalaaliMonthLength } from "../_libs/jalaali-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/format-Bi7-O-sI.js
var MONTHS = [
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
	"اسفند"
];
var FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
var AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
function toEnDigits(raw) {
	return raw.replace(/[۰-۹٠-٩]/g, (ch) => {
		const fa = FA_DIGITS.indexOf(ch);
		if (fa >= 0) return String(fa);
		const ar = AR_DIGITS.indexOf(ch);
		return ar >= 0 ? String(ar) : ch;
	});
}
function formatMoney(n) {
	return (n < 0 ? "−" : "") + Math.round(Math.abs(n)).toLocaleString("en-US");
}
function currencyLabel(c) {
	switch (c) {
		case "IRT": return "تومان";
		case "IRR": return "ریال";
		case "USD": return "دلار";
		case "EUR": return "یورو";
	}
}
/** ۱ تومان = ۱۰ ریال. ارزهای دیگر را دست نمی‌زند. */
function convertIrtIrr(amount, from, to) {
	if (from === to) return Math.round(amount);
	if (from === "IRR" && to === "IRT") return Math.round(amount / 10);
	if (from === "IRT" && to === "IRR") return Math.round(amount * 10);
	return Math.round(amount);
}
function jalaliParts(date) {
	const d = typeof date === "number" ? new Date(date) : date;
	return toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
}
function formatJalali(date) {
	const { jy, jm, jd } = jalaliParts(date);
	return `${jy}/${jm}/${jd}`;
}
function formatJalaliPretty(date) {
	const { jy, jm, jd } = jalaliParts(date);
	return `${jd} ${MONTHS[jm - 1]} ${jy}`;
}
function formatTime(date) {
	const d = typeof date === "number" ? new Date(date) : date;
	return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}
function startOfLocalDay(ts) {
	const d = new Date(ts);
	d.setHours(0, 0, 0, 0);
	return d.getTime();
}
function formatWhen(date) {
	const ts = typeof date === "number" ? date : date.getTime();
	const today = startOfLocalDay(Date.now());
	const that = startOfLocalDay(ts);
	const diffDays = Math.round((today - that) / 864e5);
	const time = formatTime(ts);
	if (diffDays === 0) return `امروز · ${time}`;
	if (diffDays === 1) return `دیروز · ${time}`;
	if (diffDays > 1 && diffDays < 7) return `${diffDays} روز پیش`;
	return formatJalali(ts);
}
function gregorianFromJalali(jy, jm, jd) {
	const g = toGregorian(jy, jm, jd);
	return new Date(g.gy, g.gm - 1, g.gd, 12, 0, 0);
}
function monthLength(jy, jm) {
	return jalaaliMonthLength(jy, jm);
}
function parseAmount(raw) {
	const digits = toEnDigits(raw).replace(/[^\d.]/g, "");
	if (!digits) return 0;
	return Math.round(Number(digits));
}
//#endregion
export { formatJalaliPretty as a, gregorianFromJalali as c, parseAmount as d, formatJalali as i, jalaliParts as l, convertIrtIrr as n, formatMoney as o, currencyLabel as r, formatWhen as s, MONTHS as t, monthLength as u };
