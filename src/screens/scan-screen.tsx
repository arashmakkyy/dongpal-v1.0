import { AppScreen, TopBar } from "@/components/shell";
import { Button } from "@/components/ui/button";
import {
  SAMPLE_RECEIPT,
  coerceReceipt,
  guessCategory,
  parseReceiptImage,
  receiptGrand,
  type ReceiptParse,
  type ReceiptUnit,
} from "@/lib/ocr";
import { compressImage } from "@/lib/image";
import {
  convertIrtIrr,
  currencyLabel,
  formatMoney,
  parseAmount,
} from "@/lib/format";
import { makeDraft, useDang } from "@/lib/store";
import type { Currency } from "@/lib/types";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Bolt, Camera, ImageIcon, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

function unitLabel(u: "IRT" | "IRR") {
  return u === "IRT" ? "تومان" : "ریال";
}

function toMoneyUnit(u: ReceiptUnit | undefined): "IRT" | "IRR" {
  return u === "IRR" ? "IRR" : "IRT";
}

export function ScanScreen() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { g?: string };
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [noCam, setNoCam] = useState(false);
  const [busy, setBusy] = useState(false);
  const [parsed, setParsed] = useState<ReceiptParse | null>(null);
  const [shot, setShot] = useState<string | null>(null);
  const gatherings = useDang((s) => s.gatherings);
  const people = useDang((s) => s.people);
  const setDraft = useDang((s) => s.setDraft);
  const [armed, setArmed] = useState(false);
  const [flash, setFlash] = useState(false);
  const [receiptUnit, setReceiptUnit] = useState<"IRT" | "IRR">("IRT");
  const [override, setOverride] = useState<number | null>(null);
  const [targetG, setTargetG] = useState<string | undefined>(search.g);

  useEffect(() => {
    if (search.g) setTargetG(search.g);
  }, [search.g]);

  useEffect(() => {
    if (!armed) return;
    let cancelled = false;
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: { ideal: "environment" } } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      })
      .catch(() => setNoCam(true));
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [armed]);

  async function handleImage(dataUrl: string) {
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
      } else {
        toast.message("نتونستیم دقیق بخونیم — مبلغ را دستی وارد کن یا از نمونه استفاده کن");
      }
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
    void handleImage(canvas.toDataURL("image/jpeg", 0.85));
  }

  async function toggleFlash() {
    const track = streamRef.current?.getVideoTracks()[0];
    const caps = track?.getCapabilities?.() as { torch?: boolean } | undefined;
    if (track && caps?.torch) {
      try {
        await track.applyConstraints({
          advanced: [{ torch: !flash } as unknown as MediaTrackConstraintSet],
        });
        setFlash((v) => !v);
        return;
      } catch {
        /* fall through */
      }
    }
    setFlash((v) => !v);
    toast.message(flash ? "فلاش خاموش" : "فلاش در این دستگاه در دسترس نیست");
  }

  const gathering =
    gatherings.find((g) => g.id === targetG) ?? gatherings[0] ?? null;
  const rawTotal = parsed
    ? override != null
      ? override
      : receiptGrand(parsed)
    : override ?? 0;
  const destCurrency: Currency = gathering?.currency ?? "IRT";
  const converted =
    destCurrency === "USD" || destCurrency === "EUR"
      ? rawTotal
      : convertIrtIrr(rawTotal, receiptUnit, destCurrency === "IRR" ? "IRR" : "IRT");
  const needsConvert =
    destCurrency !== "USD" &&
    destCurrency !== "EUR" &&
    receiptUnit !== destCurrency;

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
    const p = parsed ?? { items: [], merchant: "رسید" };
    const noteParts = [
      ...p.items.map((i) => i.title),
      p.tax ? `مالیات ${formatMoney(p.tax)}` : "",
      p.tip ? `انعام ${formatMoney(p.tip)}` : "",
      needsConvert
        ? `تبدیل از ${unitLabel(receiptUnit)}`
        : "",
    ].filter(Boolean);
    setDraft({
      ...makeDraft(gathering.id, {
        payerId:
          me && gathering.memberIds.includes(me.id)
            ? me.id
            : gathering.memberIds[0],
        participantIds: gathering.memberIds,
      }),
      title: p.merchant || "رسید",
      amount: converted,
      note: noteParts.join("، "),
      category: p.category || guessCategory(p.merchant),
      receiptImage: shot || undefined,
    });
    toast.success(
      `ثبت با ${formatMoney(converted)} ${currencyLabel(gathering.currency)}`,
    );
    navigate({ to: "/g/$id/add", params: { id: gathering.id } });
  }

  function useSample() {
    setParsed(SAMPLE_RECEIPT);
    setReceiptUnit("IRT");
    setOverride(null);
    setShot("/illustrations/receipt.jpg");
    toast.success("نمونه رسید آماده شد — واحد: تومان");
  }

  return (
    <AppScreen nav={!search.g}>
      <TopBar
        title="اسکن رسید"
        subtitle="با یک عکس، همه‌چیز ساده‌تر"
        onBack={
          search.g
            ? () => navigate({ to: "/g/$id", params: { id: search.g! } })
            : () => navigate({ to: "/" })
        }
      />
      <div className="px-5 pb-8">
        <div className="relative aspect-3/4 overflow-hidden rounded-[28px] bg-fg">
          {armed && !noCam ? (
            <video
              ref={videoRef}
              playsInline
              muted
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <img
              src={shot || "/illustrations/receipt.jpg"}
              alt="نمونه رسید"
              className="absolute inset-0 size-full object-cover"
            />
          )}
          <div className="pointer-events-none absolute inset-8">
            <span className="absolute start-0 top-0 h-10 w-10 rounded-ss-2xl border-s-4 border-t-4 border-primary" />
            <span className="absolute end-0 top-0 h-10 w-10 rounded-se-2xl border-e-4 border-t-4 border-primary" />
            <span className="absolute start-0 bottom-0 h-10 w-10 rounded-es-2xl border-s-4 border-b-4 border-primary" />
            <span className="absolute end-0 bottom-0 h-10 w-10 rounded-ee-2xl border-e-4 border-b-4 border-primary" />
          </div>
          {!armed && (
            <button
              type="button"
              onClick={() => setArmed(true)}
              className="absolute inset-x-8 top-1/2 flex -translate-y-1/2 flex-col items-center gap-2 rounded-3xl bg-fg/55 px-4 py-5 text-primary-fg backdrop-blur-sm"
            >
              <Camera className="size-7" />
              <span className="text-sm font-bold">دوربین را روشن کن</span>
              <span className="text-xs opacity-80">یا از گالری عکس بگذار</span>
            </button>
          )}
          {armed && (
            <p className="absolute inset-x-0 bottom-16 text-center text-sm font-semibold text-primary-fg">
              رسید را در کادر قرار دهید
            </p>
          )}
          {busy && (
            <div className="absolute inset-0 flex items-center justify-center bg-fg/50">
              <Loader2 className="size-10 animate-spin text-primary-fg" />
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-around">
          <label className="flex size-12 cursor-pointer items-center justify-center rounded-2xl bg-surface text-muted shadow-card">
            <ImageIcon className="size-5" />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (!f) return;
                const reader = new FileReader();
                reader.onload = () => {
                  if (typeof reader.result === "string") void handleImage(reader.result);
                };
                reader.readAsDataURL(f);
              }}
            />
          </label>
          <button
            type="button"
            onClick={capture}
            className="flex items-center justify-center rounded-full bg-primary shadow-[0_10px_24px_rgba(14,159,134,0.35)]"
            style={{ width: 72, height: 72 }}
            aria-label="عکس"
          >
            <span className="size-14 rounded-full border-4 border-primary-fg" />
          </button>
          <button
            type="button"
            onClick={() => void toggleFlash()}
            className={`flex size-12 items-center justify-center rounded-2xl shadow-card ${
              flash ? "bg-primary text-primary-fg" : "bg-surface text-muted"
            }`}
            aria-label="فلاش"
          >
            <Bolt className="size-5" />
          </button>
        </div>

        <Button variant="soft" block className="mt-6" onClick={useSample}>
          استفاده از نمونه رسید رستوران
        </Button>

        <div className="mt-4 rounded-3xl bg-surface p-4 shadow-card">
          <p className="text-sm font-bold">واحد مبالغ رسید</p>
          <p className="mt-1 text-[11px] leading-5 text-muted">
            بیشتر رسیدهای کارتخوان به ریال‌اند؛ منوها معمولاً تومان. اگر اشتباه
            انتخاب شود مبلغ ۱۰ برابر غلط می‌شود.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setReceiptUnit("IRT")}
              className={`rounded-2xl py-3 text-sm font-bold ${
                receiptUnit === "IRT"
                  ? "bg-primary text-primary-fg"
                  : "bg-bg text-muted"
              }`}
            >
              تومان
            </button>
            <button
              type="button"
              onClick={() => setReceiptUnit("IRR")}
              className={`rounded-2xl py-3 text-sm font-bold ${
                receiptUnit === "IRR"
                  ? "bg-primary text-primary-fg"
                  : "bg-bg text-muted"
              }`}
            >
              ریال
            </button>
          </div>
        </div>

        {!search.g && gatherings.length > 1 && (
          <div className="mt-3 rounded-3xl bg-surface p-4 shadow-card">
            <p className="mb-2 text-sm font-bold">ثبت در کدام دورهمی؟</p>
            <div className="flex flex-col gap-1.5">
              {gatherings
                .filter((g) => !g.archived)
                .map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setTargetG(g.id)}
                    className={`rounded-2xl px-3 py-2.5 text-start text-sm font-semibold ${
                      targetG === g.id
                        ? "bg-primary-soft text-primary"
                        : "bg-bg text-fg"
                    }`}
                  >
                    {g.name}
                    <span className="ms-2 text-xs font-medium text-muted">
                      · {currencyLabel(g.currency)}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        )}

        {parsed && (
          <div className="mt-4 rounded-3xl bg-surface p-4 shadow-card anim-pop">
            <p className="font-bold">{parsed.merchant || "رسید"}</p>
            <ul className="mt-2 space-y-1 text-sm">
              {parsed.items.map((it, i) => (
                <li key={`${it.title}-${i}`} className="flex justify-between gap-3">
                  <span className="min-w-0 truncate">{it.title}</span>
                  <span className="shrink-0 tabular font-semibold">
                    {formatMoney(it.amount)}
                  </span>
                </li>
              ))}
              {parsed.tax ? (
                <li className="flex justify-between text-muted">
                  <span>مالیات</span>
                  <span className="tabular">{formatMoney(parsed.tax)}</span>
                </li>
              ) : null}
              {parsed.tip ? (
                <li className="flex justify-between text-muted">
                  <span>انعام</span>
                  <span className="tabular">{formatMoney(parsed.tip)}</span>
                </li>
              ) : null}
            </ul>
            <div className="mt-3 border-t border-border pt-3">
              <p className="text-xs text-muted">مبلغ کل رسید ({unitLabel(receiptUnit)})</p>
              <input
                inputMode="numeric"
                dir="ltr"
                value={rawTotal ? formatMoney(rawTotal) : ""}
                onChange={(e) => setOverride(parseAmount(e.target.value))}
                className="mt-1 w-full bg-transparent text-[22px] font-extrabold tabular outline-none"
              />
            </div>
            {gathering && (
              <p
                className={`mt-2 rounded-2xl px-3 py-2 text-sm font-semibold ${
                  needsConvert
                    ? "bg-accent-soft text-accent"
                    : "bg-primary-soft text-primary"
                }`}
              >
                {needsConvert
                  ? `ثبت در دورهمی: ${formatMoney(converted)} ${currencyLabel(gathering.currency)}`
                  : `ثبت می‌شود: ${formatMoney(converted)} ${currencyLabel(gathering.currency)}`}
              </p>
            )}
            <Button block className="mt-4" onClick={apply} disabled={converted <= 0}>
              افزودن به هزینه
            </Button>
          </div>
        )}

        {!parsed && (
          <div className="mt-4 rounded-3xl bg-surface p-4 shadow-card">
            <p className="text-sm font-bold">ورود دستی مبلغ</p>
            <p className="mt-1 text-[11px] text-muted">
              اگر اسکن خوانده نشد، مبلغ را اینجا بنویس.
            </p>
            <input
              inputMode="numeric"
              dir="ltr"
              value={override ? formatMoney(override) : ""}
              onChange={(e) => setOverride(parseAmount(e.target.value) || null)}
              placeholder="0"
              className="mt-2 w-full bg-transparent text-[22px] font-extrabold tabular outline-none"
            />
            {gathering && override ? (
              <p className="mt-2 text-xs text-muted">
                {needsConvert
                  ? `ثبت: ${formatMoney(converted)} ${currencyLabel(gathering.currency)}`
                  : `${formatMoney(converted)} ${currencyLabel(gathering.currency)}`}
              </p>
            ) : null}
            <Button
              block
              className="mt-3"
              disabled={!override}
              onClick={apply}
            >
              افزودن به هزینه
            </Button>
          </div>
        )}
      </div>
    </AppScreen>
  );
}
