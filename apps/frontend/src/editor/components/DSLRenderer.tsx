import { DSLRendererProps, UIElement, UIElementSchema } from '@/types/dsl';
import React from 'react';
import { withConditionalErrorBoundary } from './DSLErrorBoundary';
import { DynamicComponent } from './ComponentRegistry';


// Navigation handler type
type NavigationHandler = (uiid: string, params?: Record<string, any>) => void;

// Extended props to include navigation handler
interface ExtendedDSLRendererProps extends DSLRendererProps {
  onNavigate?: NavigationHandler;
}

export const DSLRenderer: React.FC<ExtendedDSLRendererProps> = React.memo(({ dsl, data = {}, context = {}, onNavigate }) => {
  const resolveValue = (value: any, localContext: Record<string, any> = {}): any => {
    if (!value) return value;
    
    const fullContext = { ...context, ...localContext, ...data };
    
    // Handle Expression objects
    if (typeof value === 'object' && value.$exp) {
      return evaluateExpression(value.$exp, fullContext);
    }
    
    // Handle Binding objects
    if (typeof value === 'object' && value.$bind) {
      return resolveBinding(value.$bind, fullContext, value.$transform);
    }
    
    // Handle string interpolation (support both ${} and {{}} for backward compatibility)
    if (typeof value === 'string' && (value.includes('${') || value.includes('{{'))) {
      return interpolateString(value, fullContext);
    }
    
    return value;
  };

  const evaluateExpression = (expression: string, context: Record<string, any>): any => {
    try {
      // Simple and safe expression evaluation for basic operations
      // In production, you'd want a more secure expression evaluator
      const func = new Function('context', 'data', 'state', `
        with(context) {
          return ${expression};
        }
      `);
      return func(context, context, context.state || {});
    } catch (e) {
      console.error('Expression evaluation error:', expression, e);
      return undefined;
    }
  };

  const resolveBinding = (path: string, context: Record<string, any>, transforms?: any[]): any => {
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
      // Would implement actual transforms here
      console.log('Transforms not implemented yet:', transforms);
    }
    
    return value;
  };

  const interpolateString = (template: string, context: Record<string, any>): string => {
    // Handle both ${} and {{}} syntax for flexibility
    let result = template;
    
    // Handle ${} syntax (preferred for JSON compatibility)
    result = result.replace(/\$\{(.*?)\}/g, (_match, expr) => {
      const trimmed = expr.trim();
      try {
        const value = resolveBinding(trimmed, context);
        return value !== undefined ? String(value) : '';
      } catch (e) {
        console.error('String interpolation error (${} syntax):', e);
        return '';
      }
    });
    
    // Handle {{}} syntax (for backward compatibility)
    result = result.replace(/\{\{(.*?)\}\}/g, (_match, expr) => {
      const trimmed = expr.trim();
      try {
        const value = resolveBinding(trimmed, context);
        return value !== undefined ? String(value) : '';
      } catch (e) {
        console.error('String interpolation error ({{}} syntax):', e);
        return '';
      }
    });
    
    return result;
  };

  const safeRenderElement = (childElement: UIElement, childContext: Record<string, any> = {}): React.ReactNode => {
    try {
      return renderElement(childElement, childContext);
    } catch (error) {
      console.error('Error rendering DSL element:', error);
      if (process.env.NODE_ENV === 'development') {
        return (
          <div style={{ color: 'red', fontSize: '12px', border: '1px solid red', padding: '4px' }}>
            Error: {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        );
      }
      return null;
    }
  };

  const renderElement = (element: UIElement, localContext: Record<string, any> = {}): React.ReactNode => {
    if (!element) return null;

    // Validate element against schema
    try {
      UIElementSchema.parse(element);
    } catch (error) {
      console.error('Invalid DSL element:', error);
      return null;
    }

    // Handle platform overrides (just use web for now)
    const actualElement = element.platform?.web ? 
      { ...element, ...element.platform.web } : element;

    // Handle conditionals
    if (actualElement.if) {
      const condition = resolveValue(actualElement.if, localContext);
      if (!condition) {
        return actualElement.else ? safeRenderElement(actualElement.else as UIElement, localContext) : null;
      }
    }

    // Handle loops
    if (actualElement.for) {
      const items = resolveValue(actualElement.for.in, localContext);
      if (Array.isArray(items)) {
        return items.map((item, index) => {
          const itemContext = { 
            ...localContext, 
            [actualElement.for!.as]: item,
            ...(actualElement.for!.index ? { [actualElement.for!.index]: index } : {})
          };
          
          const key = actualElement.for!.key ?
            resolveValue(actualElement.for!.key, itemContext) :
            resolveValue(actualElement.key, itemContext) || `loop-item-${index}`;

          const loopElement = { 
            ...actualElement, 
            for: undefined, 
            key: undefined 
          } as UIElement;
          
          return (
            <React.Fragment key={key}>
              {withConditionalErrorBoundary(
                safeRenderElement(loopElement, itemContext),
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
        acc[key] = resolveValue(value, localContext);
        return acc;
      }, {} as Record<string, any>) : {};

    // Handle link-to property - add click/tap handler for navigation
    if (actualElement['link-to'] && onNavigate) {
      const linkToValue = resolveValue(actualElement['link-to'], localContext);
      if (linkToValue) {
        const existingOnClick = resolvedProps.onClick;
        const existingOnTouchEnd = resolvedProps.onTouchEnd;

        const handleNavigation = (e: React.MouseEvent | React.TouchEvent) => {
          e.preventDefault();
          e.stopPropagation();

          // Call existing handlers first
          if (existingOnClick && e.type === 'click') {
            existingOnClick(e);
          }
          if (existingOnTouchEnd && e.type === 'touchend') {
            existingOnTouchEnd(e);
          }

          // Handle different link-to formats
          let targetUI: string;
          let params: Record<string, any> | undefined;

          if (typeof linkToValue === 'string') {
            // Simple string format: "chart"
            targetUI = linkToValue;
          } else if (linkToValue && typeof linkToValue === 'object' && linkToValue.ui) {
            // Object format: { ui: "chart", params: { type: "bar", data: {...} } }
            targetUI = resolveValue(linkToValue.ui, localContext);

            // Recursively resolve parameters - each value in params may need resolution
            if (linkToValue.params) {
              params = {};
              for (const [key, value] of Object.entries(linkToValue.params)) {
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                  // Handle nested objects (like user object with multiple properties)
                  params[key] = {};
                  for (const [nestedKey, nestedValue] of Object.entries(value)) {
                    params[key][nestedKey] = resolveValue(nestedValue, localContext);
                  }
                } else {
                  params[key] = resolveValue(value, localContext);
                }
              }
            }
          } else {
            // Fallback to string conversion
            targetUI = String(linkToValue);
          }

          if (process.env.NODE_ENV === 'development') {
            console.log('Navigation triggered:', { targetUI, params, localContext });
          }

          // Trigger navigation with parameters
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

    // Resolve key for React element
    const resolvedKey = resolveValue(actualElement.key, localContext);

    const renderChildren = (): React.ReactNode => {
      if (!actualElement.children) return null;
      
      // Handle different children types
      if (typeof actualElement.children === 'string') {
        return resolveValue(actualElement.children, localContext);
      }
      
      // Handle Expression/Binding children
      if (typeof actualElement.children === 'object' && actualElement.children &&
          ('$exp' in actualElement.children || '$bind' in actualElement.children)) {
        const value = resolveValue(actualElement.children, localContext);
        return value !== undefined ? String(value) : null;
      }
      
      if (Array.isArray(actualElement.children)) {
        return actualElement.children.map((child: any, index: number) => {
          if (typeof child === 'string') {
            return resolveValue(child, localContext);
          }
          if (typeof child === 'object' && child && ('$exp' in child || '$bind' in child)) {
            const value = resolveValue(child, localContext);
            return value !== undefined ? String(value) : null;
          }
          return <React.Fragment key={index}>{safeRenderElement(child as UIElement, localContext)}</React.Fragment>;
        }).filter(Boolean);
      }
      
      return safeRenderElement(actualElement.children as UIElement, localContext);
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

  // Wrap the entire DSL tree with error boundary for top-level errors
  return (
    <>
      {withConditionalErrorBoundary(
        renderElement(dsl),
        dsl.type,
        resolveValue(dsl.key, {}),
        true // Force wrap root element
      )}
    </>
  );
});

// Re-export for convenience
export {validateDSL} from '@/types/dsl';