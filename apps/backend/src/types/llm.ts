import { z } from 'zod';

export const z_llm_query_response = z.object({
    query: z.string(),
    variables: z.record(z.string(),z.any()).optional(),
    explanation: z.string().optional(),
});

export type t_llm_query_response = z.infer<typeof z_llm_query_response>;
