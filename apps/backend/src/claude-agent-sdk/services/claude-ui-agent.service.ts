import { Injectable } from '@nestjs/common';
import { query, type Options } from '@anthropic-ai/claude-agent-sdk';
import { ProjectFileManager } from '../utils/project-file-manager';
import { UIComponent } from 'src/types/dsl';

export interface ClaudeUIGenerationRequest {
	prompt: string;
	currentSchema: UIComponent;
	projectId: string;
	uiId: string; // Always provided from frontend
}

export interface ClaudeUIGenerationResponse {
	success: boolean;
	data?: UIComponent;
	uiId?: string;
	jsxFilePath?: string;
	jsonFilePath?: string;
	jsxContent?: string;
	metadata?: {
		projectId: string;
		uiId: string;
		originalPrompt: string;
		executionTime: number;
		claudeVersion: string;
		convertedFromJSX: boolean;
		groqConversionTime?: number;
		conversionError?: string;
	};
	error?: string;
}

@Injectable()
export class ClaudeUIAgentService {
	private projectFileManager: ProjectFileManager;

	constructor() {
		this.projectFileManager = new ProjectFileManager();
	}

	async generateUIWithClaudeAgent(
		request: ClaudeUIGenerationRequest,
		streamCallback?: (chunk: string, eventType?: string) => void
	): Promise<ClaudeUIGenerationResponse> {
		const startTime = Date.now();
		const { prompt, currentSchema, projectId, uiId } = request;

		try {
			if (!prompt || typeof prompt !== 'string') {
				return {
					success: false,
					error: 'Prompt is required and must be a string'
				};
			}

			if (!projectId || typeof projectId !== 'string') {
				return {
					success: false,
					error: 'Project ID is required and must be a string'
				};
			}

			if (!uiId || typeof uiId !== 'string') {
				return {
					success: false,
					error: 'UI ID is required and must be a string'
				};
			}

			if (!currentSchema) {
				return {
					success: false,
					error: 'Current schema is required'
				};
			}

			// Always use the provided uiId
			const projectStructure = await this.projectFileManager.ensureProjectStructure(projectId);
			const uiStructure = await this.projectFileManager.ensureUIStructure(projectId, uiId);

			// Check if ui.tsx already exists to determine create vs edit mode
			const existingJSX = await this.projectFileManager.getJSXFromFile(projectId, uiId);
			const mode = existingJSX ? 'edit' : 'create';

			// Build the Claude Code prompt that lets Claude work with actual files
			const claudePrompt = this.buildClaudeCodePrompt(prompt, uiId, mode);

			// Configure Claude Agent SDK with proper working directory and tools
			const options: Options = {
				allowedTools: ["Read", "Write", "Edit", "Bash", "Grep", "Glob"],
				cwd: projectStructure.projectPath, // This is the key - set working directory to project
				model: "claude-sonnet-4-5",
				maxTurns: 10,
				systemPrompt: {
					type: 'preset',
					preset: 'claude_code',
					append: 'You are a React component developer. Use your file tools to create, read, and edit files. Work within the current project directory and follow the instructions in CLAUDE.md.'
				},
				env: {
					...process.env,
					PROJECT_DIR: projectStructure.projectPath,
					PROJECT_ID: projectId,
					UI_ID: uiId,
					TSX_FILE_PATH: `uis/${uiId}/ui.tsx`
				}
			};

			// Execute Claude Code query with proper project context
			const claudeQuery = query({
				prompt: claudePrompt,
				options: options
			});

			let responseText = '';

			// Stream and process Claude's response
			for await (const message of claudeQuery) {
				if (message.type === 'assistant') {
					const content = typeof message.message.content === 'string'
						? message.message.content
						: message.message.content.map((c: any) => c.type === 'text' ? c.text : '').join('');
					responseText += content;
					if (streamCallback) {
						streamCallback(content);
					}

					// Check for tool uses in the content
					if (Array.isArray(message.message.content)) {
						for (const block of message.message.content) {
							if (block.type === 'tool_use') {
								const toolName = block.name || 'Unknown Tool';
								const toolInput = block.input || {};

								if (streamCallback) {
									// Format tool usage for display
									if (toolName === 'Write' || toolName === 'Edit') {
										const filePath = toolInput.file_path || 'unknown';
										const filePath2 = filePath.split('/').pop();
										streamCallback(`🔨 ${toolName}: ${filePath}`, 'tool_use');
									} else if (toolName === 'Read') {
										const filePath = toolInput.file_path || 'unknown';
										const filePath2 = filePath.split('/').pop();
										streamCallback(`📖 Reading: ${filePath}`, 'tool_use');
									} else if (toolName === 'Bash') {
										const command = toolInput.command || 'unknown';
										const shortCmd = command.length > 50 ? command.substring(0, 50) + '...' : command;
										streamCallback(`⚙️  Bash: ${command}`, 'tool_use');
									} else {
										streamCallback(`🛠️  ${toolName}`, 'tool_use');
									}
								}
							}
						}
					}
				} else if (message.type === 'result') {
					// Tool execution result - acknowledge completion
					if (streamCallback) {
						streamCallback(`✅ Tool execution complete`, 'tool_use');
					}
				}
			}

			// Check if the TSX file was actually created/updated by Claude
			if (streamCallback) {
				streamCallback('📄 Reading generated TSX file...', 'status');
			}
			const tsxContent = await this.projectFileManager.getJSXFromFile(projectId, uiId);

			if (!tsxContent) {
				return {
					success: false,
					error: 'Claude did not create the expected TSX file. Check the logs for errors.'
				};
			}

			if (streamCallback) {
				const tsxLines = tsxContent.split('\n').length;
				const tsxSize = (tsxContent.length / 1024).toFixed(2);
				streamCallback(`✅ TSX file generated successfully (${tsxLines} lines, ${tsxSize} KB)`, 'status');
				streamCallback('🔄 Converting TSX to DSL JSON format...', 'status');
			}
			console.log(`🔄 Converting Claude-generated TSX to DSL for UI ${uiId}...`);

			// Convert TSX to DSL using Claude Agent SDK
			const dslConversionResult = await this.convertTSXToDSL(projectId, uiId, tsxContent, streamCallback);

			let finalDSL: UIComponent;

			if (dslConversionResult.success && dslConversionResult.data) {
				console.log(`✅ TSX to DSL conversion successful for UI ${uiId}`);
				if (streamCallback) {
					const dslJson = JSON.stringify(dslConversionResult.data, null, 2);
					const dslLines = dslJson.split('\n').length;
					const dslSize = (dslJson.length / 1024).toFixed(2);
					streamCallback('✅ TSX to DSL conversion complete!', 'status');
					streamCallback(`📊 DSL JSON generated (${dslLines} lines, ${dslSize} KB)`, 'status');
					streamCallback(`⏱️  Conversion took ${dslConversionResult.conversionTime}ms`, 'status');
				}
				finalDSL = dslConversionResult.data;

				// Ensure the DSL has the correct ID
				finalDSL.id = uiId;
			} else {
				console.warn(`⚠️ TSX to DSL conversion failed for UI ${uiId}, using placeholder DSL:`, dslConversionResult.error);
				if (streamCallback) {
					streamCallback(`⚠️  TSX to DSL conversion failed: ${dslConversionResult.error}`, 'status');
					streamCallback('📦 Using fallback placeholder DSL', 'status');
				}

				// Fallback to placeholder JSON if conversion fails
				finalDSL = {
					id: uiId,
					render: {
						id: `${uiId}-root`,
						type: 'div',
						props: {
							className: 'claude-generated-component',
							'data-tsx-path': uiStructure.uiJsxPath
						},
						children: [`Component ${mode === 'edit' ? 'edited' : 'generated'} by Claude: ${prompt}`]
					},
					data: {}
				};
			}

			const jsonFilePath = await this.projectFileManager.saveUIToFile(projectId, uiId, finalDSL);

			await this.updateProjectContext(projectId, prompt, finalDSL);

			return {
				success: true,
				data: finalDSL,
				uiId: uiId,
				jsxFilePath: uiStructure.uiJsxPath,
				jsonFilePath,
				jsxContent: tsxContent,
				metadata: {
					projectId,
					uiId: uiId,
					originalPrompt: prompt,
					executionTime: Date.now() - startTime,
					claudeVersion: 'claude-sonnet-4-5',
					convertedFromJSX: dslConversionResult.success,
					groqConversionTime: dslConversionResult.conversionTime,
					conversionError: dslConversionResult.success ? undefined : dslConversionResult.error
				}
			};

		} catch (error) {
			console.error('Error in Claude UI agent generation:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error occurred'
			};
		}
	}

