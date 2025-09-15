export const warehouseDSL = {
  "initial_discrepancy_alert_compatible": {
    "id": "discrepancy-alert-container",
    "type": "div",
    "props": {
      "className": "{{discrepancy.discrepancyAmount > 10 ? 'discrepancy-alert-container ' : 'discrepancy-alert-container border-red-200'}} border rounded-lg p-6 max-w-4xl mx-auto",
      "style": { "minHeight": "400px" }
    },
    "children": [
      {
        "id": "alert-header",
        "type": "div",
        "props": { "className": "alert-header flex items-center justify-between mb-6" },
        "children": [
          {
            "id": "alert-icon-title",
            "type": "div",
            "props": { "className": "flex items-center space-x-3" },
            "children": [
              {
                "id": "warning-icon",
                "type": "div",
                "props": { 
                  "className": "{{discrepancy.discrepancyAmount > 10 ? 'w-8 h-8 bg-red-600' : 'w-8 h-8 bg-red-500'}} rounded-full flex items-center justify-center text-white font-bold",
                  "style": { "fontSize": "16px" }
                },
                "children": ["{{discrepancy.discrepancyAmount > 10 ? '⚠' : '!'}}"]
              },
              {
                "id": "alert-title",
                "type": "h2",
                "props": { "className": "text-xl font-semibold text-red-800" },
                "children": ["{{discrepancy.discrepancyAmount > 10 ? 'CRITICAL' : ''}} Discrepancy Alert Detected"]
              }
            ]
          },
          {
            "id": "priority-badge",
            "type": "span",
            "props": { 
              "className": "{{discrepancy.discrepancyAmount > 10 ? 'bg-red-600 text-white' : discrepancy.discrepancyAmount > 5 ? 'bg-orange-500 text-white' : 'bg-yellow-500 text-black'}} px-3 py-1 rounded-full text-sm font-medium"
            },
            "children": ["{{discrepancy.discrepancyAmount > 10 ? 'HIGH PRIORITY' : discrepancy.discrepancyAmount > 5 ? 'MEDIUM PRIORITY' : 'LOW PRIORITY'}}"]
          }
        ]
      },
      {
        "id": "discrepancy-details",
        "type": "div",
        "props": { "className": "discrepancy-details bg-white rounded-lg p-4 mb-6 border" },
        "children": [
          {
            "id": "product-info",
            "type": "div",
            "props": { "className": "grid grid-cols-3 gap-4 mb-4" },
            "children": [
              {
                "id": "product-detail",
                "type": "div",
                "children": [
                  {
                    "id": "product-label",
                    "type": "span",
                    "props": { "className": "font-medium text-gray-700" },
                    "children": ["Product: "]
                  },
                  {
                    "id": "product-value",
                    "type": "span",
                    "props": { "className": "text-gray-900 font-semibold" },
                    "children": ["{{discrepancy.productId}}"]
                  }
                ]
              },
              {
                "id": "zone-detail",
                "type": "div",
                "children": [
                  {
                    "id": "zone-label",
                    "type": "span",
                    "props": { "className": "font-medium text-gray-700" },
                    "children": ["Zone: "]
                  },
                  {
                    "id": "zone-value",
                    "type": "span",
                    "props": { "className": "text-gray-900 font-semibold" },
                    "children": ["{{discrepancy.zoneId}}"]
                  }
                ]
              },
              {
                "id": "missing-units",
                "type": "div",
                "children": [
                  {
                    "id": "missing-label",
                    "type": "span",
                    "props": { "className": "font-medium text-red-700" },
                    "children": ["{{discrepancy.discrepancyAmount > 0 ? 'Missing:' : 'Excess:'}} "]
                  },
                  {
                    "id": "missing-value",
                    "type": "span",
                    "props": { 
                      "className": "{{discrepancy.discrepancyAmount > 10 ? 'text-red-900 font-bold text-lg' : 'text-red-900 font-semibold'}}"
                    },
                    "children": ["{{discrepancy.discrepancyAmount}} units"]
                  }
                ]
              }
            ]
          },
          {
            "id": "impact-assessment",
            "type": "div",
            "props": { 
              "className": "{{discrepancy.discrepancyAmount > 10 ? 'bg-red-50 border-red-200' : discrepancy.discrepancyAmount > 5 ? 'bg-orange-50 border-orange-200' : 'bg-yellow-50 border-yellow-200'}} border rounded p-3 mb-4"
            },
            "children": [
              {
                "id": "impact-title",
                "type": "h4",
                "props": { 
                  "className": "{{discrepancy.discrepancyAmount > 10 ? 'font-medium text-red-800' : discrepancy.discrepancyAmount > 5 ? 'font-medium text-orange-800' : 'font-medium text-yellow-800'}} mb-2"
                },
                "children": ["Impact Assessment"]
              },
              {
                "id": "impact-details",
                "type": "div",
                "props": { 
                  "className": "{{discrepancy.discrepancyAmount > 10 ? 'text-sm text-red-700' : discrepancy.discrepancyAmount > 5 ? 'text-sm text-orange-700' : 'text-sm text-yellow-700'}}"
                },
                "children": [
                  "{{discrepancy.discrepancyAmount > 10 ? 'CRITICAL: Immediate action required. Potential stock shortage affecting operations.' : discrepancy.discrepancyAmount > 5 ? 'MODERATE: Investigation needed within 2 hours.' : 'LOW: Standard investigation procedure.'}}"
                ]
              }
            ]
          },
          {
            "id": "stock-summary",
            "type": "div",
            "props": { "className": "bg-gray-50 rounded p-3" },
            "children": [
              {
                "id": "summary-title",
                "type": "h4",
                "props": { "className": "font-medium text-gray-800 mb-2" },
                "children": ["Stock Summary"]
              },
              {
                "id": "stock-details",
                "type": "div",
                "props": { "className": "grid grid-cols-4 gap-4 text-sm" },
                "children": [
                  {
                    "id": "expected-stock",
                    "type": "div",
                    "children": [
                      {
                        "id": "expected-label",
                        "type": "div",
                        "props": { "className": "text-gray-600" },
                        "children": ["Expected"]
                      },
                      {
                        "id": "expected-value",
                        "type": "div",
                        "props": { "className": "font-semibold text-green-700 text-lg" },
                        "children": ["{{discrepancy.expectedQuantity}}"]
                      }
                    ]
                  },
                  {
                    "id": "system-stock",
                    "type": "div",
                    "children": [
                      {
                        "id": "system-label",
                        "type": "div",
                        "props": { "className": "text-gray-600" },
                        "children": ["System Shows"]
                      },
                      {
                        "id": "system-value",
                        "type": "div",
                        "props": { "className": "font-semibold text-red-700 text-lg" },
                        "children": ["{{discrepancy.systemQuantity}}"]
                      }
                    ]
                  },
                  {
                    "id": "variance",
                    "type": "div",
                    "children": [
                      {
                        "id": "variance-label",
                        "type": "div",
                        "props": { "className": "text-gray-600" },
                        "children": ["Variance"]
                      },
                      {
                        "id": "variance-value",
                        "type": "div",
                        "props": { 
                          "className": "{{discrepancy.discrepancyAmount > 0 ? 'font-semibold text-lg text-red-700' : 'font-semibold text-lg text-blue-700'}}"
                        },
                        "children": ["{{discrepancy.discrepancyAmount > 0 ? '-' : '+'}}{{discrepancy.discrepancyAmount}}"]
                      }
                    ]
                  },
                  {
                    "id": "status-stock",
                    "type": "div",
                    "children": [
                      {
                        "id": "status-label",
                        "type": "div",
                        "props": { "className": "text-gray-600" },
                        "children": ["Status"]
                      },
                      {
                        "id": "status-value",
                        "type": "div",
                        "props": { 
                          "className": "{{discrepancy.status === 'open' ? 'font-semibold text-orange-600' : discrepancy.status === 'investigating' ? 'font-semibold text-blue-600' : 'font-semibold text-green-600'}}"
                        },
                        "children": ["{{discrepancy.status.toUpperCase()}}"]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "action-buttons",
        "type": "div",
        "props": { 
          "className": "{{discrepancy.discrepancyAmount > 10 ? 'action-buttons grid grid-cols-1 gap-3' : 'action-buttons grid grid-cols-2 gap-3'}}"
        },
        "children": [
          {
            "id": "view-transactions-btn",
            "type": "button",
            "props": {
              "className": "{{discrepancy.discrepancyAmount > 10 ? 'bg-red-600 hover:bg-red-700 ring-2 ring-red-300' : 'bg-blue-600 hover:bg-blue-700'}} text-white px-4 py-3 rounded-lg font-medium transition-colors",
              "onClick": "view_recent_transactions"
            },
            "children": ["📋 {{discrepancy.discrepancyAmount > 10 ? 'URGENT: ' : ''}}View Recent Transactions"]
          },
          {
            "id": "investigate-movement-btn",
            "type": "button",
            "props": {
              "className": "bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-colors",
              "onClick": "investigate_stock_movement"
            },
            "children": ["🔍 Investigate Stock Movement"]
          },
          {
            "id": "initiate-recount-btn",
            "type": "button",
            "props": {
              "className": "{{discrepancy.discrepancyAmount > 10 ? 'bg-orange-600 hover:bg-orange-700 ring-2 ring-orange-300' : 'bg-green-600 hover:bg-green-700'}} text-white px-4 py-3 rounded-lg font-medium transition-colors",
              "onClick": "conduct_recount"
            },
            "children": ["📊 {{discrepancy.discrepancyAmount > 10 ? 'IMMEDIATE' : ''}} Physical Recount"]
          },
          {
            "id": "escalate-btn",
            "type": "button",
            "props": {
              "className": "{{discrepancy.discrepancyAmount > 10 ? 'bg-red-700 hover:bg-red-800 ring-2 ring-red-400' : 'bg-gray-500 hover:bg-gray-600'}} text-white px-4 py-3 rounded-lg font-medium transition-colors",
              "onClick": "{{discrepancy.discrepancyAmount > 10 ? 'escalate_to_supervisor' : 'ignore_alert'}}"
            },
            "children": ["{{discrepancy.discrepancyAmount > 10 ? '🚨 Escalate to Supervisor' : '❌ Ignore Alert'}}"]
          }
        ]
      }
    ]
  },

  "transactions_table_with_binding": {
    "id": "transactions-view",
    "type": "div",
    "props": { "className": "transactions-container bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto" },
    "children": [
      {
        "id": "transactions-header",
        "type": "div",
        "props": { "className": "flex justify-between items-center mb-6" },
        "children": [
          {
            "id": "transactions-title",
            "type": "h2",
            "props": { "className": "text-xl font-semibold text-gray-800" },
            "children": ["Recent Transactions - {{productId}}, {{zoneId}}"]
          },
          {
            "id": "back-btn",
            "type": "button",
            "props": {
              "className": "bg-gray-500 text-white px-3 py-1 rounded",
              "onClick": "go_back"
            },
            "children": ["← Back"]
          }
        ]
      },
      {
        "id": "transactions-table",
        "type": "table",
        "props": { "className": "w-full border-collapse border border-gray-300" },
        "children": [
          {
            "id": "table-header",
            "type": "thead",
            "props": { "className": "bg-gray-50" },
            "children": [
              {
                "id": "header-row",
                "type": "tr",
                "children": [
                  {
                    "id": "header-type",
                    "type": "th",
                    "props": { "className": "border border-gray-300 px-4 py-2 text-left" },
                    "children": ["Type"]
                  },
                  {
                    "id": "header-id",
                    "type": "th",
                    "props": { "className": "border border-gray-300 px-4 py-2 text-left" },
                    "children": ["Task ID"]
                  },
                  {
                    "id": "header-qty",
                    "type": "th",
                    "props": { "className": "border border-gray-300 px-4 py-2 text-left" },
                    "children": ["Quantity"]
                  },
                  {
                    "id": "header-worker",
                    "type": "th",
                    "props": { "className": "border border-gray-300 px-4 py-2 text-left" },
                    "children": ["Worker"]
                  },
                  {
                    "id": "header-timestamp",
                    "type": "th",
                    "props": { "className": "border border-gray-300 px-4 py-2 text-left" },
                    "children": ["Timestamp"]
                  },
                  {
                    "id": "header-actions",
                    "type": "th",
                    "props": { "className": "border border-gray-300 px-4 py-2 text-left" },
                    "children": ["Actions"]
                  }
                ]
              }
            ]
          },
          {
            "id": "table-body",
            "type": "tbody",
            "binding": "transactions",
            "children": [
              {
                "id": "transaction-row",
                "type": "tr",
                "props": { 
                  "className": "{{status === 'error' ? 'hover:bg-gray-50 bg-red-50' : 'hover:bg-gray-50'}}"
                },
                "children": [
                  {
                    "id": "type-cell",
                    "type": "td",
                    "props": { "className": "border border-gray-300 px-4 py-2" },
                    "children": [
                      {
                        "id": "type-badge",
                        "type": "span",
                        "props": { 
                          "className": "{{type === 'putaway' ? 'bg-green-100 text-green-800' : type === 'picking' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}} px-2 py-1 rounded text-sm"
                        },
                        "children": ["{{type}} {{status === 'error' ? '⚠️' : ''}}"]
                      }
                    ]
                  },
                  {
                    "id": "task-id-cell",
                    "type": "td",
                    "props": { 
                      "className": "{{status === 'error' ? 'border border-gray-300 px-4 py-2 font-mono font-semibold' : 'border border-gray-300 px-4 py-2 font-mono'}}"
                    },
                    "children": ["{{taskId}}"]
                  },
                  {
                    "id": "quantity-cell",
                    "type": "td",
                    "props": { 
                      "className": "{{status === 'error' ? 'border border-gray-300 px-4 py-2 text-red-600 font-semibold' : 'border border-gray-300 px-4 py-2 text-green-600 font-semibold'}}"
                    },
                    "children": ["{{type === 'putaway' || type === 'return' ? '+' : '-'}}{{quantity}}{{expectedQuantity && quantity !== expectedQuantity ? ' (exp. ' + (type === 'putaway' || type === 'return' ? '+' : '-') + expectedQuantity + ')' : ''}}"]
                  },
                  {
                    "id": "worker-cell",
                    "type": "td",
                    "props": { "className": "border border-gray-300 px-4 py-2" },
                    "children": ["{{workerId}}"]
                  },
                  {
                    "id": "timestamp-cell",
                    "type": "td",
                    "props": { "className": "border border-gray-300 px-4 py-2 text-sm text-gray-600" },
                    "children": ["{{timestamp}}"]
                  },
                  {
                    "id": "actions-cell",
                    "type": "td",
                    "props": { "className": "border border-gray-300 px-4 py-2" },
                    "children": [
                      {
                        "id": "action-btn",
                        "type": "button",
                        "props": {
                          "className": "{{status === 'error' ? 'bg-red-100 text-red-700 px-2 py-1 rounded text-sm hover:bg-red-200' : 'text-blue-600 hover:underline text-sm'}}",
                          "onClick": "{{status === 'error' ? 'investigate_task' : 'view_task_details'}}"
                        },
                        "children": ["{{status === 'error' ? 'Investigate' : 'View'}}"]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "summary-stats",
        "type": "div",
        "props": { "className": "mt-6 grid grid-cols-3 gap-4" },
        "children": [
          {
            "id": "total-transactions",
            "type": "div",
            "props": { "className": "bg-blue-50 border border-blue-200 rounded-lg p-4 text-center" },
            "children": [
              {
                "id": "total-count",
                "type": "div",
                "props": { "className": "text-2xl font-bold text-blue-600" },
                "children": ["{{transactions.length}}"]
              },
              {
                "id": "total-label",
                "type": "div",
                "props": { "className": "text-sm text-blue-800" },
                "children": ["Total Transactions"]
              }
            ]
          },
          {
            "id": "error-transactions",
            "type": "div",
            "props": { "className": "bg-red-50 border border-red-200 rounded-lg p-4 text-center" },
            "children": [
              {
                "id": "error-count",
                "type": "div",
                "props": { "className": "text-2xl font-bold text-red-600" },
                "children": ["{{transactions.filter(t => t.status === 'error').length}}"]
              },
              {
                "id": "error-label",
                "type": "div",
                "props": { "className": "text-sm text-red-800" },
                "children": ["Error Transactions"]
              }
            ]
          },
          {
            "id": "success-rate",
            "type": "div",
            "props": { "className": "bg-green-50 border border-green-200 rounded-lg p-4 text-center" },
            "children": [
              {
                "id": "success-percentage",
                "type": "div",
                "props": { "className": "text-2xl font-bold text-green-600" },
                "children": ["{{Math.round((transactions.filter(t => t.status === 'complete').length / transactions.length) * 100)}}%"]
              },
              {
                "id": "success-label",
                "type": "div",
                "props": { "className": "text-sm text-green-800" },
                "children": ["Success Rate"]
              }
            ]
          }
        ]
      }
    ]
  },

  "recount_form_with_binding": {
    "id": "recount-container",
    "type": "div",
    "props": { "className": "recount-container bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto" },
    "children": [
      {
        "id": "recount-header",
        "type": "div",
        "props": { "className": "flex justify-between items-center mb-6" },
        "children": [
          {
            "id": "recount-title",
            "type": "h2",
            "props": { "className": "text-xl font-semibold text-gray-800" },
            "children": ["Physical Recount - {{productId}}, {{zoneId}}"]
          },
          {
            "id": "back-btn",
            "type": "button",
            "props": {
              "className": "bg-gray-500 text-white px-3 py-1 rounded",
              "onClick": "go_back"
            },
            "children": ["← Back"]
          }
        ]
      },
      {
        "id": "recount-instructions",
        "type": "div",
        "props": { "className": "bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6" },
        "children": [
          {
            "id": "instructions-title",
            "type": "h3",
            "props": { "className": "font-medium text-blue-800 mb-2" },
            "children": ["Recount Instructions"]
          },
          {
            "id": "instructions-list",
            "type": "ul",
            "props": { "className": "text-sm text-blue-700 space-y-1" },
            "children": [
              {
                "id": "instruction-1",
                "type": "li",
                "children": ["1. Physically count all units of {{productId}} in {{zoneId}}"]
              },
              {
                "id": "instruction-2",
                "type": "li",
                "children": ["2. Include any units that may be misplaced within the zone"]
              },
              {
                "id": "instruction-3",
                "type": "li",
                "children": ["3. Double-check damaged or returned items"]
              },
              {
                "id": "instruction-4",
                "type": "li",
                "children": ["4. Enter the exact count below"]
              }
            ]
          }
        ]
      },
      {
        "id": "recount-form",
        "type": "div",
        "props": { "className": "space-y-4" },
        "children": [
          {
            "id": "count-input-group",
            "type": "div",
            "children": [
              {
                "id": "count-label",
                "type": "label",
                "props": { "className": "block text-sm font-medium text-gray-700 mb-2" },
                "children": ["Physical Count"]
              },
              {
                "id": "count-input",
                "type": "input",
                "props": {
                  "className": "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-center",
                  "type": "number",
                  "placeholder": "Enter counted units...",
                  "min": "0",
                  "name": "physicalCount"
                }
              }
            ]
          },
          {
            "id": "variance-indicator",
            "type": "div",
            "props": { 
              "className": "{{expectedQuantity !== systemQuantity ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50 border border-gray-200'}} rounded-lg p-4"
            },
            "children": [
              {
                "id": "variance-title",
                "type": "h4",
                "props": { 
                  "className": "{{expectedQuantity !== systemQuantity ? 'font-medium text-orange-800' : 'font-medium text-gray-800'}} mb-3"
                },
                "children": ["Current Discrepancy Analysis"]
              },
              {
                "id": "variance-details",
                "type": "div",
                "props": { "className": "grid grid-cols-3 gap-4 text-sm" },
                "children": [
                  {
                    "id": "expected-info",
                    "type": "div",
                    "children": [
                      {
                        "id": "expected-label",
                        "type": "div",
                        "props": { "className": "text-gray-600 mb-1" },
                        "children": ["Expected Quantity"]
                      },
                      {
                        "id": "expected-value",
                        "type": "div",
                        "props": { "className": "text-lg font-semibold text-green-600" },
                        "children": ["{{expectedQuantity}} units"]
                      },
                      {
                        "id": "expected-calculation",
                        "type": "div",
                        "props": { "className": "text-xs text-gray-500" },
                        "children": ["({{calculation}})"]
                      }
                    ]
                  },
                  {
                    "id": "system-info",
                    "type": "div",
                    "children": [
                      {
                        "id": "system-label",
                        "type": "div",
                        "props": { "className": "text-gray-600 mb-1" },
                        "children": ["System Quantity"]
                      },
                      {
                        "id": "system-value",
                        "type": "div",
                        "props": { "className": "text-lg font-semibold text-red-600" },
                        "children": ["{{systemQuantity}} units"]
                      }
                    ]
                  },
                  {
                    "id": "difference-info",
                    "type": "div",
                    "children": [
                      {
                        "id": "difference-label",
                        "type": "div",
                        "props": { "className": "text-gray-600 mb-1" },
                        "children": ["Difference"]
                      },
                      {
                        "id": "difference-value",
                        "type": "div",
                        "props": { 
                          "className": "{{expectedQuantity !== systemQuantity ? 'text-lg font-semibold text-orange-600' : 'text-lg font-semibold text-gray-600'}}"
                        },
                        "children": ["{{expectedQuantity - systemQuantity}} units"]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "id": "recount-actions",
            "type": "div",
            "props": { "className": "flex space-x-3 pt-4" },
            "children": [
              {
                "id": "submit-count-btn",
                "type": "button",
                "props": {
                  "className": "flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors",
                  "onClick": "submit_recount"
                },
                "children": ["Submit Count"]
              },
              {
                "id": "reset-btn",
                "type": "button",
                "props": {
                  "className": "px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors",
                  "onClick": "reset_count"
                },
                "children": ["Reset"]
              }
            ]
          }
        ]
      }
    ]
  },

  "worker_profile_with_stats_binding": {
    "id": "worker-profile-container",
    "type": "div",
    "props": { "className": "worker-profile bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto" },
    "children": [
      {
        "id": "worker-header",
        "type": "div",
        "props": { "className": "flex justify-between items-center mb-6" },
        "children": [
          {
            "id": "worker-title",
            "type": "h2",
            "props": { "className": "text-xl font-semibold text-gray-800" },
            "children": ["Worker Profile - {{worker.id}} ({{worker.name}})"]
          },
          {
            "id": "performance-indicator",
            "type": "span",
            "props": {
              "className": "{{worker.errorRate < 0.5 ? 'bg-green-100 text-green-800' : worker.errorRate < 1.0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}} px-3 py-1 rounded-full text-sm font-medium"
            },
            "children": ["{{worker.errorRate < 0.5 ? 'Excellent Performance' : worker.errorRate < 1.0 ? 'Good Performance' : 'Needs Attention'}}"]
          }
        ]
      },
      {
        "id": "worker-stats",
        "type": "div",
        "props": { "className": "grid grid-cols-4 gap-4 mb-6" },
        "children": [
          {
            "id": "total-tasks",
            "type": "div",
            "props": { "className": "bg-blue-50 border border-blue-200 rounded-lg p-4 text-center" },
            "children": [
              {
                "id": "total-tasks-value",
                "type": "div",
                "props": { "className": "text-2xl font-bold text-blue-600" },
                "children": ["{{worker.totalTasks.toLocaleString()}}"]
              },
              {
                "id": "total-tasks-label",
                "type": "div",
                "props": { "className": "text-sm text-blue-800" },
                "children": ["Total Tasks"]
              }
            ]
          },
          {
            "id": "error-rate",
            "type": "div",
            "props": { 
              "className": "{{worker.errorRate < 0.5 ? 'bg-green-50 border-green-200' : worker.errorRate < 1.0 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}} border rounded-lg p-4 text-center"
            },
            "children": [
              {
                "id": "error-rate-value",
                "type": "div",
                "props": { 
                  "className": "{{worker.errorRate < 0.5 ? 'text-2xl font-bold text-green-600' : worker.errorRate < 1.0 ? 'text-2xl font-bold text-yellow-600' : 'text-2xl font-bold text-red-600'}}"
                },
                "children": ["{{worker.errorRate}}%"]
              },
              {
                "id": "error-rate-label",
                "type": "div",
                "props": { 
                  "className": "{{worker.errorRate < 0.5 ? 'text-sm text-green-800' : worker.errorRate < 1.0 ? 'text-sm text-yellow-800' : 'text-sm text-red-800'}}"
                },
                "children": ["Error Rate"]
              }
            ]
          },
          {
            "id": "recent-errors",
            "type": "div",
            "props": { "className": "bg-orange-50 border border-orange-200 rounded-lg p-4 text-center" },
            "children": [
              {
                "id": "recent-errors-value",
                "type": "div",
                "props": { "className": "text-2xl font-bold text-orange-600" },
                "children": ["{{worker.recentErrors.length}}"]
              },
              {
                "id": "recent-errors-label",
                "type": "div",
                "props": { "className": "text-sm text-orange-800" },
                "children": ["Recent Errors"]
              }
            ]
          },
          {
            "id": "performance",
            "type": "div",
            "props": { "className": "bg-purple-50 border border-purple-200 rounded-lg p-4 text-center" },
            "children": [
              {
                "id": "performance-value",
                "type": "div",
                "props": { "className": "text-2xl font-bold text-purple-600" },
                "children": ["{{worker.performanceRating}}"]
              },
              {
                "id": "performance-label",
                "type": "div",
                "props": { "className": "text-sm text-purple-800" },
                "children": ["Rating"]
              }
            ]
          }
        ]
      },
      {
        "id": "recent-errors-section",
        "type": "div",
        "props": { "className": "mb-6" },
        "children": [
          {
            "id": "errors-title",
            "type": "h3",
            "props": { "className": "font-medium text-gray-800 mb-3" },
            "children": ["Recent Errors ({{worker.recentErrors.length}} total)"]
          },
          {
            "id": "errors-list",
            "type": "div",
            "props": { "className": "space-y-2" },
            "binding": "worker.recentErrors",
            "children": [
              {
                "id": "error-item",
                "type": "div",
                "props": { 
                  "className": "{{impact === 'high' ? 'flex justify-between items-center p-3 rounded bg-red-50 border border-red-200' : impact === 'medium' ? 'flex justify-between items-center p-3 rounded bg-orange-50 border border-orange-200' : 'flex justify-between items-center p-3 rounded bg-yellow-50 border border-yellow-200'}}"
                },
                "children": [
                  {
                    "id": "error-info",
                    "type": "div",
                    "children": [
                      {
                        "id": "error-task",
                        "type": "span",
                        "props": { "className": "font-mono text-sm font-semibold" },
                        "children": ["{{taskId}}"]
                      },
                      {
                        "id": "error-type",
                        "type": "span",
                        "props": { "className": "ml-3 text-sm text-gray-600" },
                        "children": ["{{errorType}}"]
                      },
                      {
                        "id": "error-date",
                        "type": "div",
                        "props": { "className": "text-xs text-gray-500 mt-1" },
                        "children": ["{{date}}"]
                      }
                    ]
                  },
                  {
                    "id": "error-impact",
                    "type": "span",
                    "props": { 
                      "className": "{{impact === 'high' ? 'px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800' : impact === 'medium' ? 'px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800' : 'px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800'}}"
                    },
                    "children": ["{{impact.toUpperCase()}}"]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "worker-actions",
        "type": "div",
        "props": { "className": "flex space-x-3" },
        "children": [
          {
            "id": "flag-worker-btn",
            "type": "button",
            "props": {
              "className": "{{worker.errorRate > 1.0 ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'}} text-white px-4 py-2 rounded-lg transition-colors",
              "onClick": "{{worker.errorRate > 1.0 ? 'flag_worker_for_review' : 'worker_not_flaggable'}}"
            },
            "children": ["{{worker.errorRate > 1.0 ? 'Flag for Review' : 'Performance OK'}}"]
          },
          {
            "id": "training-btn",
            "type": "button",
            "props": {
              "className": "{{worker.recentErrors.length > 3 ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}} text-white px-4 py-2 rounded-lg transition-colors",
              "onClick": "schedule_training"
            },
            "children": ["{{worker.recentErrors.length > 3 ? 'Urgent Training' : 'Schedule Training'}}"]
          },
          {
            "id": "view-history-btn",
            "type": "button",
            "props": {
              "className": "bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors",
              "onClick": "view_worker_history"
            },
            "children": ["View History ({{worker.totalTasks}} tasks)"]
          }
        ]
      }
    ]
  }
};

// Enhanced dummy data to test complex expressions
export const warehouseDummyData = {
  // Initial discrepancy screen data with high priority scenario
  initial: {
    discrepancy: {
      productId: "Product Y",
      zoneId: "Zone A",
      expectedQuantity: 20,
      systemQuantity: 15,
      discrepancyAmount: 12, // High priority scenario
      status: "open",
      timestamp: "2025-09-12 14:30:15"
    },
    productId: "Product Y",
    zoneId: "Zone A"
  },

  // Initial discrepancy with low priority
  initialLowPriority: {
    discrepancy: {
      productId: "Product X",
      zoneId: "Zone B",
      expectedQuantity: 50,
      systemQuantity: 48,
      discrepancyAmount: 2, // Low priority
      status: "open",
      timestamp: "2025-09-12 14:30:15"
    },
    productId: "Product X",
    zoneId: "Zone B"
  },

  // Transactions view data with various statuses
  transactions: {
    productId: "Product Y",
    zoneId: "Zone A",
    transactions: [
      {
        taskId: "PUT001",
        type: "putaway",
        quantity: 20,
        expectedQuantity: 20,
        workerId: "W123",
        timestamp: "2025-09-10T08:00",
        status: "complete"
      },
      {
        taskId: "PICK789",
        type: "picking",
        quantity: 5,
        expectedQuantity: 10,
        workerId: "W456",
        timestamp: "2025-09-10T10:15",
        status: "error"
      },
      {
        taskId: "RET456",
        type: "return",
        quantity: 2,
        expectedQuantity: 2,
        workerId: "W789",
        timestamp: "2025-09-10T12:00",
        status: "complete"
      },
      {
        taskId: "PICK101",
        type: "picking",
        quantity: 8,
        expectedQuantity: 8,
        workerId: "W123",
        timestamp: "2025-09-10T14:00",
        status: "complete"
      }
    ]
  },

  // Recount form data
  recount: {
    productId: "Product Y",
    zoneId: "Zone A",
    expectedQuantity: 12,
    systemQuantity: 15,
    calculation: "20 - 10 + 2"
  },

  // Worker profile data with high error rate
  worker: {
    productId: "Product Y",
    zoneId: "Zone A",
    worker: {
      id: "W456",
      name: "Jane Smith",
      totalTasks: 1500,
      errorRate: 1.5, // High error rate to test conditional styling
      performanceRating: "Needs Improvement",
      recentErrorCount: 5,
      recentErrors: [
        {
          taskId: "PICK_ERROR_001",
          errorType: "Quantity Mismatch",
          impact: "low",
          date: "2025-09-05"
        },
        {
          taskId: "PICK789",
          errorType: "Quantity Mismatch",
          impact: "medium",
          date: "2025-09-10"
        },
        {
          taskId: "PICK_ERROR_003",
          errorType: "Wrong Location",
          impact: "high",
          date: "2025-09-08"
        },
        {
          taskId: "PICK_ERROR_004",
          errorType: "Barcode Scan Error",
          impact: "medium",
          date: "2025-09-07"
        }
      ]
    }
  },

  // Worker profile with good performance
  workerGood: {
    productId: "Product Y",
    zoneId: "Zone A",
    worker: {
      id: "W123",
      name: "John Doe",
      totalTasks: 2000,
      errorRate: 0.2, // Low error rate
      performanceRating: "Excellent",
      recentErrorCount: 1,
      recentErrors: [
        {
          taskId: "PICK_ERROR_005",
          errorType: "Minor Delay",
          impact: "low",
          date: "2025-09-01"
        }
      ]
    }
  }
};