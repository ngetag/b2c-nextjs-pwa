export type GalleryAssetTypeContract = "image" | "video";
export type GalleryOwnerTypeContract = "spot" | "event" | "promo";

export interface GalleryAssetContract {
  id: string;
  ownerType: GalleryOwnerTypeContract;
  ownerId: string;
  type: GalleryAssetTypeContract;
  url: string;
  alt?: string;
  sortOrder: number;
  isCover?: boolean;
  createdAt: string;
  updatedAt?: string;
}
