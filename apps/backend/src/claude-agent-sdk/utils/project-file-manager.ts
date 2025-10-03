import * as fs from 'fs/promises';
import * as path from 'path';
import { getNanoid } from '../../utils/nanoid';

export interface ProjectStructure {
	projectPath: string;
	dslPath: string;
	designPath: string;
	apiPath: string;
	databasePath: string;
	uisPath: string;
	claudeMdPath: string;
	claudeConfigPath: string;
}

export interface UIFileStructure {
	uiPath: string;
	uiJsonPath: string;
	uiJsxPath: string;
}

export class ProjectFileManager {
	private readonly projectsRoot: string;

	constructor() {
		  // Always resolve relative to project root (where Node is started)
  		this.projectsRoot = path.join(process.cwd(), '.projects');
	}

	async ensureProjectsRoot(): Promise<void> {
		try {
			await fs.access(this.projectsRoot);
		} catch {
			await fs.mkdir(this.projectsRoot, { recursive: true });
		}
	}

	async ensureProjectStructure(projectId: string): Promise<ProjectStructure> {
		await this.ensureProjectsRoot();

		const projectPath = path.join(this.projectsRoot, projectId);
		const dslPath = path.join(projectPath, 'dsl');
		const designPath = path.join(projectPath, 'design');
		const apiPath = path.join(projectPath, 'api');
		const databasePath = path.join(projectPath, 'database');
		const uisPath = path.join(projectPath, 'uis');
		const claudeMdPath = path.join(projectPath, 'CLAUDE.md');
		const claudeConfigPath = path.join(projectPath, '.claude');

		const dirs = [projectPath, dslPath, designPath, apiPath, databasePath, uisPath, claudeConfigPath];

		for (const dir of dirs) {
			try {
				await fs.access(dir);
			} catch {
				await fs.mkdir(dir, { recursive: true });
			}
		}

		try {
			await fs.access(claudeMdPath);
		} catch {
			await this.createClaudeMd(claudeMdPath, projectId);
		}

		await this.ensureClaudeConfig(claudeConfigPath, projectId);

		// Create additional files to help Claude generate better components
		await this.createDSLFiles(dslPath);
		await this.createDesignSystemReadme(designPath);
		await this.createOpenAPISpec(apiPath);
		await this.createDatabaseSchema(databasePath);

		return {
			projectPath,
			dslPath,
			designPath,
			apiPath,
			databasePath,
			uisPath,
			claudeMdPath,
			claudeConfigPath
		};
	}

	async ensureUIStructure(projectId: string, uiId: string): Promise<UIFileStructure> {
		const projectStructure = await this.ensureProjectStructure(projectId);

		const uiPath = path.join(projectStructure.uisPath, uiId);
		const uiJsonPath = path.join(uiPath, 'ui.json');
		const uiJsxPath = path.join(uiPath, 'ui.tsx');

		try {
			await fs.access(uiPath);
		} catch {
			await fs.mkdir(uiPath, { recursive: true });
		}

		return {
			uiPath,
			uiJsonPath,
			uiJsxPath
		};
	}

	private async createClaudeMd(claudeMdPath: string, projectId: string): Promise<void> {
		const claudeMdContentPath = path.join(process.cwd(), '/src/claude-agent-sdk/docs/claude.md');
		let claudeMdContent;

		try {
			claudeMdContent = await fs.readFile(claudeMdContentPath, 'utf-8');
		} catch (error) {
			console.error('Failed to read claude.md template:', error);
			claudeMdContent = '# Claude AI Documentation\n\nNo content available.';
		}

		await fs.writeFile(claudeMdPath, claudeMdContent);
	}

	private async ensureClaudeConfig(claudeConfigPath: string, projectId: string): Promise<void> {
		// Create .claude/settings.json
		const settingsPath = path.join(claudeConfigPath, 'settings.json');
		try {
			await fs.access(settingsPath);
		} catch {
			const settings = {
				workingDirectory: ".",
				permissions: {
					fileOperations: "allow",
					codeExecution: "allow",
					webAccess: "deny"
				},
				model: "claude-sonnet-4-5",
				projectId: projectId
			};
			await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
		}

		// Create .claude/agents/ directory for subagents
		const agentsPath = path.join(claudeConfigPath, 'agents');
		try {
			await fs.access(agentsPath);
		} catch {
			await fs.mkdir(agentsPath, { recursive: true });

			// Create a UI generation subagent
			const uiAgentContent = {
				description: "Specialized agent for React UI component generation",
				tools: ["file_read", "file_write", "file_list"],
				prompt: "You are a React UI component specialist. Focus on creating clean, accessible, and responsive components."
			};
			await fs.writeFile(
				path.join(agentsPath, 'ui-generator.json'),
				JSON.stringify(uiAgentContent, null, 2)
			);
		}
	}

