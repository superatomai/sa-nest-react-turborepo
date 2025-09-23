# Tiptap Editor Toolbar Flickering Fix Documentation

## The Problem

Users were experiencing severe flickering in the Tiptap editor toolbar when:
- Clicking formatting buttons (bold, italic, etc.)
- Changing text styles (headings, lists)
- Using undo/redo functionality
- Generally interacting with any toolbar buttons

The flickering was so severe it made the editor feel broken and unprofessional.

## Root Causes of Flickering

### 1. **Infinite Update Loop (Original Issue)**
The first implementation had a catastrophic infinite loop:

```typescript
// ❌ OLD: Force re-render pattern
const [, forceUpdate] = useReducer(x => x + 1, 0)

useEffect(() => {
  const updateEditorState = () => {
    forceUpdate({}) // This caused infinite re-renders!
    setEditorState({ /* state */ })
  }

  editor.on('transaction', updateEditorState) // Fired on EVERY change
}, [editor])
```

**Why it flickered:** Every editor change triggered a force re-render, which could trigger more changes, creating an infinite loop that React would eventually stop with "Maximum update depth exceeded" error.

### 2. **Double State Updates**
After fixing the infinite loop, we still had double updates:

```typescript
// ❌ OLD: Manual state updates after button clicks
const handleBold = useCallback(() => {
  editor.chain().focus().toggleBold().run()
  setTimeout(() => {
    setEditorState(prev => ({ ...prev, isBold: editor.isActive('bold') }))
  }, 0)
}, [editor])
```

**Why it flickered:**
1. Button click → Execute command → Editor updates
2. setTimeout → Manual state update → React re-render
3. Editor event listener → Another state update → Another re-render

This caused 2-3 renders for every single button click!

### 3. **Inefficient State Management**
Using manual state management with `useState` and `useEffect`:

```typescript
// ❌ OLD: Manual state tracking
const [editorState, setEditorState] = useState({
  isBold: false,
  isItalic: false,
  // ... many more
})

useEffect(() => {
  const updateEditorState = () => {
    const newState = {
      isBold: editor.isActive('bold'),
      // ... check all states
    }
    setEditorState(newState)
  }

  editor.on('transaction', updateEditorState)
}, [editor])
```

**Why it flickered:** Every transaction (including cursor movements) would re-evaluate all states and potentially trigger re-renders.

### 4. **Unnecessary Re-evaluations**
Checking permissions inline caused constant re-evaluations:

```typescript
// ❌ OLD: Inline permission checks
<ToolbarButton
  disabled={!editor.can().chain().focus().toggleBold().run()} // Re-evaluated on every render!
  isActive={editorState.isBold}
/>
```

**Why it flickered:** These `can()` checks ran on every render, even when nothing changed.

### 5. **CSS Transitions**
Added visual flickering through CSS:

```typescript
// ❌ OLD: CSS transitions
className="transition-colors hover:bg-gray-100"
```

**Why it flickered:** CSS transitions on state changes created visual artifacts during rapid updates.

## The Solution

### 1. **Use Official `useEditorState` Hook**
Tiptap provides an optimized hook specifically for this use case:

```typescript
// ✅ NEW: Official Tiptap hook with selector
const editorState = useEditorState({
  editor,
  selector: ({ editor: ed }) => {
    if (!ed) return null

    return {
      // Only re-render when these specific values change
      isBold: ed.isActive('bold'),
      isItalic: ed.isActive('italic'),
      // ... other states

      // Pre-calculate permissions to avoid re-evaluations
      canBold: ed.can().chain().focus().toggleBold().run(),
      canItalic: ed.can().chain().focus().toggleItalic().run(),
      // ... other permissions
    }
  }
})
```

**Why it works:**
- The selector runs on every editor change
- React only re-renders if the returned values actually changed
- Built-in optimization prevents unnecessary re-renders

### 2. **Remove All Manual State Updates**
No more setTimeout, no more manual state tracking:

