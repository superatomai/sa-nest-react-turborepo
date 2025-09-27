import React, { Component } from 'react';
import type { ReactNode } from 'react';

interface DSLErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  elementType?: string;
  elementKey?: string | number;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  // Performance optimization: only wrap certain element types
  skipBoundary?: boolean;
}

interface DSLErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorId?: string; // Track specific error instance
}

export class DSLErrorBoundary extends Component<DSLErrorBoundaryProps, DSLErrorBoundaryState> {
  constructor(props: DSLErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): DSLErrorBoundaryState {
    const errorId = `${Date.now()}-${Math.random()}`;
    return { hasError: true, error, errorId };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.error('DSL Element Error:', {
        errorId: this.state.errorId,
        elementType: this.props.elementType,
        elementKey: this.props.elementKey,
        error: error.message,
        componentStack: errorInfo.componentStack
      });
    }
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  render() {
    // Skip boundary for performance if specified
    if (this.props.skipBoundary) {
      return this.props.children;
    }

    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI based on element type
      const { elementType, elementKey } = this.props;
      
      if (process.env.NODE_ENV === 'development') {
        // Detailed error in development
        return (
          <div 
            style={{ 
              border: '2px dashed #ef4444',
              padding: '8px',
              margin: '2px',
              backgroundColor: '#fef2f2',
              borderRadius: '4px',
              fontSize: '12px',
              color: '#dc2626'
            }}
            title={this.state.error?.message}
          >
            <strong>DSL Error:</strong> {elementType || 'Unknown'} 
            {elementKey && ` (key: ${elementKey})`}
            <details style={{ marginTop: '4px', fontSize: '11px' }}>
              <summary>Error Details</summary>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: '10px' }}>
                {this.state.error?.message}
              </pre>
            </details>
          </div>
        );
      }

      // Production fallback - minimal or nothing
      return (
        <div 
          style={{ 
            display: 'inline-block',
            width: '1px',
            height: '1px',
            backgroundColor: 'transparent'
          }}
          title="Content unavailable"
        />
      );
    }

    return this.props.children;
  }
}

// Performance optimization: determine which elements need error boundaries
export const shouldWrapWithErrorBoundary = (elementType: string): boolean => {
  // Only wrap complex elements that are more likely to error
  const complexElements = [
    'view', 'div', // Container elements
    'form', 'select', 'input', // Interactive elements
    'table', 'ul', 'ol', // List elements
    // Skip simple elements like text, span, p, h1-h6 for performance
  ];
  
  return complexElements.includes(elementType.toLowerCase()) || 
         elementType.charAt(0) === elementType.charAt(0).toUpperCase(); // Custom components
};

// Higher-order component for conditional error boundary wrapping
export const withConditionalErrorBoundary = (
  component: ReactNode,
  elementType: string,
  elementKey?: string | number,
  forceWrap?: boolean
): ReactNode => {
  const shouldWrap = forceWrap || shouldWrapWithErrorBoundary(elementType);
  
  if (!shouldWrap) {
    return component;
  }

  return (
    <DSLErrorBoundary 
      elementType={elementType}
      elementKey={elementKey}
      skipBoundary={!shouldWrap}
    >
      {component}
    </DSLErrorBoundary>
  );
};