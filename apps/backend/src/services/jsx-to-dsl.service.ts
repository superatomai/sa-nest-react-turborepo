import { Injectable } from '@nestjs/common';
import { UIComponent } from 'src/types/dsl';
import OpenAI from 'openai';
import { GROQ_API_KEY } from '../env';

export interface JSXToDSLRequest {
	jsxContent: string;
	projectId?: string;
	uiId?: string;
}

export interface JSXToDSLResponse {
	success: boolean;
	data?: UIComponent;
	originalJSX?: string;
	metadata?: {
		projectId?: string;
		uiId?: string;
		conversionTime: number;
		provider: string;
	};
	error?: string;
}

@Injectable()
export class JSXToDSLService {
	private groq: OpenAI | null = null;

	constructor() {
		// Initialize Groq
		if (GROQ_API_KEY) {
			this.groq = new OpenAI({
				apiKey: GROQ_API_KEY,
				baseURL: 'https://api.groq.com/openai/v1'
			});
			console.log('✅ JSX to DSL - Groq client initialized');
		} else {
			console.warn('⚠️ JSX to DSL - GROQ_API_KEY not found, Groq client not initialized');
		}
	}

	async convertJSXToDSL(request: JSXToDSLRequest): Promise<JSXToDSLResponse> {
		const startTime = Date.now();
		const { jsxContent, projectId, uiId } = request;

		try {
			if (!jsxContent || typeof jsxContent !== 'string') {
				return {
					success: false,
					error: 'JSX content is required and must be a string'
				};
			}

			console.log(`🔄 Converting JSX to DSL for ${projectId ? `project ${projectId}` : 'standalone conversion'}${uiId ? ` UI ${uiId}` : ''}`);

			// Build the conversion prompt
			const conversionPrompt = this.buildConversionPrompt(jsxContent);

			// Use Groq LLM for conversion
			if (!this.groq) {
				return {
					success: false,
					error: 'Groq API key not configured. Please set GROQ_API_KEY environment variable.'
				};
			}

			const response = await this.groq.chat.completions.create({
				model: 'openai/gpt-oss-120b',
				messages: [
					{
						role: 'system',
						content: `You are an expert React developer and DSL converter specialized in converting JSX components to UIComponent DSL format.

CRITICAL INSTRUCTIONS:
1. Follow the EXACT UIComponent schema provided in the user prompt
2. Convert ALL React hooks (useState, useEffect) to DSL equivalents
3. Extract ALL event handlers to methods object
4. Preserve ALL component functionality and structure
5. Generate unique descriptive IDs for every element
6. Convert dynamic expressions to $exp with $deps arrays
7. Use proper data binding with $bind for simple variable references
8. Convert conditional rendering to if/else DSL structure
9. Convert .map() loops to "for" directive structure
10. Return ONLY valid JSON - no explanatory text or code blocks

Native Components Available:
- COMP_ECHART: Interactive charts and visualizations
- COMP_AGGRID: Enterprise data grids with sorting/filtering
- COMP_LEAFLET: Interactive maps with markers
- COMP_PDF_VIEWER: PDF document display
- COMP_MARKDOWN: Markdown content rendering
- COMP_ICONIFY_ICON: Icon library components
- COMP_DUCKDB_INTERFACE: Database query interface

Schema Compliance:
- id: Required string for every element
- type: HTML element or COMP_ component
- props: All attributes (className, style, etc.)
- states: Extract from useState hooks
- effects: Extract from useEffect hooks
- methods: Extract from function definitions
- render: Main UI element tree
- children: String, UIElement, or Array of UIElements`
					},
					{
						role: 'user',
						content: conversionPrompt
					}
				],
				temperature: 0.1,
				max_tokens: 4000,
				stream: false
			});

			const llmResponse = response.choices[0]?.message?.content;

			if (!llmResponse) {
				return {
					success: false,
					error: 'No response from Groq LLM'
				};
			}

			// Parse the LLM response to extract DSL JSON
			const dslData = this.extractDSLFromResponse(llmResponse);

			if (!dslData) {
				return {
					success: false,
					error: 'Failed to extract valid DSL from LLM response'
				};
			}

			console.log(`✅ JSX to DSL conversion completed in ${Date.now() - startTime}ms`);

			return {
				success: true,
				data: dslData,
				originalJSX: jsxContent,
				metadata: {
					projectId,
					uiId,
					conversionTime: Date.now() - startTime,
					provider: 'groq'
				}
			};

		} catch (error) {
			console.error('Error in JSX to DSL conversion:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error occurred'
			};
		}
	}

