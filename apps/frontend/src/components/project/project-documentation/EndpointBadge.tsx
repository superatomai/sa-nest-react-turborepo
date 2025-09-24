import React from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface EndpointBadgeProps {
  method: string
  className?: string
}

const EndpointBadge: React.FC<EndpointBadgeProps> = ({ method, className }) => {
  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'bg-blue-500',
      POST: 'bg-green-500',
      PUT: 'bg-yellow-500',
      PATCH: 'bg-orange-500',
      DELETE: 'bg-red-500',
      HEAD: 'bg-purple-500',
      OPTIONS: 'bg-gray-500'
    }
    return colors[method] || 'bg-gray-500'
  }

  return (
    <Badge
      className={cn(
        "text-white",
        getMethodColor(method),
        className
      )}
    >
      {method}
    </Badge>
  )
}

export default EndpointBadge