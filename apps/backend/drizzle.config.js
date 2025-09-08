"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    schema: "./drizzle/schema.ts", // Drizzle tables live
    out: "./drizzle", // migrations folder
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
};
//# sourceMappingURL=drizzle.config.js.map