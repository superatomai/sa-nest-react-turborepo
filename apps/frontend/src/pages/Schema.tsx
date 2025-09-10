import { Icon } from '@iconify/react/dist/iconify.js'

const Schema = () => {
  return (
    <>
      <div className="w-full grid grid-cols-2 p-5">
    <div className="relative group bg-white rounded-xl border-2 border-emerald-200 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all duration-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2" tabIndex={0}>
    
    <div className="p-5">
        
        <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
            <Icon icon="solar:box-bold-duotone" className="w-5 h-5" />
            </div>
            <div>
            <h3 className="font-bold text-lg text-gray-900 leading-tight">CT-FRAG-001</h3>
            <div className="flex items-center space-x-2 mt-1">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">Active</span>
                <span className="text-xs text-gray-500">ID: 1</span>
            </div>
            </div>
        </div>
        </div>

    
        <div className="mb-4">
        <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
            Standard shipping container for fragile items with foam padding and moisture protection
        </p>
        </div>


        <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="space-y-1">
            <div className="flex items-center space-x-2">
            <Icon icon="solar:layers-bold-duotone" className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium text-gray-600">Group</span>
            </div>
            <p className="text-sm text-gray-900 font-medium pl-6">Fragile Items</p>
        </div>
        
        <div className="space-y-1">
            <div className="flex items-center space-x-2">
            <Icon icon="solar:tag-bold-duotone" className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-medium text-gray-600">Pallet</span>
            </div>
            <p className="text-sm text-gray-900 font-medium pl-6">PLT-STD-001</p>
        </div>
        </div>

        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start space-x-2">
            <Icon icon="solar:file-text-bold-duotone" className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
            <p className="text-xs font-medium text-amber-800 mb-1">Memo</p>
            <p className="text-sm text-amber-700 leading-relaxed">
                Handle with extra care - temperature sensitive materials
            </p>
            </div>
        </div>
        </div>

    
        <div className="space-y-2 text-xs text-gray-600">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
            <Icon icon="solar:calendar-bold-duotone" className="w-4 h-4" />
            <span>Created Jan 15, 2024</span>
            </div>
        </div>
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
            <Icon icon="solar:clock-circle-bold-duotone" className="w-4 h-4" />
            <span>Updated 2h ago</span>
            </div>
        </div>
        </div>
    </div>

    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-white/90 p-4 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 group-focus:translate-y-0">
        <div className="flex justify-center space-x-2">
        <button className="p-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 shadow-sm">
            <Icon icon="solar:eye-bold-duotone" className="w-4 h-4" />
        </button>
        <button className="p-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200 shadow-sm">
            <Icon icon="solar:pen-bold-duotone" className="w-4 h-4" />
        </button>
        <button className="p-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 shadow-sm">
            <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-4 h-4" />
        </button>
        </div>
    </div>
    </div>
    </div>
    </>
  )
}

export default Schema
