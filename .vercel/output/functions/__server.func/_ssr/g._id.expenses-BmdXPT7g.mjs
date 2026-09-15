import { i as __toESM } from "../_runtime.mjs";
import { S as useParams, W as require_react, b as useNavigate, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as Trash2 } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as CATEGORIES, l as TopBar, r as useDang, s as AppScreen } from "./router-DVGuM8Ia.mjs";
import { t as ExpenseRow } from "./gathering-screen-Br2gZ-xX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/g._id.expenses-BmdXPT7g.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ExpensesScreen() {
	const { id } = useParams({ strict: false });
	const navigate = useNavigate();
	const gathering = useDang((s) => s.gatherings.find((g) => g.id === id));
	const allExpenses = useDang((s) => s.expenses);
	const people = useDang((s) => s.people);
	const deleteExpense = useDang((s) => s.deleteExpense);
	const [cat, setCat] = (0, import_react.useState)("all");
	const expenses = (0, import_react.useMemo)(() => allExpenses.filter((e) => e.gatheringId === id).sort((a, b) => b.date - a.date), [allExpenses, id]);
	const filtered = (0, import_react.useMemo)(() => cat === "all" ? expenses : expenses.filter((e) => e.category === cat), [cat, expenses]);
	if (!gathering) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppScreen, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
		title: "هزینه‌ها",
		onBack: () => navigate({ to: "/" })
	}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppScreen, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
		title: "هزینه‌های این دورهمی",
		onBack: () => navigate({
			to: "/g/$id",
			params: { id }
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 pb-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "no-scrollbar mb-4 flex gap-2 overflow-x-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
				active: cat === "all",
				onClick: () => setCat("all"),
				label: "همه"
			}), CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
				active: cat === c.id,
				onClick: () => setCat(c.id),
				label: c.label
			}, c.id))]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-col gap-2",
			children: filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-10 text-center text-sm text-muted",
				children: "هزینه‌ای در این دسته نیست"
			}) : filtered.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-w-0 flex-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExpenseRow, {
						expense: e,
						payer: people.find((p) => p.id === e.payerId),
						currency: gathering.currency
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "flex size-11 shrink-0 items-center justify-center rounded-2xl bg-surface text-danger shadow-card",
					"aria-label": "حذف هزینه",
					onClick: () => {
						deleteExpense(e.id);
						toast.success("هزینه حذف شد");
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
				})]
			}, e.id))
		})]
	})] });
}
function Chip({ active, label, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: `shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${active ? "bg-primary text-primary-fg" : "bg-surface text-muted"}`,
		children: label
	});
}
var SplitComponent = ExpensesScreen;
//#endregion
export { SplitComponent as component };
