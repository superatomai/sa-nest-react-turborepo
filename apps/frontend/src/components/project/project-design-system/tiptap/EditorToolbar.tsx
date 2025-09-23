import { Editor, useEditorState } from '@tiptap/react'
import { useState, useRef, useEffect, memo } from 'react'
import { Icon } from '@iconify/react'
import { Input } from '@/components/ui/input'

interface EditorToolbarProps {
  editor: Editor
}

// Memoized toolbar button to prevent re-renders
const ToolbarButton = memo(({
  onClick,
  isActive = false,
  disabled = false,
  children,
  title
}: {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  children: React.ReactNode
  title: string
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`
      p-2 rounded hover:bg-gray-100
      ${isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    `}
  >
    {children}
  </button>
))

const Divider = memo(() => (
  <div className="w-px h-6 bg-gray-300 mx-1" />
))

export const EditorToolbar = memo(function EditorToolbar({ editor }: EditorToolbarProps) {
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Use useEditorState for optimal performance - only re-renders when these specific values change
  const editorState = useEditorState({
    editor,
    selector: ({ editor: ed }) => {
      if (!ed) {
        return null
      }
      return {
        isBold: ed.isActive('bold'),
        isItalic: ed.isActive('italic'),
        isUnderline: ed.isActive('underline'),
        isStrike: ed.isActive('strike'),
        isCode: ed.isActive('code'),
        isH1: ed.isActive('heading', { level: 1 }),
        isH2: ed.isActive('heading', { level: 2 }),
        isH3: ed.isActive('heading', { level: 3 }),
        isBulletList: ed.isActive('bulletList'),
        isOrderedList: ed.isActive('orderedList'),
        isBlockquote: ed.isActive('blockquote'),
        isLink: ed.isActive('link'),
        canUndo: ed.can().chain().focus().undo().run(),
        canRedo: ed.can().chain().focus().redo().run(),
        // Pre-calculate all can() checks to avoid re-evaluations
        canBold: ed.can().chain().focus().toggleBold().run(),
        canItalic: ed.can().chain().focus().toggleItalic().run(),
        canUnderline: ed.can().chain().focus().toggleUnderline().run(),
        canStrike: ed.can().chain().focus().toggleStrike().run(),
        canCode: ed.can().chain().focus().toggleCode().run()
      }
    }
  }) || {
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isStrike: false,
    isCode: false,
    isH1: false,
    isH2: false,
    isH3: false,
    isBulletList: false,
    isOrderedList: false,
    isBlockquote: false,
    isLink: false,
    canUndo: false,
    canRedo: false,
    canBold: false,
    canItalic: false,
    canUnderline: false,
    canStrike: false,
    canCode: false
  }

  const toggleLinkInput = () => {
    if (showLinkInput) {
      setShowLinkInput(false)
      setLinkUrl('')
    } else {
      const previousUrl = editor.getAttributes('link').href
      setLinkUrl(previousUrl || '')
      setShowLinkInput(true)
    }
  }

  const applyLink = () => {
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      const finalUrl = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`
      editor.chain().focus().extendMarkRange('link').setLink({ href: finalUrl }).run()
    }
    setShowLinkInput(false)
    setLinkUrl('')
    editor.commands.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      applyLink()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setShowLinkInput(false)
      setLinkUrl('')
      editor.commands.focus()
    }
  }

  useEffect(() => {
    if (showLinkInput && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [showLinkInput])

  return (
    <div className="relative">
      <div className="flex items-center gap-1 p-2 border-b flex-wrap">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editorState.isBold}
          disabled={!editorState.canBold}
          title="Bold"
        >
          <Icon icon="lucide:bold" width={18} height={18} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editorState.isItalic}
          disabled={!editorState.canItalic}
          title="Italic"
        >
          <Icon icon="lucide:italic" width={18} height={18} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editorState.isUnderline}
          disabled={!editorState.canUnderline}
          title="Underline"
        >
          <Icon icon="lucide:underline" width={18} height={18} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editorState.isStrike}
          disabled={!editorState.canStrike}
          title="Strikethrough"
        >
          <Icon icon="lucide:strikethrough" width={18} height={18} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editorState.isCode}
          disabled={!editorState.canCode}
          title="Code"
        >
          <Icon icon="lucide:code" width={18} height={18} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editorState.isH1}
          title="Heading 1"
        >
          <Icon icon="lucide:heading-1" width={18} height={18} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editorState.isH2}
          title="Heading 2"
        >
          <Icon icon="lucide:heading-2" width={18} height={18} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editorState.isH3}
          title="Heading 3"
        >
          <Icon icon="lucide:heading-3" width={18} height={18} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editorState.isBulletList}
          title="Bullet List"
        >
          <Icon icon="lucide:list" width={18} height={18} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editorState.isOrderedList}
          title="Ordered List"
        >
          <Icon icon="lucide:list-ordered" width={18} height={18} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editorState.isBlockquote}
          title="Quote"
        >
          <Icon icon="lucide:quote" width={18} height={18} />
        </ToolbarButton>

        <Divider />

        <div className="relative">
          <ToolbarButton
            onClick={toggleLinkInput}
            isActive={editorState.isLink || showLinkInput}
            title="Add Link"
          >
            <Icon icon="lucide:link" width={18} height={18} />
          </ToolbarButton>

          {/* Inline Link Input positioned relative to link button */}
          {showLinkInput && (
            <div className="absolute top-full left-0 mt-1 z-10 bg-white border border-gray-200 rounded-lg shadow-sm p-2 w-80">
              <div className="flex items-center gap-2">
                <Icon icon="lucide:link" width={14} height={14} className="text-gray-500" />
                <Input
                  ref={inputRef}
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter URL..."
                  className="flex-1 h-7 text-xs"
                />
                <button
                  onClick={applyLink}
                  className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                >
                  ✓
                </button>
                <button
                  onClick={() => {
                    setShowLinkInput(false)
                    setLinkUrl('')
                    editor.commands.focus()
                  }}
                  className="px-1 py-1 text-gray-500 text-xs hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>

        {editorState.isLink && (
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="Remove Link"
          >
            <Icon icon="lucide:unlink" width={18} height={18} />
          </ToolbarButton>
        )}

        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <Icon icon="lucide:minus" width={18} height={18} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editorState.canUndo}
          title="Undo"
        >
          <Icon icon="lucide:undo" width={18} height={18} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editorState.canRedo}
          title="Redo"
        >
          <Icon icon="lucide:redo" width={18} height={18} />
        </ToolbarButton>
      </div>
    </div>
  )
})