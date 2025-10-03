import React, { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import toast from 'react-hot-toast'
import { queryExecutor } from '../query'
import TaskDependencyChecker from './TaskDependencyChecker'

interface TaskDeadlineUpdateCardProps {
  taskId?: number
  theme?: string
  onUpdateSuccess?: (taskId: number, newDeadline: string) => void
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
  estimated_hours: number | null
}

const TaskDeadlineUpdateCard: React.FC<TaskDeadlineUpdateCardProps> = ({
  taskId = 10,
  theme = 'modern',
  onUpdateSuccess
}) => {
  const [task, setTask] = useState<Task | null>(null)
  const [newDueDate, setNewDueDate] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isUpdating, setIsUpdating] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [hasDependencies, setHasDependencies] = useState<boolean>(false)
  const [isCheckingDependencies, setIsCheckingDependencies] = useState<boolean>(true)

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
          t.start_date, t.due_date, t.task_type, t.created_at, t.estimated_hours,
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
        setNewDueDate(taskData.due_date || '')
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

  const handleUpdateDeadline = async () => {
    if (!task || !newDueDate) {
      toast.error('Please select a new due date')
      return
    }

    if (newDueDate === task.due_date) {
      toast.error('Please select a different date')
      return
    }

    setIsUpdating(true)
    try {
      const query = `
        UPDATE ddb.tasks
        SET due_date = '${newDueDate}'
        WHERE id = ${task.id}
      `

      console.log('📝 Deadline Update Query:', query)
      await queryExecutor.executeQuery(query)

      toast.success('Task deadline updated successfully!')

      // Reload task to show updated info
      await loadTask()

      // Call callback if provided
      if (onUpdateSuccess) {
        onUpdateSuccess(task.id, newDueDate)
      }
    } catch (e) {
      console.error('Error updating deadline:', e)
      toast.error('Failed to update deadline')
    }
    setIsUpdating(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-[#feebc8]', text: 'text-[#c05621]', icon: 'mdi:clock-outline' }
      case 'in_progress':
        return { bg: 'bg-[#bee3f8]', text: 'text-[#2c5282]', icon: 'mdi:progress-clock' }
      case 'completed':
        return { bg: 'bg-[#c6f6d5]', text: 'text-[#22543d]', icon: 'mdi:check-circle' }
      case 'on_hold':
        return { bg: 'bg-[#fed7d7]', text: 'text-[#742a2a]', icon: 'mdi:pause-circle' }
      default:
        return { bg: 'bg-[#e2e8f0]', text: 'text-[#718096]', icon: 'mdi:help-circle' }
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
      month: 'long',
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

  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
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
            <h2 className="text-2xl font-bold text-[#fc8181]">Task Deadline Update Blocked</h2>
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
                <span className="font-semibold">This task deadline cannot be updated</span> due to existing dependencies in other tables. Please clear all dependencies first to proceed.
              </p>
            </div>
          </div>
        </div>
        <TaskDependencyChecker taskId={taskId} onClearComplete={handleDependenciesCleared} />
      </div>
    )
  }

  const statusInfo = getStatusColor(task.status)
  const priorityInfo = getPriorityColor(task.priority)
  const daysUntilDue = getDaysUntilDue(task.due_date)
  const daysUntilNew = getDaysUntilDue(newDueDate)

  return (
    <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 pb-6 border-b border-[#e2e8f0]">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-[#718096]">Task #{task.id}</span>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-[6px] text-xs font-semibold ${statusInfo.bg} ${statusInfo.text}`}>
              <Icon icon={statusInfo.icon} width={14} height={14} />
              {task.status.replace('_', ' ').toUpperCase()}
            </span>
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
            <Icon icon="mdi:calendar-start" width={14} height={14} />
            <span>Start Date</span>
          </div>
          <div className="text-[#2d3748] font-semibold text-sm">
            {formatDate(task.start_date)}
          </div>
        </div>
      </div>

      {/* Current Deadline */}
      <div className="bg-gradient-to-br from-[#ff6b9d] to-[#e85a8a] rounded-[16px] p-6 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-[10px] flex items-center justify-center">
            <Icon icon="mdi:calendar-alert" width={24} height={24} />
          </div>
          <div className="flex-1">
            <div className="text-sm text-white text-opacity-90 mb-1">Current Deadline</div>
            <div className="font-bold text-xl text-white">
              {formatDate(task.due_date)}
            </div>
          </div>
        </div>
        {daysUntilDue !== null && (
          <div className="bg-white bg-opacity-15 rounded-[10px] p-3 backdrop-blur-sm border border-white border-opacity-20">
            <div className="flex items-center gap-2">
              <Icon
                icon={daysUntilDue < 0 ? 'mdi:alert-circle' : daysUntilDue <= 3 ? 'mdi:clock-alert' : 'mdi:information'}
                width={20}
                height={20}
                
              />
              <span className="font-semibold">
                {daysUntilDue < 0
                  ? `${Math.abs(daysUntilDue)} days overdue`
                  : daysUntilDue === 0
                  ? 'Due today!'
                  : `${daysUntilDue} days remaining`
                }
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Update Deadline Form */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[#a7a9ad] font-semibold">
          <Icon icon="mdi:calendar-edit" width={20} height={20} className="text-[#6b8cce]" />
          <span>Update Deadline</span>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#4a5568]">
            New Due Date
          </label>
          <input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            min={getMinDate()}
            className="w-full px-4 py-3 bg-[#f8f9fb] border border-[#e2e8f0] rounded-[10px] text-[#2d3748] focus:outline-none focus:border-[#6b8cce] focus:ring-2 focus:ring-[#6b8cce] focus:ring-opacity-20 transition-all duration-200"
          />
          {newDueDate && newDueDate !== task.due_date && daysUntilNew !== null && (
            <p className="text-xs text-[#718096] flex items-center gap-1">
              <Icon icon="mdi:information" width={14} height={14} />
              New deadline: {formatDate(newDueDate)}
              <span className={daysUntilNew < 0 ? 'text-[#c53030]' : 'text-[#48bb78]'}>
                ({daysUntilNew < 0 ? `${Math.abs(daysUntilNew)}d overdue` : `${daysUntilNew}d from now`})
              </span>
            </p>
          )}
        </div>

        <button
          onClick={handleUpdateDeadline}
          disabled={isUpdating || !newDueDate || newDueDate === task.due_date}
          className="w-full bg-[#6b8cce] text-white px-6 py-3 rounded-[10px] font-semibold text-sm shadow-[0_2px_8px_rgba(107,140,206,0.25)] hover:bg-[#5a7ab8] hover:shadow-[0_4px_12px_rgba(107,140,206,0.3)] transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
        >
          {isUpdating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Updating...</span>
            </>
          ) : (
            <>
              <Icon icon="mdi:calendar-check" width={20} height={20} />
              <span>Update Deadline</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default TaskDeadlineUpdateCard