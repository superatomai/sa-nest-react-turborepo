import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { DocsMessage, GetDocsMessage, GetProdUIMessage, GraphQLQueryMessage, PendingRequest, ProdUIResponseMessage, QueryResponseMessage, WebSocketMessage } from 'src/types/websocket';
import WebSocket from 'ws';
import { UiUtilsService } from './ui-utils.service';
import { Z_UI_Component } from 'src/types/ui-schema';
import { RUNTIME_PROJECT_ID, WEBSOCKET_URL } from '../env';

class WebSocketRuntimeClient {
	private ws: WebSocket | null = null;
	private connected = false;
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 5;
	private reconnectTimeout: NodeJS.Timeout | null = null;
	private pendingRequests = new Map<string, PendingRequest>();
	private clientId: string | null = null;
	private lastPongReceived: number = 0;

	constructor(
		private websocketUrl: string,
		private projectId: string,
		private uiUtilsService: UiUtilsService, // 👈 inject her
	) { }

	async connect(): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				// This URL automatically routes to the user-specific Durable Object
				const wsUrl = `${this.websocketUrl}/websocket?type=runtime&projectId=${this.projectId}`;

				console.log(`Connecting to WebSocket: ${wsUrl}`);
				this.ws = new WebSocket(wsUrl, {
					family: 4, // force IPv4
					handshakeTimeout: 30000, // 30 seconds
					timeout: 30000,
				});

				const connectTimeout = setTimeout(() => {
					if (this.ws) {
						this.ws.terminate();
					}
					reject(new Error(`Connection timeout after 30 seconds for project ${this.projectId}`));
				}, 30000);

				this.ws.on('open', () => {
					clearTimeout(connectTimeout);
					this.connected = true;
					this.lastPongReceived = Date.now();
					this.reconnectAttempts = 0;
					resolve();
				});

				this.ws.on('error', (error) => {
					clearTimeout(connectTimeout);
					console.error(`Runtime WebSocket error for project ${this.projectId}:`, error);

					// Provide more specific error messages
					let errorMessage = 'WebSocket connection failed';
					if (error.message.includes('ETIMEDOUT')) {
						errorMessage = `Connection timeout - WebSocket server may be unreachable (${this.websocketUrl})`;
					} else if (error.message.includes('ENETUNREACH')) {
						errorMessage = `Network unreachable - Check internet connection and server availability`;
					} else if (error.message.includes('ECONNREFUSED')) {
						errorMessage = `Connection refused - WebSocket server may be down`;
					}

					reject(new Error(`${errorMessage}: ${error.message}`));
				});

				this.ws.on('close', (code, reason) => {
					console.log(`Runtime WebSocket disconnected for project ${this.projectId}:`, code, reason.toString());
					this.connected = false;
					this.handleDisconnection();
				});

