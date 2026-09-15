import { i as __toESM } from "../_runtime.mjs";
import { S as useParams, W as require_react, b as useNavigate, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { O as FileText, P as Calendar, S as List, a as User, g as Scale, h as ScanLine, i as Users, n as Wallet } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as CATEGORIES, l as TopBar, n as makeDraft, r as useDang, s as AppScreen } from "./router-DVGuM8Ia.mjs";
import { n as PersonAvatar, r as youName, t as AvatarStack } from "./person-BeSrLKWO.mjs";
import { t as Button } from "./button-bgaJ7srM.mjs";
import { t as Sheet } from "./sheet-BHnFOhSw.mjs";
import { a as formatJalaliPretty, c as gregorianFromJalali, d as parseAmount, i as formatJalali, l as jalaliParts, o as formatMoney, r as currencyLabel, t as MONTHS, u as monthLength } from "./format-Bi7-O-sI.mjs";
import { n as equalPercents } from "./settle-DOh7cCQm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/g._id.add-Rcq0xtGr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AddExpenseScreen() {
	const { id } = useParams({ strict: false });
	const navigate = useNavigate();
	const gathering = useDang((s) => s.gatherings.find((g) => g.id === id));
	const people = useDang((s) => s.people);
	const draft = useDang((s) => s.draft);
	const patchDraft = useDang((s) => s.patchDraft);
	const addExpense = useDang((s) => s.addExpense);
	const setDraft = useDang((s) => s.setDraft);
	const [payerOpen, setPayerOpen] = (0, import_react.useState)(false);
	const [partsOpen, setPartsOpen] = (0, import_react.useState)(false);
	const [dateOpen, setDateOpen] = (0, import_react.useState)(false);
	const [catOpen, setCatOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!gathering) return;
		if (draft && draft.gatheringId === id) return;
		const me = people.find((p) => p.isMe);
		setDraft(makeDraft(id, {
			payerId: me && gathering.memberIds.includes(me.id) ? me.id : gathering.memberIds[0],
			participantIds: gathering.memberIds
		}));
	}, [
		id,
		gathering,
		draft,
		people,
		setDraft
	]);
	const members = (0, import_react.useMemo)(() => {
		if (!gathering) return [];
		return gathering.memberIds.map((pid) => people.find((p) => p.id === pid)).filter((p) => !!p);
	}, [gathering, people]);
	if (!gathering) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppScreen, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
		title: "هزینه",
		onBack: () => navigate({ to: "/" })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "px-5 text-sm text-muted",
		children: "این دورهمی پیدا نشد."
	})] });
	if (!draft || draft.gatheringId !== id) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppScreen, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
		title: "هزینه",
		onBack: () => navigate({
			to: "/g/$id",
			params: { id }
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "px-5 text-sm text-muted",
		children: "در حال آماده‌سازی فرم..."
	})] });
	const payer = people.find((p) => p.id === draft.payerId);
	const selected = members.filter((m) => draft.participantIds.includes(m.id));
	const unit = currencyLabel(gathering.currency);
	function saveEqual() {
		if (!draft || !gathering) return;
		if (!draft.title.trim() || draft.amount <= 0) {
			toast.error("عنوان و مبلغ را وارد کن");
			return;
		}
		if (draft.participantIds.length === 0) {
			toast.error("حداقل یک نفر را انتخاب کن");
			return;
		}
		if (draft.split === "unequal") {
			patchDraft({ shares: equalPercents(draft.participantIds) });
			navigate({
				to: "/g/$id/split",
				params: { id: gathering.id },
				search: { from: "add" }
			});
			return;
		}
		addExpense({
			gatheringId: gathering.id,
			title: draft.title.trim(),
			amount: draft.amount,
			category: draft.category,
			payerId: draft.payerId,
			participantIds: draft.participantIds,
			split: "equal",
			note: draft.note || void 0,
			date: draft.date,
			receiptImage: draft.receiptImage
		});
		setDraft(null);
		toast.success("هزینه ثبت شد");
		navigate({
			to: "/g/$id",
			params: { id: gathering.id }
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppScreen, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
			title: "نوشتن هزینه",
			subtitle: "هزینه جدید را به این دورهمی اضافه کنید",
			onBack: () => navigate({
				to: "/g/$id",
				params: { id }
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-5 pb-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "overflow-hidden rounded-3xl bg-surface shadow-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, { className: "size-4" }),
							label: "عنوان هزینه",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: draft.title,
								onChange: (e) => patchDraft({ title: e.target.value }),
								placeholder: "شام",
								className: "w-full bg-transparent text-[15px] font-semibold outline-none"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-4" }),
							label: "مبلغ",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex min-w-0 items-center justify-end gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									inputMode: "numeric",
									dir: "ltr",
									value: draft.amount ? formatMoney(draft.amount) : "",
									onChange: (e) => patchDraft({ amount: parseAmount(e.target.value) }),
									placeholder: "0",
									className: "min-w-0 flex-1 bg-transparent text-start text-[15px] font-semibold tabular outline-none"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "shrink-0 text-xs text-muted",
									children: unit
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-4" }),
							label: "پرداخت‌کننده",
							onClick: () => setPayerOpen(true),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center justify-end gap-2 font-semibold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: youName(payer) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAvatar, {
									person: payer,
									size: 28
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "size-4" }),
							label: "تاریخ",
							onClick: () => setDateOpen(true),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-sm font-semibold",
								children: [isToday(draft.date) ? "امروز — " : "", formatJalali(draft.date)]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4" }),
							label: "شرکت‌کننده‌ها",
							onClick: () => setPartsOpen(true),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center justify-end gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-muted",
									children: [selected.length, " نفر انتخاب شده"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarStack, {
									people: selected,
									max: 4,
									size: 26
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scale, { className: "size-4" }),
							label: "روش تقسیم",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex rounded-full bg-track p-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => patchDraft({ split: "equal" }),
									className: chip(draft.split === "equal", true),
									children: "مساوی"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => patchDraft({ split: "unequal" }),
									className: chip(draft.split === "unequal"),
									children: "نابرابر"
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-4" }),
							label: "یادداشت (اختیاری)",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: draft.note,
								onChange: (e) => patchDraft({ note: e.target.value }),
								placeholder: "مثلاً شام در رستوران خوب",
								className: "w-full bg-transparent text-sm outline-none"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setCatOpen(true),
							className: "flex w-full items-center justify-between px-4 py-3 text-sm text-muted",
							children: ["دسته: ", CATEGORIES.find((c) => c.id === draft.category)?.label]
						})
					]
				}),
				draft.receiptImage ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 overflow-hidden rounded-3xl bg-surface shadow-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: draft.receiptImage,
						alt: "رسید",
						className: "h-28 w-full object-cover"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-4 py-2 text-xs text-muted",
						children: "رسید پیوست‌شده"
					})]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "flex-[1.3]",
						onClick: saveEqual,
						children: draft.split === "unequal" ? "ادامه — تقسیم نابرابر" : "ثبت هزینه"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "lavender",
						className: "flex-1",
						onClick: () => navigate({
							to: "/scan",
							search: { g: gathering.id }
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanLine, { className: "size-4" }), "اسکن رسید"]
					})]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
			open: payerOpen,
			onClose: () => setPayerOpen(false),
			title: "پرداخت‌کننده",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col",
				children: members.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "flex items-center gap-3 rounded-2xl px-2 py-2.5",
					onClick: () => {
						patchDraft({ payerId: m.id });
						setPayerOpen(false);
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAvatar, {
							person: m,
							size: 40
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex-1 font-semibold",
							children: youName(m)
						}),
						draft.payerId === m.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-primary",
							children: "انتخاب‌شده"
						}) : null
					]
				}, m.id))
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
			open: partsOpen,
			onClose: () => setPartsOpen(false),
			title: "چه کسانی سهیم‌اند؟",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col",
				children: members.map((m) => {
					const on = draft.participantIds.includes(m.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "flex items-center gap-3 rounded-2xl px-2 py-2.5",
						onClick: () => {
							const next = on ? draft.participantIds.filter((x) => x !== m.id) : [...draft.participantIds, m.id];
							patchDraft({ participantIds: next });
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAvatar, {
								person: m,
								size: 40
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex-1 font-semibold",
								children: youName(m)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `flex size-6 items-center justify-center rounded-full border ${on ? "border-primary bg-primary text-[10px] text-primary-fg" : "border-border"}`,
								children: on ? "✓" : ""
							})
						]
					}, m.id);
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				block: true,
				className: "mt-4",
				onClick: () => setPartsOpen(false),
				children: "تأیید"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
			open: dateOpen,
			onClose: () => setDateOpen(false),
			title: "تاریخ",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JalaliPicker, {
				value: draft.date,
				onChange: (ts) => {
					patchDraft({ date: ts });
					setDateOpen(false);
				}
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
			open: catOpen,
			onClose: () => setCatOpen(false),
			title: "دسته‌بندی",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-2",
				children: CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						patchDraft({ category: c.id });
						setCatOpen(false);
					},
					className: `rounded-2xl px-3 py-3 text-sm font-semibold ${draft.category === c.id ? "bg-primary text-primary-fg" : "bg-bg"}`,
					children: c.label
				}, c.id))
			})
		})
	] });
}
function chip(active, green = false) {
	return `rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${active ? green ? "bg-primary text-primary-fg" : "bg-surface text-fg shadow-sm" : "text-muted"}`;
}
function Row({ icon, label, children, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(onClick ? "button" : "div", {
		type: onClick ? "button" : void 0,
		onClick,
		className: "flex w-full items-center gap-3 border-b border-border px-4 py-3.5 last:border-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex size-9 shrink-0 items-center justify-center rounded-xl bg-bg text-muted",
				children: icon
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "shrink-0 text-sm text-muted",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-w-0 flex-1",
				children
			})
		]
	});
}
function isToday(ts) {
	const a = new Date(ts);
	const b = /* @__PURE__ */ new Date();
	return a.toDateString() === b.toDateString();
}
function JalaliPicker({ value, onChange }) {
	const cur = jalaliParts(value);
	const [jy, setJy] = (0, import_react.useState)(cur.jy);
	const [jm, setJm] = (0, import_react.useState)(cur.jm);
	const len = monthLength(jy, jm);
	const days = Array.from({ length: len }, (_, i) => i + 1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex items-center justify-between",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "px-3 py-2 text-sm",
					onClick: () => {
						if (jm === 1) {
							setJm(12);
							setJy(jy - 1);
						} else setJm(jm - 1);
					},
					children: "قبلی"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-bold",
					children: [
						MONTHS[jm - 1],
						" ",
						jy
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "px-3 py-2 text-sm",
					onClick: () => {
						if (jm === 12) {
							setJm(1);
							setJy(jy + 1);
						} else setJm(jm + 1);
					},
					children: "بعدی"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-7 gap-1",
			children: days.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => onChange(gregorianFromJalali(jy, jm, d).getTime()),
				className: `rounded-xl py-2 text-sm ${cur.jy === jy && cur.jm === jm && cur.jd === d ? "bg-primary text-primary-fg" : "bg-bg"}`,
				children: d
			}, d))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-center text-xs text-muted",
			children: formatJalaliPretty(value)
		})
	] });
}
var SplitComponent = AddExpenseScreen;
//#endregion
export { SplitComponent as component };