	private buildConversionPrompt(jsxContent: string): string {
		return `# JSX to UIComponent DSL Conversion Task

You are an expert React developer converting JSX components to a specific UIComponent DSL format. Follow the exact schema and patterns below.

## Input JSX Component:
\`\`\`jsx
${jsxContent}
\`\`\`

## UIComponent DSL Schema:
The UIComponent must follow this EXACT Zod schema structure:

\`\`\`typescript
UIComponent = {
  id: string,                    // Unique component identifier
  name?: string,                 // Optional component name
  props?: Record<string, any>,   // Component props/parameters
  states?: Record<string, any>,  // Component state (useState values)
  methods?: Record<string, {     // Event handlers and functions
    fn: string,                  // Function body as string
    params?: Record<string, any> // Optional parameters
  }>,
  effects?: Array<{              // useEffect hooks
    fn: string,                  // Effect function as string
    deps?: string[]              // Dependency array
  }>,
  data?: Record<string, any>,    // Static data and variables
  render: UIElement,             // Main render tree
  query?: QuerySpec             // Optional data queries
}

UIElement = {
  id: string,                    // Unique element ID
  type: string,                  // Element type (div, button, span, etc.)
  key?: string | Expression,     // React key
  props?: Record<string, any>,   // Element props (className, style, etc.)

  // Conditionals
  if?: Expression,               // Conditional rendering
  elseIf?: Expression,          // Else-if condition
  else?: UIElement,             // Else element

  // Loops
  for?: {                       // For directive
    in: string | Expression | Binding,
    as: string,
    key?: string,
    index?: string
  },

  // Navigation
  "link-to"?: string | Expression | Binding | {
    ui: string | Expression | Binding,
    params?: Record<string, any>
  },

  children?: any,               // String, UIElement, or Array

  // Platform overrides
  platform?: {
    web?: Partial<UIElement>,
    ios?: Partial<UIElement>,
    android?: Partial<UIElement>
  }
}

Expression = {
  $exp: string,                 // JavaScript expression
  $deps?: string[]              // Dependencies
}

Binding = {
  $bind: string                 // Data binding path
}
\`\`\`

## Supported Element Types:
- **HTML**: div, span, button, input, select, option, a, img, h1-h6, p, ul, li, table, tr, td, th
- **Native Components**: Use "COMP_" prefix for special components:
  - COMP_ECHART (charts), COMP_AGGRID (data tables), COMP_LEAFLET (maps)
  - COMP_PDF_VIEWER, COMP_MARKDOWN, COMP_ICONIFY_ICON, COMP_DUCKDB_INTERFACE

## Conversion Rules:

### 1. Component Structure:
- Extract component name from function/class name
- Convert useState to \`states\` object
- Convert useEffect to \`effects\` array
- Convert event handlers to \`methods\` object

### 2. State Extraction:
\`\`\`jsx
const [count, setCount] = useState(0);
\`\`\`
→
\`\`\`json
"states": {
  "count": 0
}
\`\`\`

### 3. Effects Extraction:
\`\`\`jsx
useEffect(() => {
  fetchData();
}, [userId]);
\`\`\`
→
\`\`\`json
"effects": [{
  "fn": "() => { fetchData(); }",
  "deps": ["userId"]
}]
\`\`\`

### 4. Event Handlers:
\`\`\`jsx
const handleClick = () => setCount(count + 1);
<button onClick={handleClick}>
\`\`\`
→
\`\`\`json
"methods": {
  "handleClick": {
    "fn": "() => setState('count', count + 1)"
  }
},
"props": {
  "onClick": "handleClick"
}
\`\`\`

### 5. Dynamic Content:
\`\`\`jsx
<span>{user.name}</span>
\`\`\`
→
\`\`\`json
"children": {
  "$bind": "user.name"
}
\`\`\`

### 6. Expressions:
\`\`\`jsx
<div>{count > 0 ? 'Positive' : 'Zero or negative'}</div>
\`\`\`
→
\`\`\`json
"children": {
  "$exp": "count > 0 ? 'Positive' : 'Zero or negative'",
  "$deps": ["count"]
}
\`\`\`

### 7. Conditional Rendering:
\`\`\`jsx
{isLoggedIn && <div>Welcome!</div>}
\`\`\`
→
\`\`\`json
{
  "id": "welcome-message",
  "type": "div",
  "if": {
    "$exp": "isLoggedIn",
    "$deps": ["isLoggedIn"]
  },
  "children": "Welcome!"
}
\`\`\`

### 8. Lists/Maps:
\`\`\`jsx
{users.map(user => <div key={user.id}>{user.name}</div>)}
\`\`\`
→
\`\`\`json
{
  "id": "user-list",
  "type": "div",
  "for": {
    "in": {"$bind": "users"},
    "as": "user",
    "key": "user.id"
  },
  "children": {
    "id": "user-item",
    "type": "div",
    "children": {"$bind": "user.name"}
  }
}
\`\`\`

## Important Notes:
1. Generate unique IDs for ALL elements using descriptive names
2. Preserve ALL functionality - state, effects, handlers
3. Convert React patterns to DSL equivalents
4. Use setState() calls in method functions for state updates
5. Extract static data to \`data\` object
6. Convert complex expressions to \`$exp\` with \`$deps\`

## Response Format:
Return ONLY the valid UIComponent JSON. No explanatory text, no code blocks, no markdown. Just pure JSON starting with { and ending with }.

Begin conversion:`;
	}