				this.ws.on('message', (data) => {
					this.handleMessage(data.toString());
				});

			} catch (error) {
				reject(error);
			}
		});
	}

	private handleMessage(data: string): void {
		// console.log('data received on runtime', data);
		try {
			const message: WebSocketMessage = JSON.parse(data);
			console.log(`Runtime received message for project ${this.projectId}:`, message.type);

			switch (message.type) {
				case 'connected':
					this.clientId = message.clientId || null;
					console.log(`Runtime connected with ID: ${this.clientId} for project ${this.projectId} (dedicated DO)`);
					break;

				case 'query_response':
					this.handleQueryResponse(message as QueryResponseMessage);
					break;

				case 'docs':
					this.handleDocsResponse(message as DocsMessage);
					break;
				case 'get_prod_ui':
					this.handleGetProdUI(message as GetProdUIMessage);
					break;
				case 'error':
					this.handleError(message);
					break;
				case 'pong':
					this.lastPongReceived = Date.now();
					break;

				default:
					console.warn('Unknown message type:', message.type);
			}
		} catch (error) {
			console.error('Error parsing WebSocket message:', error);
		}
	}

	private handleQueryResponse(message: QueryResponseMessage): void {
		const pendingRequest = this.pendingRequests.get(message.requestId);
		if (!pendingRequest) {
			console.warn(`No pending request found for ID: ${message.requestId}`);
			return;
		}

		clearTimeout(pendingRequest.timeout);
		this.pendingRequests.delete(message.requestId);

		if (message.error) {
			pendingRequest.reject(new Error(message.error));
		} else {
			pendingRequest.resolve(message);
		}
	}

	private handleDocsResponse(message: DocsMessage): void {
		const pendingRequest = this.pendingRequests.get(message.requestId);
		if (!pendingRequest) {
			console.warn(`No pending docs request found for ID: ${message.requestId}`);
			return;
		}

		clearTimeout(pendingRequest.timeout);
		this.pendingRequests.delete(message.requestId);

		if (message.error) {
			pendingRequest.reject(new Error(message.error));
		} else {
			pendingRequest.resolve(message);
		}
	}

	private async handleGetProdUI(message: GetProdUIMessage): Promise<void> {
		console.log(
			`Runtime handling get_prod_ui (uiId=${message.uiId}, requestId=${message.requestId}) for project ${this.projectId}`
		);

		try {
			const projectId = message.projectId;
			const uiId = message.uiId;

			// 1️⃣ Fetch DSL from UiUtilsService
			const dslResult = await this.uiUtilsService.fetchDSL({
				projectId,
				uiId: uiId,
			});

			if (!dslResult.success || !dslResult.data) {
				throw new Error(dslResult.message || 'DSL not found');
			}

			let dsl = dslResult.data as any;

			console.log('dsl', dsl);
			// 2️⃣ Build query + vars (depends on your DSL structure)
			let data: null | any = null;

			try {
				dsl = JSON.parse(dsl);
			} catch (err) {
				console.error('Invalid DSL JSON:', err)
				throw new Error('Invalid DSL JSON');
			}

			const parsed = Z_UI_Component.safeParse(dsl.ui);
			if (!parsed.success) {
				console.error('Invalid DSL JSON:', parsed.error)
				throw new Error('Invalid DSL JSON');
			}

			const ui_schema = parsed.data;
			const query = ui_schema.query?.graphql;
			const variables = ui_schema.query?.vars;
			const queryId = ui_schema.query?.id; // 👈 safe access


			if (!query) {
				console.error('no query found in DSL')
				throw new Error('no query found in DSL');
			}


			// 3️⃣ Execute query against runtime/agent
			const queryResponse = await this.executeGraphQLQuery(query, variables);

			data = queryResponse.data;
			// const uiData = {
			//   id: message.uiId,
			//   type: "div",
			//   children: [
			//     { id: "child-1", type: "span", children: ["Hello from runtime!"] }
			//   ]
			// };

			// add data to dsl
			// Ensure `dsl.data` exists
			dsl.data = dsl.data || {};
			// Only assign if queryId is defined
			if (queryId) {
				dsl.data[queryId] = data;
			} else {
				console.warn('⚠️ query.id not provided in DSL, skipping data assignment');
			}

			console.log('res in getting prod data', queryResponse);

			const response: ProdUIResponseMessage = {
				type: "prod_ui_response",
				requestId: message.requestId,
				uiId: uiId,
				data: dsl,
				projectId: this.projectId,  // NEW: Include project ID in prod_ui_response
				prodId: message.prodId,  // NEW: Include prodId in prod_ui_response
			};

			this.ws?.send(JSON.stringify(response));
			console.log(
				`Sent prod_ui_response (uiId=${message.uiId}, requestId=${message.requestId})`
			);
		} catch (err: any) {
			const response: ProdUIResponseMessage = {
				type: "prod_ui_response",
				requestId: message.requestId,
				uiId: message.uiId,
				data: { error: err.message || "Failed to build UI" },
				projectId: this.projectId,
				prodId: message.prodId,
			};
			this.ws?.send(JSON.stringify(response));
			console.error(
				`Failed to process get_prod_ui (uiId=${message.uiId}, requestId=${message.requestId}):`,
				err
			);
		}
	}


	private handleError(message: any): void {
		console.error(`WebSocket error for project ${this.projectId}:`, message.message);

		if (message.requestId) {
			const pendingRequest = this.pendingRequests.get(message.requestId);
			if (pendingRequest) {
				clearTimeout(pendingRequest.timeout);
				this.pendingRequests.delete(message.requestId);
				pendingRequest.reject(new Error(message.message));
			}
		}
	}

	private handleDisconnection(): void {
		this.pendingRequests.forEach((request) => {
			clearTimeout(request.timeout);
			request.reject(new Error('WebSocket disconnected'));
		});
		this.pendingRequests.clear();

		if (this.reconnectAttempts < this.maxReconnectAttempts) {
			this.reconnectAttempts++;
			const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
			console.log(`Attempting to reconnect for project ${this.projectId} (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`);

			this.reconnectTimeout = setTimeout(async () => {
				try {
					await this.connect();
					console.log(`✅ Successfully reconnected project ${this.projectId} after ${this.reconnectAttempts} attempts`);
				} catch (error) {
					console.error(`❌ Reconnection attempt ${this.reconnectAttempts} failed for project ${this.projectId}:`, error instanceof Error ? error.message : error);
					// handleDisconnection will be called again if connection fails
				}
			}, delay);
		} else {
			console.error(`❌ Max reconnection attempts (${this.maxReconnectAttempts}) reached for project ${this.projectId}. WebSocket service unavailable.`);
		}
	}

	async executeGraphQLQuery(query: string, variables?: Record<string, any>): Promise<any> {
		if (!this.connected || !this.ws) {
			throw new Error('WebSocket not connected');
		}

		return new Promise((resolve, reject) => {
			const requestId = crypto.randomUUID();

			const timeout = setTimeout(() => {
				this.pendingRequests.delete(requestId);
				reject(new Error('Query timeout'));
			}, 40000);

			this.pendingRequests.set(requestId, {
				requestId,
				resolve,
				reject,
				timeout
			});

			const message: GraphQLQueryMessage = {
				type: 'graphql_query',
				requestId,
				query,
				variables: variables || {},
				projectId: this.projectId,
				timestamp: Date.now()
			};

			this.ws!.send(JSON.stringify(message));
			console.log(`Sent GraphQL query for project ${this.projectId} with ID: ${requestId} query: ${query} variables: ${JSON.stringify(variables)}`);
		});
	}

	async getDocs(): Promise<any> {
		if (!this.connected || !this.ws) {
			throw new Error(`WebSocket not connected for project ${this.projectId}`);
		}

		return new Promise((resolve, reject) => {
			const requestId = crypto.randomUUID();

			const timeout = setTimeout(() => {
				this.pendingRequests.delete(requestId);
				reject(new Error('Docs request timeout'));
			}, 30000);

			this.pendingRequests.set(requestId, {
				requestId,
				resolve,
				reject,
				timeout
			});

			const message: GetDocsMessage = {
				type: 'get_docs',
				requestId,
				projectId: this.projectId,
				timestamp: Date.now()
			};

			this.ws!.send(JSON.stringify(message));
			console.log(`Sent docs request for project ${this.projectId} with ID: ${requestId}`);
		});
	}

	getProjectId(): string {
		return this.projectId;
	}

	getStatus(): { connected: boolean; clientId: string | null; projectId: string } {
		return {
			connected: this.connected,
			clientId: this.clientId,
			projectId: this.projectId
		};
	}

	disconnect(): void {
		if (this.reconnectTimeout) {
			clearTimeout(this.reconnectTimeout);
			this.reconnectTimeout = null;
		}

		this.pendingRequests.forEach((request) => {
			clearTimeout(request.timeout);
			request.reject(new Error('Client disconnected'));
		});
		this.pendingRequests.clear();

		if (this.ws) {
			this.ws.close();
			this.ws = null;
		}
		this.connected = false;
	}

	isHealthy(): boolean {
		const wsReady = this.ws?.readyState === WebSocket.OPEN;
		const isConnected = this.connected;
		const recentPong = this.lastPongReceived > (Date.now() - 60000);
		const reasonablePendingRequests = this.pendingRequests.size < 10;

		const healthy = wsReady && isConnected && recentPong && reasonablePendingRequests;

		console.log(`[Connection] Health check for ${this.projectId}:`, {
			wsReady,
			isConnected,
			recentPong,
			reasonablePendingRequests,
			healthy,
			lastPongAge: Date.now() - this.lastPongReceived,
			pendingCount: this.pendingRequests.size
		});

		return healthy;
	}
}

