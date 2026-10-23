# Ngetag — Customer Web App (MVP)

Frontend MVP untuk Ngetag, platform discovery hangout spot dan event di Jakarta berbasis tag, lokasi, promo, rating, dan tren.

> Status: **Phase 1–4 selesai**. Seluruh data dummy. Tanpa backend, tanpa auth.

---

## Stack

- Next.js 16.2.6 (App Router, Turbopack)
- React 19.2.4
- TypeScript 5
- Tailwind CSS v4 (via `@tailwindcss/postcss`)
- shadcn/ui primitives (manual install, kompatibel Tailwind v4)
- Lucide React (ikon)
- Zustand + persist (state global)
- react-hook-form + zod (form)
- next/font: Inter (body) + Plus Jakarta Sans (heading)
- sonner (toast notification)

> **Catatan penting**: Next.js 16 punya banyak breaking changes dari versi sebelumnya. Sebelum modifikasi atau penambahan API Next.js, baca docs lokal di `node_modules/next/dist/docs/` (lihat `AGENTS.md`).

---

## Quick start

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

Build produksi:

```bash
npm run build
npm run start
```

Lint:

```bash
npm run lint
```

---

## Halaman

### P0 (MVP demo flow)
- `/` — Home (trending tags, recommended spots, recommended events, promo highlights)
- `/search` — Cari spot/event dengan filter tag dan sort (URL state)
- `/spots/[id]` — Spot Detail (gallery, info, lokasi, jam buka, promo, ulasan)
- `/events/[id]` — Event Detail (banner, meta, organizer, lokasi)
- `/bookmarks` — Spot dan event tersimpan (tabs)
- `/profile` — Profil mock user + stats + reset data demo
- `/reviews/new?spotId=...` — Tulis ulasan (rating + comment)

### P1 (polish)
- `/profile/reviews` — Ulasan saya (edit/delete dummy)
- `/tags/[slug]` — Tag landing (spot + event by tag)
- `/promo` — Daftar semua promo
- `/not-found` + `/error` — Boundary halaman

---

## Struktur folder

```
app/                            # Next.js App Router shell (route + page only)
├── layout.tsx                  # Root layout: fonts, providers, header/nav/footer
├── page.tsx                    # Home
├── search/                     # /search
├── spots/[id]/                 # /spots/[id]
├── events/[id]/                # /events/[id]
├── tags/[slug]/                # /tags/[slug]
├── bookmarks/, promo/, profile/, reviews/
├── not-found.tsx, error.tsx
└── globals.css                 # Tailwind v4 + design tokens

src/
├── components/
│   ├── ui/                     # shadcn primitives (button, card, tabs, ...)
│   ├── common/                 # cross-feature (SearchBar, RatingStars, TagChip, ...)
│   └── layout/                 # Header, BottomNav, Footer
├── features/                   # feature-driven modules
│   ├── spot/, event/, search/
│   ├── bookmark/, review/, profile/
│   ├── tag/, promo/
├── data/
│   ├── fixtures/               # dummy data Jakarta
│   └── repositories/           # API-shaped functions (simulate latency)
├── types/                      # global TypeScript types (DTO)
├── lib/                        # cn, format, url, storage, openingHours, constants
├── hooks/                      # useDebounce, useMediaQuery, useIsMounted
├── providers/                  # AppProviders (Toaster)
├── stores/                     # Zustand stores (currentUser, bookmark, review)
└── config/                     # routes, site
```

Path alias `@/*` → `./src/*` (dikonfigurasi di `tsconfig.json:21`).

---

## State management

| Store | Tujuan | Persist |
|---|---|---|
| `useCurrentUserStore` (`src/stores/currentUser.store.ts`) | Mock user tetap (Demo User) | localStorage `ngetag:user:v1` |
| `useBookmarkStore` (`src/stores/bookmark.store.ts`) | Set bookmark spot/event | localStorage `ngetag:bookmark:v1` |
| `useReviewStore` (`src/stores/review.store.ts`) | Review yang dibuat user | localStorage `ngetag:review:v1` |

Semua store pakai middleware `persist`. Versioning lewat suffix `:v1`.

URL adalah source of truth untuk state pencarian (`useSearch` di `src/features/search/hooks/useSearch.ts`).

---

## Data dummy

Semua data dummy ada di `src/data/fixtures/`:

- 25 spots Jakarta (`spots.ts`)
- 15 events Jakarta (`events.ts`)
- 20 tags lintas 5 kategori (`tags.ts`)
- ~80 reviews tersebar (`reviews.ts`)
- 6 promos (`promos.ts`)
- 1 mock user "Demo User" (`users.ts`)

