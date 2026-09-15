import { S as useParams, b as useNavigate, w as require_jsx_runtime, x as useSearch } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as Send } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { c as HeartMark, l as TopBar, r as useDang, s as AppScreen } from "./router-DVGuM8Ia.mjs";
import { t as Button } from "./button-bgaJ7srM.mjs";
import { o as formatMoney, r as currencyLabel } from "./format-Bi7-O-sI.mjs";
import { a as reminderText, c as tgLink, l as waLink, n as copyText, r as nativeShare, s as smsLink, t as baleLink } from "./share-DvHM8VOG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/g._id.remind-DDMDb9Xo.js
var import_jsx_runtime = require_jsx_runtime();
function RemindScreen() {
	const { id } = useParams({ strict: false });
	const search = useSearch({ strict: false });
	const navigate = useNavigate();
	const gathering = useDang((s) => s.gatherings.find((g) => g.id === id));
	const people = useDang((s) => s.people);
	const from = people.find((p) => p.id === search.from) ?? people[0];
	const to = people.find((p) => p.id === search.to) ?? people[1];
	const amount = Number(search.amount || 0);
	if (!gathering) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppScreen, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
		title: "یادآوری",
		onBack: () => navigate({ to: "/" })
	}) });
	const text = reminderText({
		toName: from?.name ?? "دوست",
		amount: amount || 0,
		currency: gathering.currency,
		gatheringName: gathering.name,
		toPayName: to?.name ?? "دوست"
	});
	const channels = [
		{
			id: "wa",
			label: "واتساپ",
			href: waLink(text),
			color: "bg-[#E8F8EF] text-[#1FAD66]"
		},
		{
			id: "tg",
			label: "تلگرام",
			href: tgLink(text),
			color: "bg-[#E7F3FE] text-[#2A9EDC]"
		},
		{
			id: "sms",
			label: "پیامک",
			href: smsLink(text),
			color: "bg-[#E8F4FF] text-[#3B82C4]"
		},
		{
			id: "bale",
			label: "بله",
			href: baleLink(text),
			color: "bg-accent-soft text-accent"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppScreen, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
		title: "یادآوری دوستانه",
		subtitle: "با یک پیام، حساب‌وکتاب رو راحت کن",
		onBack: () => navigate({
			to: "/g/$id/settle",
			params: { id: gathering.id }
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 pb-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto mb-2 flex w-full max-w-[300px] items-start justify-center gap-2 pt-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/illustrations/plane.jpg",
					alt: "",
					className: "w-[180px] object-contain"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 rounded-2xl bg-accent-soft px-3 py-2 text-xs font-bold leading-5 text-accent",
					children: ["به یادآوری دوستانه", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeartMark, { className: "ms-1 inline size-3 align-text-bottom" })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 rounded-3xl bg-surface p-4 text-sm leading-7 shadow-card",
				children: text.split("\n").map((line, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: line }, i))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 grid grid-cols-4 gap-2",
				children: channels.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: c.href,
					target: "_blank",
					rel: "noreferrer",
					className: `flex min-h-[76px] flex-col items-center justify-center gap-1 rounded-3xl text-[11px] font-semibold ${c.color}`,
					children: c.label
				}, c.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				block: true,
				className: "mt-6",
				onClick: async () => {
					if (!await nativeShare("دنگ‌پال", text)) {
						await copyText(text);
						toast.success("پیام کپی شد");
					}
				},
				children: ["ارسال یادآوری", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4 rtl:rotate-180" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-center text-xs text-muted",
				children: [
					"سهم ",
					from?.name,
					": ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", {
						className: "tabular",
						children: formatMoney(amount)
					}),
					" ",
					currencyLabel(gathering.currency)
				]
			})
		]
	})] });
}
var SplitComponent = RemindScreen;
//#endregion
export { SplitComponent as component };