@Injectable()
export class WebSocketManagerService implements OnModuleInit, OnModuleDestroy {
	private clients = new Map<string, WebSocketRuntimeClient>();
	private connectionPromises = new Map<string, Promise<void>>();

	constructor(
		private readonly uiUtilsService: UiUtilsService,   // 👈 inject utils instead of UiDataService
	) { }

	/**
	 * Get WebSocket client for a specific user/project
	 */
	async getClientForUser(projectId: string): Promise<WebSocketRuntimeClient> {

		// Return existing client if already connected
		if (this.clients.has(projectId)) {
			const client = this.clients.get(projectId)!;
			const status = client.getStatus();

			if (status.connected) {
				return client;
			} else {
				this.clients.delete(projectId);
			}
		}

		if (!WEBSOCKET_URL) {
			console.warn('⚠️ WEBSOCKET_URL not set, WebSocket client not initialized');
			throw new Error('WEBSOCKET_URL not set');
		}

		// Create new client for user
		console.log(` Creating new WebSocket runtime client for project ${projectId}`);
		const client = new WebSocketRuntimeClient(
			WEBSOCKET_URL,
			projectId,
			this.uiUtilsService
		);

		// Ensure only one connection attempt per user
		if (!this.connectionPromises.has(projectId)) {
			const connectionPromise = client.connect().then(() => {
				this.clients.set(projectId, client);
				this.connectionPromises.delete(projectId);
				console.log(`✅ [WebSocketManager] Successfully connected to dedicated Durable Object for project: ${projectId}`);
			}).catch((error: any) => {
				this.connectionPromises.delete(projectId);
				console.error(`❌ [WebSocketManager] Failed to connect to DO for project ${projectId}:`, error instanceof Error ? error.message : error);
				throw error;
			});

			this.connectionPromises.set(projectId, connectionPromise);
		} else {
			console.log(`⏳ [WebSocketManager] Connection attempt already in progress for project ${projectId}`);
		}

		await this.connectionPromises.get(projectId);
		return this.clients.get(projectId)!;
	}

