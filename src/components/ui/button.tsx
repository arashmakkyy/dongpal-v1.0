import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "accent" | "soft" | "lavender" | "ghost" | "outline" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-fg shadow-[0_8px_20px_rgba(14,159,134,0.28)] hover:bg-primary-deep",
  accent: "bg-accent text-accent-fg shadow-[0_8px_20px_rgba(123,103,246,0.28)]",
  soft: "bg-accent-soft text-accent",
  lavender: "bg-chip text-accent",
  ghost: "bg-transparent text-fg",
  outline: "bg-surface text-fg border border-border",
  danger: "bg-danger-soft text-danger",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  block?: boolean;
  size?: "md" | "lg" | "sm" | "icon";
};

export function Button({
  className,
  variant = "primary",
  block,
  size = "lg",
  type = "button",
  children,
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-[transform,background-color,box-shadow] duration-150 ease-out active:not-disabled:scale-[0.96] disabled:opacity-45",
        size === "lg" && "h-13 min-h-[52px] px-5 text-[15px]",
        size === "md" && "h-11 min-h-[44px] px-4 text-sm",
        size === "sm" && "h-9 min-h-[36px] px-3 text-sm",
        size === "icon" && "size-11 min-h-[44px] rounded-2xl p-0",
        block && "w-full",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
