import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { UIComponent, UIElement } from '../../types/dsl'
import toast from 'react-hot-toast'
import { SchemaUtils } from '../../utils/schema-utilities'

interface SelectionPath {
	componentId: string
	path: number[] // Path to the component in the tree
}

interface NodeSelectionContextType {
	// Selection state
	isSelectionEnabled: boolean
	selectedNode: SelectionPath | null
	hoveredNode: SelectionPath | null
	selectionLevel: number // 0 = root siblings, 1+ = child levels
	copiedNode: UIComponent | UIElement | null // Copied component or element
	rootSchema: UIComponent | null // Current root schema

	// Selection actions
	enableSelection: () => void
	disableSelection: () => void
	selectNode: (componentId: string, path: number[]) => void
	clearSelection: () => void
	setHoveredNode: (componentId: string | null, path?: number[]) => void

	// Navigation actions
	navigateToChildren: () => void
	navigateToParent: () => void

	// Copy-paste actions
	copySelectedNode: () => void
	cutSelectedNode: () => void
	pasteAsChild: () => void
	hasCopiedNode: () => boolean

	// Delete action
	deleteSelectedNode: () => void

	// Helper methods
	isNodeSelectable: (path: number[]) => boolean
	isNodeSelected: (componentId: string, path: number[]) => boolean
	isNodeHovered: (componentId: string, path: number[]) => boolean

	// Schema update callback
	onSchemaUpdate?: (newSchema: UIComponent, operation?: string) => void

	// Node selection callback
	onNodeSelect?: (nodeId: string) => void
}

const NodeSelectionContext = createContext<NodeSelectionContextType | null>(null)

interface NodeSelectionProviderProps {
	children: ReactNode
	rootSchema: UIComponent | null
	onSchemaUpdate?: (newSchema: UIComponent, operation?: string) => void
	onNodeSelect?: (nodeId: string) => void
}

