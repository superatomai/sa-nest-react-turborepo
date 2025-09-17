import React from 'react'
import { useNodeSelection } from '../hooks/useNodeSelection'

interface UIRendererProps {
    schema: any
    data?: any
    handlers?: Record<string, Function>
    isStreaming?: boolean
    onRefresh?: () => void
    enableSelection?: boolean // New prop to enable/disable selection
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
 * Universal UI Renderer
 * Handles all UI rendering with dynamic expressions
 */
const FLOWUIRenderer2 = ({
    schema,
    data = null,
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
        component: any,
        contextData: any = data,
        key?: number | string,
        iterationPath: string[] = [],
        componentPath: number[] = [] // Track path in the component tree
    ): React.ReactNode => {
        // Handle primitive values
        if (typeof component === 'string') {
            return bindingResolver.resolve(component, contextData)
        }

        if (!component || typeof component !== 'object') {
            return null
        }

        const { id, type, props = {}, children = [], binding, dataPath } = component

        // Validate component type
        if (!type || typeof type !== 'string') {
            console.warn('Invalid component type:', component)
            return null
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
            // Determine current data context
            let currentData = contextData

            // Apply dataPath if specified
            if (dataPath) {
                currentData = bindingResolver.getRawValue(dataPath, contextData) || contextData
            }

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

                    // Add selection indicator
                    if (isSelected || isHovered) {
                        const indicatorText = isSelected ? 'Selected' : 'Hovering'
                        const indicatorColor = isSelected ? 'bg-blue-500' : 'bg-blue-300'

                        // We'll add the indicator as a pseudo-element using CSS-in-JS style
                        processedProps.style = {
                            ...processedProps.style,
                            position: 'relative'
                        }
                    }
                }
            }

            // Handle array binding (iteration)
            if (binding && !iterationPath.includes(binding)) {
                const boundData = bindingResolver.getRawValue(binding, currentData)
                
                if (Array.isArray(boundData)) {
                    // Render each array item
                    const renderedItems: React.ReactNode[] = []
                    
                    boundData.forEach((item, index) => {
                        children.forEach((child: any, childIndex: number) => {
                            const itemKey = `${binding}-${index}-${childIndex}`
                            const childPath = [...componentPath, childIndex]
                            const renderedChild = renderComponent(
                                child,
                                item, // Each array item becomes the context
                                itemKey,
                                [...iterationPath, binding],
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
                    const renderedChildren = children.map((child: any, index: number) => {
                        const childKey = `${binding}-object-${index}`
                        const childPath = [...componentPath, index]
                        return renderComponent(
                            child,
                            boundData,
                            childKey,
                            [...iterationPath, binding],
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

            // Regular children rendering (no binding)
            const renderedChildren = children.map((child: any, index: number) => {
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

    if (!schema) {
        return (
            <div className="p-4 text-gray-500 text-center">
                <div className="text-lg font-medium">No Schema Provided</div>
                <div className="text-sm mt-1">Please provide a valid UI schema to render</div>
            </div>
        )
    }

    return (
        <div className="universal-ui-renderer">
            {renderComponent(schema, data, 'root', [], [])}
        </div>
    )
}

export default FLOWUIRenderer2