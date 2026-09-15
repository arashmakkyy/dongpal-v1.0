import { i as __toESM } from "../_runtime.mjs";
import { S as useParams, W as require_react, b as useNavigate, w as require_jsx_runtime, x as useSearch } from "../_libs/@tanstack/react-router+[...].mjs";
import { g as Scale } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { l as TopBar, n as makeDraft, r as useDang } from "./router-DVGuM8Ia.mjs";
import { r as youName } from "./person-BeSrLKWO.mjs";
import { t as Button } from "./button-bgaJ7srM.mjs";
import { d as parseAmount, o as formatMoney, r as currencyLabel } from "./format-Bi7-O-sI.mjs";
import { n as equalPercents, t as allocate } from "./settle-DOh7cCQm.mjs";
import { n as UnequalSliders, t as SPLIT_THUMB } from "./unequal-sliders-Hm71MXqE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/g._id.split-BuB9Avc0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SplitScreen() {
	const { id } = useParams({ strict: false });
	const search = useSearch({ strict: false });
	const navigate = useNavigate();
	const gathering = useDang((s) => s.gatherings.find((g) => g.id === id));
	const people = useDang((s) => s.people);
	const draft = useDang((s) => s.draft);
	const patchDraft = useDang((s) => s.patchDraft);
	const addExpense = useDang((s) => s.addExpense);
	const setDraft = useDang((s) => s.setDraft);
	const fromAdd = search.from === "add";
	(0, import_react.useEffect)(() => {
		if (!gathering) return;
		if (draft && draft.gatheringId === id) {
			if (!draft.shares || Object.keys(draft.shares).length === 0) patchDraft({
				split: "unequal",
				shares: equalPercents(draft.participantIds)
			});
			return;
		}
		const me = people.find((p) => p.isMe);
		setDraft({
			...makeDraft(id, {
				payerId: me && gathering.memberIds.includes(me.id) ? me.id : gathering.memberIds[0],
				participantIds: gathering.memberIds
			}),
			title: "تقسیم نابرابر",
			amount: 0,
			split: "unequal",
			shares: equalPercents(gathering.memberIds)
		});
	}, [
		id,
		gathering,
		draft,
		people,
		patchDraft,
		setDraft
	]);
	const members = (0, import_react.useMemo)(() => {
		if (!draft) return [];
		return draft.participantIds.map((pid) => people.find((p) => p.id === pid)).filter((p) => !!p);
	}, [draft, people]);
	const shares = draft?.shares ?? {};
	const sum = members.reduce((s, m) => s + (shares[m.id] ?? 0), 0);
	if (!gathering || !draft) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-full min-h-0 flex-col bg-bg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
			title: "تقسیم نابرابر",
			onBack: () => navigate({ to: "/" })
		})
	});
	const unit = currencyLabel(gathering.currency);
	function goBack() {
		if (fromAdd) navigate({
			to: "/g/$id/add",
			params: { id: gathering.id }
		});
		else navigate({
			to: "/g/$id",
			params: { id: gathering.id }
		});
	}
	function equalize() {
		patchDraft({ shares: equalPercents(draft.participantIds) });
	}
	function confirm() {
		if (!draft.amount || draft.amount <= 0) {
			toast.error("مبلغ کل را وارد کن");
			return;
		}
		if (Math.abs(sum - 100) > .2) {
			toast.error("جمع درصدها باید ۱۰۰ باشد");
			return;
		}
		addExpense({
			gatheringId: gathering.id,
			title: draft.title.trim() || "تقسیم نابرابر",
			amount: draft.amount,
			category: draft.category,
			payerId: draft.payerId,
			participantIds: draft.participantIds,
			split: "unequal",
			shares: draft.shares,
			note: draft.note || void 0,
			date: draft.date,
			receiptImage: draft.receiptImage
		});
		setDraft(null);
		toast.success("تقسیم ثبت شد");
		navigate({
			to: "/g/$id",
			params: { id: gathering.id }
		});
	}
	const allocated = allocate(draft.amount, members.map((m) => m.id), shares);
	const rows = members.map((m) => ({
		id: m.id,
		name: youName(m),
		person: m,
		percent: shares[m.id] ?? 0,
		amount: allocated[m.id] ?? 0,
		color: SPLIT_THUMB[m.color]
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col bg-bg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
				title: "تقسیم نابرابر",
				subtitle: "سهم هر نفر را مشخص کن",
				onBack: goBack
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-h-0 flex-1 overflow-y-auto px-5 pb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 rounded-[22px] bg-surface px-4 py-3 shadow-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "مبلغ کل"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1 flex items-baseline gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							inputMode: "numeric",
							dir: "ltr",
							value: draft.amount ? formatMoney(draft.amount) : "",
							onChange: (e) => patchDraft({ amount: parseAmount(e.target.value) }),
							placeholder: "0",
							className: "min-w-0 flex-1 bg-transparent text-[26px] font-extrabold tabular outline-none"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm text-muted",
							children: unit
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnequalSliders, {
					rows,
					unit,
					total: draft.amount,
					onSharesChange: (next) => patchDraft({ shares: next }),
					onEqualize: equalize,
					showEqualize: false
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "shrink-0 bg-bg px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "soft",
					block: true,
					className: "rounded-[22px]",
					onClick: equalize,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scale, { className: "size-4" }), "به طور مساوی تقسیم کن"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					block: true,
					className: "mt-3 rounded-[22px]",
					onClick: confirm,
					disabled: members.length === 0,
					children: "تأیید تقسیم"
				})]
			})
		]
	});
}
var SplitComponent = SplitScreen;
//#endregion
export { SplitComponent as component };
