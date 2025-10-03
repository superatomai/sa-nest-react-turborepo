import { Injectable } from '@nestjs/common';
import { LlmService } from './llm.service';
import { WebSocketManagerService } from './websocket-manager.service';
import { ProjectSchemaCacheService } from './project-schema-cache.service';
import { SSEService, SSEController } from './sse.service';
import { getNanoid } from '../utils/nanoid';
import { T_LLM_PROVIDER, UIComponent, UIElement } from 'src/types/dsl';

export interface GenerateUISSERequest {
	prompt: string;
	currentSchema:UIComponent;
	projectId: string;
}

export interface GenerateUISSEResponse {
	success: boolean;
	data?: UIComponent
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

		// Provider fallback order: groq -> gemini -> openrouter
		const providerFallbackOrder: T_LLM_PROVIDER[] = ['groq', 'gemini', 'openrouter'];
		console.log(`🤖 Provider fallback order: ${providerFallbackOrder.join(' → ')}`);

		// Send initial provider strategy message
		sseController.sendMessage('status', `🎯 Provider fallback strategy: ${providerFallbackOrder.map(p => p.toUpperCase()).join(' → ')}`);

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

			let hasActiveAgent = false;
			let query = '';
			let variables: Record<string, any> = {};
			let data: any = {};
			let exec_query: any = {
				key: getNanoid(),
				graphql: "",
			};
			// Check if there's an active data agent connection for the project
			// try {
			// 	sseController.sendMessage('status', '🔌 Checking for active data agent connection...');
			// 	const checkAgentConnection = await this.webSocketManager.checkAgentConnectionForProject(projectId);
			// 	hasActiveAgent = checkAgentConnection.hasAgent;
			// 	sseController.sendMessage('status', hasActiveAgent ? '✅ Active data agent found' : '❌ No active data agent found');
			// } catch (error) {
			// 	console.error('Error checking agent connection:', error);
			// 	sseController.sendError('Error checking agent connection', {
			// 		originalError: error instanceof Error ? error.message : 'Unknown error',
			// 		suggestion: 'Please check your project WebSocket connection and try again.'
			// 	});
			// }


