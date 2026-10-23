import { z } from "zod";

export const dayKeySchema = z.enum([
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
]);

export const publishStatusSchema = z.enum(["draft", "published", "archived"]);

export const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const geoLocationSchema = coordinatesSchema.extend({
  address: z.string().min(1),
  village: z.string().min(1),
  district: z.string().min(1),
  city: z.string().min(1),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  displayName: z.string().optional(),
});

export const userLocationSchema = coordinatesSchema.extend({
  village: z.string(),
  district: z.string(),
  city: z.string(),
  address: z.string().optional(),
  displayName: z.string().optional(),
  source: z.enum(["mock", "browser", "backend", "manual"]),
  isApproximate: z.boolean().optional(),
});

export const openingHourSchema = z.object({
  day: dayKeySchema,
  open: z.string().regex(/^\d{2}:\d{2}$/, "Format jam harus HH:mm"),
  close: z.string().regex(/^\d{2}:\d{2}$/, "Format jam harus HH:mm"),
  closed: z.boolean().optional(),
});

export const openingHoursSchema = z.array(openingHourSchema);

export const searchQuerySchema = z.object({
  q: z.string().optional(),
  type: z.enum(["spot", "event", "all"]).optional(),
  tagSlugs: z.array(z.string()).optional(),
  city: z.string().optional(),
  sort: z.enum(["relevance", "newest", "distance"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(12),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  featured: z.coerce.boolean().optional(),
  publishStatus: publishStatusSchema.optional(),
  ownerId: z.string().optional(),
});

export function createPaginatedSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
    total: z.number().int().min(0),
  });
}

export type DayKeyInput = z.infer<typeof dayKeySchema>;
export type PublishStatusInput = z.infer<typeof publishStatusSchema>;
export type CoordinatesInput = z.infer<typeof coordinatesSchema>;
export type GeoLocationInput = z.infer<typeof geoLocationSchema>;
export type OpeningHourInput = z.infer<typeof openingHourSchema>;
export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
