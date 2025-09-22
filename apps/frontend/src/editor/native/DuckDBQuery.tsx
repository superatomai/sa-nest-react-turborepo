// import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
// import { queryExecutor } from '../../duckdb/query';
// import { duckDBManager } from '../../duckdb/connection';
// import { QueryResult, QueryStats as IQueryStats, DuckDBError } from '../../duckdb/types';

// interface DuckDBQueryProps {
//   sql: string;
//   parameters?: any[];
//   autoExecute?: boolean;
//   maxRows?: number;
//   className?: string;
//   style?: React.CSSProperties;
//   showStats?: boolean;
//   title?: string;
//   showTestButton?: boolean;
// }

// export const DuckDBQuery: React.FC<DuckDBQueryProps> = ({
//   sql,
//   parameters = [],
//   autoExecute = true,
//   maxRows = 1000,
//   className = '',
//   style,
//   showStats = true,
//   title,
//   showTestButton = true
// }) => {
//   console.log('DuckDBQuery props received:', {
//     sql: typeof sql === 'string' ? sql.slice(0, 100) + '...' : sql,
//     parameters,
//     parametersType: typeof parameters,
//     parametersIsArray: Array.isArray(parameters),
//     autoExecute,
//     title
//   });

//   // Early return if sql is not provided
//   if (!sql || typeof sql !== 'string') {
//     return (
//       <div className={`duckdb-query ${className}`} style={style}>
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//           <p className="text-red-700">Error: No SQL query provided or invalid query format</p>
//           <p className="text-red-600 text-sm mt-1">Received: {typeof sql} - {JSON.stringify(sql)}</p>
//         </div>
//       </div>
//     );
//   }

//   const [isInitialized, setIsInitialized] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
//   const [queryStats, setQueryStats] = useState<IQueryStats | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [initError, setInitError] = useState<string | null>(null);

//   // Initialize DuckDB
//   useEffect(() => {
//     if (!isInitialized) {
//       initializeDuckDB();
//     }
//   }, []);

//   const initializeDuckDB = async () => {
//     try {
//       setIsLoading(true);
//       setInitError(null);
//       await duckDBManager.initialize();
//       setIsInitialized(true);
//     } catch (err) {
//       const errorMessage = err instanceof Error ? err.message : 'Failed to initialize DuckDB';
//       console.error('DuckDB initialization error:', err);
//       setInitError(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const executeQuery = useCallback(async (querySQL: string, queryParams: any[] = []) => {
//     if (!isInitialized) {
//       setError('DuckDB is not initialized');
//       return;
//     }

//     if (!querySQL) {
//       setError('No SQL query provided');
//       return;
//     }

//     setIsLoading(true);
//     setError(null);

//     try {
//       // Replace parameters in SQL if provided
//       let finalSQL = querySQL;
//       const safeParams = Array.isArray(queryParams) ? queryParams : [];

//       if (safeParams.length > 0) {
//         let paramIndex = 0;
//         finalSQL = finalSQL.replace(/\?/g, () => {
//           if (paramIndex < safeParams.length) {
//             const param = safeParams[paramIndex++];
//             return typeof param === 'string' ? `'${param}'` : String(param);
//           }
//           return '?'; // Keep ? if no more parameters
//         });
//         console.log('Original SQL:', querySQL);
//         console.log('Parameters:', safeParams);
//         console.log('Final SQL:', finalSQL);
//       } else {
//         console.log('Executing SQL without parameters:', querySQL);
//       }

//       const { result, stats } = await queryExecutor.executeAndGetStats(finalSQL);

//       // Limit rows if necessary
//       if (result.data.length > maxRows) {
//         result.data = result.data.slice(0, maxRows);
//         result.numRows = maxRows;
//       }

//       setQueryResult(result);
//       setQueryStats(stats);
//     } catch (err) {
//       if (err instanceof Error || (err as DuckDBError).message) {
//         setError((err as DuckDBError).message || err.message);
//       } else {
//         setError('An unknown error occurred during query execution');
//       }
//       setQueryResult(null);
//       setQueryStats(null);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [isInitialized, maxRows]); // Only depend on isInitialized and maxRows

//   // Memoize SQL and parameters to create stable references
//   const memoizedSql = useMemo(() => sql, [sql]);
//   const memoizedParams = useMemo(() => parameters || [], [JSON.stringify(parameters)]);

//   // Track execution state
//   const hasExecutedRef = useRef(false);
//   const lastSqlRef = useRef<string>('');
//   const lastParamsRef = useRef<string>('');

//   // Auto-execute query when component mounts and is initialized
//   useEffect(() => {
//     if (!isInitialized || !autoExecute || !memoizedSql) {
//       return;
//     }

