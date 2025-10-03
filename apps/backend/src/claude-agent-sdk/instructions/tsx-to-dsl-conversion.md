# TSX to DSL JSON Conversion Guide

Complete guide for converting React TSX components to DSL JSON format.

## Conversion Process Overview

1. Remove all TypeScript (interfaces, type annotations, casts)
2. Extract states from useState hooks
3. Extract all functions (handlers + helpers) into methods
4. Extract useEffect calls into effects
5. Convert JSX tree to render object
6. Write valid JSON (no trailing commas, proper escaping)

---

## 1. Remove TypeScript (First Step)

Remove ALL TypeScript before conversion:

- **Interfaces/Types**: Delete `interface Task { ... }`, `type User = ...`
- **Type annotations**: `const x: string` → `const x`, `(e: React.FormEvent)` → `(e)`
- **Type casts**: `(window as any)` → `window`, `user as User` → `user`
- **Generic types**: `useState<Task[]>([])` → `useState([])`

---

## 2. States Mapping

### Simple state

**TSX:**
```tsx
const [count, setCount] = useState(0)
```

**DSL:**
```json
"states": {
  "count": { "$exp": "0" }
}
```

### Object state

**TSX:**
```tsx
const [formData, setFormData] = useState({
  title: '',
  status: 'pending'
})
```

**DSL:**
```json
"states": {
  "formData": {
    "$exp": "{ title: '', status: 'pending' }"
  }
}
```

### Array state

**TSX:**
```tsx
const [tasks, setTasks] = useState([])
```

**DSL:**
```json
"states": {
  "tasks": { "$exp": "[]" }
}
```

---

## 3. Methods Mapping

### Simple handler

**TSX:**
```tsx
const handleClick = () => {
  setCount(count + 1)
}
```

**DSL:**
```json
"methods": {
  "handleClick": {
    "fn": "() => { setState('count', count + 1) }"
  }
}
```

### Form submit with preventDefault

**TSX:**
```tsx
const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  try {
    await saveData()
  } catch (err) {
    setError(err.message)
  }
  setLoading(false)
}
```

**DSL:**
```json
"methods": {
  "handleSubmit": {
    "fn": "async (e) => { e.preventDefault(); setState('loading', true); try { await saveData(); } catch (err) { setState('error', err.message); } setState('loading', false); }"
  }
}
```

### Object state update

**TSX:**
```tsx
const handleChange = (e) => {
  setFormData({ ...formData, title: e.target.value })
}
```

**DSL:**
```json
"methods": {
  "handleChange": {
    "fn": "(e) => { setState('formData', { ...formData, title: e.target.value }) }"
  }
}
```

### Helper functions

**TSX:**
```tsx
const getUserName = (userId) => {
  const user = users.find(u => u.id === userId)
  return user ? user.full_name : 'Unknown'
}
```

**DSL:**
```json
"methods": {
  "getUserName": {
    "fn": "(userId) => { const user = users.find(u => u.id === userId); return user ? user.full_name : 'Unknown'; }"
  }
}
```

---

## 4. Effects Mapping

**TSX:**
```tsx
useEffect(() => {
  loadTasks()
}, [])
```

**DSL:**
```json
"effects": [
  {
    "fn": "() => { loadTasks(); }",
    "deps": []
  }
]
```

---

## 5. Conditional Rendering

### && operator

**TSX:**
```tsx
{showForm && <div sa-id="form">Form</div>}
```

**DSL:**
```json
{
  "id": "form-container",
  "type": "div",
  "props": { "sa-id": "form" },
  "if": { "$bind": "showForm" },
  "children": "Form"
}
```

**IMPORTANT:** For simple variable checks, always use `$bind`, not `$exp`:
- ✅ `"if": { "$bind": "loading" }`
- ❌ `"if": { "$exp": "loading", "$deps": ["loading"] }`

### Ternary operator

**TSX:**
```tsx
{loading ? <div>Loading...</div> : <div>Content</div>}
```

**DSL:**
```json
{
  "id": "loading-content",
  "type": "div",
  "if": { "$bind": "loading" },
  "children": "Loading...",
  "else": {
    "id": "main-content",
    "type": "div",
    "children": "Content"
  }
}
```

### Nested ternary (loading → empty → content)

**TSX:**
```tsx
{loading ? (
  <div>Loading...</div>
) : tasks.length === 0 ? (
  <div>No tasks</div>
) : (
  <div>Task list</div>
)}
```

**DSL:**
```json
{
  "id": "task-view",
  "type": "div",
  "if": { "$bind": "loading" },
  "children": "Loading...",
  "else": {
    "id": "task-content",
    "type": "div",
    "if": { "$exp": "tasks.length === 0", "$deps": ["tasks"] },
    "children": "No tasks",
    "else": {
      "id": "task-list",
      "type": "div",
      "children": "Task list"
    }
  }
}
```

