import type { NgetagEvent } from "@/types/event";
import type { Spot } from "@/types/spot";
import type { Tag } from "@/types/tag";

export function tagSlugsToIds(slugs: string[], tags: Tag[]): string[] {
  const selected = new Set(slugs);
  return tags.filter((tag) => selected.has(tag.slug)).map((tag) => tag.id);
}

export function hasAnySelectedTag(
  tagIds: string[],
  selectedTagIds: string[],
): boolean {
  if (selectedTagIds.length === 0) return true;
  return tagIds.some((tagId) => selectedTagIds.includes(tagId));
}

export function filterSpotsByAnyTag<T extends Pick<Spot, "tagIds">>(
  spots: T[],
  selectedTagIds: string[],
): T[] {
  return spots.filter((spot) => hasAnySelectedTag(spot.tagIds, selectedTagIds));
}

export function filterEventsByAnyTag<T extends Pick<NgetagEvent, "tagIds">>(
  events: T[],
  selectedTagIds: string[],
): T[] {
  return events.filter((event) => hasAnySelectedTag(event.tagIds, selectedTagIds));
}
