import { z } from "zod";

/** Email normalised to lowercase without surrounding whitespace. */
export const authEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(5)
  .max(255)
  .email("Format email tidak valid");

/** Password policy for email/password accounts. */
export const authPasswordSchema = z
  .string()
  .min(8, "Password minimal 8 karakter")
  .max(128, "Password maksimal 128 karakter");

/** Payload for `POST /api/auth/signup`. */
export const signupSchema = z
  .strictObject({
    name: z.string().trim().min(2, "Nama minimal 2 karakter").max(80),
    email: authEmailSchema,
    password: authPasswordSchema,
    /** Onboarding interests used to cold-start recommendations. */
    interestIds: z.array(z.string().min(1)).max(20).optional().default([]),
    /** Favourite tags used to cold-start recommendations. */
    favoriteTagIds: z.array(z.string().min(1)).max(30).optional().default([]),
    /** Home city, e.g. `Jakarta Selatan`. */
    city: z.string().trim().max(128).optional(),
    /** Explicit consent to the terms & privacy policy. */
    acceptTerms: z.boolean().optional().default(true),
  })
  .refine((input) => input.acceptTerms, {
    message: "Kamu harus menyetujui Syarat & Ketentuan",
    path: ["acceptTerms"],
  });

/** Payload for `POST /api/auth/login`. */
export const loginSchema = z.strictObject({
  email: authEmailSchema,
  password: z.string().min(1, "Password wajib diisi").max(128),
});

/** Payload for `POST /api/auth/refresh`. */
export const refreshTokenSchema = z.strictObject({
  /** Optional for browser clients (httpOnly cookie is used instead). */
  refreshToken: z.string().min(20).optional(),
});

/** Payload for `PATCH /api/auth/profile`. */
export const updateProfileSchema = z.strictObject({
  name: z.string().trim().min(2).max(80).optional(),
  bio: z.string().trim().max(500).optional(),
  avatarUrl: z.string().url().max(2048).optional(),
  interestIds: z.array(z.string().min(1)).max(20).optional(),
  favoriteTagIds: z.array(z.string().min(1)).max(30).optional(),
  city: z.string().trim().max(128).optional(),
});

/** Query for `GET /api/auth/oauth/[provider]`. */
export const oauthStartQuerySchema = z.object({
  /** Relative path to land on after the callback. */
  next: z.string().max(512).optional(),
});

/** Query for `GET /api/auth/oauth/[provider]/callback`. */
export const oauthCallbackQuerySchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
  demo: z.string().optional(),
  error: z.string().optional(),
  error_description: z.string().optional(),
});

/** Payload for `PATCH /api/users/me` when authenticated. */
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
