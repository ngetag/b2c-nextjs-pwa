import { demoUser } from "@/data/fixtures/users";
import { hashPassword } from "@/lib/auth/password";
import type {
  AuthCustomerRecord,
  AuthRepository,
  CredentialsRecord,
  OAuthAccountRecord,
  SessionRecord,
} from "@/lib/auth/types";
import { tierFromPoints, type AuthProvider } from "@/shared/auth";

/** Demo account seeded into the in-memory store. */
export const DEMO_ACCOUNT = {
  email: "demo@ngetag.id",
  password: "ngetag123",
} as const;

interface MemoryAuthState {
  seeded: boolean;
  seedPromise: Promise<void> | null;
  customers: Map<string, AuthCustomerRecord>;
  credentialsByEmail: Map<string, CredentialsRecord>;
  credentialsByCustomer: Map<string, CredentialsRecord>;
  oauthAccounts: Map<string, OAuthAccountRecord>;
  sessions: Map<string, SessionRecord>;
}

const globalForAuth = globalThis as unknown as {
  __ngetagAuthMemory?: MemoryAuthState;
};

function state(): MemoryAuthState {
  if (!globalForAuth.__ngetagAuthMemory) {
    globalForAuth.__ngetagAuthMemory = {
      seeded: false,
      seedPromise: null,
      customers: new Map(),
      credentialsByEmail: new Map(),
      credentialsByCustomer: new Map(),
      oauthAccounts: new Map(),
      sessions: new Map(),
    };
  }
  return globalForAuth.__ngetagAuthMemory;
}

