import React from 'react'
import FLOWUIRenderer2 from './ui-rendere-2'
import { NodeSelectionProvider, SelectionControlPanel } from '../hooks/useNodeSelection'
import { T_UI_Component } from '../../types/ui-schema'
import { Toaster } from 'react-hot-toast'

interface SelectableUIRendererProps {
	schema: T_UI_Component
	data?: any
	handlers?: Record<string, Function>
	isStreaming?: boolean
	onRefresh?: () => void
	enableSelection?: boolean // Toggle selection on/off
	onSchemaUpdate?: (newSchema: T_UI_Component, operation?: string) => void // Callback for schema updates
}

/**
 * A wrapper around FLOWUIRenderer2 that optionally adds node selection functionality
 * Use this when you want to enable/disable selection as a modular feature
 */
const SelectableUIRenderer: React.FC<SelectableUIRendererProps> = ({
	schema,
	data,
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
				schema={schema}
				data={data}
				handlers={handlers}
				isStreaming={isStreaming}
				onRefresh={onRefresh}
				enableSelection={false}
			/>
		)
	}

	// If selection is enabled, wrap with NodeSelectionProvider
	return (
		<NodeSelectionProvider rootSchema={schema} onSchemaUpdate={onSchemaUpdate}>
			<div className="relative">
				{/* <SelectionControlPanel /> */}
				<FLOWUIRenderer2
					schema={schema}
					data={data}
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
		</NodeSelectionProvider>
	)
}

export default SelectableUIRenderer