//     // Check if SQL or parameters have actually changed
//     const currentSql = memoizedSql;
//     const currentParamsStr = JSON.stringify(memoizedParams);

//     const shouldExecute =
//       lastSqlRef.current !== currentSql ||
//       lastParamsRef.current !== currentParamsStr;

//     if (shouldExecute) {
//       lastSqlRef.current = currentSql;
//       lastParamsRef.current = currentParamsStr;
//       executeQuery(currentSql, memoizedParams);
//     }
//   }, [isInitialized, autoExecute, memoizedSql, memoizedParams, executeQuery]);

//   // Show initialization loading state
//   if (!isInitialized && (isLoading || initError)) {
//     return (
//       <div className={`duckdb-query ${className}`} style={style}>
//         <div className="bg-white border border-gray-200 rounded-lg p-6">
//           <div className="text-center">
//             {isLoading && (
//               <>
//                 <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
//                 <p className="text-sm text-gray-600">Initializing DuckDB...</p>
//               </>
//             )}
//             {initError && (
//               <>
//                 <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
//                   <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 </div>
//                 <p className="text-sm font-medium text-red-900 mb-2">Initialization Failed</p>
//                 <p className="text-xs text-red-700 mb-3">{initError}</p>
//                 <button
//                   onClick={initializeDuckDB}
//                   className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
//                 >
//                   Retry
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const testConnection = async () => {
//     try {
//       await executeQuery("SELECT 1 as test", []);
//     } catch (err) {
//       console.error('Test query failed:', err);
//     }
//   };

//   return (
//     <div className={`duckdb-query space-y-4 ${className}`} style={style}>
//       {title && (
//         <div className="flex items-center justify-between">
//           <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
//           {showTestButton && isInitialized && (
//             <button
//               onClick={testConnection}
//               className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
//               disabled={isLoading}
//             >
//               Test Connection
//             </button>
//           )}
//         </div>
//       )}

//       {error && (
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//           <div className="flex">
//             <div className="flex-shrink-0">
//               <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//             </div>
//             <div className="ml-3">
//               <h3 className="text-sm font-medium text-red-800">Query Error</h3>
//               <p className="mt-1 text-sm text-red-700">{error}</p>
//             </div>
//           </div>
//         </div>
//       )}

//       {isLoading && !error && (
//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//           <div className="flex items-center">
//             <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
//             <p className="text-sm text-blue-700">Executing query...</p>
//           </div>
//         </div>
//       )}

//       {showStats && queryStats && (
//         <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//             <div>
//               <p className="text-gray-600">Execution Time</p>
//               <p className="font-semibold">{queryStats.executionTime.toFixed(3)}ms</p>
//             </div>
//             <div>
//               <p className="text-gray-600">Rows Returned</p>
//               <p className="font-semibold">{queryResult?.numRows || 0}</p>
//             </div>
//             <div>
//               <p className="text-gray-600">Columns</p>
//               <p className="font-semibold">{queryResult?.columns.length || 0}</p>
//             </div>
//             <div>
//               <p className="text-gray-600">Query Length</p>
//               <p className="font-semibold">{sql?.length || 0} chars</p>
//             </div>
//           </div>
//         </div>
//       )}

//       {queryResult && queryResult.data.length > 0 && (
//         <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   {queryResult.columns.map((column, index) => (
//                     <th
//                       key={index}
//                       className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                     >
//                       {column}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {queryResult.data.map((row, rowIndex) => (
//                   <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
//                     {queryResult.columns.map((column, colIndex) => (
//                       <td key={colIndex} className="px-4 py-3 text-sm text-gray-900">
//                         {row[column] !== null && row[column] !== undefined ?
//                           String(row[column]) :
//                           <span className="text-gray-400 italic">null</span>
//                         }
//                       </td>
//                     ))}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {queryResult.data.length >= maxRows && (
//             <div className="bg-yellow-50 border-t border-yellow-200 px-4 py-3">
//               <p className="text-sm text-yellow-700">
//                 <strong>Note:</strong> Results limited to {maxRows} rows. There may be more data available.
//               </p>
//             </div>
//           )}
//         </div>
//       )}

//       {queryResult && queryResult.data.length === 0 && !error && !isLoading && (
//         <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
//           <p className="text-gray-600">No results found for this query.</p>
//           <p className="text-xs text-gray-500 mt-2">
//             This could mean the database tables don't exist yet or contain no matching data.
//           </p>
//         </div>
//       )}

//       {!queryResult && !error && !isLoading && isInitialized && (
//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
//           <p className="text-blue-700 mb-2">Ready to execute query</p>
//           <p className="text-xs text-blue-600">
//             Make sure your DuckDB database is loaded with the required tables.
//           </p>
//         </div>
//       )}
//     </div>
//   );
// };