	private async createDSLFiles(dslPath: string): Promise<void> {
		await this.createDSLDocFile(dslPath);
		await this.createDSLNativeFile(dslPath);
		await this.createDSLSchemaFile(dslPath);
	}

	private async createDSLNativeFile(dslPath: string): Promise<void> {
		const nativePath = path.join(dslPath, 'native.md');
		try {
			await fs.access(nativePath);
		} catch {
			const templatePath = path.join(process.cwd(), '/src/claude-agent-sdk/docs/dsl-native.md');
			let nativeContent: string;

			try {
				nativeContent = await fs.readFile(templatePath, 'utf-8');
			} catch (error) {
				console.error('Failed to read dsl-native.md template:', error);
				nativeContent = '# Native Components Documentation\n\nNo content available.';
			}

			await fs.writeFile(nativePath, nativeContent);
		}
	}

	private async createDSLSchemaFile(dslPath: string): Promise<void> {
		const schemaPath = path.join(dslPath, 'schema.ts');
		try {
			await fs.access(schemaPath);
		} catch {
			const templatePath = path.join(process.cwd(), '/src/claude-agent-sdk/docs/dsl-schema.ts');
			let schemaContent: string;

			try {
				schemaContent = await fs.readFile(templatePath, 'utf-8');
			} catch (error) {
				console.error('Failed to read dsl-schema.ts template:', error);
				schemaContent = `NO CONTENT AVAILABLE.`;
			}

			await fs.writeFile(schemaPath, schemaContent);
		}
	}

	private async createDSLDocFile(dslPath: string): Promise<void> {
		const docPath = path.join(dslPath, 'doc.md');
		try {
			await fs.access(docPath);
		} catch {
			const templatePath = path.join(process.cwd(), '/src/claude-agent-sdk/docs/dsl-doc.md');
			let docContent: string;

			try {
				docContent = await fs.readFile(templatePath, 'utf-8');
			} catch (error) {
				console.error('Failed to read dsl-doc.md template:', error);
				docContent = `NO CONTENT AVAILABLE.`;
			}

			await fs.writeFile(docPath, docContent);
		}
	}

	private async createDesignSystemReadme(designPath: string): Promise<void> {
		const readmePath = path.join(designPath, 'README.md');
		try {
			await fs.access(readmePath);
		} catch {
			// Read the design system content from the template file
			// Use process.cwd() to get project root, then navigate to source files
			const templatePath = path.join(process.cwd(), '/src/claude-agent-sdk/docs/design-system-readme.md');
			let designSystemContent: string;

			try {
				designSystemContent = await fs.readFile(templatePath, 'utf-8');
			} catch (error) {
				console.error('Failed to read design-system-readme.md template:', error);
				designSystemContent = `NO CONTENT AVAILABLE.`;
			}

			await fs.writeFile(readmePath, designSystemContent);
		}
	}

	private async createOpenAPISpec(apiPath: string): Promise<void> {
		const openApiPath = path.join(apiPath, 'openapi.yaml');
		try {
			await fs.access(openApiPath);
		} catch {
			const templatePath = path.join(process.cwd(), '/src/claude-agent-sdk/docs/openapi.yaml');
			let openApiContent: string;

			try {
				openApiContent = await fs.readFile(templatePath, 'utf-8');
			} catch (error) {
				console.error('Failed to read openapi.yaml template:', error);
				openApiContent = `No content available.`;
			}

			await fs.writeFile(openApiPath, openApiContent);
		}
	}

	private async createDatabaseSchema(databasePath: string): Promise<void> {
		const schemaPath = path.join(databasePath, 'schema.md');
		try {
			await fs.access(schemaPath);
		} catch {
			// Read the database schema content from the template file
			// Use process.cwd() to get project root, then navigate to source files
			const templatePath = path.join(process.cwd(), '/src/claude-agent-sdk/docs/database-schema.md');
			let schemaContent: string;

			try {
				schemaContent = await fs.readFile(templatePath, 'utf-8');
			} catch (error) {
				console.error('Failed to read database-schema.md template:', error);
				schemaContent = `# Database Schema Documentation \n\nNo content available.`;
			}

			await fs.writeFile(schemaPath, schemaContent);
		}
	}

	async updateClaudeMd(projectId: string, additionalContext: string): Promise<void> {
		const projectStructure = await this.ensureProjectStructure(projectId);
		const currentContent = await fs.readFile(projectStructure.claudeMdPath, 'utf-8');

		const updatedContent = `${currentContent}

## Additional Context
${additionalContext}

## Last Updated
${new Date().toISOString()}
`;

		await fs.writeFile(projectStructure.claudeMdPath, updatedContent);
	}

