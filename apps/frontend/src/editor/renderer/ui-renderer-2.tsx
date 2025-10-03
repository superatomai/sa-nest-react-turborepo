import React from 'react'
import { useNodeSelection } from '../hooks/useNodeSelection'
import { UIComponent, UIElement, Expression, Binding } from '../../types/dsl'

interface UIRendererProps {
    uiComponent: UIComponent // Pass entire UIComponent (includes data and render)
    handlers?: Record<string, Function>
    isStreaming?: boolean
    onRefresh?: () => void
    enableSelection?: boolean
}

/**
 * Universal Expression Evaluator
 * Handles all types of JavaScript expressions safely
 */
class ExpressionEvaluator {
    private createSafeContext(data: any): Record<string, any> {
        const context: Record<string, any> = {
            // Global objects and functions
            Math,
            Date,
            String,
            Number,
            Boolean,
            Array,
            Object,
            JSON,
            console,
            
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
        }

        // Add all data properties to root context for direct access
        if (data && typeof data === 'object') {
            this.flattenDataToContext(data, context)
        }

        return context
    }

    private flattenDataToContext(obj: any, context: Record<string, any>, prefix = ''): void {
        if (!obj || typeof obj !== 'object') return

        for (const [key, value] of Object.entries(obj)) {
            const contextKey = prefix ? `${prefix}_${key}` : key
            
            // Add to context
            context[contextKey] = value
            
            // For direct access without prefix (if no conflict)
            if (!prefix && !context.hasOwnProperty(key)) {
                context[key] = value
            }

            // Recursively flatten objects (but not arrays)
            if (value && typeof value === 'object' && !Array.isArray(value) && !this.isDateOrSpecialObject(value)) {
                this.flattenDataToContext(value, context, contextKey)
            }
        }
    }

    private isDateOrSpecialObject(obj: any): boolean {
        return obj instanceof Date || 
               obj instanceof RegExp || 
               obj instanceof Error ||
               typeof obj === 'function'
    }

    /**
     * Safely evaluate any JavaScript expression
     */
    evaluate(expression: string, data: any): any {
        if (!expression || typeof expression !== 'string') {
            return expression
        }

        try {
            const context = this.createSafeContext(data)
            
            // Create parameter names and values
            const paramNames = Object.keys(context)
            const paramValues = Object.values(context)
            
            // Create the function and execute it
            const func = new Function(...paramNames, `
                "use strict";
                try {
                    return (${expression});
                } catch (e) {
                    console.warn('Expression evaluation error:', e.message, 'for expression:', ${JSON.stringify(expression)});
                    return undefined;
                }
            `)
            
            const result = func(...paramValues)
            return result
        } catch (error) {
            console.warn('Failed to evaluate expression:', expression, error)
            return undefined
        }
    }

    /**
     * Resolve data binding with dot notation
     */
    resolveDataPath(path: string, data: any): any {
        if (!path || !data) return undefined

        try {
            return path.split('.').reduce((current, key) => {
                if (current === null || current === undefined) return undefined
                
                // Handle array indices
                if (!isNaN(Number(key))) {
                    const index = parseInt(key, 10)
                    return Array.isArray(current) ? current[index] : current
                }
                
                return current[key]
            }, data)
        } catch (error) {
            console.warn('Error resolving data path:', path, error)
            return undefined
        }
    }
}

/**
 * Universal Data Binding Resolver
 * Handles {{expression}} patterns in strings
 */
class DataBindingResolver {
    private evaluator: ExpressionEvaluator

    constructor() {
        this.evaluator = new ExpressionEvaluator()
    }

    /**
     * Resolve all {{expression}} patterns in text
     */
    resolve(text: string, data: any): string {
        if (!text || typeof text !== 'string') {
            return String(text || '')
        }

        const bindingPattern = /\{\{([^}]+)\}\}/g
        
        return text.replace(bindingPattern, (match, expression) => {
            try {
                const result = this.evaluator.evaluate(expression.trim(), data)
                return result !== undefined && result !== null ? String(result) : ''
            } catch (error) {
                console.warn('Binding resolution failed:', match, error)
                return match // Return original if resolution fails
            }
        })
    }

    /**
     * Get raw value for binding (used for array iteration)
     */
    getRawValue(path: string, data: any): any {
        return this.evaluator.resolveDataPath(path, data)
    }

    /**
     * Evaluate expression and return raw result
     */
    evaluateExpression(expression: string, data: any): any {
        return this.evaluator.evaluate(expression, data)
    }
}

/**
 * Extract render data from new UIComponent schema
 */
const extractRenderData = (component: UIComponent) => {
    if (!component || !component.render) {
        return null
    }

    return {
        ...component.render,
        componentId: component.id, // Preserve the main component ID
        componentName: component.name // Preserve component name if exists
    }
}

