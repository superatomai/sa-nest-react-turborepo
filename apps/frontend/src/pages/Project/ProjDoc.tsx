import React from 'react'
import { useParams } from 'react-router-dom'
import ProjectApiDocs from '@/components/project/ProjectApiDocs'

const ProjDoc = () => {
  const { projectId } = useParams()

  // Convert projectId to number since our component expects number
  const projectIdNumber = projectId ? parseInt(projectId, 10) : 0

  if (!projectId || isNaN(projectIdNumber)) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Invalid Project</h2>
          <p className="text-muted-foreground">Project ID is required to view documentation.</p>
        </div>
      </div>
    )
  }

  return <ProjectApiDocs projectId={projectIdNumber} />
}

export default ProjDoc