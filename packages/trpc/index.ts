import * as dotenv from 'dotenv';

// Load environment variables from root directory first
dotenv.config({ path: '../../.env' });

import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { TrpcService } from '../../apps/backend/src/trpc/trpc.service';
import { UiGenerationService } from '../../apps/backend/src/services/ui-generation.service';
import { LlmService } from '../../apps/backend/src/services/llm.service';
import { WebSocketManagerService } from '../../apps/backend/src/services/websocket-manager.service';
import {ProjectSchemaCacheService} from '../../apps/backend/src/services/project-schema-cache.service';
import { INestApplication } from '@nestjs/common';
import { ProjectsService } from '../../apps/backend/src/projects/projects.service';

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

  projectsGetAll: t.procedure
    .input(z.object({ orgId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      console.log('Received input:', input);
    console.log('Input orgId:', input.orgId);
      const projectsService = ctx.nestApp.get(ProjectsService);
      console.log('projectsService?', projectsService);
      const userForService = ctx.user ? { id: ctx.user.id } as any : undefined;

      return projectsService.getAllProjects(input.orgId, userForService);
    }),
});
