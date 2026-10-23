import { z } from "zod";

export const userRoleSchema = z.enum(["customer", "owner", "admin"]);

export const userBadgeCategorySchema = z.enum([
  "community",
  "interest",
  "activity",
  "explorer",
  "contributor",
]);

export const userBadgeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  category: userBadgeCategorySchema,
});

export const userPreferencesSchema = z.object({
  favoriteTagIds: z.array(z.string()).default([]),
  city: z.string().optional(),
});

export const userSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  avatarUrl: z.string().optional(),
  role: userRoleSchema,
  bio: z.string().optional(),
  interestIds: z.array(z.string()).default([]),
  badges: z.array(userBadgeSchema).default([]),
  joinedAt: z.string(),
  preferences: userPreferencesSchema.optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  avatarUrl: z.string().optional(),
  bio: z.string().optional(),
  interestIds: z.array(z.string()).optional(),
  badges: z.array(userBadgeSchema).optional(),
  preferences: userPreferencesSchema.optional(),
});

export const ownerRoleSchema = z.enum(["owner", "manager", "staff"]);
export const ownerAccountStatusSchema = z.enum([
  "invited",
  "active",
  "suspended",
]);

export const ownerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
  role: ownerRoleSchema,
  status: ownerAccountStatusSchema,
  businessName: z.string().min(1),
  managedSpotIds: z.array(z.string()).default([]),
  managedEventIds: z.array(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export const createOwnerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
  role: ownerRoleSchema.default("owner"),
  status: ownerAccountStatusSchema.default("active"),
  businessName: z.string().min(2),
  managedSpotIds: z.array(z.string()).default([]),
  managedEventIds: z.array(z.string()).default([]),
});

export const updateOwnerSchema = createOwnerSchema.partial();

export type UserInput = z.infer<typeof userSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type OwnerInput = z.infer<typeof ownerSchema>;
export type CreateOwnerInput = z.infer<typeof createOwnerSchema>;
export type UpdateOwnerInput = z.infer<typeof updateOwnerSchema>;
