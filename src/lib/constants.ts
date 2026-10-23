/**
 * App-wide constants.
 */

export const APP_NAME = "NgeTag";
export const APP_TAGLINE = "Temukan hangout & event seru di Sekitarmu!";
export const APP_DESCRIPTION =
  "NgeTag bantu kamu menemukan spot, event, komunitas, promo, dan rekomendasi lokal berdasarkan tag serta lokasi.";
export const DEFAULT_CITY = "";
export const LOCALE = "id-ID";
export const CURRENCY = "IDR";

/**
 * Storage keys (versioned).
 */
export const STORAGE_KEYS = {
  user: "ngetag:user:v1",
  location: "ngetag:location:v1",
  searchHistory: "ngetag:search-history:v1",
  bookmark: "ngetag:bookmark:v1",
  attendance: "ngetag:attendance:v1",
  community: "ngetag:community-membership:v1",
  review: "ngetag:review:v1",
  visit: "ngetag:visit:v1",
} as const;

export const QR_REVIEW_ACCESS_KEY = "ngetag:qr-review-access:v1";
export const QR_REVIEW_ACCESS_TTL_MS = 10 * 60 * 1000;

/**
 * Simulate API latency for repository functions.
 */
export const DUMMY_LATENCY_MS = 200;

/**
 * Default page size for paginated lists.
 */
export const DEFAULT_PAGE_SIZE = 12;

/**
 * Search debounce.
 */
export const SEARCH_DEBOUNCE_MS = 300;
