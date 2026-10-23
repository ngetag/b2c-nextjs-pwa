import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import type { BlogSection } from "@/types/blog";
import type { ReviewAuthorSnapshot } from "@/types/review";
import type { SpotContact } from "@/types/spot";
import type { UserBadge, UserPreferences } from "@/types/user";

// ============================================================================
// PostgreSQL Enums
// ============================================================================

export const userRoleEnum = pgEnum("user_role", [
  "customer",
  "owner",
  "admin",
]);

export const userBadgeCategoryEnum = pgEnum("user_badge_category", [
  "community",
  "interest",
  "activity",
  "explorer",
  "contributor",
]);

export const ownerRoleEnum = pgEnum("owner_role", [
  "owner",
  "manager",
  "staff",
]);

export const ownerAccountStatusEnum = pgEnum("owner_account_status", [
  "invited",
  "active",
  "suspended",
]);

export const publishStatusEnum = pgEnum("publish_status", [
  "draft",
  "published",
  "archived",
]);

export const tagCategoryEnum = pgEnum("tag_category", [
  "vibe",
  "cuisine",
  "activity",
  "price",
  "occasion",
]);

export const dayKeyEnum = pgEnum("day_key", [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
]);

export const eventStatusEnum = pgEnum("event_status", [
  "upcoming",
  "ongoing",
  "past",
]);

export const promoOwnerTypeEnum = pgEnum("promo_owner_type", [
  "spot",
  "event",
]);

export const promoStatusEnum = pgEnum("promo_status", [
  "draft",
  "active",
  "expired",
  "archived",
]);

export const communityTypeEnum = pgEnum("community_type", [
  "official",
  "fanbase",
  "team",
  "guild",
  "creator",
  "club",
  "learning",
  "network",
]);

export const galleryOwnerTypeEnum = pgEnum("gallery_owner_type", [
  "spot",
  "event",
  "promo",
]);

export const galleryAssetTypeEnum = pgEnum("gallery_asset_type", [
  "image",
  "video",
]);

export const qrCodeTargetTypeEnum = pgEnum("qr_code_target_type", [
  "spot-review",
  "spot",
  "event",
  "promo",
]);

export const bookmarkTargetTypeEnum = pgEnum("bookmark_target_type", [
  "spot",
  "event",
]);

export const hypeContentTypeEnum = pgEnum("hype_content_type", [
  "video",
  "photo_carousel",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "ticket",
  "calendar",
  "system",
]);

// ============================================================================
// 1. Accounts: Owners (B2B) & Customers (B2C)
// ============================================================================

