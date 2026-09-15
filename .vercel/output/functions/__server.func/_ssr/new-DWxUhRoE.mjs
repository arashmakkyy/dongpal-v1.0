import { i as __toESM } from "../_runtime.mjs";
import { W as require_react, b as useNavigate, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as COVERS, l as TopBar, r as useDang, s as AppScreen } from "./router-DVGuM8Ia.mjs";
import { n as PersonAvatar, r as youName } from "./person-BeSrLKWO.mjs";
import { t as Button } from "./button-bgaJ7srM.mjs";
import { t as Sheet } from "./sheet-BHnFOhSw.mjs";
import { t as AvatarPicker } from "./avatar-picker-9JjALwsR.mjs";
import { t as CurrencyPicker } from "./currency-picker-4gCpSRia.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/new-DWxUhRoE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function NewGatheringScreen() {
	const navigate = useNavigate();
	const people = useDang((s) => s.people);
	const profile = useDang((s) => s.profile);
	const addGathering = useDang((s) => s.addGathering);
	const addPerson = useDang((s) => s.addPerson);
	const [name, setName] = (0, import_react.useState)("");
	const [cover, setCover] = (0, import_react.useState)(COVERS[0].src);
	const [currency, setCurrency] = (0, import_react.useState)(profile.defaultCurrency);
	const me = people.find((p) => p.isMe);
	const [members, setMembers] = (0, import_react.useState)(me ? [me.id] : []);
	const [friendOpen, setFriendOpen] = (0, import_react.useState)(false);
	const [newFriend, setNewFriend] = (0, import_react.useState)("");
	const [newAvatar, setNewAvatar] = (0, import_react.useState)("");
	function toggle(id) {
		if (me && id === me.id) return;
		setMembers((m) => m.includes(id) ? m.filter((x) => x !== id) : [...m, id]);
	}
	function create() {
		if (!name.trim()) {
			toast.error("یک اسم برای دورهمی بنویس");
			return;
		}
		const id = addGathering({
			name: name.trim(),
			cover,
			memberIds: members,
			currency
		});
		toast.success("دورهمی ساخته شد");
		navigate({
			to: "/g/$id",
			params: { id }
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppScreen, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
			title: "دورهمی جدید",
			onBack: () => navigate({ to: "/" })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-5 pb-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mb-2 block text-sm text-muted",
					children: "اسم دورهمی"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: name,
					onChange: (e) => setName(e.target.value),
					placeholder: "مثلاً شمال · آخر هفته",
					className: "h-13 w-full rounded-2xl border border-border bg-surface px-4"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 mt-5 text-sm text-muted",
					children: "کاور"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-4 gap-2",
					children: COVERS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setCover(c.src),
						className: `overflow-hidden rounded-2xl ring-2 ${cover === c.src ? "ring-primary" : "ring-transparent"}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: c.src,
							alt: c.label,
							className: "aspect-4/3 w-full object-cover"
						})
					}, c.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 mt-5 text-sm text-muted",
					children: "ارز"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CurrencyPicker, {
					value: currency,
					onChange: setCurrency
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 mt-5 text-sm text-muted",
					children: "دوست‌ها"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-col gap-1 rounded-3xl bg-surface p-2 shadow-card",
					children: people.map((p) => {
						const on = members.includes(p.id);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => toggle(p.id),
							className: "flex items-center gap-3 rounded-2xl px-2 py-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAvatar, {
									person: p,
									size: 40
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex-1 font-semibold",
									children: youName(p)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `flex size-6 items-center justify-center rounded-full border text-[10px] ${on ? "border-primary bg-primary text-primary-fg" : "border-border"}`,
									children: on ? "✓" : ""
								})
							]
						}, p.id);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					block: true,
					className: "mt-2",
					onClick: () => {
						setNewFriend("");
						setNewAvatar("");
						setFriendOpen(true);
					},
					children: "افزودن دوست جدید"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					block: true,
					className: "mt-6",
					onClick: create,
					children: "ساختن دورهمی"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
			open: friendOpen,
			onClose: () => setFriendOpen(false),
			title: "دوست جدید",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: newFriend,
					onChange: (e) => setNewFriend(e.target.value),
					placeholder: "اسم دوست",
					className: "mb-4 h-13 w-full rounded-2xl border border-border bg-bg px-4"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-sm font-semibold",
					children: "آواتار"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarPicker, {
					value: newAvatar,
					onChange: setNewAvatar,
					name: newFriend
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					block: true,
					className: "mt-4",
					onClick: () => {
						if (!newFriend.trim()) {
							toast.error("اسم را بنویس");
							return;
						}
						const id = addPerson(newFriend.trim(), newAvatar);
						setMembers((m) => [...m, id]);
						setFriendOpen(false);
						toast.success("دوست اضافه شد");
					},
					children: "افزودن"
				})
			]
		})
	] });
}
var SplitComponent = NewGatheringScreen;
//#endregion
export { SplitComponent as component };
