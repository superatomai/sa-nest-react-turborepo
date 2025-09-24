import React, { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useParams } from 'react-router-dom'
import orgStore from '@/stores/mobx_org_store'
import { DatabaseUtils } from '../../utils/database'
import { useAdminWebSocketV2, WebSocketLog } from '../../hooks/useAdminWebSocketV2'
import { Icon } from '@iconify/react'

const ProjLogsV2 = () => {
  const params: any = useParams();

  const { data: project, isLoading: projectLoading, error } = DatabaseUtils.useGetProjectById(
    params.projectId,
    orgStore.orgId || ''
  );

  const {
    logs,
    connected,
    clearLogs,
    historicalLogsLoaded,
    totalHistoricalCount
  } = useAdminWebSocketV2(params.projectId);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 8;

  // Calculate paginated logs
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * logsPerPage;
    const endIndex = startIndex + logsPerPage;
    return logs.slice(startIndex, endIndex);
  }, [logs, currentPage, logsPerPage]);

  const totalPages = Math.ceil(logs.length / logsPerPage);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // Generic message display logic with "View Full" option
  const renderMessageContent = (log: WebSocketLog) => {
    const data = log.data;

    // Handle connected messages
    if (data.type === 'connected') {
      return (
        <div className="space-y-1">
          <div className="text-sm font-medium text-green-700">
            🔗 {data.clientType?.toUpperCase() || 'CLIENT'} CONNECTED
          </div>
          <div className="text-xs text-gray-600">
            {data.message}
          </div>
          <details className="text-xs mt-2">
            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">View Full JSON</summary>
            <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-x-auto mt-2 p-2 bg-gray-50 rounded leading-tight">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      );
    }

    // Handle GraphQL queries
    if (data.type === 'graphql_query') {
      return (
        <div className="space-y-1">
          <div className="text-sm font-medium text-blue-700">
            🔍 GraphQL Query
          </div>
          <div className="text-xs text-gray-600 font-mono bg-gray-50 p-1 rounded">
            {data.query?.substring(0, 100)}{data.query?.length > 100 ? '...' : ''}
          </div>
          {data.requestId && (
            <div className="text-xs text-gray-500">
              Request ID: {data.requestId}
            </div>
          )}
          <details className="text-xs mt-2">
            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">View Full JSON</summary>
            <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-x-auto mt-2 p-2 bg-gray-50 rounded leading-tight">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      );
    }

    // Handle query responses
    if (data.type === 'query_response') {
      return (
        <div className="space-y-1">
          <div className="text-sm font-medium text-purple-700">
            📊 Query Response
          </div>
          {data.requestId && (
            <div className="text-xs text-gray-500">
              Request ID: {data.requestId}
            </div>
          )}
          {data.data && (
            <div className="text-xs text-gray-600">
              {typeof data.data === 'object' ? `${Object.keys(data.data).length} fields` : 'Response data'}
            </div>
          )}
          <details className="text-xs mt-2">
            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">View Full JSON</summary>
            <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-x-auto mt-2 p-2 bg-gray-50 rounded leading-tight">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      );
    }

    // Handle ping/pong
    if (data.type === 'ping' || data.type === 'pong') {
      return (
        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-700">
            {data.type === 'ping' ? '📡 Ping' : '📡 Pong'}
          </div>
          <details className="text-xs mt-2">
            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">View Full JSON</summary>
            <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-x-auto mt-2 p-2 bg-gray-50 rounded leading-tight">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      );
    }

    // Handle messages with _meta (forwarded messages)
    if (data?._meta) {
      return (
        <div className="space-y-1">
          <div className="text-sm font-medium text-orange-700">
            🔄 {data.type?.toUpperCase() || 'FORWARDED MESSAGE'}
          </div>
          <div className="text-xs text-gray-600">
            From: {data._meta.from?.substring(0, 8)}... • Forwarded at: {new Date(data._meta.forwardedAt).toLocaleTimeString()}
          </div>
          <details className="text-xs mt-2">
            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">View Full JSON</summary>
            <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-x-auto mt-2 p-2 bg-gray-50 rounded leading-tight">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      );
    }

    // Generic handler for all other message types
    return (
      <div className="space-y-1">
        <div className="text-sm font-medium text-gray-700">
          📄 {data.type?.toUpperCase() || 'MESSAGE'}
        </div>
        {data.message && (
          <div className="text-xs text-gray-600">
            {data.message}
          </div>
        )}
        <details className="text-xs mt-2">
          <summary className="cursor-pointer text-blue-600 hover:text-blue-800">View Full JSON</summary>
          <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-x-auto mt-2 p-2 bg-gray-50 rounded leading-tight">
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      </div>
    );
  };

  if (projectLoading) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading project...</div>
          <div className="text-gray-600 text-sm mt-1">Please wait</div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-red-600">Project not found</div>
          <div className="text-gray-600 text-sm mt-1">The project could not be loaded : {JSON.stringify(error)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 p-6 flex flex-col overflow-hidden">
      <div className="w-full space-y-4 flex flex-col flex-1 min-h-0">

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Projects</span>
            <span>/</span>
            <span>{project.project.name}</span>
            <span>/</span>
            <span>Logs</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Project Logs</h1>
              <p className="text-gray-600 text-sm">Live WebSocket monitoring</p>
            </div>
            <Badge variant="outline" className="text-xs">
              ID: {project.project.id}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Logs Display */}
        <Card className="flex-1 flex flex-col min-h-0 rounded-xl shadow-lg border-gray-200">
          <CardHeader className="flex-shrink-0 pb-2 py-4 bg-gradient-to-r from-gray-50 to-white rounded-t-xl border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                WebSocket Messages
              </CardTitle>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-xs text-gray-600">
                    {connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {logs.length} total
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Page {currentPage} of {totalPages || 1}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearLogs}
                  disabled={logs.length === 0}
                  className="h-6 px-2 text-xs"
                >
                  <Icon icon="mdi:trash-can-outline" className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 min-h-0">
            <ScrollArea className="h-full px-4 pt-4 pb-4">
              {!historicalLogsLoaded && connected ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <Icon icon="mdi:loading" className="w-5 h-5 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Loading historical logs...</p>
                  </div>
                </div>
              ) : logs.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <p className="text-sm">No WebSocket messages yet.</p>
                    <p className="text-xs mt-1">Historical and live messages will appear here.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {paginatedLogs.map((log, index) => (
                    <div
                      key={log.id}
                      className={`border rounded-lg p-3 shadow-sm ${
                        log.direction === 'incoming'
                          ? 'border-blue-200 bg-gradient-to-r from-blue-50/80 to-blue-50/40'
                          : 'border-green-200 bg-gradient-to-r from-green-50/80 to-green-50/40'
                      } ${
                        index === 0 && historicalLogsLoaded ? 'ring-1 ring-green-300' : ''
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant={log.direction === 'incoming' ? 'default' : 'secondary'}
                            className="text-xs h-5 px-2 rounded-full"
                          >
                            {log.direction}
                          </Badge>
                          <Badge variant="outline" className="text-xs h-5 px-2 rounded-full">
                            {log.messageType}
                          </Badge>
                          {log.clientType && (
                            <Badge variant="outline" className="text-xs h-5 px-2 rounded-full bg-blue-50 text-blue-700 border-blue-200">
                              {log.clientType}
                            </Badge>
                          )}
                          {log.fromClientId && (
                            <Badge variant="secondary" className="text-xs h-5 px-2 rounded-full">
                              from: {log.fromClientId.substring(0, 6)}...
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      {/* Message Content */}
                      <div className="bg-white rounded-lg border p-3 shadow-sm">
                        {renderMessageContent(log)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>

          {/* Pagination Controls - Inside Card */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 px-4 py-3 border-t bg-gradient-to-r from-gray-50/80 to-white rounded-b-xl">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={!hasPrevPage}
                className="h-7 px-2"
              >
                <Icon icon="mdi:chevron-left" className="w-3 h-3" />
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = Math.max(1, Math.min(
                    totalPages - 4,
                    Math.max(1, currentPage - 2)
                  )) + i;

                  if (pageNumber > totalPages) return null;

                  return (
                    <Button
                      key={pageNumber}
                      variant={pageNumber === currentPage ? "default" : "outline"}
                      size="sm"
                      className="w-7 h-7 p-0 text-xs"
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={!hasNextPage}
                className="h-7 px-2"
              >
                <Icon icon="mdi:chevron-right" className="w-3 h-3" />
              </Button>
            </div>
          )}
        </Card>

      </div>
    </div>
  )
}

export default ProjLogsV2