import { i as __toESM } from "../_runtime.mjs";
import { W as require_react, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { g as Scale } from "../_libs/lucide-react.mjs";
import { n as PersonAvatar } from "./person-BeSrLKWO.mjs";
import { t as Button } from "./button-bgaJ7srM.mjs";
import { d as parseAmount, o as formatMoney } from "./format-Bi7-O-sI.mjs";
import { c as sharesSum, o as percentFromAmount, s as redistributeShares } from "./settle-DOh7cCQm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/unequal-sliders-Hm71MXqE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SPLIT_THUMB = {
	"person-1": "#0e9f86",
	"person-2": "#7b67f6",
	"person-3": "#14b8a6",
	"person-4": "#a78bfa",
	"person-5": "#e85d8c",
	"person-6": "#f59e0b"
};
function UnequalSliders({ rows, unit, total, onSharesChange, onEqualize, showEqualize = true }) {
	const weightsRef = (0, import_react.useRef)(null);
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
	function applyPercent(id, value, freeze = false) {
		const weights = freeze && weightsRef.current ? weightsRef.current : current;
		onSharesChange(redistributeShares(ids, id, value, weights));
	}
	function applyAmount(id, amount) {
		applyPercent(id, percentFromAmount(amount, total), false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-col gap-2.5",
			children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-[22px] bg-surface px-4 py-3 shadow-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-2.5 flex items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAvatar, {
							person: r.person,
							size: 48
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "min-w-0 flex-1 truncate text-[16px] font-bold",
							children: r.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "shrink-0 text-end",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TapField, {
								ariaLabel: `درصد ${r.name}`,
								display: `${Math.round(r.percent)}%`,
								color: r.color,
								className: "text-[16px] font-extrabold leading-none",
								onCommit: (raw) => applyPercent(r.id, parseAmount(raw))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TapField, {
								ariaLabel: `مبلغ ${r.name}`,
								display: `${formatMoney(r.amount)} ${unit}`,
								className: "mt-1 text-[11px] text-muted",
								onCommit: (raw) => applyAmount(r.id, parseAmount(raw))
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "range",
					min: 0,
					max: 100,
					step: 1,
					value: r.percent,
					"aria-label": `سهم ${r.name}`,
					onPointerDown: snapshot,
					onPointerUp: clearSnapshot,
					onPointerCancel: clearSnapshot,
					onChange: (e) => applyPercent(r.id, Number(e.target.value), true),
					className: "split-range",
					style: {
						["--thumb"]: r.color,
						["--track"]: `linear-gradient(to right, ${r.color} ${r.percent}%, #eef1f6 ${r.percent}%)`
					}
				})]
			}, r.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 flex items-center justify-between rounded-[22px] bg-accent-soft px-4 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2.5 font-bold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex size-9 items-center justify-center rounded-2xl bg-surface text-accent",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scale, { className: "size-4" })
				}), "مجموع"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-end",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: `text-[16px] font-extrabold leading-none ${ok ? "text-primary" : "text-danger"}`,
					children: [Math.round(sum), "%"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-[11px] text-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", {
							className: "tabular",
							children: formatMoney(total)
						}),
						" ",
						unit
					]
				})]
			})]
		}),
		showEqualize ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "soft",
			block: true,
			className: "mt-4 rounded-[22px]",
			onClick: onEqualize,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scale, { className: "size-4" }), "به طور مساوی تقسیم کن"]
		}) : null
	] });
}
function TapField({ display, ariaLabel, onCommit, color, className }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [raw, setRaw] = (0, import_react.useState)("");
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (open) ref.current?.select();
	}, [open]);
	function commit() {
		onCommit(raw);
		setOpen(false);
	}
	if (!open) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": ariaLabel,
		onClick: () => {
			setRaw(display.replace(/[^\d۰-۹٠-٩.]/g, ""));
			setOpen(true);
		},
		className: `block w-full rounded-lg px-1 py-0.5 text-end tabular hover:bg-bg ${className ?? ""}`,
		style: color ? { color } : void 0,
		children: display
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		ref,
		"aria-label": ariaLabel,
		inputMode: "numeric",
		dir: "ltr",
		value: raw,
		onChange: (e) => setRaw(e.target.value),
		onBlur: commit,
		onKeyDown: (e) => {
			if (e.key === "Enter") e.target.blur();
		},
		className: `w-24 rounded-lg bg-bg px-1 py-0.5 text-end tabular outline-none ring-1 ring-primary ${className ?? ""}`,
		style: color ? { color } : void 0
	});
}
//#endregion
export { UnequalSliders as n, SPLIT_THUMB as t };
