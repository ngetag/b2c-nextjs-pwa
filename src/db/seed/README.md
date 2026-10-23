# Seed Data User (customers)

Seed ini mengisi tabel `customers` beserta dua tabel relasinya dengan **16 varian user**
yang seluruhnya diturunkan dari data yang sudah ada di repository:

- `src/data/fixtures/users.ts` → `u-demo` (baseline)
- `src/data/fixtures/reviews.ts` → `u1`–`u8` (author ulasan; nama, avatar, email, dan `joinedAt` disamakan)
- `src/data/fixtures/interests.ts` → `i-coffee`, `i-gaming`, `i-music`, `i-sports`, `i-startup`, `i-photo`, `i-wfc`
- `src/data/fixtures/tags.ts` → `t1`–`t20`
- `src/db/schema.ts` → bentuk baris `customers`, `customer_interests`, `customer_favorite_tags`

Semua data deterministik (tanpa `Math.random()`), jadi hasil seed identik di setiap environment.

## File

| File | Isi |
|---|---|
| `user-seed.ts` | Data seed + metadata varian + `validateSeed()` |
| `seed-users.ts` | Runner CLI (Drizzle + `pg`), generator SQL, dan mode dry-run |
| `user-seed.sql` | Hasil generate SQL idempoten untuk dijalankan manual via `psql` |

## Perintah

```bash
npm run db:seed            # validasi + upsert ke PostgreSQL (DATABASE_URL)
npm run db:seed:dry        # validasi + ringkasan tabel, tanpa koneksi DB
npm run db:seed -- --reset # hapus 16 customer seed (beserta relasinya) lalu insert ulang
npm run db:seed:sql        # cetak SQL; contoh: npm run db:seed:sql > seed.sql
```

`DATABASE_URL` dibaca dari environment; jika kosong, fallback-nya sama dengan
`drizzle.config.ts`, yaitu `postgresql://ap_admin:ap_secret@localhost:5432/ngetag`.

Urutan yang disarankan untuk database baru:

```bash
npm run db:push     # buat tabel & enum dari src/db/schema.ts
npm run db:seed     # isi 16 customer + relasi
```

## Ringkasan varian

| Varian | Jumlah | Contoh id | Yang diuji |
|---|---|---|---|
| Demo baseline | 1 | `u-demo` | Salinan fixture `demoUser`: 5 badge (semua kategori), 4 interest, 3 favorite tag |
| Review author | 8 | `u1`–`u8` | Integritas `reviews.authorId`; nama/avatar/email/`joinedAt` sinkron dengan fixture |
| Admin internal | 1 | `u-admin-curator` | `role = admin`, seluruh 7 interest, poin 5000 |
| Owner / organizer | 2 | `u-owner-kopi-tuku`, `u-owner-organizer-jfp` | `role = owner` dari sisi B2C (akun B2B penuh tetap di tabel `owners`) |
| Power user | 1 | `u-power-salsabila` | 7 interest + 20 favorite tag + 10 badge, poin 4200 |
| User baru | 1 | `u-new-rani` | Semua field opsional `NULL`: avatar, bio, badge, preferences, poin 0 |
| User lama (sparse) | 1 | `u-legacy-budi` | `preferences` tanpa `city`, 1 interest, 1 favorite tag |
| Luar Jakarta | 1 | `u-bandung-yoga` | `city = "Bandung"` untuk uji filter/rekomendasi non-Jakarta |

Total: **16 customer, 42 baris `customer_interests`, 58 baris `customer_favorite_tags`.**

Sebaran role: `customer = 13`, `owner = 2`, `admin = 1`.

## Kolom yang diisi

Mengikuti `customers` di `src/db/schema.ts`:

| Kolom | Catatan seed |
|---|---|
| `id` | `varchar(64)`, dipakai juga sebagai `authorId` di review |
| `name`, `email` | `email` unik (unique index `customers_email_idx`) |
| `avatar_url` | `NULL` untuk varian user baru |
| `role` | `customer` \| `owner` \| `admin` |
| `bio` | `NULL` untuk varian user baru & user lama |
| `badges` (jsonb) | Array `UserBadge`; kategori mengikuti enum `user_badge_category` |
| `preferences` (jsonb) | `{ favoriteTagIds, city? }`; `NULL` untuk varian user baru |
| `points` | 0–5000; belum ada di tipe domain (lihat gap di bawah) |
| `joined_at` | ISO timestamp deterministik |
| `updated_at` | `NULL` untuk sebagian besar baris, diisi pada 4 baris |

## Invariant yang dijaga `validateSeed()`

1. `id` dan `email` unik, panjangnya sesuai `varchar` di skema.
2. `role` selalu salah satu dari enum `user_role`.
3. Kategori badge selalu salah satu dari enum `user_badge_category`.
4. Setiap `interestId` dan `tagId` benar-benar ada di fixture (tidak ada link yatim).
5. `preferences.favoriteTagIds` **selalu sama** dengan isi tabel `customer_favorite_tags`
   (dua sumber data yang rawan drift karena jsonb + join table menyimpan hal yang sama).
6. `joinedAt` valid dan `points >= 0`.

Pelanggaran invariant membuat `npm run db:seed` berhenti dengan exit code 1 sebelum
menyentuh database.

## Catatan gap (penting untuk backend)

- **`points` belum ada di kontrak.** Tabel `customers` punya `points`, tetapi
  `src/types/user.ts`, `UserSchema`, dan `CustomerContract` belum memuat field ini.
  Seed mengisi `points` langsung di level database. Jika nanti dipakai di API,
  tambahkan `points` di ketiga tempat tersebut agar tidak terpotong saat mapping.
- **Akun owner ganda.** Enum `user_role` mengizinkan `owner` pada `customers`, sementara
  akun B2B punya tabel sendiri (`owners`) dengan enum `owner_role` (`owner`/`manager`/`staff`).
  Seed memakai `role = owner` hanya untuk atribusi demo di sisi B2C.
- **Seed ini hanya menyentuh tabel user.** Tabel `bookmarks`, `event_attendances`,
  `spot_visits`, dan `community_memberships` belum diisi; untuk data demo lengkap,
  generate-nya bisa mengikuti pola `src/shared/mocks/b2b-handoff.mock.ts`.
- **Fixture vs jumlah dokumen.** README menyebut “~80 reviews”, sedangkan
  `src/data/fixtures/reviews.ts` menghasilkan 62 review. Seed mengikuti fixture (sumber nyata).
