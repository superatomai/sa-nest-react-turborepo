import React, { useState, useEffect } from "react";

interface NodeEditorProps {
  onUpdate: (text: string, className: string) => void;
  selectedNodeId?: string; // Add this to trigger re-renders
}

const NodeEditor: React.FC<NodeEditorProps> = ({
  onUpdate,
  selectedNodeId,
}) => {
  const [text, setText] = useState("");
  const [className, setClassName] = useState("");
  const [hasText, setHasText] = useState(false);

  useEffect(() => {
    if (window.SAEDITOR) {
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
  }, [selectedNodeId]); // Use selectedNodeId prop instead

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

  return (
    <div className="bg-white border-b border-gray-200 p-2 shadow-sm">
      <div className="w-full">
        <div className="flex items-center mb-2">
          <h3 className="text-sm font-semibold text-gray-800">
            Edit Node
          </h3>
        </div>

        <div className="space-y-2">
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
              disabled={!hasText}
              className={`w-full p-1.5 border border-gray-200 rounded text-xs resize-y min-h-[40px] ${
                hasText
                  ? 'focus:ring-1 focus:ring-blue-400 focus:border-blue-400'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
              placeholder={hasText ? "Enter text content..." : "No text content available for this element"}
            />
          </div>

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

        <div className="flex justify-end mt-2 pt-1.5 border-t border-gray-100">
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