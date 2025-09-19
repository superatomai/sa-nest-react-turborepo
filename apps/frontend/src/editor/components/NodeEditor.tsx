import React, { useState, useEffect } from "react";

interface NodeEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (text: string, className: string) => void;
  selectedNodeId?: string; // Add this to trigger re-renders
}

const NodeEditor: React.FC<NodeEditorProps> = ({
  isOpen,
  onClose,
  onUpdate,
  selectedNodeId,
}) => {
  const [text, setText] = useState("");
  const [className, setClassName] = useState("");
  const [hasText, setHasText] = useState(false);

  useEffect(() => {
    if (isOpen && window.SAEDITOR) {
      setText(window.SAEDITOR.text || "");
      setClassName(window.SAEDITOR.className || "");
      setHasText(window.SAEDITOR.hasText || false);
      // console.log('NodeEditor updated:', {
      //   text: window.SAEDITOR.text,
      //   className: window.SAEDITOR.className,
      //   hasText: window.SAEDITOR.hasText,
      //   nodeId: window.SAEDITOR.nodeId,
      //   textLength: window.SAEDITOR.text?.length || 0
      // });
    }
  }, [isOpen, selectedNodeId]); // Use selectedNodeId prop instead

  const handleUpdateNode = () => {
    if (window.SAEDITOR) {
      window.SAEDITOR.text = text;
      window.SAEDITOR.className = className;
    }
    onUpdate(text, className);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUpdateNode();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bg-white border-b border-gray-200 p-2 shadow-sm">
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-800">
            Edit Node
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded p-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-2">
          {hasText && (
            <div className="space-y-1">
              <label
                htmlFor="node-text"
                className="text-xs font-medium text-gray-600 block"
              >
                Content
              </label>
              <textarea
                id="node-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full p-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-400 focus:border-blue-400 resize-y min-h-[40px]"
                placeholder="Enter text content..."
              />
            </div>
          )}

          <div className="space-y-1">
            <label
              htmlFor="node-class"
              className="text-xs font-medium text-gray-600 block"
            >
              ClassName
            </label>
            <textarea
              id="node-class"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-400 focus:border-blue-400 resize-y min-h-[40px]"
              placeholder="e.g., bg-blue-500 text-white"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-2 pt-1.5 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-50 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateNode}
            className="px-2 py-1 text-xs font-medium bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeEditor;