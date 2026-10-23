import { and, eq, ne } from "drizzle-orm";
import {
  authCredentials,
  authOAuthAccounts,
  authSessions,
  customerFavoriteTags,
  customerInterests,
  customers,
} from "@/db";
import { demoUser } from "@/data/fixtures/users";
import { hashPassword } from "@/lib/auth/password";
import type {
  AuthCustomerRecord,
  AuthRepository,
  CredentialsRecord,
  OAuthAccountRecord,
  SessionRecord,
} from "@/lib/auth/types";
import { getDb } from "@/server/db/client";
import { tierFromPoints } from "@/shared/auth";
import { DEMO_ACCOUNT } from "./memory-auth.repo";

type CustomerRow = typeof customers.$inferSelect;
type CredentialRow = typeof authCredentials.$inferSelect;
type OAuthRow = typeof authOAuthAccounts.$inferSelect;
type SessionRow = typeof authSessions.$inferSelect;

function iso(value: Date | null | undefined): string | undefined {
  return value ? value.toISOString() : undefined;
}

function mapRow(
  row: CustomerRow,
  interestIds: string[],
  favoriteTagIds: string[],
): AuthCustomerRecord {
  const preferences = row.preferences ?? { favoriteTagIds: [] };
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatarUrl: row.avatarUrl ?? undefined,
    role: row.role,
    bio: row.bio ?? undefined,
    interestIds,
    favoriteTagIds:
      favoriteTagIds.length > 0
        ? favoriteTagIds
        : (preferences.favoriteTagIds ?? []),
    badges: (row.badges ?? []).map((badge) => ({
      id: badge.id,
      label: badge.label,
      category: badge.category,
    })),
    points: row.points,
    tier: tierFromPoints(row.points),
    city: preferences.city,
    emailVerified: false,
    joinedAt: row.joinedAt.toISOString(),
  };
}

function mapCredentials(row: CredentialRow): CredentialsRecord {
  return {
    customerId: row.customerId,
    email: row.email,
    passwordHash: row.passwordHash,
    emailVerified: row.emailVerified,
    lastLoginAt: iso(row.lastLoginAt),
    createdAt: row.createdAt.toISOString(),
    updatedAt: iso(row.updatedAt),
  };
}

function mapOAuth(row: OAuthRow): OAuthAccountRecord {
  return {
    id: row.id,
    customerId: row.customerId,
    provider: row.provider as OAuthAccountRecord["provider"],
    providerAccountId: row.providerAccountId,
    email: row.email ?? undefined,
    displayName: row.displayName ?? undefined,
    avatarUrl: row.avatarUrl ?? undefined,
    accessToken: row.accessToken ?? undefined,
    refreshToken: row.refreshToken ?? undefined,
    scope: row.scope ?? undefined,
    tokenExpiresAt: iso(row.tokenExpiresAt),
    createdAt: row.createdAt.toISOString(),
    updatedAt: iso(row.updatedAt),
  };
}

function mapSession(row: SessionRow): SessionRecord {
  return {
    id: row.id,
    customerId: row.customerId,
    refreshTokenHash: row.refreshTokenHash,
    provider: row.provider as SessionRecord["provider"],
    userAgent: row.userAgent ?? undefined,
    ipHash: row.ipHash ?? undefined,
    expiresAt: row.expiresAt.toISOString(),
    lastUsedAt: row.lastUsedAt.toISOString(),
    revokedAt: iso(row.revokedAt),
    createdAt: row.createdAt.toISOString(),
  };
}

/**
 * PostgreSQL implementation of {@link AuthRepository}, backed by Drizzle.
 *
 * IDs are application-generated (`cus_...`, `sess_...`) so the same code works
 * against seeded data and freshly created accounts.
 */