function oauthKey(provider: AuthProvider, providerAccountId: string): string {
  return `${provider}:${providerAccountId}`;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function seedCustomer(): AuthCustomerRecord {
  return {
    id: demoUser.id,
    name: demoUser.name,
    email: demoUser.email.toLowerCase(),
    avatarUrl: demoUser.avatarUrl,
    role: demoUser.role,
    bio: demoUser.bio,
    interestIds: [...demoUser.interestIds],
    favoriteTagIds: [...(demoUser.preferences?.favoriteTagIds ?? [])],
    badges: demoUser.badges.map((badge) => ({ ...badge })),
    points: 2450,
    tier: tierFromPoints(2450),
    city: demoUser.preferences?.city ?? "Jakarta Selatan",
    emailVerified: true,
    joinedAt: demoUser.joinedAt,
  };
}

/**
 * In-memory implementation of {@link AuthRepository}.
 *
 * Used when `DATABASE_URL` is not configured (local demo, preview, tests) and
 * as an explicit fallback so the signup/login flow never hard-depends on
 * PostgreSQL being reachable.
 */
export const memoryAuthRepo: AuthRepository = {
  async ensureSeeded() {
    const store = state();
    if (store.seeded) return;
    if (store.seedPromise) return store.seedPromise;

    store.seedPromise = (async () => {
      const customer = seedCustomer();
      store.customers.set(customer.id, customer);

      const passwordHash = await hashPassword(DEMO_ACCOUNT.password);
      const now = new Date().toISOString();
      const credentials: CredentialsRecord = {
        customerId: customer.id,
        email: customer.email,
        passwordHash,
        emailVerified: true,
        createdAt: now,
      };
      store.credentialsByEmail.set(credentials.email, credentials);
      store.credentialsByCustomer.set(customer.id, credentials);
      store.seeded = true;
    })();

    return store.seedPromise;
  },

  async findCustomerByEmail(email) {
    await this.ensureSeeded();
    const needle = email.trim().toLowerCase();
    for (const customer of state().customers.values()) {
      if (customer.email.toLowerCase() === needle) return clone(customer);
    }
    return null;
  },

  async findCustomerById(id) {
    await this.ensureSeeded();
    const customer = state().customers.get(id);
    return customer ? clone(customer) : null;
  },

  async createCustomer(input) {
    await this.ensureSeeded();
    const now = new Date().toISOString();
    const customer: AuthCustomerRecord = {
      id: input.id,
      name: input.name,
      email: input.email.toLowerCase(),
      avatarUrl: input.avatarUrl,
      role: input.role,
      interestIds: [...input.interestIds],
      favoriteTagIds: [...input.favoriteTagIds],
      badges: [
        {
          id: "b-contributor-new",
          label: "New Explorer",
          category: "contributor",
        },
      ],
      points: 0,
      tier: tierFromPoints(0),
      city: input.city,
      emailVerified: input.emailVerified,
      joinedAt: now,
    };
    state().customers.set(customer.id, customer);
    return clone(customer);
  },

  async updateCustomer(id, patch) {
    await this.ensureSeeded();
    const customer = state().customers.get(id);
    if (!customer) return null;

    const updated: AuthCustomerRecord = {
      ...customer,
      ...patch,
      email: (patch.email ?? customer.email).toLowerCase(),
      tier: tierFromPoints(patch.points ?? customer.points),
    };
    state().customers.set(id, updated);

    const credentials = state().credentialsByCustomer.get(id);
    if (credentials && patch.email) {
      state().credentialsByEmail.delete(credentials.email);
      credentials.email = updated.email;
      state().credentialsByEmail.set(credentials.email, credentials);
    }

    return clone(updated);
  },

  async getCredentialsByEmail(email) {
    await this.ensureSeeded();
    const credentials = state().credentialsByEmail.get(email.trim().toLowerCase());
    return credentials ? clone(credentials) : null;
  },

  async getCredentialsByCustomerId(customerId) {
    await this.ensureSeeded();
    const credentials = state().credentialsByCustomer.get(customerId);
    return credentials ? clone(credentials) : null;
  },

  async upsertCredentials(record) {
    await this.ensureSeeded();
    const store = state();
    const existing = store.credentialsByCustomer.get(record.customerId);
    if (existing && existing.email !== record.email) {
      store.credentialsByEmail.delete(existing.email);
    }
    const next: CredentialsRecord = {
      ...record,
      email: record.email.toLowerCase(),
      updatedAt: new Date().toISOString(),
    };
    store.credentialsByCustomer.set(next.customerId, next);
    store.credentialsByEmail.set(next.email, next);
  },

  async markEmailVerified(customerId) {
    await this.ensureSeeded();
    const store = state();
    const credentials = store.credentialsByCustomer.get(customerId);
    if (credentials) {
      credentials.emailVerified = true;
      store.credentialsByEmail.set(credentials.email, credentials);
    }
    const customer = store.customers.get(customerId);
    if (customer) {
      customer.emailVerified = true;
    }
  },

  async touchLastLogin(customerId) {
    await this.ensureSeeded();
    const credentials = state().credentialsByCustomer.get(customerId);
    if (credentials) {
      credentials.lastLoginAt = new Date().toISOString();
    }
  },

  async findOAuthAccount(provider, providerAccountId) {
    await this.ensureSeeded();
    const account = state().oauthAccounts.get(
      oauthKey(provider, providerAccountId),
    );
    return account ? clone(account) : null;
  },

  async listOAuthAccounts(customerId) {
    await this.ensureSeeded();
    return [...state().oauthAccounts.values()]
      .filter((account) => account.customerId === customerId)
      .map(clone);
  },

  async upsertOAuthAccount(record) {
    await this.ensureSeeded();
    state().oauthAccounts.set(
      oauthKey(record.provider, record.providerAccountId),
      clone({ ...record, updatedAt: new Date().toISOString() }),
    );
  },

  async createSession(record) {
    await this.ensureSeeded();
    state().sessions.set(record.id, clone(record));
  },

  async getSessionByRefreshHash(hash) {
    await this.ensureSeeded();
    for (const session of state().sessions.values()) {
      if (session.refreshTokenHash === hash) return clone(session);
    }
    return null;
  },

  async getSessionById(id) {
    await this.ensureSeeded();
    const session = state().sessions.get(id);
    return session ? clone(session) : null;
  },

  async touchSession(id, patch) {
    await this.ensureSeeded();
    const session = state().sessions.get(id);
    if (!session) return;
    if (patch.refreshTokenHash) session.refreshTokenHash = patch.refreshTokenHash;
    session.lastUsedAt = patch.lastUsedAt ?? new Date().toISOString();
  },

  async revokeSession(id) {
    await this.ensureSeeded();
    const session = state().sessions.get(id);
    if (session) session.revokedAt = new Date().toISOString();
  },

  async revokeAllSessions(customerId, exceptSessionId) {
    await this.ensureSeeded();
    const now = new Date().toISOString();
    let count = 0;
    for (const session of state().sessions.values()) {
      if (
        session.customerId === customerId &&
        session.id !== exceptSessionId &&
        !session.revokedAt
      ) {
        session.revokedAt = now;
        count += 1;
      }
    }
    return count;
  },

  async listSessions(customerId) {
    await this.ensureSeeded();
    return [...state().sessions.values()]
      .filter((session) => session.customerId === customerId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(clone);
  },
};
