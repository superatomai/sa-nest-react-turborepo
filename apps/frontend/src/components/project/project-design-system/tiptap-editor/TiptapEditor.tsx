import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { MenuBar } from './MenuBar'
import './tiptap-editor.css'

interface TiptapEditorProps {
  content?: string
  onChange?: (content: string) => void
  placeholder?: string
  editable?: boolean
}

const TiptapEditor = ({
  content = '',
  onChange,
  placeholder = 'Start typing...',
  editable = true
}: TiptapEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      })
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange?.(html)
    }
  })

  if (!editor) {
    return null
  }

  return (
    <div className="tiptap-editor-container">
      {editable && <MenuBar editor={editor} />}
      <EditorContent
        editor={editor}
        className="tiptap-editor-content"
        placeholder={placeholder}
      />
    </div>
  )
}

export default TiptapEditor