import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useParams } from 'react-router-dom'
import orgStore from '@/stores/mobx_org_store'
import { DatabaseUtils } from '../../utils/database'
import DesignSystemEditor from '@/components/project/project-design-system/DesignSystemEditor'

const ProjDesignSys = () => {
  const params: any = useParams();

  const { data: project, isLoading: projectLoading, error } = DatabaseUtils.useGetProjectById(
    params.projectId,
    orgStore.orgId || ''
  );

  if (projectLoading) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading project...</div>
          <div className="text-gray-600 text-sm mt-1">Please wait</div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-red-600">Project not found</div>
          <div className="text-gray-600 text-sm mt-1">The project could not be loaded</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 p-6 overflow-auto">
      <div className="w-full space-y-6">

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Projects</span>
            <span>/</span>
            <span>{project.project.name}</span>
            <span>/</span>
            <span>Design System</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Design System</h1>
              <p className="text-gray-600 mt-1">Manage colors, themes, and visual styles for your UI</p>
            </div>
            <Badge variant="outline" className="text-xs">
              ID: {project.project.id}
            </Badge>
          </div>
        </div>

        <Separator />

        <DesignSystemEditor projectId={params.projectId}/>

      </div>
    </div>
  )
}

export default ProjDesignSys
