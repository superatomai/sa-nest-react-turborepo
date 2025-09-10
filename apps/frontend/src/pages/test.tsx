import { useState } from 'react';
import { trpc } from '../utils/trpc';

export default function Projects() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  // Mock organization ID - in a real app, this would come from user context/auth
  const orgId = 'org_31uTzqysPFiCJMtjTMdfSGkdxSj';

  // tRPC queries and mutations
  const projectsQuery : any = trpc.projectsGetAll.useQuery({ orgId });
  const createProjectMutation = trpc.projectsCreate.useMutation({
    onSuccess: () => {
      // Reset form
      setProjectName('');
      setProjectDescription('');
      setIsCreateModalOpen(false);
      // Refetch projects
      projectsQuery.refetch();
    },
  });

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    createProjectMutation.mutate({
      name: projectName.trim(),
      description: projectDescription.trim() || undefined,
      orgId,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
              <p className="text-sm text-gray-600">Manage your UI generation projects</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Project
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {projectsQuery.isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading projects...</span>
          </div>
        )}

        {/* Error State */}
        {projectsQuery.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-800">Error loading projects: {projectsQuery.error.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {projectsQuery.data && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                {projectsQuery.data.totalCount} {projectsQuery.data.totalCount === 1 ? 'Project' : 'Projects'}
              </h2>
            </div>

            {projectsQuery.data.totalCount === 0 ? (
              // Empty State
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating your first project.</p>
                <div className="mt-6">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Project
                  </button>
                </div>
              </div>
            ) : (
              // Projects Grid
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projectsQuery.data.projects.map((project: any) => (
                  <div key={project.id} className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 truncate">{project.name}</h3>
                        <span className="text-xs text-gray-500">#{project.id}</span>
                      </div>
                      
                      {project.description && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{project.description}</p>
                      )}
                      
                      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                        <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                        {project.updatedAt !== project.createdAt && (
                          <span>Updated: {new Date(project.updatedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                      
                      <div className="mt-4 flex space-x-2">
                        <button className="flex-1 bg-blue-50 text-blue-700 text-sm font-medium px-3 py-2 rounded-md hover:bg-blue-100 transition-colors duration-200">
                          Open
                        </button>
                        <button className="px-3 py-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Create New Project</h3>
            </div>
            
            <form onSubmit={handleCreateProject} className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    id="project-name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Enter project name"
                    required
                    maxLength={255}
                  />
                </div>
                
                <div>
                  <label htmlFor="project-description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="project-description"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    rows={3}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Optional project description"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setProjectName('');
                    setProjectDescription('');
                  }}
                  className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!projectName.trim() || createProjectMutation.isPending}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {createProjectMutation.isPending ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    'Create Project'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}