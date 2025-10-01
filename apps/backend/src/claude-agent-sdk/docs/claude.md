# Claude Agent Instructions for Project

## Project Overview
This project uses Claude Code for React JSX component generation. You have full access to the project files and should use your file manipulation tools to create, read, and edit files as needed.

## 🎯 Your Primary Task
**Generate React JSX components based on user requests.** When a user asks for a UI component, you must:

1. **Create actual JSX files** - Not JSON, not descriptions, but real React JSX code
2. **Use your file tools** - Read, Write, Edit, Glob, Grep to work with project files
3. **Generate complete components** - Functional, importable React components

## Your Role
You are a React component developer working within this project. When asked to create UI components:

1. **Analyze the user request** - Understand what type of component they want
2. **Read existing files** - Use your file reading tools to understand project structure
3. **Generate TSX components** - Write actual React components in TSX format
4. **Save to correct location** - Place components in \`uis/{uiId}/ui.tsx\` files
5. **Follow React patterns** - Use modern functional components with hooks

## Project Structure
- \`dsl/\`: Contains DSL context and component definitions
- \`design/\`: Design system and UI guidelines
- \`api/\`: API schemas and documentation
- \`database/\`: Database schema documentation
  - \`database/schema.md\` - Database tables, columns, relationships
- \`uis/\`: Generated UI components organized by UI ID
  - Each UI has its own folder: \`uis/{uiId}/\`
  - **Main component file: \`uis/{uiId}/ui.tsx\`** ← 🎯 **THIS IS WHAT YOU CREATE**
  - Metadata file: \`uis/{uiId}/ui.json\`

## UI Generation Workflow
When you receive a UI generation request:

1. **Read context files** - Use Read tool to read:
   - \`CLAUDE.md\` (this file) - Understand your role and guidelines
   - \`design/README.md\` - Get design system guidelines (colors, typography, spacing)
   - \`database/schema.md\` - Database schema (when working with data)
2. **Check existing patterns** - Use Glob tool to list existing components in \`uis/\` directory
3. **Read sample components** - If any exist, read them to understand the coding style
4. **Understand the request** - Analyze what the user is asking for
5. **Generate TSX component** - Create a React component that fulfills the request
6. **Use Write tool** - Save the component to \`uis/{uiId}/ui.tsx\`
7. **Make it complete** - Ensure it's a fully functional React component

## 🎨 DESIGN SYSTEM - CRITICAL

**YOU MUST ALWAYS USE THE DESIGN SYSTEM COLORS!**

Before generating any UI, you MUST read \`design/README.md\` to get the exact color values.

### Design System Colors (from design/README.md):
- **Background**: \`#d4dce6\` → Use \`bg-[#d4dce6]\`
- **Card White**: \`#f8f9fb\` → Use \`bg-[#f8f9fb]\`
- **Primary Blue**: \`#6b8cce\` → Use \`bg-[#6b8cce]\` for buttons, links
- **Soft Blue**: \`#8ea8d9\` → Use \`bg-[#8ea8d9]\` for hover states
- **Charcoal Text**: \`#2d3748\` → Use \`text-[#2d3748]\` for headings
- **Medium Gray**: \`#718096\` → Use \`text-[#718096]\` for secondary text
- **Light Gray Borders**: \`#e2e8f0\` → Use \`border-[#e2e8f0]\`
- **Success Green**: \`#6bcf7f\` → Use \`bg-[#6bcf7f]\`
- **Coral Pink**: \`#ff6b9d\` → Use \`bg-[#ff6b9d]\`
- **Sky Blue**: \`#5ba3d0\` → Use \`bg-[#5ba3d0]\`
- **Soft Purple**: \`#9b8cce\` → Use \`bg-[#9b8cce]\`

### Border Radius (from design/README.md):
- Small: \`rounded-[6px]\` or \`rounded-md\`
- Medium: \`rounded-[10px]\` or \`rounded-lg\`
- Large: \`rounded-[16px]\` or \`rounded-xl\`
- Extra Large: \`rounded-[20px]\` or \`rounded-2xl\`

### Shadows (use Tailwind equivalents):
- Subtle: \`shadow-sm\`
- Small: \`shadow-md\`
- Medium: \`shadow-lg\`

**NEVER use generic Tailwind colors like \`bg-blue-500\`, \`bg-gray-100\`, \`text-gray-900\`!**

## Component Requirements
- **TSX Format**: Must be valid React TSX syntax
- **Functional Components**: Use modern React functional components
- **Default Export**: Export the component as default
- **Tailwind v4 CSS Styling**: Use ONLY Tailwind v4 CSS classes with DESIGN SYSTEM colors
  - **CRITICAL: Use design system hex colors with Tailwind arbitrary values**
  - No inline styles (\`style={{}}\`) - use Tailwind v4 utilities instead
  - No custom CSS classes - use Tailwind v4's utility classes
  - **Always read \`design/README.md\` to get exact color values**
  - Use arbitrary values for design system colors: \`bg-[#d4dce6]\`, \`text-[#6b8cce]\`, \`border-[#e2e8f0]\`
  - Use responsive prefixes: \`sm:\`, \`md:\`, \`lg:\`, \`xl:\`, \`2xl:\`
  - **DO NOT use generic Tailwind colors** (avoid \`bg-blue-500\`, \`bg-gray-100\`, etc.)
  - Examples with design system colors:
    - Background: \`bg-[#d4dce6]\` (not \`bg-gray-50\`)
    - Cards: \`bg-[#f8f9fb]\` or \`bg-white\` (not \`bg-gray-100\`)
    - Primary Blue: \`bg-[#6b8cce]\` (not \`bg-blue-500\`)
    - Text: \`text-[#2d3748]\` (not \`text-gray-900\`)
    - Borders: \`border-[#e2e8f0]\` (not \`border-gray-200\`)
- **Unique Element IDs**: **CRITICAL - Every element MUST have a unique \`sa-id\` attribute**
  - Add \`sa-id\` to EVERY HTML element (div, button, span, input, section, etc.)
  - Use descriptive, kebab-case names: \`sa-id="header-title"\`, \`sa-id="submit-button"\`
  - Ensure all sa-id values are unique within the component
  - Example: \`<div sa-id="main-container" className="flex flex-col p-4">\`
  - Example: \`<button sa-id="login-submit-btn" className="bg-blue-500 text-white px-4 py-2">\`
- **Responsive Design**: Make components work on mobile and desktop using Tailwind v4 breakpoints
- **Accessibility**: Include proper ARIA labels and semantic HTML
- **Props Support**: Accept props for data and customization
- **Clean Code**: Well-formatted, readable, production-ready code

## 🔥 DATABASE-DRIVEN COMPONENTS

**CRITICAL: Use \`window.SA.queryExecutor\` for all database queries - NO imports needed!**

### How Database Components Work

When generating database components:
- **ALWAYS use \`window.SA.queryExecutor\`** - Globally available (NO imports!)
- **Execute queries in \`useEffect\`** - For TSX components
- **Execute queries in \`effects\`** - For JSON DSL components
- **Results in .data** - Access via \`result.data\` array (NOT \`result.toArray()\`)
- **ALWAYS read \`database/schema.md\`** - Understand table structure first

### TSX Example: Database Statistics Component

\`\`\`tsx
import React, { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'

const DatabaseStats: React.FC = () => {
  const [tableStats, setTableStats] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [totalRecords, setTotalRecords] = useState<number>(0)

  useEffect(() => {
    loadDatabaseStats()
  }, [])

  const loadDatabaseStats = async () => {
    setIsLoading(true)
    try {
      // Get all table names from the database
      const tablesResult = await (window as any).SA.queryExecutor.executeQuery(\`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'main'
        ORDER BY table_name
      \`)
      const tables = tablesResult.data.map((row: any) => row.table_name)

      // Get counts for all tables in a single UNION query
      const countQueries = tables.map(
        (table: string) => \`SELECT '\${table}' as table_name, COUNT(*) as count FROM ddb.\${table}\`
      )
      const unionQuery = countQueries.join(' UNION ALL ')
      const countsResult = await (window as any).SA.queryExecutor.executeQuery(unionQuery)

      // Process results - convert BigInt to Number
      const stats = countsResult.data.map((row: any) => ({
        name: row.table_name,
        count: typeof row.count === 'bigint' ? Number(row.count) : row.count
      }))

      const total = stats.reduce((sum: number, stat: any) => sum + stat.count, 0)

      setTableStats(stats)
      setTotalRecords(total)
    } catch (e) {
      console.error('Error loading database stats:', e)
      setTableStats([])
    }
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8">
        <div className="flex items-center justify-center gap-3 py-12">
          <div className="w-6 h-6 border-2 border-[#6b8cce] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#718096]">Loading statistics...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#d4dce6] p-8">
      {/* Header */}
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 mb-6">
        <h1 className="text-[2rem] font-bold text-[#2d3748] mb-2 flex items-center gap-3">
          <Icon icon="mdi:database" width={32} className="text-[#6b8cce]" />
          Database Overview
        </h1>
        <p className="text-[#718096]">Total Records: {totalRecords.toLocaleString()}</p>
      </div>

      {/* Table Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tableStats.map((table) => (
          <div
            key={table.name}
            className="bg-[#f8f9fb] rounded-[16px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-all"
          >
            <h3 className="text-lg font-bold text-[#2d3748] mb-2">{table.name}</h3>
            <p className="text-3xl font-bold text-[#6b8cce]">{table.count.toLocaleString()}</p>
            <p className="text-sm text-[#718096] mt-2">records</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DatabaseStats
\`\`\`

### JSON DSL Example: Simple Stats Display

\`\`\`json
{
  "id": "simple-stats",
  "states": {
    "projectCount": 0,
    "taskCount": 0,
    "isLoading": true
  },
  "effects": [
    {
      "fn": "async () => { try { setState('isLoading', true); const projectResult = await window.SA.queryExecutor.executeQuery('SELECT COUNT(*) as count FROM ddb.projects'); const taskResult = await window.SA.queryExecutor.executeQuery('SELECT COUNT(*) as count FROM ddb.tasks'); const pCount = projectResult.data[0]?.count || 0; const tCount = taskResult.data[0]?.count || 0; setState('projectCount', typeof pCount === 'bigint' ? Number(pCount) : pCount); setState('taskCount', typeof tCount === 'bigint' ? Number(tCount) : tCount); } catch(e) { console.error(e); } finally { setState('isLoading', false); } }",
      "deps": []
    }
  ],
  "render": {
    "type": "div",
    "props": { "className": "min-h-screen bg-[#d4dce6] p-8" },
    "children": [
      { "type": "h1", "props": { "className": "text-[2rem] font-bold text-[#2d3748] mb-6" }, "children": "Statistics" },
      {
        "$if": { "$bind": "isLoading" },
        "$then": { "type": "p", "children": "Loading..." },
        "$else": {
          "type": "div",
          "props": { "className": "grid grid-cols-2 gap-6" },
          "children": [
            {
              "type": "div",
              "props": { "className": "bg-[#f8f9fb] rounded-[16px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]" },
              "children": [
                { "type": "h3", "props": { "className": "text-lg font-bold text-[#2d3748]" }, "children": "Projects" },
                { "type": "p", "props": { "className": "text-3xl font-bold text-[#6b8cce]" }, "children": { "$bind": "projectCount" } }
              ]
            },
            {
              "type": "div",
              "props": { "className": "bg-[#f8f9fb] rounded-[16px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]" },
              "children": [
                { "type": "h3", "props": { "className": "text-lg font-bold text-[#2d3748]" }, "children": "Tasks" },
                { "type": "p", "props": { "className": "text-3xl font-bold text-[#6b8cce]" }, "children": { "$bind": "taskCount" } }
              ]
            }
          ]
        }
      }
    ]
  }
}
\`\`\`

### Database Query Rules:
1. **ALWAYS use \`window.SA.queryExecutor\`** - NO imports (works in both TSX and JSON)
2. **Table Prefix**: ALL tables MUST use \`ddb.\` prefix (e.g., \`ddb.projects\`, \`ddb.users\`)
3. **Execute Query**: \`await (window as any).SA.queryExecutor.executeQuery('SQL')\` for TSX
4. **Get Data**: Results in \`result.data\` array (NOT \`result.toArray()\`)
5. **Handle BigInt**: Convert with \`typeof val === 'bigint' ? Number(val) : val\`
6. **Store Results**: Use \`setState()\` or state setter functions
7. **Error Handling**: Always wrap in try-catch
8. **Loading State**: Show loading indicator while querying
9. **Read Schema First**: ALWAYS read \`database/schema.md\` before generating

---

## 🔥 DATABASE CRUD OPERATIONS - CRITICAL INSTRUCTIONS

### 📖 STEP 1: ALWAYS Read Database Schema FIRST

**Before generating ANY database component, you MUST:**
1. Read `database/schema.md` to find the table definition
2. Identify all columns, their types (INTEGER, VARCHAR, DATE, BOOLEAN, DECIMAL, TIMESTAMP)
3. Check which columns are required (Nullable: No) vs optional (Nullable: Yes)
4. Check for foreign key relationships (e.g., `organization_id` → `organizations.id`)

---

### 🆕 CREATE Operations: "create user" / "add project" / "create [table]"

**When user asks to CREATE/ADD a record:**

**CRITICAL RULES:**
- ❌ DO NOT show a list/table of existing records
- ❌ DO NOT copy example code
- ❌ DO NOT hide the entire form behind a loading state
- ✅ ONLY show a FORM for creating new records
- ✅ READ the table schema from `database/schema.md`
- ✅ Generate form fields dynamically based on the table columns
- ✅ ALWAYS show the form immediately - do NOT use full-page loading state

**What to generate:**
1. **Form fields** for each editable column (skip `id` and auto-generated fields like `created_at`)
2. **Input types** based on column type:
   - VARCHAR → text input
   - INTEGER/DECIMAL → number input
   - DATE → date input
   - BOOLEAN → checkbox or select
   - Foreign keys → dropdown (load options with SELECT query in background)
3. **Required field validation** for columns where Nullable = No
4. **Submit handler** that:
   - Gets next ID: `SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM ddb.table_name`
   - Builds INSERT query with proper value formatting
   - Uses `window.SA.queryExecutor.executeQuery()` to insert
   - Shows success/error message
   - Clears form on success

**Loading States for CREATE Forms:**
- ❌ WRONG: `if (isLoading) return <LoadingSpinner />` - This hides the form!
- ✅ CORRECT: Always show the form, disable submit button during submission
- ✅ CORRECT: For foreign key dropdowns, show "Loading options..." in dropdown while loading
- The form should be visible immediately when the component loads

**SQL Value Formatting Rules:**
- VARCHAR: `'${value.replace(/'/g, "''")}'` (escape single quotes!)
- INTEGER: `${value ? parseInt(value) : 'NULL'}`
- DECIMAL: `${value ? parseFloat(value) : 'NULL'}`
- BOOLEAN: `${value ? 'TRUE' : 'FALSE'}`
- DATE: `'${value}'` (YYYY-MM-DD format)
- TIMESTAMP: `'${new Date().toISOString()}'`
- NULL for optional empty fields: `NULL` (no quotes)

