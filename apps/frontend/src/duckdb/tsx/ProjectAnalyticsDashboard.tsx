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

interface ProjectAnalyticsDashboardProps {
  projectId: number
}

interface Project {
  id: number
  name: string
  code_name: string
  status: string
  priority: string
  start_date: string
  target_end_date: string
  actual_end_date: string | null
  budget_allocated: number
  budget_consumed: number
  risk_score: number
  compliance_required: boolean
  client_facing: boolean
}

interface Milestone {
  id: number
  name: string
  due_date: string
  status: string
  completion_percentage: number
  is_critical_path: boolean
  health_status: string
  task_count: number
}

interface Task {
  id: number
  title: string
  status: string
  priority: string
  assigned_to_name: string
  due_date: string
}

interface TeamMember {
  user_id: number
  full_name: string
  role: string
  task_count: number
  total_hours: number
}

const ProjectAnalyticsDashboard: React.FC<ProjectAnalyticsDashboardProps> = ({ projectId }) => {
  const [project, setProject] = useState<Project | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [taskStatusData, setTaskStatusData] = useState<any[]>([])
  const [taskPriorityData, setTaskPriorityData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [echartsLoaded, setEchartsLoaded] = useState<boolean>(false)

  // Chart refs
  const statusChartRef = useRef<HTMLDivElement>(null)
  const priorityChartRef = useRef<HTMLDivElement>(null)
  const milestoneChartRef = useRef<HTMLDivElement>(null)
  const teamChartRef = useRef<HTMLDivElement>(null)

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
    loadProjectData()
  }, [projectId])

  useEffect(() => {
    if (project && echartsLoaded && !isLoading) {
      setTimeout(() => {
        if (taskStatusData.length > 0) renderStatusChart()
        if (taskPriorityData.length > 0) renderPriorityChart()
        if (milestones.length > 0) renderMilestoneChart()
        if (teamMembers.length > 0) renderTeamChart()
      }, 100)
    }
  }, [project, taskStatusData, taskPriorityData, milestones, teamMembers, echartsLoaded, isLoading])

  const loadProjectData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Get project info
      const projectResult = await queryExecutor.executeQuery(`
        SELECT * FROM ddb.projects WHERE id = ${projectId}
      `)

      if (!projectResult || !projectResult.data || projectResult.data.length === 0) {
        setError('Project not found')
        setIsLoading(false)
        return
      }

      const projectData = projectResult.data[0]
      setProject({
        ...projectData,
        budget_allocated: Number(projectData.budget_allocated || 0),
        budget_consumed: Number(projectData.budget_consumed || 0),
        risk_score: Number(projectData.risk_score || 0)
      })

      // Get milestones
      const milestonesResult = await queryExecutor.executeQuery(`
        SELECT
          m.*,
          COUNT(t.id) as task_count
        FROM ddb.milestones m
        LEFT JOIN ddb.tasks t ON m.id = t.milestone_id
        WHERE m.project_id = ${projectId}
        GROUP BY m.id, m.name, m.due_date, m.status, m.completion_percentage,
                 m.is_critical_path, m.health_status, m.project_id
        ORDER BY m.due_date
      `)
      setMilestones(milestonesResult.data.map((m: any) => ({
        ...m,
        task_count: Number(m.task_count || 0),
        completion_percentage: Number(m.completion_percentage || 0)
      })))

      // Get task status breakdown
      const statusResult = await queryExecutor.executeQuery(`
        SELECT t.status, COUNT(*) as count
        FROM ddb.tasks t
        JOIN ddb.milestones m ON t.milestone_id = m.id
        WHERE m.project_id = ${projectId}
        GROUP BY t.status
      `)
      setTaskStatusData(statusResult.data.map((item: any) => ({
        status: item.status,
        count: Number(item.count)
      })))

      // Get task priority breakdown
      const priorityResult = await queryExecutor.executeQuery(`
        SELECT t.priority, COUNT(*) as count
        FROM ddb.tasks t
        JOIN ddb.milestones m ON t.milestone_id = m.id
        WHERE m.project_id = ${projectId}
        GROUP BY t.priority
      `)
      setTaskPriorityData(priorityResult.data.map((item: any) => ({
        priority: item.priority,
        count: Number(item.count)
      })))

      // Get recent tasks
      const tasksResult = await queryExecutor.executeQuery(`
        SELECT
          t.id,
          t.title,
          t.status,
          t.priority,
          t.due_date,
          u.full_name as assigned_to_name
        FROM ddb.tasks t
        JOIN ddb.milestones m ON t.milestone_id = m.id
        LEFT JOIN ddb.users u ON t.assigned_to = u.id
        WHERE m.project_id = ${projectId}
        ORDER BY t.due_date
        LIMIT 10
      `)
      setTasks(tasksResult.data)

      // Get team members and their workload
      const teamResult = await queryExecutor.executeQuery(`
        SELECT
          u.id as user_id,
          u.full_name,
          u.role,
          COUNT(DISTINCT t.id) as task_count,
          SUM(COALESCE(t.estimated_hours, 0)) as total_hours
        FROM ddb.tasks t
        JOIN ddb.milestones m ON t.milestone_id = m.id
        JOIN ddb.users u ON t.assigned_to = u.id
        WHERE m.project_id = ${projectId}
        GROUP BY u.id, u.full_name, u.role
        ORDER BY task_count DESC
      `)
      setTeamMembers(teamResult.data.map((tm: any) => ({
        ...tm,
        task_count: Number(tm.task_count || 0),
        total_hours: Number(tm.total_hours || 0)
      })))

    } catch (e) {
      console.error('Error loading project data:', e)
      setError('Failed to load project data')
      toast.error('Failed to load project data')
    } finally {
      setIsLoading(false)
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

  const renderMilestoneChart = () => {
    if (!milestoneChartRef.current || !window.echarts || milestones.length === 0) return

    const chart = window.echarts.init(milestoneChartRef.current)

    const names = milestones.map(m => m.name.length > 20 ? m.name.substring(0, 20) + '...' : m.name)
    const percentages = milestones.map(m => m.completion_percentage)

    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: { color: '#2d3748' },
        axisPointer: { type: 'shadow' }
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
        data: names,
        axisLabel: {
          color: '#718096',
          fontSize: 10,
          rotate: 30
        },
        axisLine: { lineStyle: { color: '#e2e8f0' } }
      },
      yAxis: {
        type: 'value',
        name: 'Progress %',
        max: 100,
        axisLabel: { color: '#718096', fontSize: 10 },
        splitLine: { lineStyle: { color: '#e2e8f0' } }
      },
      series: [
        {
          name: 'Completion',
          type: 'bar',
          data: percentages,
          itemStyle: {
            color: '#6b8cce',
            borderRadius: [6, 6, 0, 0]
          }
        }
      ]
    }

    chart.setOption(option)

    const resizeObserver = new ResizeObserver(() => chart.resize())
    resizeObserver.observe(milestoneChartRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.dispose()
    }
  }

  const renderTeamChart = () => {
    if (!teamChartRef.current || !window.echarts || teamMembers.length === 0) return

    const chart = window.echarts.init(teamChartRef.current)

    const names = teamMembers.map(tm => tm.full_name)
    const hours = teamMembers.map(tm => tm.total_hours)

    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: { color: '#2d3748' },
        axisPointer: { type: 'shadow' }
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
        data: names,
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
          name: 'Estimated Hours',
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
    resizeObserver.observe(teamChartRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.dispose()
    }
  }

  const updateProjectStatus = async (status: string) => {
    if (!project) return

    try {
      await queryExecutor.executeQuery(`
        UPDATE ddb.projects
        SET status = '${status}'
        WHERE id = ${projectId}
      `)

      setProject({ ...project, status })
      toast.success(`Project status updated to "${status}"`, {
        duration: 3000,
        position: 'top-center',
        icon: '✅',
      })
    } catch (e) {
      console.error('Error updating status:', e)
      toast.error('Failed to update project status')
    }
  }

  const updateProjectPriority = async (priority: string) => {
    if (!project) return

    try {
      await queryExecutor.executeQuery(`
        UPDATE ddb.projects
        SET priority = '${priority}'
        WHERE id = ${projectId}
      `)

      setProject({ ...project, priority })
      toast.success(`Project priority updated to "${priority}"`, {
        duration: 3000,
        position: 'top-center',
        icon: '🔥',
      })
    } catch (e) {
      console.error('Error updating priority:', e)
      toast.error('Failed to update project priority')
    }
  }

  const resetBudget = async () => {
    if (!project) return

    const newBudgetInput = prompt(`Current budget: $${Number(project.budget_allocated).toLocaleString()}\n\nEnter new budget amount:`)
    if (!newBudgetInput) return

    const newBudget = parseFloat(newBudgetInput)
    if (isNaN(newBudget) || newBudget < 0) {
      toast.error('Invalid amount')
      return
    }

    try {
      await queryExecutor.executeQuery(`
        UPDATE ddb.projects
        SET budget_allocated = ${newBudget}
        WHERE id = ${projectId}
      `)

      // Update local state immediately without reloading from DB
      setProject({ ...project, budget_allocated: newBudget })

      toast.success(`Budget set to $${newBudget.toLocaleString()}`, {
        duration: 3000,
        position: 'top-center',
        icon: '💰',
      })
    } catch (e) {
      console.error('Error resetting budget:', e)
      toast.error('Failed to reset budget')
    }
  }

  const archiveProject = async () => {
    if (!project) return

    const confirmed = window.confirm(`Are you sure you want to archive "${project.name}"?\n\nThis will set the status to "cancelled".`)
    if (!confirmed) return

    try {
      await queryExecutor.executeQuery(`
        UPDATE ddb.projects
        SET status = 'cancelled'
        WHERE id = ${projectId}
      `)

      setProject({ ...project, status: 'cancelled' })
      toast.success('Project archived successfully', {
        duration: 3000,
        position: 'top-center',
        icon: '📦',
      })
    } catch (e) {
      console.error('Error archiving project:', e)
      toast.error('Failed to archive project')
    }
  }

  const toggleCompliance = async () => {
    if (!project) return

    try {
      const newCompliance = !project.compliance_required
      await queryExecutor.executeQuery(`
        UPDATE ddb.projects
        SET compliance_required = ${newCompliance}
        WHERE id = ${projectId}
      `)

      setProject({ ...project, compliance_required: newCompliance })
      toast.success(`Compliance ${newCompliance ? 'enabled' : 'disabled'}`, {
        duration: 3000,
        position: 'top-center',
        icon: newCompliance ? '🔒' : '🔓',
      })
    } catch (e) {
      console.error('Error toggling compliance:', e)
      toast.error('Failed to toggle compliance')
    }
  }

  const updateRiskScore = async () => {
    if (!project) return

    const newScore = prompt(`Current risk score: ${project.risk_score}/10\n\nEnter new risk score (0-10):`)
    if (!newScore) return

    const score = parseInt(newScore)
    if (isNaN(score) || score < 0 || score > 10) {
      toast.error('Risk score must be between 0 and 10')
      return
    }

    try {
      await queryExecutor.executeQuery(`
        UPDATE ddb.projects
        SET risk_score = ${score}
        WHERE id = ${projectId}
      `)

      setProject({ ...project, risk_score: score })
      toast.success(`Risk score updated to ${score}/10`, {
        duration: 3000,
        position: 'top-center',
        icon: score >= 8 ? '🔴' : score >= 5 ? '🟡' : '🟢',
      })
      loadProjectData() // Reload to update stats
    } catch (e) {
      console.error('Error updating risk score:', e)
      toast.error('Failed to update risk score')
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'active': 'bg-[#6b8cce] text-white',
      'planning': 'bg-[#ffd93d] text-[#2d3748]',
      'on_hold': 'bg-[#9b8cce] text-white',
      'completed': 'bg-[#48bb78] text-white',
      'cancelled': 'bg-[#fc8181] text-white'
    }
    return colors[status] || 'bg-[#718096] text-white'
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'critical': 'text-[#fc8181]',
      'high': 'text-[#f6ad55]',
      'medium': 'text-[#ffd93d]',
      'low': 'text-[#6bcf7f]'
    }
    return colors[priority] || 'text-[#718096]'
  }

  const getHealthColor = (health: string) => {
    const colors: Record<string, string> = {
      'green': 'bg-[#48bb78]',
      'yellow': 'bg-[#ffd93d]',
      'red': 'bg-[#fc8181]'
    }
    return colors[health] || 'bg-[#718096]'
  }

  const getBudgetUtilization = () => {
    if (!project || project.budget_allocated === 0) return 0
    return Math.round((project.budget_consumed / project.budget_allocated) * 100)
  }

  const getOverallProgress = () => {
    if (milestones.length === 0) return 0
    const totalProgress = milestones.reduce((sum, m) => sum + m.completion_percentage, 0)
    return Math.round(totalProgress / milestones.length)
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8">
        <div className="flex items-center justify-center gap-3 py-12">
          <div className="w-6 h-6 border-2 border-[#6b8cce] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#718096]">Loading project data...</span>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8">
        <div className="text-center py-12">
          <Icon icon="mdi:alert-circle" width={48} height={48} className="text-[#fc8181] mx-auto mb-4" />
          <p className="text-[#fc8181] font-medium">{error || 'Project not found'}</p>
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
              <Icon icon="mdi:folder-open" width={32} height={32} className="text-[#2d3748]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#2d3748] mb-1">{project.name}</h2>
              <p className="text-sm text-[#718096] mb-2">Code: {project.code_name}</p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-3 py-1 rounded-[8px] text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className={`px-3 py-1 bg-[#f8f9fb] rounded-[8px] text-xs font-semibold ${getPriorityColor(project.priority)}`}>
                  {project.priority.toUpperCase()} PRIORITY
                </span>
                {project.client_facing && (
                  <span className="px-3 py-1 bg-[#6b8cce] bg-opacity-10 rounded-[8px] text-xs font-medium text-[#2d3748]">
                    CLIENT FACING
                  </span>
                )}
                {project.compliance_required && (
                  <span className="px-3 py-1 bg-[#fc8181] bg-opacity-10 rounded-[8px] text-xs font-medium text-[#2d3748]">
                    COMPLIANCE REQUIRED
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-[#6b8cce] to-[#5a7ab8] rounded-[16px] p-5">
          <div className="flex items-center gap-3 mb-2">
            <Icon icon="mdi:chart-donut" width={24} height={24} className="text-white opacity-90" />
            <div className="text-sm text-white opacity-90">Progress</div>
          </div>
          <div className="font-bold text-3xl text-white">{getOverallProgress()}%</div>
          <div className="text-xs text-white opacity-75 mt-1">{milestones.length} milestones</div>
        </div>

        <div className="bg-gradient-to-br from-[#6bcf7f] to-[#48bb78] rounded-[16px] p-5">
          <div className="flex items-center gap-3 mb-2">
            <Icon icon="mdi:currency-usd" width={24} height={24} className="text-white opacity-90" />
            <div className="text-sm text-white opacity-90">Budget</div>
          </div>
          <div className="font-bold text-3xl text-white">{getBudgetUtilization()}%</div>
          <div className="text-xs text-white opacity-75 mt-1">
            ${project.budget_consumed.toLocaleString()} / ${project.budget_allocated.toLocaleString()}
          </div>
        </div>

        <div className={`bg-gradient-to-br rounded-[16px] p-5 ${
          project.risk_score >= 8 ? 'from-[#fc8181] to-[#e57373]' :
          project.risk_score >= 5 ? 'from-[#ffd93d] to-[#f6ad55]' : 'from-[#6bcf7f] to-[#48bb78]'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <Icon icon="mdi:alert-circle" width={24} height={24} className="text-white opacity-90" />
            <div className="text-sm text-white opacity-90">Risk Score</div>
          </div>
          <div className="font-bold text-3xl text-white">{project.risk_score}/10</div>
          <div className="text-xs text-white opacity-75 mt-1">
            {project.risk_score >= 8 ? 'High Risk' : project.risk_score >= 5 ? 'Medium Risk' : 'Low Risk'}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#9b8cce] to-[#8574b8] rounded-[16px] p-5">
          <div className="flex items-center gap-3 mb-2">
            <Icon icon="mdi:account-group" width={24} height={24} className="text-white opacity-90" />
            <div className="text-sm text-white opacity-90">Team</div>
          </div>
          <div className="font-bold text-3xl text-white">{teamMembers.length}</div>
          <div className="text-xs text-white opacity-75 mt-1">{tasks.length} active tasks</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[#f8f9fb] rounded-[16px] p-5 border border-[#e2e8f0] mb-6">
        <h3 className="text-base font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
          <Icon icon="mdi:lightning-bolt" width={18} height={18} className="text-[#2d3748]" />
          Quick Actions
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Actions */}
            <div>
              <label className="text-xs font-medium text-[#718096] mb-2 block">Update Status</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updateProjectStatus('active')}
                  className="px-3 py-1.5 bg-[#6b8cce] text-white rounded-[8px] text-xs font-medium hover:bg-[#5a7ab8] transition-all duration-200"
                >
                  Active
                </button>
                <button
                  onClick={() => updateProjectStatus('on_hold')}
                  className="px-3 py-1.5 bg-[#9b8cce] text-white rounded-[8px] text-xs font-medium hover:bg-[#8574b8] transition-all duration-200"
                >
                  On Hold
                </button>
                <button
                  onClick={() => updateProjectStatus('completed')}
                  className="px-3 py-1.5 bg-[#48bb78] text-white rounded-[8px] text-xs font-medium hover:bg-[#38a169] transition-all duration-200"
                >
                  Complete
                </button>
              </div>
            </div>

            {/* Priority Actions */}
            <div>
              <label className="text-xs font-medium text-[#718096] mb-2 block">Update Priority</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updateProjectPriority('critical')}
                  className="px-3 py-1.5 bg-[#fc8181] text-white rounded-[8px] text-xs font-medium hover:bg-[#e57373] transition-all duration-200"
                >
                  Critical
                </button>
                <button
                  onClick={() => updateProjectPriority('high')}
                  className="px-3 py-1.5 bg-[#f6ad55] text-white rounded-[8px] text-xs font-medium hover:bg-[#ed8936] transition-all duration-200"
                >
                  High
                </button>
                <button
                  onClick={() => updateProjectPriority('medium')}
                  className="px-3 py-1.5 bg-[#ffd93d] text-[#2d3748] rounded-[8px] text-xs font-medium hover:bg-[#f6ad55] transition-all duration-200"
                >
                  Medium
                </button>
                <button
                  onClick={() => updateProjectPriority('low')}
                  className="px-3 py-1.5 bg-[#6bcf7f] text-white rounded-[8px] text-xs font-medium hover:bg-[#48bb78] transition-all duration-200"
                >
                  Low
                </button>
              </div>
            </div>
          </div>

          {/* Additional Actions */}
          <div>
            <label className="text-xs font-medium text-[#718096] mb-2 block">Project Management</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={resetBudget}
                className="px-3 py-1.5 bg-[#6b8cce] text-white rounded-[8px] text-xs font-medium hover:bg-[#5a7ab8] transition-all duration-200 flex items-center gap-1"
              >
                <Icon icon="mdi:currency-usd" width={14} height={14} />
                Set Budget
              </button>
              <button
                onClick={updateRiskScore}
                className="px-3 py-1.5 bg-[#ffd93d] text-[#2d3748] rounded-[8px] text-xs font-medium hover:bg-[#f6ad55] transition-all duration-200 flex items-center gap-1"
              >
                <Icon icon="mdi:alert-circle" width={14} height={14} />
                Update Risk
              </button>
              <button
                onClick={toggleCompliance}
                className="px-3 py-1.5 bg-[#9b8cce] text-white rounded-[8px] text-xs font-medium hover:bg-[#8574b8] transition-all duration-200 flex items-center gap-1"
              >
                <Icon icon={project.compliance_required ? "mdi:lock-open" : "mdi:lock"} width={14} height={14} />
                {project.compliance_required ? 'Disable' : 'Enable'} Compliance
              </button>
              <button
                onClick={archiveProject}
                className="px-3 py-1.5 bg-[#fc8181] text-white rounded-[8px] text-xs font-medium hover:bg-[#e57373] transition-all duration-200 flex items-center gap-1"
              >
                <Icon icon="mdi:archive" width={14} height={14} />
                Archive Project
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Task Status */}
        <div className="bg-[#f8f9fb] rounded-[16px] p-5 border border-[#e2e8f0]">
          <h3 className="text-base font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
            <Icon icon="mdi:chart-donut" width={18} height={18} className="text-[#2d3748]" />
            Task Status Distribution
          </h3>
          <div ref={statusChartRef} style={{ width: '100%', height: '300px' }}></div>
        </div>

        {/* Task Priority */}
        <div className="bg-[#f8f9fb] rounded-[16px] p-5 border border-[#e2e8f0]">
          <h3 className="text-base font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
            <Icon icon="mdi:flag" width={18} height={18} className="text-[#2d3748]" />
            Task Priority Breakdown
          </h3>
          <div ref={priorityChartRef} style={{ width: '100%', height: '300px' }}></div>
        </div>

        {/* Milestone Progress */}
        <div className="bg-[#f8f9fb] rounded-[16px] p-5 border border-[#e2e8f0]">
          <h3 className="text-base font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
            <Icon icon="mdi:flag-checkered" width={18} height={18} className="text-[#2d3748]" />
            Milestone Progress
          </h3>
          <div ref={milestoneChartRef} style={{ width: '100%', height: '300px' }}></div>
        </div>

        {/* Team Workload */}
        <div className="bg-[#f8f9fb] rounded-[16px] p-5 border border-[#e2e8f0]">
          <h3 className="text-base font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
            <Icon icon="mdi:account-multiple" width={18} height={18} className="text-[#2d3748]" />
            Team Workload (Estimated Hours)
          </h3>
          <div ref={teamChartRef} style={{ width: '100%', height: '300px' }}></div>
        </div>
      </div>

      {/* Milestones & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Milestones */}
        <div className="bg-[#f8f9fb] rounded-[16px] p-5 border border-[#e2e8f0]">
          <h3 className="text-base font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
            <Icon icon="mdi:timeline" width={18} height={18} className="text-[#2d3748]" />
            Milestones ({milestones.length})
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {milestones.length > 0 ? (
              milestones.map(milestone => (
                <div key={milestone.id} className="bg-[#f8f9fb] rounded-[12px] p-4 border border-[#e2e8f0]">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#2d3748] mb-1">{milestone.name}</p>
                      <p className="text-xs text-[#718096]">
                        Due: {new Date(milestone.due_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${getHealthColor(milestone.health_status)}`}></div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 bg-[#e2e8f0] rounded-full h-2">
                      <div
                        className="bg-[#6b8cce] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${milestone.completion_percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-bold text-[#2d3748]">{milestone.completion_percentage}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-2 py-1 rounded-[6px] ${getStatusColor(milestone.status)} text-[10px]`}>
                      {milestone.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-[#718096]">{milestone.task_count} tasks</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-sm text-[#718096]">No milestones</div>
            )}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-[#f8f9fb] rounded-[16px] p-5 border border-[#e2e8f0]">
          <h3 className="text-base font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
            <Icon icon="mdi:format-list-checks" width={18} height={18} className="text-[#2d3748]" />
            Recent Tasks ({tasks.length})
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {tasks.length > 0 ? (
              tasks.map(task => (
                <div key={task.id} className="bg-[#f8f9fb] rounded-[10px] p-3 border border-[#e2e8f0]">
                  <p className="text-sm font-medium text-[#2d3748] mb-1 truncate" title={task.title}>
                    {task.title}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-[6px] text-[10px] font-medium ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={`text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-[#718096]">{task.assigned_to_name}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-sm text-[#718096]">No tasks</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectAnalyticsDashboard
