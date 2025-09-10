import { observer } from "mobx-react-lite";
import { uisStore } from "@/stores/mobx_uis_store";
import { trpc } from "@/utils";
import AddNewUI from "./AddNewUI";
import UICard from "./UICard";
import { useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

type Props = {
  projectId: number;
  selectedProject: any;
};

function AllUis({ projectId, selectedProject }: Props) {

  const uisQuery = trpc.uisGetAll.useQuery({ projectId });


  useEffect(() => {
    if (uisQuery.isSuccess && uisQuery.data) {
      uisStore.setUis(uisQuery.data.uis);
    }
  }, [uisQuery.isSuccess, uisQuery.data]);

  useEffect(()=>{
    console.log("uisStore.uis changed, mapping these uis:", JSON.stringify(uisStore.uis));
  },[uisStore.uis])

  const uis = uisStore.uis;
  const isLoading = uisQuery.isLoading;
  const hasError = uisQuery.error;

  return (
    <div className="flex flex-col px-4 pb-5">
      {/* Project Header - Always Visible */}
      <div className="mt-4 p-3 border rounded bg-gray-50 flex items-center justify-between bg-gradient-to-r from-[#044ACC] to-[#57C785]">
        <div className="font-medium text-white font-xl">
          Selected Project:{" "}
          <span className="text-black">{selectedProject.name}</span>
        </div>
        <div>
          <AddNewUI projectId={projectId} />
        </div>
      </div>

      {/* Content Area - Conditional based on state */}
      <div className="mt-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 h-[250px]">
            <div className="text-center">
              <div className="text-lg text-gray-600 mb-2 flex felx-col">
                Loading UIs...
                <span>
                  <Icon icon="eos-icons:loading" />
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Fetching components for {selectedProject.name}
              </div>
            </div>
          </div>
        ) : hasError ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="text-lg text-red-600 mb-2">Error loading UIs</div>
              <div className="text-sm text-gray-500">{hasError.message}</div>
            </div>
          </div>
        ) : uis.length === 0 ? (
          <div className="flex items-center justify-center py-8 h-[250px]">
            <div className="text-center">
              <div className="text-lg text-gray-600 mb-2">No UIs found</div>
              <div className="text-sm text-gray-500">
                Start by creating your first UI component
              </div>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {uis.map((ui) => (
              <div key={ui.id}>
                <UICard UICardDetails={ui} selectedProjId={projectId} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default observer(AllUis);