import React from 'react'
import { Icon } from '@iconify/react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface ErrorStateProps {
  error: any // Accept any error type (tRPC, Error, etc.)
}

const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  // Handle different error types
  const getErrorMessage = (error: any): string => {
    if (error?.message) return error.message
    if (error?.data?.message) return error.data.message
    if (typeof error === 'string') return error
    return 'An unknown error occurred'
  }

  return (
    <Alert variant="destructive">
      <Icon icon="solar:danger-triangle-bold" className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Failed to load API documentation: {getErrorMessage(error)}
      </AlertDescription>
    </Alert>
  )
}

export default ErrorState