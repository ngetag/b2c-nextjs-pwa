# Auth, telemetry, recommendation & API docs

Dokumen ini menjelaskan empat penambahan pada NgeTag Customer Web App:

1. **Autentikasi** — signup/login email + OAuth (Google/GitHub), JWT claims, sesi refresh-token.
2. **Telemetri aktivitas asinkron** — ingest `202 Accepted`, di-flush setelah respons, membentuk *taste vector*.
3. **Recommendation engine** — pgvector (cosine) + PostGIS (radius), fallback cold start.
4. **Dokumentasi API** — JSDoc `@openapi` di setiap handler, `GET /api/openapi`, Swagger UI di `/api-docs`.

Referensi skema database & inventaris endpoint awal: [`docs/api-and-schema.md`](./api-and-schema.md).

---

## 1. Autentikasi

### Token

| Token | Bentuk | TTL | Penyimpanan |
|---|---|---|---|
| Access token | JWT HS256 (`jose`) | 15 menit | Cookie httpOnly `ngetag_at` + `Authorization: Bearer` |
| Refresh token | string acak 48 byte | 30 hari | Cookie httpOnly `ngetag_rt`; hanya **SHA-256 hash** yang disimpan |

Refresh token **dirotasi** setiap kali dipakai (`POST /api/auth/refresh`), dan baris sesi bisa
dicabut seketika (`POST /api/auth/logout`, `DELETE /api/auth/sessions/{id}`).

### JWT claims (data personalisasi)

`src/shared/auth.ts` → `NgetagJwtClaims`:

```
sub, sid, iss, aud, iat, exp, jti            # standar + id sesi
name, email, picture                          # identitas
role, tier, points, badges                    # gamifikasi
interests, favoriteTags, city, locale         # personalisasi (cold start rekomendasi)
scope, provider, emailVerified                # provenance token
```

Klaim disusun di `src/lib/auth/claims.ts` (`buildJwtClaims`) dan dipakai klien lewat
`src/stores/auth.store.ts` → `useAuth()`. Halaman `/account` menampilkan isi klaim secara
langsung (`JwtClaimsCard`), sehingga kontrak token mudah diverifikasi.

### Alur

- **Signup** — `POST /api/auth/signup` (`signupSchema`): nama, email, password (min 8),
  `interestIds`, `favoriteTagIds`, `city`. Minat/favourite tag dipakai sebagai vektor cold start.
- **Login** — `POST /api/auth/login`. Password di-hash dengan **scrypt** (`src/lib/auth/password.ts`),
  diverifikasi dengan `timingSafeEqual`.
- **OAuth** — `GET /api/auth/oauth/{google|github}` → simpan `state` (dan PKCE verifier untuk Google)
  di cookie httpOnly → redirect ke provider. Callback menukar `code`, membaca profil, lalu
  mencari/menautkan/membuat customer (`linkOAuthAccount`).
  Bila kredensial provider belum di-set, alur **demo** dipakai dan respons ditandai `demo: true`.
- **Proteksi halaman** — `proxy.ts` (Next 16, pengganti `middleware`) mengarahkan pengunjung
  tanpa cookie sesi dari `/account` ke `/auth/login?next=…`. Parameter `next` selalu disanitasi
  (`sanitizeNextPath`) menjadi path same-origin.

### Repositori

`src/server/auth/index.ts` memilih implementasi berdasarkan `DATABASE_URL`:

- `memory-auth.repo.ts` — Map di memori, seeded dengan `demo@ngetag.id` / `ngetag123`.
- `postgres-auth.repo.ts` — Drizzle + tabel `customers`, `customer_credentials`,
  `oauth_accounts`, `auth_sessions` (lihat `src/db/auth.schema.ts`).

---

## 2. Telemetri asinkron

### Pipeline

```
klien (trackEvent)                    server
-----------------                     ------
queue 20 event / 4 s debounce   →  POST /api/telemetry/events
sendBeacon saat pagehide            ├─ validasi zod (maks 50 event)
                                    ├─ normalisasi (timestamp, bobot, embedding 384d)
                                    ├─ simpan ke buffer  → 202 Accepted
                                    └─ after(() => flushTelemetry())
                                          ├─ tulis telemetry_events (pg / memori)
                                          └─ perbarui customer_taste_vectors
```

Karena penulisan terjadi di `after()` (dijalankan Next.js **setelah** respons terkirim),
latensi ingest tidak bergantung pada database. Buffer di-flush otomatis ±800 ms setelah
ingest terakhir, atau langsung saat mencapai 100 event.

