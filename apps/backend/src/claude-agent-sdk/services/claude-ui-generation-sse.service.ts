import { Injectable } from '@nestjs/common';
import { ClaudeUIAgentService } from './claude-ui-agent.service';
import { WebSocketManagerService } from '../../services/websocket-manager.service';
import { ProjectSchemaCacheService } from '../../services/project-schema-cache.service';
import { SSEController } from '../../services/sse.service';
import { nanoid } from 'nanoid';
import { UIComponent } from 'src/types/dsl';

export interface ClaudeGenerateUISSERequest {
	prompt: string;
	currentSchema: UIComponent;
	projectId: string;
	uiId: string; // Always provided from frontend
}

export interface ClaudeGenerateUISSEResponse {
	success: boolean;
	data?: UIComponent;
	uiId?: string;
	filePath?: string;
	metadata?: {
		projectId: string;
		uiId: string;
		originalPrompt: string;
		graphqlQuery?: string;
		graphqlVariables?: Record<string, any>;
		executionTime: number;
		claudeVersion: string;
	};
	error?: string;
}

@Injectable()
export class ClaudeUIGenerationSSEService {
	constructor(
		private readonly claudeUIAgentService: ClaudeUIAgentService,
		private readonly webSocketManager: WebSocketManagerService,
		private readonly projectSchemaCacheService: ProjectSchemaCacheService,
	) { }