	private async convertTSXToDSL(
		projectId: string,
		uiId: string,
		_tsxContent: string, // Unused - Claude Code reads the file directly via Read tool
		streamCallback?: (chunk: string, eventType?: string) => void
	): Promise<{
		success: boolean;
		data?: UIComponent;
		error?: string;
		conversionTime?: number;
	}> {
		const startTime = Date.now();

		try {
			if (streamCallback) {
				streamCallback('🧠 Initializing LLM for TSX→DSL conversion...', 'status');
			}

			const projectStructure = await this.projectFileManager.ensureProjectStructure(projectId);

			// Build the conversion prompt
			const conversionPrompt = `# TSX to DSL Conversion Task

## Your Task
You are a specialized converter that transforms React TSX components into DSL JSON format.

## Instructions
1. **Read the DSL documentation files** in the \`dsl/\` folder:
   - \`dsl/schema.ts\` - Understanding the DSL schema structure
   - \`dsl/doc.md\` - Learning DSL patterns and examples
   - \`dsl/native.md\` - Understanding native components (COMP_ECHART, COMP_AGGRID, etc.)

2. **Read the TSX file** at \`uis/${uiId}/ui.tsx\`

3. **Convert the TSX to DSL JSON** following these rules:
   - Map React components to DSL UIComponent structure
   - Extract component props into the DSL props field
   - Convert state variables to the \`states\` object
   - Convert event handlers to \`methods\` object
   - Convert useEffect hooks to \`effects\` array
   - Map JSX elements to DSL render tree
   - **CRITICAL**: Each element must have BOTH \`id\` field AND \`sa-id\` in props:
     - The \`id\` field is required by DSL schema for element identification
     - The \`sa-id\` must be preserved in the \`props\` object from the TSX
     - Both must be unique within the component
     - Example: \`{"id": "main-container-el", "type": "div", "props": {"sa-id": "main-container", "className": "..."}}\`
   - Use \`$bind\` for data bindings
   - Use \`$exp\` for expressions with \`$deps\` for dependencies
   - For loops should use the \`for\` directive with \`in\`, \`as\`, \`key\`, \`index\`
   - **CRITICAL - Loop Styling Conversion Rules**:
     - **Understanding Renderer Behavior**: The renderer creates the element with \`for\` directive as a CONTAINER, then renders loop items as children inside it
     - **Grid Layouts**: For grid layouts, put the \`for\` directive on the grid container element itself
       - TSX: \`<div className="grid gap-4">{items.map(item => <div className="card-style">...</div>)}</div>\`
       - JSON: Put \`for\` on the grid div, card styling goes in \`children\`
     - **Card/Item Styling**: Individual item styles (backgrounds, borders, shadows, padding) MUST go on the loop \`children\`, NOT on the element with \`for\` directive
       - ✅ CORRECT: \`{"for": {...}, "props": {"className": "grid gap-4"}, "children": {"type": "div", "props": {"className": "bg-white rounded p-5"}}}\`
       - ❌ WRONG: \`{"for": {...}, "props": {"className": "bg-white rounded p-5"}, "children": {...}}\` (creates one card containing all items)
     - **Select/Option Elements**: For \`<select>\` with \`<option>\` elements, the \`for\` loop goes on the option element, NOT the select
       - TSX: \`<select>{options.map(opt => <option key={opt.id} value={opt.value}>{opt.label}</option>)}</select>\`
       - JSON: \`{"type": "select", "children": {"type": "option", "for": {...}, "props": {"value": {"$bind": "opt.value"}}, "children": {"$bind": "opt.label"}}}\`
     - **List Items**: For \`<ul>\`/\`<li>\` structures, \`for\` goes on the \`li\` element
       - TSX: \`<ul>{items.map(item => <li key={item.id}>{item.name}</li>)}</ul>\`
       - JSON: \`{"type": "ul", "children": {"type": "li", "for": {...}, "children": {"$bind": "item.name"}}}\`
   - Conditional rendering should use \`if\`, \`elseIf\`, \`else\`
   - Native components (charts, tables, maps) should use \`COMP_\` prefix
   - Preserve Tailwind v4 CSS classes in the \`className\` prop
   - **CRITICAL - TypeScript Syntax Removal**:
     - Remove ALL TypeScript type annotations from method/effect function strings
     - Convert \`(window as any)\` to just \`window\`
     - Convert \`(variable as Type)\` to just \`variable\`
     - Remove type annotations like \`const x: Type\` → \`const x\`
     - Remove type annotations from function parameters: \`(e: Event)\` → \`(e)\`
     - The JSON must contain ONLY valid JavaScript, not TypeScript
     - Example: \`"fn": "async () => { const result = await window.SA.queryExecutor.executeQuery('...'); }"\`

4. **Write the DSL JSON** to \`uis/${uiId}/ui.json\`

5. **Important**: The JSON must have this exact structure:
\`\`\`json
{
  "id": "${uiId}",
  "name": "ComponentName",
  "props": {},
  "states": {},
  "methods": {},
  "effects": [],
  "data": {},
  "render": {
    "id": "root-element",
    "type": "div",
    "props": {
      "sa-id": "main-container",
      "className": "..."
    },
    "children": [
      {
        "id": "child-element",
        "type": "div",
        "props": {
          "sa-id": "child-container",
          "className": "..."
        }
      }
    ]
  }
}
\`\`\`

**Note**: Every element has:
- \`id\` field (DSL requirement) - unique identifier for DSL
- \`sa-id\` in props (from TSX) - unique identifier for UI elements

## Process
1. Use **Read** tool to read \`dsl/schema.ts\`, \`dsl/doc.md\`, and \`dsl/native.md\`
2. Use **Read** tool to read the TSX file at \`uis/${uiId}/ui.tsx\`
3. Analyze the TSX structure and convert to DSL format
4. Use **Write** tool to save the DSL JSON to \`uis/${uiId}/ui.json\`
5. Ensure the JSON is valid and follows the schema exactly

Start the conversion now.`;

			// Configure Claude Agent SDK for conversion
			const options: Options = {
				allowedTools: ["Read", "Write", "Glob"],
				cwd: projectStructure.projectPath,
				model: "claude-sonnet-4-5",
				maxTurns: 8,
				systemPrompt: {
					type: 'preset',
					preset: 'claude_code',
					append: 'You are a TSX to DSL converter. Read the DSL documentation and convert the TSX file to DSL JSON format exactly as specified.'
				},
				env: {
					...process.env,
					PROJECT_DIR: projectStructure.projectPath,
					PROJECT_ID: projectId,
					UI_ID: uiId
				}
			};

			// Execute conversion
			const claudeQuery = query({
				prompt: conversionPrompt,
				options: options
			});

			let responseText = '';
			for await (const message of claudeQuery) {
				if (message.type === 'assistant') {
					const content = typeof message.message.content === 'string'
						? message.message.content
						: message.message.content.map((c: any) => c.type === 'text' ? c.text : '').join('');
					responseText += content;
				}
			}

			// Read the generated DSL JSON
			const dslData = await this.projectFileManager.getUIFromFile(projectId, uiId);

			if (!dslData) {
				return {
					success: false,
					error: 'Failed to read converted DSL JSON file'
				};
			}

			// Ensure the DSL has the correct ID
			dslData.id = uiId;

			return {
				success: true,
				data: dslData,
				conversionTime: Date.now() - startTime
			};

		} catch (error) {
			console.error('Error converting TSX to DSL:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown conversion error',
				conversionTime: Date.now() - startTime
			};
		}
	}

