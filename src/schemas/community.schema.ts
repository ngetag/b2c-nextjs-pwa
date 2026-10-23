import { z } from "zod";
import { publishStatusSchema } from "./common.schema";

export const communityTypeSchema = z.enum([
  "official",
  "fanbase",
  "team",
  "guild",
  "creator",
  "club",
  "learning",
  "network",
]);

export const communityCategorySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  name: z.string().optional(),
  slug: z.string().optional(),
  image: z.string().optional(),
  totalCommunities: z.number().int().min(0).optional(),
});

export const createCommunityCategorySchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  name: z.string().optional(),
  slug: z.string().optional(),
  image: z.string().optional(),
});

export const communityUpdatePostSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  publishedAt: z.string(),
  authorName: z.string().min(1),
});

export const createCommunityUpdatePostSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2),
  body: z.string().min(5),
  authorName: z.string().min(1).default("Admin Komunitas"),
  publishedAt: z.string().optional(),
});

export const communityAgendaSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  startAt: z.string(),
  description: z.string().min(1),
});

export const createCommunityAgendaSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2),
  startAt: z.string(),
  description: z.string().min(2),
});

export const communitySchema = z.object({
  id: z.string().min(1),
  ownerId: z.string().optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  coverImage: z.string().min(1),
  categoryId: z.string().min(1),
  tags: z.array(z.string()).default([]),
  memberCount: z.number().int().min(0).default(0),
  activeEvents: z.number().int().min(0).default(0),
  lastActiveAt: z.string(),
  isOfficial: z.boolean().default(false),
  managedBy: z.string().optional(),
  managementName: z.string().optional(),
  communityType: communityTypeSchema,
  updates: z.array(communityUpdatePostSchema).default([]),
  agendas: z.array(communityAgendaSchema).default([]),
  publishStatus: publishStatusSchema.optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const createCommunitySchema = z.object({
  id: z.string().optional(),
  ownerId: z.string().optional(),
  title: z.string().min(2),
  description: z.string().min(10),
  coverImage: z
    .string()
    .min(1)
    .default("https://picsum.photos/seed/community-new/900/520"),
  categoryId: z.string().min(1),
  tags: z.array(z.string()).default([]),
  memberCount: z.number().int().min(0).default(1),
  activeEvents: z.number().int().min(0).default(0),
  isOfficial: z.boolean().default(false),
  managedBy: z.string().optional(),
  managementName: z.string().optional(),
  communityType: communityTypeSchema.default("club"),
  updates: z.array(communityUpdatePostSchema).default([]),
  agendas: z.array(communityAgendaSchema).default([]),
  publishStatus: publishStatusSchema.default("published"),
});

export const updateCommunitySchema = createCommunitySchema.partial();

export type CommunityInput = z.infer<typeof communitySchema>;
export type CreateCommunityInput = z.infer<typeof createCommunitySchema>;
export type UpdateCommunityInput = z.infer<typeof updateCommunitySchema>;
export type CreateCommunityUpdatePostInput = z.infer<
  typeof createCommunityUpdatePostSchema
>;
export type CreateCommunityAgendaInput = z.infer<
  typeof createCommunityAgendaSchema
>;
