import React from 'react';
import { motion } from 'framer-motion';
import { editorModeStore } from '../../../stores/mobx_editor_mode_store';
import { shouldApplyAnimation } from './htmlElements';

/**
 * Animation configurations for smooth element movement
 */
export const getAnimationConfig = (elementKey: string | number) => ({
    layout: true,
    layoutId: `element-${elementKey}`,
    transition: {
        type: "spring" as const,
        damping: 25,
        stiffness: 400,
        duration: 0.3,
        bounce: 0.1,
        layout: {
            type: "spring" as const,
            damping: 30,
            stiffness: 500,
            duration: 0.2
        }
    },
    style: {
        willChange: 'transform',
    }
});

/**
 * Higher-order component for conditional animation wrapping
 */
export const withConditionalAnimation = (
    component: React.ReactNode,
    elementType: string,
    elementKey?: string | number
): React.ReactNode => {
    // Only apply animations in dev mode
    if (!editorModeStore.isDev) {
        return component;
    }

    // Only animate specific elements for performance
    if (!shouldApplyAnimation(elementType)) {
        return component;
    }

    const animConfig = getAnimationConfig(elementKey || 'default');
    return (
        <motion.div
            key={elementKey}
            {...animConfig}
            style={{ display: 'contents' }}
        >
            {component}
        </motion.div>
    );
};