	private buildClaudeCodePrompt(prompt: string, uiId: string, mode: 'create' | 'edit' = 'create'): string {
		if (mode === 'edit') {
			return `# React Component Editing Task

## User Request
${prompt}

## Your Task
You are working within a project directory. The user wants to **ADD TO** or **MODIFY** an existing React component.

**🚨 CRITICAL: DO NOT REPLACE THE ENTIRE COMPONENT! You must PRESERVE all existing elements and ADD new ones.**

1. **First, read the CLAUDE.md file** to understand the project structure and guidelines
2. **Read the existing component** at the path: \`uis/${uiId}/ui.tsx\`
3. **Understand the current component structure** and implementation
4. **Add or modify** according to the user's request while **keeping all existing elements**

## Editing Guidelines
When the user says:
- "add a login form **to this component**" → Add the login form AS PART OF the existing component, keeping all existing elements
- "add X to the component" → Insert X into the existing structure, preserving everything else
- "modify the button" → Only change the button, keep everything else
- "replace the component with X" → Only then replace the entire component

**Default behavior: ADDITIVE, not REPLACEMENT**

## Component Requirements
- **PRESERVE ALL EXISTING ELEMENTS** - Keep all existing JSX, state, hooks, and logic unless explicitly asked to remove them
- When adding new elements, integrate them into the existing component structure
- Maintain React functional component structure with hooks
- Keep the default export
- Make modifications responsive and accessible using Tailwind CSS
- Follow existing naming conventions and patterns
- **IMPORTANT: Use ONLY Tailwind v4 CSS classes for styling** - replace any inline styles or custom CSS with Tailwind v4 utilities
- Use Tailwind v4's responsive prefixes (sm:, md:, lg:, xl:, 2xl:) for responsive design
- Apply appropriate Tailwind v4 utility classes for colors, spacing, typography, layout, etc.
- **CRITICAL: Add unique \`sa-id\` attribute to EVERY element in the component**
  - Every HTML element (div, button, span, input, etc.) must have a unique \`sa-id\` attribute
  - Use descriptive names like \`sa-id="header-title"\`, \`sa-id="submit-button"\`, \`sa-id="user-list-container"\`
  - Ensure sa-id values are unique within the component
  - Example: \`<div sa-id="main-container" className="flex flex-col">\`

## Responsive Grid Guidelines for LIST UIs
When creating or editing LIST components (users list, products list, database overview, etc.):
- **Grid Layout**: Use responsive grid with proper breakpoints
  - Mobile (default): 1 column - \`grid-cols-1\`
  - Small screens (640px+): 2 columns - \`sm:grid-cols-2\`
  - Large screens (1024px+): 3 columns - \`lg:grid-cols-3\`
  - Extra large (1280px+): 4 columns - \`xl:grid-cols-4\`
  - Example: \`className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"\`
- **Card Spacing**: Use smaller gaps for better density - \`gap-4\` (1rem) instead of \`gap-6\`
- **Card Design**:
  - Use \`bg-white\` for cards on \`bg-[#d4dce6]\` background
  - Add proper padding: \`p-5\` or \`p-6\`
  - Use \`flex flex-col\` to ensure consistent card heights
  - Add hover effects: \`hover:shadow-lg transition-all\`

## 🚨 CRITICAL: Loop Placement for Grid Layouts
**IMPORTANT**: When using loops with grid layouts, the loop (map/for) MUST be on the SAME element that has the grid classes.

**TSX - CORRECT** ✅:
\`\`\`tsx
<div sa-id="users-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {users.map((user) => (
    <div key={user.id} className="bg-white rounded-lg p-5">
      {/* Card content */}
    </div>
  ))}
</div>
\`\`\`

**TSX - WRONG** ❌:
\`\`\`tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  <div>
    {users.map((user) => <div key={user.id}>...</div>)}
  </div>
</div>
\`\`\`

**Why**: Adding a wrapper element between the grid container and grid items breaks CSS Grid layout.
- **Content Visibility**: Ensure all content is visible
  - Use \`truncate\` only for long text that should be cut off
  - Use \`space-y-3\` or \`space-y-4\` for vertical spacing between elements
  - Don't hide important information - make cards taller if needed
- **Typography**:
  - Card titles: \`text-lg font-bold\`
  - Secondary text: \`text-sm\`
  - Labels: \`text-xs\` or \`text-sm\`

## Process
1. Use the **Read** tool to check CLAUDE.md for project guidelines
2. Use the **Read** tool to examine the existing component at \`uis/${uiId}/ui.tsx\`
3. **IMPORTANT**: Use the **Edit** tool (NOT Write) to modify specific parts of the TSX file
4. If adding new elements, use Edit to insert them while preserving existing code
5. Ensure modifications follow the project's established patterns

## Important
- Work within the current directory (the project root)
- Use your file manipulation tools (Read, Write, Edit, Glob, Grep)
- **USE EDIT TOOL, NOT WRITE TOOL** - Edit preserves existing code, Write replaces everything
- The file path is relative: \`uis/${uiId}/ui.tsx\`
- **When in doubt, ADD rather than REPLACE**

Start by reading the CLAUDE.md file and the existing component, then make the requested modifications using the Edit tool.`;
		} else {
			return `# React Component Generation Task

## User Request
${prompt}

## Your Task
You are working within a project directory. Please use your file tools to:

1. **First, read the CLAUDE.md file** to understand the project structure and guidelines
2. **Check if there are existing components** by listing the uis/ directory to see patterns
3. **Create a React component** at the path: \`uis/${uiId}/ui.tsx\`

## Component Requirements
- Use modern React functional components with hooks
- Export the component as default
- Include proper imports (React, hooks, etc.)
- Make it responsive and accessible using Tailwind CSS
- Use descriptive component names based on functionality
- **IMPORTANT: Use ONLY Tailwind v4 CSS classes for styling** - no inline styles or custom CSS
- Use Tailwind v4's responsive prefixes (sm:, md:, lg:, xl:, 2xl:) for responsive design
- Apply appropriate Tailwind v4 utility classes for colors, spacing, typography, layout, etc.
- **CRITICAL: Add unique \`sa-id\` attribute to EVERY element in the component**
  - Every HTML element (div, button, span, input, etc.) must have a unique \`sa-id\` attribute
  - Use descriptive names like \`sa-id="header-title"\`, \`sa-id="submit-button"\`, \`sa-id="user-list-container"\`
  - Ensure sa-id values are unique within the component
  - Example: \`<div sa-id="main-container" className="flex flex-col">\`

## Responsive Grid Guidelines for LIST UIs
When creating LIST components (users list, products list, database overview, etc.):
- **Grid Layout**: Use responsive grid with proper breakpoints
  - Mobile (default): 1 column - \`grid-cols-1\`
  - Small screens (640px+): 2 columns - \`sm:grid-cols-2\`
  - Large screens (1024px+): 3 columns - \`lg:grid-cols-3\`
  - Extra large (1280px+): 4 columns - \`xl:grid-cols-4\`
  - Example: \`className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"\`
- **Card Spacing**: Use smaller gaps for better density - \`gap-4\` (1rem) instead of \`gap-6\`
- **Card Design**:
  - Use \`bg-white\` for cards on \`bg-[#d4dce6]\` background
  - Add proper padding: \`p-5\` or \`p-6\`
  - Use \`flex flex-col\` to ensure consistent card heights
  - Add hover effects: \`hover:shadow-lg transition-all\`

## 🚨 CRITICAL: Loop Placement for Grid Layouts
**IMPORTANT**: When using loops with grid layouts, the \`for\` directive MUST be on the SAME element that has the grid classes.

**CORRECT** ✅:
\`\`\`tsx
<div sa-id="users-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {users.map((user) => (
    <div key={user.id} className="bg-white rounded-lg p-5">
      {/* Card content */}
    </div>
  ))}
</div>
\`\`\`

**JSON DSL CORRECT** ✅:
\`\`\`json
{
  "id": "users-grid",
  "type": "div",
  "props": {
    "sa-id": "users-grid",
    "className": "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
  },
  "for": {
    "in": { "$bind": "users" },
    "as": "user",
    "key": "user.id"
  },
  "children": {
    "id": "user-card",
    "type": "div",
    "props": { "className": "bg-white rounded-lg p-5" },
    "children": [/* card content */]
  }
}
\`\`\`

**WRONG** ❌ - DO NOT DO THIS:
\`\`\`tsx
<div sa-id="users-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  <div sa-id="loop-wrapper">
    {users.map((user) => (
      <div key={user.id} className="bg-white rounded-lg p-5">
        {/* Card content */}
      </div>
    ))}
  </div>
</div>
\`\`\`

**JSON DSL WRONG** ❌ - DO NOT DO THIS:
\`\`\`json
{
  "id": "users-grid",
  "type": "div",
  "props": {
    "className": "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
  },
  "children": {
    "id": "loop-wrapper",
    "type": "div",
    "for": { "in": { "$bind": "users" }, "as": "user" },
    "children": {/* card */}
  }
}
\`\`\`

**Why this matters**: Adding a wrapper element between the grid container and the grid items breaks the CSS Grid layout. The loop must be directly on the grid container.

## 🚨 CRITICAL: Conditional Rendering Structure (if/elseIf/else)

**IMPORTANT**: When converting TSX with multiple if/else returns, you MUST use NESTED conditionals, NOT a flat if/elseIf/else structure.

### TSX Pattern (Multiple Early Returns):
\`\`\`tsx
if (isLoading) {
  return <div className="loading">Loading...</div>
}

if (error) {
  return <div className="error">Error: {error}</div>
}

return <div className="main">Main Content...</div>
\`\`\`

### ❌ WRONG - Flat Structure (Root element shows loading + error content):
\`\`\`json
{
  "id": "root-el",
  "type": "div",
  "if": { "$exp": "isLoading", "$deps": ["isLoading"] },
  "elseIf": { "$exp": "error", "$deps": ["error"] },
  "else": {
    "id": "error-container",
    "children": "Error message"
  },
  "props": { "className": "loading" },
  "children": "Loading..."
}
\`\`\`
**Problem**: The root element represents BOTH loading (if true) AND error (elseIf true). They share the same element!

### ✅ CORRECT - Nested Structure (Each condition has its own complete element):
\`\`\`json
{
  "id": "root-el",
  "type": "div",
  "if": { "$exp": "isLoading", "$deps": ["isLoading"] },
  "else": {
    "id": "error-check-el",
    "type": "div",
    "if": { "$exp": "error", "$deps": ["error"] },
    "else": {
      "id": "main-content-el",
      "type": "div",
      "props": { "sa-id": "main-container", "className": "main" },
      "children": [
        { "id": "header-el", "type": "div", "children": "Header" },
        { "id": "content-el", "type": "div", "children": "Content" }
      ]
    },
    "props": { "sa-id": "error-container", "className": "error" },
    "children": {
      "id": "error-message-el",
      "type": "div",
      "children": { "$bind": "error" }
    }
  },
  "props": { "sa-id": "loading-container", "className": "loading" },
  "children": {
    "id": "loading-spinner-el",
    "type": "div",
    "children": "Loading..."
  }
}
\`\`\`

**Key Rules**:
1. **Each condition level needs its own complete element structure** with props, className, and children
2. **Root element** = content shown when \`if\` is TRUE
3. **else object** = complete element structure shown when \`if\` is FALSE
4. **For 3+ states**, nest the conditionals: if > else > if > else > main content

**Renderer Logic**:
- When \`if: isLoading\` is TRUE: renders root element (props + children)
- When \`if: isLoading\` is FALSE: renders \`else\` object as a new element
- The \`else\` object can have its own \`if/else\` for the next condition

**Simple if/else** (Only 2 states):
\`\`\`json
{
  "id": "root-el",
  "type": "div",
  "if": { "$exp": "isLoading", "$deps": ["isLoading"] },
  "else": {
    "id": "content-el",
    "type": "div",
    "props": { "sa-id": "main", "className": "content" },
    "children": "Content here"
  },
  "props": { "sa-id": "loading", "className": "loading" },
  "children": "Loading..."
}
\`\`\`

- **Content Visibility**: Ensure all content is visible
  - Use \`truncate\` only for long text that should be cut off
  - Use \`space-y-3\` or \`space-y-4\` for vertical spacing between elements
  - Don't hide important information - make cards taller if needed
- **Typography**:
  - Card titles: \`text-lg font-bold\`
  - Secondary text: \`text-sm\`
  - Labels: \`text-xs\` or \`text-sm\`

## Process
1. Use the **Read** tool to check CLAUDE.md for project guidelines
2. Use the **Glob** or **Read** tool to check existing components for patterns
3. Use the **Write** tool to create the TSX file at \`uis/${uiId}/ui.tsx\`
4. Ensure the component follows the project's established patterns

## Important
- Work within the current directory (the project root)
- Use your file manipulation tools (Read, Write, Edit, Glob, Grep)
- Follow any existing patterns you find in the project
- The file path is relative: \`uis/${uiId}/ui.tsx\`

Start by reading the CLAUDE.md file to understand the project context, then create the component.`;
		}
	}


