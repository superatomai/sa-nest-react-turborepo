import React, { useState } from 'react'
import { Icon } from '@iconify/react'
import {
  DuckDBDataViewer,
  CreateTaskForm,
  CreateUserForm,
  CreateProjectForm,
  ReassignTask,
  TaskReassignmentCard,
  TaskDeadlineUpdateCard,
  TaskStatusUpdateCard,
  DatabaseOverviewCard,
  TaskList,
  ProjectList,
  UserList,
  SchemaExplorer,
  TaskDependencyChecker,
  ProjectPerformanceDashboard,
  TaskAnalyticsDashboard,
  UserAnalyticsDashboard,
  ProjectAnalyticsDashboard,
  SmartRecommendationsEngine,
  OrganizationOverview
} from '../duckdb/tsx'

type TabType = 'viewer' | 'taskForm' | 'userForm' | 'projectForm' | 'reassignTask' | 'taskReassignCard' | 'taskDeadlineCard' | 'taskStatusCard' | 'dbOverview' | 'taskList' | 'projectList' | 'userList' | 'schemaExplorer' | 'taskDependencyChecker' | 'projectPerformance' | 'taskAnalytics' | 'userAnalytics' | 'projectAnalytics' | 'smartRecommendations' | 'organizationOverview'

const DslShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('viewer')

  const tabs: { id: TabType; label: string; icon: string; description: string }[] = [
    {
      id: 'viewer',
      label: 'Data Viewer',
      icon: 'mdi:database-eye',
      description: 'Browse database tables and data'
    },
    {
      id: 'dbOverview',
      label: 'Database Overview',
      icon: 'mdi:database',
      description: 'Complete database statistics and overview'
    },
    {
      id: 'projectPerformance',
      label: 'Project Performance',
      icon: 'mdi:chart-line',
      description: 'Project analytics and performance dashboard'
    },
    {
      id: 'taskAnalytics',
      label: 'Task Analytics',
      icon: 'mdi:chart-box-outline',
      description: 'Single task analytics and management'
    },
    {
      id: 'userAnalytics',
      label: 'User Analytics',
      icon: 'mdi:account-details',
      description: 'User performance and workload analytics'
    },
    {
      id: 'projectAnalytics',
      label: 'Project Analytics',
      icon: 'mdi:folder-chart',
      description: 'Single project analytics and management'
    },
    {
      id: 'smartRecommendations',
      label: 'Smart Recommendations',
      icon: 'mdi:lightbulb-on',
      description: 'AI-powered insights and recommendations'
    },
    {
      id: 'organizationOverview',
      label: 'Organization Overview',
      icon: 'mdi:sitemap',
      description: 'Organization structure and hierarchy'
    },
    {
      id: 'taskForm',
      label: 'Create Task',
      icon: 'mdi:plus-circle',
      description: 'Create and manage project tasks'
    },
    {
      id: 'userForm',
      label: 'Create User',
      icon: 'mdi:account-plus',
      description: 'Add new users to the system'
    },
    {
      id: 'projectForm',
      label: 'Create Project',
      icon: 'mdi:folder-plus',
      description: 'Create new projects'
    },
    {
      id: 'reassignTask',
      label: 'Reassign Task',
      icon: 'mdi:account-switch',
      description: 'Reassign tasks to team members'
    },
    {
      id: 'taskReassignCard',
      label: 'Task Reassignment Card',
      icon: 'mdi:card-account-details',
      description: 'Simple card for single task reassignment'
    },
    {
      id: 'taskDeadlineCard',
      label: 'Task Deadline Update Card',
      icon: 'mdi:calendar-edit',
      description: 'Update task deadline with date picker'
    },
    {
      id: 'taskStatusCard',
      label: 'Task Status Update Card',
      icon: 'mdi:checkbox-marked-circle',
      description: 'Update task status with visual options'
    },
    {
      id: 'taskList',
      label: 'All Tasks',
      icon: 'mdi:format-list-checkbox',
      description: 'View all tasks in a data table'
    },
    {
      id: 'projectList',
      label: 'All Projects',
      icon: 'mdi:folder-open',
      description: 'View all projects in a data table'
    },
    {
      id: 'userList',
      label: 'All Users',
      icon: 'mdi:account-multiple',
      description: 'View all users in a data table'
    },
    {
      id: 'schemaExplorer',
      label: 'Schema Explorer',
      icon: 'mdi:database-cog',
      description: 'Explore database schema and export documentation'
    },
    {
      id: 'taskDependencyChecker',
      label: 'Task Dependency Checker',
      icon: 'mdi:alert-circle-check',
      description: 'Check and clear task dependencies for updates'
    }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'dbOverview':
        return (
          <div className="p-8">
            <DatabaseOverviewCard />
          </div>
        )
      case 'projectPerformance':
        return (
          <div className="p-8">
            <ProjectPerformanceDashboard />
          </div>
        )
      case 'taskAnalytics':
        return (
          <div className="p-8">
            <TaskAnalyticsDashboard taskId={10} />
          </div>
        )
      case 'userAnalytics':
        return (
          <div className="p-8">
            <UserAnalyticsDashboard userId={10} />
          </div>
        )
      case 'projectAnalytics':
        return (
          <div className="p-8">
            <ProjectAnalyticsDashboard projectId={1} />
          </div>
        )
      case 'smartRecommendations':
        return (
          <div className="p-8">
            <SmartRecommendationsEngine />
          </div>
        )
      case 'organizationOverview':
        return (
          <div className="p-8">
            <OrganizationOverview organizationId={1} />
          </div>
        )
      case 'viewer':
        return <DuckDBDataViewer />
      case 'taskForm':
        return <CreateTaskForm />
      case 'userForm':
        return <CreateUserForm />
      case 'projectForm':
        return <CreateProjectForm />
      case 'reassignTask':
        return <ReassignTask />
      case 'taskReassignCard':
        return (
          <div className="p-8">
            <TaskReassignmentCard taskId={10} />
          </div>
        )
      case 'taskDeadlineCard':
        return (
          <div className="p-8">
            <TaskDeadlineUpdateCard taskId={10} />
          </div>
        )
      case 'taskStatusCard':
        return (
          <div className="p-8">
            <TaskStatusUpdateCard taskId={10} />
          </div>
        )
      case 'taskList':
        return <TaskList />
      case 'projectList':
        return <ProjectList />
      case 'userList':
        return <UserList />
      case 'schemaExplorer':
        return <SchemaExplorer />
      case 'taskDependencyChecker':
        return (
          <div className="p-8">
            <TaskDependencyChecker taskId={10} />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#d4dce6]">
      {/* Header */}
      <div className="bg-white border-b border-[#e2e8f0] sticky top-0 z-50 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <div className="px-8 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#6b8cce] bg-opacity-10 rounded-[10px] flex items-center justify-center">
                <Icon icon="mdi:view-dashboard" width={20} height={20} className="text-[#6b8cce]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#2d3748]">DuckDB Component Showcase</h1>
                <p className="text-[10px] text-[#718096]">{tabs.length} interactive components</p>
              </div>
            </div>
          </div>

          {/* Tabs - Horizontal Scroll */}
          <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-1">
            <div className="flex gap-2 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-[8px] font-medium text-xs whitespace-nowrap transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-[#6b8cce] text-white shadow-[0_2px_8px_rgba(107,140,206,0.25)]'
                      : 'bg-white text-[#718096] hover:text-[#4a5568] hover:bg-[#f8f9fb] border border-[#e2e8f0]'
                  }`}
                >
                  <Icon icon={tab.icon} width={14} height={14} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="w-full">
        {renderContent()}
      </div>
    </div>
  )
}

export default DslShowcase