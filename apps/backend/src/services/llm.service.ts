import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { T_UI_Component, Z_UI_Component } from '../types/ui-schema';
import { ProjectSchemaCacheService } from './project-schema-cache.service';
import { OPENROUTER_API_KEY } from '../env';
import { t_llm_query_response, z_llm_query_response } from 'src/types/llm';


@Injectable()
export class LlmService {
    private openai: OpenAI | null = null;
  constructor(
    private readonly projectSchemaCache: ProjectSchemaCacheService,
  ) {
    if (OPENROUTER_API_KEY) {
      this.openai = new OpenAI({ 
        apiKey: OPENROUTER_API_KEY,
        baseURL: 'https://openrouter.ai/api/v1'
      });
    //   console.log('✅ OpenRouter client initialized');
    } else {
      console.warn('⚠️ OPENROUTER_API_KEY not found, OpenRouter client not initialized');
    }
  }
    async generateGraphQLFromPromptForProject(
        prompt: string,
        projectId: string,
    ): Promise<t_llm_query_response> {
        try {
            if (!this.openai) {
                throw new Error('OpenRouter API key not configured. Please set OPENROUTER_API_KEY environment variable.');
            }

            console.log(`Generating GraphQL query for project ${projectId}, "${prompt}"`);

            // Get project schema from cache
            const schemaResult = await this.projectSchemaCache.getProjectSchema(projectId);
            if (!schemaResult.success) throw new Error(schemaResult.error || "No schema data found");
            
            const schemaData = schemaResult.data;

            // Convert docs to schema info string for LLM
            const schemaInfo = this.formatDocsForLLM(schemaData);

            // const schemaInfo = this.GetDocsForLLM(schemaData);

            // Generate GraphQL query using schema
            const completion = await this.openai.chat.completions.create({
                model: "openai/gpt-5",
                messages: [
                    {
                        role: "system",
                        content: `
You are a GraphQL query generator for project ${projectId}. 

Generate queries based on this database schema:
${schemaInfo}

CRITICAL INSTRUCTIONS:
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

when no query is required set the query value to empty string ("").
`
                    },
                    {
                        role: "user",
                        content: `Generate a GraphQL query for: "${prompt}"`
                    }
                ],
                temperature: 0.2,
                max_tokens: 1500,
            });

            const result = completion.choices[0].message.content?.trim();
            if (!result) throw new Error('No response from OpenRouter');

            // Clean up any potential markdown formatting
            const cleanResult = result.replace(/```json\n?/g, '').replace(/```\n?/g, '');

            let parsedResult;
            try {
                parsedResult = JSON.parse(cleanResult);
            }   catch (e) {
                console.error('Failed to parse JSON response from OpenRouter:', e);
                throw new Error('Failed to parse JSON response from OpenRouter');
            }

            console.log("llm query gen res:", JSON.stringify(parsedResult,null,2));

            const p = z_llm_query_response.safeParse(parsedResult);
            if (!p.success) {
                console.error('Failed tozod  parse JSON response from OpenRouter:', p.error);
                throw new Error('Failed to zod parse JSON response from OpenRouter');
            }

            parsedResult = p.data;
            // Replace user placeholders with actual values if needed
            // parsedResult.variables &&
            //     Object.keys(parsedResult.variables).forEach(key => {
            //         const value = parsedResult.variables?.[key];
            //         if (typeof value === "string") {
            //             if (value.includes("USER_ID") || value.includes("CURRENT_USER")) {
            //                 parsedResult.variables![key] = parseInt(projectId) || 1;
            //             }
            //             if (value.includes("PROJECT_ID")) {
            //                 parsedResult.variables![key] = projectId;
            //             }
            //         }
            //     });
            // query can be "" for prompts that does not require query
            // if (!parsedResult.query || typeof parsedResult.query !== 'string') {
            //     throw new Error('Invalid query in response');

            return parsedResult;

        } catch (error) {
            console.error(`Error generating GraphQL query for project ${projectId}:`, error);
            throw new Error('Error generating GraphQL query');
        }
    }

