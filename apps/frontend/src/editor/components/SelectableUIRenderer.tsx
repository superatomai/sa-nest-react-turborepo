import React from 'react'
// import FLOWUIRenderer2 from './ui-renderer-2' // Replaced with UpdatedDSLRenderer
import { NodeSelectionProvider } from '../hooks/useNodeSelection'
import { useKeyboardInteractions } from '../hooks/useKeyboardInteractions'
import { UIComponent } from '../../types/dsl'
import UpdatedDSLRenderer from './updatedDSLRenderer'
import { observer } from 'mobx-react-lite'
import { editorModeStore } from '../../stores/mobx_editor_mode_store'

interface NavigationHandler {
	navigate?: (uiid: string, params?: Record<string, any>) => void;
	[key: string]: any;
}

interface SelectableUIRendererProps {
	uiComponent: UIComponent
	handlers?: NavigationHandler
	isStreaming?: boolean
	onRefresh?: () => void
	enableSelection?: boolean // Toggle selection on/off
	onSchemaUpdate?: (newSchema: UIComponent, operation?: string) => void // Callback for schema updates
	onNodeSelect?: (nodeId: string) => void // Callback for node selection
}

/**
 * Inner component that uses keyboard interactions
 */
const SelectableUIRendererInner: React.FC<{
	uiComponent: UIComponent
	handlers: NavigationHandler
	isStreaming?: boolean
	onRefresh?: () => void
}> = observer(({ uiComponent, handlers }) => {
	// Initialize keyboard interactions with conditional config based on editor mode
	useKeyboardInteractions({
		enabled: editorModeStore.isDev, // Disable all keyboard interactions in preview mode
		allowArrowNavigation: editorModeStore.isDev,
		allowCopyPaste: editorModeStore.isDev,
		allowDelete: editorModeStore.isDev
	})

	return (
		<div className="relative">
			{/* <SelectionControlPanel /> */}
			<UpdatedDSLRenderer
				uiComponent={uiComponent}
				handlers={handlers}
				onNavigate={handlers.navigate}
				enableSelection={editorModeStore.isDev}
			/>
		</div>
	)
})

/**
 * A wrapper around FLOWUIRenderer2 that optionally adds node selection functionality
 * Use this when you want to enable/disable selection as a modular feature
 */
const SelectableUIRenderer: React.FC<SelectableUIRendererProps> = observer(({
	uiComponent,
	handlers = {},
	isStreaming,
	onRefresh,
	enableSelection = false,
	onSchemaUpdate,
	onNodeSelect
}) => {
	// If selection is disabled, render the normal UI renderer
	if (!enableSelection) {
		return (
			<UpdatedDSLRenderer
				uiComponent={uiComponent}
				handlers={handlers}
				onNavigate={handlers.navigate}
				enableSelection={false}
			/>
		)
	}

	// If selection is enabled, wrap with NodeSelectionProvider and keyboard interactions
	return (
		<NodeSelectionProvider rootSchema={uiComponent} onSchemaUpdate={onSchemaUpdate} onNodeSelect={onNodeSelect}>
			<SelectableUIRendererInner
				uiComponent={uiComponent}
				handlers={handlers}
				isStreaming={isStreaming}
				onRefresh={onRefresh}
			/>
		</NodeSelectionProvider>
	)
})

export default SelectableUIRenderer