import type { Config } from "drizzle-kit";

export default {
  schema: "./drizzle/schema.ts",     // your schema file
  out: "./drizzle/migrations",       // put migrations inside migrations folder
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,  
  },
  verbose: true,                     
  strict: true,                    
} satisfies Config;
