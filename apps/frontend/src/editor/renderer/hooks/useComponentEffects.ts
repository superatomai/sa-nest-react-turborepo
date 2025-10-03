import React from 'react';
import { UIComponent } from '@/types/dsl';
import { cleanTypeScriptSyntax } from '../utils/typeScriptCleaner';

/**
 * Custom hook to handle component effects
 */
export function useComponentEffects(
    uiComponent: UIComponent,
    componentStates: Record<string, any>,
    setState: (key: string, value: any) => void,
    methodHandlers: Record<string, Function>
) {
    const methodHandlersRef = React.useRef(methodHandlers);
    React.useEffect(() => {
        methodHandlersRef.current = methodHandlers;
    }, [methodHandlers]);

    React.useEffect(() => {
        if (uiComponent.effects) {
            for (const effect of uiComponent.effects) {
                try {
                    const effectFn = cleanTypeScriptSyntax(effect.fn);

                    const context = {
                        ...uiComponent.data || {},
                        ...componentStates,
                        states: componentStates,
                        props: uiComponent.props || {},
                        setState,
                        ...methodHandlersRef.current,
                        console, Math, Date, window
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
}
