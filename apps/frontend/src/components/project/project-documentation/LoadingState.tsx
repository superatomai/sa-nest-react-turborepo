import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

const LoadingState: React.FC = () => {
  return (
    <div className="space-y-4 p-5 flex flex-col h-screen">
      <Skeleton className="h-12 flex w-full" />
      <Skeleton className="flex-1 w-full" />
    </div>
  )
}

export default LoadingState