# TSX Component Generation Guide

Complete guide for generating React TSX components from user prompts.

## User Intent Analysis

First, identify the CRUD operation from the user request:

### CREATE Operations
**Keywords:** "create [entity]", "add [entity]", "new [entity]", "make [entity]"

**What to generate:** **FORM ONLY** - no list/grid/table!

**Example prompts:**
- "create task" → Task creation form
- "add user" → User creation form
- "new project" → Project creation form

### LIST Operations
**Keywords:** "list [entities]", "show [entities]", "view [entities]", "display [entities]", "all [entities]"

**What to generate:** Grid of cards displaying data

**Example prompts:**
- "list tasks" → Grid of task cards
- "show users" → Grid of user cards
- "view projects" → Grid of project cards

### UPDATE Operations
**Keywords:** "edit [entity]", "update [entity]", "modify [entity]"

**What to generate:** List view + Edit form (show form when clicking edit button)

### DELETE Operations
**Keywords:** "delete [entity]", "remove [entity]"

**What to generate:** List view + Delete functionality with confirmation

---

## Component Generation Steps

### Step 1: Read Project Context
1. Read `CLAUDE.md` for project-specific guidelines
2. Read `database/schema.md` to understand table structure and columns
3. Read `design/README.md` for color scheme and styling
4. Check `uis/` directory for existing component patterns

### Step 2: Identify Table Name
From user prompt "create task":
- Entity: "task"
- Table: `ddb.tasks` (add `ddb.` prefix)
- Check `database/schema.md` for actual table name and columns

### Step 3: Generate Component

---

## CREATE Operation: Form Generation

### Requirements
- **FORM ONLY** - do not include a list/grid
- Form fields based on table columns (skip `id`, `created_at`, `updated_at`)
- Input types matched to column types
- Required validation for non-nullable columns
- Foreign key dropdowns loaded from related tables
- Submit handler with INSERT query
- Success/error messages
- Form reset after successful submission

### Component Structure
```tsx
import React, { useState, useEffect } from 'react'

const EntityForm: React.FC = () => {
  // State for form fields
  const [formData, setFormData] = useState({
    field1: '',
    field2: '',
    // ... all fields from schema
  })

  // State for dropdowns (foreign keys)
  const [relatedData, setRelatedData] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(true)

  // State for form submission
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  // Load foreign key options
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const result = await window.SA.queryExecutor.executeQuery(`
          SELECT id, name_field FROM ddb.related_table
        `)
        setRelatedData(result.data)
      } catch (e) {
        console.error('Error loading options:', e)
      }
      setLoadingOptions(false)
    }
    loadOptions()
  }, [])

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    try {
      // Get next ID
      const nextIdResult = await window.SA.queryExecutor.executeQuery(
        'SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM ddb.table_name'
      )
      const nextId = typeof nextIdResult.data[0]?.next_id === 'bigint'
        ? Number(nextIdResult.data[0].next_id)
        : nextIdResult.data[0]?.next_id

      // Build INSERT query
      const insertQuery = `
        INSERT INTO ddb.table_name (id, field1, field2, created_at)
        VALUES (
          ${nextId},
          '${formData.field1.replace(/'/g, "''")}',
          ${formData.field2 ? parseInt(formData.field2) : 'NULL'},
          '${new Date().toISOString()}'
        )
      `
      await window.SA.queryExecutor.executeQuery(insertQuery)

      setMessage({ type: 'success', text: 'Created successfully!' })
      // Reset form
      setFormData({ field1: '', field2: '' })
    } catch (e) {
      console.error('Submit error:', e)
      setMessage({ type: 'error', text: 'Failed to create' })
    }
    setSubmitting(false)
  }

  return (
    <div sa-id="main-container" className="min-h-screen bg-[#d4dce6] p-6">
      {/* Header */}
      {/* Success/Error Message */}
      {/* Form with all fields */}
      {/* Submit button */}
    </div>
  )
}

export default EntityForm
```

### SQL Value Formatting
- **VARCHAR**: `'${value.replace(/'/g, "''")}'` (escape quotes!)
- **INTEGER**: `${value ? parseInt(value) : 'NULL'}`
- **DECIMAL**: `${value ? parseFloat(value) : 'NULL'}`
- **BOOLEAN**: `${value ? 'TRUE' : 'FALSE'}`
- **DATE**: `'${value}'` (YYYY-MM-DD format)
- **TIMESTAMP**: `'${new Date().toISOString()}'`
- **NULL**: `NULL` (no quotes)

