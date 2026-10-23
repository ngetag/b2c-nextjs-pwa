import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

type NgetagLogoVariant = "default" | "dark" | "mono";
type NgetagLogoLockup = "horizontal" | "icon";

interface NgetagLogoProps {
  variant?: NgetagLogoVariant;
  lockup?: NgetagLogoLockup;
  className?: string;
  iconClassName?: string;
  wordmarkClassName?: string;
}

const variantStyle: Record<NgetagLogoVariant, CSSProperties> = {
  default: {
    "--logo-mark": "#FF8A1F",
    "--logo-word": "#2D2D2D",
  } as CSSProperties,
  dark: {
    "--logo-mark": "#FF8A1F",
    "--logo-word": "#F4FBFF",
  } as CSSProperties,
  mono: {
    "--logo-mark": "currentColor",
    "--logo-word": "currentColor",
  } as CSSProperties,
};

export function NgetagLogo({
  variant = "dark",
  lockup = "horizontal",
  className,
  iconClassName,
  wordmarkClassName,
}: NgetagLogoProps) {
  const showWordmark = lockup === "horizontal";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[var(--logo-word)]",
        className,
      )}
      style={variantStyle[variant]}
      aria-label="NgeTag"
    >
      <LogoMark className={cn("h-9 w-9 shrink-0", iconClassName)} />
      {showWordmark ? (
        <span
          className={cn(
            "font-display text-xl font-bold leading-none text-[var(--logo-word)]",
            wordmarkClassName,
          )}
        >
          NgeTag
        </span>
      ) : null}
    </span>
  );
}

function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M32 58C24.3 49.2 15 38.8 15 25.9C15 15.6 22.4 7.5 32 7.5C41.6 7.5 49 15.6 49 25.9C49 38.8 39.7 49.2 32 58Z"
        stroke="var(--logo-mark)"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path
        d="M23 39V24L41 39V24"
        stroke="var(--logo-mark)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
