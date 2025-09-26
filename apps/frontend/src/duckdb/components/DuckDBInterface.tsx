import React, { useState, useEffect, useCallback } from 'react';
import QueryEditor from './QueryEditor';
import QueryStats from './QueryStats';
import DataTable from './DataTable';
import { queryExecutor } from '../query';
import { duckDBManager } from '../connection';
import type { QueryResult, QueryStats as IQueryStats, DuckDBError } from '../types';

interface DuckDBInterfaceProps {
  autoInit?: boolean;
  showSampleData?: boolean;
  initialQuery?: string;
  maxRows?: number;
  className?: string;
  style?: React.CSSProperties;
}

const DuckDBInterface: React.FC<DuckDBInterfaceProps> = ({
  autoInit = true,
  showSampleData = true,
  initialQuery,
  maxRows = 1000,
  className = '',
  style
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [queryStats, setQueryStats] = useState<IQueryStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

  // Initialize DuckDB
  useEffect(() => {
    if (autoInit && !isInitialized) {
      initializeDuckDB();
    }
  }, [autoInit, isInitialized]);

  const initializeDuckDB = async () => {
    try {
      setIsLoading(true);
      setInitError(null);

      await duckDBManager.initialize();

      if (showSampleData) {
        await queryExecutor.createSampleTable();
      }

      setIsInitialized(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize DuckDB';
      console.error('DuckDB initialization error:', err);
      setInitError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const executeQuery = useCallback(async (sql: string) => {
    if (!isInitialized) {
      setError('DuckDB is not initialized');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { result, stats } = await queryExecutor.executeAndGetStats(sql);

      // Limit rows if necessary
      if (result.data.length > maxRows) {
        result.data = result.data.slice(0, maxRows);
        result.numRows = maxRows;
      }

      setQueryResult(result);
      setQueryStats(stats);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (err && typeof err === 'object' && 'message' in err) {
        setError((err as DuckDBError).message);
      } else {
        setError('An unknown error occurred during query execution');
      }
      setQueryResult(null);
      setQueryStats(null);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, maxRows]);

  // Show initialization loading state
  if (!isInitialized && (isLoading || initError)) {
    return (
      <div className={`duckdb-interface ${className}`} style={style}>
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="text-center">
            {isLoading && (
              <>
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Initializing DuckDB</h3>
                <p className="text-gray-600">Setting up the database engine...</p>
              </>
            )}
            {initError && (
              <>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-red-900 mb-2">Initialization Failed</h3>
                <p className="text-red-700 mb-4">{initError}</p>
                <button
                  onClick={initializeDuckDB}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  Retry Initialization
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show manual initialization button if not auto-initializing
  if (!autoInit && !isInitialized) {
    return (
      <div className={`duckdb-interface ${className}`} style={style}>
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">DuckDB Ready</h3>
            <p className="text-gray-600 mb-4">Click below to initialize the database engine</p>
            <button
              onClick={initializeDuckDB}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Initializing...' : 'Initialize DuckDB'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`duckdb-interface space-y-4 ${className}`} style={style}>
      <QueryEditor
        onExecute={executeQuery}
        isLoading={isLoading}
        initialQuery={initialQuery}
      />

      <QueryStats
        stats={queryStats}
        isLoading={isLoading}
        error={error}
      />

      <DataTable
        result={queryResult}
        isLoading={isLoading}
        maxRows={maxRows}
      />
    </div>
  );
};

export default DuckDBInterface;