import { Plus } from "lucide-react"
import { useState } from "react";
import AddNewUiModal from "./AddNewUiModal";

type Props = {
    projectId: number
}
const AddNewUI = ( { projectId } : Props) => {
    const [showAddUiModal, setShowAddUiModal] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-3">
            <button
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-sm w-fit bg-white text-blue-800 outline hover:from-blue-700 hover:to-purple-700 hover:shadow-md"
                onClick={() => setShowAddUiModal(true)}
            >
                <Plus className="w-4 h-4" />
                Add New UI
            </button>

            {showAddUiModal && (
                <AddNewUiModal
                    setShowAddUiModal={setShowAddUiModal}
                    projectId={projectId}
                />
            )}
        </div>
    </>
  )
}

export default AddNewUI
