import React, { useState, useEffect, useMemo } from 'react'
import { trpc } from '@/utils'
import LoadingState from './project-documentation/LoadingState'
import ErrorState from './project-documentation/ErrorState'
import NoDocs from './project-documentation/NoDocs'
import ApiDocsHeader from './project-documentation/ApiDocsHeader'
import EndpointsList from './project-documentation/EndpointsList'
import EndpointDetails from './project-documentation/EndpointDetails'
import { SimpleApiDocs, ApiEndpoint } from './project-documentation/types'

interface ProjectApiDocsProps {
  projectId: number
}

const ProjectApiDocs: React.FC<ProjectApiDocsProps> = ({ projectId }) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  // Fetch docs using tRPC
  const { data: docsData, isLoading, error } = trpc.getDocsByProjectId.useQuery({
    projectId: projectId
  })

  // Parse apiDocs - handle both string and object formats
  const apiDocs: SimpleApiDocs | null = useMemo(() => {
    const rawApiDocs = docsData?.docs?.apiDocs
    if (!rawApiDocs) {
      console.log('No raw API docs found')
      return null
    }

    console.log('Raw API docs type:', typeof rawApiDocs)
    console.log('Raw API docs:', rawApiDocs)

    try {
      // If it's already an object, return it
      if (typeof rawApiDocs === 'object' && rawApiDocs !== null) {
        console.log('API docs is already an object')
        return rawApiDocs as SimpleApiDocs
      }
      // If it's a string, parse it
      if (typeof rawApiDocs === 'string') {
        console.log('Parsing API docs from string')
        const parsed = JSON.parse(rawApiDocs) as SimpleApiDocs
        console.log('Parsed API docs:', parsed)
        return parsed
      }
    } catch (error) {
      console.error('Failed to parse API docs:', error)
      return null
    }

    return null
  }, [docsData?.docs?.apiDocs])

  // Group endpoints by base path
  const groupedEndpoints = useMemo(() => {
    if (!apiDocs?.apis) return {}

    const groups: Record<string, Record<string, ApiEndpoint>> = {}

    Object.entries(apiDocs.apis).forEach(([key, endpoint]) => {
      const basePath = endpoint.path?.split('/')[1] || 'general'
      if (!groups[basePath]) {
        groups[basePath] = {}
      }
      groups[basePath][key] = endpoint
    })

    return groups
  }, [apiDocs])

  // Initialize all sections as expanded when groupedEndpoints change
  useEffect(() => {
    if (Object.keys(groupedEndpoints).length > 0) {
      const initialExpanded: Record<string, boolean> = {}
      Object.keys(groupedEndpoints).forEach(group => {
        initialExpanded[group] = true
      })
      setExpandedSections(initialExpanded)
    }
  }, [groupedEndpoints])


  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: prev[section] === true ? false : true
    }))
  }

  // Loading state
  if (isLoading) {
    return <LoadingState />
  }

  // Error state
  if (error) {
    return <ErrorState error={error} />
  }

  // No docs state
  if (!apiDocs || !apiDocs.apis || Object.keys(apiDocs.apis).length === 0) {
    return <NoDocs />
  }

  const selectedEndpointData = selectedEndpoint ? apiDocs.apis[selectedEndpoint] : null

  return (
    <div className="flex flex-col space-y-6 p-5 h-full">
      <ApiDocsHeader
        version={apiDocs.version}
        baseUrl={apiDocs.baseUrl}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <EndpointsList
          groupedEndpoints={groupedEndpoints}
          expandedSections={expandedSections}
          selectedEndpoint={selectedEndpoint}
          onToggleSection={toggleSection}
          onEndpointSelect={setSelectedEndpoint}
        />

        <EndpointDetails endpoint={selectedEndpointData} />
      </div>
    </div>
  )
}

export default ProjectApiDocs