	async onModuleInit() {
		const runtimeProjectId = RUNTIME_PROJECT_ID;
		if (!runtimeProjectId) {
			console.warn('⚠️ No RUNTIME_PROJECT_ID set. Skipping auto-connect.');
			return;
		}

		console.log(`🚀 Auto-connecting runtime WebSocket for project ${runtimeProjectId}`);
		try {
			await this.getClientForUser(runtimeProjectId);
			console.log(`✅ Runtime WebSocket is now connected for project ${runtimeProjectId}`);
		} catch (err) {
			console.error(`❌ Failed to auto-connect runtime project ${runtimeProjectId}:`, err);
		}
	}

	/**
	 * Execute GraphQL query for a specific user
	 */
	async executeQueryForUser(projectId: string, query: string, variables?: Record<string, any>): Promise<any> {
		try {
			const client = await this.getClientForUser(projectId);
			console.log(`🔄 Executing query for project ${projectId} on dedicated DO`);
			return await client.executeGraphQLQuery(query, variables);
		} catch (error) {
			console.error(`Failed to execute query for project ${projectId}:`, error);
			throw error;
		}
	}

	/**
	 * Get documentation for a specific user
	 */
	async getDocsForUser(projectId: string): Promise<any> {
		try {
			const client = await this.getClientForUser(projectId);
			console.log(`📚 Getting docs for project ${projectId} from dedicated DO`);
			return await client.getDocs();
		} catch (error) {
			console.error(`Failed to get docs for project ${projectId}:`, error);
			throw error;
		}
	}

