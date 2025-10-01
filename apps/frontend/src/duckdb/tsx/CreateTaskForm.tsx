import React, { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import toast from 'react-hot-toast'
import { queryExecutor } from '../query'

interface CreateTaskFormProps {
  theme?: string
}

interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  assigned_to: string
  estimated_hours: number | null
  start_date: string
  due_date: string
  task_type: string
  requires_compliance_check: boolean
  is_blocking: boolean
  created_at: string
}

const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ theme = 'modern' }) => {
  // Form fields
  const [milestoneId, setMilestoneId] = useState<string>('')
  const [parentTaskId, setParentTaskId] = useState<string>('')
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [status, setStatus] = useState<string>('pending')
  const [priority, setPriority] = useState<string>('medium')
  const [assignedTo, setAssignedTo] = useState<string>('')
  const [assignedBy, setAssignedBy] = useState<string>('')
  const [estimatedHours, setEstimatedHours] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [dueDate, setDueDate] = useState<string>('')
  const [taskType, setTaskType] = useState<string>('feature')
  const [requiresComplianceCheck, setRequiresComplianceCheck] = useState<boolean>(false)
  const [isBlocking, setIsBlocking] = useState<boolean>(false)

  // Dropdown data
  const [users, setUsers] = useState<Array<{ id: number; full_name: string }>>([])
  const [milestones, setMilestones] = useState<Array<{ id: number; name: string }>>([])
  const [parentTasks, setParentTasks] = useState<Array<{ id: number; title: string }>>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false)
  const [isLoadingMilestones, setIsLoadingMilestones] = useState<boolean>(false)
  const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(false)

  useEffect(() => {
    loadUsers()
    loadMilestones()
    loadParentTasks()
  }, [])

  const loadUsers = async () => {
    setIsLoadingUsers(true)
    try {
      const result = await queryExecutor.executeQuery('SELECT id, full_name FROM ddb.users ORDER BY full_name')
      setUsers(result.data)
    } catch (e) {
      console.error('Error loading users:', e)
      setUsers([])
    }
    setIsLoadingUsers(false)
  }

  const loadMilestones = async () => {
    setIsLoadingMilestones(true)
    try {
      const result = await queryExecutor.executeQuery('SELECT id, name FROM ddb.milestones ORDER BY name')
      setMilestones(result.data)
    } catch (e) {
      console.error('Error loading milestones:', e)
      setMilestones([])
    }
    setIsLoadingMilestones(false)
  }

  const loadParentTasks = async () => {
    setIsLoadingTasks(true)
    try {
      const result = await queryExecutor.executeQuery('SELECT id, title FROM ddb.tasks ORDER BY title LIMIT 100')
      setParentTasks(result.data)
    } catch (e) {
      console.error('Error loading parent tasks:', e)
      setParentTasks([])
    }
    setIsLoadingTasks(false)
  }

  const handleSubmit = async () => {
    try {
      if (!title.trim()) {
        toast.error('Please enter a task title')
        return
      }

      // Get the next available ID
      const maxIdResult = await queryExecutor.executeQuery('SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM ddb.tasks')
      const nextId = maxIdResult.data[0]?.next_id || 1

      const newTask = {
        id: nextId,
        milestone_id: milestoneId ? parseInt(milestoneId) : null,
        parent_task_id: parentTaskId ? parseInt(parentTaskId) : null,
        title,
        description,
        status,
        priority,
        assigned_to: assignedTo ? parseInt(assignedTo) : null,
        assigned_by: assignedBy ? parseInt(assignedBy) : null,
        estimated_hours: estimatedHours ? parseFloat(estimatedHours) : null,
        start_date: startDate,
        due_date: dueDate,
        task_type: taskType,
        requires_compliance_check: requiresComplianceCheck,
        is_blocking: isBlocking,
        created_at: new Date().toISOString()
      }

      console.log('Task created:', newTask)

      // Build INSERT query
      const timestamp = new Date().toISOString()
      const query = `
        INSERT INTO ddb.tasks (
          id, milestone_id, parent_task_id, title, description, status, priority,
          assigned_to, assigned_by, estimated_hours, start_date, due_date,
          task_type, requires_compliance_check, is_blocking, created_at, updated_at
        ) VALUES (
          ${nextId},
          ${milestoneId ? parseInt(milestoneId) : 'NULL'},
          ${parentTaskId ? parseInt(parentTaskId) : 'NULL'},
          '${title.replace(/'/g, "''")}',
          '${description.replace(/'/g, "''")}',
          '${status}',
          '${priority}',
          ${assignedTo ? parseInt(assignedTo) : 'NULL'},
          ${assignedBy ? parseInt(assignedBy) : 'NULL'},
          ${estimatedHours ? parseFloat(estimatedHours) : 'NULL'},
          ${startDate ? `'${startDate}'` : 'NULL'},
          ${dueDate ? `'${dueDate}'` : 'NULL'},
          '${taskType}',
          ${requiresComplianceCheck},
          ${isBlocking},
          '${timestamp}',
          '${timestamp}'
        )
      `

      console.log('📝 SQL Query:', query)

      await queryExecutor.executeQuery(query)

      toast.success('Task created successfully!')
      handleClearForm()
    } catch (e) {
      console.error('Error creating task:', e)
      toast.error('Failed to create task. Please try again.')
    }
  }

  const handleClearForm = () => {
    setMilestoneId('')
    setParentTaskId('')
    setTitle('')
    setDescription('')
    setStatus('pending')
    setPriority('medium')
    setAssignedTo('')
    setAssignedBy('')
    setEstimatedHours('')
    setStartDate('')
    setDueDate('')
    setTaskType('feature')
    setRequiresComplianceCheck(false)
    setIsBlocking(false)
  }

  return (
    <div className="min-h-screen bg-[#d4dce6] p-8">
      {/* Header */}
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 mb-6">
        <h1 className="text-[2rem] font-bold text-[#2d3748] flex items-center gap-3 mb-2">
          <Icon icon="mdi:plus-circle" width={36} height={36} className="text-[#6bcf7f]" />
          <span>Create New Task</span>
        </h1>
        <p className="text-[#718096] text-base">
          Fill out the form below to create a new project task
        </p>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 mb-6">
        <div className="space-y-6">
          {/* Title Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#4a5568]">
              Task Title *
            </label>
            <input
              type="text"
              placeholder="Enter task title..."
              className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-[10px] text-[#2d3748] placeholder-[#a0aec0] focus:outline-none focus:border-[#6b8cce] focus:ring-2 focus:ring-[#6b8cce] focus:ring-opacity-20 transition-all duration-200"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#4a5568]">
              Description
            </label>
            <textarea
              placeholder="Enter task description..."
              rows={4}
              className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-[10px] text-[#2d3748] placeholder-[#a0aec0] focus:outline-none focus:border-[#6b8cce] focus:ring-2 focus:ring-[#6b8cce] focus:ring-opacity-20 transition-all duration-200 resize-vertical"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Milestone and Parent Task Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#4a5568]">
                Milestone (Optional)
              </label>
              <select
                value={milestoneId}
                onChange={(e) => setMilestoneId(e.target.value)}
                disabled={isLoadingMilestones}
                className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-[10px] text-[#2d3748] focus:outline-none focus:border-[#6b8cce] focus:ring-2 focus:ring-[#6b8cce] focus:ring-opacity-20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select a milestone</option>
                {milestones.map((milestone) => (
                  <option key={milestone.id} value={milestone.id}>
                    {milestone.name}
                  </option>
                ))}
              </select>
              {isLoadingMilestones && (
                <p className="text-xs text-[#718096]">Loading milestones...</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#4a5568]">
                Parent Task (Optional)
              </label>
              <select
                value={parentTaskId}
                onChange={(e) => setParentTaskId(e.target.value)}
                disabled={isLoadingTasks}
                className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-[10px] text-[#2d3748] focus:outline-none focus:border-[#6b8cce] focus:ring-2 focus:ring-[#6b8cce] focus:ring-opacity-20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select a parent task</option>
                {parentTasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
              {isLoadingTasks && (
                <p className="text-xs text-[#718096]">Loading tasks...</p>
              )}
            </div>
          </div>

          {/* Status and Priority Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#4a5568]">
                Status
              </label>
              <select
                className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-[10px] text-[#2d3748] focus:outline-none focus:border-[#6b8cce] focus:ring-2 focus:ring-[#6b8cce] focus:ring-opacity-20 transition-all duration-200"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#4a5568]">
                Priority
              </label>
              <select
                className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-[10px] text-[#2d3748] focus:outline-none focus:border-[#6b8cce] focus:ring-2 focus:ring-[#6b8cce] focus:ring-opacity-20 transition-all duration-200"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Assignment Row */}
          {/* Assigned To and Assigned By Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#4a5568]">
                Assigned To
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                disabled={isLoadingUsers}
                className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-[10px] text-[#2d3748] focus:outline-none focus:border-[#6b8cce] focus:ring-2 focus:ring-[#6b8cce] focus:ring-opacity-20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select a user</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name}
                  </option>
                ))}
              </select>
              {isLoadingUsers && (
                <p className="text-xs text-[#718096]">Loading users...</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#4a5568]">
                Assigned By
              </label>
              <select
                value={assignedBy}
                onChange={(e) => setAssignedBy(e.target.value)}
                disabled={isLoadingUsers}
                className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-[10px] text-[#2d3748] focus:outline-none focus:border-[#6b8cce] focus:ring-2 focus:ring-[#6b8cce] focus:ring-opacity-20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select a user</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name}
                  </option>
                ))}
              </select>
              {isLoadingUsers && (
                <p className="text-xs text-[#718096]">Loading users...</p>
              )}
            </div>
          </div>

          {/* Task Type Row */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#4a5568]">
              Task Type
            </label>
            <select
              className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-[10px] text-[#2d3748] focus:outline-none focus:border-[#6b8cce] focus:ring-2 focus:ring-[#6b8cce] focus:ring-opacity-20 transition-all duration-200"
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
            >
              <option value="feature">Feature</option>
              <option value="bug">Bug Fix</option>
              <option value="maintenance">Maintenance</option>
              <option value="research">Research</option>
              <option value="documentation">Documentation</option>
            </select>
          </div>

          {/* Estimated Hours */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#4a5568]">
              Estimated Hours
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              placeholder="Enter estimated hours..."
              className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-[10px] text-[#2d3748] placeholder-[#a0aec0] focus:outline-none focus:border-[#6b8cce] focus:ring-2 focus:ring-[#6b8cce] focus:ring-opacity-20 transition-all duration-200"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
            />
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#4a5568]">
                Start Date
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-[10px] text-[#2d3748] focus:outline-none focus:border-[#6b8cce] focus:ring-2 focus:ring-[#6b8cce] focus:ring-opacity-20 transition-all duration-200"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#4a5568]">
                Due Date
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-[10px] text-[#2d3748] focus:outline-none focus:border-[#6b8cce] focus:ring-2 focus:ring-[#6b8cce] focus:ring-opacity-20 transition-all duration-200"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-[#6b8cce] bg-white border-[#e2e8f0] rounded focus:ring-[#6b8cce] focus:ring-2 mr-3 cursor-pointer"
                checked={requiresComplianceCheck}
                onChange={(e) => setRequiresComplianceCheck(e.target.checked)}
              />
              <label className="text-sm font-medium text-[#2d3748] cursor-pointer">Requires Compliance Check</label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-[#6b8cce] bg-white border-[#e2e8f0] rounded focus:ring-[#6b8cce] focus:ring-2 mr-3 cursor-pointer"
                checked={isBlocking}
                onChange={(e) => setIsBlocking(e.target.checked)}
              />
              <label className="text-sm font-medium text-[#2d3748] cursor-pointer">Is Blocking Other Tasks</label>
            </div>
          </div>

          {/* Submit Section */}
          <div className="flex items-center justify-between pt-6 border-t border-[#e2e8f0]">
            <button
              className="px-8 py-3 bg-[#6b8cce] text-white rounded-[10px] font-semibold text-sm shadow-[0_2px_8px_rgba(107,140,206,0.25)] hover:bg-[#5a7ab8] transition-all duration-200 hover:-translate-y-0.5"
              onClick={handleSubmit}
            >
              Create Task
            </button>
            <button
              className="px-8 py-3 bg-white text-[#4a5568] rounded-[10px] font-medium text-sm border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:bg-[#f8f9fb] transition-all duration-200"
              onClick={handleClearForm}
            >
              Clear Form
            </button>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-[#e3f2fd] border border-[#90caf9] rounded-[16px] p-6">
        <div className="flex items-start">
          <Icon icon="mdi:information" width={20} height={20} className="text-[#1976d2] mr-3 mt-0.5 flex-shrink-0" />
          <div className="text-[#1565c0]">
            <p className="font-semibold mb-1">Task Creation Form</p>
            <p className="text-sm">
              This form creates tasks based on your project table structure with all the necessary
              fields including status, priority, assignments, and compliance requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateTaskForm