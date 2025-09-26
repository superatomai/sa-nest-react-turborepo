export const performance_optimized_dsl = {
  id: 'optimized-dashboard',
  name: 'Performance-Optimized Dashboard',
  data: {
    currentUser: { name: 'John Doe', role: 'Admin' },
    dashboardStats: { users: 1250, projects: 42, revenue: 98500 },
    // Simplified data structures for better performance
    gridData: {
      columnDefs: [
        { headerName: 'Name', field: 'name', sortable: true },
        { headerName: 'Department', field: 'department', sortable: true },
        { headerName: 'Salary', field: 'salary', sortable: true }
      ],
      rowData: [
        { name: 'John Smith', department: 'Engineering', salary: 75000 },
        { name: 'Sarah Johnson', department: 'Marketing', salary: 65000 },
        { name: 'Mike Davis', department: 'Sales', salary: 70000 }
      ]
    },
    chartData: {
      salesChart: {
        title: { text: 'Sales Report' },
        xAxis: { data: ['Q1', 'Q2', 'Q3', 'Q4'] },
        yAxis: { type: 'value' },
        series: [{
          name: 'Revenue',
          type: 'bar',
          data: [65000, 70000, 75000, 80000]
        }]
      }
    },
    mapData: {
      center: [40.7128, -74.0060],
      zoom: 12,
      markers: [
        { position: [40.7589, -73.9851], popup: 'Main Office' },
        { position: [40.7505, -73.9934], popup: 'Branch Office' }
      ]
    }
  },
  render: {
    id: 'app-container',
    type: 'div',
    props: {
      className: 'min-h-screen bg-gray-50'
    },
    children: [
      // Simplified Header
      {
        id: 'header',
        type: 'header',
        props: {
          className: 'bg-white shadow-sm border-b p-6'
        },
        children: [
          {
            id: 'title',
            type: 'h1',
            props: {
              className: 'text-2xl font-bold text-gray-900'
            },
            children: 'Performance Dashboard'
          }
        ]
      },

      // Main Content with Reduced Nesting
      {
        id: 'main-content',
        type: 'main',
        props: {
          className: 'p-6'
        },
        children: [
          // Stats Row (Simplified)
          {
            id: 'stats-row',
            type: 'div',
            props: {
              className: 'grid grid-cols-3 gap-4 mb-6'
            },
            children: [
              {
                id: 'stat-users',
                type: 'div',
                props: {
                  className: 'bg-white p-4 rounded-lg shadow-sm'
                },
                children: [
                  {
                    id: 'stat-users-value',
                    type: 'div',
                    props: {
                      className: 'text-2xl font-bold text-blue-600'
                    },
                    children: {
                      $exp: 'dashboardStats.users.toLocaleString()'
                    }
                  },
                  {
                    id: 'stat-users-label',
                    type: 'div',
                    props: {
                      className: 'text-sm text-gray-600'
                    },
                    children: 'Total Users'
                  }
                ]
              },
              {
                id: 'stat-projects',
                type: 'div',
                props: {
                  className: 'bg-white p-4 rounded-lg shadow-sm'
                },
                children: [
                  {
                    id: 'stat-projects-value',
                    type: 'div',
                    props: {
                      className: 'text-2xl font-bold text-green-600'
                    },
                    children: {
                      $exp: 'dashboardStats.projects'
                    }
                  },
                  {
                    id: 'stat-projects-label',
                    type: 'div',
                    props: {
                      className: 'text-sm text-gray-600'
                    },
                    children: 'Projects'
                  }
                ]
              },
              {
                id: 'stat-revenue',
                type: 'div',
                props: {
                  className: 'bg-white p-4 rounded-lg shadow-sm'
                },
                children: [
                  {
                    id: 'stat-revenue-value',
                    type: 'div',
                    props: {
                      className: 'text-2xl font-bold text-purple-600'
                    },
                    children: {
                      $exp: `'$' + dashboardStats.revenue.toLocaleString()`
                    }
                  },
                  {
                    id: 'stat-revenue-label',
                    type: 'div',
                    props: {
                      className: 'text-sm text-gray-600'
                    },
                    children: 'Revenue'
                  }
                ]
              }
            ]
          },

          // Native Components Row (Reduced complexity)
          {
            id: 'components-row',
            type: 'div',
            props: {
              className: 'grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'
            },
            children: [
              // AG Grid (Simplified)
              {
                id: 'grid-card',
                type: 'div',
                props: {
                  className: 'bg-white rounded-lg shadow-sm'
                },
                children: [
                  {
                    id: 'grid-header',
                    type: 'div',
                    props: {
                      className: 'p-4 border-b'
                    },
                    children: [
                      {
                        id: 'grid-title',
                        type: 'h3',
                        props: {
                          className: 'font-semibold'
                        },
                        children: 'Employee Data'
                      }
                    ]
                  },
                  {
                    id: 'grid-component',
                    type: 'COMP_AGGRID',
                    props: {
                      style: { height: '250px', width: '100%' },
                      columnDefs: {
                        $exp: 'gridData.columnDefs'
                      },
                      rowData: {
                        $exp: 'gridData.rowData'
                      }
                    }
                  }
                ]
              },

              // Chart (Simplified)
              {
                id: 'chart-card',
                type: 'div',
                props: {
                  className: 'bg-white rounded-lg shadow-sm'
                },
                children: [
                  {
                    id: 'chart-header',
                    type: 'div',
                    props: {
                      className: 'p-4 border-b'
                    },
                    children: [
                      {
                        id: 'chart-title',
                        type: 'h3',
                        props: {
                          className: 'font-semibold'
                        },
                        children: 'Sales Chart'
                      }
                    ]
                  },
                  {
                    id: 'chart-component',
                    type: 'COMP_ECHART',
                    props: {
                      style: { height: '250px', width: '100%' },
                      option: {
                        $exp: 'chartData.salesChart'
                      }
                    }
                  }
                ]
              }
            ]
          },

          // Map Component (Simplified)
          {
            id: 'map-card',
            type: 'div',
            props: {
              className: 'bg-white rounded-lg shadow-sm mb-6'
            },
            children: [
              {
                id: 'map-header',
                type: 'div',
                props: {
                  className: 'p-4 border-b'
                },
                children: [
                  {
                    id: 'map-title',
                    type: 'h3',
                    props: {
                      className: 'font-semibold'
                    },
                    children: 'Office Locations'
                  }
                ]
              },
              {
                id: 'map-component',
                type: 'COMP_LEAFLET',
                props: {
                  style: { height: '300px', width: '100%' },
                  center: {
                    $exp: 'mapData.center'
                  },
                  zoom: {
                    $exp: 'mapData.zoom'
                  },
                  markers: {
                    $exp: 'mapData.markers'
                  }
                }
              }
            ]
          },

          // Simple Info Footer
          {
            id: 'info-footer',
            type: 'div',
            props: {
              className: 'bg-blue-50 rounded-lg p-4 text-center'
            },
            children: [
              {
                id: 'info-text',
                type: 'p',
                props: {
                  className: 'text-sm text-blue-700'
                },
                children: 'Optimized for fast selection and interaction'
              }
            ]
          }
        ]
      }
    ]
  }
}

export const PERFORMANCE_OPTIMIZED_DSL = performance_optimized_dsl