	async getJSXContent(projectId: string, uiId: string): Promise<{
		success: boolean;
		jsxContent?: string;
		error?: string;
	}> {
		try {
			const jsxContent = await this.projectFileManager.getJSXFromFile(projectId, uiId);

			if (!jsxContent) {
				return {
					success: false,
					error: 'JSX file not found'
				};
			}

			return {
				success: true,
				jsxContent
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			};
		}
	}

	private async updateProjectContext(
		projectId: string,
		prompt: string,
		generatedUI: UIComponent
	): Promise<void> {
		try {
			const existingContext = await this.projectFileManager.getDSLContext(projectId) || {};

			const updatedContext = {
				...existingContext,
				lastGeneration: {
					prompt,
					uiId: generatedUI.id,
					timestamp: new Date().toISOString(),
					componentType: generatedUI.render?.type || 'unknown'
				},
				generationHistory: [
					...(existingContext.generationHistory || []),
					{
						prompt,
						uiId: generatedUI.id,
						timestamp: new Date().toISOString()
					}
				].slice(-10)
			};

			await this.projectFileManager.saveDSLContext(projectId, updatedContext);
		} catch (error) {
			console.error('Failed to update project context:', error);
		}
	}

	async getUIHistory(projectId: string): Promise<{
		success: boolean;
		data?: any[];
		error?: string;
	}> {
		try {
			const uiIds = await this.projectFileManager.listUIsForProject(projectId);
			const uiHistory = [];

			for (const uiId of uiIds) {
				const uiData = await this.projectFileManager.getUIFromFile(projectId, uiId);
				if (uiData) {
					uiHistory.push({
						uiId,
						metadata: uiData.metadata,
						componentType: uiData.render?.type || 'unknown'
					});
				}
			}

			return {
				success: true,
				data: uiHistory.sort((a, b) =>
					new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime()
				)
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			};
		}
	}

