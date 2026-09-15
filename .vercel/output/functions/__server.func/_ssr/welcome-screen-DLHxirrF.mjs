import { i as __toESM } from "../_runtime.mjs";
import { W as require_react, b as useNavigate, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { I as ArrowLeft } from "../_libs/lucide-react.mjs";
import { c as HeartMark, r as useDang, u as cn } from "./router-DVGuM8Ia.mjs";
import { t as Button } from "./button-bgaJ7srM.mjs";
import { t as Sheet } from "./sheet-BHnFOhSw.mjs";
import { t as AvatarPicker } from "./avatar-picker-9JjALwsR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/welcome-screen-DLHxirrF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function WelcomeScreen() {
	const navigate = useNavigate();
	const setSeen = useDang((s) => s.setSeenWelcome);
	const updateProfile = useDang((s) => s.updateProfile);
	const profile = useDang((s) => s.profile);
	const [login, setLogin] = (0, import_react.useState)(false);
	const [name, setName] = (0, import_react.useState)(profile.name);
	const [avatar, setAvatar] = (0, import_react.useState)(profile.avatar);
	function goHome() {
		setSeen();
		navigate({ to: "/" });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex h-full min-h-0 flex-col overflow-hidden bg-welcome",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/illustrations/hero.jpg?v=3",
				alt: "",
				className: "pointer-events-none absolute inset-0 size-full object-cover object-[center_18%]"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-welcome via-welcome/85 to-transparent" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-welcome from-40% via-welcome/90 to-transparent" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "relative z-10 shrink-0 px-6 pt-8 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-[40px] font-extrabold leading-none text-primary",
					children: "دنگ‌پال"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-[15px] leading-7 text-fg",
					children: [
						"خرج‌هامون با هم،",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center justify-center gap-1",
							children: ["دوستی‌هامون همیشگی", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeartMark, { className: "size-4" })]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative min-h-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HandTag, {
						style: {
							left: 16,
							top: "12%"
						},
						rotate: -12,
						label: "اسکن رسید"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HandTag, {
						style: {
							right: 16,
							top: "6%"
						},
						rotate: 11,
						label: "تقسیم عادلانه"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HandTag, {
						style: {
							right: 28,
							bottom: "18%"
						},
						rotate: -8,
						label: "سبک‌تر",
						spark: true
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-20 shrink-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-10 bg-gradient-to-t from-welcome to-transparent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-t-[36px] bg-welcome px-6 pb-[max(20px,env(safe-area-inset-bottom))] pt-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							block: true,
							className: "rounded-full",
							onClick: goHome,
							children: ["شروع کنیم", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							block: true,
							className: "mt-3 rounded-full shadow-card",
							onClick: () => setLogin(true),
							children: "ورود به حساب کاربری"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-center text-[11px] text-muted",
							children: "بدون ثبت‌نام هم می‌تونی استفاده کنی"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
				open: login,
				onClose: () => setLogin(false),
				title: "حساب کاربری",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-3 text-sm text-muted",
						children: "اسم و آواتار روی هزینه‌ها و تسویه به‌جای «تو» می‌آید."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: name,
						onChange: (e) => setName(e.target.value),
						className: "mb-4 h-13 w-full rounded-2xl border border-border bg-bg px-4",
						placeholder: "مثلاً نیکی",
						autoFocus: true
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
						className: "mt-5 rounded-full",
						onClick: () => {
							updateProfile({
								name: name.trim() || "نیکی",
								avatar
							});
							setLogin(false);
							goHome();
						},
						children: "ادامه"
					})
				]
			})
		]
	});
}
function HandTag({ label, className, style, rotate, spark }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("pointer-events-none absolute z-10 select-none", className),
		style: {
			transform: `rotate(${rotate}deg)`,
			...style
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "relative inline-flex items-center gap-1",
			children: [spark ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
				viewBox: "0 0 16 16",
				className: "size-3.5 fill-primary text-primary",
				"aria-hidden": true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M8 0l1.2 5.2L14 8l-4.8 1.6L8 16l-1.2-6.4L2 8l4.8-2.8z" })
			}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-hand text-[18px] leading-none text-primary",
				children: label
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
			viewBox: "0 0 96 12",
			className: "mt-0.5 h-2.5 w-[6.2rem] text-primary",
			fill: "none",
			"aria-hidden": true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M2 8c18-5 28 4 46-2 14-5 28 3 42-1",
				stroke: "currentColor",
				strokeWidth: "2.2",
				strokeLinecap: "round"
			})
		})]
	});
}
//#endregion
export { WelcomeScreen as t };
