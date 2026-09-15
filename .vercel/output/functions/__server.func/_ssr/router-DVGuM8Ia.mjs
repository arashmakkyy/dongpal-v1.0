import { i as __toESM } from "../_runtime.mjs";
import { C as useRouter, W as require_react, _ as createFileRoute, d as HeadContent, f as useRouterState, g as lazyRouteComponent, h as Outlet, m as createRouter, u as Scripts, v as createRootRoute, w as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as Clock3, E as Grid2x2, T as House, h as ScanLine, i as Users, j as ChevronLeft, s as TriangleAlert } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-DVGuM8Ia.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function uid(prefix = "") {
	return `${prefix}${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;
}
var tabs = [
	{
		to: "/",
		label: "خانه",
		icon: House,
		id: "home"
	},
	{
		to: "/gatherings",
		label: "دورهمی‌ها",
		icon: Users,
		id: "g"
	},
	{
		to: "/scan",
		label: "اسکن رسید",
		icon: ScanLine,
		id: "scan"
	},
	{
		to: "/history",
		label: "تاریخچه",
		icon: Clock3,
		id: "hist"
	},
	{
		to: "/more",
		label: "بیشتر",
		icon: Grid2x2,
		id: "more"
	}
];
function AppScreen({ children, nav, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col bg-bg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("min-h-0 flex-1 overflow-y-auto", className),
			children
		}), nav ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomNav, {}) : null]
	});
}
function BottomNav() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "z-20 shrink-0 border-t border-border bg-surface px-1 pb-[max(8px,env(safe-area-inset-bottom))] pt-1",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "grid grid-cols-5",
			children: tabs.map((t) => {
				const active = t.to === "/" ? pathname === "/" : pathname === t.to || pathname.startsWith(`${t.to}/`);
				const Icon = t.icon;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: t.to,
					search: t.id === "scan" ? { g: void 0 } : void 0,
					className: cn("flex flex-col items-center gap-0.5 rounded-2xl py-2 text-[11px] font-medium transition-colors", active ? "text-primary" : "text-muted"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
						className: "size-5",
						strokeWidth: active ? 2.4 : 2
					}), t.label]
				}) }, t.id);
			})
		})
	});
}
function TopBar({ title, subtitle, onBack, action, right }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "sticky top-0 z-20 flex items-center gap-2 bg-bg/90 px-3 py-3 backdrop-blur-md",
		children: [
			onBack ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onBack,
				className: "flex size-11 shrink-0 items-center justify-center rounded-2xl text-fg",
				"aria-label": "بازگشت",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-6 rtl:rotate-180" })
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-11 shrink-0" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "truncate text-[17px] font-bold",
					children: title
				}), subtitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-xs text-muted",
					children: subtitle
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex min-w-11 shrink-0 items-center justify-end",
				children: action ?? right
			})
		]
	});
}
function HeartMark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 24 24",
		className: cn("size-3.5 fill-pink text-pink", className),
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 21s-6.5-4.35-9.3-8.2C.7 9.7 1.6 6 4.7 4.8 6.6 4 8.7 4.6 12 7.4 15.3 4.6 17.4 4 19.3 4.8c3.1 1.2 4 4.9 2 8-2.8 3.85-9.3 8.2-9.3 8.2z" })
	});
}
var CURRENCIES = [
	{
		id: "IRT",
		label: "تومان",
		symbol: "تومان"
	},
	{
		id: "IRR",
		label: "ریال",
		symbol: "ریال"
	},
	{
		id: "USD",
		label: "دلار",
		symbol: "$"
	},
	{
		id: "EUR",
		label: "یورو",
		symbol: "€"
	}
];
var CATEGORIES = [
	{
		id: "food",
		label: "غذا"
	},
	{
		id: "transport",
		label: "حمل‌ونقل"
	},
	{
		id: "lodging",
		label: "اقامت"
	},
	{
		id: "shopping",
		label: "خرید"
	},
	{
		id: "other",
		label: "سایر"
	}
];
var COVERS = [
	{
		id: "north",
		src: "/covers/north.jpg",
		label: "شمال"
	},
	{
		id: "birthday",
		src: "/covers/birthday.jpg",
		label: "تولد"
	},
	{
		id: "work",
		src: "/covers/work.jpg",
		label: "کار"
	},
	{
		id: "cafe",
		src: "/covers/cafe.jpg",
		label: "کافه"
	},
	{
		id: "picnic",
		src: "/covers/picnic.jpg",
		label: "پیک‌نیک"
	},
	{
		id: "beach",
		src: "/covers/beach.jpg",
		label: "ساحل"
	},
	{
		id: "concert",
		src: "/covers/concert.jpg",
		label: "کنسرت"
	}
];
var PERSON_COLORS = [
	"person-1",
	"person-2",
	"person-3",
	"person-4",
	"person-5",
	"person-6"
];
var day = 864e5;
var hour = 36e5;
function seedNow(now = Date.now()) {
	const people = [
		{
			id: "me",
			name: "نیکی",
			avatar: "/avatars/niki.jpg",
			color: "person-5",
			isMe: true
		},
		{
			id: "ali",
			name: "علی",
			avatar: "/avatars/ali.jpg",
			color: "person-1"
		},
		{
			id: "sara",
			name: "سارا",
			avatar: "/avatars/sara.jpg",
			color: "person-2"
		},
		{
			id: "mehdi",
			name: "مهدی",
			avatar: "/avatars/mehdi.jpg",
			color: "person-3"
		},
		{
			id: "nazanin",
			name: "نازنین",
			avatar: "/avatars/nazanin.jpg",
			color: "person-4"
		},
		{
			id: "reza",
			name: "رضا",
			avatar: "/avatars/reza.jpg",
			color: "person-6"
		},
		{
			id: "elham",
			name: "الهام",
			avatar: "/avatars/elham.jpg",
			color: "person-1"
		},
		{
			id: "kian",
			name: "کیان",
			avatar: "/avatars/kian.jpg",
			color: "person-3"
		}
	];
	const northMembers = [
		"me",
		"ali",
		"sara",
		"mehdi",
		"nazanin"
	];
	return {
		people,
		gatherings: [
			{
				id: "g-north",
				name: "شمال · آخر هفته",
				cover: "/covers/north.jpg",
				memberIds: northMembers,
				currency: "IRT",
				createdAt: now - 4 * day
			},
			{
				id: "g-bday",
				name: "تولد سارا",
				cover: "/covers/birthday.jpg",
				memberIds: [
					"me",
					"ali",
					"sara",
					"mehdi",
					"nazanin",
					"reza"
				],
				currency: "IRT",
				createdAt: now - 10 * day
			},
			{
				id: "g-work",
				name: "سفر کاری",
				cover: "/covers/work.jpg",
				memberIds: [
					"me",
					"mehdi",
					"kian"
				],
				currency: "IRT",
				createdAt: now - 18 * day
			}
		],
		expenses: [
			{
				id: "e-villa",
				gatheringId: "g-north",
				title: "ویلا",
				amount: 36e5,
				category: "lodging",
				payerId: "ali",
				participantIds: northMembers,
				split: "equal",
				date: now - day - 9.5 * hour,
				createdAt: now - day
			},
			{
				id: "e-dinner",
				gatheringId: "g-north",
				title: "شام",
				amount: 125e4,
				category: "food",
				payerId: "sara",
				participantIds: northMembers,
				split: "equal",
				date: now - day - 3.75 * hour,
				createdAt: now - day
			},
			{
				id: "e-gas",
				gatheringId: "g-north",
				title: "بنزین",
				amount: 76e4,
				category: "transport",
				payerId: "mehdi",
				participantIds: northMembers,
				split: "equal",
				date: now - 2 * day,
				createdAt: now - 2 * day
			},
			{
				id: "e-snacks",
				gatheringId: "g-north",
				title: "تنقلات",
				amount: 15e5,
				category: "shopping",
				payerId: "nazanin",
				participantIds: northMembers,
				split: "equal",
				date: now - 3 * day,
				createdAt: now - 3 * day
			},
			{
				id: "e-cake",
				gatheringId: "g-bday",
				title: "کیک تولد",
				amount: 98e4,
				category: "food",
				payerId: "me",
				participantIds: [
					"me",
					"ali",
					"sara",
					"mehdi",
					"nazanin",
					"reza"
				],
				split: "equal",
				date: now - 8 * day,
				createdAt: now - 8 * day
			},
			{
				id: "e-rest",
				gatheringId: "g-bday",
				title: "رستوران",
				amount: 21e5,
				category: "food",
				payerId: "ali",
				participantIds: [
					"me",
					"ali",
					"sara",
					"mehdi",
					"nazanin",
					"reza"
				],
				split: "equal",
				date: now - 8 * day + 3 * hour,
				createdAt: now - 8 * day
			},
			{
				id: "e-gift",
				gatheringId: "g-bday",
				title: "کادو گروهی",
				amount: 72e4,
				category: "shopping",
				payerId: "nazanin",
				participantIds: [
					"me",
					"ali",
					"mehdi",
					"nazanin",
					"reza"
				],
				split: "equal",
				date: now - 9 * day,
				createdAt: now - 9 * day
			},
			{
				id: "e-deco",
				gatheringId: "g-bday",
				title: "بادکنک و دکور",
				amount: 35e4,
				category: "shopping",
				payerId: "sara",
				participantIds: [
					"me",
					"ali",
					"sara",
					"mehdi",
					"nazanin",
					"reza"
				],
				split: "equal",
				date: now - 9 * day,
				createdAt: now - 9 * day
			},
			{
				id: "e-taxi-b",
				gatheringId: "g-bday",
				title: "اسنپ",
				amount: 18e4,
				category: "transport",
				payerId: "reza",
				participantIds: [
					"me",
					"ali",
					"sara",
					"reza"
				],
				split: "equal",
				date: now - 8 * day,
				createdAt: now - 8 * day
			},
			{
				id: "e-music",
				gatheringId: "g-bday",
				title: "آهنگ و اسپیکر",
				amount: 22e4,
				category: "other",
				payerId: "mehdi",
				participantIds: [
					"me",
					"ali",
					"sara",
					"mehdi",
					"nazanin",
					"reza"
				],
				split: "equal",
				date: now - 10 * day,
				createdAt: now - 10 * day
			},
			{
				id: "e-drinks",
				gatheringId: "g-bday",
				title: "نوشیدنی",
				amount: 3e5,
				category: "food",
				payerId: "me",
				participantIds: [
					"me",
					"ali",
					"sara",
					"mehdi",
					"nazanin",
					"reza"
				],
				split: "equal",
				date: now - 8 * day,
				createdAt: now - 8 * day
			},
			{
				id: "e-hotel",
				gatheringId: "g-work",
				title: "هتل",
				amount: 12e5,
				category: "lodging",
				payerId: "me",
				participantIds: [
					"me",
					"mehdi",
					"kian"
				],
				split: "equal",
				date: now - 16 * day,
				createdAt: now - 16 * day
			},
			{
				id: "e-train",
				gatheringId: "g-work",
				title: "بلیط قطار",
				amount: 54e4,
				category: "transport",
				payerId: "kian",
				participantIds: [
					"me",
					"mehdi",
					"kian"
				],
				split: "equal",
				date: now - 18 * day,
				createdAt: now - 18 * day
			},
			{
				id: "e-lunch",
				gatheringId: "g-work",
				title: "ناهار کاری",
				amount: 28e4,
				category: "food",
				payerId: "mehdi",
				participantIds: [
					"me",
					"mehdi",
					"kian"
				],
				split: "equal",
				date: now - 16 * day,
				createdAt: now - 16 * day
			},
			{
				id: "e-cafe",
				gatheringId: "g-work",
				title: "کافه جلسه",
				amount: 16e4,
				category: "food",
				payerId: "me",
				participantIds: ["me", "kian"],
				split: "equal",
				date: now - 15 * day,
				createdAt: now - 15 * day
			},
			{
				id: "e-taxi-w",
				gatheringId: "g-work",
				title: "تاکسی فرودگاه",
				amount: 12e4,
				category: "transport",
				payerId: "kian",
				participantIds: [
					"me",
					"mehdi",
					"kian"
				],
				split: "equal",
				date: now - 15 * day,
				createdAt: now - 15 * day
			}
		],
		profile: {
			name: "نیکی",
			avatar: "/avatars/niki.jpg",
			defaultCurrency: "IRT",
			seenWelcome: false
		}
	};
}
function nextColor(people) {
	return PERSON_COLORS[people.length % PERSON_COLORS.length];
}
function remapExpense(e, from, to) {
	const shares = e.shares ? Object.fromEntries(Object.entries(e.shares).map(([k, v]) => [k === from ? to : k, v])) : e.shares;
	return {
		...e,
		payerId: e.payerId === from ? to : e.payerId,
		participantIds: e.participantIds.map((id) => id === from ? to : id),
		shares
	};
}
var seeded = seedNow();
var useDang = create()(persist((set, get) => ({
	hydrated: false,
	people: seeded.people,
	gatherings: seeded.gatherings,
	expenses: seeded.expenses,
	profile: seeded.profile,
	draft: null,
	setHydrated: () => {
		if (get().hydrated) return;
		set({ hydrated: true });
	},
	setSeenWelcome: () => set({ profile: {
		...get().profile,
		seenWelcome: true
	} }),
	updateProfile: (p) => {
		const profile = {
			...get().profile,
			...p
		};
		set({ profile });
		if (p.name || p.avatar) set({ people: get().people.map((x) => x.isMe ? {
			...x,
			name: profile.name,
			avatar: profile.avatar
		} : x) });
	},
	addPerson: (name, avatar) => {
		const id = uid("p-");
		const person = {
			id,
			name: name.trim() || "دوست جدید",
			avatar: avatar || "",
			color: nextColor(get().people)
		};
		set({ people: [...get().people, person] });
		return id;
	},
	updatePerson: (id, patch) => set({ people: get().people.map((p) => p.id === id ? {
		...p,
		...patch
	} : p) }),
	removePerson: (id) => {
		const person = get().people.find((p) => p.id === id);
		if (!person || person.isMe) return;
		set({
			people: get().people.filter((p) => p.id !== id),
			gatherings: get().gatherings.map((g) => ({
				...g,
				memberIds: g.memberIds.filter((m) => m !== id)
			}))
		});
	},
	addGathering: (g) => {
		const id = uid("g-");
		set({ gatherings: [{
			...g,
			id,
			createdAt: Date.now(),
			memberIds: g.memberIds.length ? g.memberIds : ["me"]
		}, ...get().gatherings] });
		return id;
	},
	updateGathering: (id, patch) => set({ gatherings: get().gatherings.map((g) => g.id === id ? {
		...g,
		...patch
	} : g) }),
	deleteGathering: (id) => set({
		gatherings: get().gatherings.filter((g) => g.id !== id),
		expenses: get().expenses.filter((e) => e.gatheringId !== id)
	}),
	addExpense: (e) => {
		const id = uid("e-");
		set({ expenses: [{
			...e,
			id,
			createdAt: Date.now()
		}, ...get().expenses] });
		return id;
	},
	updateExpense: (id, patch) => set({ expenses: get().expenses.map((e) => e.id === id ? {
		...e,
		...patch
	} : e) }),
	deleteExpense: (id) => set({ expenses: get().expenses.filter((e) => e.id !== id) }),
	setDraft: (d) => set({ draft: d }),
	patchDraft: (p) => {
		const d = get().draft;
		if (!d) return;
		set({ draft: {
			...d,
			...p
		} });
	},
	resetDemo: () => {
		const s = seedNow();
		set({
			people: s.people,
			gatherings: s.gatherings,
			expenses: s.expenses,
			profile: {
				...s.profile,
				seenWelcome: true
			},
			draft: null
		});
	},
	startFresh: () => {
		set({
			people: [{
				id: "me",
				name: get().profile.name || "من",
				avatar: get().profile.avatar,
				color: "person-5",
				isMe: true
			}],
			gatherings: [],
			expenses: [],
			draft: null,
			profile: {
				...get().profile,
				seenWelcome: false
			}
		});
	},
	joinGathering: (payload, claimId) => {
		const sourceId = payload.gathering.sourceId || payload.gathering.id;
		const already = get().gatherings.find((g) => g.sourceId === sourceId || g.id === sourceId);
		if (already) return already.id;
		const meId = get().people.find((p) => p.isMe)?.id ?? "me";
		const newId = uid("g-");
		let memberIds = [...payload.gathering.memberIds];
		let expenses = payload.expenses.map((e) => {
			const { receiptImage: _r, ...rest } = e;
			return {
				...rest,
				id: uid("e-"),
				gatheringId: newId
			};
		});
		let incoming = payload.people.filter((p) => p.id !== meId);
		if (claimId !== "new") {
			memberIds = memberIds.map((id) => id === claimId ? meId : id);
			expenses = expenses.map((e) => remapExpense(e, claimId, meId));
			incoming = incoming.filter((p) => p.id !== claimId);
		} else if (!memberIds.includes(meId)) memberIds = [meId, ...memberIds];
		const existingIds = new Set(get().people.map((p) => p.id));
		const extra = incoming.filter((p) => !existingIds.has(p.id)).map(({ isMe: _ignored, ...p }) => p);
		const gathering = {
			...payload.gathering,
			id: newId,
			sourceId,
			memberIds: [...new Set(memberIds)],
			createdAt: Date.now(),
			archived: false
		};
		set({
			people: [...get().people, ...extra],
			gatherings: [gathering, ...get().gatherings],
			expenses: [...expenses, ...get().expenses],
			profile: {
				...get().profile,
				seenWelcome: true
			}
		});
		return newId;
	},
	importGathering: ({ gathering, people, expenses }) => {
		return get().joinGathering({
			gathering,
			people,
			expenses
		}, "new");
	}
}), {
	name: "dangpal-v2",
	partialize: (s) => ({
		people: s.people,
		gatherings: s.gatherings,
		expenses: s.expenses,
		profile: s.profile
	}),
	onRehydrateStorage: () => (state) => {
		state?.setHydrated();
	}
}));
function makeDraft(gatheringId, defaults) {
	return {
		gatheringId,
		title: "",
		amount: 0,
		category: "food",
		payerId: defaults.payerId,
		participantIds: [...defaults.participantIds],
		split: "equal",
		shares: {},
		note: "",
		date: Date.now()
	};
}
function HydrateGate({ children }) {
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const finish = () => {
			useDang.getState().setHydrated();
			setReady(true);
		};
		if (useDang.persist.hasHydrated()) {
			finish();
			return;
		}
		return useDang.persist.onFinishHydration(finish);
	}, []);
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Splash, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-full min-h-0 flex-1 flex-col",
		children
	});
}
function Splash() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-full flex-col items-center justify-center bg-bg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex size-16 items-center justify-center rounded-3xl bg-primary text-2xl font-extrabold text-primary-fg shadow-[0_10px_24px_rgba(14,159,134,0.3)]",
					children: "د"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-extrabold text-primary",
					children: "دنگ‌پال"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-center gap-1 text-sm text-muted",
					children: ["خرج‌ها رو گروهی مدیریت کن", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeartMark, {})]
				})
			]
		})
	});
}
var styles_default = "/assets/styles-CFDnNo1c.css";
var APP_NAME = "دنگ‌پال";
var Route$17 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover"
			},
			{ title: APP_NAME },
			{
				name: "theme-color",
				content: "#0E9F86"
			},
			{
				name: "description",
				content: "خرج‌ها رو گروهی مدیریت کن · دنگ‌پال"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=Vazirmatn:wght@400;500;600;700;800&display=swap"
			}
		]
	}),
	component: Root
});
function Root() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "fa",
		dir: "rtl",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			className: "antialiased",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex min-h-dvh justify-center bg-frame md:items-center md:py-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						id: "app-phone",
						className: "relative flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-bg shadow-float md:h-[860px] md:rounded-[32px]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HydrateGate, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) })
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
					position: "top-center",
					richColors: true,
					dir: "rtl",
					toastOptions: { className: "font-[Vazirmatn] text-sm" }
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
			]
		})]
	});
}
var $$splitComponentImporter$16 = () => import("./routes-D3C3wH36.mjs");
var Route$16 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$16, "component") });
var $$splitComponentImporter$15 = () => import("./friends-DCIr0tzx.mjs");
var Route$15 = createFileRoute("/friends")({ component: lazyRouteComponent($$splitComponentImporter$15, "component") });
var $$splitComponentImporter$14 = () => import("./gatherings-3j_KxsuP.mjs");
var Route$14 = createFileRoute("/gatherings")({ component: lazyRouteComponent($$splitComponentImporter$14, "component") });
var $$splitComponentImporter$13 = () => import("./history-4sa__tf3.mjs");
var Route$13 = createFileRoute("/history")({ component: lazyRouteComponent($$splitComponentImporter$13, "component") });
var $$splitComponentImporter$12 = () => import("./join-DdWGdSHf.mjs");
var Route$12 = createFileRoute("/join")({ component: lazyRouteComponent($$splitComponentImporter$12, "component") });
var $$splitComponentImporter$11 = () => import("./more-Dp-mzzJp.mjs");
var Route$11 = createFileRoute("/more")({ component: lazyRouteComponent($$splitComponentImporter$11, "component") });
var $$splitComponentImporter$10 = () => import("./new-DWxUhRoE.mjs");
var Route$10 = createFileRoute("/new")({ component: lazyRouteComponent($$splitComponentImporter$10, "component") });
var $$splitComponentImporter$9 = () => import("./quick-BQJbhPTg.mjs");
var Route$9 = createFileRoute("/quick")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
var $$splitComponentImporter$8 = () => import("./scan-DwvVt-mu.mjs");
var Route$8 = createFileRoute("/scan")({
	validateSearch: (s) => ({ g: typeof s.g === "string" ? s.g : void 0 }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./welcome-DgAte_NZ.mjs");
var Route$7 = createFileRoute("/welcome")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./g._id-XtgdnkDz.mjs");
var Route$6 = createFileRoute("/g/$id")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("./g._id.index-DziqTVpd.mjs");
var Route$5 = createFileRoute("/g/$id/")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./g._id.add-Rcq0xtGr.mjs");
var Route$4 = createFileRoute("/g/$id/add")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./g._id.expenses-BmdXPT7g.mjs");
var Route$3 = createFileRoute("/g/$id/expenses")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./g._id.remind-DDMDb9Xo.mjs");
var Route$2 = createFileRoute("/g/$id/remind")({
	validateSearch: (s) => ({
		from: typeof s.from === "string" ? s.from : void 0,
		to: typeof s.to === "string" ? s.to : void 0,
		amount: typeof s.amount === "string" ? s.amount : void 0
	}),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./g._id.settle-BnSp_NGQ.mjs");
var Route$1 = createFileRoute("/g/$id/settle")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./g._id.split-BuB9Avc0.mjs");
var Route = createFileRoute("/g/$id/split")({
	validateSearch: (s) => ({ from: typeof s.from === "string" ? s.from : void 0 }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var IndexRoute = Route$16.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$17
});
var FriendsRoute = Route$15.update({
	id: "/friends",
	path: "/friends",
	getParentRoute: () => Route$17
});
var GatheringsRoute = Route$14.update({
	id: "/gatherings",
	path: "/gatherings",
	getParentRoute: () => Route$17
});
var HistoryRoute = Route$13.update({
	id: "/history",
	path: "/history",
	getParentRoute: () => Route$17
});
var JoinRoute = Route$12.update({
	id: "/join",
	path: "/join",
	getParentRoute: () => Route$17
});
var MoreRoute = Route$11.update({
	id: "/more",
	path: "/more",
	getParentRoute: () => Route$17
});
var NewRoute = Route$10.update({
	id: "/new",
	path: "/new",
	getParentRoute: () => Route$17
});
var QuickRoute = Route$9.update({
	id: "/quick",
	path: "/quick",
	getParentRoute: () => Route$17
});
var ScanRoute = Route$8.update({
	id: "/scan",
	path: "/scan",
	getParentRoute: () => Route$17
});
var WelcomeRoute = Route$7.update({
	id: "/welcome",
	path: "/welcome",
	getParentRoute: () => Route$17
});
var GIdRoute = Route$6.update({
	id: "/g/$id",
	path: "/g/$id",
	getParentRoute: () => Route$17
});
var GIdIndexRoute = Route$5.update({
	id: "/",
	path: "/",
	getParentRoute: () => GIdRoute
});
var GIdRouteChildren = {
	GIdAddRoute: Route$4.update({
		id: "/add",
		path: "/add",
		getParentRoute: () => GIdRoute
	}),
	GIdExpensesRoute: Route$3.update({
		id: "/expenses",
		path: "/expenses",
		getParentRoute: () => GIdRoute
	}),
	GIdRemindRoute: Route$2.update({
		id: "/remind",
		path: "/remind",
		getParentRoute: () => GIdRoute
	}),
	GIdSettleRoute: Route$1.update({
		id: "/settle",
		path: "/settle",
		getParentRoute: () => GIdRoute
	}),
	GIdSplitRoute: Route.update({
		id: "/split",
		path: "/split",
		getParentRoute: () => GIdRoute
	}),
	GIdIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	FriendsRoute,
	GatheringsRoute,
	HistoryRoute,
	JoinRoute,
	MoreRoute,
	NewRoute,
	QuickRoute,
	ScanRoute,
	WelcomeRoute,
	GIdRoute: GIdRoute._addFileChildren(GIdRouteChildren)
};
var routeTree = Route$17._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { COVERS as a, HeartMark as c, CATEGORIES as i, TopBar as l, makeDraft as n, CURRENCIES as o, useDang as r, AppScreen as s, router_exports as t, cn as u };
