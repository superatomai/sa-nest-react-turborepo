import React from 'react';
import { UIComponent, UIElement, UIElementSchema, Expression } from '@/types/dsl';
import { useNodeSelection } from '../hooks/useNodeSelection';
import { withConditionalErrorBoundary } from './DSLErrorBoundary';
import { DynamicComponent } from './ComponentRegistry';

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
    try {
        selectionHook = useNodeSelection();
    } catch {
        // Not within NodeSelectionProvider - selection disabled
        selectionHook = null;
    }


    const renderElement = (
        element: UIElement | UIComponent | string,
        localContext: Record<string, any> = {},
        componentPath: number[] = [],
        isWithinForLoop: boolean = false
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
                        return actualElement.else ? renderElement(actualElement.else as UIElement, localContext, componentPath, isWithinForLoop) : null;
                    }
                } else {
                    return actualElement.else ? renderElement(actualElement.else as UIElement, localContext, componentPath, isWithinForLoop) : null;
                }
            }
        }

        // Handle loops
        if (actualElement.for) {
            const items = resolver.resolveValue(actualElement.for.in, localContext);
            if (Array.isArray(items)) {
                return items.map((item, index) => {
                    const itemContext = {
                        ...localContext,
                        [actualElement.for!.as]: item,
                        ...(actualElement.for!.index ? { [actualElement.for!.index]: index } : {})
                    };

                    // Generate unique key for each loop item
                    let key: string;
                    if (actualElement.for!.key) {
                        // Handle key as a binding path (e.g., 'user.id')
                        if (typeof actualElement.for!.key === 'string') {
                            const resolvedKey = resolver.getRawValue(actualElement.for!.key, itemContext);
                            key = resolvedKey ? String(resolvedKey) : `${actualElement.id}-${index}`;
                        } else {
                            // Handle key as expression/binding object
                            const resolvedKey = resolver.resolveValue(actualElement.for!.key, itemContext);
                            key = resolvedKey ? String(resolvedKey) : `${actualElement.id}-${index}`;
                        }
                    } else if (actualElement.key) {
                        const resolvedKey = resolver.resolveValue(actualElement.key, itemContext);
                        key = resolvedKey ? String(resolvedKey) : `${actualElement.id}-${index}`;
                    } else {
                        // Fallback to element ID + index
                        key = `${actualElement.id}-${index}`;
                    }

                    const loopElement = {
                        ...actualElement,
                        for: undefined,
                        key: undefined,
                        // Create unique ID for each loop item
                        id: `${actualElement.id}-${index}`
                    } as UIElement;

                    // Create unique component path for each loop item
                    const loopItemPath = [...componentPath, index];

                    return (
                        <React.Fragment key={key}>
                            {withConditionalErrorBoundary(
                                renderElement(loopElement, itemContext, loopItemPath, true),
                                loopElement.type,
                                `${key}-boundary`
                            )}
                        </React.Fragment>
                    );
                });
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

        // Add selection functionality if enabled
        if (enableSelection && selectionHook && selectionHook.isSelectionEnabled) {
            let isSelectable = selectionHook.isNodeSelectable(componentPath);
            const isSelected = selectionHook.isNodeSelected(componentId || actualElement.id, componentPath);
            const isHovered = selectionHook.isNodeHovered(componentId || actualElement.id, componentPath);

            // Special handling for for loop generated items
            if (isWithinForLoop) {
                // Elements within for loops should be selectable regardless of selection level
                isSelectable = true;
            }


            if (isSelectable) {
                // Add selection styles
                let selectionStyles = 'relative transition-all duration-200 ';

                if (isSelected) {
                    selectionStyles += 'ring-2 ring-blue-500 ring-offset-2 bg-blue-50/50 ';
                } else if (isHovered) {
                    selectionStyles += 'ring-2 ring-blue-300 ring-offset-1 bg-blue-50/30 ';
                } else {
                    selectionStyles += 'hover:ring-2 hover:ring-blue-200 hover:ring-offset-1 hover:bg-blue-50/20 ';
                }

                selectionStyles += 'cursor-pointer ';

                // Merge with existing className
                const existingClassName = resolvedProps.className || '';
                resolvedProps.className = `${existingClassName} ${selectionStyles}`.trim();

                // Add selection event handlers
                const originalOnClick = resolvedProps.onClick;

                resolvedProps.onClick = (e: React.MouseEvent) => {
                    e.stopPropagation();

                    // Handle original click if it exists
                    if (originalOnClick && typeof originalOnClick === 'function') {
                        originalOnClick(e);
                    }

                    // Handle selection
                    selectionHook.selectNode(componentId || actualElement.id, componentPath);
                };

                // Add double-click handler for navigation
                resolvedProps.onDoubleClick = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (isSelected) {
                        selectionHook.navigateToChildren();
                    }
                };

                // Add hover handlers
                resolvedProps.onMouseEnter = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    selectionHook.setHoveredNode(componentId || actualElement.id, componentPath);
                };

                resolvedProps.onMouseLeave = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    selectionHook.setHoveredNode(null);
                };

                // Add selection indicator with positioning
                if (isSelected || isHovered) {
                    resolvedProps.style = {
                        ...resolvedProps.style,
                        position: 'relative'
                    };
                }
            }
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
                    return <React.Fragment key={index}>{renderElement(child as UIElement, localContext, [...componentPath, index], isWithinForLoop)}</React.Fragment>;
                }).filter(Boolean);
            }

            return renderElement(actualElement.children as UIElement, localContext, [...componentPath, 0], isWithinForLoop);
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
                renderElement(uiComponent, fullContext, [], false),
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