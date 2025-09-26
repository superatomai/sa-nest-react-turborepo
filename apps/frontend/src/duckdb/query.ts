import { duckDBManager } from './connection';
import type { QueryResult, QueryStats, DuckDBError } from './types';

export class DuckDBQueryExecutor {
  private static instance: DuckDBQueryExecutor;

  private constructor() {}

  static getInstance(): DuckDBQueryExecutor {
    if (!DuckDBQueryExecutor.instance) {
      DuckDBQueryExecutor.instance = new DuckDBQueryExecutor();
    }
    return DuckDBQueryExecutor.instance;
  }

  async executeQuery(sql: string): Promise<QueryResult> {
    const startTime = performance.now();

    try {
      console.log('🔍 Executing query:', sql);

      const result = await duckDBManager.execute(sql);
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Extract data and column information
      const columns = result.schema.fields.map((field: any) => field.name);
      const rawArray = result.toArray();

      const data = rawArray.map((row: any) => {
        const rowData: any = {};

        if (Array.isArray(row)) {
          // Row is an array, use index access
          columns.forEach((col: string, index: number) => {
            rowData[col] = row[index];
          });
        } else if (typeof row === 'object') {
          // Row is an object, use property access
          columns.forEach((col: string) => {
            rowData[col] = row[col];
          });
        }

        return rowData;
      });

      const queryResult: QueryResult = {
        data,
        columns,
        numRows: data.length,
        executionTime,
        queryText: sql,
        timestamp: new Date()
      };

      console.log(`✅ Query executed in ${executionTime.toFixed(2)}ms, returned ${data.length} rows`);
      return queryResult;

    } catch (error) {

      console.error('❌ Query failed:', error);

      const duckDBError: DuckDBError = {
        message: error instanceof Error ? error.message : 'Unknown query error',
        query: sql,
        timestamp: new Date()
      };

      throw duckDBError;
    }
  }

  async executeAndGetStats(sql: string): Promise<{ result: QueryResult; stats: QueryStats }> {
    const result = await this.executeQuery(sql);

    const stats: QueryStats = {
      executionTime: result.executionTime,
      numRows: result.numRows,
      numColumns: result.columns.length,
      querySize: sql.length,
      timestamp: result.timestamp
    };

    return { result, stats };
  }

  async createSampleTable(): Promise<QueryResult> {
    const createTableSQL = `
      CREATE OR REPLACE TABLE sample_data AS
      SELECT
        row_number() OVER () as id,
        'Product ' || (row_number() OVER ()) as name,
        (random() * 100 + 50)::INT as price,
        ['Electronics', 'Books', 'Clothing', 'Home', 'Sports'][((random() * 5)::INT + 1)] as category,
        (random() > 0.8) as in_stock,
        current_timestamp - INTERVAL (random() * 365) DAY as created_at
      FROM range(50);
    `;

    return await this.executeQuery(createTableSQL);
  }

  async loadCSVData(csvContent: string, tableName: string): Promise<QueryResult> {
    // This would need to be implemented based on how you want to handle CSV uploads
    // For now, we'll create a simple example
    const sql = `
      CREATE OR REPLACE TABLE ${tableName} AS
      SELECT * FROM read_csv_auto('data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}');
    `;

    return await this.executeQuery(sql);
  }

  async getTables(): Promise<string[]> {
    const result = await this.executeQuery(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'main'
      ORDER BY table_name;
    `);

    return result.data.map(row => row.table_name);
  }

  async getTableInfo(tableName: string): Promise<any> {
    const result = await this.executeQuery(`
      SELECT
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns
      WHERE table_name = '${tableName}'
      ORDER BY ordinal_position;
    `);

    return result.data;
  }

  formatExecutionTime(ms: number): string {
    if (ms < 1) {
      return `${(ms * 1000).toFixed(0)}μs`;
    } else if (ms < 1000) {
      return `${ms.toFixed(3)}ms`;
    } else {
      return `${(ms / 1000).toFixed(3)}s`;
    }
  }

  formatRowCount(count: number): string {
    if (count < 1000) {
      return count.toString();
    } else if (count < 1000000) {
      return `${(count / 1000).toFixed(1)}K`;
    } else {
      return `${(count / 1000000).toFixed(1)}M`;
    }
  }
}

export const queryExecutor = DuckDBQueryExecutor.getInstance();