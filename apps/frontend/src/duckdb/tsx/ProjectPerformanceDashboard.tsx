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

interface Project {
  id: number
  name: string
  status: string
  priority: string
  budget_allocated: number
  budget_consumed: number
  risk_score: number
  start_date: string
  target_end_date: string
  actual_end_date: string | null
  compliance_required: boolean
  client_facing: boolean
}

const ProjectPerformanceDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [echartsLoaded, setEchartsLoaded] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Chart refs
  const budgetGaugeRef = useRef<HTMLDivElement>(null)
  const riskHeatmapRef = useRef<HTMLDivElement>(null)
  const statusPieRef = useRef<HTMLDivElement>(null)
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
    loadProjects()
  }, [])

  useEffect(() => {
    if (projects.length > 0 && echartsLoaded) {
      renderStatusPieChart()
      renderRiskHeatmap()
      renderTimelineChart()
      renderBudgetGauge()
    }
  }, [projects, echartsLoaded])

  // Auto-select first project from filtered list when search changes
  useEffect(() => {
    if (projects.length > 0) {
      const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      if (filteredProjects.length > 0) {
        setSelectedProject(filteredProjects[0])
      }
    }
  }, [searchQuery, projects])

  const loadProjects = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await queryExecutor.executeQuery(`
        SELECT
          id, name, status, priority,
          budget_allocated, budget_consumed, risk_score,
          start_date, target_end_date, actual_end_date,
          compliance_required, client_facing
        FROM ddb.projects
        ORDER BY risk_score DESC, budget_allocated DESC
      `)

      const projectsData = result.data.map((row: any) => ({
        id: row.id,
        name: row.name,
        status: row.status,
        priority: row.priority,
        budget_allocated: Number(row.budget_allocated) || 0,
        budget_consumed: Number(row.budget_consumed) || 0,
        risk_score: Number(row.risk_score) || 0,
        start_date: row.start_date,
        target_end_date: row.target_end_date,
        actual_end_date: row.actual_end_date,
        compliance_required: row.compliance_required,
        client_facing: row.client_facing
      }))

      setProjects(projectsData)
      if (projectsData.length > 0) {
        setSelectedProject(projectsData[0])
      }
    } catch (e) {
      console.error('Error loading projects:', e)
      setError('Failed to load projects')
    }
    setIsLoading(false)
  }

  const renderBudgetGauge = () => {
    if (!budgetGaugeRef.current || !window.echarts || projects.length === 0) return

    const chart = window.echarts.init(budgetGaugeRef.current)

    // Calculate overall budget across all projects
    const totalAllocated = projects.reduce((sum, p) => sum + p.budget_allocated, 0)
    const totalConsumed = projects.reduce((sum, p) => sum + p.budget_consumed, 0)

    const percentage = totalAllocated > 0
      ? Math.min((totalConsumed / totalAllocated) * 100, 100)
      : 0

    const option = {
      series: [
        {
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 100,
          radius: '90%',
          center: ['50%', '70%'],
          splitNumber: 5,
          axisLine: {
            lineStyle: {
              width: 20,
              color: [
                [0.5, '#6bcf7f'],
                [0.8, '#ffd93d'],
                [1, '#fc8181']
              ]
            }
          },
          pointer: {
            itemStyle: {
              color: '#6b8cce'
            },
            width: 5
          },
          axisTick: {
            distance: -20,
            length: 5,
            lineStyle: {
              color: '#fff',
              width: 1
            }
          },
          splitLine: {
            distance: -20,
            length: 20,
            lineStyle: {
              color: '#fff',
              width: 2
            }
          },
          axisLabel: {
            color: '#4a5568',
            fontSize: 11,
            distance: -40,
            formatter: '{value}%'
          },
          detail: {
            valueAnimation: true,
            formatter: '{value}%',
            color: '#2d3748',
            fontSize: 24,
            fontWeight: 'bold',
            offsetCenter: [0, '-10%']
          },
          data: [{ value: percentage.toFixed(1) }]
        }
      ]
    }

    chart.setOption(option)

    const resizeObserver = new ResizeObserver(() => chart.resize())
    resizeObserver.observe(budgetGaugeRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.dispose()
    }
  }

  const renderRiskHeatmap = () => {
    if (!riskHeatmapRef.current || !window.echarts) return

    const chart = window.echarts.init(riskHeatmapRef.current)

    const data = projects.map((p, idx) => [idx, 0, p.risk_score])

    const option = {
      tooltip: {
        position: 'top',
        formatter: (params: any) => {
          const project = projects[params.value[0]]
          return `${project.name}<br/>Risk Score: ${params.value[2]}`
        },
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: { color: '#2d3748' }
      },
      grid: {
        height: '40%',
        top: '15%',
        left: '10%',
        right: '5%'
      },
      xAxis: {
        type: 'category',
        data: projects.map((p, idx) => `P${idx + 1}`),
        splitArea: {
          show: true
        },
        axisLabel: {
          color: '#718096',
          fontSize: 10
        }
      },
      yAxis: {
        type: 'category',
        data: ['Risk'],
        splitArea: {
          show: true
        },
        axisLabel: {
          color: '#718096',
          fontSize: 11
        }
      },
      visualMap: {
        min: 0,
        max: 100,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '5%',
        textStyle: {
          color: '#4a5568',
          fontSize: 10
        },
        inRange: {
          color: ['#6bcf7f', '#ffd93d', '#ff6b9d', '#fc8181']
        }
      },
      series: [
        {
          name: 'Risk Score',
          type: 'heatmap',
          data: data,
          label: {
            show: true,
            color: '#2d3748',
            fontSize: 11,
            fontWeight: 'bold'
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.3)'
            }
          }
        }
      ]
    }

    chart.setOption(option)

    const resizeObserver = new ResizeObserver(() => chart.resize())
    resizeObserver.observe(riskHeatmapRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.dispose()
    }
  }

  const renderStatusPieChart = () => {
    if (!statusPieRef.current || !window.echarts) return

    const chart = window.echarts.init(statusPieRef.current)

    const statusCount: Record<string, number> = {}
    projects.forEach(p => {
      statusCount[p.status] = (statusCount[p.status] || 0) + 1
    })

    const statusColors: Record<string, string> = {
      'active': '#6b8cce',
      'completed': '#48bb78',
      'on_hold': '#ffd93d',
      'cancelled': '#fc8181',
      'planning': '#9b8cce'
    }

    const data = Object.entries(statusCount).map(([status, count]) => ({
      value: count,
      name: status,
      itemStyle: { color: statusColors[status.toLowerCase()] || '#718096' }
    }))

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: { color: '#2d3748' }
      },
      legend: {
        type: 'scroll',
        orient: 'horizontal',
        top: 5,
        left: 'center',
        textStyle: {
          color: '#4a5568',
          fontSize: 10
        },
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 10
      },
      series: [
        {
          name: 'Status',
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['50%', '58%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 12,
              fontWeight: 'bold',
              color: '#2d3748',
              formatter: '{b}\n{c}'
            }
          },
          data: data
        }
      ]
    }

    chart.setOption(option)

    const resizeObserver = new ResizeObserver(() => chart.resize())
    resizeObserver.observe(statusPieRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.dispose()
    }
  }

  const renderTimelineChart = () => {
    if (!timelineChartRef.current || !window.echarts) return

    const chart = window.echarts.init(timelineChartRef.current)

    const sortedProjects = [...projects]
      .filter(p => p.target_end_date)
      .sort((a, b) => new Date(a.target_end_date).getTime() - new Date(b.target_end_date).getTime())
      .slice(0, 10)

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: { color: '#2d3748' },
        formatter: (params: any) => {
          const p = params[0]
          const project = sortedProjects[p.dataIndex]
          const dueDate = new Date(project.target_end_date)
          const formattedDate = dueDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
          return `${project.name}<br/>Due: ${formattedDate}<br/>Priority: ${project.priority}`
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
        data: sortedProjects.map(p => p.name.substring(0, 15)),
        axisLabel: {
          color: '#718096',
          fontSize: 10,
          rotate: 30,
          interval: 0
        },
        axisLine: { lineStyle: { color: '#e2e8f0' } }
      },
      yAxis: {
        type: 'value',
        name: 'Days Until Due',
        axisLabel: { color: '#718096', fontSize: 10 },
        splitLine: { lineStyle: { color: '#e2e8f0' } },
        nameTextStyle: { color: '#4a5568', fontSize: 11 }
      },
      series: [
        {
          name: 'Timeline',
          type: 'bar',
          data: sortedProjects.map(p => {
            const daysUntil = Math.ceil(
              (new Date(p.target_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            )
            return {
              value: daysUntil,
              itemStyle: {
                color: daysUntil < 7 ? '#fc8181' : daysUntil < 30 ? '#ffd93d' : '#6b8cce',
                borderRadius: daysUntil < 0 ? [0, 0, 6, 6] : [6, 6, 0, 0]
              }
            }
          }),
          barWidth: '60%'
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

  const updateProjectStatus = async (status: string) => {
    if (!selectedProject) return

    try {
      await queryExecutor.executeQuery(`
        UPDATE ddb.projects
        SET status = '${status}'
        WHERE id = ${selectedProject.id}
      `)

      setProjects(projects.map(p =>
        p.id === selectedProject.id ? { ...p, status } : p
      ))
      setSelectedProject({ ...selectedProject, status })

      toast.success(`Project "${selectedProject.name}" status changed to "${status}"`, {
        duration: 3000,
        position: 'top-center',
        icon: '✅',
      })
    } catch (e) {
      console.error('Error updating status:', e)
      toast.error('Failed to update project status', {
        duration: 3000,
        position: 'top-center',
      })
    }
  }

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      'active': 'bg-[#6b8cce]',
      'completed': 'bg-[#48bb78]',
      'on_hold': 'bg-[#ffd93d]',
      'cancelled': 'bg-[#fc8181]',
      'planning': 'bg-[#9b8cce]'
    }
    return colors[status.toLowerCase()] || 'bg-[#718096]'
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'high': 'text-[#fc8181]',
      'medium': 'text-[#ffd93d]',
      'low': 'text-[#6bcf7f]'
    }
    return colors[priority.toLowerCase()] || 'text-[#718096]'
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

  if (error) {
    return (
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8">
        <div className="text-center py-12">
          <Icon icon="mdi:alert-circle" width={64} height={64} className="mx-auto mb-4 text-[#fc8181]" />
          <p className="text-[#2d3748] font-semibold mb-2">{error}</p>
          <button
            onClick={loadProjects}
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
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#6b8cce] bg-opacity-10 rounded-[12px] flex items-center justify-center">
            <Icon icon="mdi:chart-line" width={28} height={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#2d3748]">Project Performance Dashboard</h2>
            <p className="text-[#718096] text-sm">Comprehensive analytics and project management</p>
          </div>
        </div>
        <button
          onClick={loadProjects}
          className="flex items-center gap-2 px-4 py-2 bg-[#f8f9fb] text-[#4a5568] rounded-[10px] border border-[#e2e8f0] hover:bg-white hover:border-[#6b8cce] transition-all duration-200 text-sm font-medium"
        >
          <Icon icon="mdi:refresh" width={16} height={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-[#6b8cce] to-[#5a7ab8] rounded-[16px] p-5">
          <div className="flex items-center gap-3 mb-2">
            <Icon icon="mdi:folder-multiple" width={24} height={24} className="text-white opacity-90" />
            <div className="text-sm text-white opacity-90">Total Projects</div>
          </div>
          <div className="font-bold text-3xl text-white">{projects.length}</div>
        </div>

        <div className="bg-gradient-to-br from-[#6bcf7f] to-[#48bb78] rounded-[16px] p-5">
          <div className="flex items-center gap-3 mb-2">
            <Icon icon="mdi:check-circle" width={24} height={24} className="text-white opacity-90" />
            <div className="text-sm text-white opacity-90">Completed</div>
          </div>
          <div className="font-bold text-3xl text-white">
            {projects.filter(p => p.status === 'completed').length}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#ffd93d] to-[#f6ad55] rounded-[16px] p-5">
          <div className="flex items-center gap-3 mb-2">
            <Icon icon="mdi:alert" width={24} height={24} className="text-white opacity-90" />
            <div className="text-sm text-white opacity-90">High Risk</div>
          </div>
          <div className="font-bold text-3xl text-white">
            {projects.filter(p => p.risk_score > 70).length}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#ff6b9d] to-[#fc8181] rounded-[16px] p-5">
          <div className="flex items-center gap-3 mb-2">
            <Icon icon="mdi:cash-multiple" width={24} height={24} className="text-white opacity-90" />
            <div className="text-sm text-white opacity-90">Total Budget</div>
          </div>
          <div className="font-bold text-2xl text-white">
            ${(projects.reduce((sum, p) => sum + p.budget_allocated, 0) / 1000).toFixed(0)}K
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Status Distribution */}
        <div className="bg-[#f8f9fb] rounded-[16px] p-5 border border-[#e2e8f0]">
          <h3 className="text-base font-semibold text-[#2d3748] mb-3 flex items-center gap-2">
            <Icon icon="mdi:chart-pie" width={18} height={18} className="text-[#6b8cce]" />
            Status Distribution
          </h3>
          <div ref={statusPieRef} style={{ width: '100%', height: '250px' }} />
        </div>

        {/* Risk Heatmap */}
        <div className="bg-[#f8f9fb] rounded-[16px] p-5 border border-[#e2e8f0]">
          <h3 className="text-base font-semibold text-[#2d3748] mb-3 flex items-center gap-2">
            <Icon icon="mdi:fire" width={18} height={18} className="text-[#fc8181]" />
            Risk Score Heatmap
          </h3>
          <div ref={riskHeatmapRef} style={{ width: '100%', height: '250px' }} />
        </div>
      </div>

      {/* Budget Gauge & Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Budget Utilization */}
        <div className="bg-[#f8f9fb] rounded-[16px] p-5 border border-[#e2e8f0]">
          <h3 className="text-base font-semibold text-[#2d3748] mb-3 flex items-center gap-2">
            <Icon icon="mdi:gauge" width={18} height={18} className="text-[#6b8cce]" />
            Overall Budget Utilization
          </h3>
          <div ref={budgetGaugeRef} style={{ width: '100%', height: '200px' }} />
          <div className="mt-2 text-center text-sm text-[#718096]">
            ${projects.reduce((sum, p) => sum + p.budget_consumed, 0).toLocaleString()} / ${projects.reduce((sum, p) => sum + p.budget_allocated, 0).toLocaleString()}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-[#f8f9fb] rounded-[16px] p-5 border border-[#e2e8f0]">
          <h3 className="text-base font-semibold text-[#2d3748] mb-3 flex items-center gap-2">
            <Icon icon="mdi:calendar-clock" width={18} height={18} className="text-[#6bcf7f]" />
            Project Timeline (Next 10)
          </h3>
          <div ref={timelineChartRef} style={{ width: '100%', height: '200px' }} />
        </div>
      </div>

      {/* Project Selector & Actions */}
      <div className="bg-[#f8f9fb] rounded-[16px] p-5 border border-[#e2e8f0]">
        <h3 className="text-base font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
          <Icon icon="mdi:cog" width={18} height={18} className="text-[#6b8cce]" />
          Quick Actions
        </h3>

        {/* Project Selector */}
        <div className="mb-4">
          <label className="text-sm text-[#718096] mb-2 block">Select Project</label>

          {/* Search Input */}
          <div className="relative mb-2">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#e2e8f0] rounded-[10px] pl-10 pr-4 py-2 text-[#2d3748] text-sm focus:outline-none focus:border-[#6b8cce] focus:ring-2 focus:ring-[#6b8cce] focus:ring-opacity-20"
            />
            <Icon
              icon="mdi:magnify"
              width={18}
              height={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#718096]"
            />
          </div>

          {/* Dropdown */}
          <select
            value={selectedProject?.id || ''}
            onChange={(e) => {
              const project = projects.find(p => p.id === Number(e.target.value))
              setSelectedProject(project || null)
            }}
            className="w-full bg-white border border-[#e2e8f0] rounded-[10px] px-4 py-2 text-[#2d3748] text-sm focus:outline-none focus:border-[#6b8cce] focus:ring-2 focus:ring-[#6b8cce] focus:ring-opacity-20"
          >
            {projects
              .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} - {p.status}
                </option>
              ))}
          </select>
        </div>

        {selectedProject && (
          <div className="space-y-4">
            {/* Project Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white rounded-[10px] p-3 border border-[#e2e8f0]">
                <div className="text-xs text-[#718096] mb-1">Status</div>
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-[6px] text-white text-xs font-medium ${getStatusBadgeColor(selectedProject.status)}`}>
                  {selectedProject.status}
                </div>
              </div>

              <div className="bg-white rounded-[10px] p-3 border border-[#e2e8f0]">
                <div className="text-xs text-[#718096] mb-1">Priority</div>
                <div className={`font-semibold text-sm ${getPriorityColor(selectedProject.priority)}`}>
                  {selectedProject.priority}
                </div>
              </div>

              <div className="bg-white rounded-[10px] p-3 border border-[#e2e8f0]">
                <div className="text-xs text-[#718096] mb-1">Risk Score</div>
                <div className="font-semibold text-sm text-[#2d3748]">{selectedProject.risk_score}/100</div>
              </div>

              <div className="bg-white rounded-[10px] p-3 border border-[#e2e8f0]">
                <div className="text-xs text-[#718096] mb-1">Budget Left</div>
                <div className="font-semibold text-sm text-[#2d3748]">
                  ${(selectedProject.budget_allocated - selectedProject.budget_consumed).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateProjectStatus('active')}
                className="px-4 py-2 bg-[#6b8cce] text-white rounded-[10px] text-sm font-medium hover:bg-[#5a7ab8] transition-all duration-200 flex items-center gap-2"
              >
                <Icon icon="mdi:play" width={16} height={16} />
                Mark Active
              </button>

              <button
                onClick={() => updateProjectStatus('completed')}
                className="px-4 py-2 bg-[#48bb78] text-white rounded-[10px] text-sm font-medium hover:bg-[#38a169] transition-all duration-200 flex items-center gap-2"
              >
                <Icon icon="mdi:check" width={16} height={16} />
                Mark Complete
              </button>

              <button
                onClick={() => updateProjectStatus('on_hold')}
                className="px-4 py-2 bg-[#ffd93d] text-[#2d3748] rounded-[10px] text-sm font-medium hover:bg-[#f6ad55] transition-all duration-200 flex items-center gap-2"
              >
                <Icon icon="mdi:pause" width={16} height={16} />
                Put On Hold
              </button>
            </div>

            {/* Flags */}
            <div className="flex gap-3 pt-3 border-t border-[#e2e8f0]">
              {selectedProject.compliance_required && (
                <div className="flex items-center gap-2 text-xs text-[#718096]">
                  <Icon icon="mdi:shield-check" width={16} height={16} className="text-[#6b8cce]" />
                  Compliance Required
                </div>
              )}
              {selectedProject.client_facing && (
                <div className="flex items-center gap-2 text-xs text-[#718096]">
                  <Icon icon="mdi:account-group" width={16} height={16} className="text-[#ff6b9d]" />
                  Client Facing
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectPerformanceDashboard
