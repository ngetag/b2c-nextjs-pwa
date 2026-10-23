import { apiFetch } from "@/lib/api-client";
import { buildSearchParams } from "@/lib/url";
import type {
  CreateNotificationInput,
  MarkSpotVisitInput,
  PatchNotificationsInput,
  ToggleAttendanceInput,
  ToggleBookmarkInput,
  ToggleMembershipInput,
} from "@/schemas";
import {
  storeCreateNotification,
  storeListAttendances,
  storeListBookmarks,
  storeListCommunityMemberships,
  storeListNotifications,
  storeListSpotVisits,
  storeMarkSpotVisit,
  storePatchNotifications,
  storeToggleAttendance,
  storeToggleBookmark,
  storeToggleCommunityMembership,
} from "@/server/store";
import type {
  BookmarkContract,
  CommunityMembershipContract,
  EventAttendanceContract,
  SpotVisitContract,
} from "@/shared/contracts";
import type { NgetagNotification } from "@/stores/notification.store";

export async function listBookmarks(opts?: {
  userId?: string;
  targetType?: "spot" | "event";
}): Promise<BookmarkContract[]> {
  const qs = buildSearchParams({
    userId: opts?.userId,
    targetType: opts?.targetType,
  });
  return apiFetch<BookmarkContract[]>(`/api/engagements/bookmarks${qs}`, {
    fallback: () => storeListBookmarks(opts),
  });
}

export async function toggleBookmarkRepo(input: ToggleBookmarkInput): Promise<{
  bookmarked: boolean;
  item?: BookmarkContract;
}> {
  return apiFetch<{ bookmarked: boolean; item?: BookmarkContract }>(
    "/api/engagements/bookmarks",
    {
      method: "POST",
      body: input,
      fallback: () => storeToggleBookmark(input),
    },
  );
}

export async function listAttendances(opts?: {
  userId?: string;
  eventId?: string;
}): Promise<EventAttendanceContract[]> {
  const qs = buildSearchParams({
    userId: opts?.userId,
    eventId: opts?.eventId,
  });
  return apiFetch<EventAttendanceContract[]>(
    `/api/engagements/attendances${qs}`,
    {
      fallback: () => storeListAttendances(opts),
    },
  );
}

export async function toggleAttendanceRepo(
  input: ToggleAttendanceInput,
): Promise<{
  attending: boolean;
  item?: EventAttendanceContract;
}> {
  return apiFetch<{ attending: boolean; item?: EventAttendanceContract }>(
    "/api/engagements/attendances",
    {
      method: "POST",
      body: input,
      fallback: () => storeToggleAttendance(input),
    },
  );
}

export async function listSpotVisits(opts?: {
  userId?: string;
  spotId?: string;
}): Promise<SpotVisitContract[]> {
  const qs = buildSearchParams({
    userId: opts?.userId,
    spotId: opts?.spotId,
  });
  return apiFetch<SpotVisitContract[]>(`/api/engagements/visits${qs}`, {
    fallback: () => storeListSpotVisits(opts),
  });
}

export async function markSpotVisitRepo(
  input: MarkSpotVisitInput,
): Promise<SpotVisitContract> {
  return apiFetch<SpotVisitContract>("/api/engagements/visits", {
    method: "POST",
    body: input,
    fallback: () => storeMarkSpotVisit(input),
  });
}

export async function listCommunityMemberships(opts?: {
  userId?: string;
  communityId?: string;
}): Promise<CommunityMembershipContract[]> {
  const qs = buildSearchParams({
    userId: opts?.userId,
    communityId: opts?.communityId,
  });
  return apiFetch<CommunityMembershipContract[]>(
    `/api/engagements/memberships${qs}`,
    {
      fallback: () => storeListCommunityMemberships(opts),
    },
  );
}

export async function toggleCommunityMembershipRepo(
  input: ToggleMembershipInput,
): Promise<{
  joined: boolean;
  item?: CommunityMembershipContract;
}> {
  return apiFetch<{ joined: boolean; item?: CommunityMembershipContract }>(
    "/api/engagements/memberships",
    {
      method: "POST",
      body: input,
      fallback: () => storeToggleCommunityMembership(input),
    },
  );
}

export async function listNotificationsRepo(): Promise<NgetagNotification[]> {
  return apiFetch<NgetagNotification[]>("/api/notifications", {
    fallback: () => storeListNotifications(),
  });
}

export async function createNotificationRepo(
  input: CreateNotificationInput,
): Promise<NgetagNotification> {
  return apiFetch<NgetagNotification>("/api/notifications", {
    method: "POST",
    body: input,
    fallback: () => storeCreateNotification(input),
  });
}

export async function patchNotificationsRepo(
  input: PatchNotificationsInput,
): Promise<NgetagNotification[]> {
  return apiFetch<NgetagNotification[]>("/api/notifications", {
    method: "PATCH",
    body: input,
    fallback: () => storePatchNotifications(input),
  });
}
