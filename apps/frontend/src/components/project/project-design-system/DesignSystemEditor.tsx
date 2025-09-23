import { useState, memo, useMemo, useEffect, useRef } from 'react'
import { SimpleEditor } from '@/components/project/project-design-system/tiptap/SimpleEditor'
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/react'
import orgStore from '@/stores/mobx_org_store'
import { trpc } from '@/utils'
import toast from 'react-hot-toast'

interface DesignSystemEditorProps {
  projectId?: string
}

const DesignSystemEditor = memo(function DesignSystemEditor({ projectId }: DesignSystemEditorProps) {
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const originalContentRef = useRef('')

  // Fetch design system data
  const { data: designSystemData, isLoading: designSystemLoading } = trpc.designSystemGetByProjectId.useQuery({
    projectId: parseInt(projectId || '0'),
    orgId: orgStore.orgId || ''
  })

  // Design system mutation for updating/creating
  const designSystemUpsertMutation = trpc.designSystemUpsert.useMutation({
    onSuccess: () => {
      toast.success('Design notes saved successfully')
      setLastSaved(new Date())
      setIsSaving(false)
      setHasUnsavedChanges(false)
      originalContentRef.current = content // Update the original content reference
    },
    onError: (error) => {
      console.error('Failed to save design notes:', error)
      toast.error('Failed to save design notes')
      setIsSaving(false)
    }
  })

  // Load existing design notes when design system data is available
  useEffect(() => {
    if (designSystemData?.designSystem?.designNotes) {
      setContent(designSystemData.designSystem.designNotes)
      originalContentRef.current = designSystemData.designSystem.designNotes
    }
    setIsLoading(designSystemLoading)
  }, [designSystemData, designSystemLoading])

  // Track changes to detect unsaved content
  useEffect(() => {
    setHasUnsavedChanges(content !== originalContentRef.current)
  }, [content])

  // Browser navigation warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        // Modern browsers only require preventDefault() and return value
        return (e.returnValue = '')
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges])

  // React Router navigation warning (if using React Router)
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (hasUnsavedChanges) {
        const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?')
        if (!confirmLeave) {
          // Prevent navigation by pushing current state back
          window.history.pushState(null, '', window.location.href)
        }
      }
    }

    if (hasUnsavedChanges) {
      window.addEventListener('popstate', handlePopState)
      // Push a state to enable the popstate listener
      window.history.pushState(null, '', window.location.href)
    }

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [hasUnsavedChanges])

  const handleSave = async () => {
    if (!projectId || !orgStore.orgId) return

    setIsSaving(true)
    designSystemUpsertMutation.mutate({
      projectId: parseInt(projectId),
      designNotes: content,
      orgId: orgStore.orgId
    })
  }

  // Memoize the debug panels to prevent re-renders
  const debugPanels = useMemo(() => (
    <div className="border rounded-lg bg-gray-50 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Tiptap Markdown Output:</h3>
      <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-48 text-gray-800">
        {content || ''}
      </pre>

      <h3 className="text-sm font-semibold text-gray-700 mb-2 mt-4">JSON Stringified:</h3>
      <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-48 text-gray-800">
        {JSON.stringify(content, null, 2)}
      </pre>
    </div>
  ), [content])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Icon icon="lucide:loader-2" className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading design notes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon icon="lucide:file-text" className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold">Design System Documentation</h2>
        </div>
        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <span className="text-sm text-orange-600 flex items-center gap-1">
              <Icon icon="lucide:circle" className="h-2 w-2 fill-current" />
              Unsaved changes
            </span>
          )}
          {lastSaved && !hasUnsavedChanges && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <Icon icon="lucide:check-circle" className="h-4 w-4" />
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <Button
            onClick={handleSave}
            disabled={isSaving || designSystemUpsertMutation.isPending || !hasUnsavedChanges}
            size="sm"
            className={`flex items-center gap-2 cursor-pointer ${
              hasUnsavedChanges ? 'bg-orange-500 hover:bg-orange-600' : ''
            }`}
          >
            <Icon icon="lucide:save" className="h-4 w-4" />
            {isSaving || designSystemUpsertMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="border rounded-lg p-1 bg-white">
        <SimpleEditor
          content={content}
          onChange={setContent}
          placeholder="Document your design system here. Include colors, typography, components, spacing guidelines, and best practices..."
          className="border-0"
        />
      </div>

      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
        <p><strong>Tip:</strong> Use headings to organize sections like Colors, Typography, Components, etc.
        Add links to reference external resources or style guides.</p>
      </div>

      {/* {debugPanels} */}

    </div>
  )
})

export default DesignSystemEditor