	async saveUIToFile(projectId: string, uiId: string, uiData: any): Promise<string> {
		const { uiJsonPath } = await this.ensureUIStructure(projectId, uiId);

		const uiWithMetadata = {
			...uiData,
			metadata: {
				uiId,
				projectId,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				...uiData.metadata
			}
		};

		await fs.writeFile(uiJsonPath, JSON.stringify(uiWithMetadata, null, 2));
		return uiJsonPath;
	}

	async saveJSXToFile(projectId: string, uiId: string, jsxContent: string): Promise<string> {
		const { uiJsxPath } = await this.ensureUIStructure(projectId, uiId);
		await fs.writeFile(uiJsxPath, jsxContent);
		return uiJsxPath;
	}

	async getJSXFromFile(projectId: string, uiId: string): Promise<string | null> {
		try {
			const { uiJsxPath } = await this.ensureUIStructure(projectId, uiId);
			const content = await fs.readFile(uiJsxPath, 'utf-8');
			return content;
		} catch {
			return null;
		}
	}

	async getUIFromFile(projectId: string, uiId: string): Promise<any | null> {
		try {
			const { uiJsonPath } = await this.ensureUIStructure(projectId, uiId);
			const content = await fs.readFile(uiJsonPath, 'utf-8');
			return JSON.parse(content);
		} catch {
			return null;
		}
	}

	async listUIsForProject(projectId: string): Promise<string[]> {
		try {
			const projectStructure = await this.ensureProjectStructure(projectId);
			const uiDirs = await fs.readdir(projectStructure.uisPath, { withFileTypes: true });
			return uiDirs
				.filter(dirent => dirent.isDirectory())
				.map(dirent => dirent.name);
		} catch {
			return [];
		}
	}

	async saveDSLContext(projectId: string, context: any): Promise<string> {
		const projectStructure = await this.ensureProjectStructure(projectId);
		const dslContextPath = path.join(projectStructure.dslPath, 'context.json');

		const contextWithMetadata = {
			...context,
			metadata: {
				projectId,
				updatedAt: new Date().toISOString(),
				...context.metadata
			}
		};

		await fs.writeFile(dslContextPath, JSON.stringify(contextWithMetadata, null, 2));
		return dslContextPath;
	}

	async getDSLContext(projectId: string): Promise<any | null> {
		try {
			const projectStructure = await this.ensureProjectStructure(projectId);
			const dslContextPath = path.join(projectStructure.dslPath, 'context.json');
			const content = await fs.readFile(dslContextPath, 'utf-8');
			return JSON.parse(content);
		} catch {
			return null;
		}
	}

	async saveAPISchema(projectId: string, schema: any): Promise<string> {
		const projectStructure = await this.ensureProjectStructure(projectId);
		const apiSchemaPath = path.join(projectStructure.apiPath, 'schema.json');

		const schemaWithMetadata = {
			...schema,
			metadata: {
				projectId,
				updatedAt: new Date().toISOString(),
				...schema.metadata
			}
		};

		await fs.writeFile(apiSchemaPath, JSON.stringify(schemaWithMetadata, null, 2));
		return apiSchemaPath;
	}

	async getAPISchema(projectId: string): Promise<any | null> {
		try {
			const projectStructure = await this.ensureProjectStructure(projectId);
			const apiSchemaPath = path.join(projectStructure.apiPath, 'schema.json');
			const content = await fs.readFile(apiSchemaPath, 'utf-8');
			return JSON.parse(content);
		} catch {
			return null;
		}
	}

	generateUIId(): string {
		return getNanoid();
	}

	async deleteUI(projectId: string, uiId: string): Promise<boolean> {
		try {
			const { uiPath } = await this.ensureUIStructure(projectId, uiId);
			await fs.rm(uiPath, { recursive: true, force: true });
			return true;
		} catch {
			return false;
		}
	}

	async projectExists(projectId: string): Promise<boolean> {
		try {
			const projectPath = path.join(this.projectsRoot, projectId);
			await fs.access(projectPath);
			return true;
		} catch {
			return false;
		}
	}

	async getProjectInfo(projectId: string): Promise<{
		exists: boolean;
		uiCount: number;
		lastUpdated?: string;
	}> {
		const exists = await this.projectExists(projectId);
		if (!exists) {
			return { exists: false, uiCount: 0 };
		}

		const uis = await this.listUIsForProject(projectId);

		try {
			const projectStructure = await this.ensureProjectStructure(projectId);
			const stats = await fs.stat(projectStructure.projectPath);
			return {
				exists: true,
				uiCount: uis.length,
				lastUpdated: stats.mtime.toISOString()
			};
		} catch {
			return {
				exists: true,
				uiCount: uis.length
			};
		}
	}

	
}