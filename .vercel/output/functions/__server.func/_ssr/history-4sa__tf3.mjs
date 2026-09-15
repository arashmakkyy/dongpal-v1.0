import { w as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as useDang, s as AppScreen } from "./router-DVGuM8Ia.mjs";
import { n as PersonAvatar } from "./person-BeSrLKWO.mjs";
import { o as formatMoney, r as currencyLabel, s as formatWhen } from "./format-Bi7-O-sI.mjs";
import { t as CategoryIcon } from "./category-icon-CI0NNpmM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/history-4sa__tf3.js
var import_jsx_runtime = require_jsx_runtime();
function HistoryScreen() {
	const allExpenses = useDang((s) => s.expenses);
	const gatherings = useDang((s) => s.gatherings);
	const people = useDang((s) => s.people);
	const expenses = [...allExpenses].sort((a, b) => b.date - a.date);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppScreen, {
		nav: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-5 pb-8 pt-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mb-4 text-xl font-extrabold",
				children: "تاریخچه"
			}), expenses.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-3xl bg-surface px-4 py-10 text-center text-sm text-muted shadow-card",
				children: "هنوز هزینه‌ای ثبت نشده"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col gap-2",
				children: expenses.map((e) => {
					const g = gatherings.find((x) => x.id === e.gatheringId);
					const payer = people.find((p) => p.id === e.payerId);
					if (!g) return null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/g/$id",
						params: { id: g.id },
						className: "flex items-center gap-3 rounded-3xl bg-surface px-3 py-3 shadow-card",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryIcon, { category: e.category }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate font-bold",
									children: e.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted",
									children: [
										g.name,
										" · ",
										formatWhen(e.date)
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-extrabold tabular",
								children: formatMoney(e.amount)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-muted",
								children: currencyLabel(g.currency)
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAvatar, {
								person: payer,
								size: 32
							})
						]
					}, e.id);
				})
			})]
		})
	});
}
var SplitComponent = HistoryScreen;
//#endregion
export { SplitComponent as component };
