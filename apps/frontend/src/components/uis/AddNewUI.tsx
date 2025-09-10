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
                className="flex cursor-pointer rounded-md items-center gap-2 px-4 py-2 font-medium transition-all duration-200 shadow-sm w-fit bg-white text-blue-800 border border-blue-800 hover:text-white hover:bg-blue-800 outline "
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
