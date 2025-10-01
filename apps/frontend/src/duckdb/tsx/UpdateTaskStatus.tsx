import React, { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import toast from 'react-hot-toast'
import { queryExecutor } from '../query'

interface UpdateTaskStatusProps {
  theme?: string
}

const UpdateTaskStatus: React.FC<UpdateTaskStatusProps> = ({ theme = 'modern' }) => {
  const [tasks, setTasks] = useState<Array<any>>([])
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [newStatus, setNewStatus] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isUpdating, setIsUpdating] = useState<boolean>(false)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    setIsLoading(true)
    try {
      const result = await queryExecutor.executeQuery(`
        SELECT
          t.id, t.title, t.status, t.priority, t.start_date, t.due_date, t.estimated_hours, t.created_at,
          u.full_name as assigned_to_name
        FROM ddb.tasks t
        LEFT JOIN ddb.users u ON t.assigned_to = u.id
        WHERE t.status IN ('pending', 'in_progress')
        ORDER BY
          CASE t.priority
            WHEN 'critical' THEN 1
            WHEN 'high' THEN 2
            WHEN 'medium' THEN 3
            ELSE 4
          END,
          t.due_date ASC
        LIMIT 50
      `)
      setTasks(result.data)
      if (result.data.length > 0) {
        setSelectedTask(result.data[0])
        setNewStatus(result.data[0].status)
      }
    } catch (e) {
      console.error('Error loading tasks:', e)
      setTasks([])
    }
    setIsLoading(false)
  }

  const handleSelectTask = (task: any) => {
    setSelectedTask(task)
    setNewStatus(task.status)
  }

  const handleUpdateStatus = async () => {
    if (!selectedTask) return

    setIsUpdating(true)
    try {
      console.log('Updating task status:', {
        task_id: selectedTask.id,
        old_status: selectedTask.status,
        new_status: newStatus
      })

      // Build UPDATE query
      const query = `UPDATE ddb.tasks SET status = '${newStatus}' WHERE id = ${selectedTask.id}`

      console.log('📝 SQL Query:', query)

      await queryExecutor.executeQuery(query)

      toast.success(`Task status updated to ${newStatus.replace('_', ' ')}!`)
      loadTasks()
    } catch (e) {
      console.error('Error updating status:', e)
      toast.error('Failed to update task status')
    }
    setIsUpdating(false)
  }

  const getHoursFromStart = (startDate: string) => {
    if (!startDate) return null
    const now = new Date()
    const start = new Date(startDate)
    const diffTime = now.getTime() - start.getTime()
    const hours = Math.floor(diffTime / (1000 * 60 * 60))
    return hours
  }

  const getDaysUntilDue = (dueDate: string) => {
    if (!dueDate) return null
    const now = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - now.getTime()
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return days
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-[#e2e8f0]', text: 'text-[#718096]', border: 'border-[#cbd5e0]' }
      case 'in_progress':
        return { bg: 'bg-[#bee3f8]', text: 'text-[#2c5282]', border: 'border-[#90cdf4]' }
      case 'completed':
        return { bg: 'bg-[#c6f6d5]', text: 'text-[#22543d]', border: 'border-[#9ae6b4]' }
      case 'on_hold':
        return { bg: 'bg-[#feebc8]', text: 'text-[#7c2d12]', border: 'border-[#fbd38d]' }
      default:
        return { bg: 'bg-[#e2e8f0]', text: 'text-[#718096]', border: 'border-[#cbd5e0]' }
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return { icon: 'mdi:fire', color: 'text-[#c53030]' }
      case 'high':
        return { icon: 'mdi:arrow-up-bold', color: 'text-[#dd6b20]' }
      case 'medium':
        return { icon: 'mdi:minus', color: 'text-[#d69e2e]' }
      default:
        return { icon: 'mdi:arrow-down', color: 'text-[#718096]' }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#d4dce6] p-8 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#6b8cce] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#718096]">Loading tasks...</span>
        </div>
      </div>
    )
  }

  if (!selectedTask) {
    return (
      <div className="min-h-screen bg-[#d4dce6] p-8">
        <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 text-center">
          <Icon icon="mdi:checkbox-marked-circle" width={64} height={64} className="mx-auto mb-4 text-[#48bb78]" />
          <p className="text-[#2d3748] font-semibold mb-2">All caught up!</p>
          <p className="text-[#718096]">No pending or in-progress tasks found</p>
        </div>
      </div>
    )
  }

  const hoursFromStart = getHoursFromStart(selectedTask.start_date)
  const daysUntilDue = getDaysUntilDue(selectedTask.due_date)
  const statusColors = getStatusColor(selectedTask.status)
  const priorityInfo = getPriorityIcon(selectedTask.priority)

  return (
    <div className="min-h-screen bg-[#d4dce6] p-8">
      {/* Header */}
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[#6b8cce] bg-opacity-10 rounded-[12px] flex items-center justify-center flex-shrink-0">
            <Icon icon="mdi:check-circle" width={28} height={28} className="text-[#6b8cce]" />
          </div>
          <div className="flex-1">
            <h1 className="text-[1.75rem] font-bold text-[#2d3748] mb-2">
              Task Status Management
            </h1>
            <p className="text-[#718096] text-base">
              {tasks.length} task{tasks.length !== 1 ? 's' : ''} in progress or pending
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
            <h2 className="text-lg font-semibold text-[#2d3748] mb-4">Active Tasks</h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {tasks.map((task) => {
                const colors = getStatusColor(task.status)
                const priority = getPriorityIcon(task.priority)
                return (
                  <button
                    key={task.id}
                    onClick={() => handleSelectTask(task)}
                    className={`w-full text-left p-4 rounded-[12px] border-2 transition-all duration-200 ${
                      selectedTask?.id === task.id
                        ? 'border-[#6b8cce] bg-[#6b8cce] bg-opacity-5'
                        : 'border-[#e2e8f0] hover:border-[#6b8cce] hover:bg-[#f8f9fb]'
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <Icon icon={priority.icon} width={16} height={16} className={priority.color} />
                      <div className="font-medium text-[#2d3748] text-sm flex-1">{task.title}</div>
                    </div>
                    <div className={`inline-block px-2 py-1 rounded-[6px] text-xs font-medium ${colors.bg} ${colors.text}`}>
                      {task.status.replace('_', ' ')}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Context Card */}
          <div className="bg-gradient-to-br from-[#6b8cce] to-[#5a7ab8] rounded-[20px] shadow-[0_4px_16px_rgba(107,140,206,0.3)] p-8 text-white">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3">{selectedTask.title}</h2>
                <div className="flex items-center gap-2 text-white text-opacity-90 text-sm">
                  <Icon icon="mdi:account" width={16} height={16} />
                  <span>Assigned to: {selectedTask.assigned_to_name || 'Unassigned'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon={priorityInfo.icon} width={24} height={24} />
                <span className="font-semibold">{selectedTask.priority.toUpperCase()}</span>
              </div>
            </div>

            {/* Time Information */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-black">
              {hoursFromStart !== null && hoursFromStart > 0 && (
                <div className="bg-white bg-opacity-10 rounded-[12px] p-4 backdrop-blur-sm">
                  <div className="text-opacity-70 text-xs mb-1">Time Since Start</div>
                  <div className="font-semibold text-lg">
                    {hoursFromStart < 24
                      ? `${hoursFromStart} hour${hoursFromStart !== 1 ? 's' : ''} ago`
                      : `${Math.floor(hoursFromStart / 24)} day${Math.floor(hoursFromStart / 24) !== 1 ? 's' : ''} ago`
                    }
                  </div>
                </div>
              )}
              {daysUntilDue !== null && (
                <div className="bg-white bg-opacity-10 rounded-[12px] p-4 backdrop-blur-sm">
                  <div className="text-opacity-70 text-xs mb-1">Time Until Due</div>
                  <div className="font-semibold text-lg">
                    {daysUntilDue < 0
                      ? `${Math.abs(daysUntilDue)} days overdue`
                      : daysUntilDue === 0
                      ? 'Due today'
                      : `${daysUntilDue} days left`
                    }
                  </div>
                </div>
              )}
            </div>

            {/* Contextual Message */}
            <div className="bg-white bg-opacity-15 rounded-[12px] p-4 backdrop-blur-sm border border-white border-opacity-20 text-black">
              <div className="flex items-start gap-3">
                <Icon
                  icon={
                    selectedTask.status === 'pending' ? 'mdi:clock-alert' :
                    hoursFromStart && hoursFromStart > 24 ? 'mdi:progress-clock' :
                    'mdi:information'
                  }
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5"
                />
                <div>
                  <div className="font-semibold text-sm mb-1">
                    {selectedTask.status === 'pending'
                      ? '⏳ This task is still pending and needs to be started'
                      : hoursFromStart && hoursFromStart > 48
                      ? `🔄 Task has been in progress for ${Math.floor(hoursFromStart / 24)} days`
                      : hoursFromStart && hoursFromStart > 0
                      ? `⚡ Task started ${hoursFromStart} hours ago`
                      : '📋 Track your progress by updating the task status'
                    }
                  </div>
                  {selectedTask.estimated_hours && (
                    <div className="text-xs text-white text-opacity-80">
                      Estimated effort: {selectedTask.estimated_hours} hours
                    </div>
                  )}
                  {daysUntilDue !== null && daysUntilDue < 0 && (
                    <div className="text-xs text-white text-opacity-80 mt-1">
                      ⚠️ This task is overdue - consider updating status or extending deadline
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Status Update Form */}
          <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8">
            <h3 className="text-xl font-semibold text-[#2d3748] mb-6 flex items-center gap-2">
              <Icon icon="mdi:swap-horizontal" width={24} height={24} className="text-[#6b8cce]" />
              Update Task Status
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {['pending', 'in_progress', 'completed', 'on_hold'].map((status) => {
                  const colors = getStatusColor(status)
                  return (
                    <button
                      key={status}
                      onClick={() => setNewStatus(status)}
                      className={`p-4 rounded-[12px] border-2 transition-all duration-200 ${
                        newStatus === status
                          ? `${colors.border} ${colors.bg}`
                          : 'border-[#e2e8f0] hover:border-[#cbd5e0] bg-[#f8f9fb]'
                      }`}
                    >
                      <div className={`font-semibold text-sm capitalize ${newStatus === status ? colors.text : 'text-[#4a5568]'}`}>
                        {status.replace('_', ' ')}
                      </div>
                    </button>
                  )
                })}
              </div>

              <button
                onClick={handleUpdateStatus}
                disabled={isUpdating || newStatus === selectedTask.status}
                className="w-full bg-[#6b8cce] text-white px-6 py-3 rounded-[10px] font-semibold text-sm shadow-[0_2px_8px_rgba(107,140,206,0.25)] hover:bg-[#5a7ab8] transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:content-save" width={20} height={20} />
                    <span>Update Status</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UpdateTaskStatus