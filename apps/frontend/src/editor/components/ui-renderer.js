import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
/**
 * Replace {{path.to.value}} in strings with actual values from `data`
 */
const resolveDataBinding = (text, data) => {
    if (!text || typeof text !== 'string' || !data)
        return text;
    const bindingRegex = /\{\{([^}]+)\}\}/g;
    return text.replace(bindingRegex, (match, path) => {
        try {
            const value = path.split('.').reduce((cur, key) => {
                if (cur === null || cur === undefined)
                    return '';
                if (!isNaN(Number(key))) {
                    const index = parseInt(key, 10);
                    return Array.isArray(cur) ? cur[index] : cur;
                }
                return cur[key];
            }, data);
            return value !== undefined && value !== null ? String(value) : '';
        }
        catch {
            return match;
        }
    });
};
const FLOWUIRenderer = ({ schema, data = null, handlers = {}, isStreaming = false, onRefresh }) => {
    const renderComponent = (component, contextData = data, key) => {
        // Handle text node
        if (typeof component === 'string') {
            return resolveDataBinding(component, contextData);
        }
        if (!component || typeof component !== 'object')
            return null;
        const { id, type, props = {}, children = [], binding, dataPath } = component;
        if (!type || typeof type !== 'string') {
            console.warn('Component missing type:', component);
            return null;
        }
        const normalizedType = type.toLowerCase().trim();
        // ✅ Only allow safe HTML tags
        const validHtmlTags = new Set([
            'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'button', 'input', 'textarea', 'select', 'option', 'label',
            'form', 'fieldset', 'legend', 'img', 'a', 'ul', 'ol', 'li',
            'table', 'thead', 'tbody', 'tr', 'td', 'th', 'nav', 'header',
            'footer', 'main', 'section', 'article', 'aside', 'br', 'hr',
            'strong', 'em', 'small', 'code', 'pre', 'blockquote', 'cite',
            'canvas', 'svg', 'video', 'audio', 'iframe', 'embed', 'object',
            'iconify-icon'
        ]);
        if (!validHtmlTags.has(normalizedType)) {
            console.warn('Invalid HTML tag:', normalizedType);
            return null;
        }
        try {
            // Get the appropriate data context
            let currentData = contextData;
            // If component has dataPath, navigate to that data
            if (dataPath && contextData) {
                currentData = dataPath.split('.').reduce((cur, key) => cur?.[key], contextData);
            }
            // Process props with data binding
            const processedProps = { ...props };
            Object.keys(processedProps).forEach(propKey => {
                if (typeof processedProps[propKey] === 'string') {
                    processedProps[propKey] = resolveDataBinding(processedProps[propKey], currentData);
                }
            });
            // Hook up handlers
            if (processedProps.onClick && typeof processedProps.onClick === 'string') {
                const fn = handlers[processedProps.onClick];
                processedProps.onClick = typeof fn === 'function'
                    ? fn
                    : () => console.warn(`Missing handler: ${processedProps.onClick}`);
            }
            // Add key for React reconciliation
            if (key !== undefined)
                processedProps.key = key;
            // Handle children rendering
            let renderedChildren = [];
            // 🔥 NEW: Handle binding on this component
            if (binding && currentData && currentData[binding]) {
                const boundData = currentData[binding];
                if (Array.isArray(boundData)) {
                    // For each item in the bound array, render all children with that item as context
                    boundData.forEach((item, index) => {
                        children.forEach((child, childIndex) => {
                            const childKey = `${binding}-${index}-${childIndex}`;
                            const renderedChild = renderComponent(child, item, childKey);
                            if (renderedChild) {
                                renderedChildren.push(renderedChild);
                            }
                        });
                    });
                }
                else {
                    // Single object binding
                    children.forEach((child, childIndex) => {
                        const childKey = `${binding}-${childIndex}`;
                        const renderedChild = renderComponent(child, boundData, childKey);
                        if (renderedChild) {
                            renderedChildren.push(renderedChild);
                        }
                    });
                }
            }
            else {
                // Regular children rendering (no binding)
                children.forEach((child, index) => {
                    const childKey = `child-${index}`;
                    const renderedChild = renderComponent(child, currentData, childKey);
                    if (renderedChild) {
                        renderedChildren.push(renderedChild);
                    }
                });
            }
            // Handle self-closing tags
            const selfClosingTags = new Set([
                'img', 'input', 'br', 'hr', 'meta', 'link',
                'area', 'base', 'col', 'embed', 'source', 'track', 'wbr', 'iconify-icon'
            ]);
            if (selfClosingTags.has(normalizedType)) {
                if (normalizedType === 'iconify-icon') {
                    return React.createElement('iconify-icon', {
                        ...processedProps,
                        icon: processedProps.icon || processedProps.iconName
                    });
                }
                return React.createElement(normalizedType, processedProps);
            }
            return React.createElement(normalizedType, processedProps, renderedChildren.length > 0 ? renderedChildren : null);
        }
        catch (error) {
            console.error('Render error:', error, 'Component:', component);
            return (_jsx("div", { className: "p-2 border border-red-300 bg-red-50 rounded text-sm", children: _jsxs("span", { className: "text-red-600", children: ["Error rendering component: ", id] }) }));
        }
    };
    if (!schema) {
        return (_jsx("div", { className: "p-4 text-gray-500", children: "No UI schema provided" }));
    }
    try {
        return (_jsxs("div", { className: "generated-ui relative", children: [schema.query && onRefresh && (_jsx("button", { onClick: onRefresh, className: "absolute top-2 right-2 z-10 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors", type: "button", children: "\uD83D\uDD04 Refresh" })), renderComponent(schema, data, 'root')] }));
    }
    catch (error) {
        console.error('UIRenderer top-level error:', error);
        return (_jsxs("div", { className: "generated-ui p-4 border border-red-300 bg-red-50 rounded", children: [_jsx("p", { className: "text-red-600 font-medium", children: "Error rendering UI" }), _jsx("p", { className: "text-red-500 text-sm mt-1", children: "Check console for details" }), _jsxs("details", { className: "mt-2", children: [_jsx("summary", { className: "cursor-pointer text-sm", children: "Debug Info" }), _jsxs("pre", { className: "text-xs bg-gray-100 p-2 mt-1 rounded overflow-auto", children: ["Schema: ", JSON.stringify(schema, null, 2), '\n', "Data: ", JSON.stringify(data, null, 2)] })] })] }));
    }
};
export default FLOWUIRenderer;
