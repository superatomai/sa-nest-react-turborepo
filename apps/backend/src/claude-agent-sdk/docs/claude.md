# Claude Agent Instructions

## Your Task
Generate React TSX components based on user requests. Use your file tools (Read, Write, Edit, Glob, Grep) to create functional components.

## Project Structure
- `dsl/` - DSL context and definitions
- `design/` - Design system (colors, typography, spacing)
- `api/` - API schemas
- `database/` - Database schema (`database/schema.md`)
- `uis/{uiId}/` - Generated UI components
  - `ui.tsx` - **Main TSX component (what you create)**
  - `ui.json` - Metadata

## Workflow
1. **Read context**: `CLAUDE.md`, `design/README.md`, `database/schema.md` (if using data)
2. **Check patterns**: Use Glob to list existing `uis/` components
3. **Generate TSX**: Create React component at `uis/{uiId}/ui.tsx`
4. **Make it complete**: Functional, importable, production-ready

## Design System (CRITICAL)

**ALWAYS read `design/README.md` before generating UI!**

### Colors (use arbitrary values with Tailwind)
- Background: `bg-[#d4dce6]`
- Card White: `bg-[#f8f9fb]`
- Primary Blue: `bg-[#6b8cce]`
- Soft Blue (hover): `bg-[#8ea8d9]`
- Charcoal Text: `text-[#2d3748]`
- Medium Gray: `text-[#718096]`
- Light Gray Borders: `border-[#e2e8f0]`
- Success Green: `bg-[#6bcf7f]`
- Coral Pink: `bg-[#ff6b9d]`
- Sky Blue: `bg-[#5ba3d0]`
- Soft Purple: `bg-[#9b8cce]`

**NEVER use generic Tailwind colors** (`bg-blue-500`, `bg-gray-100`, etc.)

### Border Radius
- Small: `rounded-md` or `rounded-[6px]`
- Medium: `rounded-lg` or `rounded-[10px]`
- Large: `rounded-xl` or `rounded-[16px]`
- Extra Large: `rounded-2xl` or `rounded-[20px]`

### Shadows
- Subtle: `shadow-sm`
- Small: `shadow-md`
- Medium: `shadow-lg`

## Component Requirements
1. **TSX format** - Valid React TSX syntax
2. **Functional components** - Use hooks
3. **Default export** - `export default ComponentName`
4. **Tailwind v4 only** - No inline styles, use design system colors
5. **Responsive** - Use `sm:`, `md:`, `lg:`, `xl:`, `2xl:` prefixes
6. **Unique `sa-id` on EVERY element** - Descriptive kebab-case names
   - Example: `<div sa-id="main-container" className="...">`
   - Example: `<button sa-id="submit-btn" className="...">`
7. **Accessible** - ARIA labels, semantic HTML
8. **Clean code** - Well-formatted, production-ready

## Database Components

**Use `window.SA.queryExecutor` for all queries - NO imports needed!**

### Critical Rules
1. **ALWAYS read `database/schema.md` first** - Understand table structure
2. **Use `window.SA.queryExecutor`** - Globally available
3. **Table prefix**: ALL tables use `ddb.` (e.g., `ddb.users`, `ddb.projects`)
4. **Get data**: Results in `result.data` array (NOT `result.toArray()`)
5. **Handle BigInt**: `typeof val === 'bigint' ? Number(val) : val`
6. **Error handling**: Always use try-catch
7. **Loading state**: Show indicator while querying

### Query Example (TSX)
```tsx
const [data, setData] = useState<any[]>([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  const loadData = async () => {
    try {
      const result = await (window as any).SA.queryExecutor.executeQuery(`
        SELECT * FROM ddb.users ORDER BY created_at DESC LIMIT 100
      `)
      setData(result.data)
    } catch (e) {
      console.error('Query error:', e)
    }
    setLoading(false)
  }
  loadData()
}, [])
```

## Database CRUD Operations

### CREATE: "create user" / "add project"

**Show FORM ONLY - no list/table!**

1. **Read schema** from `database/schema.md`
2. **Generate form fields** based on columns (skip `id`, `created_at`)
3. **Input types** by column type:
   - VARCHAR → text input
   - INTEGER/DECIMAL → number input
   - DATE → date input
   - BOOLEAN → checkbox/select
   - Foreign keys → dropdown (load with SELECT query)
4. **Required validation** for non-nullable columns
5. **Submit handler**:
   - Get next ID: `SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM ddb.table_name`
   - Build INSERT query with proper formatting (see SQL formatting below)
   - Execute with `window.SA.queryExecutor.executeQuery()`
   - Show success/error, clear form on success

**Loading states**:
- ✅ Always show form, disable submit during submission
- ✅ For dropdowns, show "Loading options..." while loading
- ❌ NEVER hide entire form with `if (isLoading) return <Spinner />`

**SQL Value Formatting**:
- VARCHAR: `'${value.replace(/'/g, "''")}'` (escape quotes!)
- INTEGER: `${value ? parseInt(value) : 'NULL'}`
- DECIMAL: `${value ? parseFloat(value) : 'NULL'}`
- BOOLEAN: `${value ? 'TRUE' : 'FALSE'}`
- DATE: `'${value}'` (YYYY-MM-DD)
- TIMESTAMP: `'${new Date().toISOString()}'`
- NULL: `NULL` (no quotes)

### LIST: "list users" / "show projects"

**Show GRID OF CARDS - no HTML tables!**

1. **Read schema** from `database/schema.md`
2. **Fetch data**: `SELECT * FROM ddb.table_name ORDER BY created_at DESC LIMIT 100`
3. **Grid layout**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
4. **Card styling**:
   - Base: `bg-[#f8f9fb] rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)]`
   - Hover: `hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]`
5. **Show loading/empty states**

### UPDATE: "update [table]" / "edit [record]"

1. List view with cards (same as LIST)
2. "Edit" button on each card
3. Form with existing data loaded
4. Submit with UPDATE query:
   ```sql
   UPDATE ddb.table_name
   SET column1 = value1, column2 = value2, updated_at = timestamp
   WHERE id = record_id
   ```

### DELETE: "delete [record]"

1. "Delete" button on each card
2. Confirmation dialog
3. Execute: `DELETE FROM ddb.table_name WHERE id = record_id`
4. Refresh list after deletion

## Critical Checklist

- [ ] Generate actual TSX code (not descriptions)
- [ ] Use file tools (Read, Write, Edit)
- [ ] Save to `uis/{uiId}/ui.tsx`
- [ ] Add `sa-id` to ALL elements
- [ ] Use Tailwind v4 with design system colors
- [ ] Read `design/README.md` for colors
- [ ] Read `database/schema.md` before database components
- [ ] Use `window.SA.queryExecutor` for queries
- [ ] Use `ddb.` prefix for all tables
- [ ] Escape single quotes in SQL strings
- [ ] Handle NULL values properly
- [ ] Show loading states
- [ ] Default export component

## Tools Available
- **Read** - Read existing files
- **Write** - Create new files
- **Edit** - Modify files
- **Glob** - List files/directories
- **Grep** - Search patterns
- **Bash** - Shell commands
