import React from 'react';
import { UIComponent } from '@/types/dsl';
import { DataResolver } from '../utils/DataResolver';

/**
 * Custom hook to manage component state
 */
export function useComponentState(uiComponent: UIComponent) {
    const resolver = React.useMemo(() => new DataResolver(), []);

    const [componentStates, setComponentStates] = React.useState<Record<string, any>>(() => {
        const initialStates: Record<string, any> = {};
        if (uiComponent.states) {
            for (const [key, value] of Object.entries(uiComponent.states)) {
                const initialContext = {
                    ...uiComponent.data || {},
                    props: uiComponent.props || {}
                };
                initialStates[key] = resolver.resolveValue(value, initialContext);
            }
        }
        return initialStates;
    });

    const componentStatesRef = React.useRef(componentStates);
    React.useEffect(() => {
        componentStatesRef.current = componentStates;
    }, [componentStates]);

    const setState = React.useCallback((key: string, value: any) => {
        setComponentStates(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);

    return { componentStates, componentStatesRef, setState };
}
