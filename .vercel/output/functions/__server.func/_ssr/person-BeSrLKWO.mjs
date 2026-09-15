import { w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as cn } from "./router-DVGuM8Ia.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/person-BeSrLKWO.js
var import_jsx_runtime = require_jsx_runtime();
var colorClass = {
	"person-1": "bg-person-1",
	"person-2": "bg-person-2",
	"person-3": "bg-person-3",
	"person-4": "bg-person-4",
	"person-5": "bg-person-5",
	"person-6": "bg-person-6"
};
function youName(person, fallback = "دوست") {
	if (!person) return fallback;
	return person.isMe ? "تو" : person.name;
}
function PersonAvatar({ person, size = 40, className }) {
	const name = person?.name ?? "؟";
	const style = {
		width: size,
		height: size
	};
	if (person?.avatar) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: person.avatar,
		alt: name,
		width: size,
		height: size,
		className: cn("rounded-full object-cover ring-2 ring-surface", className),
		style
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex items-center justify-center rounded-full text-white ring-2 ring-surface font-semibold", colorClass[person?.color ?? "person-1"], className),
		style: {
			...style,
			fontSize: size * .38
		},
		"aria-label": name,
		children: name.slice(0, 1)
	});
}
function AvatarStack({ people, max = 4, size = 28 }) {
	const shown = people.slice(0, max);
	const extra = people.length - shown.length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center",
		children: [shown.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative",
			style: { marginInlineStart: i === 0 ? 0 : -(size * .32) },
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAvatar, {
				person: p,
				size
			})
		}, p.id)), extra > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative flex items-center justify-center rounded-full bg-track text-[11px] font-semibold text-muted ring-2 ring-surface",
			style: {
				width: size,
				height: size,
				marginInlineStart: -(size * .32)
			},
			children: ["+", extra]
		})]
	});
}
//#endregion
export { PersonAvatar as n, youName as r, AvatarStack as t };
