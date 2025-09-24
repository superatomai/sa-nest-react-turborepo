import React from 'react'

interface ApiDocsHeaderProps {
  version: string
  baseUrl: string
}

const ApiDocsHeader: React.FC<ApiDocsHeaderProps> = ({ version, baseUrl }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold">API Documentation</h2>
      <p className="text-muted-foreground">
        Version {version} • Base URL: {baseUrl}
      </p>
    </div>
  )
}

export default ApiDocsHeader