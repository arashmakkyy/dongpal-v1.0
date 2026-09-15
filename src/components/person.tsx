import type { Person, PersonColor } from "@/lib/types";
import { cn } from "@/lib/utils";

const colorClass: Record<PersonColor, string> = {
  "person-1": "bg-person-1",
  "person-2": "bg-person-2",
  "person-3": "bg-person-3",
  "person-4": "bg-person-4",
  "person-5": "bg-person-5",
  "person-6": "bg-person-6",
};

export function youName(
  person?: Pick<Person, "name" | "isMe"> | null,
  fallback = "دوست",
) {
  if (!person) return fallback;
  return person.isMe ? "تو" : person.name;
}

export function PersonAvatar({
  person,
  size = 40,
  className,
}: {
  person?: Pick<Person, "name" | "avatar" | "color"> | null;
  size?: number;
  className?: string;
}) {
  const name = person?.name ?? "؟";
  const style = { width: size, height: size };
  if (person?.avatar) {
    return (
      <img
        src={person.avatar}
        alt={name}
        width={size}
        height={size}
        className={cn(
          "rounded-full object-cover ring-2 ring-surface",
          className,
        )}
        style={style}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full text-white ring-2 ring-surface font-semibold",
        colorClass[person?.color ?? "person-1"],
        className,
      )}
      style={{ ...style, fontSize: size * 0.38 }}
      aria-label={name}
    >
      {name.slice(0, 1)}
    </div>
  );
}

export function AvatarStack({
  people,
  max = 4,
  size = 28,
}: {
  people: Person[];
  max?: number;
  size?: number;
}) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <div className="flex items-center">
      {shown.map((p, i) => (
        <div
          key={p.id}
          className="relative"
          style={{ marginInlineStart: i === 0 ? 0 : -(size * 0.32) }}
        >
          <PersonAvatar person={p} size={size} />
        </div>
      ))}
      {extra > 0 && (
        <div
          className="relative flex items-center justify-center rounded-full bg-track text-[11px] font-semibold text-muted ring-2 ring-surface"
          style={{
            width: size,
            height: size,
            marginInlineStart: -(size * 0.32),
          }}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}
