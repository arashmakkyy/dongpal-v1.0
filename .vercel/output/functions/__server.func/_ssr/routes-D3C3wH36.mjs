import { b as useNavigate, w as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { f as Settings, h as ScanLine, j as ChevronLeft, l as Sparkles, y as Plus } from "../_libs/lucide-react.mjs";
import { c as HeartMark, r as useDang, s as AppScreen } from "./router-DVGuM8Ia.mjs";
import { t as AvatarStack } from "./person-BeSrLKWO.mjs";
import { t as Button } from "./button-bgaJ7srM.mjs";
import { o as formatMoney, r as currencyLabel } from "./format-Bi7-O-sI.mjs";
import { r as gatheringTotal } from "./settle-DOh7cCQm.mjs";
import { t as WelcomeScreen } from "./welcome-screen-DLHxirrF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-D3C3wH36.js
var import_jsx_runtime = require_jsx_runtime();
function HomeScreen() {
	const navigate = useNavigate();
	const allGatherings = useDang((s) => s.gatherings);
	const expenses = useDang((s) => s.expenses);
	const people = useDang((s) => s.people);
	const seen = useDang((s) => s.profile.seenWelcome);
	const gatherings = allGatherings.filter((g) => !g.archived);
	if (!seen) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WelcomeScreen, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppScreen, {
		nav: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-5 pb-8 pt-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "mb-5 flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-[32px] font-extrabold leading-none text-primary",
						children: "دنگ‌پال"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 flex items-center gap-1 text-sm text-fg",
						children: ["خرج‌ها رو گروهی مدیریت کن", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeartMark, {})]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/more",
						className: "flex size-11 shrink-0 items-center justify-center rounded-2xl bg-surface text-muted shadow-card",
						"aria-label": "تنظیمات",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-5" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => navigate({ to: "/quick" }),
					className: "mb-5 flex w-full items-center gap-3 rounded-3xl bg-accent-soft px-4 py-3 transition-transform active:scale-[0.98]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex size-10 shrink-0 items-center justify-center rounded-2xl bg-surface text-accent",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-sm font-bold text-accent",
								children: "تقسیم سریع حساب"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted",
								children: "رستوران، تاکسی، بدون ساختن دورهمی"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4 shrink-0 text-accent" })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-bold text-fg",
						children: "دورهمی‌های من"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/gatherings",
						className: "text-xs font-medium text-primary",
						children: "همه"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-col gap-3",
					children: gatherings.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyGatherings, {}) : gatherings.map((g, i) => {
						const ex = expenses.filter((e) => e.gatheringId === g.id);
						const members = g.memberIds.map((pid) => people.find((p) => p.id === pid)).filter((p) => !!p);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GatheringCard, {
							gathering: g,
							total: gatheringTotal(ex),
							expenseCount: ex.length,
							members,
							delay: i * 40
						}, g.id);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					block: true,
					className: "mt-5",
					onClick: () => navigate({ to: "/new" }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-5" }), "دورهمی جدید"]
				})
			]
		})
	});
}
function EmptyGatherings() {
	const navigate = useNavigate();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-3xl bg-surface px-5 py-10 text-center shadow-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-bold",
				children: "هنوز دورهمی نداری"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "یک سفر، تولد یا شام دوستانه بساز و هزینه‌ها را اضافه کن."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					block: true,
					size: "md",
					onClick: () => navigate({ to: "/new" }),
					children: "بساز"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					block: true,
					size: "md",
					variant: "outline",
					onClick: () => navigate({
						to: "/scan",
						search: { g: void 0 }
					}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanLine, { className: "size-4" }), "اسکن رسید"]
				})]
			})
		]
	});
}
function GatheringCard({ gathering, total, expenseCount, members, delay }) {
	const unit = currencyLabel(gathering.currency);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/g/$id",
		params: { id: gathering.id },
		className: "anim-fade-up flex items-center gap-3 rounded-3xl bg-surface p-3 shadow-card transition-transform active:scale-[0.98]",
		style: { animationDelay: `${delay}ms` },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: gathering.cover,
			alt: "",
			className: "size-[72px] shrink-0 rounded-2xl object-cover"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 flex-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "truncate text-[15px] font-bold",
						children: gathering.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "mt-0.5 size-4 shrink-0 text-subtle" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-0.5 text-xs text-muted",
					children: [
						members.length,
						" نفر · ",
						expenseCount,
						" هزینه"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarStack, {
						people: members,
						max: 3,
						size: 26
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyChip, {
						amount: total,
						unit
					})]
				})
			]
		})]
	});
}
function MoneyChip({ amount, unit }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0 shrink-0 text-end",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[10px] font-medium leading-none text-muted",
			children: "جمع هزینه"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-1 flex items-baseline gap-1 whitespace-nowrap",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", {
				className: "text-[15px] font-extrabold leading-none tabular text-fg",
				children: formatMoney(amount)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "rounded-full bg-primary-soft px-1.5 py-0.5 text-[10px] font-bold text-primary",
				children: unit
			})]
		})]
	});
}
var SplitComponent = HomeScreen;
//#endregion
export { SplitComponent as component };
