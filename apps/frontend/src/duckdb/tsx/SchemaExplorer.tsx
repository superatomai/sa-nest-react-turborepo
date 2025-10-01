import React, { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import toast from 'react-hot-toast'
import { queryExecutor } from '../query'

interface SchemaExplorerProps {
  theme?: string
}

interface Column {
  name: string
  type: string
  nullable: boolean
}

interface Relationship {
  from: { table: string; column: string }
  to: { table: string; column: string }
}

interface TableSchema {
  name: string
  columns: Column[]
  rowCount: number
  relationships: Relationship[]
}

const SchemaExplorer: React.FC<SchemaExplorerProps> = ({ theme = 'modern' }) => {
  const [schemas, setSchemas] = useState<TableSchema[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)

  useEffect(() => {
    loadSchema()
  }, [])

  const loadSchema = async () => {
    setIsLoading(true)
    try {
      // Get all tables
      const tablesResult = await queryExecutor.executeQuery(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'main'
        ORDER BY table_name
      `)

      const tables = tablesResult.data.map((row: any) => row.table_name)
      console.log('📊 Found tables:', tables)

      const tableSchemas: TableSchema[] = []

      for (const tableName of tables) {
        // Get columns for each table
        const columnsResult = await queryExecutor.executeQuery(`
          SELECT
            column_name,
            data_type,
            is_nullable
          FROM information_schema.columns
          WHERE table_name = '${tableName}'
          AND table_schema = 'main'
          ORDER BY ordinal_position
        `)

        const columns: Column[] = columnsResult.data.map((col: any) => ({
          name: col.column_name,
          type: col.data_type,
          nullable: col.is_nullable === 'YES'
        }))

        // Get row count
        let rowCount = 0
        try {
          const countResult = await queryExecutor.executeQuery(`SELECT COUNT(*) as count FROM ddb.${tableName}`)
          rowCount = typeof countResult.data[0].count === 'bigint'
            ? Number(countResult.data[0].count)
            : countResult.data[0].count
        } catch (e) {
          console.warn(`Could not get row count for ${tableName}`)
        }

        // Detect relationships (foreign keys)
        const relationships: Relationship[] = []
        for (const column of columns) {
          if (column.name.endsWith('_id') && column.name !== 'id') {
            const referencedTable = column.name.replace('_id', '')
            // Try plural and singular forms
            const possibleTables = [referencedTable, referencedTable + 's', referencedTable.slice(0, -1)]
            const actualTable = possibleTables.find(name =>
              tables.some((t: string) => t.toLowerCase() === name.toLowerCase())
            )

            if (actualTable) {
              relationships.push({
                from: { table: tableName, column: column.name },
                to: { table: actualTable, column: 'id' }
              })
            }
          }
        }

        tableSchemas.push({
          name: tableName,
          columns,
          rowCount,
          relationships
        })
      }

      setSchemas(tableSchemas)
      toast.success(`Loaded schema for ${tableSchemas.length} tables`)
    } catch (e) {
      console.error('Error loading schema:', e)
      toast.error('Failed to load database schema')
    }
    setIsLoading(false)
  }

  const downloadAsJSON = () => {
    const schemaData = {
      database: 'ddb',
      generatedAt: new Date().toISOString(),
      tables: schemas.map(schema => ({
        name: schema.name,
        rowCount: schema.rowCount,
        columns: schema.columns,
        relationships: schema.relationships
      }))
    }

    const blob = new Blob([JSON.stringify(schemaData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `duckdb-schema-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Schema downloaded as JSON')
  }

  const downloadAsMarkdown = () => {
    let markdown = `# DuckDB Schema Documentation\n\n`
    markdown += `**Database:** ddb\n`
    markdown += `**Generated:** ${new Date().toISOString()}\n`
    markdown += `**Total Tables:** ${schemas.length}\n\n`

    markdown += `## Tables Overview\n\n`
    markdown += `| Table | Columns | Rows | Relationships |\n`
    markdown += `|-------|---------|------|---------------|\n`

    schemas.forEach(schema => {
      markdown += `| ${schema.name} | ${schema.columns.length} | ${schema.rowCount.toLocaleString()} | ${schema.relationships.length} |\n`
    })

    markdown += `\n## Detailed Schema\n\n`

    schemas.forEach(schema => {
      markdown += `### ${schema.name}\n\n`
      markdown += `**Row Count:** ${schema.rowCount.toLocaleString()}\n\n`

      markdown += `#### Columns\n\n`
      markdown += `| Column | Type | Nullable |\n`
      markdown += `|--------|------|----------|\n`

      schema.columns.forEach(col => {
        markdown += `| ${col.name} | ${col.type} | ${col.nullable ? 'Yes' : 'No'} |\n`
      })

      if (schema.relationships.length > 0) {
        markdown += `\n#### Relationships\n\n`
        schema.relationships.forEach(rel => {
          markdown += `- **${rel.from.column}** → ${rel.to.table}.${rel.to.column}\n`
        })
      }

      markdown += `\n---\n\n`
    })

    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `duckdb-schema-${Date.now()}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Schema downloaded as Markdown')
  }

  const selectedTableData = selectedTable ? schemas.find(s => s.name === selectedTable) : null

  return (
    <div className="min-h-screen bg-[#d4dce6] p-8">
      {/* Header */}
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-[2rem] font-bold text-[#2d3748] flex items-center gap-3 mb-2">
              <Icon icon="mdi:database-cog" width={36} height={36} className="text-[#6b8cce]" />
              <span>Schema Explorer</span>
            </h1>
            <p className="text-[#718096] text-base">
              Explore database structure, tables, columns, and relationships
            </p>
          </div>
          <button
            onClick={loadSchema}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-[#6b8cce] text-white rounded-[10px] hover:bg-[#5a7ab8] transition-all duration-200 text-sm font-semibold disabled:opacity-50"
          >
            <Icon icon="mdi:refresh" width={18} height={18} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Download Buttons */}
        <div className="flex gap-3">
          <button
            onClick={downloadAsJSON}
            disabled={isLoading || schemas.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-[#6bcf7f] text-white rounded-[10px] hover:bg-[#48bb78] transition-all duration-200 text-sm font-semibold disabled:opacity-50"
          >
            <Icon icon="mdi:download" width={18} height={18} />
            <span>Download JSON</span>
          </button>
          <button
            onClick={downloadAsMarkdown}
            disabled={isLoading || schemas.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-[#5ba3d0] text-white rounded-[10px] hover:bg-[#4a8fb8] transition-all duration-200 text-sm font-semibold disabled:opacity-50"
          >
            <Icon icon="mdi:download" width={18} height={18} />
            <span>Download Markdown</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 border-4 border-[#6b8cce] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#718096]">Loading database schema...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tables List */}
          <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
            <h2 className="text-xl font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
              <Icon icon="mdi:table-large" width={24} height={24} className="text-[#6b8cce]" />
              Tables ({schemas.length})
            </h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {schemas.map((schema) => (
                <button
                  key={schema.name}
                  onClick={() => setSelectedTable(schema.name)}
                  className={`w-full text-left p-4 rounded-[12px] transition-all duration-200 ${
                    selectedTable === schema.name
                      ? 'bg-[#6b8cce] text-white'
                      : 'bg-[#f8f9fb] text-[#2d3748] hover:bg-[#e2e8f0]'
                  }`}
                >
                  <div className="font-semibold mb-1">{schema.name}</div>
                  <div className={`text-xs ${selectedTable === schema.name ? 'text-white text-opacity-80' : 'text-[#718096]'}`}>
                    {schema.columns.length} columns • {schema.rowCount.toLocaleString()} rows
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Table Details */}
          <div className="lg:col-span-2">
            {selectedTableData ? (
              <div className="space-y-6">
                {/* Table Info */}
                <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
                  <h2 className="text-2xl font-bold text-[#2d3748] mb-4">{selectedTableData.name}</h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-[#f8f9fb] rounded-[12px] p-4">
                      <div className="text-[#718096] text-xs mb-1">Columns</div>
                      <div className="text-[#2d3748] font-bold text-xl">{selectedTableData.columns.length}</div>
                    </div>
                    <div className="bg-[#f8f9fb] rounded-[12px] p-4">
                      <div className="text-[#718096] text-xs mb-1">Rows</div>
                      <div className="text-[#2d3748] font-bold text-xl">{selectedTableData.rowCount.toLocaleString()}</div>
                    </div>
                    <div className="bg-[#f8f9fb] rounded-[12px] p-4">
                      <div className="text-[#718096] text-xs mb-1">Relationships</div>
                      <div className="text-[#2d3748] font-bold text-xl">{selectedTableData.relationships.length}</div>
                    </div>
                  </div>
                </div>

                {/* Columns */}
                <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
                  <h3 className="text-lg font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
                    <Icon icon="mdi:table-column" width={20} height={20} className="text-[#6b8cce]" />
                    Columns
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#e2e8f0]">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-[#718096]">Name</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-[#718096]">Type</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-[#718096]">Nullable</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTableData.columns.map((col, idx) => (
                          <tr key={idx} className="border-b border-[#e2e8f0] hover:bg-[#f8f9fb] transition-colors">
                            <td className="py-3 px-4">
                              <span className="font-mono text-sm text-[#2d3748]">{col.name}</span>
                              {col.name === 'id' && (
                                <span className="ml-2 text-xs bg-[#ffd93d] text-[#2d3748] px-2 py-0.5 rounded">PK</span>
                              )}
                              {col.name.endsWith('_id') && col.name !== 'id' && (
                                <span className="ml-2 text-xs bg-[#5ba3d0] text-white px-2 py-0.5 rounded">FK</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-sm text-[#718096]">{col.type}</td>
                            <td className="py-3 px-4 text-sm">
                              {col.nullable ? (
                                <span className="text-[#6bcf7f]">✓</span>
                              ) : (
                                <span className="text-[#fc8181]">✗</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Relationships */}
                {selectedTableData.relationships.length > 0 && (
                  <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
                    <h3 className="text-lg font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
                      <Icon icon="mdi:connection" width={20} height={20} className="text-[#6b8cce]" />
                      Relationships
                    </h3>
                    <div className="space-y-3">
                      {selectedTableData.relationships.map((rel, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-4 bg-[#f8f9fb] rounded-[12px]">
                          <div className="flex-1">
                            <div className="font-mono text-sm text-[#2d3748]">
                              {rel.from.table}.{rel.from.column}
                            </div>
                          </div>
                          <Icon icon="mdi:arrow-right" width={20} height={20} className="text-[#718096]" />
                          <div className="flex-1">
                            <div className="font-mono text-sm text-[#2d3748]">
                              {rel.to.table}.{rel.to.column}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-12">
                <div className="text-center">
                  <Icon icon="mdi:table-search" width={64} height={64} className="mx-auto mb-4 text-[#718096]" />
                  <p className="text-[#718096]">Select a table to view its schema details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SchemaExplorer
