export type PromoOwnerTypeContract = "spot" | "event";
export type PromoStatusContract = "draft" | "active" | "expired" | "archived";

export interface PromoContract {
  id: string;
  ownerId?: string;
  title: string;
  description: string;
  validUntil: string;
  discountPercent?: number;
  code?: string;
  imageUrl?: string;
  spotId?: string;
  eventId?: string;
  ownerType?: PromoOwnerTypeContract;
  status?: PromoStatusContract;
  createdAt?: string;
  updatedAt?: string;
}