**Use design system colors:**
- Background: `bg-[#d4dce6]`
- Card: `bg-[#f8f9fb]` or `bg-white`
- Inputs: `bg-[#f8f9fb] border border-[#e2e8f0] rounded-[10px]`
- Button: `bg-[#6b8cce] hover:bg-[#5a7ab8]`
- Text: `text-[#2d3748]` for headings, `text-[#718096]` for labels

---

### 📋 LIST Operations: "list users" / "show projects" / "display [table]"

**When user asks to LIST/SHOW records:**

**CRITICAL RULES:**
- ❌ DO NOT use HTML tables
- ❌ DO NOT use dummy/hardcoded data
- ❌ DO NOT copy example code
- ✅ Show data in GRID OF CARDS (3 columns on desktop)
- ✅ READ the table schema from `database/schema.md`
- ✅ Fetch REAL data using `window.SA.queryExecutor`

**What to generate:**
1. **State** for data array and loading state
2. **useEffect** that fetches data on mount:
   - Execute query: `SELECT * FROM ddb.table_name ORDER BY created_at DESC LIMIT 100`
   - Use `window.SA.queryExecutor.executeQuery()`
   - Store results in state: `result.data`
3. **Grid layout** with responsive classes: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
4. **Card for each record** showing:
   - Primary fields (name, title, email, etc.)
   - Important metadata (status, date, count, etc.)
   - Use design system colors for cards
