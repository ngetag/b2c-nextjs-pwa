/**
 * Spot (hangout place) domain types.
 */

import type { GeoLocation } from "@/types/location";

export type DayKey =
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri"
  | "sat"
  | "sun";

export interface OpeningHour {
  day: DayKey;
  /** "HH:mm" 24h. */
  open: string;
  /** "HH:mm" 24h. */
  close: string;
  closed?: boolean;
}

export interface SpotContact {
  phone?: string;
  website?: string;
  instagram?: string;
}

export type PriceLevel = 1 | 2 | 3 | 4;

export interface Spot {
  id: string;
  slug: string;
  name: string;
  description: string;
  coverImageUrl: string;
  galleryUrls: string[];
  /** Multiple discovery tags/categories attached to this spot. */
  tagIds: string[];
  priceLevel: PriceLevel;
  location: GeoLocation;
  openingHours: OpeningHour[];
  promoIds: string[];
  contact?: SpotContact;
  featured?: boolean;
  createdAt: string;
  /** Admin activity metadata. Filled by backend/admin panel later. */
  lastUpdatedAt?: string;
  lastUpdatedBy?: string;
}
