import {
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { AUTH_PROVIDERS } from "@/shared/auth";
import { customers } from "./schema";

// ============================================================================
// Auth enums
// ============================================================================

export const authProviderEnum = pgEnum(
  "auth_provider",
  AUTH_PROVIDERS,
);

export const authTokenPurposeEnum = pgEnum("auth_token_purpose", [
  "verify_email",
  "reset_password",
]);

// ============================================================================
// 1. Credentials (email + password signup)
// ============================================================================

/**
 * `auth_credentials` — password-based login data, 1:1 with `customers`.
 *
 * Passwords are stored as `scrypt$N$r$p$salt$hash` strings (see
 * `src/lib/auth/password.ts`) — never in plaintext and never in JWTs.
 */
export const authCredentials = pgTable(
  "auth_credentials",
  {
    customerId: varchar("customer_id", { length: 64 })
      .primaryKey()
      .references(() => customers.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [uniqueIndex("auth_credentials_email_idx").on(table.email)],
);

// ============================================================================
// 2. Linked OAuth accounts
// ============================================================================

/**
 * `auth_oauth_accounts` — third-party identities linked to a customer.
 * A single customer can link Google and GitHub at the same time.
 */
export const authOAuthAccounts = pgTable(
  "auth_oauth_accounts",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    customerId: varchar("customer_id", { length: 64 })
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    provider: authProviderEnum("provider").notNull(),
    providerAccountId: varchar("provider_account_id", { length: 191 })
      .notNull(),
    email: varchar("email", { length: 255 }),
    displayName: varchar("display_name", { length: 255 }),
    avatarUrl: text("avatar_url"),
    /** Only stored when the provider returns one and offline access is needed. */
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    scope: varchar("scope", { length: 255 }),
    tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("auth_oauth_provider_account_idx").on(
      table.provider,
      table.providerAccountId,
    ),
    index("auth_oauth_customer_idx").on(table.customerId),
  ],
);

// ============================================================================
// 3. Refresh-token sessions (rotation + revocation)
// ============================================================================

/**
 * `auth_sessions` — one row per sign-in, used for refresh-token rotation,
 * "active devices" lists, and instant revocation.
 *
 * Only the SHA-256 hash of the refresh token is persisted.
 */
export const authSessions = pgTable(
  "auth_sessions",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    customerId: varchar("customer_id", { length: 64 })
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    refreshTokenHash: varchar("refresh_token_hash", { length: 64 }).notNull(),
    provider: authProviderEnum("provider").notNull().default("email"),
    userAgent: text("user_agent"),
    ipHash: varchar("ip_hash", { length: 64 }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("auth_sessions_customer_idx").on(table.customerId),
    uniqueIndex("auth_sessions_refresh_hash_idx").on(table.refreshTokenHash),
  ],
);

// ============================================================================
// 4. Single-use email tokens (verification / password reset)
// ============================================================================

/**
 * `auth_email_tokens` — hashed, single-use tokens for email verification and
 * password resets. Consumed tokens keep their `consumedAt` timestamp for audit.
 */
export const authEmailTokens = pgTable(
  "auth_email_tokens",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    customerId: varchar("customer_id", { length: 64 })
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    purpose: authTokenPurposeEnum("purpose").notNull(),
    tokenHash: varchar("token_hash", { length: 64 }).notNull(),
    /** JSON payload (e.g. the new email address being verified). */
    payload: jsonb("payload").$type<Record<string, unknown>>(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("auth_email_tokens_hash_idx").on(table.tokenHash),
    index("auth_email_tokens_customer_idx").on(table.customerId),
  ],
);
