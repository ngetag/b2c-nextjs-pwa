import { z } from "zod";

export const tagCategorySchema = z.enum([
  "vibe",
  "cuisine",
  "activity",
  "price",
  "occasion",
]);

export const tagSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  category: tagCategorySchema,
  iconName: z.string().optional(),
  trendingScore: z.number().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const createTagSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(1).optional(),
  name: z.string().min(1),
  category: tagCategorySchema,
  iconName: z.string().optional(),
  trendingScore: z.number().min(0).max(100).default(50),
  isActive: z.boolean().default(true),
});

export const updateTagSchema = createTagSchema.partial();

export const interestSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  slug: z.string().min(1),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const createInterestSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1),
  slug: z.string().min(1).optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const updateInterestSchema = createInterestSchema.partial();

export type TagInput = z.infer<typeof tagSchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
export type InterestInput = z.infer<typeof interestSchema>;
export type CreateInterestInput = z.infer<typeof createInterestSchema>;
export type UpdateInterestInput = z.infer<typeof updateInterestSchema>;
