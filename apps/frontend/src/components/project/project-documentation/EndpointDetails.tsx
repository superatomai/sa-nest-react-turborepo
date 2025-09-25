import React from 'react'
import { Icon } from '@iconify/react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import EndpointBadge from './EndpointBadge'

// Types based on SimpleApiDocs structure
interface ApiEndpoint {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'
  summary: string
  description?: string
  input?: {
    params?: Record<string, any>
    query?: Record<string, any>
    body?: any
  }
  output?: {
    success?: any
    error?: any
  }
  example?: {
    request?: any
    response?: any
  }
  auth?: boolean | string
}

interface EndpointDetailsProps {
  endpoint: ApiEndpoint | null
}

const EndpointDetails: React.FC<EndpointDetailsProps> = ({ endpoint }) => {
  if (!endpoint) {
    return (
      <div className="h-96 flex items-center justify-center bg-white">
        <div className="text-center">
          <Icon icon="solar:code-square-linear" className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Select an endpoint to view details</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      <div className="px-6 py-4 border-b bg-gray-50/50">
        <div className="flex items-start gap-3">
          <EndpointBadge method={endpoint.method} />
          <div className="flex-1">
            <h3 className="font-mono text-base font-semibold">
              {endpoint.path}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {endpoint.summary}
            </p>
            {endpoint.description && (
              <p className="text-sm text-muted-foreground mt-2">
                {endpoint.description}
              </p>
            )}
          </div>
          {endpoint.auth && (
            <Badge variant="outline">
              <Icon icon="solar:lock-keyhole-minimalistic-linear" className="mr-1 h-3 w-3" />
              {typeof endpoint.auth === 'string'
                ? endpoint.auth
                : 'Auth Required'
              }
            </Badge>
          )}
        </div>
      </div>
      <div className="px-6 py-4">
        <Tabs defaultValue="request" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="request">Request</TabsTrigger>
            <TabsTrigger value="response">Response</TabsTrigger>
            <TabsTrigger value="example">Example</TabsTrigger>
          </TabsList>

          {/* Request Tab */}
          <TabsContent value="request" className="space-y-4">
            {endpoint.input?.params && (
              <div>
                <h4 className="font-semibold mb-2">Path Parameters</h4>
                <div className="bg-muted rounded-lg p-4">
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(endpoint.input.params, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {endpoint.input?.query && (
              <div>
                <h4 className="font-semibold mb-2">Query Parameters</h4>
                <div className="bg-muted rounded-lg p-4">
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(endpoint.input.query, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {endpoint.input?.body && (
              <div>
                <h4 className="font-semibold mb-2">Request Body</h4>
                <div className="bg-muted rounded-lg p-4">
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(endpoint.input.body, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {!endpoint.input && (
              <p className="text-muted-foreground">No request parameters required</p>
            )}
          </TabsContent>

          {/* Response Tab */}
          <TabsContent value="response" className="space-y-4">
            {endpoint.output?.success && (
              <div>
                <h4 className="font-semibold mb-2 text-green-600">Success Response</h4>
                <div className="bg-muted rounded-lg p-4">
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(endpoint.output.success, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {endpoint.output?.error && (
              <div>
                <h4 className="font-semibold mb-2 text-red-600">Error Response</h4>
                <div className="bg-muted rounded-lg p-4">
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(endpoint.output.error, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {!endpoint.output && (
              <p className="text-muted-foreground">No response schema defined</p>
            )}
          </TabsContent>

          {/* Example Tab */}
          <TabsContent value="example" className="space-y-4">
            {endpoint.example?.request && (
              <div>
                <h4 className="font-semibold mb-2">Example Request</h4>
                <div className="bg-muted rounded-lg p-4">
                  <pre className="text-sm overflow-x-auto">
                    {typeof endpoint.example.request === 'string'
                      ? endpoint.example.request
                      : JSON.stringify(endpoint.example.request, null, 2)
                    }
                  </pre>
                </div>
              </div>
            )}

            {endpoint.example?.response && (
              <div>
                <h4 className="font-semibold mb-2">Example Response</h4>
                <div className="bg-muted rounded-lg p-4">
                  <pre className="text-sm overflow-x-auto">
                    {typeof endpoint.example.response === 'string'
                      ? endpoint.example.response
                      : JSON.stringify(endpoint.example.response, null, 2)
                    }
                  </pre>
                </div>
              </div>
            )}

            {!endpoint.example && (
              <p className="text-muted-foreground">No examples provided</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default EndpointDetails