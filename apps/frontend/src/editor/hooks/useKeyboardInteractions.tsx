import { useEffect, useCallback } from 'react'
import { useNodeSelection } from './useNodeSelection'
import { SchemaUtils } from '../../utils/schema-utilities'
import { UIComponent, UIElement } from '../../types/dsl'

interface KeyboardInteractionsConfig {
  enabled: boolean
  allowArrowNavigation?: boolean
  allowCopyPaste?: boolean
  allowDelete?: boolean
}

export const useKeyboardInteractions = (
  config: KeyboardInteractionsConfig = { enabled: true }
) => {
  const {
    isSelectionEnabled,
    selectedNode,
    selectionLevel,
    copiedNode,
    rootSchema,
    clearSelection,
    navigateToParent,
    navigateToChildren,
    copySelectedNode,
    cutSelectedNode,
    pasteAsChild,
    deleteSelectedNode,
    selectNode,
    onSchemaUpdate
  } = useNodeSelection()

  // Move element and update selection
  const moveElementAndUpdateSelection = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!selectedNode || !rootSchema || !onSchemaUpdate) return

    // Check if element can be moved (has siblings)
    const siblings = SchemaUtils.getSiblingsAtPath(rootSchema, selectedNode.path)
    if (!siblings || siblings.length <= 1) return

    // Move the element in the schema
    const updatedSchema = SchemaUtils.moveElementInSiblings(rootSchema, selectedNode.path, direction)

    // Calculate the new path for the moved element
    const newPath = SchemaUtils.getNewPathAfterMove(
      selectedNode.path,
      direction,
      siblings.length
    )

    // Update the schema first (this will trigger re-render)
    onSchemaUpdate(updatedSchema, 'move')

    // Update selection to follow the moved element
    selectNode(selectedNode.componentId, newPath)
  }, [selectedNode, selectNode, rootSchema, onSchemaUpdate])

  // Drill into selected element's first child
  const drillIntoFirstChild = useCallback(() => {
    if (!selectedNode || !rootSchema) {
      console.log('❌ Drill blocked: missing requirements', { selectedNode, rootSchema: !!rootSchema })
      return
    }

    console.log('🔍 Attempting to drill into:', {
      componentId: selectedNode.componentId,
      path: selectedNode.path,
      currentSelectionLevel: selectionLevel
    })

    // Check if the selected element has navigable children
    const hasChildren = SchemaUtils.hasNavigableChildrenAtPath(rootSchema, selectedNode.path)
    console.log('📍 Has navigable children:', hasChildren)

    if (!hasChildren) {
      console.log('❌ No navigable children found')
      return
    }

    // Get the first navigable child BEFORE navigating
    const firstChild = SchemaUtils.getFirstNavigableChild(rootSchema, selectedNode.path)
    console.log('📍 First child found:', firstChild)

    if (!firstChild) {
      console.log('❌ Could not get first child')
      return
    }

    // Step 1: Navigate to children level (this increments selection level and clears selection)
    console.log('📍 Step 1: Navigating to children level')
    navigateToChildren()

    // Step 2: Select the first child at the new level
    // We need to use setTimeout to let the selection level update first
    setTimeout(() => {
      const childId = 'render' in firstChild.child ? firstChild.child.id : firstChild.child.id
      console.log('📍 Step 2: Selecting first child:', { childId, path: firstChild.path, newSelectionLevel: selectionLevel + 1 })
      selectNode(childId, firstChild.path)
    }, 0)
  }, [selectedNode, selectNode, rootSchema, selectionLevel, navigateToChildren])

  // Navigate to parent element
  const navigateUpToParent = useCallback(() => {
    if (!selectedNode || !rootSchema) {
      console.log('❌ Navigate to parent blocked: missing requirements')
      return
    }

    console.log('🔍 Attempting to navigate to parent:', {
      componentId: selectedNode.componentId,
      path: selectedNode.path,
      currentSelectionLevel: selectionLevel
    })

    // Get the parent element BEFORE navigating
    const parentInfo = SchemaUtils.getParentElement(rootSchema, selectedNode.path)
    console.log('📍 Parent found:', parentInfo)

    if (!parentInfo) {
      console.log('❌ No parent found - already at root')
      return
    }

    // Step 1: Navigate to parent level (this decrements selection level and clears selection)
    console.log('📍 Step 1: Navigating to parent level')
    navigateToParent()

    // Step 2: Select the parent at the new level
    setTimeout(() => {
      const parentId = 'render' in parentInfo.parent ? parentInfo.parent.id : parentInfo.parent.id
      console.log('📍 Step 2: Selecting parent:', { parentId, path: parentInfo.path, newSelectionLevel: selectionLevel - 1 })
      selectNode(parentId, parentInfo.path)
    }, 0)
  }, [selectedNode, selectNode, rootSchema, selectionLevel, navigateToParent])

  // Navigate to next sibling (Tab key)
  const navigateToNextSibling = useCallback(() => {
    if (!selectedNode || !rootSchema) {
      console.log('❌ Next sibling navigation blocked: missing requirements')
      return
    }

    console.log('🔍 Attempting to navigate to next sibling:', {
      componentId: selectedNode.componentId,
      path: selectedNode.path,
      currentSelectionLevel: selectionLevel
    })

    // Get siblings at the current level
    const siblings = SchemaUtils.getSiblingsAtPath(rootSchema, selectedNode.path)
    console.log('📍 Found siblings:', siblings?.length || 0)

    if (!siblings || siblings.length <= 1) {
      console.log('❌ No siblings or only one sibling')
      return
    }

    // Find current index in siblings
    const currentIndex = SchemaUtils.findSiblingIndex(siblings, selectedNode.componentId)
    console.log('📍 Current sibling index:', currentIndex)

    if (currentIndex === -1) {
      console.log('❌ Could not find current element in siblings')
      return
    }

    // Calculate next index (with wrapping)
    const nextIndex = currentIndex === siblings.length - 1 ? 0 : currentIndex + 1
    const nextSibling = siblings[nextIndex]

    console.log('📍 Next sibling index:', nextIndex, 'sibling:', nextSibling)

    if (!nextSibling) {
      console.log('❌ Next sibling not found')
      return
    }

    // Calculate the new path for the next sibling
    const parentPath = selectedNode.path.slice(0, -1)
    const newPath = [...parentPath, nextIndex]

    // Select the next sibling
    const siblingId = 'render' in nextSibling ? nextSibling.id : nextSibling.id
    console.log('✅ Selecting next sibling:', { siblingId, newPath })

    selectNode(siblingId, newPath)
  }, [selectedNode, selectNode, rootSchema, selectionLevel])

  // Navigate to previous sibling (Shift+Tab key)
  const navigateToPreviousSibling = useCallback(() => {
    if (!selectedNode || !rootSchema) {
      console.log('❌ Previous sibling navigation blocked: missing requirements')
      return
    }

    console.log('🔍 Attempting to navigate to previous sibling:', {
      componentId: selectedNode.componentId,
      path: selectedNode.path,
      currentSelectionLevel: selectionLevel
    })

    // Get siblings at the current level
    const siblings = SchemaUtils.getSiblingsAtPath(rootSchema, selectedNode.path)
    console.log('📍 Found siblings:', siblings?.length || 0)

    if (!siblings || siblings.length <= 1) {
      console.log('❌ No siblings or only one sibling')
      return
    }

    // Find current index in siblings
    const currentIndex = SchemaUtils.findSiblingIndex(siblings, selectedNode.componentId)
    console.log('📍 Current sibling index:', currentIndex)

    if (currentIndex === -1) {
      console.log('❌ Could not find current element in siblings')
      return
    }

    // Calculate previous index (with wrapping)
    const previousIndex = currentIndex === 0 ? siblings.length - 1 : currentIndex - 1
    const previousSibling = siblings[previousIndex]

    console.log('📍 Previous sibling index:', previousIndex, 'sibling:', previousSibling)

    if (!previousSibling) {
      console.log('❌ Previous sibling not found')
      return
    }

    // Calculate the new path for the previous sibling
    const parentPath = selectedNode.path.slice(0, -1)
    const newPath = [...parentPath, previousIndex]

    // Select the previous sibling
    const siblingId = 'render' in previousSibling ? previousSibling.id : previousSibling.id
    console.log('✅ Selecting previous sibling:', { siblingId, newPath })

    selectNode(siblingId, newPath)
  }, [selectedNode, selectNode, rootSchema, selectionLevel])

  // Duplicate selected element (Ctrl+D)
  const duplicateSelectedElement = useCallback(() => {
    if (!selectedNode || !rootSchema || !onSchemaUpdate) {
      console.log('❌ Duplication blocked: missing requirements', { selectedNode, rootSchema: !!rootSchema, onSchemaUpdate: !!onSchemaUpdate })
      return
    }

    console.log('🔍 Attempting to duplicate element:', {
      componentId: selectedNode.componentId,
      path: selectedNode.path
    })

    // Find the selected element
    const selectedElement = SchemaUtils.findComponentByPath(rootSchema, selectedNode.path)
    if (!selectedElement) {
      console.log('❌ Selected element not found')
      return
    }

    console.log('📍 Found element to duplicate:', selectedElement)

    // Clone the element with new IDs
    const clonedElement = SchemaUtils.cloneElementWithNewIds(selectedElement)
    console.log('📍 Cloned element with new ID:', clonedElement.id)

    // Find the parent to insert the duplicate
    if (selectedNode.path.length === 0) {
      console.log('❌ Cannot duplicate root element')
      return
    }

    const parentPath = selectedNode.path.slice(0, -1)
    const insertIndex = selectedNode.path[selectedNode.path.length - 1] + 1 // Insert right after the selected element

    console.log('📍 Inserting duplicate at parent path:', parentPath, 'at index:', insertIndex)

    // Update the schema to include the duplicate
    const updatedSchema = SchemaUtils.updateElementAtPath(rootSchema, parentPath, (parent) => {
      let children: any[]
      let navigableChildren: any[]

      if ('render' in parent) {
        // UIComponent
        children = SchemaUtils.getChildrenArray(parent as UIComponent)
        navigableChildren = SchemaUtils.getNavigableChildrenArray(parent as UIComponent)
      } else {
        // UIElement
        const elementChildren = (parent as UIElement).children
        children = Array.isArray(elementChildren) ? elementChildren : (elementChildren !== undefined ? [elementChildren] : [])
        navigableChildren = children.filter(child => SchemaUtils.isNavigableChild(child))
      }

      // Find the actual index in the children array where we should insert
      let actualInsertIndex = children.length // Default to end
      let navigableIndex = 0

      for (let i = 0; i < children.length; i++) {
        if (SchemaUtils.isNavigableChild(children[i])) {
          if (navigableIndex === insertIndex) {
            actualInsertIndex = i
            break
          }
          navigableIndex++
        }
      }

      // Insert the cloned element
      const newChildren = [...children]
      newChildren.splice(actualInsertIndex, 0, clonedElement)

      console.log('📍 Inserted duplicate at actual index:', actualInsertIndex)

      // Return updated parent
      if ('render' in parent) {
        // UIComponent
        return SchemaUtils.setChildren(parent as UIComponent, newChildren)
      } else {
        // UIElement
        return {
          ...parent,
          children: newChildren.length === 1 ? newChildren[0] : newChildren
        } as UIElement
      }
    })

    // Update the schema
    onSchemaUpdate(updatedSchema, 'duplicate')

    // Select the newly created duplicate
    const newPath = [...parentPath, insertIndex]
    const duplicateId = 'render' in clonedElement ? clonedElement.id : clonedElement.id
    console.log('✅ Selecting duplicate:', { duplicateId, newPath })

    selectNode(duplicateId, newPath)
  }, [selectedNode, selectNode, rootSchema, onSchemaUpdate])

  // Main keyboard event handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Only handle keys when selection is enabled and keyboard interactions are enabled
    if (!isSelectionEnabled || !config.enabled) return

    // Handle Escape key
    if (event.key === 'Escape') {
      event.preventDefault()

      // If there's a selected node, clear it first
      if (selectedNode) {
        clearSelection()
      }
      // If no selection but we're at a child level, go to parent
      else if (selectionLevel > 0) {
        navigateToParent()
      }
    }

    // Handle Enter key for drilling into children
    if (event.key === 'Enter' && !event.shiftKey) {
      if (selectedNode) {
        event.preventDefault()
        drillIntoFirstChild()
      }
    }

    // Handle Shift+Enter for navigating to parent
    if (event.key === 'Enter' && event.shiftKey) {
      if (selectedNode) {
        event.preventDefault()
        navigateUpToParent()
      }
    }

    // Handle Tab for next sibling navigation
    if (event.key === 'Tab' && !event.shiftKey) {
      if (selectedNode) {
        event.preventDefault()
        navigateToNextSibling()
      }
    }

    // Handle Shift+Tab for previous sibling navigation
    if (event.key === 'Tab' && event.shiftKey) {
      if (selectedNode) {
        event.preventDefault()
        navigateToPreviousSibling()
      }
    }

    // Handle Arrow Keys for element movement
    if (config.allowArrowNavigation !== false && selectedNode) {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault()
          moveElementAndUpdateSelection('up')
          break
        case 'ArrowDown':
          event.preventDefault()
          moveElementAndUpdateSelection('down')
          break
        case 'ArrowLeft':
          event.preventDefault()
          moveElementAndUpdateSelection('left')
          break
        case 'ArrowRight':
          event.preventDefault()
          moveElementAndUpdateSelection('right')
          break
      }
    }

    // Handle Copy-Paste operations
    if (config.allowCopyPaste !== false) {
      // Handle Ctrl+C (Copy)
      if (event.ctrlKey && event.key === 'c') {
        if (selectedNode) {
          event.preventDefault()
          copySelectedNode()
        }
      }

      // Handle Ctrl+X (Cut)
      if (event.ctrlKey && event.key === 'x') {
        if (selectedNode) {
          event.preventDefault()
          cutSelectedNode()
        }
      }

      // Handle Ctrl+V (Paste)
      if (event.ctrlKey && event.key === 'v') {
        if (selectedNode && copiedNode) {
          event.preventDefault()
          pasteAsChild()
        }
      }

      // Handle Ctrl+D (Duplicate)
      if (event.ctrlKey && event.key === 'd') {
        if (selectedNode) {
          event.preventDefault()
          duplicateSelectedElement()
        }
      }
    }

    // Handle Delete key
    if (config.allowDelete !== false) {
      if (event.key === 'Delete') {
        if (selectedNode) {
          event.preventDefault()
          deleteSelectedNode()
        }
      }
    }
  }, [
    isSelectionEnabled,
    config,
    selectedNode,
    selectionLevel,
    copiedNode,
    clearSelection,
    navigateToParent,
    navigateToChildren,
    moveElementAndUpdateSelection,
    drillIntoFirstChild,
    navigateUpToParent,
    navigateToNextSibling,
    navigateToPreviousSibling,
    duplicateSelectedElement,
    copySelectedNode,
    cutSelectedNode,
    pasteAsChild,
    deleteSelectedNode
  ])

  // Set up event listeners
  useEffect(() => {
    if (!config.enabled) return

    // Add event listener to document
    document.addEventListener('keydown', handleKeyDown)

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, config.enabled])

  // Return utility functions for programmatic use
  return {
    moveElementAndUpdateSelection,
    drillIntoFirstChild,
    navigateUpToParent,
    navigateToNextSibling,
    navigateToPreviousSibling,
    duplicateSelectedElement,
    handleKeyDown
  }
}

// Default keyboard interactions hook that enables all features
export const useDefaultKeyboardInteractions = () => {
  return useKeyboardInteractions({
    enabled: true,
    allowArrowNavigation: true,
    allowCopyPaste: true,
    allowDelete: true
  })
}

// Arrow-only keyboard interactions hook
export const useArrowKeyNavigation = () => {
  return useKeyboardInteractions({
    enabled: true,
    allowArrowNavigation: true,
    allowCopyPaste: false,
    allowDelete: false
  })
}