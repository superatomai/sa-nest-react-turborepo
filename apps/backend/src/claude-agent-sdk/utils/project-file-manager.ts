import * as fs from 'fs/promises';
import * as path from 'path';
import { nanoid } from 'nanoid';

export interface ProjectStructure {
	projectPath: string;
	dslPath: string;
	designPath: string;
	apiPath: string;
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
		const uisPath = path.join(projectPath, 'uis');
		const claudeMdPath = path.join(projectPath, 'CLAUDE.md');
		const claudeConfigPath = path.join(projectPath, '.claude');

		const dirs = [projectPath, dslPath, designPath, apiPath, uisPath, claudeConfigPath];

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

		return {
			projectPath,
			dslPath,
			designPath,
			apiPath,
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
		return nanoid(8);
	}

	private async createClaudeMd(claudeMdPath: string, projectId: string): Promise<void> {
		const claudeMdContent = `# Claude Agent Instructions for Project: ${projectId}

## Project Overview
This project uses Claude Code for React JSX component generation. You have full access to the project files and should use your file manipulation tools to create, read, and edit files as needed.

## 🎯 Your Primary Task
**Generate React JSX components based on user requests.** When a user asks for a UI component, you must:

1. **Create actual JSX files** - Not JSON, not descriptions, but real React JSX code
2. **Use your file tools** - Read, Write, Edit, Glob, Grep to work with project files
3. **Generate complete components** - Functional, importable React components

## Your Role
You are a React component developer working within this project. When asked to create UI components:

1. **Analyze the user request** - Understand what type of component they want
2. **Read existing files** - Use your file reading tools to understand project structure
3. **Generate TSX components** - Write actual React components in TSX format
4. **Save to correct location** - Place components in \`uis/{uiId}/ui.tsx\` files
5. **Follow React patterns** - Use modern functional components with hooks

## Project Structure
- \`dsl/\`: Contains DSL context and component definitions
- \`design/\`: Design system and UI guidelines
- \`api/\`: API schemas and documentation
- \`uis/\`: Generated UI components organized by UI ID
  - Each UI has its own folder: \`uis/{uiId}/\`
  - **Main component file: \`uis/{uiId}/ui.tsx\`** ← 🎯 **THIS IS WHAT YOU CREATE**
  - Metadata file: \`uis/{uiId}/ui.json\`

## UI Generation Workflow
When you receive a UI generation request:

1. **Read context files** - Use Read tool to read:
   - \`CLAUDE.md\` (this file) - Understand your role and guidelines
   - \`design/README.md\` - Get design system guidelines (colors, typography, spacing)
   - \`dsl/native.md\` - Learn about native components available (charts, maps, tables)
   - \`api/openapi.yaml\` - Understand API endpoints for data integration
2. **Check existing patterns** - Use Glob tool to list existing components in \`uis/\` directory
3. **Read sample components** - If any exist, read them to understand the coding style
4. **Understand the request** - Analyze what the user is asking for
5. **Generate TSX component** - Create a React component that fulfills the request
6. **Use Write tool** - Save the component to \`uis/{uiId}/ui.tsx\`
7. **Make it complete** - Ensure it's a fully functional React component

## Component Requirements
- **TSX Format**: Must be valid React TSX syntax
- **Functional Components**: Use modern React functional components
- **Default Export**: Export the component as default
- **Proper Imports**: Include \`import React\` and any needed hooks
- **Tailwind v4 CSS Styling**: Use ONLY Tailwind v4 CSS classes for all styling
  - No inline styles (\`style={{}}\`) - use Tailwind v4 utilities instead
  - No custom CSS classes - use Tailwind v4's utility classes
  - Use responsive prefixes: \`sm:\`, \`md:\`, \`lg:\`, \`xl:\`, \`2xl:\`
  - Examples: \`bg-blue-500\`, \`text-white\`, \`p-4\`, \`rounded-lg\`, \`hover:bg-blue-600\`
- **Unique Element IDs**: **CRITICAL - Every element MUST have a unique \`sa-id\` attribute**
  - Add \`sa-id\` to EVERY HTML element (div, button, span, input, section, etc.)
  - Use descriptive, kebab-case names: \`sa-id="header-title"\`, \`sa-id="submit-button"\`
  - Ensure all sa-id values are unique within the component
  - Example: \`<div sa-id="main-container" className="flex flex-col p-4">\`
  - Example: \`<button sa-id="login-submit-btn" className="bg-blue-500 text-white px-4 py-2">\`
- **Responsive Design**: Make components work on mobile and desktop using Tailwind v4 breakpoints
- **Accessibility**: Include proper ARIA labels and semantic HTML
- **Props Support**: Accept props for data and customization
- **Clean Code**: Well-formatted, readable, production-ready code

## Example Component Structure
\`\`\`jsx
import React, { useState, useEffect } from 'react';

const UserRequestedComponent = ({ data, onAction, className }) => {
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState(null);

  useEffect(() => {
    // Component logic here
  }, []);

  return (
    <div sa-id="main-container" className={\`bg-white rounded-lg shadow-md p-6 \${className || ''}\`}>
      <h2 sa-id="component-title" className="text-2xl font-bold text-gray-900 mb-4">Component Based on User Request</h2>
      {loading ? (
        <div sa-id="loading-state" className="flex items-center justify-center p-8">
          <div sa-id="loading-spinner" className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span sa-id="loading-text" className="ml-2 text-gray-600">Loading...</span>
        </div>
      ) : (
        <div sa-id="content-container" className="space-y-4">
          {/* Implement the user's requested functionality */}
          {data && (
            <div sa-id="data-display-box" className="bg-gray-50 rounded-md p-4 border border-gray-200">
              {/* Display data based on user request */}
              <p sa-id="data-content-text" className="text-gray-700">Data content here</p>
            </div>
          )}
          <button
            sa-id="action-button"
            onClick={onAction}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Action Button
          </button>
        </div>
      )}
    </div>
  );
};

export default UserRequestedComponent;
\`\`\`

## 🚨 Critical Instructions
1. **ALWAYS generate TSX** - Never just describe what you would create
2. **USE YOUR FILE TOOLS** - Read, Write, Edit files directly
3. **CREATE REAL COMPONENTS** - The TSX must be functional and importable
4. **SAVE TO CORRECT PATH** - Always use \`uis/{uiId}/ui.tsx\` for the component file
5. **ADD sa-id TO ALL ELEMENTS** - Every single HTML element must have a unique \`sa-id\` attribute
6. **USE TAILWIND v4** - All styling must use Tailwind v4 utility classes
7. **FOLLOW USER REQUEST** - Build exactly what the user asks for
8. **MAKE IT COMPLETE** - Include all necessary imports, exports, and functionality

## Example User Requests & Responses
- **User**: "Create a login form"
- **You**: Use Write tool to create a TSX login form with username/password fields
- **User**: "Build a product card component"
- **You**: Use Write tool to create a TSX product card with image, title, price, etc.
- **User**: "Make a data table"
- **You**: Use Write tool to create a TSX table component with sorting and filtering

## Tools You Have Available
- **Read**: Read existing files to understand patterns
- **Write**: Create new TSX component files
- **Edit**: Modify existing components
- **Glob**: List files and directories
- **Grep**: Search for patterns in code
- **Bash**: Run shell commands if needed

## Important Notes
- You have full file system access - use it actively!
- Generate actual TSX code, not pseudocode or descriptions
- Each component should be production-ready
- Follow React best practices and modern patterns
- Make components reusable and well-structured
- Test your understanding by reading existing project files first

## Last Updated
${new Date().toISOString()}
`;

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
				model: "claude-3-5-sonnet-20241022",
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
			const nativeContent = `# Native Components Documentation

Native components are  accessed using the \`COMP_\` prefix in the \`type\` field.

## Chart Components

### ECharts (COMP_ECHART)
Advanced charting library for creating interactive visualizations.

\`\`\`json
{
  "id": "sales-chart",
  "type": "COMP_ECHART",
  "props": {
    "option": {
      "title": {
        "text": "Monthly Sales"
      },
      "xAxis": {
        "type": "category",
        "data": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
      },
      "yAxis": {
        "type": "value"
      },
      "series": [{
        "data": [120, 200, 150, 80, 70, 110],
        "type": "bar"
      }]
    },
    "style": {
      "width": "100%",
      "height": "400px"
    }
  }
}
\`\`\`

#### Dynamic Chart with Data Binding
\`\`\`json
{
  "id": "dynamic-chart",
  "type": "COMP_ECHART",
  "props": {
    "option": {
      "$exp": "{ title: { text: chartTitle }, xAxis: { type: 'category', data: categories }, yAxis: { type: 'value' }, series: [{ data: salesData, type: 'line' }] }",
      "$deps": ["chartTitle", "categories", "salesData"]
    },
    "style": {
      "width": "100%",
      "height": "300px"
    }
  }
}
\`\`\`

## Table Components

### AG Grid (COMP_AGGRID)
Enterprise-grade data grid with advanced features.

\`\`\`json
{
  "id": "users-grid",
  "type": "COMP_AGGRID",
  "props": {
    "columnDefs": [
      {
        "headerName": "Name",
        "field": "name",
        "sortable": true,
        "filter": true
      },
      {
        "headerName": "Email",
        "field": "email",
        "sortable": true,
        "filter": true
      },
      {
        "headerName": "Role",
        "field": "role",
        "sortable": true
      }
    ],
    "rowData": {
      "$bind": "users"
    },
    "style": {
      "width": "100%",
      "height": "400px"
    }
  }
}
\`\`\`

### HandsOnTable (COMP_HANDSONTABLE)
Spreadsheet-like data grid with Excel-like editing capabilities.

\`\`\`json
{
  "id": "spreadsheet",
  "type": "COMP_HANDSONTABLE",
  "props": {
    "data": {
      "$bind": "spreadsheetData"
    },
    "colHeaders": ["Product", "Q1", "Q2", "Q3", "Q4"],
    "rowHeaders": true,
    "width": "100%",
    "height": 300,
    "licenseKey": "non-commercial-and-evaluation"
  }
}
\`\`\`

### Luckysheet (COMP_LUCKYSHEET)
Full-featured online spreadsheet application.

\`\`\`json
{
  "id": "excel-editor",
  "type": "COMP_LUCKYSHEET",
  "props": {
    "containerId": "luckysheet-container",
    "options": {
      "container": "luckysheet-container",
      "title": "Budget Spreadsheet",
      "lang": "en"
    },
    "style": {
      "width": "100%",
      "height": "500px"
    }
  }
}
\`\`\`

## Map Components

### Leaflet Maps (COMP_LEAFLET)
Open-source interactive maps.

\`\`\`json
{
  "id": "location-map",
  "type": "COMP_LEAFLET",
  "props": {
    "center": [51.505, -0.09],
    "zoom": 13,
    "markers": [
      {
        "position": [51.5, -0.09],
        "popup": "London"
      }
    ],
    "style": {
      "width": "100%",
      "height": "400px"
    }
  }
}
\`\`\`

#### Dynamic Map with User Location
\`\`\`json
{
  "id": "user-map",
  "type": "COMP_LEAFLET",
  "props": {
    "center": {
      "$bind": "userLocation.coordinates"
    },
    "zoom": 15,
    "markers": {
      "$exp": "nearbyLocations.map(loc => ({ position: loc.coords, popup: loc.name }))",
      "$deps": ["nearbyLocations"]
    },
    "style": {
      "width": "100%",
      "height": "300px"
    }
  }
}
\`\`\`

### Mapbox GL (COMP_MAPBOX)
Advanced vector maps with WebGL rendering.

\`\`\`json
{
  "id": "mapbox-view",
  "type": "COMP_MAPBOX",
  "props": {
    "accessToken": {
      "$bind": "mapboxToken"
    },
    "style": "mapbox://styles/mapbox/streets-v11",
    "center": [-74.006, 40.7128],
    "zoom": 12,
    "style": {
      "width": "100%",
      "height": "400px"
    }
  }
}
\`\`\`

## Document Components

### PDF Viewer (COMP_PDF_VIEWER)
Display PDF documents with navigation controls.

\`\`\`json
{
  "id": "document-viewer",
  "type": "COMP_PDF_VIEWER",
  "props": {
    "url": {
      "$bind": "documentUrl"
    },
    "scale": 1.0,
    "style": {
      "width": "100%",
      "height": "600px",
      "border": "1px solid #ccc"
    }
  }
}
\`\`\`

### Markdown Renderer (COMP_MARKDOWN)
Render Markdown content with syntax highlighting and math support.

\`\`\`json
{
  "id": "readme-content",
  "type": "COMP_MARKDOWN",
  "props": {
    "content": {
      "$bind": "readmeText"
    },
    "enableMath": true,
    "enableGfm": true,
    "theme": "github",
    "className": "markdown-body"
  }
}
\`\`\`

#### Dynamic Markdown with Template
\`\`\`json
{
  "id": "report-template",
  "type": "COMP_MARKDOWN",
  "props": {
    "content": {
      "$exp": "\`# \${reportTitle}\\\\n\\\\n## Summary\\\\n\${reportSummary}\\\\n\\\\n## Data\\\\n\${reportData}\`",
      "$deps": ["reportTitle", "reportSummary", "reportData"]
    },
    "enableMath": true,
    "theme": "default"
  }
}
\`\`\`

## Visualization Components

### Vis Network (COMP_VIS_NETWORK)
Interactive network graph visualization.

\`\`\`json
{
  "id": "network-graph",
  "type": "COMP_VIS_NETWORK",
  "props": {
    "nodes": [
      {"id": 1, "label": "Node 1"},
      {"id": 2, "label": "Node 2"},
      {"id": 3, "label": "Node 3"}
    ],
    "edges": [
      {"from": 1, "to": 2},
      {"from": 1, "to": 3}
    ],
    "options": {
      "width": "100%",
      "height": "400px",
      "nodes": {
        "color": "#97C2FC"
      }
    }
  }
}
\`\`\`

#### Dynamic Network with Data Binding
\`\`\`json
{
  "id": "org-chart",
  "type": "COMP_VIS_NETWORK",
  "props": {
    "nodes": {
      "$bind": "employees"
    },
    "edges": {
      "$bind": "relationships"
    },
    "options": {
      "layout": {
        "hierarchical": {
          "direction": "UD"
        }
      }
    }
  }
}
\`\`\`

### Three.js Scene (COMP_THREE_SCENE)
3D graphics and animations.

\`\`\`json
{
  "id": "3d-model",
  "type": "COMP_THREE_SCENE",
  "props": {
    "scene": {
      "background": "#f0f0f0",
      "objects": [
        {
          "type": "cube",
          "position": [0, 0, 0],
          "rotation": [0, 0, 0],
          "color": "#ff6600"
        }
      ]
    },
    "camera": {
      "position": [0, 0, 5],
      "fov": 75
    },
    "style": {
      "width": "100%",
      "height": "400px"
    }
  }
}
\`\`\`

## Database Components

### DuckDB Interface (COMP_DUCKDB_INTERFACE)
Complete database interface with query execution.

\`\`\`json
{
  "id": "data-explorer",
  "type": "COMP_DUCKDB_INTERFACE",
  "props": {
    "defaultQuery": "SELECT * FROM uploaded_data LIMIT 100",
    "showTables": true,
    "allowExport": true
  }
}
\`\`\`

### DuckDB Query (COMP_DUCKDB)
Execute SQL queries against DuckDB.

\`\`\`json
{
  "id": "query-results",
  "type": "COMP_DUCKDB",
  "props": {
    "query": {
      "$bind": "sqlQuery"
    },
    "params": {
      "$bind": "queryParams"
    },
    "onResult": "handleQueryResult",
    "onError": "handleQueryError"
  }
}
\`\`\`

### DuckDB File Upload (COMP_DUCKDB_UPLOAD)
Upload and import files into DuckDB.

\`\`\`json
{
  "id": "file-uploader",
  "type": "COMP_DUCKDB_UPLOAD",
  "props": {
    "acceptedTypes": [".csv", ".json", ".parquet"],
    "onUpload": "handleFileUpload",
    "maxFileSize": "10MB",
    "tableName": {
      "$bind": "targetTable"
    }
  }
}
\`\`\`

## Icon Components

### Iconify Icons (COMP_ICONIFY_ICON)
Comprehensive icon library with web components.

\`\`\`json
{
  "id": "save-icon",
  "type": "COMP_ICONIFY_ICON",
  "props": {
    "icon": "mdi:content-save",
    "width": 24,
    "height": 24,
    "color": "#2196F3"
  }
}
\`\`\`

#### Dynamic Icons
\`\`\`json
{
  "id": "status-icon",
  "type": "COMP_ICONIFY_ICON",
  "props": {
    "icon": {
      "$exp": "status === 'success' ? 'mdi:check-circle' : status === 'error' ? 'mdi:alert-circle' : 'mdi:loading'",
      "$deps": ["status"]
    },
    "color": {
      "$exp": "status === 'success' ? '#4CAF50' : status === 'error' ? '#F44336' : '#2196F3'",
      "$deps": ["status"]
    },
    "width": 20,
    "height": 20
  }
}
\`\`\`

## Advanced Usage Patterns

### Nested Native Components
\`\`\`json
{
  "id": "dashboard",
  "type": "div",
  "props": {
    "className": "dashboard-grid"
  },
  "children": [
    {
      "id": "metrics-chart",
      "type": "COMP_ECHART",
      "props": {
        "option": {
          "$bind": "metricsChartConfig"
        }
      }
    },
    {
      "id": "data-table",
      "type": "COMP_AGGRID",
      "props": {
        "columnDefs": {
          "$bind": "tableColumns"
        },
        "rowData": {
          "$bind": "tableData"
        }
      }
    }
  ]
}
\`\`\`

### Component with Loading States
\`\`\`json
{
  "id": "map-container",
  "type": "div",
  "if": {
    "$exp": "!isLoadingMapData",
    "$deps": ["isLoadingMapData"]
  },
  "else": {
    "id": "loading-message",
    "type": "div",
    "children": "Loading map data..."
  },
  "children": {
    "id": "location-map",
    "type": "COMP_LEAFLET",
    "props": {
      "center": {
        "$bind": "mapCenter"
      },
      "markers": {
        "$bind": "mapMarkers"
      }
    }
  }
}
\`\`\`
`;
			await fs.writeFile(nativePath, nativeContent);
		}
	}

	private async createDSLSchemaFile(dslPath: string): Promise<void> {
		const schemaPath = path.join(dslPath, 'schema.ts');
		try {
			await fs.access(schemaPath);
		} catch {
			const schemaContent = `import { z } from 'zod';

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

// Infer TypeScript types from Zod schemas
export type Expression = z.infer<typeof ExpressionSchema>;
export type Binding = z.infer<typeof BindingSchema>;
export type ForDirective = z.infer<typeof ForDirectiveSchema>;
export type QuerySpec = z.infer<typeof QuerySpecSchema>;
export type UIElement = z.infer<typeof UIElementSchema>;
export type UIComponent = z.infer<typeof UIComponentSchema>;
`;
			await fs.writeFile(schemaPath, schemaContent);
		}
	}



	private async createDSLDocFile(dslPath: string): Promise<void> {
		const docPath = path.join(dslPath, 'doc.md');
		try {
			await fs.access(docPath);
		} catch {
			const docContent = `# DSL Schema Documentation

This document provides examples and usage patterns for the DSL schemas to be generated

## Expressions

Expressions are JavaScript expressions that can be evaluated dynamically. Use \`$exp\` for any valid JavaScript expression and \`$deps\` to specify which data variables the expression depends on.

\`\`\`json
{
  "$exp": "user.name + ' is logged in'",
  "$deps": ["user"]
}
\`\`\`

The expression can be any valid JavaScript code - mathematical operations, conditionals, array methods, string manipulation, etc.

## Bindings

Bindings connect data sources to UI elements using dot notation paths.

### Simple Binding
\`\`\`json
{
  "$bind": "user.profile.email"
}
\`\`\`

### Binding with Transformations (Planned)
\`\`\`json
{
  "$bind": "user.name",
  "$transform": [
    {
      "name": "uppercase"
    },
    {
      "name": "truncate",
      "args": [20]
    }
  ]
}
\`\`\`
*Note: Transformations are not fully implemented in current renderer*

### String Interpolation
The renderer supports both \`\${}\` and \`{{}}\` syntax for string interpolation:

\`\`\`json
{
  "children": "Hello \${user.name}, you have {{notifications.length}} messages"
}
\`\`\`

## For Directives

For directives enable iteration over collections and are rendered as container elements with loop items inside.

### Basic Loop
\`\`\`json
{
  "id": "user-list",
  "type": "div",
  "for": {
    "in": {
      "$bind": "users"
    },
    "as": "user"
  },
  "children": {
    "id": "user-item",
    "type": "div",
    "props": {
      "className": "user-card"
    },
    "children": {
      "$bind": "user.name"
    }
  }
}
\`\`\`

### Loop with Index and Key
\`\`\`json
{
  "id": "product-grid",
  "type": "div",
  "for": {
    "in": {
      "$bind": "products"
    },
    "as": "product",
    "index": "idx",
    "key": "product.id"
  },
  "children": {
    "id": "product-card",
    "type": "div",
    "props": {
      "className": "product-item"
    },
    "children": [
      {
        "id": "product-name",
        "type": "h3",
        "children": {
          "$bind": "product.name"
        }
      },
      {
        "id": "product-index",
        "type": "span",
        "children": {
          "$exp": "'Item #' + (idx + 1)",
          "$deps": ["idx"]
        }
      }
    ]
  }
}
\`\`\`

## Query Specifications

Query specifications define data fetching operations (integrated with component data).

### GraphQL Query
\`\`\`json
{
  "query": {
    "graphql": "query GetUser($id: ID!) { user(id: $id) { name email avatar } }",
    "variables": {
      "id": {
        "$bind": "selectedUserId"
      }
    },
    "key": "user-profile",
    "refetchPolicy": "cache-first"
  }
}
\`\`\`

### SQL Query
\`\`\`json
{
  "query": {
    "sql": "SELECT * FROM orders WHERE user_id = $1 AND status = $2",
    "params": {
      "1": {
        "$bind": "currentUser.id"
      },
      "2": "completed"
    },
    "key": "user-orders"
  }
}
\`\`\`

## UI Elements

UI elements are the building blocks rendered by the UpdatedDSLRenderer.

### Basic HTML Elements

#### Text Element
\`\`\`json
{
  "id": "welcome-text",
  "type": "div",
  "props": {
    "className": "welcome-message"
  },
  "children": "Welcome to our app!"
}
\`\`\`

#### Dynamic Text with Expression
\`\`\`json
{
  "id": "user-greeting",
  "type": "span",
  "children": {
    "$exp": "'Hello, ' + user.name + '!'",
    "$deps": ["user"]
  }
}
\`\`\`

#### Button with Click Handler
\`\`\`json
{
  "id": "submit-btn",
  "type": "button",
  "props": {
    "className": "btn btn-primary",
    "onClick": "handleSubmit"
  },
  "children": "Submit"
}
\`\`\`

### Conditional Rendering

#### If/Else Structure
\`\`\`json
{
  "id": "admin-panel",
  "type": "div",
  "if": {
    "$exp": "user.role === 'admin'",
    "$deps": ["user"]
  },
  "else": {
    "id": "access-denied",
    "type": "div",
    "children": "Access denied"
  },
  "children": {
    "id": "admin-content",
    "type": "div",
    "children": "Admin panel content"
  }
}
\`\`\`

#### ElseIf Conditions
\`\`\`json
{
  "id": "status-message",
  "type": "div",
  "if": {
    "$exp": "status === 'loading'",
    "$deps": ["status"]
  },
  "elseIf": {
    "$exp": "status === 'error'",
    "$deps": ["status"]
  },
  "else": {
    "id": "success",
    "type": "div",
    "children": "Success!"
  },
  "children": "Loading..."
}
\`\`\`

### Navigation with link-to

#### Simple Navigation
\`\`\`json
{
  "id": "profile-button",
  "type": "button",
  "props": {
    "className": "nav-button"
  },
  "children": "View Profile",
  "link-to": "user-profile"
}
\`\`\`

#### Navigation with Parameters
\`\`\`json
{
  "id": "edit-product",
  "type": "button",
  "children": "Edit",
  "link-to": {
    "ui": "product-editor",
    "params": {
      "productId": {
        "$bind": "product.id"
      },
      "mode": "edit"
    }
  }
}
\`\`\`

### Platform Overrides

\`\`\`json
{
  "id": "responsive-text",
  "type": "div",
  "props": {
    "className": "base-text"
  },
  "children": "Default content",
  "platform": {
    "web": {
      "props": {
        "style": {
          "fontSize": "16px"
        }
      }
    },
    "ios": {
      "props": {
        "style": {
          "fontSize": "18px"
        }
      }
    },
    "android": {
      "props": {
        "style": {
          "fontSize": "17px"
        }
      }
    }
  }
}
\`\`\`

## UI Components

UI Components are reusable units with their own props, state, methods, and render tree.

### Basic Component
\`\`\`json
{
  "id": "counter-component",
  "name": "Counter",
  "props": {
    "initialValue": 0,
    "step": 1
  },
  "states": {
    "count": {
      "$bind": "initialValue"
    }
  },
  "data": {
    "theme": "default"
  },
  "methods": {
    "increment": {
      "fn": "() => setState('count', count + step)"
    },
    "decrement": {
      "fn": "() => setState('count', count - step)"
    }
  },
  "render": {
    "id": "counter-view",
    "type": "div",
    "props": {
      "className": "counter-widget"
    },
    "children": [
      {
        "id": "count-display",
        "type": "span",
        "props": {
          "className": "count-value"
        },
        "children": {
          "$bind": "count"
        }
      },
      {
        "id": "increment-btn",
        "type": "button",
        "props": {
          "onClick": "increment"
        },
        "children": "+"
      },
      {
        "id": "decrement-btn",
        "type": "button",
        "props": {
          "onClick": "decrement"
        },
        "children": "-"
      }
    ]
  }
}
\`\`\`

### Component with Effects
\`\`\`json
{
  "id": "data-fetcher",
  "name": "DataFetcher",
  "props": {
    "url": "",
    "autoFetch": true
  },
  "states": {
    "data": null,
    "loading": false,
    "error": null
  },
  "effects": [
    {
      "fn": "() => { if (autoFetch && url) fetchData(); }",
      "deps": ["url", "autoFetch"]
    }
  ],
  "methods": {
    "fetchData": {
      "fn": "async () => { setState('loading', true); try { const response = await fetch(url); const data = await response.json(); setState('data', data); } catch (err) { setState('error', err.message); } finally { setState('loading', false); } }"
    }
  },
  "render": {
    "id": "data-view",
    "type": "div",
    "if": {
      "$exp": "!loading && !error",
      "$deps": ["loading", "error"]
    },
    "else": {
      "id": "loading-state",
      "type": "div",
      "children": {
        "$exp": "loading ? 'Loading...' : error",
        "$deps": ["loading", "error"]
      }
    },
    "children": {
      "id": "data-content",
      "type": "pre",
      "children": {
        "$exp": "JSON.stringify(data, null, 2)",
        "$deps": ["data"]
      }
    }
  }
}
\`\`\`

## Supported HTML Elements

The renderer supports these HTML element types (mapped via \`actualElement.type.toLowerCase()\`):

- **Containers**: \`div\`, \`view\`, \`section\`, \`header\`, \`footer\`
- **Text**: \`span\`, \`text\`, \`h1\`, \`h2\`, \`h3\`, \`p\`
- **Forms**: \`button\`, \`input\`, \`select\`, \`option\`
- **Lists**: \`ul\`, \`li\`
- **Media**: \`img\`
- **Links**: \`a\`
- **Tables**: \`table\`, \`thead\`, \`tbody\`, \`tr\`, \`th\`, \`td\`
- **SVG**: \`svg\`, \`path\`, \`circle\`, \`rect\`, \`line\`, \`polygon\`, \`polyline\`, \`g\`

Unknown types default to \`div\` elements.

## Implementation Notes

### Data Context Resolution
The renderer creates a full context from:
\`\`\`javascript
const fullContext = {
  ...uiComponent.data || {},      // Static data
  states: uiComponent.states || {}, // Component state
  props: uiComponent.props || {}    // Component props
}
\`\`\`

### Expression Evaluation
- Uses safe \`new Function()\` evaluation with controlled context
- Supports Math, Date, Array methods, and data flattening
- Expressions are evaluated with access to component data, states, and props

### Loop Implementation
- Creates container element with original props and classes
- Loop items are rendered as React Fragments with unique keys
- Each loop iteration gets its own context with loop variable
`;
			await fs.writeFile(docPath, docContent);
		}
	}

	

	private async createDesignSystemReadme(designPath: string): Promise<void> {
		const readmePath = path.join(designPath, 'README.md');
		try {
			await fs.access(readmePath);
		} catch {
			// Read the design system content from the template file
			const templatePath = path.join(__dirname, 'design-system-readme.md');
			let designSystemContent: string;

			try {
				designSystemContent = await fs.readFile(templatePath, 'utf-8');
			} catch (error) {
				console.error('Failed to read design-system-readme.md template:', error);
				// Fallback to minimal content if template file is not found
				designSystemContent = `# Design System Guidelines

## Overview
This design system provides guidelines for creating consistent, accessible, and beautiful UI components.

## Color Palette

### Primary Colors
- **Primary**: #2563eb (Blue 600)
- **Primary Light**: #3b82f6 (Blue 500)
- **Primary Dark**: #1d4ed8 (Blue 700)

### Secondary Colors
- **Secondary**: #64748b (Slate 500)
- **Secondary Light**: #94a3b8 (Slate 400)
- **Secondary Dark**: #475569 (Slate 600)

### Status Colors
- **Success**: #10b981 (Emerald 500)
- **Warning**: #f59e0b (Amber 500)
- **Error**: #ef4444 (Red 500)
- **Info**: #06b6d4 (Cyan 500)

### Neutral Colors
- **White**: #ffffff
- **Gray 50**: #f8fafc
- **Gray 100**: #f1f5f9
- **Gray 200**: #e2e8f0
- **Gray 300**: #cbd5e1
- **Gray 400**: #94a3b8
- **Gray 500**: #64748b
- **Gray 600**: #475569
- **Gray 700**: #334155
- **Gray 800**: #1e293b
- **Gray 900**: #0f172a
- **Black**: #000000

## Typography

### Font Family
- **Primary**: 'Inter', 'system-ui', 'sans-serif'
- **Monospace**: 'JetBrains Mono', 'Consolas', 'monospace'

### Font Sizes
- **xs**: 0.75rem (12px)
- **sm**: 0.875rem (14px)
- **base**: 1rem (16px)
- **lg**: 1.125rem (18px)
- **xl**: 1.25rem (20px)
- **2xl**: 1.5rem (24px)
- **3xl**: 1.875rem (30px)
- **4xl**: 2.25rem (36px)
- **5xl**: 3rem (48px)

### Font Weights
- **Light**: 300
- **Normal**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

## Spacing

### Spacing Scale (rem)
- **0**: 0
- **1**: 0.25rem (4px)
- **2**: 0.5rem (8px)
- **3**: 0.75rem (12px)
- **4**: 1rem (16px)
- **5**: 1.25rem (20px)
- **6**: 1.5rem (24px)
- **8**: 2rem (32px)
- **10**: 2.5rem (40px)
- **12**: 3rem (48px)
- **16**: 4rem (64px)
- **20**: 5rem (80px)

## Border Radius
- **None**: 0
- **sm**: 0.125rem (2px)
- **base**: 0.25rem (4px)
- **md**: 0.375rem (6px)
- **lg**: 0.5rem (8px)
- **xl**: 0.75rem (12px)
- **2xl**: 1rem (16px)
- **full**: 9999px (circle)

## Shadows
- **sm**: 0 1px 2px 0 rgb(0 0 0 / 0.05)
- **base**: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)
- **md**: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
- **lg**: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
- **xl**: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)

## Component Guidelines

### Buttons
- **Primary**: Use primary color for main actions
- **Secondary**: Use secondary color for less important actions
- **Padding**: 0.5rem 1rem (py-2 px-4)
- **Border Radius**: 0.375rem (rounded-md)
- **Font Weight**: 500 (medium)

### Cards
- **Background**: White or Gray 50
- **Border**: 1px solid Gray 200
- **Border Radius**: 0.5rem (rounded-lg)
- **Padding**: 1.5rem (p-6)
- **Shadow**: base shadow

### Forms
- **Input Height**: 2.5rem (h-10)
- **Input Padding**: 0.5rem 0.75rem (py-2 px-3)
- **Input Border**: 1px solid Gray 300
- **Input Border Radius**: 0.375rem (rounded-md)
- **Focus Ring**: 2px primary color

### Navigation
- **Height**: 4rem (h-16)
- **Background**: White with border bottom
- **Link Padding**: 0.5rem 1rem (py-2 px-4)
- **Active State**: Primary color

## Accessibility Guidelines

### Color Contrast
- **Normal Text**: 4.5:1 minimum ratio
- **Large Text**: 3:1 minimum ratio
- **Interactive Elements**: 3:1 minimum ratio

### Focus States
- Always provide visible focus indicators
- Use 2px outline with primary color
- Ensure focus indicators are not removed

### Semantic HTML
- Use proper HTML elements (button, input, nav, etc.)
- Provide alt text for images
- Use proper heading hierarchy (h1-h6)

## Responsive Design

### Breakpoints
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### Mobile-First Approach
- Start with mobile styles
- Add larger screen styles with media queries
- Ensure touch targets are at least 44px

## Animation Guidelines

### Transitions
- **Duration**: 150ms-300ms for UI interactions
- **Easing**: ease-in-out for most transitions
- **Properties**: transform, opacity, colors

### Micro-interactions
- Button hover states
- Form focus states
- Loading spinners
- Smooth scrolling

## CSS Class Naming

### BEM Methodology
- **Block**: Component name (\`.card\`)
- **Element**: Part of component (\`.card__header\`)
- **Modifier**: Variation (\`.card--large\`)

### Utility Classes
- Use utility-first approach when possible
- Combine utilities for complex layouts
- Create component classes for reusable patterns

## Implementation Notes

### CSS Variables
\`\`\`css
:root {
  --color-primary: #2563eb;
  --color-secondary: #64748b;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #06b6d4;

  --font-family-sans: 'Inter', system-ui, sans-serif;
  --font-family-mono: 'JetBrains Mono', Consolas, monospace;

  --spacing-unit: 0.25rem;
  --border-radius-base: 0.375rem;
  --shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}
\`\`\`

### Responsive Utilities
- Use flexbox and grid for layouts
- Implement responsive typography
- Ensure proper spacing on all devices

## Best Practices

1. **Consistency**: Follow the design system strictly
2. **Accessibility**: Always consider users with disabilities
3. **Performance**: Optimize for fast loading and smooth animations
4. **Maintainability**: Write clean, organized CSS
5. **Documentation**: Document custom components and patterns
`;
			}

			await fs.writeFile(readmePath, designSystemContent);
		}
	}

	private async createOpenAPISpec(apiPath: string): Promise<void> {
		const openApiPath = path.join(apiPath, 'openapi.yaml');
		try {
			await fs.access(openApiPath);
		} catch {
			const openApiContent = `openapi: 3.0.3
info:
  title: Project API
  description: API specification for the project
  version: 1.0.0

servers:
  - url: http://localhost:3000/api
    description: Development server
  - url: https://api.example.com
    description: Production server

paths:
  /users:
    get:
      summary: Get all users
      tags:
        - Users
      parameters:
        - name: page
          in: query
          description: Page number
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          description: Number of users per page
          schema:
            type: integer
            default: 10
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/User'
                  pagination:
                    $ref: '#/components/schemas/Pagination'
    post:
      summary: Create a new user
      tags:
        - Users
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserRequest'
      responses:
        '201':
          description: User created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '400':
          description: Bad request
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /users/{id}:
    get:
      summary: Get user by ID
      tags:
        - Users
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '404':
          description: User not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
    put:
      summary: Update user by ID
      tags:
        - Users
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateUserRequest'
      responses:
        '200':
          description: User updated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '404':
          description: User not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
    delete:
      summary: Delete user by ID
      tags:
        - Users
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '204':
          description: User deleted successfully
        '404':
          description: User not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /products:
    get:
      summary: Get all products
      tags:
        - Products
      parameters:
        - name: category
          in: query
          description: Filter by category
          schema:
            type: string
        - name: price_min
          in: query
          description: Minimum price filter
          schema:
            type: number
        - name: price_max
          in: query
          description: Maximum price filter
          schema:
            type: number
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Product'

  /orders:
    get:
      summary: Get user orders
      tags:
        - Orders
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Order'
    post:
      summary: Create a new order
      tags:
        - Orders
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateOrderRequest'
      responses:
        '201':
          description: Order created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Order'

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          example: "123e4567-e89b-12d3-a456-426614174000"
        email:
          type: string
          format: email
          example: "user@example.com"
        name:
          type: string
          example: "John Doe"
        role:
          type: string
          enum: [admin, user, moderator]
          example: "user"
        createdAt:
          type: string
          format: date-time
          example: "2023-01-01T00:00:00Z"
        updatedAt:
          type: string
          format: date-time
          example: "2023-01-01T00:00:00Z"

    CreateUserRequest:
      type: object
      required:
        - email
        - name
        - password
      properties:
        email:
          type: string
          format: email
        name:
          type: string
        password:
          type: string
          minLength: 8
        role:
          type: string
          enum: [admin, user, moderator]
          default: "user"

    UpdateUserRequest:
      type: object
      properties:
        email:
          type: string
          format: email
        name:
          type: string
        role:
          type: string
          enum: [admin, user, moderator]

    Product:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        description:
          type: string
        price:
          type: number
          format: decimal
        category:
          type: string
        imageUrl:
          type: string
          format: uri
        inStock:
          type: boolean
        createdAt:
          type: string
          format: date-time

    Order:
      type: object
      properties:
        id:
          type: string
        userId:
          type: string
        items:
          type: array
          items:
            $ref: '#/components/schemas/OrderItem'
        total:
          type: number
          format: decimal
        status:
          type: string
          enum: [pending, processing, shipped, delivered, cancelled]
        createdAt:
          type: string
          format: date-time

    OrderItem:
      type: object
      properties:
        productId:
          type: string
        quantity:
          type: integer
          minimum: 1
        price:
          type: number
          format: decimal

    CreateOrderRequest:
      type: object
      required:
        - items
      properties:
        items:
          type: array
          items:
            type: object
            properties:
              productId:
                type: string
              quantity:
                type: integer
                minimum: 1

    Pagination:
      type: object
      properties:
        page:
          type: integer
        limit:
          type: integer
        total:
          type: integer
        totalPages:
          type: integer

    Error:
      type: object
      properties:
        error:
          type: string
        message:
          type: string
        code:
          type: integer

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

tags:
  - name: Users
    description: User management operations
  - name: Products
    description: Product catalog operations
  - name: Orders
    description: Order management operations
`;

			await fs.writeFile(openApiPath, openApiContent);
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