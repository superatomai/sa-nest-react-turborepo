import React from 'react';
import { UIComponent, UIElement, UIElementSchema } from '@/types/dsl';
import { useNodeSelection } from '../hooks/useNodeSelection';
import { useFigmaSelection } from '../hooks/useFigmaSelection';
import { withConditionalErrorBoundary } from './DSLErrorBoundary';
import { DynamicComponent } from './ComponentRegistry';
import { observer } from 'mobx-react-lite';
import { editorModeStore } from '../../stores/mobx_editor_mode_store';

// Utilities
import { DataResolver } from './utils/DataResolver';
import { renderHTMLElement, NO_CONTAINER_ELEMENTS } from './utils/htmlElements';
import { withConditionalAnimation } from './utils/animationHelpers';
import { applySelectionProps } from './helpers/selectionHelpers';

// Hooks
import { useComponentState } from './hooks/useComponentState';
import { useMethodHandlers } from './hooks/useMethodHandlers';
import { useComponentEffects } from './hooks/useComponentEffects';

// Memoized wrapper for native components
const MemoizedNativeComponent = React.memo(({
    type, props, children, elementKey
}: {
    type: string;
    props: any;
    children?: React.ReactNode;
    elementKey?: string | number;
}) => {
    return withConditionalErrorBoundary(
        <DynamicComponent key={elementKey} type={type} props={props}>
            {children}
        </DynamicComponent>,
        type,
        elementKey,
        true
    );
}, (prevProps, nextProps) => {
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
 * Extract render data from UIComponent schema
 */
const extractRenderData = (component: UIComponent) => {
    if (!component || !component.render) return null;
    return {
        ...component.render,
        componentId: component.id,
        componentName: component.name
    };
};

/**
 * Updated DSL Renderer (Streamlined)
 */
export const UpdatedDSLRenderer: React.FC<UpdatedDSLRendererProps> = observer(({
    uiComponent,
    handlers = {},
    onNavigate,
    enableSelection = false
}) => {
    const resolver = React.useMemo(() => new DataResolver(), []);

    // Selection hooks
    let selectionHook = null;
    let figmaSelection = null;
    try {
        selectionHook = useNodeSelection();
        figmaSelection = useFigmaSelection();
    } catch {
        selectionHook = null;
        figmaSelection = null;
    }

    // Component state management
    const { componentStates, componentStatesRef, setState } = useComponentState(uiComponent);

    // Method handlers
    const methodHandlers = useMethodHandlers(uiComponent, componentStatesRef, setState);

    // Effects
    useComponentEffects(uiComponent, componentStates, setState, methodHandlers);

    // Resolved data
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

    const fullContext = {
        ...resolvedData,
        ...componentStates,
        ...methodHandlers,
        states: componentStates,
        props: uiComponent.props || {}
    };

    // Main render function
    const renderElement = (
        element: UIElement | UIComponent | string,
        localContext: Record<string, any> = {},
        componentPath: number[] = [],
        parentComponentId?: string
    ): React.ReactNode => {
        // Handle primitives
        if (typeof element === 'string') {
            return resolver.resolve(element, localContext);
        }

        if (!element || typeof element !== 'object') return null;

        // Handle UIComponent vs UIElement
        let elementData: UIElement;
        let componentId: string | undefined;

        if ('render' in element) {
            const extracted = extractRenderData(element as UIComponent);
            if (!extracted) {
                console.warn('Invalid UIComponent - missing render property:', element);
                return null;
            }
            elementData = extracted;
            componentId = (element as UIComponent).id;
        } else {
            elementData = element as UIElement;
            componentId = elementData.id;
        }

        // Resolve key if it's an expression/binding
        if (elementData.key && typeof elementData.key === 'object') {
            const resolvedKey = resolver.resolveValue(elementData.key, localContext);
            elementData = { ...elementData, key: resolvedKey != null ? String(resolvedKey) : undefined };
        }

        // Validate element
        try {
            UIElementSchema.parse(elementData);
        } catch (error) {
            console.error('Invalid DSL element:', error);
            return null;
        }

        // Handle platform overrides
        const actualElement = elementData.platform?.web ?
            { ...elementData, ...elementData.platform.web } : elementData;

        // Handle conditionals
        if (actualElement.if) {
            const condition = resolver.resolveValue(actualElement.if, localContext);
            if (!condition) {
                if (actualElement.elseIf) {
                    const elseIfCondition = resolver.resolveValue(actualElement.elseIf, localContext);
                    if (!elseIfCondition) {
                        return actualElement.else ? renderElement(actualElement.else as any, localContext, componentPath, componentId) : null;
                    }
                } else {
                    return actualElement.else ? renderElement(actualElement.else as any, localContext, componentPath, componentId) : null;
                }
            }
        }

        // Handle loops
        if (actualElement.for) {
            return renderLoop(actualElement, localContext, componentPath, componentId);
        }

        // Resolve props
        const resolvedProps = resolveProps(actualElement, localContext);

        // Handle event handlers
        applyEventHandlers(resolvedProps, methodHandlers, handlers);

        // Handle navigation
        if (actualElement['link-to'] && onNavigate) {
            applyNavigationHandler(resolvedProps, actualElement['link-to'], localContext, onNavigate, resolver);
        }

        // Handle selection
        if (enableSelection && selectionHook && figmaSelection && selectionHook.isSelectionEnabled) {
            const elementId = componentId || actualElement.id;
            const visualFeedback = figmaSelection.getVisualFeedbackStyles(elementId, componentPath);
            applySelectionProps(resolvedProps, elementId, componentPath, figmaSelection, visualFeedback);
        }

        // Resolve key
        const resolvedKey = resolver.resolveValue(actualElement.key, localContext);

        // Render children
        const renderChildren = (): React.ReactNode => {
            if (!actualElement.children) return null;

            if (typeof actualElement.children === 'string') {
                return resolver.resolveValue(actualElement.children, localContext);
            }

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
                    return <React.Fragment key={index}>{renderElement(child as UIElement, localContext, [...componentPath, index], parentComponentId)}</React.Fragment>;
                }).filter(Boolean);
            }

            return renderElement(actualElement.children as UIElement, localContext, [...componentPath, 0], parentComponentId);
        };

        // Render native components
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

        // Render HTML elements
        const htmlElement = renderHTMLElement(actualElement.type, resolvedKey, resolvedProps, renderChildren());
        return withConditionalAnimation(htmlElement, actualElement.type, resolvedKey);
    };

    // Loop rendering helper
    const renderLoop = (actualElement: any, localContext: Record<string, any>, componentPath: number[], componentId?: string) => {
        const items = resolver.resolveValue(actualElement.for!.in, localContext);
        if (!Array.isArray(items)) return null;

        const forDef = actualElement.for!;
        const loopItems = items.map((item, index) => {
            const itemContext = {
                ...fullContext,
                ...localContext,
                [forDef.as]: item,
                ...(forDef.index ? { [forDef.index]: index } : {})
            };

            let key: string;
            if (forDef.key) {
                const resolvedKey = typeof forDef.key === 'string' ?
                    resolver.getRawValue(forDef.key, itemContext) :
                    resolver.resolveValue(forDef.key, itemContext);
                key = resolvedKey ? String(resolvedKey) : `${actualElement.id}-${index}`;
            } else {
                key = `${actualElement.id}-${index}`;
            }

            // The element with 'for' IS the element to repeat
            const loopElement = {
                ...actualElement,
                for: undefined,
                key: undefined,
                id: `${actualElement.id}-${index}`
            };

            const loopItemPath = [...componentPath, index];
            return (
                <React.Fragment key={key}>
                    {withConditionalErrorBoundary(
                        renderElement(loopElement, itemContext, loopItemPath, componentId),
                        loopElement.type || 'div',
                        `${key}-boundary`
                    )}
                </React.Fragment>
            );
        });

        // Return just the loop items without a wrapper container
        // The parent element in the JSON structure provides the container
        return <>{loopItems}</>;
    };

    // Helper: Resolve props
    const resolveProps = (element: any, context: Record<string, any>) => {
        return element.props ?
            Object.entries(element.props).reduce((acc, [key, value]) => {
                acc[key] = resolver.resolveValue(value, context);
                return acc;
            }, {} as Record<string, any>) : {};
    };

    // Helper: Apply event handlers
    const applyEventHandlers = (
        resolvedProps: Record<string, any>,
        methodHandlers: Record<string, Function>,
        handlers: Record<string, Function>
    ) => {
        const eventHandlers = ['onClick', 'onChange', 'onSubmit', 'onBlur', 'onFocus', 'onKeyDown', 'onKeyUp', 'onKeyPress'];

        for (const eventName of eventHandlers) {
            if (resolvedProps[eventName] && typeof resolvedProps[eventName] === 'string') {
                const handlerName = resolvedProps[eventName];
                const handler = methodHandlers[handlerName] || handlers[handlerName];

                if (handler) {
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
    };

    // Helper: Apply navigation handler
    const applyNavigationHandler = (
        resolvedProps: Record<string, any>,
        linkTo: any,
        localContext: Record<string, any>,
        onNavigate: (uiid: string, params?: Record<string, any>) => void,
        resolver: DataResolver
    ) => {
        const linkToValue = resolver.resolveValue(linkTo, localContext);
        if (!linkToValue) return;

        const existingOnClick = resolvedProps.onClick;

        const handleNavigation = (e: React.MouseEvent | React.TouchEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (existingOnClick && e.type === 'click') {
                existingOnClick(e);
            }

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
        resolvedProps.style = {
            ...resolvedProps.style,
            cursor: 'pointer'
        };
    };

    if (!uiComponent) {
        return (
            <div className="p-4 text-gray-500 text-center">
                <div className="text-lg font-medium">No UIComponent Provided</div>
                <div className="text-sm mt-1">Please provide a valid UIComponent to render</div>
            </div>
        );
    }

    return (
        <div
            className="updated-dsl-renderer"
            style={{
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
                true
            )}
        </div>
    );
});

export { validateDSL } from '@/types/dsl';
export default UpdatedDSLRenderer;
