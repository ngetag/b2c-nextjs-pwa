import type { Metadata } from "next";
import { AccountView } from "@/features/account/components/AccountView";

export const metadata: Metadata = {
  title: "Akun",
  description:
    "Kelola profil, sesi aktif, klaim JWT, dan lihat profil rekomendasi NgeTag kamu.",
  robots: { index: false, follow: false },
};

/**
 * `/account` — protected authenticated hub.
 * `proxy.ts` redirects guests to `/auth/login?next=/account`.
 */
export default function AccountPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10">
      <header className="space-y-2 pb-5">
        <div className="h-1 w-10 rounded-full bg-[var(--color-primary)]" />
        <h1 className="font-display text-2xl font-bold md:text-3xl">Akun saya</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Profil, keamanan sesi, klaim JWT, dan data yang dipakai mesin
          rekomendasi.
        </p>
      </header>
      <AccountView />
    </div>
  );
}
