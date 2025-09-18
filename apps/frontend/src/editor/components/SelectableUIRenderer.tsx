import React from 'react'
import FLOWUIRenderer2 from './ui-rendere-2'
import { NodeSelectionProvider, SelectionControlPanel } from '../hooks/useNodeSelection'
import { useDefaultKeyboardInteractions } from '../hooks/useKeyboardInteractions'
import { UIComponent } from '../../types/dsl'
import { Toaster } from 'react-hot-toast'

interface SelectableUIRendererProps {
	uiComponent: UIComponent
	handlers?: Record<string, Function>
	isStreaming?: boolean
	onRefresh?: () => void
	enableSelection?: boolean // Toggle selection on/off
	onSchemaUpdate?: (newSchema: UIComponent, operation?: string) => void // Callback for schema updates
}

/**
 * Inner component that uses keyboard interactions
 */
const SelectableUIRendererInner: React.FC<{
	uiComponent: UIComponent
	handlers: Record<string, Function>
	isStreaming?: boolean
	onRefresh?: () => void
}> = ({ uiComponent, handlers, isStreaming, onRefresh }) => {
	// Initialize keyboard interactions (gets root schema from context)
	useDefaultKeyboardInteractions()

	return (
		<div className="relative">
			{/* <SelectionControlPanel /> */}
			<FLOWUIRenderer2
				uiComponent={uiComponent}
				handlers={handlers}
				isStreaming={isStreaming}
				onRefresh={onRefresh}
				enableSelection={true}
			/>
			<Toaster
				position="top-center"
				toastOptions={{
					duration: 2000,
					style: {
						background: '#363636',
						color: '#fff',
					},
					success: {
						duration: 2000,
						style: {
							background: '#10b981',
							color: '#fff',
						},
					},
					error: {
						duration: 3000,
						style: {
							background: '#ef4444',
							color: '#fff',
						},
					},
				}}
			/>
		</div>
	)
}

/**
 * A wrapper around FLOWUIRenderer2 that optionally adds node selection functionality
 * Use this when you want to enable/disable selection as a modular feature
 */
const SelectableUIRenderer: React.FC<SelectableUIRendererProps> = ({
	uiComponent,
	handlers = {},
	isStreaming,
	onRefresh,
	enableSelection = false,
	onSchemaUpdate
}) => {
	// If selection is disabled, render the normal UI renderer
	if (!enableSelection) {
		return (
			<FLOWUIRenderer2
				uiComponent={uiComponent}
				handlers={handlers}
				enableSelection={false}
			/>
		)
	}

	// If selection is enabled, wrap with NodeSelectionProvider and keyboard interactions
	return (
		<NodeSelectionProvider rootSchema={uiComponent} onSchemaUpdate={onSchemaUpdate}>
			<SelectableUIRendererInner
				uiComponent={uiComponent}
				handlers={handlers}
				isStreaming={isStreaming}
				onRefresh={onRefresh}
			/>
		</NodeSelectionProvider>
	)
}

export default SelectableUIRenderer