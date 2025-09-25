import React, { useState, useEffect, useMemo } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
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

  // Calculate total endpoints
  const totalEndpoints = apiDocs?.apis ? Object.keys(apiDocs.apis).length : 0

  // Initialize all sections as expanded and auto-select first endpoint when groupedEndpoints change
  useEffect(() => {
    if (Object.keys(groupedEndpoints).length > 0) {
      const initialExpanded: Record<string, boolean> = {}
      Object.keys(groupedEndpoints).forEach(group => {
        initialExpanded[group] = true
      })
      setExpandedSections(initialExpanded)

      // Auto-select the first endpoint if none is selected
      if (!selectedEndpoint && apiDocs?.apis) {
        const firstEndpointKey = Object.keys(apiDocs.apis)[0]
        if (firstEndpointKey) {
          setSelectedEndpoint(firstEndpointKey)
        }
      }
    }
  }, [groupedEndpoints, selectedEndpoint, apiDocs])


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
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-6 py-4 bg-gradient-to-r from-gray-50 to-white rounded-t-xl border-b">
        <ApiDocsHeader
          version={apiDocs.version}
          baseUrl={apiDocs.baseUrl}
          totalEndpoints={totalEndpoints}
        />
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-0 min-h-0">
        <div className="border-r flex flex-col min-h-0">
          <ScrollArea className="h-full">
            <div className="p-0">
              <EndpointsList
                groupedEndpoints={groupedEndpoints}
                expandedSections={expandedSections}
                selectedEndpoint={selectedEndpoint}
                onToggleSection={toggleSection}
                onEndpointSelect={setSelectedEndpoint}
              />
            </div>
          </ScrollArea>
        </div>

        <div className="lg:col-span-3 flex flex-col min-h-0">
          <ScrollArea className="h-full">
            <div className="p-0">
              <EndpointDetails endpoint={selectedEndpointData} />
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

export default ProjectApiDocs