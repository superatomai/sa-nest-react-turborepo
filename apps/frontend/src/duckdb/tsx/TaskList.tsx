import React, { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import toast from 'react-hot-toast'
import { queryExecutor } from '../query'
import DataTable from '../components/DataTable'
import type { QueryResult } from '../types'

interface TaskListProps {
  theme?: string
  initialLimit?: number
}

interface StatusCount {
  status: string
  count: number
}

const TaskList: React.FC<TaskListProps> = ({ theme = 'modern', initialLimit = 100 }) => {
  const [result, setResult] = useState<QueryResult | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [filter, setFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [statusCounts, setStatusCounts] = useState<StatusCount[]>([])
  const [currentLimit, setCurrentLimit] = useState<number>(initialLimit)

  useEffect(() => {
    loadStatusCounts()
  }, [])

  useEffect(() => {
    setCurrentLimit(initialLimit)
  }, [filter])

  useEffect(() => {
    loadTasks()
  }, [filter, currentLimit])

  const loadStatusCounts = async () => {
    try {
      const query = `
        SELECT
          status,
          COUNT(*) as count
        FROM ddb.tasks
        WHERE status IS NOT NULL
        GROUP BY status
        ORDER BY status
      `
      const result = await queryExecutor.executeQuery(query)

      const counts: StatusCount[] = result.data.map((row: any) => ({
        status: row.status,
        count: typeof row.count === 'bigint' ? Number(row.count) : row.count
      }))

      setStatusCounts(counts)
    } catch (e) {
      console.error('Error loading status counts:', e)
      setStatusCounts([])
    }
  }

  const loadTasks = async () => {
    setIsLoading(true)
    try {
      let query = `
        SELECT
          t.id,
          t.title,
          t.status,
          t.priority,
          t.task_type,
          t.start_date,
          t.due_date,
          t.estimated_hours,
          u1.full_name as assigned_to,
          u2.full_name as assigned_by,
          m.name as milestone_name,
          p.name as project_name,
          t.created_at
        FROM ddb.tasks t
        LEFT JOIN ddb.users u1 ON t.assigned_to = u1.id
        LEFT JOIN ddb.users u2 ON t.assigned_by = u2.id
        LEFT JOIN ddb.milestones m ON t.milestone_id = m.id
        LEFT JOIN ddb.projects p ON m.project_id = p.id
      `

      // Add filter conditions
      if (filter !== 'all') {
        query += ` WHERE t.status = '${filter}'`
      }

      // Add search filter
      if (searchQuery.trim()) {
        const searchCondition = `(t.title ILIKE '%${searchQuery.trim()}%' OR t.description ILIKE '%${searchQuery.trim()}%')`
        query += filter === 'all' ? ` WHERE ${searchCondition}` : ` AND ${searchCondition}`
      }

      query += ` ORDER BY t.created_at DESC LIMIT ${currentLimit}`

      console.log('📊 Executing query:', query)
      const queryResult = await queryExecutor.executeQuery(query)

      setResult(queryResult)
    } catch (e) {
      console.error('Error loading tasks:', e)
      toast.error('Failed to load tasks')
      setResult(null)
    }
    setIsLoading(false)
  }

  const handleRefresh = () => {
    setCurrentLimit(initialLimit)
    loadStatusCounts()
    loadTasks()
  }

  const handleSearch = () => {
    loadTasks()
  }

  const handleLoadMore = () => {
    setCurrentLimit(prev => prev + 20)
  }

  const getTotalCount = () => {
    return statusCounts.reduce((sum, s) => sum + s.count, 0)
  }

  const getCurrentFilterCount = () => {
    if (filter === 'all') {
      return getTotalCount()
    }
    const status = statusCounts.find(s => s.status === filter)
    return status ? status.count : 0
  }

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: 'bg-[#ffd93d] text-[#2d3748]',
      in_progress: 'bg-[#5ba3d0] text-white',
      completed: 'bg-[#6bcf7f] text-white',
      blocked: 'bg-[#fc8181] text-white',
      review: 'bg-[#9b8cce] text-white',
      cancelled: 'bg-[#718096] text-white'
    }
    return colorMap[status] || 'bg-[#6b8cce] text-white'
  }

  return (
    <div className="min-h-screen bg-[#d4dce6] p-8">
      {/* Header */}
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-[2rem] font-bold text-[#2d3748] flex items-center gap-3 mb-2">
              <Icon icon="mdi:checkbox-multiple-marked" width={36} height={36} className="text-[#6bcf7f]" />
              <span>All Tasks</span>
            </h1>
            <p className="text-[#718096] text-base">
              View and manage all tasks in the system
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-[#6b8cce] text-white rounded-[10px] hover:bg-[#5a7ab8] transition-all duration-200 text-sm font-semibold"
          >
            <Icon icon="mdi:refresh" width={18} height={18} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search tasks by title or description..."
              className="w-full px-4 py-3 bg-[#f8f9fb] border border-[#e2e8f0] rounded-[10px] text-[#2d3748] focus:outline-none focus:border-[#6b8cce] focus:ring-2 focus:ring-[#6b8cce] focus:ring-opacity-20 transition-all duration-200"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-[#6b8cce] text-white rounded-[10px] hover:bg-[#5a7ab8] transition-all duration-200 font-semibold"
          >
            Search
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-[8px] font-medium text-sm transition-all duration-200 ${
              filter === 'all'
                ? 'bg-[#6b8cce] text-white'
                : 'bg-[#f8f9fb] text-[#718096] hover:bg-[#e2e8f0]'
            }`}
          >
            All Tasks ({getTotalCount()})
          </button>
          {statusCounts.map((statusCount) => (
            <button
              key={statusCount.status}
              onClick={() => setFilter(statusCount.status)}
              className={`px-4 py-2 rounded-[8px] font-medium text-sm transition-all duration-200 capitalize ${
                filter === statusCount.status
                  ? getStatusColor(statusCount.status)
                  : 'bg-[#f8f9fb] text-[#718096] hover:bg-[#e2e8f0]'
              }`}
            >
              {statusCount.status.replace('_', ' ')} ({statusCount.count})
            </button>
          ))}
        </div>

        {/* Load More Section */}
        {!isLoading && result && result.data.length > 0 && (
          <div className="flex items-center justify-between mt-3 px-3 py-2 bg-[#f8f9fb] rounded-[8px]">
            <div className="text-[#718096] text-sm">
              Showing <span className="font-semibold text-[#2d3748]">{result.data.length}</span> of{' '}
              <span className="font-semibold text-[#2d3748]">{getCurrentFilterCount()}</span> tasks
              {currentLimit < getCurrentFilterCount() && (
                <span className="ml-1 text-xs">(limit: {currentLimit})</span>
              )}
            </div>
            {result.data.length >= currentLimit && currentLimit < getCurrentFilterCount() && (
              <button
                onClick={handleLoadMore}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#6b8cce] text-white rounded-[8px] hover:bg-[#5a7ab8] transition-all duration-200 text-xs font-semibold"
              >
                <Icon icon="mdi:plus" width={16} height={16} />
                <span>Load 20 More</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Data Table */}
      <DataTable result={result} isLoading={isLoading} maxRows={currentLimit} />
    </div>
  )
}

export default TaskList
