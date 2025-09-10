import * as dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { INestApplication } from "@nestjs/common";
// import type { User } from '@clerk/backend';

// Import service types for DI
import { TrpcService } from "../../apps/backend/src/trpc/trpc.service";
import { ProjectsService } from "../../apps/backend/src/projects/projects.service";
import { UisService } from "../../apps/backend/src/uis/uis.service";
import { VersionsService } from "../../apps/backend/src/uis/versions.service";
import { UiDataService } from "../../apps/backend/src/services/ui-data.service";
import { UiUtilsService } from "../../apps/backend/src/services/ui-utils.service";
import  { UiListService }  from "../../apps/backend/src/ui_list/ui_list.service";
import { DocsService } from "../../apps/backend/src/docs/docs.service";

// packages/trpc/index.ts
export type User = {
  id: string;
  email?: string;
  roles?: string[];
};

const t = initTRPC
  .context<{
    req: any;
    res?: any;
    nestApp: INestApplication;
    user?: User; // use the custom User type
  }>()
  .create();

// ------------------
// Input / Response Schemas
// ------------------
const GenerateUIInputSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  projectId: z.string().min(1, "Project ID is required"),
  currentSchema: z.any().optional(),
});

const GenerateUIResponseSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      ui: z.any(),
      data: z.record(z.string(), z.any()),
    })
    .optional(),
  metadata: z
    .object({
      projectId: z.string(),
      originalPrompt: z.string(),
      graphqlQuery: z.string(),
      graphqlVariables: z.record(z.string(), z.any()).optional(),
      executionTime: z.number(),
    })
    .optional(),
  error: z.string().optional(),
});

