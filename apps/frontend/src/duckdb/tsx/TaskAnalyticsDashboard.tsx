import React, { useState, useEffect, useRef } from 'react'
import { Icon } from '@iconify/react'
import toast from 'react-hot-toast'
import { queryExecutor } from '../query'

// Load ECharts from CDN
declare global {
  interface Window {
    echarts: any;
  }
}

interface TaskAnalyticsDashboardProps {
  taskId?: number
}

interface Task {
  id: number
  title: string
  description: string
  status: string
  priority: string
  assigned_to: number
  assigned_by: number
  estimated_hours: number
  actual_hours: number
  start_date: string
  due_date: string
  completed_at: string | null
  task_type: string
  requires_compliance_check: boolean
  is_blocking: boolean
  milestone_id: number
  parent_task_id: number | null
}

interface WorkLog {
  id: number
  user_id: number
  hours_logged: number
  log_date: string
  description: string
  user_name?: string
}

interface Comment {
  id: number
  user_id: number
  comment_text: string
  is_blocker_reason: boolean
  created_at: string
  user_name?: string
}

const TaskAnalyticsDashboard: React.FC<TaskAnalyticsDashboardProps> = ({ taskId = 4 }) => {
  const [task, setTask] = useState<Task | null>(null)
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [dependencies, setDependencies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [echartsLoaded, setEchartsLoaded] = useState<boolean>(false)

  // Chart refs
  const hoursChartRef = useRef<HTMLDivElement>(null)
  const timelineChartRef = useRef<HTMLDivElement>(null)

  // Load ECharts from CDN
  useEffect(() => {
    if (window.echarts) {
      setEchartsLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js'
    script.async = true
    script.onload = () => setEchartsLoaded(true)
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  useEffect(() => {
    loadTaskData()
  }, [taskId])

  useEffect(() => {
    if (task && echartsLoaded && !isLoading) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        renderHoursChart()
        if (workLogs.length > 0) {
          renderTimelineChart()
        }
      }, 100)
    }
  }, [task, workLogs, echartsLoaded, isLoading])

  const loadTaskData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Load task details
      const taskResult = await queryExecutor.executeQuery(`
        SELECT * FROM ddb.tasks WHERE id = ${taskId}
      `)

      if (taskResult.data.length === 0) {
        setError('Task not found')
        setIsLoading(false)
        return
      }

      const taskData = taskResult.data[0]
      setTask({
        id: taskData.id,
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        assigned_to: taskData.assigned_to,
        assigned_by: taskData.assigned_by,
        estimated_hours: Number(taskData.estimated_hours) || 0,
        actual_hours: Number(taskData.actual_hours) || 0,
        start_date: taskData.start_date,
        due_date: taskData.due_date,
        completed_at: taskData.completed_at,
        task_type: taskData.task_type,
        requires_compliance_check: taskData.requires_compliance_check,
        is_blocking: taskData.is_blocking,
        milestone_id: taskData.milestone_id,
        parent_task_id: taskData.parent_task_id
      })

      // Load work logs with user names
      const logsResult = await queryExecutor.executeQuery(`
        SELECT
          wl.id, wl.user_id, wl.hours_logged, wl.log_date, wl.description,
          u.full_name as user_name
        FROM ddb.work_logs wl
        LEFT JOIN ddb.users u ON wl.user_id = u.id
        WHERE wl.task_id = ${taskId}
        ORDER BY wl.log_date DESC
        LIMIT 10
      `)
      setWorkLogs(logsResult.data.map((log: any) => ({
        id: log.id,
        user_id: log.user_id,
        hours_logged: Number(log.hours_logged),
        log_date: log.log_date,
        description: log.description,
        user_name: log.user_name
      })))

      // Load comments with user names
      const commentsResult = await queryExecutor.executeQuery(`
        SELECT
          tc.id, tc.user_id, tc.comment_text, tc.is_blocker_reason, tc.created_at,
          u.full_name as user_name
        FROM ddb.task_comments tc
        LEFT JOIN ddb.users u ON tc.user_id = u.id
        WHERE tc.task_id = ${taskId}
        ORDER BY tc.created_at DESC
        LIMIT 5
      `)
      setComments(commentsResult.data.map((comment: any) => ({
        id: comment.id,
        user_id: comment.user_id,
        comment_text: comment.comment_text,
        is_blocker_reason: comment.is_blocker_reason,
        created_at: comment.created_at,
        user_name: comment.user_name
      })))

      // Load dependencies
      const depsResult = await queryExecutor.executeQuery(`
        SELECT
          td.*,
          t.title as dependent_task_title
        FROM ddb.task_dependencies td
        LEFT JOIN ddb.tasks t ON td.depends_on_task_id = t.id
        WHERE td.task_id = ${taskId}
      `)
      setDependencies(depsResult.data)

    } catch (e) {
      console.error('Error loading task data:', e)
      setError('Failed to load task data')
    }
    setIsLoading(false)
  }

  const renderHoursChart = () => {
    if (!hoursChartRef.current || !window.echarts || !task) {
      console.log('Hours chart not ready:', {
        hasRef: !!hoursChartRef.current,
        hasEcharts: !!window.echarts,
        hasTask: !!task
      })
      return
    }

    const chart = window.echarts.init(hoursChartRef.current)

    const option = {
      tooltip: {
        trigger: 'item',
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: { color: '#2d3748' }
      },
      series: [
        {
          name: 'Hours',
          type: 'pie',
          radius: ['50%', '75%'],
          center: ['50%', '50%'],
          data: [
            {
              value: task.actual_hours,
              name: 'Actual Hours',
              itemStyle: { color: '#6b8cce' }
            },
            {
              value: Math.max(0, task.estimated_hours - task.actual_hours),
              name: 'Remaining Hours',
              itemStyle: { color: '#e2e8f0' }
            }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.2)'
            }
          },
          label: {
            show: true,
            formatter: (params: any) => `${params.name}: ${Number(params.value).toFixed(2)}h`,
            fontSize: 11,
            color: '#4a5568'
          }
        }
      ]
    }

    chart.setOption(option)

    const resizeObserver = new ResizeObserver(() => chart.resize())
    resizeObserver.observe(hoursChartRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.dispose()
    }
  }

  const renderTimelineChart = () => {
    if (!timelineChartRef.current || !window.echarts) return

    const chart = window.echarts.init(timelineChartRef.current)

    const dates = workLogs.map(log =>
      new Date(log.log_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    ).reverse()
    const hours = workLogs.map(log => log.hours_logged).reverse()

    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: { color: '#2d3748' },
        formatter: (params: any) => {
          const log = workLogs[workLogs.length - 1 - params[0].dataIndex]
          const formattedDate = new Date(log.log_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
          return `${formattedDate}<br/>Hours: ${Number(log.hours_logged).toFixed(2)}<br/>By: ${log.user_name || 'Unknown'}`
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: {
          color: '#718096',
          fontSize: 10,
          rotate: 30
        },
        axisLine: { lineStyle: { color: '#e2e8f0' } }
      },
      yAxis: {
        type: 'value',
        name: 'Hours',
        axisLabel: { color: '#718096', fontSize: 10 },
        splitLine: { lineStyle: { color: '#e2e8f0' } }
      },
      series: [
        {
          name: 'Hours Logged',
          type: 'line',
          data: hours,
          smooth: true,
          itemStyle: { color: '#6b8cce' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(107, 140, 206, 0.3)' },
                { offset: 1, color: 'rgba(107, 140, 206, 0.05)' }
              ]
            }
          }
        }
      ]
    }

    chart.setOption(option)

    const resizeObserver = new ResizeObserver(() => chart.resize())
    resizeObserver.observe(timelineChartRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.dispose()
    }
  }

  const updateTaskStatus = async (status: string) => {
    if (!task) return

    try {
      await queryExecutor.executeQuery(`
        UPDATE ddb.tasks
        SET status = '${status}'
        WHERE id = ${taskId}
      `)

      setTask({ ...task, status })
      toast.success(`Task status changed to "${status}"`, {
        duration: 3000,
        position: 'top-center',
        icon: '✅',
      })
    } catch (e) {
      console.error('Error updating status:', e)
      toast.error('Failed to update task status', {
        duration: 3000,
        position: 'top-center',
      })
    }
  }

  const updateTaskPriority = async (priority: string) => {
    if (!task) return

    try {
      await queryExecutor.executeQuery(`
        UPDATE ddb.tasks
        SET priority = '${priority}'
        WHERE id = ${taskId}
      `)

      setTask({ ...task, priority })
      toast.success(`Task priority changed to "${priority}"`, {
        duration: 3000,
        position: 'top-center',
        icon: '🔥',
      })
    } catch (e) {
      console.error('Error updating priority:', e)
      toast.error('Failed to update task priority', {
        duration: 3000,
        position: 'top-center',
      })
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'completed': 'bg-[#48bb78] text-white',
      'in_progress': 'bg-[#6b8cce] text-white',
      'pending': 'bg-[#ffd93d] text-[#2d3748]',
      'blocked': 'bg-[#fc8181] text-white',
      'on_hold': 'bg-[#9b8cce] text-white'
    }
    return colors[status.toLowerCase()] || 'bg-[#718096] text-white'
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'high': 'text-[#fc8181]',
      'medium': 'text-[#ffd93d]',
      'low': 'text-[#6bcf7f]'
    }
    return colors[priority.toLowerCase()] || 'text-[#718096]'
  }

  const getProgressPercentage = () => {
    if (!task || task.estimated_hours === 0) return 0
    return Math.min((task.actual_hours / task.estimated_hours) * 100, 100)
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8">
        <div className="flex items-center justify-center gap-3 py-12">
          <div className="w-6 h-6 border-2 border-[#6b8cce] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#718096]">Loading task data...</span>
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
          <button
            onClick={loadTaskData}
            className="mt-4 px-6 py-2 bg-[#6b8cce] text-white rounded-[10px] hover:bg-[#5a7ab8] transition-all duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 pb-6 border-b border-[#e2e8f0]">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-[#6b8cce] bg-opacity-10 rounded-[12px] flex items-center justify-center">
            <Icon icon="mdi:checkbox-marked-circle" width={28} height={28} className="text-[#2d3748]" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[#2d3748] mb-1">{task.title}</h2>
            <p className="text-[#718096] text-sm mb-3">{task.description || 'No description'}</p>
            <div className="flex items-center gap-3">
              <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-[6px] text-xs font-medium ${getStatusColor(task.status)}`}>
                {task.status}
              </div>
              <div className={`font-semibold text-sm ${getPriorityColor(task.priority)}`}>
                {task.priority} Priority
              </div>
              <div className="text-xs text-[#718096]">ID: #{task.id}</div>
            </div>
          </div>
        </div>
        <button
          onClick={loadTaskData}
          className="flex items-center gap-2 px-4 py-2 bg-[#f8f9fb] text-[#4a5568] rounded-[10px] border border-[#e2e8f0] hover:bg-white hover:border-[#6b8cce] transition-all duration-200 text-sm font-medium"
        >
          <Icon icon="mdi:refresh" width={16} height={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-[#6b8cce] to-[#5a7ab8] rounded-[16px] p-5">
          <div className="flex items-center gap-3 mb-2">
            <Icon icon="mdi:clock-outline" width={24} height={24} className="text-white opacity-90" />
            <div className="text-sm text-white opacity-90">Estimated</div>
          </div>
          <div className="font-bold text-3xl text-white">{Number(task.estimated_hours).toFixed(2)}h</div>
        </div>

        <div className="bg-gradient-to-br from-[#6bcf7f] to-[#48bb78] rounded-[16px] p-5">
          <div className="flex items-center gap-3 mb-2">
            <Icon icon="mdi:timer" width={24} height={24} className="text-white opacity-90" />
            <div className="text-sm text-white opacity-90">Actual</div>
          </div>
          <div className="font-bold text-3xl text-white">{Number(task.actual_hours).toFixed(2)}h</div>
        </div>

        <div className="bg-gradient-to-br from-[#ffd93d] to-[#f6ad55] rounded-[16px] p-5">
          <div className="flex items-center gap-3 mb-2">
            <Icon icon="mdi:percent" width={24} height={24} className="text-white opacity-90" />
            <div className="text-sm text-white opacity-90">Progress</div>
          </div>
          <div className="font-bold text-3xl text-white">{getProgressPercentage().toFixed(0)}%</div>
        </div>

        <div className="bg-gradient-to-br from-[#ff6b9d] to-[#fc8181] rounded-[16px] p-5">
          <div className="flex items-center gap-3 mb-2">
            <Icon icon="mdi:comment-multiple" width={24} height={24} className="text-white opacity-90" />
            <div className="text-sm text-white opacity-90">Comments</div>
          </div>
          <div className="font-bold text-3xl text-white">{comments.length}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Hours Breakdown */}
        <div className="bg-[#f8f9fb] rounded-[16px] p-5 border border-[#e2e8f0]">
          <h3 className="text-base font-semibold text-[#2d3748] mb-3 flex items-center gap-2">
            <Icon icon="mdi:chart-donut" width={18} height={18} className="text-[#6b8cce]" />
            Hours Breakdown
          </h3>
          {!echartsLoaded ? (
            <div className="flex items-center justify-center h-[250px]">
              <div className="flex items-center gap-2 text-sm text-[#718096]">
                <div className="w-4 h-4 border-2 border-[#6b8cce] border-t-transparent rounded-full animate-spin" />
                Loading chart...
              </div>
            </div>
          ) : (
            <div ref={hoursChartRef} style={{ width: '100%', height: '250px' }} />
          )}
        </div>

        {/* Work Timeline */}
        <div className="bg-[#f8f9fb] rounded-[16px] p-5 border border-[#e2e8f0]">
          <h3 className="text-base font-semibold text-[#2d3748] mb-3 flex items-center gap-2">
            <Icon icon="mdi:chart-timeline" width={18} height={18} className="text-[#6bcf7f]" />
            Work Timeline
          </h3>
          {!echartsLoaded ? (
            <div className="flex items-center justify-center h-[250px]">
              <div className="flex items-center gap-2 text-sm text-[#718096]">
                <div className="w-4 h-4 border-2 border-[#6b8cce] border-t-transparent rounded-full animate-spin" />
                Loading chart...
              </div>
            </div>
          ) : workLogs.length > 0 ? (
            <div ref={timelineChartRef} style={{ width: '100%', height: '250px' }} />
          ) : (
            <div className="flex items-center justify-center h-[250px] text-sm text-[#718096]">
              No work logs to display
            </div>
          )}
        </div>
      </div>

      {/* Task Details & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Task Details */}
        <div className="bg-[#f8f9fb] rounded-[16px] p-5 border border-[#e2e8f0]">
          <h3 className="text-base font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
            <Icon icon="mdi:information" width={18} height={18} className="text-[#6b8cce]" />
            Task Details
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#718096]">Type:</span>
              <span className="text-[#2d3748] font-medium">{task.task_type || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#718096]">Start Date:</span>
              <span className="text-[#2d3748] font-medium">
                {task.start_date ? new Date(task.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#718096]">Due Date:</span>
              <span className="text-[#2d3748] font-medium">
                {task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#718096]">Completed:</span>
              <span className="text-[#2d3748] font-medium">
                {task.completed_at ? new Date(task.completed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Not completed'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#718096]">Dependencies:</span>
              <span className="text-[#2d3748] font-medium">{dependencies.length}</span>
            </div>
            <div className="pt-3 border-t border-[#e2e8f0] space-y-2">
              {task.requires_compliance_check && (
                <div className="flex items-center gap-2 text-xs text-[#718096]">
                  <Icon icon="mdi:shield-check" width={16} height={16} className="text-[#6b8cce]" />
                  Compliance Required
                </div>
              )}
              {task.is_blocking && (
                <div className="flex items-center gap-2 text-xs text-[#fc8181]">
                  <Icon icon="mdi:alert-octagon" width={16} height={16} />
                  Blocking Task
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#f8f9fb] rounded-[16px] p-5 border border-[#e2e8f0]">
          <h3 className="text-base font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
            <Icon icon="mdi:lightning-bolt" width={18} height={18} className="text-[#ffd93d]" />
            Quick Actions
          </h3>

          <div className="space-y-4">
            {/* Status Actions */}
            <div>
              <label className="text-xs font-medium text-[#718096] mb-2 block">Update Status</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updateTaskStatus('in_progress')}
                  className="px-3 py-1.5 bg-[#6b8cce] text-white rounded-[8px] text-xs font-medium hover:bg-[#5a7ab8] transition-all duration-200"
                >
                  In Progress
                </button>
                <button
                  onClick={() => updateTaskStatus('completed')}
                  className="px-3 py-1.5 bg-[#48bb78] text-white rounded-[8px] text-xs font-medium hover:bg-[#38a169] transition-all duration-200"
                >
                  Complete
                </button>
                <button
                  onClick={() => updateTaskStatus('blocked')}
                  className="px-3 py-1.5 bg-[#fc8181] text-white rounded-[8px] text-xs font-medium hover:bg-[#e57373] transition-all duration-200"
                >
                  Blocked
                </button>
                <button
                  onClick={() => updateTaskStatus('on_hold')}
                  className="px-3 py-1.5 bg-[#9b8cce] text-white rounded-[8px] text-xs font-medium hover:bg-[#8574b8] transition-all duration-200"
                >
                  On Hold
                </button>
              </div>
            </div>

            {/* Priority Actions */}
            <div>
              <label className="text-xs font-medium text-[#718096] mb-2 block">Update Priority</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updateTaskPriority('high')}
                  className="px-3 py-1.5 bg-[#fc8181] text-white rounded-[8px] text-xs font-medium hover:bg-[#e57373] transition-all duration-200"
                >
                  High
                </button>
                <button
                  onClick={() => updateTaskPriority('medium')}
                  className="px-3 py-1.5 bg-[#ffd93d] text-[#2d3748] rounded-[8px] text-xs font-medium hover:bg-[#f6ad55] transition-all duration-200"
                >
                  Medium
                </button>
                <button
                  onClick={() => updateTaskPriority('low')}
                  className="px-3 py-1.5 bg-[#6bcf7f] text-white rounded-[8px] text-xs font-medium hover:bg-[#48bb78] transition-all duration-200"
                >
                  Low
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Work Logs & Comments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Work Logs */}
        <div className="bg-[#f8f9fb] rounded-[16px] p-5 border border-[#e2e8f0]">
          <h3 className="text-base font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
            <Icon icon="mdi:clipboard-text-clock" width={18} height={18} className="text-[#6b8cce]" />
            Recent Work Logs ({workLogs.length})
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {workLogs.length > 0 ? (
              workLogs.map(log => (
                <div key={log.id} className="bg-white rounded-[10px] p-3 border border-[#e2e8f0]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-[#4a5568]">{log.user_name || 'Unknown'}</span>
                    <span className="text-xs text-[#718096]">
                      {new Date(log.log_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#718096]">{log.description || 'No description'}</span>
                    <span className="text-sm font-bold text-[#6b8cce]">{Number(log.hours_logged).toFixed(2)}h</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-sm text-[#718096]">No work logs yet</div>
            )}
          </div>
        </div>

        {/* Comments */}
        <div className="bg-[#f8f9fb] rounded-[16px] p-5 border border-[#e2e8f0]">
          <h3 className="text-base font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
            <Icon icon="mdi:comment-multiple" width={18} height={18} className="text-[#ff6b9d]" />
            Recent Comments ({comments.length})
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.id} className={`bg-white rounded-[10px] p-3 border ${comment.is_blocker_reason ? 'border-[#fc8181]' : 'border-[#e2e8f0]'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-[#4a5568]">{comment.user_name || 'Unknown'}</span>
                    <div className="flex items-center gap-2">
                      {comment.is_blocker_reason && (
                        <Icon icon="mdi:alert" width={14} height={14} className="text-[#fc8181]" />
                      )}
                      <span className="text-xs text-[#718096]">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#718096]">{comment.comment_text}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-sm text-[#718096]">No comments yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskAnalyticsDashboard
