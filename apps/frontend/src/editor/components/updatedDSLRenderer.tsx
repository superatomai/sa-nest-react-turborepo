import React from 'react';
import { UIComponent, UIElement, UIElementSchema } from '@/types/dsl';
import { useNodeSelection } from '../hooks/useNodeSelection';
import { useFigmaSelection } from '../hooks/useFigmaSelection';
import { useOutlineStyles } from './SelectionOutline';
import { withConditionalErrorBoundary } from './DSLErrorBoundary';
import { DynamicComponent } from './ComponentRegistry';
import { SchemaUtils } from '../../utils/schema-utilities';

interface UpdatedDSLRendererProps {
    uiComponent: UIComponent;
    handlers?: Record<string, Function>;
    onNavigate?: (uiid: string, params?: Record<string, any>) => void;
    enableSelection?: boolean;
    isStreaming?: boolean;
    onRefresh?: () => void;
}

/**
 * Advanced Expression Evaluator
 * Combines safety from DSLRenderer with power from ui-renderer-2
 */
class ExpressionEvaluator {
    private createSafeContext(data: any): Record<string, any> {
        const context: Record<string, any> = {
            // Global objects and functions (safe subset)
            Math,
            Date,
            String,
            Number,
            Boolean,
            Array,
            Object,
            JSON,

            // Safe array methods
            filter: Array.prototype.filter,
            map: Array.prototype.map,
            reduce: Array.prototype.reduce,
            find: Array.prototype.find,
            some: Array.prototype.some,
            every: Array.prototype.every,
            sort: Array.prototype.sort,
            slice: Array.prototype.slice,

            // Common utilities
            parseInt,
            parseFloat,
            isNaN,
            isFinite,

            // The actual data
            data: data || {}
        };

        // Add all data properties to root context for direct access
        if (data && typeof data === 'object') {
            this.flattenDataToContext(data, context);
        }

        return context;
    }

    private flattenDataToContext(obj: any, context: Record<string, any>, prefix = ''): void {
        if (!obj || typeof obj !== 'object') return;

        for (const [key, value] of Object.entries(obj)) {
            const contextKey = prefix ? `${prefix}_${key}` : key;

            // Add to context
            context[contextKey] = value;

            // For direct access without prefix (if no conflict)
            if (!prefix && !context.hasOwnProperty(key)) {
                context[key] = value;
            }

            // Recursively flatten objects (but not arrays)
            if (value && typeof value === 'object' && !Array.isArray(value) && !this.isDateOrSpecialObject(value)) {
                this.flattenDataToContext(value, context, contextKey);
            }
        }
    }

    private isDateOrSpecialObject(obj: any): boolean {
        return obj instanceof Date ||
               obj instanceof RegExp ||
               obj instanceof Error ||
               typeof obj === 'function';
    }

    /**
     * Safely evaluate any JavaScript expression
     */
    evaluate(expression: string, data: any): any {
        if (!expression || typeof expression !== 'string') {
            return expression;
        }

        try {
            const context = this.createSafeContext(data);

            // Create parameter names and values
            const paramNames = Object.keys(context);
            const paramValues = Object.values(context);

            // Create the function and execute it
            const func = new Function(...paramNames, `
                "use strict";
                try {
                    return (${expression});
                } catch (e) {
                    console.warn('Expression evaluation error:', e.message, 'for expression:', ${JSON.stringify(expression)});
                    return undefined;
                }
            `);

            const result = func(...paramValues);
            return result;
        } catch (error) {
            console.warn('Failed to evaluate expression:', expression, error);
            return undefined;
        }
    }

    /**
     * Resolve data binding with dot notation
     */
    resolveDataPath(path: string, data: any): any {
        if (!path || !data) return undefined;

        try {
            return path.split('.').reduce((current, key) => {
                if (current === null || current === undefined) return undefined;

                // Handle array indices
                if (!isNaN(Number(key))) {
                    const index = parseInt(key, 10);
                    return Array.isArray(current) ? current[index] : current;
                }

                return current[key];
            }, data);
        } catch (error) {
            console.warn('Error resolving data path:', path, error);
            return undefined;
        }
    }
}

