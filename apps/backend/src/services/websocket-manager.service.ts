import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { DocsMessage, GetDocsMessage, GraphQLQueryMessage, PendingRequest, QueryResponseMessage, WebSocketMessage } from 'src/types/websocket';


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
    private projectId: string
  ) { }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // This URL automatically routes to the user-specific Durable Object
        const wsUrl = `${this.websocketUrl}/websocket?type=runtime&projectId=${this.projectId}`;

        console.log(`Connecting to WebSocket: ${wsUrl}`);
        this.ws = new WebSocket(wsUrl);

        const connectTimeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        this.ws.onopen = () => {
          clearTimeout(connectTimeout);
          console.log(`Runtime WebSocket connected for project ${this.projectId} (user-scoped DO)`);
          this.connected = true;
          this.lastPongReceived = Date.now();
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onerror = (error) => {
          clearTimeout(connectTimeout);
          console.error('Runtime WebSocket error:', error);
          reject(new Error('WebSocket connection failed'));
        };

        this.ws.onclose = (event) => {
          console.log(`Runtime WebSocket disconnected for project ${this.projectId}:`, event.code, event.reason);
          this.connected = false;
          this.handleDisconnection();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(data: string): void {
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

        case 'error':
          this.handleError(message);
          break;

        case 'pong':
          this.lastPongReceived = Date.now();
          console.log('Received pong from server');
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
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      console.log(`Attempting to reconnect for project ${this.projectId} in ${delay}ms...`);

      this.reconnectTimeout = setTimeout(() => {
        this.reconnectAttempts++;
        this.connect().catch((error) => {
          console.error(`Reconnection failed for project ${this.projectId}:`, error);
        });
      }, delay);
    } else {
      console.error(`Max reconnection attempts reached for project ${this.projectId}`);
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
      console.log(`Sent GraphQL query for project ${this.projectId} with ID: ${requestId}`);
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
export class WebSocketManagerService implements OnModuleDestroy {
  private clients = new Map<string, WebSocketRuntimeClient>();
  private connectionPromises = new Map<string, Promise<void>>();

  /**
   * Get WebSocket client for a specific user/project
   */
  async getClientForUser(projectId: string): Promise<WebSocketRuntimeClient> {
    // Return existing client if already connected
    if (this.clients.has(projectId)) {
      const client = this.clients.get(projectId)!;
      if (client.getStatus().connected) {
        return client;
      }
    }

    console.log('projectId', projectId, process.env.WEBSOCKET_URL)
    // Create new client for user
    const client = new WebSocketRuntimeClient(
      process.env.WEBSOCKET_URL || 'wss://user-websocket-bridge.ashish-91e.workers.dev',
      projectId
    );

    // Ensure only one connection attempt per user
    if (!this.connectionPromises.has(projectId)) {
      const connectionPromise = client.connect().then(() => {
        this.clients.set(projectId, client);
        this.connectionPromises.delete(projectId);
        console.log(`✅ Connected to dedicated Durable Object for project: ${projectId}`);
      }).catch((error: any) => {
        this.connectionPromises.delete(projectId);
        console.error(`❌ Failed to connect to DO for project ${projectId}:`, error);
        throw error;
      });

      this.connectionPromises.set(projectId, connectionPromise);
    }

    await this.connectionPromises.get(projectId);
    return this.clients.get(projectId)!;
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
  getStats(): {
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