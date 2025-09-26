import { useState, useEffect, useCallback } from 'react';

interface WebSocketLog {
  id: string;
  timestamp: number;
  messageType: string;
  direction: 'incoming' | 'outgoing';
  data: any;
  clientId?: string;
  clientType?: 'runtime' | 'agent' | 'admin' | 'prod';
  projectId: string;
  fromClientId?: string; // For stored logs
}

interface UseAdminWebSocketReturn {
  logs: WebSocketLog[];
  connected: boolean;
  clearLogs: () => void;
  historicalLogsLoaded: boolean;
  totalHistoricalCount: number;
}

const useAdminWebSocketV2 = (projectId: string): UseAdminWebSocketReturn => {
  const [logs, setLogs] = useState<WebSocketLog[]>([]);
  const [connected, setConnected] = useState(false);
  const [historicalLogsLoaded, setHistoricalLogsLoaded] = useState(false);
  const [totalHistoricalCount, setTotalHistoricalCount] = useState(0);

  // Toggle between local and production
  // const WEBSOCKET_URL = 'ws://127.0.0.1:8787'; // Local development
  const WEBSOCKET_URL = 'wss://user-websocket.ashish-91e.workers.dev'; // Production (with 24h persistence)

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  useEffect(() => {
    if (!projectId) return;

    console.log(`🔧 Admin WebSocket V2 connecting to project ${projectId}...`);

    const ws = new WebSocket(`${WEBSOCKET_URL}/websocket?type=admin&projectId=${projectId}`);

    ws.onopen = () => {
      console.log(`✅ Admin WebSocket V2 connected for project ${projectId}`);
      setConnected(true);
    };

    ws.onclose = () => {
      console.log(`🔌 Admin WebSocket V2 disconnected for project ${projectId}`);
      setConnected(false);
      setHistoricalLogsLoaded(false);
    };

    ws.onerror = (error) => {
      console.error(`❌ Admin WebSocket V2 error for project ${projectId}:`, error);
      setConnected(false);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        // Handle historical logs sent when admin first connects
        if (message.type === 'historical_logs') {
          console.log(`📚 Received ${message.totalCount} historical logs`);
          setTotalHistoricalCount(message.totalCount || 0);

          if (message.logs && message.logs.length > 0) {
            // Store all historical logs for pagination
            setLogs(message.logs);
          }
          setHistoricalLogsLoaded(true);
          return;
        }

        // Handle all live messages - just add to top since durable object manages everything
        console.log(`📨 Admin received LIVE message:`, message);

        const logEntry: WebSocketLog = {
          id: message.id || crypto.randomUUID(),
          timestamp: message.timestamp || Date.now(),
          messageType: message.type || 'UNKNOWN',
          direction: message.direction || 'incoming',
          data: message,
          clientId: message.clientId,
          clientType: message.clientType,
          projectId: message.projectId || projectId,
          fromClientId: message._meta?.from
        };

        // Add new live messages to top, keep reasonable limit
        setLogs(prev => [logEntry, ...prev].slice(0, 500));

      } catch (error) {
        console.error('Failed to parse admin WebSocket message:', error);
      }
    };

    return () => {
      console.log(`🔌 Cleaning up admin WebSocket V2 for project ${projectId}`);
      ws.close();
    };
  }, [projectId]);

  return {
    logs,
    connected,
    clearLogs,
    historicalLogsLoaded,
    totalHistoricalCount
  };
};

export { useAdminWebSocketV2 };
export type { WebSocketLog };