	async generateUIWithClaudeSSE(
		request: ClaudeGenerateUISSERequest,
		sseController: SSEController
	): Promise<void> {
		const startTime = Date.now();

		try {
			const { prompt, currentSchema, projectId, uiId } = request;

			if (!prompt || typeof prompt !== 'string') {
				sseController.sendError('Prompt is required and must be a string');
				return;
			}

			if (!projectId || typeof projectId !== 'string') {
				sseController.sendError('Project ID is required and must be a string');
				return;
			}

			if (!currentSchema) {
				sseController.sendError('Current schema is required');
				return;
			}

			console.log(`🤖 Processing Claude Agent UI generation for project ${projectId}: "${prompt}"`);

			sseController.sendMessage('status', '🚀 Initializing Claude Agent...');

			let hasActiveAgent = false;
			let query = '';
			let variables: Record<string, any> = {};
			let data: any = {};
			let exec_query: any = {
				key: nanoid(6),
				graphql: "",
			};

			sseController.sendMessage('status', '🔌 Checking for active data agent connection...');
			try {
				const checkAgentConnection = await this.webSocketManager.checkAgentConnectionForProject(projectId);
				hasActiveAgent = checkAgentConnection.hasAgent;
				sseController.sendMessage('status', hasActiveAgent ? '✅ Active data agent found' : '❌ No active data agent found');
			} catch (error) {
				console.error('Error checking agent connection:', error);
				hasActiveAgent = false;
				sseController.sendMessage('status', '❌ No active data agent found');
			}

			if (hasActiveAgent) {
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

				const prev_queries = this.getQueryFromDSL(currentSchema);
				if (prev_queries.length > 0) {
					exec_query = prev_queries[0];
				}

				if (exec_query.graphql) {
					console.log("exec_query", exec_query);
					const ws_data = await this.executeQuery(projectId, exec_query.graphql, exec_query.vars);

					if (!ws_data.success) {
						sseController.sendError('Failed to execute query via WebSocket', {
							originalError: ws_data.error,
							query: exec_query.graphql.length > 200 ? exec_query.graphql.substring(0, 200) + '...' : exec_query.graphql,
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
				const prev_queries = this.getQueryFromDSL(currentSchema);
				if (prev_queries.length > 0) {
					exec_query = prev_queries[0];
				}
				data = currentSchema.data || {};
			}

			sseController.sendMessage('status', '🎨 Generating UI with Claude Agent...');

			const updatedCurrentSchema = {
				...currentSchema,
				data: data
			};

			let claudeBuffer = '';
			let lastSentLength = 0;
			const streamCallback = (chunk: string, eventType?: string) => {
				// If eventType is provided, it's a status/tool event
				if (eventType === 'tool_use' || eventType === 'status') {
					sseController.sendMessage(eventType, chunk);
				} else {
					// Regular Claude text streaming
					claudeBuffer += chunk;
					sseController.sendMessage('claude_stream', `🤖 ${claudeBuffer.slice(lastSentLength)}`);
					lastSentLength = claudeBuffer.length;
				}
			};

			const claudeResult = await this.claudeUIAgentService.generateUIWithClaudeAgent(
				{
					prompt,
					currentSchema: updatedCurrentSchema,
					projectId,
					uiId
				},
				streamCallback
			);

			if (claudeBuffer.length > lastSentLength) {
				sseController.sendMessage('claude_stream', `🤖 ${claudeBuffer.slice(lastSentLength)}`);
			}

			sseController.sendMessage('claude_complete', '✅ Claude Agent generation complete');

			if (!claudeResult.success) {
				sseController.sendError('Failed to generate UI with Claude Agent', {
					originalError: claudeResult.error
				});
				return;
			}

			sseController.sendMessage('status', '✅ UI generated successfully');

			const ui = { ...claudeResult.data! };
			// if (!ui.query) {
			// 	ui.query = {
			// 		key: nanoid(6),
			// 		graphql: exec_query.graphql,
			// 		variables: exec_query.vars
			// 	};
			// }

			sseController.sendMessage('status', '📤 Response ready');

			const finalResponse: ClaudeGenerateUISSEResponse = {
				success: true,
				data: ui,
				uiId: claudeResult.uiId,
				filePath: claudeResult.jsxFilePath,
				metadata: {
					projectId,
					uiId: claudeResult.uiId!,
					originalPrompt: prompt,
					graphqlQuery: query,
					graphqlVariables: variables,
					executionTime: Date.now() - startTime,
					claudeVersion: claudeResult.metadata?.claudeVersion || 'claude-3-5-sonnet-20241022'
				}
			};

			sseController.sendComplete('UI successfully generated with Claude Agent!', finalResponse);

		} catch (error) {
			console.error('Error in Claude UI generation SSE service:', error);
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

	getQueryFromDSL(dsl: UIComponent) {
		const queries: any[] = [];

		if (dsl.query && (dsl.query.graphql || dsl.query.sql)) {
			queries.push(dsl.query);
		}

		const recurseUIElement = (element: any) => {
			if (typeof element === 'string') {
				return;
			}

			if (element.render) {
				if (element.query && (element.query.graphql || element.query.sql)) {
					queries.push(element.query);
				}
				recurseUIElement(element.render);
				return;
			}

			if (element.query && (element.query.graphql || element.query.sql)) {
				queries.push(element.query);
			}

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

		if (dsl.render) {
			recurseUIElement(dsl.render);
		}

		return queries;
	}

	async healthCheck(): Promise<{
		healthy: boolean;
		services: {
			claudeAgent: boolean;
			websocket: boolean;
			projectSchemaCache: boolean;
			sse: boolean;
		};
		issues: string[];
	}> {
		const issues: string[] = [];

		const claudeHealthResult = await this.claudeUIAgentService.healthCheck();
		if (!claudeHealthResult.healthy) {
			issues.push(...claudeHealthResult.issues);
		}

		const wsHealth = await this.webSocketManager.healthCheck();
		if (!wsHealth.healthy) {
			issues.push(...wsHealth.issues);
		}

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
				claudeAgent: claudeHealthResult.healthy,
				websocket: wsHealth.healthy,
				projectSchemaCache: projectSchemaCacheHealthy,
				sse: true
			},
			issues
		};
	}

	getStatus() {
		const wsStats = this.webSocketManager.getStatus();

		return {
			websocket: wsStats,
			claudeAgent: {
				enabled: true,
				version: '1.0.0'
			},
			sse: {
				enabled: true,
				version: '1.0.0'
			},
			timestamp: new Date().toISOString()
		};
	}
}