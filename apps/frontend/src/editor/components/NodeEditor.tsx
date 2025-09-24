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
    // bg-gradient-to-r from-teal-100 to-cyan-100
    <div className="bg-cyan-50 border-b border-teal-200 p-3 shadow-sm">
      <div className="w-full">
        <div className="flex items-center mb-2">
          <h3 className="text-sm font-semibold text-teal-800">
            Edit Node
          </h3>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <label
              htmlFor="node-text"
              className="text-xs font-medium text-teal-700 block"
            >
              Content
            </label>
            <textarea
              id="node-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!hasText}
              className={`w-full p-2 border rounded-md text-xs resize-y min-h-[40px] shadow-sm transition-all duration-200 ${
                hasText
                  ? 'bg-white border-teal-300 text-teal-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
                  : 'bg-white border-teal-200 text-teal-400 cursor-not-allowed'
              }`}
              placeholder={hasText ? "Enter text content..." : "No text content available for this element"}
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="node-class"
              className="text-xs font-medium text-teal-700 block"
            >
              ClassName
            </label>
            <textarea
              id="node-class"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-2 bg-white border border-teal-300 rounded-md text-xs text-teal-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-y min-h-[40px] shadow-sm transition-all duration-200"
              placeholder="e.g., bg-blue-500 text-white"
            />
          </div>
        </div>

        <div className="flex justify-end mt-3 pt-2 border-t border-teal-200">
          <button
            onClick={handleUpdateNode}
            className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-md hover:from-teal-700 hover:to-teal-800 shadow-sm hover:shadow-md transition-all duration-200"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeEditor;