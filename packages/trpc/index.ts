import * as dotenv from 'dotenv';

// Load environment variables from root directory first
dotenv.config({ path: '../../.env' });

import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { TrpcService } from '../../apps/backend/src/trpc/trpc.service';
import { UiGenerationService } from '../../apps/backend/src/services/ui-generation.service';
import { LlmService } from '../../apps/backend/src/services/llm.service';
import { WebSocketManagerService } from '../../apps/backend/src/services/websocket-manager.service';
import { ProjectSchemaCacheService } from '../../apps/backend/src/services/project-schema-cache.service';
import { INestApplication } from '@nestjs/common';
import { ProjectsService } from '../../apps/backend/src/projects/projects.service';
import { UisService } from '../../apps/backend/src/uis/uis.service';
import { VersionsService } from '../../apps/backend/src/uis/versions.service';

const t = initTRPC.context<{
	req: any;
	nestApp: INestApplication;
	user?: { id: string }
}>().create();

// Initialize services
const webSocketManagerService = new WebSocketManagerService();
const projectSchemaCacheService = new ProjectSchemaCacheService(webSocketManagerService);
const llmService = new LlmService(projectSchemaCacheService);
const uiGenerationService = new UiGenerationService(llmService, webSocketManagerService);
const trpcService = new TrpcService(uiGenerationService);

// Input schemas for UI generation
const GenerateUIInputSchema = z.object({
	prompt: z.string().min(1, 'Prompt is required'),
	projectId: z.string().min(1, 'Project ID is required'),
	currentSchema: z.any().optional(), // T_UI_Component schema would go here
});

// Response schema
const GenerateUIResponseSchema = z.object({
	success: z.boolean(),
	data: z.object({
		ui: z.any(), // T_UI_Component schema would go here
		data: z.record(z.string(), z.any()),
	}).optional(),
	metadata: z.object({
		projectId: z.string(),
		originalPrompt: z.string(),
		graphqlQuery: z.string(),
		graphqlVariables: z.record(z.string(), z.any()).optional(),
		executionTime: z.number(),
	}).optional(),
	error: z.string().optional(),
});



