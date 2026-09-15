import { PersonAvatar, youName } from "@/components/person";
import { AppScreen, TopBar } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/sheet";
import { AvatarPicker } from "@/components/avatar-picker";
import { useDang } from "@/lib/store";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function FriendsScreen() {
  const navigate = useNavigate();
  const people = useDang((s) => s.people);
  const addPerson = useDang((s) => s.addPerson);
  const updatePerson = useDang((s) => s.updatePerson);
  const updateProfile = useDang((s) => s.updateProfile);
  const removePerson = useDang((s) => s.removePerson);
  const gatherings = useDang((s) => s.gatherings);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");

  const editing = people.find((p) => p.id === editId);

  function closeForms() {
    setOpen(false);
    setEditId(null);
    setName("");
    setAvatar("");
  }

  return (
    <AppScreen>
      <TopBar title="دوستان" onBack={() => navigate({ to: "/more" })} />
      <div className="px-5 pb-8">
        <div className="flex flex-col gap-2">
          {people.map((p) => {
            const n = gatherings.filter((g) => g.memberIds.includes(p.id)).length;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setEditId(p.id);
                  setName(p.name);
                  setAvatar(p.avatar);
                }}
                className="flex w-full items-center gap-3 rounded-3xl bg-surface px-3 py-3 text-start shadow-card"
              >
                <PersonAvatar person={p} size={48} />
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{youName(p)}</p>
                  <p className="text-xs text-muted">{n} دورهمی مشترک</p>
                </div>
                {!p.isMe && (
                  <span
                    role="button"
                    className="flex size-10 items-center justify-center rounded-2xl text-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePerson(p.id);
                      toast.success("حذف شد");
                    }}
                    aria-label="حذف"
                  >
                    <Trash2 className="size-4" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <Button
          block
          className="mt-5"
          onClick={() => {
            setName("");
            setAvatar("");
            setOpen(true);
          }}
        >
          <Plus className="size-4" />
          افزودن دوست
        </Button>
      </div>
      <Sheet open={open} onClose={closeForms} title="دوست جدید">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="اسم دوست"
          className="mb-4 h-13 w-full rounded-2xl border border-border bg-bg px-4"
        />
        <p className="mb-2 text-sm font-semibold">آواتار</p>
        <AvatarPicker value={avatar} onChange={setAvatar} name={name} />
        <Button
          block
          className="mt-4"
          onClick={() => {
            if (!name.trim()) {
              toast.error("اسم را بنویس");
              return;
            }
            addPerson(name.trim(), avatar);
            closeForms();
            toast.success("اضافه شد");
          }}
        >
          افزودن
        </Button>
      </Sheet>
      <Sheet
        open={!!editing}
        onClose={closeForms}
        title={editing?.isMe ? "پروفایل تو" : "ویرایش دوست"}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4 h-13 w-full rounded-2xl border border-border bg-bg px-4"
        />
        <p className="mb-2 text-sm font-semibold">آواتار</p>
        <AvatarPicker value={avatar} onChange={setAvatar} name={name} />
        <Button
          block
          className="mt-4"
          onClick={() => {
            if (!editing) return;
            const next = name.trim() || editing.name;
            if (editing.isMe) {
              updateProfile({ name: next, avatar });
            } else {
              updatePerson(editing.id, { name: next, avatar });
            }
            closeForms();
            toast.success("ذخیره شد");
          }}
        >
          ذخیره
        </Button>
      </Sheet>
    </AppScreen>
  );
}