/**
 * Evaluate conditional expressions (if/elseIf)
 */
const evaluateCondition = (condition: Expression | Binding |  undefined, data: any, bindingResolver: DataBindingResolver): boolean => {
    if (!condition) return true

    if (typeof condition === 'object' && '$exp' in condition) {
        const result = bindingResolver.evaluateExpression(condition.$exp, data)
        return Boolean(result)
    }

    return true
}

/**
 * Normalize children to array format for consistent processing
 */
const normalizeChildren = (children: any): Array<UIElement | string> => {
    if (!children) return []

    if (typeof children === 'string') {
        return [children]
    }

    if (Array.isArray(children)) {
        return children
    }

    if (typeof children === 'object') {
        return [children as UIElement]
    }

    return []
}

/**
 * Universal UI Renderer (FLOWUIRenderer2)
 *
 * Renders UIComponent schema with dynamic expressions and data binding.
 * Only supports the new DSL schema format from dsl.ts.
 *
 * Schema Format (UIComponent):
 * {
 *   id: "component_id",
 *   name: "ComponentName",
 *   render: {
 *     id: "render_id",
 *     type: "div",
 *     props: { className: "..." },
 *     children: [...], // Flexible - can be string, array, or object
 *     for: {
 *       in: "items",     // Data path to iterate over
 *       as: "item",      // Variable name for each item
 *       index: "i",      // Optional index variable
 *       key: "{{item.id}}" // Optional custom key expression
 *     },
 *     if: { $exp: "condition" },     // Conditional rendering
 *     elseIf: { $exp: "condition" }, // Else if condition
 *     else: { ... },                 // Else element
 *     "link-to": "target_ui"         // Navigation target
 *   }
 * }
 *
 * Important: This renderer only handles UI rendering based on the data prop.
 * Query properties in the schema are for API data fetching and are handled
 * elsewhere - not by this renderer.
 *
 * Features:
 * - Data binding with {{expression}} syntax in strings
 * - Array iteration with 'for' directive (supports custom keys)
 * - Conditional rendering with if/elseIf/else
 * - Navigation with link-to directive
 * - Event handler mapping
 * - Selection/editing capabilities when enableSelection=true
 * - Safe expression evaluation with context variables
 * - Flexible children handling (string, array, object)
 */
