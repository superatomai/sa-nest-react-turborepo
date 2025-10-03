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

interface DatabaseOverviewCardProps {
  theme?: string
}

interface TableStats {
  name: string
  count: number
  icon: string
  color: string
  bgColor: string
}

const DatabaseOverviewCard: React.FC<DatabaseOverviewCardProps> = ({ theme = 'modern' }) => {
  const [tableStats, setTableStats] = useState<TableStats[]>([])
  const [allTables, setAllTables] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [totalRecords, setTotalRecords] = useState<number>(0)
  const [echartsLoaded, setEchartsLoaded] = useState<boolean>(false)

  // Chart refs
  const pieChartRef = useRef<HTMLDivElement>(null)
  const taskChartRef = useRef<HTMLDivElement>(null)

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
      document.body.removeChild(script)
    }
  }, [])

  useEffect(() => {
    loadDatabaseStats()
  }, [])

  const getTableIcon = (tableName: string): { icon: string; color: string; bgColor: string } => {
    const name = tableName.toLowerCase()
    if (name.includes('user')) return { icon: 'mdi:account-group', color: '#6b8cce', bgColor: 'bg-[#6b8cce]' }
    if (name.includes('project')) return { icon: 'mdi:folder-multiple', color: '#5ba3d0', bgColor: 'bg-[#5ba3d0]' }
    if (name.includes('task')) return { icon: 'mdi:checkbox-multiple-marked', color: '#6bcf7f', bgColor: 'bg-[#6bcf7f]' }
    if (name.includes('organization')) return { icon: 'mdi:office-building', color: '#9b8cce', bgColor: 'bg-[#9b8cce]' }
    if (name.includes('department')) return { icon: 'mdi:sitemap', color: '#ff6b9d', bgColor: 'bg-[#ff6b9d]' }
    if (name.includes('milestone')) return { icon: 'mdi:flag-checkered', color: '#ffd93d', bgColor: 'bg-[#ffd93d]' }
    if (name.includes('comment')) return { icon: 'mdi:comment-multiple', color: '#f6ad55', bgColor: 'bg-[#f6ad55]' }
    if (name.includes('log')) return { icon: 'mdi:file-document-multiple', color: '#fc8181', bgColor: 'bg-[#fc8181]' }
    return { icon: 'mdi:table', color: '#718096', bgColor: 'bg-[#718096]' }
  }

  const loadDatabaseStats = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // First, try to get tables from main schema (they might still be in ddb database)
      let tables: string[] = []

      const mainResult = await queryExecutor.executeQuery(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'main'
        ORDER BY table_name
      `)
      tables = mainResult.data.map((row: any) => row.table_name)

      setAllTables(tables)

      if (tables.length === 0) {
        setTableStats([])
        setTotalRecords(0)
        setIsLoading(false)
        return
      }

      // The error message says "Did you mean ddb.departments?" so tables are in ddb database
      // Build a single query to get all counts using UNION ALL with ddb prefix
      const countQueries = tables.map(
        (table) => `SELECT '${table}' as table_name, COUNT(*) as count FROM ddb.${table}`
      )
      const unionQuery = countQueries.join(' UNION ALL ')

      console.log('📊 Fetching all table counts in a single query...')
      const countsResult = await queryExecutor.executeQuery(unionQuery)

      // Process results
      const stats: TableStats[] = []
      let total = 0

      for (const row of countsResult.data) {
        // Convert BigInt to Number
        const count = typeof row.count === 'bigint' ? Number(row.count) : (row.count || 0)
        total += count

        const iconInfo = getTableIcon(row.table_name)
        stats.push({
          name: row.table_name,
          count,
          icon: iconInfo.icon,
          color: iconInfo.color,
          bgColor: iconInfo.bgColor
        })
      }

      setTableStats(stats)
      setTotalRecords(total)
    } catch (e) {
      console.error('Error loading database stats:', e)
      setError('Failed to load database statistics')
    }
    setIsLoading(false)
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  // Render charts when data is loaded
  useEffect(() => {
    if (tableStats.length > 0 && !isLoading && echartsLoaded) {
      renderPieChart()
      renderTaskChart()
    }
  }, [tableStats, isLoading, echartsLoaded])

  const renderPieChart = () => {
    if (!pieChartRef.current || !window.echarts) return

    const chart = window.echarts.init(pieChartRef.current)

    const chartData = tableStats
      .filter(t => t.count > 0)
      .map(t => ({
        value: t.count,
        name: t.name,
        itemStyle: { color: t.color }
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
        top: 10,
        left: 'center',
        textStyle: {
          color: '#4a5568',
          fontSize: 11
        },
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 12,
        pageIconSize: 12
      },
      grid: {
        top: 80
      },
      series: [
        {
          name: 'Records',
          type: 'pie',
          radius: ['50%', '75%'],
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
              fontSize: 14,
              fontWeight: 'bold',
              color: '#2d3748',
              formatter: '{b}\n{c}'
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.2)'
            }
          },
          labelLine: {
            show: false
          },
          data: chartData
        }
      ]
    }

    chart.setOption(option)

    // Handle resize
    const resizeObserver = new ResizeObserver(() => chart.resize())
    resizeObserver.observe(pieChartRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.dispose()
    }
  }

  const renderTaskChart = async () => {
    if (!taskChartRef.current || !window.echarts) return

    try {
      // Query task status distribution
      const result = await queryExecutor.executeQuery(`
        SELECT status, COUNT(*) as count
        FROM ddb.tasks
        GROUP BY status
        ORDER BY count DESC
      `)

      const chart = window.echarts.init(taskChartRef.current)

      const statuses = result.data.map((row: any) => row.status || 'Unknown')
      const counts = result.data.map((row: any) => Number(row.count))

      const statusColors: Record<string, string> = {
        'completed': '#48bb78',
        'in_progress': '#6b8cce',
        'pending': '#ffd93d',
        'blocked': '#fc8181',
        'on_hold': '#9b8cce'
      }

      const option = {
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
          bottom: '3%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: statuses,
          axisLabel: {
            color: '#718096',
            fontSize: 11,
            rotate: 30
          },
          axisLine: { lineStyle: { color: '#e2e8f0' } }
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: '#718096', fontSize: 11 },
          splitLine: { lineStyle: { color: '#e2e8f0' } }
        },
        series: [
          {
            name: 'Tasks',
            type: 'bar',
            data: counts.map((count, idx) => ({
              value: count,
              itemStyle: {
                color: statusColors[statuses[idx].toLowerCase()] || '#6b8cce',
                borderRadius: [8, 8, 0, 0]
              }
            })),
            barWidth: '50%',
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.2)'
              }
            }
          }
        ]
      }

      chart.setOption(option)

      const resizeObserver = new ResizeObserver(() => chart.resize())
      resizeObserver.observe(taskChartRef.current)

      return () => {
        resizeObserver.disconnect()
        chart.dispose()
      }
    } catch (e) {
      console.error('Error rendering task chart:', e)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8">
        <div className="flex items-center justify-center gap-3 py-12">
          <div className="w-6 h-6 border-2 border-[#6b8cce] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#718096]">Loading database statistics...</span>
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
          <p className="text-[#718096] text-sm">Unable to fetch database information</p>
          <button
            onClick={loadDatabaseStats}
            className="mt-4 px-6 py-2 bg-[#6b8cce] text-white rounded-[10px] hover:bg-[#5a7ab8] transition-all duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Find key table stats
  const projectsCount = tableStats.find(t => t.name.toLowerCase().includes('project'))?.count || 0
  const tasksCount = tableStats.find(t => t.name.toLowerCase().includes('task'))?.count || 0
  const usersCount = tableStats.find(t => t.name.toLowerCase().includes('user'))?.count || 0

  return (
    <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 pb-6 border-b border-[#e2e8f0]">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-[#6b8cce] bg-opacity-10 rounded-[12px] flex items-center justify-center">
              <Icon icon="mdi:database" width={28} height={28} className="text-[#2d3748]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#2d3748]">Database Overview</h2>
              <p className="text-[#718096] text-sm">Complete statistics of your DuckDB database</p>
            </div>
          </div>
        </div>
        <button
          onClick={loadDatabaseStats}
          className="flex items-center gap-2 px-4 py-2 bg-[#f8f9fb] text-[#4a5568] rounded-[10px] border border-[#e2e8f0] hover:bg-white hover:border-[#6b8cce] transition-all duration-200 text-sm font-medium"
        >
          <Icon icon="mdi:refresh" width={16} height={16} className="text-[#4a5568]" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Total Tables */}
        <div className="bg-gradient-to-br from-[#6b8cce] to-[#5a7ab8] rounded-[16px] p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white bg-opacity-30 rounded-[10px] flex items-center justify-center">
              <Icon icon="mdi:table-multiple" width={24} height={24} className="text-[#2d3748]" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-white text-opacity-90 mb-1">Total Tables</div>
              <div className="font-bold text-2xl text-white">{allTables.length}</div>
            </div>
          </div>
        </div>

        {/* Total Records */}
        <div className="bg-gradient-to-br from-[#5ba3d0] to-[#4a8fb8] rounded-[16px] p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white bg-opacity-30 rounded-[10px] flex items-center justify-center">
              <Icon icon="mdi:database-check" width={24} height={24} className="text-[#2d3748]" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-white text-opacity-90 mb-1">Total Records</div>
              <div className="font-bold text-2xl text-white">{formatNumber(totalRecords)}</div>
            </div>
          </div>
        </div>

        {/* Projects */}
        <div className="bg-gradient-to-br from-[#9b8cce] to-[#8574b8] rounded-[16px] p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white bg-opacity-30 rounded-[10px] flex items-center justify-center">
              <Icon icon="mdi:folder-multiple" width={24} height={24} className="text-[#2d3748]" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-white text-opacity-90 mb-1">Projects</div>
              <div className="font-bold text-2xl text-white">{formatNumber(projectsCount)}</div>
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="bg-gradient-to-br from-[#6bcf7f] to-[#48bb78] rounded-[16px] p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white bg-opacity-30 rounded-[10px] flex items-center justify-center">
              <Icon icon="mdi:checkbox-multiple-marked" width={24} height={24} className="text-[#2d3748]" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-white text-opacity-90 mb-1">Tasks</div>
              <div className="font-bold text-2xl text-white">{formatNumber(tasksCount)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Users */}
        <div className="bg-[#f8f9fb] rounded-[12px] p-4 border border-[#e2e8f0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ff6b9d] bg-opacity-10 rounded-[10px] flex items-center justify-center">
              <Icon icon="mdi:account-group" width={24} height={24} className="text-[#2d3748]" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-[#718096] mb-1">Users</div>
              <div className="font-bold text-xl text-[#2d3748]">{formatNumber(usersCount)}</div>
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div className="bg-[#f8f9fb] rounded-[12px] p-4 border border-[#e2e8f0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ffd93d] bg-opacity-20 rounded-[10px] flex items-center justify-center">
              <Icon icon="mdi:flag-checkered" width={24} height={24} className="text-[#2d3748]" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-[#718096] mb-1">Milestones</div>
              <div className="font-bold text-xl text-[#2d3748]">
                {formatNumber(tableStats.find(t => t.name.toLowerCase().includes('milestone'))?.count || 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Organizations */}
        <div className="bg-[#f8f9fb] rounded-[12px] p-4 border border-[#e2e8f0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#5ba3d0] bg-opacity-10 rounded-[10px] flex items-center justify-center">
              <Icon icon="mdi:office-building" width={24} height={24} className="text-[#2d3748]" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-[#718096] mb-1">Organizations</div>
              <div className="font-bold text-xl text-[#2d3748]">
                {formatNumber(tableStats.find(t => t.name.toLowerCase().includes('organization'))?.count || 0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Records Distribution Pie Chart */}
        <div className="bg-white rounded-[16px] p-6 border border-[#e2e8f0]">
          <h3 className="text-base font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
            <Icon icon="mdi:chart-pie" width={20} height={20} className="text-[#6b8cce]" />
            Records Distribution
          </h3>
          <div ref={pieChartRef} style={{ width: '100%', height: '300px' }} />
        </div>

        {/* Task Status Chart */}
        <div className="bg-white rounded-[16px] p-6 border border-[#e2e8f0]">
          <h3 className="text-base font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
            <Icon icon="mdi:chart-bar" width={20} height={20} className="text-[#6bcf7f]" />
            Task Status Overview
          </h3>
          <div ref={taskChartRef} style={{ width: '100%', height: '300px' }} />
        </div>
      </div>

      {/* All Tables List */}
      <div>
        <h3 className="text-lg font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
          <Icon icon="mdi:table-large" width={20} height={20} className="text-[#6b8cce]" />
          All Tables
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tableStats.map((table) => (
            <div
              key={table.name}
              className="flex items-center justify-between p-4 bg-[#f8f9fb] rounded-[12px] border border-[#e2e8f0] hover:border-[#6b8cce] hover:shadow-[0_2px_8px_rgba(107,140,206,0.15)] transition-all duration-200"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-10 h-10 ${table.bgColor} bg-opacity-10 rounded-[10px] flex items-center justify-center`}>
                  <Icon icon={table.icon} width={22} height={22} className="text-[#2d3748]" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-[#2d3748] text-sm">{table.name}</div>
                  <div className="text-xs text-[#718096]">
                    {table.count === 0 ? 'Empty' : `${formatNumber(table.count)} record${table.count !== 1 ? 's' : ''}`}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg text-[#2d3748]">{formatNumber(table.count)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 pt-6 border-t border-[#e2e8f0] flex items-center justify-between text-sm text-[#718096]">
        <div className="flex items-center gap-2">
          <Icon icon="mdi:information" width={16} height={16} />
          <span>Database schema: <strong className="text-[#4a5568]">ddb</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <Icon icon="mdi:clock-outline" width={16} height={16} />
          <span>Last updated: <strong className="text-[#4a5568]">Just now</strong></span>
        </div>
      </div>
    </div>
  )
}

export default DatabaseOverviewCard