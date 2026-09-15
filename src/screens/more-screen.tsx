import { PersonAvatar, youName } from "@/components/person";
import { AppScreen, HeartMark } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/sheet";
import { CurrencyPicker } from "@/components/currency-picker";
import { AvatarPicker } from "@/components/avatar-picker";
import { type Currency } from "@/lib/types";
import { useDang } from "@/lib/store";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronLeft,
  RotateCcw,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function MoreScreen() {
  const navigate = useNavigate();
  const profile = useDang((s) => s.profile);
  const people = useDang((s) => s.people);
  const me = people.find((p) => p.isMe);
  const updateProfile = useDang((s) => s.updateProfile);
  const resetDemo = useDang((s) => s.resetDemo);
  const startFresh = useDang((s) => s.startFresh);
  const [nameOpen, setNameOpen] = useState(false);
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);

  const items = [
    {
      icon: Users,
      label: "دوستان",
      hint: `${people.length} نفر`,
      to: "/friends" as const,
    },
    {
      icon: Sparkles,
      label: "تقسیم سریع",
      hint: "حساب رستوران و تاکسی",
      to: "/quick" as const,
    },
    {
      icon: UserPlus,
      label: "دورهمی جدید",
      hint: "سفر، تولد، شام",
      to: "/new" as const,
    },
  ];

  return (
    <AppScreen nav>
      <div className="px-5 pb-8 pt-6">
        <h1 className="mb-4 text-xl font-extrabold">بیشتر</h1>
        <button
          type="button"
          onClick={() => {
            setName(profile.name);
            setAvatar(profile.avatar);
            setNameOpen(true);
          }}
          className="mb-4 flex w-full items-center gap-3 rounded-3xl bg-surface p-4 shadow-card"
        >
          <PersonAvatar person={me} size={56} />
          <div className="min-w-0 flex-1">
            <p className="font-bold">{youName(me)}</p>
            <p className="text-xs text-muted">ویرایش نام و آواتار</p>
          </div>
          <ChevronLeft className="size-4 text-subtle" />
        </button>

        <div className="overflow-hidden rounded-3xl bg-surface shadow-card">
          {items.map((it) => (
            <Link
              key={it.label}
              to={it.to}
              className="flex items-center gap-3 border-b border-border px-4 py-3.5 last:border-0"
            >
              <span className="flex size-10 items-center justify-center rounded-2xl bg-bg text-primary">
                <it.icon className="size-4" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-bold">{it.label}</span>
                <span className="text-xs text-muted">{it.hint}</span>
              </span>
              <ChevronLeft className="size-4 text-subtle" />
            </Link>
          ))}
        </div>

        <div className="mt-4 rounded-3xl bg-surface p-4 shadow-card">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-bg text-primary">
              <Wallet className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">ارز پیش‌فرض</p>
              <p className="text-[11px] text-muted">برای دورهمی و تقسیم سریع</p>
            </div>
          </div>
          <CurrencyPicker
            value={profile.defaultCurrency}
            onChange={(c: Currency) =>
              updateProfile({ defaultCurrency: c })
            }
          />
        </div>

        <div className="mt-4 overflow-hidden rounded-3xl bg-surface shadow-card">
          <button
            type="button"
            className="flex w-full items-center gap-3 border-b border-border px-4 py-3.5"
            onClick={() => {
              updateProfile({ seenWelcome: false });
              navigate({ to: "/welcome" });
            }}
          >
            <HeartMark className="size-4" />
            <span className="text-sm font-semibold">صفحه خوشامد</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-3 border-b border-border px-4 py-3.5"
            onClick={() => {
              resetDemo();
              toast.success("دیتای نمونه برگشت");
              navigate({ to: "/" });
            }}
          >
            <RotateCcw className="size-4 text-muted" />
            <span className="text-sm font-semibold">بازگردانی دیتای نمونه</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-3 px-4 py-3.5 text-danger"
            onClick={() => {
              startFresh();
              toast.success("از نو شروع شد");
              navigate({ to: "/" });
            }}
          >
            <Trash2 className="size-4" />
            <span className="text-sm font-semibold">شروع تازه</span>
          </button>
        </div>

        <p className="mt-8 text-center text-xs text-muted">
          دنگ‌پال · خرج‌ها رو گروهی، دوستی رو همیشگی
        </p>
      </div>

      <Sheet open={nameOpen} onClose={() => setNameOpen(false)} title="پروفایل">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4 h-13 w-full rounded-2xl border border-border bg-bg px-4"
          placeholder="اسم تو"
        />
        <p className="mb-2 text-sm font-semibold">آواتار</p>
        <AvatarPicker value={avatar} onChange={setAvatar} name={name} />
        <Button
          block
          className="mt-4"
          onClick={() => {
            updateProfile({
              name: name.trim() || profile.name,
              avatar,
            });
            setNameOpen(false);
            toast.success("ذخیره شد");
          }}
        >
          ذخیره
        </Button>
      </Sheet>
    </AppScreen>
  );
}
