"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  BadgeCheck,
  Check,
  KeyRound,
  Loader2,
  LogOut,
  Moon,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { updateProfileRequest } from "@/lib/auth/client";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { summarizeClaims } from "@/lib/auth/claims";
import { cn } from "@/lib/cn";
import { interests as interestFixtures } from "@/data/fixtures/interests";
import type { AuthUser, NgetagJwtClaims } from "@/shared/auth";
import type {
  ForYouResponse,
  RecommendationItem,
} from "@/shared/telemetry";

interface SessionItem {
  id: string;
  provider: string;
  userAgent: string | null;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
  current: boolean;
}

interface TasteResponse {
  ownerKey: string;
  eventCount: number;
  dimensions: number;
  embeddingPreview: number[];
  tagWeights: Array<{ tagId: string; weight: number }>;
  interestWeights: Array<{ interestId: string; weight: number }>;
  lastEventAt: string | null;
  storage: string;
  message?: string;
}

interface SummaryResponse {
  totalEvents: number;
  uniqueVisitors: number;
  eventsByType: Record<string, number>;
  topTargets: Array<{ targetType: string; targetId: string; count: number }>;
  topTags: Array<{ tagId: string; count: number }>;
  storage: string;
  bufferedEvents: number;
  tasteProfiles: number;
  contentIndex: { total: number; byType: Record<string, number>; lastSyncAt: string | null };
}

interface ActivityEvent {
  id: string;
  eventType: string;
  targetType: string | null;
  targetId: string | null;
  surface: string | null;
  occurredAt: string;
}

/** Compact number formatting for Indonesian locale. */
function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

