import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { INestApplication } from '@nestjs/common';
// import type { User } from '@clerk/backend';

// Import service types for DI
import { TrpcService } from '../../apps/backend/src/trpc/trpc.service';
import { ProjectsService } from '../../apps/backend/src/projects/projects.service';
import { UisService } from '../../apps/backend/src/uis/uis.service';
import { VersionsService } from '../../apps/backend/src/uis/versions.service';
import { UiDataService } from '../../apps/backend/src/services/ui-data.service';
import { UiUtilsService } from '../../apps/backend/src/services/ui-utils.service';
import { TrpcSSEService } from '../../apps/backend/src/trpc/trpc-sse.service';

// ------------------
// Setup TRPC context
// -----------------

// packages/trpc/index.ts
export type User = {
  id: string;
  email?: string;
  roles?: string[];
};

const t = initTRPC.context<{
  req: any;
  res?: any;
  nestApp: INestApplication;
  user?:User ; // use the custom User type
}>().create();

// ------------------
// Input / Response Schemas
// ------------------
const GenerateUIInputSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  projectId: z.string().min(1, 'Project ID is required'),
  currentSchema: z.any().optional(),
});

const GenerateUIResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    ui: z.any(),
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

// ------------------
// TRPC Router
// ------------------
export const appRouter = t.router({
  hello: t.procedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => ({ greeting: `Hello, ${input.name}!` })),

  // ----------------
  // UI Generation
  // ----------------
  generateUI: t.procedure
    .input(GenerateUIInputSchema)
    .mutation(async ({ input, ctx }) => {
      const trpcService = ctx.nestApp.get(TrpcService);
      return trpcService.generateUI({
        prompt: input.prompt,
        projectId: input.projectId,
        currentSchema: input.currentSchema,
      });
    }),

  health: t.procedure.query(async ({ ctx }) => {
    const trpcService = ctx.nestApp.get(TrpcService);
    return trpcService.getHealth();
  }),

  status: t.procedure.query(async ({ ctx }) => {
    const trpcService = ctx.nestApp.get(TrpcService);
    return trpcService.getStatus();
  }),

  // ----------------
  // Projects CRUD
  // ----------------
  projectsGetAll: t.procedure
    .input(z.object({ orgId: z.string() }))
    .query(async ({ input, ctx }) => {
      const service = ctx.nestApp.get(ProjectsService);
      return service.getAllProjects(input.orgId, ctx.user);
    }),

  projectsGetById: t.procedure
    .input(z.object({ id: z.number().int().positive(), orgId: z.string() }))
    .query(async ({ input, ctx }) => {
      const service = ctx.nestApp.get(ProjectsService);
      return service.getProjectById(input.id, input.orgId, ctx.user);
    }),

  projectsCreate: t.procedure
    .input(z.object({ name: z.string().min(1).max(255), description: z.string().optional(), orgId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const service = ctx.nestApp.get(ProjectsService);
      return service.createProject(input, ctx.user);
    }),

  // ----------------
  // UIs CRUD
  // ----------------
  uisGetAll: t.procedure
    .input(z.object({
      projectId: z.number().int().optional(),
      uiId: z.string().optional(),
      orgId: z.string().optional(),
      where: z.record(z.string(), z.any()).optional(),
      orderBy: z.record(z.string(), z.enum(['asc', 'desc'])).optional(),
      limit: z.number().int().optional(),
      skip: z.number().int().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const service = ctx.nestApp.get(UisService);
      return service.getAllUis(input, ctx.user);
    }),

  uisGetById: t.procedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input, ctx }) => {
      const service = ctx.nestApp.get(UisService);
      return service.getUiById(input.id, ctx.user);
    }),

  uisCreate: t.procedure
    .input(z.object({
      uiId: z.string().min(1),
      name: z.string().min(1),
	  uiVersion: z.number().int().positive(),
      description: z.string().optional(),
      projectId: z.number().int().positive(),
    }))
    .mutation(async ({ input, ctx }) => {
      const service = ctx.nestApp.get(UisService);
      return service.createUi(input, ctx.user);
    }),

  uisUpdate: t.procedure
    .input(z.object({
      id: z.number().int().positive(),
      name: z.string().optional(),
      description: z.string().optional(),
      published: z.boolean().optional(),
      uiVersion: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const service = ctx.nestApp.get(UisService);
      const { id, ...data } = input;
      return service.updateUi(id, data, ctx.user);
    }),

  // ----------------
  // Versions CRUD
  // ----------------
  versionsGetAll: t.procedure
    .input(z.object({
      uiId: z.string().optional(),
      where: z.record(z.string(), z.any()).optional(),
      orderBy: z.record(z.string(), z.enum(['asc', 'desc'])).optional(),
      limit: z.number().int().optional(),
      skip: z.number().int().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const service = ctx.nestApp.get(VersionsService);
      return service.getAllVersions(input, ctx.user);
    }),

  versionsCreate: t.procedure
    .input(z.object({
      uiId: z.string().min(1),
      dsl: z.any(),
      prompt: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const service = ctx.nestApp.get(VersionsService);
      return service.createVersion(input, ctx.user);
    }),

  // ----------------
  // UI Data
  // ----------------
  getUIWithData: t.procedure
    .input(z.object({ projectId: z.string().min(1), uiId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const service = ctx.nestApp.get(UiDataService);
      return service.getUIWithData(input, ctx.user);
    }),

  getUISchema: t.procedure
    .input(z.object({ projectId: z.string().min(1), uiId: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      const service = ctx.nestApp.get(UiDataService);
      return service.getUISchema(input);
    }),

  // ----------------
  // UI Utils
  // ----------------
  uploadNewUIVersion: t.procedure
    .input(z.object({ input: z.string().min(1), dsl: z.any(), uiId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const service = ctx.nestApp.get(UiUtilsService);
      return service.uploadNewUIVersion(input);
    }),
});

export type AppRouter = typeof appRouter;
