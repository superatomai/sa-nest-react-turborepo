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

	// Special handling for for loops - if element has 'for' property, it will have dynamic children
	if ('for' in componentOrElement && componentOrElement.for) {
		console.log('📍 hasNavigableChildren: Found for loop, returning true')
		return true
	}

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
 * Update element at path using a transform function (works with both UIComponent and UIElement)
 */
export function updateElementAtPath(
	schema: UIComponent,
	path: number[],
	transform: (element: UIComponent | UIElement) => UIComponent | UIElement
): UIComponent {
	if (path.length === 0) {
		return transform(schema) as UIComponent
	}

	const [firstIndex, ...restPath] = path

	// Get navigable children
	const navigableChildren = getNavigableChildrenArray(schema)
	if (firstIndex >= navigableChildren.length) {
		return schema
	}

	const childToUpdate = navigableChildren[firstIndex]

	// Recursively update the child
	let updatedChild: UIComponent | UIElement
	if ('render' in childToUpdate) {
		// Child is UIComponent
		updatedChild = updateElementAtPath(childToUpdate as UIComponent, restPath, transform)
	} else {
		// Child is UIElement
		if (restPath.length === 0) {
			// We've reached the target element
			updatedChild = transform(childToUpdate)
		} else {
			// Continue traversing
			updatedChild = updateElementInChildren(childToUpdate as UIElement, restPath, transform)
		}
	}

	// Replace the child in the parent
	const allChildren = getChildrenArray(schema)
	const newChildren = [...allChildren]

	// Find the actual index in all children (including non-navigable ones)
	let actualIndex = 0
	let navigableIndex = 0
	for (let i = 0; i < allChildren.length; i++) {
		if (isNavigableChild(allChildren[i])) {
			if (navigableIndex === firstIndex) {
				actualIndex = i
				break
			}
			navigableIndex++
		}
	}

	newChildren[actualIndex] = updatedChild
	return setChildren(schema, newChildren)
}

/**
 * Helper function to update element within UIElement children
 */
function updateElementInChildren(
	element: UIElement,
	path: number[],
	transform: (element: UIComponent | UIElement) => UIComponent | UIElement
): UIElement {
	const [firstIndex, ...restPath] = path

	const elementChildren = element.children
	const allChildren = Array.isArray(elementChildren) ? elementChildren : (elementChildren !== undefined ? [elementChildren] : [])
	const navigableChildren = allChildren.filter(child => isNavigableChild(child))

	if (firstIndex >= navigableChildren.length) {
		return element
	}

	const childToUpdate = navigableChildren[firstIndex]

	// Recursively update the child
	let updatedChild: UIComponent | UIElement
	if ('render' in childToUpdate) {
		// Child is UIComponent
		updatedChild = updateElementAtPath(childToUpdate as UIComponent, restPath, transform)
	} else {
		// Child is UIElement
		if (restPath.length === 0) {
			updatedChild = transform(childToUpdate)
		} else {
			updatedChild = updateElementInChildren(childToUpdate as UIElement, restPath, transform)
		}
	}

	// Replace the child
	const newChildren = [...allChildren]

	// Find the actual index
	let actualIndex = 0
	let navigableIndex = 0
	for (let i = 0; i < allChildren.length; i++) {
		if (isNavigableChild(allChildren[i])) {
			if (navigableIndex === firstIndex) {
				actualIndex = i
				break
			}
			navigableIndex++
		}
	}

	newChildren[actualIndex] = updatedChild

	return {
		...element,
		children: newChildren.length === 1 ? newChildren[0] : newChildren
	} as UIElement
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

	return updateElementAtPath(schema, parentPath, (parent) => {
		if ('render' in parent) {
			// UIComponent
			return removeChildAtIndex(parent as UIComponent, childIndex)
		} else {
			// UIElement
			const elementChildren = (parent as UIElement).children
			const children = Array.isArray(elementChildren) ? elementChildren : (elementChildren !== undefined ? [elementChildren] : [])

			if (childIndex >= children.length) return parent

			const newChildren = [...children]
			newChildren.splice(childIndex, 1)

			return {
				...parent,
				children: newChildren.length === 1 ? newChildren[0] : newChildren
			} as UIElement
		}
	})
}

/**
 * Add component at path (as child of component at path)
 */