### Input Type Mapping
- VARCHAR/TEXT → `<input type="text">`
- INTEGER/BIGINT → `<input type="number">`
- DECIMAL/NUMERIC → `<input type="number" step="0.01">`
- DATE → `<input type="date">`
- BOOLEAN → `<select>` with Yes/No options
- Foreign Key → `<select>` with options loaded from related table

### Loading States
- ✅ Always show form, disable submit button during submission
- ✅ For dropdowns, show "Loading options..." while loading
- ❌ NEVER hide entire form with loading spinner

---

## LIST Operation: Grid Generation

### Requirements
- **Grid of cards** - no HTML tables!
- Responsive grid layout
- Loading state (spinner)
- Empty state (no data message)
- Query with LEFT JOIN for foreign keys
- Card styling with hover effects

### Component Structure
```tsx
import React, { useState, useEffect } from 'react'

const EntityList: React.FC = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await window.SA.queryExecutor.executeQuery(`
          SELECT
            t.*,
            r.name as related_name
          FROM ddb.table_name t
          LEFT JOIN ddb.related_table r ON t.foreign_key = r.id
          ORDER BY t.created_at DESC
          LIMIT 100
        `)
        setItems(result.data)
      } catch (e) {
        console.error('Query error:', e)
        setError('Failed to load data')
      }
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  return (
    <div sa-id="main-container" className="min-h-screen bg-[#d4dce6] p-6">
      {/* Header with stats */}

      {/* Grid */}
      <div sa-id="items-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            sa-id={`item-card-${item.id}`}
            className="bg-[#ffffff] rounded-[16px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-all"
          >
            {/* Card content */}
          </div>
        ))}
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div sa-id="empty-state">No items found</div>
      )}
    </div>
  )
}
```

### Grid Layout Rules
- Use `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`
- Put `.map()` directly inside the grid div
- Use responsive breakpoints for different screen sizes
- Card base: `bg-[#ffffff] rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)]`
- Card hover: `hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-all`

---

## UPDATE Operation

Combine LIST + CREATE patterns:
1. Show grid of cards (LIST operation)
2. Add "Edit" button on each card
3. Show form when edit is clicked (use state to toggle)
4. Load existing data into form
5. Submit with UPDATE query instead of INSERT

---

## DELETE Operation

Based on LIST operation:
1. Show grid of cards
2. Add "Delete" button on each card
3. Show confirmation dialog (`window.confirm()`)
4. Execute DELETE query
5. Refresh list after deletion

---

## General Requirements

### TypeScript
- Remove all TypeScript before converting to DSL
- Use interfaces for data types
- Type all function parameters
- Use proper React.FC types

### Styling (Tailwind v4)
- Use design system colors from `design/README.md`
- Never use generic Tailwind colors (bg-blue-500, etc.)
- Use arbitrary values: `bg-[#d4dce6]`, `text-[#2d3748]`
- Responsive breakpoints: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`

### Required Attributes
- **Every element** must have `sa-id` attribute
- Use descriptive kebab-case names: `sa-id="form-title"`
- Dynamic sa-ids in loops: `sa-id={\`item-card-\${item.id}\`}`

### Database Queries
- Always use `window.SA.queryExecutor.executeQuery()`
- Never import or use any other query method
- Always use `ddb.` prefix for all tables
- Handle BigInt conversion: `typeof val === 'bigint' ? Number(val) : val`
- Results are in `result.data` array
- Always use try-catch for error handling

### Component Export
- Must have `export default ComponentName` at the end
- Functional components only (no class components)
- Use React hooks (useState, useEffect)

---

## Common Mistakes to Avoid

❌ **DON'T:** Generate a list when user says "create"
✅ **DO:** Generate a form when user says "create"

❌ **DON'T:** Use HTML tables for lists
✅ **DO:** Use responsive grid with cards

❌ **DON'T:** Hard-code table names
✅ **DO:** Read from `database/schema.md`

❌ **DON'T:** Hide form with loading spinner
✅ **DO:** Show form, disable submit button

❌ **DON'T:** Forget to escape SQL quotes
✅ **DO:** Use `.replace(/'/g, "''")`

❌ **DON'T:** Use generic colors (bg-blue-500)
✅ **DO:** Use design system colors from `design/README.md`
