import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'

interface KeyboardShortcut {
  category: string
  shortcuts: Array<{
    keys: string[]
    description: string
  }>
}

const KeyboardShortcutsDialog = () => {
  // Detect platform for correct modifier key display
  const isMac = /Mac|iPhone|iPod|iPad/.test(navigator.userAgent)
  const modifierKey = isMac ? '⌘' : 'Ctrl'
  const deleteKey = isMac ? '⌫' : 'Delete'

  const shortcuts: KeyboardShortcut[] = [
    {
      category: "Selection Navigation",
      shortcuts: [
        { keys: ["↑", "↓"], description: "Move selection up/down between siblings" },
        { keys: ["←", "→"], description: "Move selection left/right between siblings" },
        { keys: ["Tab"], description: "Move to next sibling" },
        { keys: ["Shift", "Tab"], description: "Move to previous sibling" },
        { keys: ["Enter"], description: "Drill into first child element" },
        { keys: ["Shift", "Enter"], description: "Navigate to parent element" },
        { keys: ["Esc"], description: "Clear selection or go to parent level" },
      ]
    },
    {
      category: "Element Movement",
      shortcuts: [
        { keys: ["Shift", "↑"], description: "Move element up" },
        { keys: ["Shift", "↓"], description: "Move element down" },
        { keys: ["Shift", "←"], description: "Move element left" },
        { keys: ["Shift", "→"], description: "Move element right" },
      ]
    },
    {
      category: "Copy & Paste",
      shortcuts: [
        { keys: [modifierKey, "C"], description: "Copy selected element" },
        { keys: [modifierKey, "X"], description: "Cut selected element" },
        { keys: [modifierKey, "V"], description: "Paste as child of selected element" },
        { keys: [modifierKey, "D"], description: "Duplicate selected element" },
        { keys: [deleteKey], description: "Delete selected element" },
      ]
    },
    {
      category: "Chat Interface",
      shortcuts: [
        { keys: ["Enter"], description: "Send message" },
        { keys: ["Shift", "Enter"], description: "New line in input" },
        { keys: ["↑"], description: "Previous prompt from history" },
        { keys: ["↓"], description: "Next prompt from history" },
      ]
    }
  ]

  const renderKey = (key: string) => (
    <kbd key={key} className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded-md shadow-sm">
      {key}
    </kbd>
  )

  const renderKeyCombo = (keys: string[]) => (
    <div className="flex items-center space-x-1">
      {keys.map((key, index) => (
        <React.Fragment key={index}>
          {renderKey(key)}
          {index < keys.length - 1 && (
            <span className="text-gray-400 text-sm">+</span>
          )}
        </React.Fragment>
      ))}
    </div>
  )

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="p-2 text-teal-600 hover:text-white hover:bg-teal-600 rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
          title="Keyboard shortcuts"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {shortcuts.map((category) => (
            <div key={category.category} className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1">
                {category.category}
              </h3>
              <div className="space-y-2">
                {category.shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600 flex-1 mr-4">
                      {shortcut.description}
                    </span>
                    {renderKeyCombo(shortcut.keys)}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-500">
              💡 Tip: These shortcuts only work when not typing in input fields. Selection must be enabled in dev mode.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default KeyboardShortcutsDialog