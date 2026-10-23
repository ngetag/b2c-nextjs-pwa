# NgeTag B2B Handoff

Folder ini menjadi referensi awal untuk project NgeTag B2B Owner Dashboard. Isinya mengikuti struktur B2C saat ini agar naming, relasi data, dan flow tetap konsisten ketika backend atau microservice mulai dibuat.

## Folder

- `docs/b2b-handoff/`: dokumentasi handoff untuk tim B2B.
- `docs/b2b-handoff/design.md`: design handoff agar tema B2B konsisten dengan B2C.
- `src/shared/contracts/`: TypeScript contracts yang bisa dicopy ke B2B.
- `src/shared/mocks/`: mock data berbasis contracts untuk prototyping B2B.

## Entity B2C Saat Ini

### Spot

Tempat yang bisa ditemukan user B2C, ditampilkan di home, explore, search, detail spot, promo, dan review QR.

Field utama:
- `id`, `slug`, `name`, `description`
- `coverImageUrl`, `galleryUrls`
- `tagIds`
- `priceLevel`
- `location`
- `openingHours`
- `promoIds`
- `contact`
- `featured`
- `createdAt`, `lastUpdatedAt`, `lastUpdatedBy`

Untuk B2B, contract menambahkan `ownerId` dan `publishStatus` agar owner dashboard bisa mengelola draft/published/archived tanpa memutus struktur B2C.

### Event

Event yang ditemukan user lewat B2C home, explore, search, calendar, dan detail event.

Field utama:
- `id`, `slug`, `title`, `description`
- `coverImageUrl`
- `tagIds`, `interestIds`
- `startAt`, `endAt`
- `venueName`, `location`
- `price`
- `organizer`
- `status`, `capacity`, `ticketUrl`
- `featured`
- `createdAt`, `lastUpdatedAt`, `lastUpdatedBy`

Untuk B2B, contract menambahkan `ownerId` dan `publishStatus`.

### Promo

Promo yang bisa melekat ke spot atau event.

Field utama:
- `id`, `title`, `description`
- `validUntil`
- `discountPercent`, `code`, `imageUrl`
- `spotId` atau `eventId`

Untuk B2B, contract menambahkan `ownerId`, `ownerType`, dan `status`.

### Tag

Tag adalah primitive discovery utama di B2C. Tag dipakai untuk home trending tags, explore, search multi-tag, spot, event, dan rekomendasi.

Field utama:
- `id`, `slug`, `name`
- `category`
- `iconName`
- `trendingScore`

Kategori yang dipakai B2C saat ini:
- `vibe`
- `cuisine`
- `activity`
- `price`
- `occasion`

### Interest

Minat user yang dipakai untuk profile, komunitas, dan rekomendasi event.

Field utama:
- `id`
- `label`
- `slug`
- `isActive`
- `sortOrder`

Interest kemungkinan dikelola oleh admin B2B/internal, bukan owner individual.

### Review

Review dibuat dari flow QR Code per spot. Isi ulasan tetap free text, sedangkan review tags dipilih sebagai chips terpisah.

Field utama:
- `id`, `spotId`, `authorId`
- `authorSnapshot`
- `comment`
- `reviewTagIds`
- `imageUrls`
- `helpfulCount`
- `createdAt`, `updatedAt`

### Review Tag

Tag pengalaman yang dipilih user ketika membuat ulasan. Saat ini mock per spot, dan disiapkan agar nantinya bisa dikelola dari panel owner.

Field utama:
- `id`
- `spotId`
- `label`
- `value`
- `ownerEditable`
- `sortOrder`

### Community

Komunitas yang tampil di B2C pada menu komunitas, search discovery, dan detail komunitas. B2C saat ini menyimpan struktur komunitas di domain interest karena komunitas terhubung dengan kategori minat.

Field utama:
- `id`, `title`, `description`
- `coverImage`
- `categoryId`
- `tags`
- `memberCount`
- `activeEvents`
- `lastActiveAt`
- `isOfficial`
- `managedBy`, `managementName`
- `communityType`
- `updates`
- `agendas`

Untuk B2B, contract menambahkan `ownerId`, `publishStatus`, `createdAt`, dan `updatedAt`.

