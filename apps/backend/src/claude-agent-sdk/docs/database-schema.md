# DuckDB Schema Documentation

**Database:** ddb
**Generated:** 2025-10-01T06:02:11.460Z
**Total Tables:** 14

---

## 🎯 HOW TO CREATE COMPONENTS WITH REAL DATABASE DATA

**CRITICAL: Use `window.SA.queryExecutor` - NO imports needed!**

The `queryExecutor` is available globally at `window.SA.queryExecutor` for executing database queries in DSL components.

### APPROACH 1: Using Effects with window.SA.queryExecutor (Recommended)

Use `effects` to execute queries using `window.SA.queryExecutor.executeQuery()` and store results in state.

**Example: Stats Card with Real Data**
```json
{
  "id": "stats-card",
  "states": {
    "totalProjects": 0,
    "isLoading": true
  },
  "effects": [
    {
      "fn": "async () => { try { setState('isLoading', true); const result = await window.SA.queryExecutor.executeQuery('SELECT COUNT(*) as count FROM ddb.projects'); const count = result.data[0]?.count || 0; setState('totalProjects', typeof count === 'bigint' ? Number(count) : count); } catch(e) { console.error('Error:', e); setState('totalProjects', 0); } finally { setState('isLoading', false); } }",
      "deps": []
    }
  ],
  "render": {
    "type": "div",
    "props": { "className": "bg-white p-6 rounded-lg shadow" },
    "children": [
      {
        "type": "h3",
        "props": { "className": "text-sm text-gray-600" },
        "children": "Total Projects"
      },
      {
        "type": "p",
        "props": { "className": "text-3xl font-bold" },
        "children": { "$bind": "totalProjects" }
      }
    ]
  }
}
```

### APPROACH 2: Using Native COMP_DUCKDB Components

Use the built-in `COMP_DUCKDB` or `COMP_DUCKDB_INTERFACE` components for query execution and display.

**Available Native DuckDB Components:**

1. **COMP_DUCKDB** - Executes a SQL query and displays results
   ```json
   {
     "type": "COMP_DUCKDB",
     "props": {
       "sql": "SELECT * FROM ddb.projects LIMIT 10",
       "autoExecute": true,
       "maxRows": 1000,
       "showStats": true,
       "title": "Projects List"
     }
   }
   ```

2. **COMP_DUCKDB_INTERFACE** - Full query interface with editor
   ```json
   {
     "type": "COMP_DUCKDB_INTERFACE",
     "props": {
       "autoInit": true,
       "showSampleData": false,
       "initialQuery": "SELECT * FROM ddb.projects",
       "maxRows": 1000
     }
   }
   ```

3. **COMP_DUCKDB_UPLOAD** - File upload component for loading DuckDB files
   ```json
   {
     "type": "COMP_DUCKDB_UPLOAD",
     "props": {
       "className": "my-upload"
     }
   }
   ```

### 📋 CRITICAL RULES

1. **Table Names**: Always use `ddb.table_name` format (e.g., `SELECT * FROM ddb.projects`)
2. **Execute Queries**: Use `await window.SA.queryExecutor.executeQuery('SQL HERE')`
3. **Get Results**: Results are in `result.data` array (NOT `result.toArray()`)
4. **Handle BigInt**: Convert BigInt to Number: `typeof val === 'bigint' ? Number(val) : val`
5. **Store in State**: Use `setState('stateName', data)` to store results
6. **Run on Mount**: Put queries in `effects` with empty `deps: []` to run once on mount
7. **Error Handling**: Always wrap database calls in try-catch blocks
8. **NO imports**: `window.SA.queryExecutor` is globally available, no imports needed

### 🔥 Common Query Patterns with window.SA.queryExecutor

**Count Records:**
```javascript
async () => {
  try {
    const result = await window.SA.queryExecutor.executeQuery('SELECT COUNT(*) as count FROM ddb.projects');
    const count = result.data[0]?.count || 0;
    setState('projectCount', typeof count === 'bigint' ? Number(count) : count);
  } catch(e) {
    console.error('Query error:', e);
    setState('projectCount', 0);
  }
}
```

**Get Multiple Aggregations:**
```javascript
async () => {
  try {
    const result = await window.SA.queryExecutor.executeQuery(`
      SELECT status, COUNT(*) as count
      FROM ddb.tasks
      GROUP BY status
    `);
    const data = result.data.map(row => ({
      status: row.status,
      count: typeof row.count === 'bigint' ? Number(row.count) : row.count
    }));
    setState('tasksByStatus', data);
  } catch(e) {
    console.error('Query error:', e);
    setState('tasksByStatus', []);
  }
}
```