const FLOWUIRenderer2 = ({
    uiComponent,
    handlers = {},
    enableSelection = false
}: UIRendererProps) => {
    const bindingResolver = new DataBindingResolver()

    // Use selection hook - will be null if not within NodeSelectionProvider
    let selectionHook = null
    try {
        selectionHook = useNodeSelection()
    } catch {
        // Not within NodeSelectionProvider - selection disabled
        selectionHook = null
    }

    const renderComponent = (
        component: UIComponent | UIElement | string,
        contextData: any = uiComponent.data || {},
        key?: number | string,
        iterationPath: string[] = [],
        componentPath: number[] = []
    ): React.ReactNode => {
        // Handle primitive values
        if (typeof component === 'string') {
            return bindingResolver.resolve(component, contextData)
        }

        if (!component || typeof component !== 'object') {
            return null
        }

        // Handle UIComponent vs UIElement
        let elementData: UIElement
        let componentId: string | undefined

        if ('render' in component) {
            // This is a UIComponent
            const extracted = extractRenderData(component as UIComponent)
            if (!extracted) {
                console.warn('Invalid UIComponent - missing render property:', component)
                return null
            }
            elementData = extracted
            componentId = (component as UIComponent).id
        } else {
            // This is a UIElement
            elementData = component as UIElement
            componentId = elementData.id
        }

        const {
            id: renderId,
            type,
            props = {},
            children,
            for: forDirective,
            if: ifCondition,
            elseIf: elseIfCondition,
            else: elseElement,
            'link-to': linkTo
        } = elementData

        // Use component ID first, then render ID as fallback
        const id = componentId || renderId

        // Validate component type
        if (!type || typeof type !== 'string') {
            console.warn('Invalid component type:', component)
            return null
        }

        // Handle conditional rendering
        if (ifCondition && !evaluateCondition(ifCondition, contextData, bindingResolver)) {
            // Check elseIf conditions
            if (elseIfCondition && evaluateCondition(elseIfCondition, contextData, bindingResolver)) {
                // Continue with rendering this element
            } else if (elseElement) {
                // Render else element
                return renderComponent(elseElement, contextData, key, iterationPath, componentPath)
            } else {
                // Don't render anything
                return null
            }
        }

        let normalizedType = type.toLowerCase().trim()

        // Valid HTML elements
        const validElements = new Set([
            'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'button', 'input', 'textarea', 'select', 'option', 'label',
            'form', 'fieldset', 'legend', 'img', 'a', 'ul', 'ol', 'li',
            'table', 'thead', 'tbody', 'tr', 'td', 'th', 'nav', 'header',
            'footer', 'main', 'section', 'article', 'aside', 'br', 'hr',
            'strong', 'em', 'small', 'code', 'pre', 'blockquote', 'cite',
            'canvas', 'svg', 'video', 'audio', 'iframe', 'embed', 'object'
        ])

        if (!validElements.has(normalizedType)) {
            console.warn('Invalid HTML element:', normalizedType, '→ defaulting to div')
            normalizedType = 'div'
        }

        try {
            // Use the data context as-is - no query handling in renderer
            const currentData = contextData

            // Process props with data binding
            const processedProps: Record<string, any> = {}
            
            for (const [propKey, propValue] of Object.entries(props)) {
                if (propKey === 'binding') continue // Skip binding prop
                
                if (typeof propValue === 'string') {
                    processedProps[propKey] = bindingResolver.resolve(propValue, currentData)
                } else {
                    processedProps[propKey] = propValue
                }
            }

            // Handle event handlers
            if (processedProps.onClick && typeof processedProps.onClick === 'string') {
                const handlerName = processedProps.onClick
                processedProps.onClick = handlers[handlerName] || (() => {
                    console.warn(`Missing handler: ${handlerName}`)
                })
            }

            // Handle link-to navigation
            if (linkTo) {
                const existingOnClick = processedProps.onClick

                processedProps.onClick = (e: React.MouseEvent) => {
                    // Call existing onClick handler first if it exists
                    if (existingOnClick && typeof existingOnClick === 'function') {
                        existingOnClick(e)
                    }

                    // Handle navigation
                    let navigationTarget: string | undefined
                    let navigationParams: Record<string, any> | undefined

                    if (typeof linkTo === 'string') {
                        navigationTarget = linkTo
                    } else if (typeof linkTo === 'object') {
                        if ('$exp' in linkTo) {
                            navigationTarget = bindingResolver.evaluateExpression(linkTo.$exp, contextData)
                        } else if ('$bind' in linkTo) {
                            navigationTarget = bindingResolver.getRawValue(linkTo.$bind, contextData)
                        } else if ('ui' in linkTo) {
                            const uiTarget = linkTo.ui
                            if (typeof uiTarget === 'string') {
                                navigationTarget = uiTarget
                            } else if (typeof uiTarget === 'object') {
                                if ('$exp' in uiTarget) {
                                    navigationTarget = bindingResolver.evaluateExpression(uiTarget.$exp, contextData)
                                } else if ('$bind' in uiTarget) {
                                    navigationTarget = bindingResolver.getRawValue(uiTarget.$bind, contextData)
                                }
                            }
                            navigationParams = linkTo.params
                        }
                    }

                    if (navigationTarget && handlers.navigate) {
                        handlers.navigate(navigationTarget, navigationParams)
                    } else if (navigationTarget) {
                        console.warn('Navigation target specified but no navigate handler provided:', navigationTarget)
                    }
                }
            }

            // Add React key
            if (key !== undefined) {
                processedProps.key = key
            }

            // Add selection functionality if enabled
            if (enableSelection && selectionHook && selectionHook.isSelectionEnabled) {
                const isSelectable = selectionHook.isNodeSelectable(componentPath)
                const isSelected = selectionHook.isNodeSelected(id, componentPath)
                const isHovered = selectionHook.isNodeHovered(id, componentPath)

                if (isSelectable) {
                    // Add selection styles
                    let selectionStyles = 'relative transition-all duration-200 '

                    if (isSelected) {
                        selectionStyles += 'ring-2 ring-blue-500 ring-offset-2 bg-blue-50/50 '
                    } else if (isHovered) {
                        selectionStyles += 'ring-2 ring-blue-300 ring-offset-1 bg-blue-50/30 '
                    } else {
                        selectionStyles += 'hover:ring-2 hover:ring-blue-200 hover:ring-offset-1 hover:bg-blue-50/20 '
                    }

                    // Add cursor pointer for selectable items
                    selectionStyles += 'cursor-pointer '

                    // Merge with existing className
                    const existingClassName = processedProps.className || ''
                    processedProps.className = `${existingClassName} ${selectionStyles}`.trim()

                    // Add selection event handlers
                    const originalOnClick = processedProps.onClick

                    processedProps.onClick = (e: React.MouseEvent) => {
                        e.stopPropagation()

                        // Handle original click if it exists
                        if (originalOnClick && typeof originalOnClick === 'function') {
                            originalOnClick(e)
                        }

                        // Handle selection
                        selectionHook.selectNode(id, componentPath)
                    }

                    // Add double-click handler for navigation
                    processedProps.onDoubleClick = (e: React.MouseEvent) => {
                        e.stopPropagation()
                        if (isSelected) {
                            selectionHook.navigateToChildren()
                        }
                    }

                    // Add hover handlers
                    processedProps.onMouseEnter = (e: React.MouseEvent) => {
                        e.stopPropagation()
                        selectionHook.setHoveredNode(id, componentPath)
                    }

                    processedProps.onMouseLeave = (e: React.MouseEvent) => {
                        e.stopPropagation()
                        selectionHook.setHoveredNode(null)
                    }

                    // Add selection indicator with positioning
                    if (isSelected || isHovered) {
                        // We'll add the indicator as a pseudo-element using CSS-in-JS style
                        processedProps.style = {
                            ...processedProps.style,
                            position: 'relative'
                        }
                    }
                }
            }

            // Normalize children to consistent array format
            const normalizedChildren = normalizeChildren(children)

            // Handle for directive (iteration)
            if (forDirective && forDirective.in) {
                const forPath = typeof forDirective.in === 'string'
                    ? forDirective.in
                    : typeof forDirective.in === 'object' && '$bind' in forDirective.in
                        ? forDirective.in.$bind
                        : forDirective.in.$exp

                if (forPath && !iterationPath.includes(forPath)) {
                    const boundData = bindingResolver.getRawValue(forPath, currentData)

                    if (Array.isArray(boundData)) {
                        // Render each array item
                        const renderedItems: React.ReactNode[] = []

                        boundData.forEach((item, index) => {
                            normalizedChildren.forEach((child: UIElement | string, childIndex: number) => {
                                const itemKey = forDirective.key
                                    ? bindingResolver.resolve(forDirective.key, { ...currentData, [forDirective.as]: item, ...(forDirective.index ? { [forDirective.index]: index } : {}) })
                                    : `${forPath}-${index}-${childIndex}`
                                const childPath = [...componentPath, childIndex]

                                // Create context with the item data and index
                                const itemContext = {
                                    ...currentData,
                                    [forDirective.as]: item,
                                    ...(forDirective.index ? { [forDirective.index]: index } : {})
                                }

                                const renderedChild = renderComponent(
                                    child,
                                    itemContext,
                                    itemKey,
                                    [...iterationPath, forPath],
                                    childPath
                                )
                                if (renderedChild !== null) {
                                    renderedItems.push(renderedChild)
                                }
                            })
                        })

                        return React.createElement(
                            normalizedType,
                            processedProps,
                            renderedItems.length > 0 ? renderedItems : null
                        )
                    } else if (boundData && typeof boundData === 'object') {
                        // Handle object binding
                        const itemContext = {
                            ...currentData,
                            [forDirective.as]: boundData
                        }

                        const renderedChildren = normalizedChildren.map((child: UIElement | string, index: number) => {
                            const childKey = `${forPath}-object-${index}`
                            const childPath = [...componentPath, index]
                            return renderComponent(
                                child,
                                itemContext,
                                childKey,
                                [...iterationPath, forPath],
                                childPath
                            )
                        }).filter((child: React.ReactNode) => child !== null)

                        return React.createElement(
                            normalizedType,
                            processedProps,
                            renderedChildren.length > 0 ? renderedChildren : null
                        )
                    }
                }
            }

            // Regular children rendering (no binding)
            const renderedChildren = normalizedChildren.map((child: UIElement | string, index: number) => {
                const childKey = `${id || type}-${index}`
                const childPath = [...componentPath, index]
                return renderComponent(child, currentData, childKey, iterationPath, childPath)
            }).filter((child: React.ReactNode) => child !== null)

            // Handle self-closing elements
            const selfClosingElements = new Set([
                'img', 'input', 'br', 'hr', 'meta', 'link',
                'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'
            ])

            if (selfClosingElements.has(normalizedType)) {
                return React.createElement(normalizedType, processedProps)
            }

            // Regular elements with children
            return React.createElement(
                normalizedType,
                processedProps,
                renderedChildren.length > 0 ? renderedChildren : null
            )

        } catch (error) {
            console.error('Component render error:', error, component)
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            return (
                <div className="p-2 border border-red-300 bg-red-50 rounded text-sm">
                    <span className="text-red-600 font-medium">Render Error: {id || type}</span>
                    <div className="text-xs text-red-500 mt-1">{errorMessage}</div>
                </div>
            )
        }
    }

    if (!uiComponent) {
        return (
            <div className="p-4 text-gray-500 text-center">
                <div className="text-lg font-medium">No UIComponent Provided</div>
                <div className="text-sm mt-1">Please provide a valid UIComponent to render</div>
            </div>
        )
    }

    return (
        <div className="universal-ui-renderer">
            {renderComponent(uiComponent, uiComponent.data || {}, 'root', [], [])}
        </div>
    )
}

export default FLOWUIRenderer2