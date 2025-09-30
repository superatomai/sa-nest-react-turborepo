import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';
import { MessageEvent } from '@nestjs/common';
import Groq from 'groq-sdk';
import { GROQ_API_KEY } from '../env';
import { UIComponent, UIComponentSchema } from '../types/dsl';

export interface RuntimeGenerationRequest {
  query: string;
  projectId: string;
  context: {
    currentSchema?: UIComponent;
    userContext?: string;
    projectMetadata?: any;
  };
  options: {
    streaming?: boolean;
    maxTokens?: number;
    temperature?: number;
  };
}

export interface RuntimeGenerationResult {
  uiDSL: UIComponent;
  explanation?: string;
  confidence?: number;
  metadata?: {
    tokensUsed?: number;
    inferenceTime?: number;
    model?: string;
  };
}

// DSL Schema Documentation for UI Generation
const DSL_SCHEMA_DOCUMENTATION = `CRITICAL: You MUST return ONLY a valid JSON object that exactly matches this schema. No markdown, no code blocks, no explanations - ONLY the JSON object.

KEY STRUCTURE SUMMARY - Generate this exact structure:
{
  "id": "component-id",
  "name": "optional-component-name",
  "props": { /* component props */ },
  "states": { /* component states */ },
  "methods": { /* event handlers */ },
  "effects": [ /* useEffect hooks */ ],
  "data": { /* bound data */ },
  "render": {
    "id": "render-element-id",
    "type": "div",
    "props": { "className": "tailwind-classes" },
    "children": [/* nested elements or strings */]
  },
  "query": { /* optional query spec */ }
}

IMPORTANT DUCKDB DATABASE INFO:
- When using DuckDB components or SQL queries, the database name is "ddb"
- All SQL queries should reference tables as: "ddb.<tablename>"
- Example queries:
  * "SELECT * FROM ddb.users LIMIT 36"
  * "SELECT count(*) FROM ddb.orders"
  * "SELECT name, email FROM ddb.customers WHERE active = true LIMIT 50"
- Use this format in COMP_DUCKDB components in the sql property

HERE IS THE ZOD STRUCTURE FOR THE SCHEMA. Generate for the UIComponentSchema only


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

    // Conditionals
    if: ExpressionSchema.optional(),
    elseIf: ExpressionSchema.optional(),

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

`;

@Injectable()
export class RuntimeService {
  private groq: Groq | null = null;

  constructor() {
    // Initialize Groq client
    if (GROQ_API_KEY) {
      this.groq = new Groq({
        apiKey: GROQ_API_KEY,
      });
      console.log('✅ Groq client initialized for runtime service');
    } else {
      console.warn(
        '⚠️ GROQ_API_KEY not found, runtime service will not function',
      );
    }
  }

  /**
   * Generate UI DSL from user query using Groq LLM
   */
  async generateUIFromQuery(
    request: RuntimeGenerationRequest,
  ): Promise<RuntimeGenerationResult> {
    if (!this.groq) {
      throw new HttpException(
        'Groq client not initialized',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const startTime = Date.now();

    try {
      // Get project context and knowledge base
      const projectContext = await this.getProjectContext(request.projectId);

      // Build the system prompt
      const systemPrompt = this.buildSystemPrompt(projectContext);

      // Build the user prompt with context
      const userPrompt = this.buildUserPrompt(request);

      console.log(
        '🤖 Generating UI with Groq for query:',
        request.query.slice(0, 100) + '...',
      );

      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        model: 'openai/gpt-oss-120b', // Fast Groq model
        temperature: request.options.temperature || 0.7,
        max_tokens: request.options.maxTokens || 4000,
        top_p: 0.9,
        stream: false,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content generated from Groq');
      }

      // Extract JSON from the response
      const uiDSL = this.extractUIFromResponse(content);

      // Validate the generated DSL
      const validationResult = UIComponentSchema.safeParse(uiDSL);
      if (!validationResult.success) {
        console.error(
          'Generated DSL validation failed:',
          validationResult.error,
        );
        throw new Error(
          'Generated UI DSL is invalid: ' + validationResult.error.message,
        );
      }

      const inferenceTime = Date.now() - startTime;

      return {
        uiDSL: validationResult.data,
        explanation: this.extractExplanation(content),
        confidence: this.calculateConfidence(content, validationResult.success),
        metadata: {
          tokensUsed: completion.usage?.total_tokens || 0,
          inferenceTime,
          model: completion.model,
        },
      };
    } catch (error) {
      console.error('Runtime UI generation error:', error);
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to generate UI',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Generate UI DSL with streaming for real-time updates
   */
  generateUIStreamFromQuery(
    request: RuntimeGenerationRequest,
  ): Observable<MessageEvent> {
    return new Observable((subscriber) => {
      this.generateUIStreamingInternal(request, subscriber);
    });
  }

  private async generateUIStreamingInternal(
    request: RuntimeGenerationRequest,
    subscriber: any,
  ) {
    if (!this.groq) {
      subscriber.error(new Error('Groq client not initialized'));
      return;
    }

    const startTime = Date.now();

    try {
      // Send initial progress
      subscriber.next({
        data: JSON.stringify({
          type: 'progress',
          message: '🔄 Initializing runtime agent...',
          timestamp: new Date().toISOString(),
        }),
      });

      // Get project context
      const projectContext = await this.getProjectContext(request.projectId);

      subscriber.next({
        data: JSON.stringify({
          type: 'progress',
          message: '📚 Loading project knowledge base...',
          timestamp: new Date().toISOString(),
        }),
      });

      // Build prompts
      const systemPrompt = this.buildSystemPrompt(projectContext);
      const userPrompt = this.buildUserPrompt(request);

      subscriber.next({
        data: JSON.stringify({
          type: 'progress',
          message: '🤖 Generating UI with Groq...',
          timestamp: new Date().toISOString(),
        }),
      });

      // Create streaming completion
      const stream = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        model: 'openai/gpt-oss-120b',
        temperature: request.options.temperature || 0.7,
        max_tokens: request.options.maxTokens || 4000,
        top_p: 0.9,
        stream: true,
      });

      let fullContent = '';

      // Stream the response
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullContent += content;

        if (content) {
          subscriber.next({
            data: JSON.stringify({
              type: 'llm_stream',
              message: content,
              timestamp: new Date().toISOString(),
            }),
          });
        }
      }

      // Process the complete response
      subscriber.next({
        data: JSON.stringify({
          type: 'progress',
          message: '⚙️ Processing generated UI...',
          timestamp: new Date().toISOString(),
        }),
      });

      const uiDSL = this.extractUIFromResponse(fullContent);

      // Validate the DSL
      const validationResult = UIComponentSchema.safeParse(uiDSL);
      if (!validationResult.success) {
        subscriber.error(
          new Error(
            'Generated UI DSL is invalid: ' + validationResult.error.message,
          ),
        );
        return;
      }

      const inferenceTime = Date.now() - startTime;

      // Send completion
      subscriber.next({
        data: JSON.stringify({
          type: 'complete',
          data: {
            success: true,
            data: validationResult.data,
            metadata: {
              inferenceTime,
              model: 'openai/gpt-oss-120b',
            },
          },
          timestamp: new Date().toISOString(),
        }),
      });

      subscriber.complete();
    } catch (error) {
      console.error('Runtime streaming error:', error);
      subscriber.error(error);
    }
  }

