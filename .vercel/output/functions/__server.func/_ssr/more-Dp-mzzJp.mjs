import { i as __toESM } from "../_runtime.mjs";
import { W as require_react, b as useNavigate, w as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as RotateCcw, c as Trash2, i as Users, j as ChevronLeft, l as Sparkles, n as Wallet, o as UserPlus } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { c as HeartMark, r as useDang, s as AppScreen } from "./router-DVGuM8Ia.mjs";
import { n as PersonAvatar, r as youName } from "./person-BeSrLKWO.mjs";
import { t as Button } from "./button-bgaJ7srM.mjs";
import { t as Sheet } from "./sheet-BHnFOhSw.mjs";
import { t as AvatarPicker } from "./avatar-picker-9JjALwsR.mjs";
import { t as CurrencyPicker } from "./currency-picker-4gCpSRia.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/more-Dp-mzzJp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MoreScreen() {
	const navigate = useNavigate();
	const profile = useDang((s) => s.profile);
	const people = useDang((s) => s.people);
	const me = people.find((p) => p.isMe);
	const updateProfile = useDang((s) => s.updateProfile);
	const resetDemo = useDang((s) => s.resetDemo);
	const startFresh = useDang((s) => s.startFresh);
	const [nameOpen, setNameOpen] = (0, import_react.useState)(false);
	const [name, setName] = (0, import_react.useState)(profile.name);
	const [avatar, setAvatar] = (0, import_react.useState)(profile.avatar);
	const items = [
		{
			icon: Users,
			label: "دوستان",
			hint: `${people.length} نفر`,
			to: "/friends"
		},
		{
			icon: Sparkles,
			label: "تقسیم سریع",
			hint: "حساب رستوران و تاکسی",
			to: "/quick"
		},
		{
			icon: UserPlus,
			label: "دورهمی جدید",
			hint: "سفر، تولد، شام",
			to: "/new"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppScreen, {
		nav: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-5 pb-8 pt-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mb-4 text-xl font-extrabold",
					children: "بیشتر"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						setName(profile.name);
						setAvatar(profile.avatar);
						setNameOpen(true);
					},
					className: "mb-4 flex w-full items-center gap-3 rounded-3xl bg-surface p-4 shadow-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAvatar, {
							person: me,
							size: 56
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-bold",
								children: youName(me)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: "ویرایش نام و آواتار"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4 text-subtle" })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-hidden rounded-3xl bg-surface shadow-card",
					children: items.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: it.to,
						className: "flex items-center gap-3 border-b border-border px-4 py-3.5 last:border-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex size-10 items-center justify-center rounded-2xl bg-bg text-primary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(it.icon, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-sm font-bold",
									children: it.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted",
									children: it.hint
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4 text-subtle" })
						]
					}, it.label))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 rounded-3xl bg-surface p-4 shadow-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex size-10 items-center justify-center rounded-2xl bg-bg text-primary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-bold",
								children: "ارز پیش‌فرض"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-muted",
								children: "برای دورهمی و تقسیم سریع"
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CurrencyPicker, {
						value: profile.defaultCurrency,
						onChange: (c) => updateProfile({ defaultCurrency: c })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 overflow-hidden rounded-3xl bg-surface shadow-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "flex w-full items-center gap-3 border-b border-border px-4 py-3.5",
							onClick: () => {
								updateProfile({ seenWelcome: false });
								navigate({ to: "/welcome" });
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeartMark, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-semibold",
								children: "صفحه خوشامد"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "flex w-full items-center gap-3 border-b border-border px-4 py-3.5",
							onClick: () => {
								resetDemo();
								toast.success("دیتای نمونه برگشت");
								navigate({ to: "/" });
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4 text-muted" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-semibold",
								children: "بازگردانی دیتای نمونه"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "flex w-full items-center gap-3 px-4 py-3.5 text-danger",
							onClick: () => {
								startFresh();
								toast.success("از نو شروع شد");
								navigate({ to: "/" });
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-semibold",
								children: "شروع تازه"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-8 text-center text-xs text-muted",
					children: "دنگ‌پال · خرج‌ها رو گروهی، دوستی رو همیشگی"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
			open: nameOpen,
			onClose: () => setNameOpen(false),
			title: "پروفایل",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: name,
					onChange: (e) => setName(e.target.value),
					className: "mb-4 h-13 w-full rounded-2xl border border-border bg-bg px-4",
					placeholder: "اسم تو"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-sm font-semibold",
					children: "آواتار"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarPicker, {
					value: avatar,
					onChange: setAvatar,
					name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					block: true,
					className: "mt-4",
					onClick: () => {
						updateProfile({
							name: name.trim() || profile.name,
							avatar
						});
						setNameOpen(false);
						toast.success("ذخیره شد");
					},
					children: "ذخیره"
				})
			]
		})]
	});
}
var SplitComponent = MoreScreen;
//#endregion
export { SplitComponent as component };
