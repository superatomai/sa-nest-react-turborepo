export const duckdb_dashboard_dsl = {
  id: 'duckdb-analytics-dashboard',
  name: 'DuckDB Analytics Dashboard',
  render: {
    id: 'dashboard-container',
    type: 'div',
    props: {
      className: 'min-h-screen bg-gray-50 p-6'
    },
    children: [
      // Header
      {
        id: 'dashboard-header',
        type: 'div',
        props: {
          className: 'mb-8'
        },
        children: [
          {
            id: 'dashboard-title',
            type: 'h1',
            props: {
              className: 'text-3xl font-bold text-gray-900 mb-2'
            },
            children: '📊 DuckDB Analytics Dashboard'
          },
          {
            id: 'dashboard-subtitle',
            type: 'p',
            props: {
              className: 'text-gray-600'
            },
            children: 'Upload data files and run SQL analytics directly in your browser'
          }
        ]
      },

      // Main content grid
      {
        id: 'main-grid',
        type: 'div',
        props: {
          className: 'grid grid-cols-1 xl:grid-cols-3 gap-6'
        },
        children: [
          // Left column - File upload and query interface
          {
            id: 'left-column',
            type: 'div',
            props: {
              className: 'xl:col-span-1 space-y-6'
            },
            children: [
              // File Upload Section
              {
                id: 'upload-section',
                type: 'div',
                props: {
                  className: 'bg-white rounded-lg shadow-sm border border-gray-200 p-6'
                },
                children: [
                  {
                    id: 'upload-title',
                    type: 'h2',
                    props: {
                      className: 'text-xl font-semibold text-gray-900 mb-4'
                    },
                    children: '📁 Upload Data Files'
                  },
                  {
                    id: 'upload-description',
                    type: 'p',
                    props: {
                      className: 'text-sm text-gray-600 mb-4'
                    },
                    children: 'Upload CSV, JSON, or Parquet files to analyze with SQL'
                  },
                  // DuckDB File Upload Component
                  {
                    id: 'duckdb-upload',
                    type: 'COMP_DUCKDB_UPLOAD',
                    props: {
                      className: 'w-full',
                      onFileLoaded: {
                        $exp: 'handleFileLoaded'
                      },
                      onError: {
                        $exp: 'handleUploadError'
                      }
                    }
                  }
                ]
              },

              // Query Examples Section
              {
                id: 'examples-section',
                type: 'div',
                props: {
                  className: 'bg-white rounded-lg shadow-sm border border-gray-200 p-6'
                },
                children: [
                  {
                    id: 'examples-title',
                    type: 'h2',
                    props: {
                      className: 'text-xl font-semibold text-gray-900 mb-4'
                    },
                    children: '💡 Sample Queries'
                  },
                  {
                    id: 'examples-list',
                    type: 'div',
                    props: {
                      className: 'space-y-3'
                    },
                    children: [
                      {
                        id: 'example-1',
                        type: 'div',
                        props: {
                          className: 'bg-gray-50 p-3 rounded-md'
                        },
                        children: [
                          {
                            id: 'example-1-title',
                            type: 'p',
                            props: {
                              className: 'text-sm font-medium text-gray-700 mb-1'
                            },
                            children: 'Basic Analysis:'
                          },
                          {
                            id: 'example-1-code',
                            type: 'code',
                            props: {
                              className: 'text-xs text-gray-600 bg-white p-2 rounded block'
                            },
                            children: 'SELECT COUNT(*) as total_rows FROM "uploaded_file.csv"'
                          }
                        ]
                      },
                      {
                        id: 'example-2',
                        type: 'div',
                        props: {
                          className: 'bg-gray-50 p-3 rounded-md'
                        },
                        children: [
                          {
                            id: 'example-2-title',
                            type: 'p',
                            props: {
                              className: 'text-sm font-medium text-gray-700 mb-1'
                            },
                            children: 'Aggregation:'
                          },
                          {
                            id: 'example-2-code',
                            type: 'code',
                            props: {
                              className: 'text-xs text-gray-600 bg-white p-2 rounded block'
                            },
                            children: 'SELECT category, AVG(value) FROM "data.csv" GROUP BY category'
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },

          // Right column - Query results and analytics
          {
            id: 'right-column',
            type: 'div',
            props: {
              className: 'xl:col-span-2 space-y-6'
            },
            children: [
              // Quick Stats Query
              {
                id: 'stats-section',
                type: 'div',
                props: {
                  className: 'bg-white rounded-lg shadow-sm border border-gray-200'
                },
                children: [
                  {
                    id: 'stats-query',
                    type: 'COMP_DUCKDB',
                    props: {
                      title: '📈 Quick Statistics',
                      sql: {
                        $exp: 'sampleQueries.basicStats'
                      },
                      autoExecute: false,
                      showStats: true,
                      maxRows: 50,
                      className: 'p-6'
                    }
                  }
                ]
              },

              // Data Exploration Query
              {
                id: 'exploration-section',
                type: 'div',
                props: {
                  className: 'bg-white rounded-lg shadow-sm border border-gray-200'
                },
                children: [
                  {
                    id: 'exploration-query',
                    type: 'COMP_DUCKDB',
                    props: {
                      title: '🔍 Data Exploration',
                      sql: {
                        $exp: 'sampleQueries.dataExploration'
                      },
                      autoExecute: false,
                      showStats: true,
                      maxRows: 100,
                      className: 'p-6'
                    }
                  }
                ]
              },

              // Advanced Analytics Query
              {
                id: 'analytics-section',
                type: 'div',
                props: {
                  className: 'bg-white rounded-lg shadow-sm border border-gray-200'
                },
                children: [
                  {
                    id: 'analytics-query',
                    type: 'COMP_DUCKDB',
                    props: {
                      title: '🎯 Advanced Analytics',
                      sql: {
                        $exp: 'sampleQueries.advancedAnalytics'
                      },
                      autoExecute: false,
                      showStats: true,
                      maxRows: 200,
                      className: 'p-6'
                    }
                  }
                ]
              }
            ]
          }
        ]
      },

      // Bottom section - Full width query interface
      {
        id: 'bottom-section',
        type: 'div',
        props: {
          className: 'mt-8'
        },
        children: [
          {
            id: 'custom-query-section',
            type: 'div',
            props: {
              className: 'bg-white rounded-lg shadow-sm border border-gray-200'
            },
            children: [
              {
                id: 'custom-query',
                type: 'COMP_DUCKDB',
                props: {
                  title: '⚡ Custom SQL Query',
                  sql: {
                    $exp: 'customQuery.sql'
                  },
                  parameters: {
                    $exp: 'customQuery.parameters'
                  },
                  autoExecute: false,
                  showStats: true,
                  maxRows: 1000,
                  className: 'p-6',
                  showTestButton: true
                }
              }
            ]
          }
        ]
      }
    ]
  },
  data: {
    // Upload handlers
    handleFileLoaded: (filename: string, size: number) => {
      console.log(`File uploaded: ${filename} (${size} bytes)`);
    },
    handleUploadError: (error: string) => {
      console.error('Upload error:', error);
    },

    // Sample queries for different sections
    sampleQueries: {
      basicStats: `-- Basic statistics about your uploaded data
SELECT
  COUNT(*) as total_records,
  COUNT(DISTINCT *) as unique_records,
  'Sample Data' as dataset_name
-- Replace 'your_file.csv' with your actual uploaded filename
-- FROM "your_file.csv"
LIMIT 1`,

      dataExploration: `-- Explore your data structure
-- DESCRIBE "your_file.csv"
--
-- Or show first few rows:
-- SELECT * FROM "your_file.csv" LIMIT 10
SELECT 'Upload a file first' as message`,

      advancedAnalytics: `-- Advanced analytics example
-- This will work after you upload a file
--
-- Example for sales data:
-- SELECT
--   DATE_TRUNC('month', order_date) as month,
--   SUM(amount) as monthly_revenue,
--   COUNT(*) as order_count,
--   AVG(amount) as avg_order_value
-- FROM "sales.csv"
-- GROUP BY month
-- ORDER BY month DESC
SELECT 'Upload your data to see advanced analytics' as instruction`
    },

    // Custom query with parameters
    customQuery: {
      sql: `-- Write your custom SQL query here
-- Example queries:

-- 1. Count all records
-- SELECT COUNT(*) FROM "your_file.csv"

-- 2. Group by analysis
-- SELECT column_name, COUNT(*)
-- FROM "your_file.csv"
-- GROUP BY column_name
-- ORDER BY COUNT(*) DESC

-- 3. Date analysis
-- SELECT DATE_TRUNC('day', date_column) as day, COUNT(*)
-- FROM "your_file.csv"
-- GROUP BY day
-- ORDER BY day

SELECT 'Write your SQL query above and execute' as instruction`,
      parameters: []
    }
  }
};