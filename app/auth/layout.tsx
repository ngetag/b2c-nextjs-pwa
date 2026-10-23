import type { ReactNode } from "react";

/**
 * Shared shell for the authentication routes.
 * Renders the aurora + glass background that both themes tint differently.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="aurora relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-10 md:py-16">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[var(--aurora-1)] blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-[var(--aurora-3)] blur-3xl" />
      <div className="relative z-10 flex w-full flex-col items-center">
        {children}
      </div>
    </div>
  );
}
