import React, { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import toast from 'react-hot-toast'
import { queryExecutor } from '../query'

interface TaskDependencyCheckerProps {
  taskId: number
  onClearComplete?: () => void
}

interface DependencyInfo {
  comments: number
  tags: number
  workLogs: number
  dependencies: number
}

const TaskDependencyChecker: React.FC<TaskDependencyCheckerProps> = ({ taskId, onClearComplete }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [dependencies, setDependencies] = useState<DependencyInfo | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)

  useEffect(() => {
    checkDependencies()
  }, [taskId])

  const checkDependencies = async () => {
    setIsLoading(true)
    try {
      const queries = await Promise.all([
        queryExecutor.executeQuery(`SELECT COUNT(*) as count FROM ddb.task_comments WHERE task_id = ${taskId}`),
        queryExecutor.executeQuery(`SELECT COUNT(*) as count FROM ddb.task_tags WHERE task_id = ${taskId}`),
        queryExecutor.executeQuery(`SELECT COUNT(*) as count FROM ddb.work_logs WHERE task_id = ${taskId}`),
        queryExecutor.executeQuery(`SELECT COUNT(*) as count FROM ddb.task_dependencies WHERE task_id = ${taskId}`)
      ])

      const deps: DependencyInfo = {
        comments: typeof queries[0].data[0].count === 'bigint' ? Number(queries[0].data[0].count) : queries[0].data[0].count,
        tags: typeof queries[1].data[0].count === 'bigint' ? Number(queries[1].data[0].count) : queries[1].data[0].count,
        workLogs: typeof queries[2].data[0].count === 'bigint' ? Number(queries[2].data[0].count) : queries[2].data[0].count,
        dependencies: typeof queries[3].data[0].count === 'bigint' ? Number(queries[3].data[0].count) : queries[3].data[0].count
      }

      setDependencies(deps)
    } catch (e) {
      console.error('Error checking dependencies:', e)
      toast.error('Failed to check task dependencies')
    }
    setIsLoading(false)
  }

  const handleDeleteRequest = (target: string) => {
    setDeleteTarget(target)
    setShowConfirmModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return

    setIsDeleting(true)
    try {
      let query = ''
      let successMessage = ''

      switch (deleteTarget) {
        case 'comments':
          query = `DELETE FROM ddb.task_comments WHERE task_id = ${taskId}`
          successMessage = 'All comments deleted'
          break
        case 'tags':
          query = `DELETE FROM ddb.task_tags WHERE task_id = ${taskId}`
          successMessage = 'All tags deleted'
          break
        case 'workLogs':
          query = `DELETE FROM ddb.work_logs WHERE task_id = ${taskId}`
          successMessage = 'All work logs deleted'
          break
        case 'dependencies':
          query = `DELETE FROM ddb.task_dependencies WHERE task_id = ${taskId}`
          successMessage = 'All dependencies deleted'
          break
        case 'all':
          await queryExecutor.executeQuery(`DELETE FROM ddb.task_comments WHERE task_id = ${taskId}`)
          await queryExecutor.executeQuery(`DELETE FROM ddb.task_tags WHERE task_id = ${taskId}`)
          await queryExecutor.executeQuery(`DELETE FROM ddb.work_logs WHERE task_id = ${taskId}`)
          await queryExecutor.executeQuery(`DELETE FROM ddb.task_dependencies WHERE task_id = ${taskId}`)
          successMessage = 'All dependencies cleared'
          break
      }

      if (query) {
        await queryExecutor.executeQuery(query)
      }

      toast.success(successMessage)
      setShowConfirmModal(false)
      setDeleteTarget(null)

      // Recheck dependencies
      await checkDependencies()

      // Notify parent if all cleared
      if (onClearComplete) {
        const totalDeps = (dependencies?.comments || 0) + (dependencies?.tags || 0) +
                          (dependencies?.workLogs || 0) + (dependencies?.dependencies || 0)
        if (totalDeps === 0 || deleteTarget === 'all') {
          onClearComplete()
        }
      }
    } catch (e) {
      console.error('Error deleting dependencies:', e)
      toast.error('Failed to delete dependencies')
    }
    setIsDeleting(false)
  }

  const getTotalCount = () => {
    if (!dependencies) return 0
    return dependencies.comments + dependencies.tags + dependencies.workLogs + dependencies.dependencies
  }

  const hasDependencies = () => {
    return getTotalCount() > 0
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-8 h-8 border-4 border-[#6b8cce] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#718096]">Checking task dependencies...</p>
        </div>
      </div>
    )
  }

  if (!dependencies) {
    return null
  }

  return (
    <>
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8">
        <div className="flex items-center gap-3 mb-6">
          <Icon icon="mdi:alert-circle" width={28} height={28} className="text-[#fc8181]" />
          <h2 className="text-xl font-bold text-[#2d3748]">Task Dependencies</h2>
        </div>

        {!hasDependencies() ? (
          <div className="flex items-center gap-3 p-4 bg-[#d4f4dd] rounded-[12px]">
            <Icon icon="mdi:check-circle" width={24} height={24} className="text-[#6bcf7f]" />
            <p className="text-[#2d3748]">
              <span className="font-semibold">No dependencies found!</span> This task can be safely updated.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-[#fff4e6] border-l-4 border-[#ffa940] p-4 rounded-[12px] mb-6">
              <p className="text-[#2d3748] mb-2">
                <span className="font-semibold">⚠️ Warning:</span> This task has <span className="font-bold">{getTotalCount()}</span> reference(s) in other tables.
              </p>
              <p className="text-sm text-[#718096]">
                Due to DuckDB limitations, you must delete these references before updating this task.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {/* Comments */}
              {dependencies.comments > 0 && (
                <div className="flex items-center justify-between p-4 bg-[#f8f9fb] rounded-[12px]">
                  <div className="flex items-center gap-3">
                    <Icon icon="mdi:comment-multiple" width={24} height={24} className="text-[#5ba3d0]" />
                    <div>
                      <p className="font-semibold text-[#2d3748]">Task Comments</p>
                      <p className="text-sm text-[#718096]">{dependencies.comments} comment(s)</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteRequest('comments')}
                    className="flex items-center gap-2 px-4 py-2 bg-[#fc8181] text-white rounded-[10px] hover:bg-[#f56565] transition-all duration-200 text-sm font-semibold"
                  >
                    <Icon icon="mdi:delete" width={18} height={18} />
                    <span>Delete</span>
                  </button>
                </div>
              )}

              {/* Tags */}
              {dependencies.tags > 0 && (
                <div className="flex items-center justify-between p-4 bg-[#f8f9fb] rounded-[12px]">
                  <div className="flex items-center gap-3">
                    <Icon icon="mdi:tag-multiple" width={24} height={24} className="text-[#9b8cce]" />
                    <div>
                      <p className="font-semibold text-[#2d3748]">Task Tags</p>
                      <p className="text-sm text-[#718096]">{dependencies.tags} tag(s)</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteRequest('tags')}
                    className="flex items-center gap-2 px-4 py-2 bg-[#fc8181] text-white rounded-[10px] hover:bg-[#f56565] transition-all duration-200 text-sm font-semibold"
                  >
                    <Icon icon="mdi:delete" width={18} height={18} />
                    <span>Delete</span>
                  </button>
                </div>
              )}

              {/* Work Logs */}
              {dependencies.workLogs > 0 && (
                <div className="flex items-center justify-between p-4 bg-[#f8f9fb] rounded-[12px]">
                  <div className="flex items-center gap-3">
                    <Icon icon="mdi:clock-time-four" width={24} height={24} className="text-[#6bcf7f]" />
                    <div>
                      <p className="font-semibold text-[#2d3748]">Work Logs</p>
                      <p className="text-sm text-[#718096]">{dependencies.workLogs} log(s)</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteRequest('workLogs')}
                    className="flex items-center gap-2 px-4 py-2 bg-[#fc8181] text-white rounded-[10px] hover:bg-[#f56565] transition-all duration-200 text-sm font-semibold"
                  >
                    <Icon icon="mdi:delete" width={18} height={18} />
                    <span>Delete</span>
                  </button>
                </div>
              )}

              {/* Dependencies */}
              {dependencies.dependencies > 0 && (
                <div className="flex items-center justify-between p-4 bg-[#f8f9fb] rounded-[12px]">
                  <div className="flex items-center gap-3">
                    <Icon icon="mdi:link-variant" width={24} height={24} className="text-[#ffa940]" />
                    <div>
                      <p className="font-semibold text-[#2d3748]">Task Dependencies</p>
                      <p className="text-sm text-[#718096]">{dependencies.dependencies} dependency(ies)</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteRequest('dependencies')}
                    className="flex items-center gap-2 px-4 py-2 bg-[#fc8181] text-white rounded-[10px] hover:bg-[#f56565] transition-all duration-200 text-sm font-semibold"
                  >
                    <Icon icon="mdi:delete" width={18} height={18} />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>

            {/* Delete All Button */}
            <button
              onClick={() => handleDeleteRequest('all')}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#fc8181] text-white rounded-[10px] hover:bg-[#f56565] transition-all duration-200 font-semibold"
            >
              <Icon icon="mdi:delete-sweep" width={20} height={20} />
              <span>Delete All Dependencies</span>
            </button>
          </>
        )}
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[20px] shadow-2xl p-8 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <Icon icon="mdi:alert" width={32} height={32} className="text-[#fc8181]" />
              <h3 className="text-xl font-bold text-[#2d3748]">Confirm Deletion</h3>
            </div>
            <p className="text-[#718096] mb-6">
              Are you sure you want to delete {deleteTarget === 'all' ? 'all dependencies' : `these ${deleteTarget}`}?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false)
                  setDeleteTarget(null)
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-[#f8f9fb] text-[#718096] rounded-[10px] hover:bg-[#e2e8f0] transition-all duration-200 font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#fc8181] text-white rounded-[10px] hover:bg-[#f56565] transition-all duration-200 font-semibold disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:delete" width={18} height={18} />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default TaskDependencyChecker
