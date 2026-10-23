export interface CommunityMembership {
  id: string;
  communityId: string;
  userId: string;
  joinedAt: string;
}

export function buildCommunityMembershipId(
  userId: string,
  communityId: string,
): string {
  return `${userId}:community:${communityId}`;
}
