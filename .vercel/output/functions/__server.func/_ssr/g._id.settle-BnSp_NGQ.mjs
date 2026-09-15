import { S as useParams, b as useNavigate, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { M as Check, d as Share2, j as ChevronLeft } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { c as HeartMark, l as TopBar, r as useDang, s as AppScreen } from "./router-DVGuM8Ia.mjs";
import { n as PersonAvatar, r as youName } from "./person-BeSrLKWO.mjs";
import { t as Button } from "./button-bgaJ7srM.mjs";
import { o as formatMoney, r as currencyLabel } from "./format-Bi7-O-sI.mjs";
import { a as nets, i as minimizeTransfers, r as gatheringTotal } from "./settle-DOh7cCQm.mjs";
import { o as settlementText } from "./share-DvHM8VOG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/g._id.settle-BnSp_NGQ.js
var import_jsx_runtime = require_jsx_runtime();
function SettleScreen() {
	const { id } = useParams({ strict: false });
	const navigate = useNavigate();
	const gathering = useDang((s) => s.gatherings.find((g) => g.id === id));
	const allExpenses = useDang((s) => s.expenses);
	const people = useDang((s) => s.people);
	const expenses = allExpenses.filter((e) => e.gatheringId === id);
	if (!gathering) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppScreen, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
		title: "تسویه",
		onBack: () => navigate({ to: "/" })
	}) });
	const members = gathering.memberIds.map((pid) => people.find((p) => p.id === pid)).filter((p) => !!p);
	const net = nets(gathering.memberIds, expenses);
	const transfers = minimizeTransfers(net);
	const total = gatheringTotal(expenses);
	const unit = currencyLabel(gathering.currency);
	const settled = transfers.length === 0 && expenses.length > 0;
	const text = settlementText({
		gathering,
		people,
		transfers,
		total,
		currency: gathering.currency
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppScreen, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
		title: "تسویه حساب",
		subtitle: "وضعیت نهایی هر نفر در این دورهمی",
		onBack: () => navigate({
			to: "/g/$id",
			params: { id }
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 pb-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-3",
				children: members.map((m) => {
					const v = net[m.id] ?? 0;
					const positive = v > 1;
					const negative = v < -1;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center rounded-3xl bg-surface px-3 py-4 shadow-card",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAvatar, {
								person: m,
								size: 56
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm font-bold",
								children: youName(m)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: `mt-1 text-[15px] font-extrabold tabular ${positive ? "text-primary" : negative ? "text-danger" : "text-muted"}`,
								children: [positive ? "+" : negative ? "−" : "", formatMoney(Math.abs(v))]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 text-[11px] text-muted",
								children: positive ? "دریافت می‌کند" : negative ? "بدهکار است" : "تسویه"
							})
						]
					}, m.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-6 text-sm font-bold",
				children: "چه کسی به چه کسی بدهکار است؟"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-col gap-2",
				children: transfers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-3xl bg-surface px-4 py-6 text-center text-sm text-muted shadow-card",
					children: expenses.length === 0 ? "هنوز هزینه‌ای نیست" : "هیچ بدهی باقی نمانده"
				}) : transfers.map((t) => {
					const from = people.find((p) => p.id === t.fromId);
					const to = people.find((p) => p.id === t.toId);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => navigate({
							to: "/g/$id/remind",
							params: { id },
							search: {
								from: t.fromId,
								to: t.toId,
								amount: String(t.amount)
							}
						}),
						className: "flex items-center gap-3 rounded-3xl bg-surface px-3 py-3 shadow-card",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAvatar, {
								person: from,
								size: 40
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-bold",
									children: youName(from)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted",
									children: [
										"باید ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", {
											className: "tabular",
											children: formatMoney(t.amount)
										}),
										" ",
										unit,
										" به ",
										youName(to),
										" بدهد"
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4 text-subtle" })
						]
					}, `${t.fromId}-${t.toId}`);
				})
			}),
			settled || transfers.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex items-center gap-2 rounded-3xl bg-success-soft px-4 py-3 text-sm font-semibold text-primary",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex size-8 items-center justify-center rounded-full bg-surface text-primary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-1",
					children: [settled ? "همه‌چیز آماده‌ست!" : "موجودی‌ها با هم برابر می‌شود", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeartMark, { className: "size-3.5" })]
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "accent",
				block: true,
				className: "mt-6",
				onClick: async () => {
					try {
						await navigator.clipboard.writeText(text);
						toast.success("متن تسویه کپی شد");
					} catch {
						toast.error("کپی نشد");
					}
					navigate({
						to: "/g/$id/remind",
						params: { id },
						search: transfers[0] ? {
							from: transfers[0].fromId,
							to: transfers[0].toId,
							amount: String(transfers[0].amount)
						} : {
							from: void 0,
							to: void 0,
							amount: void 0
						}
					});
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-4" }), "اشتراک‌گذاری نتیجه"]
			})
		]
	})] });
}
var SplitComponent = SettleScreen;
//#endregion
export { SplitComponent as component };
