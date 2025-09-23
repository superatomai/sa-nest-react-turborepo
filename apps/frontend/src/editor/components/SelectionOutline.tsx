import React from 'react'

interface SelectionOutlineProps {
	isSelected: boolean
	isHovered: boolean
	shouldShowOutline: boolean
	outlineStyle: string
	children: React.ReactNode
	className?: string
	style?: React.CSSProperties
}

/**
 * Component that wraps elements to provide Figma-style outline selection feedback
 * Uses outline instead of border to avoid affecting layout
 */
export const SelectionOutline: React.FC<SelectionOutlineProps> = ({
	isSelected,
	isHovered,
	shouldShowOutline,
	outlineStyle,
	children,
	className = '',
	style = {}
}) => {
	const selectionStyles: React.CSSProperties = {
		...style,
		position: 'relative'
	}

	if (shouldShowOutline) {
		selectionStyles.outline = outlineStyle
		selectionStyles.outlineOffset = '0px'
		// No background colors - just outlines for clean visual feedback
	}

	// Add selection-related CSS classes
	const selectionClasses = []
	if (isSelected) {
		selectionClasses.push('figma-selected')
	}
	if (isHovered) {
		selectionClasses.push('figma-hovered')
	}
	if (shouldShowOutline) {
		selectionClasses.push('figma-outlined')
	}

	const combinedClassName = [className, ...selectionClasses].filter(Boolean).join(' ')

	return (
		<div
			className={combinedClassName}
			style={selectionStyles}
		>
			{children}
		</div>
	)
}

/**
 * Hook to get outline styles for inline application
 */
export const useOutlineStyles = (isSelected: boolean, isHovered: boolean, isParent?: boolean) => {
	if (isSelected) {
		return {
			outline: '2px solid #3b82f6',
			outlineOffset: '0px'
			// No background color - just thicker outline for selection
		}
	}

	if (isHovered) {
		return {
			outline: '1px solid #93c5fd',
			outlineOffset: '0px'
			// No background color on hover - just outline
		}
	}

	if (isParent) {
		return {
			outline: '1px dotted #9ca3af',
			outlineOffset: '0px'
			// Dotted outline for parent elements
		}
	}

	return {}
}