```typescript
// ✅ NEW: Simple, direct command execution
<ToolbarButton
  onClick={() => editor.chain().focus().toggleBold().run()} // Just run the command
  isActive={editorState.isBold} // State from useEditorState
  disabled={!editorState.canBold} // Pre-calculated permission
/>
```

**Why it works:**
- Single source of truth (the editor itself)
- No double updates
- State updates happen automatically through `useEditorState`

### 3. **Pre-calculate All Values in Selector**
Move all expensive operations into the selector:

```typescript
// ✅ NEW: Everything calculated once per editor update
selector: ({ editor: ed }) => ({
  // Active states
  isBold: ed.isActive('bold'),
  isItalic: ed.isActive('italic'),

  // Permissions (pre-calculated)
  canBold: ed.can().chain().focus().toggleBold().run(),
  canItalic: ed.can().chain().focus().toggleItalic().run(),

  // History states
  canUndo: ed.can().chain().focus().undo().run(),
  canRedo: ed.can().chain().focus().redo().run()
})
```

**Why it works:**
- All expensive checks happen once per editor change
- No inline re-evaluations during render
- Results are memoized by `useEditorState`

### 4. **Remove CSS Transitions**
Keep styling simple and instant:

```typescript
// ✅ NEW: No transitions
className={`
  p-2 rounded hover:bg-gray-100
  ${isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}
`}
```

**Why it works:**
- Instant visual feedback
- No animation delays or artifacts
- Clean, immediate state changes

### 5. **Proper Component Memoization**
Memoize components correctly without complex dependencies:

```typescript
// ✅ NEW: Simple memoization
const ToolbarButton = memo(({ onClick, isActive, disabled, children, title }) => (
  <button /* ... */ />
))

// Main toolbar component
export const EditorToolbar = memo(function EditorToolbar({ editor }) {
  // ... component logic
})
```

**Why it works:**
- Prevents unnecessary child component re-renders
- No complex dependency arrays
- Clean component hierarchy

## Performance Comparison

### Before (Multiple Issues):
```
Button Click → Command Execute → Editor Update → Transaction Event
→ Manual State Update → React Re-render → setTimeout Callback
→ Another State Update → Another Re-render → CSS Transition
= 3-4 renders + visual artifacts
```

### After (Optimized):
```
Button Click → Command Execute → Editor Update
→ useEditorState Selector → Single React Re-render (if needed)
= 0-1 renders, only when state actually changes
```

## Key Takeaways

1. **Always use official hooks when available** - `useEditorState` is specifically designed for this use case
2. **Single source of truth** - Let the editor manage its own state
3. **Pre-calculate expensive operations** - Move all checks into the selector
4. **Avoid manual state synchronization** - No setTimeout, no manual state updates
5. **Keep it simple** - Remove unnecessary transitions and complex memoization

## Testing the Fix

To verify the fix is working:

1. Open the browser DevTools
2. Go to React DevTools → Profiler
3. Start recording
4. Click various toolbar buttons rapidly
5. Stop recording

**Expected result:** Minimal re-renders, only the toolbar component updates when state changes, no cascading re-renders.

## Code Quality Improvements

The new implementation is:
- **Cleaner** - Less boilerplate code
- **More maintainable** - Following official patterns
- **More performant** - Fewer re-renders
- **More reliable** - No race conditions or double updates
- **Future-proof** - Using official Tiptap APIs

## References

- [Tiptap React Documentation](https://tiptap.dev/docs/editor/getting-started/install/react)
- [useEditorState Hook](https://tiptap.dev/docs/editor/api/react#useeditorstate)
- [React Performance Best Practices](https://react.dev/learn/render-and-commit)

## Migration Guide

If you have other Tiptap toolbars in the project, here's how to migrate them:

1. **Replace useState + useEffect** with `useEditorState`
2. **Remove all setTimeout calls** in button handlers
3. **Move all `editor.can()` checks** into the selector
4. **Remove CSS transitions** from toolbar buttons
5. **Simplify button onClick handlers** to just execute commands
6. **Test thoroughly** to ensure no flickering remains

---

*This fix was implemented to resolve critical UX issues with the Tiptap editor toolbar. The solution follows official Tiptap best practices and React performance guidelines.*