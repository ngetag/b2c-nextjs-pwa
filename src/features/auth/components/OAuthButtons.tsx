"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface OAuthButtonsProps {
  /** Path to land on after the callback (defaults to `/account`). */
  next?: string;
  disabled?: boolean;
}

/**
 * Starts the Google / GitHub OAuth flow.
 *
 * When provider credentials are not configured, the API falls back to a clearly
 * labelled demo account, so the flow still completes end-to-end locally.
 */
export function OAuthButtons({ next = "/account", disabled }: OAuthButtonsProps) {
  const [pending, setPending] = useState<string | null>(null);

  const query = next ? `?next=${encodeURIComponent(next)}` : "";
  const hrefFor = (provider: "google" | "github") =>
    `/api/auth/oauth/${provider}${query}`;

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <a
          href={hrefFor("google")}
          aria-disabled={disabled || pending !== null}
          onClick={(event) => {
            if (disabled || pending !== null) {
              event.preventDefault();
              return;
            }
            setPending("google");
          }}
          className="glass-subtle inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-[var(--color-foreground)] transition-all hover:border-[var(--glass-border-strong)] hover:text-primary active:scale-[0.99] aria-disabled:pointer-events-none aria-disabled:opacity-60"
        >
          {pending === "google" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <GoogleIcon />
          )}
          Google
        </a>

        <a
          href={hrefFor("github")}
          aria-disabled={disabled || pending !== null}
          onClick={(event) => {
            if (disabled || pending !== null) {
              event.preventDefault();
              return;
            }
            setPending("github");
          }}
          className="glass-subtle inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-[var(--color-foreground)] transition-all hover:border-[var(--glass-border-strong)] hover:text-primary active:scale-[0.99] aria-disabled:pointer-events-none aria-disabled:opacity-60"
        >
          {pending === "github" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <GithubIcon />
          )}
          GitHub
        </a>
      </div>

      <p className="text-[11px] leading-relaxed text-[var(--color-muted-foreground)]">
        Tanpa kredensial OAuth, tombol ini memakai akun demo. Set
        <code className="mx-1 rounded bg-[var(--glass-bg-subtle)] px-1 py-0.5 text-[10px]">
          GOOGLE_CLIENT_ID
        </code>
        / <code className="text-[10px]">GITHUB_CLIENT_ID</code> untuk login
        sungguhan.
      </p>

      <div className="flex items-center gap-3 py-1" aria-hidden>
        <span className="h-px flex-1 bg-[var(--color-border)]" />
        <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
          atau email
        </span>
        <span className="h-px flex-1 bg-[var(--color-border)]" />
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.44a5.5 5.5 0 0 1-2.39 3.62v3h3.86c2.26-2.09 3.58-5.17 3.58-8.86Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.28a12 12 0 0 0 0 10.76l3.99-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.62l3.99 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.55v-2.1c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.12 3.04.74.81 1.18 1.84 1.18 3.1 0 4.41-2.68 5.38-5.24 5.67.41.36.78 1.06.78 2.14v3.17c0 .3.2.66.8.55A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  );
}
