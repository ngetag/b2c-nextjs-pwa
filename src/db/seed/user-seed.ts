/**
 * Seed data user (customers) untuk NgeTag.
 *
 * Sumber kebenaran:
 * - Skema tabel: `src/db/schema.ts` (customers, customer_interests, customer_favorite_tags)
 * - Tipe domain: `src/types/user.ts`
 * - Fixture: `src/data/fixtures/users.ts`, `src/data/fixtures/reviews.ts`,
 *   `src/data/fixtures/interests.ts`, `src/data/fixtures/tags.ts`
 *
 * Data deterministik (tanpa random) supaya hasil seed selalu sama di setiap
 * environment. Semua nilai diturunkan dari yang memang sudah dipakai aplikasi:
 * - id `u-demo` = satu-satunya user di fixture `users.ts`.
 * - id `u1`..`u8` = authorId yang sudah muncul di fixture review.
 * - interestId `i-*` dan tagId `t*` = id yang ada di fixture interest & tag.
 *
 * Catatan: `customers.points` ada di skema database, tetapi belum ada di
 * `src/types/user.ts` maupun `CustomerContract`. Seed tetap mengisi `points`
 * sesuai skema DB; lihat `src/db/seed/README.md` untuk detail gap ini.
 */

import { interests as interestFixtures } from "@/data/fixtures/interests";
import { reviews as reviewFixtures } from "@/data/fixtures/reviews";
import { tags as tagFixtures } from "@/data/fixtures/tags";
import { demoUser } from "@/data/fixtures/users";
import type {
  customers,
  customerFavoriteTags,
  customerInterests,
} from "@/db/schema";
import type { UserBadge, UserPreferences, UserRole } from "@/types/user";

type CustomerInsert = typeof customers.$inferInsert;
type CustomerInterestInsert = typeof customerInterests.$inferInsert;
type CustomerFavoriteTagInsert = typeof customerFavoriteTags.$inferInsert;

// ============================================================================
// 1. Katalog badge (kategori mengikuti enum user_badge_category)
// ============================================================================

const BADGE = {
  komunitasJakarta: {
    id: "b-community-jakarta",
    label: "Komunitas Jakarta",
    category: "community",
  },
  nadaSenja: {
    id: "b-community-nada-senja",
    label: "Nada Senja Fans",
    category: "community",
  },
  runcrew: {
    id: "b-community-runcrew",
    label: "Runcrew Jakarta",
    category: "community",
  },
  coffee: {
    id: "b-interest-coffee",
    label: "Coffee Enthusiast",
    category: "interest",
  },
  music: { id: "b-interest-music", label: "Music Lover", category: "interest" },
  gaming: { id: "b-interest-gaming", label: "Gamer", category: "interest" },
  photo: { id: "b-interest-photo", label: "Photo Hunter", category: "interest" },
  wfc: { id: "b-interest-wfc", label: "Remote Worker", category: "interest" },
  reviewer: {
    id: "b-activity-reviewer",
    label: "Aktif Review",
    category: "activity",
  },
  checkin: {
    id: "b-activity-checkin",
    label: "Rajin Check-in",
    category: "activity",
  },
  explorerLocal: {
    id: "b-explorer-local",
    label: "Local Explorer",
    category: "explorer",
  },
  rooftop: {
    id: "b-explorer-rooftop",
    label: "Rooftop Hunter",
    category: "explorer",
  },
  nightowl: {
    id: "b-explorer-nightowl",
    label: "Night Owl",
    category: "explorer",
  },
  contributorEarly: {
    id: "b-contributor-early",
    label: "Early Contributor",
    category: "contributor",
  },
  contributorVerified: {
    id: "b-contributor-verified",
    label: "Verified Reviewer",
    category: "contributor",
  },
} satisfies Record<string, UserBadge>;

// ============================================================================
// 2. Metadata varian (dokumentasi & output CLI, bukan kolom tabel)
// ============================================================================

