/**
 * DuckDB File Storage using Dexie (IndexedDB wrapper)
 * Provides reliable persistent storage for DuckDB files
 */

import Dexie, { type EntityTable } from 'dexie';

interface DuckDBStoredFile {
  id: string;
  name: string;
  data: Uint8Array;
  size: number;
  uploadedAt: number;
  lastAccessedAt: number;
}

class DuckDBStorage extends Dexie {
  duckdbFiles!: EntityTable<DuckDBStoredFile, 'id'>;

  constructor() {
    super('DuckDBStorage');

    this.version(1).stores({
      duckdbFiles: 'id, name, uploadedAt, lastAccessedAt'
    });
  }

  /**
   * Store a DuckDB file - Dexie handles all the complexity
   */
  async storeFile(name: string, data: Uint8Array): Promise<string> {
    try {
      const now = Date.now();
      const id = `duckdb_${now}_${name}`;

      // Create a proper copy to avoid detached buffer issues
      const dataCopy = new Uint8Array(data.length);
      dataCopy.set(data);

      const fileRecord: DuckDBStoredFile = {
        id,
        name,
        data: dataCopy,
        size: dataCopy.length,
        uploadedAt: now,
        lastAccessedAt: now
      };

      // Clear existing files (keep only one)
      await this.duckdbFiles.clear();

      // Store the new file
      await this.duckdbFiles.add(fileRecord);

      console.log(`💾 DuckDB file stored with Dexie: ${name} (${this.formatBytes(dataCopy.length)})`);
      console.log(`📦 Storage successful, ID: ${id}, timestamp: ${new Date(now).toISOString()}`);

      return id;
    } catch (error) {
      console.warn('📦 Dexie storage failed, continuing without storage:', error);
      return '';
    }
  }

  /**
   * Retrieve the most recent stored DuckDB file
   */
  async getFile(): Promise<DuckDBStoredFile | null> {
    try {
      const files = await this.duckdbFiles.orderBy('uploadedAt').reverse().toArray();

      console.log(`📦 Dexie query returned ${files.length} files`);

      if (files.length === 0) {
        console.log('📦 No files found in Dexie storage');
        return null;
      }

      const file = files[0]; // Most recent
      console.log(`📦 Most recent file:`, {
        name: file.name,
        size: file.size,
        uploadedAt: new Date(file.uploadedAt).toISOString()
      });

      // Update last accessed time (non-blocking)
      this.updateLastAccessed(file.id).catch(() => {
        // Ignore errors in updating last accessed time
      });

      console.log(`📥 Retrieved DuckDB file from Dexie: ${file.name} (${this.formatBytes(file.size)})`);
      return file;
    } catch (error) {
      console.warn('📦 Dexie retrieval failed, continuing without storage:', error);
      return null;
    }
  }

  /**
   * Check if any DuckDB file exists in storage
   */
  async hasFile(): Promise<boolean> {
    try {
      const count = await this.duckdbFiles.count();
      return count > 0;
    } catch (error) {
      console.warn('📦 Dexie count failed, continuing without storage:', error);
      return false;
    }
  }

  /**
   * Delete all stored DuckDB files
   */
  async clearFiles(): Promise<void> {
    try {
      await this.duckdbFiles.clear();
      console.log('🗑️ Cleared all DuckDB files from Dexie storage');
    } catch (error) {
      console.warn('📦 Dexie clear failed, continuing anyway:', error);
    }
  }

  /**
   * Get storage information
   */
  async getStorageInfo(): Promise<{
    fileCount: number;
    totalSize: number;
    files: Array<{ name: string; size: number; uploadedAt: number }>
  }> {
    try {
      const files = await this.duckdbFiles.toArray();
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);

      return {
        fileCount: files.length,
        totalSize,
        files: files.map(f => ({
          name: f.name,
          size: f.size,
          uploadedAt: f.uploadedAt
        }))
      };
    } catch (error) {
      console.warn('📦 Dexie storage info failed:', error);
      return { fileCount: 0, totalSize: 0, files: [] };
    }
  }

  /**
   * Update last accessed time for a file
   */
  private async updateLastAccessed(id: string): Promise<void> {
    try {
      await this.duckdbFiles.update(id, { lastAccessedAt: Date.now() });
    } catch (error) {
      console.warn('📦 Failed to update last accessed time:', error);
    }
  }

  /**
   * Debug function to inspect storage contents
   */
  async debugStorage(): Promise<void> {
    try {
      const files = await this.duckdbFiles.toArray();
      console.log('📦 DEBUG: Dexie storage contents:', files.map(f => ({
        id: f.id,
        name: f.name,
        size: f.size,
        uploadedAt: new Date(f.uploadedAt).toISOString(),
        hasData: f.data instanceof Uint8Array,
        dataLength: f.data?.length || 0
      })));
    } catch (error) {
      console.log('📦 DEBUG: Error accessing Dexie storage:', error);
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Create and export singleton instance
export const duckDBStorage = new DuckDBStorage();

// Helper functions for easy usage
export const storeDuckDBFile = (name: string, data: Uint8Array) => duckDBStorage.storeFile(name, data);
export const getDuckDBFile = () => duckDBStorage.getFile();
export const hasDuckDBFile = () => duckDBStorage.hasFile();
export const clearDuckDBFiles = () => duckDBStorage.clearFiles();
export const getDuckDBStorageInfo = () => duckDBStorage.getStorageInfo();
export const debugDuckDBStorage = () => duckDBStorage.debugStorage();