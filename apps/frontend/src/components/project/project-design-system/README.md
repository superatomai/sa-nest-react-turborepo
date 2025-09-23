# Design System Editor

A rich text editor implementation for project design system documentation using Tiptap editor with markdown support and real-time persistence.

## Overview

The Design System Editor allows users to create and edit design system documentation with a rich text interface. It includes formatting options, markdown export, real-time saving, and unsaved changes protection.

## Architecture

### Components Structure

```
project-design-system/
├── DesignSystemEditor.tsx    # Main editor component with persistence
└── README.md                # This documentation
```

### Related Components
```
tiptap/
├── SimpleEditor.tsx          # Core Tiptap editor with markdown support
├── EditorToolbar.tsx         # Rich formatting toolbar
└── tiptap-styles.css        # Editor styling
```

## Tiptap Implementation

### Core Editor (SimpleEditor.tsx)

The editor is built on **Tiptap v3** with the following extensions:

```typescript
const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] }
    }),
    Placeholder.configure({ placeholder }),
    Underline,
    Typography,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { class: 'text-blue-500 underline cursor-pointer' }
    }),
    Markdown.configure({
      html: true,
      tightLists: true,
      bulletListMarker: '-',
      linkify: false,
      breaks: false
    })
  ],
  content,
  editable,
  onUpdate: ({ editor }) => {
    const markdown = editor.storage.markdown.getMarkdown()
    onChange?.(markdown)
  }
})
```

### Key Features

#### 1. **Markdown Support**
- Uses `tiptap-markdown` extension
- Real-time conversion between rich text and markdown
- Exports clean markdown format for storage

#### 2. **Rich Formatting Toolbar**
- **Text Formatting**: Bold, Italic, Underline, Strikethrough, Code
- **Headings**: H1, H2, H3 with proper selection handling
- **Lists**: Bullet lists, Ordered lists
- **Blocks**: Blockquotes, Horizontal rules
- **Links**: Interactive link insertion with URL input modal
- **Actions**: Undo/Redo functionality

#### 3. **Anti-Flickering Optimizations**
The toolbar implements sophisticated re-render prevention:

```typescript
// Only update when button states actually change
setEditorState(prevState => {
  const hasChanged = Object.keys(newState).some(key =>
    prevState[key] !== newState[key]
  )
  return hasChanged ? newState : prevState
})

// Disable updates when link input is active
if (showLinkInput) return

// Memoized components and callbacks
const ToolbarButton = memo(({ onClick, isActive, disabled, children, title }) => ...)
const handleBold = useCallback(() => { ... }, [editor])
```

## Data Persistence

### Database Integration

The design notes are stored in the `projects` table under the `design_notes` column:

```sql
-- Database schema
projects: {
  id: serial primary key,
  name: varchar(255),
  description: text,
  design_notes: text,  -- <-- Markdown content stored here
  ...
}
```

### Backend Services

#### Projects Service
```typescript
// apps/backend/src/projects/projects.service.ts
async updateProject(id: number, data: {
  name?: string;
  description?: string;
  designNotes?: string;  // New field added
}, orgId: string, user?: User)
```

#### tRPC Procedures
```typescript
// packages/trpc/index.ts
projectsUpdate: t.procedure
  .input(z.object({
    id: z.number().int().positive(),
    data: z.object({
      name: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      designNotes: z.string().optional(),  // Added for design notes
    }),
    orgId: z.string().min(1),
  }))
```

### Frontend Implementation

#### Data Flow
```
1. Component Mount → Fetch project data → Load existing design_notes
2. User Types → Update local state → Mark as unsaved
3. User Clicks Save → tRPC mutation → Update database → Reset unsaved state
```

#### State Management
```typescript
const [content, setContent] = useState('')                    // Current editor content
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)  // Change tracking
const originalContentRef = useRef('')                         // Baseline for comparison

// Track changes
useEffect(() => {
  setHasUnsavedChanges(content !== originalContentRef.current)
}, [content])
```

## Unsaved Changes Protection

### Browser Navigation Protection
```typescript
// Prevent accidental data loss
const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (hasUnsavedChanges) {
    e.preventDefault()
    return (e.returnValue = '')  // Modern browser standard
  }
}
```

### Visual Indicators
- **🟠 Unsaved Changes**: Orange dot + "Unsaved changes" text
- **✅ Saved Status**: Green checkmark + "Saved [time]"
- **🔶 Save Button**: Orange when changes exist, disabled when no changes
- **⚠️ Navigation Warning**: Browser dialog on tab close/navigation

## Usage

### Basic Implementation
```tsx
import DesignSystemEditor from '@/components/project-design-system/DesignSystemEditor'

function ProjectDesignSystemPage({ projectId }: { projectId: string }) {
  return (
    <div className="container">
      <DesignSystemEditor projectId={projectId} />
    </div>
  )
}
```

