/**
 * Named route helpers — single source of truth for URL strings.
 */

import { buildSearchParams } from "@/lib/url";

export const routes = {
  home: () => "/",
  explore: (params?: {
    type?: "spot" | "event" | "all";
    tags?: string[];
    sort?: string;
  }) => `/explore${params ? buildSearchParams(params) : ""}`,
  search: (params?: {
    q?: string;
    type?: "spot" | "event" | "all";
    tags?: string[];
    sort?: string;
  }) => `/search${params ? buildSearchParams(params) : ""}`,
  spot: (id: string) => `/spots/${id}`,
  event: (id: string) => `/events/${id}`,
  tag: (slug: string) => `/tags/${slug}`,
  scan: () => "/scan",
  hype: () => "/hype",
  promo: () => "/promo",
  communities: () => "/communities",
  communitiesByCategory: (categoryId: string) => `/communities?category=${categoryId}`,
  community: (id: string) => `/communities/${id}`,
  myCommunities: () => "/communities?filter=joined",
  calendar: () => "/calendar",
  notifications: () => "/notifications",
  bookmarks: () => "/bookmarks",
  profile: () => "/profile",
  myReviews: () => "/profile/reviews",
  writeReview: (spotId: string) => `/reviews/new?spotId=${spotId}`,
  blog: () => "/blog",
  blogArticle: (slug: string) => `/blog/${slug}`,
} as const;