    private formatDocsForLLM(schemaData: any): string {
        let schemaInfo = `GRAPHQL SCHEMA\n\n`;

        if (!schemaData.tables || !Array.isArray(schemaData.tables)) {
            return "No valid schema data provided";
        }

        schemaInfo += `AVAILABLE TABLES AND THEIR EXACT COLUMNS:\n`;

        // First pass: Document all tables and their exact columns
        schemaData.tables.forEach((table: any) => {
            const tableName = table.name;
            schemaInfo += `\n=== ${tableName.toUpperCase()} TABLE ===\n`;

            // Add root fields (GraphQL operations)
            if (table.root_fields) {
                schemaInfo += `GraphQL Root Field: ${table.root_fields.select}\n`;
                schemaInfo += `Aggregate Field: ${table.root_fields.select_aggregate}\n`;
                if (table.root_fields.select_by_pk) {
                    schemaInfo += `By Primary Key: ${table.root_fields.select_by_pk}\n`;
                }
            }

            // Add columns - EXACT COLUMNS ONLY
            schemaInfo += `\nEXACT COLUMNS AVAILABLE (use only these):\n`;
            if (table.columns && Array.isArray(table.columns)) {
                table.columns.forEach((column: any) => {
                    const nullable = column.is_nullable ? 'nullable' : 'required';
                    const pk = column.is_primary_key ? ' [PRIMARY KEY]' : '';
                    schemaInfo += `  ✓ ${column.name}: ${column.data_type} (${nullable})${pk}\n`;
                });
            }

            // Add foreign key relationships
            if (table.foreign_keys && Array.isArray(table.foreign_keys)) {
                schemaInfo += `\nForeign Key Relationships:\n`;
                table.foreign_keys.forEach((fk: any) => {
                    const fromCol = fk.columns.join(', ');
                    const toTable = fk.ref_table;
                    const toCol = fk.ref_columns.join(', ');
                    schemaInfo += `  - ${fromCol} → ${toTable}.${toCol}\n`;
                });
            }
        });

        // Add relationship handling instructions
        schemaInfo += `\n\n=== RELATIONSHIPS (HOW TO JOIN TABLES) ===\n`;
        schemaInfo += `Since auto-relationships are not configured, you must use foreign keys manually:\n`;

        schemaData.tables.forEach((table: any) => {
            if (table.foreign_keys && Array.isArray(table.foreign_keys)) {
                table.foreign_keys.forEach((fk: any) => {
                    const fromTable = table.name;
                    const fromCol = fk.columns[0];
                    const toTable = fk.ref_table;
                    const toCol = fk.ref_columns[0];
                    schemaInfo += `${fromTable} has ${fromCol} → to get ${toTable} data, query ${toTable}(where: {${toCol}: {_eq: ${fromCol}}})\n`;
                });
            }
        });

        return schemaInfo;
    }

    private GetDocsForLLM(schemaData: any) {
        const  docs = JSON.stringify(schemaData);

        return docs;
    }

   
    private fixDoubleBindings(component: T_UI_Component): T_UI_Component {
        const fixed = { ...component };
        
        const processComponent = (comp: T_UI_Component): T_UI_Component => {
            const processed = { ...comp };
            
            // Move binding from props to top-level if it exists
            if (processed.props?.binding) {
                console.log(`🔧 Moving binding from props to top-level in ${processed.type}#${processed.id}`);
                if (!processed.binding && typeof processed.props.binding === 'string') {
                    processed.binding = processed.props.binding;
                }
                delete processed.props.binding;
            }
            
            // CRITICAL FIX: Remove binding from table row elements
            // TR elements should never have array bindings - only their container (tbody) should
            if (processed.type === 'tr' && processed.binding) {
                console.log(`🔧 Removing array binding from TR element ${processed.id} (type: ${processed.type})`);
                delete processed.binding;
            }
            
            // Also remove from other elements that shouldn't have array bindings
            if (['td', 'th'].includes(processed.type) && processed.binding) {
                console.log(`🔧 Removing array binding from ${processed.type} element ${processed.id}`);
                delete processed.binding;
            }
            
            // Process children recursively
            if (processed.children && Array.isArray(processed.children)) {
                processed.children = processed.children.map(child => {
                    if (typeof child === 'string') return child;
                    return processComponent(child);
                });
            }
            
            return processed;
        };
        
        return processComponent(fixed);
    }



