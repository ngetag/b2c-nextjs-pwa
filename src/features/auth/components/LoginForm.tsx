"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Loader2, LogIn, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { OAuthButtons } from "@/features/auth/components/OAuthButtons";
import {
  AuthClientError,
  loginRequest,
  oauthErrorMessage,
} from "@/lib/auth/client";
import { useAuth } from "@/providers/AuthProvider";

interface LoginFormProps {
  next: string;
  initialError?: string | null;
}

/** Email/password + OAuth sign-in form. */
export function LoginForm({ next, initialError }: LoginFormProps) {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    oauthErrorMessage(initialError ?? null),
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = await loginRequest({ email, password });
      login(payload);
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof AuthClientError
          ? err.message
          : "Gagal masuk. Periksa koneksi lalu coba lagi.",
      );
    } finally {
      setLoading(false);
    }
  }

  function fillDemoAccount() {
    setEmail("demo@ngetag.id");
    setPassword("ngetag123");
    setError(null);
  }

  return (
    <AuthCard
      eyebrow="Masuk"
      title="Selamat datang kembali"
      description="Masuk untuk menyimpan spot favorit, klaim promo, dan mendapatkan rekomendasi yang makin personal."
      banner={
        error ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-[color-mix(in_srgb,var(--color-destructive)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-destructive)_12%,transparent)] px-3 py-2 text-xs leading-relaxed text-[var(--color-destructive)]"
          >
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>{error}</span>
          </div>
        ) : null
      }
      footer={
        <>
          Belum punya akun?{" "}
          <Link
            href={`/auth/signup?next=${encodeURIComponent(next)}`}
            className="font-semibold text-primary hover:underline"
          >
            Daftar gratis
          </Link>
        </>
      }
    >
      <OAuthButtons next={next} disabled={loading} />

      <form className="mt-5 space-y-4" onSubmit={onSubmit} noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="nama@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="pr-11"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[var(--color-muted-foreground)] transition-colors hover:text-primary"
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden />
              ) : (
                <Eye className="h-4 w-4" aria-hidden />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-[var(--color-primary-foreground)] shadow-[0_16px_34px_color-mix(in_srgb,var(--color-primary)_28%,transparent)] transition-all hover:bg-[var(--color-primary-hover)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <LogIn className="h-4 w-4" aria-hidden />
          )}
          {loading ? "Memproses…" : "Masuk"}
        </button>
      </form>

      <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--glass-bg-subtle)] p-3">
        <button
          type="button"
          onClick={fillDemoAccount}
          className="flex w-full items-start gap-2 text-left text-[11px] leading-relaxed text-[var(--color-muted-foreground)] transition-colors hover:text-primary"
        >
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
          <span>
            <span className="font-semibold text-[var(--color-foreground)]">
              Coba akun demo:
            </span>{" "}
            demo@ngetag.id / ngetag123 — klik untuk mengisi otomatis.
          </span>
        </button>
      </div>
    </AuthCard>
  );
}