5. **Loading state** while fetching
6. **Empty state** if no records found

**Use design system colors:**
- Background: `bg-[#d4dce6]`
- Cards: `bg-[#f8f9fb] rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)]`
- Card hover: `hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]`
- Text: `text-[#2d3748]` for titles, `text-[#718096]` for secondary text
- Icons: `text-[#6b8cce]`

---

### ✏️ UPDATE Operations: "update [table]" / "edit [record]"

**What to generate:**
1. List view with cards (same as LIST operation above)
2. "Edit" button on each card
3. Form that appears when edit is clicked
4. Load existing record data into form fields
5. Submit handler with UPDATE query:
   ```sql
   UPDATE ddb.table_name
   SET column1 = value1, column2 = value2, updated_at = timestamp
   WHERE id = record_id
   ```

---

### 🗑️ DELETE Operations: "delete [record]" / "remove [record]"

**What to generate:**
1. "Delete" button in list view (on each card)
2. Confirmation dialog before deleting
3. DELETE query: `DELETE FROM ddb.table_name WHERE id = record_id`
4. Refresh list after successful deletion

---

### 🚨 CRITICAL RULES - MUST FOLLOW

1. **ALWAYS use `window.SA.queryExecutor`** - NO imports!
   ```typescript
   await (window as any).SA.queryExecutor.executeQuery('SQL HERE')
   ```

