import { UIComponent, UIElement } from '../types/dsl'

/**
 * Comprehensive utility functions for working with UIComponent schema
 * These functions abstract away the schema structure, making the code maintainable
 * and easy to update when schema changes occur.
 */

// ==================== BASIC GETTERS ====================

/**
 * Get the render element from a UIComponent
 */
export function getRenderElement(component: UIComponent): UIElement | undefined {
	return component.render
}

/**
 * Get children from a UIComponent
 */
export function getChildren(component: UIComponent): any {
	return component.render?.children
}

/**
 * Get component type from a UIComponent
 */
export function getType(component: UIComponent): string | undefined {
	return component.render?.type
}

/**
 * Get type from UIComponent or UIElement
 */
export function getElementType(componentOrElement: UIComponent | UIElement | any): string | undefined {
	if (!componentOrElement || typeof componentOrElement !== 'object') return undefined

	if ('render' in componentOrElement) {
		// UIComponent
		return getType(componentOrElement as UIComponent)
	} else {
		// UIElement or other
		return componentOrElement.type
	}
}

/**
 * Get component props from a UIComponent
 */
export function getProps(component: UIComponent): Record<string, any> | undefined {
	return component.render?.props
}

/**
 * Check if component has navigable children (UIComponent or UIElement with id/type)
 */
export function hasChildren(component: UIComponent): boolean {
	const children = getChildren(component)
	return hasNavigableChildrenInArray(children)
}

/**
 * Check if any component/element has navigable children
 * Works with both UIComponent and UIElement
 */
export function hasNavigableChildren(componentOrElement: UIComponent | UIElement | any): boolean {
	if (!componentOrElement || typeof componentOrElement !== 'object') return false

	let children: any
	if ('render' in componentOrElement) {
		// This is a UIComponent
		children = getChildren(componentOrElement as UIComponent)
	} else {
		// This is a UIElement or other object
		children = componentOrElement.children
	}

	return hasNavigableChildrenInArray(children)
}

/**
 * Check if a children value has navigable elements
 */
function hasNavigableChildrenInArray(children: any): boolean {
	if (!children) return false

	if (Array.isArray(children)) {
		return children.some(child => isNavigableChild(child))
	}

	return isNavigableChild(children)
}

/**
 * Check if a child is navigable (UIComponent or UIElement with id and type)
 */
function isNavigableChild(child: any): boolean {
	if (!child || typeof child !== 'object') return false

	// UIComponent (has render property)
	if ('render' in child && child.render && typeof child.render === 'object') {
		return true
	}

	// UIElement (has id and type)
	if ('id' in child && 'type' in child && typeof child.id === 'string' && typeof child.type === 'string') {
		return true
	}

	return false
}

/**
 * Check if a child at given index is a UIComponent (not a string)
 */
export function isChildComponent(component: UIComponent, index: number): boolean {
	const children = getChildren(component)
	if (!Array.isArray(children) || index >= children.length) return false
	return typeof children[index] === 'object' && children[index] !== null
}

// ==================== BASIC SETTERS ====================

/**
 * Set children for a UIComponent
 */
export function setChildren(component: UIComponent, children: any): UIComponent {
	const updated = { ...component }
	if (!updated.render) {
		updated.render = { id: component.id + '_render', type: 'div' }
	} else {
		updated.render = { ...updated.render }
	}
	updated.render.children = children
	return updated
}

/**
 * Set component type for a UIComponent
 */
export function setType(component: UIComponent, type: string): UIComponent {
	const updated = { ...component }
	if (!updated.render) {
		updated.render = { id: component.id + '_render', type }
	} else {
		updated.render = { ...updated.render, type }
	}
	return updated
}

/**
 * Set component props for a UIComponent
 */
export function setProps(component: UIComponent, props: Record<string, any>): UIComponent {
	const updated = { ...component }
	if (!updated.render) {
		updated.render = { id: component.id + '_render', type: 'div' }
	} else {
		updated.render = { ...updated.render }
	}
	updated.render.props = props
	return updated
}

// ==================== ARRAY OPERATIONS ====================

/**
 * Get children as array (always returns array, empty if none)
 */
export function getChildrenArray(component: UIComponent): any[] {
	const children = getChildren(component)
	if (Array.isArray(children)) return children
	if (children !== undefined) return [children]
	return []
}

/**
 * Get only navigable children as array (UIComponent or UIElement with id/type)
 */
export function getNavigableChildrenArray(component: UIComponent): any[] {
	const children = getChildren(component)
	const allChildren = Array.isArray(children) ? children : (children !== undefined ? [children] : [])
	return allChildren.filter(child => isNavigableChild(child))
}

/**
 * Add child to component
 */