export type SeedVariantKey =
  | "demo"
  | "reviewer"
  | "admin"
  | "owner"
  | "power-user"
  | "new-user"
  | "sparse"
  | "outside-jakarta";

export interface SeedUserVariant {
  key: SeedVariantKey;
  label: string;
  note: string;
}

export const SEED_VARIANTS: Record<SeedVariantKey, SeedUserVariant> = {
  demo: {
    key: "demo",
    label: "Demo user (baseline)",
    note: "Salinan fixture `demoUser`: 5 badge (semua kategori), 4 interest, 3 favorite tag, city Jakarta.",
  },
  reviewer: {
    key: "reviewer",
    label: "Review author (u1–u8)",
    note: "Nama, avatar, email, dan joinedAt diturunkan dari fixture review agar authorId ulasan tetap valid.",
  },
  admin: {
    key: "admin",
    label: "Admin internal",
    note: "role = admin, seluruh interest, poin tinggi. Untuk uji alur kurasi konten.",
  },
  owner: {
    key: "owner",
    label: "Owner / organizer (sisi B2C)",
    note: "role = owner di tabel customers; akun B2B penuh tetap berada di tabel `owners`.",
  },
  "power-user": {
    key: "power-user",
    label: "Power user",
    note: "Seluruh 7 interest dan 20 favorite tag, badge terbanyak, poin tertinggi.",
  },
  "new-user": {
    key: "new-user",
    label: "User baru (nullable)",
    note: "Tanpa avatar, bio, badge, interest, dan preferences = null; poin 0.",
  },
  sparse: {
    key: "sparse",
    label: "User lama (sparse)",
    note: "Bio null, preferences tanpa `city`, hanya 1 interest dan 1 favorite tag.",
  },
  "outside-jakarta": {
    key: "outside-jakarta",
    label: "Luar Jakarta",
    note: "city = Bandung untuk menguji filter/rekomendasi yang tidak mengasumsikan Jakarta.",
  },
};

// ============================================================================
// 3. Helper
// ============================================================================

