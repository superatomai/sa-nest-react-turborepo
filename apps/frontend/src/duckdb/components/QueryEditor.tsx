import React, { useState, useRef, useCallback } from 'react';

interface QueryEditorProps {
  onExecute: (query: string) => void;
  isLoading?: boolean;
  initialQuery?: string;
}

const QueryEditor: React.FC<QueryEditorProps> = ({
  onExecute,
  isLoading = false,
  initialQuery = 'SELECT * FROM sample_data LIMIT 10;'
}) => {
  const [query, setQuery] = useState(initialQuery);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleExecute = useCallback(() => {
    if (query.trim()) {
      onExecute(query.trim());
    }
  }, [query, onExecute]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Insert tab character
      const newQuery = query.substring(0, start) + '  ' + query.substring(end);
      setQuery(newQuery);

      // Restore cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleExecute();
    }
  };

  const insertSampleQuery = (sampleQuery: string) => {
    setQuery(sampleQuery);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const sampleQueries = [
    {
      name: 'View All Data',
      query: 'SELECT * FROM sample_data LIMIT 20;'
    },
    {
      name: 'Count by Category',
      query: `SELECT category, COUNT(*) as count, AVG(price)::INT as avg_price
FROM sample_data
GROUP BY category
ORDER BY count DESC;`
    },
    {
      name: 'Top Expensive Items',
      query: `SELECT name, price, category
FROM sample_data
WHERE in_stock = true
ORDER BY price DESC
LIMIT 10;`
    },
    {
      name: 'Monthly Sales',
      query: `SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as items_created,
  SUM(price) as total_value
FROM sample_data
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month;`
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">SQL Query Editor</h3>
          <div className="flex space-x-2">
            <button
              onClick={handleExecute}
              disabled={isLoading || !query.trim()}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Running...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Run Query
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Query Editor */}
      <div className="p-4">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your SQL query here..."
            className="w-full h-32 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-500">
            Ctrl+Enter to run
          </div>
        </div>
      </div>

      {/* Sample Queries */}
      <div className="px-4 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Sample Queries:</h4>
        <div className="flex flex-wrap gap-2">
          {sampleQueries.map((sample, index) => (
            <button
              key={index}
              onClick={() => insertSampleQuery(sample.query)}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
              disabled={isLoading}
            >
              {sample.name}
            </button>
          ))}
        </div>
      </div>

      {/* Help Text */}
      <div className="px-4 pb-4 border-t border-gray-100 pt-3">
        <p className="text-xs text-gray-500">
          💡 <strong>Tips:</strong> Use Tab for indentation, Ctrl+Enter to execute, and try the sample queries above to get started.
        </p>
      </div>
    </div>
  );
};

export default QueryEditor;