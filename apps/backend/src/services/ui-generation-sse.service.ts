import { Injectable } from '@nestjs/common';
import { LlmService } from './llm.service';
import { WebSocketManagerService } from './websocket-manager.service';
import { ProjectSchemaCacheService } from './project-schema-cache.service';
import { SSEService, SSEController } from './sse.service';
import { T_UI_Component } from '../types/ui-schema';
import { nanoid } from 'nanoid';

export interface GenerateUISSERequest {
	prompt: string;
	currentSchema: T_UI_Component;
	projectId: string;
}

export interface GenerateUISSEResponse {
	success: boolean;
	data?: {
		ui: T_UI_Component;
		data: Record<string, any>;
	};
	metadata?: {
		projectId: string;
		originalPrompt: string;
		graphqlQuery: string;
		graphqlVariables?: Record<string, any>;
		executionTime: number;
	};
	error?: string;
}

@Injectable()
export class UiGenerationSSEService {
	constructor(
		private readonly llmService: LlmService,
		private readonly webSocketManager: WebSocketManagerService,
		private readonly projectSchemaCacheService: ProjectSchemaCacheService,
		private readonly sseService: SSEService,
	) { }

	async generateUIWithSSE(
		request: GenerateUISSERequest,
		sseController: SSEController
	): Promise<void> {
		const startTime = Date.now();

		try {
			const { prompt, currentSchema, projectId } = request;

			// Validate inputs
			if (!prompt || typeof prompt !== 'string') {
				sseController.sendError('Prompt is required and must be a string');
				return;
			}

			if (!projectId || typeof projectId !== 'string') {
				sseController.sendError('Project ID is required and must be a string');
				return;
			}

			if(!currentSchema) {
				sseController.sendError('Current schema is required');
				return;
			}

			console.log(`Processing  prompt for project ${projectId}: "${prompt}"`);

			// Step 1: Get docs schema
			sseController.sendMessage('status', '📋 Getting docs schema...');
			const schemaData = await this.projectSchemaCacheService.getProjectSchema(projectId);
			if (!schemaData.success) {
				sseController.sendError('Failed to fetch project schema', {
					originalError: schemaData.error
				});
				return;
			}
			sseController.sendMessage('status', '✅ Received schema');

			// Step 2: Generate GraphQL query from prompt
			sseController.sendMessage('status', '🔍 Generating GraphQL query...');
			const graphqlResult = await this.llmService.generateGraphQLFromPromptForProject2(
				prompt,
				projectId,
				schemaData.data
			);

			if (!graphqlResult.success || !graphqlResult.data) {
				sseController.sendError('Failed to generate GraphQL query');
				return;
			}

			const { query, variables } = graphqlResult.data;
			console.log(`Generated GraphQL query for project ${projectId}:`, query);

			sseController.sendMessage('status', '✅ Generated GraphQL query', {
				query: query.length > 100 ? query.substring(0, 100) + '...' : query
			});

			// Step 3: Execute query via WebSocket to user's data agent
			sseController.sendMessage('status', '⚡ Executing the query...');
			console.log('Executing query for project', projectId, query, JSON.stringify(variables || {}, null, 2));

			let exec_query:any = {
				id: nanoid(6),
				graphql: "",
			}

			const prev_queries = this.getQueryFromDSL(currentSchema);
			if(prev_queries.length > 0){
				exec_query = prev_queries[0];
			}

			if (query) {
				exec_query = {
					id: nanoid(6),
					graphql: query,
					vars: variables
				};
			}

			let data = {};

			if(exec_query.graphql){
				console.log("exec_query", exec_query);
				// const ws_data = await this.webSocketManager.executeQueryForUser(projectId, exec_query.graphql, exec_query.vars);
				// console.log(`Received data for project ${projectId}:`, ws_data);
				// data = ws_data.data;/
				const ws_data = await this.executeQuery(projectId, exec_query.graphql, exec_query.vars);

				if (!ws_data.success) {
					sseController.sendError('Failed to execute query', {
						originalError: ws_data.error,
						query: query.substring(0, 200) + '...'
					});
					return;
				}
	
				console.log(`Received data for project ${projectId}:`, ws_data.data);
				data = ws_data.data.data;
			}


			const recordCount = Array.isArray(data) ? data.length :
				data && typeof data === 'object' ? Object.keys(data).length : 0;
			sseController.sendMessage('status', '✅ Received data', { recordCount });

			// Step 4: Generate UI schema from data
			sseController.sendMessage('status', '🎨 Generating UI...');

			const schema_res = await this.llmService.generateUIFromData2(
				data,
				prompt,
				exec_query.graphql,
				exec_query.vars,
				projectId,
				currentSchema
			);

			if(!schema_res.success || !schema_res.data){
				sseController.sendError('Failed to generate UI', {
					originalError: schema_res.error
				});
				return;
			}

			const schema = schema_res.data;

			sseController.sendMessage('status', '✅ UI generated');

			// Step 5: Prepare final response
			const ui = schema;
			ui.query = {
				id: nanoid(6),
				graphql: exec_query.graphql,
				vars: exec_query.vars
			};

			const response: any = {
				ui: ui,
				data: {}
			};

			if (ui.query?.id) {
				response.data[ui.query.id] = data;
			}

			// Step 6: Send final response
			sseController.sendMessage('status', '📤 Response ready');

			const finalResponse: GenerateUISSEResponse = {
				success: true,
				data: response,
				metadata: {
					projectId,
					originalPrompt: prompt,
					graphqlQuery: query,
					graphqlVariables: variables,
					executionTime: Date.now() - startTime
				}
			};

			sseController.sendComplete('UI successfully generated!', finalResponse);

		} catch (error) {
			console.error('Error in generate-ui SSE service:', error);
			sseController.sendError('An unexpected error occurred', {
				originalError: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	private async executeQuery(
		projectId: string,
		query: string,
		variables?: Record<string, any>
	): Promise<{ success: boolean; data?: any; error?: string }> {
		try {
			const result = await this.webSocketManager.executeQueryForUser(projectId, query, variables);
			console.log(`Received data for project ${projectId}:`, result);
			return { success: true, data: result };
		} catch (error: any) {
			console.error(`Failed to execute query for project ${projectId}:`, error);
			return { success: false, error: 'Failed to execute query: ' + error.message };
		}
	}

	getQueryFromDSL(dsl: T_UI_Component) {
		const queries: any[] = [];

		const recurse = (component: T_UI_Component) => {
			if (component.query && component.query?.graphql) {
				queries.push(component.query);

				// get only one query
				// return;
			}

			if (!component.children) return;

			for (let c of component.children) {
				if (typeof c === 'string') { }
				else {
					recurse(c);
				}
			}
		}

		recurse(dsl);

		return queries;

	}


	/**
	 * Health check for the SSE service dependencies
	 */
	async healthCheck(): Promise<{
		healthy: boolean;
		services: {
			llm: boolean;
			websocket: boolean;
			projectSchemaCache: boolean;
			sse: boolean;
		};
		issues: string[];
	}> {
		const issues: string[] = [];

		// Check WebSocket health
		const wsHealth = await this.webSocketManager.healthCheck();
		if (!wsHealth.healthy) {
			issues.push(...wsHealth.issues);
		}

		// Check LLM service
		let llmHealthy = true;
		try {
			// Could add a simple test query here if needed
		} catch (error) {
			llmHealthy = false;
			issues.push('LLM service unavailable');
		}

		// Check project schema cache
		let projectSchemaCacheHealthy = true;
		try {
			// Basic health check for project schema cache
		} catch (error) {
			projectSchemaCacheHealthy = false;
			issues.push('Project schema cache unavailable');
		}

		return {
			healthy: issues.length === 0,
			services: {
				llm: llmHealthy,
				websocket: wsHealth.healthy,
				projectSchemaCache: projectSchemaCacheHealthy,
				sse: true // SSE service is stateless, so always healthy
			},
			issues
		};
	}

	/**
	 * Get service statistics for SSE
	 */
	getStatus() {
		const wsStats = this.webSocketManager.getStatus();

		return {
			websocket: wsStats,
			sse: {
				enabled: true,
				version: '1.0.0'
			},
			timestamp: new Date().toISOString()
		};
	}
}