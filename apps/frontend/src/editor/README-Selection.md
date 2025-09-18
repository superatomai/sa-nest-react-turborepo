# Node Selection System

This modular selection system allows users to select nodes in the rendered UI components interactively.

## Features

- ✨ **Visual feedback**: Hover and selection states with blue rings
- 🎯 **Hierarchical selection**: Start with root siblings, navigate to children
- 🖱️ **Mouse interactions**: Hover to highlight, click to select, double-click to navigate
- 📋 **Copy-paste functionality**: Copy nodes and paste them as children
- 🎚️ **Modular**: Can be easily enabled/disabled
- 📍 **Level-based navigation**: Select siblings at current level only

## How it Works

### Selection Levels
- **Level 0**: Root siblings (direct children of root component)
- **Level 1+**: Children of previously selected components

### User Interactions
1. **Hover**: Shows blue ring around selectable nodes
2. **Click**: Selects a node (shows darker blue ring)
3. **Double-click**: Navigates to children of selected node
4. **Ctrl+C**: Copies the selected node
5. **Ctrl+V**: Pastes copied node as a child of the selected node
6. **Escape Key**: Smart navigation - clears selection → goes to parent → disables selection
7. **Control Panel**: Shows current level and provides navigation/copy-paste buttons

## Usage

### Option 1: Using SelectableUIRenderer (Recommended)

```tsx
import SelectableUIRenderer from './components/SelectableUIRenderer'

// Enable selection with copy-paste functionality
<SelectableUIRenderer
  schema={uiSchema}
  data={data}
  handlers={handlers}
  enableSelection={true}
  onSchemaUpdate={(newSchema) => setUiSchema(newSchema)} // Handle schema updates
/>

// Disable selection (renders normal UI)
<SelectableUIRenderer
  schema={uiSchema}
  data={data}
  handlers={handlers}
  enableSelection={false}
/>
```

### Option 2: Manual Setup

```tsx
import FLOWUIRenderer2 from './components/ui-rendere-2'
import { NodeSelectionProvider, SelectionControlPanel } from './hooks/useNodeSelection'

// With selection and copy-paste
<NodeSelectionProvider
  rootSchema={schema}
  onSchemaUpdate={(newSchema) => setSchema(newSchema)}
>
  <SelectionControlPanel />
  <FLOWUIRenderer2
    schema={schema}
    data={data}
    handlers={handlers}
    enableSelection={true}
  />
</NodeSelectionProvider>

// Without selection
<FLOWUIRenderer2
  schema={schema}
  data={data}
  handlers={handlers}
  enableSelection={false}
/>
```

## API Reference

### `useNodeSelection` Hook

```tsx
const {
  isSelectionEnabled,     // boolean: Is selection currently active
  selectedNode,           // SelectionPath | null: Currently selected node
  hoveredNode,            // SelectionPath | null: Currently hovered node
  selectionLevel,         // number: Current selection level (0 = root)

  enableSelection,        // () => void: Enable selection mode
  disableSelection,       // () => void: Disable selection mode
  selectNode,             // (id, path) => void: Select a specific node
  clearSelection,         // () => void: Clear current selection
  setHoveredNode,         // (id, path?) => void: Set hovered node

  navigateToChildren,     // () => void: Navigate to children level
  navigateToParent,       // () => void: Navigate to parent level

  isNodeSelectable,       // (path) => boolean: Check if node is selectable
  isNodeSelected,         // (id, path) => boolean: Check if node is selected
  isNodeHovered,          // (id, path) => boolean: Check if node is hovered
} = useNodeSelection()
```

### `SelectionPath` Interface

```tsx
interface SelectionPath {
  componentId: string  // The component's ID
  path: number[]      // Path to component in tree [0, 1, 2...]
}
```

## Visual Feedback

- **Selectable nodes**: Light blue ring on hover
- **Selected nodes**: Darker blue ring with background tint
- **Hovered nodes**: Medium blue ring
- **Control panel**: Shows current level and navigation options

## Removing the Selection System

To completely remove the selection functionality:

1. Use `FLOWUIRenderer2` directly instead of `SelectableUIRenderer`
2. Set `enableSelection={false}` or omit the prop
3. Don't wrap with `NodeSelectionProvider`

Example:
```tsx
// No selection - clean UI renderer
<FLOWUIRenderer2
  schema={schema}
  data={data}
  handlers={handlers}
/>
```

## Implementation Details

- **Path tracking**: Each component gets a path array indicating its position in the tree
- **Level-based selection**: Only components at the current selection level are interactive
- **Event handling**: Click, hover, and keyboard events are added to selectable components
- **CSS classes**: Tailwind classes for visual feedback
- **Context-based**: Uses React Context to share selection state
- **Keyboard navigation**: Escape key provides smart backward navigation

## Styling

The system uses Tailwind CSS classes for styling:
- `ring-2 ring-blue-500 ring-offset-2` - Selected state
- `ring-2 ring-blue-300 ring-offset-1` - Hovered state
- `hover:ring-2 hover:ring-blue-200` - Hover effects
- `cursor-pointer` - Indicates interactivity
- `transition-all duration-200` - Smooth transitions

## Escape Key Behavior

The escape key provides intelligent backward navigation with three levels of behavior:

1. **If a node is selected**: Clears the selection (deselects the node)
2. **If no selection but at child level**: Navigates to parent level
3. **If at root level with no selection**: Disables selection mode entirely

This creates a natural "back" behavior that users expect:

```
Level 2 (child level) + Node Selected
  ↓ Press Escape
Level 2 (child level) + No Selection
  ↓ Press Escape
Level 1 (parent level) + No Selection
  ↓ Press Escape
Level 0 (root level) + No Selection
  ↓ Press Escape
Selection Disabled
```

## Copy-Paste Functionality

The selection system includes powerful copy-paste capabilities that allow you to duplicate UI components and build interfaces quickly.

### How Copy-Paste Works

1. **Copy (Ctrl+C)**: Creates a deep clone of the selected component
   - Preserves all properties, styling, and children
   - Generates new unique IDs to avoid conflicts
   - Stores the component in memory until overwritten

2. **Paste (Ctrl+V)**: Adds the copied component as a child
   - Pastes to the currently selected component
   - Automatically updates all nested component IDs
   - Updates the UI schema and triggers re-render

### Copy-Paste Workflow

```
1. Select a component (e.g., a button)
   ↓
2. Press Ctrl+C (or click Copy button)
   → Component copied to memory
   ↓
3. Select target parent component (e.g., a div)
   ↓
4. Press Ctrl+V (or click Paste button)
   → Button appears as child of the div
```

### Visual Feedback

- **Green box**: Shows copied component info in control panel
- **Button states**: Copy/Paste buttons are enabled/disabled based on state
- **Console logs**: Shows copy/paste operations for debugging

### Requirements for Copy-Paste

- **Copy**: Must have a selected node
- **Paste**: Must have both a selected node AND a copied node
- **Schema callback**: Must provide `onSchemaUpdate` to handle changes