### Features Available to Users

1. **Rich Text Editing**
   - Format text with bold, italic, underline, strikethrough
   - Create headings (H1, H2, H3)
   - Add bullet points and numbered lists
   - Insert blockquotes and horizontal rules
   - Add clickable links

2. **Markdown Export**
   - Content is automatically converted to markdown
   - Clean, portable format for documentation
   - Compatible with GitHub, GitLab, and other markdown platforms

3. **Auto-Save Protection**
   - Visual indicators for unsaved changes
   - Browser warnings before navigation
   - Persistent storage in project database

## Performance Optimizations

### 1. **React Optimizations**
- `memo()` wrapper for main component
- `useCallback()` for stable click handlers
- `useMemo()` for complex derived state
- Conditional event listener registration

### 2. **Editor Optimizations**
- Minimal event listeners (only `selectionUpdate`, `focus`, `blur`)
- State change detection to prevent unnecessary re-renders
- Toolbar update suspension during link input
- Memoized button groups

### 3. **Network Optimizations**
- Single tRPC mutation for updates
- Optimistic UI updates
- Error handling with user feedback

## Browser Compatibility

- **Modern Browsers**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **Mobile**: iOS Safari 14+, Chrome Mobile 88+
- **Features**: All modern ES2020+ features supported
- **Markdown**: Full CommonMark compatibility

## Development

### Adding New Formatting Options

1. **Add Extension** to SimpleEditor:
```typescript
extensions: [
  StarterKit,
  YourNewExtension.configure({ ... }),
  // ...
]
```

2. **Add Toolbar Button** to EditorToolbar:
```typescript
<ToolbarButton
  onClick={() => editor.chain().focus().yourCommand().run()}
  isActive={editor.isActive('yourExtension')}
  title="Your Feature"
>
  <Icon icon="your-icon" />
</ToolbarButton>
```

3. **Add State Tracking**:
```typescript
const [editorState, setEditorState] = useState({
  // ...existing state
  isYourFeature: false,
})
```

### Debugging

1. **Enable Debug Panel** (temporarily uncomment in DesignSystemEditor):
```typescript
{debugPanels}  // Shows raw markdown output and JSON
```

2. **Check Network Requests**:
```typescript
// Monitor tRPC calls in browser dev tools
updateProjectMutation.mutate({ ... })
```

3. **Editor State Inspection**:
```typescript
console.log('Editor state:', editor.getJSON())
console.log('Markdown:', editor.storage.markdown.getMarkdown())
```

## Dependencies

### Core Dependencies
- `@tiptap/react` - React integration
- `@tiptap/starter-kit` - Basic editing features
- `@tiptap/extension-placeholder` - Placeholder text
- `@tiptap/extension-underline` - Underline support
- `@tiptap/extension-link` - Link functionality
- `@tiptap/extension-typography` - Smart typography
- `tiptap-markdown` - Markdown conversion

### UI Dependencies
- `@iconify/react` - Icon components
- `react-hot-toast` - Toast notifications
- Custom UI components (Button, Input)

## Future Enhancements

### Potential Features
- [ ] **Tables**: Add table support with `@tiptap/extension-table`
- [ ] **Images**: Image upload and embedding
- [ ] **Code Blocks**: Syntax highlighting with `@tiptap/extension-code-block-lowlight`
- [ ] **Collaboration**: Real-time collaboration with `@tiptap/extension-collaboration`
- [ ] **Comments**: Inline commenting system
- [ ] **Version History**: Track document versions
- [ ] **Templates**: Pre-built design system templates
- [ ] **Export Options**: PDF, HTML, Word document export

### Performance Improvements
- [ ] **Lazy Loading**: Load editor only when needed
- [ ] **Debounced Saves**: Auto-save with debouncing
- [ ] **Incremental Sync**: Only sync changed portions
- [ ] **Offline Support**: Service worker caching

## Troubleshooting

### Common Issues

1. **Flickering During Typing**
   - Check if event listeners are properly memoized
   - Ensure toolbar updates are conditionally disabled
   - Verify React.memo() usage on components

2. **Unsaved Changes Not Detected**
   - Check originalContentRef updates after save
   - Verify content comparison logic
   - Ensure useEffect dependencies are correct

3. **Markdown Conversion Issues**
   - Check tiptap-markdown configuration
   - Verify extension load order
   - Test with simple content first

4. **Save Failures**
   - Check network tab for tRPC errors
   - Verify projectId and orgId are valid
   - Check backend logs for validation errors

### Support

For issues specific to this implementation, check:
1. Browser console for JavaScript errors
2. Network tab for failed API calls
3. React DevTools for component re-renders
4. Backend logs for server-side errors