export const NodeSelectionProvider: React.FC<NodeSelectionProviderProps> = ({
	children,
	rootSchema,
	onSchemaUpdate,
	onNodeSelect
}) => {
	const [isSelectionEnabled, setIsSelectionEnabled] = useState(true)
	const [selectedNode, setSelectedNode] = useState<SelectionPath | null>(null)
	const [hoveredNode, setHoveredNodeState] = useState<SelectionPath | null>(null)
	const [selectionLevel, setSelectionLevel] = useState(0)
	const [copiedNode, setCopiedNode] = useState<UIComponent | UIElement | null>(null)

	const enableSelection = useCallback(() => {
		setIsSelectionEnabled(true)
		setSelectionLevel(0) // Start at root level
	}, [])

	const disableSelection = useCallback(() => {
		setIsSelectionEnabled(false)
		setSelectedNode(null)
		setHoveredNodeState(null)
		setSelectionLevel(0)
	}, [])

	const selectNode = useCallback((componentId: string, path: number[]) => {
		if (!isSelectionEnabled) return

		setSelectedNode({ componentId, path })

		// Call the onNodeSelect callback if provided
		if (onNodeSelect) {
			onNodeSelect(componentId)
		}
	}, [isSelectionEnabled, onNodeSelect])

	const clearSelection = useCallback(() => {
		setSelectedNode(null)
		setHoveredNodeState(null)
	}, [])

	const setHoveredNode = useCallback((componentId: string | null, path: number[] = []) => {
		if (!isSelectionEnabled || !componentId) {
			setHoveredNodeState(null)
			return
		}

		setHoveredNodeState({ componentId, path })
	}, [isSelectionEnabled])

	const navigateToChildren = useCallback(() => {
		if (!selectedNode || !rootSchema) return

		// Find the selected component and check if it has children
		const selectedComponent = SchemaUtils.findComponentByPath(rootSchema, selectedNode.path)
		if (selectedComponent && SchemaUtils.hasNavigableChildren(selectedComponent)) {
			setSelectionLevel(prev => prev + 1)
			setSelectedNode(null) // Clear current selection when navigating to children
			setHoveredNodeState(null)
		}
	}, [selectedNode, rootSchema])

	const navigateToParent = useCallback(() => {
		if (selectionLevel > 0) {
			setSelectionLevel(prev => prev - 1)
			setSelectedNode(null)
			setHoveredNodeState(null)
		}
	}, [selectionLevel])

	// Note: Using SchemaUtils for cloning and ID generation

	// Copy selected node
	const copySelectedNode = useCallback(() => {
		try {
			if (!selectedNode || !rootSchema) {
				toast.error('No component selected to copy')
				return
			}

			const componentToCopy = SchemaUtils.findComponentByPath(rootSchema, selectedNode.path)
			if (componentToCopy) {
				setCopiedNode(componentToCopy)
				const elementInfo = SchemaUtils.getElementInfo(componentToCopy)
				toast.success(`Copied "${elementInfo.type}" element`)
				console.log('📋 Copied element:', elementInfo.id)
			} else {
				toast.error('Failed to find component to copy')
			}
		} catch (error) {
			toast.error('Error copying component')
			console.error('Copy error:', error)
		}
	}, [selectedNode, rootSchema])

	// Cut selected node (copy + delete)
	const cutSelectedNode = useCallback(() => {
		try {
			if (!selectedNode) {
				toast.error('No component selected to cut')
				return
			}

			if (!rootSchema || !onSchemaUpdate) {
				toast.error('Cannot cut: Schema update not available')
				return
			}

			// Cannot cut the root component itself
			if (selectedNode.path.length === 0) {
				toast.error('Cannot cut root component')
				return
			}

			// First, copy the component
			const componentToCut = SchemaUtils.findComponentByPath(rootSchema, selectedNode.path)
			if (!componentToCut) {
				toast.error('Component to cut not found')
				return
			}

			// Set the copied node
			setCopiedNode(componentToCut)

			// Remove the component using utility function
			const updatedSchema = SchemaUtils.removeComponentAtPath(rootSchema, selectedNode.path)

			// Clear selection since the component is being cut
			clearSelection()

			// Update the schema
			onSchemaUpdate(updatedSchema, 'cut')
			const elementInfo = SchemaUtils.getElementInfo(componentToCut)
			toast.success(`Cut "${elementInfo.type}" element`)
			console.log('✂️ Cut element:', elementInfo.id)
		} catch (error) {
			toast.error('Error cutting component')
			console.error('Cut error:', error)
		}
	}, [selectedNode, rootSchema, onSchemaUpdate, clearSelection])

	// Paste as child to selected node
	const pasteAsChild = useCallback(() => {
		try {
			if (!selectedNode) {
				toast.error('No component selected to paste into')
				return
			}

			if (!copiedNode) {
				toast.error('No component copied to paste')
				return
			}

			if (!rootSchema || !onSchemaUpdate) {
				toast.error('Cannot paste: Schema update not available')
				return
			}

			// Clone the copied node with new IDs
			const clonedNode = SchemaUtils.cloneElementWithNewIds(copiedNode)

			// Find the target parent component
			const targetParent = SchemaUtils.findComponentByPath(rootSchema, selectedNode.path)
			if (!targetParent) {
				toast.error('Target component not found')
				return
			}

			// Add the cloned component as a child using utility function
			const updatedSchema = SchemaUtils.addComponentAtPath(rootSchema, selectedNode.path, clonedNode)

			// Update the schema
			onSchemaUpdate(updatedSchema, 'paste')

			const copiedInfo = SchemaUtils.getElementInfo(copiedNode)
			const targetInfo = SchemaUtils.getElementInfo(targetParent)
			toast.success(`Pasted "${copiedInfo.type}" into "${targetInfo.type}"`)
			console.log('📌 Pasted element as child of:', targetInfo.id)
		} catch (error) {
			toast.error('Error pasting component')
			console.error('Paste error:', error)
		}
	}, [selectedNode, copiedNode, rootSchema, onSchemaUpdate])

	// Delete selected node
	const deleteSelectedNode = useCallback(() => {
		try {
			if (!selectedNode) {
				toast.error('No component selected to delete')
				return
			}

			if (!rootSchema || !onSchemaUpdate) {
				toast.error('Cannot delete: Schema update not available')
				return
			}

			// Cannot delete the root component itself
			if (selectedNode.path.length === 0) {
				toast.error('Cannot delete root component')
				console.warn('Cannot delete root component')
				return
			}

			// Find the component to delete for toast message
			const componentToDelete = SchemaUtils.findComponentByPath(rootSchema, selectedNode.path)
			const componentInfo = componentToDelete ? SchemaUtils.getElementInfo(componentToDelete) : null

			// Remove the component using utility function
			const updatedSchema = SchemaUtils.removeComponentAtPath(rootSchema, selectedNode.path)

			// Clear selection since the selected component is being deleted
			clearSelection()

			// Update the schema
			onSchemaUpdate(updatedSchema, 'delete')
			toast.success(`Deleted "${componentInfo?.type || 'component'}" component`)
			console.log('🗑️ Deleted component:', selectedNode.componentId)
		} catch (error) {
			toast.error('Error deleting component')
			console.error('Delete error:', error)
		}
	}, [selectedNode, rootSchema, onSchemaUpdate, clearSelection])

	// Check if there's a copied node
	const hasCopiedNode = useCallback(() => {
		return copiedNode !== null
	}, [copiedNode])

	// Note: Keyboard handling has been moved to useKeyboardInteractions hook
	// This allows for better separation of concerns and easier customization

	// Check if a node at given path is selectable at current level
	const isNodeSelectable = useCallback((path: number[]) => {
		if (!isSelectionEnabled) return false

		// At level 0, only direct children of root are selectable
		// At level 1, only children of the selected level-0 component are selectable, etc.
		return path.length === selectionLevel + 1
	}, [isSelectionEnabled, selectionLevel])

	const isNodeSelected = useCallback((componentId: string, path: number[]) => {
		return selectedNode?.componentId === componentId &&
			JSON.stringify(selectedNode.path) === JSON.stringify(path)
	}, [selectedNode])

	const isNodeHovered = useCallback((componentId: string, path: number[]) => {
		return hoveredNode?.componentId === componentId &&
			JSON.stringify(hoveredNode.path) === JSON.stringify(path)
	}, [hoveredNode])

	const contextValue: NodeSelectionContextType = {
		isSelectionEnabled,
		selectedNode,
		hoveredNode,
		selectionLevel,
		copiedNode,
		rootSchema,
		enableSelection,
		disableSelection,
		selectNode,
		clearSelection,
		setHoveredNode,
		navigateToChildren,
		navigateToParent,
		copySelectedNode,
		cutSelectedNode,
		pasteAsChild,
		hasCopiedNode,
		deleteSelectedNode,
		isNodeSelectable,
		isNodeSelected,
		isNodeHovered,
		onSchemaUpdate,
		onNodeSelect
	}

	return (
		<NodeSelectionContext.Provider value={contextValue}>
			{children}
		</NodeSelectionContext.Provider>
	)
}