export const appRouter = t.router({
	hello: t.procedure
		.input(z.object({ name: z.string() }))
		.query(({ input }) => ({ greeting: `Hello, ${input.name}!` })),
	generateUI: t.procedure
		.input(GenerateUIInputSchema)
		.mutation(async ({ input }) => {
			return await trpcService.generateUI({
				prompt: input.prompt,
				projectId: input.projectId,
				currentSchema: input.currentSchema
			});
		}),
	// Health check endpoint
	health: t.procedure
		.query(async () => {
			return await trpcService.getHealth();
		}),
	// Stats endpoint  
	status: t.procedure
		.query(async () => {
			return await trpcService.getStatus();
		}),

	// Project CRUD Operations
	projectsGetAll: t.procedure
  .input(
    z.object({
      orgId: z.string(),
      limit: z.number().optional(),
      skip: z.number().optional(),
    })
  )
  .query(async ({ input, ctx }) => {
    const projectsService = ctx.nestApp.get(ProjectsService);
    const userForService = ctx.user ? { id: ctx.user.id } as any : undefined;
    return projectsService.getAllProjects(input.orgId, userForService, input.limit, input.skip);
  }),

	projectsGetById: t.procedure
		.input(z.object({
			id: z.number().int().positive(),
			orgId: z.string().min(1)
		}))
		.query(async ({ input, ctx }) => {
			const projectsService = ctx.nestApp.get(ProjectsService);
			const userForService = ctx.user ? { id: ctx.user.id } as any : undefined;
			return projectsService.getProjectById(input.id, input.orgId, userForService);
		}),

	projectsCreate: t.procedure
		.input(z.object({
			name: z.string().min(1, 'Project name is required').max(255),
			description: z.string().optional(),
			orgId: z.string().min(1, 'Organization ID is required')
		}))
		.mutation(async ({ input, ctx }) => {
			const projectsService = ctx.nestApp.get(ProjectsService);
			const userForService = ctx.user ? { id: ctx.user.id } as any : undefined;
			return projectsService.createProject(input, userForService);
		}),

	projectsUpdate: t.procedure
		.input(z.object({
			id: z.number().int().positive(),
			orgId: z.string().min(1, 'Organization ID is required'),
			name: z.string().min(1).max(255).optional(),
			description: z.string().optional()
		}))
		.mutation(async ({ input, ctx }) => {
			const projectsService = ctx.nestApp.get(ProjectsService);
			const userForService = ctx.user ? { id: ctx.user.id } as any : undefined;
			const { id, orgId, ...updateData } = input;
			return projectsService.updateProject(id, updateData, orgId, userForService);
		}),

	projectsDelete: t.procedure
		.input(z.object({
			id: z.number().int().positive(),
			orgId: z.string().min(1, 'Organization ID is required')
		}))
		.mutation(async ({ input, ctx }) => {
			const projectsService = ctx.nestApp.get(ProjectsService);
			const userForService = ctx.user ? { id: ctx.user.id } as any : undefined;
			return projectsService.deleteProject(input.id, input.orgId, userForService);
		}),

	// UI CRUD Operations
	uisGetAll: t.procedure
		.input(z.object({
			projectId: z.number().int().positive().optional(),
			orgId: z.string().optional(),
			where: z.record(z.string(), z.any()).optional(),
			orderBy: z.record(z.string(), z.enum(['asc', 'desc'])).optional(),
			limit: z.number().int().positive().optional(),
			skip: z.number().int().min(0).optional(),
		}))
		.query(async ({ input, ctx }) => {
			const uisService = ctx.nestApp.get(UisService);
			const userForService = ctx.user ? { id: ctx.user.id } as any : undefined;
			return uisService.getAllUis(input, userForService);
		}),

	uisGetById: t.procedure
		.input(z.object({
			id: z.number().int().positive()
		}))
		.query(async ({ input, ctx }) => {
			const uisService = ctx.nestApp.get(UisService);
			const userForService = ctx.user ? { id: ctx.user.id } as any : undefined;
			return uisService.getUiById(input.id, userForService);
		}),

	uisCreate: t.procedure
		.input(z.object({
			uiId: z.string().min(1, 'UI ID is required'),
			uiVersion: z.number().int().positive(),
			name: z.string().min(1, 'UI name is required').max(255),
			description: z.string().optional(),
			projectId: z.number().int().positive()
		}))
		.mutation(async ({ input, ctx }) => {
			const uisService = ctx.nestApp.get(UisService);
			const userForService = ctx.user ? { id: ctx.user.id } as any : undefined;
			return uisService.createUi(input, userForService);
		}),

	uisUpdate: t.procedure
		.input(z.object({
			id: z.number().int().positive(),
			name: z.string().min(1).max(255).optional(),
			description: z.string().optional(),
			published: z.boolean().optional(),
			uiVersion: z.number().int().positive().optional()
		}))
		.mutation(async ({ input, ctx }) => {
			const uisService = ctx.nestApp.get(UisService);
			const userForService = ctx.user ? { id: ctx.user.id } as any : undefined;
			const { id, ...updateData } = input;
			return uisService.updateUi(id, updateData, userForService);
		}),

	uisDelete: t.procedure
		.input(z.object({
			id: z.number().int().positive()
		}))
		.mutation(async ({ input, ctx }) => {
			const uisService = ctx.nestApp.get(UisService);
			const userForService = ctx.user ? { id: ctx.user.id } as any : undefined;
			return uisService.deleteUi(input.id, userForService);
		}),

	// Version CRUD Operations
	versionsGetAll: t.procedure
		.input(z.object({
			uiId: z.string().optional(),
			where: z.record(z.string(), z.any()).optional(),
			orderBy: z.record(z.string(), z.enum(['asc', 'desc'])).optional(),
			limit: z.number().int().positive().optional(),
			skip: z.number().int().min(0).optional(),
		}))
		.query(async ({ input, ctx }) => {
			const versionsService = ctx.nestApp.get(VersionsService);
			const userForService = ctx.user ? { id: ctx.user.id } as any : undefined;
			return versionsService.getAllVersions(input, userForService);
		}),

	versionsGetById: t.procedure
		.input(z.object({
			id: z.number().int().positive()
		}))
		.query(async ({ input, ctx }) => {
			const versionsService = ctx.nestApp.get(VersionsService);
			const userForService = ctx.user ? { id: ctx.user.id } as any : undefined;
			return versionsService.getVersionById(input.id, userForService);
		}),

	versionsGetByUiAndVersion: t.procedure
		.input(z.object({
			uiId: z.string().min(1, 'UI ID is required'),
			versionId: z.number().int().positive()
		}))
		.query(async ({ input, ctx }) => {
			const versionsService = ctx.nestApp.get(VersionsService);
			const userForService = ctx.user ? { id: ctx.user.id } as any : undefined;
			return versionsService.getVersionByUiAndVersion(input.uiId, input.versionId, userForService);
		}),

	versionsGetLatestForUi: t.procedure
		.input(z.object({
			uiId: z.string().min(1, 'UI ID is required')
		}))
		.query(async ({ input, ctx }) => {
			const versionsService = ctx.nestApp.get(VersionsService);
			const userForService = ctx.user ? { id: ctx.user.id } as any : undefined;
			return versionsService.getLatestVersionForUi(input.uiId, userForService);
		}),

	versionsCreate: t.procedure
		.input(z.object({
			uiId: z.string().min(1, 'UI ID is required'),
			dsl: z.any(),
			prompt: z.string().min(1, 'Prompt is required')
		}))
		.mutation(async ({ input, ctx }) => {
			const versionsService = ctx.nestApp.get(VersionsService);
			const userForService = ctx.user ? { id: ctx.user.id } as any : undefined;
			return versionsService.createVersion(input, userForService);
		}),

	versionsUpdate: t.procedure
		.input(z.object({
			id: z.number().int().positive(),
			dsl: z.any().optional(),
			prompt: z.string().min(1).optional()
		}))
		.mutation(async ({ input, ctx }) => {
			const versionsService = ctx.nestApp.get(VersionsService);
			const userForService = ctx.user ? { id: ctx.user.id } as any : undefined;
			const { id, ...updateData } = input;
			return versionsService.updateVersion(id, updateData, userForService);
		}),

	versionsDelete: t.procedure
		.input(z.object({
			id: z.number().int().positive()
		}))
		.mutation(async ({ input, ctx }) => {
			const versionsService = ctx.nestApp.get(VersionsService);
			const userForService = ctx.user ? { id: ctx.user.id } as any : undefined;
			return versionsService.deleteVersion(input.id, userForService);
		}),

	versionsGetStats: t.procedure
		.input(z.object({
			uiId: z.string().optional()
		}))
		.query(async ({ input, ctx }) => {
			const versionsService = ctx.nestApp.get(VersionsService);
			const userForService = ctx.user ? { id: ctx.user.id } as any : undefined;
			return versionsService.getVersionStats(input.uiId, userForService);
		}),
});
