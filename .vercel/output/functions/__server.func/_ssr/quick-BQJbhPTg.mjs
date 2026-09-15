import { i as __toESM } from "../_runtime.mjs";
import { W as require_react, b as useNavigate, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as Link2, M as Check, b as Minus, k as Copy, v as QrCode, y as Plus } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { c as HeartMark, l as TopBar, r as useDang, s as AppScreen } from "./router-DVGuM8Ia.mjs";
import { n as PersonAvatar } from "./person-BeSrLKWO.mjs";
import { t as Button } from "./button-bgaJ7srM.mjs";
import { d as parseAmount, o as formatMoney, r as currencyLabel } from "./format-Bi7-O-sI.mjs";
import { n as equalPercents, t as allocate } from "./settle-DOh7cCQm.mjs";
import { c as tgLink, i as quickSplitText, l as waLink, n as copyText, r as nativeShare, s as smsLink } from "./share-DvHM8VOG.mjs";
import { n as UnequalSliders, t as SPLIT_THUMB } from "./unequal-sliders-Hm71MXqE.mjs";
import { t as CurrencyPicker } from "./currency-picker-4gCpSRia.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/quick-BQJbhPTg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function QuickScreen() {
	const navigate = useNavigate();
	const people = useDang((s) => s.people);
	const profile = useDang((s) => s.profile);
	const [step, setStep] = (0, import_react.useState)("form");
	const [amount, setAmount] = (0, import_react.useState)(245e4);
	const [currency, setCurrency] = (0, import_react.useState)(profile.defaultCurrency);
	const [count, setCount] = (0, import_react.useState)(4);
	const [tip, setTip] = (0, import_react.useState)(0);
	const [tax, setTax] = (0, import_react.useState)(0);
	const friends = people.slice(0, Math.max(count, 1));
	const names = (0, import_react.useMemo)(() => {
		const list = friends.map((p) => p.name);
		while (list.length < count) list.push(`نفر ${list.length + 1}`);
		return list.slice(0, count);
	}, [friends, count]);
	const ids = names.map((_, i) => `q-${i}`);
	const [shares, setShares] = (0, import_react.useState)({});
	const grand = Math.round(amount * (1 + tip / 100 + tax / 100));
	(0, import_react.useEffect)(() => {
		const next = Array.from({ length: count }, (_, i) => `q-${i}`);
		setShares(equalPercents(next));
	}, [count]);
	const percents = Object.keys(shares).length ? shares : equalPercents(ids);
	const rows = ids.map((id, i) => ({
		id,
		name: names[i],
		person: friends[i],
		percent: percents[id] ?? 0,
		amount: allocate(grand, ids, percents)[id] ?? 0
	}));
	const text = quickSplitText({
		rows: rows.map((r) => ({
			name: r.name,
			amount: r.amount
		})),
		total: grand,
		currency
	});
	function startEqual() {
		setShares(equalPercents(ids));
		setStep("result");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppScreen, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
			title: step === "result" ? "نتیجه تقسیم" : step === "unequal" ? "تقسیم نابرابر" : "تقسیم سریع",
			subtitle: step === "result" ? "همه‌چیز آماده‌ست!" : void 0,
			onBack: () => {
				if (step === "result") setStep("form");
				else if (step === "unequal") setStep("form");
				else navigate({ to: "/" });
			}
		}),
		step === "form" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-5 pb-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-3xl bg-surface p-5 shadow-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "مبلغ کل"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							inputMode: "numeric",
							dir: "ltr",
							value: amount ? formatMoney(amount) : "",
							onChange: (e) => setAmount(parseAmount(e.target.value)),
							className: "mt-1 w-full bg-transparent text-[34px] font-extrabold tabular outline-none"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: currencyLabel(currency)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CurrencyPicker, {
							className: "mt-4",
							value: currency,
							onChange: setCurrency
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex items-center justify-between rounded-3xl bg-surface px-4 py-3 shadow-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm text-muted",
						children: "تعداد نفرات"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "flex size-10 items-center justify-center rounded-2xl bg-bg",
								onClick: () => setCount((n) => Math.max(2, n - 1)),
								"aria-label": "کم کردن",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-6 text-center text-lg font-extrabold tabular",
								children: count
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-fg",
								onClick: () => setCount((n) => Math.min(12, n + 1)),
								"aria-label": "اضافه کردن",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PercentBox, {
						label: "انعام (اختیاری)",
						value: tip,
						onChange: setTip
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PercentBox, {
						label: "مالیات (اختیاری)",
						value: tax,
						onChange: setTax
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 rounded-3xl bg-surface px-4 py-3 text-sm shadow-card",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "جمع نهایی" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-bold text-fg",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", {
									className: "tabular",
									children: formatMoney(grand)
								}),
								" ",
								currencyLabel(currency)
							]
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					block: true,
					className: "mt-5",
					onClick: startEqual,
					children: "تقسیم کن"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "soft",
					block: true,
					className: "mt-2",
					onClick: () => {
						setShares(equalPercents(ids));
						setStep("unequal");
					},
					children: "تقسیم نابرابر"
				})
			]
		}),
		step === "unequal" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-5 pb-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnequalSliders, {
				rows: rows.map((r) => ({
					id: r.id,
					name: r.name,
					person: r.person,
					percent: r.percent,
					amount: r.amount,
					color: r.person ? SPLIT_THUMB[r.person.color] : "#0e9f86"
				})),
				unit: currencyLabel(currency),
				total: grand,
				onSharesChange: setShares,
				onEqualize: () => setShares(equalPercents(ids))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				block: true,
				className: "mt-3 rounded-[22px]",
				onClick: () => setStep("result"),
				children: "تأیید تقسیم"
			})]
		}),
		step === "result" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Result, {
			rows,
			grand,
			currency,
			text
		})
	] });
}
function PercentBox({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-3xl bg-surface px-3 py-3 shadow-card",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-1 flex items-center justify-between",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "size-8 rounded-xl bg-bg",
					onClick: () => onChange(Math.max(0, value - 1)),
					children: "−"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-extrabold tabular",
					children: [value, "%"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "size-8 rounded-xl bg-bg",
					onClick: () => onChange(Math.min(40, value + 1)),
					children: "+"
				})
			]
		})]
	});
}
function Result({ rows, grand, currency, text }) {
	const [qr, setQr] = (0, import_react.useState)(null);
	const cardRef = (0, import_react.useRef)(null);
	async function showQr() {
		const url = await (await import("../_libs/qrcode.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()))).toDataURL(text, {
			margin: 1,
			width: 280
		});
		setQr(url);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 pb-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: cardRef,
				className: "rounded-3xl bg-success-soft px-4 py-3 text-sm font-semibold text-primary",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex size-8 items-center justify-center rounded-full bg-surface",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" })
						}),
						"تقسیم با موفقیت انجام شد",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeartMark, {})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex flex-col gap-2",
				children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 rounded-3xl bg-surface px-3 py-3 shadow-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAvatar, {
							person: r.person,
							size: 44
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "flex-1 font-bold",
							children: r.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-extrabold",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", {
									className: "tabular",
									children: formatMoney(r.amount)
								}),
								" ",
								currencyLabel(currency)
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "flex size-10 items-center justify-center text-muted",
							onClick: async () => {
								await copyText(String(r.amount));
								toast.success("مبلغ کپی شد");
							},
							"aria-label": "کپی",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" })
						})
					]
				}, r.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "accent",
				block: true,
				className: "mt-5",
				onClick: async () => {
					if (!await nativeShare("دنگ‌پال", text)) {
						await copyText(text);
						toast.success("نتیجه کپی شد");
					}
				},
				children: "اشتراک‌گذاری نتیجه"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "lavender",
					onClick: () => void copyText(text).then(() => toast.success("متن کپی شد")),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "size-4" }), "کپی متن"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "lavender",
					onClick: () => void showQr(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrCode, { className: "size-4" }), "کد QR"]
				})]
			}),
			qr && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex justify-center rounded-3xl bg-surface p-4 shadow-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: qr,
					alt: "QR",
					className: "size-48"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex justify-center gap-3 text-xs text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						className: "text-primary",
						href: waLink(text),
						target: "_blank",
						rel: "noreferrer",
						children: "واتساپ"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						className: "text-primary",
						href: tgLink(text),
						target: "_blank",
						rel: "noreferrer",
						children: "تلگرام"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						className: "text-primary",
						href: smsLink(text),
						target: "_blank",
						rel: "noreferrer",
						children: "پیامک"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 text-center text-xs text-muted",
				children: [
					"جمع ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", {
						className: "tabular",
						children: formatMoney(grand)
					}),
					" ",
					currencyLabel(currency)
				]
			})
		]
	});
}
var SplitComponent = QuickScreen;
//#endregion
export { SplitComponent as component };
