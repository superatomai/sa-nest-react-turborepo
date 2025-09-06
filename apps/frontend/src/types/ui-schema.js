import { z } from "zod";
// Base component props schema
const ComponentPropsSchema = z.object({
    className: z.string().optional(),
    style: z.record(z.string(), z.unknown()).optional(),
    onClick: z.string().optional(),
}).passthrough();
// Query schema for data fetching
const QuerySchema = z.object({
    id: z.string().min(1).optional(),
    graphql: z.string().min(1).optional(),
    vars: z.record(z.string(), z.unknown()).optional(),
}).optional();
// UI Component schema with proper recursive typing
export const UIComponentSchema = z.lazy(() => z.object({
    id: z.string().min(1), // Ensure non-empty string
    type: z.string().min(1), // Component type (div, button, etc.)
    props: ComponentPropsSchema.optional(),
    children: z.array(z.union([UIComponentSchema, z.string()])).optional(),
    query: QuerySchema,
    dataPath: z.string().optional(), // JSONPath-style data access
    binding: z.string().optional(), // Data binding identifier
}));
// UI Schema for database storage
export const UISchemaSchema = z.object({
    id: z.string().min(1),
    userId: z.string().min(1),
    uiId: z.string().min(1),
    name: z.string().min(1),
    component: UIComponentSchema,
    createdAt: z.date(),
    updatedAt: z.date(),
});
