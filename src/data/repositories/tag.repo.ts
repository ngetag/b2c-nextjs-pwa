import { tags } from "@/data/fixtures/tags";
import { simulateLatency } from "@/data/repositories/_latency";
import type { Tag } from "@/types/tag";

export async function listTags(): Promise<Tag[]> {
  return simulateLatency([...tags]);
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
  return simulateLatency(tags.find((t) => t.slug === slug) ?? null);
}

export async function getTagById(id: string): Promise<Tag | null> {
  return simulateLatency(tags.find((t) => t.id === id) ?? null);
}

export async function getTagsByIds(ids: string[]): Promise<Tag[]> {
  return simulateLatency(tags.filter((t) => ids.includes(t.id)));
}

/**
 * Top N tags by trendingScore, used by Home "Trending Tags" row.
 */
export async function listTrendingTags(limit = 8): Promise<Tag[]> {
  const sorted = [...tags].sort(
    (a, b) => (b.trendingScore ?? 0) - (a.trendingScore ?? 0),
  );
  return simulateLatency(sorted.slice(0, limit));
}