**Get List with Union Query:**
```javascript
async () => {
  try {
    // Get table names first
    const tablesResult = await window.SA.queryExecutor.executeQuery(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'main'
      ORDER BY table_name
    `);
    const tables = tablesResult.data.map(row => row.table_name);

    // Build union query for counts
    const countQueries = tables.map(t => \`SELECT '\${t}' as table_name, COUNT(*) as count FROM ddb.\${t}\`);
    const unionQuery = countQueries.join(' UNION ALL ');
    const countsResult = await window.SA.queryExecutor.executeQuery(unionQuery);

    const stats = countsResult.data.map(row => ({
      name: row.table_name,
      count: typeof row.count === 'bigint' ? Number(row.count) : row.count
    }));
    setState('tableStats', stats);
  } catch(e) {
    console.error('Query error:', e);
    setState('tableStats', []);
  }
}
```

**Join Tables with Filters:**
```javascript
async () => {
  try {
    const result = await window.SA.queryExecutor.executeQuery(`
      SELECT t.title, u.full_name, t.priority, t.due_date
      FROM ddb.tasks t
      LEFT JOIN ddb.users u ON t.assigned_to = u.id
      WHERE t.status = 'active'
      ORDER BY t.priority DESC
      LIMIT 100
    `);
    setState('activeTasks', result.data);
  } catch(e) {
    console.error('Query error:', e);
    setState('activeTasks', []);
  }
}
```

### 🚨 IMPORTANT NOTES

- **ALL tables MUST be prefixed with `ddb.`** (e.g., `ddb.projects`, `ddb.users`, `ddb.tasks`)
- **NO imports allowed** - Use `window.SA.queryExecutor` which is globally available
- **Results in .data** - Use `result.data` to access query results (NOT `result.toArray()`)
- **Use effects for custom logic** - For full control over data fetching and transformation
- **Use COMP_DUCKDB for simple displays** - When you just need to show query results
- **Always handle BigInt** - DuckDB COUNT() returns BigInt, convert to Number for display
- **Error handling is crucial** - Always wrap in try-catch to prevent component crashes
- Effects run automatically when component mounts with `deps: []`
- Check if data exists before using it: `data?.[0]?.field` or `data || defaultValue`

---

## 🔥 HOW TO USE THIS SCHEMA FOR CRUD OPERATIONS

**When generating database components, read the schema below to understand table structure.**

### What to do for CRUD operations:

1. **Read table schema** - Find the table in "Detailed Schema" section below
2. **Check columns** - Identify column names, types (INTEGER, VARCHAR, DATE, etc.), and nullable status
3. **Check relationships** - Look for foreign keys that link to other tables
4. **Generate component** - Use `window.SA.queryExecutor` for all database queries

### Key Rules:

- **Table prefix**: Always use `ddb.` (e.g., `SELECT * FROM ddb.users`)
- **Query executor**: Use `window.SA.queryExecutor.executeQuery('SQL')` (NO imports!)
- **Results**: Access via `result.data` array
- **BigInt handling**: Convert with `typeof val === 'bigint' ? Number(val) : val`

**For detailed CRUD instructions, see the main `claude.md` file.**

---

## Tables Overview

| Table | Columns | Rows | Relationships |
|-------|---------|------|---------------|
| departments | 4 | 7 | 1 |
| milestones | 8 | 138 | 1 |
| notifications | 9 | 1,098 | 1 |
| organizations | 3 | 1 | 0 |
| projects | 15 | 25 | 1 |
| resource_requests | 7 | 30 | 1 |
| task_comments | 6 | 4,450 | 2 |
| task_dependencies | 5 | 10 | 1 |
| task_tags | 2 | 2,345 | 1 |
| tasks | 19 | 1,741 | 1 |
| team_members | 3 | 158 | 2 |
| teams | 4 | 20 | 1 |
| users | 10 | 150 | 2 |
| work_logs | 7 | 9,376 | 2 |

## Detailed Schema

### departments

**Row Count:** 7

#### Columns

| Column | Type | Nullable |
|--------|------|----------|
| id | INTEGER | No |
| organization_id | INTEGER | Yes |
| name | VARCHAR | No |
| type | VARCHAR | Yes |

#### Relationships

- **organization_id** → organizations.id

---

### milestones

**Row Count:** 138

#### Columns

| Column | Type | Nullable |
|--------|------|----------|
| id | INTEGER | No |
| project_id | INTEGER | Yes |
| name | VARCHAR | No |
| due_date | DATE | Yes |
| status | VARCHAR | Yes |
| completion_percentage | INTEGER | Yes |
| is_critical_path | BOOLEAN | Yes |
| health_status | VARCHAR | Yes |

#### Relationships

- **project_id** → projects.id

---

### notifications

**Row Count:** 1,098

#### Columns

| Column | Type | Nullable |
|--------|------|----------|
| id | INTEGER | No |
| user_id | INTEGER | Yes |
| type | VARCHAR | Yes |
| entity_type | VARCHAR | Yes |
| entity_id | INTEGER | Yes |
| message | VARCHAR | Yes |
| is_read | BOOLEAN | Yes |
| action_required | BOOLEAN | Yes |
| created_at | TIMESTAMP | Yes |

#### Relationships

- **user_id** → users.id

---

### organizations

**Row Count:** 1

#### Columns

| Column | Type | Nullable |
|--------|------|----------|
| id | INTEGER | No |
| name | VARCHAR | No |
| created_at | TIMESTAMP | Yes |

---

### projects

**Row Count:** 25

#### Columns

| Column | Type | Nullable |
|--------|------|----------|
| id | INTEGER | No |
| organization_id | INTEGER | Yes |
| name | VARCHAR | No |
| code_name | VARCHAR | Yes |
| status | VARCHAR | Yes |
| priority | VARCHAR | Yes |
| start_date | DATE | Yes |
| target_end_date | DATE | Yes |
| actual_end_date | DATE | Yes |
| budget_allocated | DECIMAL(12,2) | Yes |
| budget_consumed | DECIMAL(12,2) | Yes |
| risk_score | INTEGER | Yes |
| compliance_required | BOOLEAN | Yes |
| client_facing | BOOLEAN | Yes |
| created_at | TIMESTAMP | Yes |

#### Relationships

- **organization_id** → organizations.id

---

### resource_requests

**Row Count:** 30

#### Columns

| Column | Type | Nullable |
|--------|------|----------|
| id | INTEGER | No |
| requested_by | INTEGER | Yes |
| project_id | INTEGER | Yes |
| request_type | VARCHAR | Yes |
| urgency | VARCHAR | Yes |
| status | VARCHAR | Yes |
| created_at | TIMESTAMP | Yes |

#### Relationships

- **project_id** → projects.id

---

### task_comments

**Row Count:** 4,450

#### Columns

| Column | Type | Nullable |
|--------|------|----------|
| id | INTEGER | No |
| task_id | INTEGER | Yes |
| user_id | INTEGER | Yes |
| comment_text | VARCHAR | Yes |
| is_blocker_reason | BOOLEAN | Yes |
| created_at | TIMESTAMP | Yes |

#### Relationships

- **task_id** → tasks.id
- **user_id** → users.id

---

### task_dependencies

**Row Count:** 10

#### Columns

| Column | Type | Nullable |
|--------|------|----------|
| id | INTEGER | No |
| task_id | INTEGER | Yes |
| depends_on_task_id | INTEGER | Yes |
| dependency_type | VARCHAR | Yes |
| is_hard_dependency | BOOLEAN | Yes |

#### Relationships

- **task_id** → tasks.id

---

### task_tags

**Row Count:** 2,345

#### Columns

| Column | Type | Nullable |
|--------|------|----------|
| task_id | INTEGER | No |
| tag | VARCHAR | No |

#### Relationships

- **task_id** → tasks.id

---

### tasks

**Row Count:** 1,741

#### Columns

| Column | Type | Nullable |
|--------|------|----------|
| id | INTEGER | No |
| milestone_id | INTEGER | Yes |
| parent_task_id | INTEGER | Yes |
| title | VARCHAR | No |
| description | VARCHAR | Yes |
| status | VARCHAR | Yes |
| priority | VARCHAR | Yes |
| assigned_to | INTEGER | Yes |
| assigned_by | INTEGER | Yes |
| estimated_hours | DECIMAL(5,2) | Yes |
| actual_hours | DECIMAL(5,2) | Yes |
| start_date | DATE | Yes |
| due_date | DATE | Yes |
| completed_at | TIMESTAMP | Yes |
| task_type | VARCHAR | Yes |
| requires_compliance_check | BOOLEAN | Yes |
| is_blocking | BOOLEAN | Yes |
| created_at | TIMESTAMP | Yes |
| updated_at | TIMESTAMP | Yes |

#### Relationships

- **milestone_id** → milestones.id

---

### team_members

**Row Count:** 158

#### Columns

| Column | Type | Nullable |
|--------|------|----------|
| team_id | INTEGER | No |
| user_id | INTEGER | No |
| allocation_percentage | INTEGER | Yes |

#### Relationships

- **team_id** → teams.id
- **user_id** → users.id

---

### teams

**Row Count:** 20

#### Columns

| Column | Type | Nullable |
|--------|------|----------|
| id | INTEGER | No |
| department_id | INTEGER | Yes |
| name | VARCHAR | No |
| lead_user_id | INTEGER | Yes |

#### Relationships

- **department_id** → departments.id

---

### users

**Row Count:** 150

#### Columns

| Column | Type | Nullable |
|--------|------|----------|
| id | INTEGER | No |
| organization_id | INTEGER | Yes |
| department_id | INTEGER | Yes |
| email | VARCHAR | No |
| full_name | VARCHAR | No |
| role | VARCHAR | Yes |
| specialization | VARCHAR | Yes |
| availability_hours_per_week | INTEGER | Yes |
| timezone | VARCHAR | Yes |
| created_at | TIMESTAMP | Yes |

#### Relationships

- **organization_id** → organizations.id
- **department_id** → departments.id

---

### work_logs

**Row Count:** 9,376

#### Columns

| Column | Type | Nullable |
|--------|------|----------|
| id | INTEGER | No |
| task_id | INTEGER | Yes |
| user_id | INTEGER | Yes |
| hours_logged | DECIMAL(4,2) | Yes |
| log_date | DATE | Yes |
| description | VARCHAR | Yes |
| created_at | TIMESTAMP | Yes |

#### Relationships

- **task_id** → tasks.id
- **user_id** → users.id

---