export function addComponentAtPath(schema: UIComponent, path: number[], newComponent: UIComponent | UIElement): UIComponent {
	return updateElementAtPath(schema, path, (target) => {
		if ('render' in target) {
			// UIComponent
			return addChild(target as UIComponent, newComponent)
		} else {
			// UIElement
			const elementChildren = (target as UIElement).children
			const children = Array.isArray(elementChildren) ? elementChildren : (elementChildren !== undefined ? [elementChildren] : [])
			const newChildren = [...children, newComponent]

			return {
				...target,
				children: newChildren.length === 1 ? newChildren[0] : newChildren
			} as UIElement
		}
	})
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

// ==================== SIBLING NAVIGATION ====================

/**
 * Get siblings at a specific path (returns navigable children of the parent)
 */
export function getSiblingsAtPath(schema: UIComponent, path: number[]): (UIComponent | UIElement)[] {
	if (path.length === 0) {
		// Root level - no siblings, return empty array
		return []
	}

	// Get parent path and find parent component
	const parentPath = path.slice(0, -1)
	const parent = findComponentByPath(schema, parentPath)

	if (!parent) return []

	// Special handling for for loops - return empty array, let keyboard navigation handle it dynamically
	if ('for' in parent && parent.for) {
		console.log('📍 getSiblingsAtPath: Found for loop parent, using dynamic navigation')
		// Return empty array - for loop navigation will be handled by keyboard navigation logic
		return []
	}

	// Get navigable children from parent
	if ('render' in parent) {
		// Parent is UIComponent
		return getNavigableChildrenArray(parent as UIComponent)
	} else {
		// Parent is UIElement
		const parentChildren = (parent as UIElement).children
		const allChildren = Array.isArray(parentChildren) ? parentChildren : (parentChildren !== undefined ? [parentChildren] : [])
		return allChildren.filter(child => isNavigableChild(child))
	}
}

/**
 * Find the index of a sibling with the given ID
 */
export function findSiblingIndex(siblings: (UIComponent | UIElement)[], componentId: string): number {
	return siblings.findIndex(sibling => {
		if ('render' in sibling) {
			// UIComponent
			return sibling.id === componentId
		} else {
			// UIElement
			return sibling.id === componentId
		}
	})
}

/**
 * Get the next sibling in a given direction
 */
export function getNextSibling(
	schema: UIComponent,
	currentPath: number[],
	direction: 'next' | 'previous'
): { sibling: UIComponent | UIElement; path: number[] } | null {
	const siblings = getSiblingsAtPath(schema, currentPath)
	if (siblings.length <= 1) return null

	const currentIndex = currentPath[currentPath.length - 1]
	let nextIndex: number

	if (direction === 'next') {
		nextIndex = currentIndex >= siblings.length - 1 ? 0 : currentIndex + 1
	} else {
		nextIndex = currentIndex <= 0 ? siblings.length - 1 : currentIndex - 1
	}

	const nextSibling = siblings[nextIndex]
	if (!nextSibling) return null

	const parentPath = currentPath.slice(0, -1)
	const nextPath = [...parentPath, nextIndex]

	return { sibling: nextSibling, path: nextPath }
}

/**
 * Move element to a new position within its siblings (works with nested UIElements)
 */
export function moveElementInSiblings(
	schema: UIComponent,
	elementPath: number[],
	direction: 'up' | 'down' | 'left' | 'right'
): UIComponent {
	if (elementPath.length === 0) {
		// Cannot move root element
		return schema
	}

	const parentPath = elementPath.slice(0, -1)
	const currentIndex = elementPath[elementPath.length - 1]

	// Helper function to move within any element (UIComponent or UIElement)
	const moveWithinElement = (element: UIComponent | UIElement): UIComponent | UIElement => {
		let children: any[]
		let navigableChildren: any[]

		if ('render' in element) {
			// UIComponent
			children = getChildrenArray(element as UIComponent)
			navigableChildren = getNavigableChildrenArray(element as UIComponent)
		} else {
			// UIElement
			const elementChildren = (element as UIElement).children
			children = Array.isArray(elementChildren) ? elementChildren : (elementChildren !== undefined ? [elementChildren] : [])
			navigableChildren = children.filter(child => isNavigableChild(child))
		}

		if (navigableChildren.length <= 1) {
			return element
		}

		let newIndex: number
		switch (direction) {
			case 'up':
			case 'left':
				newIndex = currentIndex === 0 ? navigableChildren.length - 1 : currentIndex - 1
				break
			case 'down':
			case 'right':
				newIndex = currentIndex === navigableChildren.length - 1 ? 0 : currentIndex + 1
				break
			default:
				return element
		}

		// Find actual indices in the children array
		let currentActualIndex = -1
		let newActualIndex = -1
		let navigableIdx = 0

		for (let i = 0; i < children.length; i++) {
			if (isNavigableChild(children[i])) {
				if (navigableIdx === currentIndex) {
					currentActualIndex = i
				}
				if (navigableIdx === newIndex) {
					newActualIndex = i
				}
				navigableIdx++
			}
		}

		if (currentActualIndex === -1 || newActualIndex === -1) {
			return element
		}

		// Swap the elements in the actual children array
		const newChildren = [...children]
		const elementToMove = newChildren[currentActualIndex]
		const targetElement = newChildren[newActualIndex]

		newChildren[currentActualIndex] = targetElement
		newChildren[newActualIndex] = elementToMove

		// Return updated element
		if ('render' in element) {
			// UIComponent
			return setChildren(element as UIComponent, newChildren)
		} else {
			// UIElement
			return {
				...element,
				children: newChildren.length === 1 ? newChildren[0] : newChildren
			} as UIElement
		}
	}

	// Use the general update function for nested paths
	return updateElementAtPath(schema, parentPath, moveWithinElement)
}

/**
 * Get the new path after moving an element
 */
export function getNewPathAfterMove(
	elementPath: number[],
	direction: 'up' | 'down' | 'left' | 'right',
	siblingCount: number
): number[] {
	if (elementPath.length === 0) return elementPath

	const parentPath = elementPath.slice(0, -1)
	const currentIndex = elementPath[elementPath.length - 1]

	let newIndex: number
	switch (direction) {
		case 'up':
		case 'left':
			newIndex = currentIndex === 0 ? siblingCount - 1 : currentIndex - 1
			break
		case 'down':
		case 'right':
			newIndex = currentIndex === siblingCount - 1 ? 0 : currentIndex + 1
			break
		default:
			return elementPath
	}

	return [...parentPath, newIndex]
}

/**
 * Get the first navigable child of an element
 */
export function getFirstNavigableChild(
	schema: UIComponent,
	elementPath: number[]
): { child: UIComponent | UIElement; path: number[] } | null {
	console.log('🔍 getFirstNavigableChild called:', { elementPath })

	const element = findComponentByPath(schema, elementPath)
	console.log('📍 Found element:', element ? (element.id || 'unknown') : 'null')

	if (!element) return null

	// Special handling for for loops - create a virtual first child
	if ('for' in element && element.for) {
		console.log('📍 getFirstNavigableChild: Found for loop, creating virtual first child')

		// Create a virtual child representing the first loop item
		const virtualChild = {
			...element,
			for: undefined, // Remove for property
			id: `${element.id}-0` // First loop item ID
		} as UIElement

		const childPath = [...elementPath, 0]
		console.log('✅ Returning virtual for loop child:', { childId: virtualChild.id, childPath })

		return { child: virtualChild, path: childPath }
	}

	let navigableChildren: any[]

	if ('render' in element) {
		// UIComponent
		navigableChildren = getNavigableChildrenArray(element as UIComponent)
		console.log('📍 UIComponent navigable children:', navigableChildren.length, navigableChildren.map(c => c.id))
	} else {
		// UIElement
		const elementChildren = (element as UIElement).children
		const allChildren = Array.isArray(elementChildren) ? elementChildren : (elementChildren !== undefined ? [elementChildren] : [])
		navigableChildren = allChildren.filter(child => isNavigableChild(child))
		console.log('📍 UIElement navigable children:', navigableChildren.length, navigableChildren.map(c => c.id))
	}

	if (navigableChildren.length === 0) {
		console.log('❌ No navigable children found')
		return null
	}

	const firstChild = navigableChildren[0]
	const childPath = [...elementPath, 0]

	console.log('✅ Returning first child:', { childId: firstChild.id, childPath })

	return { child: firstChild, path: childPath }
}

/**
 * Get the parent element of the current selection
 */
export function getParentElement(
	schema: UIComponent,
	elementPath: number[]
): { parent: UIComponent | UIElement; path: number[] } | null {
	if (elementPath.length === 0) {
		// Already at root level
		return null
	}

	const parentPath = elementPath.slice(0, -1)
	const parent = findComponentByPath(schema, parentPath)

	if (!parent) return null

	return { parent, path: parentPath }
}

/**
 * Check if an element has navigable children
 */
export function hasNavigableChildrenAtPath(
	schema: UIComponent,
	elementPath: number[]
): boolean {
	const element = findComponentByPath(schema, elementPath)
	if (!element) return false

	return hasNavigableChildren(element)
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
	updateElementAtPath,
	removeComponentAtPath,
	addComponentAtPath,

	// Cloning and IDs
	generateUniqueId,
	cloneComponentWithNewIds,
	cloneElementWithNewIds,

	// Validation
	isValidUIComponent,
	ensureValidRender,
	isNavigableChild,

	// Component info
	getComponentInfo,
	getElementInfo,
	getDisplayName,

	// Search and traversal
	findComponents,
	findComponentById,

	// Sibling navigation
	getSiblingsAtPath,
	findSiblingIndex,
	getNextSibling,

	// Element movement
	moveElementInSiblings,
	getNewPathAfterMove,

	// Navigation drilling
	getFirstNavigableChild,
	getParentElement,
	hasNavigableChildrenAtPath,
}

export default SchemaUtils