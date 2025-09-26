import { UIComponent } from "@/types/dsl";

export const supplier_risks_dsl: UIComponent = {
  id: 'supplier-risks-dashboard',
  name: 'Supplier Risk Analysis Dashboard',
  render: {
    id: 'risk-dashboard-container',
    type: 'div',
    props: {
      className: 'min-h-screen bg-gray-50 p-6'
    },
    children: [
      // Header
      {
        id: 'risk-header',
        type: 'div',
        props: {
          className: 'mb-8'
        },
        children: [
          {
            id: 'risk-title',
            type: 'h1',
            props: {
              className: 'text-3xl font-bold text-gray-900 mb-2'
            },
            children: '⚠️ Supplier Risk Analysis'
          },
          {
            id: 'risk-subtitle',
            type: 'p',
            props: {
              className: 'text-gray-600'
            },
            children: 'Monitor and analyze supplier risks across your supply chain'
          },
          {
            id: 'risk-instructions',
            type: 'div',
            props: {
              className: 'mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg'
            },
            children: [
              {
                id: 'instructions-text',
                type: 'p',
                props: {
                  className: 'text-blue-800 text-sm'
                },
                children: '💡 Instructions: 1) Upload your supply_chain.duckdb file below, 2) After upload, manually execute the queries using the "Execute Query" buttons'
              }
            ]
          }
        ]
      },

      // DuckDB File Upload Section
      {
        id: 'duckdb-upload-section',
        type: 'div',
        props: {
          className: 'mb-6 bg-white rounded-lg shadow-sm border border-gray-200'
        },
        children: [
          {
            id: 'duckdb-file-upload',
            type: 'COMP_DUCKDB_UPLOAD',
            props: {
              className: 'p-4'
            }
          }
        ]
      },


      // Supplier Risk Assessment Table
      {
        id: 'supplier-risk-section',
        type: 'div',
        props: {
          className: 'bg-white rounded-lg shadow-sm border border-gray-200'
        },
        children: [
          {
            id: 'supplier-risk-title',
            type: 'h3',
            props: {
              className: 'text-lg font-semibold text-gray-900 mb-4 px-6 pt-6'
            },
            children: '📊 Supplier Risk Assessment'
          },
          {
            id: 'supplier-risk-query',
            type: 'COMP_DUCKDB_INTERFACE',
            props: {
              autoInit: true,
              showSampleData: false,
              initialQuery: `SELECT
  ss.supplier_id,
  ss.supplier_name,
  ss.performance_rating,
  ROUND(ss.avg_on_time_rate, 3) as avg_on_time_rate,
  ROUND(ss.avg_defect_rate, 4) as avg_defect_rate,
  ROUND(ss.avg_price_variance, 3) as avg_price_variance,
  ss.products_supplied,
  ss.avg_lead_time_variance,
  CASE
    WHEN ss.performance_rating = 'Excellent' THEN 'Low Risk'
    WHEN ss.performance_rating = 'Good' THEN 'Medium Risk'
    WHEN ss.performance_rating = 'Fair' THEN 'High Risk'
    ELSE 'Critical Risk'
  END as risk_level
FROM ddb.supplier_summary ss
ORDER BY
  CASE ss.performance_rating
    WHEN 'Poor' THEN 1
    WHEN 'Fair' THEN 2
    WHEN 'Good' THEN 3
    WHEN 'Excellent' THEN 4
  END,
  ss.avg_on_time_rate DESC;`,
              maxRows: 50,
              className: 'p-6'
            }
          }
        ]
      }
    ]
  }
};