import { z } from "zod";
import {
  geoLocationSchema,
  openingHourSchema,
  publishStatusSchema,
} from "./common.schema";

export const priceLevelSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

export const spotContactSchema = z.object({
  phone: z.string().optional(),
  website: z.string().optional(),
  instagram: z.string().optional(),
});

export const spotSchema = z.object({
  id: z.string().min(1),
  ownerId: z.string().optional(),
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  coverImageUrl: z.string().min(1),
  galleryUrls: z.array(z.string()).default([]),
  tagIds: z.array(z.string()).default([]),
  priceLevel: priceLevelSchema,
  location: geoLocationSchema,
  openingHours: z.array(openingHourSchema).default([]),
  promoIds: z.array(z.string()).default([]),
  contact: spotContactSchema.optional(),
  featured: z.boolean().optional(),
  publishStatus: publishStatusSchema.optional(),
  createdAt: z.string(),
  lastUpdatedAt: z.string().optional(),
  lastUpdatedBy: z.string().optional(),
});

export const createSpotSchema = z.object({
  id: z.string().optional(),
  ownerId: z.string().optional(),
  slug: z.string().optional(),
  name: z.string().min(2, "Nama spot minimal 2 karakter"),
  description: z.string().min(10, "Deskripsi spot minimal 10 karakter"),
  coverImageUrl: z
    .string()
    .min(1)
    .default("https://picsum.photos/seed/spot-new/1200/800"),
  galleryUrls: z.array(z.string()).default([]),
  tagIds: z.array(z.string()).default([]),
  priceLevel: priceLevelSchema.default(2),
  location: geoLocationSchema,
  openingHours: z.array(openingHourSchema).default([]),
  promoIds: z.array(z.string()).default([]),
  contact: spotContactSchema.optional(),
  featured: z.boolean().default(false),
  publishStatus: publishStatusSchema.default("published"),
  lastUpdatedBy: z.string().optional(),
});

export const updateSpotSchema = createSpotSchema.partial();

export type SpotInput = z.infer<typeof spotSchema>;
export type CreateSpotInput = z.infer<typeof createSpotSchema>;
export type UpdateSpotInput = z.infer<typeof updateSpotSchema>;
