import { Icon } from "@iconify/react/dist/iconify.js"
import { useState } from "react"
import AddNewProjectModal from "./AddNewProjectModal"


type Props = {
  orgId: string
  variant?: "default" | "primary" | "transparentLarge"
}


const AddNewProject = ( {orgId, variant = "default"} : Props) => {
const [newProjModalOpen, setNewProjModalOpen] = useState(false)

  const baseClasses =
    "rounded-md transition-colors duration-300 ease-in-out flex items-center justify-center gap-2"

  const variantClasses = {
    default: "px-4 py-2 bg-white text-blue-800 border border-blue-800 hover:bg-blue-800 hover:text-white",
    primary: "px-4 py-2 bg-blue-800 text-white border border-blue-800 hover:bg-blue-900",
    transparentLarge: "px-8 py-6 bg-transparent text-blue-800 border-2 border-dashed border-gray-300 hover:bg-gray-50 text-lg",
  }

  return (
    <>
      <button
        className={`${baseClasses} ${variantClasses[variant]}`}
        onClick={() => setNewProjModalOpen(true)}
      >
        <Icon icon="material-symbols:add-rounded" className={`${variant === "transparentLarge" ? "text-8xl text-gray-400 font-bold" : "text-2xl text-blue-800"}`} />
        {variant !== "transparentLarge" && "Add new project"}
      </button>

      {newProjModalOpen && (
        <AddNewProjectModal setNewProjModalOpen={setNewProjModalOpen} orgId={orgId} />
      )}
    </>
  )
}

export default AddNewProject
