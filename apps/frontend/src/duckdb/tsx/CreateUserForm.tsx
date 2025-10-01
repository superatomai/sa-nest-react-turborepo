import React, { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import toast from 'react-hot-toast'
import { queryExecutor } from '../query'

interface CreateUserFormProps {
  theme?: string
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({ theme = 'modern' }) => {
  const [organizationId, setOrganizationId] = useState<string>('')
  const [departmentId, setDepartmentId] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [fullName, setFullName] = useState<string>('')
  const [role, setRole] = useState<string>('developer')
  const [specialization, setSpecialization] = useState<string>('')
  const [availabilityHoursPerWeek, setAvailabilityHoursPerWeek] = useState<string>('')
  const [timezone, setTimezone] = useState<string>('UTC')

  const [organizations, setOrganizations] = useState<Array<{ id: number; name: string }>>([])
  const [departments, setDepartments] = useState<Array<{ id: number; name: string }>>([])
  const [isLoadingOrgs, setIsLoadingOrgs] = useState<boolean>(false)
  const [isLoadingDepts, setIsLoadingDepts] = useState<boolean>(false)

  useEffect(() => {
    loadOrganizations()
    loadDepartments()
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

  const loadDepartments = async () => {
    setIsLoadingDepts(true)
    try {
      const result = await queryExecutor.executeQuery('SELECT id, name FROM ddb.departments ORDER BY name')
      setDepartments(result.data)
    } catch (e) {
      console.error('Error loading departments:', e)
      setDepartments([])
    }
    setIsLoadingDepts(false)
  }

  const handleSubmit = async () => {
    try {
      if (!email.trim()) {
        toast.error('Please enter an email address')
        return
      }

      if (!fullName.trim()) {
        toast.error('Please enter the full name')
        return
      }

      // Get the next available ID
      const maxIdResult = await queryExecutor.executeQuery('SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM ddb.users')
      const nextId = maxIdResult.data[0]?.next_id || 1

      const newUser = {
        id: nextId,
        organization_id: organizationId ? parseInt(organizationId) : null,
        department_id: departmentId ? parseInt(departmentId) : null,
        email,
        full_name: fullName,
        role,
        specialization,
        availability_hours_per_week: availabilityHoursPerWeek ? parseFloat(availabilityHoursPerWeek) : null,
        timezone,
        created_at: new Date().toISOString()
      }

      console.log('User created:', newUser)

      // Build INSERT query
      const query = `
        INSERT INTO ddb.users (
          id, organization_id, department_id, email, full_name, role,
          specialization, availability_hours_per_week, timezone, created_at
        ) VALUES (
          ${nextId},
          ${organizationId ? parseInt(organizationId) : 'NULL'},
          ${departmentId ? parseInt(departmentId) : 'NULL'},
          '${email.replace(/'/g, "''")}',
          '${fullName.replace(/'/g, "''")}',
          '${role}',
          '${specialization.replace(/'/g, "''")}',
          ${availabilityHoursPerWeek ? parseFloat(availabilityHoursPerWeek) : 'NULL'},
          '${timezone}',
          '${new Date().toISOString()}'
        )
      `

      console.log('📝 SQL Query:', query)

      await queryExecutor.executeQuery(query)

      toast.success('User created successfully!')
      handleClearForm()
    } catch (e) {
      console.error('Error creating user:', e)
      toast.error('Failed to create user. Please try again.')
    }
  }

  const handleClearForm = () => {
    setOrganizationId('')
    setDepartmentId('')
    setEmail('')
    setFullName('')
    setRole('developer')
    setSpecialization('')
    setAvailabilityHoursPerWeek('')
    setTimezone('UTC')
  }

  return (
    <div className="min-h-screen bg-[#d4dce6] p-8">
      {/* Header */}
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 mb-6">
        <h1 className="text-[2rem] font-bold text-[#2d3748] flex items-center gap-3 mb-2">
          <Icon icon="mdi:account-plus" width={36} height={36} className="text-[#6b8cce]" />
          <span>Create New User</span>
        </h1>
        <p className="text-[#718096] text-base">
          Fill out the form below to create a new user in the system
        </p>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 mb-6">
        <div className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#4a5568]">
              Email <span className="text-[#fc8181]">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#f8f9fb] border border-[#e2e8f0] rounded-[10px] text-[#2d3748] focus:outline-none focus:border-[#6b8cce] focus:ring-2 focus:ring-[#6b8cce] focus:ring-opacity-20 transition-all duration-200"
              placeholder="user@example.com"
            />
          </div>

          {/* Full Name Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#4a5568]">
              Full Name <span className="text-[#fc8181]">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 bg-[#f8f9fb] border border-[#e2e8f0] rounded-[10px] text-[#2d3748] focus:outline-none focus:border-[#6b8cce] focus:ring-2 focus:ring-[#6b8cce] focus:ring-opacity-20 transition-all duration-200"
              placeholder="John Doe"
            />
          </div>

          {/* Organization and Department Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#4a5568]">
                Organization
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

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#4a5568]">
                Department
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                disabled={isLoadingDepts}
                className="w-full px-4 py-3 bg-[#f8f9fb] border border-[#e2e8f0] rounded-[10px] text-[#2d3748] focus:outline-none focus:border-[#6b8cce] focus:ring-2 focus:ring-[#6b8cce] focus:ring-opacity-20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select a department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {isLoadingDepts && (
                <p className="text-xs text-[#718096]">Loading departments...</p>
              )}
            </div>
          </div>

          {/* Role Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#4a5568]">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 bg-[#f8f9fb] border border-[#e2e8f0] rounded-[10px] text-[#2d3748] focus:outline-none focus:border-[#6b8cce] focus:ring-2 focus:ring-[#6b8cce] focus:ring-opacity-20 transition-all duration-200"
            >
              <option value="developer">Developer</option>
              <option value="designer">Designer</option>
              <option value="manager">Manager</option>
              <option value="analyst">Analyst</option>
              <option value="qa">QA Engineer</option>
              <option value="devops">DevOps Engineer</option>
              <option value="architect">Architect</option>
              <option value="product_owner">Product Owner</option>
            </select>
          </div>

          {/* Specialization Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#4a5568]">
              Specialization
            </label>
            <input
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full px-4 py-3 bg-[#f8f9fb] border border-[#e2e8f0] rounded-[10px] text-[#2d3748] focus:outline-none focus:border-[#6b8cce] focus:ring-2 focus:ring-[#6b8cce] focus:ring-opacity-20 transition-all duration-200"
              placeholder="Frontend Development, Backend API, etc."
            />
          </div>

          {/* Availability and Timezone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#4a5568]">
                Availability (Hours/Week)
              </label>
              <input
                type="number"
                value={availabilityHoursPerWeek}
                onChange={(e) => setAvailabilityHoursPerWeek(e.target.value)}
                className="w-full px-4 py-3 bg-[#f8f9fb] border border-[#e2e8f0] rounded-[10px] text-[#2d3748] focus:outline-none focus:border-[#6b8cce] focus:ring-2 focus:ring-[#6b8cce] focus:ring-opacity-20 transition-all duration-200"
                placeholder="40"
                step="0.5"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#4a5568]">
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-4 py-3 bg-[#f8f9fb] border border-[#e2e8f0] rounded-[10px] text-[#2d3748] focus:outline-none focus:border-[#6b8cce] focus:ring-2 focus:ring-[#6b8cce] focus:ring-opacity-20 transition-all duration-200"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="America/Chicago">America/Chicago (CST)</option>
                <option value="America/Denver">America/Denver (MST)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="Europe/Paris">Europe/Paris (CET)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                <option value="Asia/Shanghai">Asia/Shanghai (CST)</option>
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="Australia/Sydney">Australia/Sydney (AEDT)</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-[#6b8cce] text-white px-6 py-3 rounded-[10px] font-semibold text-sm shadow-[0_2px_8px_rgba(107,140,206,0.25)] hover:bg-[#5a7ab8] transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Icon icon="mdi:account-check" width={20} height={20} />
              <span>Create User</span>
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
            <p className="font-semibold mb-1">User Creation Form</p>
            <p className="text-sm">
              This form creates users with organization and department associations. Users can be assigned
              roles, specializations, and availability information for resource management.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateUserForm