import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { VersionsService } from '../uis/versions.service';
import { WebSocketManagerService } from './websocket-manager.service';
import { Z_UI_Component, T_UI_Component } from '../types/ui-schema';
// import type { User } from '@clerk/backend';
import { User } from '@superatom-turbo/trpc';

export interface GetUIRequest {
	projectId: string;
	uiId: string;
}

export interface GetUIResponse {
	success: boolean;
	data?: {
		ui: T_UI_Component;
		data: Record<string, any>;
	};
	meta?: {
		executionTime: number;
		hasData: boolean;
		queryExecuted: boolean;
	};
	error?: string;
}

@Injectable()
export class UiDataService {
	constructor(
		private readonly versionsService: VersionsService,
		private readonly webSocketManager: WebSocketManagerService,
	) { }

	/**
	 * Fetches DSL from the versions table (equivalent to your fetchDSL)
	 */
	private async fetchDSL(projectId: string, uiId: string, user?: User): Promise<{
		success: boolean;
		data?: string;
		error?: string;
	}> {
		try {
			// Get the latest version for this UI
			const versionResult = await this.versionsService.getLatestVersionForUi(uiId, user);

			if (!versionResult.version) {
				return {
					success: false,
					error: `No versions found for UI ${uiId}`
				};
			}

			return {
				success: true,
				data: versionResult.version.dsl
			};

		} catch (error) {
			console.error('Error fetching DSL:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to fetch DSL'
			};
		}
	}

	/**
	 * Main method to get UI with data (equivalent to your POST API)
	 */
	async getUIWithData(request: GetUIRequest, user?: User): Promise<GetUIResponse> {
		return await this.getProdUI(request.projectId, request.uiId, user);
	}

	async getProdUI(projectId: string, uiId: string, user?: User) {
		const startTime = Date.now();
		console.log(`[UiDataService] Request started at ${new Date().toISOString()}`);

		try {
			// Validation
			if (!projectId || typeof projectId !== 'string') {
				throw new BadRequestException('Project ID is required and must be a string');
			}

			if (!uiId || typeof uiId !== 'string') {
				throw new BadRequestException('UI ID is required and must be a string');
			}

			console.log('Processing request for:', projectId, uiId);

			// Step 1: Fetch DSL
			const dslResult = await this.fetchDSL(projectId, uiId, user);
			console.log('DSL fetch result:', dslResult.success);

			if (!dslResult.success) {
				throw new NotFoundException('Failed to fetch DSL: ' + dslResult.error);
			}

			let dsl: any;
			try {
				dsl = JSON.parse(dslResult.data!);
			} catch (err) {
				console.error('Invalid DSL JSON:', err);
				throw new BadRequestException('Invalid DSL JSON');
			}

			// Step 2: Parse and validate UI component
			const parsed = Z_UI_Component.safeParse(dsl.ui);
			if (!parsed.success) {
				console.error('Invalid UI schema:', parsed.error);
				throw new BadRequestException('Invalid UI schema');
			}

			const ui_schema = parsed.data;

			// Ensure query exists
			if (!ui_schema.query?.graphql) {
				throw new BadRequestException('UI schema must contain a valid GraphQL query');
			}

			const query = ui_schema.query.graphql;
			const variables = ui_schema.query.vars;

			let data: any = null;
			let queryExecuted = false;

			// Step 3: Execute GraphQL query
			try {
				console.log(`[UiDataService] Checking WebSocket manager health for project: ${projectId}`);

				// Health check if available
				const healthCheck = await this.webSocketManager.healthCheck();
				if (!healthCheck.healthy) {
					console.warn('[UiDataService] WebSocket connection issues:', healthCheck.issues);
				}

				console.log('[UiDataService] Executing GraphQL query via WebSocket...');
				const queryStartTime = Date.now();

				const query_response = await this.webSocketManager.executeQueryForUser(
					projectId,
					query,
					variables
				);

				const queryDuration = Date.now() - queryStartTime;
				console.log(`[UiDataService] Query completed in ${queryDuration}ms`);
				console.log('[UiDataService] Query response received:', {
					hasResponse: !!query_response,
					hasData: !!query_response?.data,
					hasError: !!query_response?.error,
					responseKeys: query_response ? Object.keys(query_response) : []
				});

				queryExecuted = true;

				if (query_response?.error) {
					console.error('[UiDataService] Query response contains error:', query_response.error);
					data = null;
				} else if (query_response?.data) {
					console.log('[UiDataService] Query executed successfully, data received');
					data = query_response.data;
				} else {
					console.warn('[UiDataService] Query response has no data or error');
					data = null;
				}

			} catch (error: any) {
				console.error('[UiDataService] WebSocket query error:', {
					message: error.message,
					stack: error.stack,
					name: error.name
				});

				queryExecuted = true; // Attempted but failed
				data = null;

				// Check for specific error types
				if (error.message?.includes('timeout')) {
					console.error('[UiDataService] Query timed out - possible WebSocket connection issues');
				}
			}

			// Step 4: Prepare response
			if (!dsl.data) {
				dsl.data = {};
			}

			if (ui_schema.query?.id) {
				dsl.data[ui_schema.query.id] = data;
			}

			const totalDuration = Date.now() - startTime;
			console.log(`[UiDataService] Request completed in ${totalDuration}ms`);

			return {
				success: true,
				data: dsl,
				meta: {
					executionTime: totalDuration,
					hasData: data !== null,
					queryExecuted
				}
			};

		} catch (error: any) {
			const totalDuration = Date.now() - startTime;
			console.error('[UiDataService] Runtime engine error:', {
				message: error.message,
				stack: error.stack,
				duration: totalDuration
			});

			return {
				success: false,
				error: error.message || 'Failed to get UI data',
				meta: {
					executionTime: totalDuration,
					hasData: false,
					queryExecuted: false
				}
			};
		}
	}

	/**
	 * Get UI without executing queries (just the schema)
	 */
	async getUISchema(request: GetUIRequest, user?: User): Promise<{
		success: boolean;
		data?: T_UI_Component;
		error?: string;
	}> {
		try {
			const { projectId, uiId } = request;

			if (!projectId || !uiId) {
				return {
					success: false,
					error: 'Project ID and UI ID are required'
				};
			}

			const dslResult = await this.fetchDSL(projectId, uiId, user);

			if (!dslResult.success) {
				return {
					success: false,
					error: dslResult.error
				};
			}

			let dsl: any;
			try {
				dsl = JSON.parse(dslResult.data!);
			} catch (err) {
				return {
					success: false,
					error: 'Invalid DSL JSON'
				};
			}

			const parsed = Z_UI_Component.safeParse(dsl.ui);
			if (!parsed.success) {
				return {
					success: false,
					error: 'Invalid UI schema'
				};
			}

			return {
				success: true,
				data: parsed.data
			};

		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			};
		}
	}

	/**
	 * Health check for the service
	 */
	async healthCheck(): Promise<{
		healthy: boolean;
		services: {
			versions: boolean;
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

		// Versions service is always healthy if no errors
		let versionsHealthy = true;

		return {
			healthy: issues.length === 0,
			services: {
				versions: versionsHealthy,
				websocket: wsHealth.healthy
			},
			issues
		};
	}
}
