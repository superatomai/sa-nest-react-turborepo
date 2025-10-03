import React, { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import toast from 'react-hot-toast'
import { queryExecutor } from '../query'
import TaskDependencyChecker from './TaskDependencyChecker'

interface TaskStatusUpdateCardProps {
  taskId?: number
  theme?: string
  onUpdateSuccess?: (taskId: number, newStatus: string) => void
}

interface Task {
  id: number
  title: string
  description: string
  status: string
  priority: string
  assigned_to_name: string | null
  start_date: string | null
  due_date: string | null
  task_type: string
  created_at: string
  updated_at: string | null
}

const TaskStatusUpdateCard: React.FC<TaskStatusUpdateCardProps> = ({
  taskId = 10,
  theme = 'modern',
  onUpdateSuccess
}) => {
  const [task, setTask] = useState<Task | null>(null)
  const [newStatus, setNewStatus] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isUpdating, setIsUpdating] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [hasDependencies, setHasDependencies] = useState<boolean>(false)
  const [isCheckingDependencies, setIsCheckingDependencies] = useState<boolean>(true)

  const statusOptions = [
    { value: 'pending', label: 'Pending', icon: 'mdi:clock-outline', color: '#c05621' },
    { value: 'in_progress', label: 'In Progress', icon: 'mdi:progress-clock', color: '#2c5282' },
    { value: 'completed', label: 'Completed', icon: 'mdi:check-circle', color: '#22543d' },
    { value: 'on_hold', label: 'On Hold', icon: 'mdi:pause-circle', color: '#742a2a' },
    { value: 'cancelled', label: 'Cancelled', icon: 'mdi:close-circle', color: '#c53030' }
  ]

  useEffect(() => {
    loadTask()
    checkDependencies()
  }, [taskId])

  const loadTask = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await queryExecutor.executeQuery(`
        SELECT
          t.id, t.title, t.description, t.status, t.priority,
          t.start_date, t.due_date, t.task_type, t.created_at, t.updated_at,
          u.full_name as assigned_to_name
        FROM ddb.tasks t
        LEFT JOIN ddb.users u ON t.assigned_to = u.id
        WHERE t.id = ${taskId}
      `)

      if (result.data.length === 0) {
        setError(`Task with ID ${taskId} not found`)
        setTask(null)
      } else {
        const taskData = result.data[0]
        setTask(taskData)
        setNewStatus(taskData.status)
      }
    } catch (e) {
      console.error('Error loading task:', e)
      setError('Failed to load task')
      setTask(null)
    }
    setIsLoading(false)
  }

  const checkDependencies = async () => {
    setIsCheckingDependencies(true)
    try {
      const queries = await Promise.all([
        queryExecutor.executeQuery(`SELECT COUNT(*) as count FROM ddb.task_comments WHERE task_id = ${taskId}`),
        queryExecutor.executeQuery(`SELECT COUNT(*) as count FROM ddb.task_tags WHERE task_id = ${taskId}`),
        queryExecutor.executeQuery(`SELECT COUNT(*) as count FROM ddb.work_logs WHERE task_id = ${taskId}`),
        queryExecutor.executeQuery(`SELECT COUNT(*) as count FROM ddb.task_dependencies WHERE task_id = ${taskId}`)
      ])

      const totalDeps = queries.reduce((sum, result) => {
        const count = typeof result.data[0].count === 'bigint' ? Number(result.data[0].count) : result.data[0].count
        return sum + count
      }, 0)

      setHasDependencies(totalDeps > 0)
    } catch (e) {
      console.error('Error checking dependencies:', e)
      setHasDependencies(false)
    }
    setIsCheckingDependencies(false)
  }

  const handleDependenciesCleared = () => {
    checkDependencies()
  }

  const handleUpdateStatus = async () => {
    if (!task || !newStatus) {
      toast.error('Please select a status')
      return
    }

    if (newStatus === task.status) {
      toast.error('Status is already set to this value')
      return
    }

    setIsUpdating(true)
    try {
      const query = `
        UPDATE ddb.tasks
        SET status = '${newStatus}'
        WHERE id = ${task.id}
      `

      console.log('📝 Status Update Query:', query)
      await queryExecutor.executeQuery(query)

      const statusLabel = statusOptions.find(s => s.value === newStatus)?.label
      toast.success(`Task status updated to ${statusLabel}!`)

      // Reload task to show updated info
      await loadTask()

      // Call callback if provided
      if (onUpdateSuccess) {
        onUpdateSuccess(task.id, newStatus)
      }
    } catch (e) {
      console.error('Error updating status:', e)
      toast.error('Failed to update status')
    }
    setIsUpdating(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-[#feebc8]', text: 'text-[#c05621]', icon: 'mdi:clock-outline', gradientFrom: 'from-[#ffd93d]', gradientTo: 'to-[#f0c929]' }
      case 'in_progress':
        return { bg: 'bg-[#bee3f8]', text: 'text-[#2c5282]', icon: 'mdi:progress-clock', gradientFrom: 'from-[#5ba3d0]', gradientTo: 'to-[#4a8fb8]' }
      case 'completed':
        return { bg: 'bg-[#c6f6d5]', text: 'text-[#22543d]', icon: 'mdi:check-circle', gradientFrom: 'from-[#6bcf7f]', gradientTo: 'to-[#48bb78]' }
      case 'on_hold':
        return { bg: 'bg-[#fed7d7]', text: 'text-[#742a2a]', icon: 'mdi:pause-circle', gradientFrom: 'from-[#f6ad55]', gradientTo: 'to-[#dd9644]' }
      case 'cancelled':
        return { bg: 'bg-[#fed7d7]', text: 'text-[#c53030]', icon: 'mdi:close-circle', gradientFrom: 'from-[#fc8181]', gradientTo: 'to-[#e06565]' }
      default:
        return { bg: 'bg-[#e2e8f0]', text: 'text-[#718096]', icon: 'mdi:help-circle', gradientFrom: 'from-[#a0aec0]', gradientTo: 'to-[#8899aa]' }
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return { bg: 'bg-[#fed7d7]', text: 'text-[#c53030]', icon: 'mdi:fire' }
      case 'high':
        return { bg: 'bg-[#feebc8]', text: 'text-[#dd6b20]', icon: 'mdi:arrow-up-bold' }
      case 'medium':
        return { bg: 'bg-[#fef5c8]', text: 'text-[#d69e2e]', icon: 'mdi:equal' }
      case 'low':
        return { bg: 'bg-[#e2e8f0]', text: 'text-[#718096]', icon: 'mdi:arrow-down' }
      default:
        return { bg: 'bg-[#e2e8f0]', text: 'text-[#718096]', icon: 'mdi:minus' }
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDaysUntilDue = (dueDate: string | null) => {
    if (!dueDate) return null
    const now = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - now.getTime()
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return days
  }

  if (isLoading || isCheckingDependencies) {
    return (
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8">
        <div className="flex items-center justify-center gap-3 py-12">
          <div className="w-6 h-6 border-2 border-[#6b8cce] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#718096]">
            {isCheckingDependencies ? 'Checking dependencies...' : 'Loading task...'}
          </span>
        </div>
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8">
        <div className="text-center py-12">
          <Icon icon="mdi:alert-circle" width={64} height={64} className="mx-auto mb-4 text-[#fc8181]" />
          <p className="text-[#2d3748] font-semibold mb-2">{error || 'Task not found'}</p>
          <p className="text-[#718096] text-sm">Please check the task ID and try again</p>
        </div>
      </div>
    )
  }

  // Show dependency checker if task has dependencies
  if (hasDependencies) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8">
          <div className="flex items-center gap-3 mb-6">
            <Icon icon="mdi:alert-octagon" width={32} height={32} className="text-[#fc8181]" />
            <h2 className="text-2xl font-bold text-[#fc8181]">Task Status Update Blocked</h2>
          </div>

          {/* Task Info Card */}
          <div className="bg-gradient-to-r from-[#6b8cce] to-[#5ba3d0] rounded-[16px] p-6 mb-6 shadow-lg">
            <div className="flex items-start gap-3">
              <Icon icon="mdi:file-document" width={28} height={28} className="text-white mt-1" />
              <div className="flex-1">
                <p className="text-white text-sm font-medium opacity-90 mb-2">Task #{taskId}</p>
                <h3 className="text-white text-2xl font-bold mb-3">{task.title}</h3>
                {task.description && (
                  <p className="text-white text-sm opacity-80 line-clamp-2">{task.description}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#fff4e6] border-l-4 border-[#ffa940] p-4 rounded-[12px]">
            <div className="flex items-start gap-3">
              <Icon icon="mdi:alert" width={20} height={20} className="text-[#ffa940] mt-0.5" />
              <p className="text-[#2d3748] text-sm">
                <span className="font-semibold">This task status cannot be updated</span> due to existing dependencies in other tables. Please clear all dependencies first to proceed.
              </p>
            </div>
          </div>
        </div>
        <TaskDependencyChecker taskId={taskId} onClearComplete={handleDependenciesCleared} />
      </div>
    )
  }

  const currentStatusInfo = getStatusColor(task.status)
  const newStatusInfo = getStatusColor(newStatus)
  const priorityInfo = getPriorityColor(task.priority)
  const daysUntilDue = getDaysUntilDue(task.due_date)

  return (
    <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 pb-6 border-b border-[#e2e8f0]">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-[#718096]">Task #{task.id}</span>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-[6px] text-xs font-semibold ${priorityInfo.bg} ${priorityInfo.text}`}>
              <Icon icon={priorityInfo.icon} width={14} height={14} />
              {task.priority.toUpperCase()}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-[#2d3748] mb-2">{task.title}</h2>
          {task.description && (
            <p className="text-[#718096] text-sm leading-relaxed">{task.description}</p>
          )}
        </div>
      </div>

      {/* Task Info */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#f8f9fb] rounded-[12px] p-4">
          <div className="flex items-center gap-2 text-[#718096] text-xs mb-2">
            <Icon icon="mdi:account" width={14} height={14} />
            <span>Assigned To</span>
          </div>
          <div className="text-[#2d3748] font-semibold">
            {task.assigned_to_name || 'Unassigned'}
          </div>
        </div>

        <div className="bg-[#f8f9fb] rounded-[12px] p-4">
          <div className="flex items-center gap-2 text-[#718096] text-xs mb-2">
            <Icon icon="mdi:calendar-end" width={14} height={14} />
            <span>Due Date</span>
          </div>
          <div className="text-[#2d3748] font-semibold text-sm">
            {formatDate(task.due_date)}
            {daysUntilDue !== null && (
              <span className={`ml-2 text-xs ${daysUntilDue < 0 ? 'text-[#c53030]' : daysUntilDue <= 3 ? 'text-[#dd6b20]' : 'text-[#718096]'}`}>
                ({daysUntilDue < 0 ? `${Math.abs(daysUntilDue)}d overdue` : `${daysUntilDue}d left`})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className={`bg-gradient-to-br ${currentStatusInfo.gradientFrom} ${currentStatusInfo.gradientTo} rounded-[16px] p-6 mb-6 text-white`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-[10px] flex items-center justify-center">
            <Icon icon={currentStatusInfo.icon} width={24} height={24} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-white text-opacity-90 mb-1">Current Status</div>
            <div className="font-bold text-xl text-white">
              {task.status.replace('_', ' ').toUpperCase()}
            </div>
          </div>
        </div>
        {task.updated_at && (
          <div className="bg-white bg-opacity-15 rounded-[10px] p-3 backdrop-blur-sm border border-white border-opacity-20">
            <div className="flex items-center gap-2 text-sm text-white">
              <Icon icon="mdi:clock-outline" width={16} height={16} className="text-white" />
              <span className="text-white">Last updated: {formatDate(task.updated_at)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Update Status Form */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[#2d3748] font-semibold">
          <Icon icon="mdi:swap-horizontal" width={20} height={20} className="text-[#6b8cce]" />
          <span>Update Status</span>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-[#4a5568]">
            Select New Status
          </label>

          <div className="grid grid-cols-1 gap-3">
            {statusOptions.map((option) => {
              const isSelected = newStatus === option.value
              const isCurrent = task.status === option.value
              return (
                <button
                  key={option.value}
                  onClick={() => setNewStatus(option.value)}
                  disabled={isCurrent}
                  className={`flex items-center gap-3 p-4 rounded-[12px] border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-[#6b8cce] bg-[#6b8cce] bg-opacity-5 shadow-[0_2px_8px_rgba(107,140,206,0.15)]'
                      : isCurrent
                      ? 'border-[#e2e8f0] bg-[#f8f9fb] opacity-50 cursor-not-allowed'
                      : 'border-[#e2e8f0] bg-white hover:border-[#6b8cce] hover:bg-[#f8f9fb]'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${isSelected ? 'bg-[#6b8cce]' : 'bg-[#f8f9fb]'}`}
                    style={{ color: isSelected ? '#ffffff' : option.color }}
                  >
                    <Icon icon={option.icon} width={24} height={24} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-[#2d3748]">{option.label}</div>
                    {isCurrent && (
                      <div className="text-xs text-[#718096] mt-1">Current status</div>
                    )}
                  </div>
                  {isSelected && !isCurrent && (
                    <Icon icon="mdi:check" width={20} height={20} className="text-[#6b8cce]" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <button
          onClick={handleUpdateStatus}
          disabled={isUpdating || !newStatus || newStatus === task.status}
          className="w-full bg-[#6b8cce] text-white px-6 py-3 rounded-[10px] font-semibold text-sm shadow-[0_2px_8px_rgba(107,140,206,0.25)] hover:bg-[#5a7ab8] hover:shadow-[0_4px_12px_rgba(107,140,206,0.3)] transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
        >
          {isUpdating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Updating...</span>
            </>
          ) : (
            <>
              <Icon icon="mdi:check-circle" width={20} height={20} />
              <span>Update Status</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default TaskStatusUpdateCard