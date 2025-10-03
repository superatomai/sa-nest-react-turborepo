import { useOutlineStyles } from '../SelectionOutline';

/**
 * Apply Figma-style selection props to an element
 */
export function applySelectionProps(
    resolvedProps: Record<string, any>,
    elementId: string,
    componentPath: number[],
    figmaSelection: any,
    visualFeedback: any
) {
    const outlineStyles = useOutlineStyles(
        visualFeedback.isSelected,
        visualFeedback.isHovered,
        visualFeedback.isParent
    );

    // Add data attributes
    resolvedProps['data-component-id'] = elementId;
    resolvedProps['data-component-path'] = JSON.stringify(componentPath);

    // Merge styles
    resolvedProps.style = {
        ...resolvedProps.style,
        ...outlineStyles,
        transition: 'outline 0.2s ease, background-color 0.2s ease'
    };

    // Add CSS classes
    const existingClassName = resolvedProps.className || '';
    const figmaClasses = [];
    if (visualFeedback.isSelected) figmaClasses.push('figma-selected');
    if (visualFeedback.isHovered) figmaClasses.push('figma-hovered');
    if (visualFeedback.shouldShowOutline) figmaClasses.push('figma-outlined');
    resolvedProps.className = [existingClassName, ...figmaClasses].filter(Boolean).join(' ');

    // Add event handlers
    const originalOnClick = resolvedProps.onClick;
    resolvedProps.onClick = (e: React.MouseEvent) => {
        if (originalOnClick && typeof originalOnClick === 'function') {
            originalOnClick(e);
        }
        figmaSelection.handleClick(e, elementId, componentPath);
    };

    resolvedProps.onDoubleClick = (e: React.MouseEvent) => {
        figmaSelection.handleDoubleClick(e, elementId, componentPath);
    };
}
