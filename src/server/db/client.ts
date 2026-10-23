import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Pool } from "pg";

type Database = NodePgDatabase<Record<string, never>>;

interface DbGlobal {
  __ngetagPool?: Pool;
  __ngetagDb?: Database;
}

const globalForDb = globalThis as unknown as DbGlobal;

/**
 * Returns `true` when `DATABASE_URL` is configured.
 *
 * The whole app degrades gracefully to an in-memory store when it is not, so
 * `npm run dev` works without provisioning PostgreSQL. Add the `vector` and
 * `postgis` extensions to enable the pgvector/PostGIS paths.
 */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/**
 * Lazily creates a singleton Drizzle client backed by `node-postgres`.
 *
 * @throws When `DATABASE_URL` is not set — call `isDatabaseConfigured()` first
 * if the caller can fall back to memory.
 */
export async function getDb(): Promise<Database> {
  if (!isDatabaseConfigured()) {
    throw new Error(
      "DATABASE_URL is not configured. Set it to enable PostgreSQL persistence.",
    );
  }

  if (globalForDb.__ngetagDb && globalForDb.__ngetagPool) {
    return globalForDb.__ngetagDb;
  }

  const [{ drizzle }, { Pool: PgPool }] = await Promise.all([
    import("drizzle-orm/node-postgres"),
    import("pg"),
  ]);

  const pool = new PgPool({
    connectionString: process.env.DATABASE_URL,
    max: Number(process.env.DATABASE_POOL_MAX ?? 5),
    ...(process.env.DATABASE_SSL === "true"
      ? { ssl: { rejectUnauthorized: false } }
      : {}),
  });

  const db = drizzle({ client: pool });

  // Reuse across hot reloads in development.
  globalForDb.__ngetagPool = pool;
  globalForDb.__ngetagDb = db;

  return db;
}

/** Closes the shared pool (used by scripts and tests). */
export async function closeDb(): Promise<void> {
  if (globalForDb.__ngetagPool) {
    await globalForDb.__ngetagPool.end();
    globalForDb.__ngetagPool = undefined;
    globalForDb.__ngetagDb = undefined;
  }
}
