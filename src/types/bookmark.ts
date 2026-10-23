/**
 * Bookmark domain types.
 */

export type BookmarkTargetType = "spot" | "event";

export interface Bookmark {
  /** Format: `${userId}:${targetType}:${targetId}`. */
  id: string;
  userId: string;
  targetType: BookmarkTargetType;
  targetId: string;
  createdAt: string;
}

export function buildBookmarkId(
  userId: string,
  targetType: BookmarkTargetType,
  targetId: string,
): string {
  return `${userId}:${targetType}:${targetId}`;
}

export function buildBookmarkKey(
  targetType: BookmarkTargetType,
  targetId: string,
): string {
  return `${targetType}:${targetId}`;
}
