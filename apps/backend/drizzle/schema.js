"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uis = exports.projects = exports.prismaMigrations = exports.versions = exports.page = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.page = (0, pg_core_1.pgTable)("Page", {
    id: (0, pg_core_1.serial)().primaryKey().notNull(),
    name: (0, pg_core_1.text)().notNull(),
});
exports.versions = (0, pg_core_1.pgTable)("versions", {
    id: (0, pg_core_1.serial)().primaryKey().notNull(),
    dsl: (0, pg_core_1.text)().notNull(),
    prompt: (0, pg_core_1.text)().notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { precision: 6, withTimezone: true, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    deleted: (0, pg_core_1.boolean)().default(false).notNull(),
    createdBy: (0, pg_core_1.varchar)("created_by"),
    updatedBy: (0, pg_core_1.varchar)("updated_by"),
    uiId: (0, pg_core_1.varchar)("ui_id").notNull(),
    versionId: (0, pg_core_1.integer)("version_id").default(1).notNull(),
});
exports.prismaMigrations = (0, pg_core_1.pgTable)("_prisma_migrations", {
    id: (0, pg_core_1.varchar)({ length: 36 }).primaryKey().notNull(),
    checksum: (0, pg_core_1.varchar)({ length: 64 }).notNull(),
    finishedAt: (0, pg_core_1.timestamp)("finished_at", { withTimezone: true, mode: 'string' }),
    migrationName: (0, pg_core_1.varchar)("migration_name", { length: 255 }).notNull(),
    logs: (0, pg_core_1.text)(),
    rolledBackAt: (0, pg_core_1.timestamp)("rolled_back_at", { withTimezone: true, mode: 'string' }),
    startedAt: (0, pg_core_1.timestamp)("started_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    appliedStepsCount: (0, pg_core_1.integer)("applied_steps_count").default(0).notNull(),
});
exports.projects = (0, pg_core_1.pgTable)("projects", {
    id: (0, pg_core_1.serial)().primaryKey().notNull(),
    name: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    description: (0, pg_core_1.text)(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { precision: 6, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { precision: 6, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    deleted: (0, pg_core_1.boolean)().default(false).notNull(),
    orgId: (0, pg_core_1.varchar)("org_id", { length: 255 }).notNull(),
    createdBy: (0, pg_core_1.varchar)("created_by"),
    updatedBy: (0, pg_core_1.varchar)("updated_by"),
});
exports.uis = (0, pg_core_1.pgTable)("uis", {
    id: (0, pg_core_1.serial)().primaryKey().notNull(),
    projectId: (0, pg_core_1.integer)("project_id").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { precision: 6, withTimezone: true, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    published: (0, pg_core_1.boolean)().default(false).notNull(),
    uiId: (0, pg_core_1.varchar)("ui_id").notNull(),
    deleted: (0, pg_core_1.boolean)().default(false).notNull(),
    createdBy: (0, pg_core_1.varchar)("created_by"),
    updatedBy: (0, pg_core_1.varchar)("updated_by"),
    uiVersion: (0, pg_core_1.integer)("ui_version").notNull(),
    description: (0, pg_core_1.text)(),
    name: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.projectId],
        foreignColumns: [exports.projects.id],
        name: "uis_project_id_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
//# sourceMappingURL=schema.js.map