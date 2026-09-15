import { AvatarPicker } from "@/components/avatar-picker";
import { PersonAvatar } from "@/components/person";
import { HeartMark } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { currencyLabel, formatMoney } from "@/lib/format";
import { findJoinedGathering, packSourceId } from "@/lib/join";
import {
  clearInvite,
  decodePack,
  peekInvite,
  peekSyncId,
  readInviteFromLocation,
  readSyncIdFromLocation,
  stashInvite,
  stashSyncId,
  type SharePack,
} from "@/lib/pack";
import { gatheringTotal } from "@/lib/settle";
import { useDang } from "@/lib/store";
import { fetchRoomPack } from "@/lib/sync";
import { cn } from "@/lib/utils";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function JoinScreen() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { p?: string; s?: string };
  const joinGathering = useDang((s) => s.joinGathering);
  const gatherings = useDang((s) => s.gatherings);
  const profile = useDang((s) => s.profile);
  const [picked, setPicked] = useState<string | "new" | null>(null);
  const [pack, setPack] = useState<SharePack | null | "wait">("wait");
  const [name, setName] = useState(profile.name === "من" ? "" : profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const syncId = search.s || readSyncIdFromLocation() || peekSyncId();
      if (syncId) {
        stashSyncId(syncId);
        try {
          const room = await fetchRoomPack(syncId);
          if (cancelled) return;
          if (!room) {
            setPack(null);
            return;
          }
          setPack(room.pack);
          return;
        } catch {
          if (!cancelled) setPack(null);
          return;
        }
      }
      const raw = search.p || readInviteFromLocation() || peekInvite();
      if (!raw) {
        setPack(null);
        return;
      }
      const decoded = decodePack(raw);
      if (decoded) stashInvite(raw);
      if (!cancelled) setPack(decoded);
    }
    void load();
    const onChange = () => {
      void load();
    };
    window.addEventListener("hashchange", onChange);
    window.addEventListener("popstate", onChange);
    return () => {
      cancelled = true;
      window.removeEventListener("hashchange", onChange);
      window.removeEventListener("popstate", onChange);
    };
  }, [search.s, search.p]);

  function goHome() {
    clearInvite();
    navigate({ to: "/" });
  }

  if (leaving) {
    return (
      <InviteShell>
        <p className="text-sm text-muted">داریم می‌بریم‌ت تو دورهمی…</p>
      </InviteShell>
    );
  }

  if (pack === "wait") {
    return (
      <InviteShell>
        <p className="text-sm text-muted">داریم دعوت رو باز می‌کنیم…</p>
      </InviteShell>
    );
  }

  if (!pack) {
    return (
      <InviteShell>
        <div className="w-full rounded-[28px] bg-surface px-5 py-8 text-center shadow-card">
          <p className="text-lg font-extrabold">این لینک دعوت معتبر نیست</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            از دوستت بخواه لینک دورهمی را دوباره برات بفرستد.
          </p>
          <Button block className="mt-5 rounded-full" onClick={goHome}>
            برو به دنگ‌پال
            <ArrowLeft className="size-4" />
          </Button>
        </div>
      </InviteShell>
    );
  }

  const sourceId = packSourceId(pack);
  const already = findJoinedGathering(gatherings, sourceId);
  const total = gatheringTotal(pack.expenses);
  const unit = currencyLabel(pack.gathering.currency);
  const cover = pack.gathering.cover || "/covers/cafe.jpg";

  function confirm() {
    if (!pack || pack === "wait") return;
    if (!already && !picked) return;
    if (picked === "new" && !name.trim()) {
      toast.error("اسم خودت را بنویس");
      return;
    }
    const id = already
      ? already.id
      : joinGathering(
          pack,
          picked ?? "new",
          picked === "new"
            ? { name: name.trim(), avatar }
            : undefined,
        );
    clearInvite();
    setLeaving(true);
    toast.success("دورهمی به لیستت اضافه شد");
    void navigate({ to: "/g/$id", params: { id }, replace: true });
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-bg">
      <div className="relative h-[34%] min-h-[180px] max-h-[280px] shrink-0">
        <img
          src={cover}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-bg" />
        <button
          type="button"
          onClick={goHome}
          className="absolute right-4 top-5 z-10 flex size-11 items-center justify-center rounded-2xl bg-white/85 text-fg shadow-card backdrop-blur-md"
          aria-label="بازگشت"
        >
          <ArrowLeft className="size-5 rtl:rotate-180" />
        </button>
        <span className="absolute inset-x-0 top-6 z-10 flex justify-center">
          <span className="rounded-full bg-white/85 px-3 py-1 text-sm font-extrabold text-primary shadow-card backdrop-blur-md">
            دنگ‌پال
          </span>
        </span>
      </div>

      <div className="relative z-10 -mt-10 min-h-0 flex-1 overflow-y-auto rounded-t-[32px] bg-bg px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-1">
        <div className="mx-auto mb-3 mt-2 h-1.5 w-12 rounded-full bg-border" />

        <p className="text-center text-xs font-medium text-primary">
          دعوت شدی به دورهمی
        </p>
        <h1 className="mt-1 text-center text-[28px] font-extrabold leading-tight">
          {pack.gathering.name}
        </h1>
        <p className="mt-2 flex items-center justify-center gap-1 text-center text-sm text-muted">
          {pack.people.length} نفر · {pack.expenses.length} هزینه ·{" "}
          <bdi className="font-bold text-fg tabular">
            {formatMoney(total)}
          </bdi>{" "}
          {unit}
          <HeartMark className="size-3.5" />
        </p>

        <div className="mt-4 flex justify-center">
          <div className="flex items-center">
            {pack.people.slice(0, 5).map((p, i) => (
              <div
                key={p.id}
                className="relative"
                style={{ marginInlineStart: i === 0 ? 0 : -10 }}
              >
                <PersonAvatar person={p} size={36} />
              </div>
            ))}
          </div>
        </div>

        {already ? (
          <div className="mt-6">
            <p className="text-center text-sm text-muted">
              این دورهمی از قبل توی لیستته.
            </p>
            <Button block className="mt-4 rounded-full" onClick={confirm}>
              باز کردن دورهمی
              <ArrowLeft className="size-4" />
            </Button>
          </div>
        ) : (
          <>
            <h2 className="mt-6 text-[15px] font-extrabold">
              تو کدوم یکی هستی؟
            </h2>
            <p className="mt-1 text-xs leading-5 text-muted">
              انتخاب کن تا سهم‌ها و بدهی‌ها به‌اسم «تو» دیده بشه. این فقط روی
              دستگاه خودت اعمال می‌شود.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {pack.people.map((p) => {
                const on = picked === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPicked(p.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-3xl bg-surface px-3 py-3 text-start shadow-card ring-2 transition-transform active:scale-[0.98]",
                      on ? "ring-primary" : "ring-transparent",
                    )}
                  >
                    <PersonAvatar person={p} size={48} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold">{p.name}</span>
                      <span className="text-[11px] text-muted">
                        عضو این دورهمی
                      </span>
                    </span>
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full border text-[10px]",
                        on
                          ? "border-primary bg-primary text-primary-fg"
                          : "border-border",
                      )}
                    >
                      {on ? "✓" : ""}
                    </span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setPicked("new")}
                className={cn(
                  "flex items-center gap-3 rounded-3xl bg-surface px-3 py-3 text-start shadow-card ring-2 transition-transform active:scale-[0.98]",
                  picked === "new" ? "ring-primary" : "ring-transparent",
                )}
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <UserPlus className="size-5" />
                </span>
                <span className="flex-1 font-bold">من توی این لیست نیستم</span>
              </button>
            </div>

            {picked === "new" ? (
              <div className="mt-4 rounded-3xl bg-surface p-4 shadow-card">
                <p className="mb-2 text-sm font-bold">اسم و آواتار خودت</p>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mb-3 h-12 w-full rounded-2xl border border-border bg-bg px-4"
                  placeholder="مثلاً مریم"
                  autoFocus
                />
                <AvatarPicker
                  value={avatar}
                  onChange={setAvatar}
                  name={name || "؟"}
                />
              </div>
            ) : null}

            <Button
              block
              className="mt-5 rounded-full"
              disabled={!picked}
              onClick={confirm}
            >
              ورود به دورهمی
              <ArrowLeft className="size-4" />
            </Button>
            <p className="mt-3 text-center text-[11px] text-muted">
              بدون ثبت‌نام · هزینه‌ها لحظه‌ای برای همه آپدیت می‌شود
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function InviteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-welcome px-6">
      <div className="mb-5 flex size-16 items-center justify-center rounded-3xl bg-primary text-2xl font-extrabold text-primary-fg shadow-[0_10px_24px_rgba(14,159,134,0.3)]">
        د
      </div>
      <h1 className="text-2xl font-extrabold text-primary">دنگ‌پال</h1>
      <div className="mt-6 w-full max-w-sm">{children}</div>
    </div>
  );
}
