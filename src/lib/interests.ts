import { communityCategories, communities, interests } from "@/data/fixtures/interests";
import type { Community, CommunityCategory, Interest } from "@/types/interest";

export function getInterestsByIds(ids: string[]): Interest[] {
  const selected = new Set(ids);
  return interests.filter((interest) => selected.has(interest.id));
}

const INTEREST_CATEGORY_MAP: Record<string, string[]> = {
  "i-coffee": ["coffee-wfc"],
  "i-gaming": ["gaming", "anime-pop"],
  "i-music": ["band-music"],
  "i-sports": ["sport"],
  "i-startup": ["startup-tech"],
  "i-photo": ["creator"],
  "i-wfc": ["coffee-wfc", "startup-tech"],
};

export function getCommunityCategoryById(
  id: string,
): CommunityCategory | undefined {
  return communityCategories.find((category) => category.id === id);
}

export function getCommunityById(id: string): Community | undefined {
  return communities.find((community) => community.id === id);
}

export function getCommunitiesByCategoryId(categoryId: string): Community[] {
  return communities.filter((community) => community.categoryId === categoryId);
}

export function getRecommendedCommunitiesByInterestIds(ids: string[]): Community[] {
  const categoryIds = new Set(ids.flatMap((id) => INTEREST_CATEGORY_MAP[id] ?? []));
  return communities.filter((community) => categoryIds.has(community.categoryId));
}
