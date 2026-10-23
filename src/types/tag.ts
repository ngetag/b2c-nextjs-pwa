/**
 * Tag domain types — the discovery primitive of Ngetag.
 */

export type TagCategory =
  | "vibe"
  | "cuisine"
  | "activity"
  | "price"
  | "occasion";

export interface Tag {
  id: string;
  slug: string;
  name: string;
  category: TagCategory;
  /** Lucide icon key, optional. */
  iconName?: string;
  /** 0..100 — used to sort Trending Tags on Home. */
  trendingScore?: number;
}