  /**
   * Get runtime capabilities for a project
   */
  async getCapabilities(projectId: string) {
    return {
      projectId,
      supportedComponents: [
        'COMP_DUCKDB',
        'COMP_DUCKDB_UPLOAD',
        'COMP_DUCKDB_INTERFACE',
        'COMP_ECHART',
        'COMP_AGGRID',
        'COMP_HANDSONTABLE',
        'COMP_LEAFLET',
        'COMP_MAPBOX',
      ],
      supportedFeatures: [
        'real_time_generation',
        'context_awareness',
        'streaming_updates',
        'data_visualization',
        'interactive_components',
      ],
      models: ['openai/gpt-oss-120b'],
      maxTokens: 4000,
      avgResponseTime: '2-5 seconds',
    };
  }

  /**
   * Get project context and knowledge base
   */
  private async getProjectContext(projectId: string) {
    // TODO: Add project schema cache integration later
    // For now, just return basic project context
    return {
      projectId,
      schema: 'Project schema integration pending',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Build system prompt for UI generation
   */
  private buildSystemPrompt(projectContext: any): string {
    return `You are a specialized UI generation agent for runtime interfaces. You generate beautiful, functional UI components based on user queries and project context.

${DSL_SCHEMA_DOCUMENTATION}

CORE MISSION:
- Generate UI DSL for runtime interfaces that help users interact with their data
- Focus on practical, actionable interfaces (dashboards, forms, data visualization)
- Prioritize DuckDB components for data analysis when appropriate
- Create responsive, modern interfaces using Tailwind CSS

PROJECT CONTEXT:
${JSON.stringify(projectContext, null, 2)}

DESIGN PRINCIPLES:
- Use modern Tailwind classes for professional appearance
- Include proper spacing: p-4, p-6, gap-4, space-y-4
- Make components interactive with hover states
- Use semantic HTML structure
- Add loading states and error handling where appropriate
- For data queries, use DuckDB components when applicable

CRITICAL REMINDER: Your response must be ONLY the JSON object that matches the DSL schema. No text before or after, no markdown formatting, no explanations.`;
  }

  /**
   * Build user prompt with context
   */
  private buildUserPrompt(request: RuntimeGenerationRequest): string {
    let prompt = `User Query: "${request.query}"

Context:`;

    if (request.context.currentSchema) {
      prompt += `\nCurrent UI Schema: ${JSON.stringify(request.context.currentSchema, null, 2)}`;
    }

    if (request.context.userContext) {
      prompt += `\nUser Context: ${request.context.userContext}`;
    }

    prompt += `\n\nGenerate a UI DSL that directly addresses the user's query. If the query involves data analysis, querying, or file processing, prioritize DuckDB components. Create a complete, functional interface.

IMPORTANT: Respond with ONLY the valid JSON object that matches the DSL schema. Do not include any explanations, markdown formatting, or additional text.`;

    return prompt;
  }

  /**
   * Extract UI JSON from LLM response
   */
  private extractUIFromResponse(content: string): any {
    try {
      // Try to find JSON in the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // If no JSON found, try parsing the entire content
      return JSON.parse(content);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown parsing error';
      throw new Error(
        'Failed to extract valid JSON from response: ' + errorMessage,
      );
    }
  }

  /**
   * Extract explanation from response
   */
  private extractExplanation(content: string): string {
    // Try to find explanation before JSON
    const parts = content.split('{');
    if (parts.length > 1) {
      const beforeJson = parts[0].trim();
      if (beforeJson.length > 10) {
        return beforeJson;
      }
    }
    return 'UI generated based on your query';
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(
    content: string,
    validationPassed: boolean,
  ): number {
    let confidence = validationPassed ? 0.8 : 0.3;

    // Increase confidence if response is well-structured
    if (content.includes('"type"') && content.includes('"props"')) {
      confidence += 0.1;
    }

    // Increase if includes specific components
    if (content.includes('COMP_DUCKDB') || content.includes('COMP_')) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }
}