    async generateUIFromData(
        data: any,
        originalPrompt: string,
        graphqlQuery: string,
        graphqlVariables?: Record<string, any>,
        projectId?: string,
        currentUI?: T_UI_Component
    ): Promise<T_UI_Component> {
        try {
            if (!this.openai) {
                throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.');
            }

            const completion = await this.openai.chat.completions.create({
                model: "openai/gpt-5-mini",
                messages: [
                    {
                        role: "system",
                        content: `You are an expert UI/UX designer and frontend developer who creates beautiful, modern, and professional user interfaces using Tailwind CSS.

SCHEMA FORMAT - You must return JSON that conforms to this structure:
{
  "id": "unique-string",
  "type": "html-tag",
  "props": {
    "className": "tailwind-classes"
  },
  "children": [], // Array of child components or strings
  "binding": "data-key", // For arrays/lists
}

DESIGN PRINCIPLES:
1. **Modern & Professional**: Use contemporary design patterns with clean layouts, proper spacing, and visual hierarchy
2. **Responsive**: Always include responsive classes (sm:, md:, lg:, xl:)
3. **Interactive**: Add hover states, transitions, and subtle animations
4. **Accessible**: Use proper semantic HTML and ARIA attributes
5. **Consistent**: Maintain consistent spacing, colors, and typography throughout

ESSENTIAL TAILWIND CLASSES TO USE:

**Layout & Containers:**
- Container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
- Cards: "bg-white shadow-lg rounded-xl border border-gray-200"
- Sections: "py-8 sm:py-12 lg:py-16"

**Typography:**
- Headings: "text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900"
- Subheadings: "text-lg sm:text-xl font-semibold text-gray-700" 
- Body: "text-base text-gray-600 leading-relaxed"
- Small text: "text-sm text-gray-500"

**Tables (when data is tabular):**
- Table: "min-w-full divide-y divide-gray-200 bg-white shadow-sm rounded-lg overflow-hidden"
- Header: "bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
- Row: "bg-white hover:bg-gray-50 transition-colors duration-200"
- Cell: "px-6 py-4 whitespace-nowrap text-sm text-gray-900"

**Buttons:**
- Primary: "bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
- Secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"

**Forms:**
- Input: "block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
- Label: "block text-sm font-medium text-gray-700 mb-2"

**Status/Badges:**
- Success: "inline-flex px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
- Warning: "inline-flex px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
- Error: "inline-flex px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"

**Spacing & Layout:**
- Use consistent spacing: p-4, p-6, p-8 for padding
- Use gap-4, gap-6, gap-8 for flex/grid gaps
- Use space-y-4, space-y-6, space-y-8 for vertical spacing

**Data Binding Rules:**
- For arrays: Add "binding": "arrayKey" to the parent container
- For dynamic text: Use "{{fieldName}}" in children arrays
- For conditional styling: Use computed classes based on data values

**Component Structure Rules:**
1. Always wrap content in semantic containers
2. Use proper heading hierarchy (h1 > h2 > h3)
3. Group related content in cards or sections
4. Add loading states and empty states when appropriate
5. Include proper navigation and breadcrumbs for complex UIs

CRITICAL DATA BINDING RULES:
1. **NEVER embed actual data values** from the provided data structure
2. **ALWAYS use data bindings** with double curly braces: {{fieldName}}
3. **Use binding property** on parent components for arrays: "binding": "users"
4. **Reference fields dynamically**: Use {{name}}, {{email}}, {{status}} etc.
5. **No hardcoded values**: Don't put "John Doe" or "admin" - use {{name}} and {{role}}
6. Every component needs a unique "id"

*ARRAY BINDING RULES (CRITICAL):**
1. **Binding is a top-level property**: Never put binding inside props
2. **Single Level Binding**: Only the parent container should have the binding property
3. **No Double Binding**: Child elements should NOT repeat the same binding

WRONG (embedding actual data):
"children": ["John Doe"] // ❌ Never do this
"children": ["admin"] // ❌ Never do this

CORRECT (using bindings):
"children": ["{{name}}"] // ✅ Always use bindings
"children": ["{{role}}"] // ✅ Dynamic data binding

ANALYSIS PROCESS:
1. Analyze the user's prompt and data structure
2. Determine the best UI pattern (table, grid, list, form, dashboard, etc.)
3. Create a modern, professional design with proper hierarchy
4. Apply appropriate Tailwind classes for styling
5. Add interactive elements and transitions
6. Ensure responsive design
7. Include proper data bindings

BINDING HIERARCHY RULES:
- Container with array data: Add "binding": "arrayName" as TOP-LEVEL property
- Direct children: NO binding property whatsoever
- Template values: Use {{fieldName}} syntax in children arrays
- Only ONE component in the tree should bind to the same array

Return ONLY the JSON schema with no additional text.`
                    },
                    {
                        role: "user",
                        content: `Create a modern, professional UI for: "${originalPrompt}"

Data structure:
${JSON.stringify(data, null, 2)}

Available data fields: ${data ? Object.keys(data).join(', ') : 'none'}
${data && Object.keys(data)[0] ? `Sample item fields: ${Object.keys(data[Object.keys(data)[0]]?.[0] || {}).join(', ')}` : ''}

Requirements:
- Use modern design patterns
- Apply professional Tailwind CSS styling  
- Make it responsive and interactive
- Include proper data bindings
- Ensure good visual hierarchy and spacing`
                    }
                ],
                response_format: { type: "json_object" },
                temperature: 0.4 // Slightly higher for more creative designs
            });

            const result = completion.choices[0].message.content?.trim();
            if (!result) throw new Error("No response from OpenAI");

            let parsed: T_UI_Component;
            try {
                parsed = JSON.parse(result);

                 // 🔧 NEW: Fix double bindings before validation
                 parsed = this.fixDoubleBindings(parsed);

                // Validate and fix the structure
                parsed = this.normalizeUIComponent(parsed);

                // Validate against Zod schema
                const validatedResult = Z_UI_Component.safeParse(parsed);
                if (validatedResult.success) {
                    console.log('✅ Schema validation passed');
                    return validatedResult.data;
                } else {
                    console.warn('⚠️  Schema validation failed, but using generated UI anyway');
                    console.warn('Validation errors:', validatedResult.error.issues.slice(0, 5)); // Show first 5 errors
                    return parsed;
                }

            } catch (parseErr) {
                console.error("Failed to parse OpenAI response:", parseErr);
                console.error("Raw response:", result);
                throw parseErr;
            }

        } catch (error) {
            console.error("Error generating UI:", error);

            // Smart fallback based on data structure
            const dataKeys = data ? Object.keys(data) : [];
            const isArrayData = dataKeys.some(key => Array.isArray(data[key]));

            if (isArrayData) {
                // Return a styled table/grid for array data
                const arrayKey = dataKeys.find(key => Array.isArray(data[key])) || 'items';
                const sampleItem = data[arrayKey]?.[0] || {};
                const itemFields = Object.keys(sampleItem);

                return {
                    id: "fallback-data-view",
                    type: "div",
                    props: {
                        className: "min-h-screen bg-gray-50 py-8"
                    },
                    children: [
                        {
                            id: "container",
                            type: "div",
                            props: { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" },
                            children: [
                                {
                                    id: "header",
                                    type: "div",
                                    props: { className: "mb-8" },
                                    children: [
                                        {
                                            id: "title",
                                            type: "h1",
                                            props: { className: "text-3xl font-bold text-gray-900 mb-2" },
                                            children: ["Data View"]
                                        }
                                    ]
                                },
                                {
                                    id: "data-container",
                                    type: "div",
                                    props: { className: "bg-white shadow-lg rounded-xl overflow-hidden" },
                                    children: [
                                        {
                                            id: "data-table",
                                            type: "table",
                                            props: { className: "min-w-full divide-y divide-gray-200" },
                                            children: [
                                                {
                                                    id: "table-header",
                                                    type: "thead",
                                                    props: { className: "bg-gray-50" },
                                                    children: [
                                                        {
                                                            id: "header-row",
                                                            type: "tr",
                                                            children: itemFields.map((field, index) => ({
                                                                id: `header-${field}`,
                                                                type: "th",
                                                                props: {
                                                                    className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                                },
                                                                children: [field.charAt(0).toUpperCase() + field.slice(1)]
                                                            }))
                                                        }
                                                    ]
                                                },
                                                {
                                                    id: "table-body",
                                                    type: "tbody",
                                                    props: { className: "bg-white divide-y divide-gray-200" },
                                                    binding: arrayKey,
                                                    children: [
                                                        {
                                                            id: "data-row",
                                                            type: "tr",
                                                            props: { className: "hover:bg-gray-50 transition-colors duration-200" },
                                                            children: itemFields.map((field, index) => ({
                                                                id: `cell-${field}`,
                                                                type: "td",
                                                                props: {
                                                                    className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                                                },
                                                                children: [`{{${field}}}`]
                                                            }))
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                };
            } else {
                // Return a styled info display for non-array data
                return {
                    id: "fallback-info-view",
                    type: "div",
                    props: { className: "min-h-screen bg-gray-50 py-8" },
                    children: [
                        {
                            id: "info-container",
                            type: "div",
                            props: { className: "max-w-2xl mx-auto px-4 sm:px-6 lg:px-8" },
                            children: [
                                {
                                    id: "info-card",
                                    type: "div",
                                    props: { className: "bg-white shadow-lg rounded-xl p-8" },
                                    children: [
                                        {
                                            id: "info-title",
                                            type: "h2",
                                            props: { className: "text-2xl font-bold text-gray-900 mb-6" },
                                            children: ["Information"]
                                        },
                                        {
                                            id: "info-content",
                                            type: "pre",
                                            props: { className: "bg-gray-100 rounded-lg p-4 text-sm text-gray-700 overflow-auto" },
                                            children: [JSON.stringify(data, null, 2)]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                };
            }
        }
    }

    // Helper function to normalize UI component structure
    private normalizeUIComponent(component: any): T_UI_Component {
        if (!component || typeof component !== 'object') {
            return component;
        }

        // Ensure children is always an array
        if (component.children) {
            if (!Array.isArray(component.children)) {
                // If children is an object with binding, this is wrong structure
                if (typeof component.children === 'object' && component.children.binding) {
                    console.warn("Found incorrect binding structure, fixing...");
                    // Move binding to parent and children array to children
                    component.binding = component.children.binding;
                    component.children = component.children.children || [];
                } else {
                    component.children = [component.children];
                }
            }

            // Recursively normalize children
            component.children = component.children.map((child: any) => {
                if (typeof child === 'string') {
                    return child;
                }
                return this.normalizeUIComponent(child);
            });
        }

        return component;
    }

}