function firstReviewOf(authorId: string) {
  const authored = reviewFixtures
    .filter((review) => review.authorId === authorId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  if (authored.length === 0) {
    throw new Error(
      `Tidak ada review untuk authorId '${authorId}'. Cek src/data/fixtures/reviews.ts.`,
    );
  }

  return authored[0];
}

function reviewerIdentity(authorId: string) {
  const review = firstReviewOf(authorId);
  return {
    id: authorId,
    name: review.authorSnapshot.name,
    email: `${authorId}@ngetag.mock`,
    avatarUrl: review.authorSnapshot.avatarUrl,
    joinedAt: new Date(review.createdAt),
  };
}

function preferences(favoriteTagIds: string[], city?: string): UserPreferences {
  return city ? { favoriteTagIds, city } : { favoriteTagIds };
}

// ============================================================================
// 4. Profil seed (baris tabel + relasi interest)
// ============================================================================

export interface SeedCustomerProfile {
  /** Baris siap insert ke tabel `customers`. */
  customer: CustomerInsert;
  /** Relasi ke `customer_interests` (bukan kolom di tabel customers). */
  interestIds: string[];
  variant: SeedVariantKey;
}

interface ReviewerSeed {
  id: string;
  bio: string;
  interestIds: string[];
  favoriteTagIds: string[];
  badges: UserBadge[];
  points: number;
  city?: string;
}

const reviewerSeeds: ReviewerSeed[] = [
  {
    id: "u1",
    bio: "Content writer yang hobi hunting kafe dan pameran foto di Jakarta Selatan.",
    interestIds: ["i-coffee", "i-photo"],
    favoriteTagIds: ["t1", "t8", "t9"],
    badges: [BADGE.komunitasJakarta, BADGE.coffee, BADGE.contributorEarly],
    points: 860,
    city: "Jakarta",
  },
  {
    id: "u2",
    bio: "Pecinta live music dan Valorant ranked. Weekend selalu ada agenda konser.",
    interestIds: ["i-music", "i-gaming"],
    favoriteTagIds: ["t3", "t18", "t20"],
    badges: [BADGE.music, BADGE.gaming, BADGE.reviewer],
    points: 640,
    city: "Jakarta",
  },
  {
    id: "u3",
    bio: "Remote worker yang butuh Wi-Fi cepat, colokan, dan kopi enak.",
    interestIds: ["i-coffee", "i-wfc", "i-photo"],
    favoriteTagIds: ["t1", "t15", "t16"],
    badges: [BADGE.coffee, BADGE.explorerLocal],
    points: 415,
    city: "Jakarta",
  },
  {
    id: "u4",
    bio: "Runner pemula, rutin ikut Sunday long run bareng Runcrew Jakarta.",
    interestIds: ["i-sports", "i-gaming"],
    favoriteTagIds: ["t11", "t14"],
    badges: [BADGE.runcrew, BADGE.checkin],
    points: 300,
    city: "Jakarta",
  },
  {
    id: "u5",
    bio: "Fotografer amatir yang percaya lighting terbaik ada di jam emas.",
    interestIds: ["i-photo", "i-coffee"],
    favoriteTagIds: ["t8", "t7", "t9"],
    badges: [BADGE.photo, BADGE.reviewer, BADGE.contributorVerified],
    points: 980,
    city: "Jakarta",
  },
  {
    id: "u6",
    bio: "Founder early-stage, sering pindah coworking dan demo night.",
    interestIds: ["i-startup", "i-wfc"],
    favoriteTagIds: ["t16", "t12", "t6"],
    badges: [BADGE.wfc, BADGE.contributorEarly],
    points: 520,
    city: "Jakarta",
  },
  {
    id: "u7",
    bio: "Fans Nada Senja. Suka akustik, vinyl, dan rooftop.",
    interestIds: ["i-music", "i-photo"],
    favoriteTagIds: ["t3", "t8", "t20"],
    badges: [BADGE.nadaSenja, BADGE.reviewer],
    points: 720,
    city: "Jakarta",
  },
  {
    id: "u8",
    bio: "Gamer yang juga mengikuti kabar startup. Sering mampir kafe 24 jam.",
    interestIds: ["i-gaming", "i-startup"],
    favoriteTagIds: ["t18", "t20"],
    badges: [BADGE.gaming],
    points: 260,
    city: "Jakarta",
  },
];

const allInterestIds = interestFixtures.map((interest) => interest.id);
const allTagIds = tagFixtures.map((tag) => tag.id);

export const SEED_CUSTOMER_PROFILES: SeedCustomerProfile[] = [
  // Baseline: persis fixture demoUser.
  {
    variant: "demo",
    interestIds: demoUser.interestIds,
    customer: {
      id: demoUser.id,
      name: demoUser.name,
      email: demoUser.email,
      avatarUrl: demoUser.avatarUrl ?? null,
      role: demoUser.role,
      bio: demoUser.bio ?? null,
      badges: demoUser.badges,
      preferences: demoUser.preferences ?? null,
      points: 1240,
      joinedAt: new Date(demoUser.joinedAt),
      updatedAt: null,
    },
  },

  // Delapan author review (u1–u8), identitas disamakan dengan fixture review.
  ...reviewerSeeds.map<SeedCustomerProfile>((seed) => {
    const identity = reviewerIdentity(seed.id);
    return {
      variant: "reviewer",
      interestIds: seed.interestIds,
      customer: {
        id: identity.id,
        name: identity.name,
        email: identity.email,
        avatarUrl: identity.avatarUrl,
        role: "customer",
        bio: seed.bio,
        badges: seed.badges,
        preferences: preferences(seed.favoriteTagIds, seed.city),
        points: seed.points,
        joinedAt: identity.joinedAt,
        updatedAt: null,
      },
    };
  }),

  // Admin internal.
  {
    variant: "admin",
    interestIds: allInterestIds,
    customer: {
      id: "u-admin-curator",
      name: "Admin Kurasi NgeTag",
      email: "admin@ngetag.id",
      avatarUrl: "https://picsum.photos/seed/u-admin-curator/200/200",
      role: "admin",
      bio: "Admin kurasi konten: spot, event, promo, dan review tag.",
      badges: [BADGE.contributorVerified, BADGE.contributorEarly, BADGE.reviewer],
      preferences: preferences(["t1", "t2", "t3", "t8", "t20"], "Jakarta"),
      points: 5000,
      joinedAt: new Date("2024-06-01T03:00:00.000Z"),
      updatedAt: new Date("2026-09-30T09:15:00.000Z"),
    },
  },

  // Owner spot (sisi B2C).
  {
    variant: "owner",
    interestIds: ["i-coffee", "i-wfc"],
    customer: {
      id: "u-owner-kopi-tuku",
      name: "Ayu Pramesti",
      email: "owner.kopituku@ngetag.id",
      avatarUrl: "https://picsum.photos/seed/u-ayu/200/200",
      role: "owner",
      bio: "Owner Kopi Tuku Cipete. Terbuka pada feedback jujur pelanggan.",
      badges: [BADGE.coffee, BADGE.contributorEarly],
      preferences: preferences(["t1", "t15", "t16"], "Jakarta"),
      points: 1540,
      joinedAt: new Date("2024-09-12T04:30:00.000Z"),
      updatedAt: new Date("2026-08-18T07:20:00.000Z"),
    },
  },

  // Owner event organizer.
  {
    variant: "owner",
    interestIds: ["i-music", "i-photo"],
    customer: {
      id: "u-owner-organizer-jfp",
      name: "Rizky Ananda",
      email: "organizer.jfp@ngetag.id",
      avatarUrl: "https://picsum.photos/seed/u-rizky/200/200",
      role: "owner",
      bio: "Promoter musik indie. Mengelola listing event dan promo organizer.",
      badges: [BADGE.nadaSenja, BADGE.music],
      preferences: preferences(["t3", "t20"], "Jakarta"),
      points: 610,
      joinedAt: new Date("2025-02-02T09:00:00.000Z"),
      updatedAt: null,
    },
  },

  // Power user: seluruh interest & seluruh tag favorit.
  {
    variant: "power-user",
    interestIds: allInterestIds,
    customer: {
      id: "u-power-salsabila",
      name: "Salsabila Putri",
      email: "salsabila.putri@ngetag.id",
      avatarUrl: "https://picsum.photos/seed/u-salsabila/200/200",
      role: "customer",
      bio: "Hampir semua kafe dan event Jakarta sudah dicoba. Rela antre demi review.",
      badges: [
        BADGE.komunitasJakarta,
        BADGE.coffee,
        BADGE.music,
        BADGE.photo,
        BADGE.reviewer,
        BADGE.checkin,
        BADGE.explorerLocal,
        BADGE.rooftop,
        BADGE.nightowl,
        BADGE.contributorVerified,
      ],
      preferences: preferences(allTagIds, "Jakarta Selatan"),
      points: 4200,
      joinedAt: new Date("2025-03-22T11:45:00.000Z"),
      updatedAt: new Date("2026-10-10T13:05:00.000Z"),
    },
  },

  // User baru: seluruh field opsional kosong.
  {
    variant: "new-user",
    interestIds: [],
    customer: {
      id: "u-new-rani",
      name: "Rani Kusuma",
      email: "rani.kusuma@ngetag.id",
      avatarUrl: null,
      role: "customer",
      bio: null,
      badges: [],
      preferences: null,
      points: 0,
      joinedAt: new Date("2026-10-01T02:15:00.000Z"),
      updatedAt: null,
    },
  },

  // User lama: sparse, preferences tanpa `city`.
  {
    variant: "sparse",
    interestIds: ["i-coffee"],
    customer: {
      id: "u-legacy-budi",
      name: "Budi Santoso",
      email: "budi.santoso@ngetag.id",
      avatarUrl: "https://picsum.photos/seed/u-budi/200/200",
      role: "customer",
      bio: null,
      badges: [BADGE.coffee],
      preferences: preferences(["t11"]),
      points: 45,
      joinedAt: new Date("2024-08-17T06:40:00.000Z"),
      updatedAt: null,
    },
  },

  // Di luar Jakarta.
  {
    variant: "outside-jakarta",
    interestIds: ["i-coffee", "i-photo"],
    customer: {
      id: "u-bandung-yoga",
      name: "Yoga Pratama",
      email: "yoga.pratama@ngetag.id",
      avatarUrl: "https://picsum.photos/seed/u-yoga/200/200",
      role: "customer",
      bio: "Sering dinas ke Jakarta, tapi basis utama di Bandung.",
      badges: [BADGE.photo],
      preferences: preferences(["t1", "t8"], "Bandung"),
      points: 180,
      joinedAt: new Date("2025-11-09T08:25:00.000Z"),
      updatedAt: null,
    },
  },
];

// ============================================================================
// 5. Baris tabel (customers + join tables)
// ============================================================================

/** Baris `customers` tanpa metadata varian/interest. */
export const SEED_CUSTOMERS: CustomerInsert[] = SEED_CUSTOMER_PROFILES.map(
  (profile) => profile.customer,
);

export const SEED_CUSTOMER_INTERESTS: CustomerInterestInsert[] =
  SEED_CUSTOMER_PROFILES.flatMap((profile) =>
    profile.interestIds.map((interestId) => ({
      customerId: profile.customer.id,
      interestId,
    })),
  );

export const SEED_CUSTOMER_FAVORITE_TAGS: CustomerFavoriteTagInsert[] =
  SEED_CUSTOMER_PROFILES.flatMap((profile) =>
    (profile.customer.preferences?.favoriteTagIds ?? []).map((tagId) => ({
      customerId: profile.customer.id,
      tagId,
    })),
  );

/** Varian per customer id — dipakai untuk ringkasan CLI & dokumentasi. */
export const SEED_VARIANT_BY_CUSTOMER: Record<string, SeedVariantKey> =
  Object.fromEntries(
    SEED_CUSTOMER_PROFILES.map((profile) => [
      profile.customer.id,
      profile.variant,
    ]),
  );

// ============================================================================
// 6. Statistik & validasi
// ============================================================================

const roleCounts = SEED_CUSTOMERS.reduce<Record<string, number>>(
  (acc, customer) => {
    const role = customer.role ?? "customer";
    acc[role] = (acc[role] ?? 0) + 1;
    return acc;
  },
  {},
);

export const SEED_USER_STATS = {
  customers: SEED_CUSTOMERS.length,
  byRole: roleCounts,
  customerInterests: SEED_CUSTOMER_INTERESTS.length,
  customerFavoriteTags: SEED_CUSTOMER_FAVORITE_TAGS.length,
  withBadges: SEED_CUSTOMERS.filter(
    (customer) => (customer.badges ?? []).length > 0,
  ).length,
  withoutPreferences: SEED_CUSTOMERS.filter(
    (customer) => customer.preferences === null,
  ).length,
  cities: Array.from(
    new Set(
      SEED_CUSTOMERS.map((customer) => customer.preferences?.city).filter(
        (city): city is string => Boolean(city),
      ),
    ),
  ).sort(),
};

const VALID_ROLES: UserRole[] = ["customer", "owner", "admin"];
const VALID_BADGE_CATEGORIES = new Set([
  "community",
  "interest",
  "activity",
  "explorer",
  "contributor",
]);
const INTEREST_IDS = new Set(allInterestIds);
const TAG_IDS = new Set(allTagIds);

/**
 * Memastikan seed tidak pernah menghasilkan baris yang melanggar skema atau
 * mereferensikan id yang tidak ada di fixture. Mengembalikan daftar error.
 */
export function validateSeed(): string[] {
  const errors: string[] = [];
  const seenIds = new Set<string>();
  const seenEmails = new Set<string>();

  for (const customer of SEED_CUSTOMERS) {
    const label = customer.id ?? "<tanpa id>";

    if (!customer.id || customer.id.length > 64) {
      errors.push(`${label}: id wajib diisi dan maksimal 64 karakter.`);
    }
    if (!customer.name || customer.name.length > 255) {
      errors.push(`${label}: name wajib diisi dan maksimal 255 karakter.`);
    }
    if (!customer.email || customer.email.length > 255) {
      errors.push(`${label}: email wajib diisi dan maksimal 255 karakter.`);
      continue;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      errors.push(`${label}: email tidak valid (${customer.email}).`);
    }
    if (seenIds.has(customer.id)) {
      errors.push(`${label}: id duplikat.`);
    }
    if (seenEmails.has(customer.email)) {
      errors.push(`${label}: email duplikat (${customer.email}).`);
    }
    if (customer.role && !VALID_ROLES.includes(customer.role)) {
      errors.push(`${label}: role '${customer.role}' tidak ada di enum.`);
    }
    if ((customer.points ?? 0) < 0) {
      errors.push(`${label}: points tidak boleh negatif.`);
    }

    seenIds.add(customer.id);
    seenEmails.add(customer.email);

    for (const badge of customer.badges ?? []) {
      if (!VALID_BADGE_CATEGORIES.has(badge.category)) {
        errors.push(
          `${label}: badge '${badge.id}' memakai kategori tidak dikenal.`,
        );
      }
      if (!badge.id || badge.label.length === 0) {
        errors.push(`${label}: badge tanpa id/label.`);
      }
    }

    const favoriteTagIds = customer.preferences?.favoriteTagIds ?? [];
    for (const tagId of favoriteTagIds) {
      if (!TAG_IDS.has(tagId)) {
        errors.push(`${label}: favorite tag '${tagId}' tidak ada di fixture.`);
      }
    }
    if (new Set(favoriteTagIds).size !== favoriteTagIds.length) {
      errors.push(`${label}: favoriteTagIds mengandung duplikat.`);
    }
    if (!customer.joinedAt || Number.isNaN(customer.joinedAt.getTime())) {
      errors.push(`${label}: joinedAt bukan tanggal valid.`);
    }
  }

  for (const link of SEED_CUSTOMER_INTERESTS) {
    if (!seenIds.has(link.customerId)) {
      errors.push(`customer_interests: customer '${link.customerId}' tidak ada.`);
    }
    if (!INTEREST_IDS.has(link.interestId)) {
      errors.push(
        `customer_interests: interest '${link.interestId}' tidak ada di fixture.`,
      );
    }
  }

  for (const link of SEED_CUSTOMER_FAVORITE_TAGS) {
    if (!seenIds.has(link.customerId)) {
      errors.push(
        `customer_favorite_tags: customer '${link.customerId}' tidak ada.`,
      );
    }
    if (!TAG_IDS.has(link.tagId)) {
      errors.push(
        `customer_favorite_tags: tag '${link.tagId}' tidak ada di fixture.`,
      );
    }
  }

  // Invariant: JSONB preferences.favoriteTagIds == isi tabel join.
  for (const customer of SEED_CUSTOMERS) {
    const jsonTags = [...(customer.preferences?.favoriteTagIds ?? [])].sort();
    const joinTags = SEED_CUSTOMER_FAVORITE_TAGS.filter(
      (link) => link.customerId === customer.id,
    )
      .map((link) => link.tagId)
      .sort();

    if (jsonTags.join(",") !== joinTags.join(",")) {
      errors.push(
        `${customer.id}: preferences.favoriteTagIds tidak sinkron dengan customer_favorite_tags.`,
      );
    }
  }

  return errors;
}
