# How API Documentation is Stored for Projects

## Database Storage Structure

The `api_docs` field in the `docs` table stores the complete JSON structure as a JSONB column. Here's how it works:

### 1. Database Table Structure
```sql
docs table:
- id: serial (primary key)
- projectId: integer (unique, foreign key to projects.id)
- apiDocs: jsonb (stores the entire API documentation)
- version: integer (increments with each update)
- createdAt: timestamp
- updatedAt: timestamp
- createdBy: varchar
- updatedBy: varchar
- deleted: boolean
```

### 2. One Project → One API Docs
Each project can have exactly ONE API documentation record due to the unique constraint on `projectId`.

### 3. Storage Example

For **Project ID: 1 (E-commerce Platform)**:

```typescript
// In the database, the apiDocs column would store:
{
  "version": "1.0.0",
  "baseUrl": "https://api.ecommerce.com/v1",
  "apis": {
    "/products": {
      "path": "/products",
      "method": "GET",
      "summary": "List products",
      "description": "Get paginated list of products with filters",
      "input": {
        "query": {
          "category": "string?",
          "minPrice": "number?",
          "maxPrice": "number?",
          "search": "string?",
          "page": "number?",
          "limit": "number?"
        }
      },
      "output": {
        "success": {
          "products": [],
          "pagination": {}
        },
        "error": {
          "message": "string",
          "code": "string"
        }
      },
      "example": {
        "request": "GET /products?category=electronics&limit=10",
        "response": {
          "products": [
            {
              "id": "prod_123",
              "name": "Laptop",
              "price": 999.99,
              "category": "electronics"
            }
          ],
          "pagination": {
            "page": 1,
            "limit": 10,
            "total": 150
          }
        }
      },
      "auth": "bearer"
    },
    "/products/:id": {
      "path": "/products/:id",
      "method": "GET",
      "summary": "Get product details",
      "input": {
        "params": {
          "id": "string"
        }
      },
      "output": {
        "success": {
          "product": {}
        }
      },
      "auth": false
    },
    "/cart/add": {
      "path": "/cart/add",
      "method": "POST",
      "summary": "Add item to cart",
      "input": {
        "body": {
          "productId": "string",
          "quantity": "number"
        }
      },
      "output": {
        "success": {
          "cartId": "string",
          "total": "number"
        }
      },
      "auth": "bearer"
    }
  }
}
```

For **Project ID: 2 (Admin Dashboard)**:

```typescript
{
  "version": "2.0.0",
  "baseUrl": "https://admin.example.com/api",
  "apis": {
    "/dashboard/stats": {
      "path": "/dashboard/stats",
      "method": "GET",
      "summary": "Get dashboard statistics",
      "description": "Retrieve real-time statistics for admin dashboard",
      "input": {
        "query": {
          "period": "enum:day|week|month|year",
          "startDate": "date?",
          "endDate": "date?"
        }
      },
      "output": {
        "success": {
          "revenue": "number",
          "orders": "number",
          "users": "number",
          "products": "number"
        }
      },
      "auth": "bearer"
    },
    "/reports/generate": {
      "path": "/reports/generate",
      "method": "POST",
      "summary": "Generate report",
      "input": {
        "body": {
          "type": "string",
          "format": "enum:pdf|csv|excel",
          "filters": {}
        }
      },
      "output": {
        "success": {
          "reportId": "string",
          "downloadUrl": "string"
        }
      },
      "auth": "bearer"
    }
  }
}
```

## CRUD Operations

### Creating API Docs for a Project
```typescript
// Using tRPC
await trpc.createDocs.mutate({
  projId: 1,
  apiDocs: { /* SimpleApiDocs structure */ }
});
```

### Updating API Docs
```typescript
// Using tRPC - by project ID
await trpc.updateDocsByProjectId.mutate({
  projectId: 1,
  apiDocs: { /* Updated SimpleApiDocs structure */ }
});
```

### Getting API Docs
```typescript
// Using tRPC - by project ID
const docs = await trpc.getDocsByProjectId.query({
  projectId: 1
});

// Returns:
{
  "message": "docs for project id 1",
  "docs": {
    "id": 1,
    "projectId": 1,
    "apiDocs": { /* The SimpleApiDocs JSON */ },
    "version": 3,
    "createdAt": "2024-01-10T10:00:00Z",
    "updatedAt": "2024-01-20T15:30:00Z"
  }
}
```

### Upsert API Docs (Create or Update)
```typescript
// This will create if not exists, update if exists
await trpc.upsertDocs.mutate({
  projectId: 1,
  apiDocs: { /* SimpleApiDocs structure */ }
});
```

## Benefits of JSONB Storage

1. **Flexibility**: Can store any structure without schema migrations
2. **Queryable**: PostgreSQL JSONB allows querying inside the JSON
3. **Indexable**: Can create indexes on specific JSON paths
4. **Performance**: JSONB is binary format, faster than JSON
5. **Validation**: Can be validated at application level using TypeScript

## Example Queries

### Find all projects with API documentation
```sql
SELECT p.*, d.apiDocs
FROM projects p
INNER JOIN docs d ON p.id = d.projectId
WHERE d.deleted = false;
```

### Search within API docs (PostgreSQL JSONB query)
```sql
-- Find all docs that have a specific endpoint
SELECT * FROM docs
WHERE apiDocs->'apis' ? '/users';

-- Find docs with specific version
SELECT * FROM docs
WHERE apiDocs->>'version' = '1.0.0';
```

## Version Management

Each update increments the `version` field in the docs table. You could extend this to:
1. Store version history in a separate table
2. Track who made changes and when
3. Allow rollback to previous versions
4. Compare versions for changelog generation