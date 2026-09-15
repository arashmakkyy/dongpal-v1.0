import { i as __toESM } from "../_runtime.mjs";
import { S as useParams, W as require_react, b as useNavigate, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as Link2, O as FileText, c as Trash2, d as Share2, f as Settings, g as Scale, h as ScanLine, i as Users, y as Plus } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { l as TopBar, n as makeDraft, r as useDang, s as AppScreen } from "./router-DVGuM8Ia.mjs";
import { n as PersonAvatar, r as youName, t as AvatarStack } from "./person-BeSrLKWO.mjs";
import { t as Button } from "./button-bgaJ7srM.mjs";
import { t as Sheet } from "./sheet-BHnFOhSw.mjs";
import { o as formatMoney, r as currencyLabel, s as formatWhen } from "./format-Bi7-O-sI.mjs";
import { n as equalPercents, r as gatheringTotal } from "./settle-DOh7cCQm.mjs";
import { t as CategoryIcon } from "./category-icon-CI0NNpmM.mjs";
import { i as packFromState, n as encodePack, r as joinUrl } from "./pack-DkU-FWOd.mjs";
import { c as tgLink, l as waLink, n as copyText, r as nativeShare } from "./share-DvHM8VOG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/gathering-screen-Br2gZ-xX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function GatheringScreen() {
	const { id } = useParams({ strict: false });
	const navigate = useNavigate();
	const gathering = useDang((s) => s.gatherings.find((g) => g.id === id));
	const allExpenses = useDang((s) => s.expenses);
	const people = useDang((s) => s.people);
	const setDraft = useDang((s) => s.setDraft);
	const deleteGathering = useDang((s) => s.deleteGathering);
	const [menu, setMenu] = (0, import_react.useState)(false);
	const [shareOpen, setShareOpen] = (0, import_react.useState)(false);
	const expenses = allExpenses.filter((e) => e.gatheringId === id).sort((a, b) => b.date - a.date);
	if (!gathering) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppScreen, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
		title: "پیدا نشد",
		onBack: () => navigate({ to: "/" })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "px-5 text-sm text-muted",
		children: "این دورهمی وجود ندارد."
	})] });
	const members = gathering.memberIds.map((pid) => people.find((p) => p.id === pid)).filter((p) => !!p);
	const total = gatheringTotal(expenses);
	const me = people.find((p) => p.isMe) ?? people[0];
	const shareLink = joinUrl(encodePack(packFromState(gathering, people, expenses)));
	const shareText = `بیا تو دورهمی «${gathering.name}» توی دنگ‌پال. لینک دعوت:\n${shareLink}`;
	function startAdd() {
		const payerId = me && gathering.memberIds.includes(me.id) ? me.id : gathering.memberIds[0];
		setDraft(makeDraft(gathering.id, {
			payerId,
			participantIds: gathering.memberIds
		}));
		navigate({
			to: "/g/$id/add",
			params: { id: gathering.id }
		});
	}
	function startUnequal() {
		const payerId = me && gathering.memberIds.includes(me.id) ? me.id : gathering.memberIds[0];
		setDraft({
			...makeDraft(gathering.id, {
				payerId,
				participantIds: gathering.memberIds
			}),
			title: "تقسیم نابرابر",
			amount: 0,
			split: "unequal",
			shares: equalPercents(gathering.memberIds)
		});
		navigate({
			to: "/g/$id/split",
			params: { id: gathering.id },
			search: { from: void 0 }
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppScreen, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
			title: gathering.name,
			onBack: () => navigate({ to: "/" }),
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "flex size-11 items-center justify-center",
				onClick: () => setShareOpen(true),
				"aria-label": "دعوت دوست",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-5 text-muted" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "flex size-11 items-center justify-center",
				onClick: () => setMenu(true),
				"aria-label": "تنظیمات دورهمی",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-5 text-muted" })
			})] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-5 pb-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GatheringHero, {
					cover: gathering.cover,
					total,
					unit: currencyLabel(gathering.currency),
					members,
					expenseCount: expenses.length
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 grid grid-cols-3 gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionTile, {
							label: "نوشتن هزینه",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-5" }),
							tone: "primary",
							onClick: startAdd
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionTile, {
							label: "اسکن رسید",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanLine, { className: "size-5" }),
							tone: "soft",
							onClick: () => navigate({
								to: "/scan",
								search: { g: gathering.id }
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionTile, {
							label: "تقسیم نابرابر",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scale, { className: "size-5" }),
							tone: "lavender",
							onClick: startUnequal
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-bold",
						children: "آخرین هزینه‌ها"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-xs font-medium text-primary",
						onClick: () => navigate({
							to: "/g/$id/expenses",
							params: { id: gathering.id }
						}),
						children: "مشاهده همه"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex flex-col gap-2",
					children: expenses.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rounded-3xl bg-surface px-4 py-8 text-center text-sm text-muted shadow-card",
						children: "هنوز هزینه‌ای ثبت نشده"
					}) : expenses.slice(0, 6).map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExpenseRow, {
						expense: e,
						payer: people.find((p) => p.id === e.payerId),
						currency: gathering.currency
					}, e.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					block: true,
					className: "mt-6",
					onClick: () => navigate({
						to: "/g/$id/settle",
						params: { id: gathering.id }
					}),
					children: "تسویه حساب"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
			open: menu,
			onClose: () => setMenu(false),
			title: "تنظیمات دورهمی",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "flex w-full items-center gap-3 rounded-2xl px-2 py-3 text-sm",
					onClick: () => {
						setMenu(false);
						setShareOpen(true);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-4 text-muted" }), "دعوت با لینک"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "flex w-full items-center gap-3 rounded-2xl px-2 py-3 text-sm",
					onClick: () => {
						setMenu(false);
						navigate({
							to: "/g/$id/expenses",
							params: { id: gathering.id }
						});
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-4 text-muted" }), "همه هزینه‌ها"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "flex w-full items-center gap-3 rounded-2xl px-2 py-3 text-sm text-danger",
					onClick: () => {
						deleteGathering(gathering.id);
						navigate({ to: "/" });
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), "حذف دورهمی"]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
			open: shareOpen,
			onClose: () => setShareOpen(false),
			title: "دعوت به دورهمی",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-4 text-sm text-muted",
					children: "لینک را برای دوستت بفرست. وقتی باز کند ازش می‌پرسیم کدوم عضو است تا سهم‌ها به‌اسم «تو» دیده شود."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					block: true,
					onClick: async () => {
						if (!await nativeShare(gathering.name, shareText, shareLink)) {
							await copyText(shareLink);
							toast.success("لینک کپی شد");
						}
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-4" }), "اشتراک‌گذاری لینک"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					block: true,
					className: "mt-2",
					onClick: async () => {
						await copyText(shareLink);
						toast.success("لینک کپی شد");
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "size-4" }), "کپی لینک دعوت"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: waLink(shareText),
						target: "_blank",
						rel: "noreferrer",
						className: "flex h-11 items-center justify-center rounded-2xl bg-[#E8F8EF] text-sm font-bold text-[#1FAD66]",
						children: "واتساپ"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: tgLink(shareText),
						target: "_blank",
						rel: "noreferrer",
						className: "flex h-11 items-center justify-center rounded-2xl bg-[#E7F3FE] text-sm font-bold text-[#2A9EDC]",
						children: "تلگرام"
					})]
				})
			]
		})
	] });
}
function GatheringHero({ cover, total, unit, members, expenseCount }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "overflow-hidden rounded-[28px] bg-surface shadow-card",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: cover,
					alt: "",
					className: "h-[132px] w-full object-cover"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute inset-x-3 bottom-3 flex items-end justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-fg shadow-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-3.5 text-primary" }),
							members.length,
							" نفر"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-fg shadow-sm",
						children: [expenseCount, " هزینه"]
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-end justify-between gap-3 px-4 pb-4 pt-3.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-medium text-muted",
					children: "جمع هزینه‌ها"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-1 flex items-end gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[30px] font-extrabold leading-none tracking-tight tabular",
						children: formatMoney(total)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mb-0.5 rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-bold text-primary",
						children: unit
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarStack, {
				people: members,
				max: 6,
				size: 32
			})]
		})]
	});
}
function ActionTile({ label, icon, tone, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: `flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-3xl px-2 text-center text-[12px] font-semibold transition-transform active:scale-[0.96] ${tone === "primary" ? "bg-primary text-primary-fg" : tone === "lavender" ? "bg-accent-soft text-accent" : "bg-chip text-accent"}`,
		children: [icon, label]
	});
}
function ExpenseRow({ expense, payer }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3 rounded-3xl bg-surface px-3 py-3 shadow-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryIcon, { category: expense.category }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate font-bold",
						children: expense.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "tabular text-[15px] font-extrabold",
						children: formatMoney(expense.amount)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-0.5 flex items-center justify-between gap-2 text-xs text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["پرداخت توسط ", youName(payer)] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatWhen(expense.date) })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAvatar, {
				person: payer,
				size: 36
			})
		]
	});
}
//#endregion
export { GatheringScreen as n, ExpenseRow as t };
