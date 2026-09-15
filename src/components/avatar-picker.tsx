import { PersonAvatar } from "@/components/person";
import { compressImage } from "@/lib/image";
import type { PersonColor } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Camera } from "lucide-react";
import { useRef } from "react";

export const PRESET_AVATARS = [
  "/avatars/niki.jpg",
  "/avatars/ali.jpg",
  "/avatars/sara.jpg",
  "/avatars/mehdi.jpg",
  "/avatars/nazanin.jpg",
  "/avatars/reza.jpg",
  "/avatars/elham.jpg",
  "/avatars/kian.jpg",
] as const;

export function AvatarPicker({
  value,
  onChange,
  name = "؟",
  color = "person-1",
}: {
  value: string;
  onChange: (src: string) => void;
  name?: string;
  color?: PersonColor;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const raw = String(reader.result || "");
      const small = await compressImage(raw, 320, 0.82);
      onChange(small);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <div className="mb-3 flex justify-center">
        <PersonAvatar
          person={{ name, avatar: value, color }}
          size={72}
        />
      </div>
      <div className="grid grid-cols-5 gap-2">
        {PRESET_AVATARS.map((src) => {
          const on = value === src;
          return (
            <button
              key={src}
              type="button"
              onClick={() => onChange(src)}
              className={cn(
                "overflow-hidden rounded-full ring-2 ring-offset-2 ring-offset-surface",
                on ? "ring-primary" : "ring-transparent",
              )}
              aria-label="انتخاب آواتار"
            >
              <img src={src} alt="" className="aspect-square w-full object-cover" />
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex aspect-square items-center justify-center rounded-full bg-bg text-muted ring-2 ring-transparent"
          aria-label="آپلود عکس"
        >
          <Camera className="size-4" />
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void onFile(e.target.files?.[0])}
      />
    </div>
  );
}