// ------------------
// TRPC Router
// ------------------
export const appRouter = t.router({
  hello: t.procedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => ({ greeting: `Hello, ${input.name}!` })),

  // Project CRUD Operations

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

  // ----------------
  // UI Generation with SSE
  // ----------------
  generateUISSE: t.procedure
    .input(GenerateUIInputSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.res) {
        throw new Error("Response object is required for SSE");
      }

      const trpcService = ctx.nestApp.get(TrpcService);
      await trpcService.generateUISSE(
        {
          prompt: input.prompt,
          projectId: input.projectId,
          currentSchema: input.currentSchema,
        },
        ctx.res
      );

      // Return null since SSE handles the response
      return null;
    }),

  healthSSE: t.procedure.query(async ({ ctx }) => {
    const trpcService = ctx.nestApp.get(TrpcService);
    return trpcService.getHealthSSE();
  }),

  statusSSE: t.procedure.query(async ({ ctx }) => {
    const trpcService = ctx.nestApp.get(TrpcService);
    return trpcService.getStatusSSE();
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
    .input(
      z.object({
        orgId: z.string(),
        limit: z.number().default(8), // default page size
        skip: z.number().default(0), // default offset
      })
    )
    .query(async ({ input, ctx }) => {
      const projectsService = ctx.nestApp.get(ProjectsService);
      const userForService = ctx.user
        ? ({ id: ctx.user.id } as any)
        : undefined;

      return projectsService.getAllProjects(
        input.orgId,
        userForService,
        input.limit,
        input.skip
      );
    }),

  projectsGetById: t.procedure
    .input(z.object({ id: z.number().int().positive(), orgId: z.string() }))
    .query(async ({ input, ctx }) => {
      const service = ctx.nestApp.get(ProjectsService);
      return service.getProjectById(input.id, input.orgId, ctx.user);
    }),

  projectsCreate: t.procedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        orgId: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const service = ctx.nestApp.get(ProjectsService);
      return service.createProject(input, ctx.user);
    }),

  projectWithDocsAndUi: t.procedure
    .input(
      z.object({
        projId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const projectsService = ctx.nestApp.get(ProjectsService);
      const userForService = ctx.user
        ? ({ id: ctx.user.id } as any)
        : undefined;

      return projectsService.getProjectWithDocsAndUi(
        input.projId,
        userForService
      );
    }),

  projectsDelete: t.procedure
    .input(
      z.object({ id: z.number().int().positive(), orgId: z.string().min(1) })
    )
    .mutation(async ({ input, ctx }) => {
      const service = ctx.nestApp.get(ProjectsService);
      return service.deleteProject(input.id, input.orgId, ctx.user);
    }),

  projectsUpdate: t.procedure
    .input(
      z.object({
        id: z.number().int().positive(),
        data: z.object({
          name: z.string().min(1).max(255).optional(),
          description: z.string().optional(),
        }),
        orgId: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const service = ctx.nestApp.get(ProjectsService);
      return service.updateProject(input.id, input.data, input.orgId, ctx.user);
    }),

  // ----------------
  // UIs CRUD
  // ----------------
  uisGetAll: t.procedure
    .input(
      z.object({
        projectId: z.number().int().optional(),
        uiId: z.string().optional(),
        orgId: z.string().optional(),
        where: z.record(z.string(), z.any()).optional(),
        orderBy: z.record(z.string(), z.enum(["asc", "desc"])).optional(),
        limit: z.number().int().optional(),
        skip: z.number().int().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const service = ctx.nestApp.get(UisService);
      return service.getAllUis(input, ctx.user);
    }),
  uisDelete: t.procedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      const service = ctx.nestApp.get(UisService);
      return service.deleteUi(input.id, ctx.user);
    }),

  uisGetById: t.procedure
    .input(z.object({ id: z.string().min(1) })) // nanoid is string
    .query(async ({ input, ctx }) => {
      const service = ctx.nestApp.get(UisService);
      return service.getUiById(input.id, ctx.user);
    }),

  uisCreate: t.procedure
    .input(
      z.object({
        uiId: z.string().min(1),
        name: z.string().min(1),
        uiVersion: z.number().int().positive(),
        description: z.string().optional(),
        projectId: z.number().int().positive(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const service = ctx.nestApp.get(UisService);
      return service.createUi(input, ctx.user);
    }),

  uisUpdate: t.procedure
    .input(
      z.object({
        id: z.number().int().positive(),
        name: z.string().optional(),
        description: z.string().optional(),
        published: z.boolean().optional(),
        uiVersion: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const service = ctx.nestApp.get(UisService);
      const { id, ...data } = input;
      return service.updateUi(id, data, ctx.user);
    }),

  // ----------------
  // Versions CRUD
  // ----------------
  versionsGetAll: t.procedure
    .input(
      z.object({
        uiId: z.string().optional(),
        where: z.record(z.string(), z.any()).optional(),
        orderBy: z.record(z.string(), z.enum(["asc", "desc"])).optional(),
        limit: z.number().int().optional(),
        skip: z.number().int().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const service = ctx.nestApp.get(VersionsService);
      return service.getAllVersions(input, ctx.user);
    }),

  versionsCreate: t.procedure
    .input(
      z.object({
        uiId: z.string().min(1),
        dsl: z.any(),
        prompt: z.string().min(1),
      })
    )
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
    .input(
      z.object({
        input: z.string().min(1),
        dsl: z.any(),
        uiId: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const service = ctx.nestApp.get(UiUtilsService);
      return service.uploadNewUIVersion(input);
    }),

    // ----------------
    // UI_List CRUD
    // ----------------
    getUiList: t.procedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const uiListService = ctx.nestApp.get(UiListService);
      const userForService = ctx.user ? { id: ctx.user.id } as any : undefined;

      return uiListService.getUiList(input.id, userForService);
    }),

  createUiList: t.procedure
    .input(
      z.object({
        projId: z.number(),
        uiList: z.array(z.any()), // array of items for UI list
      })
    )
    .mutation(async ({ input, ctx }) => {
      const uiListService = ctx.nestApp.get(UiListService);
      const userForService = ctx.user ? { id: ctx.user.id } as any : undefined;

      return uiListService.createUiList(
        { uiList: input.uiList },
        input.projId,
        userForService
      );
    }),

  updateUiList: t.procedure
    .input(
      z.object({
        id: z.number(),
        uiList: z.array(z.any()), // updated UI list array
      })
    )
    .mutation(async ({ input, ctx }) => {
      const uiListService = ctx.nestApp.get(UiListService);
      const userForService = ctx.user ? { id: ctx.user.id } as any : undefined;

      return uiListService.updateUiList(
        { id: input.id, uiList: input.uiList },
        userForService
      );
    }),

  // ----------------
  // Docs CRUD
  // ----------------
  getDocs: t.procedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const docsService = ctx.nestApp.get(DocsService);
      const userForService = ctx.user ? { id: ctx.user.id } as any : undefined;

      return docsService.getDocs(input.id, userForService);
    }),

  // Create a new doc and attach to a project
  createDocs: t.procedure
    .input(
      z.object({
        projId: z.number(),
        docs: z.array(z.any()), // adapt type as needed
      })
    )
    .mutation(async ({ input, ctx }) => {
      const docsService = ctx.nestApp.get(DocsService);
      const userForService = ctx.user ? { id: ctx.user.id } as any : undefined;

      return docsService.createDocs(
        { docs: input.docs },
        input.projId,
        userForService
      );
    }),

  // Update an existing doc
  updateDocs: t.procedure
    .input(
      z.object({
        id: z.number(),
        docs: z.array(z.any()), // adapt type as needed
      })
    )
    .mutation(async ({ input, ctx }) => {
      const docsService = ctx.nestApp.get(DocsService);
      const userForService = ctx.user ? { id: ctx.user.id } as any : undefined;

      return docsService.updateDocs(
        { id: input.id, docs: input.docs },
        userForService
      );
    }),
  
});

export type AppRouter = typeof appRouter;