			if(hasActiveAgent) {
				// Step 1: Get docs schema
				sseController.sendMessage('status', '📋 Getting docs schema via WebSocket...');
				let schemaData;
				try {
					schemaData = await this.projectSchemaCacheService.getProjectSchema(projectId);
					if (!schemaData.success) {
						sseController.sendError('Failed to fetch project schema via WebSocket', {
							originalError: schemaData.error,
							suggestion: 'The WebSocket connection may be unstable. Please try again.'
						});
						return;
					}
					sseController.sendMessage('status', '✅ Received schema from WebSocket');
				} catch (error) {
					sseController.sendError('WebSocket connection failed for docs retrieval', {
						originalError: error instanceof Error ? error.message : 'Unknown error',
						suggestion: 'Please check your project WebSocket connection and try again.'
					});
					return;
				}
	
				// Step 2: Generate GraphQL query from prompt
				sseController.sendMessage('status', '🔍 Generating GraphQL query...');
				const graphqlResult = await this.llmService.generateGraphQLFromPromptForProject(
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
				sseController.sendMessage('status', '⚡ Executing query via WebSocket...');
				console.log('Executing query for project', projectId, query, JSON.stringify(variables || {}, null, 2));

				const prev_queries = this.getQueryFromDSL(currentSchema);
				if(prev_queries.length > 0){
					exec_query = prev_queries[0];
				}

				if (query) {
					exec_query = {
						id: getNanoid(),
						graphql: query,
						vars: variables
					};
				}
	
				if(exec_query.graphql){
					console.log("exec_query", exec_query);
					// const ws_data = await this.webSocketManager.executeQueryForUser(projectId, exec_query.graphql, exec_query.vars);
					// console.log(`Received data for project ${projectId}:`, ws_data);
					// data = ws_data.data;/
					const ws_data = await this.executeQuery(projectId, exec_query.graphql, exec_query.vars);
	
					if (!ws_data.success) {
						sseController.sendError('Failed to execute query via WebSocket', {
							originalError: ws_data.error,
							query: query.length > 200 ? query.substring(0, 200) + '...' : query,
							suggestion: 'The WebSocket query execution failed. Please check your data connection and try again.'
						});
						return;
					}
		
					console.log(`Received data for project ${projectId}:`, ws_data.data);
					data = ws_data.data.data;
				}
	
	
				const recordCount = Array.isArray(data) ? data.length :
					data && typeof data === 'object' ? Object.keys(data).length : 0;
				sseController.sendMessage('status', '✅ Received data', { recordCount });
			} else {
				// No active agent - work with existing data from currentSchema or empty data
				const prev_queries = this.getQueryFromDSL(currentSchema);
				if(prev_queries.length > 0){
					exec_query = prev_queries[0];
				}
				data = currentSchema.data || {};
			}

			// Step 4: Generate UI schema from data with streaming and provider fallback
			sseController.sendMessage('status', '🎨 Generating UI...');

			// Update currentSchema with the fetched data
			const updatedCurrentSchema = {
				...currentSchema,
				data: data
			};

			// Try providers with fallback
			const schema = await this.generateUIWithProviderFallback(
				prompt,
				updatedCurrentSchema,
				providerFallbackOrder,
				projectId,
				sseController
			);

			if (!schema) {
				sseController.sendError('Failed to generate UI with all providers', {
					originalError: 'All provider attempts failed'
				});
				return;
			}

			sseController.sendMessage('status', '✅ UI generated');

			// Step 5: Prepare final response
			const ui = schema;
			// Update the query in the UIComponent schema format
			ui.query = {
				key: getNanoid(),
				graphql: exec_query.graphql,
				variables: exec_query.vars
			};


			// Step 6: Send final response
			sseController.sendMessage('status', '📤 Response ready');

			const finalResponse: GenerateUISSEResponse = {
				success: true,
				data: ui,
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

	// Provider fallback method with detailed SSE logging
	private async generateUIWithProviderFallback(
		prompt: string,
		currentSchema: UIComponent,
		providerOrder: T_LLM_PROVIDER[],
		projectId: string,
		sseController: SSEController
	): Promise<UIComponent | null> {
		let lastError = '';

		for (let i = 0; i < providerOrder.length; i++) {
			const provider = providerOrder[i];
			const isLastProvider = i === providerOrder.length - 1;

			try {
				// Send provider attempt message
				sseController.sendMessage('status', `🚀 Attempting UI generation with ${provider.toUpperCase()}...`);
				console.log(`🚀 Trying provider: ${provider} (attempt ${i + 1}/${providerOrder.length})`);

				// Stream LLM generation to frontend
				let llmBuffer = '';
				let lastSentLength = 0;
				const streamCallback = (chunk: string) => {
					llmBuffer += chunk;

					// Send incremental updates - immediately for every chunk
					sseController.sendMessage('llm_stream', `🤖 ${llmBuffer.slice(lastSentLength)}`);
					lastSentLength = llmBuffer.length;
				};

				// Attempt UI generation with current provider
				const schema_res = await this.llmService.generateUIFromData2WithProvider(
					prompt,
					currentSchema,
					provider,
					projectId,
					streamCallback
				);

				// Send any remaining buffer content
				if (llmBuffer.length > lastSentLength) {
					sseController.sendMessage('llm_stream', `🤖 ${llmBuffer.slice(lastSentLength)}`);
				}

				// Send completion signal for LLM streaming
				sseController.sendMessage('llm_complete', `✅ ${provider.toUpperCase()} generation complete`);

				// Check if generation was successful
				if (schema_res.success && 'data' in schema_res && schema_res.data) {
					sseController.sendMessage('status', `✅ UI generated successfully with ${provider.toUpperCase()}`);
					console.log(`✅ Success with provider: ${provider}`);
					return schema_res.data;
				} else {
					// Generation failed, log the error
					lastError = ('error' in schema_res && schema_res.error) ? schema_res.error : 'Unknown error - no data returned';
					throw new Error(lastError);
				}

			} catch (error: any) {
				const errorMessage = error?.message || 'Unknown error';
				lastError = errorMessage;

				console.error(`❌ Provider ${provider} failed:`, errorMessage);

				if (isLastProvider) {
					// This is the last provider, send final error
					sseController.sendMessage('status', `❌ ${provider.toUpperCase()} failed: ${errorMessage}`);
					sseController.sendMessage('status', '❌ All providers failed - Unable to generate UI');
				} else {
					// Not the last provider, send switch message
					const nextProvider = providerOrder[i + 1];
					sseController.sendMessage('status', `❌ ${provider.toUpperCase()} failed: ${errorMessage}`);
					sseController.sendMessage('status', `🔄 Switching to ${nextProvider.toUpperCase()}...`);

					// Add a small delay to make the switching visible
					await new Promise(resolve => setTimeout(resolve, 500));
				}
			}
		}

		console.error(`❌ All providers failed. Last error: ${lastError}`);
		return null;
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

	getQueryFromDSL(dsl: UIComponent) {
		const queries: any[] = [];

		// Check component-level query first
		if (dsl.query && (dsl.query.graphql || dsl.query.sql)) {
			queries.push(dsl.query);
		}

		// Recursively search through the render tree
		const recurseUIElement = (element: UIElement | UIComponent | string | any) => {
			// Handle string children
			if (typeof element === 'string') {
				return;
			}

			// Handle UIComponent children (nested components)
			if (element.render) {
				// This is a UIComponent
				if (element.query && (element.query.graphql || element.query.sql)) {
					queries.push(element.query);
				}
				recurseUIElement(element.render);
				return;
			}

			// Handle UIElement
			if (element.query && (element.query.graphql || element.query.sql)) {
				queries.push(element.query);
			}

			// Recursively check children
			if (element.children) {
				if (Array.isArray(element.children)) {
					for (const child of element.children) {
						recurseUIElement(child);
					}
				} else {
					recurseUIElement(element.children);
				}
			}
		}

		// Start recursion from the render tree
		if (dsl.render) {
			recurseUIElement(dsl.render);
		}

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