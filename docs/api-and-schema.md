# NgeTag — API & Database Schema Reference

Dokumen ini menjelaskan arsitektur database schema (**Drizzle ORM**), runtime validation schema (**Zod**), serta **REST API Route Handlers** (`/api/*`) untuk aplikasi web NgeTag (B2C Customer App & B2B Owner Dashboard Handoff).

> **Dokumentasi API interaktif:** Swagger UI tersedia di [`/api-docs`](../app/api-docs/page.tsx) dan spesifikasi mentah (OpenAPI 3.1) di `GET /api/openapi`.
> Untuk alur autentikasi (OAuth + JWT claims), telemetri asinkron, recommendation engine, dan tema, lihat [`auth-telemetry-and-docs.md`](./auth-telemetry-and-docs.md).

---

## 1. Database Schema (`src/db/`)

Database schema dirancang untuk PostgreSQL menggunakan **Drizzle ORM** (`drizzle-orm/pg-core`) dan didefinisikan di:

- `src/db/schema.ts` — Definisi PostgreSQL enums, core tables, many-to-many join tables, dan engagement tables.
- `src/db/relations.ts` — Relasi antar entitas Drizzle (`relations()`).
- `src/db/index.ts` — Barrel export untuk seluruh tabel dan relasi.
- `drizzle.config.ts` — Konfigurasi `drizzle-kit` untuk migrasi dan schema push.

### Perintah Drizzle Kit

```bash
npm run db:generate   # Generate SQL migration ke folder ./drizzle
npm run db:push       # Push schema langsung ke PostgreSQL (DATABASE_URL)
npm run db:studio     # Buka Drizzle Studio
```

### Daftar Tabel PostgreSQL

| Domain | Nama Tabel | Primary Key | Deskripsi |
|---|---|---|---|
| **Accounts** | `owners` | `id` | Akun B2B pengelola spot, event, promo, dan komunitas |
| **Accounts** | `customers` | `id` | Akun B2C pengguna aplikasi (badges, preferences, points) |
| **Taxonomy** | `tags` | `id` (unique `slug`) | Tag discovery (`vibe`, `cuisine`, `activity`, `price`, `occasion`) |
| **Taxonomy** | `interests` | `id` (unique `slug`) | Minat pengguna untuk personalisasi event & komunitas |
| **Spots** | `spots` | `id` (unique `slug`) | Tempat hangout beserta koordinat lokasi, harga, kontak, dan `publish_status` |
| **Spots** | `spot_opening_hours` | `(spot_id, day)` | Jam operasional harian per spot (`mon`..`sun`, `HH:mm`) |
| **Events** | `events` | `id` (unique `slug`) | Event Jakarta beserta jadwal, venue, harga tiket, organizer, kapasitas |
| **Promos** | `promos` | `id` | Promo aktif/draft/expired yang terhubung ke `spot_id` atau `event_id` |
| **Reviews** | `review_tags` | `id` | Chip pengalaman ulasan per spot yang dapat dikustomisasi owner |
| **Reviews** | `reviews` | `id` | Ulasan terverifikasi (QR check-in) beserta snapshot penulis & helpful count |
| **Communities** | `community_categories` | `id` (unique `slug`) | Kategori komunitas (Music, Gaming, Sport, Startup & Tech, dll.) |
| **Communities** | `communities` | `id` | Komunitas resmi/publik beserta statistik member & tipe komunitas |
| **Communities** | `community_updates` | `id` | Pengumuman/update yang dipublikasikan komunitas |
| **Communities** | `community_agendas` | `id` | Jadwal kegiatan/agenda komunitas |
| **Media & QR** | `gallery_assets` | `id` | Aset foto/video untuk spot, event, atau promo |
| **Media & QR** | `qr_codes` | `id` | QR Code lokasi untuk akses review terverifikasi atau halaman publik |
| **Content** | `blogs` | `slug` | Artikel editorial blog NgeTag |
| **Content** | `hype_items` | `id` | Konten pendek (video Reels & photo carousel) untuk halaman Hype |
| **Join Tables** | `spot_tags` | `(spot_id, tag_id)` | Relasi many-to-many Spot ↔ Tag |
| **Join Tables** | `event_tags` | `(event_id, tag_id)` | Relasi many-to-many Event ↔ Tag |
| **Join Tables** | `event_interests` | `(event_id, interest_id)` | Relasi many-to-many Event ↔ Interest |
| **Join Tables** | `customer_interests` | `(customer_id, interest_id)` | Relasi many-to-many Customer ↔ Interest |
| **Join Tables** | `customer_favorite_tags` | `(customer_id, tag_id)` | Relasi many-to-many Customer ↔ Favorite Tag |
| **Join Tables** | `owner_spots` | `(owner_id, spot_id)` | Relasi kepemilikan Owner ↔ Spot |
| **Join Tables** | `owner_events` | `(owner_id, event_id)` | Relasi kepemilikan Owner ↔ Event |
| **Join Tables** | `owner_communities` | `(owner_id, community_id)` | Relasi kepemilikan Owner ↔ Community |
| **Join Tables** | `review_selected_tags` | `(review_id, review_tag_id)` | Tag pengalaman yang dipilih pada suatu ulasan |
| **Engagements** | `bookmarks` | `id` | Spot atau event yang disimpan user |
| **Engagements** | `event_attendances` | `id` | Event yang ditambahkan user ke kalender |
| **Engagements** | `spot_visits` | `id` | Kunjungan spot terverifikasi dari scan QR |
| **Engagements** | `community_memberships` | `id` | Keanggotaan user pada komunitas |
| **Notifications** | `notifications` | `id` | Notifikasi tiket, kalender, dan sistem |

