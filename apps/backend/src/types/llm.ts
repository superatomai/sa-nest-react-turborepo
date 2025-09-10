import { z } from 'zod';

export const z_llm_query_response = z.object({
    query: z.string(),
    variables: z.record(z.string(),z.any()).optional(),
    explanation: z.string().optional(),
});

export type t_llm_query_response = z.infer<typeof z_llm_query_response>;

// UI Suggestion Types
export const z_ui_list = z.object({
    name: z.string().describe("Clear, descriptive name for the UI component"),
    description: z.string().describe("Brief description of what this UI shows/does"),
    type: z.string().describe("Type of UI component"),
    category: z.string().describe("Category like 'Data Display', 'Forms', 'Analytics', etc."),
    tags: z.array(z.string()).describe("Relevant tags for filtering/searching")
});

export const z_uis_list_response = z.array(z_ui_list);

export type t_ui_list = z.infer<typeof z_ui_list>;
export type t_uis_list_response = z.infer<typeof z_uis_list_response>;
