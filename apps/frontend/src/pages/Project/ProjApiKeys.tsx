import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Key, Settings } from 'lucide-react'
import { useParams } from 'react-router-dom'
import orgStore from '@/stores/mobx_org_store'
import { DatabaseUtils } from '../../utils/database'
import AllProjectKeys from '@/components/project/project-keys/AllProjectKeys'

const ProjApiKeys = () => {
  const [activeTab, setActiveTab] = useState('api-keys')
  

  const params : any = useParams();

  const { data: project, isLoading: projectLoading, error } = DatabaseUtils.useGetProjectById(
    params.projectId,
    orgStore.orgId || ''
  );

  // Show loading state
  if (projectLoading) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading project...</div>
          <div className="text-gray-600 text-sm mt-1">Please wait</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !project) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-red-600">Project not found</div>
          <div className="text-gray-600 text-sm mt-1">The project could not be loaded</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 p-6 overflow-auto">
      <div className="w-full space-y-6">

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Projects</span>
            <span>/</span>
            <span>{project.project.name}</span>
            <span>/</span>
            <span>Configuration</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Project Configuration</h1>
              <p className="text-gray-600 mt-1">{project.project.description || 'No description available'}</p>
            </div>
            <Badge variant="outline" className="text-xs">
              ID: {project.project.id}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('api-keys')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'api-keys'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Key className="w-4 h-4 inline mr-2" />
            API Keys
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Settings
          </button>
        </div>

        {/* API Keys Tab */}
        {activeTab === 'api-keys' && (
          <AllProjectKeys
            projectId={Number(params.projectId)}
            selectedProject={project.project}
          />
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Project Settings</h2>
              <p className="text-gray-600 text-sm">Configure global settings for your project</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Global Instructions</CardTitle>
                <CardDescription>
                  Default instructions that apply to all API keys (can be overridden per key)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter global instructions for UI generation..."
                  rows={6}
                  className="w-full"
                />
                <Button className="mt-4">Save Instructions</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>WebSocket Configuration</CardTitle>
                <CardDescription>
                  Settings for CLI agent connections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Connection Status</Label>
                    <p className="text-sm text-gray-600">No active connections</p>
                  </div>
                  <Badge variant="outline">Disconnected</Badge>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">CLI Connection Command:</p>
                  <code className="text-xs bg-white p-2 rounded mt-2 block font-mono">
                    npx superatom-cli connect --project={project.id} --key=YOUR_API_KEY
                  </code>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  )
}

export default ProjApiKeys;