	/**
	 * Disconnect a specific user
	 */
	disconnectUser(projectId: string): void {
		const client = this.clients.get(projectId);
		if (client) {
			console.log(`🔌 Disconnecting project ${projectId} from dedicated DO`);
			client.disconnect();
			this.clients.delete(projectId);
		}
	}

	/**
	 * Get list of currently connected users
	 */
	getConnectedUsers(): string[] {
		return Array.from(this.clients.keys()).filter(projectId => {
			const client = this.clients.get(projectId);
			return client && client.getStatus().connected;
		});
	}

	/**
	 * Get connection statistics
	 */
	getStatus(): {
		totalClients: number;
		connectedClients: number;
		pendingConnections: number;
		clients: Array<{
			projectId: string;
			connected: boolean;
			clientId: string | null;
		}>;
	} {
		const connectedUsers = this.getConnectedUsers();

		return {
			totalClients: this.clients.size,
			connectedClients: connectedUsers.length,
			pendingConnections: this.connectionPromises.size,
			clients: Array.from(this.clients.entries()).map(([projectId, client]) => ({
				projectId,
				connected: client.getStatus().connected,
				clientId: client.getStatus().clientId
			}))
		};
	}

	/**
	 * Disconnect all users and cleanup
	 */
	disconnectAll(): void {
		console.log(`🛑 Disconnecting all ${this.clients.size} clients from their dedicated DOs`);

		for (const [projectId, client] of this.clients.entries()) {
			console.log(`  - Disconnecting project ${projectId}`);
			client.disconnect();
		}

		this.clients.clear();
		this.connectionPromises.clear();

		console.log('✅ All connections cleaned up');
	}

	/**
	 * Health check - verify connections are healthy
	 */
	async healthCheck(): Promise<{
		healthy: boolean;
		totalConnections: number;
		healthyConnections: number;
		issues: string[];
	}> {
		const issues: string[] = [];
		const connectedUsers = this.getConnectedUsers();

		// Check for stale connection promises
		if (this.connectionPromises.size > 0) {
			issues.push(`${this.connectionPromises.size} pending connections detected`);
		}

		// Check for disconnected clients that haven't been cleaned up
		const disconnectedClients = Array.from(this.clients.keys()).filter(
			projectId => !connectedUsers.includes(projectId)
		);

		if (disconnectedClients.length > 0) {
			issues.push(`${disconnectedClients.length} disconnected clients need cleanup`);
		}

		return {
			healthy: issues.length === 0,
			totalConnections: this.clients.size,
			healthyConnections: connectedUsers.length,
			issues
		};
	}

	isConnectionHealthy(projectId: string): boolean {
		console.log(`[Manager] Checking connection health for project: ${projectId}`);

		const client = this.clients.get(projectId);
		if (!client) {
			console.log(`[Manager] No client found for project: ${projectId}`);
			return false;
		}

		const isHealthy = client.isHealthy();
		console.log(`[Manager] Project ${projectId} connection healthy: ${isHealthy}`);

		return isHealthy;
	}

	// NestJS lifecycle hook
	onModuleDestroy() {
		console.log('🛑 WebSocketManagerService shutting down, disconnecting all clients...');
		this.disconnectAll();
	}
}