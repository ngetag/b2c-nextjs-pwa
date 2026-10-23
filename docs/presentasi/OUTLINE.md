# NgeTag — Review Repository & Seed Data User

Dokumen pendamping deck `docs/presentasi/NgeTag-B2C-Review.pptx` (22 slide, catatan presenter di setiap slide).

## Cara pakai

| Kebutuhan | Langkah |
|---|---|
| Presentasi | Buka `NgeTag-B2C-Review.pptx`. Slide 16:9, font Arial sehingga aman di mesin tanpa font brand. |
| Catatan presenter | PowerPoint: **View → Notes Page**, atau panel *Notes* di bawah slide. |
| Cetak handout | **Print → Notes Pages** (slide + catatan) atau 3 slide per halaman. |
| Edit cepat | Semua warna & gaya ada di palet `INK / CORAL / GOLD / SOFT`; judul slide memakai 26 pt bold. |

## Outline

| Slide | Bagian | Isi | Pesan kunci |
|---|---|---|---|
| 1 | Pembuka | Judul, stack, meta | Sesi review repo + dua deliverable |
| 2 | Outline | Empat bagian presentasi | Alur: produk → arsitektur → mutu → data |
| 3 | Divider 01 | Produk & konteks | Batas MVP: dummy data, tanpa auth |
| 4 | Produk | Posisi produk + statistik fixture | 25 spot · 15 event · 20 tag · 14 komunitas |
| 5 | Produk | Value Proposition Canvas | Verified review adalah pembeda yang sudah jalan |
| 6 | Produk | Peta 20 halaman (P0/P1/modul aktif) | Tujuh halaman P0 membentuk demo flow utuh |
| 7 | Produk | Alur inti 5 langkah + 3 fitur kunci | Temukan → bandingkan → simpan → kunjungi → ulas |
| 8 | Divider 02 | Arsitektur & data | Satu arah ketergantungan |
| 9 | Arsitektur | Stack & versi | Next.js 16 dan Drizzle 1.0 RC punya breaking changes |
| 10 | Arsitektur | Lima lapis aplikasi | Repository = seam data tunggal |
| 11 | Arsitektur | Struktur folder + 6 angka skala | 255 file · 22.099 baris · 78 komponen |
| 12 | Arsitektur | Permukaan API & validasi | 47 route handler, Zod di tepi |
| 13 | Arsitektur | Skema 32 tabel / 17 enum | Domain aplikasi tercermin di data |
| 14 | Arsitektur | Model data user | `points` ada di DB, belum di kontrak |
| 15 | Divider 03 | Mutu & temuan | Fondasi kuat, satu file bermasalah |
| 16 | Mutu | Enam konvensi yang layak dipertahankan | Struktur lebih matang dari MVP biasa |
| 17 | Mutu | Tujuh temuan audit | `relations.ts` = akar masalah |
| 18 | Divider 04 | Seed data user | 16 customer, 8 varian |
| 19 | Seed | Matriks varian | Setiap cabang enum & kolom nullable terwakili |
| 20 | Seed | Implementasi idempoten | Upsert + 6 aturan validasi sebelum DB |
| 21 | Seed | Roadmap tiga fase | Fondasi dulu, baru fitur |
| 22 | Penutup | Tiga takeaway + deliverable | Siap diskusi |

## Angka yang dipakai (semua dihitung dari repo)

- **255** file `.ts`/`.tsx` di `app/` + `src/` (total 22.099 baris).
- **78** komponen `.tsx`, **20** halaman (`page.tsx`), **47** route handler.
- **32** tabel + **17** enum di `src/db/schema.ts`, **17** feature module di `src/features/`.
- Fixture: **25** spot, **15** event, **20** tag, **14** komunitas, **6** promo, **62** review.
- Lint: **100 error** (98 di `src/db/relations.ts`), **4 warning**.
- Seed: **16** customer, **42** link interest, **58** link favorite tag.

## Hasil audit yang perlu disampaikan apa adanya

1. `npx tsc --noEmit` gagal di `src/db/relations.ts` (tipe helper Drizzle 1.0 RC).
2. `npm run lint` keluar dengan 100 error; 98 di antaranya `no-explicit-any` di file yang sama.
3. `npm run build` gagal hanya karena sandbox tidak bisa mengakses Google Fonts.
4. Belum ada klien database runtime, seed, maupun auth.
5. `points` ada di skema DB tetapi tidak ada di `types/user.ts`, `userSchema`, dan `CustomerContract`.
6. README menyebut “~80 reviews”, fixture menghasilkan **62**.

## Deliverable seed

Lihat `src/db/seed/README.md` untuk detail varian, invariant, dan cara menjalankan:

```bash
npm run db:push          # buat tabel & enum
npm run db:seed          # upsert 16 customer + relasi
npm run db:seed:dry      # validasi tanpa koneksi database
npm run db:seed -- --reset
npm run db:seed:sql > seed.sql
```
