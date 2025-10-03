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

interface UserAnalyticsDashboardProps {
  userId: number
}

interface User {
  id: number
  full_name: string
  email: string
  role: string
  specialization: string
  availability_hours_per_week: number
  timezone: string
  department_name: string
}

interface TaskStatus {
  status: string
  count: number
}

interface TaskPriority {
  priority: string
  count: number
}

interface TeamAllocation {
  team_id: number
  team_name: string
  allocation_percentage: number
  lead_name: string
}

interface WorkLog {
  log_date: string
  hours_logged: number
  description: string
  task_title: string
}

interface ProjectContribution {
  project_name: string
  total_hours: number
}

interface DependencyInfo {
  waiting_user: string
  waiting_task: string
  my_task: string
  my_task_status: string
}

const UserAnalyticsDashboard: React.FC<UserAnalyticsDashboardProps> = ({ userId }) => {
  const [user, setUser] = useState<User | null>(null)
  const [taskStatusData, setTaskStatusData] = useState<TaskStatus[]>([])
  const [taskPriorityData, setTaskPriorityData] = useState<TaskPriority[]>([])
  const [teamAllocations, setTeamAllocations] = useState<TeamAllocation[]>([])
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([])
  const [projectContributions, setProjectContributions] = useState<ProjectContribution[]>([])
  const [dependenciesOnMe, setDependenciesOnMe] = useState<DependencyInfo[]>([])
  const [stats, setStats] = useState({
    totalTasks: 0,
    estimatedHours: 0,
    actualHours: 0,
    completedTasks: 0,
    totalAllocation: 0
  })
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [echartsLoaded, setEchartsLoaded] = useState<boolean>(false)

  // Chart refs
  const workTrendChartRef = useRef<HTMLDivElement>(null)
  const statusChartRef = useRef<HTMLDivElement>(null)
  const priorityChartRef = useRef<HTMLDivElement>(null)
  const projectChartRef = useRef<HTMLDivElement>(null)

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
    loadUserData()
  }, [userId])

  useEffect(() => {
    if (user && echartsLoaded && !isLoading) {
      setTimeout(() => {
        renderStatusChart()
        renderPriorityChart()
        if (workLogs.length > 0) {
          renderWorkTrendChart()
        }
        if (projectContributions.length > 0) {
          renderProjectChart()
        }
      }, 100)
    }
  }, [user, workLogs, projectContributions, taskStatusData, taskPriorityData, echartsLoaded, isLoading])

  const loadUserData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Get user info
      const userResult = await queryExecutor.executeQuery(`
        SELECT
          u.id, u.full_name, u.email, u.role, u.specialization,
          u.availability_hours_per_week, u.timezone,
          d.name as department_name
        FROM ddb.users u
        LEFT JOIN ddb.departments d ON u.department_id = d.id
        WHERE u.id = ${userId}
      `)

      if (!userResult || !userResult.data || userResult.data.length === 0) {
        console.error('User not found - userResult:', userResult)
        setError(`User with ID ${userId} not found in database`)
        setIsLoading(false)
        return
      }

      const userData = userResult.data[0]
      setUser(userData)

      // Get task status breakdown
      const statusResult = await queryExecutor.executeQuery(`
        SELECT status, COUNT(*) as count
        FROM ddb.tasks
        WHERE assigned_to = ${userId}
        GROUP BY status
      `)
      setTaskStatusData(statusResult.data.map((item: any) => ({
        status: item.status,
        count: Number(item.count)
      })))

      // Get task priority breakdown
      const priorityResult = await queryExecutor.executeQuery(`
        SELECT priority, COUNT(*) as count
        FROM ddb.tasks
        WHERE assigned_to = ${userId}
        GROUP BY priority
      `)
      setTaskPriorityData(priorityResult.data.map((item: any) => ({
        priority: item.priority,
        count: Number(item.count)
      })))

      // Get team allocations
      const teamResult = await queryExecutor.executeQuery(`
        SELECT
          t.id as team_id,
          t.name as team_name,
          tm.allocation_percentage,
          u.full_name as lead_name
        FROM ddb.team_members tm
        JOIN ddb.teams t ON tm.team_id = t.id
        LEFT JOIN ddb.users u ON t.lead_user_id = u.id
        WHERE tm.user_id = ${userId}
      `)
      setTeamAllocations(teamResult.data)

      // Get work logs (last 30 days)
      const logsResult = await queryExecutor.executeQuery(`
        SELECT
          wl.log_date,
          wl.hours_logged,
          wl.description,
          t.title as task_title
        FROM ddb.work_logs wl
        LEFT JOIN ddb.tasks t ON wl.task_id = t.id
        WHERE wl.user_id = ${userId}
        ORDER BY wl.log_date DESC
        LIMIT 50
      `)
      const mappedLogs = logsResult.data.map((item: any) => ({
        ...item,
        hours_logged: Number(item.hours_logged || 0)
      }))
      console.log('Work logs sample:', mappedLogs.slice(0, 3))
      setWorkLogs(mappedLogs)

      // Get project contributions
      const projectResult = await queryExecutor.executeQuery(`
        SELECT
          p.name as project_name,
          SUM(wl.hours_logged) as total_hours
        FROM ddb.work_logs wl
        JOIN ddb.tasks t ON wl.task_id = t.id
        JOIN ddb.milestones m ON t.milestone_id = m.id
        JOIN ddb.projects p ON m.project_id = p.id
        WHERE wl.user_id = ${userId}
        GROUP BY p.name
        ORDER BY total_hours DESC
      `)
      setProjectContributions(projectResult.data.map((item: any) => ({
        project_name: item.project_name,
        total_hours: Number(item.total_hours)
      })))

      // Get dependencies on me
      const depsResult = await queryExecutor.executeQuery(`
        SELECT
          waiting_user.full_name as waiting_user,
          waiting_task.title as waiting_task,
          my_task.title as my_task,
          my_task.status as my_task_status
        FROM ddb.task_dependencies td
        JOIN ddb.tasks my_task ON td.depends_on_task_id = my_task.id
        JOIN ddb.tasks waiting_task ON td.task_id = waiting_task.id
        JOIN ddb.users waiting_user ON waiting_task.assigned_to = waiting_user.id
        WHERE my_task.assigned_to = ${userId}
        AND my_task.status != 'completed'
        ORDER BY waiting_task.due_date
      `)
      setDependenciesOnMe(depsResult.data)

      // Calculate stats
      const statsResult = await queryExecutor.executeQuery(`
        SELECT
          COUNT(*) as total_tasks,
          SUM(estimated_hours) as estimated_hours,
          SUM(actual_hours) as actual_hours,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks
        FROM ddb.tasks
        WHERE assigned_to = ${userId}
      `)

      // Convert BigInt values to numbers
      const statsData = statsResult.data[0]
      const totalAllocation = Array.isArray(teamResult.data)
        ? teamResult.data.reduce((sum: number, team: any) => sum + Number(team.allocation_percentage || 0), 0)
        : 0

      setStats({
        totalTasks: statsData?.total_tasks ? Number(statsData.total_tasks) : 0,
        estimatedHours: statsData?.estimated_hours ? Number(statsData.estimated_hours) : 0,
        actualHours: statsData?.actual_hours ? Number(statsData.actual_hours) : 0,
        completedTasks: statsData?.completed_tasks ? Number(statsData.completed_tasks) : 0,
        totalAllocation
      })

    } catch (e) {
      console.error('Error loading user data:', e)
      setError('Failed to load user data')
      toast.error('Failed to load user data')
    } finally {
      setIsLoading(false)
    }
  }

  const renderWorkTrendChart = () => {
    if (!workTrendChartRef.current || !window.echarts) return

    const chart = window.echarts.init(workTrendChartRef.current)

    // Group by date and sum hours
    const dateHoursMap = new Map<string, number>()
    workLogs.forEach(log => {
      const existing = dateHoursMap.get(log.log_date) || 0
      dateHoursMap.set(log.log_date, existing + log.hours_logged)
    })

    const sortedDates = Array.from(dateHoursMap.keys()).sort()
    const dates = sortedDates.map(date =>
      new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    )
    const hours = sortedDates.map(date => dateHoursMap.get(date) || 0)

    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: { color: '#2d3748' },
        formatter: (params: any) => {
          const param = Array.isArray(params) ? params[0] : params
          return `${param.name}<br/>${param.seriesName}: ${Number(param.value).toFixed(2)}h`
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
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
    resizeObserver.observe(workTrendChartRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.dispose()
    }
  }

  const renderStatusChart = () => {
    if (!statusChartRef.current || !window.echarts || taskStatusData.length === 0) return

    const chart = window.echarts.init(statusChartRef.current)

    const statusColors: Record<string, string> = {
      'completed': '#48bb78',
      'in_progress': '#6b8cce',
      'todo': '#ffd93d',
      'blocked': '#fc8181',
      'in_review': '#9b8cce'
    }

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
          name: 'Tasks',
          type: 'pie',
          radius: ['50%', '75%'],
          center: ['50%', '50%'],
          data: taskStatusData.map(item => ({
            value: item.count,
            name: item.status.replace('_', ' ').toUpperCase(),
            itemStyle: { color: statusColors[item.status] || '#718096' }
          })),
          label: {
            show: true,
            formatter: '{b}: {c}',
            fontSize: 11,
            color: '#4a5568'
          }
        }
      ]
    }

    chart.setOption(option)

    const resizeObserver = new ResizeObserver(() => chart.resize())
    resizeObserver.observe(statusChartRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.dispose()
    }
  }

  const renderPriorityChart = () => {
    if (!priorityChartRef.current || !window.echarts || taskPriorityData.length === 0) return

    const chart = window.echarts.init(priorityChartRef.current)

    const priorityColors: Record<string, string> = {
      'critical': '#fc8181',
      'high': '#f6ad55',
      'medium': '#ffd93d',
      'low': '#6bcf7f'
    }

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
          name: 'Priority',
          type: 'pie',
          radius: ['50%', '75%'],
          center: ['50%', '50%'],
          data: taskPriorityData.map(item => ({
            value: item.count,
            name: item.priority.toUpperCase(),
            itemStyle: { color: priorityColors[item.priority] || '#718096' }
          })),
          label: {
            show: true,
            formatter: '{b}: {c}',
            fontSize: 11,
            color: '#4a5568'
          }
        }
      ]
    }

    chart.setOption(option)

    const resizeObserver = new ResizeObserver(() => chart.resize())
    resizeObserver.observe(priorityChartRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.dispose()
    }
  }

  const renderProjectChart = () => {
    if (!projectChartRef.current || !window.echarts || projectContributions.length === 0) return

    const chart = window.echarts.init(projectChartRef.current)

    const projects = projectContributions.map(p => p.project_name)
    const hours = projectContributions.map(p => p.total_hours)

    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: { color: '#2d3748' },
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const param = Array.isArray(params) ? params[0] : params
          return `${param.name}<br/>${param.seriesName}: ${Number(param.value).toFixed(2)}h`
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: projects,
        axisLabel: {
          color: '#718096',
          fontSize: 10,
          rotate: 30,
          formatter: (value: string) => value.length > 15 ? value.substring(0, 15) + '...' : value
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
          name: 'Hours',
          type: 'bar',
          data: hours,
          itemStyle: {
            color: '#6b8cce',
            borderRadius: [6, 6, 0, 0]
          }
        }
      ]
    }

    chart.setOption(option)

    const resizeObserver = new ResizeObserver(() => chart.resize())
    resizeObserver.observe(projectChartRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.dispose()
    }
  }

  const getUtilizationRate = () => {
    if (!user || user.availability_hours_per_week === 0 || workLogs.length === 0) return 0

    // Calculate based on actual date range in work logs
    const dates = workLogs.map(log => new Date(log.log_date).getTime())
    const minDate = Math.min(...dates)
    const maxDate = Math.max(...dates)
    const daysDiff = Math.max(1, (maxDate - minDate) / (1000 * 60 * 60 * 24))
    const weeks = Math.max(1, daysDiff / 7)

    const totalHours = workLogs.reduce((sum, log) => sum + Number(log.hours_logged || 0), 0)
    const avgHoursPerWeek = totalHours / weeks
    const rate = (avgHoursPerWeek / user.availability_hours_per_week) * 100

    return Math.min(999, Math.round(rate)) // Cap at 999% for display
  }

  const getEstimationAccuracy = () => {
    if (stats.estimatedHours === 0) return 0
    return Math.round((stats.actualHours / stats.estimatedHours) * 100)
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8">
        <div className="flex items-center justify-center gap-3 py-12">
          <div className="w-6 h-6 border-2 border-[#6b8cce] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#718096]">Loading user data...</span>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8">
        <div className="text-center py-12">
          <Icon icon="mdi:alert-circle" width={48} height={48} className="text-[#fc8181] mx-auto mb-4" />
          <p className="text-[#fc8181] font-medium">{error || 'User not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-[#6b8cce] bg-opacity-10 rounded-[16px] flex items-center justify-center">
              <Icon icon="mdi:account-circle" width={32} height={32} className="text-[#2d3748]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#2d3748] mb-1">{user.full_name}</h2>
              <p className="text-sm text-[#718096] mb-2">{user.email}</p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-3 py-1 bg-[#6b8cce] bg-opacity-10 rounded-[8px] text-xs font-medium text-gray-900">
                  {user.role}
                </span>
                <span className="px-3 py-1 bg-[#f8f9fb] rounded-[8px] text-xs font-medium text-[#718096]">
                  {user.specialization}
                </span>
                <span className="px-3 py-1 bg-[#f8f9fb] rounded-[8px] text-xs font-medium text-[#718096]">
                  {user.department_name}
                </span>
                <span className="px-3 py-1 bg-[#f8f9fb] rounded-[8px] text-xs font-medium text-[#718096]">
                  {user.timezone}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-[#6b8cce] to-[#5a7ab8] rounded-[16px] p-5">
          <div className="flex items-center gap-3 mb-2">
            <Icon icon="mdi:clipboard-check" width={24} height={24} className="text-white opacity-90" />
            <div className="text-sm text-white opacity-90">Total Tasks</div>
          </div>
          <div className="font-bold text-3xl text-white">{stats.totalTasks}</div>
          <div className="text-xs text-white opacity-75 mt-1">{stats.completedTasks} completed</div>
        </div>

        <div className="bg-gradient-to-br from-[#6bcf7f] to-[#48bb78] rounded-[16px] p-5">
          <div className="flex items-center gap-3 mb-2">
            <Icon icon="mdi:clock-outline" width={24} height={24} className="text-white opacity-90" />
            <div className="text-sm text-white opacity-90">Hours Logged</div>
          </div>
          <div className="font-bold text-3xl text-white">{(stats.actualHours || 0).toFixed(0)}h</div>
          <div className="text-xs text-white opacity-75 mt-1">{(stats.estimatedHours || 0).toFixed(0)}h estimated</div>
        </div>

        <div className="bg-gradient-to-br from-[#ffd93d] to-[#f6ad55] rounded-[16px] p-5">
          <div className="flex items-center gap-3 mb-2">
            <Icon icon="mdi:speedometer" width={24} height={24} className="text-white opacity-90" />
            <div className="text-sm text-white opacity-90">Utilization</div>
          </div>
          <div className="font-bold text-3xl text-white">{getUtilizationRate()}%</div>
          <div className="text-xs text-white opacity-75 mt-1">{user.availability_hours_per_week}h/week</div>
        </div>

        <div className={`bg-gradient-to-br rounded-[16px] p-5 ${
          stats.totalAllocation > 100 ? 'from-[#fc8181] to-[#e57373]' : 'from-[#9b8cce] to-[#8574b8]'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <Icon icon="mdi:account-multiple" width={24} height={24} className="text-white opacity-90" />
            <div className="text-sm text-white opacity-90">Allocation</div>
          </div>
          <div className="font-bold text-3xl text-white">{stats.totalAllocation}%</div>
          <div className="text-xs text-white opacity-75 mt-1">
            {stats.totalAllocation > 100 ? 'Overloaded!' : 'Normal'}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Work Hours Trend */}
        <div className="bg-[#f8f9fb] rounded-[16px] p-5 border border-[#e2e8f0]">
          <h3 className="text-base font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
            <Icon icon="mdi:chart-line" width={18} height={18} className="text-[#2d3748]" />
            Work Hours Trend
          </h3>
          <div ref={workTrendChartRef} style={{ width: '100%', height: '300px' }}></div>
        </div>

        {/* Task Status Breakdown */}
        <div className="bg-[#f8f9fb] rounded-[16px] p-5 border border-[#e2e8f0]">
          <h3 className="text-base font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
            <Icon icon="mdi:chart-donut" width={18} height={18} className="text-[#2d3748]" />
            Tasks by Status
          </h3>
          <div ref={statusChartRef} style={{ width: '100%', height: '300px' }}></div>
        </div>

        {/* Task Priority Breakdown */}
        <div className="bg-[#f8f9fb] rounded-[16px] p-5 border border-[#e2e8f0]">
          <h3 className="text-base font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
            <Icon icon="mdi:alert-octagon" width={18} height={18} className="text-[#2d3748]" />
            Tasks by Priority
          </h3>
          <div ref={priorityChartRef} style={{ width: '100%', height: '300px' }}></div>
        </div>

        {/* Project Contributions */}
        <div className="bg-[#f8f9fb] rounded-[16px] p-5 border border-[#e2e8f0]">
          <h3 className="text-base font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
            <Icon icon="mdi:folder-multiple" width={18} height={18} className="text-[#2d3748]" />
            Project Contributions
          </h3>
          <div ref={projectChartRef} style={{ width: '100%', height: '300px' }}></div>
        </div>
      </div>

      {/* Team Allocations & Dependencies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Team Allocations */}
        <div className="bg-[#f8f9fb] rounded-[16px] p-5 border border-[#e2e8f0]">
          <h3 className="text-base font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
            <Icon icon="mdi:account-group" width={18} height={18} className="text-[#2d3748]" />
            Team Allocations ({teamAllocations.length})
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {teamAllocations.length > 0 ? (
              teamAllocations.map(team => (
                <div key={team.team_id} className="bg-[#f8f9fb] rounded-[12px] p-4 border border-[#e2e8f0]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#2d3748]">{team.team_name}</span>
                    <span className={`text-sm font-bold ${
                      team.allocation_percentage > 100 ? 'text-[#fc8181]' : 'text-[#6b8cce]'
                    }`}>{team.allocation_percentage}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon icon="mdi:account-star" width={14} height={14} className="text-[#718096]" />
                    <span className="text-xs text-[#718096]">Lead: {team.lead_name || 'No lead assigned'}</span>
                  </div>
                  <div className="mt-2 bg-[#e2e8f0] rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full ${team.allocation_percentage > 100 ? 'bg-[#fc8181]' : 'bg-[#6b8cce]'}`}
                      style={{ width: `${Math.min(team.allocation_percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-sm text-[#718096]">No team allocations</div>
            )}
          </div>
        </div>

        {/* Dependencies on Me */}
        <div className="bg-[#f8f9fb] rounded-[16px] p-5 border border-[#e2e8f0]">
          <h3 className="text-base font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
            <Icon icon="mdi:link-variant" width={18} height={18} className="text-[#fc8181]" />
            People Waiting on Me ({dependenciesOnMe.length})
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {dependenciesOnMe.length > 0 ? (
              dependenciesOnMe.map((dep, idx) => (
                <div key={idx} className="bg-[#fff5f5] rounded-[12px] p-4 border border-[#fc8181] border-opacity-20">
                  <div className="flex items-start gap-2 mb-2">
                    <Icon icon="mdi:account-alert" width={16} height={16} className="text-[#fc8181] mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#2d3748] mb-1">{dep.waiting_user} is waiting</p>
                      <p className="text-xs text-[#718096] mb-1">
                        <span className="font-medium">Their task:</span> {dep.waiting_task}
                      </p>
                      <p className="text-xs text-[#718096]">
                        <span className="font-medium">My task:</span> {dep.my_task}
                      </p>
                      <span className={`inline-block mt-2 px-2 py-1 rounded-[6px] text-xs font-medium ${
                        dep.my_task_status === 'in_progress' ? 'bg-[#6b8cce] text-white' :
                        dep.my_task_status === 'blocked' ? 'bg-[#fc8181] text-white' :
                        'bg-[#ffd93d] text-[#2d3748]'
                      }`}>
                        {dep.my_task_status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-sm text-[#718096]">
                <Icon icon="mdi:check-circle" width={32} height={32} className="text-[#48bb78] mx-auto mb-2" />
                No one is blocked by your work!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Work Logs */}
      <div className="bg-[#f8f9fb] rounded-[16px] p-5 border border-[#e2e8f0] mb-6">
        <h3 className="text-base font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
          <Icon icon="mdi:history" width={18} height={18} className="text-[#2d3748]" />
          Recent Work Logs ({workLogs.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {workLogs.length > 0 ? (
            workLogs.slice(0, 12).map((log, idx) => (
              <div key={idx} className="bg-[#f8f9fb] rounded-[10px] p-3 border border-[#e2e8f0]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-[#4a5568]">
                    {new Date(log.log_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="text-sm font-bold text-[#6b8cce]">{Number(log.hours_logged).toFixed(2)}h</span>
                </div>
                <p className="text-xs text-[#718096] mb-1 truncate" title={log.task_title}>
                  {log.task_title || 'No task'}
                </p>
                <p className="text-xs text-[#9ca3af] truncate" title={log.description}>
                  {log.description || 'No description'}
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-sm text-[#718096]">No work logs yet</div>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-[#f8f9fb] rounded-[16px] p-5 border border-[#e2e8f0]">
        <h3 className="text-base font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
          <Icon icon="mdi:chart-box" width={18} height={18} className="text-[#6b8cce]" />
          Performance Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#f8f9fb] rounded-[12px] p-4 border border-[#e2e8f0]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#718096]">Completion Rate</span>
              <Icon icon="mdi:check-circle" width={18} height={18} className="text-[#48bb78]" />
            </div>
            <p className="text-2xl font-bold text-[#2d3748]">
              {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
            </p>
            <p className="text-xs text-[#718096] mt-1">
              {stats.completedTasks} of {stats.totalTasks} tasks
            </p>
          </div>

          <div className="bg-[#f8f9fb] rounded-[12px] p-4 border border-[#e2e8f0]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#718096]">Estimation Accuracy</span>
              <Icon icon="mdi:target" width={18} height={18} className="text-[#6b8cce]" />
            </div>
            <p className="text-2xl font-bold text-[#2d3748]">{getEstimationAccuracy()}%</p>
            <p className="text-xs text-[#718096] mt-1">
              {(stats.actualHours || 0).toFixed(0)}h actual vs {(stats.estimatedHours || 0).toFixed(0)}h estimated
            </p>
          </div>

          <div className="bg-[#f8f9fb] rounded-[12px] p-4 border border-[#e2e8f0]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#718096]">Active Projects</span>
              <Icon icon="mdi:folder-multiple" width={18} height={18} className="text-[#ffd93d]" />
            </div>
            <p className="text-2xl font-bold text-[#2d3748]">{projectContributions.length}</p>
            <p className="text-xs text-[#718096] mt-1">Contributing to</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserAnalyticsDashboard
