

export type ClientType = 'runtime' | 'agent' | 'admin';

export interface Connection {
    id: string;
    type: ClientType;
    socket: WebSocket;
    connectedAt: number;
    projectId?: string;  // NEW: Track which user this connection belongs to
    metadata?: Record<string, any>; // NEW: Store additional connection info
}

export interface GetProdUIMessage {
  type: 'get_prod_ui';
  requestId: string;
  projectId: string;
  uiId: string;
  prodId?: string;
}

export interface ProdUIResponseMessage {
  type: 'prod_ui_response';
  requestId: string;
  projectId: string;
  uiId: string;  // NEW: Include UI ID in prod_ui_response
  data?: any;
  error?: string;  // NEW: Include error message in prod_ui_response
  prodId?: string;
}

export interface BaseMessage {
    type: string;
    timestamp: number;
    requestId?: string;
    projectId?: string;  // NEW: Include user ID in all messages
}

export interface ConnectedMessage extends BaseMessage {
    type: 'connected';
    clientId: string;
    clientType: ClientType;
    projectId?: string;
    message: string;
}

export interface GraphQLQueryMessage extends BaseMessage {
    type: 'graphql_query';
    query: string;
    variables?: Record<string, any>;
    requestId: string;
    projectId: string;  // REQUIRED: Must specify which user's data to query
}

export interface QueryResponseMessage extends BaseMessage {
    type: 'query_response';
    requestId: string;
    projectId: string;
    data?: any;
    error?: string;
}

export interface GetDocsMessage extends BaseMessage {
    type: 'get_docs';
    requestId: string;
    projectId: string;
    error?: string;
}

export interface DocsMessage extends BaseMessage {
    type: 'docs';
    requestId: string;
    projectId: string;
    data?: any;
    error?: string;
}


export interface UserConnectionMessage extends BaseMessage {
    type: 'user_connection';
    action: 'connect' | 'disconnect';
    projectId: string;
    clientType: ClientType;
}

export interface PingMessage extends BaseMessage {
    type: 'ping';
}

export interface PongMessage extends BaseMessage {
    type: 'pong';
}

export interface ErrorMessage extends BaseMessage {
    type: 'error';
    message: string;
    error?: string;
    requestId?: string;
    projectId?: string;
}

export interface CheckAgentsMessage extends BaseMessage {
    type: 'check_agents';
    requestId: string;
    projectId: string;
}

export interface AgentStatusResponse extends BaseMessage {
    type: 'agent_status_response';
    requestId: string;
    projectId: string;
    agents?: Array<{
        id: string;
        connectedAt: number;
        projectId: string;
    }>;
    error?: string;
}

export interface RealtimeLogMessage extends BaseMessage {
    type: 'realtime_log';
    projectId: string;
    messageType: string;
    direction: 'incoming' | 'outgoing';
    data: any;
    clientId?: string;
    clientType?: ClientType;
}

export type WebSocketMessage =
    | ConnectedMessage
    | GraphQLQueryMessage
    | QueryResponseMessage
    | UserConnectionMessage
    | PingMessage
    | PongMessage
    | ErrorMessage
    | GetDocsMessage
    | DocsMessage
    | GetProdUIMessage
    | ProdUIResponseMessage
    | CheckAgentsMessage
    | AgentStatusResponse
    | RealtimeLogMessage;


export interface UserConnections {
    projectId: string;
    runtime?: Connection;
    agents: Connection[];  // Multiple agents possible per user
    lastActivity: number;
}

export interface ConnectionStatus {
    activeConnections: number;
    totalUsers: number;
    userConnections: Record<string, {
        projectId: string;
        hasRuntime: boolean;
        agentCount: number;
        lastActivity: number;
    }>;
    connections: Array<{
        id: string;
        type: ClientType;
        projectId?: string;
        connectedAt: number;
        connectedFor: number;
    }>;
    timestamp: number;
}

export interface PendingRequest {
  requestId: string;
  resolve: (data: any) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
}