import React from 'react'
import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'
import EndpointBadge from './EndpointBadge'

// Types based on SimpleApiDocs structure
interface ApiEndpoint {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'
  summary: string
  description?: string
  auth?: boolean | string
}

interface EndpointGroupProps {
  groupName: string
  endpoints: Record<string, ApiEndpoint>
  isExpanded: boolean
  selectedEndpoint: string | null
  onToggle: () => void
  onEndpointSelect: (endpointKey: string) => void
}

const EndpointGroup: React.FC<EndpointGroupProps> = ({
  groupName,
  endpoints,
  isExpanded,
  selectedEndpoint,
  onToggle,
  onEndpointSelect
}) => {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full px-4 py-2 text-left hover:bg-muted flex items-center justify-between transition-colors"
      >
        <span className="font-medium capitalize">{groupName}</span>
        <Icon
          icon={isExpanded ? "solar:alt-arrow-up-linear" : "solar:alt-arrow-down-linear"}
          className="h-4 w-4"
        />
      </button>

      {isExpanded && (
        <div className="border-l-2 border-muted ml-4">
          {Object.entries(endpoints).map(([key, endpoint]) => (
            <button
              key={key}
              onClick={() => onEndpointSelect(key)}
              className={cn(
                "w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-start gap-3",
                selectedEndpoint === key && "bg-muted"
              )}
            >
              <EndpointBadge
                method={endpoint.method}
                className="text-xs px-2 py-0.5"
              />
              <div className="flex-1 overflow-hidden">
                <p className="font-mono text-sm truncate">{endpoint.path}</p>
                <p className="text-xs text-muted-foreground truncate mt-1">
                  {endpoint.summary}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default EndpointGroup