// Types based on SimpleApiDocs structure
export interface ApiEndpoint {
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

export interface SimpleApiDocs {
  version: string
  baseUrl: string
  apis: Record<string, ApiEndpoint>
}