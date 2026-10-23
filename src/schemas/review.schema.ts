import { z } from "zod";

export const reviewAuthorSnapshotSchema = z.object({
  name: z.string().min(1),
  avatarUrl: z.string().optional(),
});

export const reviewTagSchema = z.object({
  id: z.string().min(1),
  spotId: z.string().min(1),
  label: z.string().min(1),
  value: z.string().min(1),
  ownerEditable: z.boolean().optional(),
  sortOrder: z.number().int(),
});

export const createReviewTagSchema = z.object({
  id: z.string().optional(),
  spotId: z.string().min(1),
  label: z.string().min(1),
  value: z.string().min(1).optional(),
  ownerEditable: z.boolean().default(true),
  sortOrder: z.number().int().default(1),
});

export const updateReviewTagSchema = createReviewTagSchema.partial();

export const reviewSchema = z.object({
  id: z.string().min(1),
  spotId: z.string().min(1),
  authorId: z.string().min(1),
  authorSnapshot: reviewAuthorSnapshotSchema,
  comment: z
    .string()
    .min(10, "Ulasan minimal 10 karakter")
    .max(1000, "Ulasan maksimal 1000 karakter"),
  reviewTagIds: z.array(z.string()).optional(),
  imageUrls: z.array(z.string()).optional(),
  helpfulCount: z.number().int().min(0).default(0),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export const createReviewSchema = z.object({
  id: z.string().optional(),
  spotId: z.string().min(1),
  authorId: z.string().min(1).default("u-demo"),
  authorSnapshot: reviewAuthorSnapshotSchema.default({
    name: "Demo User",
    avatarUrl: "https://picsum.photos/seed/demo-user/200/200",
  }),
  comment: z
    .string()
    .min(10, "Ulasan minimal 10 karakter")
    .max(1000, "Ulasan maksimal 1000 karakter"),
  reviewTagIds: z.array(z.string()).default([]),
  imageUrls: z.array(z.string()).default([]),
  helpfulCount: z.number().int().min(0).default(0),
});

export const updateReviewSchema = z.object({
  comment: z
    .string()
    .min(10, "Ulasan minimal 10 karakter")
    .max(1000, "Ulasan maksimal 1000 karakter")
    .optional(),
  reviewTagIds: z.array(z.string()).optional(),
  imageUrls: z.array(z.string()).optional(),
  helpfulCount: z.number().int().min(0).optional(),
});

export type ReviewTagInput = z.infer<typeof reviewTagSchema>;
export type CreateReviewTagInput = z.infer<typeof createReviewTagSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
