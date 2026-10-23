export type BookmarkTargetTypeContract = "spot" | "event";

export interface BookmarkContract {
  id: string;
  userId: string;
  targetType: BookmarkTargetTypeContract;
  targetId: string;
  createdAt: string;
}

export interface EventAttendanceContract {
  id: string;
  eventId: string;
  userId: string;
  createdAt: string;
}

export interface SpotVisitContract {
  id: string;
  userId: string;
  spotId: string;
  tagIds: string[];
  visitCount: number;
  reviewCount: number;
  firstVisitedAt: string;
  lastVisitedAt: string;
}

export interface CommunityMembershipContract {
  id: string;
  communityId: string;
  userId: string;
  joinedAt: string;
}
