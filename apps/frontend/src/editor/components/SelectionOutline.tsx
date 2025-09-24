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
	// Prevent outline flickering by adding smooth transitions
	const prevShouldShowOutline = React.useRef(shouldShowOutline)
	React.useEffect(() => {
		prevShouldShowOutline.current = shouldShowOutline
	}, [shouldShowOutline])

	const selectionStyles: React.CSSProperties = {
		...style,
		position: 'relative',
		// Always set outline properties to prevent flickering
		outline: shouldShowOutline ? outlineStyle : 'none',
		outlineOffset: '0px',
		// Use will-change to optimize for frequent outline changes
		willChange: shouldShowOutline || prevShouldShowOutline.current ? 'outline' : 'auto',
		// Smooth transition for outline changes
		transition: 'outline 150ms ease-out'
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
	const baseStyles = {
		outlineOffset: '0px',
		willChange: (isSelected || isHovered || isParent) ? 'outline' : 'auto',
		transition: 'outline 150ms ease-out'
	}

	if (isSelected) {
		return {
			...baseStyles,
			outline: '2px solid #3b82f6'
		}
	}

	if (isHovered) {
		return {
			...baseStyles,
			outline: '1px solid #93c5fd'
		}
	}

	if (isParent) {
		return {
			...baseStyles,
			outline: '1px dotted #9ca3af'
		}
	}

	return {
		...baseStyles,
		outline: 'none'
	}
}