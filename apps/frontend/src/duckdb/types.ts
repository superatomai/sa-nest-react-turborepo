export interface QueryResult {
  data: any[];
  columns: string[];
  numRows: number;
  executionTime: number;
  queryText: string;
  timestamp: Date;
}

export interface QueryStats {
  executionTime: number;
  numRows: number;
  numColumns: number;
  querySize: number;
  timestamp: Date;
}

export interface TableColumn {
  name: string;
  type: string;
  nullable: boolean;
}

export interface TableInfo {
  name: string;
  columns: TableColumn[];
  rowCount?: number;
}

export interface DuckDBError {
  message: string;
  query?: string;
  timestamp: Date;
}