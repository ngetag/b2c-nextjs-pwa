/**
 * Visit signals captured after verified in-location actions such as QR reviews.
 */

export interface SpotVisit {
  id: string;
  userId: string;
  spotId: string;
  tagIds: string[];
  visitCount: number;
  reviewCount: number;
  firstVisitedAt: string;
  lastVisitedAt: string;
}

export function buildSpotVisitId(userId: string, spotId: string): string {
  return `${userId}:spot:${spotId}`;
}
