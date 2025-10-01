import React, { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import toast from 'react-hot-toast'
import { queryExecutor } from '../query'

interface ReassignTaskProps {
  theme?: string
}

const ReassignTask: React.FC<ReassignTaskProps> = ({ theme = 'modern' }) => {
  const [tasks, setTasks] = useState<Array<any>>([])
  const [users, setUsers] = useState<Array<any>>([])
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [newAssignee, setNewAssignee] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false)
  const [isReassigning, setIsReassigning] = useState<boolean>(false)

  useEffect(() => {
    loadTasks()
    loadUsers()
  }, [])

  const loadTasks = async () => {
    setIsLoading(true)
    try {
      const result = await queryExecutor.executeQuery(`
        SELECT
          t.id, t.title, t.status, t.priority, t.due_date, t.created_at, t.assigned_to,
          u.full_name as assigned_to_name,
          u2.full_name as assigned_by_name
        FROM ddb.tasks t
        LEFT JOIN ddb.users u ON t.assigned_to = u.id
        LEFT JOIN ddb.users u2 ON t.assigned_by = u2.id
        WHERE t.status IN ('pending', 'in_progress', 'on_hold')
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
        setNewAssignee(result.data[0].assigned_to?.toString() || '')
      }
    } catch (e) {
      console.error('Error loading tasks:', e)
      setTasks([])
    }
    setIsLoading(false)
  }

  const loadUsers = async () => {
    setIsLoadingUsers(true)
    try {
      const result = await queryExecutor.executeQuery('SELECT id, full_name, role FROM ddb.users ORDER BY full_name')
      setUsers(result.data)
    } catch (e) {
      console.error('Error loading users:', e)
      setUsers([])
    }
    setIsLoadingUsers(false)
  }

  const handleSelectTask = (task: any) => {
    setSelectedTask(task)
    setNewAssignee(task.assigned_to?.toString() || '')
  }

  const handleReassign = async () => {
    if (!selectedTask || !newAssignee) return

    setIsReassigning(true)
    try {
      const newUser = users.find(u => u.id.toString() === newAssignee)

      console.log('Reassigning task:', {
        task_id: selectedTask.id,
        old_assignee: selectedTask.assigned_to_name,
        new_assignee: newUser?.full_name
      })

      // Build UPDATE query
      const query = `UPDATE ddb.tasks SET assigned_to = ${newAssignee} WHERE id = ${selectedTask.id}`

      console.log('📝 SQL Query:', query)

      await queryExecutor.executeQuery(query)

      toast.success(`Task reassigned to ${newUser?.full_name}!`)
      loadTasks()
    } catch (e) {
      console.error('Error reassigning task:', e)
      toast.error('Failed to reassign task')
    }
    setIsReassigning(false)
  }

  const getDaysUntilDue = (dueDate: string) => {
    if (!dueDate) return null
    const now = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - now.getTime()
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return days
  }

  const getDaysSinceCreated = (createdAt: string) => {
    if (!createdAt) return null
    const now = new Date()
    const created = new Date(createdAt)
    const diffTime = now.getTime() - created.getTime()
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return days
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-[#e2e8f0]', text: 'text-[#718096]' }
      case 'in_progress':
        return { bg: 'bg-[#bee3f8]', text: 'text-[#2c5282]' }
      case 'on_hold':
        return { bg: 'bg-[#feebc8]', text: 'text-[#7c2d12]' }
      default:
        return { bg: 'bg-[#e2e8f0]', text: 'text-[#718096]' }
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
          <p className="text-[#2d3748] font-semibold mb-2">All tasks assigned!</p>
          <p className="text-[#718096]">No tasks need reassignment</p>
        </div>
      </div>
    )
  }

  const daysUntilDue = getDaysUntilDue(selectedTask.due_date)
  const daysSinceCreated = getDaysSinceCreated(selectedTask.created_at)
  const statusColors = getStatusColor(selectedTask.status)
  const priorityInfo = getPriorityIcon(selectedTask.priority)

  return (
    <div className="min-h-screen bg-[#d4dce6] p-8">
      {/* Header */}
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[#6b8cce] bg-opacity-10 rounded-[12px] flex items-center justify-center flex-shrink-0">
            <Icon icon="mdi:account-switch" width={28} height={28} className="text-[#6b8cce]" />
          </div>
          <div className="flex-1">
            <h1 className="text-[1.75rem] font-bold text-[#2d3748] mb-2">
              Task Reassignment
            </h1>
            <p className="text-[#718096] text-base">
              {tasks.length} task{tasks.length !== 1 ? 's' : ''} available for reassignment
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
            <h2 className="text-lg font-semibold text-[#2d3748] mb-4">Tasks</h2>
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
                    <div className="text-xs text-[#718096] mb-2">
                      Assigned to: {task.assigned_to_name || 'Unassigned'}
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
                <div className="space-y-2 text-white text-opacity-90 text-sm">
                  <div className="flex items-center gap-2">
                    <Icon icon="mdi:account" width={16} height={16} />
                    <span>Currently assigned to: {selectedTask.assigned_to_name || 'Unassigned'}</span>
                  </div>
                  {selectedTask.assigned_by_name && (
                    <div className="flex items-center gap-2">
                      <Icon icon="mdi:account-arrow-right" width={16} height={16} />
                      <span>Assigned by: {selectedTask.assigned_by_name}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon={priorityInfo.icon} width={24} height={24} />
                <span className="font-semibold">{selectedTask.priority.toUpperCase()}</span>
              </div>
            </div>

            {/* Time Information */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-black">
              {daysSinceCreated !== null && (
                <div className="bg-white bg-opacity-10 rounded-[12px] p-4 backdrop-blur-sm">
                  <div className="text-opacity-70 text-xs mb-1">Task Age</div>
                  <div className="font-semibold text-lg">
                    {daysSinceCreated === 0
                      ? 'Created today'
                      : `${daysSinceCreated} day${daysSinceCreated !== 1 ? 's' : ''} old`
                    }
                  </div>
                </div>
              )}
              {daysUntilDue !== null && (
                <div className="bg-white bg-opacity-10 rounded-[12px] p-4 backdrop-blur-sm">
                  <div className="text-opacity-70 text-xs mb-1">Deadline Status</div>
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
                    selectedTask.status === 'pending' && daysSinceCreated && daysSinceCreated > 7
                      ? 'mdi:alert-circle'
                      : daysUntilDue !== null && daysUntilDue < 0
                      ? 'mdi:clock-alert'
                      : selectedTask.status === 'on_hold'
                      ? 'mdi:pause-circle'
                      : 'mdi:information'
                  }
                  width={24}
                  height={24}
                  className="flex-shrink-0 mt-0.5"
                />
                <div>
                  <div className="font-semibold text-sm mb-1">
                    {selectedTask.status === 'pending' && daysSinceCreated && daysSinceCreated > 7
                      ? `⚠️ Task has been pending for ${daysSinceCreated} days - might need reassignment`
                      : selectedTask.status === 'on_hold'
                      ? '⏸️ Task is on hold - consider reassigning to move forward'
                      : daysUntilDue !== null && daysUntilDue < 0
                      ? `🔴 Task is ${Math.abs(daysUntilDue)} days overdue - urgent reassignment may help`
                      : selectedTask.status === 'pending'
                      ? '📋 Task is still pending - assign to the right person to get started'
                      : '🔄 Task in progress - reassign if current assignee is unavailable'
                    }
                  </div>
                  {daysUntilDue !== null && daysUntilDue < 0 && selectedTask.status === 'pending' && (
                    <div className="text-xs text-white text-opacity-80 mt-1">
                      This task was created {daysSinceCreated} days ago but hasn't been started yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Reassignment Form */}
          <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8">
            <h3 className="text-xl font-semibold text-[#2d3748] mb-6 flex items-center gap-2">
              <Icon icon="mdi:account-arrow-right" width={24} height={24} className="text-[#6b8cce]" />
              Reassign Task
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#4a5568]">
                  Select New Assignee
                </label>
                <select
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
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
                  <p className="text-xs text-[#718096]">Loading users...</p>
                )}
              </div>

              <button
                onClick={handleReassign}
                disabled={isReassigning || !newAssignee || newAssignee === selectedTask.assigned_to?.toString()}
                className="w-full bg-[#6b8cce] text-white px-6 py-3 rounded-[10px] font-semibold text-sm shadow-[0_2px_8px_rgba(107,140,206,0.25)] hover:bg-[#5a7ab8] transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
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
        </div>
      </div>
    </div>
  )
}

export default ReassignTask