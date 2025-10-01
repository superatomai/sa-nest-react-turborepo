import React, { useState, useEffect, useRef } from 'react'
import { Icon } from '@iconify/react'
import { duckDBManager } from '../connection'
import { queryExecutor } from '../query'
import { storeDuckDBFile, getDuckDBFile } from '../storage'
import DataTable from '../components/DataTable'
import type { QueryResult } from '../types'

interface DuckDBDataViewerProps {
  theme?: string
}

interface TableRow {
  table_name: string
  [key: string]: any
}

const DuckDBDataViewer: React.FC<DuckDBDataViewerProps> = ({ theme = 'modern' }) => {
  const [activeTab, setActiveTab] = useState<string>('tables')
  const [tables, setTables] = useState<TableRow[]>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [tableResult, setTableResult] = useState<QueryResult | null>(null)
  const [isLoadingTables, setIsLoadingTables] = useState<boolean>(false)
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false)
  const [queryText, setQueryText] = useState<string>("SELECT table_name FROM information_schema.tables WHERE table_schema = 'main' ORDER BY table_name")
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null)
  const [isExecutingQuery, setIsExecutingQuery] = useState<boolean>(false)
  const [queryError, setQueryError] = useState<string>('')
  const [isUploadingFile, setIsUploadingFile] = useState<boolean>(false)
  const [uploadError, setUploadError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dataTableRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initializeAndLoadTables()
  }, [])

  const initializeAndLoadTables = async () => {
    try {
      // Initialize DuckDB if not already initialized
      if (!duckDBManager.isReady()) {
        await duckDBManager.initialize()
      }

      // Check for stored database file
      const storedFile = await getDuckDBFile()
      if (storedFile) {
        console.log('Found stored DuckDB file, loading automatically...', storedFile)
        await loadStoredDatabase(storedFile)
      }

      // Load tables
      await loadTables()
    } catch (e) {
      console.error('Error during initialization:', e)
    }
  }

  const loadStoredDatabase = async (storedFile: any) => {
    try {
      const conn = await duckDBManager.getConnection()
      const db = await duckDBManager.initialize()

      // Detach any existing database
      try {
        await conn.query('DETACH ddb')
      } catch (error) {
        // Ignore if no database to detach
      }

      // Register and attach the stored file
      await db.registerFileBuffer(storedFile.name, storedFile.data)
      await conn.query(`ATTACH '${storedFile.name}' AS ddb`)

      console.log(`Auto-loaded database from storage: ${storedFile.name}`)
    } catch (error) {
      console.error('Failed to load stored database:', error)
    }
  }

  const loadTables = async () => {
    setIsLoadingTables(true)
    try {
      console.log('Loading tables from DuckDB...')

      // Initialize DuckDB if not already initialized
      if (!duckDBManager.isReady()) {
        await duckDBManager.initialize()
      }

      const result = await queryExecutor.executeQuery(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'main' ORDER BY table_name"
      )

      const tablesData = result.data.map(row => ({ table_name: row.table_name }))
      setTables(tablesData)

      if (tablesData.length > 0) {
        const firstTable = tablesData[0].table_name
        setSelectedTable(firstTable)
        await loadTableData(firstTable)
      }
    } catch (e) {
      console.error('Error loading tables:', e)
      setTables([])
    }
    setIsLoadingTables(false)
  }

  const loadTableData = async (tableName: string) => {
    setIsLoadingData(true)
    try {
      const result = await queryExecutor.executeQuery(`SELECT * FROM ddb.${tableName} LIMIT 100`)
      setTableResult(result)
    } catch (e) {
      console.error('Error loading table data:', e)
      setTableResult(null)
    }
    setIsLoadingData(false)
  }

  const handleExecuteQuery = async () => {
    if (!queryText.trim()) {
      setQueryError('Please enter a query')
      return
    }

    setIsExecutingQuery(true)
    setQueryError('')
    try {
      const result = await queryExecutor.executeQuery(queryText)
      setQueryResult(result)
      console.log(`Query executed successfully: ${result.numRows} rows in ${result.executionTime.toFixed(2)}ms`)
    } catch (e: any) {
      console.error('Query execution failed:', e)
      setQueryError(e.message || 'Query execution failed')
      setQueryResult(null)
    }
    setIsExecutingQuery(false)
  }

  const handleClearQuery = () => {
    setQueryText("SELECT table_name FROM information_schema.tables WHERE table_schema = 'main' ORDER BY table_name")
    setQueryResult(null)
    setQueryError('')
  }

  const handleTableClick = async (tableName: string) => {
    setSelectedTable(tableName)
    await loadTableData(tableName)

    // Smooth scroll to data table
    setTimeout(() => {
      dataTableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check if file has .db or .duckdb extension
    const validExtensions = ['.db', '.duckdb']
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))

    if (!validExtensions.includes(fileExtension)) {
      setUploadError('Please select a valid DuckDB file (.db or .duckdb)')
      return
    }

    setIsUploadingFile(true)
    setUploadError('')

    try {
      // Initialize DuckDB if not already done
      if (!duckDBManager.isReady()) {
        await duckDBManager.initialize()
      }

      const conn = await duckDBManager.getConnection()

      // Detach existing database if any
      try {
        await conn.query('DETACH ddb')
      } catch (error) {
        // Ignore if no database to detach
      }

      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)

      // Create a copy for storage BEFORE DuckDB consumes the original
      const storageData = new Uint8Array(uint8Array.length)
      storageData.set(uint8Array)

      // Register the file with DuckDB
      const db = await duckDBManager.initialize()
      await db.registerFileBuffer(file.name, uint8Array)

      // Attach the database
      await conn.query(`ATTACH '${file.name}' AS ddb`)

      // Store the file in IndexedDB for persistence
      try {
        await storeDuckDBFile(file.name, storageData)
        console.log('Database saved to IndexedDB for future sessions')
      } catch (storageError) {
        console.warn('Could not save to IndexedDB:', storageError)
      }

      // Reload tables
      await loadTables()

      console.log(`Successfully loaded DuckDB file: ${file.name}`)
    } catch (error: any) {
      console.error('Error loading DuckDB file:', error)
      setUploadError(error.message || 'Failed to load DuckDB file')
    } finally {
      setIsUploadingFile(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#d4dce6] p-8">
      {/* Header */}
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-[2rem] font-bold text-[#2d3748] flex items-center gap-3">
            <Icon icon="mdi:database-eye" width={36} height={36} className="text-[#6b8cce]" />
            <span>DuckDB Data Viewer</span>
          </h1>

          {/* File Upload Button */}
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".db,.duckdb"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingFile}
              className="flex items-center gap-2 bg-[#6b8cce] text-white px-5 py-3 rounded-[10px] font-semibold text-sm shadow-[0_2px_8px_rgba(107,140,206,0.25)] hover:bg-[#5a7ab8] transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploadingFile ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <Icon icon="mdi:upload" width={20} height={20} />
                  <span>Upload DuckDB File</span>
                </>
              )}
            </button>
          </div>
        </div>
        <p className="text-[#718096] text-base">
          Explore all tables and data from your uploaded DuckDB file
        </p>

        {/* Upload Error */}
        {uploadError && (
          <div className="mt-4 bg-[#fee] border border-[#fcc] rounded-[10px] p-4 text-[#c33] text-sm flex items-center gap-2">
            <Icon icon="mdi:alert-circle" width={20} height={20} />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Tabs Container */}
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] mb-6 overflow-hidden">
        {/* Tabs Header */}
        <div className="flex border-b border-[#e2e8f0] bg-[#f8f9fb]">
          <button
            className={`px-8 py-4 font-semibold text-sm transition-all duration-200 ${
              activeTab === 'tables'
                ? 'border-b-2 border-[#6b8cce] text-[#6b8cce] bg-white'
                : 'text-[#718096] hover:text-[#4a5568] hover:bg-white'
            }`}
            onClick={() => setActiveTab('tables')}
          >
            Database Tables
          </button>
          <button
            className={`px-8 py-4 font-semibold text-sm transition-all duration-200 ${
              activeTab === 'query'
                ? 'border-b-2 border-[#6b8cce] text-[#6b8cce] bg-white'
                : 'text-[#718096] hover:text-[#4a5568] hover:bg-white'
            }`}
            onClick={() => setActiveTab('query')}
          >
            SQL Query Interface
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 'tables' && (
            <div>
              <h3 className="text-xl font-semibold text-[#2d3748] mb-6">Available Tables</h3>

              {/* Loading Tables */}
              {isLoadingTables && (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-[#6b8cce] border-t-transparent rounded-full animate-spin mr-3" />
                  <span className="text-[#718096]">Loading tables...</span>
                </div>
              )}

              {/* Tables Grid */}
              {!isLoadingTables && tables.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                  {tables.map((table) => (
                    <div
                      key={table.table_name}
                      onClick={() => handleTableClick(table.table_name)}
                      className="bg-[#f8f9fb] border border-[#e2e8f0] rounded-[16px] p-6 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-200 cursor-pointer hover:-translate-y-1"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Icon icon="mdi:table" width={24} height={24} className="text-[#6b8cce]" />
                        <h4 className="font-semibold text-[#2d3748]">{table.table_name}</h4>
                      </div>
                      <div className="text-sm text-[#718096]">
                        {selectedTable === table.table_name
                          ? '✓ Currently displayed below'
                          : 'Click to view data'}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No Tables */}
              {!isLoadingTables && tables.length === 0 && (
                <div className="text-center py-16">
                  <Icon
                    icon="mdi:database-off"
                    width={64}
                    height={64}
                    className="mx-auto mb-4 text-[#a0aec0]"
                  />
                  <p className="text-[#718096]">
                    No tables found. Please upload a DuckDB file or create tables using SQL query interface.
                  </p>
                </div>
              )}

              {/* Data Section */}
              {selectedTable && (
                <div ref={dataTableRef} className="pt-6 border-t border-[#e2e8f0]">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-[#2d3748]">
                      Data from: <span className="text-[#6b8cce]">{selectedTable}</span>
                    </h3>
                  </div>
                  <DataTable result={tableResult} isLoading={isLoadingData} maxRows={100} />
                </div>
              )}
            </div>
          )}

          {activeTab === 'query' && (
            <div>
              <h3 className="text-xl font-semibold text-[#2d3748] mb-6">SQL Query Interface</h3>
              <div className="bg-[#f8f9fb] border border-[#e2e8f0] rounded-[16px] p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#4a5568] mb-2">SQL Query</label>
                  <textarea
                    className="w-full bg-white border border-[#e2e8f0] rounded-[10px] p-4 text-[#2d3748] text-sm font-mono focus:outline-none focus:border-[#6b8cce] focus:ring-2 focus:ring-[#6b8cce] focus:ring-opacity-20 transition-all duration-200"
                    rows={6}
                    placeholder="SELECT * FROM table_name LIMIT 100"
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    className="bg-[#6b8cce] text-white px-6 py-3 rounded-[10px] font-semibold text-sm shadow-[0_2px_8px_rgba(107,140,206,0.25)] hover:bg-[#5a7ab8] transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleExecuteQuery}
                    disabled={isExecutingQuery}
                  >
                    {isExecutingQuery ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <Icon icon="mdi:play" width={20} height={20} className="inline mr-2" />
                        Execute Query
                      </>
                    )}
                  </button>
                  <button
                    className="bg-white text-[#4a5568] px-6 py-3 rounded-[10px] font-medium text-sm border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:bg-[#f8f9fb] transition-all duration-200"
                    onClick={handleClearQuery}
                  >
                    Clear
                  </button>
                </div>

                {/* Query Error */}
                {queryError && (
                  <div className="mt-4 bg-[#fee] border border-[#fcc] rounded-[10px] p-4 text-[#c33] text-sm">
                    <Icon icon="mdi:alert-circle" width={20} height={20} className="inline mr-2" />
                    {queryError}
                  </div>
                )}

                {/* Query Results */}
                {queryResult && (
                  <div className="mt-6">
                    <DataTable result={queryResult} isLoading={isExecutingQuery} maxRows={100} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DuckDBDataViewer