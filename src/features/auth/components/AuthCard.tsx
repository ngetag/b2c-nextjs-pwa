import Link from "next/link";
import type { ReactNode } from "react";
import { NgetagLogo } from "@/components/brand/NgetagLogo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

interface AuthCardProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
  /** Optional banner above the form (error / demo notice). */
  banner?: ReactNode;
}

/**
 * Shared glassmorphism shell for `/auth/login` and `/auth/signup`.
 * Uses `glass-accent` so the purple rim is visible in the light theme.
 */
export function AuthCard({
  eyebrow,
  title,
  description,
  children,
  footer,
  banner,
}: AuthCardProps) {
  return (
    <div className="w-full max-w-md">
      <div className="mb-5 flex items-center justify-between">
        <Link href="/" aria-label="Kembali ke beranda NgeTag">
          <NgetagLogo variant="auto" />
        </Link>
        <ThemeToggle />
      </div>

      <div className="glass-accent rounded-[28px] p-6 md:p-8">
        <p className="accent-pill inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide">
          {eyebrow}
        </p>
        <h1 className="mt-4 font-display text-2xl font-bold text-[var(--color-foreground)] md:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
          {description}
        </p>

        {banner ? <div className="mt-5">{banner}</div> : null}

        <div className="mt-6">{children}</div>
      </div>

      <div className="mt-5 text-center text-sm text-[var(--color-muted-foreground)]">
        {footer}
      </div>
    </div>
  );
}
