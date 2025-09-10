import { Icon } from '@iconify/react/dist/iconify.js'


{/* <div className="relative group bg-white rounded-xl border-2 border-emerald-200 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all duration-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2" tabIndex={0}>
    
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
    </div> */}

const Schema = () => {
  return (
    <>
      <div className="w-full grid grid-cols-3 p-5 gap-5">
        <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Icon
                  icon="solar:database-bold-duotone"
                  className="w-5 h-5 text-blue-600"
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  item_container_types
                </h3>
                <p className="text-xs text-gray-500">
                  9 columns • public schema
                </p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <p className="text-sm text-gray-600 mb-3">
              Container type definitions with metadata for inventory management
              system
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-xs">
                <Icon
                  icon="solar:key-bold"
                  className="w-3 h-3 text-amber-500"
                />
                <span className="text-gray-700 font-medium">
                  Container Type ID
                </span>
                <span className="text-gray-500">• Description • Group</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <Icon
                  icon="solar:settings-bold-duotone"
                  className="w-3 h-3 text-green-500"
                />
                <span className="text-gray-700 font-medium">Active Status</span>
                <span className="text-gray-500">• Pallet Type • Memo</span>
              </div>
            </div>

            <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
              <Icon
                icon="solar:magic-stick-3-bold-duotone"
                className="w-4 h-4"
              />
              <span>Generate UI</span>
            </button>
          </div>
        </div>

        <div className="w-full bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200">
 
  <div className="p-4 border-b border-gray-100">
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
        <Icon icon="solar:database-bold-duotone" className="w-4 h-4 text-blue-600"></Icon>
      </div>
      <div>
        <h3 className="font-semibold text-gray-900">item_container_types</h3>
        <div className="flex items-center space-x-2 mt-0.5">
          <span className="text-xs text-gray-500">public schema</span>
          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
          <span className="text-xs text-gray-500">9 columns</span>
        </div>
      </div>
    </div>
  </div>


  <div className="p-4 space-y-3">
    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Key Fields</p>
    
    <div className="space-y-2">
    
      <div className="flex items-center space-x-2">
        <Icon icon="solar:key-bold-duotone" className="w-3 h-3 text-amber-500"></Icon>
        <span className="text-sm text-gray-700">Container Type ID</span>
        <span className="text-xs text-gray-400">text</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <Icon icon="solar:file-text-bold-duotone" className="w-3 h-3 text-green-500"></Icon>
        <span className="text-sm text-gray-700">Description</span>
        <span className="text-xs text-gray-400">text</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <Icon icon="solar:layers-bold-duotone" className="w-3 h-3 text-purple-500"></Icon>
        <span className="text-sm text-gray-700">Container Type Group</span>
        <span className="text-xs text-gray-400">text</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <Icon icon="solar:check-circle-bold-duotone" className="w-3 h-3 text-emerald-500"></Icon>
        <span className="text-sm text-gray-700">Active</span>
        <span className="text-xs text-gray-400">text</span>
      </div>
    </div>

    <div className="pt-2 border-t border-gray-100">
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center space-x-1">
          <Icon icon="solar:calendar-bold-duotone" className="w-3 h-3"></Icon>
          <span>Timestamps tracked</span>
        </div>
        <div className="flex items-center space-x-1">
          <Icon icon="solar:notes-bold-duotone" className="w-3 h-3"></Icon>
          <span>Has memo field</span>
        </div>
      </div>
    </div>
  </div>

  <div className="px-4 py-3 bg-gray-50 rounded-b-lg">
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500">Container management table</span>
      <div className="flex items-center space-x-1">
        <Icon icon="solar:info-circle-bold-duotone" className="w-3 h-3 text-blue-500"></Icon>
        <span className="text-xs text-blue-600 font-medium">View schema</span>
      </div>
    </div>
  </div>
</div>

<div className="w-full bg-gray-800 rounded-xl border border-gray-700 hover:border-indigo-500 hover:shadow-xl transition-all duration-300">
  
  <div className="p-5 border-b border-gray-700">
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
        <Icon icon="solar:database-bold-duotone" className="w-5 h-5 text-indigo-200"></Icon>
      </div>
      <div>
        <h3 className="font-semibold text-gray-50 text-lg">item_container_types</h3>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-sm text-gray-400">public schema</span>
          <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
          <span className="text-sm text-gray-400">9 columns</span>
        </div>
      </div>
    </div>
  </div>


  <div className="p-5 space-y-4">
    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Key Fields</p>
    
    <div className="space-y-3">
    
      <div className="flex items-center space-x-2">
        <Icon icon="solar:key-bold-duotone" className="w-4 h-4 text-amber-500"></Icon>
        <span className="text-sm text-gray-200">Container Type ID</span>
        <span className="text-xs text-gray-500">text</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <Icon icon="solar:file-text-bold-duotone" className="w-4 h-4 text-green-500"></Icon>
        <span className="text-sm text-gray-200">Description</span>
        <span className="text-xs text-gray-500">text</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <Icon icon="solar:layers-bold-duotone" className="w-4 h-4 text-purple-500"></Icon>
        <span className="text-sm text-gray-200">Container Type Group</span>
        <span className="text-xs text-gray-500">text</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <Icon icon="solar:check-circle-bold-duotone" className="w-4 h-4 text-emerald-500"></Icon>
        <span className="text-sm text-gray-200">Active</span>
        <span className="text-xs text-gray-500">text</span>
      </div>
    </div>

    <div className="pt-3 border-t border-gray-700">
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center space-x-1">
          <Icon icon="solar:calendar-bold-duotone" className="w-3 h-3"></Icon>
          <span>Timestamps tracked</span>
        </div>
        <div className="flex items-center space-x-1">
          <Icon icon="solar:notes-bold-duotone" className="w-3 h-3"></Icon>
          <span>Has memo field</span>
        </div>
      </div>
    </div>
  </div>

  <div className="px-5 py-4 bg-gray-900 rounded-b-xl">
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-400">Container management table</span>
      <div className="flex items-center space-x-1">
        <Icon icon="solar:info-circle-bold-duotone" className="w-3 h-3 text-blue-500"></Icon>
        <span className="text-xs text-blue-400 font-medium">View schema</span>
      </div>
    </div>
  </div>
</div>

<div className="w-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-600 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 group">
  
  <div className="p-6">
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
            <Icon icon="solar:database-bold-duotone" className="w-6 h-6 text-white"></Icon>
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800"></div>
        </div>
        <div>
          <h3 className="font-bold text-slate-50 text-xl">item_container_types</h3>
          <div className="flex items-center space-x-3 mt-2">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100/10 text-blue-300 border border-blue-500/20">public</span>
            <span className="text-sm text-slate-400">9 fields</span>
          </div>
        </div>
      </div>
      <Icon icon="solar:menu-dots-bold-duotone" className="w-5 h-5 text-slate-400 group-hover:text-slate-300 transition-colors"></Icon>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="p-3 rounded-xl bg-slate-700/50 border border-slate-600/50 hover:bg-slate-700/70 transition-colors">
        <div className="flex items-center space-x-2 mb-2">
          <Icon icon="solar:key-bold-duotone" className="w-4 h-4 text-yellow-400"></Icon>
          <span className="text-xs font-medium text-slate-300">Identifier</span>
        </div>
        <p className="text-sm text-slate-100 font-medium">Container Type ID</p>
        <p className="text-xs text-slate-400 mt-1">Primary identifier field</p>
      </div>
      
      <div className="p-3 rounded-xl bg-slate-700/50 border border-slate-600/50 hover:bg-slate-700/70 transition-colors">
        <div className="flex items-center space-x-2 mb-2">
          <Icon icon="solar:file-text-bold-duotone" className="w-4 h-4 text-emerald-400"></Icon>
          <span className="text-xs font-medium text-slate-300">Content</span>
        </div>
        <p className="text-sm text-slate-100 font-medium">Description</p>
        <p className="text-xs text-slate-400 mt-1">Detailed information</p>
      </div>
      
      <div className="p-3 rounded-xl bg-slate-700/50 border border-slate-600/50 hover:bg-slate-700/70 transition-colors">
        <div className="flex items-center space-x-2 mb-2">
          <Icon icon="solar:layers-bold-duotone" className="w-4 h-4 text-purple-400"></Icon>
          <span className="text-xs font-medium text-slate-300">Category</span>
        </div>
        <p className="text-sm text-slate-100 font-medium">Type Group</p>
        <p className="text-xs text-slate-400 mt-1">Classification field</p>
      </div>
      
      <div className="p-3 rounded-xl bg-slate-700/50 border border-slate-600/50 hover:bg-slate-700/70 transition-colors">
        <div className="flex items-center space-x-2 mb-2">
          <Icon icon="solar:settings-bold-duotone" className="w-4 h-4 text-orange-400"></Icon>
          <span className="text-xs font-medium text-slate-300">Status</span>
        </div>
        <p className="text-sm text-slate-100 font-medium">Active & Memo</p>
        <p className="text-xs text-slate-400 mt-1">State management</p>
      </div>
    </div>

    <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-slate-700/30 to-slate-600/30 border border-slate-600/30">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Icon icon="solar:calendar-bold-duotone" className="w-4 h-4 text-blue-400"></Icon>
          <span className="text-xs text-slate-300">Time tracking enabled</span>
        </div>
        <div className="w-1 h-4 bg-slate-500 rounded-full"></div>
        <div className="flex items-center space-x-2">
          <Icon icon="solar:shield-check-bold-duotone" className="w-4 h-4 text-green-400"></Icon>
          <span className="text-xs text-slate-300">Audit ready</span>
        </div>
      </div>
      <button className="flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
        <Icon icon="solar:eye-bold-duotone" className="w-3 h-3"></Icon>
        <span>Explore</span>
      </button>
    </div>
  </div>
</div>

<div className="w-full bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl border border-indigo-600 hover:border-violet-400 hover:shadow-xl hover:shadow-violet-500/20 transition-all duration-300 group">
  
  <div className="p-6">
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Icon icon="solar:layers-minimalistic-bold-duotone" className="w-6 h-6 text-white"></Icon>
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-indigo-900"></div>
        </div>
        <div>
          <h3 className="font-bold text-slate-50 text-xl">item_container_type_groups</h3>
          <div className="flex items-center space-x-3 mt-2">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-violet-100/10 text-violet-300 border border-violet-500/20">public</span>
            <span className="text-sm text-slate-400">7 fields</span>
          </div>
        </div>
      </div>
      <Icon icon="solar:menu-dots-bold-duotone" className="w-5 h-5 text-slate-400 group-hover:text-slate-300 transition-colors"></Icon>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="p-3 rounded-xl bg-indigo-800/50 border border-indigo-600/50 hover:bg-indigo-800/70 transition-colors">
        <div className="flex items-center space-x-2 mb-2">
          <Icon icon="solar:hashtag-bold-duotone" className="w-4 h-4 text-amber-400"></Icon>
          <span className="text-xs font-medium text-slate-300">Group ID</span>
        </div>
        <p className="text-sm text-slate-100 font-medium">Container Type Group ID</p>
        <p className="text-xs text-slate-400 mt-1">Unique group identifier</p>
      </div>
      
      <div className="p-3 rounded-xl bg-indigo-800/50 border border-indigo-600/50 hover:bg-indigo-800/70 transition-colors">
        <div className="flex items-center space-x-2 mb-2">
          <Icon icon="solar:document-text-bold-duotone" className="w-4 h-4 text-emerald-400"></Icon>
          <span className="text-xs font-medium text-slate-300">Details</span>
        </div>
        <p className="text-sm text-slate-100 font-medium">Description</p>
        <p className="text-xs text-slate-400 mt-1">Group description</p>
      </div>
      
      <div className="p-3 rounded-xl bg-indigo-800/50 border border-indigo-600/50 hover:bg-indigo-800/70 transition-colors">
        <div className="flex items-center space-x-2 mb-2">
          <Icon icon="solar:user-bold-duotone" className="w-4 h-4 text-blue-400"></Icon>
          <span className="text-xs font-medium text-slate-300">Reference</span>
        </div>
        <p className="text-sm text-slate-100 font-medium">Referenced By Customer</p>
        <p className="text-xs text-slate-400 mt-1">Customer association</p>
      </div>
      
      <div className="p-3 rounded-xl bg-indigo-800/50 border border-indigo-600/50 hover:bg-indigo-800/70 transition-colors">
        <div className="flex items-center space-x-2 mb-2">
          <Icon icon="solar:notes-bold-duotone" className="w-4 h-4 text-rose-400"></Icon>
          <span className="text-xs font-medium text-slate-300">Notes</span>
        </div>
        <p className="text-sm text-slate-100 font-medium">Memo</p>
        <p className="text-xs text-slate-400 mt-1">Additional notes</p>
      </div>
    </div>

    <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-indigo-800/30 to-purple-800/30 border border-indigo-600/30">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Icon icon="solar:clock-circle-bold-duotone" className="w-4 h-4 text-violet-400"></Icon>
          <span className="text-xs text-slate-300">Timestamp tracking</span>
        </div>
        <div className="w-1 h-4 bg-slate-500 rounded-full"></div>
        <div className="flex items-center space-x-2">
          <Icon icon="solar:folder-bold-duotone" className="w-4 h-4 text-purple-400"></Icon>
          <span className="text-xs text-slate-300">Group management</span>
        </div>
      </div>
      <button className="flex items-center space-x-1 text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors">
        <Icon icon="solar:database-bold-duotone" className="w-3 h-3"></Icon>
        <span>Schema</span>
      </button>
    </div>
  </div>
</div>

<div className="w-full bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-100 transition-all duration-300 group">
  
  <div className="p-6">
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
            <Icon icon="solar:layers-minimalistic-bold-duotone" className="w-6 h-6 text-white"></Icon>
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-xl">item_container_type_groups</h3>
          <div className="flex items-center space-x-3 mt-2">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">public</span>
            <span className="text-sm text-gray-500">7 fields</span>
          </div>
        </div>
      </div>
      <Icon icon="solar:menu-dots-bold-duotone" className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors"></Icon>
    </div>

    <div className="grid grid-cols-2 gap-6 mb-6">
      <div className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center mt-0.5">
          <Icon icon="solar:hashtag-bold-duotone" className="w-4 h-4 text-amber-600"></Icon>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">Container Type Group ID</p>
          <p className="text-xs text-gray-500 mt-1">Unique group identifier</p>
        </div>
      </div>
      
      <div className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center mt-0.5">
          <Icon icon="solar:document-text-bold-duotone" className="w-4 h-4 text-emerald-600"></Icon>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">Description</p>
          <p className="text-xs text-gray-500 mt-1">Group description</p>
        </div>
      </div>
      
      <div className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mt-0.5">
          <Icon icon="solar:user-bold-duotone" className="w-4 h-4 text-blue-600"></Icon>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">Referenced By Customer</p>
          <p className="text-xs text-gray-500 mt-1">Customer association</p>
        </div>
      </div>
      
      <div className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
        <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center mt-0.5">
          <Icon icon="solar:notes-bold-duotone" className="w-4 h-4 text-rose-600"></Icon>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">Memo</p>
          <p className="text-xs text-gray-500 mt-1">Additional notes</p>
        </div>
      </div>
    </div>

    <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-indigo-50 border border-gray-200">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Icon icon="solar:clock-circle-bold-duotone" className="w-4 h-4 text-indigo-500"></Icon>
          <span className="text-sm text-gray-700">Timestamp tracking</span>
        </div>
        <div className="w-1 h-4 bg-gray-300 rounded-full"></div>
        <div className="flex items-center space-x-2">
          <Icon icon="solar:folder-bold-duotone" className="w-4 h-4 text-purple-500"></Icon>
          <span className="text-sm text-gray-700">Group management</span>
        </div>
      </div>
      <button className="flex items-center space-x-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
        <Icon icon="solar:database-bold-duotone" className="w-4 h-4"></Icon>
        <span>Schema</span>
      </button>
    </div>
  </div>
</div>

<div className="w-full bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100 transition-all duration-300 group">
  
  <div className="p-4">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Icon icon="solar:layers-minimalistic-bold-duotone" className="w-4 h-4 text-white"></Icon>
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-base leading-tight">item_container_type_groups</h3>
          <div className="flex items-center space-x-2 mt-1">
            <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-700">public</span>
            <span className="text-xs text-gray-400">7 fields</span>
          </div>
        </div>
      </div>
    </div>

    <div className="space-y-3 mb-4">
      <div className="flex items-center space-x-2">
        <Icon icon="solar:hashtag-bold-duotone" className="w-3.5 h-3.5 text-amber-500"></Icon>
        <span className="text-sm text-gray-700 font-medium">Container Type Group ID</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <Icon icon="solar:document-text-bold-duotone" className="w-3.5 h-3.5 text-emerald-500"></Icon>
        <span className="text-sm text-gray-700 font-medium">Description</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <Icon icon="solar:user-bold-duotone" className="w-3.5 h-3.5 text-blue-500"></Icon>
        <span className="text-sm text-gray-700 font-medium">Referenced By Customer</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <Icon icon="solar:notes-bold-duotone" className="w-3.5 h-3.5 text-rose-500"></Icon>
        <span className="text-sm text-gray-700 font-medium">Memo</span>
      </div>
    </div>

    <div className="pt-3 border-t border-gray-100">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 text-gray-500">
            <Icon icon="solar:clock-circle-bold-duotone" className="w-3 h-3"></Icon>
            <span>Tracked</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-500">
            <Icon icon="solar:folder-bold-duotone" className="w-3 h-3"></Icon>
            <span>Groups</span>
          </div>
        </div>
        <button className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
          View →
        </button>
      </div>
    </div>
  </div>
</div>

<div className="w-full bg-white rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100 transition-all duration-300 group">
  
  <div className="p-4">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Icon icon="solar:box-minimalistic-bold-duotone" className="w-4 h-4 text-white"></Icon>
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-base leading-tight">item_item_groups</h3>
          <div className="flex items-center space-x-2 mt-1">
            <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-emerald-100 text-emerald-700">public</span>
            <span className="text-xs text-gray-400">9 fields</span>
          </div>
        </div>
      </div>
    </div>

    <div className="mb-3">
      <p className="text-xs text-emerald-600 font-medium mb-2">🎯 Would you like to generate a form for this table?</p>
    </div>

    <div className="space-y-3 mb-4">
      <div className="flex items-center space-x-2">
        <Icon icon="solar:tag-bold-duotone" className="w-3.5 h-3.5 text-amber-500"></Icon>
        <span className="text-sm text-gray-700 font-medium">Item Group ID</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <Icon icon="solar:document-text-bold-duotone" className="w-3.5 h-3.5 text-blue-500"></Icon>
        <span className="text-sm text-gray-700 font-medium">Description</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <Icon icon="solar:shield-check-bold-duotone" className="w-3.5 h-3.5 text-purple-500"></Icon>
        <span className="text-sm text-gray-700 font-medium">NMFC Required</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <Icon icon="solar:global-bold-duotone" className="w-3.5 h-3.5 text-indigo-500"></Icon>
        <span className="text-sm text-gray-700 font-medium">Harmonized Tariff Required</span>
      </div>

      <div className="flex items-center space-x-2">
        <Icon icon="solar:user-bold-duotone" className="w-3.5 h-3.5 text-rose-500"></Icon>
        <span className="text-sm text-gray-700 font-medium">Referenced By Customer</span>
      </div>
    </div>

    <div className="p-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-100 mb-4">
      <p className="text-xs text-emerald-700 text-center font-medium">💡 I can create CRUD operations, forms, or API endpoints for this table!</p>
    </div>

    <div className="pt-3 border-t border-gray-100">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 text-gray-500">
            <Icon icon="solar:clock-circle-bold-duotone" className="w-3 h-3"></Icon>
            <span>Tracked</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-500">
            <Icon icon="solar:notes-bold-duotone" className="w-3 h-3"></Icon>
            <span>Notes</span>
          </div>
        </div>
        <button className="px-2 py-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded font-medium transition-all">
          Generate UI →
        </button>
      </div>
    </div>
  </div>
</div>

<div className="w-full max-w-sm bg-gray-900 text-gray-200 rounded-2xl border border-gray-700 hover:border-violet-500 hover:shadow-2xl hover:shadow-violet-900/50 transition-all duration-300">
  
  {/* Card Header */}
  <div className="p-6">
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-lg">
        <Icon icon="solar:database-bold-duotone" className="w-6 h-6 text-white"></Icon>
      </div>
      <div>
        <h3 className="font-bold text-white text-lg">item_container_types</h3>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-sm text-gray-400">public schema</span>
          <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
          <span className="text-sm text-gray-400">9 columns</span>
        </div>
      </div>
    </div>
  </div>


  {/* Key Fields Section */}
  <div className="p-6 space-y-5 bg-gray-800 border-t border-b border-gray-700">
    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Key Fields</p>
    
    <div className="space-y-3">
    
      <div className="flex items-center space-x-3">
        <Icon icon="solar:key-bold-duotone" className="w-4 h-4 text-amber-500"></Icon>
        <span className="text-sm text-gray-200">Container Type ID</span>
        <span className="text-xs text-gray-500">text</span>
      </div>
      
      <div className="flex items-center space-x-3">
        <Icon icon="solar:file-text-bold-duotone" className="w-4 h-4 text-green-500"></Icon>
        <span className="text-sm text-gray-200">Description</span>
        <span className="text-xs text-gray-500">text</span>
      </div>
      
      <div className="flex items-center space-x-3">
        <Icon icon="solar:layers-bold-duotone" className="w-4 h-4 text-purple-500"></Icon>
        <span className="text-sm text-gray-200">Container Type Group</span>
        <span className="text-xs text-gray-500">text</span>
      </div>
      
      <div className="flex items-center space-x-3">
        <Icon icon="solar:check-circle-bold-duotone" className="w-4 h-4 text-emerald-500"></Icon>
        <span className="text-sm text-gray-200">Active</span>
        <span className="text-xs text-gray-500">text</span>
      </div>
    </div>

    <div className="pt-4 border-t border-gray-700">
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center space-x-1">
          <Icon icon="solar:calendar-bold-duotone" className="w-3 h-3"></Icon>
          <span>Timestamps tracked</span>
        </div>
        <div className="flex items-center space-x-1">
          <Icon icon="solar:notes-bold-duotone" className="w-3 h-3"></Icon>
          <span>Has memo field</span>
        </div>
      </div>
    </div>
  </div>

  {/* Call-to-action Footer */}
  <div className="px-6 py-4 bg-gray-900 rounded-b-xl">
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-400">This table is ready to generate.</span>
      <div className="flex items-center space-x-2">
        <span className="text-xs text-violet-400 font-medium">Generate a form</span>
        <Icon icon="solar:arrow-right-bold-duotone" className="w-3 h-3 text-violet-500"></Icon>
      </div>
    </div>
  </div>
</div>

<div className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-100 transition-all duration-300 transform group">
    
  {/* Card Header */}
  <div className="p-6">
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:bg-blue-200">
        <Icon icon="mynaui:package-solid" className="w-6 h-6 text-blue-600"></Icon>
      </div>
      <div>
        <h3 className="font-extrabold text-gray-900 text-xl">item_item_package_levels</h3>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-sm text-gray-500">public schema</span>
          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
          <span className="text-sm text-gray-500">20 columns</span>
        </div>
      </div>
    </div>
  </div>


  {/* Key Fields Section */}
  <div className="p-6 space-y-5 bg-gray-50 border-t border-b border-gray-200">
    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Key Fields</p>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    
      <div className="flex items-center space-x-3">
        <Icon icon="solar:tag-bold-duotone" className="w-4 h-4 text-orange-500"></Icon>
        <span className="text-sm text-gray-800 font-medium">Item Number</span>
        <span className="text-xs text-gray-400">text</span>
      </div>
      
      <div className="flex items-center space-x-3">
        <Icon icon="solar:document-text-bold-duotone" className="w-4 h-4 text-blue-500"></Icon>
        <span className="text-sm text-gray-800 font-medium">Item Description</span>
        <span className="text-xs text-gray-400">text</span>
      </div>
      
      <div className="flex items-center space-x-3">
        <Icon icon="solar:layers-bold-duotone" className="w-4 h-4 text-purple-500"></Icon>
        <span className="text-sm text-gray-800 font-medium">Item Group ID</span>
        <span className="text-xs text-gray-400">text</span>
      </div>
      
      <div className="flex items-center space-x-3">
        <Icon icon="solar:check-circle-bold-duotone" className="w-4 h-4 text-green-500"></Icon>
        <span className="text-sm text-gray-800 font-medium">Active</span>
        <span className="text-xs text-gray-400">text</span>
      </div>

      <div className="flex items-center space-x-3">
        <Icon icon="solar:hashtag-square-bold-duotone" className="w-4 h-4 text-rose-500"></Icon>
        <span className="text-sm text-gray-800 font-medium">Units</span>
        <span className="text-xs text-gray-400">numeric</span>
      </div>
      
      <div className="flex items-center space-x-3">
        <Icon icon="solar:weight-bold-duotone" className="w-4 h-4 text-yellow-500"></Icon>
        <span className="text-sm text-gray-800 font-medium">Weight</span>
        <span className="text-xs text-gray-400">numeric</span>
      </div>
    </div>

    <div className="pt-4 border-t border-gray-200">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <Icon icon="solar:calendar-bold-duotone" className="w-3 h-3"></Icon>
          <span>Timestamps tracked</span>
        </div>
        <div className="flex items-center space-x-1">
          <Icon icon="solar:notes-bold-duotone" className="w-3 h-3"></Icon>
          <span>Has memo field</span>
        </div>
      </div>
    </div>
  </div>

  {/* Call-to-action Footer */}
  <div className="px-6 py-4 bg-gray-100 rounded-b-2xl flex flex-col sm:flex-row items-center justify-between">
    <p className="text-xs text-gray-500 mb-2 sm:mb-0">This table is ready to generate.</p>
    <button className="flex items-center space-x-2 text-blue-600 font-medium px-4 py-2 rounded-full border border-blue-400 hover:bg-blue-500 hover:text-white transition-all duration-300">
      <span>Generate a Form</span>
      <Icon icon="solar:arrow-right-bold-duotone" className="w-3 h-3 text-blue-500 group-hover:text-white"></Icon>
    </button>
  </div>
</div>

<div className="w-full max-w-sm mx-auto bg-white rounded-xl shadow-lg border border-gray-100 transition-all duration-300 transform hover:scale-[1.02]">
  
  {/* Card Header */}
  <div className="p-4 flex items-center justify-between">
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
        <Icon icon="solar:box-3d-bold-duotone" className="w-4 h-4 text-blue-600"></Icon>
      </div>
      <div>
        <h3 className="font-bold text-gray-900 text-base">item_item_package_levels</h3>
        <p className="text-xs text-gray-500 mt-0.5">public schema · 20 columns</p>
      </div>
    </div>
    <button className="text-sm font-medium text-blue-600 px-3 py-1 rounded-full border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors duration-200">
      View
    </button>
  </div>


  {/* Key Fields Section */}
  <div className="p-4 space-y-3 border-t border-gray-100">
    <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Key Fields</p>
    
    <div className="space-y-2">
    
      <div className="flex items-center space-x-2">
        <Icon icon="solar:tag-bold-duotone" className="w-4 h-4 text-orange-500"></Icon>
        <span className="text-sm text-gray-800">Item Number</span>
        <span className="text-xs text-gray-400">text</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <Icon icon="solar:document-text-bold-duotone" className="w-4 h-4 text-blue-500"></Icon>
        <span className="text-sm text-gray-800">Item Description</span>
        <span className="text-xs text-gray-400">text</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <Icon icon="solar:layers-bold-duotone" className="w-4 h-4 text-purple-500"></Icon>
        <span className="text-sm text-gray-800">Item Group ID</span>
        <span className="text-xs text-gray-400">text</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <Icon icon="solar:check-circle-bold-duotone" className="w-4 h-4 text-green-500"></Icon>
        <span className="text-sm text-gray-800">Active</span>
        <span className="text-xs text-gray-400">text</span>
      </div>

      <div className="flex items-center space-x-2">
        <Icon icon="solar:ruler-bold-duotone" className="w-4 h-4 text-rose-500"></Icon>
        <span className="text-sm text-gray-800">Units</span>
        <span className="text-xs text-gray-400">numeric</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <Icon icon="solar:weight-bold-duotone" className="w-4 h-4 text-yellow-500"></Icon>
        <span className="text-sm text-gray-800">Weight</span>
        <span className="text-xs text-gray-400">numeric</span>
      </div>
    </div>
  </div>

  {/* Call-to-action Footer */}
  <div className="p-4 bg-gray-50 rounded-b-xl border-t border-gray-100">
    <div className="flex items-center justify-between">
      <p className="text-xs text-gray-500">Ready to generate</p>
      <button className="flex items-center space-x-1 text-xs text-blue-600 font-medium hover:text-blue-700 transition-colors duration-200">
        <span>Generate UI</span>
        <Icon icon="solar:arrow-right-bold-duotone" className="w-3 h-3 text-blue-500"></Icon>
      </button>
    </div>
  </div>
</div>




      </div>
    </>
  );
}

export default Schema
