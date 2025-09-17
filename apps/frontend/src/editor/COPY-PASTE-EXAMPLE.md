# Copy-Paste Functionality Example

## Quick Start Guide

### 1. Enable Selection Mode
- Click the "Enable" button in the selection control panel (top-right)
- You'll see "Selection Active" with a green dot

### 2. Copy a Component
```
1. Click on any component (e.g., a button) → Blue ring appears
2. Press Ctrl+C (or click "📋 Copy" button)
3. Green box appears showing: "Copied: #button-id"
```

### 3. Paste as Child
```
1. Click on a different component (e.g., a div container)
2. Press Ctrl+V (or click "📌 Paste" button)
3. The copied component appears inside the selected container
```

## Real Example Workflow

**Scenario**: Copy a button and add it to multiple containers

### Step 1: Setup
```
UI Structure:
├─ div (container-1)
├─ button (my-button) ← We want to copy this
└─ div (container-2)
```

### Step 2: Copy Button
1. **Click** on `my-button` → Button gets blue selection ring
2. **Ctrl+C** → Control panel shows "Copied: #my-button"

### Step 3: Paste to First Container
1. **Click** on `container-1` → Container gets blue selection ring
2. **Ctrl+V** → Button appears inside container-1

### Step 4: Paste to Second Container
1. **Click** on `container-2` → Container gets blue selection ring
2. **Ctrl+V** → Button appears inside container-2

### Final Result:
```
UI Structure:
├─ div (container-1)
│  └─ button (my-button_copy_123) ← Pasted copy
├─ button (my-button) ← Original
└─ div (container-2)
   └─ button (my-button_copy_456) ← Another pasted copy
```

## Key Features

### Automatic ID Generation
- Original: `my-button`
- Copy 1: `my-button_copy_1703123456_abc12`
- Copy 2: `my-button_copy_1703123467_def34`

### Deep Cloning
If you copy a component with children, all children are also copied:
```
Copy: div with 3 buttons inside
  ↓
Paste: New div with 3 new buttons (all with unique IDs)
```

### Visual Feedback
- **Blue ring**: Selected component
- **Green box**: Shows copied component info
- **Button states**: Copy/Paste buttons enabled/disabled appropriately
- **Console logs**: Shows copy/paste operations

## Keyboard Shortcuts

| Action | Shortcut | Alternative |
|--------|----------|-------------|
| Copy | `Ctrl+C` | Click "📋 Copy" |
| Paste | `Ctrl+V` | Click "📌 Paste" |
| Navigate Back | `Escape` | Click "← Parent" |
| Clear Selection | `Escape` (when nothing selected) | Click "Clear" |

## Common Use Cases

1. **Duplicate Buttons**: Copy a styled button to multiple locations
2. **Replicate Sections**: Copy entire card components
3. **Build Lists**: Copy list items to create dynamic lists
4. **Template Components**: Copy complex layouts as templates

## Troubleshooting

**Paste button disabled?**
- ✅ Make sure you have a selected component
- ✅ Make sure you have copied something first

**Nothing happens when pasting?**
- ✅ Check that `onSchemaUpdate` callback is provided
- ✅ Check browser console for error messages

**IDs conflicting?**
- ✅ The system automatically generates unique IDs
- ✅ Check console logs to see the new ID pattern