/**
 * Universal Data Resolver
 * Handles all types of data resolution: expressions, bindings, interpolation
 */
class DataResolver {
    private evaluator: ExpressionEvaluator;

    constructor() {
        this.evaluator = new ExpressionEvaluator();
    }

    resolveValue(value: any, localContext: Record<string, any> = {}): any {
        if (!value) return value;

        // Handle Expression objects ($exp)
        if (typeof value === 'object' && value.$exp) {
            return this.evaluator.evaluate(value.$exp, localContext);
        }

        // Handle Binding objects ($bind)
        if (typeof value === 'object' && value.$bind) {
            return this.resolveBinding(value.$bind, localContext, value.$transform);
        }

        // Handle string interpolation (support both ${} and {{}} for compatibility)
        if (typeof value === 'string' && (value.includes('${') || value.includes('{{'))) {
            return this.interpolateString(value, localContext);
        }

        return value;
    }

    private resolveBinding(path: string, context: Record<string, any>, transforms?: any[]): any {
        const pathParts = path.split('.');
        let value = context;

        for (const part of pathParts) {
            if (value && typeof value === 'object') {
                value = value[part];
            } else {
                return undefined;
            }
        }

        // Apply transforms if any (simplified implementation)
        if (transforms && Array.isArray(transforms)) {
            console.log('Transforms not fully implemented yet:', transforms);
        }

        return value;
    }

    private interpolateString(template: string, context: Record<string, any>): string {
        // Handle both ${} and {{}} syntax for flexibility
        let result = template;

        // Handle ${} syntax (preferred for JSON compatibility)
        result = result.replace(/\$\{(.*?)\}/g, (_match, expr) => {
            const trimmed = expr.trim();
            try {
                const value = this.resolveBinding(trimmed, context);
                return value !== undefined ? String(value) : '';
            } catch (e) {
                console.error('String interpolation error (${} syntax):', e);
                return '';
            }
        });

        // Handle {{}} syntax (for backward compatibility and expressions)
        result = result.replace(/\{\{(.*?)\}\}/g, (_match, expr) => {
            const trimmed = expr.trim();
            try {
                // Try as expression first, then as binding
                const value = this.evaluator.evaluate(trimmed, context);
                return value !== undefined ? String(value) : '';
            } catch (e) {
                try {
                    const value = this.resolveBinding(trimmed, context);
                    return value !== undefined ? String(value) : '';
                } catch (e2) {
                    console.error('String interpolation error ({{}} syntax):', e2);
                    return '';
                }
            }
        });

        return result;
    }

    /**
     * Get raw value for binding (used for array iteration)
     */
    getRawValue(path: string, data: any): any {
        return this.evaluator.resolveDataPath(path, data);
    }

    /**
     * Evaluate expression and return raw result
     */
    evaluateExpression(expression: string, data: any): any {
        return this.evaluator.evaluate(expression, data);
    }

    /**
     * Resolve all {{expression}} patterns in text (legacy support)
     */
    resolve(text: string, data: any): string {
        if (!text || typeof text !== 'string') {
            return String(text || '');
        }

        return this.interpolateString(text, data);
    }
}

/**
 * Extract render data from UIComponent schema
 */
const extractRenderData = (component: UIComponent) => {
    if (!component || !component.render) {
        return null;
    }

    return {
        ...component.render,
        componentId: component.id,
        componentName: component.name
    };
};


/**
 * Updated DSL Renderer
 *
 * Combines the best features from both renderers:
 * - Advanced expression evaluation from ui-renderer-2
 * - Native component support from DSLRenderer
 * - Error boundaries and schema validation
 * - Visual selection capabilities
 * - Full UIComponent schema support
 */
