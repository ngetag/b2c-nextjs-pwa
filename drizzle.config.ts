import 'dotenv/config';
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://ap_admin:ap_secret@localhost:5432/ngetag",
  },
  verbose: true,
  extensionsFilters: ['postgis'],
});