export function createPostgresAuthRepo(): AuthRepository {
  const repo: AuthRepository = {
    async ensureSeeded() {
      if (process.env.AUTH_SEED_DEMO === "false") return;
      const db = await getDb();
      const existing = await db
        .select({ id: customers.id })
        .from(customers)
        .where(eq(customers.email, demoUser.email))
        .limit(1);
      if (existing.length > 0) return;

      const seeded = await db
        .insert(customers)
        .values({
          id: demoUser.id,
          name: demoUser.name,
          email: demoUser.email.toLowerCase(),
          avatarUrl: demoUser.avatarUrl,
          role: demoUser.role,
          bio: demoUser.bio,
          badges: demoUser.badges,
          preferences: {
            favoriteTagIds: demoUser.preferences?.favoriteTagIds ?? [],
            city: demoUser.preferences?.city ?? "Jakarta Selatan",
          },
          points: 2450,
        })
        .onConflictDoNothing()
        .returning({ id: customers.id });

      if (seeded.length === 0) return;

      await db.insert(customerInterests).values(
        demoUser.interestIds.map((interestId) => ({
          customerId: demoUser.id,
          interestId,
        })),
      ).onConflictDoNothing();

      await db.insert(authCredentials).values({
        customerId: demoUser.id,
        email: demoUser.email.toLowerCase(),
        passwordHash: await hashPassword(DEMO_ACCOUNT.password),
        emailVerified: true,
      }).onConflictDoNothing();
    },

    async findCustomerByEmail(email) {
      await repo.ensureSeeded();
      const db = await getDb();
      const rows = await db
        .select()
        .from(customers)
        .where(eq(customers.email, email.trim().toLowerCase()))
        .limit(1);
      if (rows.length === 0) return null;
      return repo.findCustomerById(rows[0].id);
    },

    async findCustomerById(id) {
      const db = await getDb();
      const [rows, interestRows, favoriteRows, credentialRows] =
        await Promise.all([
          db.select().from(customers).where(eq(customers.id, id)).limit(1),
          db
            .select({ interestId: customerInterests.interestId })
            .from(customerInterests)
            .where(eq(customerInterests.customerId, id)),
          db
            .select({ tagId: customerFavoriteTags.tagId })
            .from(customerFavoriteTags)
            .where(eq(customerFavoriteTags.customerId, id)),
          db
            .select({ emailVerified: authCredentials.emailVerified })
            .from(authCredentials)
            .where(eq(authCredentials.customerId, id))
            .limit(1),
        ]);

      if (rows.length === 0) return null;

      const customer = mapRow(
        rows[0],
        interestRows.map((row) => row.interestId),
        favoriteRows.map((row) => row.tagId),
      );
      // OAuth customers have no credentials row — treat them as verified.
      customer.emailVerified =
        credentialRows.length === 0 ? true : credentialRows[0].emailVerified;

      return customer;
    },

    async createCustomer(input) {
      const db = await getDb();
      await db.insert(customers).values({
        id: input.id,
        name: input.name,
        email: input.email.toLowerCase(),
        avatarUrl: input.avatarUrl,
        role: input.role,
        badges: [
          {
            id: "b-contributor-new",
            label: "New Explorer",
            category: "contributor",
          },
        ],
        preferences: {
          favoriteTagIds: input.favoriteTagIds,
          city: input.city,
        },
        points: 0,
      });

      if (input.interestIds.length > 0) {
        await db.insert(customerInterests).values(
          input.interestIds.map((interestId) => ({
            customerId: input.id,
            interestId,
          })),
        );
      }

      if (input.favoriteTagIds.length > 0) {
        await db.insert(customerFavoriteTags).values(
          input.favoriteTagIds.map((tagId) => ({
            customerId: input.id,
            tagId,
          })),
        );
      }

      const created = await repo.findCustomerById(input.id);
      if (!created) throw new Error("Gagal membuat customer");
      created.emailVerified = input.emailVerified;
      return created;
    },

    async updateCustomer(id, patch) {
      const db = await getDb();
      const current = await repo.findCustomerById(id);
      if (!current) return null;

      const preferences = {
        favoriteTagIds: patch.favoriteTagIds ?? current.favoriteTagIds,
        city: patch.city ?? current.city,
      };

      await db
        .update(customers)
        .set({
          ...(patch.name !== undefined ? { name: patch.name } : {}),
          ...(patch.email !== undefined
            ? { email: patch.email.toLowerCase() }
            : {}),
          ...(patch.avatarUrl !== undefined
            ? { avatarUrl: patch.avatarUrl }
            : {}),
          ...(patch.bio !== undefined ? { bio: patch.bio } : {}),
          ...(patch.points !== undefined ? { points: patch.points } : {}),
          preferences,
          updatedAt: new Date(),
        })
        .where(eq(customers.id, id));

      if (patch.interestIds) {
        await db
          .delete(customerInterests)
          .where(eq(customerInterests.customerId, id));
        if (patch.interestIds.length > 0) {
          await db.insert(customerInterests).values(
            patch.interestIds.map((interestId) => ({
              customerId: id,
              interestId,
            })),
          );
        }
      }

      if (patch.favoriteTagIds) {
        await db
          .delete(customerFavoriteTags)
          .where(eq(customerFavoriteTags.customerId, id));
        if (patch.favoriteTagIds.length > 0) {
          await db.insert(customerFavoriteTags).values(
            patch.favoriteTagIds.map((tagId) => ({ customerId: id, tagId })),
          );
        }
      }

      if (patch.email) {
        await db
          .update(authCredentials)
          .set({ email: patch.email.toLowerCase(), updatedAt: new Date() })
          .where(eq(authCredentials.customerId, id));
      }

      return repo.findCustomerById(id);
    },

    async getCredentialsByEmail(email) {
      const db = await getDb();
      const rows = await db
        .select()
        .from(authCredentials)
        .where(eq(authCredentials.email, email.trim().toLowerCase()))
        .limit(1);
      return rows.length > 0 ? mapCredentials(rows[0]) : null;
    },

    async getCredentialsByCustomerId(customerId) {
      const db = await getDb();
      const rows = await db
        .select()
        .from(authCredentials)
        .where(eq(authCredentials.customerId, customerId))
        .limit(1);
      return rows.length > 0 ? mapCredentials(rows[0]) : null;
    },

    async upsertCredentials(record) {
      const db = await getDb();
      await db
        .insert(authCredentials)
        .values({
          customerId: record.customerId,
          email: record.email.toLowerCase(),
          passwordHash: record.passwordHash,
          emailVerified: record.emailVerified,
          lastLoginAt: record.lastLoginAt ? new Date(record.lastLoginAt) : null,
        })
        .onConflictDoUpdate({
          target: authCredentials.customerId,
          set: {
            email: record.email.toLowerCase(),
            passwordHash: record.passwordHash,
            emailVerified: record.emailVerified,
            updatedAt: new Date(),
          },
        });
    },

    async markEmailVerified(customerId) {
      const db = await getDb();
      await db
        .update(authCredentials)
        .set({ emailVerified: true, updatedAt: new Date() })
        .where(eq(authCredentials.customerId, customerId));
    },

    async touchLastLogin(customerId) {
      const db = await getDb();
      await db
        .update(authCredentials)
        .set({ lastLoginAt: new Date() })
        .where(eq(authCredentials.customerId, customerId));
    },

    async findOAuthAccount(provider, providerAccountId) {
      const db = await getDb();
      const rows = await db
        .select()
        .from(authOAuthAccounts)
        .where(
          and(
            eq(authOAuthAccounts.provider, provider),
            eq(authOAuthAccounts.providerAccountId, providerAccountId),
          ),
        )
        .limit(1);
      return rows.length > 0 ? mapOAuth(rows[0]) : null;
    },

    async listOAuthAccounts(customerId) {
      const db = await getDb();
      const rows = await db
        .select()
        .from(authOAuthAccounts)
        .where(eq(authOAuthAccounts.customerId, customerId));
      return rows.map(mapOAuth);
    },

    async upsertOAuthAccount(record) {
      const db = await getDb();
      await db
        .insert(authOAuthAccounts)
        .values({
          id: record.id,
          customerId: record.customerId,
          provider: record.provider,
          providerAccountId: record.providerAccountId,
          email: record.email,
          displayName: record.displayName,
          avatarUrl: record.avatarUrl,
          accessToken: record.accessToken,
          refreshToken: record.refreshToken,
          scope: record.scope,
          tokenExpiresAt: record.tokenExpiresAt
            ? new Date(record.tokenExpiresAt)
            : null,
        })
        .onConflictDoUpdate({
          target: [
            authOAuthAccounts.provider,
            authOAuthAccounts.providerAccountId,
          ],
          set: {
            customerId: record.customerId,
            email: record.email,
            displayName: record.displayName,
            avatarUrl: record.avatarUrl,
            accessToken: record.accessToken,
            refreshToken: record.refreshToken,
            scope: record.scope,
            tokenExpiresAt: record.tokenExpiresAt
              ? new Date(record.tokenExpiresAt)
              : null,
            updatedAt: new Date(),
          },
        });
    },

    async createSession(record) {
      const db = await getDb();
      await db.insert(authSessions).values({
        id: record.id,
        customerId: record.customerId,
        refreshTokenHash: record.refreshTokenHash,
        provider: record.provider,
        userAgent: record.userAgent,
        ipHash: record.ipHash,
        expiresAt: new Date(record.expiresAt),
        lastUsedAt: new Date(record.lastUsedAt),
      });
    },

    async getSessionByRefreshHash(hash) {
      const db = await getDb();
      const rows = await db
        .select()
        .from(authSessions)
        .where(eq(authSessions.refreshTokenHash, hash))
        .limit(1);
      return rows.length > 0 ? mapSession(rows[0]) : null;
    },

    async getSessionById(id) {
      const db = await getDb();
      const rows = await db
        .select()
        .from(authSessions)
        .where(eq(authSessions.id, id))
        .limit(1);
      return rows.length > 0 ? mapSession(rows[0]) : null;
    },

    async touchSession(id, patch) {
      const db = await getDb();
      await db
        .update(authSessions)
        .set({
          ...(patch.refreshTokenHash
            ? { refreshTokenHash: patch.refreshTokenHash }
            : {}),
          lastUsedAt: patch.lastUsedAt ? new Date(patch.lastUsedAt) : new Date(),
        })
        .where(eq(authSessions.id, id));
    },

    async revokeSession(id) {
      const db = await getDb();
      await db
        .update(authSessions)
        .set({ revokedAt: new Date() })
        .where(eq(authSessions.id, id));
    },

    async revokeAllSessions(customerId, exceptSessionId) {
      const db = await getDb();
      const rows = await db
        .update(authSessions)
        .set({ revokedAt: new Date() })
        .where(
          exceptSessionId
            ? and(
                eq(authSessions.customerId, customerId),
                ne(authSessions.id, exceptSessionId),
              )
            : eq(authSessions.customerId, customerId),
        )
        .returning({ id: authSessions.id });
      return rows.length;
    },

    async listSessions(customerId) {
      const db = await getDb();
      const rows = await db
        .select()
        .from(authSessions)
        .where(eq(authSessions.customerId, customerId));
      return rows
        .map(mapSession)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
  };

  return repo;
}
