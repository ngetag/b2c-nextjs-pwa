import { z } from "zod";
import { geoLocationSchema, publishStatusSchema } from "./common.schema";

export const eventStatusSchema = z.enum(["upcoming", "ongoing", "past"]);

export const eventPriceSchema = z.object({
  min: z.number().min(0),
  max: z.number().min(0).optional(),
  currency: z.literal("IDR").default("IDR"),
  isFree: z.boolean(),
});

export const eventOrganizerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  logoUrl: z.string().optional(),
});

export const eventSchema = z.object({
  id: z.string().min(1),
  ownerId: z.string().optional(),
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  coverImageUrl: z.string().min(1),
  tagIds: z.array(z.string()).default([]),
  interestIds: z.array(z.string()).default([]),
  startAt: z.string(),
  endAt: z.string(),
  venueName: z.string().min(1),
  location: geoLocationSchema,
  price: eventPriceSchema,
  organizer: eventOrganizerSchema,
  status: eventStatusSchema,
  capacity: z.number().int().positive().optional(),
  ticketUrl: z.string().optional(),
  featured: z.boolean().optional(),
  publishStatus: publishStatusSchema.optional(),
  createdAt: z.string(),
  lastUpdatedAt: z.string().optional(),
  lastUpdatedBy: z.string().optional(),
});

export const createEventSchema = z.object({
  id: z.string().optional(),
  ownerId: z.string().optional(),
  slug: z.string().optional(),
  title: z.string().min(2, "Judul event minimal 2 karakter"),
  description: z.string().min(10, "Deskripsi event minimal 10 karakter"),
  coverImageUrl: z
    .string()
    .min(1)
    .default("https://picsum.photos/seed/event-new/1200/675"),
  tagIds: z.array(z.string()).default([]),
  interestIds: z.array(z.string()).default([]),
  startAt: z.string(),
  endAt: z.string(),
  venueName: z.string().min(1),
  location: geoLocationSchema,
  price: eventPriceSchema,
  organizer: eventOrganizerSchema,
  status: eventStatusSchema.default("upcoming"),
  capacity: z.number().int().positive().optional(),
  ticketUrl: z.string().optional(),
  featured: z.boolean().default(false),
  publishStatus: publishStatusSchema.default("published"),
  lastUpdatedBy: z.string().optional(),
});

export const updateEventSchema = createEventSchema.partial();

export type EventInput = z.infer<typeof eventSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
