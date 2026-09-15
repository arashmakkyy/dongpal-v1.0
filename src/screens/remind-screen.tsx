import { AppScreen, HeartMark, TopBar } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { currencyLabel, formatMoney } from "@/lib/format";
import {
  baleLink,
  copyText,
  nativeShare,
  reminderText,
  smsLink,
  tgLink,
  waLink,
} from "@/lib/share";
import { useDang } from "@/lib/store";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { toast } from "sonner";

export function RemindScreen() {
  const { id } = useParams({ strict: false }) as { id: string };
  const search = useSearch({ strict: false }) as {
    from?: string;
    to?: string;
    amount?: string;
  };
  const navigate = useNavigate();
  const gathering = useDang((s) => s.gatherings.find((g) => g.id === id));
  const people = useDang((s) => s.people);
  const from = people.find((p) => p.id === search.from) ?? people[0];
  const to = people.find((p) => p.id === search.to) ?? people[1];
  const amount = Number(search.amount || 0);

  if (!gathering) {
    return (
      <AppScreen>
        <TopBar title="یادآوری" onBack={() => navigate({ to: "/" })} />
      </AppScreen>
    );
  }

  const text = reminderText({
    toName: from?.name ?? "دوست",
    amount: amount || 0,
    currency: gathering.currency,
    gatheringName: gathering.name,
    toPayName: to?.name ?? "دوست",
  });

  const channels = [
    { id: "wa", label: "واتساپ", href: waLink(text), color: "bg-[#E8F8EF] text-[#1FAD66]" },
    { id: "tg", label: "تلگرام", href: tgLink(text), color: "bg-[#E7F3FE] text-[#2A9EDC]" },
    { id: "sms", label: "پیامک", href: smsLink(text), color: "bg-[#E8F4FF] text-[#3B82C4]" },
    { id: "bale", label: "بله", href: baleLink(text), color: "bg-accent-soft text-accent" },
  ];

  return (
    <AppScreen>
      <TopBar
        title="یادآوری دوستانه"
        subtitle="با یک پیام، حساب‌وکتاب رو راحت کن"
        onBack={() =>
          navigate({ to: "/g/$id/settle", params: { id: gathering.id } })
        }
      />
      <div className="px-5 pb-8">
        <div className="relative mx-auto mb-2 flex w-full max-w-[300px] items-start justify-center gap-2 pt-2">
          <img
            src="/illustrations/plane.jpg"
            alt=""
            className="w-[180px] object-contain"
          />
          <div className="mt-6 rounded-2xl bg-accent-soft px-3 py-2 text-xs font-bold leading-5 text-accent">
            به یادآوری دوستانه
            <HeartMark className="ms-1 inline size-3 align-text-bottom" />
          </div>
        </div>

        <div className="mt-2 rounded-3xl bg-surface p-4 text-sm leading-7 shadow-card">
          {text.split("\n").map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2">
          {channels.map((c) => (
            <a
              key={c.id}
              href={c.href}
              target="_blank"
              rel="noreferrer"
              className={`flex min-h-[76px] flex-col items-center justify-center gap-1 rounded-3xl text-[11px] font-semibold ${c.color}`}
            >
              {c.label}
            </a>
          ))}
        </div>

        <Button
          block
          className="mt-6"
          onClick={async () => {
            const ok = await nativeShare("دنگ‌پال", text);
            if (!ok) {
              await copyText(text);
              toast.success("پیام کپی شد");
            }
          }}
        >
          ارسال یادآوری
          <Send className="size-4 rtl:rotate-180" />
        </Button>
        <p className="mt-3 text-center text-xs text-muted">
          سهم {from?.name}: <bdi className="tabular">{formatMoney(amount)}</bdi>{" "}
          {currencyLabel(gathering.currency)}
        </p>
      </div>
    </AppScreen>
  );
}
