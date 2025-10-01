import React, { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import toast from 'react-hot-toast'
import { queryExecutor } from '../query'
import DataTable from '../components/DataTable'
import type { QueryResult } from '../types'

interface UserListProps {
  theme?: string
  initialLimit?: number
}

interface RoleCount {
  role: string
  count: number
}

const UserList: React.FC<UserListProps> = ({ theme = 'modern', initialLimit = 100 }) => {
  const [result, setResult] = useState<QueryResult | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [filter, setFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [roleCounts, setRoleCounts] = useState<RoleCount[]>([])
  const [currentLimit, setCurrentLimit] = useState<number>(initialLimit)

  useEffect(() => {
    loadRoleCounts()
  }, [])

  useEffect(() => {
    setCurrentLimit(initialLimit)
  }, [filter])

  useEffect(() => {
    loadUsers()
  }, [filter, currentLimit])

  const loadRoleCounts = async () => {
    try {
      const query = `
        SELECT
          role,
          COUNT(*) as count
        FROM ddb.users
        WHERE role IS NOT NULL
        GROUP BY role
        ORDER BY role
      `
      const result = await queryExecutor.executeQuery(query)

      const counts: RoleCount[] = result.data.map((row: any) => ({
        role: row.role,
        count: typeof row.count === 'bigint' ? Number(row.count) : row.count
      }))

      setRoleCounts(counts)
    } catch (e) {
      console.error('Error loading role counts:', e)
      setRoleCounts([])
    }
  }

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      let query = `
        SELECT
          u.id,
          u.full_name,
          u.email,
          u.role,
          u.specialization,
          u.availability_hours_per_week,
          u.timezone,
          o.name as organization,
          d.name as department,
          u.created_at
        FROM ddb.users u
        LEFT JOIN ddb.organizations o ON u.organization_id = o.id
        LEFT JOIN ddb.departments d ON u.department_id = d.id
      `

      // Add filter conditions
      if (filter !== 'all') {
        query += ` WHERE u.role = '${filter}'`
      }

      // Add search filter
      if (searchQuery.trim()) {
        const searchCondition = `(u.full_name ILIKE '%${searchQuery.trim()}%' OR u.email ILIKE '%${searchQuery.trim()}%')`
        query += filter === 'all' ? ` WHERE ${searchCondition}` : ` AND ${searchCondition}`
      }

      query += ` ORDER BY u.created_at DESC LIMIT ${currentLimit}`

      console.log('📊 Executing query:', query)
      const queryResult = await queryExecutor.executeQuery(query)

      setResult(queryResult)
    } catch (e) {
      console.error('Error loading users:', e)
      toast.error('Failed to load users')
      setResult(null)
    }
    setIsLoading(false)
  }

  const handleRefresh = () => {
    setCurrentLimit(initialLimit)
    loadRoleCounts()
    loadUsers()
  }

  const handleSearch = () => {
    loadUsers()
  }

  const handleLoadMore = () => {
    setCurrentLimit(prev => prev + 20)
  }

  const getTotalCount = () => {
    return roleCounts.reduce((sum, r) => sum + r.count, 0)
  }

  const getCurrentFilterCount = () => {
    if (filter === 'all') {
      return getTotalCount()
    }
    const role = roleCounts.find(r => r.role === filter)
    return role ? role.count : 0
  }

  const getRoleColor = (role: string) => {
    const colorMap: Record<string, string> = {
      developer: 'bg-[#6bcf7f] text-white',
      designer: 'bg-[#ff6b9d] text-white',
      manager: 'bg-[#9b8cce] text-white',
      admin: 'bg-[#fc8181] text-white',
      analyst: 'bg-[#5ba3d0] text-white'
    }
    return colorMap[role] || 'bg-[#6b8cce] text-white'
  }

  return (
    <div className="min-h-screen bg-[#d4dce6] p-8">
      {/* Header */}
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-[2rem] font-bold text-[#2d3748] flex items-center gap-3 mb-2">
              <Icon icon="mdi:account-group" width={36} height={36} className="text-[#6b8cce]" />
              <span>All Users</span>
            </h1>
            <p className="text-[#718096] text-base">
              View and manage all users in the system
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
              placeholder="Search users by name or email..."
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
            All Users ({getTotalCount()})
          </button>
          {roleCounts.map((roleCount) => (
            <button
              key={roleCount.role}
              onClick={() => setFilter(roleCount.role)}
              className={`px-4 py-2 rounded-[8px] font-medium text-sm transition-all duration-200 capitalize ${
                filter === roleCount.role
                  ? getRoleColor(roleCount.role)
                  : 'bg-[#f8f9fb] text-[#718096] hover:bg-[#e2e8f0]'
              }`}
            >
              {roleCount.role.replace('_', ' ')}s ({roleCount.count})
            </button>
          ))}
        </div>

        {/* Load More Section */}
        {!isLoading && result && result.data.length > 0 && (
          <div className="flex items-center justify-between mt-3 px-3 py-2 bg-[#f8f9fb] rounded-[8px]">
            <div className="text-[#718096] text-sm">
              Showing <span className="font-semibold text-[#2d3748]">{result.data.length}</span> of{' '}
              <span className="font-semibold text-[#2d3748]">{getCurrentFilterCount()}</span> users
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

export default UserList
