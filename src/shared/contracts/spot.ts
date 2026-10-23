import type { GalleryAssetContract } from "./gallery";
import type { LocationContract } from "./location";
import type { OpeningHourContract } from "./opening-hours";

export type PriceLevelContract = 1 | 2 | 3 | 4;
export type SpotPublishStatusContract = "draft" | "published" | "archived";

export interface SpotContactContract {
  phone?: string;
  website?: string;
  instagram?: string;
}

export interface SpotContract {
  id: string;
  ownerId?: string;
  slug: string;
  name: string;
  description: string;
  coverImageUrl: string;
  galleryUrls: string[];
  gallery?: GalleryAssetContract[];
  tagIds: string[];
  priceLevel: PriceLevelContract;
  location: LocationContract;
  openingHours: OpeningHourContract[];
  promoIds: string[];
  contact?: SpotContactContract;
  featured?: boolean;
  publishStatus?: SpotPublishStatusContract;
  createdAt: string;
  lastUpdatedAt?: string;
  lastUpdatedBy?: string;
}
