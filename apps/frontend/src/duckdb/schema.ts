import { GLO } from './connection';

export interface Column {
  name: string;
  type: string;
  nullable: boolean;
  description?: string;
}

export interface TableSchema {
  name: string;
  columns: Column[];
  rowCount?: number;
  description?: string;
}

export interface Relationship {
  from: { table: string; column: string };
  to: { table: string; column: string };
  type: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
}

export interface SchemaInfo {
  tables: TableSchema[];
  relationships: Relationship[];
  documentation?: string;
  databaseName?: string;
  attachedDatabases?: string[];
}

export class SchemaGenerator {
  static schema: SchemaInfo | null = null;

  static async generateFromDuckDB(databaseName: string = 'main'): Promise<SchemaInfo> {
    const conn = GLO.conn;
    if (!conn) {
      throw new Error('DuckDB connection not available');
    }

    try {
      // console.log(`🔍 Generating schema for database: ${databaseName}`);

      // Get attached databases
      const attachedDatabasesResult = await conn.query(`
        SELECT database_name, type
        FROM duckdb_databases()
        ORDER BY database_name;
      `);

      const attachedDatabases = attachedDatabasesResult.toArray().map((row: any) => row.database_name);

      // Get all tables from the specified database
      const tablesResult = await conn.query(`
        SELECT table_name, table_schema
        FROM information_schema.tables
        WHERE table_schema = '${databaseName}' OR table_catalog = '${databaseName}'
        ORDER BY table_name;
      `);

      const tables: TableSchema[] = [];
      const tableRows = tablesResult.toArray();

      // console.log(`📊 Found ${tableRows.length} tables`);

      for (const row of tableRows) {
        const tableName = row.table_name;
        const fullTableName = databaseName === 'main' ? tableName : `${databaseName}.${tableName}`;

        // console.log(`📋 Processing table: ${fullTableName}`);

        try {
          // Get columns for each table
          const columnsResult = await conn.query(`
            SELECT
              column_name,
              data_type,
              is_nullable
            FROM information_schema.columns
            WHERE table_name = '${tableName}'
            AND (table_schema = '${databaseName}' OR table_catalog = '${databaseName}')
            ORDER BY ordinal_position;
          `);

          const columns: Column[] = columnsResult.toArray().map((col: any) => ({
            name: col.column_name,
            type: col.data_type,
            nullable: col.is_nullable === 'YES',
            description: undefined
          }));

          // Try to get row count
          let rowCount: number | undefined;
          try {
            const countResult = await conn.query(`SELECT COUNT(*) as count FROM ${fullTableName};`);
            rowCount = countResult.toArray()[0]?.count || 0;
          } catch (error) {
            console.warn(`Could not get row count for ${fullTableName}:`, error);
          }

          tables.push({
            name: tableName,
            columns,
            rowCount,
            description: `Table from ${databaseName} database`
          });

          // console.log(`✅ Table ${tableName}: ${columns.length} columns, ${rowCount || '?'} rows`);

        } catch (error) {
          console.error(`❌ Error processing table ${tableName}:`, error);
          // Still add the table with basic info
          tables.push({
            name: tableName,
            columns: [],
            description: `Error loading table schema: ${error}`
          });
        }
      }

      // Try to detect relationships
      const relationships = await this.detectRelationships(tables);

      const schemaInfo: SchemaInfo = {
        tables,
        relationships,
        documentation: `Auto-generated schema from DuckDB database: ${databaseName}`,
        databaseName,
        attachedDatabases
      };

      // Cache the schema
      this.schema = schemaInfo;

      // console.log(`✅ Schema generated: ${tables.length} tables, ${relationships.length} relationships`);
      return schemaInfo;

    } catch (error) {
      console.error('❌ Error generating schema:', error);
      throw error;
    }
  }

  private static async detectRelationships(tables: TableSchema[]): Promise<Relationship[]> {
    const relationships: Relationship[] = [];

    try {
      // Simple heuristic: look for columns ending with _id
      for (const table of tables) {
        for (const column of table.columns) {
          if (column.name.endsWith('_id') && column.name !== 'id') {
            const referencedTable = column.name.replace('_id', '');

            // Check if referenced table exists (try both singular and plural forms)
            const possibleTables = [referencedTable, referencedTable + 's', referencedTable.slice(0, -1)];
            const referencedTableName = possibleTables.find(name =>
              tables.some(t => t.name.toLowerCase() === name.toLowerCase())
            );

            if (referencedTableName) {
              const actualReferencedTable = tables.find(t =>
                t.name.toLowerCase() === referencedTableName.toLowerCase()
              );

              if (actualReferencedTable) {
                relationships.push({
                  from: { table: table.name, column: column.name },
                  to: { table: actualReferencedTable.name, column: 'id' },
                  type: 'many-to-one'
                });
              }
            }
          }
        }
      }

      // console.log(`🔗 Detected ${relationships.length} relationships`);
    } catch (error) {
      console.warn('Warning: Could not detect relationships:', error);
    }

    return relationships;
  }

  static getSchema(): SchemaInfo | null {
    return this.schema;
  }

  static clearSchema(): void {
    this.schema = null;
  }

  // Helper method to get table names for a specific database
  static async getTablesForDatabase(databaseName: string): Promise<string[]> {
    const conn = GLO.conn;
    if (!conn) return [];

    try {
      const result = await conn.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = '${databaseName}' OR table_catalog = '${databaseName}'
        ORDER BY table_name;
      `);

      return result.toArray().map((row: any) => row.table_name);
    } catch (error) {
      console.error(`Error getting tables for database ${databaseName}:`, error);
      return [];
    }
  }

  // Helper method to get column info for a specific table
  static async getTableColumns(tableName: string, databaseName: string = 'main'): Promise<Column[]> {
    const conn = GLO.conn;
    if (!conn) return [];

    try {
      const result = await conn.query(`
        SELECT
          column_name,
          data_type,
          is_nullable
        FROM information_schema.columns
        WHERE table_name = '${tableName}'
        AND (table_schema = '${databaseName}' OR table_catalog = '${databaseName}')
        ORDER BY ordinal_position;
      `);

      return result.toArray().map((col: any) => ({
        name: col.column_name,
        type: col.data_type,
        nullable: col.is_nullable === 'YES'
      }));
    } catch (error) {
      console.error(`Error getting columns for table ${tableName}:`, error);
      return [];
    }
  }
}