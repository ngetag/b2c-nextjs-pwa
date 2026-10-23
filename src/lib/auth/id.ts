import { randomBytes } from "node:crypto";

/**
 * Generates a short, URL-safe, prefixed identifier.
 *
 * @example newId("cus") // "cus_kJ3f...9Q"
 * @param prefix Human-readable entity prefix (`cus`, `sess`, `oauth`, ...).
 * @param bytes Entropy in bytes (default 12 → 16 base64url chars).
 */
export function newId(prefix: string, bytes = 12): string {
  return `${prefix}_${randomBytes(bytes).toString("base64url")}`;
}
