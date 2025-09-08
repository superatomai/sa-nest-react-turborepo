import { Injectable } from '@nestjs/common';
import { LlmService } from './llm.service';
import { WebSocketManagerService } from './websocket-manager.service';
import { T_UI_Component, Z_UI_Component } from '../types/ui-schema';
import { nanoid } from 'nanoid';

export interface GenerateUIRequest {
	prompt: string;
	currentSchema?: T_UI_Component;
	projectId: string;
}

export interface GenerateUIResponse {
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
export class UiGenerationService {
	constructor(
		private readonly llmService: LlmService,
		private readonly webSocketManager: WebSocketManagerService,
	) { }

	async generateUI(request: GenerateUIRequest): Promise<GenerateUIResponse> {
		const startTime = Date.now();

		try {
			const { prompt, currentSchema, projectId } = request;

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

			if (!currentSchema) {
				return {
					success: false,
					error: 'Current schema is required'
				};
			}

			console.log(`Processing prompt for project ${projectId}: "${prompt}"`);

			// Step 1: Generate GraphQL query from prompt
			const { query, variables } = await this.llmService.generateGraphQLFromPromptForProject(prompt, projectId);
			console.log(`Generated GraphQL query for project ${projectId}:`, query);

			// Step 2: Execute query via WebSocket to user's data agent
			console.log('Executing query for project', projectId, query, JSON.stringify(variables || {}, null, 2));

			let exec_query = this.getQueryFromDSL(currentSchema)[0];

			if (query) {
				exec_query = {
					id: nanoid(6),
					graphql: query,
					vars: variables
				};
			}

			const ws_data = await this.webSocketManager.executeQueryForUser(projectId, exec_query.graphql, exec_query.vars);
			console.log(`Received data for project ${projectId}:`, ws_data);

			const data = ws_data.data;

			// Step 3: Generate UI schema from data
			const schema: T_UI_Component = await this.llmService.generateUIFromData(
				data,
				prompt,
				query,
				variables,
				projectId,
				currentSchema
			);

			// Step 4: Add query metadata to UI schema
			const ui = schema;
			ui.query = {
				id: nanoid(6),
				graphql: query,
				vars: variables
			};

			// Step 5: Prepare response data structure
			const response: any = {
				ui: ui,
				data: {}
			};
			if (ui.query?.id) {
				response.data[ui.query.id] = data;
			}

			console.log('Generated UI response', response);

			return {
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

		} catch (error) {
			console.error('Error in generate-ui service:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			};
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
	 * Health check for the service dependencies
	 */
	async healthCheck(): Promise<{
		healthy: boolean;
		services: {
			llm: boolean;
			websocket: boolean;
		};
		issues: string[];
	}> {
		const issues: string[] = [];

		// Check WebSocket health
		const wsHealth = await this.webSocketManager.healthCheck();
		if (!wsHealth.healthy) {
			issues.push(...wsHealth.issues);
		}

		// Check LLM service (basic check)
		let llmHealthy = true;
		try {
			// Could add a simple test query here if needed
		} catch (error) {
			llmHealthy = false;
			issues.push('LLM service unavailable');
		}

		return {
			healthy: issues.length === 0,
			services: {
				llm: llmHealthy,
				websocket: wsHealth.healthy
			},
			issues
		};
	}

	/**
	 * Get service statistics
	 */
	getStatus() {
		const wsStats = this.webSocketManager.getStatus();

		return {
			websocket: wsStats,
			timestamp: new Date().toISOString()
		};
	}
}