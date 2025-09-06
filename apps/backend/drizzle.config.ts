import type { Config } from "drizzle-kit";

export default {
  schema: "./drizzle/schema.ts",   // Drizzle tables live
  out: "./drizzle",                // migrations folder
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,  
  },
} satisfies Config;