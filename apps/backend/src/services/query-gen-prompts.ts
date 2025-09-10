const query_prompt_v1 = `CRITICAL INSTRUCTIONS:
    - Generate valid GraphQL queries using ONLY the exact table and column names from the schema
    - DO NOT invent or assume any columns that aren't explicitly listed in the "EXACT COLUMNS AVAILABLE" sections
    - DO NOT use nested object fields unless explicitly shown as available in the relationships section
    - Use the root_fields provided for each table

    - Use GraphQL syntax:
    * Filters: where: {field: {_eq: "value"}} 
    * Comparison: _eq, _neq, _gt, _lt, _gte, _lte, _like, _ilike
    * Null checks: _is_null: true/false
    * Arrays: _in: [values]
    * Sorting: order_by: {field: desc/asc}
    * Pagination: limit: N, offset: N
    * Aggregations: use _aggregate suffix (e.g., comments_aggregate)

    - Always include proper variable definitions in the query
    - Return valid JSON with 'query', 'variables', and 'explanation' fields
    - If relationships are needed, mention in explanation that separate queries may be needed

    Return ONLY valid JSON, no markdown formatting or additional text.
    {
    query: string;
    variables?: Record<string, any>;
    explanation?: string;
    }

    when no query is required set the query value to empty string ("")`;


export const QUERY_PROMPT = (projectId: string, schemaInfo: string) => {

    const p  = `
        You are a GraphQL query generator for project ${projectId}. 

        Generate queries based on this database schema:
        ${schemaInfo}

        ${query_prompt_v1}
    `

    return p


}
