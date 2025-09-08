import { observer } from "mobx-react-lite";
import { uisStore } from "@/stores/mobx_uis_store";
import { trpc } from "@/utils";
import AddNewUI from "./AddNewUI";
import UICard from "./UICard";
import { useEffect } from "react";

type Props = {
  projectId: number;
  selectedProject: any;
};

function AllUis({ projectId, selectedProject }: Props) {
  const uisQuery = trpc.uisGetAll.useQuery({ projectId });

  // Hydrate store only when query data changes
  useEffect(() => {
    if (uisQuery.isSuccess && uisQuery.data) {
      uisStore.setUis(uisQuery.data.uis);
    }
  }, [uisQuery.isSuccess, uisQuery.data]);

  if (uisQuery.isLoading) {
    return <div>Loading UIs...</div>;
  }

  if (uisQuery.error) {
    return <div>Error: {uisQuery.error.message}</div>;
  }

  const uis = uisStore.uis;

  return (
    <div className="flex flex-col">
      <div className="mt-4 p-3 border rounded bg-gray-50 flex items-center justify-between bg-gradient-to-r from-[#044ACC] to-[#57C785]">
        <div className="font-medium text-white font-xl">
          Selected Project:{" "}
          <span className="text-black">{selectedProject.name}</span>
        </div>
        <div>
          <AddNewUI projectId={projectId} />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5 mt-5">
        {uis.map((ui) => (
          <div key={ui.id}>
            <UICard UICardDetails={ui} selectedProjId={projectId} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default observer(AllUis);
