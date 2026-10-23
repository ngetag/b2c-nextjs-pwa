import type { CommunityCategory, CommunityType } from "@/types/interest";
import type { Tag, TagCategory } from "@/types/tag";

export type DiscoveryAccent =
  | "coffee"
  | "gaming"
  | "music"
  | "sport"
  | "tech"
  | "photo"
  | "pop"
  | "community";

export const accentVar: Record<DiscoveryAccent, string> = {
  coffee: "var(--accent-coffee)",
  gaming: "var(--accent-gaming)",
  music: "var(--accent-music)",
  sport: "var(--accent-sport)",
  tech: "var(--accent-tech)",
  photo: "var(--accent-photo)",
  pop: "var(--accent-pop)",
  community: "var(--accent-community)",
};

const tagAccentMap: Record<TagCategory, DiscoveryAccent> = {
  activity: "tech",
  cuisine: "coffee",
  occasion: "music",
  price: "photo",
  vibe: "community",
};

const communityCategoryAccentMap: Record<string, DiscoveryAccent> = {
  "band-music": "music",
  gaming: "gaming",
  sport: "sport",
  "startup-tech": "tech",
  creator: "photo",
  "anime-pop": "pop",
  "coffee-wfc": "coffee",
};

const communityTypeAccentMap: Record<CommunityType, DiscoveryAccent> = {
  club: "community",
  creator: "photo",
  fanbase: "music",
  guild: "gaming",
  learning: "tech",
  network: "tech",
  official: "community",
  team: "sport",
};

export function getTagAccent(tag: Pick<Tag, "category">): string {
  return accentVar[tagAccentMap[tag.category]];
}

export function getCommunityCategoryAccent(
  category?: Pick<CommunityCategory, "id">,
): string {
  if (!category) return accentVar.community;
  return accentVar[communityCategoryAccentMap[category.id] ?? "community"];
}

export function getCommunityTypeAccent(type: CommunityType): string {
  return accentVar[communityTypeAccentMap[type]];
}
