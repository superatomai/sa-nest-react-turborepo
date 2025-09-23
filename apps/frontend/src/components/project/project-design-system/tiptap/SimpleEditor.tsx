import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Typography from '@tiptap/extension-typography'
import { Markdown } from 'tiptap-markdown'
import { EditorToolbar } from './EditorToolbar'
import { useEffect } from 'react'
import './tiptap-styles.css'

interface SimpleEditorProps {
  content?: string
  onChange?: (markdown: string) => void
  placeholder?: string
  className?: string
  editable?: boolean
}

export function SimpleEditor({
  content = '',
  onChange,
  placeholder = 'Start writing your design system documentation...',
  className = '',
  editable = true
}: SimpleEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Placeholder.configure({
        placeholder
      }),
      Underline,
      Typography,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline cursor-pointer'
        }
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
      const markdown = (editor.storage as any).markdown.getMarkdown()
      onChange?.(markdown)
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none'
      }
    }
  })

  useEffect(() => {
    if (editor && content !== undefined) {
      const currentMarkdown = (editor.storage as any).markdown?.getMarkdown()

      // Only update if content is different and not empty initially
      if (content !== currentMarkdown && content !== '') {
        editor.commands.setContent(content)
      }
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  return (
    <div className={`border rounded-lg overflow-hidden bg-white ${className}`}>
      {editable && <EditorToolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  )
}