function formatDate(value: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

/**
 * `/account` — the authenticated hub: profile, JWT claim inspector, active
 * sessions, taste vector and the pgvector-powered recommendation feed.
 */
export function AccountView() {
  const {
    status,
    user,
    claims,
    isAuthenticated,
    demo,
    logout,
    refresh,
  } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [taste, setTaste] = useState<TasteResponse | null>(null);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [feed, setFeed] = useState<ForYouResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      // Persist any buffered client events first so the taste profile is fresh.
      await fetch("/api/telemetry/flush", { method: "POST" }).catch(() => null);

      const [sessionsRes, tasteRes, summaryRes, activityRes, feedRes] =
        await Promise.all([
          fetch("/api/auth/sessions", { cache: "no-store" }),
          fetch("/api/telemetry/profile", { cache: "no-store" }),
          fetch("/api/telemetry/summary", { cache: "no-store" }),
          fetch("/api/telemetry/events?limit=8", { cache: "no-store" }),
          fetch("/api/recommendations/for-you?limit=6", { cache: "no-store" }),
        ]);

      if (sessionsRes.ok) {
        const data = (await sessionsRes.json()) as { sessions: SessionItem[] };
        setSessions(data.sessions);
      }
      if (tasteRes.ok) setTaste((await tasteRes.json()) as TasteResponse);
      if (summaryRes.ok) setSummary((await summaryRes.json()) as SummaryResponse);
      if (activityRes.ok) {
        const data = (await activityRes.json()) as { items: ActivityEvent[] };
        setActivity(data.items);
      }
      if (feedRes.ok) setFeed((await feedRes.json()) as ForYouResponse);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Kick off the data load once the session resolves. `loadData` only touches
  // state after its first await, so this effect stays free of sync setState.
  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (status === "idle" || status === "loading") {
    return (
      <div className="glass flex min-h-64 items-center justify-center rounded-3xl">
        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden />
        <span className="sr-only">Memuat akun…</span>
      </div>
    );
  }

  if (!isAuthenticated || !user || !claims) {
    return <GuestPrompt />;
  }

  async function revokeSession(id: string) {
    const response = await fetch(`/api/auth/sessions/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setSessions((current) => current.filter((session) => session.id !== id));
      toast.success("Sesi dikeluarkan");
    } else {
      toast.error("Gagal mengeluarkan sesi");
    }
  }

  async function revokeOtherSessions() {
    const response = await fetch("/api/auth/sessions", { method: "DELETE" });
    if (response.ok) {
      setSessions((current) => current.filter((session) => session.current));
      toast.success("Semua perangkat lain dikeluarkan");
    } else {
      toast.error("Gagal mengeluarkan sesi lain");
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile header */}
      <section className="glass-accent relative overflow-hidden rounded-3xl p-5 md:p-7">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[var(--aurora-2)] blur-3xl" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--color-primary-soft)] text-xl font-bold text-primary">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                user.name.slice(0, 1).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate font-display text-2xl font-bold">
                  {user.name}
                </h1>
                <span className="accent-pill inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                  <Sparkles className="h-3 w-3" aria-hidden />
                  {user.tier}
                </span>
                {user.emailVerified ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[color-mix(in_srgb,var(--color-success)_35%,transparent)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-success)]">
                    <BadgeCheck className="h-3 w-3" aria-hidden /> Terverifikasi
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 truncate text-sm text-[var(--color-muted-foreground)]">
                {user.email}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-[var(--color-muted-foreground)]">
                <span>{formatNumber(user.points)} poin</span>
                <span aria-hidden>·</span>
                <span>{user.interestIds.length} minat</span>
                <span aria-hidden>·</span>
                <span>Bergabung {formatDate(user.joinedAt).split(",")[0]}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void refresh()}
              className="glass-subtle inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors hover:text-primary"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Refresh token
            </button>
            <button
              type="button"
              onClick={() =>
                void logout().then(() => {
                  router.replace("/");
                  router.refresh();
                })
              }
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--color-destructive)_35%,transparent)] px-3 text-xs font-semibold text-[var(--color-destructive)] transition-colors hover:bg-[color-mix(in_srgb,var(--color-destructive)_10%,transparent)]"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden /> Keluar
            </button>
          </div>
        </div>

        {demo ? (
          <p className="relative mt-4 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] px-3 py-2 text-[11px] leading-relaxed text-[var(--color-muted-foreground)]">
            Sesi ini memakai <strong>mode demo OAuth</strong> karena kredensial
            provider belum di-set. Aktifkan <code>GOOGLE_CLIENT_ID</code> /{" "}
            <code>GITHUB_CLIENT_ID</code> untuk login sungguhan.
          </p>
        ) : null}
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        <JwtClaimsCard claims={claims} />
        <TasteCard taste={taste} loading={loading} />
        <ThemeCard theme={theme} setTheme={setTheme} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ProfileEditor key={user.id} user={user} onSaved={loadData} />
        <SessionsCard
          sessions={sessions}
          onRevoke={revokeSession}
          onRevokeOthers={revokeOtherSessions}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <RecommendationCard feed={feed} loading={loading} className="lg:col-span-3" />
        <div className="space-y-5 lg:col-span-2">
          <ActivityCard activity={activity} loading={loading} onRefresh={loadData} />
          <TelemetryStatsCard summary={summary} />
        </div>
      </div>
    </div>
  );
}

function GuestPrompt() {
  return (
    <div className="glass-accent mx-auto max-w-md rounded-3xl p-8 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-primary">
        <UserRound className="h-6 w-6" aria-hidden />
      </span>
      <h2 className="mt-4 font-display text-xl font-bold">Kamu belum masuk</h2>
      <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
        Masuk untuk melihat klaim JWT, sesi aktif, dan profil rasa yang dipakai
        mesin rekomendasi.
      </p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Link
          href="/auth/login?next=/account"
          className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-[var(--color-primary-foreground)]"
        >
          Masuk
        </Link>
        <Link
          href="/auth/signup?next=/account"
          className="glass-subtle inline-flex h-10 flex-1 items-center justify-center rounded-xl text-sm font-semibold"
        >
          Daftar
        </Link>
      </div>
    </div>
  );
}

function JwtClaimsCard({ claims }: { claims: NgetagJwtClaims }) {
  const summary = summarizeClaims(claims);

  return (
    <section className="glass rounded-3xl p-5">
      <header className="flex items-center gap-2">
        <KeyRound className="h-4 w-4 text-primary" aria-hidden />
        <h2 className="text-sm font-bold">Klaim JWT</h2>
      </header>
      <p className="mt-1 text-[11px] leading-relaxed text-[var(--color-muted-foreground)]">
        Data personalisasi yang ikut di access token (HS256, 15 menit).
      </p>

      <dl className="mt-4 space-y-2 text-[11px]">
        {(
          [
            ["sub", summary.sub],
            ["role", summary.role],
            ["tier", summary.tier],
            ["locale", summary.locale],
            ["provider", summary.provider],
            ["session", summary.sessionId],
            ["expires", summary.expiresAt],
          ] as Array<[string, string]>
        ).map(([label, value]) => (
          <div key={String(label)} className="flex items-start justify-between gap-3">
            <dt className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
              {label}
            </dt>
            <dd className="truncate text-right font-medium">{String(value)}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 flex flex-wrap gap-1">
        {claims.interests.map((interest) => (
          <span
            key={interest}
            className="rounded-full bg-[var(--glass-bg-subtle)] px-2 py-0.5 text-[10px] text-[var(--color-muted-foreground)]"
          >
            {interest}
          </span>
        ))}
      </div>

      <details className="mt-4">
        <summary className="cursor-pointer text-[11px] font-semibold text-primary">
          Lihat token payload lengkap
        </summary>
        <pre className="mt-2 max-h-56 overflow-auto rounded-xl bg-[var(--glass-bg-subtle)] p-3 text-[10px] leading-relaxed">
          {JSON.stringify(summary, null, 2)}
        </pre>
      </details>
    </section>
  );
}

function TasteCard({
  taste,
  loading,
}: {
  taste: TasteResponse | null;
  loading: boolean;
}) {
  const max = Math.max(
    ...(taste?.tagWeights.map((tag) => Math.abs(tag.weight)) ?? [1]),
    0.001,
  );

  return (
    <section className="glass rounded-3xl p-5">
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" aria-hidden />
          <h2 className="text-sm font-bold">Profil rasa (vektor)</h2>
        </div>
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--color-muted-foreground)]" aria-hidden />
        ) : null}
      </header>

      {taste && taste.eventCount > 0 ? (
        <>
          <p className="mt-1 text-[11px] text-[var(--color-muted-foreground)]">
            {taste.eventCount} interaksi · {taste.dimensions} dimensi ·{" "}
            {taste.storage}
          </p>

          <ul className="mt-3 space-y-1.5">
            {taste.tagWeights.slice(0, 5).map((tag) => (
              <li key={tag.tagId} className="text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="truncate">{tag.tagId}</span>
                  <span className="font-mono text-[10px] text-[var(--color-muted-foreground)]">
                    {tag.weight.toFixed(2)}
                  </span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-[var(--glass-bg-subtle)]">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${Math.min(100, (Math.abs(tag.weight) / max) * 100)}%`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-3 flex flex-wrap gap-1">
            {taste.embeddingPreview.slice(0, 6).map((value, index) => (
              <span
                key={`${index}-${value}`}
                className="rounded bg-[var(--glass-bg-subtle)] px-1.5 py-0.5 font-mono text-[9px] text-[var(--color-muted-foreground)]"
              >
                {value}
              </span>
            ))}
            <span className="px-1 text-[9px] text-[var(--color-muted-foreground)]">
              …
            </span>
          </div>
        </>
      ) : (
        <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-muted-foreground)]">
          Belum ada sinyal. Buka beberapa spot atau simpan bookmark, lalu muat
          ulang halaman ini.
        </p>
      )}
    </section>
  );
}

