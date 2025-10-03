import { z } from 'zod';

// Expression schema for dynamic values
export const ExpressionSchema = z.object({
    $exp: z.string(),
    $deps: z.array(z.string()).optional(),
});

// Binding schema for data binding
export const BindingSchema = z.object({
    $bind: z.string(),
    $transform: z.array(z.object({
        name: z.string(),
        args: z.array(z.any()).optional(),
    })).optional(),
});

// For directive schema
export const ForDirectiveSchema = z.object({
    in: z.union([ExpressionSchema, BindingSchema, z.string()]),
    as: z.string(),
    key: z.string().optional(),
    index: z.string().optional(),
});

// Query specification schema
export const QuerySpecSchema = z.object({
    graphql: z.string().optional(),
    sql: z.string().optional(),
    variables: z.record(z.string(), z.any()).optional(),
    params: z.record(z.string(), z.any()).optional(),
    key: z.string().optional(),
    refetchPolicy: z.enum(['cache-first', 'network-only', 'cache-and-network']).optional(),
    dependencies: z.array(z.string()).optional(),
});

// UI Element schema using Zod v4 get() method for recursive references
export const UIElementSchema = z.object({
    id: z.string(),
    type: z.string(),
    key: z.union([z.string(), ExpressionSchema]).optional(),
    props: z.record(z.string(), z.any()).optional(),

    // Query specification for data fetching
    query: QuerySpecSchema.optional(),

    // Conditionals - can be either expression or binding
    if: z.union([ExpressionSchema, BindingSchema]).optional(),
    elseIf: z.union([ExpressionSchema, BindingSchema]).optional(),

    // Loops
    for: ForDirectiveSchema.optional(),

    // Navigation link - when clicked/tapped, navigate to specified UI
    // Can be a simple string/expression for the UI ID, or an object with UI ID and parameters
    "link-to": z.union([
        z.string(),
        ExpressionSchema,
        BindingSchema,
        z.object({
            ui: z.union([z.string(), ExpressionSchema, BindingSchema]),
            params: z.record(z.string(), z.any()).optional()
        })
    ]).optional(),

    // Internal metadata
    _meta: z.object({
        id: z.string().optional(),
        version: z.string().optional(),
        created: z.string().optional(),
        lastModified: z.string().optional(),
    }).optional(),

    // Recursive children using get() method - more lenient
    get children() {
        return z.any().optional(); // Accept any type for children - string, array, object, etc.
    },

    // Recursive else using get() method
    get else() {
        return UIElementSchema.optional();
    },

    // Recursive slots using get() method
    get slots() {
        return z.record(z.string(), z.union([
            UIElementSchema,
            z.array(UIElementSchema)
        ])).optional();
    },

    // Platform overrides using get() method
    get platform() {
        return z.object({
            web: UIElementSchema.partial().optional(),
            ios: UIElementSchema.partial().optional(),
            android: UIElementSchema.partial().optional(),
        }).optional();
    },
});


export const UIComponentSchema = z.object({
    id: z.string(),
    name: z.string().optional(),

    // Component props
    props: z.record(z.string(), z.any()).optional(),

    // Component states
    states: z.record(z.string(), z.any()).optional(),

    // Component event handlers
    methods: z.record(z.string(), z.object({
        fn: z.string(),
        params: z.record(z.string(), z.any()).optional(),
    })).optional(),

    // useeffects
    effects: z.array(z.object({
        fn: z.string(),
        deps: z.array(z.string()).optional(),
    })).optional(),

    //component bound data
    data:z.record(z.string(), z.any()).optional(),

    //componet jsx
    render:UIElementSchema,

    // Query specification for data fetching
    query: QuerySpecSchema.optional()
})

// Infer TypeScript types from Zod schemas
export type Expression = z.infer<typeof ExpressionSchema>;
export type Binding = z.infer<typeof BindingSchema>;
export type ForDirective = z.infer<typeof ForDirectiveSchema>;
export type QuerySpec = z.infer<typeof QuerySpecSchema>;
export type UIElement = z.infer<typeof UIElementSchema>;
export type UIComponent = z.infer<typeof UIComponentSchema>;
