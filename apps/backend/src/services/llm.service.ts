import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { T_UI_Component } from '../types/ui-schema';
import { ProjectSchemaCacheService } from './project-schema-cache.service';
import { OPENROUTER_API_KEY, GEMINI_API_KEY, GROQ_API_KEY, LLM_PROVIDER, FORCE_GEMINI_FAIL, FORCE_GROQ_FAIL, FORCE_OPENROUTER_FAIL } from '../env';
import { t_llm_query_response, t_uis_list_response, z_llm_query_response, z_uis_list_response } from 'src/types/llm';
import { UI_PROMPT } from './ui-gen-prompts';
import { QUERY_PROMPT } from './query-gen-prompts';
import { T_LLM_PROVIDER, UIComponent, UIComponentSchema } from 'src/types/dsl';


@Injectable()
export class LlmService {
    private openai: OpenAI | null = null;
    private groq: OpenAI | null = null;
    private gemini: GoogleGenerativeAI | null = null;
    private currentProvider: T_LLM_PROVIDER ;

  constructor(
    private readonly projectSchemaCache: ProjectSchemaCacheService,
  ) {
    this.currentProvider = LLM_PROVIDER as T_LLM_PROVIDER;

    // Initialize OpenRouter
    if (OPENROUTER_API_KEY) {
        this.openai = new OpenAI({
            apiKey: OPENROUTER_API_KEY,
            baseURL: 'https://openrouter.ai/api/v1'
        });
        console.log('✅ OpenRouter client initialized');
    } else {
        console.warn('⚠️ OPENROUTER_API_KEY not found, OpenRouter client not initialized');
    }

    // Initialize Groq
    if (GROQ_API_KEY) {
        this.groq = new OpenAI({
            apiKey: GROQ_API_KEY,
            baseURL: 'https://api.groq.com/openai/v1'
        });
        console.log('✅ Groq client initialized');
    } else {
        console.warn('⚠️ GROQ_API_KEY not found, Groq client not initialized');
    }

    // Initialize Gemini
    if (GEMINI_API_KEY) {
            this.gemini = new GoogleGenerativeAI(GEMINI_API_KEY);
            console.log('✅ Gemini client initialized');
        } else {
            console.warn('⚠️ GEMINI_API_KEY not found, Gemini client not initialized');
        }

        console.log(`🤖 Using LLM provider: ${this.currentProvider}`);
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

    async generateGraphQLFromPromptForProject(
        prompt: string,
        projectId: string,
        schemaData: any
    ) {
        try {
            const client = this.currentProvider === 'groq' ? this.groq : this.openai;
            const providerName = this.currentProvider === 'groq' ? 'Groq' : 'OpenRouter';

            if (!client) {
                return {success:false, error:`${providerName} API key not configured. Please set ${this.currentProvider === 'groq' ? 'GROQ_API_KEY' : 'OPENROUTER_API_KEY'} environment variable.`};
            }

            console.log(`Generating GraphQL query for project ${projectId}, "${prompt}"`);

            // Convert docs to schema info string for LLM
            // const schemaInfo = this.formatDocsForLLM(schemaData);

            const schemaInfo = this.GetDocsForLLM(schemaData);

            // Generate GraphQL query using schema
            const model = this.currentProvider === 'groq' ? 'openai/gpt-oss-120b' : 'openai/gpt-5';

            const completion = await client.chat.completions.create({
                model: model,
                messages: [
                    {
                        role: "system",
                        content: QUERY_PROMPT(projectId, schemaInfo)
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
            if (!result) throw new Error(`No response from ${providerName}`);

            // Clean up any potential markdown formatting
            const cleanResult = result.replace(/```json\n?/g, '').replace(/```\n?/g, '');

            let parsedResult;
            try {
                parsedResult = JSON.parse(cleanResult);
            }   catch (e) {
                console.error(`Failed to parse JSON response from ${providerName}:`, e);
                console.error('Received malformed response:', cleanResult.substring(0, 500) + (cleanResult.length > 500 ? '...' : ''));
                return {success:false, error:`Failed to parse JSON response from ${providerName}: ` + (e instanceof Error ? e.message : 'Unknown error')};
            }

            console.log("llm query gen res:", JSON.stringify(parsedResult,null,2));

            const p = z_llm_query_response.safeParse(parsedResult);
            if (!p.success) {
                console.error(`Failed to zod parse JSON response from ${providerName}:`, p.error);
                return {success:false, error:`Failed to zod parse JSON response from ${providerName}`};
            }

            parsedResult = p.data;

            return {success:true, data:parsedResult};

        } catch (error:any) {
            console.error(`Error generating GraphQL query for project ${projectId}:`, error);
            return {success:false, error:'Error generating GraphQL query: ' + error.message};
        }
    }

    // Streaming version for OpenRouter
    async generateUIFromDataWithStreaming(
        prompt: string,
        currentUI: UIComponent,
        projectId?: string,
        streamCallback?: (chunk: string) => void
    ) {
        console.log('🎨 Generating UI for prompt with streaming', prompt);

        // Forced failure for testing
        if (FORCE_OPENROUTER_FAIL) {
            console.log('🧪 [TEST MODE] Forcing OpenRouter failure');
            return { success: false, error: 'TEST MODE: Forced OpenRouter failure for fallback testing' };
        }

        const data = currentUI.data || {};

        try {
            if (!this.openai) {
                return { success: false, error: 'OpenAI API key not configured. Please set OPENROUTER_API_KEY environment variable.' };
            }

            const userMessage = `CURRENT UI COMPONENT TO WORK WITH:
${JSON.stringify(currentUI, null, 2)}

USER REQUEST: "${prompt}"

Data structure available:
${JSON.stringify(data, null, 2)}

Available data fields: ${data ? Object.keys(data).join(', ') : 'none'}
${data && Object.keys(data)[0] ? `Sample item fields: ${Object.keys(data[Object.keys(data)[0]]?.[0] || {}).join(', ')}` : ''}

INSTRUCTIONS:
Based on the user request above, analyze what needs to be done and decide the best approach:

1. **MODIFY EXISTING**: If the request is to change existing elements (styling, text, structure)
2. **ADD NEW**: If the request is to add new components or elements to the existing UI
3. **RESTRUCTURE**: If the request requires reorganizing or changing the layout
4. **ENHANCE**: If the request is to improve or extend existing functionality

IMPORTANT RULES:
- Always return a complete UIComponent with the same id as the current one
- The render property should contain the updated UIElement tree
- Children can be: strings, objects, arrays, UIElements, or nested UIComponents
- Preserve existing data bindings unless specifically asked to change them
- Maintain existing styling patterns unless specifically asked to change them
- If adding new elements, integrate them naturally into the existing structure
- Keep the same component-level properties (states, methods, effects) unless asked to modify them
- Update the data property if new data structure is needed`;

            const stream = await this.openai.chat.completions.create({
                model: "openai/gpt-5-mini",
                messages: [
                    {
                        role: "system",
                        content: UI_PROMPT
                    },
                    {
                        role: "user",
                        content: userMessage
                    }
                ],
                response_format: { type: "json_object" },
                temperature: 0.4,
                stream: true
            });

            let fullResponse = '';

            // Stream the response
            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) {
                    fullResponse += content;
                    // Send streaming updates via callback
                    if (streamCallback) {
                        streamCallback(content);
                    }
                }
            }

            if (!fullResponse) {
                return { success: false, error: 'No response from OpenAI' };
            }

            let parsed: UIComponent;
            try {
                parsed = JSON.parse(fullResponse);

                // Validate against UIComponent schema
                const validatedResult = UIComponentSchema.safeParse(parsed);
                if (validatedResult.success) {
                    console.log('✅ Schema validation passed');
                    return { success: true, data: validatedResult.data };
                } else {
                    console.warn('⚠️  Schema validation failed:');
                    console.warn('Validation errors:', validatedResult.error.issues.slice(0, 5));

                    // Check specifically for missing IDs
                    const missingIdErrors = validatedResult.error.issues.filter(issue =>
                        issue.path.includes('id') || issue.message.includes('id')
                    );

                    if (missingIdErrors.length > 0) {
                        console.error('❌ Critical ID validation errors found:', missingIdErrors);
                        return { success: false, error: 'Missing required ID fields in generated UI. LLM must provide IDs for all elements.' };
                    }

                    console.warn('Non-critical validation issues found, using generated UI anyway');
                    return { success: true, data: parsed };
                }

            } catch (parseErr: any) {
                console.error("Failed to parse OpenAI response:", parseErr);
                return { success: false, error: 'Failed to parse OpenAI response: ' + parseErr.message };
            }

        } catch (error: any) {
            console.error("Error generating UI with streaming:", error);
            return { success: false, error: 'Error generating UI with streaming: ' + (error?.message || error) };
        }
    }

    // Streaming version for Gemini
    async generateUIFromDataWithGeminiStreaming(
        prompt: string,
        currentUI: UIComponent,
        projectId?: string,
        streamCallback?: (chunk: string) => void
    ) {
        console.log('🎨 Generating UI for prompt using Gemini with streaming', prompt);

        // Forced failure for testing
        if (FORCE_GEMINI_FAIL) {
            console.log('🧪 [TEST MODE] Forcing Gemini failure');
            return { success: false, error: 'TEST MODE: Forced Gemini failure for fallback testing' };
        }

        const data = currentUI.data || {};

        try {
            if (!this.gemini) {
                return { success: false, error: 'Gemini API key not configured. Please set GEMINI_API_KEY environment variable.' };
            }

            const model = this.gemini.getGenerativeModel({
                model: "gemini-2.5-flash",
                generationConfig: {
                    temperature: 0.4,
                    maxOutputTokens: 8192,
                    responseMimeType: "application/json"
                }
            });

            const userMessage = `CURRENT UI COMPONENT TO WORK WITH:
${JSON.stringify(currentUI, null, 2)}

USER REQUEST: "${prompt}"

Data structure available:
${JSON.stringify(data, null, 2)}

Available data fields: ${data ? Object.keys(data).join(', ') : 'none'}
${data && Object.keys(data)[0] ? `Sample item fields: ${Object.keys(data[Object.keys(data)[0]]?.[0] || {}).join(', ')}` : ''}

INSTRUCTIONS:
Based on the user request above, analyze what needs to be done and decide the best approach:

1. **MODIFY EXISTING**: If the request is to change existing elements (styling, text, structure)
2. **ADD NEW**: If the request is to add new components or elements to the existing UI
3. **RESTRUCTURE**: If the request requires reorganizing or changing the layout
4. **ENHANCE**: If the request is to improve or extend existing functionality

IMPORTANT RULES:
- Always return a complete UIComponent with the same id as the current one
- The render property should contain the updated UIElement tree
- Children can be: strings, objects, arrays, UIElements, or nested UIComponents
- Preserve existing data bindings unless specifically asked to change them
- Maintain existing styling patterns unless specifically asked to change them
- If adding new elements, integrate them naturally into the existing structure
- Keep the same component-level properties (states, methods, effects) unless asked to modify them
- Update the data property if new data structure is needed`;

            const fullPrompt = `${UI_PROMPT}

${userMessage}`;

            // Generate streaming content
            console.log('🤖 Starting Gemini content generation...');
            const result = await model.generateContentStream(fullPrompt);
            let fullResponse = '';

            // Stream the response
            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                if (chunkText) {
                    fullResponse += chunkText;
                    // Send streaming updates via callback
                    if (streamCallback) {
                        streamCallback(chunkText);
                    }
                }
            }

            if (!fullResponse) {
                return { success: false, error: 'No response from Gemini' };
            }

            // Clean up any potential markdown formatting
            let cleanResult = fullResponse;
            if (cleanResult.includes('```json')) {
                cleanResult = cleanResult.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
            } else if (cleanResult.includes('```')) {
                cleanResult = cleanResult.replace(/```\n?/g, '').replace(/```\n?$/g, '');
            }

            let parsed: UIComponent;
            try {
                parsed = JSON.parse(cleanResult);

                // Validate against UIComponent schema
                const validatedResult = UIComponentSchema.safeParse(parsed);
                if (validatedResult.success) {
                    console.log('✅ Gemini Schema validation passed');
                    return { success: true, data: validatedResult.data };
                } else {
                    console.warn('⚠️ Gemini Schema validation failed:');
                    console.warn('Validation errors:', validatedResult.error.issues.slice(0, 5));

                    // Check specifically for missing IDs
                    const missingIdErrors = validatedResult.error.issues.filter(issue =>
                        issue.path.includes('id') || issue.message.includes('id')
                    );

                    if (missingIdErrors.length > 0) {
                        console.error('❌ Critical ID validation errors found:', missingIdErrors);
                        return { success: false, error: 'Missing required ID fields in generated UI. Gemini must provide IDs for all elements.' };
                    }

                    console.warn('Non-critical validation issues found, using generated UI anyway');
                    return { success: true, data: parsed };
                }

            } catch (parseErr: any) {
                console.error("Failed to parse Gemini response:", parseErr);
                return { success: false, error: 'Failed to parse Gemini response: ' + parseErr.message };
            }

        } catch (error: any) {
            console.error("Error generating UI with Gemini streaming:", {
                message: error?.message,
                stack: error?.stack,
                status: error?.status,
                code: error?.code,
                details: error?.details
            });
            return { success: false, error: 'Error generating UI with Gemini streaming: ' + (error?.message || error) };
        }
    }

    // Streaming version for Groq
    async generateUIFromDataWithGroqStreaming(
        prompt: string,
        currentUI: UIComponent,
        projectId?: string,
        streamCallback?: (chunk: string) => void
    ) {
        console.log('🎨 Generating UI for prompt using Groq with streaming', prompt);

        // Forced failure for testing
        if (FORCE_GROQ_FAIL) {
            console.log('🧪 [TEST MODE] Forcing Groq failure');
            return { success: false, error: 'TEST MODE: Forced Groq failure for fallback testing' };
        }

        const data = currentUI.data || {};

        try {
            if (!this.groq) {
                return { success: false, error: 'Groq API key not configured. Please set GROQ_API_KEY environment variable.' };
            }

            const userMessage = `CURRENT UI COMPONENT TO WORK WITH:
${JSON.stringify(currentUI, null, 2)}

USER REQUEST: "${prompt}"

Data structure available:
${JSON.stringify(data, null, 2)}

Available data fields: ${data ? Object.keys(data).join(', ') : 'none'}
${data && Object.keys(data)[0] ? `Sample item fields: ${Object.keys(data[Object.keys(data)[0]]?.[0] || {}).join(', ')}` : ''}

INSTRUCTIONS:
Based on the user request above, analyze what needs to be done and decide the best approach:

1. **MODIFY EXISTING**: If the request is to change existing elements (styling, text, structure)
2. **ADD NEW**: If the request is to add new components or elements to the existing UI
3. **RESTRUCTURE**: If the request requires reorganizing or changing the layout
4. **ENHANCE**: If the request is to improve or extend existing functionality

IMPORTANT RULES:
- Always return a complete UIComponent with the same id as the current one
- The render property should contain the updated UIElement tree
- Children can be: strings, objects, arrays, UIElements, or nested UIComponents
- Preserve existing data bindings unless specifically asked to change them
- Maintain existing styling patterns unless specifically asked to change them
- If adding new elements, integrate them naturally into the existing structure
- Keep the same component-level properties (states, methods, effects) unless asked to modify them
- Update the data property if new data structure is needed`;

            const stream = await this.groq.chat.completions.create({
                model: "openai/gpt-oss-120b",
                messages: [
                    {
                        role: "system",
                        content: UI_PROMPT
                    },
                    {
                        role: "user",
                        content: userMessage
                    }
                ],
                response_format: { type: "json_object" },
                temperature: 0.4,
                stream: true,
                max_tokens: 8192
            });

            let fullResponse = '';

            // Stream the response
            console.log('🚀 Starting Groq streaming...');
            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) {
                    fullResponse += content;
                    console.log('📡 Groq chunk received:', content.slice(0, 50) + (content.length > 50 ? '...' : ''));
                    // Send streaming updates via callback
                    if (streamCallback) {
                        streamCallback(content);
                    }
                }
            }
            console.log('🏁 Groq streaming completed, total length:', fullResponse.length);

            if (!fullResponse) {
                return { success: false, error: 'No response from Groq' };
            }

            let parsed: UIComponent;
            try {
                parsed = JSON.parse(fullResponse);

                // Validate against UIComponent schema
                const validatedResult = UIComponentSchema.safeParse(parsed);
                if (validatedResult.success) {
                    console.log('✅ Groq Schema validation passed');
                    return { success: true, data: validatedResult.data };
                } else {
                    console.warn('⚠️ Groq Schema validation failed:');
                    console.warn('Validation errors:', validatedResult.error.issues.slice(0, 5));

                    // Check specifically for missing IDs
                    const missingIdErrors = validatedResult.error.issues.filter(issue =>
                        issue.path.includes('id') || issue.message.includes('id')
                    );

                    if (missingIdErrors.length > 0) {
                        console.error('❌ Critical ID validation errors found:', missingIdErrors);
                        return { success: false, error: 'Missing required ID fields in generated UI. Groq must provide IDs for all elements.' };
                    }

                    console.warn('Non-critical validation issues found, using generated UI anyway');
                    return { success: true, data: parsed };
                }

            } catch (parseErr: any) {
                console.error("Failed to parse Groq response:", parseErr);
                return { success: false, error: 'Failed to parse Groq response: ' + parseErr.message };
            }

        } catch (error: any) {
            console.error("Error generating UI with Groq streaming:", {
                message: error?.message,
                stack: error?.stack,
                status: error?.status,
                code: error?.code,
                details: error?.details
            });
            return { success: false, error: 'Error generating UI with Groq streaming: ' + (error?.message || error) };
        }
    }

    // Method to temporarily switch provider  with streaming
    async generateUIFromData2WithProvider(
        prompt: string,
        currentUI: UIComponent,
        provider: T_LLM_PROVIDER,
        projectId?: string,
        streamCallback?: (chunk: string) => void
    ) {
        console.log(`🔄 Temporarily switching to ${provider} provider`);

        if (provider === 'gemini') {
            if (!this.gemini) {
                return { success: false, error: 'Gemini not configured. Please set GEMINI_API_KEY environment variable.' };
            }
            return this.generateUIFromDataWithGeminiStreaming(prompt, currentUI, projectId, streamCallback);
        } else if (provider === 'groq') {
            if (!this.groq) {
                return { success: false, error: 'Groq not configured. Please set GROQ_API_KEY environment variable.' };
            }
            return this.generateUIFromDataWithGroqStreaming(prompt, currentUI, projectId, streamCallback);
        } else {
            if (!this.openai) {
                return { success: false, error: 'OpenRouter not configured. Please set OPENROUTER_API_KEY environment variable.' };
            }
            return this.generateUIFromDataWithStreaming(prompt, currentUI, projectId, streamCallback);
        }
    }
}