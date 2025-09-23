import { useCallback } from 'react'
import { useNodeSelection } from './useNodeSelection'
import { SchemaUtils } from '../../utils/schema-utilities'

interface FigmaSelectionHook {
	handleMouseEnter: (componentId: string, path: number[]) => void
	handleMouseLeave: () => void
	handleClick: (e: React.MouseEvent, componentId: string, path: number[]) => void
	handleDoubleClick: (e: React.MouseEvent, componentId: string, path: number[]) => void
	getVisualFeedbackStyles: (componentId: string, path: number[]) => {
		isHovered: boolean
		isSelected: boolean
		shouldShowOutline: boolean
		outlineStyle: string
		isParent: boolean
		parentOutlineStyle: string
	}
}

/**
 * Figma-style selection hook that implements:
 * 1. Hover shows outline on immediate parent frame
 * 2. Single click selects parent frame
 * 3. Ctrl+click selects the actual target element
 * 4. Outline-based visual feedback
 */
export const useFigmaSelection = (): FigmaSelectionHook => {
	const nodeSelection = useNodeSelection()

	/**
	 * Find common parent between two paths
	 */
	const findCommonParentDepth = useCallback((path1: number[], path2: number[]): number => {
		let depth = 0
		while (depth < path1.length && depth < path2.length && path1[depth] === path2[depth]) {
			depth++
		}
		return depth
	}, [])

	/**
	 * Get the hover target based on selection state and common parent logic
	 */
	const getHoverTarget = useCallback((componentId: string, path: number[]) => {
		const currentSelection = nodeSelection.selectedNode

		if (!currentSelection) {
			// No selection - show top-level elements only
			if (path.length === 1) {
				return { componentId, path }
			}
			// Find top-level ancestor
			const topLevelPath = [path[0]]
			const topLevelElement = SchemaUtils.findComponentByPath(nodeSelection.rootSchema!, topLevelPath)
			if (topLevelElement) {
				const topLevelId = 'render' in topLevelElement ? topLevelElement.id : topLevelElement.id
				return { componentId: topLevelId, path: topLevelPath }
			}
			return null
		}

		// Something is selected - use common parent logic
		const selectedPath = currentSelection.path
		const hoveredPath = path

		// Check if hovering on selected element
		if (currentSelection.componentId === componentId &&
			JSON.stringify(selectedPath) === JSON.stringify(hoveredPath)) {
			return { componentId, path }
		}

		// Check if hovering on direct children of selected element
		const isDirectChild = hoveredPath.length === selectedPath.length + 1 &&
			JSON.stringify(hoveredPath.slice(0, selectedPath.length)) === JSON.stringify(selectedPath)

		if (isDirectChild) {
			return { componentId, path }
		}

		// Check if hovering on any ancestor of selected element (parent, grandparent, etc.)
		const isAncestor = selectedPath.length > hoveredPath.length &&
			JSON.stringify(selectedPath.slice(0, hoveredPath.length)) === JSON.stringify(hoveredPath)

		if (isAncestor) {
			return { componentId, path }
		}

		// Find common parent and return sibling at that level
		const commonDepth = findCommonParentDepth(selectedPath, hoveredPath)
		const targetPath = hoveredPath.slice(0, commonDepth + 1)

		if (targetPath.length > 0) {
			const targetElement = SchemaUtils.findComponentByPath(nodeSelection.rootSchema!, targetPath)
			if (targetElement) {
				const targetId = 'render' in targetElement ? targetElement.id : targetElement.id
				return { componentId: targetId, path: targetPath }
			}
		}

		return null
	}, [nodeSelection, findCommonParentDepth])

	/**
	 * Handle mouse enter - show hover feedback using common parent logic
	 */
	const handleMouseEnter = useCallback((componentId: string, path: number[]) => {
		if (!nodeSelection.isSelectionEnabled) return

		const target = getHoverTarget(componentId, path)
		if (target) {
			nodeSelection.setHoveredNode(target.componentId, target.path)
		}
	}, [nodeSelection, getHoverTarget])

	/**
	 * Handle mouse leave - clear hover feedback
	 */
	const handleMouseLeave = useCallback(() => {
		nodeSelection.setHoveredNode(null)
	}, [nodeSelection])

	/**
	 * Handle click - select the hover target (what was shown on hover)
	 */
	const handleClick = useCallback((e: React.MouseEvent, componentId: string, path: number[]) => {
		if (!nodeSelection.isSelectionEnabled) return

		e.stopPropagation()
		e.preventDefault()

		// Use the same logic as hover to determine what should be selected
		const target = getHoverTarget(componentId, path)
		if (target) {
			nodeSelection.selectNode(target.componentId, target.path)
		}

		// Clear hover after selection
		nodeSelection.setHoveredNode(null)
	}, [nodeSelection, getHoverTarget])

	/**
	 * Handle double-click drilling - respects selection level
	 */
	const handleDoubleClick = useCallback((e: React.MouseEvent, componentId: string, path: number[]) => {
		if (!nodeSelection.isSelectionEnabled) return

		e.stopPropagation()
		e.preventDefault()

		const currentSelection = nodeSelection.selectedNode
		if (!currentSelection) {
			// No selection - first select the top-level element
			const target = getHoverTarget(componentId, path)
			if (target) {
				nodeSelection.selectNode(target.componentId, target.path)
			}
			return
		}

		// Check if the clicked element's parent is selected
		const parentPath = path.slice(0, -1)
		const isParentSelected = currentSelection.path.length === parentPath.length &&
			JSON.stringify(currentSelection.path) === JSON.stringify(parentPath)

		if (isParentSelected) {
			// Parent is selected - can drill down to this element
			nodeSelection.selectNode(componentId, path)
		} else {
			// Parent not selected - select the parent first (same as single click)
			const target = getHoverTarget(componentId, path)
			if (target) {
				nodeSelection.selectNode(target.componentId, target.path)
			}
		}

		// Clear hover after selection
		nodeSelection.setHoveredNode(null)
	}, [nodeSelection, getHoverTarget])


	/**
	 * Get visual feedback styles for outline-based indication
	 */
	const getVisualFeedbackStyles = useCallback((componentId: string, path: number[]) => {
		const isSelected = nodeSelection.isNodeSelected(componentId, path)
		const isHovered = nodeSelection.isNodeHovered(componentId, path)

		// Show outline if element is selected or hovered
		const shouldShowOutline = isSelected || isHovered

		// Check if this element is the parent of the selected element
		const currentSelection = nodeSelection.selectedNode
		const isParent = currentSelection &&
			currentSelection.path.length === path.length + 1 &&
			JSON.stringify(currentSelection.path.slice(0, path.length)) === JSON.stringify(path)

		let outlineStyle = ''
		let parentOutlineStyle = ''

		if (isSelected) {
			// Blue outline for selected elements
			outlineStyle = '2px solid #3b82f6'
		} else if (isHovered) {
			// Light blue outline for hovered elements
			outlineStyle = '1px solid #93c5fd'
		}

		if (isParent) {
			// Dotted outline for parent elements
			parentOutlineStyle = '1px dotted #9ca3af'
		}

		return {
			isHovered,
			isSelected,
			shouldShowOutline,
			outlineStyle,
			isParent: !!isParent,
			parentOutlineStyle
		}
	}, [nodeSelection])

	return {
		handleMouseEnter,
		handleMouseLeave,
		handleClick,
		handleDoubleClick,
		getVisualFeedbackStyles
	}
}