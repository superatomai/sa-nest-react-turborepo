import React, { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import toast from 'react-hot-toast'
import { queryExecutor } from '../query'

interface TaskReassignmentCardProps {
  taskId?: number
  theme?: string
  onReassignSuccess?: (taskId: number, newAssigneeId: number) => void
}

interface Task {
  id: number
  title: string
  description: string
  status: string
  priority: string
  assigned_to: number | null
  assigned_by: number | null
  assigned_to_name: string | null
  assigned_by_name: string | null
  estimated_hours: number | null
  start_date: string | null
  due_date: string | null
  task_type: string
  created_at: string
}

interface User {
  id: number
  full_name: string
  role: string
  email: string
}

const TaskReassignmentCard: React.FC<TaskReassignmentCardProps> = ({
  taskId = 10,
  theme = 'modern',
  onReassignSuccess
}) => {
  const [task, setTask] = useState<Task | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false)
  const [isReassigning, setIsReassigning] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTask()
    loadUsers()
  }, [taskId])

  const loadTask = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await queryExecutor.executeQuery(`
        SELECT
          t.id, t.title, t.description, t.status, t.priority,
          t.assigned_to, t.assigned_by, t.estimated_hours,
          t.start_date, t.due_date, t.task_type, t.created_at,
          u1.full_name as assigned_to_name,
          u2.full_name as assigned_by_name
        FROM ddb.tasks t
        LEFT JOIN ddb.users u1 ON t.assigned_to = u1.id
        LEFT JOIN ddb.users u2 ON t.assigned_by = u2.id
        WHERE t.id = ${taskId}
      `)

      if (result.data.length === 0) {
        setError(`Task with ID ${taskId} not found`)
        setTask(null)
      } else {
        const taskData = result.data[0]
        setTask(taskData)
        setSelectedUserId(taskData.assigned_to?.toString() || '')
      }
    } catch (e) {
      console.error('Error loading task:', e)
      setError('Failed to load task')
      setTask(null)
    }
    setIsLoading(false)
  }

  const loadUsers = async () => {
    setIsLoadingUsers(true)
    try {
      const result = await queryExecutor.executeQuery(`
        SELECT id, full_name, role, email
        FROM ddb.users
        ORDER BY full_name
      `)
      setUsers(result.data)
    } catch (e) {
      console.error('Error loading users:', e)
      setUsers([])
    }
    setIsLoadingUsers(false)
  }

  const handleReassign = async () => {
    if (!task || !selectedUserId) {
      toast.error('Please select a user')
      return
    }

    if (selectedUserId === task.assigned_to?.toString()) {
      toast.error('Task is already assigned to this user')
      return
    }

    setIsReassigning(true)
    try {
      const newUser = users.find(u => u.id.toString() === selectedUserId)

      const query = `
        UPDATE ddb.tasks
        SET assigned_to = ${selectedUserId}
        WHERE id = ${task.id}
      `

      console.log('📝 Reassignment Query:', query)
      await queryExecutor.executeQuery(query)

      toast.success(`Task reassigned to ${newUser?.full_name || 'selected user'}!`)

      // Reload task to show updated info
      await loadTask()

      // Call callback if provided
      if (onReassignSuccess && newUser) {
        onReassignSuccess(task.id, newUser.id)
      }
    } catch (e) {
      console.error('Error reassigning task:', e)
      toast.error('Failed to reassign task')
    }
    setIsReassigning(false)
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8">
        <div className="flex items-center justify-center gap-3 py-12">
          <div className="w-6 h-6 border-2 border-[#6b8cce] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#718096]">Loading task...</span>
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

  const statusInfo = getStatusColor(task.status)
  const priorityInfo = getPriorityColor(task.priority)
  const daysUntilDue = getDaysUntilDue(task.due_date)

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
          </div>
          <h2 className="text-2xl font-bold text-[#2d3748] mb-2">{task.title}</h2>
          {task.description && (
            <p className="text-[#718096] text-sm leading-relaxed">{task.description}</p>
          )}
        </div>
      </div>

      {/* Task Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Priority */}
        <div className="bg-[#f8f9fb] rounded-[12px] p-4">
          <div className="flex items-center gap-2 text-[#718096] text-xs mb-2">
            <Icon icon="mdi:flag" width={14} height={14} />
            <span>Priority</span>
          </div>
          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-[6px] text-sm font-semibold ${priorityInfo.bg} ${priorityInfo.text}`}>
            <Icon icon={priorityInfo.icon} width={16} height={16} />
            {task.priority.toUpperCase()}
          </div>
        </div>

        {/* Type */}
        <div className="bg-[#f8f9fb] rounded-[12px] p-4">
          <div className="flex items-center gap-2 text-[#718096] text-xs mb-2">
            <Icon icon="mdi:tag" width={14} height={14} />
            <span>Type</span>
          </div>
          <div className="text-[#2d3748] font-semibold">
            {task.task_type.replace('_', ' ').charAt(0).toUpperCase() + task.task_type.slice(1)}
          </div>
        </div>

        {/* Start Date */}
        <div className="bg-[#f8f9fb] rounded-[12px] p-4">
          <div className="flex items-center gap-2 text-[#718096] text-xs mb-2">
            <Icon icon="mdi:calendar-start" width={14} height={14} />
            <span>Start Date</span>
          </div>
          <div className="text-[#2d3748] font-semibold text-sm">
            {formatDate(task.start_date)}
          </div>
        </div>

        {/* Due Date */}
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

        {/* Estimated Hours */}
        {task.estimated_hours && (
          <div className="bg-[#f8f9fb] rounded-[12px] p-4">
            <div className="flex items-center gap-2 text-[#718096] text-xs mb-2">
              <Icon icon="mdi:clock-outline" width={14} height={14} />
              <span>Estimated Hours</span>
            </div>
            <div className="text-[#2d3748] font-semibold">
              {task.estimated_hours}h
            </div>
          </div>
        )}

        {/* Created At */}
        <div className="bg-[#f8f9fb] rounded-[12px] p-4">
          <div className="flex items-center gap-2 text-[#718096] text-xs mb-2">
            <Icon icon="mdi:calendar-plus" width={14} height={14} />
            <span>Created</span>
          </div>
          <div className="text-[#2d3748] font-semibold text-sm">
            {formatDate(task.created_at)}
          </div>
        </div>
      </div>

      {/* Current Assignment Info */}
      <div className="bg-gradient-to-br from-[#6b8cce] to-[#5a7ab8] rounded-[16px] p-6 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-[10px] flex items-center justify-center">
            <Icon icon="mdi:account" width={24} height={24} />
          </div>
          <div className="flex-1">
            <div className="text-sm text-white text-opacity-90 mb-1">Currently Assigned To</div>
            <div className="font-semibold text-lg text-white">
              {task.assigned_to_name || 'Unassigned'}
            </div>
          </div>
        </div>
        {task.assigned_by_name && (
          <div className="flex items-center gap-2 text-sm text-white">
            <Icon icon="mdi:account-arrow-right" width={16} height={16} className="text-white" />
            <span className="text-white">Assigned by: {task.assigned_by_name}</span>
          </div>
        )}
      </div>

      {/* Reassignment Form */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[#2d3748] font-semibold">
          <Icon icon="mdi:account-switch" width={20} height={20} className="text-[#6b8cce]" />
          <span>Reassign Task</span>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#4a5568]">
            Select New Assignee
          </label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            disabled={isLoadingUsers}
            className="w-full px-4 py-3 bg-[#f8f9fb] border border-[#e2e8f0] rounded-[10px] text-[#2d3748] focus:outline-none focus:border-[#6b8cce] focus:ring-2 focus:ring-[#6b8cce] focus:ring-opacity-20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select a user</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.full_name} ({user.role})
              </option>
            ))}
          </select>
          {isLoadingUsers && (
            <p className="text-xs text-[#718096] flex items-center gap-2">
              <div className="w-3 h-3 border border-[#718096] border-t-transparent rounded-full animate-spin" />
              Loading users...
            </p>
          )}
        </div>

        <button
          onClick={handleReassign}
          disabled={isReassigning || !selectedUserId || selectedUserId === task.assigned_to?.toString()}
          className="w-full bg-[#6b8cce] text-white px-6 py-3 rounded-[10px] font-semibold text-sm shadow-[0_2px_8px_rgba(107,140,206,0.25)] hover:bg-[#5a7ab8] hover:shadow-[0_4px_12px_rgba(107,140,206,0.3)] transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
        >
          {isReassigning ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Reassigning...</span>
            </>
          ) : (
            <>
              <Icon icon="mdi:account-switch" width={20} height={20} />
              <span>Reassign Task</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default TaskReassignmentCard