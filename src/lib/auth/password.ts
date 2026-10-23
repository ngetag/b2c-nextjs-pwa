import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
  type ScryptOptions,
} from "node:crypto";

/** Promise wrapper around `crypto.scrypt` with explicit option typing. */
function scrypt(
  password: string,
  salt: Buffer,
  keyLength: number,
  options: ScryptOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, keyLength, options, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

/** scrypt cost parameters. Portable default recommended by OWASP. */
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;
const SALT_BYTES = 16;
const MAX_MEM = 64 * 1024 * 1024;

/**
 * Hashes a plaintext password with scrypt.
 *
 * Format: `scrypt$N$r$p$salt$hash` (salt + hash are base64url encoded).
 * The cost parameters are embedded so they can be upgraded without breaking
 * existing accounts.
 *
 * @param password Plaintext password (already validated by Zod, min 8 chars).
 * @returns An opaque password hash safe to persist.
 */
export async function hashPassword(password: string): Promise<string> {
  const normalized = password.normalize("NFKC");
  const salt = randomBytes(SALT_BYTES);
  const derived = await scrypt(normalized, salt, KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: MAX_MEM,
  });

  return [
    "scrypt",
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
    salt.toString("base64url"),
    derived.toString("base64url"),
  ].join("$");
}

/**
 * Verifies a plaintext password against a stored scrypt hash in constant time.
 *
 * @param password Plaintext candidate.
 * @param stored Hash produced by {@link hashPassword}.
 * @returns `true` when the password matches.
 */
export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const [, nRaw, rRaw, pRaw, saltRaw, hashRaw] = parts;
  const N = Number(nRaw);
  const r = Number(rRaw);
  const p = Number(pRaw);
  if (!Number.isFinite(N) || !Number.isFinite(r) || !Number.isFinite(p)) {
    return false;
  }

  try {
    const salt = Buffer.from(saltRaw, "base64url");
    const expected = Buffer.from(hashRaw, "base64url");
    const derived = await scrypt(password.normalize("NFKC"), salt, expected.length, {
      N,
      r,
      p,
      maxmem: MAX_MEM,
    });

    if (derived.length !== expected.length) return false;
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

/**
 * Generates a cryptographically strong URL-safe token (refresh tokens, email
 * verification tokens, OAuth state, PKCE verifiers).
 *
 * @param bytes Entropy in bytes (default 48 → 64 base64url chars).
 */
export function randomToken(bytes = 48): string {
  return randomBytes(bytes).toString("base64url");
}

/**
 * Hashes an opaque token (refresh token, email token) before persisting it,
 * so a database leak cannot be replayed as a valid session.
 *
 * @param token Raw token handed to the client.
 * @returns Lowercase SHA-256 hex digest.
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Builds a non-reversible hash of a client IP for abuse analytics.
 *
 * @param ip Raw IP address from the request headers.
 */
export function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  return createHash("sha256").update(`ngetag-ip:${ip}`).digest("hex").slice(0, 32);
}
