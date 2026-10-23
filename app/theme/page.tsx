import type { Metadata } from "next";
import { ThemeGallery } from "@/features/theme/components/ThemeGallery";

export const metadata: Metadata = {
  title: "Galeri tema",
  description:
    "Bandingkan tema Midnight Neon (gelap) dan Lavender Glass (terang, glassmorphism ungu) NgeTag.",
};

/** `/theme` — side-by-side preview of the two NgeTag themes. */
export default function ThemePage() {
  return (
    <div className="aurora mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <header className="mb-6 space-y-2">
        <div className="h-1 w-10 rounded-full bg-[var(--color-primary)]" />
        <h1 className="font-display text-2xl font-bold md:text-3xl">Galeri tema</h1>
        <p className="max-w-2xl text-sm text-[var(--color-muted-foreground)]">
          NgeTag punya dua tema. Tema aktif disimpan di cookie{" "}
          <code className="rounded bg-[var(--glass-bg-subtle)] px-1">
            ngetag-theme
          </code>{" "}
          dan dirender langsung oleh server, sehingga tidak ada kedipan warna
          saat halaman dimuat.
        </p>
      </header>
      <ThemeGallery />
    </div>
  );
}