	private extractDSLFromResponse(llmResponse: string): UIComponent | null {
		try {
			console.log('🔍 Extracting DSL from LLM response...');

			// Try to find JSON content in the response
			let jsonContent = llmResponse.trim();

			// Remove code block markers if present
			if (jsonContent.startsWith('```json')) {
				jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
			} else if (jsonContent.startsWith('```')) {
				jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
			}

			// Remove any leading/trailing text and extract the main JSON object
			const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				jsonContent = jsonMatch[0];
			}

			// Try to clean up common LLM response issues
			jsonContent = jsonContent
				.replace(/^\s*Here[\s\S]*?:\s*/, '') // Remove "Here is the converted DSL:"
				.replace(/^\s*```[\s\S]*?\n/, '') // Remove any remaining code block starts
				.replace(/\n```\s*$/, '') // Remove code block ends
				.trim();

			console.log('📝 Parsing JSON content:', jsonContent.substring(0, 200) + '...');

			// Parse the JSON
			const parsed = JSON.parse(jsonContent);

			// Validate that it's a proper UIComponent
			if (parsed && typeof parsed === 'object') {
				// Check for required UIComponent fields
				if (parsed.id && parsed.render) {
					console.log('✅ Valid UIComponent structure detected');
					return parsed as UIComponent;
				} else {
					console.warn('⚠️ Invalid UIComponent structure - missing required fields (id, render)');
					return null;
				}
			}

			console.warn('⚠️ Parsed content is not a valid object');
			return null;
		} catch (error) {
			console.error('❌ Failed to parse DSL from LLM response:', error);
			console.error('Raw response length:', llmResponse.length);
			console.error('Raw response preview:', llmResponse.substring(0, 500));
			return null;
		}
	}

	async healthCheck(): Promise<{
		healthy: boolean;
		services: {
			groq: boolean;
		};
		issues: string[];
	}> {
		const issues: string[] = [];

		// Check Groq service
		let groqHealthy = true;
		try {
			if (!this.groq) {
				groqHealthy = false;
				issues.push('Groq API key not configured');
			}
		} catch (error) {
			groqHealthy = false;
			issues.push('Groq service unavailable');
		}

		return {
			healthy: issues.length === 0,
			services: {
				groq: groqHealthy
			},
			issues
		};
	}
}