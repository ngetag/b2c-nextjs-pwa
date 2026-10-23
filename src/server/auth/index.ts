import type { AuthRepository } from "@/lib/auth/types";
import { isDatabaseConfigured } from "@/server/db/client";
import { memoryAuthRepo } from "./memory-auth.repo";

let postgresRepoPromise: Promise<AuthRepository> | null = null;
let seedPromise: Promise<void> | null = null;

async function loadPostgresRepo(): Promise<AuthRepository> {
  if (!postgresRepoPromise) {
    postgresRepoPromise = import("./postgres-auth.repo").then((mod) =>
      mod.createPostgresAuthRepo(),
    );
  }
  return postgresRepoPromise;
}

/**
 * Returns the active auth repository.
 *
 * - With `DATABASE_URL` → PostgreSQL (Drizzle), with the demo account seeded
 *   unless `AUTH_SEED_DEMO=false`.
 * - Without it → in-memory store seeded with the demo account, so the flow
 *   works out of the box in local dev/preview.
 */
export async function getAuthRepo(): Promise<AuthRepository> {
  if (!isDatabaseConfigured()) {
    await memoryAuthRepo.ensureSeeded();
    return memoryAuthRepo;
  }

  const repo = await loadPostgresRepo();
  if (!seedPromise) {
    seedPromise = repo.ensureSeeded().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }
  await seedPromise;
  return repo;
}

/** Reset the memoized repository (tests / scripts). */
export function resetAuthRepoCache(): void {
  postgresRepoPromise = null;
  seedPromise = null;
}
