import { w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as CURRENCIES, u as cn } from "./router-DVGuM8Ia.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/currency-picker-4gCpSRia.js
var import_jsx_runtime = require_jsx_runtime();
function CurrencyPicker({ value, onChange, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("grid grid-cols-4 gap-0.5 rounded-2xl bg-track p-1", className),
		role: "radiogroup",
		"aria-label": "ارز",
		children: CURRENCIES.map((c) => {
			const on = value === c.id;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				role: "radio",
				"aria-checked": on,
				onClick: () => onChange(c.id),
				className: cn("h-10 rounded-xl text-[13px] font-bold transition-[background-color,color,box-shadow] duration-150", on ? "bg-surface text-primary shadow-card" : "text-muted"),
				children: c.label
			}, c.id);
		})
	});
}
//#endregion
export { CurrencyPicker as t };
