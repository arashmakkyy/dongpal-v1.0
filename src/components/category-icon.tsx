import type { Category } from "@/lib/types";
import {
  Fuel,
  Home,
  ShoppingCart,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { cn } from "@/lib/utils";

const meta: Record<
  Category,
  { icon: typeof Home; wrap: string; fg: string }
> = {
  lodging: {
    icon: Home,
    wrap: "bg-primary-soft",
    fg: "text-primary",
  },
  food: {
    icon: UtensilsCrossed,
    wrap: "bg-accent-soft",
    fg: "text-accent",
  },
  transport: {
    icon: Fuel,
    wrap: "bg-success-soft",
    fg: "text-person-3",
  },
  shopping: {
    icon: ShoppingCart,
    wrap: "bg-pink-soft",
    fg: "text-pink",
  },
  other: {
    icon: Sparkles,
    wrap: "bg-track",
    fg: "text-muted",
  },
};

export function CategoryIcon({
  category,
  size = 40,
}: {
  category: Category;
  size?: number;
}) {
  const m = meta[category];
  const Icon = m.icon;
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-2xl",
        m.wrap,
        m.fg,
      )}
      style={{ width: size, height: size }}
    >
      <Icon className="size-[18px]" strokeWidth={2.1} />
    </div>
  );
}