---

## 2. Zod Validation Schemas (`src/schemas/`)

Seluruh request payload dan query parameter divalidasi menggunakan Zod v4:

- `src/schemas/common.schema.ts` — `coordinatesSchema`, `geoLocationSchema`, `openingHourSchema`, `searchQuerySchema`, `publishStatusSchema`.
- `src/schemas/tag.schema.ts` — `tagSchema`, `createTagSchema`, `updateTagSchema`, `interestSchema`, `createInterestSchema`, `updateInterestSchema`.
- `src/schemas/spot.schema.ts` — `spotSchema`, `createSpotSchema`, `updateSpotSchema`.
- `src/schemas/event.schema.ts` — `eventSchema`, `createEventSchema`, `updateEventSchema`.
- `src/schemas/promo.schema.ts` — `promoSchema`, `createPromoSchema`, `updatePromoSchema`.
- `src/schemas/review.schema.ts` — `reviewSchema`, `createReviewSchema`, `updateReviewSchema`, `reviewTagSchema`, `createReviewTagSchema`.
- `src/schemas/community.schema.ts` — `communitySchema`, `createCommunitySchema`, `updateCommunitySchema`, `createCommunityUpdatePostSchema`, `createCommunityAgendaSchema`.
- `src/schemas/user.schema.ts` — `userSchema`, `updateUserSchema`, `ownerSchema`, `createOwnerSchema`, `updateOwnerSchema`.
- `src/schemas/engagement.schema.ts` — `toggleBookmarkSchema`, `toggleAttendanceSchema`, `markSpotVisitSchema`, `toggleMembershipSchema`, `createNotificationSchema`, `patchNotificationsSchema`.
- `src/schemas/content.schema.ts` — `blogArticleSchema`, `createBlogArticleSchema`, `hypeItemSchema`, `createHypeItemSchema`, `galleryAssetSchema`, `qrCodeSchema`.

---

## 3. REST API Endpoints (`app/api/`)

### System & Metadata
- `GET /api/health` — Status server, jumlah record setiap entitas, dan daftar endpoint.
- `GET /api/schema` — Manifest tabel Drizzle, enum, dan lokasi file kontrak.

### Spots (B2C Discovery & B2B CRUD)
- `GET /api/spots` — Cari/filter spot (`q`, `tagSlugs`, `city`, `sort`, `page`, `pageSize`, `lat`, `lng`, `mode=featured|recommended`, `ownerId`, `publishStatus`).
- `POST /api/spots` — Buat spot baru.
- `GET /api/spots/[id]` — Ambil detail spot berdasarkan `id` atau `slug`.
- `PATCH /api/spots/[id]` / `PUT /api/spots/[id]` — Perbarui spot.
- `DELETE /api/spots/[id]` — Hapus spot.
- `GET /api/spots/[id]/reviews` & `POST /api/spots/[id]/reviews` — Daftar & buat ulasan spot.
- `GET /api/spots/[id]/review-tags`, `POST /api/spots/[id]/review-tags`, `PUT /api/spots/[id]/review-tags` — Kelola review tags per spot.
- `GET /api/spots/[id]/opening-hours` & `PUT /api/spots/[id]/opening-hours` — Kelola jam operasional spot.
- `GET /api/spots/[id]/promos` — Daftar promo milik spot.

### Events (B2C Discovery & B2B CRUD)
- `GET /api/events` — Cari/filter event (`q`, `tagSlugs`, `interestIds`, `city`, `sort`, `page`, `pageSize`, `lat`, `lng`, `mode=featured|recommended`, `ownerId`, `publishStatus`).
- `POST /api/events` — Buat event baru.
- `GET /api/events/[id]`, `PATCH /api/events/[id]`, `DELETE /api/events/[id]` — Detail, update, dan hapus event (`id` atau `slug`).