export function addChild(component: UIComponent, child: any): UIComponent {
	const currentChildren = getChildrenArray(component)
	return setChildren(component, [...currentChildren, child])
}

/**
 * Remove child at index
 */
export function removeChildAtIndex(component: UIComponent, index: number): UIComponent {
	const currentChildren = getChildrenArray(component)
	if (index < 0 || index >= currentChildren.length) return component

	const newChildren = [...currentChildren]
	newChildren.splice(index, 1)
	return setChildren(component, newChildren)
}

/**
 * Replace child at index
 */
export function replaceChildAtIndex(component: UIComponent, index: number, newChild: any): UIComponent {
	const currentChildren = getChildrenArray(component)
	if (index < 0 || index >= currentChildren.length) return component

	const newChildren = [...currentChildren]
	newChildren[index] = newChild
	return setChildren(component, newChildren)
}

/**
 * Insert child at index
 */
export function insertChildAtIndex(component: UIComponent, index: number, child: any): UIComponent {
	const currentChildren = getChildrenArray(component)
	const newChildren = [...currentChildren]
	newChildren.splice(index, 0, child)
	return setChildren(component, newChildren)
}

// ==================== PATH OPERATIONS ====================

/**
 * Find component by path in the tree
 * Path indices refer to navigable children only (skipping strings and non-navigable objects)
 */
export function findComponentByPath(schema: UIComponent, path: number[]): UIComponent | UIElement | null {
	if (path.length === 0) return schema

	let current: UIComponent | UIElement = schema
	for (const index of path) {
		// Get navigable children from current component/element
		let navigableChildren: any[]

		if ('render' in current) {
			// This is a UIComponent
			navigableChildren = getNavigableChildrenArray(current as UIComponent)
		} else {
			// This is a UIElement
			const elementChildren = (current as UIElement).children
			const allChildren = Array.isArray(elementChildren) ? elementChildren : (elementChildren !== undefined ? [elementChildren] : [])
			navigableChildren = allChildren.filter(child => isNavigableChild(child))
		}

		if (index >= navigableChildren.length) return null

		const child = navigableChildren[index]
		current = child as UIComponent | UIElement
	}
	return current
}

/**
 * Update component at path using a transform function
 */
export function updateComponentAtPath(
	schema: UIComponent,
	path: number[],
	transform: (component: UIComponent) => UIComponent
): UIComponent {
	if (path.length === 0) {
		return transform(schema)
	}

	const [firstIndex, ...restPath] = path
	const children = getChildrenArray(schema)

	if (firstIndex >= children.length || !isChildComponent(schema, firstIndex)) {
		return schema
	}

	const updatedChild = updateComponentAtPath(
		children[firstIndex] as UIComponent,
		restPath,
		transform
	)

	return replaceChildAtIndex(schema, firstIndex, updatedChild)
}

/**
 * Remove component at path
 */
export function removeComponentAtPath(schema: UIComponent, path: number[]): UIComponent {
	if (path.length === 0) {
		// Cannot remove root component, return as-is
		return schema
	}

	const parentPath = path.slice(0, -1)
	const childIndex = path[path.length - 1]

	return updateComponentAtPath(schema, parentPath, (parent) =>
		removeChildAtIndex(parent, childIndex)
	)
}

/**
 * Add component at path (as child of component at path)
 */
export function addComponentAtPath(schema: UIComponent, path: number[], newComponent: UIComponent): UIComponent {
	return updateComponentAtPath(schema, path, (target) =>
		addChild(target, newComponent)
	)
}

// ==================== CLONING AND ID GENERATION ====================

/**
 * Generate unique ID for components
 */
export function generateUniqueId(baseId: string): string {
	const timestamp = Date.now()
	const random = Math.random().toString(36).slice(2, 7)
	return `${baseId}_copy_${timestamp}_${random}`
}

/**
 * Deep clone component with new IDs
 */
export function cloneComponentWithNewIds(component: UIComponent): UIComponent {
	const cloned: UIComponent = {
		...component,
		id: generateUniqueId(component.id),
	}

	// Clone the render element if it exists
	if (component.render) {
		cloned.render = {
			...component.render,
			id: generateUniqueId(component.render.id || component.id + '_render'),
		}

		// Clone children recursively
		const children = getChildren(component)
		if (children !== undefined) {
			if (Array.isArray(children)) {
				cloned.render.children = children.map(child => {
					if (typeof child === 'string' || child === null) {
						return child
					}
					return cloneComponentWithNewIds(child as UIComponent)
				})
			} else {
				cloned.render.children = children
			}
		}
	}

	return cloned
}

/**
 * Clone element with new IDs (works with UIComponent or UIElement)
 */
