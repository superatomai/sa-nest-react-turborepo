import { Icon } from "@iconify/react/dist/iconify.js"

export const ToggleListGrid = () => {
    return (
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden w-fit ml-4">
            <button className="p-2 hover:bg-gray-50 border-r border-gray-200">
                <Icon icon="pepicons-pop:list" />
            </button>
            <button className="p-2 bg-blue-50 text-blue-600">
                <Icon icon="circum:grid-3-2" />
            </button>
        </div>
    )
}