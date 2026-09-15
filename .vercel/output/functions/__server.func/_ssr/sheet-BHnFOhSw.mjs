import { i as __toESM } from "../_runtime.mjs";
import { l as require_react_dom, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as X } from "../_libs/lucide-react.mjs";
import { u as cn } from "./router-DVGuM8Ia.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sheet-BHnFOhSw.js
var import_jsx_runtime = require_jsx_runtime();
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom());
function Sheet({ open, onClose, title, children, className }) {
	if (!open || typeof document === "undefined") return null;
	const host = document.getElementById("app-phone") ?? document.body;
	return (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute inset-0 z-[70] flex items-end",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-label": "بستن",
			className: "absolute inset-0 bg-fg/40",
			onClick: onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("relative z-10 max-h-[86%] w-full overflow-y-auto rounded-t-3xl bg-surface p-5 pb-[max(20px,env(safe-area-inset-bottom))] shadow-float anim-pop", className),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto mb-3 h-1.5 w-12 rounded-full bg-border" }),
				title && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-bold",
						children: title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						className: "flex size-11 items-center justify-center rounded-xl text-muted",
						"aria-label": "بستن",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})]
				}),
				children
			]
		})]
	}), host);
}
//#endregion
export { Sheet as t };
