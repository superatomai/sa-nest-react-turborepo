import React, { use } from 'react';
import { UIComponent, UIElement, UIElementSchema } from '@/types/dsl';
import { useNodeSelection } from '../hooks/useNodeSelection';
import { useFigmaSelection } from '../hooks/useFigmaSelection';
import { useOutlineStyles } from './SelectionOutline';
import { withConditionalErrorBoundary } from './DSLErrorBoundary';
import { DynamicComponent } from './ComponentRegistry';
import { SchemaUtils } from '../../utils/schema-utilities';
import { observer } from 'mobx-react-lite';
import { editorModeStore } from '../../stores/mobx_editor_mode_store';
import { motion } from 'framer-motion';

// Memoized wrapper for native components to prevent unnecessary re-renders
const MemoizedNativeComponent = React.memo(({
    type,
    props,
    children,
    elementKey
}: {
    type: string;
    props: any;
    children?: React.ReactNode;
    elementKey?: string | number;
}) => {
    // Add debugging for native component renders
    const renderCount = React.useRef(0);
    renderCount.current++;


    return withConditionalErrorBoundary(
        <DynamicComponent
            key={elementKey}
            type={type}
            props={props}
        >
            {children}
        </DynamicComponent>,
        type,
        elementKey,
        true
    );
}, (prevProps, nextProps) => {
    // Custom comparison to prevent re-renders when props haven't actually changed
    const propsEqual = JSON.stringify(prevProps.props) === JSON.stringify(nextProps.props);
    const typeEqual = prevProps.type === nextProps.type;
    const keyEqual = prevProps.elementKey === nextProps.elementKey;

    return propsEqual && typeEqual && keyEqual;
});

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

        // Skip flattening if this is a global object or function (avoid corrupting the context)
        // Note: We DO want to include 'states' and 'props' in the context for expression evaluation
        const skipKeys = ['Math', 'Date', 'String', 'Number', 'Boolean', 'Array', 'Object', 'JSON',
                          'filter', 'map', 'reduce', 'find', 'some', 'every', 'sort', 'slice',
                          'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'console', 'window',
                          'setState', 'data'];

        for (const [key, value] of Object.entries(obj)) {
            // Skip global objects and special keys
            if (!prefix && skipKeys.includes(key)) {
                continue;
            }

            const contextKey = prefix ? `${prefix}_${key}` : key;

            // Always add to context first (this ensures loop variables like 'org', 'dept' are available)
            context[contextKey] = value;

            // For direct access without prefix (always add for root level)
            if (!prefix) {
                context[key] = value;
            }

            // Recursively flatten objects (but not arrays) to provide nested access paths
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
        //@:to-do - implement transforms properly
        if (transforms && Array.isArray(transforms)) {
            // console.log('Transforms not fully implemented yet:', transforms);
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
 * Animation configurations for smooth element movement
 */
const getAnimationConfig = (elementKey: string | number) => ({
    layout: true,
    layoutId: `element-${elementKey}`, // Maintain consistent identity during animations
    transition: {
        type: "spring" as const,
        damping: 25,        // Higher damping to reduce oscillation
        stiffness: 400,     // Higher stiffness for quicker settling
        duration: 0.3,      // Shorter duration to minimize flicker window
        bounce: 0.1,        // Minimal bounce to reduce layout disruption
        // Ensure outline transitions smoothly with faster timing
        layout: {
            type: "spring" as const,
            damping: 30,
            stiffness: 500,
            duration: 0.2
        }
    },
    // Remove hover/tap effects that might interfere with selection
    style: {
        // Ensure the element maintains its selection during animation
        willChange: 'transform', // Optimize for animations
    }
});

/**
 * Determine which elements should have animations applied
 * Only animate elements that can be moved/rearranged by users
 */
const shouldApplyAnimation = (elementType: string): boolean => {
    const animatableElements = [
        'view', 'div', 'span', 'text', 'button', 'input', 'select', 'option',
        'h1', 'h2', 'h3', 'p', 'ul', 'li', 'img', 'a', 'form',
        'table', 'tbody', 'tr', 'td', 'section', 'header', 'footer'
    ];

    return animatableElements.includes(elementType.toLowerCase()) ||
        elementType.charAt(0) === elementType.charAt(0).toUpperCase(); // Custom components
};

/**
 * Higher-order component for conditional animation wrapping
 * Similar to withConditionalErrorBoundary but for animations
 */
const withConditionalAnimation = (
    component: React.ReactNode,
    elementType: string,
    elementKey?: string | number
): React.ReactNode => {
    // return component;

    // Only apply animations in dev mode
    if (!editorModeStore.isDev) {
        return component;
    }

    // Only animate specific elements for performance
    if (!shouldApplyAnimation(elementType)) {
        return component;
    }

    // Wrap with motion.div for smooth layout animations
    const animConfig = getAnimationConfig(elementKey || 'default');
    return (
        <motion.div
            key={elementKey}
            {...animConfig}
            style={{ display: 'contents' }} // Invisible wrapper that doesn't affect layout
        >
            {component}
        </motion.div>
    );
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
 * - Smooth animations in dev mode for element movement
 */
export const UpdatedDSLRenderer: React.FC<UpdatedDSLRendererProps> = observer(({
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

    // Create React state for component states
    const [componentStates, setComponentStates] = React.useState<Record<string, any>>(() => {
        const initialStates: Record<string, any> = {};
        if (uiComponent.states) {
            for (const [key, value] of Object.entries(uiComponent.states)) {
                // Resolve initial state values
                const initialContext = {
                    ...uiComponent.data || {},
                    props: uiComponent.props || {}
                };
                initialStates[key] = resolver.resolveValue(value, initialContext);
            }
        }
        return initialStates;
    });

    // Create ref to track latest component states (for method handlers to avoid stale closures)
    const componentStatesRef = React.useRef(componentStates);
    React.useEffect(() => {
        componentStatesRef.current = componentStates;
    }, [componentStates]);

    // Create setState function for methods
    const setState = React.useCallback((key: string, value: any) => {
        setComponentStates(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);

    // Create method handlers from component.methods
    const methodHandlers = React.useMemo(() => {
        const handlers: Record<string, Function> = {};

        if (uiComponent.methods) {
            for (const [methodName, methodDef] of Object.entries(uiComponent.methods)) {
                if (methodDef.fn) {
                    try {
                        // Parse the function string and create executable function
                        // Strip TypeScript type annotations since JSON contains TS syntax from TSX conversion
                        let fnString = methodDef.fn;

                        // Unescape escaped quotes from JSON conversion: \\' -> ' and \\" -> "
                        fnString = fnString.replace(/\\'/g, "'");
                        fnString = fnString.replace(/\\"/g, '"');

                        // Remove TypeScript type casting: (variable as Type) -> variable
                        fnString = fnString.replace(/\(\s*(\w+)\s+as\s+\w+\s*\)/g, '$1');

                        // Remove type annotations from variable declarations ONLY after var/let/const
                        // Match: const/let/var name: Type = ... -> const/let/var name = ...
                        // But DON'T match ternary operators: condition ? value : otherValue
                        fnString = fnString.replace(/\b(const|let|var)\s+(\w+)\s*:\s*[\w<>[\]|&]+\s*=/g, '$1 $2 =');

                        // Create the method function
                        handlers[methodName] = (...args: any[]) => {
                            try {
                                // IMPORTANT: Get CURRENT state on each call (not closure)
                                // This ensures methods always work with latest state values
                                const currentStates = componentStatesRef.current;

                                // Create context FRESH on each call to get latest state
                                const context = {
                                    ...uiComponent.data || {},
                                    ...currentStates,
                                    states: currentStates,
                                    props: uiComponent.props || {},
                                    setState,
                                    // Add all other methods so they can call each other
                                    ...handlers,
                                    // Add common utilities
                                    console,
                                    Math,
                                    Date,
                                    String,
                                    Number,
                                    Boolean,
                                    Array,
                                    Object,
                                    JSON,
                                    window
                                };

                                const paramNames = Object.keys(context);
                                const paramValues = Object.values(context);

                                // Add function arguments to context
                                paramNames.push('args');
                                paramValues.push(args);

                                try {
                                    const func = new Function(...paramNames, `
                                        "use strict";
                                        return (${fnString})(...args);
                                    `);
                                    const result = func(...paramValues);
                                    return result;
                                } catch (syntaxError) {
                                    console.error(`❌ Syntax error in method ${methodName}:`, syntaxError);
                                    console.error(`Function string:`, fnString);
                                    throw new Error(`Invalid JavaScript in method ${methodName}: ${syntaxError.message}`);
                                }
                            } catch (error) {
                                console.error(`❌ Error executing method ${methodName}:`, error);
                                throw error;
                            }
                        };
                    } catch (error) {
                        console.error(`Error creating method ${methodName}:`, error);
                    }
                }
            }
        }

        return handlers;
    }, [uiComponent.methods, uiComponent.data, uiComponent.props, setState]);

    // Handle effects - use ref to avoid infinite loops
    const methodHandlersRef = React.useRef(methodHandlers);
    React.useEffect(() => {
        methodHandlersRef.current = methodHandlers;
    }, [methodHandlers]);

    React.useEffect(() => {
        if (uiComponent.effects) {
            for (const effect of uiComponent.effects) {
                try {
                    // Strip TypeScript syntax from effect function string
                    let effectFn = effect.fn;

                    // Unescape escaped quotes from JSON conversion: \\' -> ' and \\" -> "
                    effectFn = effectFn.replace(/\\'/g, "'");
                    effectFn = effectFn.replace(/\\"/g, '"');

                    // Remove TypeScript type casting: (variable as Type) -> variable
                    effectFn = effectFn.replace(/\(\s*(\w+)\s+as\s+\w+\s*\)/g, '$1');

                    // Remove type annotations from variable declarations ONLY after var/let/const
                    // Match: const/let/var name: Type = ... -> const/let/var name = ...
                    // But DON'T match ternary operators: condition ? value : otherValue
                    effectFn = effectFn.replace(/\b(const|let|var)\s+(\w+)\s*:\s*[\w<>[\]|&]+\s*=/g, '$1 $2 =');

                    const context = {
                        ...uiComponent.data || {},
                        ...componentStates,
                        states: componentStates,
                        props: uiComponent.props || {},
                        setState,
                        ...methodHandlersRef.current, // Use ref to avoid re-renders
                        console,
                        Math,
                        Date,
                        window
                    };

                    const paramNames = Object.keys(context);
                    const paramValues = Object.values(context);

                    const func = new Function(...paramNames, `
                        "use strict";
                        return (${effectFn})();
                    `);

                    func(...paramValues);
                } catch (error) {
                    console.error('Error executing effect:', error);
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


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

        // Resolve key before validation if it's an expression/binding
        if (elementData.key && typeof elementData.key === 'object') {
            const resolvedKey = resolver.resolveValue(elementData.key, localContext);
            // Convert to string since schema expects string keys
            elementData = { ...elementData, key: resolvedKey != null ? String(resolvedKey) : undefined };
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

                    // Create loop element - two cases:
                    // 1. If children is a UIElement (has type), use it as template (e.g., user cards)
                    // 2. If children is a binding/string, the element itself is the template (e.g., options)
                    let loopElement: UIElement;

                    if (actualElement.children && typeof actualElement.children === 'object' && (actualElement.children as any).type) {
                        // Case 1: Children is a UIElement, use it as template
                        loopElement = actualElement.children as UIElement;
                    } else {
                        // Case 2: Element itself is the template (children is just content/binding)
                        loopElement = {
                            ...actualElement,
                            for: undefined,
                            key: undefined,
                            id: `${actualElement.id}-${index}`
                        } as UIElement;
                    }

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

                // For certain elements (like option), don't render a container - just return the loop items
                // because wrapping them would create invalid HTML (e.g., <option><option>...</option></option>)
                const noContainerElements = ['option'];
                if (noContainerElements.includes(actualElement.type.toLowerCase())) {
                    return <>{...loopItems}</>;
                }

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

                    // Add data attributes for keyboard navigation and event delegation
                    containerProps['data-component-id'] = elementId;
                    containerProps['data-component-path'] = JSON.stringify(componentPath);

                    containerProps.style = {
                        ...containerProps.style,
                        ...outlineStyles,
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

                    // Note: Hover handlers are now handled via event delegation in useFigmaSelection
                }

                // Render the container with its original type and props, containing loop items
                return React.createElement(
                    containerElement.type,
                    containerProps,
                    ...loopItems
                );
            }
        }

        // Resolve props with localContext that includes loop variables
        const resolvedProps = actualElement.props ?
            Object.entries(actualElement.props).reduce((acc, [key, value]) => {
                acc[key] = resolver.resolveValue(value, localContext);
                return acc;
            }, {} as Record<string, any>) : {};

        // Handle event handlers - check methodHandlers first (from component.methods), then external handlers
        const eventHandlers = ['onClick', 'onChange', 'onSubmit', 'onBlur', 'onFocus', 'onKeyDown', 'onKeyUp', 'onKeyPress'];

        for (const eventName of eventHandlers) {
            if (resolvedProps[eventName] && typeof resolvedProps[eventName] === 'string') {
                const handlerName = resolvedProps[eventName];
                const handler = methodHandlers[handlerName] || handlers[handlerName];

                if (handler) {
                    // For form submissions, wrap to ensure preventDefault is called
                    if (eventName === 'onSubmit') {
                        resolvedProps[eventName] = (e: React.FormEvent) => {
                            e.preventDefault();
                            return handler(e);
                        };
                    } else {
                        resolvedProps[eventName] = handler;
                    }
                } else {
                    resolvedProps[eventName] = () => {
                        console.warn(`Missing handler: ${handlerName}`);
                    };
                }
            }
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


                    onNavigate(targetUI, params);
                };

                resolvedProps.onClick = handleNavigation;
                resolvedProps.onTouchEnd = handleNavigation;

                // Add cursor pointer for better UX
                resolvedProps.style = {
                    ...resolvedProps.style,
                    cursor: 'pointer'
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

            // Add data attributes for keyboard navigation and event delegation
            resolvedProps['data-component-id'] = elementId;
            resolvedProps['data-component-path'] = JSON.stringify(componentPath);

            // Merge styles
            resolvedProps.style = {
                ...resolvedProps.style,
                ...outlineStyles,
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

            // Note: Hover handlers are now handled via event delegation in useFigmaSelection
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

        // Check for dynamic components first - use memoized wrapper for better performance
        if (actualElement.type.startsWith('COMP_')) {
            return (
                <MemoizedNativeComponent
                    type={actualElement.type}
                    props={resolvedProps}
                    elementKey={resolvedKey}
                >
                    {renderChildren()}
                </MemoizedNativeComponent>
            );
        }

        // Handle standard HTML elements
        switch (actualElement.type.toLowerCase()) {
            case 'view':
            case 'div':
                return withConditionalAnimation(
                    <div key={resolvedKey} {...resolvedProps}>{renderChildren()}</div>,
                    actualElement.type,
                    resolvedKey
                );

            case 'text':
            case 'span':
                return withConditionalAnimation(
                    <span key={resolvedKey} {...resolvedProps}>{renderChildren()}</span>,
                    actualElement.type,
                    resolvedKey
                );

            case 'button':
                return withConditionalAnimation(
                    <button key={resolvedKey} {...resolvedProps}>{renderChildren()}</button>,
                    actualElement.type,
                    resolvedKey
                );

            case 'input':
                return withConditionalAnimation(
                    <input key={resolvedKey} {...resolvedProps} />,
                    actualElement.type,
                    resolvedKey
                );

            case 'select':
                return withConditionalAnimation(
                    <select key={resolvedKey} {...resolvedProps}>{renderChildren()}</select>,
                    actualElement.type,
                    resolvedKey
                );

            case 'option':
                return withConditionalAnimation(
                    <option key={resolvedKey} {...resolvedProps}>{renderChildren()}</option>,
                    actualElement.type,
                    resolvedKey
                );

            case 'h1':
                return withConditionalAnimation(
                    <h1 key={resolvedKey} {...resolvedProps}>{renderChildren()}</h1>,
                    actualElement.type,
                    resolvedKey
                );

            case 'h2':
                return withConditionalAnimation(
                    <h2 key={resolvedKey} {...resolvedProps}>{renderChildren()}</h2>,
                    actualElement.type,
                    resolvedKey
                );

            case 'h3':
                return withConditionalAnimation(
                    <h3 key={resolvedKey} {...resolvedProps}>{renderChildren()}</h3>,
                    actualElement.type,
                    resolvedKey
                );

            case 'p':
                return withConditionalAnimation(
                    <p key={resolvedKey} {...resolvedProps}>{renderChildren()}</p>,
                    actualElement.type,
                    resolvedKey
                );

            case 'ul':
                return withConditionalAnimation(
                    <ul key={resolvedKey} {...resolvedProps}>{renderChildren()}</ul>,
                    actualElement.type,
                    resolvedKey
                );

            case 'li':
                return withConditionalAnimation(
                    <li key={resolvedKey} {...resolvedProps}>{renderChildren()}</li>,
                    actualElement.type,
                    resolvedKey
                );

            case 'img':
                return withConditionalAnimation(
                    <img key={resolvedKey} {...resolvedProps} alt={resolvedProps.alt || ''} />,
                    actualElement.type,
                    resolvedKey
                );

            case 'a':
                return withConditionalAnimation(
                    <a key={resolvedKey} {...resolvedProps}>{renderChildren()}</a>,
                    actualElement.type,
                    resolvedKey
                );

            case 'header':
                return withConditionalAnimation(
                    <header key={resolvedKey} {...resolvedProps}>{renderChildren()}</header>,
                    actualElement.type,
                    resolvedKey
                );

            case 'section':
                return withConditionalAnimation(
                    <section key={resolvedKey} {...resolvedProps}>{renderChildren()}</section>,
                    actualElement.type,
                    resolvedKey
                );

            case 'footer':
                return withConditionalAnimation(
                    <footer key={resolvedKey} {...resolvedProps}>{renderChildren()}</footer>,
                    actualElement.type,
                    resolvedKey
                );

            case 'table':
                return withConditionalAnimation(
                    <table key={resolvedKey} {...resolvedProps}>{renderChildren()}</table>,
                    actualElement.type,
                    resolvedKey
                );

            case 'thead':
                return withConditionalAnimation(
                    <thead key={resolvedKey} {...resolvedProps}>{renderChildren()}</thead>,
                    actualElement.type,
                    resolvedKey
                );

            case 'tbody':
                return withConditionalAnimation(
                    <tbody key={resolvedKey} {...resolvedProps}>{renderChildren()}</tbody>,
                    actualElement.type,
                    resolvedKey
                );

            case 'tr':
                return withConditionalAnimation(
                    <tr key={resolvedKey} {...resolvedProps}>{renderChildren()}</tr>,
                    actualElement.type,
                    resolvedKey
                );

            case 'th':
                return withConditionalAnimation(
                    <th key={resolvedKey} {...resolvedProps}>{renderChildren()}</th>,
                    actualElement.type,
                    resolvedKey
                );

            case 'td':
                return withConditionalAnimation(
                    <td key={resolvedKey} {...resolvedProps}>{renderChildren()}</td>,
                    actualElement.type,
                    resolvedKey
                );

            case 'svg':
                return withConditionalAnimation(
                    <svg key={resolvedKey} {...resolvedProps}>{renderChildren()}</svg>,
                    actualElement.type,
                    resolvedKey
                );

            case 'path':
                return <path key={resolvedKey} {...resolvedProps} />;

            case 'circle':
                return <circle key={resolvedKey} {...resolvedProps} />;

            case 'rect':
                return <rect key={resolvedKey} {...resolvedProps} />;

            case 'line':
                return <line key={resolvedKey} {...resolvedProps} />;

            case 'polygon':
                return <polygon key={resolvedKey} {...resolvedProps} />;

            case 'polyline':
                return <polyline key={resolvedKey} {...resolvedProps} />;

            case 'g':
                return <g key={resolvedKey} {...resolvedProps}>{renderChildren()}</g>;

            case 'form':
                return withConditionalAnimation(
                    <form key={resolvedKey} {...resolvedProps}>{renderChildren()}</form>,
                    actualElement.type,
                    resolvedKey
                );

            default:
                // console.warn(`Unknown element type: ${actualElement.type}`);
                return withConditionalAnimation(
                    <div key={resolvedKey} {...resolvedProps}>{renderChildren()}</div>,
                    actualElement.type,
                    resolvedKey
                );
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

    // Resolve computed data properties (data can contain expressions that depend on states/props)
    const resolvedData = React.useMemo(() => {
        const resolved: Record<string, any> = {};
        if (uiComponent.data) {
            const dataContext = {
                ...componentStates,
                states: componentStates,
                props: uiComponent.props || {}
            };

            for (const [key, value] of Object.entries(uiComponent.data)) {
                resolved[key] = resolver.resolveValue(value, dataContext);
            }
        }
        return resolved;
    }, [uiComponent.data, uiComponent.props, componentStates]);

    // Extract the full context (resolved data + component states + props)
    const fullContext = {
        ...resolvedData,
        ...componentStates,
        states: componentStates,
        props: uiComponent.props || {}
    };

    // Wrap the entire DSL tree with error boundary for top-level errors
    return (
        <div
            className="updated-dsl-renderer"
            style={{
                // Only apply user-select: none in dev mode (allow text selection in preview mode)
                ...(editorModeStore.isPreview ? {} : {
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    WebkitTouchCallout: 'none',
                    msUserSelect: 'none'
                })
            }}
        >
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