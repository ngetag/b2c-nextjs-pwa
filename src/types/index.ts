/**
 * Public type contracts for the app.
 */

export type {
  User,
  UserBadge,
  UserBadgeCategory,
  UserRole,
  UserPreferences,
} from "@/types/user";
export type { Tag, TagCategory } from "@/types/tag";
export type {
  Coordinates,
  GeoLocation,
  UserLocation,
  WithDistance,
} from "@/types/location";
export type {
  Spot,
  OpeningHour,
  SpotContact,
  PriceLevel,
  DayKey,
} from "@/types/spot";
export type {
  NgetagEvent,
  EventStatus,
  EventPrice,
  EventOrganizer,
} from "@/types/event";
export type { Review, ReviewAuthorSnapshot } from "@/types/review";
export type { SpotVisit } from "@/types/visit";
export { buildSpotVisitId } from "@/types/visit";
export type { Bookmark, BookmarkTargetType } from "@/types/bookmark";
export { buildBookmarkId, buildBookmarkKey } from "@/types/bookmark";
export type { Promo } from "@/types/promo";
export type { BlogArticle, BlogSection } from "@/types/blog";
export type { HypeItem, HypeContentType } from "@/types/hype";


/**
 * Query / pagination DTOs.
 * Mirror future REST/GraphQL shape so swap-to-real-API is a non-event.
 */
export interface SearchQuery {
  q?: string;
  type?: "spot" | "event" | "all";
  tagSlugs?: string[];
  city?: string;
  sort?: "relevance" | "newest" | "distance";
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}
