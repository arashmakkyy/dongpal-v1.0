import { w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { D as Fuel, T as House, l as Sparkles, r as UtensilsCrossed, u as ShoppingCart } from "../_libs/lucide-react.mjs";
import { u as cn } from "./router-DVGuM8Ia.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/category-icon-CI0NNpmM.js
var import_jsx_runtime = require_jsx_runtime();
var meta = {
	lodging: {
		icon: House,
		wrap: "bg-primary-soft",
		fg: "text-primary"
	},
	food: {
		icon: UtensilsCrossed,
		wrap: "bg-accent-soft",
		fg: "text-accent"
	},
	transport: {
		icon: Fuel,
		wrap: "bg-success-soft",
		fg: "text-person-3"
	},
	shopping: {
		icon: ShoppingCart,
		wrap: "bg-pink-soft",
		fg: "text-pink"
	},
	other: {
		icon: Sparkles,
		wrap: "bg-track",
		fg: "text-muted"
	}
};
function CategoryIcon({ category, size = 40 }) {
	const m = meta[category];
	const Icon = m.icon;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex items-center justify-center rounded-2xl", m.wrap, m.fg),
		style: {
			width: size,
			height: size
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			className: "size-[18px]",
			strokeWidth: 2.1
		})
	});
}
//#endregion
export { CategoryIcon as t };
