export type HypeContentType = "video" | "photo_carousel";

export interface HypeItem {
  id: string;
  type: HypeContentType;
  eventId: string;
  eventName: string;
  locationName: string;
  organizerName: string;
  organizerAvatar: string;
  caption: string;
  tags: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  audioTitle: string;
  /** Video URL for video content items */
  videoUrl?: string;
  /** Poster image shown before video plays or as fallback */
  posterUrl?: string;
  /** Array of 3 photo URLs for photo carousel items */
  photos?: string[];
}
