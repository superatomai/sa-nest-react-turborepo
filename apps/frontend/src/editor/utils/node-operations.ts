import { UIComponent, UIElement } from '../../types/dsl'


/**
 * Find and optionally update a node by ID in the schema tree
 * @param schema - The root schema to search/update
 * @param nodeId - The ID of the node to find
 * @param update - Optional update object with new text and className
 * @returns The found node (if only searching) or updated schema (if updating)
 */
export function findAndUpdateNode(
  schema: UIComponent | UIElement | any,
  nodeId: string,
  update?: {
    text?: string
    className?: string
  }
): {
  node?: UIComponent | UIElement | null
  updatedSchema?: UIComponent | UIElement | any
} {
  // Helper function to recursively process nodes
  const processNode = (
    current: any,
    shouldUpdate: boolean
  ): any => {
    if (!current || typeof current !== 'object') {
      return shouldUpdate ? current : null
    }

    // Check if this is the target node
    if (current.id === nodeId) {
      if (!shouldUpdate) {
        // Just finding - return the node
        return current
      }

      // Updating - create updated node
      const updated = { ...current }

      if (update) {
        // Update className in props if it exists
        if (update.className !== undefined) {
          if ('props' in updated) {
            updated.props = {
              ...updated.props,
              className: update.className
            }
          } else {
            updated.className = update.className
          }
        }

        // Update text - ONLY if the node actually has string content (not child components)
        if (update.text !== undefined) {
          // For DSL nodes, text is usually in the direct 'children' property
          if ('children' in updated && typeof updated.children === 'string') {
            updated.children = update.text
          }
          // Fallback: check if text is in props.children
          else if ('props' in updated && typeof updated.props?.children === 'string') {
            updated.props = {
              ...updated.props,
              children: update.text
            }
          }
          // DO NOT update children if it's an array/object - this preserves child components
          // Only update if we're sure this node should have string content
        }
      }

      return updated
    }

    // Process children recursively
    if (!shouldUpdate) {
      // Just finding - search in children
      let children: any[] = []

      if ('render' in current && current.render) {
        const renderChildren = current.render.children
        children = Array.isArray(renderChildren) ? renderChildren : (renderChildren ? [renderChildren] : [])
      } else if ('children' in current) {
        children = Array.isArray(current.children) ? current.children : (current.children ? [current.children] : [])
      }

      for (const child of children) {
        const found = processNode(child, false)
        if (found) return found
      }

      return null
    } else {
      // Updating - create updated structure with processed children
      const updated = { ...current }

      if ('render' in updated && updated.render) {
        const renderChildren = updated.render.children
        if (Array.isArray(renderChildren)) {
          updated.render = {
            ...updated.render,
            children: renderChildren.map(child =>
              child && typeof child === 'object' ? processNode(child, true) : child
            )
          }
        } else if (renderChildren && typeof renderChildren === 'object') {
          updated.render = {
            ...updated.render,
            children: processNode(renderChildren, true)
          }
        }
      } else if ('children' in updated) {
        if (Array.isArray(updated.children)) {
          updated.children = updated.children.map(child =>
            child && typeof child === 'object' ? processNode(child, true) : child
          )
        } else if (updated.children && typeof updated.children === 'object') {
          updated.children = processNode(updated.children, true)
        }
      }

      return updated
    }
  }

  // If update is provided, update the schema
  if (update) {
    return {
      updatedSchema: processNode(schema, true)
    }
  }

  // Otherwise, just find the node
  return {
    node: processNode(schema, false)
  }
}

/**
 * Convenience function to just find a node by ID
 */
export function findNodeById(
  schema: UIComponent | UIElement | any,
  nodeId: string
): UIComponent | UIElement | null {
  const { node } = findAndUpdateNode(schema, nodeId)
  return node || null
}

/**
 * Convenience function to update a node by ID
 */
export function updateNodeById(
  schema: UIComponent | UIElement | any,
  nodeId: string,
  text: string,
  className: string
): UIComponent | UIElement | any {
  const { updatedSchema } = findAndUpdateNode(schema, nodeId, { text, className })
  return updatedSchema || schema
}