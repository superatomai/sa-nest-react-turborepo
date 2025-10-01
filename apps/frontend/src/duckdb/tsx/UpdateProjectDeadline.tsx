import React, { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import toast from 'react-hot-toast'
import { queryExecutor } from '../query'

interface UpdateProjectDeadlineProps {
  theme?: string
}

const UpdateProjectDeadline: React.FC<UpdateProjectDeadlineProps> = ({ theme = 'modern' }) => {
  const [projects, setProjects] = useState<Array<any>>([])
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [newDeadline, setNewDeadline] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isUpdating, setIsUpdating] = useState<boolean>(false)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    setIsLoading(true)
    try {
      const result = await queryExecutor.executeQuery(`
        SELECT id, name, code_name, status, target_end_date, actual_end_date, priority
        FROM ddb.projects
        WHERE status IN ('planning', 'active')
          AND target_end_date IS NOT NULL
        ORDER BY target_end_date ASC
        LIMIT 50
      `)

      // Filter to only show projects that are overdue or close to deadline (within 14 days)
      const now = new Date()
      const filteredProjects = result.data.filter((project: any) => {
        if (!project.target_end_date) return false
        const deadline = new Date(project.target_end_date)
        const diffTime = deadline.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        // Show if overdue (negative) or within 14 days
        return diffDays <= 14
      })

      setProjects(filteredProjects)
      if (filteredProjects.length > 0) {
        setSelectedProject(filteredProjects[0])
        setNewDeadline(filteredProjects[0].target_end_date || '')
      }
    } catch (e) {
      console.error('Error loading projects:', e)
      setProjects([])
    }
    setIsLoading(false)
  }

  const handleSelectProject = (project: any) => {
    setSelectedProject(project)
    setNewDeadline(project.target_end_date || '')
  }

  const handleUpdateDeadline = async () => {
    if (!selectedProject) return

    setIsUpdating(true)
    try {
      console.log('Updating project deadline:', {
        project_id: selectedProject.id,
        old_deadline: selectedProject.target_end_date,
        new_deadline: newDeadline
      })

      // Build UPDATE query
      const query = `UPDATE ddb.projects SET target_end_date = '${newDeadline}' WHERE id = ${selectedProject.id}`

      console.log('📝 SQL Query:', query)

      await queryExecutor.executeQuery(query)

      toast.success(`Deadline updated for ${selectedProject.name}!`)
      loadProjects()
    } catch (e) {
      console.error('Error updating deadline:', e)
      toast.error('Failed to update deadline')
    }
    setIsUpdating(false)
  }

  const getDaysUntilDeadline = (deadline: string) => {
    if (!deadline) return null
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getDeadlineStatus = (days: number | null) => {
    if (days === null) return { text: 'No deadline set', color: 'text-[#718096]', bg: 'bg-[#e2e8f0]' }
    if (days < 0) return { text: `${Math.abs(days)} days overdue`, color: 'text-[#c53030]', bg: 'bg-[#fed7d7]' }
    if (days === 0) return { text: 'Due today', color: 'text-[#dd6b20]', bg: 'bg-[#feebc8]' }
    if (days <= 7) return { text: `${days} days left`, color: 'text-[#d69e2e]', bg: 'bg-[#fefcbf]' }
    return { text: `${days} days left`, color: 'text-[#38a169]', bg: 'bg-[#c6f6d5]' }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#d4dce6] p-8 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#6b8cce] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#718096]">Loading projects...</span>
        </div>
      </div>
    )
  }

  if (!selectedProject) {
    return (
      <div className="min-h-screen bg-[#d4dce6] p-8">
        <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 text-center">
          <Icon icon="mdi:check-circle-outline" width={64} height={64} className="mx-auto mb-4 text-[#48bb78]" />
          <p className="text-[#2d3748] font-semibold text-lg mb-2">All projects are on track!</p>
          <p className="text-[#718096]">No projects with approaching or overdue deadlines at the moment</p>
        </div>
      </div>
    )
  }

  const daysLeft = getDaysUntilDeadline(selectedProject.target_end_date)
  const deadlineStatus = getDeadlineStatus(daysLeft)

  return (
    <div className="min-h-screen bg-[#d4dce6] p-8">
      {/* Header with Context */}
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[#6b8cce] bg-opacity-10 rounded-[12px] flex items-center justify-center flex-shrink-0">
            <Icon icon="mdi:calendar-clock" width={28} height={28} className="text-[#6b8cce]" />
          </div>
          <div className="flex-1">
            <h1 className="text-[1.75rem] font-bold text-[#2d3748] mb-2">
              Project Deadline Management
            </h1>
            <p className="text-[#718096] text-base">
              {projects.length > 0
                ? `${projects.length} project${projects.length !== 1 ? 's' : ''} with approaching or overdue deadlines`
                : 'All projects are on track!'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
            <h2 className="text-lg font-semibold text-[#2d3748] mb-4">Needs Attention</h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {projects.map((project) => {
                const days = getDaysUntilDeadline(project.target_end_date)
                const status = getDeadlineStatus(days)
                return (
                  <button
                    key={project.id}
                    onClick={() => handleSelectProject(project)}
                    className={`w-full text-left p-4 rounded-[12px] border-2 transition-all duration-200 ${
                      selectedProject?.id === project.id
                        ? 'border-[#6b8cce] bg-[#6b8cce] bg-opacity-5'
                        : 'border-[#e2e8f0] hover:border-[#6b8cce] hover:bg-[#f8f9fb]'
                    }`}
                  >
                    <div className="font-medium text-[#2d3748] text-sm mb-1">{project.name}</div>
                    <div className="text-xs text-[#718096] mb-2">{project.code_name}</div>
                    <div className={`inline-block px-2 py-1 rounded-[6px] text-xs font-medium ${status.bg} ${status.color}`}>
                      {status.text}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contextual Info Card */}
          <div className="bg-gradient-to-br from-[#6b8cce] to-[#5a7ab8] rounded-[20px] shadow-[0_4px_16px_rgba(107,140,206,0.3)] p-8 text-white">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedProject.name}</h2>
                <p className="text-white text-opacity-90 text-sm">{selectedProject.code_name}</p>
              </div>
              <div className={`px-4 py-2 rounded-[10px] text-sm font-semibold ${
                selectedProject.priority === 'critical' ? 'bg-[#fc8181] bg-opacity-20 border border-[#fc8181] border-opacity-30' :
                selectedProject.priority === 'high' ? 'bg-[#f6ad55] bg-opacity-20 border border-[#f6ad55] border-opacity-30' :
                'bg-gray-400 bg-opacity-20 border border-white border-opacity-30'
              }`}>
                {selectedProject.priority.toUpperCase()} PRIORITY
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-black">
              <div className="bg-white bg-opacity-10 rounded-[12px] p-4 backdrop-blur-sm">
                <div className=" text-opacity-70 text-xs mb-1">Current Status</div>
                <div className="font-semibold text-lg capitalize">{selectedProject.status.replace('_', ' ')}</div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-[12px] p-4 backdrop-blur-sm">
                <div className=" text-opacity-70 text-xs mb-1">Current Deadline</div>
                <div className="font-semibold text-lg ">
                  {selectedProject.target_end_date ? new Date(selectedProject.target_end_date).toLocaleDateString() : 'Not set'}
                </div>
              </div>
            </div>

            {daysLeft !== null && (
              <div className="bg-white bg-opacity-15 rounded-[12px] p-4 backdrop-blur-sm border border-white border-opacity-20 text-black">
                <div className="flex items-center gap-3">
                  <Icon
                    icon={daysLeft < 0 ? "mdi:alert-circle" : daysLeft <= 7 ? "mdi:clock-alert" : "mdi:check-circle"}
                    width={24}
                    height={24}
                  />
                  <div>
                    <div className="font-semibold text-sm text-black">
                      {daysLeft < 0
                        ? `⚠️ This project is ${Math.abs(daysLeft)} days overdue and hasn't been completed yet`
                        : daysLeft <= 7
                        ? `⏰ Deadline approaching! Only ${daysLeft} days remaining`
                        : `✓ ${daysLeft} days until deadline`
                      }
                    </div>
                    {daysLeft < 7 && (
                      <div className="text-xs  text-opacity-80 mt-1">
                        Consider extending the deadline if the project needs more time
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Update Deadline Form */}
          <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8">
            <h3 className="text-xl font-semibold text-[#2d3748] mb-6 flex items-center gap-2">
              <Icon icon="mdi:calendar-edit" width={24} height={24} className="text-[#6b8cce]" />
              Update Project Deadline
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#4a5568]">
                  New Target End Date
                </label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f8f9fb] border border-[#e2e8f0] rounded-[10px] text-[#2d3748] focus:outline-none focus:border-[#6b8cce] focus:ring-2 focus:ring-[#6b8cce] focus:ring-opacity-20 transition-all duration-200"
                />
              </div>

              <button
                onClick={handleUpdateDeadline}
                disabled={isUpdating || !newDeadline || newDeadline === selectedProject.target_end_date}
                className="w-full bg-[#6b8cce] text-white px-6 py-3 rounded-[10px] font-semibold text-sm shadow-[0_2px_8px_rgba(107,140,206,0.25)] hover:bg-[#5a7ab8] transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:content-save" width={20} height={20} />
                    <span>Update Deadline</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UpdateProjectDeadline