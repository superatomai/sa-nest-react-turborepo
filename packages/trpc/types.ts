// Types-only export for frontend usage
import { initTRPC } from "@trpc/server";
import { z } from "zod";

// Re-export the User type
export type User = {
  id: string;
  email?: string;
  roles?: string[];
};

// Create a temporary tRPC instance to extract the router type
const t = initTRPC.create();

// Input schemas (duplicated here to avoid backend imports)
const GenerateUIInputSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  projectId: z.string().min(1, "Project ID is required"),
  currentSchema: z.any().optional(),
});

// Mock router for type extraction only - this won't be used at runtime
const mockRouter = t.router({
  hello: t.procedure
    .input(z.object({ name: z.string() }))
    .query(() => ({ greeting: "Hello!" })),

  generateUI: t.procedure
    .input(GenerateUIInputSchema)
    .mutation(() => null),

  generateUISSE: t.procedure
    .input(GenerateUIInputSchema)
    .mutation(() => null),

  healthSSE: t.procedure.query(() => null),
  statusSSE: t.procedure.query(() => null),
  health: t.procedure.query(() => null),
  status: t.procedure.query(() => null),

  projectsGetAll: t.procedure
    .input(z.object({
      orgId: z.string(),
      limit: z.number().default(8),
      skip: z.number().default(0),
    }))
    .query(() => null),

  projectsGetById: t.procedure
    .input(z.object({ id: z.number().int().positive(), orgId: z.string() }))
    .query(() => null),

  projectsCreate: t.procedure
    .input(z.object({
      name: z.string().min(1).max(255),
      description: z.string().optional(),
      orgId: z.string().min(1),
    }))
    .mutation(() => null),

  projectWithDocsAndUi: t.procedure
    .input(z.object({
      projId: z.number(),
    }))
    .query(() => null),

  projectsDelete: t.procedure
    .input(z.object({ id: z.number().int().positive(), orgId: z.string().min(1) }))
    .mutation(() => null),

  projectsUpdate: t.procedure
    .input(z.object({
      id: z.number().int().positive(),
      data: z.object({
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
      }),
      orgId: z.string().min(1),
    }))
    .mutation(() => null),

  // Project Keys CRUD
  projectKeysGetAll: t.procedure
    .input(z.object({
      projectId: z.number().int(),
    }))
    .query(() => null),

  projectKeysCreate: t.procedure
    .input(z.object({
      projectId: z.number().int(),
      name: z.string().min(1).max(255),
      keyValue: z.string().min(1),
      environment: z.string().min(1).max(50),
      customInst: z.string().optional(),
    }))
    .mutation(() => null),

  projectKeysDelete: t.procedure
    .input(z.object({
      keyId: z.number().int(),
    }))
    .mutation(() => null),

  // Design System CRUD
  designSystemGetByProjectId: t.procedure
    .input(z.object({
      projectId: z.number().int().positive(),
      orgId: z.string().min(1),
    }))
    .query(() => null),

  designSystemCreate: t.procedure
    .input(z.object({
      projectId: z.number().int().positive(),
      colors: z.any().optional(),
      typography: z.any().optional(),
      spacing: z.any().optional(),
      borders: z.any().optional(),
      shadows: z.any().optional(),
      buttons: z.any().optional(),
      images: z.any().optional(),
      misc: z.any().optional(),
      designNotes: z.string().optional(),
      orgId: z.string().min(1),
    }))
    .mutation(() => null),

  designSystemUpdate: t.procedure
    .input(z.object({
      projectId: z.number().int().positive(),
      colors: z.any().optional(),
      typography: z.any().optional(),
      spacing: z.any().optional(),
      borders: z.any().optional(),
      shadows: z.any().optional(),
      buttons: z.any().optional(),
      images: z.any().optional(),
      misc: z.any().optional(),
      designNotes: z.string().optional(),
      orgId: z.string().min(1),
    }))
    .mutation(() => null),

  designSystemUpsert: t.procedure
    .input(z.object({
      projectId: z.number().int().positive(),
      colors: z.any().optional(),
      typography: z.any().optional(),
      spacing: z.any().optional(),
      borders: z.any().optional(),
      shadows: z.any().optional(),
      buttons: z.any().optional(),
      images: z.any().optional(),
      misc: z.any().optional(),
      designNotes: z.string().optional(),
      orgId: z.string().min(1),
    }))
    .mutation(() => null),

  designSystemDelete: t.procedure
    .input(z.object({
      projectId: z.number().int().positive(),
      orgId: z.string().min(1),
    }))
    .mutation(() => null),

  uisGetAll: t.procedure
    .input(z.object({
      projectId: z.number().int().optional(),
      uiId: z.string().optional(),
      orgId: z.string().optional(),
      where: z.record(z.string(), z.any()).optional(),
      orderBy: z.record(z.string(), z.enum(["asc", "desc"])).optional(),
      limit: z.number().int().optional(),
      skip: z.number().int().optional(),
    }))
    .query(() => null),

  uisDelete: t.procedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(() => null),

  uisGetById: t.procedure
    .input(z.object({ id: z.string().min(1) }))
    .query(() => null),

  uisCreate: t.procedure
    .input(z.object({
      uiId: z.string().min(1),
      name: z.string().min(1),
      uiVersion: z.number().int().positive(),
      description: z.string().optional(),
      projectId: z.number().int().positive(),
    }))
    .mutation(() => null),

  uisUpdate: t.procedure
    .input(z.object({
      id: z.number().int().positive(),
      name: z.string().optional(),
      description: z.string().optional(),
      published: z.boolean().optional(),
      uiVersion: z.number().optional(),
    }))
    .mutation(() => null),

  versionsGetAll: t.procedure
    .input(z.object({
      uiId: z.string().optional(),
      where: z.record(z.string(), z.any()).optional(),
      orderBy: z.record(z.string(), z.enum(["asc", "desc"])).optional(),
      limit: z.number().int().optional(),
      skip: z.number().int().optional(),
    }))
    .query(() => null),

  versionsCreate: t.procedure
    .input(z.object({
      uiId: z.string().min(1),
      dsl: z.any(),
      prompt: z.string().min(1),
    }))
    .mutation(() => null),

  getUIWithData: t.procedure
    .input(z.object({ projectId: z.string().min(1), uiId: z.string().min(1) }))
    .mutation(() => null),

  getUISchema: t.procedure
    .input(z.object({ projectId: z.string().min(1), uiId: z.string().min(1) }))
    .query(() => null),

  uploadNewUIVersion: t.procedure
    .input(z.object({
      input: z.string().min(1),
      dsl: z.any(),
      uiId: z.string().min(1),
    }))
    .mutation(() => null),

  getUiList: t.procedure
    .input(z.object({ id: z.number() }))
    .query(() => null),

  createUiList: t.procedure
    .input(z.object({
      projId: z.number(),
      uiList: z.array(z.any()),
    }))
    .mutation(() => null),

  updateUiList: t.procedure
    .input(z.object({
      id: z.number(),
      uiList: z.array(z.any()),
    }))
    .mutation(() => null),

  // Docs CRUD
  getDocs: t.procedure
    .input(z.object({ id: z.number() }))
    .query(() => null),

  getDocsByProjectId: t.procedure
    .input(z.object({ projectId: z.number() }))
    .query(() => null),

  createDocs: t.procedure
    .input(z.object({
      projId: z.number(),
      apiDocs: z.any(),
    }))
    .mutation(() => null),

  updateDocs: t.procedure
    .input(z.object({
      id: z.number(),
      apiDocs: z.any(),
    }))
    .mutation(() => null),

  updateDocsByProjectId: t.procedure
    .input(z.object({
      projectId: z.number(),
      apiDocs: z.any(),
    }))
    .mutation(() => null),

  deleteDocsByProjectId: t.procedure
    .input(z.object({
      projectId: z.number(),
    }))
    .mutation(() => null),

  upsertDocs: t.procedure
    .input(z.object({
      projectId: z.number(),
      apiDocs: z.any(),
    }))
    .mutation(() => null),

  // WebSocket Logs - Create
  createWsLog: t.procedure
    .input(z.object({
      projectId: z.number(),
      message: z.string().optional(),
      timestamp: z.union([z.string(), z.number(), z.date()]),
      log: z.any(),
    }))
    .mutation(() => null),

  // WebSocket Logs - Get paginated logs for project
  getWsLogsPaginated: t.procedure
    .input(z.object({
      projectId: z.number(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(8),
    }))
    .query(() => null),

  // WebSocket Logs - Get latest logs for project
  getLatestWsLogs: t.procedure
    .input(z.object({
      projectId: z.number(),
      limit: z.number().min(1).max(50).default(8),
    }))
    .query(() => null),

  // WebSocket Logs - Delete all logs for project
  deleteWsLogsByProject: t.procedure
    .input(z.object({
      projectId: z.number(),
    }))
    .mutation(() => null),

  // WebSocket Logs - Delete old logs
  deleteOldWsLogs: t.procedure
    .input(z.object({
      projectId: z.number(),
      daysToKeep: z.number().min(1).default(7),
    }))
    .mutation(() => null),
});

export type AppRouter = typeof mockRouter;