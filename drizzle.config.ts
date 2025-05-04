import { defineConfig } from "drizzle-kit";

// Default to localhost if no DATABASE_URL is provided
const DATABASE_URL = process.env.DATABASE_URL || 'mysql://rudraksh_admin:Kshsrm@1@localhost:3306/APPOINTMENT_BOOKING';

export default defineConfig({
  out: "./db/migrations",
  schema: "./shared/schema.ts",
  dialect: "mysql",
  dbCredentials: {
    url: DATABASE_URL,
  },
  verbose: true,
});
