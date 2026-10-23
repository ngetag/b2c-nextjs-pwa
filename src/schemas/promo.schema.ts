import { z } from "zod";

export const promoOwnerTypeSchema = z.enum(["spot", "event"]);
export const promoStatusSchema = z.enum([
  "draft",
  "active",
  "expired",
  "archived",
]);

export const promoSchema = z.object({
  id: z.string().min(1),
  ownerId: z.string().optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  validUntil: z.string(),
  discountPercent: z.number().min(0).max(100).optional(),
  code: z.string().optional(),
  imageUrl: z.string().optional(),
  spotId: z.string().optional(),
  eventId: z.string().optional(),
  ownerType: promoOwnerTypeSchema.optional(),
  status: promoStatusSchema.optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const createPromoSchema = z.object({
  id: z.string().optional(),
  ownerId: z.string().optional(),
  title: z.string().min(2, "Judul promo minimal 2 karakter"),
  description: z.string().min(5, "Deskripsi promo minimal 5 karakter"),
  validUntil: z.string(),
  discountPercent: z.number().min(0).max(100).optional(),
  code: z.string().optional(),
  imageUrl: z.string().optional(),
  spotId: z.string().optional(),
  eventId: z.string().optional(),
  ownerType: promoOwnerTypeSchema.optional(),
  status: promoStatusSchema.default("active"),
});

export const updatePromoSchema = createPromoSchema.partial();

export type PromoInput = z.infer<typeof promoSchema>;
export type CreatePromoInput = z.infer<typeof createPromoSchema>;
export type UpdatePromoInput = z.infer<typeof updatePromoSchema>;
