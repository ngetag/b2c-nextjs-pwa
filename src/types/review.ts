/**
 * Review domain types.
 * MVP: review hanya untuk Spot. Review berisi cerita/pengalaman.
 */

export interface ReviewAuthorSnapshot {
  name: string;
  avatarUrl?: string;
}

export interface ReviewTag {
  id: string;
  spotId: string;
  label: string;
  value: string;
  ownerEditable?: boolean;
  sortOrder: number;
}

export interface Review {
  id: string;
  spotId: string;
  authorId: string;
  /** Denormalized snapshot — render cepat tanpa join. */
  authorSnapshot: ReviewAuthorSnapshot;
  comment: string;
  reviewTagIds?: string[];
  imageUrls?: string[];
  helpfulCount: number;
  createdAt: string;
  updatedAt?: string;
}
