import { i as __toESM } from "../_runtime.mjs";
import { W as require_react, b as useNavigate, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as Trash2, y as Plus } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { l as TopBar, r as useDang, s as AppScreen } from "./router-DVGuM8Ia.mjs";
import { n as PersonAvatar, r as youName } from "./person-BeSrLKWO.mjs";
import { t as Button } from "./button-bgaJ7srM.mjs";
import { t as Sheet } from "./sheet-BHnFOhSw.mjs";
import { t as AvatarPicker } from "./avatar-picker-9JjALwsR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/friends-DCIr0tzx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function FriendsScreen() {
	const navigate = useNavigate();
	const people = useDang((s) => s.people);
	const addPerson = useDang((s) => s.addPerson);
	const updatePerson = useDang((s) => s.updatePerson);
	const updateProfile = useDang((s) => s.updateProfile);
	const removePerson = useDang((s) => s.removePerson);
	const gatherings = useDang((s) => s.gatherings);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [editId, setEditId] = (0, import_react.useState)(null);
	const [name, setName] = (0, import_react.useState)("");
	const [avatar, setAvatar] = (0, import_react.useState)("");
	const editing = people.find((p) => p.id === editId);
	function closeForms() {
		setOpen(false);
		setEditId(null);
		setName("");
		setAvatar("");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppScreen, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
			title: "دوستان",
			onBack: () => navigate({ to: "/more" })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-5 pb-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col gap-2",
				children: people.map((p) => {
					const n = gatherings.filter((g) => g.memberIds.includes(p.id)).length;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							setEditId(p.id);
							setName(p.name);
							setAvatar(p.avatar);
						},
						className: "flex w-full items-center gap-3 rounded-3xl bg-surface px-3 py-3 text-start shadow-card",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAvatar, {
								person: p,
								size: 48
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-bold",
									children: youName(p)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted",
									children: [n, " دورهمی مشترک"]
								})]
							}),
							!p.isMe && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								role: "button",
								className: "flex size-10 items-center justify-center rounded-2xl text-danger",
								onClick: (e) => {
									e.stopPropagation();
									removePerson(p.id);
									toast.success("حذف شد");
								},
								"aria-label": "حذف",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							})
						]
					}, p.id);
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				block: true,
				className: "mt-5",
				onClick: () => {
					setName("");
					setAvatar("");
					setOpen(true);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "افزودن دوست"]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
			open,
			onClose: closeForms,
			title: "دوست جدید",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: name,
					onChange: (e) => setName(e.target.value),
					placeholder: "اسم دوست",
					className: "mb-4 h-13 w-full rounded-2xl border border-border bg-bg px-4"
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
						if (!name.trim()) {
							toast.error("اسم را بنویس");
							return;
						}
						addPerson(name.trim(), avatar);
						closeForms();
						toast.success("اضافه شد");
					},
					children: "افزودن"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
			open: !!editing,
			onClose: closeForms,
			title: editing?.isMe ? "پروفایل تو" : "ویرایش دوست",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: name,
					onChange: (e) => setName(e.target.value),
					className: "mb-4 h-13 w-full rounded-2xl border border-border bg-bg px-4"
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
						if (!editing) return;
						const next = name.trim() || editing.name;
						if (editing.isMe) updateProfile({
							name: next,
							avatar
						});
						else updatePerson(editing.id, {
							name: next,
							avatar
						});
						closeForms();
						toast.success("ذخیره شد");
					},
					children: "ذخیره"
				})
			]
		})
	] });
}
var SplitComponent = FriendsScreen;
//#endregion
export { SplitComponent as component };
