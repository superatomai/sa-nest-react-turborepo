import React from 'react';
import { UIComponent } from '@/types/dsl';
import { cleanTypeScriptSyntax } from '../utils/typeScriptCleaner';

/**
 * Custom hook to create method handlers from component.methods
 */
export function useMethodHandlers(
    uiComponent: UIComponent,
    componentStatesRef: React.RefObject<Record<string, any>>,
    setState: (key: string, value: any) => void
) {
    return React.useMemo(() => {
        const handlers: Record<string, Function> = {};

        if (uiComponent.methods) {
            for (const [methodName, methodDef] of Object.entries(uiComponent.methods)) {
                if (methodDef.fn) {
                    try {
                        const fnString = cleanTypeScriptSyntax(methodDef.fn);

                        handlers[methodName] = (...args: any[]) => {
                            try {
                                const currentStates = componentStatesRef.current;
                                const context = {
                                    ...uiComponent.data || {},
                                    ...currentStates,
                                    states: currentStates,
                                    props: uiComponent.props || {},
                                    setState,
                                    ...handlers,
                                    console, Math, Date, String, Number, Boolean, Array, Object, JSON, window
                                };

                                const paramNames = Object.keys(context);
                                const paramValues = Object.values(context);
                                paramNames.push('args');
                                paramValues.push(args);

                                try {
                                    const func = new Function(...paramNames, `
                                        "use strict";
                                        return (${fnString})(...args);
                                    `);
                                    return func(...paramValues);
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
    }, [uiComponent.methods, uiComponent.data, uiComponent.props, setState, componentStatesRef]);
}