### Community Category

Kategori untuk mengelompokkan komunitas.

Field utama:
- `id`
- `title`
- `name`
- `slug`
- `image`
- `totalCommunities`

### Owner

Entity B2B untuk akun pengelola tempat/event.

Field utama:
- `id`, `name`, `email`, `phone`, `avatarUrl`
- `role`
- `status`
- `businessName`
- `managedSpotIds`
- `managedEventIds`
- `createdAt`, `updatedAt`

### Customer

User B2C. Di B2B owner dashboard data ini sebaiknya read-only dan dipakai untuk analytics agregat, bukan dikelola langsung oleh owner.

Field utama:
- `id`, `name`, `email`, `avatarUrl`
- `role`
- `bio`
- `interestIds`
- `badges`
- `joinedAt`
- `preferences.favoriteTagIds`

### Engagement Signals

Sinyal aktivitas user B2C yang berguna untuk insight owner.

Entity:
- `Bookmark`: user menyimpan spot/event.
- `EventAttendance`: user menyimpan/menghadiri event di calendar.
- `SpotVisit`: visit terverifikasi dari QR review.
- `CommunityMembership`: user join komunitas.

Data ini bukan content yang diedit owner. B2B hanya membaca agregatnya untuk dashboard insight.

### QR Code

QR Code dipakai untuk flow review spot di lokasi. Setiap spot punya URL review masing-masing.

Field utama:
- `id`
- `ownerId`
- `targetType`
- `targetId`
- `url`
- `label`
- `isActive`
- `createdAt`, `updatedAt`

Contoh URL:

```txt
https://ngetag-web.vercel.app/reviews/new?spotId=s1&source=qr
```

### Location

Dipakai oleh spot, event, dan current location user.

Field utama:
- `latitude`, `longitude`
- `address`
- `village`
- `district`
- `city`
- `province`, `postalCode`, `displayName`

### Gallery

Saat ini B2C masih memakai `coverImageUrl` dan `galleryUrls`. Contract B2B menambahkan struktur `GalleryAssetContract` agar media bisa dikelola lebih rapi dari owner dashboard.

Field utama:
- `id`
- `ownerType`: `spot`, `event`, atau `promo`
- `ownerId`
- `type`: `image` atau `video`
- `url`, `alt`
- `sortOrder`
- `isCover`
- `createdAt`, `updatedAt`

### Opening Hours

Dipakai oleh spot detail dan akan dikelola owner.

Field utama:
- `day`: `mon`, `tue`, `wed`, `thu`, `fri`, `sat`, `sun`
- `open`
- `close`
- `closed`

Format jam memakai `HH:mm` 24 jam.

## Relasi Data

- `Owner.managedSpotIds` -> `Spot.id`
- `Owner.managedEventIds` -> `Event.id`
- `Spot.ownerId` -> `Owner.id`
- `Event.ownerId` -> `Owner.id`
- `Community.ownerId` -> `Owner.id`
- `Community.categoryId` -> `CommunityCategory.id`
- `Customer.interestIds` -> `Interest.id`
- `Customer.preferences.favoriteTagIds` -> `Tag.id`
- `Spot.tagIds` -> `Tag.id`
- `Event.tagIds` -> `Tag.id`
- `Spot.promoIds` -> `Promo.id`
- `Promo.spotId` -> `Spot.id`
- `Promo.eventId` -> `Event.id`
- `Review.spotId` -> `Spot.id`
- `Review.reviewTagIds` -> `ReviewTag.id`
- `ReviewTag.spotId` -> `Spot.id`
- `GalleryAsset.ownerId` -> `Spot.id`, `Event.id`, atau `Promo.id`
- `QrCode.targetId` -> `Spot.id`, `Event.id`, atau `Promo.id`
- `Bookmark.targetId` -> `Spot.id` atau `Event.id`
- `EventAttendance.eventId` -> `Event.id`
- `SpotVisit.spotId` -> `Spot.id`
- `CommunityMembership.communityId` -> `Community.id`

## Struktur Data

Contracts ada di:

```ts
src/shared/contracts
```

Import yang disarankan:

