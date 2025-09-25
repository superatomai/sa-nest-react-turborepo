import React from 'react'

interface ApiDocsHeaderProps {
  version: string
  baseUrl: string
  totalEndpoints: number
}

const ApiDocsHeader: React.FC<ApiDocsHeaderProps> = ({ version, baseUrl, totalEndpoints }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h2 className="text-base font-semibold">API Endpoints</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
            v{version}
          </span>
          <span className="text-xs text-gray-600">
            {baseUrl}
          </span>
        </div>
      </div>
      <div className="text-sm text-gray-500">
        {totalEndpoints} endpoints
      </div>
    </div>
  )
}

export default ApiDocsHeader