import { PersonAvatar, youName } from "@/components/person";
import { AppScreen, TopBar } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/sheet";
import { CurrencyPicker } from "@/components/currency-picker";
import { AvatarPicker } from "@/components/avatar-picker";
import { COVERS, type Currency, type Person } from "@/lib/types";
import { useDang } from "@/lib/store";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

export function NewGatheringScreen() {
  const navigate = useNavigate();
  const people = useDang((s) => s.people);
  const profile = useDang((s) => s.profile);
  const addGathering = useDang((s) => s.addGathering);
  const addPerson = useDang((s) => s.addPerson);
  const [name, setName] = useState("");
  const [cover, setCover] = useState<string>(COVERS[0].src);
  const [currency, setCurrency] = useState<Currency>(profile.defaultCurrency);
  const me = people.find((p) => p.isMe);
  const [members, setMembers] = useState<string[]>(me ? [me.id] : []);
  const [friendOpen, setFriendOpen] = useState(false);
  const [newFriend, setNewFriend] = useState("");
  const [newAvatar, setNewAvatar] = useState("");

  function toggle(id: string) {
    if (me && id === me.id) return;
    setMembers((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));
  }

  function create() {
    if (!name.trim()) {
      toast.error("یک اسم برای دورهمی بنویس");
      return;
    }
    const id = addGathering({
      name: name.trim(),
      cover,
      memberIds: members,
      currency,
    });
    toast.success("دورهمی ساخته شد");
    navigate({ to: "/g/$id", params: { id } });
  }

  return (
    <AppScreen>
      <TopBar title="دورهمی جدید" onBack={() => navigate({ to: "/" })} />
      <div className="px-5 pb-8">
        <label className="mb-2 block text-sm text-muted">اسم دورهمی</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="مثلاً شمال · آخر هفته"
          className="h-13 w-full rounded-2xl border border-border bg-surface px-4"
        />

        <p className="mb-2 mt-5 text-sm text-muted">کاور</p>
        <div className="grid grid-cols-4 gap-2">
          {COVERS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCover(c.src)}
              className={`overflow-hidden rounded-2xl ring-2 ${
                cover === c.src ? "ring-primary" : "ring-transparent"
              }`}
            >
              <img src={c.src} alt={c.label} className="aspect-4/3 w-full object-cover" />
            </button>
          ))}
        </div>

        <p className="mb-2 mt-5 text-sm text-muted">ارز</p>
        <CurrencyPicker value={currency} onChange={setCurrency} />

        <p className="mb-2 mt-5 text-sm text-muted">دوست‌ها</p>
        <div className="flex flex-col gap-1 rounded-3xl bg-surface p-2 shadow-card">
          {people.map((p: Person) => {
            const on = members.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggle(p.id)}
                className="flex items-center gap-3 rounded-2xl px-2 py-2"
              >
                <PersonAvatar person={p} size={40} />
                <span className="flex-1 font-semibold">{youName(p)}</span>
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
        </div>
        <Button
          variant="outline"
          block
          className="mt-2"
          onClick={() => {
            setNewFriend("");
            setNewAvatar("");
            setFriendOpen(true);
          }}
        >
          افزودن دوست جدید
        </Button>

        <Button block className="mt-6" onClick={create}>
          ساختن دورهمی
        </Button>
      </div>
      <Sheet open={friendOpen} onClose={() => setFriendOpen(false)} title="دوست جدید">
        <input
          value={newFriend}
          onChange={(e) => setNewFriend(e.target.value)}
          placeholder="اسم دوست"
          className="mb-4 h-13 w-full rounded-2xl border border-border bg-bg px-4"
        />
        <p className="mb-2 text-sm font-semibold">آواتار</p>
        <AvatarPicker value={newAvatar} onChange={setNewAvatar} name={newFriend} />
        <Button
          block
          className="mt-4"
          onClick={() => {
            if (!newFriend.trim()) {
              toast.error("اسم را بنویس");
              return;
            }
            const id = addPerson(newFriend.trim(), newAvatar);
            setMembers((m) => [...m, id]);
            setFriendOpen(false);
            toast.success("دوست اضافه شد");
          }}
        >
          افزودن
        </Button>
      </Sheet>
    </AppScreen>
  );
}
