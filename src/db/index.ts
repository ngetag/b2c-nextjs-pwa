/**
 * Barrel export for all Drizzle tables and relations.
 * `drizzle.config.ts` points to this file, so anything exported here becomes
 * part of the generated SQL migration.
 */
export * from "./schema";
export * from "./relations";
export * from "./auth.schema";
export * from "./telemetry.schema";
