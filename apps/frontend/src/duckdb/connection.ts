import * as duckdb from '@duckdb/duckdb-wasm';

export interface DuckDBGlobals {
  conn: duckdb.AsyncDuckDBConnection | null;
  db: duckdb.AsyncDuckDB | null;
  isInitialized: boolean;
  isInitializing: boolean;
}

export const GLO: DuckDBGlobals = {
  conn: null,
  db: null,
  isInitialized: false,
  isInitializing: false,
};

// Make GLO available globally for debugging
// @ts-ignore
window.GLO = GLO;

export class DuckDBManager {
  private static instance: DuckDBManager;

  private constructor() {}

  static getInstance(): DuckDBManager {
    if (!DuckDBManager.instance) {
      DuckDBManager.instance = new DuckDBManager();
    }
    return DuckDBManager.instance;
  }

  async initialize(): Promise<duckdb.AsyncDuckDB> {
    if (GLO.isInitialized && GLO.db) {
      return GLO.db;
    }

    if (GLO.isInitializing) {
      // Wait for existing initialization to complete
      return new Promise((resolve, reject) => {
        const checkInit = () => {
          if (GLO.isInitialized && GLO.db) {
            resolve(GLO.db);
          } else if (!GLO.isInitializing) {
            reject(new Error('DuckDB initialization failed'));
          } else {
            setTimeout(checkInit, 100);
          }
        };
        checkInit();
      });
    }

    GLO.isInitializing = true;

    try {
      console.log('🦆 Initializing DuckDB...');

      const CDN_BUNDLES = duckdb.getJsDelivrBundles();
      const bundle = await duckdb.selectBundle(CDN_BUNDLES);

      const worker_url = URL.createObjectURL(
        new Blob([`importScripts("${bundle.mainWorker}");`], {
          type: "text/javascript"
        })
      );

      // Instantiate the asynchronous version of DuckDB-wasm
      const worker = new Worker(worker_url);
      const logger = new duckdb.ConsoleLogger(duckdb.LogLevel.WARNING);
      const db = new duckdb.AsyncDuckDB(logger, worker);

      await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
      URL.revokeObjectURL(worker_url);

      // Create connection
      const conn = await db.connect();

      GLO.conn = conn;
      GLO.db = db;
      GLO.isInitialized = true;
      GLO.isInitializing = false;

      console.log('✅ DuckDB initialized successfully');
      return db;

    } catch (error) {
      GLO.isInitializing = false;
      console.error('❌ DuckDB initialization failed:', error);
      throw error;
    }
  }

  async getConnection(): Promise<duckdb.AsyncDuckDBConnection> {
    if (!GLO.conn) {
      await this.initialize();
    }

    if (!GLO.conn) {
      throw new Error('Failed to establish DuckDB connection');
    }

    return GLO.conn;
  }

  async execute(query: string): Promise<any> {
    const conn = await this.getConnection();
    return await conn.query(query);
  }

  async close(): Promise<void> {
    if (GLO.conn) {
      await GLO.conn.close();
      GLO.conn = null;
    }

    if (GLO.db) {
      await GLO.db.terminate();
      GLO.db = null;
    }

    GLO.isInitialized = false;
  }

  isReady(): boolean {
    return GLO.isInitialized && GLO.conn !== null;
  }

  isInitialized(): boolean {
    return GLO.isInitialized;
  }
}

// Export singleton instance
export const duckDBManager = DuckDBManager.getInstance();