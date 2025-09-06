import { relations } from "drizzle-orm/relations";
import { projects, uis } from "./schema";

export const uisRelations = relations(uis, ({one}) => ({
	project: one(projects, {
		fields: [uis.projectId],
		references: [projects.id]
	}),
}));

export const projectsRelations = relations(projects, ({many}) => ({
	uis: many(uis),
}));