---

## 6. Loops (CRITICAL)

### Array.map() → for directive

**TSX:**
```tsx
<div className="grid gap-4">
  {tasks.map((task) => (
    <div key={task.id} sa-id={`task-${task.id}`}>
      <h3>{task.title}</h3>
    </div>
  ))}
</div>
```

**DSL:**
```json
{
  "id": "tasks-grid",
  "type": "div",
  "props": { "className": "grid gap-4" },
  "children": {
    "id": "task-card",
    "type": "div",
    "for": {
      "in": { "$bind": "tasks" },
      "as": "task",
      "key": "task.id"
    },
    "props": {
      "sa-id": { "$exp": "'task-' + task.id", "$deps": ["task"] }
    },
    "children": [
      {
        "id": "task-title",
        "type": "h3",
        "children": { "$bind": "task.title" }
      }
    ]
  }
}
```

### Select options

**TSX:**
```tsx
<select>
  {users.map(user => (
    <option key={user.id} value={user.id}>
      {user.full_name}
    </option>
  ))}
</select>
```

**DSL:**
```json
{
  "id": "user-select",
  "type": "select",
  "children": {
    "id": "user-option",
    "type": "option",
    "for": {
      "in": { "$bind": "users" },
      "as": "user",
      "key": "user.id"
    },
    "props": {
      "value": { "$bind": "user.id" }
    },
    "children": { "$bind": "user.full_name" }
  }
}
```

---

## 7. Event Handlers

### Inline arrow function with state update

**TSX:**
```tsx
onChange={(e) => setFormData({ ...formData, title: e.target.value })}
```

**DSL:**
Create a method first, then reference it:
```json
"methods": {
  "handleTitleChange": {
    "fn": "(e) => { setState('formData', { ...formData, title: e.target.value }) }"
  }
},
"props": {
  "onChange": "handleTitleChange"
}
```

### onClick with named function

**TSX:**
```tsx
onClick={handleSubmit}
```

**DSL:**
```json
"props": {
  "onClick": "handleSubmit"
}
```

---

## 8. Dynamic Attributes

### Template literals in sa-id

**TSX:**
```tsx
sa-id={`task-card-${task.id}`}
```

**DSL:**
```json
"props": {
  "sa-id": { "$exp": "'task-card-' + task.id", "$deps": ["task"] }
}
```

### Conditional className

**TSX:**
```tsx
className={`btn ${loading ? 'disabled' : ''}`}
```

**DSL:**
```json
"props": {
  "className": { "$exp": "'btn ' + (loading ? 'disabled' : '')", "$deps": ["loading"] }
}
```

---

## 9. Element Structure Requirements

- **id field** (required): Unique DSL identifier like `"main-container-el"`
- **sa-id in props** (required): Preserve from TSX like `"props": {"sa-id": "main-container"}`
- Both MUST be unique within component

---

## 10. Common Database Patterns

### Database query with window.SA

**TSX:**
```tsx
const result = await (window as any).SA.queryExecutor.executeQuery(`
  SELECT * FROM ddb.users
`)
setUsers(result.data)
```

**DSL:**
```json
"methods": {
  "loadUsers": {
    "fn": "async () => { const result = await window.SA.queryExecutor.executeQuery('SELECT * FROM ddb.users'); setState('users', result.data); }"
  }
}
```

### BigInt conversion

**TSX:**
```tsx
const nextId = typeof result.data[0]?.next_id === 'bigint'
  ? Number(result.data[0].next_id)
  : result.data[0]?.next_id
```

**DSL:**
```json
"fn": "async () => { const result = await window.SA.queryExecutor.executeQuery('SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM ddb.tasks'); const nextId = typeof result.data[0]?.next_id === 'bigint' ? Number(result.data[0].next_id) : result.data[0]?.next_id; }"
```

---

## Output Structure Template

```json
{
  "id": "ui_xxxxx",
  "name": "ComponentName",
  "props": {},
  "states": {},
  "methods": {},
  "effects": [],
  "data": {},
  "render": {
    "id": "root-el",
    "type": "div",
    "props": {
      "sa-id": "main-container",
      "className": "..."
    },
    "children": []
  }
}
```

---

## Important Notes

1. **All inline functions** → Extract to methods
2. **All `{variable}`** → `{"$bind": "variable"}`
3. **All `{expression}`** → `{"$exp": "expression", "$deps": [...]}`
4. **All `.map()`** → `for` directive on container element
5. **All ternaries/&&** → `if/else` structure
6. **All `setState/setX`** → `setState('x', value)`
7. **Preserve all `sa-id` attributes** from TSX
8. **Valid JSON only** - no trailing commas, proper string escaping
