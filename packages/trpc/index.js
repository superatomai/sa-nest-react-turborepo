"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRouter = void 0;
const server_1 = require("@trpc/server");
const zod_1 = require("zod");
const t = server_1.initTRPC.create();
// Input schemas for UI generation
const GenerateUIInputSchema = zod_1.z.object({
    prompt: zod_1.z.string().min(1, 'Prompt is required'),
    projectId: zod_1.z.string().min(1, 'Project ID is required'),
    currentSchema: zod_1.z.any().optional(), // T_UI_Component schema would go here
});
// Response schema
const GenerateUIResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    data: zod_1.z.object({
        ui: zod_1.z.any(), // T_UI_Component schema would go here
        data: zod_1.z.record(zod_1.z.string(), zod_1.z.any()),
    }).optional(),
    metadata: zod_1.z.object({
        projectId: zod_1.z.string(),
        originalPrompt: zod_1.z.string(),
        graphqlQuery: zod_1.z.string(),
        graphqlVariables: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
        executionTime: zod_1.z.number(),
    }).optional(),
    error: zod_1.z.string().optional(),
});
exports.appRouter = t.router({
    hello: t.procedure
        .input(zod_1.z.object({ name: zod_1.z.string() }))
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
//# sourceMappingURL=index.js.map