function ThemeCard({
  theme,
  setTheme,
}: {
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
}) {
  return (
    <section className="glass rounded-3xl p-5">
      <header className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
        <h2 className="text-sm font-bold">Tema tampilan</h2>
      </header>
      <p className="mt-1 text-[11px] leading-relaxed text-[var(--color-muted-foreground)]">
        Pilihan disimpan di cookie <code>ngetag-theme</code> sehingga server
        langsung merender tema yang benar.
      </p>

      <div className="mt-3 grid gap-2">
        <button
          type="button"
          onClick={() => setTheme("dark")}
          aria-pressed={theme === "dark"}
          className={cn(
            "flex items-center justify-between rounded-2xl border px-3 py-2.5 text-left transition-colors",
            theme === "dark"
              ? "border-[color-mix(in_srgb,var(--color-primary)_45%,transparent)] bg-[var(--color-primary-soft)]"
              : "border-[var(--color-border)] hover:border-[var(--color-primary)]",
          )}
        >
          <span className="flex items-center gap-2 text-xs font-semibold">
            <Moon className="h-4 w-4" aria-hidden /> Midnight Neon
          </span>
          <span className="flex gap-1">
            {["#0D0E15", "#00FFFF", "#A855F7"].map((color) => (
              <span
                key={color}
                className="h-3.5 w-3.5 rounded-full border border-white/20"
                style={{ backgroundColor: color }}
              />
            ))}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTheme("light")}
          aria-pressed={theme === "light"}
          className={cn(
            "flex items-center justify-between rounded-2xl border px-3 py-2.5 text-left transition-colors",
            theme === "light"
              ? "border-[color-mix(in_srgb,var(--color-primary)_45%,transparent)] bg-[var(--color-primary-soft)]"
              : "border-[var(--color-border)] hover:border-[var(--color-primary)]",
          )}
        >
          <span className="flex items-center gap-2 text-xs font-semibold">
            <Sun className="h-4 w-4" aria-hidden /> Lavender Glass
          </span>
          <span className="flex gap-1">
            {["#F6F3FF", "#7C3AED", "#F0ABFC"].map((color) => (
              <span
                key={color}
                className="h-3.5 w-3.5 rounded-full border border-black/10"
                style={{ backgroundColor: color }}
              />
            ))}
          </span>
        </button>
      </div>

      <Link
        href="/theme"
        className="mt-3 inline-flex text-[11px] font-semibold text-primary hover:underline"
      >
        Buka galeri tema →
      </Link>
    </section>
  );
}

