# Claude Agent Instructions

This directory contains instruction files used by the Claude Agent SDK for generating and converting UI components.

## Files

### 1. `tsx-generation-guide.md`
**Purpose:** Guides the agent in generating React TSX components from user prompts.

**Used by:** `claude-ui-agent.service.ts` → `buildClaudeCodePrompt()` method

**Key Features:**
- User intent analysis (identifying CRUD operations)
- CREATE operation: Form generation patterns
- LIST operation: Grid layout patterns
- UPDATE/DELETE operation: Combined patterns
- Database query examples
- Styling guidelines
- Common mistakes to avoid

**General & Flexible:**
- ✅ No hard-coded table names
- ✅ Works with any database schema
- ✅ Reads from `database/schema.md` for table structure
- ✅ Uses placeholders like `[entity]`, `ddb.table_name`

### 2. `tsx-to-dsl-conversion.md`
**Purpose:** Guides the agent in converting TSX components to DSL JSON format.

**Used by:** `claude-ui-agent.service.ts` → `convertTSXToDSL()` method

**Key Features:**
- TypeScript removal patterns
- State mapping (simple, object, array)
- Method mapping (handlers, async functions, helpers)
- Effects mapping
- Conditional rendering (&&, ternary, nested)
- Loop conversion (.map() → for directive)
- Event handler patterns
- Dynamic attribute handling
- Database query patterns

**General & Flexible:**
- ✅ Pattern-based examples (not table-specific)
- ✅ Works with any component structure
- ✅ Comprehensive conversion rules

## How It Works

### TSX Generation Flow
```
User: "create task"
    ↓
buildClaudeCodePrompt() loads tsx-generation-guide.md
    ↓
Agent reads: CLAUDE.md, database/schema.md, design/README.md
    ↓
Agent identifies: CREATE operation
    ↓
Agent generates: Task creation FORM (not list!)
    ↓
Result: uis/ui_xxxxx/ui.tsx
```

### TSX to DSL Conversion Flow
```
TSX file exists at uis/ui_xxxxx/ui.tsx
    ↓
convertTSXToDSL() loads tsx-to-dsl-conversion.md
    ↓
Agent reads: dsl/schema.ts, dsl/doc.md, dsl/native.md
    ↓
Agent converts TSX to DSL JSON using patterns
    ↓
Result: uis/ui_xxxxx/ui.json
```

## Maintaining Instructions

### When to Update

**tsx-generation-guide.md:**
- New CRUD operation patterns needed
- New input types or components
- Changes to design system
- New database query patterns

**tsx-to-dsl-conversion.md:**
- New DSL features added
- New conversion patterns needed
- Edge cases discovered

### Best Practices

1. **Keep it general** - Use placeholders, not specific table names
2. **Provide examples** - Show before/after code snippets
3. **Be explicit** - The agent follows instructions literally
4. **Test changes** - Generate components after updating instructions
5. **Document patterns** - Add new patterns as you discover them

### Testing Instructions

After updating instruction files:

1. Create a new project in the system
2. Test each CRUD operation:
   - "create task" → Should generate form only
   - "list tasks" → Should generate grid of cards
   - "edit task" → Should generate list + edit form
3. Verify TSX to DSL conversion works
4. Check that generated DSL JSON renders correctly

## Common Issues

### Issue: Agent generates wrong component type
**Cause:** Ambiguous user prompt or weak keyword detection
**Fix:** Update `tsx-generation-guide.md` with clearer keyword examples

### Issue: TSX to DSL conversion fails
**Cause:** Missing conversion pattern in instructions
**Fix:** Add the pattern to `tsx-to-dsl-conversion.md` with examples

### Issue: Generated component uses wrong colors
**Cause:** Not reading design/README.md
**Fix:** Emphasize design system in `tsx-generation-guide.md`

## File Locations

- **Instructions directory:** `/apps/backend/src/claude-agent-sdk/instructions/`
- **Service using instructions:** `/apps/backend/src/claude-agent-sdk/services/claude-ui-agent.service.ts`
- **Project-specific context:** `/apps/backend/.projects/{projectId}/CLAUDE.md`
- **Database schema:** `/apps/backend/.projects/{projectId}/database/schema.md`
- **Design system:** `/apps/backend/.projects/{projectId}/design/README.md`