### Event

26 tipe event (`page_view`, `spot_view`, `search`, `qr_scan`, `bookmark_add`, `dwell`,
`recommendation_click`, …) — lihat `src/shared/telemetry.ts`. Bobot tiap tipe
(`TELEMETRY_EVENT_WEIGHTS`) menentukan seberapa kuat event menggeser taste vector; `dwell`
diskala berdasarkan durasi.

Identitas **tidak** diambil dari body bila pengguna login: server memakai klaim JWT
(`cust:<id>`), atau `anonymousId` untuk guest (`anon:<uuid>`).

### Vektor

- `embedTelemetryEvent` menghasilkan vektor 384 dimensi deterministik (feature hashing atas
  tipe event, target, tag, interest, surface, query).
- `customer_taste_vectors.embedding` = agregat vektor event dengan decay waktu (half-life)
  dan bobot positif/negatif (mis. `bookmark_remove` mengurangi preferensi).
- `content_embeddings.embedding` = embedding konten (spot/event/komunitas/promo/blog/hype),
  disinkronkan oleh `syncContentEmbeddings()` dan `POST /api/telemetry/reindex`.

### Endpoint

| Endpoint | Keterangan |
|---|---|
| `POST /api/telemetry/events` | Ingest batch (auth opsional), `202` + `after()` flush |
| `GET /api/telemetry/events` | Riwayat aktivitas milik pengguna (wajib JWT) |
| `GET /api/telemetry/profile` | Taste vector + bobot tag/interest (auth atau `anonymousId`) |
| `GET /api/telemetry/summary` | Agregat publik (tipe event, top target/tag, cakupan index) |
| `POST /api/telemetry/flush` | Paksa flush buffer (JWT / admin / `x-telemetry-token`) |
| `POST /api/telemetry/reindex` | Rebuild `content_embeddings` (admin / mesin) |

### Privasi

- SDK menghormati **Do Not Track** dan `NEXT_PUBLIC_TELEMETRY_DISABLED=true`.
- IP hanya disimpan sebagai hash; user agent dipotong.
- Rute `/auth`, `/theme`, dan `/api-docs` tidak dilacak.

---

## 3. Recommendation engine

`GET /api/recommendations/for-you` memilih sumber vektor secara berurutan:

1. **taste vector** hasil telemetri → cosine similarity `<=>` terhadap `content_embeddings`
   (pgvector), opsional difilter radius PostGIS (`ST_DWithin`, default 12 km).
2. **cold start** → vektor dari klaim JWT (`interests`, `favoriteTags`) + kota.
3. **trending** → featured-first dengan skor menurun.

`GET /api/recommendations/similar?ownerType=spot&ownerId=s15` memakai indeks yang sama untuk
"mirip dengan ini". Keduanya mengembalikan `reason` (`taste-vector`, `cold-start`, `trending`,
`similar-content`) agar hasil mudah di-debug.

---

## 4. Dokumentasi API

- **Kontrak tunggal:** `src/server/openapi/registry.ts` (path, method, auth, parameter, body zod).
- **Skema komponen:** `src/server/openapi/components.ts`; dokumen dibangun oleh
  `src/server/openapi/document.ts` (zod → JSON Schema via `z.toJSONSchema`).
- **JSDoc per handler:** setiap `app/api/**/route.ts` memiliki blok
  `GET /api/spots — …` + `@openapi`. Regenerasi dengan:

  ```bash
  npm run docs:jsdoc        # tulis ulang blok
  npm run docs:jsdoc:check  # gagal bila ada handler yang belum sinkron
  ```

- **Spesifikasi:** `GET /api/openapi` (OpenAPI 3.1).
- **Swagger UI:** `/api-docs` — bundel `swagger-ui-dist` di-host sendiri lewat
  `/api-docs/assets/*` (tanpa CDN), warnanya dipetakan ke token tema aktif.

---

## 5. Tema

Dua tema, dipilih lewat cookie `ngetag-theme` (server-rendered, tanpa flash):

| Tema | Nama | Aksen |
|---|---|---|
| `dark` (default) | Midnight Neon | cyan `#00FFFF` |
| `light` | Lavender Glass | ungu `#7C3AED`, permukaan kaca `rgb(255 255 255 / .58)` |

Semua komponen memakai token (`--color-*`, `--glass-*`), bukan warna literal. `ThemeToggle`
tersedia di header desktop, header mobile, halaman auth, dan `/account`; galeri perbandingan
ada di `/theme`. Media gelap (Hype) memakai `data-theme-locked="dark"`.
