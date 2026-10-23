import { z } from "zod";

export const blogSectionSchema = z.object({
  heading: z.string().min(1),
  paragraphs: z.array(z.string().min(1)),
});

export const blogArticleSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string().min(1),
  coverImageUrl: z.string().min(1),
  author: z.string().min(1),
  publishedAt: z.string(),
  category: z.string().min(1),
  tags: z.array(z.string()).default([]),
  region: z.string().min(1),
  spotIds: z.array(z.string()).default([]),
  sections: z.array(blogSectionSchema).default([]),
  featured: z.boolean().optional(),
});

export const createBlogArticleSchema = z.object({
  slug: z.string().optional(),
  title: z.string().min(3),
  excerpt: z.string().min(10),
  coverImageUrl: z
    .string()
    .min(1)
    .default("https://picsum.photos/seed/blog-new/1400/900"),
  author: z.string().min(1).default("Tim NgeTag"),
  publishedAt: z.string().optional(),
  category: z.string().min(1),
  tags: z.array(z.string()).default([]),
  region: z.string().min(1).default("Jakarta"),
  spotIds: z.array(z.string()).default([]),
  sections: z.array(blogSectionSchema).default([]),
  featured: z.boolean().default(false),
});

export const updateBlogArticleSchema = createBlogArticleSchema.partial();

export const hypeContentTypeSchema = z.enum(["video", "photo_carousel"]);

export const hypeItemSchema = z.object({
  id: z.string().min(1),
  type: hypeContentTypeSchema,
  eventId: z.string().min(1),
  eventName: z.string().min(1),
  locationName: z.string().min(1),
  organizerName: z.string().min(1),
  organizerAvatar: z.string().min(1),
  caption: z.string().min(1),
  tags: z.array(z.string()).default([]),
  likesCount: z.number().int().min(0).default(0),
  commentsCount: z.number().int().min(0).default(0),
  sharesCount: z.number().int().min(0).default(0),
  audioTitle: z.string().min(1),
  videoUrl: z.string().optional(),
  posterUrl: z.string().optional(),
  photos: z.array(z.string()).optional(),
});

export const createHypeItemSchema = z.object({
  id: z.string().optional(),
  type: hypeContentTypeSchema,
  eventId: z.string().min(1),
  eventName: z.string().min(1),
  locationName: z.string().min(1),
  organizerName: z.string().min(1),
  organizerAvatar: z
    .string()
    .default("https://picsum.photos/seed/org-new/200/200"),
  caption: z.string().min(1),
  tags: z.array(z.string()).default([]),
  likesCount: z.number().int().min(0).default(0),
  commentsCount: z.number().int().min(0).default(0),
  sharesCount: z.number().int().min(0).default(0),
  audioTitle: z.string().default("Original Sound — NgeTag"),
  videoUrl: z.string().optional(),
  posterUrl: z.string().optional(),
  photos: z.array(z.string()).optional(),
});

export const updateHypeItemSchema = createHypeItemSchema.partial();

export const galleryAssetTypeSchema = z.enum(["image", "video"]);
export const galleryOwnerTypeSchema = z.enum(["spot", "event", "promo"]);

export const galleryAssetSchema = z.object({
  id: z.string().min(1),
  ownerType: galleryOwnerTypeSchema,
  ownerId: z.string().min(1),
  type: galleryAssetTypeSchema,
  url: z.string().min(1),
  alt: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isCover: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export const createGalleryAssetSchema = z.object({
  id: z.string().optional(),
  ownerType: galleryOwnerTypeSchema,
  ownerId: z.string().min(1),
  type: galleryAssetTypeSchema.default("image"),
  url: z.string().min(1),
  alt: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isCover: z.boolean().default(false),
});

export const qrCodeTargetTypeSchema = z.enum([
  "spot-review",
  "spot",
  "event",
  "promo",
]);

export const qrCodeSchema = z.object({
  id: z.string().min(1),
  ownerId: z.string().optional(),
  targetType: qrCodeTargetTypeSchema,
  targetId: z.string().min(1),
  url: z.string().min(1),
  label: z.string().optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export const createQrCodeSchema = z.object({
  id: z.string().optional(),
  ownerId: z.string().optional(),
  targetType: qrCodeTargetTypeSchema,
  targetId: z.string().min(1),
  url: z.string().min(1).optional(),
  label: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateQrCodeSchema = createQrCodeSchema.partial();

export type BlogArticleInput = z.infer<typeof blogArticleSchema>;
export type CreateBlogArticleInput = z.infer<typeof createBlogArticleSchema>;
export type UpdateBlogArticleInput = z.infer<typeof updateBlogArticleSchema>;
export type HypeItemInput = z.infer<typeof hypeItemSchema>;
export type CreateHypeItemInput = z.infer<typeof createHypeItemSchema>;
export type UpdateHypeItemInput = z.infer<typeof updateHypeItemSchema>;
export type GalleryAssetInput = z.infer<typeof galleryAssetSchema>;
export type CreateGalleryAssetInput = z.infer<typeof createGalleryAssetSchema>;
export type QrCodeInput = z.infer<typeof qrCodeSchema>;
export type CreateQrCodeInput = z.infer<typeof createQrCodeSchema>;
export type UpdateQrCodeInput = z.infer<typeof updateQrCodeSchema>;
