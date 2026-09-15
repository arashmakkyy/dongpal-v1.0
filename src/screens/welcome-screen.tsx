import { Button } from "@/components/ui/button";
import { HeartMark } from "@/components/shell";
import { Sheet } from "@/components/sheet";
import { AvatarPicker } from "@/components/avatar-picker";
import { useDang } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState, type CSSProperties } from "react";

export function WelcomeScreen() {
  const navigate = useNavigate();
  const setSeen = useDang((s) => s.setSeenWelcome);
  const updateProfile = useDang((s) => s.updateProfile);
  const profile = useDang((s) => s.profile);
  const [login, setLogin] = useState(false);
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);

  function goHome() {
    setSeen();
    navigate({ to: "/" });
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-welcome">
      <img
        src="/illustrations/hero.jpg?v=3"
        alt=""
        className="pointer-events-none absolute inset-0 size-full object-cover object-[center_18%]"
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-welcome via-welcome/85 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-welcome from-40% via-welcome/90 to-transparent" />

      <header className="relative z-10 shrink-0 px-6 pt-8 text-center">
        <h1 className="text-[40px] font-extrabold leading-none text-primary">
          دنگ‌پال
        </h1>
        <p className="mt-3 text-[15px] leading-7 text-fg">
          خرج‌هامون با هم،
          <br />
          <span className="inline-flex items-center justify-center gap-1">
            دوستی‌هامون همیشگی
            <HeartMark className="size-4" />
          </span>
        </p>
      </header>

      <div className="relative min-h-0 flex-1">
        <HandTag
          style={{ left: 16, top: "12%" }}
          rotate={-12}
          label="اسکن رسید"
        />
        <HandTag
          style={{ right: 16, top: "6%" }}
          rotate={11}
          label="تقسیم عادلانه"
        />
        <HandTag
          style={{ right: 28, bottom: "18%" }}
          rotate={-8}
          label="سبک‌تر"
          spark
        />
      </div>

      <div className="relative z-20 shrink-0">
        <div className="h-10 bg-gradient-to-t from-welcome to-transparent" />
        <div className="rounded-t-[36px] bg-welcome px-6 pb-[max(20px,env(safe-area-inset-bottom))] pt-1">
          <Button block className="rounded-full" onClick={goHome}>
            شروع کنیم
            <ArrowLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            block
            className="mt-3 rounded-full shadow-card"
            onClick={() => setLogin(true)}
          >
            ورود به حساب کاربری
          </Button>
          <p className="mt-3 text-center text-[11px] text-muted">
            بدون ثبت‌نام هم می‌تونی استفاده کنی
          </p>
        </div>
      </div>

      <Sheet open={login} onClose={() => setLogin(false)} title="حساب کاربری">
        <p className="mb-3 text-sm text-muted">
          اسم و آواتار روی هزینه‌ها و تسویه به‌جای «تو» می‌آید.
        </p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4 h-13 w-full rounded-2xl border border-border bg-bg px-4"
          placeholder="مثلاً نیکی"
          autoFocus
        />
        <p className="mb-2 text-sm font-semibold">آواتار</p>
        <AvatarPicker value={avatar} onChange={setAvatar} name={name} />
        <Button
          block
          className="mt-5 rounded-full"
          onClick={() => {
            updateProfile({
              name: name.trim() || "نیکی",
              avatar,
            });
            setLogin(false);
            goHome();
          }}
        >
          ادامه
        </Button>
      </Sheet>
    </div>
  );
}

function HandTag({
  label,
  className,
  style,
  rotate,
  spark,
}: {
  label: string;
  className?: string;
  style?: CSSProperties;
  rotate: number;
  spark?: boolean;
}) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute z-10 select-none",
        className,
      )}
      style={{ transform: `rotate(${rotate}deg)`, ...style }}
    >
      <span className="relative inline-flex items-center gap-1">
        {spark ? (
          <svg
            viewBox="0 0 16 16"
            className="size-3.5 fill-primary text-primary"
            aria-hidden
          >
            <path d="M8 0l1.2 5.2L14 8l-4.8 1.6L8 16l-1.2-6.4L2 8l4.8-2.8z" />
          </svg>
        ) : null}
        <span className="font-hand text-[18px] leading-none text-primary">
          {label}
        </span>
      </span>
      <svg
        viewBox="0 0 96 12"
        className="mt-0.5 h-2.5 w-[6.2rem] text-primary"
        fill="none"
        aria-hidden
      >
        <path
          d="M2 8c18-5 28 4 46-2 14-5 28 3 42-1"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