### Promos
- `GET /api/promos` & `POST /api/promos` — Daftar promo (`ids`, `spotId`, `eventId`, `ownerId`, `status`, `limit`) & buat promo baru.
- `GET /api/promos/[id]`, `PATCH /api/promos/[id]`, `DELETE /api/promos/[id]` — Detail, update, dan hapus promo.

### Tags & Interests
- `GET /api/tags` & `POST /api/tags` — Daftar tag (`category`, `trending=true`, `limit`, `ids`) & tambah tag baru.
- `GET /api/tags/[slug]`, `PATCH /api/tags/[slug]`, `DELETE /api/tags/[slug]` — Detail, update, dan hapus tag.
- `GET /api/interests` & `POST /api/interests` — Daftar interest & tambah interest baru.
- `GET /api/interests/[id]`, `PATCH /api/interests/[id]`, `DELETE /api/interests/[id]` — Detail, update, dan hapus interest.

### Reviews & Review Tags
- `GET /api/reviews` & `POST /api/reviews` — Daftar ulasan (`spotId`, `authorId`) & tambah ulasan baru (otomatis mencatat `SpotVisit`).
- `GET /api/reviews/[id]`, `PATCH /api/reviews/[id]`, `DELETE /api/reviews/[id]` — Detail, update, dan hapus ulasan.
- `POST /api/reviews/[id]/helpful` — Tambah `helpfulCount` pada ulasan.
- `GET /api/review-tags` & `POST /api/review-tags` — Daftar & buat review tag.

### Communities
- `GET /api/communities` & `POST /api/communities` — Daftar komunitas (`categoryId`, `interestIds`, `tags`, `q`, `ownerId`, `publishStatus`) & buat komunitas.
- `GET /api/communities/categories` & `POST /api/communities/categories` — Daftar & tambah kategori komunitas.
- `GET /api/communities/[id]`, `PATCH /api/communities/[id]`, `DELETE /api/communities/[id]` — Detail, update, dan hapus komunitas.
- `GET /api/communities/[id]/updates` & `POST /api/communities/[id]/updates` — Daftar & buat update komunitas.
- `GET /api/communities/[id]/agendas` & `POST /api/communities/[id]/agendas` — Daftar & buat agenda komunitas.

### Editorial Blogs & Hype Feed
- `GET /api/blogs` & `POST /api/blogs` — Daftar & buat artikel blog.
- `GET /api/blogs/[slug]`, `PATCH /api/blogs/[slug]`, `DELETE /api/blogs/[slug]` — Detail, update, dan hapus artikel blog.
- `GET /api/hype` & `POST /api/hype` — Daftar & buat item Hype Reels/carousel.
- `GET /api/hype/[id]`, `PATCH /api/hype/[id]`, `DELETE /api/hype/[id]` — Detail, update, dan hapus item Hype.

### Search & Recommendations
- `GET /api/search` — Pencarian terpadu lintas spot, event, komunitas, tag, kategori, dan interest.
- `GET /api/recommendations` — Rekomendasi berbasis koordinat lokasi (`lat`, `lng`) serta preferensi (`favoriteTagIds`, `interestIds`).

### Users, Notifications & Engagements
- `GET /api/users` — Daftar seluruh customer.
- `GET /api/users/me` & `PATCH /api/users/me` — Profil user aktif.
- `GET /api/users/[id]` & `PATCH /api/users/[id]` — Detail & update profil customer.
- `GET /api/engagements/bookmarks` & `POST /api/engagements/bookmarks` — Daftar & toggle bookmark.
- `GET /api/engagements/attendances` & `POST /api/engagements/attendances` — Daftar & toggle kehadiran event di kalender.
- `GET /api/engagements/visits` & `POST /api/engagements/visits` — Daftar & catat kunjungan spot terverifikasi.
- `GET /api/engagements/memberships` & `POST /api/engagements/memberships` — Daftar & toggle keanggotaan komunitas.
- `GET /api/notifications`, `POST /api/notifications`, `PATCH /api/notifications` — Daftar, tambah, dan tandai notifikasi sudah dibaca.

### B2B Owner Dashboard & Handoff
- `GET /api/owners`, `POST /api/owners`, `GET /api/owners/[id]`, `PATCH /api/owners/[id]` — Manajemen akun owner B2B.
- `GET /api/gallery`, `POST /api/gallery`, `DELETE /api/gallery/[id]` — Manajemen aset media gallery.
- `GET /api/qr-codes`, `POST /api/qr-codes`, `GET /api/qr-codes/[id]`, `PATCH /api/qr-codes/[id]`, `DELETE /api/qr-codes/[id]` — Manajemen QR code lokasi.
- `GET /api/b2b/analytics` — Ringkasan metrik performa B2B (jumlah spot, event, promo, review, verified visits, bookmarks, attendances, dan performa per spot).
- `GET /api/b2b/handoff` & `POST /api/b2b/handoff` — Snapshot lengkap seluruh dataset kontrak B2B atau reset store ke state awal.
