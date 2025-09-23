import { useCallback, useEffect, useState } from 'react'
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
 * 1. Hover shows outline based on selection hierarchy
 * 2. Single click selects hierarchical target (common parent logic)
 * 3. Ctrl+click selects the exact element under cursor (bypasses hierarchy)
 * 4. Double-click drills into children when parent is selected
 * 5. Outline-based visual feedback with dotted parent outlines
 */
export const useFigmaSelection = (): FigmaSelectionHook => {
	const nodeSelection = useNodeSelection()
	const [isCtrlPressed, setIsCtrlPressed] = useState(false)

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
	 * When Ctrl is pressed, show direct hover on the exact element
	 */
	const handleMouseEnter = useCallback((componentId: string, path: number[]) => {
		if (!nodeSelection.isSelectionEnabled) return

		if (isCtrlPressed) {
			// Direct hover when Ctrl is pressed
			nodeSelection.setHoveredNode(componentId, path)
		} else {
			// Use hierarchical logic when Ctrl is not pressed
			const target = getHoverTarget(componentId, path)
			if (target) {
				nodeSelection.setHoveredNode(target.componentId, target.path)
			}
		}
	}, [nodeSelection, getHoverTarget, isCtrlPressed])

	/**
	 * Handle mouse leave - clear hover feedback
	 */
	const handleMouseLeave = useCallback(() => {
		nodeSelection.setHoveredNode(null)
	}, [nodeSelection])

	/**
	 * Handle click - select the hover target (what was shown on hover)
	 * Ctrl+click allows direct selection bypassing hierarchy
	 */
	const handleClick = useCallback((e: React.MouseEvent, componentId: string, path: number[]) => {
		if (!nodeSelection.isSelectionEnabled) return

		e.stopPropagation()
		e.preventDefault()

		// Check for Ctrl+click (or Cmd+click on Mac)
		if (e.ctrlKey || e.metaKey) {
			// Direct selection - bypass hierarchy logic
			nodeSelection.selectNode(componentId, path)
		} else {
			// Use the same logic as hover to determine what should be selected
			const target = getHoverTarget(componentId, path)
			if (target) {
				nodeSelection.selectNode(target.componentId, target.path)
			}
		}

		// Clear hover after selection
		nodeSelection.setHoveredNode(null)
	}, [nodeSelection, getHoverTarget])

	/**
	 * Handle double-click with conditional behavior:
	 * - Both inside and outside: drill down maximum 1 level from selected toward cursor
	 * - Never drills more than 1 level regardless of how deep the clicked element is
	 * This provides consistent and controlled drilling navigation
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

		// Check if the double-clicked element is actually inside the currently selected element
		// This means the clicked path should start with the selected path (be a true descendant)
		const isActuallyInside = path.length > currentSelection.path.length &&
			JSON.stringify(path.slice(0, currentSelection.path.length)) === JSON.stringify(currentSelection.path)

		// Check if they share a common parent (but clicked element is not necessarily inside selected)
		const commonDepth = findCommonParentDepth(currentSelection.path, path)
		const hasCommonParent = commonDepth > 0

		const isInsideSelected = isActuallyInside

		if (isInsideSelected) {
			// Inside selected element: drill down maximum 1 level toward cursor
			const maxLevelsAvailable = path.length - currentSelection.path.length
			const levelsToGo = Math.min(1, maxLevelsAvailable)

			console.log('Inside selection, drilling down:', {
				from: currentSelection.path,
				toward: path,
				maxLevelsAvailable,
				levelsToGo
			})

			if (levelsToGo > 0) {
				// Build target path by going down the specified number of levels
				const targetPath = [...currentSelection.path]
				for (let i = 0; i < levelsToGo; i++) {
					const nextIndex = currentSelection.path.length + i
					if (nextIndex < path.length) {
						targetPath.push(path[nextIndex])
					}
				}

				console.log('Inside target path calculated:', { targetPath })

				if (nodeSelection.rootSchema) {
					const targetElement = SchemaUtils.findComponentByPath(nodeSelection.rootSchema, targetPath)
					if (targetElement) {
						const targetId = 'render' in targetElement ? targetElement.id : targetElement.id
						console.log('Selecting inside target:', { targetId, targetPath })
						nodeSelection.selectNode(targetId, targetPath)
						return
					} else {
						console.log('Could not find inside target at path:', targetPath)
					}
				}
			}
		} else {
			// Outside selected element: drill down from selected toward clicked element
			// But check if we have enough levels to drill down
			const maxLevelsAvailable = path.length - currentSelection.path.length
			const levelsToGo = Math.min(1, maxLevelsAvailable)

			console.log('Outside selection, drilling down:', {
				from: currentSelection.path,
				toward: path,
				maxLevelsAvailable,
				levelsToGo
			})

			if (levelsToGo > 0) {
				// Build target path by going down the specified number of levels
				const targetPath = [...currentSelection.path]
				for (let i = 0; i < levelsToGo; i++) {
					const nextIndex = currentSelection.path.length + i
					if (nextIndex < path.length) {
						targetPath.push(path[nextIndex])
					}
				}

				console.log('Target path calculated:', { targetPath })

				if (targetPath.length > currentSelection.path.length && nodeSelection.rootSchema) {
					const targetElement = SchemaUtils.findComponentByPath(nodeSelection.rootSchema, targetPath)
					if (targetElement) {
						const targetId = 'render' in targetElement ? targetElement.id : targetElement.id
						console.log('Selecting target:', { targetId, targetPath })
						nodeSelection.selectNode(targetId, targetPath)
						return
					} else {
						console.log('Could not find element at target path:', targetPath)
					}
				}
			} else {
				console.log('Cannot drill down, clicked element is at same level or higher')
			}
		}

		// Fallback: if we can't find the parent element, use single-click logic
		const target = getHoverTarget(componentId, path)
		if (target) {
			nodeSelection.selectNode(target.componentId, target.path)
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

	// Track Ctrl key state and set up event delegation on UI root
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.ctrlKey || e.metaKey) {
				setIsCtrlPressed(true)
			}
		}

		const handleKeyUp = (e: KeyboardEvent) => {
			if (!e.ctrlKey && !e.metaKey) {
				setIsCtrlPressed(false)
			}
		}

		// Event delegation for hover - single listener on UI root element
		const handleMouseOver = (e: MouseEvent) => {
			if (!nodeSelection.isSelectionEnabled) return

			const target = e.target as Element
			const componentElement = target.closest('[data-component-id]')

			if (componentElement) {
				const componentId = componentElement.getAttribute('data-component-id')
				const pathStr = componentElement.getAttribute('data-component-path')

				if (componentId && pathStr) {
					try {
						const path = JSON.parse(pathStr)
						if (isCtrlPressed) {
							// Direct hover when Ctrl is pressed
							nodeSelection.setHoveredNode(componentId, path)
						} else {
							// Use hierarchical logic when Ctrl is not pressed
							const target = getHoverTarget(componentId, path)
							if (target) {
								nodeSelection.setHoveredNode(target.componentId, target.path)
							}
						}
					} catch (error) {
						// Invalid path JSON, ignore
					}
				}
			}
		}

		const handleMouseOut = (e: MouseEvent) => {
			if (!nodeSelection.isSelectionEnabled) return

			const target = e.target as Element
			const relatedTarget = e.relatedTarget as Element

			// Only clear hover if we're not moving to another component element
			const currentComponent = target.closest('[data-component-id]')
			const nextComponent = relatedTarget?.closest('[data-component-id]')

			if (currentComponent && currentComponent !== nextComponent) {
				nodeSelection.setHoveredNode(null)
			}
		}

		// Find the UI root element and attach listeners only to it
		const uiRoot = document.querySelector('.updated-dsl-renderer')

		window.addEventListener('keydown', handleKeyDown)
		window.addEventListener('keyup', handleKeyUp)

		if (uiRoot) {
			uiRoot.addEventListener('mouseover', handleMouseOver, true)
			uiRoot.addEventListener('mouseout', handleMouseOut, true)
		}

		return () => {
			window.removeEventListener('keydown', handleKeyDown)
			window.removeEventListener('keyup', handleKeyUp)

			if (uiRoot) {
				uiRoot.removeEventListener('mouseover', handleMouseOver, true)
				uiRoot.removeEventListener('mouseout', handleMouseOut, true)
			}
		}
	}, [nodeSelection, isCtrlPressed, getHoverTarget])

	return {
		handleMouseEnter,
		handleMouseLeave,
		handleClick,
		handleDoubleClick,
		getVisualFeedbackStyles
	}
}