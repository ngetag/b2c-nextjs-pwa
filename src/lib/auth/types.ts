import type { AuthProvider, AuthRole, AuthTier } from "@/shared/auth";

/** Customer record used by the authentication services. */
export interface AuthCustomerRecord {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: AuthRole;
  bio?: string;
  interestIds: string[];
  favoriteTagIds: string[];
  badges: Array<{
    id: string;
    label: string;
    category:
      | "community"
      | "interest"
      | "activity"
      | "explorer"
      | "contributor";
  }>;
  points: number;
  tier: AuthTier;
  city?: string;
  emailVerified: boolean;
  joinedAt: string;
}

/** Password credential row (1:1 with a customer). */
export interface CredentialsRecord {
  customerId: string;
  email: string;
  passwordHash: string;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

/** Linked third-party identity. */
export interface OAuthAccountRecord {
  id: string;
  customerId: string;
  provider: AuthProvider;
  providerAccountId: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  accessToken?: string;
  refreshToken?: string;
  scope?: string;
  tokenExpiresAt?: string;
  createdAt: string;
  updatedAt?: string;
}

/** Server-side refresh session row. */
export interface SessionRecord {
  id: string;
  customerId: string;
  refreshTokenHash: string;
  provider: AuthProvider;
  userAgent?: string;
  ipHash?: string;
  expiresAt: string;
  lastUsedAt: string;
  revokedAt?: string;
  createdAt: string;
}

/** Persistence contract implemented by the in-memory and PostgreSQL stores. */
export interface AuthRepository {
  /** Creates the seeded/demo records. Safe to call repeatedly. */
  ensureSeeded(): Promise<void>;

  findCustomerByEmail(email: string): Promise<AuthCustomerRecord | null>;
  findCustomerById(id: string): Promise<AuthCustomerRecord | null>;
  createCustomer(
    input: Pick<
      AuthCustomerRecord,
      | "id"
      | "name"
      | "email"
      | "role"
      | "interestIds"
      | "favoriteTagIds"
      | "city"
      | "avatarUrl"
      | "emailVerified"
    >,
  ): Promise<AuthCustomerRecord>;
  updateCustomer(
    id: string,
    patch: Partial<
      Pick<
        AuthCustomerRecord,
        | "name"
        | "email"
        | "avatarUrl"
        | "bio"
        | "interestIds"
        | "favoriteTagIds"
        | "city"
        | "points"
        | "emailVerified"
      >
    >,
  ): Promise<AuthCustomerRecord | null>;

  getCredentialsByEmail(email: string): Promise<CredentialsRecord | null>;
  getCredentialsByCustomerId(
    customerId: string,
  ): Promise<CredentialsRecord | null>;
  upsertCredentials(record: CredentialsRecord): Promise<void>;
  markEmailVerified(customerId: string): Promise<void>;
  touchLastLogin(customerId: string): Promise<void>;

  findOAuthAccount(
    provider: AuthProvider,
    providerAccountId: string,
  ): Promise<OAuthAccountRecord | null>;
  listOAuthAccounts(customerId: string): Promise<OAuthAccountRecord[]>;
  upsertOAuthAccount(record: OAuthAccountRecord): Promise<void>;

  createSession(record: SessionRecord): Promise<void>;
  getSessionByRefreshHash(hash: string): Promise<SessionRecord | null>;
  getSessionById(id: string): Promise<SessionRecord | null>;
  touchSession(
    id: string,
    patch: { refreshTokenHash?: string; lastUsedAt?: string },
  ): Promise<void>;
  revokeSession(id: string): Promise<void>;
  revokeAllSessions(
    customerId: string,
    exceptSessionId?: string,
  ): Promise<number>;
  listSessions(customerId: string): Promise<SessionRecord[]>;
}
