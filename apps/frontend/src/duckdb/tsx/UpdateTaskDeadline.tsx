import React, { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import toast from 'react-hot-toast'
import { queryExecutor } from '../query'

interface UpdateTaskDeadlineProps {
  theme?: string
}

const UpdateTaskDeadline: React.FC<UpdateTaskDeadlineProps> = ({ theme = 'modern' }) => {
  const [tasks, setTasks] = useState<Array<any>>([])
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [newDeadline, setNewDeadline] = useState<string>('')
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
          t.id, t.title, t.status, t.priority, t.due_date, t.start_date, t.estimated_hours,
          u.full_name as assigned_to_name
        FROM ddb.tasks t
        LEFT JOIN ddb.users u ON t.assigned_to = u.id
        WHERE t.status IN ('pending', 'in_progress')
          AND t.due_date IS NOT NULL
        ORDER BY t.due_date ASC
        LIMIT 50
      `)

      // Filter to only show tasks that are overdue or close to deadline (within 7 days)
      const now = new Date()
      const filteredTasks = result.data.filter((task: any) => {
        if (!task.due_date) return false
        const deadline = new Date(task.due_date)
        const diffTime = deadline.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        // Show if overdue (negative) or within 7 days
        return diffDays <= 7
      })

      setTasks(filteredTasks)
      if (filteredTasks.length > 0) {
        setSelectedTask(filteredTasks[0])
        setNewDeadline(filteredTasks[0].due_date || '')
      }
    } catch (e) {
      console.error('Error loading tasks:', e)
      setTasks([])
    }
    setIsLoading(false)
  }

  const handleSelectTask = (task: any) => {
    setSelectedTask(task)
    setNewDeadline(task.due_date || '')
  }

  const handleUpdateDeadline = async () => {
    if (!selectedTask) return

    setIsUpdating(true)
    try {
      console.log('Updating task deadline:', {
        task_id: selectedTask.id,
        old_deadline: selectedTask.due_date,
        new_deadline: newDeadline
      })

      // Build UPDATE query
      const query = `UPDATE ddb.tasks SET due_date = '${newDeadline}' WHERE id = ${selectedTask.id}`

      console.log('📝 SQL Query:', query)

      await queryExecutor.executeQuery(query)

      toast.success(`Deadline updated for "${selectedTask.title}"!`)
      loadTasks()
    } catch (e) {
      console.error('Error updating deadline:', e)
      toast.error('Failed to update deadline')
    }
    setIsUpdating(false)
  }

  const getDaysUntilDeadline = (deadline: string) => {
    if (!deadline) return null
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getDeadlineStatus = (days: number | null) => {
    if (days === null) return { text: 'No deadline set', color: 'text-[#718096]', bg: 'bg-[#e2e8f0]' }
    if (days < 0) return { text: `${Math.abs(days)} days overdue`, color: 'text-[#c53030]', bg: 'bg-[#fed7d7]' }
    if (days === 0) return { text: 'Due today', color: 'text-[#dd6b20]', bg: 'bg-[#feebc8]' }
    if (days <= 3) return { text: `${days} days left`, color: 'text-[#dd6b20]', bg: 'bg-[#feebc8]' }
    if (days <= 7) return { text: `${days} days left`, color: 'text-[#d69e2e]', bg: 'bg-[#fefcbf]' }
    return { text: `${days} days left`, color: 'text-[#38a169]', bg: 'bg-[#c6f6d5]' }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-[#e2e8f0]', text: 'text-[#718096]' }
      case 'in_progress':
        return { bg: 'bg-[#bee3f8]', text: 'text-[#2c5282]' }
      default:
        return { bg: 'bg-[#e2e8f0]', text: 'text-[#718096]' }
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
          <Icon icon="mdi:check-circle-outline" width={64} height={64} className="mx-auto mb-4 text-[#48bb78]" />
          <p className="text-[#2d3748] font-semibold text-lg mb-2">All tasks are on track!</p>
          <p className="text-[#718096]">No tasks with approaching or overdue deadlines at the moment</p>
        </div>
      </div>
    )
  }

  const daysLeft = getDaysUntilDeadline(selectedTask.due_date)
  const deadlineStatus = getDeadlineStatus(daysLeft)
  const priorityInfo = getPriorityIcon(selectedTask.priority)
  const statusColors = getStatusColor(selectedTask.status)

  return (
    <div className="min-h-screen bg-[#d4dce6] p-8">
      {/* Header with Context */}
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[#6b8cce] bg-opacity-10 rounded-[12px] flex items-center justify-center flex-shrink-0">
            <Icon icon="mdi:calendar-alert" width={28} height={28} className="text-[#6b8cce]" />
          </div>
          <div className="flex-1">
            <h1 className="text-[1.75rem] font-bold text-[#2d3748] mb-2">
              Task Deadline Management
            </h1>
            <p className="text-[#718096] text-base">
              {tasks.length > 0
                ? `${tasks.length} task${tasks.length !== 1 ? 's' : ''} with approaching or overdue deadlines`
                : 'All tasks are on track!'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
            <h2 className="text-lg font-semibold text-[#2d3748] mb-4">Needs Attention</h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {tasks.map((task) => {
                const days = getDaysUntilDeadline(task.due_date)
                const status = getDeadlineStatus(days)
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
                    <div className="text-xs text-[#718096] mb-2">
                      {task.assigned_to_name || 'Unassigned'}
                    </div>
                    <div className={`inline-block px-2 py-1 rounded-[6px] text-xs font-medium ${status.bg} ${status.color}`}>
                      {status.text}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contextual Info Card */}
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

            <div className="grid grid-cols-2 gap-4 mb-6 text-black">
              <div className="bg-white bg-opacity-10 rounded-[12px] p-4 backdrop-blur-sm">
                <div className="text-opacity-70 text-xs mb-1">Current Status</div>
                <div className="font-semibold text-lg capitalize">{selectedTask.status.replace('_', ' ')}</div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-[12px] p-4 backdrop-blur-sm">
                <div className="text-opacity-70 text-xs mb-1">Current Deadline</div>
                <div className="font-semibold text-lg">
                  {selectedTask.due_date ? new Date(selectedTask.due_date).toLocaleDateString() : 'Not set'}
                </div>
              </div>
            </div>

            {selectedTask.estimated_hours && (
              <div className="bg-white bg-opacity-10 rounded-[12px] p-4 backdrop-blur-sm mb-6 text-black">
                <div className="text-opacity-70 text-xs mb-1">Estimated Effort</div>
                <div className="font-semibold text-lg">{selectedTask.estimated_hours} hours</div>
              </div>
            )}

            {daysLeft !== null && (
              <div className="bg-white bg-opacity-15 rounded-[12px] p-4 backdrop-blur-sm border border-white border-opacity-20 text-black">
                <div className="flex items-center gap-3">
                  <Icon
                    icon={daysLeft < 0 ? "mdi:alert-circle" : daysLeft <= 3 ? "mdi:clock-alert" : "mdi:information"}
                    width={24}
                    height={24}
                  />
                  <div>
                    <div className="font-semibold text-sm">
                      {daysLeft < 0
                        ? `⚠️ This task is ${Math.abs(daysLeft)} days overdue`
                        : daysLeft === 0
                        ? `🔥 This task is due today!`
                        : daysLeft <= 3
                        ? `⏰ Urgent! Only ${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`
                        : `⏳ ${daysLeft} day${daysLeft !== 1 ? 's' : ''} until deadline`
                      }
                    </div>
                    {daysLeft < 0 && selectedTask.status === 'pending' && (
                      <div className="text-xs text-white text-opacity-80 mt-1">
                        ⚠️ Task is overdue and hasn't been started yet
                      </div>
                    )}
                    {daysLeft < 0 && (
                      <div className="text-xs text-white text-opacity-80 mt-1">
                        Consider extending the deadline or updating the task status
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Update Deadline Form */}
          <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8">
            <h3 className="text-xl font-semibold text-[#2d3748] mb-6 flex items-center gap-2">
              <Icon icon="mdi:calendar-edit" width={24} height={24} className="text-[#6b8cce]" />
              Update Task Deadline
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#4a5568]">
                  New Due Date
                </label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f8f9fb] border border-[#e2e8f0] rounded-[10px] text-[#2d3748] focus:outline-none focus:border-[#6b8cce] focus:ring-2 focus:ring-[#6b8cce] focus:ring-opacity-20 transition-all duration-200"
                />
              </div>

              <button
                onClick={handleUpdateDeadline}
                disabled={isUpdating || !newDeadline || newDeadline === selectedTask.due_date}
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
                    <span>Update Deadline</span>
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

export default UpdateTaskDeadline