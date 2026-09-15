import { i as __toESM } from "../_runtime.mjs";
import { W as require_react, b as useNavigate, w as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { j as ChevronLeft, m as Search, y as Plus } from "../_libs/lucide-react.mjs";
import { r as useDang, s as AppScreen } from "./router-DVGuM8Ia.mjs";
import { t as AvatarStack } from "./person-BeSrLKWO.mjs";
import { t as Button } from "./button-bgaJ7srM.mjs";
import { o as formatMoney, r as currencyLabel } from "./format-Bi7-O-sI.mjs";
import { r as gatheringTotal } from "./settle-DOh7cCQm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/gatherings-3j_KxsuP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function GatheringsScreen() {
	const navigate = useNavigate();
	const allGatherings = useDang((s) => s.gatherings);
	const expenses = useDang((s) => s.expenses);
	const people = useDang((s) => s.people);
	const [q, setQ] = (0, import_react.useState)("");
	const gatherings = allGatherings.filter((g) => !g.archived);
	const filtered = (0, import_react.useMemo)(() => gatherings.filter((g) => g.name.includes(q.trim()) || !q.trim()), [gatherings, q]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppScreen, {
		nav: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-5 pb-8 pt-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mb-4 text-xl font-extrabold",
					children: "دورهمی‌ها"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex items-center gap-2 rounded-2xl bg-surface px-3 py-2.5 shadow-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4 text-muted" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: q,
						onChange: (e) => setQ(e.target.value),
						placeholder: "جستجو",
						className: "w-full bg-transparent text-sm outline-none"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-col gap-2",
					children: filtered.map((g) => {
						const ex = expenses.filter((e) => e.gatheringId === g.id);
						const members = g.memberIds.map((id) => people.find((p) => p.id === id)).filter((p) => !!p);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/g/$id",
							params: { id: g.id },
							className: "flex items-center gap-3 rounded-3xl bg-surface p-3 shadow-card",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: g.cover,
									alt: "",
									className: "size-14 rounded-2xl object-cover"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate font-bold",
											children: g.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-muted",
											children: [
												members.length,
												" نفر · ",
												ex.length,
												" هزینه"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[10px] font-medium leading-none text-muted",
												children: "جمع هزینه"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-1 flex items-baseline gap-1 whitespace-nowrap",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", {
													className: "text-[14px] font-extrabold leading-none tabular text-fg",
													children: formatMoney(gatheringTotal(ex))
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "rounded-full bg-primary-soft px-1.5 py-0.5 text-[10px] font-bold text-primary",
													children: currencyLabel(g.currency)
												})]
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarStack, {
									people: members,
									max: 3,
									size: 24
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4 text-subtle" })
							]
						}, g.id);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					block: true,
					className: "mt-5",
					onClick: () => navigate({ to: "/new" }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "دورهمی جدید"]
				})
			]
		})
	});
}
var SplitComponent = GatheringsScreen;
//#endregion
export { SplitComponent as component };
