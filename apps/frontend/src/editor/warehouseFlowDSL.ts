export const warehouseFlowDSL = {
  "warehouse_discrepancy_investigation_flow": {
    "id": "warehouse-flow-container",
    "type": "div",
    "props": {
      "className": "ds-page-bg"
    },
    "children": [
      {
        "id": "flow-header",
        "type": "div",
        "props": {
          "className": "ds-container ds-section-spacing"
        },
        "children": [
        ]
      },
      
      // Main Flow Container - Shows different views based on currentStep
      {
        "id": "main-flow-content",
        "type": "div",
        "props": {
          "className": "ds-container"
        },
        "children": [
          
          // Step 1: Initial Discrepancy Alert
          {
            "id": "step-1-alert",
            "type": "div",
            "props": {
              "className": "{{currentFlow.step === 'alert' ? 'block' : 'hidden'}}"
            },
            "children": [
              {
                "id": "discrepancy-card",
                "type": "div",
                "props": {
                  "className": "{{discrepancy.severity === 'high' ? 'ds-card ds-card-error' : 'ds-card'}} ds-item-spacing"
                },
                "children": [
                  {
                    "id": "alert-header",
                    "type": "div",
                    "props": {
                      "className": "flex items-center justify-between mb-6"
                    },
                    "children": [
                      {
                        "id": "alert-icon-title",
                        "type": "div",
                        "props": {
                          "className": "flex items-center gap-3"
                        },
                        "children": [
                          {
                            "id": "warning-icon",
                            "type": "div",
                            "props": {
                              "className": "{{discrepancy.severity === 'high' ? 'ds-icon-lg bg-red-600' : 'ds-icon-lg'}} rounded-full flex items-center justify-center text-white ds-font-semibold ds-text-xl"
                            },
                            "children": ["⚠"]
                          },
                          {
                            "id": "alert-title",
                            "type": "h2",
                            "props": {
                              "className": "{{discrepancy.severity === 'high' ? 'ds-h2 ds-text-error' : 'ds-h2'}}"
                            },
                            "children": ["{{discrepancy.severity === 'high' ? 'CRITICAL ' : ''}}Discrepancy Alert Detected"]
                          }
                        ]
                      },
                      {
                        "id": "severity-badge",
                        "type": "span",
                        "props": {
                          "className": "{{discrepancy.severity === 'high' ? 'ds-badge ds-badge-error' : 'ds-badge ds-badge-info'}}"
                        },
                        "children": ["{{discrepancy.severity === 'high' ? 'HIGH PRIORITY' : discrepancy.severity === 'medium' ? 'MEDIUM PRIORITY' : 'LOW PRIORITY'}}"]
                      }
                    ]
                  },
                  {
                    "id": "alert-message",
                    "type": "div",
                    "props": {
                      "className": "{{discrepancy.severity === 'high' ? 'text-gray-800 text-base' : 'text-gray-800 text-base'}} mb-6"
                    },
                    "children": ["INVENTORY MISMATCH: {{discrepancy.productName}} in {{discrepancy.zoneId}} — Physical count shows {{discrepancy.expectedQuantity}} units but system shows {{discrepancy.systemQuantity}} units ({{discrepancy.discrepancyAmount}} units missing from physical inventory)"]
                  },
                  {
                    "id": "discrepancy-details-grid",
                    "type": "div",
                    "props": {
                      "className": "grid grid-cols-5 gap-4 mb-6"
                    },
                    "children": [
                      {
                        "id": "product-detail",
                        "type": "div",
                        "props": {
                          "className": "text-center"
                        },
                        "children": [
                          {
                            "id": "product-label",
                            "type": "div",
                            "props": {
                              "className": "text-sm text-gray-600 mb-1"
                            },
                            "children": ["Product"]
                          },
                          {
                            "id": "product-value",
                            "type": "div",
                            "props": {
                              "className": "ds-font-semibold ds-text-primary ds-text-sm"
                            },
                            "children": ["{{discrepancy.productName}}"]
                          },
                          {
                            "id": "product-sku",
                            "type": "div",
                            "props": {
                              "className": "text-xs text-gray-500 mt-1"
                            },
                            "children": ["SKU: {{discrepancy.productId}}"]
                          }
                        ]
                      },
                      {
                        "id": "zone-detail",
                        "type": "div",
                        "props": {
                          "className": "text-center"
                        },
                        "children": [
                          {
                            "id": "zone-label",
                            "type": "div",
                            "props": {
                              "className": "text-sm text-gray-600 mb-1"
                            },
                            "children": ["Location"]
                          },
                          {
                            "id": "zone-value",
                            "type": "div",
                            "props": {
                              "className": "ds-font-semibold ds-text-primary"
                            },
                            "children": ["{{discrepancy.zoneId}}"]
                          }
                        ]
                      },
                      {
                        "id": "physical-detail",
                        "type": "div",
                        "props": {
                          "className": "text-center"
                        },
                        "children": [
                          {
                            "id": "physical-label",
                            "type": "div",
                            "props": {
                              "className": "text-sm text-gray-600 mb-1"
                            },
                            "children": ["Physical Count"]
                          },
                          {
                            "id": "physical-value",
                            "type": "div",
                            "props": {
                              "className": "ds-font-semibold ds-text-error ds-text-xl"
                            },
                            "children": ["{{discrepancy.expectedQuantity}}"]
                          }
                        ]
                      },
                      {
                        "id": "system-detail",
                        "type": "div",
                        "props": {
                          "className": "text-center"
                        },
                        "children": [
                          {
                            "id": "system-label",
                            "type": "div",
                            "props": {
                              "className": "text-sm text-gray-600 mb-1"
                            },
                            "children": ["System Count"]
                          },
                          {
                            "id": "system-value",
                            "type": "div",
                            "props": {
                              "className": "ds-font-semibold ds-text-success ds-text-xl"
                            },
                            "children": ["{{discrepancy.systemQuantity}}"]
                          }
                        ]
                      },
                      {
                        "id": "value-detail",
                        "type": "div",
                        "props": {
                          "className": "text-center"
                        },
                        "children": [
                          {
                            "id": "value-label",
                            "type": "div",
                            "props": {
                              "className": "text-sm text-gray-600 mb-1"
                            },
                            "children": ["Missing Value"]
                          },
                          {
                            "id": "value-amount",
                            "type": "div",
                            "props": {
                              "className": "ds-font-bold ds-text-error ds-text-lg"
                            },
                            "children": ["${{discrepancy.totalValue}}"]
                          },
                          {
                            "id": "unit-price",
                            "type": "div",
                            "props": {
                              "className": "text-xs text-gray-500 mt-1"
                            },
                            "children": ["({{discrepancy.discrepancyAmount}} × ${{discrepancy.unitValue}})"]
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              
              // Action Buttons for Step 1
              {
                "id": "step-1-actions",
                "type": "div",
                "props": {
                  "className": "grid grid-cols-2 gap-4 mb-6"
                },
                "children": [
                  {
                    "id": "view-transactions-btn",
                    "type": "button",
                    "props": {
                      "className": "ds-btn ds-btn-primary text-left",
                      "onClick": "navigate_to_transactions"
                    },
                    "children": [
                      {
                        "id": "transactions-btn-content",
                        "type": "div",
                        "children": [
                          {
                            "id": "transactions-btn-title",
                            "type": "div",
                            "props": {
                              "className": "ds-font-semibold ds-text-lg mb-1"
                            },
                            "children": ["📋 View Recent Transactions"]
                          },
                          {
                            "id": "transactions-btn-desc",
                            "type": "div",
                            "props": {
                              "className": "text-sm opacity-90"
                            },
                            "children": ["Analyze recent putaway, picking, and return operations"]
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "id": "ignore-alert-btn",
                    "type": "button",
                    "props": {
                      "className": "{{discrepancy.severity === 'high' ? 'ds-btn ds-btn-error' : 'ds-btn ds-btn-secondary'}} text-left",
                      "onClick": "{{discrepancy.severity === 'high' ? 'escalate_to_supervisor' : 'ignore_alert'}}"
                    },
                    "children": [
                      {
                        "id": "ignore-btn-content",
                        "type": "div",
                        "children": [
                          {
                            "id": "ignore-btn-title",
                            "type": "div",
                            "props": {
                              "className": "ds-font-semibold ds-text-lg mb-1"
                            },
                            "children": ["{{discrepancy.severity === 'high' ? '🚨 Escalate to Supervisor' : '❌ Ignore Alert'}}"]
                          },
                          {
                            "id": "ignore-btn-desc",
                            "type": "div",
                            "props": {
                              "className": "text-sm opacity-90"
                            },
                            "children": ["{{discrepancy.severity === 'high' ? 'Immediately notify supervisor for review' : 'Mark alert as reviewed but not actionable'}}"]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          
          // Step 2: Transactions Investigation
          {
            "id": "step-2-transactions",
            "type": "div",
            "props": {
              "className": "{{currentFlow.step === 'transactions' ? 'block' : 'hidden'}}"
            },
            "children": [
              {
                "id": "transactions-header",
                "type": "div",
                "props": {
                  "className": "flex justify-between items-center mb-6"
                },
                "children": [
                  {
                    "id": "transactions-title",
                    "type": "h2",
                    "props": {
                      "className": "ds-h3"
                    },
                    "children": ["Recent Transactions - {{discrepancy.productId}}, {{discrepancy.zoneId}}"]
                  },
                  {
                    "id": "back-to-alert-btn",
                    "type": "button",
                    "props": {
                      "className": "ds-btn ds-btn-secondary",
                      "onClick": "navigate_to_alert"
                    },
                    "children": ["← Back to Alert"]
                  }
                ]
              },
              
              // Investigation Summary
              {
                "id": "investigation-summary",
                "type": "div",
                "props": {
                  "className": "ds-card ds-card-info ds-item-spacing"
                },
                "children": [
                  {
                    "id": "summary-icon",
                    "type": "div",
                    "props": {
                      "className": "flex items-start space-x-3"
                    },
                    "children": [
                      {
                        "id": "info-icon",
                        "type": "div",
                        "props": {
                          "className": "w-5 h-5 text-blue-600 mt-0.5"
                        },
                        "children": ["ℹ️"]
                      },
                      {
                        "id": "summary-text",
                        "type": "div",
                        "children": [
                          {
                            "id": "summary-title",
                            "type": "h3",
                            "props": {
                              "className": "ds-text-sm ds-font-medium ds-text-info mb-1"
                            },
                            "children": ["Transaction Analysis"]
                          },
                          {
                            "id": "summary-description",
                            "type": "p",
                            "props": {
                              "className": "text-sm text-blue-700"
                            },
                            "children": ["Review recent transactions to identify discrepancies. Look for transactions marked with ⚠️ - these indicate scanning errors or quantity mismatches that could explain the inventory difference."]
                          }
                        ]
                      }
                    ]
                  }
                ]
              },

              // Transactions Table
              {
                "id": "transactions-table-container",
                "type": "div",
                "props": {
                  "className": "ds-card ds-item-spacing"
                },
                "children": [
                  {
                    "id": "table-scroll-container",
                    "type": "div",
                    "props": {
                      "className": "overflow-x-auto"
                    },
                    "children": [
                      {
                        "id": "transactions-table",
                        "type": "table",
                        "props": {
                          "className": "w-full min-w-max"
                        },
                    "children": [
                      {
                        "id": "transactions-table-header",
                        "type": "thead",
                        "props": {
                          "className": "bg-gray-50"
                        },
                        "children": [
                          {
                            "id": "transactions-header-row",
                            "type": "tr",
                            "children": [
                              {
                                "id": "th-type",
                                "type": "th",
                                "props": {
                                  "className": "ds-table-header"
                                },
                                "children": ["Type"]
                              },
                              {
                                "id": "th-task-id",
                                "type": "th",
                                "props": {
                                  "className": "ds-table-header"
                                },
                                "children": ["Task ID"]
                              },
                              {
                                "id": "th-quantity",
                                "type": "th",
                                "props": {
                                  "className": "ds-table-header"
                                },
                                "children": ["Quantity"]
                              },
                              {
                                "id": "th-description",
                                "type": "th",
                                "props": {
                                  "className": "ds-table-header"
                                },
                                "children": ["Description"]
                              },
                              {
                                "id": "th-worker",
                                "type": "th",
                                "props": {
                                  "className": "ds-table-header"
                                },
                                "children": ["Worker"]
                              },
                              {
                                "id": "th-timestamp",
                                "type": "th",
                                "props": {
                                  "className": "ds-table-header"
                                },
                                "children": ["Timestamp"]
                              },
                              {
                                "id": "th-status",
                                "type": "th",
                                "props": {
                                  "className": "ds-table-header"
                                },
                                "children": ["Status"]
                              }
                            ]
                          }
                        ]
                      },
                      {
                        "id": "transactions-table-body",
                        "type": "tbody",
                        "props": {
                          "className": "bg-white divide-y divide-gray-200"
                        },
                        "binding": "transactions",
                        "children": [
                          {
                            "id": "transaction-row",
                            "type": "tr",
                            "props": {
                              "className": "{{status === 'discrepancy' ? 'bg-red-50 hover:bg-red-100 border-l-4 border-red-500' : status === 'complete' ? 'hover:bg-gray-50' : 'hover:bg-gray-50'}}"
                            },
                            "children": [
                              {
                                "id": "td-type",
                                "type": "td",
                                "props": {
                                  "className": "ds-table-cell"
                                },
                                "children": [
                                  {
                                    "id": "type-badge",
                                    "type": "span",
                                    "props": {
                                      "className": "{{type === 'putaway' ? 'ds-badge ds-badge-success' : type === 'picking' ? 'ds-badge ds-badge-error' : 'ds-badge ds-badge-neutral'}}"
                                    },
                                    "children": ["{{type.charAt(0).toUpperCase() + type.slice(1)}} {{status === 'discrepancy' ? '⚠️' : status === 'complete' ? '✅' : ''}}"]
                                  }
                                ]
                              },
                              {
                                "id": "td-task-id",
                                "type": "td",
                                "props": {
                                  "className": "ds-table-cell ds-table-cell-mono {{status === 'discrepancy' ? 'ds-font-bold ds-text-error' : 'ds-text-primary'}}"
                                },
                                "children": ["{{taskId}}"]
                              },
                              {
                                "id": "td-quantity",
                                "type": "td",
                                "props": {
                                  "className": "ds-table-cell {{status === 'discrepancy' ? 'ds-font-bold ds-text-error' : 'ds-font-medium ds-text-primary'}}"
                                },
                                "children": ["{{type === 'putaway' || type === 'return' || type === 'adjustment' ? (quantity >= 0 ? '+' : '') : '-'}}{{Math.abs(quantity)}} units"]
                              },
                              {
                                "id": "td-description",
                                "type": "td",
                                "props": {
                                  "className": "ds-table-cell ds-text-secondary max-w-xs"
                                },
                                "children": ["{{description}}"]
                              },
                              {
                                "id": "td-worker",
                                "type": "td",
                                "props": {
                                  "className": "px-6 py-4 whitespace-nowrap text-sm"
                                },
                                "children": [
                                  {
                                    "id": "worker-info",
                                    "type": "div",
                                    "children": [
                                      {
                                        "id": "worker-name",
                                        "type": "div",
                                        "props": {
                                          "className": "font-medium text-gray-900"
                                        },
                                        "children": ["{{workerName}}"]
                                      },
                                      {
                                        "id": "worker-id",
                                        "type": "div",
                                        "props": {
                                          "className": "text-gray-500 text-xs"
                                        },
                                        "children": ["ID: {{workerId}}"]
                                      }
                                    ]
                                  }
                                ]
                              },
                              {
                                "id": "td-timestamp",
                                "type": "td",
                                "props": {
                                  "className": "px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                },
                                "children": ["{{timestamp}}"]
                              },
                              {
                                "id": "td-status",
                                "type": "td",
                                "props": {
                                  "className": "px-6 py-4 whitespace-nowrap text-sm"
                                },
                                "children": [
                                  {
                                    "id": "status-badge",
                                    "type": "span",
                                    "props": {
                                      "className": "{{status === 'discrepancy' ? 'ds-badge ds-badge-error' : status === 'complete' ? 'ds-badge ds-badge-success' : 'ds-badge ds-badge-neutral'}}"
                                    },
                                    "children": ["{{status === 'discrepancy' ? 'SCANNING ERROR' : status === 'complete' ? 'COMPLETED' : status.toUpperCase()}}"]
                                  }
                                ]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                      ]
                    }
                  ]
                },

              // Transaction Summary Stats
              {
                "id": "transaction-summary",
                "type": "div",
                "props": {
                  "className": "grid grid-cols-3 gap-4 mb-6"
                },
                "children": [
                  {
                    "id": "total-transactions-card",
                    "type": "div",
                    "props": {
                      "className": "ds-card ds-card-info text-center"
                    },
                    "children": [
                      {
                        "id": "total-count",
                        "type": "div",
                        "props": {
                          "className": "ds-stat-value"
                        },
                        "children": ["{{transactions.length}}"]
                      },
                      {
                        "id": "total-label",
                        "type": "div",
                        "props": {
                          "className": "ds-stat-label"
                        },
                        "children": ["Total Transactions"]
                      }
                    ]
                  },
                  {
                    "id": "error-transactions-card",
                    "type": "div",
                    "props": {
                      "className": "ds-card ds-card-error text-center"
                    },
                    "children": [
                      {
                        "id": "error-count",
                        "type": "div",
                        "props": {
                          "className": "ds-stat-value ds-text-error"
                        },
                        "children": ["{{transactions.filter(t => t.status === 'error').length}}"]
                      },
                      {
                        "id": "error-label",
                        "type": "div",
                        "props": {
                          "className": "ds-stat-label ds-text-error"
                        },
                        "children": ["Error Transactions"]
                      }
                    ]
                  },
                  {
                    "id": "success-rate-card",
                    "type": "div",
                    "props": {
                      "className": "ds-card ds-card-success text-center"
                    },
                    "children": [
                      {
                        "id": "success-percentage",
                        "type": "div",
                        "props": {
                          "className": "ds-stat-value ds-text-success"
                        },
                        "children": ["{{Math.round((transactions.filter(t => t.status === 'complete').length / transactions.length) * 100)}}%"]
                      },
                      {
                        "id": "success-label",
                        "type": "div",
                        "props": {
                          "className": "ds-stat-label ds-text-success"
                        },
                        "children": ["Success Rate"]
                      }
                    ]
                  }
                ]
              },

              // Single Investigation Button
              {
                "id": "single-investigation-action",
                "type": "div",
                "props": {
                  "className": "text-center"
                },
                "children": [
                  {
                    "id": "investigate-stock-movement-btn",
                    "type": "button",
                    "props": {
                      "className": "ds-btn ds-btn-primary ds-btn-lg inline-flex items-center gap-3",
                      "onClick": "navigate_to_stock_investigation"
                    },
                    "children": [
                      {
                        "id": "investigate-icon",
                        "type": "span",
                        "props": {
                          "className": "text-xl"
                        },
                        "children": ["🔍"]
                      },
                      {
                        "id": "investigate-text",
                        "type": "span",
                        "children": ["Investigate Stock Movement"]
                      }
                    ]
                  }
                ]
              }
            ]
          },

          // Step 3: Stock Investigation
          {
            "id": "step-3-stock-investigation",
            "type": "div",
            "props": {
              "className": "{{currentFlow.step === 'stock_investigation' ? 'block' : 'hidden'}}"
            },
            "children": [
              {
                "id": "investigation-header",
                "type": "div",
                "props": {
                  "className": "flex justify-between items-center mb-6"
                },
                "children": [
                  {
                    "id": "investigation-title",
                    "type": "h2",
                    "props": {
                      "className": "ds-h3"
                    },
                    "children": ["Stock Movement Investigation - PICK5847"]
                  },
                  {
                    "id": "back-to-transactions-from-investigation-btn",
                    "type": "button",
                    "props": {
                      "className": "ds-btn ds-btn-secondary",
                      "onClick": "navigate_to_transactions"
                    },
                    "children": ["← Back to Transactions"]
                  }
                ]
              },
              
              // Investigation Task Summary
              {
                "id": "investigation-task-summary",
                "type": "div",
                "props": {
                  "className": "ds-card ds-card-error ds-item-spacing"
                },
                "children": [
                  {
                    "id": "investigation-task-title",
                    "type": "h3",
                    "props": {
                      "className": "ds-text-lg ds-font-semibold ds-text-error mb-4"
                    },
                    "children": ["⚠️ Task PICK5847 - Scanning Error Detected"]
                  },
                  {
                    "id": "investigation-details-grid",
                    "type": "div",
                    "props": {
                      "className": "grid grid-cols-5 gap-4"
                    },
                    "children": [
                      {
                        "id": "task-expected",
                        "type": "div",
                        "props": {
                          "className": "text-center"
                        },
                        "children": [
                          {
                            "id": "task-expected-label",
                            "type": "div",
                            "props": {
                              "className": "text-sm text-gray-600 mb-1"
                            },
                            "children": ["Order Required"]
                          },
                          {
                            "id": "task-expected-value",
                            "type": "div",
                            "props": {
                              "className": "ds-metric-value ds-text-info"
                            },
                            "children": ["15 units"]
                          }
                        ]
                      },
                      {
                        "id": "task-scanned",
                        "type": "div",
                        "props": {
                          "className": "text-center"
                        },
                        "children": [
                          {
                            "id": "task-scanned-label",
                            "type": "div",
                            "props": {
                              "className": "text-sm text-gray-600 mb-1"
                            },
                            "children": ["Actually Scanned"]
                          },
                          {
                            "id": "task-scanned-value",
                            "type": "div",
                            "props": {
                              "className": "ds-metric-value ds-text-error"
                            },
                            "children": ["8 units"]
                          }
                        ]
                      },
                      {
                        "id": "task-actually-taken",
                        "type": "div",
                        "props": {
                          "className": "text-center"
                        },
                        "children": [
                          {
                            "id": "task-taken-label",
                            "type": "div",
                            "props": {
                              "className": "text-sm text-gray-600 mb-1"
                            },
                            "children": ["Actually Taken"]
                          },
                          {
                            "id": "task-taken-value",
                            "type": "div",
                            "props": {
                              "className": "ds-metric-value ds-text-warning"
                            },
                            "children": ["15 units"]
                          }
                        ]
                      },
                      {
                        "id": "task-worker",
                        "type": "div",
                        "props": {
                          "className": "text-center"
                        },
                        "children": [
                          {
                            "id": "task-worker-label",
                            "type": "div",
                            "props": {
                              "className": "text-sm text-gray-600 mb-1"
                            },
                            "children": ["Worker"]
                          },
                          {
                            "id": "task-worker-value",
                            "type": "div",
                            "props": {
                              "className": "ds-text-lg ds-font-semibold ds-text-primary"
                            },
                            "children": ["Marcus Rodriguez (W456)"]
                          }
                        ]
                      },
                      {
                        "id": "task-difference",
                        "type": "div",
                        "props": {
                          "className": "text-center"
                        },
                        "children": [
                          {
                            "id": "task-difference-label",
                            "type": "div",
                            "props": {
                              "className": "text-sm text-gray-600 mb-1"
                            },
                            "children": ["Scanning Error"]
                          },
                          {
                            "id": "task-difference-value",
                            "type": "div",
                            "props": {
                              "className": "ds-metric-value ds-text-error"
                            },
                            "children": ["7 units unscanned"]
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              
              // Investigation Options
              {
                "id": "investigation-options",
                "type": "div",
                "props": {
                  "className": "grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
                },
                "children": [
                  {
                    "id": "scan-logs-option",
                    "type": "div",
                    "props": {
                      "className": "ds-card ds-card-hover"
                    },
                    "children": [
                      {
                        "id": "scan-logs-header",
                        "type": "div",
                        "props": {
                          "className": "flex items-center mb-4"
                        },
                        "children": [
                          {
                            "id": "scan-logs-icon",
                            "type": "div",
                            "props": {
                              "className": "ds-icon-base bg-slate-100 rounded-full flex items-center justify-center mr-3"
                            },
                            "children": ["📊"]
                          },
                          {
                            "id": "scan-logs-title",
                            "type": "h3",
                            "props": {
                              "className": "ds-text-lg ds-font-semibold ds-text-primary"
                            },
                            "children": ["📱 Check Scan Logs"]
                          }
                        ]
                      },
                      {
                        "id": "scan-logs-description",
                        "type": "p",
                        "props": {
                          "className": "text-gray-600 mb-4"
                        },
                        "children": ["Review detailed scan logs for Zone B-12 to see the scanning timeline and identify the malfunction during PICK5847"]
                      },
                      {
                        "id": "scan-logs-button",
                        "type": "button",
                        "props": {
                          "className": "ds-btn ds-btn-primary ds-btn-full",
                          "onClick": "navigate_to_scan_logs"
                        },
                        "children": ["View Scan Logs"]
                      }
                    ]
                  },
                  {
                    "id": "duplicate-scan-option",
                    "type": "div",
                    "props": {
                      "className": "ds-card ds-card-hover"
                    },
                    "children": [
                      {
                        "id": "duplicate-scan-header",
                        "type": "div",
                        "props": {
                          "className": "flex items-center mb-4"
                        },
                        "children": [
                          {
                            "id": "duplicate-scan-icon",
                            "type": "div",
                            "props": {
                              "className": "ds-icon-base bg-slate-100 rounded-full flex items-center justify-center mr-3"
                            },
                            "children": ["🔍"]
                          },
                          {
                            "id": "duplicate-scan-title",
                            "type": "h3",
                            "props": {
                              "className": "ds-text-lg ds-font-semibold ds-text-primary"
                            },
                            "children": ["📋 Investigate PICK5847"]
                          }
                        ]
                      },
                      {
                        "id": "duplicate-scan-description",
                        "type": "p",
                        "props": {
                          "className": "text-gray-600 mb-4"
                        },
                        "children": ["View detailed information about PICK5847 task - worker performance, timestamps, and exact scanning error details"]
                      },
                      {
                        "id": "duplicate-scan-button",
                        "type": "button",
                        "props": {
                          "className": "ds-btn ds-btn-secondary ds-btn-full",
                          "onClick": "navigate_to_pick_task_investigation"
                        },
                        "children": ["View Task Details"]
                      }
                    ]
                  }
                ]
              }
            ]
          },

          // Step 3A: PICK Task Investigation
          {
            "id": "step-3a-pick-task",
            "type": "div",
            "props": {
              "className": "{{currentFlow.step === 'pick_task_investigation' ? 'block' : 'hidden'}}"
            },
            "children": [
              {
                "id": "pick-task-header",
                "type": "div",
                "props": {
                  "className": "flex justify-between items-center mb-6"
                },
                "children": [
                  {
                    "id": "pick-task-title",
                    "type": "h2",
                    "props": {
                      "className": "ds-h3"
                    },
                    "children": ["📋 PICK5847 Task Investigation"]
                  },
                  {
                    "id": "back-to-stock-investigation-btn",
                    "type": "button",
                    "props": {
                      "className": "ds-btn ds-btn-secondary",
                      "onClick": "navigate_to_stock_investigation"
                    },
                    "children": ["← Back to Investigation"]
                  }
                ]
              },

              // Task Details Card
              {
                "id": "pick-task-details",
                "type": "div",
                "props": {
                  "className": "ds-card ds-item-spacing"
                },
                "children": [
                  {
                    "id": "task-info-grid",
                    "type": "div",
                    "props": {
                      "className": "grid grid-cols-2 gap-6 mb-6"
                    },
                    "children": [
                      {
                        "id": "task-basic-info",
                        "type": "div",
                        "children": [
                          {
                            "id": "task-id-field",
                            "type": "div",
                            "props": {
                              "className": "mb-3"
                            },
                            "children": [
                              {
                                "id": "task-id-label",
                                "type": "label",
                                "props": {
                                  "className": "ds-text-sm ds-font-medium ds-text-secondary mb-1 block"
                                },
                                "children": ["Task ID"]
                              },
                              {
                                "id": "task-id-value",
                                "type": "div",
                                "props": {
                                  "className": "ds-text-lg ds-font-mono ds-font-bold ds-text-error"
                                },
                                "children": ["PICK5847"]
                              }
                            ]
                          },
                          {
                            "id": "task-worker-field",
                            "type": "div",
                            "props": {
                              "className": "mb-3"
                            },
                            "children": [
                              {
                                "id": "task-worker-label",
                                "type": "label",
                                "props": {
                                  "className": "ds-text-sm ds-font-medium ds-text-secondary mb-1 block"
                                },
                                "children": ["Worker"]
                              },
                              {
                                "id": "task-worker-value",
                                "type": "div",
                                "props": {
                                  "className": "ds-text-lg ds-font-semibold ds-text-primary"
                                },
                                "children": ["Marcus Rodriguez (W456)"]
                              }
                            ]
                          },
                          {
                            "id": "task-timestamp-field",
                            "type": "div",
                            "children": [
                              {
                                "id": "task-timestamp-label",
                                "type": "label",
                                "props": {
                                  "className": "ds-text-sm ds-font-medium ds-text-secondary mb-1 block"
                                },
                                "children": ["Timestamp"]
                              },
                              {
                                "id": "task-timestamp-value",
                                "type": "div",
                                "props": {
                                  "className": "text-gray-700"
                                },
                                "children": ["September 15, 2025 at 2:22 PM"]
                              }
                            ]
                          }
                        ]
                      },
                      {
                        "id": "task-quantity-info",
                        "children": [
                          {
                            "id": "required-qty-field",
                            "type": "div",
                            "props": {
                              "className": "mb-3"
                            },
                            "children": [
                              {
                                "id": "required-qty-label",
                                "type": "label",
                                "props": {
                                  "className": "ds-text-sm ds-font-medium ds-text-secondary mb-1 block"
                                },
                                "children": ["Order Required"]
                              },
                              {
                                "id": "required-qty-value",
                                "type": "div",
                                "props": {
                                  "className": "ds-stat-value ds-text-info"
                                },
                                "children": ["15 units"]
                              }
                            ]
                          },
                          {
                            "id": "scanned-qty-field",
                            "type": "div",
                            "props": {
                              "className": "mb-3"
                            },
                            "children": [
                              {
                                "id": "scanned-qty-label",
                                "type": "label",
                                "props": {
                                  "className": "ds-text-sm ds-font-medium ds-text-secondary mb-1 block"
                                },
                                "children": ["Actually Scanned"]
                              },
                              {
                                "id": "scanned-qty-value",
                                "type": "div",
                                "props": {
                                  "className": "ds-stat-value ds-text-error"
                                },
                                "children": ["8 units"]
                              }
                            ]
                          },
                          {
                            "id": "taken-qty-field",
                            "type": "div",
                            "children": [
                              {
                                "id": "taken-qty-label",
                                "type": "label",
                                "props": {
                                  "className": "ds-text-sm ds-font-medium ds-text-secondary mb-1 block"
                                },
                                "children": ["Actually Taken"]
                              },
                              {
                                "id": "taken-qty-value",
                                "type": "div",
                                "props": {
                                  "className": "ds-stat-value ds-text-warning"
                                },
                                "children": ["15 units"]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  },

                  // Error Analysis
                  {
                    "id": "error-analysis",
                    "type": "div",
                    "props": {
                      "className": "bg-red-50 border border-red-200 rounded-lg p-4"
                    },
                    "children": [
                      {
                        "id": "error-title",
                        "type": "h3",
                        "props": {
                          "className": "text-lg font-semibold text-red-800 mb-2"
                        },
                        "children": ["⚠️ Scanning Error Analysis"]
                      },
                      {
                        "id": "error-description",
                        "type": "p",
                        "props": {
                          "className": "text-red-700 mb-3"
                        },
                        "children": ["Scanner malfunction detected: Worker took the correct quantity (15 units) but the barcode reader only recorded 8 scans. This created a 7-unit discrepancy in the system."]
                      },
                      {
                        "id": "error-impact",
                        "type": "div",
                        "props": {
                          "className": "bg-red-100 border border-red-300 rounded p-3"
                        },
                        "children": [
                          {
                            "id": "impact-title",
                            "type": "div",
                            "props": {
                              "className": "font-semibold text-red-800 mb-1"
                            },
                            "children": ["Impact:"]
                          },
                          {
                            "id": "impact-text",
                            "type": "div",
                            "props": {
                              "className": "text-red-700"
                            },
                            "children": ["System shows 7 fewer units than physically present, causing inventory inaccuracy worth $2,099.93"]
                          }
                        ]
                      }
                    ]
                  }
                ]
              },

              // Resolution Actions
              {
                "id": "pick-task-resolution",
                "type": "div",
                "props": {
                  "className": "bg-green-50 border border-green-200 rounded-lg p-6"
                },
                "children": [
                  {
                    "id": "resolution-title",
                    "type": "h3",
                    "props": {
                      "className": "text-lg font-semibold text-green-800 mb-4"
                    },
                    "children": ["✅ Issue Identified: Scanner Malfunction"]
                  },
                  {
                    "id": "resolution-description",
                    "type": "p",
                    "props": {
                      "className": "text-green-700 mb-4"
                    },
                    "children": ["Root cause confirmed: Barcode reader malfunction during PICK5847. Worker took correct quantity but scanner failed to record all items. System adjustment and scanner maintenance required."]
                  },
                  {
                    "id": "resolution-actions",
                    "type": "div",
                    "props": {
                      "className": "grid grid-cols-2 gap-4"
                    },
                    "children": [
                      {
                        "id": "generate-report-btn",
                        "type": "button",
                        "props": {
                          "className": "ds-btn ds-btn-primary ds-btn-lg",
                          "onClick": "generate_pick_task_report"
                        },
                        "children": ["📄 Generate PICK Task Report"]
                      },
                      {
                        "id": "update-system-inventory-btn",
                        "type": "button",
                        "props": {
                          "className": "ds-btn ds-btn-secondary ds-btn-lg",
                          "onClick": "update_system_inventory"
                        },
                        "children": ["🔧 Update System Inventory"]
                      }
                    ]
                  }
                ]
              }
            ]
          },

          // Step 3B: Scan Logs View
          {
            "id": "step-3a-scan-logs",
            "type": "div",
            "props": {
              "className": "{{currentFlow.step === 'scan_logs' ? 'block' : 'hidden'}}"
            },
            "children": [
              {
                "id": "scan-logs-header",
                "type": "div",
                "props": {
                  "className": "flex justify-between items-center mb-6"
                },
                "children": [
                  {
                    "id": "scan-logs-title",
                    "type": "h2",
                    "props": {
                      "className": "ds-h3"
                    },
                    "children": ["📱 Scan Logs - Zone B-12 (PICK5847 Timeline)"]
                  },
                  {
                    "id": "back-to-investigation-btn",
                    "type": "button",
                    "props": {
                      "className": "ds-btn ds-btn-secondary",
                      "onClick": "navigate_to_stock_investigation"
                    },
                    "children": ["← Back to Investigation"]
                  }
                ]
              },
              
              // Scan Logs Timeline
              {
                "id": "scan-logs-timeline",
                "type": "div",
                "props": {
                  "className": "ds-card ds-item-spacing"
                },
                "children": [
                  {
                    "id": "scan-logs-timeline-title",
                    "type": "h3",
                    "props": {
                      "className": "text-lg font-semibold text-gray-900 mb-4"
                    },
                    "children": ["Scan Activity Timeline"]
                  },
                  {
                    "id": "scan-logs-list",
                    "type": "div",
                    "props": {
                      "className": "space-y-4"
                    },
                    "binding": "scanLogs",
                    "children": [
                      {
                        "id": "scan-log-item",
                        "type": "div",
                        "props": {
                          "className": "{{isAnomaly ? 'flex items-center p-4 bg-red-50 border border-red-200 rounded-lg' : 'flex items-center p-4 bg-gray-50 border border-gray-200 rounded-lg'}}"
                        },
                        "children": [
                          {
                            "id": "scan-timestamp",
                            "type": "div",
                            "props": {
                              "className": "{{isAnomaly ? 'w-24 text-sm font-mono text-red-600' : 'w-24 text-sm font-mono text-gray-600'}}"
                            },
                            "children": ["{{timestamp}}"]
                          },
                          {
                            "id": "scan-details",
                            "type": "div",
                            "props": {
                              "className": "flex-1 ml-4"
                            },
                            "children": [
                              {
                                "id": "scan-action",
                                "type": "div",
                                "props": {
                                  "className": "{{isAnomaly ? 'font-semibold text-red-800' : 'font-semibold text-gray-900'}}"
                                },
                                "children": ["{{action}} - {{quantity}} units {{isAnomaly ? '(ANOMALY DETECTED)' : ''}}"]
                              },
                              {
                                "id": "scan-task-ref",
                                "type": "div",
                                "props": {
                                  "className": "text-sm text-gray-600"
                                },
                                "children": ["Task: {{taskId}} | Worker: {{workerId}} | Scanner: {{scannerId}}"]
                              }
                            ]
                          },
                          {
                            "id": "scan-status",
                            "type": "span",
                            "props": {
                              "className": "{{isAnomaly ? 'px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium' : status === 'verified' ? 'px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium' : 'px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium'}}"
                            },
                            "children": ["{{isAnomaly ? 'ANOMALY' : status.toUpperCase()}}"]
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              
              // Scan Analysis Summary
              {
                "id": "scan-analysis-summary",
                "type": "div",
                "props": {
                  "className": "grid grid-cols-3 gap-4 mb-6"
                },
                "children": [
                  {
                    "id": "total-scans-card",
                    "type": "div",
                    "props": {
                      "className": "ds-card ds-card-info text-center"
                    },
                    "children": [
                      {
                        "id": "total-scans-value",
                        "type": "div",
                        "props": {
                          "className": "ds-stat-value"
                        },
                        "children": ["{{scanLogs.length}}"]
                      },
                      {
                        "id": "total-scans-label",
                        "type": "div",
                        "props": {
                          "className": "ds-stat-label"
                        },
                        "children": ["Total Scans"]
                      }
                    ]
                  },
                  {
                    "id": "anomaly-scans-card",
                    "type": "div",
                    "props": {
                      "className": "ds-card ds-card-error text-center"
                    },
                    "children": [
                      {
                        "id": "anomaly-scans-value",
                        "type": "div",
                        "props": {
                          "className": "ds-stat-value ds-text-error"
                        },
                        "children": ["{{scanLogs.filter(log => log.isAnomaly).length}}"]
                      },
                      {
                        "id": "anomaly-scans-label",
                        "type": "div",
                        "props": {
                          "className": "ds-stat-label ds-text-error"
                        },
                        "children": ["Anomalies Found"]
                      }
                    ]
                  },
                  {
                    "id": "verified-scans-card",
                    "type": "div",
                    "props": {
                      "className": "ds-card ds-card-success text-center"
                    },
                    "children": [
                      {
                        "id": "verified-scans-value",
                        "type": "div",
                        "props": {
                          "className": "ds-stat-value ds-text-success"
                        },
                        "children": ["{{scanLogs.filter(log => log.status === 'verified').length}}"]
                      },
                      {
                        "id": "verified-scans-label",
                        "type": "div",
                        "props": {
                          "className": "ds-stat-label ds-text-success"
                        },
                        "children": ["Verified Scans"]
                      }
                    ]
                  }
                ]
              },

              // Scan Logs Conclusion
              {
                "id": "scan-logs-conclusion",
                "type": "div",
                "props": {
                  "className": "bg-green-50 border border-green-200 rounded-lg p-6"
                },
                "children": [
                  {
                    "id": "scan-conclusion-title",
                    "type": "h3",
                    "props": {
                      "className": "text-lg font-semibold text-green-800 mb-4"
                    },
                    "children": ["✅ Scan Timeline Analysis Complete"]
                  },
                  {
                    "id": "scan-conclusion-description",
                    "type": "p",
                    "props": {
                      "className": "text-green-700 mb-4"
                    },
                    "children": ["Scan logs confirm: PICK5847 shows scanner malfunction at 14:22. Only 8 units scanned despite 15 units being taken. Clear evidence of barcode reader failure during corporate order processing."]
                  },
                  {
                    "id": "scan-resolution-actions",
                    "type": "div",
                    "props": {
                      "className": "grid grid-cols-2 gap-4"
                    },
                    "children": [
                      {
                        "id": "generate-scan-report-btn",
                        "type": "button",
                        "props": {
                          "className": "ds-btn ds-btn-primary ds-btn-lg",
                          "onClick": "generate_scan_logs_report"
                        },
                        "children": ["📄 Generate Scan Report"]
                      },
                      {
                        "id": "schedule-scanner-maintenance-btn",
                        "type": "button",
                        "props": {
                          "className": "ds-btn ds-btn-secondary ds-btn-lg",
                          "onClick": "schedule_scanner_maintenance"
                        },
                        "children": ["🔧 Schedule Scanner Maintenance"]
                      }
                    ]
                  }
                ]
              }
            ]
          },


          // Step 3C: Camera Footage Review
          {
            "id": "step-3c-camera-footage",
            "type": "div",
            "props": {
              "className": "{{currentFlow.step === 'camera_footage' ? 'block' : 'hidden'}}"
            },
            "children": [
              {
                "id": "camera-footage-header",
                "type": "div",
                "props": {
                  "className": "flex justify-between items-center mb-6"
                },
                "children": [
                  {
                    "id": "camera-footage-title",
                    "type": "h2",
                    "props": {
                      "className": "ds-h3"
                    },
                    "children": ["Camera Footage Review - {{discrepancy.zoneId}}"]
                  },
                  {
                    "id": "back-to-investigation-camera-btn",
                    "type": "button",
                    "props": {
                      "className": "ds-btn ds-btn-secondary",
                      "onClick": "navigate_to_stock_investigation"
                    },
                    "children": ["← Back to Investigation"]
                  }
                ]
              },
              
              // Camera Footage Player
              {
                "id": "camera-footage-player",
                "type": "div",
                "props": {
                  "className": "bg-black rounded-lg overflow-hidden mb-6"
                },
                "children": [
                  {
                    "id": "video-placeholder",
                    "type": "div",
                    "props": {
                      "className": "aspect-video bg-gray-900 flex items-center justify-center"
                    },
                    "children": [
                      {
                        "id": "video-content",
                        "type": "div",
                        "props": {
                          "className": "text-center text-white"
                        },
                        "children": [
                          {
                            "id": "video-icon",
                            "type": "div",
                            "props": {
                              "className": "text-6xl mb-4"
                            },
                            "children": ["📹"]
                          },
                          {
                            "id": "video-title",
                            "type": "div",
                            "props": {
                              "className": "text-xl font-semibold mb-2"
                            },
                            "children": ["Security Footage - {{cameraFootage.cameraId}}"]
                          },
                          {
                            "id": "video-details",
                            "type": "div",
                            "props": {
                              "className": "text-gray-300"
                            },
                            "children": ["{{cameraFootage.timeRange}} | Resolution: {{cameraFootage.resolution}}"]
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              
              // Footage Analysis
              {
                "id": "footage-analysis",
                "type": "div",
                "props": {
                  "className": "grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
                },
                "children": [
                  {
                    "id": "footage-timeline",
                    "type": "div",
                    "props": {
                      "className": "bg-white rounded-lg shadow border p-6"
                    },
                    "children": [
                      {
                        "id": "footage-timeline-title",
                        "type": "h3",
                        "props": {
                          "className": "text-lg font-semibold text-gray-900 mb-4"
                        },
                        "children": ["Key Events Timeline"]
                      },
                      {
                        "id": "footage-events-list",
                        "type": "div",
                        "props": {
                          "className": "space-y-3"
                        },
                        "binding": "cameraFootage.keyEvents",
                        "children": [
                          {
                            "id": "footage-event-item",
                            "type": "div",
                            "props": {
                              "className": "{{isRelevant ? 'flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg' : 'flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg'}}"
                            },
                            "children": [
                              {
                                "id": "event-timestamp",
                                "type": "div",
                                "props": {
                                  "className": "w-20 text-sm font-mono text-gray-600"
                                },
                                "children": ["{{timestamp}}"]
                              },
                              {
                                "id": "event-description",
                                "type": "div",
                                "props": {
                                  "className": "flex-1 ml-3"
                                },
                                "children": [
                                  {
                                    "id": "event-action",
                                    "type": "div",
                                    "props": {
                                      "className": "{{isRelevant ? 'font-medium text-yellow-800' : 'font-medium text-gray-900'}}"
                                    },
                                    "children": ["{{description}}"]
                                  },
                                  {
                                    "id": "event-details",
                                    "type": "div",
                                    "props": {
                                      "className": "text-sm text-gray-600"
                                    },
                                    "children": ["{{details}}"]
                                  }
                                ]
                              },
                              {
                                "id": "event-relevance",
                                "type": "span",
                                "props": {
                                  "className": "{{isRelevant ? 'px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium' : 'px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs'}}"
                                },
                                "children": ["{{isRelevant ? 'RELEVANT' : 'normal'}}"]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "id": "footage-findings",
                    "type": "div",
                    "props": {
                      "className": "bg-white rounded-lg shadow border p-6"
                    },
                    "children": [
                      {
                        "id": "footage-findings-title",
                        "type": "h3",
                        "props": {
                          "className": "text-lg font-semibold text-gray-900 mb-4"
                        },
                        "children": ["Analysis Findings"]
                      },
                      {
                        "id": "footage-findings-list",
                        "type": "ul",
                        "props": {
                          "className": "space-y-2"
                        },
                        "binding": "cameraFootage.findings",
                        "children": [
                          {
                            "id": "footage-finding-item",
                            "type": "li",
                            "props": {
                              "className": "{{severity === 'high' ? 'text-red-700' : severity === 'medium' ? 'text-orange-700' : 'text-gray-700'}}"
                            },
                            "children": ["• {{description}}"]
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              
              // Footage Actions
              {
                "id": "footage-actions",
                "type": "div",
                "props": {
                  "className": "flex space-x-4 mb-6"
                },
                "children": [
                  {
                    "id": "save-evidence-btn",
                    "type": "button",
                    "props": {
                      "className": "ds-btn ds-btn-info ds-btn-lg",
                      "onClick": "save_footage_evidence"
                    },
                    "children": ["💾 Save as Evidence"]
                  },
                  {
                    "id": "download-footage-btn",
                    "type": "button",
                    "props": {
                      "className": "ds-btn ds-btn-secondary ds-btn-lg",
                      "onClick": "download_footage"
                    },
                    "children": ["📥 Download Footage"]
                  },
                  {
                    "id": "share-with-supervisor-btn",
                    "type": "button",
                    "props": {
                      "className": "bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors",
                      "onClick": "share_with_supervisor"
                    },
                    "children": ["📤 Share with Supervisor"]
                  }
                ]
              },

              // Camera Footage Conclusion
              {
                "id": "camera-footage-conclusion",
                "type": "div",
                "props": {
                  "className": "bg-green-50 border border-green-200 rounded-lg p-6"
                },
                "children": [
                  {
                    "id": "camera-conclusion-title",
                    "type": "h3",
                    "props": {
                      "className": "text-lg font-semibold text-green-800 mb-4"
                    },
                    "children": ["✅ Camera Footage Analysis Complete"]
                  },
                  {
                    "id": "camera-conclusion-summary",
                    "type": "div",
                    "props": {
                      "className": "space-y-2 text-green-700 mb-4"
                    },
                    "children": [
                      {
                        "id": "camera-summary-line1",
                        "type": "p",
                        "children": ["🎥 Reviewed {{cameraFootage.timeRange}} security footage"]
                      },
                      {
                        "id": "camera-summary-line2",
                        "type": "p",
                        "children": ["📋 Identified {{cameraFootage.findings.length}} key findings"]
                      },
                      {
                        "id": "camera-summary-line3",
                        "type": "p",
                        "children": ["⚠️ {{cameraFootage.findings.filter(f => f.severity === 'high').length}} high-priority incidents detected"]
                      }
                    ]
                  },
                  {
                    "id": "generate-camera-report-btn",
                    "type": "button",
                    "props": {
                      "className": "ds-btn ds-btn-success ds-btn-lg",
                      "onClick": "generate_camera_footage_report"
                    },
                    "children": ["📄 Generate Camera Analysis Report"]
                  }
                ]
              }
            ]
          },
          
          // Step 4: Worker Profile Investigation (original step 3, now step 4)
          {
            "id": "step-4-worker-profile",
            "type": "div",
            "props": {
              "className": "{{currentFlow.step === 'worker_profile' ? 'block' : 'hidden'}}"
            },
            "children": [
              {
                "id": "worker-profile-header",
                "type": "div",
                "props": {
                  "className": "flex justify-between items-center mb-6"
                },
                "children": [
                  {
                    "id": "worker-profile-title",
                    "type": "h2",
                    "props": {
                      "className": "ds-h3"
                    },
                    "children": ["Worker Profile - {{currentWorker.id}} ({{currentWorker.name}})"]
                  },
                  {
                    "id": "back-to-transactions-btn",
                    "type": "button",
                    "props": {
                      "className": "ds-btn ds-btn-secondary",
                      "onClick": "navigate_to_transactions"
                    },
                    "children": ["← Back to Transactions"]
                  }
                ]
              },
              
              // Worker Stats Cards
              {
                "id": "worker-stats-grid",
                "type": "div",
                "props": {
                  "className": "grid grid-cols-4 gap-4 mb-6"
                },
                "children": [
                  {
                    "id": "worker-total-tasks",
                    "type": "div",
                    "props": {
                      "className": "ds-card ds-card-info text-center"
                    },
                    "children": [
                      {
                        "id": "worker-total-value",
                        "type": "div",
                        "props": {
                          "className": "text-2xl font-bold text-blue-600 mb-1"
                        },
                        "children": ["{{currentWorker.totalTasks}}"]
                      },
                      {
                        "id": "worker-total-label",
                        "type": "div",
                        "props": {
                          "className": "ds-stat-label"
                        },
                        "children": ["Total Tasks"]
                      }
                    ]
                  },
                  {
                    "id": "worker-error-rate",
                    "type": "div",
                    "props": {
                      "className": "{{currentWorker.errorRate < 0.5 ? 'bg-green-50 border-green-200' : currentWorker.errorRate < 1.0 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}} border rounded-lg p-4 text-center"
                    },
                    "children": [
                      {
                        "id": "worker-error-value",
                        "type": "div",
                        "props": {
                          "className": "{{currentWorker.errorRate < 0.5 ? 'text-2xl font-bold text-green-600' : currentWorker.errorRate < 1.0 ? 'text-2xl font-bold text-yellow-600' : 'text-2xl font-bold text-red-600'}} mb-1"
                        },
                        "children": ["{{currentWorker.errorRate}}%"]
                      },
                      {
                        "id": "worker-error-label",
                        "type": "div",
                        "props": {
                          "className": "{{currentWorker.errorRate < 0.5 ? 'text-sm font-medium text-green-800' : currentWorker.errorRate < 1.0 ? 'text-sm font-medium text-yellow-800' : 'text-sm font-medium text-red-800'}}"
                        },
                        "children": ["Error Rate"]
                      }
                    ]
                  },
                  {
                    "id": "worker-recent-errors",
                    "type": "div",
                    "props": {
                      "className": "bg-orange-50 border border-orange-200 rounded-lg p-4 text-center"
                    },
                    "children": [
                      {
                        "id": "worker-recent-errors-value",
                        "type": "div",
                        "props": {
                          "className": "text-2xl font-bold text-orange-600 mb-1"
                        },
                        "children": ["{{currentWorker.recentErrors ? currentWorker.recentErrors.length : 0}}"]
                      },
                      {
                        "id": "worker-recent-errors-label",
                        "type": "div",
                        "props": {
                          "className": "text-sm font-medium text-orange-800"
                        },
                        "children": ["Recent Errors"]
                      }
                    ]
                  },
                  {
                    "id": "worker-performance",
                    "type": "div",
                    "props": {
                      "className": "bg-purple-50 border border-purple-200 rounded-lg p-4 text-center"
                    },
                    "children": [
                      {
                        "id": "worker-performance-value",
                        "type": "div",
                        "props": {
                          "className": "text-lg font-bold text-purple-600 mb-1"
                        },
                        "children": ["{{currentWorker.performanceRating}}"]
                      },
                      {
                        "id": "worker-performance-label",
                        "type": "div",
                        "props": {
                          "className": "text-sm font-medium text-purple-800"
                        },
                        "children": ["Rating"]
                      }
                    ]
                  }
                ]
              },
              
              // Recent Errors List
              {
                "id": "worker-recent-errors-section",
                "type": "div",
                "props": {
                  "className": "ds-card ds-item-spacing"
                },
                "children": [
                  {
                    "id": "worker-errors-title",
                    "type": "h3",
                    "props": {
                      "className": "font-semibold text-gray-800 mb-4"
                    },
                    "children": ["Recent Errors ({{currentWorker.recentErrors ? currentWorker.recentErrors.length : 0}} total)"]
                  },
                  {
                    "id": "worker-errors-list",
                    "type": "div",
                    "props": {
                      "className": "space-y-3"
                    },
                    "binding": "currentWorker.recentErrors",
                    "children": [
                      {
                        "id": "worker-error-item",
                        "type": "div",
                        "props": {
                          "className": "{{impact === 'high' ? 'flex justify-between items-center p-3 rounded-lg bg-red-50 border border-red-200' : impact === 'medium' ? 'flex justify-between items-center p-3 rounded-lg bg-orange-50 border border-orange-200' : 'flex justify-between items-center p-3 rounded-lg bg-yellow-50 border border-yellow-200'}}"
                        },
                        "children": [
                          {
                            "id": "worker-error-info",
                            "type": "div",
                            "children": [
                              {
                                "id": "worker-error-task",
                                "type": "span",
                                "props": {
                                  "className": "font-mono text-sm font-semibold"
                                },
                                "children": ["{{taskId}}"]
                              },
                              {
                                "id": "worker-error-type",
                                "type": "span",
                                "props": {
                                  "className": "ml-3 text-sm text-gray-600"
                                },
                                "children": ["{{errorType}}"]
                              },
                              {
                                "id": "worker-error-date",
                                "type": "div",
                                "props": {
                                  "className": "text-xs text-gray-500 mt-1"
                                },
                                "children": ["{{date}}"]
                              }
                            ]
                          },
                          {
                            "id": "worker-error-impact",
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
              
              // Worker Actions
              {
                "id": "worker-actions",
                "type": "div",
                "props": {
                  "className": "flex space-x-3"
                },
                "children": [
                  {
                    "id": "flag-worker-btn",
                    "type": "button",
                    "props": {
                      "className": "{{currentWorker.errorRate > 1.0 ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'}} text-white px-4 py-2 rounded-lg font-medium transition-colors",
                      "onClick": "{{currentWorker.errorRate > 1.0 ? 'flag_worker_for_review' : 'worker_not_flaggable'}}"
                    },
                    "children": ["{{currentWorker.errorRate > 1.0 ? '🚩 Flag for Review' : '✅ Performance OK'}}"]
                  },
                  {
                    "id": "schedule-training-btn",
                    "type": "button",
                    "props": {
                      "className": "{{currentWorker.recentErrors && currentWorker.recentErrors.length > 3 ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}} text-white px-4 py-2 rounded-lg font-medium transition-colors",
                      "onClick": "schedule_training"
                    },
                    "children": ["{{currentWorker.recentErrors && currentWorker.recentErrors.length > 3 ? '⚡ Urgent Training' : '📚 Schedule Training'}}"]
                  }
                ]
              }
            ]
          },
          
          // Step 5: Physical Recount
          {
            "id": "step-5-recount",
            "type": "div",
            "props": {
              "className": "{{currentFlow.step === 'recount' ? 'block' : 'hidden'}}"
            },
            "children": [
              {
                "id": "recount-header",
                "type": "div",
                "props": {
                  "className": "flex justify-between items-center mb-6"
                },
                "children": [
                  {
                    "id": "recount-title",
                    "type": "h2",
                    "props": {
                      "className": "ds-h3"
                    },
                    "children": ["Physical Recount - {{discrepancy.productId}}, {{discrepancy.zoneId}}"]
                  },
                  {
                    "id": "back-to-alert-recount-btn",
                    "type": "button",
                    "props": {
                      "className": "ds-btn ds-btn-secondary",
                      "onClick": "navigate_to_alert"
                    },
                    "children": ["← Back to Alert"]
                  }
                ]
              },
              
              // Recount Instructions
              {
                "id": "recount-instructions",
                "type": "div",
                "props": {
                  "className": "bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6"
                },
                "children": [
                  {
                    "id": "recount-instructions-title",
                    "type": "h3",
                    "props": {
                      "className": "font-semibold text-blue-800 mb-3"
                    },
                    "children": ["Recount Instructions"]
                  },
                  {
                    "id": "recount-instructions-list",
                    "type": "ol",
                    "props": {
                      "className": "list-decimal list-inside text-blue-700 space-y-2"
                    },
                    "children": [
                      {
                        "id": "instruction-1",
                        "type": "li",
                        "children": ["Physically count all units of {{discrepancy.productId}} in {{discrepancy.zoneId}}"]
                      },
                      {
                        "id": "instruction-2",
                        "type": "li",
                        "children": ["Include any units that may be misplaced within the zone"]
                      },
                      {
                        "id": "instruction-3",
                        "type": "li",
                        "children": ["Double-check damaged or returned items"]
                      },
                      {
                        "id": "instruction-4",
                        "type": "li",
                        "children": ["Enter the exact count below"]
                      }
                    ]
                  }
                ]
              },
              
              // Expected Calculation Display
              {
                "id": "expected-calculation",
                "type": "div",
                "props": {
                  "className": "bg-green-50 border border-green-200 rounded-lg p-6 mb-6"
                },
                "children": [
                  {
                    "id": "calculation-title",
                    "type": "h3",
                    "props": {
                      "className": "font-semibold text-green-800 mb-3"
                    },
                    "children": ["Expected Quantity Calculation"]
                  },
                  {
                    "id": "calculation-formula",
                    "type": "div",
                    "props": {
                      "className": "bg-white rounded-lg p-4 border border-green-200"
                    },
                    "children": [
                      {
                        "id": "calculation-breakdown",
                        "type": "div",
                        "props": {
                          "className": "text-center space-y-2"
                        },
                        "children": [
                          {
                            "id": "calculation-line-1",
                            "type": "div",
                            "props": {
                              "className": "text-lg text-gray-700"
                            },
                            "children": ["Starting Inventory: {{recount.calculation.startingInventory}} units"]
                          },
                          {
                            "id": "calculation-line-2",
                            "type": "div",
                            "props": {
                              "className": "text-lg text-gray-700"
                            },
                            "children": ["- Picked: {{recount.calculation.totalPicked}} units"]
                          },
                          {
                            "id": "calculation-line-3",
                            "type": "div",
                            "props": {
                              "className": "text-lg text-gray-700"
                            },
                            "children": ["+ Returned: {{recount.calculation.totalReturned}} units"]
                          },
                          {
                            "id": "calculation-divider",
                            "type": "hr",
                            "props": {
                              "className": "border-green-300 my-2"
                            }
                          },
                          {
                            "id": "calculation-result",
                            "type": "div",
                            "props": {
                              "className": "text-xl font-bold text-green-700"
                            },
                            "children": ["Expected: {{recount.calculation.expectedQuantity}} units"]
                          },
                          {
                            "id": "calculation-formula-text",
                            "type": "div",
                            "props": {
                              "className": "text-sm text-gray-600 mt-2"
                            },
                            "children": ["({{recount.calculation.startingInventory}} - {{recount.calculation.totalPicked}} + {{recount.calculation.totalReturned}} = {{recount.calculation.expectedQuantity}})"]
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              
              // Recount Form
              {
                "id": "recount-form",
                "type": "div",
                "props": {
                  "className": "ds-card ds-item-spacing"
                },
                "children": [
                  {
                    "id": "recount-input-section",
                    "type": "div",
                    "props": {
                      "className": "mb-6"
                    },
                    "children": [
                      {
                        "id": "recount-label",
                        "type": "label",
                        "props": {
                          "className": "block text-lg font-medium text-gray-700 mb-3"
                        },
                        "children": ["Enter Physical Count for {{discrepancy.productId}} in {{discrepancy.zoneId}}"]
                      },
                      {
                        "id": "recount-input",
                        "type": "input",
                        "props": {
                          "className": "w-full px-6 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-2xl text-center font-bold",
                          "type": "number",
                          "placeholder": "Enter counted units...",
                          "min": "0",
                          "name": "physicalCount",
                          "id": "physicalCountInput"
                        }
                      }
                    ]
                  },
                  
                  // Current Status Summary
                  {
                    "id": "recount-summary",
                    "type": "div",
                    "props": {
                      "className": "grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg"
                    },
                    "children": [
                      {
                        "id": "recount-expected",
                        "type": "div",
                        "props": {
                          "className": "text-center"
                        },
                        "children": [
                          {
                            "id": "recount-expected-label",
                            "type": "div",
                            "props": {
                              "className": "text-sm text-gray-600 mb-1"
                            },
                            "children": ["Expected Quantity"]
                          },
                          {
                            "id": "recount-expected-value",
                            "type": "div",
                            "props": {
                              "className": "text-2xl font-bold text-green-600"
                            },
                            "children": ["{{recount.calculation.expectedQuantity}} units"]
                          }
                        ]
                      },
                      {
                        "id": "recount-system",
                        "type": "div",
                        "props": {
                          "className": "text-center"
                        },
                        "children": [
                          {
                            "id": "recount-system-label",
                            "type": "div",
                            "props": {
                              "className": "text-sm text-gray-600 mb-1"
                            },
                            "children": ["System Quantity"]
                          },
                          {
                            "id": "recount-system-value",
                            "type": "div",
                            "props": {
                              "className": "ds-metric-value ds-text-error"
                            },
                            "children": ["{{discrepancy.systemQuantity}} units"]
                          }
                        ]
                      },
                      {
                        "id": "recount-difference",
                        "type": "div",
                        "props": {
                          "className": "text-center"
                        },
                        "children": [
                          {
                            "id": "recount-difference-label",
                            "type": "div",
                            "props": {
                              "className": "text-sm text-gray-600 mb-1"
                            },
                            "children": ["System vs Expected"]
                          },
                          {
                            "id": "recount-difference-value",
                            "type": "div",
                            "props": {
                              "className": "ds-metric-value ds-text-warning"
                            },
                            "children": ["{{discrepancy.systemQuantity - recount.calculation.expectedQuantity}} units"]
                          }
                        ]
                      }
                    ]
                  },
                  
                  // Recount Actions
                  {
                    "id": "recount-actions",
                    "type": "div",
                    "props": {
                      "className": "flex space-x-3"
                    },
                    "children": [
                      {
                        "id": "submit-recount-btn",
                        "type": "button",
                        "props": {
                          "className": "flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors text-lg",
                          "onClick": "submit_recount"
                        },
                        "children": ["Submit Physical Count"]
                      },
                      {
                        "id": "reset-recount-btn",
                        "type": "button",
                        "props": {
                          "className": "px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium",
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
          
          // Step 5A: Recount Results & Analysis
          {
            "id": "step-5a-recount-results",
            "type": "div",
            "props": {
              "className": "{{currentFlow.step === 'recount_results' ? 'block' : 'hidden'}}"
            },
            "children": [
              {
                "id": "recount-results-header",
                "type": "div",
                "props": {
                  "className": "flex justify-between items-center mb-6"
                },
                "children": [
                  {
                    "id": "recount-results-title",
                    "type": "h2",
                    "props": {
                      "className": "ds-h3"
                    },
                    "children": ["Recount Results & Analysis"]
                  },
                  {
                    "id": "back-to-recount-btn",
                    "type": "button",
                    "props": {
                      "className": "ds-btn ds-btn-secondary",
                      "onClick": "navigate_to_recount"
                    },
                    "children": ["← Back to Recount"]
                  }
                ]
              },
              
              // Results Comparison
              {
                "id": "results-comparison",
                "type": "div",
                "props": {
                  "className": "{{recount.result.variance === 0 ? 'bg-green-50 border-green-200' : recount.result.variance > 0 ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200'}} border rounded-lg p-6 mb-6"
                },
                "children": [
                  {
                    "id": "results-header",
                    "type": "div",
                    "props": {
                      "className": "flex items-center mb-4"
                    },
                    "children": [
                      {
                        "id": "results-icon",
                        "type": "div",
                        "props": {
                          "className": "{{recount.result.variance === 0 ? 'w-10 h-10 bg-green-600' : recount.result.variance > 0 ? 'w-10 h-10 bg-orange-600' : 'w-10 h-10 bg-red-600'}} rounded-full flex items-center justify-center text-white text-xl mr-4"
                        },
                        "children": ["{{recount.result.variance === 0 ? '✅' : recount.result.variance > 0 ? '⚠️' : '❌'}}"]
                      },
                      {
                        "id": "results-title",
                        "type": "h3",
                        "props": {
                          "className": "{{recount.result.variance === 0 ? 'text-xl font-bold text-green-800' : recount.result.variance > 0 ? 'text-xl font-bold text-orange-800' : 'text-xl font-bold text-red-800'}}"
                        },
                        "children": ["{{recount.result.variance === 0 ? 'Count Matches Expected!' : recount.result.variance > 0 ? 'Count Higher Than Expected' : 'Count Lower Than Expected'}}"]
                      }
                    ]
                  },
                  {
                    "id": "comparison-grid",
                    "type": "div",
                    "props": {
                      "className": "grid grid-cols-4 gap-4"
                    },
                    "children": [
                      {
                        "id": "expected-count",
                        "type": "div",
                        "props": {
                          "className": "text-center"
                        },
                        "children": [
                          {
                            "id": "expected-label",
                            "type": "div",
                            "props": {
                              "className": "text-sm text-gray-600 mb-1"
                            },
                            "children": ["Expected"]
                          },
                          {
                            "id": "expected-value",
                            "type": "div",
                            "props": {
                              "className": "text-2xl font-bold text-green-600"
                            },
                            "children": ["{{recount.calculation.expectedQuantity}}"]
                          }
                        ]
                      },
                      {
                        "id": "physical-count",
                        "type": "div",
                        "props": {
                          "className": "text-center"
                        },
                        "children": [
                          {
                            "id": "physical-label",
                            "type": "div",
                            "props": {
                              "className": "text-sm text-gray-600 mb-1"
                            },
                            "children": ["Physical Count"]
                          },
                          {
                            "id": "physical-value",
                            "type": "div",
                            "props": {
                              "className": "ds-stat-value ds-text-info"
                            },
                            "children": ["{{recount.result.physicalCount}}"]
                          }
                        ]
                      },
                      {
                        "id": "variance-count",
                        "type": "div",
                        "props": {
                          "className": "text-center"
                        },
                        "children": [
                          {
                            "id": "variance-label",
                            "type": "div",
                            "props": {
                              "className": "text-sm text-gray-600 mb-1"
                            },
                            "children": ["Variance"]
                          },
                          {
                            "id": "variance-value",
                            "type": "div",
                            "props": {
                              "className": "{{recount.result.variance === 0 ? 'text-2xl font-bold text-green-600' : recount.result.variance > 0 ? 'text-2xl font-bold text-orange-600' : 'text-2xl font-bold text-red-600'}}"
                            },
                            "children": ["{{recount.result.variance > 0 ? '+' : ''}}{{recount.result.variance}}"]
                          }
                        ]
                      },
                      {
                        "id": "system-count",
                        "type": "div",
                        "props": {
                          "className": "text-center"
                        },
                        "children": [
                          {
                            "id": "system-label",
                            "type": "div",
                            "props": {
                              "className": "text-sm text-gray-600 mb-1"
                            },
                            "children": ["System Count"]
                          },
                          {
                            "id": "system-value",
                            "type": "div",
                            "props": {
                              "className": "text-2xl font-bold text-gray-600"
                            },
                            "children": ["{{discrepancy.systemQuantity}}"]
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              
              // Edge Case Analysis
              {
                "id": "edge-case-analysis",
                "type": "div",
                "props": {
                  "className": "{{recount.result.edgeCase ? 'block' : 'hidden'}}"
                },
                "children": [
                  {
                    "id": "edge-case-alert",
                    "type": "div",
                    "props": {
                      "className": "{{recount.result.edgeCase && recount.result.edgeCase.severity === 'high' ? 'bg-red-50 border-red-200' : recount.result.edgeCase && recount.result.edgeCase.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'}} border rounded-lg p-6 mb-6"
                    },
                    "children": [
                      {
                        "id": "edge-case-title",
                        "type": "h3",
                        "props": {
                          "className": "{{recount.result.edgeCase && recount.result.edgeCase.severity === 'high' ? 'font-semibold text-red-800 mb-3' : recount.result.edgeCase && recount.result.edgeCase.severity === 'medium' ? 'font-semibold text-yellow-800 mb-3' : 'font-semibold text-blue-800 mb-3'}}"
                        },
                        "children": ["⚠️ {{recount.result.edgeCase ? recount.result.edgeCase.title : 'Edge Case Analysis'}}"]
                      },
                      {
                        "id": "edge-case-description",
                        "type": "p",
                        "props": {
                          "className": "{{recount.result.edgeCase && recount.result.edgeCase.severity === 'high' ? 'text-red-700 mb-4' : recount.result.edgeCase && recount.result.edgeCase.severity === 'medium' ? 'text-yellow-700 mb-4' : 'text-blue-700 mb-4'}}"
                        },
                        "children": ["{{recount.result.edgeCase ? recount.result.edgeCase.description : ''}}"]
                      },
                      {
                        "id": "edge-case-recommendations",
                        "type": "div",
                        "children": [
                          {
                            "id": "recommendations-title",
                            "type": "h4",
                            "props": {
                              "className": "font-medium text-gray-800 mb-2"
                            },
                            "children": ["Recommended Actions:"]
                          },
                          {
                            "id": "recommendations-list",
                            "type": "ul",
                            "props": {
                              "className": "list-disc list-inside text-gray-700 space-y-1"
                            },
                            "binding": "recount.result.edgeCase ? recount.result.edgeCase.recommendations : []",
                            "children": [
                              {
                                "id": "recommendation-item",
                                "type": "li",
                                "children": ["{{text || description}}"]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              
              // Suggested Actions
              {
                "id": "suggested-actions",
                "type": "div",
                "props": {
                  "className": "ds-card ds-item-spacing"
                },
                "children": [
                  {
                    "id": "suggested-actions-title",
                    "type": "h3",
                    "props": {
                      "className": "text-lg font-semibold text-gray-900 mb-4"
                    },
                    "children": ["Suggested Actions"]
                  },
                  {
                    "id": "actions-grid",
                    "type": "div",
                    "props": {
                      "className": "grid grid-cols-1 md:grid-cols-3 gap-4"
                    },
                    "children": [
                      {
                        "id": "generate-report-action",
                        "type": "div",
                        "props": {
                          "className": "border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        },
                        "children": [
                          {
                            "id": "generate-report-icon",
                            "type": "div",
                            "props": {
                              "className": "w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-3"
                            },
                            "children": ["📋"]
                          },
                          {
                            "id": "generate-report-title",
                            "type": "h4",
                            "props": {
                              "className": "font-medium text-gray-900 mb-2"
                            },
                            "children": ["Generate Discrepancy Report"]
                          },
                          {
                            "id": "generate-report-desc",
                            "type": "p",
                            "props": {
                              "className": "text-sm text-gray-600 mb-3"
                            },
                            "children": ["Create comprehensive report with all findings and actions taken"]
                          },
                          {
                            "id": "generate-report-btn",
                            "type": "button",
                            "props": {
                              "className": "w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors",
                              "onClick": "generate_discrepancy_report"
                            },
                            "children": ["Generate Report"]
                          }
                        ]
                      },
                      {
                        "id": "supervisor-audit-action",
                        "type": "div",
                        "props": {
                          "className": "border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        },
                        "children": [
                          {
                            "id": "supervisor-audit-icon",
                            "type": "div",
                            "props": {
                              "className": "{{recount.result.variance !== 0 ? 'w-8 h-8 bg-orange-100' : 'w-8 h-8 bg-gray-100'}} rounded-full flex items-center justify-center mb-3"
                            },
                            "children": ["👨‍💼"]
                          },
                          {
                            "id": "supervisor-audit-title",
                            "type": "h4",
                            "props": {
                              "className": "font-medium text-gray-900 mb-2"
                            },
                            "children": ["Trigger Supervisor Audit"]
                          },
                          {
                            "id": "supervisor-audit-desc",
                            "type": "p",
                            "props": {
                              "className": "text-sm text-gray-600 mb-3"
                            },
                            "children": ["{{recount.result.variance !== 0 ? 'Variance detected - supervisor review recommended' : 'Optional supervisory review for quality assurance'}}"]
                          },
                          {
                            "id": "supervisor-audit-btn",
                            "type": "button",
                            "props": {
                              "className": "{{recount.result.variance !== 0 ? 'w-full bg-orange-600 hover:bg-orange-700' : 'w-full bg-gray-400 cursor-not-allowed'}} text-white px-4 py-2 rounded-lg font-medium transition-colors",
                              "onClick": "{{recount.result.variance !== 0 ? 'trigger_supervisor_audit' : 'no_audit_needed'}}"
                            },
                            "children": ["{{recount.result.variance !== 0 ? 'Request Audit' : 'No Audit Needed'}}"]
                          }
                        ]
                      },
                      {
                        "id": "adjust-stock-action",
                        "type": "div",
                        "props": {
                          "className": "border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        },
                        "children": [
                          {
                            "id": "adjust-stock-icon",
                            "type": "div",
                            "props": {
                              "className": "w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mb-3"
                            },
                            "children": ["⚖️"]
                          },
                          {
                            "id": "adjust-stock-title",
                            "type": "h4",
                            "props": {
                              "className": "font-medium text-gray-900 mb-2"
                            },
                            "children": ["Adjust System Stock"]
                          },
                          {
                            "id": "adjust-stock-desc",
                            "type": "p",
                            "props": {
                              "className": "text-sm text-gray-600 mb-3"
                            },
                            "children": ["Update system inventory to match physical count: {{recount.result.physicalCount}} units"]
                          },
                          {
                            "id": "adjust-stock-btn",
                            "type": "button",
                            "props": {
                              "className": "w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors",
                              "onClick": "adjust_system_stock"
                            },
                            "children": ["Update System"]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },

          // Step 5: Generate Discrepancy Report
          {
            "id": "step-5-generate-report",
            "type": "div",
            "props": {
              "className": "{{currentFlow.step === 'generate_report' ? 'block' : 'hidden'}}"
            },
            "children": [
              {
                "id": "generate-report-header",
                "type": "div",
                "props": {
                  "className": "flex justify-between items-center mb-6"
                },
                "children": [
                  {
                    "id": "generate-report-title",
                    "type": "h2",
                    "props": {
                      "className": "ds-h3"
                    },
                    "children": ["📄 Generate Discrepancy Report"]
                  },
                  {
                    "id": "back-to-investigation-from-report-btn",
                    "type": "button",
                    "props": {
                      "className": "ds-btn ds-btn-secondary",
                      "onClick": "navigate_to_stock_investigation"
                    },
                    "children": ["← Back to Investigation"]
                  }
                ]
              },

              // Report Summary
              {
                "id": "report-summary-card",
                "type": "div",
                "props": {
                  "className": "ds-card ds-item-spacing"
                },
                "children": [
                  {
                    "id": "report-summary-title",
                    "type": "h3",
                    "props": {
                      "className": "text-lg font-semibold text-gray-900 mb-4"
                    },
                    "children": ["Discrepancy Report Summary"]
                  },
                  {
                    "id": "report-details-grid",
                    "type": "div",
                    "props": {
                      "className": "grid grid-cols-2 gap-6"
                    },
                    "children": [
                      {
                        "id": "report-incident-info",
                        "type": "div",
                        "children": [
                          {
                            "id": "incident-title",
                            "type": "h4",
                            "props": {
                              "className": "font-semibold text-gray-800 mb-3"
                            },
                            "children": ["Incident Information"]
                          },
                          {
                            "id": "incident-details",
                            "type": "div",
                            "props": {
                              "className": "space-y-2 text-sm"
                            },
                            "children": [
                              {
                                "id": "incident-id",
                                "type": "div",
                                "children": ["Report ID: DISC-2025-09-16-001"]
                              },
                              {
                                "id": "incident-product",
                                "type": "div",
                                "children": ["Product: WH-1000XM5 Wireless Headphones"]
                              },
                              {
                                "id": "incident-zone",
                                "type": "div",
                                "children": ["Location: Zone B-12"]
                              },
                              {
                                "id": "incident-task",
                                "type": "div",
                                "children": ["Task ID: PICK5847"]
                              },
                              {
                                "id": "incident-worker",
                                "type": "div",
                                "children": ["Worker: Marcus Rodriguez (W456)"]
                              }
                            ]
                          }
                        ]
                      },
                      {
                        "id": "report-discrepancy-info",
                        "type": "div",
                        "children": [
                          {
                            "id": "discrepancy-title",
                            "type": "h4",
                            "props": {
                              "className": "font-semibold text-gray-800 mb-3"
                            },
                            "children": ["Discrepancy Details"]
                          },
                          {
                            "id": "discrepancy-details",
                            "type": "div",
                            "props": {
                              "className": "space-y-2 text-sm"
                            },
                            "children": [
                              {
                                "id": "discrepancy-type",
                                "type": "div",
                                "children": ["Type: Scanner Malfunction"]
                              },
                              {
                                "id": "discrepancy-quantity",
                                "type": "div",
                                "children": ["Quantity Difference: 7 units"]
                              },
                              {
                                "id": "discrepancy-value",
                                "type": "div",
                                "children": ["Financial Impact: $2,099.93"]
                              },
                              {
                                "id": "discrepancy-cause",
                                "type": "div",
                                "children": ["Root Cause: Barcode reader malfunction"]
                              },
                              {
                                "id": "discrepancy-severity",
                                "type": "div",
                                "children": ["Severity: High (expensive electronics)"]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              },

              // Recommended Actions
              {
                "id": "recommended-actions-card",
                "type": "div",
                "props": {
                  "className": "bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6"
                },
                "children": [
                  {
                    "id": "actions-title",
                    "type": "h3",
                    "props": {
                      "className": "text-lg font-semibold text-blue-800 mb-4"
                    },
                    "children": ["📋 Recommended Actions"]
                  },
                  {
                    "id": "actions-list",
                    "type": "div",
                    "props": {
                      "className": "space-y-2"
                    },
                    "children": [
                      {
                        "id": "action-1",
                        "type": "div",
                        "props": {
                          "className": "flex items-center text-blue-700"
                        },
                        "children": ["✓ Adjust system inventory: Add 7 units to Zone B-12"]
                      },
                      {
                        "id": "action-2",
                        "type": "div",
                        "props": {
                          "className": "flex items-center text-blue-700"
                        },
                        "children": ["✓ Schedule scanner maintenance for SC03"]
                      },
                      {
                        "id": "action-3",
                        "type": "div",
                        "props": {
                          "className": "flex items-center text-blue-700"
                        },
                        "children": ["✓ Provide refresher training to Marcus Rodriguez"]
                      },
                      {
                        "id": "action-4",
                        "type": "div",
                        "props": {
                          "className": "flex items-center text-blue-700"
                        },
                        "children": ["✓ Monitor scanner performance for next 7 days"]
                      }
                    ]
                  }
                ]
              },

              // Generate Report Actions
              {
                "id": "report-generation-actions",
                "type": "div",
                "props": {
                  "className": "grid grid-cols-2 gap-4"
                },
                "children": [
                  {
                    "id": "generate-final-report-btn",
                    "type": "button",
                    "props": {
                      "className": "ds-btn ds-btn-success ds-btn-lg",
                      "onClick": "navigate_to_resolution"
                    },
                    "children": ["✅ Generate & Send Report"]
                  },
                  {
                    "id": "schedule-supervisor-review-btn",
                    "type": "button",
                    "props": {
                      "className": "bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors",
                      "onClick": "schedule_supervisor_review"
                    },
                    "children": ["👥 Schedule Supervisor Review"]
                  }
                ]
              }
            ]
          },

          // Step 6: Resolution Summary
          {
            "id": "step-5-resolution",
            "type": "div",
            "props": {
              "className": "{{currentFlow.step === 'resolution' ? 'block' : 'hidden'}}"
            },
            "children": [
              {
                "id": "resolution-header",
                "type": "div",
                "props": {
                  "className": "text-center mb-8"
                },
                "children": [
                  {
                    "id": "resolution-icon",
                    "type": "div",
                    "props": {
                      "className": "{{resolution.status === 'resolved' ? 'w-16 h-16 bg-green-600' : resolution.status === 'escalated' ? 'w-16 h-16 bg-red-600' : 'w-16 h-16 bg-yellow-600'}} rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-4"
                    },
                    "children": ["{{resolution.status === 'resolved' ? '✅' : resolution.status === 'escalated' ? '🚨' : '⚠️'}}"]
                  },
                  {
                    "id": "resolution-title",
                    "type": "h2",
                    "props": {
                      "className": "{{resolution.status === 'resolved' ? 'text-2xl font-bold text-green-800' : resolution.status === 'escalated' ? 'text-2xl font-bold text-red-800' : 'text-2xl font-bold text-yellow-800'}}"
                    },
                    "children": ["{{resolution.status === 'resolved' ? 'Discrepancy Resolved' : resolution.status === 'escalated' ? 'Supervisor Intervention Required' : 'Investigation In Progress'}}"]
                  },
                  {
                    "id": "resolution-message",
                    "type": "p",
                    "props": {
                      "className": "text-lg text-gray-600 mt-2"
                    },
                    "children": ["{{resolution.message}}"]
                  }
                ]
              },
              
              // Resolution Actions
              {
                "id": "resolution-actions",
                "type": "div",
                "props": {
                  "className": "flex justify-center space-x-4"
                },
                "children": [
                  {
                    "id": "start-new-investigation-btn",
                    "type": "button",
                    "props": {
                      "className": "ds-btn ds-btn-info ds-btn-lg",
                      "onClick": "start_new_investigation"
                    },
                    "children": ["Start New Investigation"]
                  },
                  {
                    "id": "view-report-btn",
                    "type": "button",
                    "props": {
                      "className": "ds-btn ds-btn-secondary ds-btn-lg",
                      "onClick": "view_full_report"
                    },
                    "children": ["View Full Report"]
                  }
                ]
              }
            ]
          },

          // Report Modal
          {
            "id": "report-modal-overlay",
            "type": "div",
            "props": {
              "className": "{{reportModal.isOpen ? 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' : 'hidden'}}"
            },
            "children": [
              {
                "id": "report-modal-content",
                "type": "div",
                "props": {
                  "className": "bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-screen overflow-y-auto"
                },
                "children": [
                  {
                    "id": "report-modal-header",
                    "type": "div",
                    "props": {
                      "className": "flex justify-between items-center p-6 border-b border-gray-200"
                    },
                    "children": [
                      {
                        "id": "report-modal-title",
                        "type": "h2",
                        "props": {
                          "className": "text-2xl font-bold text-gray-800"
                        },
                        "children": ["Discrepancy Investigation Report"]
                      },
                      {
                        "id": "close-modal-btn",
                        "type": "button",
                        "props": {
                          "className": "text-gray-500 hover:text-gray-700 text-2xl font-bold",
                          "onClick": "close_report_modal"
                        },
                        "children": ["×"]
                      }
                    ]
                  },
                  {
                    "id": "report-modal-body",
                    "type": "div",
                    "props": {
                      "className": "p-6 space-y-6"
                    },
                    "children": [
                      {
                        "id": "report-summary",
                        "type": "div",
                        "props": {
                          "className": "grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg"
                        },
                        "children": [
                          {
                            "id": "report-id-section",
                            "type": "div",
                            "children": [
                              {
                                "id": "report-id-label",
                                "type": "div",
                                "props": {
                                  "className": "text-sm font-medium text-gray-600"
                                },
                                "children": ["Report ID"]
                              },
                              {
                                "id": "report-id-value",
                                "type": "div",
                                "props": {
                                  "className": "text-lg font-semibold text-gray-800"
                                },
                                "children": ["{{reportModal.data.reportId}}"]
                              }
                            ]
                          },
                          {
                            "id": "generated-at-section",
                            "type": "div",
                            "children": [
                              {
                                "id": "generated-at-label",
                                "type": "div",
                                "props": {
                                  "className": "text-sm font-medium text-gray-600"
                                },
                                "children": ["Generated At"]
                              },
                              {
                                "id": "generated-at-value",
                                "type": "div",
                                "props": {
                                  "className": "text-lg font-semibold text-gray-800"
                                },
                                "children": ["{{new Date(reportModal.data.generatedAt).toLocaleString()}}"]
                              }
                            ]
                          },
                          {
                            "id": "generated-by-section",
                            "type": "div",
                            "children": [
                              {
                                "id": "generated-by-label",
                                "type": "div",
                                "props": {
                                  "className": "text-sm font-medium text-gray-600"
                                },
                                "children": ["Generated By"]
                              },
                              {
                                "id": "generated-by-value",
                                "type": "div",
                                "props": {
                                  "className": "text-lg font-semibold text-gray-800"
                                },
                                "children": ["{{reportModal.data.generatedBy}}"]
                              }
                            ]
                          },
                          {
                            "id": "report-status-section",
                            "type": "div",
                            "children": [
                              {
                                "id": "report-status-label",
                                "type": "div",
                                "props": {
                                  "className": "text-sm font-medium text-gray-600"
                                },
                                "children": ["Status"]
                              },
                              {
                                "id": "report-status-value",
                                "type": "div",
                                "props": {
                                  "className": "text-lg font-semibold text-green-600"
                                },
                                "children": ["{{reportModal.data.status}}"]
                              }
                            ]
                          }
                        ]
                      },
                      {
                        "id": "report-discrepancy-details",
                        "type": "div",
                        "props": {
                          "className": "bg-red-50 border border-red-200 rounded-lg p-4"
                        },
                        "children": [
                          {
                            "id": "report-discrepancy-title",
                            "type": "h3",
                            "props": {
                              "className": "text-lg font-semibold text-red-800 mb-3"
                            },
                            "children": ["Discrepancy Details"]
                          },
                          {
                            "id": "report-discrepancy-grid",
                            "type": "div",
                            "props": {
                              "className": "grid grid-cols-2 gap-4 text-sm"
                            },
                            "children": [
                              {
                                "id": "report-product-info",
                                "type": "div",
                                "children": [
                                  {
                                    "id": "report-product-label",
                                    "type": "span",
                                    "props": {
                                      "className": "font-medium text-red-700"
                                    },
                                    "children": ["Product: "]
                                  },
                                  {
                                    "id": "report-product-value",
                                    "type": "span",
                                    "children": ["{{discrepancy.productId}} - {{discrepancy.productName}}"]
                                  }
                                ]
                              },
                              {
                                "id": "report-zone-info",
                                "type": "div",
                                "children": [
                                  {
                                    "id": "report-zone-label",
                                    "type": "span",
                                    "props": {
                                      "className": "font-medium text-red-700"
                                    },
                                    "children": ["Zone: "]
                                  },
                                  {
                                    "id": "report-zone-value",
                                    "type": "span",
                                    "children": ["{{discrepancy.zoneId}} - {{discrepancy.zoneName}}"]
                                  }
                                ]
                              },
                              {
                                "id": "report-expected-qty",
                                "type": "div",
                                "children": [
                                  {
                                    "id": "report-expected-label",
                                    "type": "span",
                                    "props": {
                                      "className": "font-medium text-red-700"
                                    },
                                    "children": ["Expected Quantity: "]
                                  },
                                  {
                                    "id": "report-expected-value",
                                    "type": "span",
                                    "children": ["{{recount.calculation.expectedQuantity}} units"]
                                  }
                                ]
                              },
                              {
                                "id": "report-physical-count",
                                "type": "div",
                                "children": [
                                  {
                                    "id": "report-physical-label",
                                    "type": "span",
                                    "props": {
                                      "className": "font-medium text-red-700"
                                    },
                                    "children": ["Physical Count: "]
                                  },
                                  {
                                    "id": "report-physical-value",
                                    "type": "span",
                                    "children": ["{{recount.result.physicalCount || 'Not counted'}} units"]
                                  }
                                ]
                              }
                            ]
                          }
                        ]
                      },
                      {
                        "id": "report-task-history",
                        "type": "div",
                        "props": {
                          "className": "bg-blue-50 border border-blue-200 rounded-lg p-4"
                        },
                        "children": [
                          {
                            "id": "report-task-title",
                            "type": "h3",
                            "props": {
                              "className": "text-lg font-semibold text-blue-800 mb-3"
                            },
                            "children": ["Investigation Task History"]
                          },
                          {
                            "id": "report-task-list",
                            "type": "ul",
                            "props": {
                              "className": "space-y-2 text-sm"
                            },
                            "children": [
                              {
                                "id": "task-alert-review",
                                "type": "li",
                                "props": {
                                  "className": "flex items-center"
                                },
                                "children": ["✅ Discrepancy alert reviewed and prioritized"]
                              },
                              {
                                "id": "task-transaction-analysis",
                                "type": "li",
                                "props": {
                                  "className": "flex items-center"
                                },
                                "children": ["✅ Transaction history analyzed ({{transactions.length}} transactions)"]
                              },
                              {
                                "id": "task-investigation",
                                "type": "li",
                                "props": {
                                  "className": "flex items-center"
                                },
                                "children": ["✅ Stock movement investigation completed"]
                              },
                              {
                                "id": "task-scan-logs",
                                "type": "li",
                                "props": {
                                  "className": "flex items-center"
                                },
                                "children": ["✅ Scan logs reviewed ({{scanLogs.length}} entries)"]
                              },
                              {
                                "id": "task-recount",
                                "type": "li",
                                "props": {
                                  "className": "{{recount.result.physicalCount ? 'flex items-center' : 'flex items-center text-gray-500'}}"
                                },
                                "children": ["{{recount.result.physicalCount ? '✅' : '⏳'}} Physical recount {{recount.result.physicalCount ? 'completed' : 'pending'}}"]
                              }
                            ]
                          }
                        ]
                      },
                      {
                        "id": "report-scan-summary",
                        "type": "div",
                        "props": {
                          "className": "bg-yellow-50 border border-yellow-200 rounded-lg p-4"
                        },
                        "children": [
                          {
                            "id": "report-scan-title",
                            "type": "h3",
                            "props": {
                              "className": "text-lg font-semibold text-yellow-800 mb-3"
                            },
                            "children": ["Scan Logs Summary"]
                          },
                          {
                            "id": "report-scan-stats",
                            "type": "div",
                            "props": {
                              "className": "grid grid-cols-3 gap-4 text-sm"
                            },
                            "children": [
                              {
                                "id": "total-scans",
                                "type": "div",
                                "props": {
                                  "className": "text-center"
                                },
                                "children": [
                                  {
                                    "id": "total-scans-label",
                                    "type": "div",
                                    "props": {
                                      "className": "font-medium text-yellow-700"
                                    },
                                    "children": ["Total Scans"]
                                  },
                                  {
                                    "id": "total-scans-value",
                                    "type": "div",
                                    "props": {
                                      "className": "text-xl font-bold text-yellow-800"
                                    },
                                    "children": ["{{scanLogs.length}}"]
                                  }
                                ]
                              },
                              {
                                "id": "anomaly-scans",
                                "type": "div",
                                "props": {
                                  "className": "text-center"
                                },
                                "children": [
                                  {
                                    "id": "anomaly-scans-label",
                                    "type": "div",
                                    "props": {
                                      "className": "font-medium text-yellow-700"
                                    },
                                    "children": ["Anomalies"]
                                  },
                                  {
                                    "id": "anomaly-scans-value",
                                    "type": "div",
                                    "props": {
                                      "className": "text-xl font-bold text-red-600"
                                    },
                                    "children": ["{{scanLogs.filter(log => log.isAnomaly).length}}"]
                                  }
                                ]
                              },
                              {
                                "id": "duplicate-scans",
                                "type": "div",
                                "props": {
                                  "className": "text-center"
                                },
                                "children": [
                                  {
                                    "id": "duplicate-scans-label",
                                    "type": "div",
                                    "props": {
                                      "className": "font-medium text-yellow-700"
                                    },
                                    "children": ["Duplicates"]
                                  },
                                  {
                                    "id": "duplicate-scans-value",
                                    "type": "div",
                                    "props": {
                                      "className": "text-xl font-bold text-orange-600"
                                    },
                                    "children": ["{{duplicateScans.length}}"]
                                  }
                                ]
                              }
                            ]
                          }
                        ]
                      },
                      {
                        "id": "report-recommendations",
                        "type": "div",
                        "props": {
                          "className": "bg-green-50 border border-green-200 rounded-lg p-4"
                        },
                        "children": [
                          {
                            "id": "report-recommendations-title",
                            "type": "h3",
                            "props": {
                              "className": "text-lg font-semibold text-green-800 mb-3"
                            },
                            "children": ["Recommendations"]
                          },
                          {
                            "id": "report-recommendations-list",
                            "type": "ul",
                            "props": {
                              "className": "space-y-2 text-sm"
                            },
                            "children": [
                              {
                                "id": "recommendation-1",
                                "type": "li",
                                "children": ["• Implement additional worker training on accurate scanning procedures"]
                              },
                              {
                                "id": "recommendation-2",
                                "type": "li",
                                "children": ["• Review Zone A layout for improved item accessibility"]
                              },
                              {
                                "id": "recommendation-3",
                                "type": "li",
                                "children": ["• Schedule regular audit checks for high-variance products"]
                              },
                              {
                                "id": "recommendation-4",
                                "type": "li",
                                "children": ["• Consider barcode quality verification for PROD-789"]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "id": "report-modal-footer",
                    "type": "div",
                    "props": {
                      "className": "flex justify-end space-x-4 p-6 border-t border-gray-200"
                    },
                    "children": [
                      {
                        "id": "download-report-btn",
                        "type": "button",
                        "props": {
                          "className": "bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors",
                          "onClick": "download_report"
                        },
                        "children": ["📥 Download PDF"]
                      },
                      {
                        "id": "email-report-btn",
                        "type": "button",
                        "props": {
                          "className": "bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors",
                          "onClick": "email_report"
                        },
                        "children": ["📧 Email Report"]
                      },
                      {
                        "id": "close-report-btn",
                        "type": "button",
                        "props": {
                          "className": "bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors",
                          "onClick": "close_report_modal"
                        },
                        "children": ["Close"]
                      }
                    ]
                  }
                ]
              }
            ]
          },

          // Report Modal
          {
            "id": "report-modal",
            "type": "div",
            "props": {
              "className": "{{reportModal.isOpen ? 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' : 'hidden'}}"
            },
            "children": [
              {
                "id": "modal-content",
                "type": "div",
                "props": {
                  "className": "bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-hidden"
                },
                "children": [
                  {
                    "id": "modal-header",
                    "type": "div",
                    "props": {
                      "className": "bg-blue-600 text-white px-6 py-4 flex justify-between items-center"
                    },
                    "children": [
                      {
                        "id": "modal-title",
                        "type": "h2",
                        "props": {
                          "className": "text-xl font-semibold"
                        },
                        "children": ["{{reportModal.data.title || 'Investigation Report'}}"]
                      },
                      {
                        "id": "close-modal-btn",
                        "type": "button",
                        "props": {
                          "className": "text-white hover:text-gray-200 text-2xl",
                          "onClick": "close_report_modal"
                        },
                        "children": ["×"]
                      }
                    ]
                  },
                  {
                    "id": "modal-body",
                    "type": "div",
                    "props": {
                      "className": "p-6 max-h-[70vh] overflow-y-auto"
                    },
                    "children": [
                      {
                        "id": "report-info",
                        "type": "div",
                        "props": {
                          "className": "mb-6 grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg"
                        },
                        "children": [
                          {
                            "id": "report-id-section",
                            "type": "div",
                            "children": [
                              {
                                "id": "report-id-label",
                                "type": "span",
                                "props": {
                                  "className": "font-medium text-gray-600"
                                },
                                "children": ["Report ID: "]
                              },
                              {
                                "id": "report-id-value",
                                "type": "span",
                                "props": {
                                  "className": "font-mono"
                                },
                                "children": ["{{reportModal.data.reportId}}"]
                              }
                            ]
                          },
                          {
                            "id": "report-date-section",
                            "type": "div",
                            "children": [
                              {
                                "id": "report-date-label",
                                "type": "span",
                                "props": {
                                  "className": "font-medium text-gray-600"
                                },
                                "children": ["Generated: "]
                              },
                              {
                                "id": "report-date-value",
                                "type": "span",
                                "children": ["{{reportModal.data.generatedAt}}"]
                              }
                            ]
                          },
                          {
                            "id": "report-type-section",
                            "type": "div",
                            "children": [
                              {
                                "id": "report-type-label",
                                "type": "span",
                                "props": {
                                  "className": "font-medium text-gray-600"
                                },
                                "children": ["Investigation Type: "]
                              },
                              {
                                "id": "report-type-value",
                                "type": "span",
                                "children": ["{{reportModal.data.investigationType}}"]
                              }
                            ]
                          },
                          {
                            "id": "report-status-section",
                            "type": "div",
                            "children": [
                              {
                                "id": "report-status-label",
                                "type": "span",
                                "props": {
                                  "className": "font-medium text-gray-600"
                                },
                                "children": ["Status: "]
                              },
                              {
                                "id": "report-status-value",
                                "type": "span",
                                "props": {
                                  "className": "{{reportModal.data.status === 'completed' ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}}"
                                },
                                "children": ["{{reportModal.data.status || 'Completed'}}"]
                              }
                            ]
                          }
                        ]
                      },
                      {
                        "id": "report-table",
                        "type": "div",
                        "props": {
                          "className": "overflow-x-auto"
                        },
                        "children": [
                          {
                            "id": "report-table-element",
                            "type": "table",
                            "props": {
                              "className": "min-w-full bg-white border border-gray-300"
                            },
                            "children": [
                              {
                                "id": "report-thead",
                                "type": "thead",
                                "props": {
                                  "className": "bg-gray-100"
                                },
                                "children": [
                                  {
                                    "id": "report-header-row",
                                    "type": "tr",
                                    "children": [
                                      {
                                        "id": "section-header",
                                        "type": "th",
                                        "props": {
                                          "className": "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b"
                                        },
                                        "children": ["Section"]
                                      },
                                      {
                                        "id": "details-header",
                                        "type": "th",
                                        "props": {
                                          "className": "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b"
                                        },
                                        "children": ["Details"]
                                      }
                                    ]
                                  }
                                ]
                              },
                              {
                                "id": "report-tbody",
                                "type": "tbody",
                                "props": {
                                  "className": "bg-white divide-y divide-gray-200"
                                },
                                "binding": "reportModal.data.sections || []",
                                "children": [
                                  {
                                    "id": "report-row",
                                    "type": "tr",
                                    "children": [
                                      {
                                        "id": "section-cell",
                                        "type": "td",
                                        "props": {
                                          "className": "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b"
                                        },
                                        "children": ["{{label}}"]
                                      },
                                      {
                                        "id": "details-cell",
                                        "type": "td",
                                        "props": {
                                          "className": "px-6 py-4 text-sm text-gray-700 border-b"
                                        },
                                        "children": ["{{value}}"]
                                      }
                                    ]
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
                    "id": "modal-footer",
                    "type": "div",
                    "props": {
                      "className": "bg-gray-50 px-6 py-4 flex justify-end space-x-3"
                    },
                    "children": [
                      {
                        "id": "download-pdf-btn",
                        "type": "button",
                        "props": {
                          "className": "bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors",
                          "onClick": "download_report_pdf"
                        },
                        "children": ["📄 Download PDF"]
                      },
                      {
                        "id": "close-modal-footer-btn",
                        "type": "button",
                        "props": {
                          "className": "bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors",
                          "onClick": "close_report_modal"
                        },
                        "children": ["Close"]
                      }
                    ]
                  }
                ]
              }
            ]
          },
        ]
      }
    ]
  }
};

// Enhanced dummy data for the complete flow
export const warehouseFlowData = {
  // Current flow state
  currentFlow: {
    step: "alert", // alert | transactions | stock_investigation | pick_task_investigation | scan_logs | generate_report | recount | resolution
    breadcrumb: "Home > Discrepancy Alert"
  },
  
  // Main discrepancy information
  discrepancy: {
    productId: "WH-1000XM5",
    productName: "Wireless Bluetooth Headphones - Model WH-1000XM5",
    zoneId: "Zone B-12",
    zoneName: "Electronics Storage Zone B-12",
    expectedQuantity: 8, // Physical reality: 25 - 15 + 3 - 5 = 8 (what's actually there)
    systemQuantity: 15, // System thinks: 25 - 8 + 3 - 5 = 15 (system only recorded 8 picked, but 15 were actually taken)
    discrepancyAmount: 7, // positive = system shows more than reality (7 units missing)
    severity: "high", // high because expensive electronics are missing
    status: "open",
    timestamp: "2025-09-16T09:45:22",
    detectedBy: "cycle_count_audit",
    unitValue: 299.99,
    totalValue: 2099.93 // 7 * 299.99
  },
  
  // Transactions data for investigation
  transactions: [
    {
      taskId: "PUT2023",
      type: "putaway",
      quantity: 25,
      expectedQuantity: 25,
      workerId: "W123",
      workerName: "Sarah Johnson",
      timestamp: "2025-09-14T08:30:00",
      status: "complete",
      description: "New shipment received - WH-1000XM5 Headphones"
    },
    {
      taskId: "PICK5847",
      type: "picking",
      quantity: 8, // System recorded only 8 picked
      expectedQuantity: 15, // But order required 15
      actualQuantity: 15, // Worker actually took 15 units
      workerId: "W456",
      workerName: "Marcus Rodriguez",
      timestamp: "2025-09-15T14:22:00",
      status: "discrepancy", // Scanning error - under-reported
      description: "Customer order #ORD-4521 - Bulk corporate purchase",
      scannerIssue: true
    },
    {
      taskId: "RET1203",
      type: "return",
      quantity: 3,
      expectedQuantity: 3,
      workerId: "W789",
      workerName: "Linda Chen",
      timestamp: "2025-09-15T16:45:00",
      status: "complete",
      description: "Customer return - damaged packaging"
    },
    {
      taskId: "ADJ9901",
      type: "adjustment",
      quantity: -5,
      expectedQuantity: -5,
      workerId: "W001",
      workerName: "System Admin",
      timestamp: "2025-09-16T07:15:00",
      status: "complete",
      description: "Damaged units removed - water damage during storm",
      reason: "damaged_inventory"
    }
  ],
  
  // Current worker being investigated
  currentWorker: {
    id: "W456",
    name: "Marcus Rodriguez",
    totalTasks: 2340,
    errorRate: 2.1,
    performanceRating: "Needs Training",
    department: "Electronics Picking",
    shiftStart: "14:00",
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
  },
  
  // Current investigation data
  currentInvestigation: {
    taskId: "PICK5847",
    type: "picking",
    orderRequired: 15,
    actuallyScanned: 8,
    actuallyTaken: 15,
    workerId: "W456",
    workerName: "Marcus Rodriguez",
    timestamp: "2025-09-15T14:22:00",
    status: "discrepancy",
    zoneId: "Zone B-12",
    productId: "WH-1000XM5",
    productName: "Wireless Bluetooth Headphones - Model WH-1000XM5",
    scannerIssue: "barcode_reader_malfunction",
    description: "Customer order #ORD-4521 - Bulk corporate purchase",
    scanningError: "7 units unscanned"
  },

  // Scan logs for investigation
  scanLogs: [
    {
      timestamp: "08:30",
      action: "Putaway Scan",
      quantity: 25,
      taskId: "PUT2023",
      workerId: "W123",
      workerName: "Sarah Johnson",
      scannerId: "SC01",
      status: "verified",
      isAnomaly: false,
      description: "New shipment - WH-1000XM5 Headphones"
    },
    {
      timestamp: "14:20",
      action: "Pick Start Scan",
      quantity: 0,
      taskId: "PICK5847",
      workerId: "W456",
      workerName: "Marcus Rodriguez",
      scannerId: "SC03",
      status: "verified",
      isAnomaly: false,
      description: "Bulk corporate order start"
    },
    {
      timestamp: "14:22",
      action: "Pick Complete Scan",
      quantity: 8,
      taskId: "PICK5847",
      workerId: "W456",
      workerName: "Marcus Rodriguez",
      scannerId: "SC03",
      status: "scanning_error",
      isAnomaly: true,
      description: "Scanner malfunction - only 8 scanned but 15 units taken",
      actualQuantityTaken: 15,
      scannerIssue: "barcode_reader_malfunction"
    },
    {
      timestamp: "16:45",
      action: "Return Scan",
      quantity: 3,
      taskId: "RET1203",
      workerId: "W789",
      workerName: "Linda Chen",
      scannerId: "SC02",
      status: "verified",
      isAnomaly: false,
      description: "Customer return - damaged packaging"
    },
    {
      timestamp: "07:15",
      action: "Adjustment Scan",
      quantity: -5,
      taskId: "ADJ9901",
      workerId: "W001",
      workerName: "System Admin",
      scannerId: "SC01",
      status: "verified",
      isAnomaly: false,
      description: "Damaged inventory removal - water damage"
    }
  ],

  // Error detection results - PICK5847 scanning issues
  duplicateScans: [
    {
      originalTimestamp: "14:35:12",
      originalQuantity: 5,
      duplicateTimestamp: "14:35:15",
      duplicateQuantity: 3,
      timeDifference: "3 seconds",
      taskId: "PICK5847",
      workerId: "W2847",
      scannerDevice: "SC-2847",
      errorType: "partial_scan_retry",
      impact: "high",
      description: "Scanner timeout caused incomplete first scan (5 units), worker retried and got partial scan (3 units). System recorded 8 total instead of actual 15 units picked."
    },
    {
      originalTimestamp: "14:35:18",
      originalQuantity: 0,
      duplicateTimestamp: "14:35:20",
      duplicateQuantity: 0,
      timeDifference: "2 seconds",
      taskId: "PICK5847",
      workerId: "W2847",
      scannerDevice: "SC-2847",
      errorType: "failed_scan_attempts",
      impact: "critical",
      description: "Multiple failed scan attempts due to hardware malfunction. Scanner unable to properly read barcode, resulted in incomplete quantity recording."
    }
  ],

  // Camera footage data
  cameraFootage: {
    cameraId: "CAM-ZA-01",
    timeRange: "10:10 - 10:20",
    resolution: "1080p",
    keyEvents: [
      {
        timestamp: "10:10",
        description: "Worker W456 enters Zone A",
        details: "Standard entry procedure followed",
        isRelevant: false
      },
      {
        timestamp: "10:12", 
        description: "Worker begins picking operation", 
        details: "Scans product barcode, starts collecting items",
        isRelevant: true
      },
      {
        timestamp: "10:14",
        description: "Worker appears to struggle with item location",
        details: "Searches multiple shelves, looks confused",
        isRelevant: true
      },
      {
        timestamp: "10:15",
        description: "Worker scans completion with partial quantity",
        details: "Only 5 items scanned instead of required 10",
        isRelevant: true
      },
      {
        timestamp: "10:16",
        description: "Worker exits Zone A",
        details: "Normal exit procedure",
        isRelevant: false
      }
    ],
    findings: [
      {
        description: "Worker appeared uncertain about item locations in Zone A",
        severity: "medium"
      },
      {
        description: "No evidence of theft or intentional misconduct",
        severity: "low"
      },
      {
        description: "Possible training issue - worker unable to locate all required items",
        severity: "high"
      },
      {
        description: "Zone A layout may need optimization for easier item discovery",
        severity: "medium"
      }
    ]
  },

  // Recount data structure
  recount: {
    calculation: {
      startingInventory: 25, // PUT2023: +25 units
      totalPickedRecorded: 8, // PICK5847: system recorded 8 picked
      totalPickedActual: 15, // PICK5847: actually 15 units taken
      totalReturned: 3, // RET1203: +3 units
      totalAdjustments: -5, // ADJ9901: -5 damaged units
      expectedQuantitySystem: 15, // 25 - 8 + 3 - 5 = 15 (what system thinks)
      expectedQuantityPhysical: 8 // 25 - 15 + 3 - 5 = 8 (what's actually there)
    },
    result: {
      physicalCount: null, // Will be filled when user enters count
      variance: null, // Will be calculated
      varianceType: null, // 'positive', 'negative', 'none'
      edgeCase: null, // 'mis_entry', 'continue_investigation', 'resolved'
      analysisComplete: false,
      recommendations: []
    }
  },

  // Recount scenarios for testing different outcomes
  recountScenarios: [
    {
      name: 'Matching Physical Count',
      enteredCount: 8,
      expectedCount: 8, // Physical expected
      systemCount: 15, // What system thinks
      variance: 0,
      varianceType: 'none',
      edgeCase: 'scanning_error_confirmed',
      status: 'resolved',
      message: 'Physical count confirms actual quantity. Scanning error in PICK5847 confirmed.',
      suggestedActions: ['Update System Inventory', 'Schedule Scanner Training', 'Generate Resolution Report'],
      systemAdjustment: -7 // System needs to reduce by 7
    },
    {
      name: 'Higher Count (Additional Items Found)',
      enteredCount: 12,
      expectedCount: 8,
      systemCount: 15,
      variance: 4,
      varianceType: 'positive',
      edgeCase: 'items_found',
      status: 'requires_review',
      message: 'More items found than expected. Possible misplaced inventory or return processing error.',
      suggestedActions: ['Verify Item Locations', 'Check Return Processing', 'Generate Investigation Report'],
      systemAdjustment: -3 // System still needs adjustment
    },
    {
      name: 'Lower Count (Potential Theft)',
      enteredCount: 5,
      expectedCount: 8,
      systemCount: 15,
      variance: -3,
      varianceType: 'negative',
      edgeCase: 'potential_theft',
      status: 'critical_investigation',
      message: 'Physical count lower than expected. Potential theft or additional unreported picking.',
      suggestedActions: ['Security Investigation', 'Review Camera Footage', 'Supervisor Audit', 'Generate Incident Report'],
      systemAdjustment: -10 // Large system adjustment needed
    }
  ],

  // Report modal data
  reportModal: {
    isOpen: false,
    data: {
      reportId: '',
      generatedAt: '',
      generatedBy: '',
      status: ''
    }
  },

  // Resolution information
  resolution: {
    status: "resolved", // resolved | escalated | pending
    message: "Physical recount confirmed actual quantity. System has been updated.",
    actions_taken: [
      "Physical recount conducted",
      "System quantity updated", 
      "Worker training scheduled",
      "Discrepancy report generated"
    ],
    final_quantity: 16,
    supervisor_notified: false
  }
};