export const UpdatedDSLRenderer: React.FC<UpdatedDSLRendererProps> = React.memo(({
    uiComponent,
    handlers = {},
    onNavigate,
    enableSelection = false
}) => {
    const resolver = new DataResolver();

    // Use selection hook - will be null if not within NodeSelectionProvider
    let selectionHook = null;
    let figmaSelection = null;
    try {
        selectionHook = useNodeSelection();
        figmaSelection = useFigmaSelection();
    } catch {
        // Not within NodeSelectionProvider - selection disabled
        selectionHook = null;
        figmaSelection = null;
    }


    const renderElement = (
        element: UIElement | UIComponent | string,
        localContext: Record<string, any> = {},
        componentPath: number[] = []
    ): React.ReactNode => {
        // Handle primitive values
        if (typeof element === 'string') {
            return resolver.resolve(element, localContext);
        }

        if (!element || typeof element !== 'object') {
            return null;
        }

        // Handle UIComponent vs UIElement
        let elementData: UIElement;
        let componentId: string | undefined;

        if ('render' in element) {
            // This is a UIComponent
            const extracted = extractRenderData(element as UIComponent);
            if (!extracted) {
                console.warn('Invalid UIComponent - missing render property:', element);
                return null;
            }
            elementData = extracted;
            componentId = (element as UIComponent).id;
        } else {
            // This is a UIElement
            elementData = element as UIElement;
            componentId = elementData.id;
        }

        // Validate element against schema
        try {
            UIElementSchema.parse(elementData);
        } catch (error) {
            console.error('Invalid DSL element:', error);
            return null;
        }

        // Handle platform overrides (just use web for now)
        const actualElement = elementData.platform?.web ?
            { ...elementData, ...elementData.platform.web } : elementData;

        // Handle conditionals
        if (actualElement.if) {
            const condition = resolver.resolveValue(actualElement.if, localContext);
            if (!condition) {
                // Check elseIf conditions
                if (actualElement.elseIf) {
                    const elseIfCondition = resolver.resolveValue(actualElement.elseIf, localContext);
                    if (!elseIfCondition) {
                        return actualElement.else ? renderElement(actualElement.else as UIElement, localContext, componentPath) : null;
                    }
                } else {
                    return actualElement.else ? renderElement(actualElement.else as UIElement, localContext, componentPath) : null;
                }
            }
        }

        // Handle loops - render the original element as container with loop items inside
        if (actualElement.for) {
            const items = resolver.resolveValue(actualElement.for.in, localContext);
            if (Array.isArray(items)) {
                const forDef = actualElement.for;

                // Create loop items
                const loopItems = items.map((item, index) => {
                    const itemContext = {
                        ...localContext,
                        [forDef.as]: item,
                        ...(forDef.index ? { [forDef.index]: index } : {})
                    };

                    // Generate unique key for each loop item
                    let key: string;
                    if (forDef.key) {
                        if (typeof forDef.key === 'string') {
                            const resolvedKey = resolver.getRawValue(forDef.key, itemContext);
                            key = resolvedKey ? String(resolvedKey) : `${actualElement.id}-${index}`;
                        } else {
                            const resolvedKey = resolver.resolveValue(forDef.key, itemContext);
                            key = resolvedKey ? String(resolvedKey) : `${actualElement.id}-${index}`;
                        }
                    } else {
                        key = `${actualElement.id}-${index}`;
                    }

                    // Create loop element with unique ID but same structure
                    const loopElement = {
                        ...actualElement,
                        for: undefined,
                        key: undefined,
                        id: `${actualElement.id}-${index}`
                    } as UIElement;

                    const loopItemPath = [...componentPath, index];

                    return (
                        <React.Fragment key={key}>
                            {withConditionalErrorBoundary(
                                renderElement(loopElement, itemContext, loopItemPath),
                                loopElement.type,
                                `${key}-boundary`
                            )}
                        </React.Fragment>
                    );
                });

                // Create container element with original props and classes
                const containerElement = {
                    ...actualElement,
                    for: undefined,
                    // The children will be the loop items
                    children: undefined
                } as UIElement;

                // Resolve container props with original classes
                const containerProps = containerElement.props ?
                    Object.entries(containerElement.props).reduce((acc, [key, value]) => {
                        acc[key] = resolver.resolveValue(value, localContext);
                        return acc;
                    }, {} as Record<string, any>) : {};

                // Add selection functionality to container
                const elementId = componentId || containerElement.id;
                if (enableSelection && selectionHook && figmaSelection && selectionHook.isSelectionEnabled) {
                    const visualFeedback = figmaSelection.getVisualFeedbackStyles(elementId, componentPath);
                    const outlineStyles = useOutlineStyles(visualFeedback.isSelected, visualFeedback.isHovered, visualFeedback.isParent);

                    // Add data attribute for keyboard navigation
                    containerProps['data-component-id'] = elementId;

                    containerProps.style = {
                        ...containerProps.style,
                        ...outlineStyles,
                        cursor: 'pointer',
                        transition: 'outline 0.2s ease, background-color 0.2s ease'
                    };

                    const figmaClasses = [];
                    if (visualFeedback.isSelected) figmaClasses.push('figma-selected');
                    if (visualFeedback.isHovered) figmaClasses.push('figma-hovered');
                    if (visualFeedback.shouldShowOutline) figmaClasses.push('figma-outlined');

                    const existingClassName = containerProps.className || '';
                    containerProps.className = [existingClassName, ...figmaClasses].filter(Boolean).join(' ');

                    containerProps.onClick = (e: React.MouseEvent) => {
                        figmaSelection.handleClick(e, elementId, componentPath);
                    };

                    containerProps.onDoubleClick = (e: React.MouseEvent) => {
                        figmaSelection.handleDoubleClick(e, elementId, componentPath);
                    };

                    containerProps.onMouseEnter = () => {
                        figmaSelection.handleMouseEnter(elementId, componentPath);
                    };

                    containerProps.onMouseLeave = () => {
                        figmaSelection.handleMouseLeave();
                    };
                }

                // Render the container with its original type and props, containing loop items
                return React.createElement(
                    containerElement.type,
                    containerProps,
                    ...loopItems
                );
            }
        }

        // Resolve props
        const resolvedProps = actualElement.props ?
            Object.entries(actualElement.props).reduce((acc, [key, value]) => {
                acc[key] = resolver.resolveValue(value, localContext);
                return acc;
            }, {} as Record<string, any>) : {};

        // Handle event handlers
        if (resolvedProps.onClick && typeof resolvedProps.onClick === 'string') {
            const handlerName = resolvedProps.onClick;
            resolvedProps.onClick = handlers[handlerName] || (() => {
                console.warn(`Missing handler: ${handlerName}`);
            });
        }

        // Handle link-to property - add click/tap handler for navigation
        if (actualElement['link-to'] && onNavigate) {
            const linkToValue = resolver.resolveValue(actualElement['link-to'], localContext);
            if (linkToValue) {
                const existingOnClick = resolvedProps.onClick;

                const handleNavigation = (e: React.MouseEvent | React.TouchEvent) => {
                    e.preventDefault();
                    e.stopPropagation();

                    // Call existing handlers first
                    if (existingOnClick && e.type === 'click') {
                        existingOnClick(e);
                    }

                    // Handle different link-to formats
                    let targetUI: string;
                    let params: Record<string, any> | undefined;

                    if (typeof linkToValue === 'string') {
                        targetUI = linkToValue;
                    } else if (linkToValue && typeof linkToValue === 'object' && linkToValue.ui) {
                        targetUI = resolver.resolveValue(linkToValue.ui, localContext);

                        if (linkToValue.params) {
                            params = {};
                            for (const [key, value] of Object.entries(linkToValue.params)) {
                                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                                    params[key] = {};
                                    for (const [nestedKey, nestedValue] of Object.entries(value)) {
                                        params[key][nestedKey] = resolver.resolveValue(nestedValue, localContext);
                                    }
                                } else {
                                    params[key] = resolver.resolveValue(value, localContext);
                                }
                            }
                        }
                    } else {
                        targetUI = String(linkToValue);
                    }

                    if (process.env.NODE_ENV === 'development') {
                        console.log('Navigation triggered:', { targetUI, params, localContext });
                    }

                    onNavigate(targetUI, params);
                };

                resolvedProps.onClick = handleNavigation;
                resolvedProps.onTouchEnd = handleNavigation;

                // Add cursor pointer for better UX
                resolvedProps.style = {
                    ...resolvedProps.style,
                    cursor: 'pointer',
                    userSelect: 'none' as const,
                    WebkitUserSelect: 'none' as const,
                    WebkitTouchCallout: 'none' as const
                };
            }
        }

        // Add Figma-style selection functionality if enabled
        if (enableSelection && selectionHook && figmaSelection && selectionHook.isSelectionEnabled) {
            const elementId = componentId || actualElement.id;

            // Get Figma-style visual feedback for ALL elements (hover will determine what's selectable)
            const visualFeedback = figmaSelection.getVisualFeedbackStyles(elementId, componentPath);

            // Apply outline-based styles instead of rings
            const outlineStyles = useOutlineStyles(visualFeedback.isSelected, visualFeedback.isHovered, visualFeedback.isParent);

            // Add data attribute for keyboard navigation
            resolvedProps['data-component-id'] = elementId;

            // Merge styles
            resolvedProps.style = {
                ...resolvedProps.style,
                ...outlineStyles,
                cursor: 'pointer',
                transition: 'outline 0.2s ease, background-color 0.2s ease'
            };

            // Add Figma-style CSS classes
            const existingClassName = resolvedProps.className || '';
            const figmaClasses = [];
            if (visualFeedback.isSelected) figmaClasses.push('figma-selected');
            if (visualFeedback.isHovered) figmaClasses.push('figma-hovered');
            if (visualFeedback.shouldShowOutline) figmaClasses.push('figma-outlined');

            resolvedProps.className = [existingClassName, ...figmaClasses].filter(Boolean).join(' ');

            // Add Figma-style event handlers for ALL elements
            const originalOnClick = resolvedProps.onClick;
            resolvedProps.onClick = (e: React.MouseEvent) => {
                // Handle original click if it exists (but don't stop propagation)
                if (originalOnClick && typeof originalOnClick === 'function') {
                    originalOnClick(e);
                }

                // Handle Figma-style selection (works for any element)
                figmaSelection.handleClick(e, elementId, componentPath);
            };

            // Add double-click handler using unified Figma logic
            resolvedProps.onDoubleClick = (e: React.MouseEvent) => {
                figmaSelection.handleDoubleClick(e, elementId, componentPath);
            };

            // Add Figma-style hover handlers for ALL elements
            resolvedProps.onMouseEnter = () => {
                figmaSelection.handleMouseEnter(elementId, componentPath);
            };

            resolvedProps.onMouseLeave = () => {
                figmaSelection.handleMouseLeave();
            };
        }

        // Resolve key for React element
        const resolvedKey = resolver.resolveValue(actualElement.key, localContext);

        const renderChildren = (): React.ReactNode => {
            if (!actualElement.children) return null;

            // Handle different children types
            if (typeof actualElement.children === 'string') {
                return resolver.resolveValue(actualElement.children, localContext);
            }

            // Handle Expression/Binding children
            if (typeof actualElement.children === 'object' && actualElement.children &&
                ('$exp' in actualElement.children || '$bind' in actualElement.children)) {
                const value = resolver.resolveValue(actualElement.children, localContext);
                return value !== undefined ? String(value) : null;
            }

            if (Array.isArray(actualElement.children)) {
                return actualElement.children.map((child: any, index: number) => {
                    if (typeof child === 'string') {
                        return resolver.resolveValue(child, localContext);
                    }
                    if (typeof child === 'object' && child && ('$exp' in child || '$bind' in child)) {
                        const value = resolver.resolveValue(child, localContext);
                        return value !== undefined ? String(value) : null;
                    }
                    return <React.Fragment key={index}>{renderElement(child as UIElement, localContext, [...componentPath, index])}</React.Fragment>;
                }).filter(Boolean);
            }

            return renderElement(actualElement.children as UIElement, localContext, [...componentPath, 0]);
        };

        // Check for dynamic components first
        if (actualElement.type.startsWith('COMP_')) {
            return withConditionalErrorBoundary(
                <DynamicComponent
                    key={resolvedKey}
                    type={actualElement.type}
                    props={resolvedProps}
                >
                    {renderChildren()}
                </DynamicComponent>,
                actualElement.type,
                resolvedKey,
                true // Force wrap all COMP_ components with error boundaries
            );
        }

        // Handle standard HTML elements
        switch (actualElement.type.toLowerCase()) {
            case 'view':
            case 'div':
                return <div key={resolvedKey} {...resolvedProps}>{renderChildren()}</div>;

            case 'text':
            case 'span':
                return <span key={resolvedKey} {...resolvedProps}>{renderChildren()}</span>;

            case 'button':
                return <button key={resolvedKey} {...resolvedProps}>{renderChildren()}</button>;

            case 'input':
                return <input key={resolvedKey} {...resolvedProps} />;

            case 'select':
                return <select key={resolvedKey} {...resolvedProps}>{renderChildren()}</select>;

            case 'option':
                return <option key={resolvedKey} {...resolvedProps}>{renderChildren()}</option>;

            case 'h1':
                return <h1 key={resolvedKey} {...resolvedProps}>{renderChildren()}</h1>;

            case 'h2':
                return <h2 key={resolvedKey} {...resolvedProps}>{renderChildren()}</h2>;

            case 'h3':
                return <h3 key={resolvedKey} {...resolvedProps}>{renderChildren()}</h3>;

            case 'p':
                return <p key={resolvedKey} {...resolvedProps}>{renderChildren()}</p>;

            case 'ul':
                return <ul key={resolvedKey} {...resolvedProps}>{renderChildren()}</ul>;

            case 'li':
                return <li key={resolvedKey} {...resolvedProps}>{renderChildren()}</li>;

            case 'img':
                return <img key={resolvedKey} {...resolvedProps} alt={resolvedProps.alt || ''} />;

            case 'a':
                return <a key={resolvedKey} {...resolvedProps}>{renderChildren()}</a>;

            case 'header':
                return <header key={resolvedKey} {...resolvedProps}>{renderChildren()}</header>;

            case 'section':
                return <section key={resolvedKey} {...resolvedProps}>{renderChildren()}</section>;

            case 'footer':
                return <footer key={resolvedKey} {...resolvedProps}>{renderChildren()}</footer>;

            case 'table':
                return <table key={resolvedKey} {...resolvedProps}>{renderChildren()}</table>;

            case 'thead':
                return <thead key={resolvedKey} {...resolvedProps}>{renderChildren()}</thead>;

            case 'tbody':
                return <tbody key={resolvedKey} {...resolvedProps}>{renderChildren()}</tbody>;

            case 'tr':
                return <tr key={resolvedKey} {...resolvedProps}>{renderChildren()}</tr>;

            case 'th':
                return <th key={resolvedKey} {...resolvedProps}>{renderChildren()}</th>;

            case 'td':
                return <td key={resolvedKey} {...resolvedProps}>{renderChildren()}</td>;

            default:
                console.warn(`Unknown element type: ${actualElement.type}`);
                return <div key={resolvedKey} {...resolvedProps}>{renderChildren()}</div>;
        }
    };

    if (!uiComponent) {
        return (
            <div className="p-4 text-gray-500 text-center">
                <div className="text-lg font-medium">No UIComponent Provided</div>
                <div className="text-sm mt-1">Please provide a valid UIComponent to render</div>
            </div>
        );
    }

    // Extract the full context (component data + any additional context)
    const fullContext = {
        ...uiComponent.data || {},
        states: uiComponent.states || {},
        props: uiComponent.props || {}
    };

    // Wrap the entire DSL tree with error boundary for top-level errors
    return (
        <div className="updated-dsl-renderer">
            {withConditionalErrorBoundary(
                renderElement(uiComponent, fullContext, []),
                'UIComponent',
                uiComponent.id,
                true // Force wrap root element
            )}
        </div>
    );
});

// Re-export for convenience
export { validateDSL } from '@/types/dsl';

export default UpdatedDSLRenderer;