// Note: Using SchemaUtils.findComponentByPath instead of local function

// Custom hook to use the selection context
export const useNodeSelection = () => {
	const context = useContext(NodeSelectionContext)
	if (!context) {
		throw new Error('useNodeSelection must be used within a NodeSelectionProvider')
	}
	return context
}

// Selection Control Panel Component
export const SelectionControlPanel: React.FC = () => {
	const {
		isSelectionEnabled,
		selectedNode,
		selectionLevel,
		copiedNode,
		enableSelection,
		disableSelection,
		navigateToChildren,
		navigateToParent,
		clearSelection,
		copySelectedNode,
		cutSelectedNode,
		pasteAsChild,
		hasCopiedNode,
		deleteSelectedNode
	} = useNodeSelection()

	if (!isSelectionEnabled) {
		return (
			<div className="fixed top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
				<div className="flex items-center space-x-3">
					<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.121 2.122" />
					</svg>
					<span className="text-sm text-gray-600">Selection Mode</span>
					<button
						onClick={enableSelection}
						className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
					>
						Enable
					</button>
				</div>
			</div>
		)
	}

	return (
		<div className="fixed top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 min-w-64">
			<div className="space-y-3">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
						<span className="text-sm font-medium text-gray-700">Selection Active</span>
					</div>
					<button
						onClick={disableSelection}
						className="text-gray-400 hover:text-gray-600 transition-colors"
						title="Disable Selection"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				{/* Current Level */}
				<div className="text-xs text-gray-500">
					Level {selectionLevel}: {selectionLevel === 0 ? 'Root siblings' : `Level ${selectionLevel} children`}
				</div>

				{/* Selected Node Info */}
				{selectedNode && (
					<div className="bg-blue-50 border border-blue-200 rounded p-2">
						<div className="text-xs text-blue-600 font-medium">Selected:</div>
						<div className="text-xs text-blue-800 font-mono">#{selectedNode.componentId}</div>
						<div className="text-xs text-blue-600">Path: [{selectedNode.path.join(', ')}]</div>
					</div>
				)}

				{/* Copied Node Info */}
				{copiedNode && (
					<div className="bg-green-50 border border-green-200 rounded p-2">
						<div className="text-xs text-green-600 font-medium">Copied:</div>
						<div className="text-xs text-green-800 font-mono">#{copiedNode.id}</div>
						<div className="text-xs text-green-600">Type: {SchemaUtils.getElementType(copiedNode) || 'unknown'}</div>
					</div>
				)}

				{/* Navigation Controls */}
				<div className="space-y-2">
					<div className="flex space-x-2">
						{selectionLevel > 0 && (
							<button
								onClick={navigateToParent}
								className="flex-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition-colors"
								title="Go to parent level"
							>
								← Parent
							</button>
						)}

						{selectedNode && (
							<button
								onClick={navigateToChildren}
								className="flex-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200 transition-colors"
								title="Double-click selected node or use this button to navigate to children"
							>
								Children →
							</button>
						)}

						<button
							onClick={clearSelection}
							className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200 transition-colors"
							title="Clear selection"
						>
							Clear
						</button>
					</div>

					{/* Copy-Cut-Paste-Delete Controls */}
					<div className="space-y-2">
						<div className="grid grid-cols-3 gap-2">
							<button
								onClick={copySelectedNode}
								disabled={!selectedNode}
								className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded hover:bg-orange-200 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
								title="Copy selected node (Ctrl+C)"
							>
								📋 Copy
							</button>

							<button
								onClick={cutSelectedNode}
								disabled={!selectedNode || selectedNode.path.length === 0}
								className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded hover:bg-yellow-200 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
								title="Cut selected node (Ctrl+X) - Cannot cut root"
							>
								✂️ Cut
							</button>

							<button
								onClick={pasteAsChild}
								disabled={!selectedNode || !copiedNode}
								className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
								title="Paste as child (Ctrl+V)"
							>
								📌 Paste
							</button>
						</div>

						<div className="flex">
							<button
								onClick={deleteSelectedNode}
								disabled={!selectedNode || selectedNode.path.length === 0}
								className="w-full px-2 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
								title="Delete selected node (Delete key) - Cannot delete root"
							>
								🗑️ Delete
							</button>
						</div>
					</div>
				</div>

				{/* Instructions */}
				<div className="text-xs text-gray-500 space-y-1">
					<div>• Hover to highlight nodes</div>
					<div>• Click to select node</div>
					<div>• Double-click to navigate to children</div>
					<div>• Escape to go back/clear</div>
					<div>• Ctrl+C copy, Ctrl+X cut, Ctrl+V paste</div>
					<div>• Delete key to remove selected node</div>
				</div>
			</div>
		</div>
	)
}