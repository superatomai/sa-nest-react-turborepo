import React from 'react'

interface UIRendererProps {
    schema: any
    data?: any
    handlers?: Record<string, Function>
    isStreaming?: boolean
    onRefresh?: () => void
}

/**
 * Replace {{path.to.value}} in strings with actual values from `data`
 */
const resolveDataBinding = (text: string, data: any): string => {
    if (!text || typeof text !== 'string' || !data) return text

    const bindingRegex = /\{\{([^}]+)\}\}/g
    return text.replace(bindingRegex, (match, path) => {
        try {
            // Handle conditional expressions like {{status === 'active' ? '...' : '...'}}
            if (path.includes('===') || path.includes('?') || path.includes(':')) {
                try {
                    // Simple evaluation for status-based conditional classes
                    if (path.includes("status === 'active'")) {
                        const isActive = data.status === 'active'
                        const parts = path.split('?')
                        if (parts.length === 2) {
                            const [, rest] = parts
                            const [trueValue, falseValue] = rest.split(':').map((s:any) => s.trim().replace(/'/g, ''))
                            return isActive ? trueValue : falseValue
                        }
                    }
                    return match // Return original if we can't parse
                } catch {
                    return match
                }
            }
            
            // Normal path resolution
            const value = path.split('.').reduce((cur: any, key: string) => {
                if (cur === null || cur === undefined) return ''
                if (!isNaN(Number(key))) {
                    const index = parseInt(key, 10)
                    return Array.isArray(cur) ? cur[index] : cur
                }
                return cur[key]
            }, data)
            return value !== undefined && value !== null ? String(value) : ''
        } catch {
            return match
        }
    })
}

const FLOWUIRenderer = ({
    schema,
    data = null,
    handlers = {},
    isStreaming = false,
    onRefresh
}: UIRendererProps) => {

    // Track which bindings have been processed to prevent double processing
    const processedBindings = new Set<string>()

    const renderComponent = (
        component: any,
        contextData: any = data,
        key?: number | string,
        bindingPath: string[] = [] // Track the path of bindings processed
    ): React.ReactNode => {

        if (typeof component === 'string') {
            return resolveDataBinding(component, contextData)
        }

        if (!component || typeof component !== 'object') return null

        const { id, type, props = {}, children = [], binding, dataPath } = component

        if (!type || typeof type !== 'string') {
            console.warn('Component missing type:', component)
            return null
        }

        const normalizedType = type.toLowerCase().trim()

        const validHtmlTags = new Set([
            'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'button', 'input', 'textarea', 'select', 'option', 'label',
            'form', 'fieldset', 'legend', 'img', 'a', 'ul', 'ol', 'li',
            'table', 'thead', 'tbody', 'tr', 'td', 'th', 'nav', 'header',
            'footer', 'main', 'section', 'article', 'aside', 'br', 'hr',
            'strong', 'em', 'small', 'code', 'pre', 'blockquote', 'cite',
            'canvas', 'svg', 'video', 'audio', 'iframe', 'embed', 'object',
            'iconify-icon'
        ])

        if (!validHtmlTags.has(normalizedType)) {
            console.warn('Invalid HTML tag:', normalizedType)
            return null
        }

        try {
            // Get the appropriate data context
            let currentData = contextData

            // If component has dataPath, navigate to that data
            if (dataPath && contextData) {
                currentData = dataPath.split('.').reduce((cur: any, key: string) => cur?.[key], contextData)
            }

            // Process props with data binding (excluding binding property)
            const processedProps: any = { ...props }
            Object.keys(processedProps).forEach(propKey => {
                if (propKey !== 'binding' && typeof processedProps[propKey] === 'string') {
                    processedProps[propKey] = resolveDataBinding(processedProps[propKey], currentData)
                }
            })

            // Remove binding from props if it exists
            if (processedProps.binding) {
                delete processedProps.binding
            }

            // Hook up handlers
            if (processedProps.onClick && typeof processedProps.onClick === 'string') {
                const fn = handlers[processedProps.onClick]
                processedProps.onClick = typeof fn === 'function'
                    ? fn
                    : () => console.warn(`Missing handler: ${processedProps.onClick}`)
            }

            // Add key for React reconciliation
            if (key !== undefined) processedProps.key = key

            // Render children
            let renderedChildren: React.ReactNode[] = []

            // Create a unique binding identifier for this path
            const bindingId = binding ? `${bindingPath.join('.')}.${binding}` : null

            // SIMPLIFIED BINDING LOGIC: Only process binding if it hasn't been processed in this path
            const shouldProcessBinding = binding && 
                currentData && 
                currentData[binding] && 
                !bindingPath.includes(binding) // Don't process if already in the binding path

            if (shouldProcessBinding) {
                console.log(`🔍 Processing binding "${binding}" for ${type}#${id} (path: ${bindingPath.join('.')})`)
                
                let boundData = currentData[binding]

                if (Array.isArray(boundData)) {
                    // Process each array item
                    boundData.forEach((item, index) => {
                        children.forEach((child: any, childIndex: number) => {
                            const childKey = `${binding}-${index}-${childIndex}`
                            
                            const renderedChild = renderComponent(
                                child,
                                item, // Pass individual item as context
                                childKey,
                                [...bindingPath, binding] // Add current binding to path
                            )
                            if (renderedChild) renderedChildren.push(renderedChild)
                        })
                    })
                } else if (boundData && typeof boundData === 'object') {
                    // Handle object binding
                    children.forEach((child: any, childIndex: number) => {
                        const childKey = `${binding}-${childIndex}`
                        const renderedChild = renderComponent(
                            child, 
                            boundData, 
                            childKey,
                            [...bindingPath, binding]
                        )
                        if (renderedChild) renderedChildren.push(renderedChild)
                    })
                }
            } else {
                // No binding or already processed - render children normally
                if (binding && bindingPath.includes(binding)) {
                    console.log(`🚨 Skipping duplicate binding "${binding}" on ${type}#${id} (already in path: ${bindingPath.join('.')})`)
                }
                
                children.forEach((child: any, index: any) => {
                    const childKey = `child-${id}-${index}`
                    const renderedChild = renderComponent(
                        child, 
                        currentData, 
                        childKey,
                        bindingPath // Pass through the same binding path
                    )
                    if (renderedChild) renderedChildren.push(renderedChild)
                })
            }

            // Handle self-closing tags
            const selfClosingTags = new Set([
                'img', 'input', 'br', 'hr', 'meta', 'link',
                'area', 'base', 'col', 'embed', 'source', 'track', 'wbr', 'iconify-icon'
            ])

            if (selfClosingTags.has(normalizedType)) {
                if (normalizedType === 'iconify-icon') {
                    return React.createElement('iconify-icon', {
                        ...processedProps,
                        icon: processedProps.icon || processedProps.iconName
                    })
                }
                return React.createElement(normalizedType, processedProps)
            }

            return React.createElement(
                normalizedType,
                processedProps,
                renderedChildren.length > 0 ? renderedChildren : null
            )
        } catch (error) {
            console.error('Render error:', error, 'Component:', component)
            return (
                <div className="p-2 border border-red-300 bg-red-50 rounded text-sm">
                    <span className="text-red-600">Error rendering component: {id}</span>
                </div>
            )
        }
    }

    if (!schema) {
        return (
            <div className="p-4 text-gray-500">
                No UI schema provided
            </div>
        )
    }

    try {
        return (
            <div className="generated-ui relative">
                {schema.query && onRefresh && (
                    <button
                        onClick={onRefresh}
                        className="absolute top-2 right-2 z-10 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        type="button"
                    >
                        🔄 Refresh
                    </button>
                )}
                {renderComponent(schema, data, 'root')}
            </div>
        )
    } catch (error) {
        console.error('UIRenderer top-level error:', error)
        return (
            <div className="generated-ui p-4 border border-red-300 bg-red-50 rounded">
                <p className="text-red-600 font-medium">Error rendering UI</p>
                <p className="text-red-500 text-sm mt-1">Check console for details</p>
                <details className="mt-2">
                    <summary className="cursor-pointer text-sm">Debug Info</summary>
                    <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-auto">
                        Schema: {JSON.stringify(schema, null, 2)}
                        {'\n'}Data: {JSON.stringify(data, null, 2)}
                    </pre>
                </details>
            </div>
        )
    }
}

export default FLOWUIRenderer