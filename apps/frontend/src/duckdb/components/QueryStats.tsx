import React from 'react';
import type { QueryStats as IQueryStats } from '../types';

interface QueryStatsProps {
  stats: IQueryStats | null;
  isLoading?: boolean;
  error?: string | null;
}

const QueryStats: React.FC<QueryStatsProps> = ({ stats, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-blue-700 font-medium">Executing query...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">!</span>
          </div>
          <div>
            <h4 className="text-red-800 font-semibold">Query Error</h4>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
        <p className="text-gray-600 text-center">No query executed yet</p>
      </div>
    );
  }

  const formatExecutionTime = (ms: number): string => {
    if (ms < 1) {
      return `${(ms * 1000).toFixed(0)}μs`;
    } else if (ms < 1000) {
      return `${ms.toFixed(3)}ms`;
    } else {
      return `${(ms / 1000).toFixed(3)}s`;
    }
  };

  const formatRowCount = (count: number): string => {
    if (count < 1000) {
      return count.toString();
    } else if (count < 1000000) {
      return `${(count / 1000).toFixed(1)}K`;
    } else {
      return `${(count / 1000000).toFixed(1)}M`;
    }
  };

  const getExecutionTimeColor = (ms: number): string => {
    if (ms < 100) return 'text-green-600 bg-green-50';
    if (ms < 1000) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getExecutionTimeColor(stats.executionTime)}`}>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatExecutionTime(stats.executionTime)}
          </div>
          <p className="text-gray-600 text-xs mt-1">Execution Time</p>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold text-blue-600 bg-blue-50">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {formatRowCount(stats.numRows)}
          </div>
          <p className="text-gray-600 text-xs mt-1">Rows</p>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold text-purple-600 bg-purple-50">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 002 2m0 0v10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
            </svg>
            {stats.numColumns}
          </div>
          <p className="text-gray-600 text-xs mt-1">Columns</p>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold text-gray-600 bg-gray-50">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {stats.timestamp.toLocaleTimeString()}
          </div>
          <p className="text-gray-600 text-xs mt-1">Executed At</p>
        </div>
      </div>
    </div>
  );
};

export default QueryStats;