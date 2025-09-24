import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
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
    <Card className="lg:col-span-1 h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle>Endpoints</CardTitle>
        <CardDescription>
          {totalEndpoints} endpoints available
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 flex-1 min-h-0">
        <ScrollArea className="h-full px-6 pb-6">
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
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default EndpointsList