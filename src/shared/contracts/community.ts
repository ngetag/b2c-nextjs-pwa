export type CommunityTypeContract =
  | "official"
  | "fanbase"
  | "team"
  | "guild"
  | "creator"
  | "club"
  | "learning"
  | "network";

export type CommunityPublishStatusContract = "draft" | "published" | "archived";

export interface CommunityCategoryContract {
  id: string;
  title: string;
  name?: string;
  slug?: string;
  image?: string;
  totalCommunities?: number;
}

export interface CommunityUpdateContract {
  id: string;
  title: string;
  body: string;
  publishedAt: string;
  authorName: string;
}

export interface CommunityAgendaContract {
  id: string;
  title: string;
  startAt: string;
  description: string;
}

export interface CommunityContract {
  id: string;
  ownerId?: string;
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
  communityType: CommunityTypeContract;
  updates: CommunityUpdateContract[];
  agendas: CommunityAgendaContract[];
  publishStatus?: CommunityPublishStatusContract;
  createdAt?: string;
  updatedAt?: string;
}
