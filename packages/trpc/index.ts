import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();

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
      // This will be implemented when the tRPC router is connected to NestJS services
      // For now, return a placeholder response
      return {
        success: true,
        data: {
          ui: {
            id: 'placeholder',
            type: 'div',
            children: [`Generated UI for: ${input.prompt}`],
          },
          data: {}
        },
        metadata: {
          projectId: input.projectId,
          originalPrompt: input.prompt,
          graphqlQuery: 'placeholder query',
          executionTime: Date.now()
        }
      };
    }),

  // Health check endpoint
  health: t.procedure
    .query(() => ({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    })),
});

export type AppRouter = typeof appRouter;
