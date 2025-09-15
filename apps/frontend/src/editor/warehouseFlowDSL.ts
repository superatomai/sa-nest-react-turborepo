export const warehouseFlowDSL = {
  "warehouse_discrepancy_investigation_flow": {
    "id": "warehouse-flow-container",
    "type": "div",
    "props": {
      "className": "min-h-screen bg-gray-50 p-4"
    },
    "children": [
      {
        "id": "flow-header",
        "type": "div",
        "props": {
          "className": "max-w-6xl mx-auto mb-6"
        },
        "children": [
        ]
      },
      
      // Main Flow Container - Shows different views based on currentStep
      {
        "id": "main-flow-content",
        "type": "div",
        "props": {
          "className": "max-w-6xl mx-auto"
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
                  "className": "{{discrepancy.severity === 'high' ? 'bg-red-50 border-red-200' : discrepancy.severity === 'medium' ? 'bg-orange-50 border-orange-200' : 'bg-yellow-50 border-yellow-200'}} border rounded-lg p-6 mb-6"
                },
                "children": [
                  {
                    "id": "alert-header",
                    "type": "div",
                    "props": {
                      "className": "flex items-center justify-between mb-4"
                    },
                    "children": [
                      {
                        "id": "alert-icon-title",
                        "type": "div",
                        "props": {
                          "className": "flex items-center space-x-3"
                        },
                        "children": [
                          {
                            "id": "warning-icon",
                            "type": "div",
                            "props": {
                              "className": "{{discrepancy.severity === 'high' ? 'w-10 h-10 bg-red-600' : discrepancy.severity === 'medium' ? 'w-10 h-10 bg-orange-600' : 'w-10 h-10 bg-yellow-600'}} rounded-full flex items-center justify-center text-white font-bold text-xl"
                            },
                            "children": ["⚠"]
                          },
                          {
                            "id": "alert-title",
                            "type": "h2",
                            "props": {
                              "className": "{{discrepancy.severity === 'high' ? 'text-xl font-bold text-red-800' : discrepancy.severity === 'medium' ? 'text-xl font-bold text-orange-800' : 'text-xl font-bold text-yellow-800'}}"
                            },
                            "children": ["{{discrepancy.severity === 'high' ? 'CRITICAL ' : ''}}Discrepancy Alert Detected"]
                          }
                        ]
                      },
                      {
                        "id": "severity-badge",
                        "type": "span",
                        "props": {
                          "className": "{{discrepancy.severity === 'high' ? 'bg-red-600 text-white' : discrepancy.severity === 'medium' ? 'bg-orange-500 text-white' : 'bg-yellow-500 text-black'}} px-3 py-1 rounded-full text-sm font-medium"
                        },
                        "children": ["{{discrepancy.severity === 'high' ? 'HIGH PRIORITY' : discrepancy.severity === 'medium' ? 'MEDIUM PRIORITY' : 'LOW PRIORITY'}}"]
                      }
                    ]
                  },
                  {
                    "id": "alert-message",
                    "type": "div",
                    "props": {
                      "className": "{{discrepancy.severity === 'high' ? 'text-red-800 text-lg font-medium' : discrepancy.severity === 'medium' ? 'text-orange-800 text-lg font-medium' : 'text-yellow-800 text-lg font-medium'}} mb-4"
                    },
                    "children": ["Discrepancy Alert: {{discrepancy.productId}} — {{discrepancy.zoneId}} — {{discrepancy.discrepancyAmount}} units {{discrepancy.discrepancyAmount > 0 ? 'missing' : 'excess'}}."]
                  },
                  {
                    "id": "discrepancy-details-grid",
                    "type": "div",
                    "props": {
                      "className": "grid grid-cols-4 gap-4 mb-4"
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
                              "className": "font-semibold text-gray-900"
                            },
                            "children": ["{{discrepancy.productId}}"]
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
                            "children": ["Zone"]
                          },
                          {
                            "id": "zone-value",
                            "type": "div",
                            "props": {
                              "className": "font-semibold text-gray-900"
                            },
                            "children": ["{{discrepancy.zoneId}}"]
                          }
                        ]
                      },
                      {
                        "id": "expected-detail",
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
                              "className": "font-semibold text-green-600"
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
                            "children": ["System Shows"]
                          },
                          {
                            "id": "system-value",
                            "type": "div",
                            "props": {
                              "className": "font-semibold text-red-600"
                            },
                            "children": ["{{discrepancy.systemQuantity}}"]
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
                      "className": "{{discrepancy.severity === 'high' ? 'bg-red-600 hover:bg-red-700 ring-2 ring-red-300' : 'bg-blue-600 hover:bg-blue-700'}} text-white px-6 py-4 rounded-lg font-medium transition-colors text-left",
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
                              "className": "font-semibold text-lg mb-1"
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
                    "id": "investigate-movement-btn",
                    "type": "button",
                    "props": {
                      "className": "bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-lg font-medium transition-colors text-left",
                      "onClick": "navigate_to_investigation"
                    },
                    "children": [
                      {
                        "id": "investigation-btn-content",
                        "type": "div",
                        "children": [
                          {
                            "id": "investigation-btn-title",
                            "type": "div",
                            "props": {
                              "className": "font-semibold text-lg mb-1"
                            },
                            "children": ["🔍 Investigate Stock Movement"]
                          },
                          {
                            "id": "investigation-btn-desc",
                            "type": "div",
                            "props": {
                              "className": "text-sm opacity-90"
                            },
                            "children": ["Check scan logs, worker profiles, and system errors"]
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "id": "initiate-recount-btn",
                    "type": "button",
                    "props": {
                      "className": "{{discrepancy.severity === 'high' ? 'bg-orange-600 hover:bg-orange-700 ring-2 ring-orange-300' : 'bg-green-600 hover:bg-green-700'}} text-white px-6 py-4 rounded-lg font-medium transition-colors text-left",
                      "onClick": "navigate_to_recount"
                    },
                    "children": [
                      {
                        "id": "recount-btn-content",
                        "type": "div",
                        "children": [
                          {
                            "id": "recount-btn-title",
                            "type": "div",
                            "props": {
                              "className": "font-semibold text-lg mb-1"
                            },
                            "children": ["📊 {{discrepancy.severity === 'high' ? 'IMMEDIATE ' : ''}}Physical Recount"]
                          },
                          {
                            "id": "recount-btn-desc",
                            "type": "div",
                            "props": {
                              "className": "text-sm opacity-90"
                            },
                            "children": ["Conduct physical count to verify actual stock"]
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "id": "ignore-alert-btn",
                    "type": "button",
                    "props": {
                      "className": "{{discrepancy.severity === 'high' ? 'bg-red-700 hover:bg-red-800 ring-2 ring-red-400' : 'bg-gray-500 hover:bg-gray-600'}} text-white px-6 py-4 rounded-lg font-medium transition-colors text-left",
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
                              "className": "font-semibold text-lg mb-1"
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
                      "className": "text-xl font-semibold text-gray-800"
                    },
                    "children": ["Recent Transactions - {{discrepancy.productId}}, {{discrepancy.zoneId}}"]
                  },
                  {
                    "id": "back-to-alert-btn",
                    "type": "button",
                    "props": {
                      "className": "bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg",
                      "onClick": "navigate_to_alert"
                    },
                    "children": ["← Back to Alert"]
                  }
                ]
              },
              
              // Transactions Table
              {
                "id": "transactions-table-container",
                "type": "div",
                "props": {
                  "className": "bg-white rounded-lg shadow border overflow-hidden mb-6"
                },
                "children": [
                  {
                    "id": "transactions-table",
                    "type": "table",
                    "props": {
                      "className": "w-full"
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
                                  "className": "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                },
                                "children": ["Type"]
                              },
                              {
                                "id": "th-task-id",
                                "type": "th",
                                "props": {
                                  "className": "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                },
                                "children": ["Task ID"]
                              },
                              {
                                "id": "th-quantity",
                                "type": "th",
                                "props": {
                                  "className": "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                },
                                "children": ["Quantity"]
                              },
                              {
                                "id": "th-worker",
                                "type": "th",
                                "props": {
                                  "className": "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                },
                                "children": ["Worker"]
                              },
                              {
                                "id": "th-timestamp",
                                "type": "th",
                                "props": {
                                  "className": "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                },
                                "children": ["Timestamp"]
                              },
                              {
                                "id": "th-actions",
                                "type": "th",
                                "props": {
                                  "className": "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                },
                                "children": ["Actions"]
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
                              "className": "{{status === 'error' ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}}"
                            },
                            "children": [
                              {
                                "id": "td-type",
                                "type": "td",
                                "props": {
                                  "className": "px-6 py-4 whitespace-nowrap"
                                },
                                "children": [
                                  {
                                    "id": "type-badge",
                                    "type": "span",
                                    "props": {
                                      "className": "{{type === 'putaway' ? 'bg-green-100 text-green-800' : type === 'picking' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}} px-2 py-1 rounded-full text-sm font-medium"
                                    },
                                    "children": ["{{type.charAt(0).toUpperCase() + type.slice(1)}} {{status === 'error' ? '⚠️' : ''}}"]
                                  }
                                ]
                              },
                              {
                                "id": "td-task-id",
                                "type": "td",
                                "props": {
                                  "className": "px-6 py-4 whitespace-nowrap font-mono text-sm {{status === 'error' ? 'font-bold text-red-600' : 'text-gray-900'}}"
                                },
                                "children": ["{{taskId}}"]
                              },
                              {
                                "id": "td-quantity",
                                "type": "td",
                                "props": {
                                  "className": "px-6 py-4 whitespace-nowrap text-sm {{status === 'error' ? 'font-bold text-red-600' : 'font-medium text-gray-900'}}"
                                },
                                "children": ["{{type === 'putaway' || type === 'return' ? '+' : '-'}}{{quantity}}{{expectedQuantity && quantity !== expectedQuantity ? ' (exp. ' + (type === 'putaway' || type === 'return' ? '+' : '-') + expectedQuantity + ')' : ''}}"]
                              },
                              {
                                "id": "td-worker",
                                "type": "td",
                                "props": {
                                  "className": "px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                },
                                "children": [
                                  {
                                    "id": "worker-link",
                                    "type": "button",
                                    "props": {
                                      "className": "text-blue-600 hover:text-blue-800 underline",
                                      "onClick": "navigate_to_worker_profile"
                                    },
                                    "children": ["{{workerId}}"]
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
                                "id": "td-actions",
                                "type": "td",
                                "props": {
                                  "className": "px-6 py-4 whitespace-nowrap text-sm"
                                },
                                "children": [
                                  {
                                    "id": "action-btn",
                                    "type": "button",
                                    "props": {
                                      "className": "{{status === 'error' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}} px-3 py-1 rounded-md text-sm font-medium transition-colors",
                                      "onClick": "{{status === 'error' ? 'investigate_transaction' : 'view_transaction_details'}}"
                                    },
                                    "children": ["{{status === 'error' ? 'Investigate' : 'View Details'}}"]
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
                      "className": "bg-blue-50 border border-blue-200 rounded-lg p-4 text-center"
                    },
                    "children": [
                      {
                        "id": "total-count",
                        "type": "div",
                        "props": {
                          "className": "text-3xl font-bold text-blue-600 mb-1"
                        },
                        "children": ["{{transactions.length}}"]
                      },
                      {
                        "id": "total-label",
                        "type": "div",
                        "props": {
                          "className": "text-sm font-medium text-blue-800"
                        },
                        "children": ["Total Transactions"]
                      }
                    ]
                  },
                  {
                    "id": "error-transactions-card",
                    "type": "div",
                    "props": {
                      "className": "bg-red-50 border border-red-200 rounded-lg p-4 text-center"
                    },
                    "children": [
                      {
                        "id": "error-count",
                        "type": "div",
                        "props": {
                          "className": "text-3xl font-bold text-red-600 mb-1"
                        },
                        "children": ["{{transactions.filter(t => t.status === 'error').length}}"]
                      },
                      {
                        "id": "error-label",
                        "type": "div",
                        "props": {
                          "className": "text-sm font-medium text-red-800"
                        },
                        "children": ["Error Transactions"]
                      }
                    ]
                  },
                  {
                    "id": "success-rate-card",
                    "type": "div",
                    "props": {
                      "className": "bg-green-50 border border-green-200 rounded-lg p-4 text-center"
                    },
                    "children": [
                      {
                        "id": "success-percentage",
                        "type": "div",
                        "props": {
                          "className": "text-3xl font-bold text-green-600 mb-1"
                        },
                        "children": ["{{Math.round((transactions.filter(t => t.status === 'complete').length / transactions.length) * 100)}}%"]
                      },
                      {
                        "id": "success-label",
                        "type": "div",
                        "props": {
                          "className": "text-sm font-medium text-green-800"
                        },
                        "children": ["Success Rate"]
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
                      "className": "text-xl font-semibold text-gray-800"
                    },
                    "children": ["Stock Movement Investigation - {{currentInvestigation.taskId}}"]
                  },
                  {
                    "id": "back-to-transactions-from-investigation-btn",
                    "type": "button",
                    "props": {
                      "className": "bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg",
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
                  "className": "bg-red-50 border border-red-200 rounded-lg p-6 mb-6"
                },
                "children": [
                  {
                    "id": "investigation-task-title",
                    "type": "h3",
                    "props": {
                      "className": "text-lg font-semibold text-red-800 mb-4"
                    },
                    "children": ["⚠️ Task {{currentInvestigation.taskId}} - Discrepancy Details"]
                  },
                  {
                    "id": "investigation-details-grid",
                    "type": "div",
                    "props": {
                      "className": "grid grid-cols-4 gap-4"
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
                            "children": ["Expected"]
                          },
                          {
                            "id": "task-expected-value",
                            "type": "div",
                            "props": {
                              "className": "text-2xl font-bold text-green-600"
                            },
                            "children": ["{{currentInvestigation.expectedQuantity}} units"]
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
                              "className": "text-2xl font-bold text-red-600"
                            },
                            "children": ["{{currentInvestigation.actualQuantity}} units"]
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
                              "className": "text-lg font-semibold text-gray-900"
                            },
                            "children": ["{{currentInvestigation.workerId}}"]
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
                            "children": ["Difference"]
                          },
                          {
                            "id": "task-difference-value",
                            "type": "div",
                            "props": {
                              "className": "text-2xl font-bold text-orange-600"
                            },
                            "children": ["{{currentInvestigation.expectedQuantity - currentInvestigation.actualQuantity}} units missing"]
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
                  "className": "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                },
                "children": [
                  {
                    "id": "scan-logs-option",
                    "type": "div",
                    "props": {
                      "className": "bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
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
                              "className": "w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3"
                            },
                            "children": ["📊"]
                          },
                          {
                            "id": "scan-logs-title",
                            "type": "h3",
                            "props": {
                              "className": "text-lg font-semibold text-gray-900"
                            },
                            "children": ["Scan Logs Analysis"]
                          }
                        ]
                      },
                      {
                        "id": "scan-logs-description",
                        "type": "p",
                        "props": {
                          "className": "text-gray-600 mb-4"
                        },
                        "children": ["Review detailed scan logs for Zone A during the task timeframe"]
                      },
                      {
                        "id": "scan-logs-button",
                        "type": "button",
                        "props": {
                          "className": "w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors",
                          "onClick": "view_scan_logs"
                        },
                        "children": ["View Scan Logs"]
                      }
                    ]
                  },
                  {
                    "id": "duplicate-scan-option",
                    "type": "div",
                    "props": {
                      "className": "bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
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
                              "className": "w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3"
                            },
                            "children": ["🔍"]
                          },
                          {
                            "id": "duplicate-scan-title",
                            "type": "h3",
                            "props": {
                              "className": "text-lg font-semibold text-gray-900"
                            },
                            "children": ["Duplicate Scan Check"]
                          }
                        ]
                      },
                      {
                        "id": "duplicate-scan-description",
                        "type": "p",
                        "props": {
                          "className": "text-gray-600 mb-4"
                        },
                        "children": ["Check for duplicate or missing scans that might explain the discrepancy"]
                      },
                      {
                        "id": "duplicate-scan-button",
                        "type": "button",
                        "props": {
                          "className": "w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors",
                          "onClick": "check_duplicate_scans"
                        },
                        "children": ["Check Duplicates"]
                      }
                    ]
                  },
                  {
                    "id": "camera-footage-option",
                    "type": "div",
                    "props": {
                      "className": "bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    },
                    "children": [
                      {
                        "id": "camera-footage-header",
                        "type": "div",
                        "props": {
                          "className": "flex items-center mb-4"
                        },
                        "children": [
                          {
                            "id": "camera-footage-icon",
                            "type": "div",
                            "props": {
                              "className": "w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3"
                            },
                            "children": ["📹"]
                          },
                          {
                            "id": "camera-footage-title",
                            "type": "h3",
                            "props": {
                              "className": "text-lg font-semibold text-gray-900"
                            },
                            "children": ["Camera Footage"]
                          }
                        ]
                      },
                      {
                        "id": "camera-footage-description",
                        "type": "p",
                        "props": {
                          "className": "text-gray-600 mb-4"
                        },
                        "children": ["Review security footage from Zone A during task execution"]
                      },
                      {
                        "id": "camera-footage-button",
                        "type": "button",
                        "props": {
                          "className": "w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors",
                          "onClick": "view_camera_footage"
                        },
                        "children": ["View Footage"]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          
          // Step 3A: Scan Logs View
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
                      "className": "text-xl font-semibold text-gray-800"
                    },
                    "children": ["Scan Logs - {{discrepancy.zoneId}} ({{currentInvestigation.timestamp}})"]
                  },
                  {
                    "id": "back-to-investigation-btn",
                    "type": "button",
                    "props": {
                      "className": "bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg",
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
                  "className": "bg-white rounded-lg shadow border p-6 mb-6"
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
                      "className": "bg-blue-50 border border-blue-200 rounded-lg p-4 text-center"
                    },
                    "children": [
                      {
                        "id": "total-scans-value",
                        "type": "div",
                        "props": {
                          "className": "text-3xl font-bold text-blue-600 mb-1"
                        },
                        "children": ["{{scanLogs.length}}"]
                      },
                      {
                        "id": "total-scans-label",
                        "type": "div",
                        "props": {
                          "className": "text-sm font-medium text-blue-800"
                        },
                        "children": ["Total Scans"]
                      }
                    ]
                  },
                  {
                    "id": "anomaly-scans-card",
                    "type": "div",
                    "props": {
                      "className": "bg-red-50 border border-red-200 rounded-lg p-4 text-center"
                    },
                    "children": [
                      {
                        "id": "anomaly-scans-value",
                        "type": "div",
                        "props": {
                          "className": "text-3xl font-bold text-red-600 mb-1"
                        },
                        "children": ["{{scanLogs.filter(log => log.isAnomaly).length}}"]
                      },
                      {
                        "id": "anomaly-scans-label",
                        "type": "div",
                        "props": {
                          "className": "text-sm font-medium text-red-800"
                        },
                        "children": ["Anomalies Found"]
                      }
                    ]
                  },
                  {
                    "id": "verified-scans-card",
                    "type": "div",
                    "props": {
                      "className": "bg-green-50 border border-green-200 rounded-lg p-4 text-center"
                    },
                    "children": [
                      {
                        "id": "verified-scans-value",
                        "type": "div",
                        "props": {
                          "className": "text-3xl font-bold text-green-600 mb-1"
                        },
                        "children": ["{{scanLogs.filter(log => log.status === 'verified').length}}"]
                      },
                      {
                        "id": "verified-scans-label",
                        "type": "div",
                        "props": {
                          "className": "text-sm font-medium text-green-800"
                        },
                        "children": ["Verified Scans"]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          
          // Step 3B: Duplicate Scan Check
          {
            "id": "step-3b-duplicate-scans",
            "type": "div",
            "props": {
              "className": "{{currentFlow.step === 'duplicate_scans' ? 'block' : 'hidden'}}"
            },
            "children": [
              {
                "id": "duplicate-scans-header",
                "type": "div",
                "props": {
                  "className": "flex justify-between items-center mb-6"
                },
                "children": [
                  {
                    "id": "duplicate-scans-title",
                    "type": "h2",
                    "props": {
                      "className": "text-xl font-semibold text-gray-800"
                    },
                    "children": ["Duplicate Scan Detection - {{discrepancy.productId}}"]
                  },
                  {
                    "id": "back-to-investigation-duplicate-btn",
                    "type": "button",
                    "props": {
                      "className": "bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg",
                      "onClick": "navigate_to_stock_investigation"
                    },
                    "children": ["← Back to Investigation"]
                  }
                ]
              },
              
              // Duplicate Detection Results
              {
                "id": "duplicate-detection-results",
                "type": "div",
                "props": {
                  "className": "{{duplicateScans.length > 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}} rounded-lg p-6 mb-6"
                },
                "children": [
                  {
                    "id": "duplicate-results-header",
                    "type": "div",
                    "props": {
                      "className": "flex items-center mb-4"
                    },
                    "children": [
                      {
                        "id": "duplicate-results-icon",
                        "type": "div",
                        "props": {
                          "className": "{{duplicateScans.length > 0 ? 'w-8 h-8 bg-red-600' : 'w-8 h-8 bg-green-600'}} rounded-full flex items-center justify-center text-white mr-3"
                        },
                        "children": ["{{duplicateScans.length > 0 ? '⚠️' : '✅'}}"]
                      },
                      {
                        "id": "duplicate-results-title",
                        "type": "h3",
                        "props": {
                          "className": "{{duplicateScans.length > 0 ? 'text-lg font-semibold text-red-800' : 'text-lg font-semibold text-green-800'}}"
                        },
                        "children": ["{{duplicateScans.length > 0 ? 'Duplicate Scans Found!' : 'No Duplicate Scans Detected'}}"]
                      }
                    ]
                  },
                  {
                    "id": "duplicate-results-summary",
                    "type": "p",
                    "props": {
                      "className": "{{duplicateScans.length > 0 ? 'text-red-700' : 'text-green-700'}}"
                    },
                    "children": ["{{duplicateScans.length > 0 ? duplicateScans.length + ' duplicate scan(s) detected. This may explain the inventory discrepancy.' : 'Scan validation passed. No duplicate entries found in the system.'}}"]
                  }
                ]
              },
              
              // Duplicate Scans List (if any)
              {
                "id": "duplicate-scans-list",
                "type": "div",
                "props": {
                  "className": "{{duplicateScans.length > 0 ? 'block' : 'hidden'}}"
                },
                "children": [
                  {
                    "id": "duplicate-scans-table-title",
                    "type": "h3",
                    "props": {
                      "className": "text-lg font-semibold text-gray-900 mb-4"
                    },
                    "children": ["Detected Duplicate Scans"]
                  },
                  {
                    "id": "duplicate-scans-table",
                    "type": "div",
                    "props": {
                      "className": "bg-white rounded-lg shadow border overflow-hidden mb-6"
                    },
                    "children": [
                      {
                        "id": "duplicate-scans-table-content",
                        "type": "table",
                        "props": {
                          "className": "w-full"
                        },
                        "children": [
                          {
                            "id": "duplicate-scans-table-header",
                            "type": "thead",
                            "props": {
                              "className": "bg-gray-50"
                            },
                            "children": [
                              {
                                "id": "duplicate-scans-header-row",
                                "type": "tr",
                                "children": [
                                  {
                                    "id": "th-original-scan",
                                    "type": "th",
                                    "props": {
                                      "className": "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    },
                                    "children": ["Original Scan"]
                                  },
                                  {
                                    "id": "th-duplicate-scan",
                                    "type": "th",
                                    "props": {
                                      "className": "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    },
                                    "children": ["Duplicate Scan"]
                                  },
                                  {
                                    "id": "th-time-difference",
                                    "type": "th",
                                    "props": {
                                      "className": "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    },
                                    "children": ["Time Difference"]
                                  },
                                  {
                                    "id": "th-action",
                                    "type": "th",
                                    "props": {
                                      "className": "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    },
                                    "children": ["Action"]
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            "id": "duplicate-scans-table-body",
                            "type": "tbody",
                            "props": {
                              "className": "bg-white divide-y divide-gray-200"
                            },
                            "binding": "duplicateScans",
                            "children": [
                              {
                                "id": "duplicate-scan-row",
                                "type": "tr",
                                "props": {
                                  "className": "hover:bg-gray-50"
                                },
                                "children": [
                                  {
                                    "id": "td-original-scan",
                                    "type": "td",
                                    "props": {
                                      "className": "px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    },
                                    "children": ["{{originalTimestamp}} ({{originalQuantity}} units)"]
                                  },
                                  {
                                    "id": "td-duplicate-scan",
                                    "type": "td",
                                    "props": {
                                      "className": "px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium"
                                    },
                                    "children": ["{{duplicateTimestamp}} ({{duplicateQuantity}} units)"]
                                  },
                                  {
                                    "id": "td-time-difference",
                                    "type": "td",
                                    "props": {
                                      "className": "px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                    },
                                    "children": ["{{timeDifference}}"]
                                  },
                                  {
                                    "id": "td-action",
                                    "type": "td",
                                    "props": {
                                      "className": "px-6 py-4 whitespace-nowrap text-sm"
                                    },
                                    "children": [
                                      {
                                        "id": "remove-duplicate-btn",
                                        "type": "button",
                                        "props": {
                                          "className": "bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-md text-sm font-medium transition-colors",
                                          "onClick": "remove_duplicate_scan"
                                        },
                                        "children": ["Remove Duplicate"]
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
              
              // Auto-correction Options
              {
                "id": "auto-correction-options",
                "type": "div",
                "props": {
                  "className": "{{duplicateScans.length > 0 ? 'flex space-x-4' : 'hidden'}}"
                },
                "children": [
                  {
                    "id": "auto-correct-btn",
                    "type": "button",
                    "props": {
                      "className": "bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors",
                      "onClick": "auto_correct_duplicates"
                    },
                    "children": ["Auto-Correct All Duplicates"]
                  },
                  {
                    "id": "manual-review-btn",
                    "type": "button",
                    "props": {
                      "className": "bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition-colors",
                      "onClick": "request_manual_review"
                    },
                    "children": ["Request Manual Review"]
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
                      "className": "text-xl font-semibold text-gray-800"
                    },
                    "children": ["Camera Footage Review - {{discrepancy.zoneId}}"]
                  },
                  {
                    "id": "back-to-investigation-camera-btn",
                    "type": "button",
                    "props": {
                      "className": "bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg",
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
                  "className": "flex space-x-4"
                },
                "children": [
                  {
                    "id": "save-evidence-btn",
                    "type": "button",
                    "props": {
                      "className": "bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors",
                      "onClick": "save_footage_evidence"
                    },
                    "children": ["💾 Save as Evidence"]
                  },
                  {
                    "id": "download-footage-btn",
                    "type": "button",
                    "props": {
                      "className": "bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors",
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
                      "className": "text-xl font-semibold text-gray-800"
                    },
                    "children": ["Worker Profile - {{currentWorker.id}} ({{currentWorker.name}})"]
                  },
                  {
                    "id": "back-to-transactions-btn",
                    "type": "button",
                    "props": {
                      "className": "bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg",
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
                      "className": "bg-blue-50 border border-blue-200 rounded-lg p-4 text-center"
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
                          "className": "text-sm font-medium text-blue-800"
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
                  "className": "bg-white rounded-lg shadow border p-6 mb-6"
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
                      "className": "text-xl font-semibold text-gray-800"
                    },
                    "children": ["Physical Recount - {{discrepancy.productId}}, {{discrepancy.zoneId}}"]
                  },
                  {
                    "id": "back-to-alert-recount-btn",
                    "type": "button",
                    "props": {
                      "className": "bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg",
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
                  "className": "bg-white rounded-lg shadow border p-6 mb-6"
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
                              "className": "text-2xl font-bold text-red-600"
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
                              "className": "text-2xl font-bold text-orange-600"
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
                      "className": "text-xl font-semibold text-gray-800"
                    },
                    "children": ["Recount Results & Analysis"]
                  },
                  {
                    "id": "back-to-recount-btn",
                    "type": "button",
                    "props": {
                      "className": "bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg",
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
                              "className": "text-2xl font-bold text-blue-600"
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
                      "className": "{{recount.result.edgeCase.severity === 'high' ? 'bg-red-50 border-red-200' : recount.result.edgeCase.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'}} border rounded-lg p-6 mb-6"
                    },
                    "children": [
                      {
                        "id": "edge-case-title",
                        "type": "h3",
                        "props": {
                          "className": "{{recount.result.edgeCase.severity === 'high' ? 'font-semibold text-red-800 mb-3' : recount.result.edgeCase.severity === 'medium' ? 'font-semibold text-yellow-800 mb-3' : 'font-semibold text-blue-800 mb-3'}}"
                        },
                        "children": ["⚠️ {{recount.result.edgeCase.title}}"]
                      },
                      {
                        "id": "edge-case-description",
                        "type": "p",
                        "props": {
                          "className": "{{recount.result.edgeCase.severity === 'high' ? 'text-red-700 mb-4' : recount.result.edgeCase.severity === 'medium' ? 'text-yellow-700 mb-4' : 'text-blue-700 mb-4'}}"
                        },
                        "children": ["{{recount.result.edgeCase.description}}"]
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
                            "binding": "recount.result.edgeCase.recommendations",
                            "children": [
                              {
                                "id": "recommendation-item",
                                "type": "li",
                                "children": ["{{.}}"]
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
                  "className": "bg-white rounded-lg shadow border p-6 mb-6"
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
          
          // Step 5: Resolution Summary
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
                      "className": "bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors",
                      "onClick": "start_new_investigation"
                    },
                    "children": ["Start New Investigation"]
                  },
                  {
                    "id": "view-report-btn",
                    "type": "button",
                    "props": {
                      "className": "bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors",
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
          }
        ]
      }
    ]
  }
};

// Enhanced dummy data for the complete flow
export const warehouseFlowData = {
  // Current flow state
  currentFlow: {
    step: "alert", // alert | transactions | worker_profile | recount | resolution
    breadcrumb: "Home > Discrepancy Alert"
  },
  
  // Main discrepancy information
  discrepancy: {
    productId: "Product Y",
    zoneId: "Zone A", 
    expectedQuantity: 20,
    systemQuantity: 15,
    discrepancyAmount: 5, // positive = missing, negative = excess
    severity: "medium", // low | medium | high
    status: "open",
    timestamp: "2025-09-15T14:30:15",
    detectedBy: "system_audit"
  },
  
  // Transactions data for investigation
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
  ],
  
  // Current worker being investigated
  currentWorker: {
    id: "W456",
    name: "Jane Smith",
    totalTasks: 1500,
    errorRate: 1.5, 
    performanceRating: "Needs Improvement",
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
    taskId: "PICK789",
    type: "picking",
    expectedQuantity: 10,
    actualQuantity: 5,
    workerId: "W456",
    timestamp: "2025-09-10T10:15",
    status: "error",
    zoneId: "Zone A",
    productId: "Product Y"
  },

  // Scan logs for investigation
  scanLogs: [
    {
      timestamp: "08:00",
      action: "Putaway Scan",
      quantity: 20,
      taskId: "PUT001", 
      workerId: "W123",
      scannerId: "SC01",
      status: "verified",
      isAnomaly: false
    },
    {
      timestamp: "10:10",
      action: "Pick Start Scan",
      quantity: 0,
      taskId: "PICK789",
      workerId: "W456", 
      scannerId: "SC02",
      status: "verified",
      isAnomaly: false
    },
    {
      timestamp: "10:15",
      action: "Pick Complete Scan",
      quantity: 5,
      taskId: "PICK789",
      workerId: "W456",
      scannerId: "SC02", 
      status: "error",
      isAnomaly: true
    },
    {
      timestamp: "12:00",
      action: "Return Scan", 
      quantity: 2,
      taskId: "RET456",
      workerId: "W789",
      scannerId: "SC03",
      status: "verified",
      isAnomaly: false
    },
    {
      timestamp: "12:05",
      action: "Return Scan",
      quantity: 2, 
      taskId: "RET456",
      workerId: "W789",
      scannerId: "SC03",
      status: "duplicate",
      isAnomaly: true
    },
    {
      timestamp: "14:00",
      action: "Pick Complete Scan",
      quantity: 8,
      taskId: "PICK101",
      workerId: "W123",
      scannerId: "SC01",
      status: "verified", 
      isAnomaly: false
    }
  ],

  // Duplicate scans detected
  duplicateScans: [
    {
      originalTimestamp: "12:00:15",
      originalQuantity: 2,
      duplicateTimestamp: "12:05:22", 
      duplicateQuantity: 2,
      timeDifference: "5 minutes 7 seconds",
      taskId: "RET456",
      workerId: "W789",
      impact: "medium"
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
      startingInventory: 20,
      totalPicked: 10,
      totalReturned: 2,
      expectedQuantity: 12 // 20 - 10 + 2
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
      name: 'Matching Count',
      enteredCount: 12,
      expectedCount: 12,
      variance: 0,
      varianceType: 'none',
      edgeCase: 'resolved',
      status: 'resolved',
      message: 'Physical count matches expected quantity. Discrepancy resolved.',
      suggestedActions: ['Generate Resolution Report', 'Close Investigation']
    },
    {
      name: 'Higher Count (Mis-entry)',
      enteredCount: 16,
      expectedCount: 12,
      variance: 4,
      varianceType: 'positive',
      edgeCase: 'mis_entry',
      status: 'requires_review',
      message: 'Physical count is higher than expected. Potential scanning mis-entry detected.',
      suggestedActions: ['Generate Discrepancy Report', 'Trigger Supervisor Audit', 'Verify Scan Accuracy']
    },
    {
      name: 'Lower Count (Continue Investigation)',
      enteredCount: 8,
      expectedCount: 12,
      variance: -4,
      varianceType: 'negative',
      edgeCase: 'continue_investigation',
      status: 'needs_investigation',
      message: 'Physical count is lower than expected. Continue investigation required.',
      suggestedActions: ['Generate Discrepancy Report', 'Trigger Supervisor Audit', 'Adjust System Stock']
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