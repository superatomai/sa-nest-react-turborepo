import React, { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import toast from 'react-hot-toast'
import { queryExecutor } from '../query'

interface CreateProjectFormProps {
  theme?: string
}

const CreateProjectForm: React.FC<CreateProjectFormProps> = ({ theme = 'modern' }) => {
  // Form fields
  const [organizationId, setOrganizationId] = useState<string>('')
  const [name, setName] = useState<string>('')
  const [codeName, setCodeName] = useState<string>('')
  const [status, setStatus] = useState<string>('planning')
  const [priority, setPriority] = useState<string>('medium')
  const [startDate, setStartDate] = useState<string>('')
  const [targetEndDate, setTargetEndDate] = useState<string>('')
  const [budgetAllocated, setBudgetAllocated] = useState<string>('')
  const [riskScore, setRiskScore] = useState<string>('')
  const [complianceRequired, setComplianceRequired] = useState<boolean>(false)
  const [clientFacing, setClientFacing] = useState<boolean>(false)

  // Dropdown data
  const [organizations, setOrganizations] = useState<Array<{ id: number; name: string }>>([])
  const [isLoadingOrgs, setIsLoadingOrgs] = useState<boolean>(false)

  useEffect(() => {
    loadOrganizations()
  }, [])

  const loadOrganizations = async () => {
    setIsLoadingOrgs(true)
    try {
      const result = await queryExecutor.executeQuery('SELECT id, name FROM ddb.organizations ORDER BY name')
      setOrganizations(result.data)
    } catch (e) {
      console.error('Error loading organizations:', e)
      setOrganizations([])
    }
    setIsLoadingOrgs(false)
  }

  const handleSubmit = async () => {
    try {
      if (!name.trim()) {
        toast.error('Please enter a project name')
        return
      }

      if (!organizationId) {
        toast.error('Please select an organization')
        return
      }

      // Get the next available ID
      const maxIdResult = await queryExecutor.executeQuery('SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM ddb.projects')
      const nextId = maxIdResult.data[0]?.next_id || 1

      const newProject = {
        id: nextId,
        organization_id: parseInt(organizationId),
        name,
        code_name: codeName,
        status,
        priority,
        start_date: startDate,
        target_end_date: targetEndDate,
        budget_allocated: budgetAllocated ? parseFloat(budgetAllocated) : null,
        risk_score: riskScore ? parseFloat(riskScore) : null,
        compliance_required: complianceRequired,
        client_facing: clientFacing,
        created_at: new Date().toISOString()
      }

      console.log('Project created:', newProject)

      // Build INSERT query
      const query = `
        INSERT INTO ddb.projects (
          id, organization_id, name, code_name, status, priority,
          start_date, target_end_date, budget_allocated, risk_score,
          compliance_required, client_facing, created_at
        ) VALUES (
          ${nextId},
          ${organizationId ? parseInt(organizationId) : 'NULL'},
          '${name.replace(/'/g, "''")}',
          '${codeName.replace(/'/g, "''")}',
          '${status}',
          '${priority}',
          ${startDate ? `'${startDate}'` : 'NULL'},
          ${targetEndDate ? `'${targetEndDate}'` : 'NULL'},
          ${budgetAllocated ? parseFloat(budgetAllocated) : 'NULL'},
          ${riskScore ? parseFloat(riskScore) : 'NULL'},
          ${complianceRequired},
          ${clientFacing},
          '${new Date().toISOString()}'
        )
      `

      console.log('📝 SQL Query:', query)

      await queryExecutor.executeQuery(query)

      toast.success('Project created successfully!')
      handleClearForm()
    } catch (e) {
      console.error('Error creating project:', e)
      toast.error('Failed to create project. Please try again.')
    }
  }

  const handleClearForm = () => {
    setOrganizationId('')
    setName('')
    setCodeName('')
    setStatus('planning')
    setPriority('medium')
    setStartDate('')
    setTargetEndDate('')
    setBudgetAllocated('')
    setRiskScore('')
    setComplianceRequired(false)
    setClientFacing(false)
  }

  return (
    <div className="min-h-screen bg-[#d4dce6] p-8">
      {/* Header */}
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 mb-6">
        <h1 className="text-[2rem] font-bold text-[#2d3748] flex items-center gap-3 mb-2">
          <Icon icon="mdi:folder-plus" width={36} height={36} className="text-[#6b8cce]" />
          <span>Create New Project</span>
        </h1>
        <p className="text-[#718096] text-base">
          Fill out the form below to create a new project in the system
        </p>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 mb-6">
        <div className="space-y-6">
          {/* Organization Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#4a5568]">
              Organization <span className="text-[#fc8181]">*</span>
            </label>
            <select
              value={organizationId}
              onChange={(e) => setOrganizationId(e.target.value)}
              disabled={isLoadingOrgs}
              className="w-full px-4 py-3 bg-[#f8f9fb] border border-[#e2e8f0] rounded-[10px] text-[#2d3748] focus:outline-none focus:border-[#6b8cce] focus:ring-2 focus:ring-[#6b8cce] focus:ring-opacity-20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select an organization</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
            {isLoadingOrgs && (
              <p className="text-xs text-[#718096]">Loading organizations...</p>
            )}
          </div>

          {/* Project Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#4a5568]">
              Project Name <span className="text-[#fc8181]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-[#f8f9fb] border border-[#e2e8f0] rounded-[10px] text-[#2d3748] focus:outline-none focus:border-[#6b8cce] focus:ring-2 focus:ring-[#6b8cce] focus:ring-opacity-20 transition-all duration-200"
              placeholder="Customer Portal Redesign"
            />
          </div>

          {/* Code Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#4a5568]">
              Code Name
            </label>
            <input
              type="text"
              value={codeName}
              onChange={(e) => setCodeName(e.target.value)}
              className="w-full px-4 py-3 bg-[#f8f9fb] border border-[#e2e8f0] rounded-[10px] text-[#2d3748] focus:outline-none focus:border-[#6b8cce] focus:ring-2 focus:ring-[#6b8cce] focus:ring-opacity-20 transition-all duration-200"
              placeholder="PROJECT-2024-001"
            />
          </div>

          {/* Status and Priority Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#4a5568]">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 bg-[#f8f9fb] border border-[#e2e8f0] rounded-[10px] text-[#2d3748] focus:outline-none focus:border-[#6b8cce] focus:ring-2 focus:ring-[#6b8cce] focus:ring-opacity-20 transition-all duration-200"
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#4a5568]">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-3 bg-[#f8f9fb] border border-[#e2e8f0] rounded-[10px] text-[#2d3748] focus:outline-none focus:border-[#6b8cce] focus:ring-2 focus:ring-[#6b8cce] focus:ring-opacity-20 transition-all duration-200"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Start Date and Target End Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#4a5568]">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-[#f8f9fb] border border-[#e2e8f0] rounded-[10px] text-[#2d3748] focus:outline-none focus:border-[#6b8cce] focus:ring-2 focus:ring-[#6b8cce] focus:ring-opacity-20 transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#4a5568]">
                Target End Date
              </label>
              <input
                type="date"
                value={targetEndDate}
                onChange={(e) => setTargetEndDate(e.target.value)}
                className="w-full px-4 py-3 bg-[#f8f9fb] border border-[#e2e8f0] rounded-[10px] text-[#2d3748] focus:outline-none focus:border-[#6b8cce] focus:ring-2 focus:ring-[#6b8cce] focus:ring-opacity-20 transition-all duration-200"
              />
            </div>
          </div>

          {/* Budget and Risk Score Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#4a5568]">
                Budget Allocated ($)
              </label>
              <input
                type="number"
                value={budgetAllocated}
                onChange={(e) => setBudgetAllocated(e.target.value)}
                className="w-full px-4 py-3 bg-[#f8f9fb] border border-[#e2e8f0] rounded-[10px] text-[#2d3748] focus:outline-none focus:border-[#6b8cce] focus:ring-2 focus:ring-[#6b8cce] focus:ring-opacity-20 transition-all duration-200"
                placeholder="100000"
                step="1000"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#4a5568]">
                Risk Score (0-100)
              </label>
              <input
                type="number"
                value={riskScore}
                onChange={(e) => setRiskScore(e.target.value)}
                className="w-full px-4 py-3 bg-[#f8f9fb] border border-[#e2e8f0] rounded-[10px] text-[#2d3748] focus:outline-none focus:border-[#6b8cce] focus:ring-2 focus:ring-[#6b8cce] focus:ring-opacity-20 transition-all duration-200"
                placeholder="25"
                min="0"
                max="100"
                step="1"
              />
            </div>
          </div>

          {/* Checkboxes Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="complianceRequired"
                checked={complianceRequired}
                onChange={(e) => setComplianceRequired(e.target.checked)}
                className="w-5 h-5 text-[#6b8cce] bg-[#f8f9fb] border-[#e2e8f0] rounded focus:ring-[#6b8cce] focus:ring-2"
              />
              <label htmlFor="complianceRequired" className="ml-3 text-sm font-medium text-[#4a5568]">
                Compliance Required
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="clientFacing"
                checked={clientFacing}
                onChange={(e) => setClientFacing(e.target.checked)}
                className="w-5 h-5 text-[#6b8cce] bg-[#f8f9fb] border-[#e2e8f0] rounded focus:ring-[#6b8cce] focus:ring-2"
              />
              <label htmlFor="clientFacing" className="ml-3 text-sm font-medium text-[#4a5568]">
                Client Facing
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-[#6b8cce] text-white px-6 py-3 rounded-[10px] font-semibold text-sm shadow-[0_2px_8px_rgba(107,140,206,0.25)] hover:bg-[#5a7ab8] transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Icon icon="mdi:check-circle" width={20} height={20} />
              <span>Create Project</span>
            </button>
            <button
              onClick={handleClearForm}
              className="px-6 py-3 bg-white text-[#4a5568] rounded-[10px] font-medium text-sm border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:bg-[#f8f9fb] transition-all duration-200"
            >
              Clear Form
            </button>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-[#e3f2fd] border border-[#90caf9] rounded-[16px] p-6">
        <div className="flex items-start">
          <Icon icon="mdi:information" width={20} height={20} className="text-[#1976d2] mr-3 mt-0.5 flex-shrink-0" />
          <div className="text-[#1565c0]">
            <p className="font-semibold mb-1">Project Creation Form</p>
            <p className="text-sm">
              This form creates projects with organization associations. Projects can have budgets, risk scores,
              and compliance requirements. Use code names for internal identification.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateProjectForm