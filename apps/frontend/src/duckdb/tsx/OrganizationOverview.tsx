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

interface OrganizationOverviewProps {
  organizationId: number
}

interface Organization {
  id: number
  name: string
  created_at: string
}

interface Department {
  id: number
  name: string
  type: string
  user_count: number
  team_count: number
  project_count: number
}

interface Team {
  id: number
  name: string
  department_name: string
  member_count: number
  lead_name: string
}

interface DepartmentWorkload {
  department_name: string
  total_tasks: number
  total_estimated_hours: number
  active_tasks: number
}

interface GrowthData {
  month: string
  department_name: string
  user_count: number
}

const OrganizationOverview: React.FC<OrganizationOverviewProps> = ({ organizationId = 1 }) => {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [departmentWorkload, setDepartmentWorkload] = useState<DepartmentWorkload[]>([])
  const [growthData, setGrowthData] = useState<GrowthData[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [echartsLoaded, setEchartsLoaded] = useState<boolean>(false)

  // Chart refs
  const hierarchyChartRef = useRef<HTMLDivElement>(null)
  const teamSizeChartRef = useRef<HTMLDivElement>(null)
  const workloadChartRef = useRef<HTMLDivElement>(null)
  const growthChartRef = useRef<HTMLDivElement>(null)

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
    loadOrganizationData()
  }, [organizationId])

  useEffect(() => {
    if (echartsLoaded && !isLoading) {
      setTimeout(() => {
        if (departments.length > 0) renderHierarchyChart()
        if (teams.length > 0) renderTeamSizeChart()
        if (departmentWorkload.length > 0) renderWorkloadChart()
        if (growthData.length > 0) renderGrowthChart()
      }, 100)
    }
  }, [departments, teams, departmentWorkload, growthData, echartsLoaded, isLoading])

  const loadOrganizationData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Get organization info
      const orgResult = await queryExecutor.executeQuery(`
        SELECT * FROM ddb.organizations WHERE id = ${organizationId}
      `)

      if (!orgResult || !orgResult.data || orgResult.data.length === 0) {
        setError('Organization not found')
        setIsLoading(false)
        return
      }

      setOrganization(orgResult.data[0])

      // Get departments with counts
      const deptResult = await queryExecutor.executeQuery(`
        SELECT
          d.id,
          d.name,
          d.type,
          COUNT(DISTINCT u.id) as user_count,
          COUNT(DISTINCT t.id) as team_count,
          COALESCE((
            SELECT COUNT(DISTINCT p.id)
            FROM ddb.projects p
            JOIN ddb.milestones m ON p.id = m.project_id
            JOIN ddb.tasks tk ON m.id = tk.milestone_id
            JOIN ddb.users u2 ON tk.assigned_to = u2.id
            WHERE u2.department_id = d.id
              AND tk.assigned_to IS NOT NULL
          ), 0) as project_count
        FROM ddb.departments d
        LEFT JOIN ddb.users u ON d.id = u.department_id
        LEFT JOIN ddb.teams t ON d.id = t.department_id
        WHERE d.organization_id = ${organizationId}
        GROUP BY d.id, d.name, d.type
        ORDER BY user_count DESC
      `)

      setDepartments(deptResult.data.map((row: any) => ({
        id: Number(row.id),
        name: row.name,
        type: row.type,
        user_count: Number(row.user_count),
        team_count: Number(row.team_count),
        project_count: Number(row.project_count)
      })))

      // Get teams with member counts
      const teamResult = await queryExecutor.executeQuery(`
        SELECT
          t.id,
          t.name,
          d.name as department_name,
          COUNT(DISTINCT tm.user_id) as member_count,
          u.full_name as lead_name
        FROM ddb.teams t
        LEFT JOIN ddb.departments d ON t.department_id = d.id
        LEFT JOIN ddb.team_members tm ON t.id = tm.team_id
        LEFT JOIN ddb.users u ON t.lead_user_id = u.id
        WHERE d.organization_id = ${organizationId}
        GROUP BY t.id, t.name, d.name, u.full_name
        ORDER BY member_count DESC
      `)

      setTeams(teamResult.data.map((row: any) => ({
        id: Number(row.id),
        name: row.name,
        department_name: row.department_name,
        member_count: Number(row.member_count),
        lead_name: row.lead_name || 'No lead assigned'
      })))

      // Get department workload (total tasks and hours)
      const workloadResult = await queryExecutor.executeQuery(`
        SELECT
          d.name as department_name,
          COUNT(DISTINCT t.id) as total_tasks,
          COALESCE(SUM(t.estimated_hours), 0) as total_estimated_hours,
          COUNT(DISTINCT CASE WHEN t.status IN ('todo', 'in_progress', 'blocked', 'in_review') THEN t.id END) as active_tasks
        FROM ddb.departments d
        LEFT JOIN ddb.users u ON d.id = u.department_id
        LEFT JOIN ddb.tasks t ON u.id = t.assigned_to
        WHERE d.organization_id = ${organizationId}
        GROUP BY d.id, d.name
        ORDER BY total_estimated_hours DESC
      `)

      setDepartmentWorkload(workloadResult.data.map((row: any) => ({
        department_name: row.department_name,
        total_tasks: Number(row.total_tasks),
        total_estimated_hours: Number(row.total_estimated_hours),
        active_tasks: Number(row.active_tasks)
      })))

      // Get growth data (users added over time - simulated monthly data based on created_at)
      const growthResult = await queryExecutor.executeQuery(`
        SELECT
          strftime(u.created_at, '%Y-%m') as month,
          d.name as department_name,
          COUNT(*) as user_count
        FROM ddb.users u
        JOIN ddb.departments d ON u.department_id = d.id
        WHERE d.organization_id = ${organizationId}
        GROUP BY strftime(u.created_at, '%Y-%m'), d.name
        ORDER BY month ASC
      `)

      setGrowthData(growthResult.data.map((row: any) => ({
        month: row.month,
        department_name: row.department_name,
        user_count: Number(row.user_count)
      })))

      setIsLoading(false)
    } catch (e) {
      console.error('Error loading organization data:', e)
      setError('Failed to load organization data')
      setIsLoading(false)
    }
  }

  const renderHierarchyChart = () => {
    if (!hierarchyChartRef.current || !window.echarts) return

    const chart = window.echarts.init(hierarchyChartRef.current)

    // Build hierarchy tree data
    const treeData = {
      name: organization?.name || 'Organization',
      children: departments.map(dept => ({
        name: `${dept.name}\n(${dept.user_count} users)`,
        value: dept.user_count,
        itemStyle: {
          color: getDepartmentColor(dept.type)
        }
      }))
    }

    chart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} users'
      },
      series: [{
        type: 'tree',
        data: [treeData],
        top: '5%',
        left: '20%',
        bottom: '5%',
        right: '20%',
        symbolSize: 12,
        label: {
          position: 'left',
          verticalAlign: 'middle',
          align: 'right',
          fontSize: 11
        },
        leaves: {
          label: {
            position: 'right',
            verticalAlign: 'middle',
            align: 'left'
          }
        },
        emphasis: {
          focus: 'descendant'
        },
        expandAndCollapse: true,
        animationDuration: 550,
        animationDurationUpdate: 750
      }]
    })
  }

  const renderTeamSizeChart = () => {
    if (!teamSizeChartRef.current || !window.echarts) return

    const chart = window.echarts.init(teamSizeChartRef.current)

    const teamNames = teams.map(t => t.name)
    const memberCounts = teams.map(t => t.member_count)

    chart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: { color: '#2d3748' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        name: 'Members',
        nameLocation: 'middle',
        nameGap: 30,
        nameTextStyle: {
          color: '#718096',
          fontSize: 11,
          fontWeight: 500
        },
        axisLabel: {
          color: '#718096',
          fontSize: 10
        },
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        splitLine: { lineStyle: { color: '#e2e8f0' } }
      },
      yAxis: {
        type: 'category',
        data: teamNames,
        axisLabel: {
          interval: 0,
          fontSize: 10,
          color: '#718096'
        },
        axisLine: { lineStyle: { color: '#e2e8f0' } }
      },
      series: [{
        name: 'Team Size',
        type: 'bar',
        data: memberCounts,
        itemStyle: {
          color: '#6b8cce',
          borderRadius: [0, 6, 6, 0]
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}',
          color: '#2d3748',
          fontSize: 10,
          fontWeight: 600
        }
      }]
    })

    const resizeObserver = new ResizeObserver(() => chart.resize())
    resizeObserver.observe(teamSizeChartRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.dispose()
    }
  }

  const renderWorkloadChart = () => {
    if (!workloadChartRef.current || !window.echarts) return

    const chart = window.echarts.init(workloadChartRef.current)

    const deptNames = departmentWorkload.map(w => w.department_name)
    const totalHours = departmentWorkload.map(w => w.total_estimated_hours)
    const activeTasks = departmentWorkload.map(w => w.active_tasks)

    chart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: { color: '#2d3748' }
      },
      legend: {
        data: ['Estimated Hours', 'Active Tasks'],
        top: '0%',
        textStyle: { color: '#718096', fontSize: 11 }
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
        data: deptNames,
        axisLabel: {
          color: '#718096',
          fontSize: 10,
          rotate: 30
        },
        axisLine: { lineStyle: { color: '#e2e8f0' } }
      },
      yAxis: [
        {
          type: 'value',
          name: 'Hours',
          position: 'left',
          axisLabel: { color: '#718096', fontSize: 10 },
          splitLine: { lineStyle: { color: '#e2e8f0' } },
          nameTextStyle: { color: '#718096', fontSize: 10 }
        },
        {
          type: 'value',
          name: 'Tasks',
          position: 'right',
          axisLabel: { color: '#718096', fontSize: 10 },
          splitLine: { show: false },
          nameTextStyle: { color: '#718096', fontSize: 10 }
        }
      ],
      series: [
        {
          name: 'Estimated Hours',
          type: 'bar',
          data: totalHours,
          itemStyle: {
            color: '#6b8cce',
            borderRadius: [6, 6, 0, 0]
          }
        },
        {
          name: 'Active Tasks',
          type: 'line',
          yAxisIndex: 1,
          data: activeTasks,
          itemStyle: { color: '#6bcf7f' },
          lineStyle: { width: 3 },
          symbol: 'circle',
          symbolSize: 8
        }
      ]
    })

    const resizeObserver = new ResizeObserver(() => chart.resize())
    resizeObserver.observe(workloadChartRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.dispose()
    }
  }

  const renderGrowthChart = () => {
    if (!growthChartRef.current || !window.echarts) return

    const chart = window.echarts.init(growthChartRef.current)

    // Group data by department
    const departmentMap = new Map<string, { months: string[], counts: number[] }>()

    growthData.forEach(item => {
      if (!departmentMap.has(item.department_name)) {
        departmentMap.set(item.department_name, { months: [], counts: [] })
      }
      const dept = departmentMap.get(item.department_name)!
      dept.months.push(item.month)
      dept.counts.push(item.user_count)
    })

    // Get all unique months sorted
    const allMonths = Array.from(new Set(growthData.map(d => d.month))).sort()

    // Create series for each department
    const series = Array.from(departmentMap.entries()).map(([deptName, data], index) => {
      const colors = ['#6b8cce', '#6bcf7f', '#ffd93d', '#9b8cce', '#fc8181', '#f6ad55', '#5ba3d0']
      return {
        name: deptName,
        type: 'line',
        data: data.counts,
        smooth: true,
        itemStyle: { color: colors[index % colors.length] },
        lineStyle: { width: 2 },
        symbol: 'circle',
        symbolSize: 6
      }
    })

    chart.setOption({
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: { color: '#2d3748' }
      },
      legend: {
        data: Array.from(departmentMap.keys()),
        top: '0%',
        textStyle: { color: '#718096', fontSize: 10 }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: allMonths,
        axisLabel: {
          color: '#718096',
          fontSize: 10,
          rotate: 30
        },
        axisLine: { lineStyle: { color: '#e2e8f0' } }
      },
      yAxis: {
        type: 'value',
        name: 'Users Added',
        nameLocation: 'middle',
        nameGap: 40,
        nameTextStyle: { color: '#718096', fontSize: 11 },
        axisLabel: { color: '#718096', fontSize: 10 },
        splitLine: { lineStyle: { color: '#e2e8f0' } }
      },
      series: series
    })

    const resizeObserver = new ResizeObserver(() => chart.resize())
    resizeObserver.observe(growthChartRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.dispose()
    }
  }

  const addNewDepartment = async () => {
    const deptName = prompt('Enter new department name:')
    if (!deptName || !deptName.trim()) {
      toast.error('Department name is required')
      return
    }

    const deptType = prompt(
      'Enter department type:\n\n' +
      'Options: engineering, design, product, sales, operations, finance, compliance, hr, marketing, legal'
    )
    if (!deptType || !deptType.trim()) {
      toast.error('Department type is required')
      return
    }

    const validTypes = ['engineering', 'design', 'product', 'sales', 'operations', 'finance', 'compliance', 'hr', 'marketing', 'legal']
    const normalizedType = deptType.toLowerCase().trim()

    if (!validTypes.includes(normalizedType)) {
      toast.error(`Invalid type. Must be one of: ${validTypes.join(', ')}`)
      return
    }

    try {
      // Get the next ID
      const maxIdResult = await queryExecutor.executeQuery(`
        SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM ddb.departments
      `)
      const nextId = maxIdResult.data[0].next_id

      // Insert new department
      await queryExecutor.executeQuery(`
        INSERT INTO ddb.departments (id, organization_id, name, type)
        VALUES (${nextId}, ${organizationId}, '${deptName.trim()}', '${normalizedType}')
      `)

      toast.success(`Department "${deptName}" created successfully!`, {
        duration: 3000,
        position: 'top-center',
        icon: '🏢',
      })

      // Reload data
      setTimeout(() => loadOrganizationData(), 500)
    } catch (e) {
      console.error('Error creating department:', e)
      toast.error('Failed to create department')
    }
  }

  const getDepartmentColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'engineering': '#6b8cce',
      'design': '#9b8cce',
      'product': '#6bcf7f',
      'sales': '#ffd93d',
      'operations': '#f6ad55',
      'finance': '#fc8181',
      'compliance': '#e57373',
      'hr': '#5ba3d0',
      'marketing': '#ff6b9d',
      'legal': '#8574b8'
    }
    return colors[type] || '#718096'
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-3 py-12">
          <div className="w-6 h-6 border-2 border-[#6b8cce] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#718096]">Loading organization data...</span>
        </div>
      </div>
    )
  }

  if (error || !organization) {
    return (
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <Icon icon="mdi:alert-circle" width={48} height={48} className="text-[#fc8181] mx-auto mb-4" />
          <p className="text-[#fc8181] font-medium">{error || 'Organization not found'}</p>
        </div>
      </div>
    )
  }

  const totalUsers = departments.reduce((sum, d) => sum + d.user_count, 0)
  const totalTeams = teams.length
  const totalDepartments = departments.length
  const totalWorkload = departmentWorkload.reduce((sum, w) => sum + w.total_estimated_hours, 0)

  return (
    <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 bg-[#6b8cce] bg-opacity-10 rounded-[16px] flex items-center justify-center">
            <Icon icon="mdi:office-building" width={32} height={32} className="text-[#2d3748]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#2d3748] mb-1">{organization.name}</h2>
            <p className="text-sm text-[#718096]">Organization Overview & Structure</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[#f8f9fb] rounded-[16px] p-5 border border-[#e2e8f0] mb-6">
        <h3 className="text-base font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
          <Icon icon="mdi:lightning-bolt" width={18} height={18} className="text-[#2d3748]" />
          Organization Actions
        </h3>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={addNewDepartment}
            className="px-3 py-1.5 bg-[#48bb78] text-white rounded-[8px] text-xs font-medium hover:bg-[#38a169] transition-all duration-200 flex items-center gap-1"
          >
            <Icon icon="mdi:plus-circle" width={14} height={14} />
            Add New Department
          </button>
          <button
            onClick={() => {
              const largestDept = departments.reduce((max, d) => d.user_count > max.user_count ? d : max, departments[0])
              toast.success(`Largest department: ${largestDept?.name} (${largestDept?.user_count} users)`, {
                duration: 4000,
                position: 'top-center',
                icon: '📊',
              })
            }}
            className="px-3 py-1.5 bg-[#6b8cce] text-white rounded-[8px] text-xs font-medium hover:bg-[#5a7ab8] transition-all duration-200 flex items-center gap-1"
          >
            <Icon icon="mdi:chart-bar" width={14} height={14} />
            View Largest Department
          </button>
          <button
            onClick={() => {
              const smallestTeam = teams.reduce((min, t) => t.member_count < min.member_count ? t : min, teams[0])
              toast.success(`Smallest team: ${smallestTeam?.name} (${smallestTeam?.member_count} members)`, {
                duration: 4000,
                position: 'top-center',
                icon: '👥',
              })
            }}
            className="px-3 py-1.5 bg-[#6bcf7f] text-white rounded-[8px] text-xs font-medium hover:bg-[#48bb78] transition-all duration-200 flex items-center gap-1"
          >
            <Icon icon="mdi:account-group" width={14} height={14} />
            Find Smallest Team
          </button>
          <button
            onClick={() => {
              const avgTeamSize = teams.length > 0 ? Math.round(teams.reduce((sum, t) => sum + t.member_count, 0) / teams.length) : 0
              toast.success(`Average team size: ${avgTeamSize} members`, {
                duration: 4000,
                position: 'top-center',
                icon: '📈',
              })
            }}
            className="px-3 py-1.5 bg-[#ffd93d] text-[#2d3748] rounded-[8px] text-xs font-medium hover:bg-[#f6ad55] transition-all duration-200 flex items-center gap-1"
          >
            <Icon icon="mdi:calculator" width={14} height={14} />
            Calculate Avg Team Size
          </button>
          <button
            onClick={() => {
              const summary = departments.map(d => `${d.name}: ${d.user_count} users, ${d.team_count} teams`).join('\n')
              toast.success(`Department Summary:\n\n${summary}`, {
                duration: 6000,
                position: 'top-center',
                icon: '📋',
              })
            }}
            className="px-3 py-1.5 bg-[#9b8cce] text-white rounded-[8px] text-xs font-medium hover:bg-[#8574b8] transition-all duration-200 flex items-center gap-1"
          >
            <Icon icon="mdi:file-document" width={14} height={14} />
            View Org Summary
          </button>
          <button
            onClick={async () => {
              // Find imbalanced departments - those with user count > 2x average
              const avgUsers = totalUsers / totalDepartments
              const threshold = avgUsers * 2
              const largeDepts = departments.filter(d => d.user_count > threshold)

              if (largeDepts.length === 0) {
                toast.success('All departments are balanced!', {
                  duration: 3000,
                  position: 'top-center',
                  icon: '✅',
                })
                return
              }

              const msg = largeDepts.map(d => `${d.name}: ${d.user_count} users (${Math.round(d.user_count / avgUsers * 100)}% of avg)`).join('\n')
              toast.success(`Departments to rebalance:\n\n${msg}\n\nAvg per dept: ${Math.round(avgUsers)} users`, {
                duration: 6000,
                position: 'top-center',
                icon: '⚖️',
              })
            }}
            className="px-3 py-1.5 bg-[#fc8181] text-white rounded-[8px] text-xs font-medium hover:bg-[#f56565] transition-all duration-200 flex items-center gap-1"
          >
            <Icon icon="mdi:scale-balance" width={14} height={14} />
            Check Balance
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-[#6b8cce] to-[#5a7ab8] rounded-[16px] p-5">
          <div className="flex items-center gap-3 mb-2">
            <Icon icon="mdi:account-group" width={24} height={24} className="text-white opacity-90" />
            <div className="text-sm text-white opacity-90">Total Users</div>
          </div>
          <div className="font-bold text-3xl text-white">{totalUsers}</div>
          <div className="text-xs text-white opacity-75 mt-1">Across all departments</div>
        </div>

        <div className="bg-gradient-to-br from-[#6bcf7f] to-[#48bb78] rounded-[16px] p-5">
          <div className="flex items-center gap-3 mb-2">
            <Icon icon="mdi:office-building" width={24} height={24} className="text-white opacity-90" />
            <div className="text-sm text-white opacity-90">Departments</div>
          </div>
          <div className="font-bold text-3xl text-white">{totalDepartments}</div>
          <div className="text-xs text-white opacity-75 mt-1">Active departments</div>
        </div>

        <div className="bg-gradient-to-br from-[#ffd93d] to-[#f6ad55] rounded-[16px] p-5">
          <div className="flex items-center gap-3 mb-2">
            <Icon icon="mdi:account-multiple" width={24} height={24} className="text-white opacity-90" />
            <div className="text-sm text-white opacity-90">Teams</div>
          </div>
          <div className="font-bold text-3xl text-white">{totalTeams}</div>
          <div className="text-xs text-white opacity-75 mt-1">Cross-functional teams</div>
        </div>

        <div className="bg-gradient-to-br from-[#9b8cce] to-[#8574b8] rounded-[16px] p-5">
          <div className="flex items-center gap-3 mb-2">
            <Icon icon="mdi:briefcase-clock" width={24} height={24} className="text-white opacity-90" />
            <div className="text-sm text-white opacity-90">Total Workload</div>
          </div>
          <div className="font-bold text-3xl text-white">{Math.round(totalWorkload).toLocaleString()}</div>
          <div className="text-xs text-white opacity-75 mt-1">Estimated hours</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Department Hierarchy */}
        <div className="bg-[#f8f9fb] rounded-[16px] p-5 border border-[#e2e8f0]">
          <h3 className="text-base font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
            <Icon icon="mdi:file-tree" width={18} height={18} className="text-[#2d3748]" />
            Department Hierarchy
          </h3>
          <div ref={hierarchyChartRef} style={{ width: '100%', height: '350px' }}></div>
        </div>

        {/* Team Size Comparison */}
        <div className="bg-[#f8f9fb] rounded-[16px] p-5 border border-[#e2e8f0]">
          <h3 className="text-base font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
            <Icon icon="mdi:chart-bar" width={18} height={18} className="text-[#2d3748]" />
            Team Size Comparison
          </h3>
          <div ref={teamSizeChartRef} style={{ width: '100%', height: '350px' }}></div>
        </div>
      </div>

      {/* Department Workload & Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Department Workload Overview */}
        <div className="bg-[#f8f9fb] rounded-[16px] p-5 border border-[#e2e8f0]">
          <h3 className="text-base font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
            <Icon icon="mdi:briefcase-outline" width={18} height={18} className="text-[#2d3748]" />
            Department Workload Overview
          </h3>
          <div ref={workloadChartRef} style={{ width: '100%', height: '350px' }}></div>
        </div>

        {/* Department Growth Timeline */}
        <div className="bg-[#f8f9fb] rounded-[16px] p-5 border border-[#e2e8f0]">
          <h3 className="text-base font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
            <Icon icon="mdi:chart-line" width={18} height={18} className="text-[#2d3748]" />
            Department Growth Timeline
          </h3>
          <div ref={growthChartRef} style={{ width: '100%', height: '350px' }}></div>
        </div>
      </div>

      {/* Department Details */}
      <div className="bg-[#f8f9fb] rounded-[16px] p-5 border border-[#e2e8f0]">
        <h3 className="text-base font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
          <Icon icon="mdi:view-list" width={18} height={18} className="text-[#2d3748]" />
          Department Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {departments.map((dept) => (
            <div key={dept.id} className="bg-white rounded-[12px] p-4 border border-[#e2e8f0]">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-[#2d3748] mb-1">{dept.name}</h4>
                  <p className="text-xs text-[#718096] capitalize">{dept.type}</p>
                </div>
                <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center`}
                     style={{ backgroundColor: `${getDepartmentColor(dept.type)}20` }}>
                  <Icon icon="mdi:office-building" width={20} height={20}
                        style={{ color: getDepartmentColor(dept.type) }} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-[#718096]">Users:</span>
                  <span className="ml-1 font-medium text-[#2d3748]">{dept.user_count}</span>
                </div>
                <div>
                  <span className="text-[#718096]">Teams:</span>
                  <span className="ml-1 font-medium text-[#2d3748]">{dept.team_count}</span>
                </div>
                <div>
                  <span className="text-[#718096]">Projects:</span>
                  <span className="ml-1 font-medium text-[#2d3748]">{dept.project_count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default OrganizationOverview
