export interface Interest {
  id: string;
  label: string;
  slug: string;
}

export type CommunityType =
  | "official"
  | "fanbase"
  | "team"
  | "guild"
  | "creator"
  | "club"
  | "learning"
  | "network";

export interface CommunityCategory {
  id: string;
  title: string;
  name?: string;
  slug?: string;
  image?: string;
  totalCommunities?: number;
}

export interface CommunityUpdate {
  id: string;
  title: string;
  body: string;
  publishedAt: string;
  authorName: string;
}

export interface CommunityAgenda {
  id: string;
  title: string;
  startAt: string;
  description: string;
}

export interface Community {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  categoryId: string;
  tags: string[];
  memberCount: number;
  activeEvents: number;
  lastActiveAt: string;
  isOfficial: boolean;
  managedBy?: string;
  managementName?: string;
  communityType: CommunityType;
  updates: CommunityUpdate[];
  agendas: CommunityAgenda[];
}
