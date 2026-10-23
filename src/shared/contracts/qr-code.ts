export type QrCodeTargetTypeContract = "spot-review" | "spot" | "event" | "promo";

export interface QrCodeContract {
  id: string;
  ownerId?: string;
  targetType: QrCodeTargetTypeContract;
  targetId: string;
  url: string;
  label?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}
