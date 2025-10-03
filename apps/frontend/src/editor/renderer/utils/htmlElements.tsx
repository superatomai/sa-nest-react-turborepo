import React from 'react';

/**
 * HTML Element Rendering Map
 * Centralized mapping of DSL element types to React elements
 */

type ElementRenderer = (key: any, props: any, children: React.ReactNode) => React.ReactElement;

export const HTML_ELEMENTS: Record<string, ElementRenderer> = {
    'view': (key, props, children) => <div key={key} {...props}>{children}</div>,
    'div': (key, props, children) => <div key={key} {...props}>{children}</div>,
    'text': (key, props, children) => <span key={key} {...props}>{children}</span>,
    'span': (key, props, children) => <span key={key} {...props}>{children}</span>,
    'button': (key, props, children) => <button key={key} {...props}>{children}</button>,
    'input': (key, props, _children) => <input key={key} {...props} />,
    'select': (key, props, children) => <select key={key} {...props}>{children}</select>,
    'option': (key, props, children) => <option key={key} {...props}>{children}</option>,
    'h1': (key, props, children) => <h1 key={key} {...props}>{children}</h1>,
    'h2': (key, props, children) => <h2 key={key} {...props}>{children}</h2>,
    'h3': (key, props, children) => <h3 key={key} {...props}>{children}</h3>,
    'p': (key, props, children) => <p key={key} {...props}>{children}</p>,
    'ul': (key, props, children) => <ul key={key} {...props}>{children}</ul>,
    'li': (key, props, children) => <li key={key} {...props}>{children}</li>,
    'img': (key, props, _children) => <img key={key} {...props} alt={props.alt || ''} />,
    'a': (key, props, children) => <a key={key} {...props}>{children}</a>,
    'header': (key, props, children) => <header key={key} {...props}>{children}</header>,
    'section': (key, props, children) => <section key={key} {...props}>{children}</section>,
    'footer': (key, props, children) => <footer key={key} {...props}>{children}</footer>,
    'table': (key, props, children) => <table key={key} {...props}>{children}</table>,
    'thead': (key, props, children) => <thead key={key} {...props}>{children}</thead>,
    'tbody': (key, props, children) => <tbody key={key} {...props}>{children}</tbody>,
    'tr': (key, props, children) => <tr key={key} {...props}>{children}</tr>,
    'th': (key, props, children) => <th key={key} {...props}>{children}</th>,
    'td': (key, props, children) => <td key={key} {...props}>{children}</td>,
    'svg': (key, props, children) => <svg key={key} {...props}>{children}</svg>,
    'path': (key, props, _children) => <path key={key} {...props} />,
    'circle': (key, props, _children) => <circle key={key} {...props} />,
    'rect': (key, props, _children) => <rect key={key} {...props} />,
    'line': (key, props, _children) => <line key={key} {...props} />,
    'polygon': (key, props, _children) => <polygon key={key} {...props} />,
    'polyline': (key, props, _children) => <polyline key={key} {...props} />,
    'g': (key, props, children) => <g key={key} {...props}>{children}</g>,
    'form': (key, props, children) => <form key={key} {...props}>{children}</form>,
};

/**
 * Elements that should have animations applied in dev mode
 */
export const ANIMATABLE_ELEMENTS = new Set([
    'view', 'div', 'span', 'text', 'button', 'input', 'select', 'option',
    'h1', 'h2', 'h3', 'p', 'ul', 'li', 'img', 'a', 'form',
    'table', 'tbody', 'tr', 'td', 'section', 'header', 'footer'
]);

/**
 * Elements that should not have a container wrapper when used in loops
 */
export const NO_CONTAINER_ELEMENTS = new Set(['option']);

/**
 * Check if element type should have animation applied
 */
export function shouldApplyAnimation(elementType: string): boolean {
    return ANIMATABLE_ELEMENTS.has(elementType.toLowerCase()) ||
        elementType.charAt(0) === elementType.charAt(0).toUpperCase(); // Custom components
}

/**
 * Render an HTML element using the element map
 */
export function renderHTMLElement(
    type: string,
    key: any,
    props: any,
    children: React.ReactNode
): React.ReactElement {
    const renderer = HTML_ELEMENTS[type.toLowerCase()];
    if (renderer) {
        return renderer(key, props, children);
    }
    // Default fallback
    return <div key={key} {...props}>{children}</div>;
}