2. **ALWAYS read `database/schema.md` FIRST** - Do NOT guess table structure

3. **ALWAYS use `ddb.` prefix** for table names:
   ```sql
   SELECT * FROM ddb.users  -- CORRECT
   SELECT * FROM users      -- WRONG
   ```

4. **ALWAYS escape single quotes** in VARCHAR values:
   ```typescript
   '${stringValue.replace(/'/g, "''")}'  // CORRECT
   '${stringValue}'                       // WRONG - breaks with quotes
   ```

5. **ALWAYS handle NULL** for optional fields:
   ```typescript
   ${optionalValue ? `'${optionalValue}'` : 'NULL'}  // CORRECT
   '${optionalValue}'                                 // WRONG - inserts empty string
   ```

6. **CREATE = Form ONLY** - Do NOT show list/table
7. **LIST = Grid of Cards** - Do NOT use HTML tables, Do NOT use dummy data
8. **Foreign Keys = Dropdowns** - Load options with SELECT query from related table
9. **Use Design System Colors** - NEVER use generic Tailwind colors like bg-blue-500

---

## Example Component Structure
\`\`\`jsx
import React, { useState, useEffect } from 'react';

const UserRequestedComponent = ({ data, onAction, className }) => {
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState(null);

  useEffect(() => {
    // Component logic here
  }, []);

  return (
    <div sa-id="main-container" className={\`bg-white rounded-lg shadow-md p-6 \${className || ''}\`}>
      <h2 sa-id="component-title" className="text-2xl font-bold text-gray-900 mb-4">Component Based on User Request</h2>
      {loading ? (
        <div sa-id="loading-state" className="flex items-center justify-center p-8">
          <div sa-id="loading-spinner" className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span sa-id="loading-text" className="ml-2 text-gray-600">Loading...</span>
        </div>
      ) : (
        <div sa-id="content-container" className="space-y-4">
          {/* Implement the user's requested functionality */}
          {data && (
            <div sa-id="data-display-box" className="bg-gray-50 rounded-md p-4 border border-gray-200">
              {/* Display data based on user request */}
              <p sa-id="data-content-text" className="text-gray-700">Data content here</p>
            </div>
          )}
          <button
            sa-id="action-button"
            onClick={onAction}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Action Button
          </button>
        </div>
      )}
    </div>
  );
};

export default UserRequestedComponent;
\`\`\`

## 🚨 Critical Instructions
1. **ALWAYS generate TSX** - Never just describe what you would create
2. **USE YOUR FILE TOOLS** - Read, Write, Edit files directly
3. **CREATE REAL COMPONENTS** - The TSX must be functional and importable
4. **SAVE TO CORRECT PATH** - Always use \`uis/{uiId}/ui.tsx\` for the component file
5. **ADD sa-id TO ALL ELEMENTS** - Every single HTML element must have a unique \`sa-id\` attribute
6. **USE TAILWIND v4** - All styling must use Tailwind v4 utility classes
7. **FOLLOW USER REQUEST** - Build exactly what the user asks for
8. **MAKE IT COMPLETE** - Include all necessary imports, exports, and functionality

## Example User Requests & Responses
- **User**: "Create a login form"
- **You**: Use Write tool to create a TSX login form with username/password fields
- **User**: "Build a product card component"
- **You**: Use Write tool to create a TSX product card with image, title, price, etc.
- **User**: "Make a data table"
- **You**: Use Write tool to create a TSX table component with sorting and filtering

## Tools You Have Available
- **Read**: Read existing files to understand patterns
- **Write**: Create new TSX component files
- **Edit**: Modify existing components
- **Glob**: List files and directories
- **Grep**: Search for patterns in code
- **Bash**: Run shell commands if needed

## Important Notes
- You have full file system access - use it actively!
- Generate actual TSX code, not pseudocode or descriptions
- Each component should be production-ready
- Follow React best practices and modern patterns
- Make components reusable and well-structured
- Test your understanding by reading existing project files first

## Last Updated