	async getUIById(projectId: string, uiId: string): Promise<{
		success: boolean;
		data?: UIComponent;
		error?: string;
	}> {
		try {
			const uiData = await this.projectFileManager.getUIFromFile(projectId, uiId);

			if (!uiData) {
				return {
					success: false,
					error: 'UI not found'
				};
			}

			return {
				success: true,
				data: uiData
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			};
		}
	}

	async deleteUI(projectId: string, uiId: string): Promise<{
		success: boolean;
		error?: string;
	}> {
		try {
			const deleted = await this.projectFileManager.deleteUI(projectId, uiId);

			if (!deleted) {
				return {
					success: false,
					error: 'Failed to delete UI or UI not found'
				};
			}

			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			};
		}
	}

	async getProjectInfo(projectId: string): Promise<{
		success: boolean;
		data?: any;
		error?: string;
	}> {
		try {
			const projectInfo = await this.projectFileManager.getProjectInfo(projectId);
			const dslContext = await this.projectFileManager.getDSLContext(projectId);

			return {
				success: true,
				data: {
					...projectInfo,
					dslContext
				}
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			};
		}
	}

	async healthCheck(): Promise<{
		healthy: boolean;
		services: {
			claudeAgent: boolean;
			fileManager: boolean;
		};
		issues: string[];
	}> {
		const issues: string[] = [];

		let claudeAgentHealthy = true;
		try {
			const sdkModule = await import('@anthropic-ai/claude-agent-sdk');
			if (!sdkModule.query) {
				claudeAgentHealthy = false;
				issues.push('Claude Agent SDK query function not available');
			}
		} catch (error) {
			claudeAgentHealthy = false;
			issues.push('Claude Agent SDK unavailable');
		}

		let fileManagerHealthy = true;
		try {
			await this.projectFileManager.ensureProjectsRoot();
		} catch (error) {
			fileManagerHealthy = false;
			issues.push('File manager unavailable');
		}

		return {
			healthy: issues.length === 0,
			services: {
				claudeAgent: claudeAgentHealthy,
				fileManager: fileManagerHealthy
			},
			issues
		};
	}
}