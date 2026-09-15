import { i as __toESM } from "../_runtime.mjs";
import { W as require_react, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { N as Camera } from "../_libs/lucide-react.mjs";
import { u as cn } from "./router-DVGuM8Ia.mjs";
import { n as PersonAvatar } from "./person-BeSrLKWO.mjs";
import { t as compressImage } from "./image-DYl4nrN-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/avatar-picker-9JjALwsR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PRESET_AVATARS = [
	"/avatars/niki.jpg",
	"/avatars/ali.jpg",
	"/avatars/sara.jpg",
	"/avatars/mehdi.jpg",
	"/avatars/nazanin.jpg",
	"/avatars/reza.jpg",
	"/avatars/elham.jpg",
	"/avatars/kian.jpg"
];
function AvatarPicker({ value, onChange, name = "؟", color = "person-1" }) {
	const fileRef = (0, import_react.useRef)(null);
	async function onFile(file) {
		if (!file) return;
		const reader = new FileReader();
		reader.onload = async () => {
			const raw = String(reader.result || "");
			onChange(await compressImage(raw, 320, .82));
		};
		reader.readAsDataURL(file);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-3 flex justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAvatar, {
				person: {
					name,
					avatar: value,
					color
				},
				size: 72
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-5 gap-2",
			children: [PRESET_AVATARS.map((src) => {
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => onChange(src),
					className: cn("overflow-hidden rounded-full ring-2 ring-offset-2 ring-offset-surface", value === src ? "ring-primary" : "ring-transparent"),
					"aria-label": "انتخاب آواتار",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src,
						alt: "",
						className: "aspect-square w-full object-cover"
					})
				}, src);
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => fileRef.current?.click(),
				className: "flex aspect-square items-center justify-center rounded-full bg-bg text-muted ring-2 ring-transparent",
				"aria-label": "آپلود عکس",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-4" })
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			ref: fileRef,
			type: "file",
			accept: "image/*",
			className: "hidden",
			onChange: (e) => void onFile(e.target.files?.[0])
		})
	] });
}
//#endregion
export { AvatarPicker as t };
