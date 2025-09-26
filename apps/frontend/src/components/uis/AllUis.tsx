import { observer } from "mobx-react-lite";
import { uisStore } from "@/stores/mobx_uis_store";
import { trpc } from "@/utils";
import AddNewUI from "./AddNewUI";
import UICard from "./UICard";
import { useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { motion, AnimatePresence } from "framer-motion";

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

  const uis = uisStore.uis;
  const isLoading = uisQuery.isLoading;
  const hasError = uisQuery.error;

  return (
    <div className="flex flex-col px-4 pb-5">
      {/* Project Header - Always Visible */}
      <div className="mt-16 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#044ACC] to-[#57C785] rounded-lg flex items-center justify-center">
              <Icon icon="solar:folder-bold" className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-baseline gap-3">
              <h2 className="text-xl font-bold text-gray-900">{selectedProject.name}</h2>
              <span className="text-sm font-medium text-gray-500">
                {selectedProject.uis_count || 0} {Number(selectedProject.uis_count || 0) === 1 ? 'UI' : 'UIs'}
              </span>
            </div>
          </div>
          <div>
            <AddNewUI projectId={projectId} />
          </div>
        </div>
      </div>

      {/* Content Area - Conditional based on state */}
      <div className="mt-5 min-h-[250px]">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex items-center justify-center min-h-[250px]"
            >
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <div className="text-base text-gray-600 mb-2">
                  Loading UIs...
                </div>
                <div className="text-sm text-gray-500">
                  Fetching components for {selectedProject.name}
                </div>
              </div>
            </motion.div>
          ) : hasError ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex items-center justify-center min-h-[250px]"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon icon="material-symbols:error" className="w-6 h-6 text-red-600" />
                </div>
                <div className="text-base text-red-600 mb-2">Error loading UIs</div>
                <div className="text-sm text-gray-500">{hasError.message}</div>
              </div>
            </motion.div>
          ) : uis.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex items-center justify-center min-h-[250px]"
            >
              <div className="text-center">
                <div className="text-base text-gray-600 mb-2">No UIs found</div>
                <div className="text-sm text-gray-500">
                  Start by creating your first UI component
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 min-h-[250px]"
            >
              {uis.map((ui, index) => (
                <motion.div
                  key={ui.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                    ease: "easeOut"
                  }}
                >
                  <UICard UICardDetails={ui} selectedProjId={projectId} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default observer(AllUis);