```ts
import type {
  SpotContract,
  EventContract,
  PromoContract,
  ReviewContract,
  ReviewTagContract,
  OwnerContract,
  CommunityContract,
  CommunityCategoryContract,
  InterestContract,
  CustomerContract,
  QrCodeContract,
} from "@/shared/contracts";
```

Mock data ada di:

```ts
src/shared/mocks
```

Import yang disarankan:

```ts
import { b2bHandoffMock } from "@/shared/mocks";
```

## Design System B2C

B2C saat ini memakai:
- Next.js App Router.
- Tailwind CSS utility classes.
- CSS variables di `app/globals.css`.
- Font: `Inter` dan `Plus Jakarta Sans`.
- Icon: `lucide-react`.
- UI primitive lokal di `src/components/ui`.

Token warna penting:
- `--color-background`
- `--color-foreground`
- `--color-muted-foreground`
- `--color-surface`
- `--color-surface-soft`
- `--color-surface-elevated`
- `--color-border`
- `--color-primary`
- `--color-primary-hover`
- `--color-primary-foreground`
- `--color-accent`
- `--color-ring`
- `--color-destructive`

Pola UI:
- Radius card dominan `rounded-lg`.
- Card memakai border `var(--color-border)` dan background `var(--color-surface)`.
- Button/chip aktif memakai `var(--color-primary)`.
- Chips memakai rounded full.
- Layout mobile mengutamakan bottom nav dan content single column.
- Layout desktop memakai header, sidebar/filter, dan floating scan button.

## Flow Data B2C <-> B2B

### B2B ke B2C

1. Owner login ke B2B.
2. Owner membuat atau mengubah spot/event/promo/gallery/opening hours/review tags.
2. Owner juga dapat membuat atau mengubah komunitas, update komunitas, dan agenda komunitas.
3. B2B menyimpan data ke backend.
4. B2C membaca data published dari backend.
5. B2C menampilkan data di home, explore, search, komunitas, detail, promo, calendar, dan QR review.

Rules:
- B2C hanya menampilkan content dengan `publishStatus = "published"` atau `status = "active"` untuk promo.
- Draft dan archived tetap milik B2B.
- `id` stabil dan tidak berubah setelah dibuat.
- `slug` dipakai untuk URL publik, tetapi relasi tetap memakai `id`.

### B2C ke B2B

1. User B2C scan QR Code spot.
2. User masuk ke `/reviews/new?spotId=...&source=qr`.
3. User menulis `comment` dan memilih `reviewTagIds`.
4. Review tersimpan sebagai `Review`.
5. B2B dapat membaca review untuk dashboard insight owner.
6. Data visit dari B2C dapat dipakai untuk insight minat, frekuensi visit, dan rekomendasi tag.

Rules:
- Free text review disimpan di `comment`.
- Review tags disimpan di `reviewTagIds`.
- Review tags tidak dicampur ke dalam `comment`.
- `ReviewTag` dikelola per spot agar owner bisa menyesuaikan chips pengalaman.

## Catatan Implementasi Backend

- Gunakan `id` sebagai primary key antar service.
- Gunakan `slug` hanya untuk URL publik.
- Simpan timestamp dalam ISO string.
- Simpan relasi many-to-many dengan join table saat backend sudah tersedia:
  - `spot_tags`
  - `event_tags`
  - `owner_spots`
  - `owner_events`
  - `owner_communities`
  - `review_selected_tags`
- Contract saat ini intentionally additive: field B2C tetap ada, field B2B ditambahkan sebagai optional agar migrasi bertahap tidak memecah UI B2C.

## Coverage Audit

Yang perlu dikelola owner/admin B2B:
- Spot
- Event
- Promo
- Community
- Community Category
- Gallery
- Opening Hours
- Review Tags
- QR Code
- Tag
- Interest
- Owner

Yang perlu dibaca B2B sebagai analytics/read-only:
- Review
- Customer
- Bookmark
- Event Attendance
- Spot Visit
- Community Membership

Yang belum perlu masuk handoff sebagai entity terpisah:
- Search query, karena ini DTO/filter UI.
- Recommendation result, karena ini hasil kalkulasi dari tag, interest, location, visit, bookmark, dan attendance.
- Current location browser user, karena ini state sementara di client B2C.
