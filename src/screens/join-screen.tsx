import { PersonAvatar } from "@/components/person";
import { AppScreen, TopBar } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { decodePack, readJoinHash, type SharePack } from "@/lib/pack";
import { useDang } from "@/lib/store";
import { useNavigate } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function JoinScreen() {
  const navigate = useNavigate();
  const joinGathering = useDang((s) => s.joinGathering);
  const gatherings = useDang((s) => s.gatherings);
  const [picked, setPicked] = useState<string | "new" | null>(null);
  const [pack, setPack] = useState<SharePack | null | "wait">("wait");

  useEffect(() => {
    const hash = readJoinHash(window.location.hash);
    const q = new URLSearchParams(window.location.search).get("p");
    setPack(decodePack(hash || q || ""));
  }, []);

  if (pack === "wait") {
    return (
      <AppScreen>
        <TopBar title="دعوت" onBack={() => navigate({ to: "/" })} />
      </AppScreen>
    );
  }

  if (!pack) {
    return (
      <AppScreen>
        <TopBar title="پیوستن" onBack={() => navigate({ to: "/" })} />
        <div className="px-5">
          <p className="rounded-3xl bg-surface px-4 py-8 text-center text-sm text-muted shadow-card">
            این لینک دعوت معتبر نیست یا منقضی شده.
          </p>
          <Button block className="mt-4" onClick={() => navigate({ to: "/" })}>
            برو به خانه
          </Button>
        </div>
      </AppScreen>
    );
  }

  const sourceId = pack.gathering.sourceId || pack.gathering.id;
  const already = gatherings.find(
    (g) => g.sourceId === sourceId || g.id === sourceId,
  );

  function confirm() {
    if (!pack || pack === "wait") return;
    const id = joinGathering(pack, picked ?? "new");
    toast.success("دورهمی به لیستت اضافه شد");
    navigate({ to: "/g/$id", params: { id } });
  }

  return (
    <AppScreen>
      <TopBar title="دعوت به دورهمی" onBack={() => navigate({ to: "/" })} />
      <div className="px-5 pb-8">
        <div className="overflow-hidden rounded-[28px] bg-surface shadow-card">
          <img
            src={pack.gathering.cover}
            alt=""
            className="h-28 w-full object-cover"
          />
          <div className="px-4 py-3">
            <h2 className="text-lg font-extrabold">{pack.gathering.name}</h2>
            <p className="mt-1 text-xs text-muted">
              {pack.people.length} نفر · {pack.expenses.length} هزینه
            </p>
          </div>
        </div>

        {already ? (
          <>
            <p className="mt-5 text-sm text-muted">
              این دورهمی از قبل توی لیستته.
            </p>
            <Button
              block
              className="mt-4"
              onClick={() =>
                navigate({ to: "/g/$id", params: { id: already.id } })
              }
            >
              باز کردن
            </Button>
          </>
        ) : (
          <>
            <h3 className="mt-6 text-sm font-bold">تو کدوم یکی هستی؟</h3>
            <p className="mt-1 text-xs text-muted">
              انتخاب کن تا سهم‌ها و بدهی‌ها به‌اسم «تو» دیده بشه.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {pack.people.map((p) => {
                const on = picked === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPicked(p.id)}
                    className={`flex items-center gap-3 rounded-3xl bg-surface px-3 py-3 text-start shadow-card ring-2 ${
                      on ? "ring-primary" : "ring-transparent"
                    }`}
                  >
                    <PersonAvatar person={p} size={48} />
                    <span className="flex-1 font-bold">{p.name}</span>
                    <span
                      className={`flex size-6 items-center justify-center rounded-full border text-[10px] ${
                        on
                          ? "border-primary bg-primary text-primary-fg"
                          : "border-border"
                      }`}
                    >
                      {on ? "✓" : ""}
                    </span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setPicked("new")}
                className={`flex items-center gap-3 rounded-3xl bg-surface px-3 py-3 text-start shadow-card ring-2 ${
                  picked === "new" ? "ring-primary" : "ring-transparent"
                }`}
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <UserPlus className="size-5" />
                </span>
                <span className="flex-1 font-bold">من توی این لیست نیستم</span>
              </button>
            </div>
            <Button
              block
              className="mt-5"
              disabled={!picked}
              onClick={confirm}
            >
              ورود به دورهمی
            </Button>
          </>
        )}
      </div>
    </AppScreen>
  );
}
