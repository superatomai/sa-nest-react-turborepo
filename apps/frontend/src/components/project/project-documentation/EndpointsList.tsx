import React from 'react'
import EndpointGroup from './EndpointGroup'

// Types based on SimpleApiDocs structure
interface ApiEndpoint {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'
  summary: string
  description?: string
  auth?: boolean | string
}

interface EndpointsListProps {
  groupedEndpoints: Record<string, Record<string, ApiEndpoint>>
  expandedSections: Record<string, boolean>
  selectedEndpoint: string | null
  onToggleSection: (section: string) => void
  onEndpointSelect: (endpointKey: string) => void
}

const EndpointsList: React.FC<EndpointsListProps> = ({
  groupedEndpoints,
  expandedSections,
  selectedEndpoint,
  onToggleSection,
  onEndpointSelect
}) => {
  const totalEndpoints = Object.values(groupedEndpoints).reduce(
    (total, endpoints) => total + Object.keys(endpoints).length,
    0
  )

  return (
    <div className="bg-gray-50/50 px-4 py-3 space-y-2">
      {Object.entries(groupedEndpoints).map(([group, endpoints]) => (
        <EndpointGroup
          key={group}
          groupName={group}
          endpoints={endpoints}
          isExpanded={expandedSections[group] === true}
          selectedEndpoint={selectedEndpoint}
          onToggle={() => onToggleSection(group)}
          onEndpointSelect={onEndpointSelect}
        />
      ))}
    </div>
  )
}

export default EndpointsList