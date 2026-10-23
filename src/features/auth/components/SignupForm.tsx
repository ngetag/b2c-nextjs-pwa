"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { OAuthButtons } from "@/features/auth/components/OAuthButtons";
import { interests as interestFixtures } from "@/data/fixtures/interests";
import { AuthClientError, signupRequest } from "@/lib/auth/client";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/cn";

interface SignupFormProps {
  next: string;
}

/** Email/password registration with interest onboarding (cold-start signals). */
export function SignupForm({ next }: SignupFormProps) {
  const router = useRouter();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("Jakarta Selatan");
  const [interestIds, setInterestIds] = useState<string[]>([]);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleInterest(id: string) {
    setInterestIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = await signupRequest({
        name,
        email,
        password,
        city: city || undefined,
        interestIds,
        acceptTerms,
      });
      login(payload);
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof AuthClientError
          ? err.message
          : "Gagal membuat akun. Coba lagi sebentar.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      eyebrow="Daftar gratis"
      title="Mulai jelajahi Jakarta"
      description="Buat akun untuk menyimpan spot, ikut komunitas, dan mengumpulkan poin NgeTag."
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
          Sudah punya akun?{" "}
          <Link
            href={`/auth/login?next=${encodeURIComponent(next)}`}
            className="font-semibold text-primary hover:underline"
          >
            Masuk
          </Link>
        </>
      }
    >
      <OAuthButtons next={next} disabled={loading} />

      <form className="mt-5 space-y-4" onSubmit={onSubmit} noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="name">Nama</Label>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            required
            minLength={2}
            placeholder="Nama kamu"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

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
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Minimal 8 karakter"
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
          <p className="text-[11px] text-[var(--color-muted-foreground)]">
            Minimal 8 karakter. Disimpan sebagai hash scrypt — tidak pernah
            dikirim di JWT.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="city">Kota</Label>
          <Input
            id="city"
            name="city"
            autoComplete="address-level2"
            placeholder="Jakarta Selatan"
            value={city}
            onChange={(event) => setCity(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Minat kamu</Label>
            <span className="text-[11px] text-[var(--color-muted-foreground)]">
              {interestIds.length} dipilih
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {interestFixtures.map((interest) => {
              const selected = interestIds.includes(interest.id);
              return (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => toggleInterest(interest.id)}
                  aria-pressed={selected}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-all active:scale-95",
                    selected
                      ? "border-[color-mix(in_srgb,var(--color-primary)_45%,transparent)] bg-[var(--color-primary-soft)] text-primary"
                      : "border-[var(--color-border)] bg-[var(--glass-bg-subtle)] text-[var(--color-muted-foreground)] hover:border-[var(--color-primary)] hover:text-primary",
                  )}
                >
                  {interest.label}
                </button>
              );
            })}
          </div>
          <p className="flex items-start gap-1.5 text-[11px] text-[var(--color-muted-foreground)]">
            <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-primary" aria-hidden />
            Minat ini dipakai untuk cold-start rekomendasi sebelum kamu punya
            riwayat aktivitas.
          </p>
        </div>

        <label className="flex items-start gap-2 text-[11px] leading-relaxed text-[var(--color-muted-foreground)]">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(event) => setAcceptTerms(event.target.checked)}
            className="mt-0.5 h-3.5 w-3.5 rounded border-[var(--color-input)] accent-[var(--color-primary)]"
          />
          Saya setuju dengan Syarat &amp; Ketentuan serta Kebijakan Privasi
          NgeTag.
        </label>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-[var(--color-primary-foreground)] shadow-[0_16px_34px_color-mix(in_srgb,var(--color-primary)_28%,transparent)] transition-all hover:bg-[var(--color-primary-hover)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <UserPlus className="h-4 w-4" aria-hidden />
          )}
          {loading ? "Membuat akun…" : "Buat akun"}
        </button>
      </form>
    </AuthCard>
  );
}
