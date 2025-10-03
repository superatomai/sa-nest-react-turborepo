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
			const conversionPrompt = `# Convert TSX to DSL JSON

## Task
1. Read DSL docs: \`dsl/schema.ts\`, \`dsl/doc.md\`, \`dsl/native.md\`
2. Read TSX: \`uis/${uiId}/ui.tsx\`
3. Convert to DSL JSON and write to \`uis/${uiId}/ui.json\`

## Conversion Rules

### Element Structure
- **id field** (required): Unique DSL identifier like \`"main-container-el"\`
- **sa-id in props** (required): Preserve from TSX like \`"props": {"sa-id": "main-container"}\`
- Both must be unique within component

### Component Mapping
- **States**: \`const [x, setX] = useState()\` → \`"states": {"x": {...}}\`
- **Methods**: Event handlers → \`"methods": {"handleClick": {"fn": "() => {...}"}}\`
- **Effects**: \`useEffect\` → \`"effects": [{"fn": "() => {...}", "deps": [...]}]\`
- **Data binding**: \`{user.name}\` → \`{"$bind": "user.name"}\`
- **Expressions**: \`{count + 1}\` → \`{"$exp": "count + 1", "$deps": ["count"]}\`

### Loops (CRITICAL)
- **Put \`for\` on the SAME element that has grid/list classes**
- Grid: \`<div className="grid gap-4">{items.map(...)}</div>\` → \`{"for": {...}, "props": {"className": "grid gap-4"}, "children": {...}}\`
- Select: \`<select>{opts.map(...)}</select>\` → \`{"type": "select", "children": {"type": "option", "for": {...}}}\`
- List: \`<ul>{items.map(...)}</ul>\` → \`{"type": "ul", "children": {"li", "for": {...}}}\`

### Conditionals (CRITICAL)
- **Multiple early returns = NESTED structure**
- TSX: \`if (loading) return <div>Loading</div>\` then \`if (error) return <div>Error</div>\`
- JSON: \`{"if": loading, "props": {...}, "children": "Loading", "else": {"if": error, "props": {...}, "children": "Error", "else": {...}}}\`
- Root element = content when \`if\` is TRUE
- \`else\` object = complete element when \`if\` is FALSE

### TypeScript Cleanup
- Remove ALL TypeScript: \`(window as any)\` → \`window\`, \`const x: Type\` → \`const x\`, \`(e: Event)\` → \`(e)\`
- Keep only valid JavaScript in function strings

## Output Structure
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
    "id": "root-el",
    "type": "div",
    "props": {"sa-id": "main-container", "className": "..."},
    "children": [...]
  }
}
\`\`\`

Start conversion now.`;

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
			return `# Edit React Component

## User Request
${prompt}

## Task
1. Read \`CLAUDE.md\` for project guidelines
2. Read existing component at \`uis/${uiId}/ui.tsx\`
3. **Use Edit tool (NOT Write)** to modify the component
4. **PRESERVE all existing elements** unless explicitly asked to remove them

## Editing Behavior
- **Default: ADD, not REPLACE** - Keep all existing JSX, state, and hooks
- "add X to the component" → Insert X while preserving everything else
- "modify Y" → Only change Y, keep the rest
- "replace with Z" → Only then replace entire component

## TSX Requirements
1. **Unique \`sa-id\` on EVERY element** - Use descriptive names like \`sa-id="header-title"\`
2. **Tailwind v4 CSS only** - Use classes like \`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4\`
3. **Grid layouts: Loop on grid container** - \`{items.map(...)}\` must be directly inside the element with \`grid\` class
4. **Functional component with hooks** - Keep default export

## Grid Layout Pattern
\`\`\`tsx
<div sa-id="items-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map((item) => (
    <div key={item.id} className="bg-white rounded-lg p-5">
      {/* Card content */}
    </div>
  ))}
</div>
\`\`\`

Start by reading the files, then use Edit tool to make changes.`;
		} else {
			return `# Create React Component

## User Request
${prompt}

## Task
1. Read \`CLAUDE.md\` for project guidelines
2. Check \`uis/\` directory for existing patterns
3. Create component at \`uis/${uiId}/ui.tsx\`

## TSX Requirements
1. **Unique \`sa-id\` on EVERY element** - Use descriptive names like \`sa-id="header-title"\`
2. **Tailwind v4 CSS only** - Use responsive classes like \`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4\`
3. **Grid layouts: Loop on grid container** - \`{items.map(...)}\` must be directly inside the element with \`grid\` class
4. **Functional component with hooks** - Include default export

## Grid Layout Pattern
\`\`\`tsx
<div sa-id="items-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map((item) => (
    <div key={item.id} className="bg-white rounded-lg p-5">
      {/* Card content */}
    </div>
  ))}
</div>
\`\`\`

Start by reading the files, then create the component.`;
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