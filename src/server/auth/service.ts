import { newId } from "@/lib/auth/id";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import type { IssueSessionOptions, IssuedSession } from "@/lib/auth/session";
import { issueSession } from "@/lib/auth/session";
import type { AuthCustomerRecord } from "@/lib/auth/types";
import type { LoginInput, SignupInput, UpdateProfileInput } from "@/schemas";
import type { AuthProvider } from "@/shared/auth";
import type { OAuthProfile } from "@/lib/auth/oauth";
import { getAuthRepo } from "./index";

/** Typed error that maps to the API error envelope. */
export class AuthServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 400,
  ) {
    super(message);
    this.name = "AuthServiceError";
  }
}

async function requireCustomer(id: string): Promise<AuthCustomerRecord> {
  const repo = await getAuthRepo();
  const customer = await repo.findCustomerById(id);
  if (!customer) {
    throw new AuthServiceError("USER_NOT_FOUND", "Akun tidak ditemukan", 404);
  }
  return customer;
}

/**
 * Creates a customer with email/password credentials and opens a session.
 *
 * @throws {AuthServiceError} `EMAIL_TAKEN` when the email is already in use.
 */
export async function signup(
  input: SignupInput,
  meta: IssueSessionOptions = {},
): Promise<{ session: IssuedSession; customer: AuthCustomerRecord }> {
  const repo = await getAuthRepo();
  const existing = await repo.findCustomerByEmail(input.email);

  if (existing) {
    throw new AuthServiceError(
      "EMAIL_TAKEN",
      "Email sudah terdaftar. Coba masuk atau gunakan email lain.",
      409,
    );
  }

  const customerId = newId("cus");
  const emailVerified = process.env.AUTH_AUTO_VERIFY_EMAIL !== "false";

  const customer = await repo.createCustomer({
    id: customerId,
    name: input.name,
    email: input.email,
    role: "customer",
    interestIds: input.interestIds,
    favoriteTagIds: input.favoriteTagIds,
    city: input.city,
    emailVerified,
  });

  await repo.upsertCredentials({
    customerId,
    email: input.email,
    passwordHash: await hashPassword(input.password),
    emailVerified,
    createdAt: new Date().toISOString(),
  });

  const session = await issueSession(customer, {
    ...meta,
    provider: "email",
  });

  return { session, customer };
}

/**
 * Validates email/password credentials and opens a session.
 *
 * @throws {AuthServiceError} `INVALID_CREDENTIALS` for unknown email or wrong
 * password (identical message to avoid account enumeration).
 */
export async function login(
  input: LoginInput,
  meta: IssueSessionOptions = {},
): Promise<{ session: IssuedSession; customer: AuthCustomerRecord }> {
  const repo = await getAuthRepo();
  const credentials = await repo.getCredentialsByEmail(input.email);

  if (!credentials) {
    throw new AuthServiceError(
      "INVALID_CREDENTIALS",
      "Email atau password salah",
      401,
    );
  }

  const valid = await verifyPassword(input.password, credentials.passwordHash);
  if (!valid) {
    throw new AuthServiceError(
      "INVALID_CREDENTIALS",
      "Email atau password salah",
      401,
    );
  }

  const customer = await repo.findCustomerById(credentials.customerId);
  if (!customer) {
    throw new AuthServiceError(
      "INVALID_CREDENTIALS",
      "Email atau password salah",
      401,
    );
  }

  await repo.touchLastLogin(customer.id);
  const session = await issueSession(customer, {
    ...meta,
    provider: "email",
  });

  return { session, customer };
}

/**
 * Resolves the customer for an OAuth profile, linking the provider account to
 * an existing email or creating a new customer when needed.
 *
 * @param profile Normalised profile from Google/GitHub (or the demo simulator).
 */
export async function provisionOAuthCustomer(profile: OAuthProfile): Promise<{
  customer: AuthCustomerRecord;
  isNew: boolean;
  linked: boolean;
}> {
  const repo = await getAuthRepo();
  const linkedAccount = await repo.findOAuthAccount(
    profile.provider,
    profile.providerAccountId,
  );

  if (linkedAccount) {
    const customer = await repo.findCustomerById(linkedAccount.customerId);
    if (customer) {
      await repo.upsertOAuthAccount({
        ...linkedAccount,
        email: profile.email,
        displayName: profile.name,
        avatarUrl: profile.avatarUrl,
        accessToken: profile.accessToken,
        refreshToken: profile.refreshToken,
        scope: profile.scope,
        tokenExpiresAt: profile.tokenExpiresAt,
      });
      return { customer, isNew: false, linked: true };
    }
  }

  const byEmail = await repo.findCustomerByEmail(profile.email);

  if (byEmail) {
    await repo.upsertOAuthAccount({
      id: newId("oauth"),
      customerId: byEmail.id,
      provider: profile.provider,
      providerAccountId: profile.providerAccountId,
      email: profile.email,
      displayName: profile.name,
      avatarUrl: profile.avatarUrl,
      accessToken: profile.accessToken,
      refreshToken: profile.refreshToken,
      scope: profile.scope,
      tokenExpiresAt: profile.tokenExpiresAt,
      createdAt: new Date().toISOString(),
    });

    if (profile.emailVerified && !byEmail.emailVerified) {
      await repo.markEmailVerified(byEmail.id);
    }
    return { customer: byEmail, isNew: false, linked: true };
  }

  const customer = await repo.createCustomer({
    id: newId("cus"),
    name: profile.name,
    email: profile.email,
    avatarUrl: profile.avatarUrl,
    role: "customer",
    interestIds: [],
    favoriteTagIds: [],
    emailVerified: profile.emailVerified,
  });

  await repo.upsertOAuthAccount({
    id: newId("oauth"),
    customerId: customer.id,
    provider: profile.provider,
    providerAccountId: profile.providerAccountId,
    email: profile.email,
    displayName: profile.name,
    avatarUrl: profile.avatarUrl,
    accessToken: profile.accessToken,
    refreshToken: profile.refreshToken,
    scope: profile.scope,
    tokenExpiresAt: profile.tokenExpiresAt,
    createdAt: new Date().toISOString(),
  });

  return { customer, isNew: true, linked: true };
}

/**
 * Applies a profile patch (from `/account` or onboarding) and returns the
 * updated customer.
 */
export async function updateProfile(
  customerId: string,
  patch: UpdateProfileInput,
): Promise<AuthCustomerRecord> {
  const repo = await getAuthRepo();
  const updated = await repo.updateCustomer(customerId, patch);
  if (!updated) {
    throw new AuthServiceError("USER_NOT_FOUND", "Akun tidak ditemukan", 404);
  }
  return updated;
}

/** Convenience wrapper used by the session endpoint. */
export async function getCustomerOrThrow(
  customerId: string,
): Promise<AuthCustomerRecord> {
  return requireCustomer(customerId);
}

/** Provider label for provider-specific UI copy. */
export function providerLabel(provider: AuthProvider): string {
  return provider === "github" ? "GitHub" : provider === "google" ? "Google" : "Email";
}
