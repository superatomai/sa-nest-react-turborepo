import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { INestApplication } from '@nestjs/common';
import { ProjectsService } from '../../apps/backend/src/projects/projects.service';

const t = initTRPC.context<{ 
  req: any; 
  nestApp: INestApplication;
  user?: { id: string } 
}>().create();

export const appRouter = t.router({
  // existing hello route
  hello: t.procedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => ({ greeting: `Hello, ${input.name}!` })),

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


  generateUI: t.procedure
    .input(
      z.object({
        prompt: z.string().min(1, 'Prompt is required'),
        projectId: z.string().min(1, 'Project ID is required'),
        currentSchema: z.any().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      return {
        success: true,
        data: {
          ui: {
            id: 'placeholder',
            type: 'div',
            children: [`Generated UI for: ${input.prompt}`],
          },
          data: {},
        },
        metadata: {
          projectId: input.projectId,
          originalPrompt: input.prompt,
          graphqlQuery: 'placeholder query',
          executionTime: Date.now(),
        },
      };
    }),

  health: t.procedure.query(() => ({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  })),
});

export type AppRouter = typeof appRouter;
