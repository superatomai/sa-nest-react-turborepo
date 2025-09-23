import { pgTable, serial, text, timestamp, boolean, varchar, integer, foreignKey, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"


export const page = pgTable("Page", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
});

export const versions = pgTable("versions", {
	id: serial().primaryKey().notNull(),
	dsl: text().notNull(),
	prompt: text().notNull(),
	createdAt: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	deleted: boolean().default(false).notNull(),
	createdBy: varchar("created_by"),
	updatedBy: varchar("updated_by"),
	uiId: varchar("ui_id").notNull(),
	versionId: integer("version_id").default(1).notNull(),
});

export const prismaMigrations = pgTable("_prisma_migrations", {
	id: varchar({ length: 36 }).primaryKey().notNull(),
	checksum: varchar({ length: 64 }).notNull(),
	finishedAt: timestamp("finished_at", { withTimezone: true, mode: 'string' }),
	migrationName: varchar("migration_name", { length: 255 }).notNull(),
	logs: text(),
	rolledBackAt: timestamp("rolled_back_at", { withTimezone: true, mode: 'string' }),
	startedAt: timestamp("started_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	appliedStepsCount: integer("applied_steps_count").default(0).notNull(),
});

export const docs = pgTable("docs",{
	id: serial().primaryKey().notNull(),
	createdAt: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	deleted: boolean().default(false).notNull(),
	createdBy: varchar("created_by"),
	updatedBy: varchar("updated_by"),
	docs: jsonb("docs").notNull().$type<any[]>(),
	version: integer("version").notNull(),
});

export const uiList = pgTable("ui_list",{
	id: serial().primaryKey().notNull(),
	createdAt: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	deleted: boolean().default(false).notNull(),
	createdBy: varchar("created_by"),
	updatedBy: varchar("updated_by"),
	uiList: jsonb("ui_list").notNull().$type<any[]>(),
	version: integer("version").notNull(),
}
);

export const projects = pgTable("projects", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { precision: 6,  withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { precision: 6,  withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	globalInst: text("global_inst"),
	deleted: boolean().default(false).notNull(),
	orgId: varchar("org_id", { length: 255 }).notNull(),
	createdBy: varchar("created_by"),
	updatedBy: varchar("updated_by"),
	docs: integer("docs"),
	uiList: integer("ui_list"),
}, (table) => [
	foreignKey({
		columns: [table.docs],
		foreignColumns: [docs.id],
		name: "projects_docs_fkey"
	}).onUpdate("cascade").onDelete("restrict"),

	foreignKey({
		columns: [table.uiList],
		foreignColumns: [uiList.id],
		name: "projects_ui_list_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
	
]);

export const projectKeys = pgTable("project_keys", {
	id: serial().primaryKey().notNull(),
	projectId: integer("project_id").notNull(),
	name: varchar("name",{ length: 255 }).notNull(),
	keyValue: text("key_value").notNull(),
	environment: varchar("environment",{ length: 50 }),
	isActive: boolean("is_active").default(true).notNull(),
	deleted: boolean().default(false).notNull(),
	customInst: text("custom_inst"),
	createdBy: varchar("created_by"),
	updatedBy: varchar("updated_by"),
	createdAt: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "project_keys_project_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);


export const designSystem = pgTable("design_system", {
    id: serial('id').primaryKey().notNull(),
    projectId: integer("project_id").notNull(),
    colors: jsonb("colors"),
    typography: jsonb("typography"),
    spacing: jsonb("spacing"),
    borders: jsonb("borders"),
    shadows: jsonb("shadows"),
    buttons: jsonb("buttons"),
    images: jsonb("images"),
    misc: jsonb("misc"),
    designNotes: text("design_notes"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
  }, (table) => [  // <-- Direct array, no return needed
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: "design_system_project_id_fkey"
    }).onUpdate("cascade").onDelete("restrict")
  ]);



export const uis = pgTable("uis", {
	id: serial().primaryKey().notNull(),
	projectId: integer("project_id").notNull(),
	createdAt: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	published: boolean().default(false).notNull(),
	uiId: varchar("ui_id").notNull(),
	deleted: boolean().default(false).notNull(),
	createdBy: varchar("created_by"),
	updatedBy: varchar("updated_by"),
	uiVersion: integer("ui_version").notNull(),
	description: text(),
	name: varchar({ length: 255 }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "uis_project_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);
