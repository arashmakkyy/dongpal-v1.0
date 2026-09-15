import { i as __toESM } from "../_runtime.mjs";
import { W as require_react, b as useNavigate, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as UserPlus } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { l as TopBar, r as useDang, s as AppScreen } from "./router-DVGuM8Ia.mjs";
import { n as PersonAvatar } from "./person-BeSrLKWO.mjs";
import { t as Button } from "./button-bgaJ7srM.mjs";
import { a as readJoinHash, t as decodePack } from "./pack-DkU-FWOd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/join-DdWGdSHf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function JoinScreen() {
	const navigate = useNavigate();
	const joinGathering = useDang((s) => s.joinGathering);
	const gatherings = useDang((s) => s.gatherings);
	const [picked, setPicked] = (0, import_react.useState)(null);
	const [pack, setPack] = (0, import_react.useState)("wait");
	(0, import_react.useEffect)(() => {
		const hash = readJoinHash(window.location.hash);
		const q = new URLSearchParams(window.location.search).get("p");
		setPack(decodePack(hash || q || ""));
	}, []);
	if (pack === "wait") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppScreen, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
		title: "دعوت",
		onBack: () => navigate({ to: "/" })
	}) });
	if (!pack) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppScreen, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
		title: "پیوستن",
		onBack: () => navigate({ to: "/" })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "rounded-3xl bg-surface px-4 py-8 text-center text-sm text-muted shadow-card",
			children: "این لینک دعوت معتبر نیست یا منقضی شده."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			block: true,
			className: "mt-4",
			onClick: () => navigate({ to: "/" }),
			children: "برو به خانه"
		})]
	})] });
	const sourceId = pack.gathering.sourceId || pack.gathering.id;
	const already = gatherings.find((g) => g.sourceId === sourceId || g.id === sourceId);
	function confirm() {
		if (!pack || pack === "wait") return;
		const id = joinGathering(pack, picked ?? "new");
		toast.success("دورهمی به لیستت اضافه شد");
		navigate({
			to: "/g/$id",
			params: { id }
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppScreen, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
		title: "دعوت به دورهمی",
		onBack: () => navigate({ to: "/" })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 pb-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "overflow-hidden rounded-[28px] bg-surface shadow-card",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: pack.gathering.cover,
				alt: "",
				className: "h-28 w-full object-cover"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-extrabold",
					children: pack.gathering.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-xs text-muted",
					children: [
						pack.people.length,
						" نفر · ",
						pack.expenses.length,
						" هزینه"
					]
				})]
			})]
		}), already ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-5 text-sm text-muted",
			children: "این دورهمی از قبل توی لیستته."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			block: true,
			className: "mt-4",
			onClick: () => navigate({
				to: "/g/$id",
				params: { id: already.id }
			}),
			children: "باز کردن"
		})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-6 text-sm font-bold",
				children: "تو کدوم یکی هستی؟"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted",
				children: "انتخاب کن تا سهم‌ها و بدهی‌ها به‌اسم «تو» دیده بشه."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-col gap-2",
				children: [pack.people.map((p) => {
					const on = picked === p.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setPicked(p.id),
						className: `flex items-center gap-3 rounded-3xl bg-surface px-3 py-3 text-start shadow-card ring-2 ${on ? "ring-primary" : "ring-transparent"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAvatar, {
								person: p,
								size: 48
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex-1 font-bold",
								children: p.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `flex size-6 items-center justify-center rounded-full border text-[10px] ${on ? "border-primary bg-primary text-primary-fg" : "border-border"}`,
								children: on ? "✓" : ""
							})
						]
					}, p.id);
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setPicked("new"),
					className: `flex items-center gap-3 rounded-3xl bg-surface px-3 py-3 text-start shadow-card ring-2 ${picked === "new" ? "ring-primary" : "ring-transparent"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex-1 font-bold",
						children: "من توی این لیست نیستم"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				block: true,
				className: "mt-5",
				disabled: !picked,
				onClick: confirm,
				children: "ورود به دورهمی"
			})
		] })]
	})] });
}
var SplitComponent = JoinScreen;
//#endregion
export { SplitComponent as component };
