import { API_URL } from '../config/api';
import { UIComponent } from '../types/dsl';

export interface JSXToDSLRequest {
  jsxContent: string;
  projectId?: string;
  uiId?: string;
}

export interface JSXToDSLResponse {
  success: boolean;
  data?: UIComponent;
  originalJSX?: string;
  metadata?: {
    projectId?: string;
    uiId?: string;
    conversionTime: number;
    provider: string;
  };
  error?: string;
  timestamp?: string;
}

/**
 * Convert JSX content to UIComponent DSL format using Groq LLM
 *
 * @param request - The JSX content and optional metadata
 * @returns Promise<JSXToDSLResponse> - The converted DSL or error
 *
 * @example
 * ```typescript
 * const jsxCode = `
 * import React, { useState } from 'react';
 *
 * export default function Counter() {
 *   const [count, setCount] = useState(0);
 *
 *   return (
 *     <div className="counter">
 *       <h1>Count: {count}</h1>
 *       <button onClick={() => setCount(count + 1)}>
 *         Increment
 *       </button>
 *     </div>
 *   );
 * }
 * `;
 *
 * const result = await convertJSXToDSL({
 *   jsxContent: jsxCode,
 *   projectId: 'my-project',
 *   uiId: 'counter-component'
 * });
 *
 * if (result.success) {
 *   console.log('Converted DSL:', result.data);
 * } else {
 *   console.error('Conversion failed:', result.error);
 * }
 * ```
 */
export async function convertJSXToDSL(request: JSXToDSLRequest): Promise<JSXToDSLResponse> {
  try {
    console.log('🔄 Converting JSX to DSL...', {
      jsxLength: request.jsxContent.length,
      projectId: request.projectId,
      uiId: request.uiId
    });

    const response = await fetch(`${API_URL}/jsx-to-dsl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: JSXToDSLResponse = await response.json();

    if (result.success) {
      console.log('✅ JSX to DSL conversion successful:', {
        conversionTime: result.metadata?.conversionTime,
        provider: result.metadata?.provider,
        dslId: result.data?.id
      });
    } else {
      console.error('❌ JSX to DSL conversion failed:', result.error);
    }

    return result;
  } catch (error) {
    console.error('❌ Error calling JSX to DSL endpoint:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Check the health of the JSX to DSL conversion service
 *
 * @returns Promise<{healthy: boolean, services: any, issues: string[]}>
 */
export async function checkJSXToDSLHealth(): Promise<{
  success: boolean;
  data?: {
    healthy: boolean;
    services: {
      groq: boolean;
    };
    issues: string[];
  };
  error?: string;
}> {
  try {
    const response = await fetch(`${API_URL}/jsx-to-dsl/health`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('❌ Error checking JSX to DSL health:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Convert JSX file content from Claude Agent to DSL and update UI
 * This is specifically for integration with Claude Agent workflow
 *
 * @param jsxContent - The JSX content from Claude Agent
 * @param projectId - The project ID
 * @param uiId - The UI ID
 * @returns Promise<UIComponent | null> - The converted DSL or null if failed
 */
export async function convertClaudeJSXToDSL(
  jsxContent: string,
  projectId: string,
  uiId: string
): Promise<UIComponent | null> {
  try {
    const result = await convertJSXToDSL({
      jsxContent,
      projectId,
      uiId
    });

    if (result.success && result.data) {
      console.log('🎯 Claude JSX converted to DSL successfully for UI:', uiId);
      return result.data;
    } else {
      console.error('Failed to convert Claude JSX to DSL:', result.error);
      return null;
    }
  } catch (error) {
    console.error('Error in convertClaudeJSXToDSL:', error);
    return null;
  }
}