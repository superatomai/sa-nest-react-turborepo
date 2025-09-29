# Runtime Module

The Runtime module provides AI-powered UI generation for runtime interfaces using Groq LLM. It allows applications to ask questions and receive functional UI DSL responses that can be immediately rendered.

## Features

- **Fast UI Generation**: Uses Groq's high-speed LLM inference
- **Context-Aware**: Leverages project knowledge base and current UI state
- **Streaming Support**: Real-time UI generation with SSE
- **DuckDB Integration**: Prioritizes data analysis components when appropriate
- **Validation**: Ensures generated DSL conforms to schema

## API Endpoints

### 1. Generate UI (GET /runtime/generate-ui)

Generate UI DSL using query parameters - perfect for simple requests.

```bash
curl "http://localhost:3001/runtime/generate-ui?query=Create%20a%20data%20upload%20interface&projectid=my-project&temperature=0.7"
```

**Query Parameters:**
- `query` (required): The user's question/request
- `projectid` (required): Project identifier
- `temperature` (optional): AI creativity level (0.0-1.0, default: 0.7)
- `maxTokens` (optional): Maximum response tokens (default: 4000)

**Example:**
```bash
curl "http://localhost:3001/runtime/generate-ui?query=Build%20a%20DuckDB%20dashboard&projectid=analytics-app"
```

### 2. Generate UI (POST /runtime/generate-ui)

Generate UI DSL based on a user query and project context.

```bash
curl -X POST http://localhost:3001/runtime/generate-ui \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Create a data upload interface for CSV analysis",
    "projectId": "your-project-id",
    "context": {
      "userContext": "User needs to analyze sales data",
      "currentSchema": {...}
    },
    "options": {
      "temperature": 0.7,
      "maxTokens": 4000
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uiDSL": {
      "id": "data-upload-interface",
      "type": "div",
      "props": {
        "className": "max-w-4xl mx-auto p-6 space-y-6"
      },
      "children": [
        {
          "id": "upload-section",
          "type": "COMP_DUCKDB_UPLOAD",
          "props": {
            "title": "Upload CSV Data",
            "className": "bg-white rounded-lg shadow-sm border p-6"
          }
        }
      ]
    },
    "explanation": "Created a data upload interface with DuckDB integration",
    "confidence": 0.9,
    "metadata": {
      "tokensUsed": 245,
      "inferenceTime": 1200,
      "model": "openai/gpt-oss-120b"
    }
  }
}
```

### 2. Streaming Generate UI (SSE /runtime/generate-ui-stream)

Stream UI generation with real-time updates.

```bash
curl -X POST http://localhost:3001/runtime/generate-ui-stream \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Build a dashboard for data analysis",
    "projectId": "your-project-id"
  }'
```

**SSE Events:**
```
data: {"type":"progress","message":"🔄 Initializing runtime agent...","timestamp":"2025-01-01T12:00:00Z"}
data: {"type":"progress","message":"📚 Loading project knowledge base...","timestamp":"2025-01-01T12:00:01Z"}
data: {"type":"llm_stream","message":"{\n  \"id\": \"dashboard\",...","timestamp":"2025-01-01T12:00:02Z"}
data: {"type":"complete","data":{"success":true,"data":{...}},"timestamp":"2025-01-01T12:00:05Z"}
```

### 3. Get Capabilities (POST /runtime/capabilities)

Get runtime agent capabilities for a project.

```bash
curl -X POST http://localhost:3001/runtime/capabilities \
  -H "Content-Type: application/json" \
  -d '{"projectId": "your-project-id"}'
```

## Environment Variables

Add to your `.env` file:

```env
GROQ_API_KEY=your_groq_api_key_here
```

## Supported Components

The runtime agent can generate these component types:

- **COMP_DUCKDB**: SQL query interface
- **COMP_DUCKDB_UPLOAD**: File upload for data analysis
- **COMP_DUCKDB_INTERFACE**: Full DuckDB interface
- **COMP_ECHART**: Data visualization charts
- **COMP_AGGRID**: Advanced data tables
- **COMP_HANDSONTABLE**: Spreadsheet-like interfaces
- Standard HTML elements with Tailwind CSS

## Usage Examples

### Data Analysis Interface (GET)
```bash
curl "http://localhost:3001/runtime/generate-ui?query=I%20need%20to%20analyze%20customer%20data%20from%20a%20CSV%20file&projectid=ecommerce-analytics"
```

### Dashboard Creation (GET)
```bash
curl "http://localhost:3001/runtime/generate-ui?query=Create%20a%20sales%20dashboard%20with%20charts%20and%20KPI%20metrics&projectid=sales-dashboard"
```

### Form Generation (GET)
```bash
curl "http://localhost:3001/runtime/generate-ui?query=Build%20a%20customer%20feedback%20form%20with%20validation&projectid=feedback-system"
```

### Data Analysis Interface (POST)
```json
{
  "query": "I need to analyze customer data from a CSV file",
  "projectId": "ecommerce-analytics"
}
```

### Dashboard Creation (POST)
```json
{
  "query": "Create a sales dashboard with charts and KPI metrics",
  "projectId": "sales-dashboard"
}
```

### Form Generation (POST)
```json
{
  "query": "Build a customer feedback form with validation",
  "projectId": "feedback-system"
}
```

## Integration with Frontend

The generated UI DSL can be directly used with your existing UI renderer:

```typescript
// Frontend usage
const response = await fetch('/runtime/generate-ui', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: userQuery,
    projectId: currentProject,
  })
});

const { data } = await response.json();
if (data.success) {
  setCurrentSchema(data.data.uiDSL);
}
```