Repositories di `src/data/repositories/` membungkus fixtures dengan signature mirip API (async + simulate latency 200ms). **Ini adalah seam tunggal yang akan di-swap ke real fetch ketika backend siap.**

### Contoh swap ke real API (post-MVP)

```ts
// Sebelum (fixture)
export async function getSpotById(id: string) {
  return simulateLatency(spots.find(s => s.id === id) ?? null);
}

// Sesudah (real API)
export async function getSpotById(id: string) {
  const res = await fetch(`${API_URL}/spots/${id}`, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  return res.json();
}
```

Komponen UI tidak perlu diubah karena menggunakan tipe DTO yang sama dari `src/types/`.

---

## Branding tokens

Dikonfigurasi di `app/globals.css` (Tailwind v4 `@theme`):

| Token | Value |
|---|---|
| `--color-primary` | `#FF5A5F` (coral) |
| `--color-secondary` | `#1F2937` (slate dark) |
| `--color-accent` | `#FFB400` (gold — rating, promo) |
| `--color-background` | `#FAFAFA` |
| `--color-surface` | `#FFFFFF` |
| `--color-border` | `#E5E7EB` |
| `--color-muted-foreground` | `#6B7280` |
| `--radius` | `0.75rem` |
| Font body | Inter |
| Font display | Plus Jakarta Sans |

Locale: `id-ID`. Currency: IDR. Light theme only.

---

## Konfigurasi gambar

Remote image hosts di-whitelist di `next.config.ts:5`:

- `picsum.photos` + `fastly.picsum.photos`
- `images.unsplash.com`

Untuk menambah host baru, tambahkan entry di `images.remotePatterns`.

---

## VPC alignment roadmap (untuk fase berikutnya)

MVP frontend ini **sengaja menahan beberapa pillar VPC** karena masih sketsa awal. Ketika backend mulai dibangun, item berikut perlu masuk roadmap:

| Pillar VPC | Status MVP | Implementasi target |
|---|---|---|
| Verifikasi kunjungan (Gain Creator utama) | Skip | GPS check-in atau QR scan di lokasi → unlock tombol "Tulis Ulasan". Tambahkan `isVerifiedVisit: boolean` di `Review`, badge "Verified Visit" di `ReviewItem`. |
| Customer benefit / points | Skip | Tambah `points` di `User`, hadiah saat submit review verified, leaderboard. |
| Filter "Buka sekarang" | Skip | Tambah toggle di `FilterBar`, util `isOpenNow(hours, now)` (skeleton sudah ada di `src/lib/openingHours.ts`). |
| Geolocation / sort by distance | Skip (label statis "Jakarta") | `navigator.geolocation` + Haversine util. UI sort sudah ada (`SearchQuery.sort = "distance"`). |
| Personalisasi rekomendasi | Skip (top trending statis) | Server-side ranking by `User.preferences.favoriteTagIds` + history. |

---

## Migrasi ke arsitektur penuh

Saat siap menambah Owner Dashboard, Admin Panel, dan Mobile App, struktur ini sudah disiapkan untuk dipindah ke monorepo (pnpm workspaces / Turborepo):

```
ngetag/
├── apps/
│   ├── web/          (project ini)
│   ├── owner/        (future)
│   └── admin/        (future)
└── packages/
    ├── ui/           (extract src/components/ui)
    ├── types/        (extract src/types)
    ├── api-client/   (generated dari OpenAPI)
    └── config/       (eslint, ts, tailwind preset)
```

Boundary modul sudah dipisah (feature modules tidak saling import langsung), jadi ekstraksi aman.

---

## Auth (post-MVP)

Auth sengaja dihilangkan untuk MVP demo — semua fitur terbuka tanpa login. Saat dipasang ulang, gunakan Auth.js (NextAuth) dan ganti `useCurrentUserStore` dengan `useSession()`. Halaman login/register dapat ditempatkan di route group `(auth)/` agar layout-nya terpisah.

---

## Konvensi & catatan

- Default Server Component. Tambahkan `"use client"` hanya pada komponen interaktif (form, store consumer, BookmarkButton, BottomNav, dst.).
- `useIsMounted` digunakan untuk gate render state localStorage agar tidak hydration mismatch.
- Repository pattern di `src/data/repositories/` adalah satu-satunya tempat data lookup. Komponen tidak boleh import fixtures langsung.
- Route helpers terpusat di `src/config/routes.ts` — jangan hardcode URL di komponen.
- Format date/time pakai helper di `src/lib/format.ts` untuk konsistensi locale `id-ID`.

---

## Lisensi

Internal — proyek MVP.
