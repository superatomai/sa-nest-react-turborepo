// API Documentation Types based on OpenAPI 3.0 best practices

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

// Parameter locations
export type ParameterLocation = 'path' | 'query' | 'header' | 'cookie';

// Common data types
export type DataType = 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'null';

// Parameter definition
export interface ApiParameter {
  name: string;
  in: ParameterLocation;
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  type?: DataType;
  format?: string; // e.g., 'date-time', 'email', 'uuid'
  example?: any;
  default?: any;
  enum?: any[]; // Allowed values
  schema?: ApiSchema; // For complex types
}

// Schema definition (simplified from OpenAPI)
export interface ApiSchema {
  type: DataType;
  format?: string;
  description?: string;
  properties?: Record<string, ApiSchema>;
  items?: ApiSchema; // For arrays
  required?: string[];
  example?: any;
  enum?: any[];
  nullable?: boolean;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string; // Regex pattern
  default?: any;
}

// Request body definition
export interface ApiRequestBody {
  description?: string;
  required?: boolean;
  contentType?: string; // Default: 'application/json'
  schema?: ApiSchema;
  examples?: Record<string, ApiExample>;
}

// Response definition
export interface ApiResponse {
  statusCode: number;
  description: string;
  contentType?: string; // Default: 'application/json'
  schema?: ApiSchema;
  headers?: Record<string, ApiHeader>;
  examples?: Record<string, ApiExample>;
}

// Header definition
export interface ApiHeader {
  description?: string;
  required?: boolean;
  type?: DataType;
  format?: string;
  example?: any;
}

// Example definition
export interface ApiExample {
  summary?: string;
  description?: string;
  value: any;
}

// Security requirement
export interface ApiSecurity {
  type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';
  description?: string;
  name?: string; // For API key
  in?: 'header' | 'query' | 'cookie'; // For API key
  scheme?: string; // For HTTP (e.g., 'bearer', 'basic')
  bearerFormat?: string; // For HTTP bearer
  flows?: Record<string, any>; // For OAuth2
}

// Rate limiting info
export interface ApiRateLimit {
  requests: number;
  window: string; // e.g., '1m', '1h', '1d'
  description?: string;
}

// Individual endpoint documentation
export interface ApiEndpoint {
  // Basic info
  operationId?: string; // Unique identifier
  summary: string; // Short summary (max ~120 chars)
  description?: string; // Detailed description (Markdown supported)
  tags?: string[]; // For grouping endpoints
  deprecated?: boolean;

  // HTTP method and path are defined at parent level

  // Request details
  parameters?: ApiParameter[];
  requestBody?: ApiRequestBody;

  // Response details
  responses: Record<string, ApiResponse>; // Key is status code like '200', '404'

  // Security
  security?: ApiSecurity[];

  // Additional metadata
  externalDocs?: {
    url: string;
    description?: string;
  };

  // Rate limiting
  rateLimit?: ApiRateLimit;

  // Examples
  examples?: {
    request?: ApiExample[];
    response?: ApiExample[];
  };

  // Server variables (if endpoint uses different base URL)
  servers?: Array<{
    url: string;
    description?: string;
    variables?: Record<string, {
      default: string;
      enum?: string[];
      description?: string;
    }>;
  }>;
}

// Main API documentation structure
export interface ApiDocs {
  // API Metadata
  info: {
    title: string;
    version: string;
    description?: string;
    termsOfService?: string;
    contact?: {
      name?: string;
      url?: string;
      email?: string;
    };
    license?: {
      name: string;
      url?: string;
    };
  };

  // Server configuration
  servers?: Array<{
    url: string;
    description?: string;
    variables?: Record<string, {
      default: string;
      enum?: string[];
      description?: string;
    }>;
  }>;

  // API endpoints grouped by path
  paths: Record<string, Record<HttpMethod, ApiEndpoint>>;

  // Reusable components
  components?: {
    schemas?: Record<string, ApiSchema>;
    parameters?: Record<string, ApiParameter>;
    responses?: Record<string, ApiResponse>;
    requestBodies?: Record<string, ApiRequestBody>;
    headers?: Record<string, ApiHeader>;
    examples?: Record<string, ApiExample>;
    securitySchemes?: Record<string, ApiSecurity>;
  };

  // Global security (applies to all endpoints unless overridden)
  security?: ApiSecurity[];

  // Tags for grouping endpoints
  tags?: Array<{
    name: string;
    description?: string;
    externalDocs?: {
      url: string;
      description?: string;
    };
  }>;

  // External documentation
  externalDocs?: {
    url: string;
    description?: string;
  };
}

// Simplified structure for quick documentation (as you requested)
export interface SimpleApiEndpoint {
  path: string;
  method: HttpMethod;
  summary: string;
  description?: string;
  input?: {
    params?: Record<string, any>;
    query?: Record<string, any>;
    body?: any;
  };
  output?: {
    success?: any;
    error?: any;
  };
  example?: {
    request?: any;
    response?: any;
  };
  auth?: boolean | string; // true, false, or auth type like 'bearer'
}

// Simplified API docs structure (easier to use)
export interface SimpleApiDocs {
  version: string;
  baseUrl: string;
  apis: Record<string, SimpleApiEndpoint>;
}

// Usage example for your structure:
export interface YourApiDocs {
  version: string;
  baseUrl?: string;
  apis: {
    [path: string]: {
      method?: HttpMethod;
      input?: any;
      output?: any;
      description?: string;
      example?: any;
      auth?: boolean | string;
      rateLimit?: string;
      deprecated?: boolean;
    };
  };
}

// Helper type for creating type-safe API documentation
export type TypedApiDocs<T extends Record<string, any>> = {
  version: string;
  baseUrl?: string;
  apis: {
    [K in keyof T]: {
      method?: HttpMethod;
      input?: T[K]['input'];
      output?: T[K]['output'];
      description?: string;
      example?: {
        request?: T[K]['input'];
        response?: T[K]['output'];
      };
      auth?: boolean | string;
      rateLimit?: string;
      deprecated?: boolean;
    };
  };
};