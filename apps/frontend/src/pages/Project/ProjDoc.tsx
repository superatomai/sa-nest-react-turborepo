import React from 'react'
import { useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'
import orgStore from '@/stores/mobx_org_store'
import { DatabaseUtils } from '../../utils/database'
import ProjectApiDocs from '@/components/project/ProjectApiDocs'

const ProjDoc = () => {
  const params: any = useParams()

  const { data: project, isLoading: projectLoading, error } = DatabaseUtils.useGetProjectById(
    params.projectId,
    orgStore.orgId || ''
  )

  // Convert projectId to number since our component expects number
  const projectIdNumber = params.projectId ? parseInt(params.projectId, 10) : 0

  // Show loading state
  if (projectLoading) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading project...</div>
          <div className="text-gray-600 text-sm mt-1">Please wait</div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error || !project || !params.projectId || isNaN(projectIdNumber)) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-red-600">Project not found</div>
          <div className="text-gray-600 text-sm mt-1">The project could not be loaded</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 p-6 flex flex-col overflow-hidden">
      <div className="w-full space-y-4 flex flex-col flex-1 min-h-0">

        {/* Header - same as logs page */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Projects</span>
            <span>/</span>
            <span>{project.project.name}</span>
            <span>/</span>
            <span>Documentation</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">API Documentation</h1>
              <p className="text-gray-600 text-sm">Generated API documentation and endpoints</p>
            </div>
            <Badge variant="outline" className="text-xs">
              ID: {project.project.id}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Documentation Content - flex-1 to take remaining space */}
        <Card className="flex-1 flex flex-col min-h-0 rounded-xl shadow-lg border-gray-200 overflow-hidden">
          <ProjectApiDocs projectId={projectIdNumber} />
        </Card>

      </div>
    </div>
  )
}

export default ProjDoc