export function cloneElementWithNewIds(componentOrElement: UIComponent | UIElement | any): UIComponent | UIElement | any {
	if (!componentOrElement || typeof componentOrElement !== 'object') {
		return componentOrElement
	}

	if ('render' in componentOrElement) {
		// This is a UIComponent
		return cloneComponentWithNewIds(componentOrElement as UIComponent)
	} else if ('id' in componentOrElement && 'type' in componentOrElement) {
		// This is a UIElement
		const cloned: UIElement = {
			...componentOrElement,
			id: generateUniqueId(componentOrElement.id),
		}

		// Recursively clone children
		if (componentOrElement.children) {
			if (Array.isArray(componentOrElement.children)) {
				cloned.children = componentOrElement.children.map((child: any) => cloneElementWithNewIds(child))
			} else {
				cloned.children = cloneElementWithNewIds(componentOrElement.children)
			}
		}

		return cloned
	} else {
		// Other types, return as-is
		return componentOrElement
	}
}

// ==================== VALIDATION ====================

/**
 * Validate if object is a valid UIComponent
 */
export function isValidUIComponent(obj: any): obj is UIComponent {
	return (
		obj &&
		typeof obj === 'object' &&
		typeof obj.id === 'string' &&
		(obj.render === undefined || (obj.render && typeof obj.render.type === 'string'))
	)
}

/**
 * Ensure component has valid render structure
 */
export function ensureValidRender(component: UIComponent): UIComponent {
	if (!component.render) {
		return {
			...component,
			render: {
				id: component.id + '_render',
				type: 'div'
			}
		}
	}
	return component
}

// ==================== COMPONENT INFORMATION ====================

/**
 * Get human-readable component info for debugging/display
 */
export function getComponentInfo(component: UIComponent): {
	id: string
	type: string
	hasChildren: boolean
	childCount: number
} {
	return {
		id: component.id,
		type: getType(component) || 'unknown',
		hasChildren: hasChildren(component),
		childCount: getChildrenArray(component).length
	}
}

/**
 * Get element info for debugging/display (works with UIComponent or UIElement)
 */
export function getElementInfo(componentOrElement: UIComponent | UIElement | any): {
	id: string
	type: string
	hasChildren: boolean
} {
	if ('render' in componentOrElement) {
		// UIComponent
		const info = getComponentInfo(componentOrElement as UIComponent)
		return {
			id: info.id,
			type: info.type,
			hasChildren: info.hasChildren
		}
	} else {
		// UIElement or other
		return {
			id: componentOrElement.id || 'unknown',
			type: componentOrElement.type || 'unknown',
			hasChildren: hasNavigableChildren(componentOrElement)
		}
	}
}

/**
 * Get component display name for UI
 */
export function getDisplayName(component: UIComponent): string {
	const type = getType(component)
	return type ? `${type} (${component.id})` : component.id
}

// ==================== SEARCH AND TRAVERSAL ====================

/**
 * Find all components matching a predicate
 */
export function findComponents(
	schema: UIComponent,
	predicate: (component: UIComponent, path: number[]) => boolean,
	currentPath: number[] = []
): Array<{ component: UIComponent; path: number[] }> {
	const results: Array<{ component: UIComponent; path: number[] }> = []

	if (predicate(schema, currentPath)) {
		results.push({ component: schema, path: [...currentPath] })
	}

	const children = getChildrenArray(schema)
	children.forEach((child, index) => {
		if (isValidUIComponent(child)) {
			results.push(
				...findComponents(child as UIComponent, predicate, [...currentPath, index])
			)
		}
	})

	return results
}

/**
 * Find component by ID
 */
export function findComponentById(schema: UIComponent, id: string): { component: UIComponent; path: number[] } | null {
	const results = findComponents(schema, (comp) => comp.id === id)
	return results.length > 0 ? results[0] : null
}

// ==================== EXPORT DEFAULT UTILITIES OBJECT ====================

export const SchemaUtils = {
	// Basic getters
	getRenderElement,
	getChildren,
	getType,
	getElementType,
	getProps,
	hasChildren,
	hasNavigableChildren,
	isChildComponent,
	getChildrenArray,
	getNavigableChildrenArray,

	// Basic setters
	setChildren,
	setType,
	setProps,

	// Array operations
	addChild,
	removeChildAtIndex,
	replaceChildAtIndex,
	insertChildAtIndex,

	// Path operations
	findComponentByPath,
	updateComponentAtPath,
	removeComponentAtPath,
	addComponentAtPath,

	// Cloning and IDs
	generateUniqueId,
	cloneComponentWithNewIds,
	cloneElementWithNewIds,

	// Validation
	isValidUIComponent,
	ensureValidRender,

	// Component info
	getComponentInfo,
	getElementInfo,
	getDisplayName,

	// Search and traversal
	findComponents,
	findComponentById,
}

export default SchemaUtils