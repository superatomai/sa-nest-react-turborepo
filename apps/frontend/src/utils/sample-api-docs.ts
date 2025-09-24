// Sample API Documentation for testing purposes
// This can be used to create test data in the backend

export const sampleApiDocs = {
  version: "1.0.0",
  baseUrl: "https://api.example.com/v1",
  apis: {
    "/auth/login": {
      path: "/auth/login",
      method: "POST" as const,
      summary: "User authentication",
      description: "Authenticate user with email and password to receive access token",
      input: {
        body: {
          email: "string",
          password: "string",
          rememberMe: "boolean?"
        }
      },
      output: {
        success: {
          statusCode: 200,
          data: {
            accessToken: "string",
            refreshToken: "string",
            user: {
              id: "string",
              email: "string",
              name: "string",
              role: "string"
            },
            expiresIn: 3600
          }
        },
        error: {
          statusCode: 401,
          message: "Invalid credentials",
          error: "Unauthorized"
        }
      },
      example: {
        request: {
          email: "john.doe@example.com",
          password: "SecurePass123!",
          rememberMe: true
        },
        response: {
          accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          refreshToken: "refresh_token_here",
          user: {
            id: "usr_123456",
            email: "john.doe@example.com",
            name: "John Doe",
            role: "admin"
          },
          expiresIn: 3600
        }
      },
      auth: false
    },
    "/users": {
      path: "/users",
      method: "GET" as const,
      summary: "List all users",
      description: "Retrieve paginated list of users with optional filters",
      input: {
        query: {
          page: "number?",
          limit: "number?",
          search: "string?",
          role: "enum:admin|user|guest?",
          status: "enum:active|inactive|suspended?",
          sortBy: "enum:name|email|createdAt?",
          sortOrder: "enum:asc|desc?"
        }
      },
      output: {
        success: {
          statusCode: 200,
          data: {
            users: [
              {
                id: "string",
                email: "string",
                name: "string",
                role: "string",
                status: "string",
                avatar: "string?",
                createdAt: "datetime",
                lastLogin: "datetime?"
              }
            ],
            pagination: {
              page: "number",
              limit: "number",
              total: "number",
              totalPages: "number"
            }
          }
        },
        error: {
          statusCode: 403,
          message: "Insufficient permissions",
          error: "Forbidden"
        }
      },
      example: {
        request: "GET /users?page=1&limit=10&role=admin&sortBy=createdAt&sortOrder=desc",
        response: {
          users: [
            {
              id: "usr_123456",
              email: "john.doe@example.com",
              name: "John Doe",
              role: "admin",
              status: "active",
              avatar: "https://example.com/avatars/john.jpg",
              createdAt: "2024-01-15T10:30:00Z",
              lastLogin: "2024-01-20T14:22:00Z"
            }
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 45,
            totalPages: 5
          }
        }
      },
      auth: "bearer"
    },
    "/users/:id": {
      path: "/users/:id",
      method: "GET" as const,
      summary: "Get user by ID",
      description: "Retrieve detailed information about a specific user",
      input: {
        params: {
          id: "string"
        }
      },
      output: {
        success: {
          statusCode: 200,
          data: {
            id: "string",
            email: "string",
            name: "string",
            role: "string",
            status: "string",
            avatar: "string?",
            bio: "string?",
            phone: "string?",
            createdAt: "datetime",
            updatedAt: "datetime",
            lastLogin: "datetime?"
          }
        },
        error: {
          statusCode: 404,
          message: "User not found",
          error: "Not Found"
        }
      },
      example: {
        request: "GET /users/usr_123456",
        response: {
          id: "usr_123456",
          email: "john.doe@example.com",
          name: "John Doe",
          role: "admin",
          status: "active",
          avatar: "https://example.com/avatars/john.jpg",
          bio: "Software developer passionate about clean code",
          phone: "+1234567890",
          createdAt: "2024-01-15T10:30:00Z",
          updatedAt: "2024-01-18T12:00:00Z",
          lastLogin: "2024-01-20T14:22:00Z"
        }
      },
      auth: "bearer"
    },
    "/projects": {
      path: "/projects",
      method: "GET" as const,
      summary: "List projects",
      description: "Get all projects for the authenticated user's organization",
      input: {
        query: {
          orgId: "string",
          limit: "number?",
          skip: "number?",
          search: "string?",
          status: "enum:active|archived?"
        }
      },
      output: {
        success: {
          statusCode: 200,
          data: {
            projects: [
              {
                id: "number",
                name: "string",
                description: "string?",
                createdAt: "datetime",
                updatedAt: "datetime",
                uisCount: "number"
              }
            ],
            totalCount: "number"
          }
        },
        error: {
          statusCode: 403,
          message: "Access denied to organization",
          error: "Forbidden"
        }
      },
      example: {
        request: "GET /projects?orgId=org_123&limit=10&skip=0",
        response: {
          projects: [
            {
              id: 1,
              name: "E-commerce Platform",
              description: "Main company e-commerce website",
              createdAt: "2024-01-01T00:00:00Z",
              updatedAt: "2024-01-20T12:00:00Z",
              uisCount: 15
            }
          ],
          totalCount: 1
        }
      },
      auth: "bearer"
    }
  }
};

export const createSampleDocsForProject = (projectId: number, projectName: string) => ({
  ...sampleApiDocs,
  baseUrl: `https://api.${projectName.toLowerCase().replace(/\s+/g, '-')}.com/v1`,
  apis: {
    ...sampleApiDocs.apis,
    [`/${projectName.toLowerCase().replace(/\s+/g, '-')}/status`]: {
      path: `/${projectName.toLowerCase().replace(/\s+/g, '-')}/status`,
      method: "GET" as const,
      summary: `Get ${projectName} status`,
      description: `Check the current status of ${projectName} service`,
      input: {},
      output: {
        success: {
          status: "healthy",
          version: "1.0.0",
          uptime: 3600,
          timestamp: "datetime"
        }
      },
      example: {
        request: `GET /${projectName.toLowerCase().replace(/\s+/g, '-')}/status`,
        response: {
          status: "healthy",
          version: "1.0.0",
          uptime: 3600,
          timestamp: "2024-01-20T15:30:00Z"
        }
      },
      auth: false
    }
  }
});