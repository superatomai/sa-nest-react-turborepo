import React, { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'

interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  endpoint: string
  description: string
  parameters?: Record<string, any>
  response?: any
  example?: {
    request?: any
    response?: any
  }
  authenticated: boolean
}

interface APIDocumentation {
  projectId: string
  apiKey: string
  websocketUrl: string
  connectedAt: string
  endpoints: APIEndpoint[]
  projectInfo: {
    name: string
    description: string
    environment: string
  }
}

interface ProjectDocumentationProps {
  projectId?: string
}

const ProjectDocumentation = ({ projectId }: ProjectDocumentationProps) => {
  const [apiDoc, setApiDoc] = useState<APIDocumentation | null>(null)
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Simulate WebSocket connection and API discovery
  useEffect(() => {
    // Simulate WebSocket connection delay
    const connectToWebSocket = () => {
      setIsLoading(true)

      // Simulate connection after 2 seconds
      setTimeout(() => {
        // Dummy data that would come from WebSocket
        const mockApiDoc: APIDocumentation = {
          projectId: projectId || '1',
          apiKey: 'pk_live_1234567890abcdef',
          websocketUrl: 'wss://api.superatom.dev/ws',
          connectedAt: new Date().toISOString(),
          projectInfo: {
            name: 'SuperAtom Dashboard',
            description: 'Real-time UI generation and management platform',
            environment: 'production'
          },
          endpoints: [
            {
              method: 'POST',
              endpoint: '/api/v1/generate-component',
              description: 'Generate a new UI component using AI',
              parameters: {
                prompt: 'string - Description of the component to generate',
                style: 'string (optional) - Style framework (tailwind, bootstrap, material)',
                theme: 'string (optional) - Color theme (light, dark, auto)',
                responsive: 'boolean (optional) - Make component responsive'
              },
              response: {
                success: 'boolean',
                componentId: 'string',
                html: 'string',
                css: 'string',
                metadata: 'object'
              },
              example: {
                request: {
                  prompt: 'Create a login form with email and password fields',
                  style: 'tailwind',
                  theme: 'light',
                  responsive: true
                },
                response: {
                  success: true,
                  componentId: 'comp_abc123',
                  html: '<form class="space-y-4">...</form>',
                  css: '.login-form { ... }',
                  metadata: {
                    generatedAt: '2024-01-15T10:30:00Z',
                    tokensUsed: 150
                  }
                }
              },
              authenticated: true
            },
            {
              method: 'GET',
              endpoint: '/api/v1/components',
              description: 'List all generated components for this project',
              parameters: {
                limit: 'number (optional) - Number of components to return (default: 20)',
                offset: 'number (optional) - Pagination offset (default: 0)',
                search: 'string (optional) - Search components by name or description'
              },
              response: {
                components: 'Array<Component>',
                total: 'number',
                hasMore: 'boolean'
              },
              example: {
                request: {
                  limit: 10,
                  offset: 0,
                  search: 'button'
                },
                response: {
                  components: [
                    {
                      id: 'comp_abc123',
                      name: 'Primary Button',
                      description: 'Main action button component',
                      createdAt: '2024-01-15T10:30:00Z',
                      updatedAt: '2024-01-15T10:30:00Z'
                    }
                  ],
                  total: 1,
                  hasMore: false
                }
              },
              authenticated: true
            },
            {
              method: 'GET',
              endpoint: '/api/v1/components/{id}',
              description: 'Get a specific component by ID',
              parameters: {
                id: 'string - Component ID'
              },
              response: {
                component: 'Component',
                versions: 'Array<ComponentVersion>'
              },
              example: {
                response: {
                  component: {
                    id: 'comp_abc123',
                    name: 'Primary Button',
                    description: 'Main action button component',
                    html: '<button class="btn btn-primary">Click me</button>',
                    css: '.btn-primary { background: #007bff; }',
                    createdAt: '2024-01-15T10:30:00Z'
                  },
                  versions: [
                    {
                      id: 'v1',
                      createdAt: '2024-01-15T10:30:00Z',
                      changes: 'Initial version'
                    }
                  ]
                }
              },
              authenticated: true
            },
            {
              method: 'POST',
              endpoint: '/api/v1/components/{id}/update',
              description: 'Update an existing component with AI assistance',
              parameters: {
                id: 'string - Component ID',
                prompt: 'string - Instructions for updating the component',
                preserveStyle: 'boolean (optional) - Keep existing styling (default: true)'
              },
              response: {
                success: 'boolean',
                component: 'Component',
                changes: 'string'
              },
              example: {
                request: {
                  prompt: 'Make the button larger and add a hover effect',
                  preserveStyle: true
                },
                response: {
                  success: true,
                  component: {
                    id: 'comp_abc123',
                    html: '<button class="btn btn-primary btn-lg">Click me</button>',
                    css: '.btn-primary { background: #007bff; } .btn-primary:hover { background: #0056b3; }'
                  },
                  changes: 'Added larger size class and hover effect'
                }
              },
              authenticated: true
            },
            {
              method: 'DELETE',
              endpoint: '/api/v1/components/{id}',
              description: 'Delete a component',
              parameters: {
                id: 'string - Component ID'
              },
              response: {
                success: 'boolean',
                message: 'string'
              },
              example: {
                response: {
                  success: true,
                  message: 'Component deleted successfully'
                }
              },
              authenticated: true
            },
            {
              method: 'GET',
              endpoint: '/api/v1/project/stats',
              description: 'Get project statistics and usage metrics',
              parameters: {},
              response: {
                componentsGenerated: 'number',
                tokensUsed: 'number',
                lastActivity: 'string',
                usage: 'object'
              },
              example: {
                response: {
                  componentsGenerated: 45,
                  tokensUsed: 12500,
                  lastActivity: '2024-01-15T10:30:00Z',
                  usage: {
                    today: 150,
                    thisWeek: 800,
                    thisMonth: 2400
                  }
                }
              },
              authenticated: true
            }
          ]
        }

        setApiDoc(mockApiDoc)
        setIsConnected(true)
        setIsLoading(false)

        // Auto-select first endpoint
        if (mockApiDoc.endpoints.length > 0) {
          setSelectedEndpoint(mockApiDoc.endpoints[0])
        }
      }, 2000)
    }

    connectToWebSocket()
  }, [projectId])

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'POST': return 'bg-green-100 text-green-800 border-green-200'
      case 'PUT': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'PATCH': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'DELETE': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  if (isLoading) {
    return (
      <div className="h-full w-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="lucide:loader-2" className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Connecting to API</h3>
          <p className="text-gray-600">Discovering available endpoints via WebSocket...</p>
        </div>
      </div>
    )
  }

  if (!apiDoc) {
    return (
      <div className="h-full w-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="lucide:wifi-off" className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Connection Failed</h3>
          <p className="text-gray-600">Unable to connect to the API documentation service</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Retry Connection
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon icon="lucide:book-open" className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">API Documentation</h1>
              <p className="text-sm text-gray-600">{apiDoc.projectInfo.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`} />
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </div>

        {/* Project Info */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Icon icon="lucide:folder" className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Project</span>
            </div>
            <code className="text-sm text-blue-700 font-mono">{apiDoc.projectInfo.name}</code>
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Icon icon="lucide:key" className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">API Key</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-sm text-green-700 font-mono">{apiDoc.apiKey}</code>
              <button
                onClick={() => copyToClipboard(apiDoc.apiKey)}
                className="text-green-600 hover:text-green-800"
              >
                <Icon icon="lucide:copy" className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Icon icon="lucide:globe" className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Environment</span>
            </div>
            <span className="text-sm text-purple-700 font-mono capitalize">{apiDoc.projectInfo.environment}</span>
          </div>

          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Icon icon="lucide:activity" className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Endpoints</span>
            </div>
            <span className="text-sm text-orange-700 font-mono">{apiDoc.endpoints.length} available</span>
          </div>
        </div>
      </div>

      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Endpoints</h2>

            <div className="space-y-2">
              {apiDoc.endpoints.map((endpoint, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedEndpoint(endpoint)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedEndpoint === endpoint
                      ? 'bg-blue-50 border-blue-200'
                      : 'hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getMethodColor(endpoint.method)}`}>
                      {endpoint.method}
                    </span>
                    {endpoint.authenticated && (
                      <Icon icon="lucide:lock" className="h-3 w-3 text-gray-500" />
                    )}
                  </div>
                  <div className="font-mono text-sm text-gray-900 mb-1">
                    {endpoint.endpoint}
                  </div>
                  <div className="text-xs text-gray-600 line-clamp-2">
                    {endpoint.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {selectedEndpoint ? (
            <div className="p-6">
              {/* Endpoint Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded font-medium border ${getMethodColor(selectedEndpoint.method)}`}>
                    {selectedEndpoint.method}
                  </span>
                  <code className="text-lg font-mono bg-gray-100 px-3 py-1 rounded">
                    {selectedEndpoint.endpoint}
                  </code>
                  {selectedEndpoint.authenticated && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded border border-yellow-200">
                      <Icon icon="lucide:lock" className="h-3 w-3 inline mr-1" />
                      Requires API Key
                    </span>
                  )}
                </div>
                <p className="text-gray-600">{selectedEndpoint.description}</p>
              </div>

              {/* Parameters */}
              {selectedEndpoint.parameters && Object.keys(selectedEndpoint.parameters).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Parameters</h3>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parameter</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {Object.entries(selectedEndpoint.parameters).map(([key, description]) => (
                          <tr key={key}>
                            <td className="px-4 py-3 font-mono text-sm text-gray-900">{key}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{description as string}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Response */}
              {selectedEndpoint.response && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Response Format</h3>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <pre className="text-green-400 text-sm font-mono overflow-x-auto">
                      {JSON.stringify(selectedEndpoint.response, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Example */}
              {selectedEndpoint.example && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Example</h3>

                  {selectedEndpoint.example.request && (
                    <div className="mb-4">
                      <h4 className="text-md font-medium text-gray-700 mb-2">Request</h4>
                      <div className="bg-gray-900 rounded-lg p-4">
                        <pre className="text-blue-400 text-sm font-mono overflow-x-auto">
                          {JSON.stringify(selectedEndpoint.example.request, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {selectedEndpoint.example.response && (
                    <div>
                      <h4 className="text-md font-medium text-gray-700 mb-2">Response</h4>
                      <div className="bg-gray-900 rounded-lg p-4">
                        <pre className="text-green-400 text-sm font-mono overflow-x-auto">
                          {JSON.stringify(selectedEndpoint.example.response, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Try It Button */}
              <div className="mt-8">
                <Button className="flex items-center gap-2">
                  <Icon icon="lucide:play" className="h-4 w-4" />
                  Test this endpoint
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="text-center py-12">
                <Icon icon="lucide:mouse-pointer-click" className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select an endpoint</h3>
                <p className="text-gray-600">Choose an API endpoint from the sidebar to view its documentation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectDocumentation