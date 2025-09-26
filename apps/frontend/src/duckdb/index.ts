// Main exports for the DuckDB module
export { duckDBManager, GLO } from './connection';
export { queryExecutor } from './query';

// Import the instances for use in utility functions
import { duckDBManager } from './connection';
import { queryExecutor } from './query';
export type { QueryResult, QueryStats, DuckDBError, TableColumn, TableInfo } from './types';

// React Components
export { default as DuckDBInterface } from './components/DuckDBInterface';
export { default as DuckDBFileUpload } from './components/DuckDBFileUpload';
export { default as QueryEditor } from './components/QueryEditor';
export { default as QueryStatsComponent } from './components/QueryStats';
export { default as DataTable } from './components/DataTable';

// Utility functions
export const initializeDuckDB = async () => {
  return await duckDBManager.initialize();
};

export const isReady = () => {
  return duckDBManager.isReady();
};

export const executeSQL = async (sql: string) => {
  return await queryExecutor.executeQuery(sql);
};