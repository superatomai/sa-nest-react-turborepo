import React, { useState, useRef, useEffect } from 'react';
import { duckDBManager } from '../connection';
import { SchemaGenerator, type SchemaInfo } from '../schema';
import { storeDuckDBFile, getDuckDBFile, clearDuckDBFiles, debugDuckDBStorage } from '../storage';

interface DuckDBFileUploadProps {
  onFileLoaded?: (filename: string, size: number) => void;
  onError?: (error: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

const DuckDBFileUpload: React.FC<DuckDBFileUploadProps> = ({
  onFileLoaded,
  onError,
  className = '',
  style
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [schemaInfo, setSchemaInfo] = useState<SchemaInfo | null>(null);
  const [isGeneratingSchema, setIsGeneratingSchema] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [showReplaceConfirmation, setShowReplaceConfirmation] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isAutoLoading, setIsAutoLoading] = useState(false);
  const [loadedFromStorage, setLoadedFromStorage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-initialize DuckDB and load from storage on component mount
  useEffect(() => {
    const autoInitializeAndLoad = async () => {
      try {
        setIsAutoLoading(true);

        // Debug what's in storage (Dexie auto-initializes)
        try {
          await debugDuckDBStorage();
        } catch (error) {
          console.warn('📦 Storage debug failed, continuing without storage:', error);
        }

        // Auto-initialize DuckDB
        if (!duckDBManager.isInitialized()) {
          console.log('🦆 Auto-initializing DuckDB...');
          await duckDBManager.initialize();
          setIsInitialized(true);
        }

        // Check for stored database file (non-blocking)
        let storedFile = null;
        try {
          console.log('🔍 Checking for stored DuckDB files...');
          storedFile = await getDuckDBFile();
          console.log('📦 Storage check result:', storedFile ? `Found: ${storedFile.name}` : 'No stored file found');
        } catch (error) {
          console.warn('📦 Failed to check for stored files, continuing without storage:', error);
        }

        if (storedFile) {
          console.log('📥 Found stored DuckDB file, loading automatically...', storedFile);
          try {
            await loadStoredDatabase(storedFile);
          } catch (error) {
            console.warn('📦 Failed to load stored database, continuing without it:', error);
          }
        } else {
          // Check if database is already attached (from previous session)
          try {
            const conn = await duckDBManager.getConnection();
            const result = await conn.query(`
              SELECT database_name
              FROM duckdb_databases()
              WHERE database_name = 'ddb'
            `);

            const databases = result.toArray();
            if (databases.length > 0) {
              setHasExistingData(true);
              setIsInitialized(true);

              // Try to get existing schema
              const existingSchema = SchemaGenerator.getSchema();
              if (existingSchema) {
                setSchemaInfo(existingSchema);
              } else {
                // Generate schema from existing data
                setIsGeneratingSchema(true);
                try {
                  const schema = await SchemaGenerator.generateFromDuckDB('ddb');
                  setSchemaInfo(schema);
                } catch (error) {
                  console.warn('Could not generate schema from existing data:', error);
                } finally {
                  setIsGeneratingSchema(false);
                }
              }
            }
          } catch (error) {
            console.log('No existing DuckDB data found in memory');
          }
        }
      } catch (error) {
        console.error('Auto-initialization failed:', error);
      } finally {
        setIsAutoLoading(false);
      }
    };

    autoInitializeAndLoad();
  }, []);

  const loadStoredDatabase = async (storedFile: any) => {
    try {
      const conn = await duckDBManager.getConnection();
      const db = await duckDBManager.initialize();

      // Detach any existing database
      try {
        await conn.query('DETACH ddb');
      } catch (error) {
        // Ignore if no database to detach
      }

      // Register and attach the stored file
      await db.registerFileBuffer(storedFile.name, storedFile.data);
      await conn.query(`ATTACH '${storedFile.name}' AS ddb`);

      // Update state
      setUploadedFile(storedFile.name);
      setFileSize(storedFile.size);
      setHasExistingData(true);
      setLoadedFromStorage(true);
      setIsInitialized(true);

      // Generate schema
      setIsGeneratingSchema(true);
      try {
        const schema = await SchemaGenerator.generateFromDuckDB('ddb');
        setSchemaInfo(schema);
      } catch (error) {
        console.warn('Could not generate schema from stored database:', error);
      } finally {
        setIsGeneratingSchema(false);
      }

      console.log(`✅ Auto-loaded database from storage: ${storedFile.name}`);
    } catch (error) {
      console.error('Failed to load stored database:', error);
    }
  };

  // Removed initializeDuckDB function since we auto-initialize now

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file has .db or .duckdb extension
    const validExtensions = ['.db', '.duckdb'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!validExtensions.includes(fileExtension)) {
      onError?.('Please select a valid DuckDB file (.db or .duckdb)');
      return;
    }

    // If there's existing data, show confirmation dialog
    if (hasExistingData) {
      setPendingFile(file);
      setShowReplaceConfirmation(true);
      return;
    }

    await processFileUpload(file);
  };

  const processFileUpload = async (file: File) => {
    setIsLoading(true);

    try {
      // Initialize DuckDB if not already done
      if (!isInitialized) {
        await duckDBManager.initialize();
        setIsInitialized(true);
      }

      const conn = await duckDBManager.getConnection();

      // If replacing existing data, detach first
      if (hasExistingData) {
        try {
          await conn.query('DETACH ddb');
        } catch (error) {
          console.log('No existing database to detach');
        }
      }

      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Create a copy for storage BEFORE DuckDB consumes the original
      const storageData = new Uint8Array(uint8Array.length);
      storageData.set(uint8Array);

      // Register the file with DuckDB
      const db = await duckDBManager.initialize();
      await db.registerFileBuffer(file.name, uint8Array);

      // Attach the database
      await conn.query(`ATTACH '${file.name}' AS ddb`);

      setUploadedFile(file.name);
      setFileSize(file.size);
      setHasExistingData(true);
      setLoadedFromStorage(false); // This is a fresh upload

      // Store the file in IndexedDB for persistence (non-blocking)
      // Use the copy we made before DuckDB consumed the original
      try {
        await storeDuckDBFile(file.name, storageData);
        console.log('💾 Database saved to IndexedDB for future sessions');
      } catch (storageError) {
        console.warn('📦 Could not save to IndexedDB, continuing without storage:', storageError);
        // Don't fail the upload if storage fails - this is just a nice-to-have feature
      }

      // Generate schema information
      setIsGeneratingSchema(true);
      try {
        const schema = await SchemaGenerator.generateFromDuckDB('ddb');
        setSchemaInfo(schema);
      } catch (schemaError) {
        console.warn('Could not generate schema:', schemaError);
        // Don't fail the upload if schema generation fails
      } finally {
        setIsGeneratingSchema(false);
      }

      onFileLoaded?.(file.name, file.size);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load DuckDB file';
      onError?.(errorMsg);
      setSchemaInfo(null); // Clear any previous schema info on error
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleButtonClick = () => {
    // Since we auto-initialize, just open file picker
    fileInputRef.current?.click();
  };

  const handleReplaceConfirm = async () => {
    if (pendingFile) {
      setShowReplaceConfirmation(false);
      await processFileUpload(pendingFile);
      setPendingFile(null);
    }
  };

  const handleReplaceCancel = () => {
    setShowReplaceConfirmation(false);
    setPendingFile(null);
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearStorage = async () => {
    try {
      await clearDuckDBFiles();
      console.log('🗑️ Cleared IndexedDB storage');
    } catch (error) {
      console.warn('📦 Failed to clear storage, continuing anyway:', error);
    }
  };

  return (
    <div className={`duckdb-file-upload bg-white border border-gray-200 rounded-lg p-6 ${className}`} style={style}>
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {hasExistingData ? 'DuckDB File Loaded' : 'Load DuckDB File'}
        </h3>

        {hasExistingData ? (
          <div className="mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-800 font-medium">File loaded successfully</span>
              </div>
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Filename:</strong> {uploadedFile || 'Previously loaded database'}</p>
              <p><strong>Size:</strong> {fileSize > 0 ? formatFileSize(fileSize) : 'Unknown'}</p>
              <p><strong>Database:</strong> attached as 'ddb'</p>
              {loadedFromStorage && (
                <p className="text-blue-600">
                  <strong>Source:</strong> Auto-loaded from IndexedDB storage
                </p>
              )}
            </div>

            {isGeneratingSchema && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing database schema...</span>
                </div>
              </div>
            )}

            {schemaInfo && (
              <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900">Database Schema</h4>
                </div>
                <div className="p-4 space-y-4 max-h-64 overflow-y-auto">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Database:</span>
                      <span className="text-gray-900">{schemaInfo.databaseName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Tables:</span>
                      <span className="text-gray-900">{schemaInfo.tables.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Relationships:</span>
                      <span className="text-gray-900">{schemaInfo.relationships.length}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {schemaInfo.tables.map((table, index) => (
                      <div key={index} className="border border-gray-200 rounded p-3 bg-white">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="font-medium text-gray-900">{table.name}</h5>
                          {table.rowCount !== undefined && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {table.rowCount} rows
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          {table.columns.map((column, colIndex) => (
                            <div key={colIndex} className="flex justify-between items-center">
                              <span className="font-mono">{column.name}</span>
                              <span className="text-gray-500">
                                {column.type}{column.nullable ? ' (nullable)' : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {schemaInfo.relationships.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Relationships</h5>
                      <div className="space-y-1 text-xs text-gray-600">
                        {schemaInfo.relationships.map((rel, index) => (
                          <div key={index} className="font-mono">
                            {rel.from.table}.{rel.from.column} → {rel.to.table}.{rel.to.column} ({rel.type})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
              💡 <strong>Usage:</strong> You can now query your database using <code>ddb.table_name</code> syntax
            </div>
          </div>
        ) : isAutoLoading ? (
          <div className="mb-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-blue-800">Auto-initializing DuckDB and checking for stored database...</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 mb-6">
            Select a .db or .duckdb file to upload. DuckDB is ready and will auto-save your database for future sessions.
          </p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".db,.duckdb"
          onChange={handleFileUpload}
          className="hidden"
        />

        <div className="space-y-3">
          <button
            onClick={handleButtonClick}
            disabled={isLoading || isAutoLoading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading || isAutoLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {isAutoLoading ? 'Auto-initializing...' : 'Loading file...'}
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {hasExistingData ? 'Replace Database' : 'Upload DuckDB File'}
              </>
            )}
          </button>

          {hasExistingData && (
            <div className="space-y-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="block mx-auto px-4 py-2 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                Replace with different file
              </button>
              {process.env.NODE_ENV === 'development' && (
                <div className="space-y-1">
                  <button
                    onClick={async () => await debugDuckDBStorage()}
                    className="block mx-auto px-3 py-1 text-xs text-blue-600 hover:text-blue-800"
                  >
                    Debug Storage (Dev)
                  </button>
                  <button
                    onClick={handleClearStorage}
                    className="block mx-auto px-3 py-1 text-xs text-red-600 hover:text-red-800"
                  >
                    Clear Storage (Dev)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Replace Confirmation Dialog */}
        {showReplaceConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Replace Database?</h4>
              </div>

              <p className="text-gray-600 mb-6">
                A database is already loaded. Do you want to replace it with <strong>{pendingFile?.name}</strong>?
                This will remove the current database and all its data from memory.
              </p>

              <div className="flex space-x-3 justify-end">
                <button
                  onClick={handleReplaceCancel}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReplaceConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Replace Database
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 text-xs text-gray-500">
          <p>Supported formats: .db, .duckdb</p>
          <p>Files are loaded into browser memory and not uploaded to any server</p>
        </div>
      </div>
    </div>
  );
};

export default DuckDBFileUpload;