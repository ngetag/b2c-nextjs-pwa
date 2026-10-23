import 'dotenv/config';
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      "postgresql://ap_admin:ap_secret@localhost:5432/ngetag",
  },
  verbose: true,
});
