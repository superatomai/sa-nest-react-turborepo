import { observer } from "mobx-react-lite";
import { projectKeysStore } from "@/stores/mobx_project_keys_store";
import { trpc } from "@/utils";
import AddNewProjectKey from "./AddNewProjectKey";
import ProjectKeyCard from "./ProjectKeyCard";
import { useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

type Props = {
  projectId: number;
  selectedProject: any;
};

function AllProjectKeys({ projectId, selectedProject }: Props) {
  const keysQuery = trpc.projectKeysGetAll.useQuery({ projectId });

  useEffect(() => {
    if (keysQuery.isSuccess && keysQuery.data) {
      projectKeysStore.setProjectKeys(keysQuery.data.projectKeys, projectId);
    }
  }, [keysQuery.isSuccess, keysQuery.data, projectId]);


  const keys = projectKeysStore.projectKeys;
  const isLoading = keysQuery.isLoading;
  const hasError = keysQuery.error;

  return (
    <div className="flex flex-col px-4 pb-5">
      {/* Project Header - Always Visible */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">API Keys</h2>
            <p className="text-gray-600 text-sm">Manage API keys for CLI agent connections to {selectedProject.name}</p>
          </div>
          <AddNewProjectKey projectId={projectId} />
        </div>
      </div>

      {/* Content Area - Conditional based on state */}
      <div className="mt-6">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[250px]">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-base text-gray-600 mb-2">
                Loading API Keys...
              </div>
              <div className="text-sm text-gray-500">
                Fetching API keys for {selectedProject.name}
              </div>
            </div>
          </div>
        ) : hasError ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="text-lg text-red-600 mb-2">Error loading API keys</div>
              <div className="text-sm text-gray-500">{hasError.message}</div>
            </div>
          </div>
        ) : keys.length === 0 ? (
          <div className="flex items-center justify-center py-8 h-[250px]">
            <div className="text-center">
              <div className="text-lg text-gray-600 mb-2">No API keys found</div>
              <div className="text-sm text-gray-500">
                Start by creating your first API key for CLI agents
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {keys.map((key) => (
              <ProjectKeyCard key={key.id} keyDetails={key} selectedProjId={projectId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default observer(AllProjectKeys);