/**
 * Editable profile form.
 *
 * State is initialised from the session user and the component is keyed by the
 * customer id, so switching accounts resets the fields without an effect.
 */
function ProfileEditor({
  user,
  onSaved,
}: {
  user: AuthUser;
  onSaved: () => Promise<void> | void;
}) {
  const { login } = useAuth();
  const [name, setName] = useState(user.name);
  const [city, setCity] = useState(user.city ?? "");
  const [interestIds, setInterestIds] = useState<string[]>(user.interestIds);
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = await updateProfileRequest({
        name,
        city: city || undefined,
        interestIds,
      });
      // The endpoint re-mints the JWT so the claims reflect the new profile.
      login(payload);
      toast.success("Profil diperbarui");
      await onSaved();
    } catch {
      toast.error("Gagal menyimpan profil");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProfileForm
      name={name}
      city={city}
      interestIds={interestIds}
      saving={saving}
      onNameChange={setName}
      onCityChange={setCity}
      onToggleInterest={(id) =>
        setInterestIds((current) =>
          current.includes(id)
            ? current.filter((item) => item !== id)
            : [...current, id],
        )
      }
      onSubmit={onSubmit}
    />
  );
}

function ProfileForm(props: {
  name: string;
  city: string;
  interestIds: string[];
  saving: boolean;
  onNameChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onToggleInterest: (id: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="glass rounded-3xl p-5">
      <header className="flex items-center gap-2">
        <UserRound className="h-4 w-4 text-primary" aria-hidden />
        <h2 className="text-sm font-bold">Edit profil</h2>
      </header>

      <form className="mt-3 space-y-3" onSubmit={props.onSubmit}>
        <label className="block space-y-1">
          <span className="text-[11px] font-semibold text-[var(--color-muted-foreground)]">
            Nama
          </span>
          <input
            value={props.name}
            onChange={(event) => props.onNameChange(event.target.value)}
            className="h-9 w-full rounded-lg border border-[var(--color-input)] bg-[var(--glass-bg-subtle)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-[11px] font-semibold text-[var(--color-muted-foreground)]">
            Kota
          </span>
          <input
            value={props.city}
            onChange={(event) => props.onCityChange(event.target.value)}
            placeholder="Jakarta Selatan"
            className="h-9 w-full rounded-lg border border-[var(--color-input)] bg-[var(--glass-bg-subtle)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </label>

        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-[var(--color-muted-foreground)]">
            Minat
          </span>
          <div className="flex flex-wrap gap-1.5">
            {interestFixtures.map((interest) => {
              const selected = props.interestIds.includes(interest.id);
              return (
                <button
                  key={interest.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => props.onToggleInterest(interest.id)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                    selected
                      ? "border-[color-mix(in_srgb,var(--color-primary)_45%,transparent)] bg-[var(--color-primary-soft)] text-primary"
                      : "border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:border-[var(--color-primary)]",
                  )}
                >
                  {selected ? <Check className="h-3 w-3" aria-hidden /> : null}
                  {interest.label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={props.saving}
          className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-primary text-xs font-semibold text-[var(--color-primary-foreground)] transition-colors hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
        >
          {props.saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : null}
          Simpan perubahan
        </button>
      </form>
    </section>
  );
}

function SessionsCard({
  sessions,
  onRevoke,
  onRevokeOthers,
}: {
  sessions: SessionItem[];
  onRevoke: (id: string) => void;
  onRevokeOthers: () => void;
}) {
  return (
    <section className="glass rounded-3xl p-5">
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
          <h2 className="text-sm font-bold">Sesi aktif</h2>
        </div>
        {sessions.length > 1 ? (
          <button
            type="button"
            onClick={onRevokeOthers}
            className="text-[10px] font-semibold text-[var(--color-destructive)] hover:underline"
          >
            Keluarkan yang lain
          </button>
        ) : null}
      </header>

      <ul className="mt-3 space-y-2">
        {sessions.map((session) => (
          <li
            key={session.id}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--glass-bg-subtle)] p-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold">
                  {session.provider} ·{" "}
                  {session.current ? (
                    <span className="text-primary">perangkat ini</span>
                  ) : (
                    "perangkat lain"
                  )}
                </p>
                <p className="truncate text-[10px] text-[var(--color-muted-foreground)]">
                  {session.userAgent ?? "User agent tidak diketahui"}
                </p>
                <p className="text-[10px] text-[var(--color-muted-foreground)]">
                  Terakhir dipakai {formatDate(session.lastUsedAt)}
                </p>
              </div>
              {!session.current ? (
                <button
                  type="button"
                  onClick={() => onRevoke(session.id)}
                  aria-label="Keluarkan sesi ini"
                  className="rounded-md p-1 text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-destructive)]"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                </button>
              ) : null}
            </div>
          </li>
        ))}
        {sessions.length === 0 ? (
          <li className="text-[11px] text-[var(--color-muted-foreground)]">
            Tidak ada sesi aktif.
          </li>
        ) : null}
      </ul>
    </section>
  );
}

function RecommendationCard({
  feed,
  loading,
  className,
}: {
  feed: ForYouResponse | null;
  loading: boolean;
  className?: string;
}) {
  return (
    <section className={cn("glass rounded-3xl p-5", className)}>
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden />
          <h2 className="text-sm font-bold">Untuk kamu (pgvector)</h2>
        </div>
        {feed ? (
          <span className="rounded-full bg-[var(--color-primary-soft)] px-2 py-0.5 text-[10px] font-semibold text-primary">
            {feed.profile.source}
          </span>
        ) : null}
      </header>
      <p className="mt-1 text-[11px] text-[var(--color-muted-foreground)]">
        Cosine similarity terhadap taste vector · {feed?.storage ?? "memory"}
      </p>

      {loading && !feed ? (
        <div className="mt-4 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden />
        </div>
      ) : (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {(feed?.items ?? []).map((item) => (
            <RecommendationTile key={`${item.ownerType}:${item.ownerId}`} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}

function RecommendationTile({ item }: { item: RecommendationItem }) {
  return (
    <Link
      href={item.href}
      className="group flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--glass-bg-subtle)] p-2 transition-all hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]"
    >
      <span className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[var(--glass-bg)]">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[11px] font-semibold">
          {item.title}
        </span>
        <span className="block truncate text-[10px] text-[var(--color-muted-foreground)]">
          {item.subtitle}
        </span>
        <span className="mt-0.5 block font-mono text-[9px] text-primary">
          {item.reason} · {item.score.toFixed(3)}
        </span>
      </span>
    </Link>
  );
}

function ActivityCard({
  activity,
  loading,
  onRefresh,
}: {
  activity: ActivityEvent[];
  loading: boolean;
  onRefresh: () => void;
}) {
  return (
    <section className="glass rounded-3xl p-5">
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" aria-hidden />
          <h2 className="text-sm font-bold">Aktivitas terakhir</h2>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="rounded-md p-1 text-[var(--color-muted-foreground)] hover:text-primary disabled:opacity-50"
          aria-label="Muat ulang aktivitas"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} aria-hidden />
        </button>
      </header>

      <ul className="mt-3 space-y-1.5">
        {activity.map((event) => (
          <li
            key={event.id}
            className="flex items-center justify-between gap-3 rounded-lg bg-[var(--glass-bg-subtle)] px-2 py-1.5 text-[10px]"
          >
            <span className="truncate font-medium">{event.eventType}</span>
            <span className="truncate text-[var(--color-muted-foreground)]">
              {event.targetId ?? event.surface ?? "—"}
            </span>
            <span className="shrink-0 font-mono text-[9px] text-[var(--color-muted-foreground)]">
              {formatDate(event.occurredAt).split(",").pop()?.trim()}
            </span>
          </li>
        ))}
        {activity.length === 0 ? (
          <li className="text-[11px] text-[var(--color-muted-foreground)]">
            Belum ada aktivitas tercatat.
          </li>
        ) : null}
      </ul>
    </section>
  );
}

function TelemetryStatsCard({ summary }: { summary: SummaryResponse | null }) {
  if (!summary) return null;

  return (
    <section className="glass rounded-3xl p-5">
      <h2 className="text-sm font-bold">Statistik telemetri</h2>
      <div className="mt-3 grid grid-cols-2 gap-2 text-center">
        {[
          ["Events", summary.totalEvents],
          ["Visitors", summary.uniqueVisitors],
          ["Profiles", summary.tasteProfiles],
          ["Indexed", summary.contentIndex.total],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--glass-bg-subtle)] px-2 py-2"
          >
            <p className="font-display text-lg font-bold text-primary">
              {formatNumber(Number(value))}
            </p>
            <p className="text-[9px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
              {label}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] leading-relaxed text-[var(--color-muted-foreground)]">
        {summary.bufferedEvents} event menunggu flush · storage{" "}
        <strong>{summary.storage}</strong>
      </p>
    </section>
  );
}
