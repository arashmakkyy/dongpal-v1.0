import { i as __toESM } from "../_runtime.mjs";
import { W as require_react, b as useNavigate, w as require_jsx_runtime, x as useSearch } from "../_libs/@tanstack/react-router+[...].mjs";
import { F as Bolt, N as Camera, w as Image, x as LoaderCircle } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { l as TopBar, n as makeDraft, r as useDang, s as AppScreen } from "./router-DVGuM8Ia.mjs";
import { t as Button } from "./button-bgaJ7srM.mjs";
import { t as compressImage } from "./image-DYl4nrN-.mjs";
import { d as parseAmount, n as convertIrtIrr, o as formatMoney, r as currencyLabel } from "./format-Bi7-O-sI.mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/scan-DwvVt-mu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var SAMPLE_RECEIPT = {
	merchant: "رستوران خوب",
	items: [
		{
			title: "غذای اصلی",
			amount: 12e5
		},
		{
			title: "سالاد",
			amount: 25e4
		},
		{
			title: "نوشیدنی",
			amount: 25e4
		},
		{
			title: "دسر",
			amount: 2e5
		}
	],
	tax: 189e3,
	total: 2289e3,
	unit: "IRT",
	category: "food"
};
function receiptGrand(p) {
	if (p.total && p.total > 0) return Math.round(p.total);
	const items = p.items.reduce((s, i) => s + (i.amount || 0), 0);
	return Math.round(items + (p.tax || 0) + (p.tip || 0));
}
function guessCategory(merchant = "") {
	const t = merchant.toLowerCase();
	if (/هتل|اقامت|hotel|villa|ویلا/.test(t)) return "lodging";
	if (/تاکسی|اسنپ|تپسی|uber|taxi|بنزین|metro|مترو/.test(t)) return "transport";
	if (/فروشگاه|مارکت|سوپر|digikala|store|mall/.test(t)) return "shopping";
	if (/رستوران|کافه|قهوه|food|cafe|restaurant/.test(t)) return "food";
	return "food";
}
function num(v) {
	if (typeof v === "number" && Number.isFinite(v)) return Math.round(v);
	if (typeof v === "string") {
		const n = Number(v.replace(/[^\d.-]/g, ""));
		return Number.isFinite(n) ? Math.round(n) : 0;
	}
	return 0;
}
function coerceUnit(v) {
	if (typeof v !== "string") return void 0;
	const s = v.toLowerCase();
	if (s === "rial" || s === "irr" || s === "ریال") return "IRR";
	if (s === "toman" || s === "irt" || s === "تومان") return "IRT";
	if (s === "other") return "other";
}
function coerceReceipt(raw) {
	const p = raw && typeof raw === "object" ? raw : {};
	const items = (Array.isArray(p.items) ? p.items : []).map((it) => {
		const row = it && typeof it === "object" ? it : {};
		return {
			title: String(row.title ?? row.name ?? "قلم").trim() || "قلم",
			amount: num(row.amount ?? row.price)
		};
	}).filter((it) => it.amount > 0 || it.title);
	const parsed = {
		merchant: String(p.merchant ?? p.store ?? "").trim() || void 0,
		items,
		tax: num(p.tax) || void 0,
		tip: num(p.tip) || void 0,
		total: num(p.total) || void 0,
		unit: coerceUnit(p.unit),
		category: guessCategory(String(p.merchant ?? ""))
	};
	if (!parsed.total) parsed.total = receiptGrand(parsed) || void 0;
	return parsed;
}
var parseReceiptImage = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("3f7ec66f07736f43c16536dd8b61f701c5a527117b88d320cc85c9ad69ee24f2"));
function unitLabel(u) {
	return u === "IRT" ? "تومان" : "ریال";
}
function toMoneyUnit(u) {
	return u === "IRR" ? "IRR" : "IRT";
}
function ScanScreen() {
	const navigate = useNavigate();
	const search = useSearch({ strict: false });
	const videoRef = (0, import_react.useRef)(null);
	const fileRef = (0, import_react.useRef)(null);
	const streamRef = (0, import_react.useRef)(null);
	const [noCam, setNoCam] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [parsed, setParsed] = (0, import_react.useState)(null);
	const [shot, setShot] = (0, import_react.useState)(null);
	const gatherings = useDang((s) => s.gatherings);
	const people = useDang((s) => s.people);
	const setDraft = useDang((s) => s.setDraft);
	const [armed, setArmed] = (0, import_react.useState)(false);
	const [flash, setFlash] = (0, import_react.useState)(false);
	const [receiptUnit, setReceiptUnit] = (0, import_react.useState)("IRT");
	const [override, setOverride] = (0, import_react.useState)(null);
	const [targetG, setTargetG] = (0, import_react.useState)(search.g);
	(0, import_react.useEffect)(() => {
		if (search.g) setTargetG(search.g);
	}, [search.g]);
	(0, import_react.useEffect)(() => {
		if (!armed) return;
		let cancelled = false;
		navigator.mediaDevices?.getUserMedia({ video: { facingMode: { ideal: "environment" } } }).then((stream) => {
			if (cancelled) {
				stream.getTracks().forEach((t) => t.stop());
				return;
			}
			streamRef.current = stream;
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				videoRef.current.play();
			}
		}).catch(() => setNoCam(true));
		return () => {
			cancelled = true;
			streamRef.current?.getTracks().forEach((t) => t.stop());
		};
	}, [armed]);
	async function handleImage(dataUrl) {
		setBusy(true);
		setParsed(null);
		setOverride(null);
		try {
			const compact = await compressImage(dataUrl);
			setShot(compact);
			const res = await parseReceiptImage({ data: { image: compact } });
			if (res.ok && (res.data.items.length || res.data.total)) {
				const data = coerceReceipt(res.data);
				setParsed(data);
				setReceiptUnit(toMoneyUnit(data.unit));
				toast.success("رسید خوانده شد — واحد را چک کن");
			} else toast.message("نتونستیم دقیق بخونیم — مبلغ را دستی وارد کن یا از نمونه استفاده کن");
		} catch {
			toast.message("اسکن در دسترس نیست — مبلغ را دستی وارد کن");
		} finally {
			setBusy(false);
		}
	}
	function capture() {
		if (!armed) {
			setArmed(true);
			return;
		}
		const video = videoRef.current;
		if (!video || !video.videoWidth) {
			toast.message("دوربین آماده نیست — از گالری یا نمونه رسید استفاده کن");
			return;
		}
		const canvas = document.createElement("canvas");
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		canvas.getContext("2d")?.drawImage(video, 0, 0);
		handleImage(canvas.toDataURL("image/jpeg", .85));
	}
	async function toggleFlash() {
		const track = streamRef.current?.getVideoTracks()[0];
		const caps = track?.getCapabilities?.();
		if (track && caps?.torch) try {
			await track.applyConstraints({ advanced: [{ torch: !flash }] });
			setFlash((v) => !v);
			return;
		} catch {}
		setFlash((v) => !v);
		toast.message(flash ? "فلاش خاموش" : "فلاش در این دستگاه در دسترس نیست");
	}
	const gathering = gatherings.find((g) => g.id === targetG) ?? gatherings[0] ?? null;
	const rawTotal = parsed ? override != null ? override : receiptGrand(parsed) : override ?? 0;
	const destCurrency = gathering?.currency ?? "IRT";
	const converted = destCurrency === "USD" || destCurrency === "EUR" ? rawTotal : convertIrtIrr(rawTotal, receiptUnit, destCurrency === "IRR" ? "IRR" : "IRT");
	const needsConvert = destCurrency !== "USD" && destCurrency !== "EUR" && receiptUnit !== destCurrency;
	function apply() {
		if (!gathering) {
			toast.error("اول یک دورهمی بساز");
			navigate({ to: "/new" });
			return;
		}
		if (converted <= 0) {
			toast.error("مبلغ رسید را وارد کن");
			return;
		}
		const me = people.find((x) => x.isMe);
		const p = parsed ?? {
			items: [],
			merchant: "رسید"
		};
		const noteParts = [
			...p.items.map((i) => i.title),
			p.tax ? `مالیات ${formatMoney(p.tax)}` : "",
			p.tip ? `انعام ${formatMoney(p.tip)}` : "",
			needsConvert ? `تبدیل از ${unitLabel(receiptUnit)}` : ""
		].filter(Boolean);
		setDraft({
			...makeDraft(gathering.id, {
				payerId: me && gathering.memberIds.includes(me.id) ? me.id : gathering.memberIds[0],
				participantIds: gathering.memberIds
			}),
			title: p.merchant || "رسید",
			amount: converted,
			note: noteParts.join("، "),
			category: p.category || guessCategory(p.merchant),
			receiptImage: shot || void 0
		});
		toast.success(`ثبت با ${formatMoney(converted)} ${currencyLabel(gathering.currency)}`);
		navigate({
			to: "/g/$id/add",
			params: { id: gathering.id }
		});
	}
	function useSample() {
		setParsed(SAMPLE_RECEIPT);
		setReceiptUnit("IRT");
		setOverride(null);
		setShot("/illustrations/receipt.jpg");
		toast.success("نمونه رسید آماده شد — واحد: تومان");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppScreen, {
		nav: !search.g,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
			title: "اسکن رسید",
			subtitle: "با یک عکس، همه‌چیز ساده‌تر",
			onBack: search.g ? () => navigate({
				to: "/g/$id",
				params: { id: search.g }
			}) : () => navigate({ to: "/" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-5 pb-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative aspect-3/4 overflow-hidden rounded-[28px] bg-fg",
					children: [
						armed && !noCam ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
							ref: videoRef,
							playsInline: true,
							muted: true,
							className: "absolute inset-0 size-full object-cover"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: shot || "/illustrations/receipt.jpg",
							alt: "نمونه رسید",
							className: "absolute inset-0 size-full object-cover"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "pointer-events-none absolute inset-8",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute start-0 top-0 h-10 w-10 rounded-ss-2xl border-s-4 border-t-4 border-primary" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute end-0 top-0 h-10 w-10 rounded-se-2xl border-e-4 border-t-4 border-primary" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute start-0 bottom-0 h-10 w-10 rounded-es-2xl border-s-4 border-b-4 border-primary" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute end-0 bottom-0 h-10 w-10 rounded-ee-2xl border-e-4 border-b-4 border-primary" })
							]
						}),
						!armed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setArmed(true),
							className: "absolute inset-x-8 top-1/2 flex -translate-y-1/2 flex-col items-center gap-2 rounded-3xl bg-fg/55 px-4 py-5 text-primary-fg backdrop-blur-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-7" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-bold",
									children: "دوربین را روشن کن"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs opacity-80",
									children: "یا از گالری عکس بگذار"
								})
							]
						}),
						armed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "absolute inset-x-0 bottom-16 text-center text-sm font-semibold text-primary-fg",
							children: "رسید را در کادر قرار دهید"
						}),
						busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-0 flex items-center justify-center bg-fg/50",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-10 animate-spin text-primary-fg" })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex items-center justify-around",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex size-12 cursor-pointer items-center justify-center rounded-2xl bg-surface text-muted shadow-card",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, { className: "size-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								ref: fileRef,
								type: "file",
								accept: "image/*",
								className: "hidden",
								onChange: (e) => {
									const f = e.target.files?.[0];
									e.target.value = "";
									if (!f) return;
									const reader = new FileReader();
									reader.onload = () => {
										if (typeof reader.result === "string") handleImage(reader.result);
									};
									reader.readAsDataURL(f);
								}
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: capture,
							className: "flex items-center justify-center rounded-full bg-primary shadow-[0_10px_24px_rgba(14,159,134,0.35)]",
							style: {
								width: 72,
								height: 72
							},
							"aria-label": "عکس",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-14 rounded-full border-4 border-primary-fg" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => void toggleFlash(),
							className: `flex size-12 items-center justify-center rounded-2xl shadow-card ${flash ? "bg-primary text-primary-fg" : "bg-surface text-muted"}`,
							"aria-label": "فلاش",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bolt, { className: "size-5" })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "soft",
					block: true,
					className: "mt-6",
					onClick: useSample,
					children: "استفاده از نمونه رسید رستوران"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 rounded-3xl bg-surface p-4 shadow-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-bold",
							children: "واحد مبالغ رسید"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-[11px] leading-5 text-muted",
							children: "بیشتر رسیدهای کارتخوان به ریال‌اند؛ منوها معمولاً تومان. اگر اشتباه انتخاب شود مبلغ ۱۰ برابر غلط می‌شود."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 grid grid-cols-2 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setReceiptUnit("IRT"),
								className: `rounded-2xl py-3 text-sm font-bold ${receiptUnit === "IRT" ? "bg-primary text-primary-fg" : "bg-bg text-muted"}`,
								children: "تومان"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setReceiptUnit("IRR"),
								className: `rounded-2xl py-3 text-sm font-bold ${receiptUnit === "IRR" ? "bg-primary text-primary-fg" : "bg-bg text-muted"}`,
								children: "ریال"
							})]
						})
					]
				}),
				!search.g && gatherings.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 rounded-3xl bg-surface p-4 shadow-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 text-sm font-bold",
						children: "ثبت در کدام دورهمی؟"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-col gap-1.5",
						children: gatherings.filter((g) => !g.archived).map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setTargetG(g.id),
							className: `rounded-2xl px-3 py-2.5 text-start text-sm font-semibold ${targetG === g.id ? "bg-primary-soft text-primary" : "bg-bg text-fg"}`,
							children: [g.name, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "ms-2 text-xs font-medium text-muted",
								children: ["· ", currencyLabel(g.currency)]
							})]
						}, g.id))
					})]
				}),
				parsed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 rounded-3xl bg-surface p-4 shadow-card anim-pop",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-bold",
							children: parsed.merchant || "رسید"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "mt-2 space-y-1 text-sm",
							children: [
								parsed.items.map((it, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "min-w-0 truncate",
										children: it.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "shrink-0 tabular font-semibold",
										children: formatMoney(it.amount)
									})]
								}, `${it.title}-${i}`)),
								parsed.tax ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex justify-between text-muted",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "مالیات" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tabular",
										children: formatMoney(parsed.tax)
									})]
								}) : null,
								parsed.tip ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex justify-between text-muted",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "انعام" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tabular",
										children: formatMoney(parsed.tip)
									})]
								}) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 border-t border-border pt-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted",
								children: [
									"مبلغ کل رسید (",
									unitLabel(receiptUnit),
									")"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								inputMode: "numeric",
								dir: "ltr",
								value: rawTotal ? formatMoney(rawTotal) : "",
								onChange: (e) => setOverride(parseAmount(e.target.value)),
								className: "mt-1 w-full bg-transparent text-[22px] font-extrabold tabular outline-none"
							})]
						}),
						gathering && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: `mt-2 rounded-2xl px-3 py-2 text-sm font-semibold ${needsConvert ? "bg-accent-soft text-accent" : "bg-primary-soft text-primary"}`,
							children: needsConvert ? `ثبت در دورهمی: ${formatMoney(converted)} ${currencyLabel(gathering.currency)}` : `ثبت می‌شود: ${formatMoney(converted)} ${currencyLabel(gathering.currency)}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							block: true,
							className: "mt-4",
							onClick: apply,
							disabled: converted <= 0,
							children: "افزودن به هزینه"
						})
					]
				}),
				!parsed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 rounded-3xl bg-surface p-4 shadow-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-bold",
							children: "ورود دستی مبلغ"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-[11px] text-muted",
							children: "اگر اسکن خوانده نشد، مبلغ را اینجا بنویس."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							inputMode: "numeric",
							dir: "ltr",
							value: override ? formatMoney(override) : "",
							onChange: (e) => setOverride(parseAmount(e.target.value) || null),
							placeholder: "0",
							className: "mt-2 w-full bg-transparent text-[22px] font-extrabold tabular outline-none"
						}),
						gathering && override ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-muted",
							children: needsConvert ? `ثبت: ${formatMoney(converted)} ${currencyLabel(gathering.currency)}` : `${formatMoney(converted)} ${currencyLabel(gathering.currency)}`
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							block: true,
							className: "mt-3",
							disabled: !override,
							onClick: apply,
							children: "افزودن به هزینه"
						})
					]
				})
			]
		})]
	});
}
var SplitComponent = ScanScreen;
//#endregion
export { SplitComponent as component };