export const owners = pgTable(
  "owners",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 64 }),
    avatarUrl: text("avatar_url"),
    role: ownerRoleEnum("role").notNull().default("owner"),
    status: ownerAccountStatusEnum("status").notNull().default("active"),
    businessName: varchar("business_name", { length: 255 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [uniqueIndex("owners_email_idx").on(table.email)],
);

export const customers = pgTable(
  "customers",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    avatarUrl: text("avatar_url"),
    role: userRoleEnum("role").notNull().default("customer"),
    bio: text("bio"),
    badges: jsonb("badges").$type<UserBadge[]>().notNull().default([]),
    preferences: jsonb("preferences")
      .$type<UserPreferences>()
      .default({ favoriteTagIds: [] }),
    points: integer("points").notNull().default(0),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [uniqueIndex("customers_email_idx").on(table.email)],
);

// ============================================================================
// 2. Taxonomy: Tags & Interests
// ============================================================================

export const tags = pgTable(
  "tags",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    slug: varchar("slug", { length: 128 }).notNull(),
    name: varchar("name", { length: 128 }).notNull(),
    category: tagCategoryEnum("category").notNull(),
    iconName: varchar("icon_name", { length: 64 }),
    trendingScore: integer("trending_score").default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [uniqueIndex("tags_slug_idx").on(table.slug)],
);

export const interests = pgTable(
  "interests",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    label: varchar("label", { length: 128 }).notNull(),
    slug: varchar("slug", { length: 128 }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [uniqueIndex("interests_slug_idx").on(table.slug)],
);

// ============================================================================
// 3. Spots & Opening Hours
// ============================================================================

export const spots = pgTable(
  "spots",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    ownerId: varchar("owner_id", { length: 64 }).references(() => owners.id, {
      onDelete: "set null",
    }),
    slug: varchar("slug", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description").notNull(),
    coverImageUrl: text("cover_image_url").notNull(),
    galleryUrls: jsonb("gallery_urls").$type<string[]>().notNull().default([]),
    priceLevel: smallint("price_level").notNull().default(2),
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    address: text("address").notNull(),
    village: varchar("village", { length: 128 }).notNull(),
    district: varchar("district", { length: 128 }).notNull(),
    city: varchar("city", { length: 128 }).notNull(),
    province: varchar("province", { length: 128 }),
    postalCode: varchar("postal_code", { length: 32 }),
    displayName: varchar("display_name", { length: 255 }),
    contact: jsonb("contact").$type<SpotContact>(),
    featured: boolean("featured").notNull().default(false),
    publishStatus: publishStatusEnum("publish_status")
      .notNull()
      .default("published"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastUpdatedAt: timestamp("last_updated_at", { withTimezone: true }),
    lastUpdatedBy: varchar("last_updated_by", { length: 255 }),
  },
  (table) => [uniqueIndex("spots_slug_idx").on(table.slug)],
);

export const spotOpeningHours = pgTable(
  "spot_opening_hours",
  {
    spotId: varchar("spot_id", { length: 64 })
      .notNull()
      .references(() => spots.id, { onDelete: "cascade" }),
    day: dayKeyEnum("day").notNull(),
    open: varchar("open", { length: 5 }).notNull(),
    close: varchar("close", { length: 5 }).notNull(),
    closed: boolean("closed").notNull().default(false),
  },
  (table) => [primaryKey({ columns: [table.spotId, table.day] })],
);

// ============================================================================
// 4. Events
// ============================================================================

export const events = pgTable(
  "events",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    ownerId: varchar("owner_id", { length: 64 }).references(() => owners.id, {
      onDelete: "set null",
    }),
    slug: varchar("slug", { length: 255 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    coverImageUrl: text("cover_image_url").notNull(),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }).notNull(),
    venueName: varchar("venue_name", { length: 255 }).notNull(),
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    address: text("address").notNull(),
    village: varchar("village", { length: 128 }).notNull(),
    district: varchar("district", { length: 128 }).notNull(),
    city: varchar("city", { length: 128 }).notNull(),
    province: varchar("province", { length: 128 }),
    postalCode: varchar("postal_code", { length: 32 }),
    displayName: varchar("display_name", { length: 255 }),
    priceMin: integer("price_min").notNull().default(0),
    priceMax: integer("price_max"),
    currency: varchar("currency", { length: 8 }).notNull().default("IDR"),
    isFree: boolean("is_free").notNull().default(false),
    organizerId: varchar("organizer_id", { length: 64 }).notNull(),
    organizerName: varchar("organizer_name", { length: 255 }).notNull(),
    organizerLogoUrl: text("organizer_logo_url"),
    status: eventStatusEnum("status").notNull().default("upcoming"),
    capacity: integer("capacity"),
    ticketUrl: text("ticket_url"),
    featured: boolean("featured").notNull().default(false),
    publishStatus: publishStatusEnum("publish_status")
      .notNull()
      .default("published"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastUpdatedAt: timestamp("last_updated_at", { withTimezone: true }),
    lastUpdatedBy: varchar("last_updated_by", { length: 255 }),
  },
  (table) => [uniqueIndex("events_slug_idx").on(table.slug)],
);

// ============================================================================
// 5. Promos
// ============================================================================

export const promos = pgTable("promos", {
  id: varchar("id", { length: 64 }).primaryKey(),
  ownerId: varchar("owner_id", { length: 64 }).references(() => owners.id, {
    onDelete: "set null",
  }),
  ownerType: promoOwnerTypeEnum("owner_type"),
  spotId: varchar("spot_id", { length: 64 }).references(() => spots.id, {
    onDelete: "cascade",
  }),
  eventId: varchar("event_id", { length: 64 }).references(() => events.id, {
    onDelete: "cascade",
  }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  validUntil: timestamp("valid_until", { withTimezone: true }).notNull(),
  discountPercent: integer("discount_percent"),
  code: varchar("code", { length: 64 }),
  imageUrl: text("image_url"),
  status: promoStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

// ============================================================================
// 6. Reviews & Review Tags
// ============================================================================

export const reviewTags = pgTable("review_tags", {
  id: varchar("id", { length: 64 }).primaryKey(),
  spotId: varchar("spot_id", { length: 64 })
    .notNull()
    .references(() => spots.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 128 }).notNull(),
  value: varchar("value", { length: 128 }).notNull(),
  ownerEditable: boolean("owner_editable").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(1),
});

export const reviews = pgTable("reviews", {
  id: varchar("id", { length: 64 }).primaryKey(),
  spotId: varchar("spot_id", { length: 64 })
    .notNull()
    .references(() => spots.id, { onDelete: "cascade" }),
  authorId: varchar("author_id", { length: 64 }).notNull(),
  authorSnapshot: jsonb("author_snapshot")
    .$type<ReviewAuthorSnapshot>()
    .notNull(),
  comment: text("comment").notNull(),
  imageUrls: jsonb("image_urls").$type<string[]>().default([]),
  helpfulCount: integer("helpful_count").notNull().default(0),
  isVerifiedVisit: boolean("is_verified_visit").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

// ============================================================================
// 7. Communities, Categories, Updates & Agendas
// ============================================================================

export const communityCategories = pgTable(
  "community_categories",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    title: varchar("title", { length: 128 }).notNull(),
    name: varchar("name", { length: 128 }),
    slug: varchar("slug", { length: 128 }).notNull(),
    image: text("image"),
    totalCommunities: integer("total_communities").notNull().default(0),
  },
  (table) => [uniqueIndex("community_categories_slug_idx").on(table.slug)],
);

export const communities = pgTable("communities", {
  id: varchar("id", { length: 64 }).primaryKey(),
  ownerId: varchar("owner_id", { length: 64 }).references(() => owners.id, {
    onDelete: "set null",
  }),
  categoryId: varchar("category_id", { length: 64 })
    .notNull()
    .references(() => communityCategories.id, { onDelete: "restrict" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  coverImage: text("cover_image").notNull(),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  memberCount: integer("member_count").notNull().default(0),
  activeEvents: integer("active_events").notNull().default(0),
  lastActiveAt: timestamp("last_active_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  isOfficial: boolean("is_official").notNull().default(false),
  managedBy: varchar("managed_by", { length: 255 }),
  managementName: varchar("management_name", { length: 255 }),
  communityType: communityTypeEnum("community_type")
    .notNull()
    .default("club"),
  publishStatus: publishStatusEnum("publish_status")
    .notNull()
    .default("published"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const communityUpdates = pgTable("community_updates", {
  id: varchar("id", { length: 64 }).primaryKey(),
  communityId: varchar("community_id", { length: 64 })
    .notNull()
    .references(() => communities.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  authorName: varchar("author_name", { length: 255 }).notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const communityAgendas = pgTable("community_agendas", {
  id: varchar("id", { length: 64 }).primaryKey(),
  communityId: varchar("community_id", { length: 64 })
    .notNull()
    .references(() => communities.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  startAt: timestamp("start_at", { withTimezone: true }).notNull(),
});

// ============================================================================
// 8. Media Gallery & QR Codes (B2B Management)
// ============================================================================

export const galleryAssets = pgTable("gallery_assets", {
  id: varchar("id", { length: 64 }).primaryKey(),
  ownerType: galleryOwnerTypeEnum("owner_type").notNull(),
  ownerId: varchar("owner_id", { length: 64 }).notNull(),
  type: galleryAssetTypeEnum("type").notNull().default("image"),
  url: text("url").notNull(),
  alt: varchar("alt", { length: 255 }),
  sortOrder: integer("sort_order").notNull().default(0),
  isCover: boolean("is_cover").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const qrCodes = pgTable("qr_codes", {
  id: varchar("id", { length: 64 }).primaryKey(),
  ownerId: varchar("owner_id", { length: 64 }).references(() => owners.id, {
    onDelete: "set null",
  }),
  targetType: qrCodeTargetTypeEnum("target_type").notNull(),
  targetId: varchar("target_id", { length: 64 }).notNull(),
  url: text("url").notNull(),
  label: varchar("label", { length: 255 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

// ============================================================================
// 9. Editorial Blogs & Hype Feed
// ============================================================================

export const blogs = pgTable("blogs", {
  slug: varchar("slug", { length: 255 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  excerpt: text("excerpt").notNull(),
  coverImageUrl: text("cover_image_url").notNull(),
  author: varchar("author", { length: 128 }).notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  category: varchar("category", { length: 64 }).notNull(),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  region: varchar("region", { length: 128 }).notNull(),
  spotIds: jsonb("spot_ids").$type<string[]>().notNull().default([]),
  sections: jsonb("sections").$type<BlogSection[]>().notNull().default([]),
  featured: boolean("featured").notNull().default(false),
});

export const hypeItems = pgTable("hype_items", {
  id: varchar("id", { length: 64 }).primaryKey(),
  type: hypeContentTypeEnum("type").notNull(),
  eventId: varchar("event_id", { length: 64 })
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  eventName: varchar("event_name", { length: 255 }).notNull(),
  locationName: varchar("location_name", { length: 255 }).notNull(),
  organizerName: varchar("organizer_name", { length: 255 }).notNull(),
  organizerAvatar: text("organizer_avatar").notNull(),
  caption: text("caption").notNull(),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  likesCount: integer("likes_count").notNull().default(0),
  commentsCount: integer("comments_count").notNull().default(0),
  sharesCount: integer("shares_count").notNull().default(0),
  audioTitle: varchar("audio_title", { length: 255 }).notNull(),
  videoUrl: text("video_url"),
  posterUrl: text("poster_url"),
  photos: jsonb("photos").$type<string[]>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ============================================================================
// 10. Many-to-Many Join Tables (matching docs/b2b-handoff/README.md)
// ============================================================================

export const spotTags = pgTable(
  "spot_tags",
  {
    spotId: varchar("spot_id", { length: 64 })
      .notNull()
      .references(() => spots.id, { onDelete: "cascade" }),
    tagId: varchar("tag_id", { length: 64 })
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.spotId, table.tagId] })],
);

export const eventTags = pgTable(
  "event_tags",
  {
    eventId: varchar("event_id", { length: 64 })
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    tagId: varchar("tag_id", { length: 64 })
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.eventId, table.tagId] })],
);

export const eventInterests = pgTable(
  "event_interests",
  {
    eventId: varchar("event_id", { length: 64 })
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    interestId: varchar("interest_id", { length: 64 })
      .notNull()
      .references(() => interests.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.eventId, table.interestId] })],
);

export const customerInterests = pgTable(
  "customer_interests",
  {
    customerId: varchar("customer_id", { length: 64 })
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    interestId: varchar("interest_id", { length: 64 })
      .notNull()
      .references(() => interests.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.customerId, table.interestId] })],
);

export const customerFavoriteTags = pgTable(
  "customer_favorite_tags",
  {
    customerId: varchar("customer_id", { length: 64 })
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    tagId: varchar("tag_id", { length: 64 })
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.customerId, table.tagId] })],
);

export const ownerSpots = pgTable(
  "owner_spots",
  {
    ownerId: varchar("owner_id", { length: 64 })
      .notNull()
      .references(() => owners.id, { onDelete: "cascade" }),
    spotId: varchar("spot_id", { length: 64 })
      .notNull()
      .references(() => spots.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.ownerId, table.spotId] })],
);

export const ownerEvents = pgTable(
  "owner_events",
  {
    ownerId: varchar("owner_id", { length: 64 })
      .notNull()
      .references(() => owners.id, { onDelete: "cascade" }),
    eventId: varchar("event_id", { length: 64 })
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.ownerId, table.eventId] })],
);

export const ownerCommunities = pgTable(
  "owner_communities",
  {
    ownerId: varchar("owner_id", { length: 64 })
      .notNull()
      .references(() => owners.id, { onDelete: "cascade" }),
    communityId: varchar("community_id", { length: 64 })
      .notNull()
      .references(() => communities.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.ownerId, table.communityId] })],
);

export const reviewSelectedTags = pgTable(
  "review_selected_tags",
  {
    reviewId: varchar("review_id", { length: 64 })
      .notNull()
      .references(() => reviews.id, { onDelete: "cascade" }),
    reviewTagId: varchar("review_tag_id", { length: 64 })
      .notNull()
      .references(() => reviewTags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.reviewId, table.reviewTagId] })],
);

// ============================================================================
// 11. Engagement Signals & Notifications
// ============================================================================

export const bookmarks = pgTable("bookmarks", {
  id: varchar("id", { length: 128 }).primaryKey(),
  userId: varchar("user_id", { length: 64 }).notNull(),
  targetType: bookmarkTargetTypeEnum("target_type").notNull(),
  targetId: varchar("target_id", { length: 64 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const eventAttendances = pgTable("event_attendances", {
  id: varchar("id", { length: 128 }).primaryKey(),
  eventId: varchar("event_id", { length: 64 })
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 64 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const spotVisits = pgTable("spot_visits", {
  id: varchar("id", { length: 128 }).primaryKey(),
  userId: varchar("user_id", { length: 64 }).notNull(),
  spotId: varchar("spot_id", { length: 64 })
    .notNull()
    .references(() => spots.id, { onDelete: "cascade" }),
  tagIds: jsonb("tag_ids").$type<string[]>().notNull().default([]),
  visitCount: integer("visit_count").notNull().default(1),
  reviewCount: integer("review_count").notNull().default(0),
  firstVisitedAt: timestamp("first_visited_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  lastVisitedAt: timestamp("last_visited_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const communityMemberships = pgTable("community_memberships", {
  id: varchar("id", { length: 128 }).primaryKey(),
  communityId: varchar("community_id", { length: 64 })
    .notNull()
    .references(() => communities.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 64 }).notNull(),
  joinedAt: timestamp("joined_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("user_id", { length: 64 }).notNull().default("u-demo"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  detail: varchar("detail", { length: 255 }).notNull(),
  href: varchar("href", { length: 255 }).notNull(),
  type: notificationTypeEnum("type").notNull().default("system"),
  unread: boolean("unread").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
