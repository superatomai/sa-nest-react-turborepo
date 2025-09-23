import React from 'react'
import { useParams } from 'react-router-dom'
import ProjectDocumentation from '@/components/project/ProjectDocumentation'

const ProjDoc = () => {
  const { projectId } = useParams()

  return <ProjectDocumentation projectId={projectId} />
}

export default ProjDoc