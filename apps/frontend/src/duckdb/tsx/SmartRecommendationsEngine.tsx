import React, { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import toast from 'react-hot-toast'
import { queryExecutor } from '../query'

interface OverdueTask {
  id: number
  title: string
  due_date: string
  assigned_to_name: string
  project_name: string
  days_overdue: number
  priority: string
}

interface AtRiskProject {
  id: number
  name: string
  risk_score: number
  budget_utilization: number
  days_until_deadline: number
  status: string
  reason: string
}

interface UnderutilizedResource {
  user_id: number
  full_name: string
  role: string
  availability_hours: number
  hours_logged: number
  utilization: number
  task_count: number
}

interface Bottleneck {
  task_id: number
  task_title: string
  blocker_count: number
  dependency_count: number
  blocked_tasks: number
  assigned_to_name: string
  project_name: string
}

const SmartRecommendationsEngine: React.FC = () => {
  const [overdueTasks, setOverdueTasks] = useState<OverdueTask[]>([])
  const [atRiskProjects, setAtRiskProjects] = useState<AtRiskProject[]>([])
  const [underutilizedResources, setUnderutilizedResources] = useState<UnderutilizedResource[]>([])
  const [bottlenecks, setBottlenecks] = useState<Bottleneck[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRecommendations()
  }, [])

  const loadRecommendations = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Get overdue tasks
      const overdueResult = await queryExecutor.executeQuery(`
        SELECT
          t.id,
          t.title,
          t.due_date,
          u.full_name as assigned_to_name,
          p.name as project_name,
          CAST(CURRENT_DATE - t.due_date AS INTEGER) as days_overdue,
          t.priority
        FROM ddb.tasks t
        LEFT JOIN ddb.users u ON t.assigned_to = u.id
        LEFT JOIN ddb.milestones m ON t.milestone_id = m.id
        LEFT JOIN ddb.projects p ON m.project_id = p.id
        WHERE t.due_date < CURRENT_DATE
          AND t.status NOT IN ('completed', 'cancelled')
        ORDER BY days_overdue DESC
        LIMIT 10
      `)

      setOverdueTasks(overdueResult.data.map((row: any) => ({
        id: Number(row.id),
        title: row.title,
        due_date: row.due_date,
        assigned_to_name: row.assigned_to_name || 'Unassigned',
        project_name: row.project_name || 'Unknown',
        days_overdue: Number(row.days_overdue),
        priority: row.priority
      })))

      // Get at-risk projects
      const riskResult = await queryExecutor.executeQuery(`
        SELECT
          p.id,
          p.name,
          p.risk_score,
          CASE
            WHEN p.budget_allocated > 0
            THEN CAST((p.budget_consumed / p.budget_allocated * 100) AS INTEGER)
            ELSE 0
          END as budget_utilization,
          CAST(p.target_end_date - CURRENT_DATE AS INTEGER) as days_until_deadline,
          p.status
        FROM ddb.projects p
        WHERE p.status = 'active'
          AND (
            p.risk_score >= 7
            OR (p.budget_allocated > 0 AND p.budget_consumed / p.budget_allocated > 0.8)
            OR (p.target_end_date - CURRENT_DATE <= 30 AND p.target_end_date > CURRENT_DATE)
          )
        ORDER BY p.risk_score DESC
        LIMIT 10
      `)

      setAtRiskProjects(riskResult.data.map((row: any) => {
        const riskScore = Number(row.risk_score)
        const budgetUtil = Number(row.budget_utilization)
        const daysLeft = Number(row.days_until_deadline)

        let reason = ''
        if (riskScore >= 8) reason = 'High risk score'
        else if (budgetUtil >= 90) reason = 'Budget overrun'
        else if (daysLeft <= 14 && daysLeft > 0) reason = 'Deadline approaching'
        else if (daysLeft <= 0) reason = 'Past deadline'
        else reason = 'Multiple risk factors'

        return {
          id: Number(row.id),
          name: row.name,
          risk_score: riskScore,
          budget_utilization: budgetUtil,
          days_until_deadline: daysLeft,
          status: row.status,
          reason
        }
      }))

      // Get underutilized resources
      const resourceResult = await queryExecutor.executeQuery(`
        SELECT
          u.id as user_id,
          u.full_name,
          u.role,
          u.availability_hours_per_week as availability_hours,
          COALESCE(SUM(wl.hours_logged), 0) as hours_logged,
          COUNT(DISTINCT t.id) as task_count
        FROM ddb.users u
        LEFT JOIN ddb.work_logs wl ON u.id = wl.user_id
          AND wl.log_date >= CURRENT_DATE - INTERVAL '7 days'
        LEFT JOIN ddb.tasks t ON u.id = t.assigned_to
          AND t.status NOT IN ('completed', 'cancelled')
        WHERE u.availability_hours_per_week > 0
        GROUP BY u.id, u.full_name, u.role, u.availability_hours_per_week
        HAVING COALESCE(SUM(wl.hours_logged), 0) < (u.availability_hours_per_week * 0.5)
        ORDER BY hours_logged ASC
        LIMIT 10
      `)

      setUnderutilizedResources(resourceResult.data.map((row: any) => {
        const hoursLogged = Number(row.hours_logged)
        const availHours = Number(row.availability_hours)
        const utilization = availHours > 0 ? Math.round((hoursLogged / availHours) * 100) : 0

        return {
          user_id: Number(row.user_id),
          full_name: row.full_name,
          role: row.role,
          availability_hours: availHours,
          hours_logged: hoursLogged,
          utilization,
          task_count: Number(row.task_count)
        }
      }))

      // Get bottlenecks (tasks with many dependencies or blocking other tasks)
      const bottleneckResult = await queryExecutor.executeQuery(`
        SELECT
          t.id as task_id,
          t.title as task_title,
          COUNT(DISTINCT tc.id) as blocker_count,
          COUNT(DISTINCT td_dep.depends_on_task_id) as dependency_count,
          COUNT(DISTINCT td_block.task_id) as blocked_tasks,
          u.full_name as assigned_to_name,
          p.name as project_name
        FROM ddb.tasks t
        LEFT JOIN ddb.task_comments tc ON t.id = tc.task_id
          AND tc.comment_text ILIKE '%block%'
        LEFT JOIN ddb.task_dependencies td_dep ON t.id = td_dep.task_id
        LEFT JOIN ddb.task_dependencies td_block ON t.id = td_block.depends_on_task_id
        LEFT JOIN ddb.users u ON t.assigned_to = u.id
        LEFT JOIN ddb.milestones m ON t.milestone_id = m.id
        LEFT JOIN ddb.projects p ON m.project_id = p.id
        WHERE t.status NOT IN ('completed', 'cancelled')
        GROUP BY t.id, t.title, u.full_name, p.name
        HAVING COUNT(DISTINCT td_dep.depends_on_task_id) >= 2
          OR COUNT(DISTINCT td_block.task_id) >= 2
          OR COUNT(DISTINCT tc.id) >= 1
        ORDER BY blocked_tasks DESC, dependency_count DESC
        LIMIT 10
      `)

      setBottlenecks(bottleneckResult.data.map((row: any) => ({
        task_id: Number(row.task_id),
        task_title: row.task_title,
        blocker_count: Number(row.blocker_count),
        dependency_count: Number(row.dependency_count),
        blocked_tasks: Number(row.blocked_tasks),
        assigned_to_name: row.assigned_to_name || 'Unassigned',
        project_name: row.project_name || 'Unknown'
      })))

      setIsLoading(false)
    } catch (e) {
      console.error('Error loading recommendations:', e)
      setError('Failed to load recommendations')
      setIsLoading(false)
    }
  }

  const autoSuggestReassignment = async (taskId: number) => {
    try {
      // Find underutilized users for reassignment suggestion
      const suggestion = underutilizedResources.length > 0
        ? underutilizedResources[0]
        : null

      if (!suggestion) {
        toast.error('No suitable users found for reassignment')
        return
      }

      const confirmed = window.confirm(
        `Suggest reassigning task #${taskId} to ${suggestion.full_name}?\n\nCurrent utilization: ${suggestion.utilization}%\nActive tasks: ${suggestion.task_count}`
      )

      if (!confirmed) return

      await queryExecutor.executeQuery(`
        UPDATE ddb.tasks
        SET assigned_to = ${suggestion.user_id}
        WHERE id = ${taskId}
      `)

      toast.success(`Task reassigned to ${suggestion.full_name}`, {
        duration: 3000,
        position: 'top-center',
        icon: '✅',
      })

      setTimeout(() => loadRecommendations(), 100)
    } catch (e) {
      console.error('Error reassigning task:', e)
      toast.error('Failed to reassign task')
    }
  }

  const recommendDeadlineExtension = async (taskId: number, daysOverdue: number) => {
    const extensionDays = Math.max(7, Math.ceil(daysOverdue * 1.5))

    const confirmed = window.confirm(
      `Recommend extending deadline for task #${taskId}?\n\nCurrent overdue: ${daysOverdue} days\nSuggested extension: ${extensionDays} days`
    )

    if (!confirmed) return

    try {
      await queryExecutor.executeQuery(`
        UPDATE ddb.tasks
        SET due_date = CURRENT_DATE + INTERVAL '${extensionDays} days'
        WHERE id = ${taskId}
      `)

      toast.success(`Deadline extended by ${extensionDays} days`, {
        duration: 3000,
        position: 'top-center',
        icon: '📅',
      })

      setTimeout(() => loadRecommendations(), 100)
    } catch (e) {
      console.error('Error extending deadline:', e)
      toast.error('Failed to extend deadline')
    }
  }

  const proposeResourceReallocation = async () => {
    const totalUnderutilized = underutilizedResources.length
    const totalOverdue = overdueTasks.length

    if (totalUnderutilized === 0 || totalOverdue === 0) {
      toast.error('No reallocation opportunities found')
      return
    }

    // Generate reallocation plan
    const plan: Array<{task: OverdueTask, assignTo: UnderutilizedResource}> = []
    const maxReallocations = Math.min(totalUnderutilized, totalOverdue)

    for (let i = 0; i < maxReallocations; i++) {
      plan.push({
        task: overdueTasks[i],
        assignTo: underutilizedResources[i]
      })
    }

    // Show detailed plan
    const planDetails = plan.map((item, idx) =>
      `${idx + 1}. "${item.task.title}" → ${item.assignTo.full_name} (${item.assignTo.utilization}% utilized)`
    ).join('\n')

    const confirmed = window.confirm(
      `Reallocation Plan:\n\n${planDetails}\n\nExecute this reallocation plan?`
    )

    if (!confirmed) return

    try {
      // Execute reallocations
      let successCount = 0
      for (const item of plan) {
        try {
          await queryExecutor.executeQuery(`
            UPDATE ddb.tasks
            SET assigned_to = ${item.assignTo.user_id}
            WHERE id = ${item.task.id}
          `)
          successCount++
        } catch (err) {
          console.error(`Failed to reassign task ${item.task.id}:`, err)
        }
      }

      toast.success(`Successfully reallocated ${successCount} of ${plan.length} tasks`, {
        duration: 4000,
        position: 'top-center',
        icon: '✅',
      })

      setTimeout(() => loadRecommendations(), 100)
    } catch (e) {
      console.error('Error executing reallocation plan:', e)
      toast.error('Failed to execute reallocation plan')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-[#fc8181]'
      case 'high': return 'text-[#f6ad55]'
      case 'medium': return 'text-[#ffd93d]'
      case 'low': return 'text-[#6bcf7f]'
      default: return 'text-[#718096]'
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-3 py-12">
          <div className="w-6 h-6 border-2 border-[#6b8cce] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#718096]">Loading recommendations...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <Icon icon="mdi:alert-circle" width={48} height={48} className="text-[#fc8181] mx-auto mb-4" />
          <p className="text-[#fc8181] font-medium">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 bg-[#6b8cce] bg-opacity-10 rounded-[16px] flex items-center justify-center">
            <Icon icon="mdi:lightbulb-on" width={32} height={32} className="text-[#2d3748]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#2d3748] mb-1">Smart Recommendations Engine</h2>
            <p className="text-sm text-[#718096]">AI-powered insights for project optimization and risk mitigation</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-[#fc8181] to-[#e57373] rounded-[16px] p-5">
          <div className="flex items-center gap-3 mb-2">
            <Icon icon="mdi:alert-circle" width={24} height={24} className="text-white opacity-90" />
            <div className="text-sm text-white opacity-90">Overdue Tasks</div>
          </div>
          <div className="font-bold text-3xl text-white">{overdueTasks.length}</div>
          <div className="text-xs text-white opacity-75 mt-1">Require immediate attention</div>
        </div>

        <div className="bg-gradient-to-br from-[#ffd93d] to-[#f6ad55] rounded-[16px] p-5">
          <div className="flex items-center gap-3 mb-2">
            <Icon icon="mdi:alert-octagon" width={24} height={24} className="text-white opacity-90" />
            <div className="text-sm text-white opacity-90">At-Risk Projects</div>
          </div>
          <div className="font-bold text-3xl text-white">{atRiskProjects.length}</div>
          <div className="text-xs text-white opacity-75 mt-1">Need intervention</div>
        </div>

        <div className="bg-gradient-to-br from-[#6bcf7f] to-[#48bb78] rounded-[16px] p-5">
          <div className="flex items-center gap-3 mb-2">
            <Icon icon="mdi:account-clock" width={24} height={24} className="text-white opacity-90" />
            <div className="text-sm text-white opacity-90">Available Resources</div>
          </div>
          <div className="font-bold text-3xl text-white">{underutilizedResources.length}</div>
          <div className="text-xs text-white opacity-75 mt-1">Underutilized team members</div>
        </div>

        <div className="bg-gradient-to-br from-[#9b8cce] to-[#8574b8] rounded-[16px] p-5">
          <div className="flex items-center gap-3 mb-2">
            <Icon icon="mdi:traffic-cone" width={24} height={24} className="text-white opacity-90" />
            <div className="text-sm text-white opacity-90">Bottlenecks</div>
          </div>
          <div className="font-bold text-3xl text-white">{bottlenecks.length}</div>
          <div className="text-xs text-white opacity-75 mt-1">Blocking progress</div>
        </div>
      </div>


      {/* Overdue Tasks Section */}
      <div className="bg-[#f8f9fb] rounded-[16px] p-5 border border-[#e2e8f0] mb-6">
        <h3 className="text-base font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
          <Icon icon="mdi:calendar-alert" width={18} height={18} className="text-[#2d3748]" />
          Overdue Tasks ({overdueTasks.length})
        </h3>

        {overdueTasks.length === 0 ? (
          <div className="text-center py-8 text-[#718096]">
            <Icon icon="mdi:check-circle" width={48} height={48} className="text-[#6bcf7f] mx-auto mb-2" />
            <p>No overdue tasks! Great job!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {overdueTasks.map((task) => (
              <div key={task.id} className="bg-white rounded-[12px] p-4 border border-[#e2e8f0]">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-[#2d3748]">{task.title}</h4>
                      <span className={`px-2 py-0.5 rounded-[6px] text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#718096]">
                      <span className="flex items-center gap-1">
                        <Icon icon="mdi:account" width={14} height={14} />
                        {task.assigned_to_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon icon="mdi:folder" width={14} height={14} />
                        {task.project_name}
                      </span>
                      <span className="flex items-center gap-1 text-[#fc8181] font-medium">
                        <Icon icon="mdi:clock-alert" width={14} height={14} />
                        {task.days_overdue} days overdue
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* At-Risk Projects Section */}
      <div className="bg-[#f8f9fb] rounded-[16px] p-5 border border-[#e2e8f0] mb-6">
        <h3 className="text-base font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
          <Icon icon="mdi:alert-rhombus" width={18} height={18} className="text-[#2d3748]" />
          At-Risk Projects ({atRiskProjects.length})
        </h3>

        {atRiskProjects.length === 0 ? (
          <div className="text-center py-8 text-[#718096]">
            <Icon icon="mdi:shield-check" width={48} height={48} className="text-[#6bcf7f] mx-auto mb-2" />
            <p>All projects are on track!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {atRiskProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-[12px] p-4 border border-[#e2e8f0]">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-[#2d3748] mb-1">{project.name}</h4>
                    <p className="text-xs text-[#fc8181] font-medium">{project.reason}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${
                    project.risk_score >= 8 ? 'bg-[#fc8181]' : 'bg-[#ffd93d]'
                  } bg-opacity-20`}>
                    <span className={`font-bold text-sm ${
                      project.risk_score >= 8 ? 'text-[#fc8181]' : 'text-[#f6ad55]'
                    }`}>
                      {project.risk_score}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#718096]">Budget Used:</span>
                    <span className="ml-1 font-medium text-[#2d3748]">{project.budget_utilization}%</span>
                  </div>
                  <div>
                    <span className="text-[#718096]">Deadline:</span>
                    <span className="ml-1 font-medium text-[#2d3748]">
                      {project.days_until_deadline > 0 ? `${project.days_until_deadline}d` : 'Overdue'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Underutilized Resources & Bottlenecks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Underutilized Resources */}
        <div className="bg-[#f8f9fb] rounded-[16px] p-5 border border-[#e2e8f0]">
          <h3 className="text-base font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
            <Icon icon="mdi:account-off" width={18} height={18} className="text-[#2d3748]" />
            Underutilized Resources ({underutilizedResources.length})
          </h3>

          {underutilizedResources.length === 0 ? (
            <div className="text-center py-8 text-[#718096]">
              <Icon icon="mdi:account-check" width={48} height={48} className="text-[#6bcf7f] mx-auto mb-2" />
              <p>All resources optimally utilized!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {underutilizedResources.map((resource) => (
                <div key={resource.user_id} className="bg-white rounded-[10px] p-3 border border-[#e2e8f0]">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-[#2d3748] text-sm">{resource.full_name}</p>
                      <p className="text-xs text-[#718096]">{resource.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#6bcf7f]">{resource.utilization}%</p>
                      <p className="text-xs text-[#718096]">{resource.task_count} tasks</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottlenecks */}
        <div className="bg-[#f8f9fb] rounded-[16px] p-5 border border-[#e2e8f0]">
          <h3 className="text-base font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
            <Icon icon="mdi:traffic-light" width={18} height={18} className="text-[#2d3748]" />
            Bottlenecks ({bottlenecks.length})
          </h3>

          {bottlenecks.length === 0 ? (
            <div className="text-center py-8 text-[#718096]">
              <Icon icon="mdi:highway" width={48} height={48} className="text-[#6bcf7f] mx-auto mb-2" />
              <p>No bottlenecks detected!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {bottlenecks.map((bottleneck) => (
                <div key={bottleneck.task_id} className="bg-white rounded-[10px] p-3 border border-[#e2e8f0]">
                  <div className="mb-2">
                    <p className="font-medium text-[#2d3748] text-sm">{bottleneck.task_title}</p>
                    <p className="text-xs text-[#718096]">{bottleneck.assigned_to_name} • {bottleneck.project_name}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    {bottleneck.blocked_tasks > 0 && (
                      <span className="flex items-center gap-1 text-[#fc8181]">
                        <Icon icon="mdi:block-helper" width={12} height={12} />
                        Blocking {bottleneck.blocked_tasks}
                      </span>
                    )}
                    {bottleneck.dependency_count > 0 && (
                      <span className="flex items-center gap-1 text-[#ffd93d]">
                        <Icon icon="mdi:link-variant" width={12} height={12} />
                        {bottleneck.dependency_count} deps
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SmartRecommendationsEngine
