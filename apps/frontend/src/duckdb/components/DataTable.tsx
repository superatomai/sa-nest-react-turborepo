import React, { useState } from 'react';
import type { QueryResult } from '../types';

interface DataTableProps {
  result: QueryResult | null;
  isLoading?: boolean;
  maxRows?: number;
}

const DataTable: React.FC<DataTableProps> = ({
  result,
  isLoading = false,
  maxRows = 100
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  if (!result || result.data.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No data</h3>
          <p className="mt-1 text-sm text-gray-500">Execute a query to see results here.</p>
        </div>
      </div>
    );
  }

  // Sort data if needed
  let sortedData = [...result.data];
  if (sortColumn) {
    sortedData.sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();

      if (sortDirection === 'asc') {
        return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
      } else {
        return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
      }
    });
  }

  // Pagination
  const rowsPerPage = 20;
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const startRow = (currentPage - 1) * rowsPerPage;
  const endRow = Math.min(startRow + rowsPerPage, sortedData.length);
  const paginatedData = sortedData.slice(startRow, endRow);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const formatCellValue = (value: any): string => {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    if (typeof value === 'number') {
      // Format numbers with appropriate precision
      if (Number.isInteger(value)) {
        return value.toLocaleString();
      } else {
        return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
      }
    }
    if (value instanceof Date) {
      return value.toLocaleString();
    }
    return String(value);
  };

  const getCellClassName = (value: any): string => {
    if (value === null || value === undefined) {
      return 'text-gray-400 italic';
    }
    if (typeof value === 'number') {
      return 'text-right font-mono';
    }
    if (typeof value === 'boolean') {
      return value ? 'text-green-600' : 'text-red-600';
    }
    return 'text-gray-900';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Query Results</h3>
          <div className="text-sm text-gray-500">
            Showing {startRow + 1}-{endRow} of {sortedData.length} rows
            {sortedData.length > maxRows && (
              <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                Limited to {maxRows} rows
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {result.columns.map((column) => (
                <th
                  key={column}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column}</span>
                    {sortColumn === column && (
                      <svg
                        className={`w-4 h-4 transition-transform ${sortDirection === 'desc' ? 'transform rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                {result.columns.map((column, colIndex) => (
                  <td
                    key={`${rowIndex}-${colIndex}`}
                    className={`px-6 py-4 whitespace-nowrap text-sm ${getCellClassName(row[column])}`}
                  >
                    {formatCellValue(row[column])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;