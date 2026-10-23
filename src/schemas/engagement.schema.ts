import { z } from "zod";

export const bookmarkTargetTypeSchema = z.enum(["spot", "event"]);

export const bookmarkSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  targetType: bookmarkTargetTypeSchema,
  targetId: z.string().min(1),
  createdAt: z.string(),
});

export const toggleBookmarkSchema = z.object({
  userId: z.string().min(1).default("u-demo"),
  targetType: bookmarkTargetTypeSchema,
  targetId: z.string().min(1),
});

export const eventAttendanceSchema = z.object({
  id: z.string().min(1),
  eventId: z.string().min(1),
  userId: z.string().min(1),
  createdAt: z.string(),
});

export const toggleAttendanceSchema = z.object({
  userId: z.string().min(1).default("u-demo"),
  eventId: z.string().min(1),
});

export const spotVisitSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  spotId: z.string().min(1),
  tagIds: z.array(z.string()).default([]),
  visitCount: z.number().int().min(1),
  reviewCount: z.number().int().min(0),
  firstVisitedAt: z.string(),
  lastVisitedAt: z.string(),
});

export const markSpotVisitSchema = z.object({
  userId: z.string().min(1).default("u-demo"),
  spotId: z.string().min(1),
  tagIds: z.array(z.string()).default([]),
  reviewed: z.boolean().default(false),
});

export const communityMembershipSchema = z.object({
  id: z.string().min(1),
  communityId: z.string().min(1),
  userId: z.string().min(1),
  joinedAt: z.string(),
});

export const toggleMembershipSchema = z.object({
  userId: z.string().min(1).default("u-demo"),
  communityId: z.string().min(1),
});

export const notificationTypeSchema = z.enum([
  "ticket",
  "calendar",
  "system",
]);

export const notificationSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  detail: z.string().min(1),
  href: z.string().min(1),
  type: notificationTypeSchema,
  unread: z.boolean(),
  createdAt: z.string(),
});

export const createNotificationSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  detail: z.string().min(1),
  href: z.string().min(1),
  type: notificationTypeSchema.default("system"),
});

export const patchNotificationsSchema = z.object({
  id: z.string().optional(),
  markAllAsRead: z.boolean().optional(),
});

export type ToggleBookmarkInput = z.infer<typeof toggleBookmarkSchema>;
export type ToggleAttendanceInput = z.infer<typeof toggleAttendanceSchema>;
export type MarkSpotVisitInput = z.infer<typeof markSpotVisitSchema>;
export type ToggleMembershipInput = z.infer<typeof toggleMembershipSchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type PatchNotificationsInput = z.infer<typeof patchNotificationsSchema>;
