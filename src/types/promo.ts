/**
 * Promo domain types.
 */

export interface Promo {
  id: string;
  title: string;
  description: string;
  /** ISO. */
  validUntil: string;
  discountPercent?: number;
  code?: string;
  imageUrl?: string;
  spotId?: string;
  eventId?: string;
}
