export const TEST_DSL = {
  "id": "crisis-management-app",
  "name": "Enterprise Crisis Management System",
  "props": {
    "className": "min-h-screen bg-gray-900 text-white font-sans",
    "title": "🚨 Enterprise Crisis Management System"
  },
  "states": {
    "selectedRole": "🔒 Security Lead",
    "currentIncident": "breach_2024_03_15",
    "dashboardMode": "active_response"
  },
  "data": {
    "roles": {
      "🔒 Security Lead": {
        "color": "from-red-600 to-red-800",
        "department": "Security",
        "bgColor": "bg-red-900",
        "borderColor": "border-red-500"
      },
      "⚖️ Legal Counsel": {
        "color": "from-blue-600 to-blue-800",
        "department": "Legal",
        "bgColor": "bg-blue-900",
        "borderColor": "border-blue-500"
      },
      "👔 Executive CISO": {
        "color": "from-purple-600 to-purple-800",
        "department": "Executive",
        "bgColor": "bg-purple-900",
        "borderColor": "border-purple-500"
      },
      "📢 Communications": {
        "color": "from-orange-600 to-orange-800",
        "department": "PR",
        "bgColor": "bg-orange-900",
        "borderColor": "border-orange-500"
      },
      "🔧 Engineering": {
        "color": "from-green-600 to-green-800",
        "department": "Engineering",
        "bgColor": "bg-green-900",
        "borderColor": "border-green-500"
      },
      "🔄 Operations": {
        "color": "from-gray-600 to-gray-800",
        "department": "Operations",
        "bgColor": "bg-gray-700",
        "borderColor": "border-gray-500"
      }
    },
    "incidents": {
      "breach_2024_03_15": {
        "id": "breach_2024_03_15",
        "title": "EU Customer Database Compromise",
        "type": "SECURITY_BREACH",
        "severity": "CRITICAL",
        "status": "ACTIVE",
        "affected_systems": "payment-api-v2,eu-prod-customer-db,auth-service",
        "affected_customers": 47832,
        "estimated_impact": 15000000,
        "detection_time": "2024-03-15T14:23:00Z",
        "last_updated": "2024-03-15T16:45:00Z"
      }
    },
    "securityMetrics": {
      "threatLevel": "🔴 CRITICAL",
      "threatLevelDelta": "Escalated",
      "affectedSystems": 3,
      "evidenceCollected": 47,
      "evidenceDelta": "+12 new",
      "containmentStatus": "In Progress",
      "containmentProgress": "65% complete"
    },
    "attackTimeline": [
      {
        "time": "2024-03-15T14:23:00Z",
        "event": "Suspicious login from 185.220.101.45 (TOR exit node)",
        "severity": 2,
        "status": "Detected"
      },
      {
        "time": "2024-03-15T14:33:00Z",
        "event": "SQL injection attempt on /api/payments endpoint",
        "severity": 3,
        "status": "Detected"
      },
      {
        "time": "2024-03-15T14:43:00Z",
        "event": "Privilege escalation - service account compromised",
        "severity": 4,
        "status": "Detected"
      },
      {
        "time": "2024-03-15T14:53:00Z",
        "event": "Lateral movement to database server detected",
        "severity": 4,
        "status": "Detected"
      },
      {
        "time": "2024-03-15T15:03:00Z",
        "event": "Mass query execution - SELECT * operations",
        "severity": 5,
        "status": "Active"
      },
      {
        "time": "2024-03-15T15:13:00Z",
        "event": "Data staging in /tmp/cache_2024_backup.tar",
        "severity": 5,
        "status": "Active"
      }
    ],
    "legalMetrics": {
      "hoursToNotification": 23.5,
      "hoursToNotificationDelta": "-0.5h",
      "euCountriesAffected": 12,
      "notificationsRequired": 47,
      "notificationsDelta": "Individual + Authority"
    },
    "gdprRequirements": {
      "supervisoryAuthority": "Dutch DPA (lead authority)",
      "breachType": "Personal data breach - high risk to data subjects",
      "actionRequired": "Submit Article 33 notification within 23.5 hours"
    },
    "jurisdictions": [
      {
        "jurisdiction": "EU (GDPR)",
        "notificationTime": "72 hours",
        "individualNotice": "Without undue delay",
        "penaltyRisk": "€20M or 4%"
      },
      {
        "jurisdiction": "California (CCPA)",
        "notificationTime": "72 hours",
        "individualNotice": "30 days max",
        "penaltyRisk": "$2,500 per record"
      },
      {
        "jurisdiction": "Canada (PIPEDA)",
        "notificationTime": "ASAP",
        "individualNotice": "ASAP",
        "penaltyRisk": "$100K max"
      },
      {
        "jurisdiction": "UK (UK GDPR)",
        "notificationTime": "72 hours",
        "individualNotice": "Without undue delay",
        "penaltyRisk": "£17M or 4%"
      }
    ],
    "executiveMetrics": {
      "financialImpact": 15000000,
      "affectedCustomers": 47832,
      "stockImpact": "-2.3%",
      "stockImpactDelta": "After-hours trading",
      "mediaMentions": 847,
      "mediaMentionsDelta": "+234 (last hour)"
    },
    "businessImpact": [
      {
        "category": "Revenue Loss",
        "amount": 12000000
      },
      {
        "category": "Recovery Costs",
        "amount": 3500000
      },
      {
        "category": "Regulatory Fines",
        "amount": 8000000
      },
      {
        "category": "Legal Costs",
        "amount": 2500000
      },
      {
        "category": "Reputation",
        "amount": 15000000
      }
    ],
    "communicationsMetrics": {
      "socialMentions": 1247,
      "socialMentionsDelta": "+89% (last hour)",
      "mediaInquiries": 23,
      "mediaInquiriesDelta": "12 pending response",
      "negativeSentiment": 73,
      "customerInquiries": 8934,
      "customerInquiriesDelta": "+456 (last hour)"
    },
    "socialMediaData": [
      {
        "platform": "Twitter",
        "mentions": 687,
        "sentiment": -0.6
      },
      {
        "platform": "LinkedIn",
        "mentions": 234,
        "sentiment": -0.3
      },
      {
        "platform": "Reddit",
        "mentions": 189,
        "sentiment": -0.8
      },
      {
        "platform": "News Sites",
        "mentions": 137,
        "sentiment": -0.5
      }
    ],
    "customerSegments": {
      "enterprise": {
        "name": "Enterprise Tier",
        "count": 1247,
        "approach": "Personal calls from account managers + detailed email",
        "timeline": "Within 2 hours",
        "template": "High-touch, technical details, dedicated support"
      },
      "business": {
        "name": "Business Tier",
        "count": 8934,
        "approach": "Personalized email + FAQ resources",
        "timeline": "Within 4 hours",
        "template": "Professional tone, clear next steps"
      },
      "individual": {
        "name": "Individual Users",
        "count": 487923,
        "approach": "Standard notification email + self-service portal",
        "timeline": "Within 24 hours",
        "template": "Simple language, reassuring tone"
      }
    },
    "engineeringMetrics": {
      "databaseStatus": "COMPROMISED",
      "databaseStatusDelta": "eu-prod-customer-db",
      "connectionPool": "287/500",
      "connectionPoolDelta": "Active connections",
      "queryPerformance": "+340%",
      "queryPerformanceDelta": "Response time increase",
      "lastBackup": "2h 15m ago"
    },
    "recoveryOptions": [
      {
        "id": "option1",
        "name": "Immediate Isolation",
        "action": "Isolate compromised database cluster",
        "downtime": "30 seconds",
        "impact": "100% service disruption",
        "risk": "Prevents further data access"
      },
      {
        "id": "option2",
        "name": "Read-Only Mode",
        "action": "Switch to read-only with backup cluster",
        "downtime": "5 minutes",
        "impact": "Limited functionality",
        "risk": "Potential continued exposure"
      },
      {
        "id": "option3",
        "name": "Point-in-Time Recovery",
        "action": "Restore from backup (2h 15m ago)",
        "downtime": "45 minutes",
        "impact": "Data loss: 2h 15m",
        "risk": "Customer data impact"
      }
    ],
    "operationsMetrics": {
      "businessFunctions": "12/15 Active",
      "businessFunctionsDelta": "3 degraded",
      "staffRedeployment": "47 people",
      "staffRedeploymentDelta": "Emergency protocols",
      "revenueImpact": "$2.1M/hour",
      "revenueImpactDelta": "Current rate",
      "rtoProgress": "65%",
      "rtoProgressDelta": "Recovery time objective"
    },
    "serviceImpact": [
      {
        "businessFunction": "Customer Onboarding",
        "impactLevel": "CRITICAL",
        "alternativeProcess": "Manual review",
        "recoveryPriority": 1
      },
      {
        "businessFunction": "Payment Processing",
        "impactLevel": "CRITICAL",
        "alternativeProcess": "Offline processing",
        "recoveryPriority": 1
      },
      {
        "businessFunction": "User Authentication",
        "impactLevel": "HIGH",
        "alternativeProcess": "Backup auth",
        "recoveryPriority": 2
      },
      {
        "businessFunction": "Data Analytics",
        "impactLevel": "MEDIUM",
        "alternativeProcess": "Historical data",
        "recoveryPriority": 3
      },
      {
        "businessFunction": "Customer Support",
        "impactLevel": "LOW",
        "alternativeProcess": "Phone/email",
        "recoveryPriority": 4
      },
      {
        "businessFunction": "Marketing Campaigns",
        "impactLevel": "LOW",
        "alternativeProcess": "Paused",
        "recoveryPriority": 5
      }
    ]
  },
  "methods": {
    "selectRole": {
      "fn": "function(role) { this.states.selectedRole = role; }",
      "params": {
        "role": "string"
      }
    },
    "generateGDPRNotification": {
      "fn": "function() { alert('✅ GDPR notification template generated with incident details'); }",
      "params": {}
    },
    "generateIndividualNotification": {
      "fn": "function() { alert('✅ Data subject notification template ready'); }",
      "params": {}
    }
  },
  "render": {
    "id": "app-container",
    "type": "div",
    "props": {
      "className": "min-h-screen bg-gray-900 text-white"
    },
    "children": [
      {
        "id": "app-header",
        "type": "header",
        "props": {
          "className": "bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 py-8 shadow-2xl"
        },
        "children": {
          "id": "header-title",
          "type": "h1",
          "props": {
            "className": "text-5xl font-bold text-center text-white drop-shadow-lg"
          },
          "children": "🚨 Enterprise Crisis Management System"
        }
      },
      {
        "id": "app-description",
        "type": "div",
        "props": {
          "className": "bg-gray-800 border-b border-gray-700 py-6 px-4"
        },
        "children": [
          {
            "id": "description-title",
            "type": "h3",
            "props": {
              "className": "text-2xl font-semibold text-blue-400 mb-3 text-center"
            },
            "children": "🎯 Generative UI Demo: Role-Based Crisis Response"
          },
          {
            "id": "description-text",
            "type": "p",
            "props": {
              "className": "text-gray-300 text-lg text-center max-w-4xl mx-auto"
            },
            "children": "Each role sees completely different interfaces for the same crisis scenarios. 18 Enterprise Scenarios • 6 Stakeholder Perspectives • Real-time Adaptation"
          }
        ]
      },
      {
        "id": "app-layout",
        "type": "div",
        "props": {
          "className": "flex min-h-screen"
        },
        "children": [
          {
            "id": "sidebar",
            "type": "aside",
            "props": {
              "className": "w-80 bg-gray-800 border-r border-gray-700 p-6 overflow-y-auto"
            },
            "children": [
              {
                "id": "role-selector-section",
                "type": "div",
                "children": [
                  {
                    "id": "role-selector-title",
                    "type": "h2",
                    "props": {
                      "className": "text-xl font-bold text-white mb-2 flex items-center"
                    },
                    "children": "👥 Crisis Response Roles"
                  },
                  {
                    "id": "role-selector-subtitle",
                    "type": "p",
                    "props": {
                      "className": "text-gray-400 text-sm mb-6 italic"
                    },
                    "children": "Select your role to see adaptive interface"
                  },
                  {
                    "id": "role-select",
                    "type": "select",
                    "props": {
                      "className": "w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 mb-6 text-lg font-medium",
                      "value": {
                        "$bind": "selectedRole"
                      },
                      "onChange": {
                        "$exp": "selectRole"
                      },
                      "options": {
                        "$bind": "roles",
                        "$transform": [
                          {
                            "name": "objectKeys"
                          }
                        ]
                      }
                    }
                  },
                  {
                    "id": "selected-role-display",
                    "type": "div",
                    "props": {
                      "className": {
                        "$exp": "'p-4 rounded-lg bg-gradient-to-r ' + roles[selectedRole].color + ' text-white font-bold text-center text-lg shadow-lg border-l-4 ' + roles[selectedRole].borderColor"
                      }
                    },
                    "children": {
                      "$bind": "selectedRole"
                    }
                  },
                  {
                    "id": "role-info-box",
                    "type": "div",
                    "props": {
                      "className": "mt-6 p-4 bg-gray-700 rounded-lg border border-gray-600"
                    },
                    "children": [
                      {
                        "id": "role-info-title",
                        "type": "h3",
                        "props": {
                          "className": "text-lg font-semibold text-white mb-2"
                        },
                        "children": "Role Context"
                      },
                      {
                        "id": "role-department",
                        "type": "p",
                        "props": {
                          "className": "text-gray-300 text-sm"
                        },
                        "children": {
                          "$exp": "'Department: ' + roles[selectedRole].department"
                        }
                      },
                      {
                        "id": "role-description",
                        "type": "p",
                        "props": {
                          "className": "text-gray-300 text-sm mt-2"
                        },
                        "children": "Specialized dashboard for crisis response coordination"
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "id": "main-content",
            "type": "main",
            "props": {
              "className": "flex-1 bg-gray-900 overflow-y-auto"
            },
            "children": [
              {
                "id": "status-bar",
                "type": "div",
                "props": {
                  "className": "bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center"
                },
                "children": [
                  {
                    "id": "active-role-display",
                    "type": "span",
                    "props": {
                      "className": "text-white font-semibold"
                    },
                    "children": {
                      "$exp": "'Active Role: ' + selectedRole"
                    }
                  },
                  {
                    "id": "system-status",
                    "type": "span",
                    "props": {
                      "className": "flex items-center space-x-2 text-green-400 font-medium"
                    },
                    "children": "🟢 System Operational"
                  },
                  {
                    "id": "current-time",
                    "type": "span",
                    "props": {
                      "className": "text-gray-400 font-mono text-sm"
                    },
                    "children": {
                      "$exp": "new Date().toLocaleTimeString() + ' UTC'"
                    }
                  }
                ]
              },
              {
                "id": "security-dashboard",
                "type": "div",
                "if": {
                  "$exp": "roles[selectedRole].department === 'Security'"
                },
                "props": {
                  "className": "p-6"
                },
                "children": [
                  {
                    "id": "security-header",
                    "type": "div",
                    "props": {
                      "className": "bg-gradient-to-r from-red-600 to-red-800 p-6 rounded-lg mb-6 shadow-xl border-l-4 border-red-400"
                    },
                    "children": {
                      "id": "security-header-title",
                      "type": "h1",
                      "props": {
                        "className": "text-2xl font-bold text-white"
                      },
                      "children": "🔒 Security Operations Center - ACTIVE INCIDENT RESPONSE"
                    }
                  },
                  {
                    "id": "critical-alert",
                    "type": "div",
                    "props": {
                      "className": "bg-red-900 border border-red-600 rounded-lg p-6 mb-6 shadow-xl"
                    },
                    "children": [
                      {
                        "id": "alert-title",
                        "type": "h4",
                        "props": {
                          "className": "text-xl font-bold text-red-200 mb-3 flex items-center"
                        },
                        "children": "⚠️ CRITICAL: Active Security Breach Detected"
                      },
                      {
                        "id": "alert-context",
                        "type": "p",
                        "props": {
                          "className": "text-red-100 mb-3"
                        },
                        "children": [
                          {
                            "id": "context-text",
                            "type": "strong",
                            "props": {
                              "className": "text-red-200"
                            },
                            "children": "Context:"
                          },
                          " This is our 3rd major incident this quarter. Previous breaches:"
                        ]
                      },
                      {
                        "id": "breach-history",
                        "type": "ul",
                        "props": {
                          "className": "list-disc list-inside text-red-100 space-y-1"
                        },
                        "children": [
                          {
                            "id": "breach-1",
                            "type": "li",
                            "children": "March 5: Ransomware attack (contained, $1.2M impact)"
                          },
                          {
                            "id": "breach-2",
                            "type": "li",
                            "children": "March 12: DDoS attack (mitigated, 4hr downtime)"
                          },
                          {
                            "id": "breach-3",
                            "type": "li",
                            "props": {
                              "className": "font-semibold text-red-200"
                            },
                            "children": "March 15 (CURRENT): Sophisticated data exfiltration attempt targeting EU customer database"
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "id": "current-breach-section",
                    "type": "div",
                    "children": [
                      {
                        "id": "breach-title",
                        "type": "h3",
                        "props": {
                          "className": "text-2xl font-bold text-white mb-6 flex items-center"
                        },
                        "children": "🎯 CURRENT BREACH: EU Customer Database Compromise"
                      },
                      {
                        "id": "security-metrics-grid",
                        "type": "div",
                        "props": {
                          "className": "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                        },
                        "children": [
                          {
                            "id": "threat-level-metric",
                            "type": "div",
                            "props": {
                              "className": "bg-gray-800 border border-red-500 rounded-lg p-6 shadow-lg"
                            },
                            "children": [
                              {
                                "id": "threat-level-label",
                                "type": "div",
                                "props": {
                                  "className": "text-gray-400 text-sm font-medium mb-2"
                                },
                                "children": "Threat Level"
                              },
                              {
                                "id": "threat-level-value",
                                "type": "div",
                                "props": {
                                  "className": "text-red-400 text-2xl font-bold mb-1"
                                },
                                "children": {
                                  "$bind": "securityMetrics.threatLevel"
                                }
                              },
                              {
                                "id": "threat-level-delta",
                                "type": "div",
                                "props": {
                                  "className": "text-red-300 text-sm"
                                },
                                "children": {
                                  "$bind": "securityMetrics.threatLevelDelta"
                                }
                              }
                            ]
                          },
                          {
                            "id": "affected-systems-metric",
                            "type": "div",
                            "props": {
                              "className": "bg-gray-800 border border-orange-500 rounded-lg p-6 shadow-lg"
                            },
                            "children": [
                              {
                                "id": "affected-systems-label",
                                "type": "div",
                                "props": {
                                  "className": "text-gray-400 text-sm font-medium mb-2"
                                },
                                "children": "Affected Systems"
                              },
                              {
                                "id": "affected-systems-value",
                                "type": "div",
                                "props": {
                                  "className": "text-orange-400 text-2xl font-bold"
                                },
                                "children": {
                                  "$bind": "securityMetrics.affectedSystems"
                                }
                              }
                            ]
                          },
                          {
                            "id": "evidence-collected-metric",
                            "type": "div",
                            "props": {
                              "className": "bg-gray-800 border border-blue-500 rounded-lg p-6 shadow-lg"
                            },
                            "children": [
                              {
                                "id": "evidence-collected-label",
                                "type": "div",
                                "props": {
                                  "className": "text-gray-400 text-sm font-medium mb-2"
                                },
                                "children": "Evidence Collected"
                              },
                              {
                                "id": "evidence-collected-value",
                                "type": "div",
                                "props": {
                                  "className": "text-blue-400 text-2xl font-bold mb-1"
                                },
                                "children": {
                                  "$bind": "securityMetrics.evidenceCollected"
                                }
                              },
                              {
                                "id": "evidence-collected-delta",
                                "type": "div",
                                "props": {
                                  "className": "text-blue-300 text-sm"
                                },
                                "children": {
                                  "$bind": "securityMetrics.evidenceDelta"
                                }
                              }
                            ]
                          },
                          {
                            "id": "containment-status-metric",
                            "type": "div",
                            "props": {
                              "className": "bg-gray-800 border border-green-500 rounded-lg p-6 shadow-lg"
                            },
                            "children": [
                              {
                                "id": "containment-status-label",
                                "type": "div",
                                "props": {
                                  "className": "text-gray-400 text-sm font-medium mb-2"
                                },
                                "children": "Containment Status"
                              },
                              {
                                "id": "containment-status-value",
                                "type": "div",
                                "props": {
                                  "className": "text-green-400 text-2xl font-bold mb-1"
                                },
                                "children": {
                                  "$bind": "securityMetrics.containmentStatus"
                                }
                              },
                              {
                                "id": "containment-status-delta",
                                "type": "div",
                                "props": {
                                  "className": "text-green-300 text-sm"
                                },
                                "children": {
                                  "$bind": "securityMetrics.containmentProgress"
                                }
                              }
                            ]
                          }
                        ]
                      },
                      {
                        "id": "threat-intelligence",
                        "type": "div",
                        "props": {
                          "className": "bg-red-900 border border-red-600 rounded-lg p-6 mb-8 shadow-xl"
                        },
                        "children": [
                          {
                            "id": "threat-intelligence-header",
                            "type": "h4",
                            "props": {
                              "className": "text-xl font-bold text-red-200 mb-4"
                            },
                            "children": "🚨 Live Threat Intelligence"
                          },
                          {
                            "id": "threat-title",
                            "type": "h4",
                            "props": {
                              "className": "text-lg font-bold text-red-100 mb-3"
                            },
                            "children": {
                              "$exp": "'ACTIVE: ' + incidents[currentIncident].title"
                            }
                          },
                          {
                            "id": "threat-description",
                            "type": "p",
                            "props": {
                              "className": "text-red-100 mb-3"
                            },
                            "children": "Attackers exploited unpatched CVE-2024-21413 in our payment API, gained database access, and are attempting to exfiltrate 47,832 EU customer records including PII and payment data."
                          },
                          {
                            "id": "attack-chain",
                            "type": "p",
                            "props": {
                              "className": "text-red-100"
                            },
                            "children": [
                              {
                                "id": "attack-chain-label",
                                "type": "strong",
                                "props": {
                                  "className": "text-red-200"
                                },
                                "children": "Attack Chain:"
                              },
                              " Payment API vulnerability → SQL Injection → Credential theft → Lateral movement to database → Active exfiltration"
                            ]
                          }
                        ]
                      },
                      {
                        "id": "attack-timeline-section",
                        "type": "div",
                        "props": {
                          "className": "bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg"
                        },
                        "children": [
                          {
                            "id": "timeline-title",
                            "type": "h4",
                            "props": {
                              "className": "text-xl font-bold text-white mb-4 flex items-center"
                            },
                            "children": "🔍 Real-Time Attack Timeline"
                          },
                          {
                            "id": "timeline-chart",
                            "type": "div",
                            "props": {
                              "className": "space-y-3"
                            },
                            "for": {
                              "in": {
                                "$bind": "attackTimeline"
                              },
                              "as": "event",
                              "key": "event.time"
                            },
                            "children": {
                              "id": "timeline-event",
                              "type": "div",
                              "props": {
                                "className": {
                                  "$exp": "'flex items-start space-x-4 p-3 rounded-lg ' + (event.status === 'Active' ? 'bg-red-900 border border-red-600' : 'bg-gray-700 border border-gray-600')"
                                }
                              },
                              "children": [
                                {
                                  "id": "event-severity",
                                  "type": "div",
                                  "props": {
                                    "className": {
                                      "$exp": "'w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ' + (event.severity >= 4 ? 'bg-red-500' : event.severity >= 3 ? 'bg-orange-500' : 'bg-yellow-500')"
                                    }
                                  },
                                  "children": {
                                    "$bind": "event.severity"
                                  }
                                },
                                {
                                  "id": "event-details",
                                  "type": "div",
                                  "props": {
                                    "className": "flex-1"
                                  },
                                  "children": [
                                    {
                                      "id": "event-time",
                                      "type": "div",
                                      "props": {
                                        "className": "text-gray-400 text-sm font-mono"
                                      },
                                      "children": {
                                        "$exp": "new Date(event.time).toLocaleTimeString()"
                                      }
                                    },
                                    {
                                      "id": "event-description",
                                      "type": "div",
                                      "props": {
                                        "className": "text-white font-medium"
                                      },
                                      "children": {
                                        "$bind": "event.event"
                                      }
                                    },
                                    {
                                      "id": "event-status",
                                      "type": "div",
                                      "props": {
                                        "className": {
                                          "$exp": "'inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ' + (event.status === 'Active' ? 'bg-red-600 text-red-100' : 'bg-gray-600 text-gray-200')"
                                        }
                                      },
                                      "children": {
                                        "$bind": "event.status"
                                      }
                                    }
                                  ]
                                }
                              ]
                            }
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                "id": "legal-dashboard",
                "type": "div",
                "if": {
                  "$exp": "roles[selectedRole].department === 'Legal'"
                },
                "props": {
                  "className": "p-6"
                },
                "children": [
                  {
                    "id": "legal-header",
                    "type": "div",
                    "props": {
                      "className": "bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-lg mb-6 shadow-xl border-l-4 border-blue-400"
                    },
                    "children": {
                      "id": "legal-header-title",
                      "type": "h1",
                      "props": {
                        "className": "text-2xl font-bold text-white"
                      },
                      "children": "⚖️ Legal & Compliance Center - Jennifer Walsh (Privacy Counsel)"
                    }
                  },
                  {
                    "id": "gdpr-section",
                    "type": "div",
                    "children": [
                      {
                        "id": "gdpr-title",
                        "type": "h3",
                        "props": {
                          "className": "text-2xl font-bold text-white mb-6 flex items-center"
                        },
                        "children": "📋 GDPR Breach Notification Interface"
                      },
                      {
                        "id": "legal-metrics-grid",
                        "type": "div",
                        "props": {
                          "className": "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                        },
                        "children": [
                          {
                            "id": "hours-to-notification-metric",
                            "type": "div",
                            "props": {
                              "className": "bg-gray-800 border border-red-500 rounded-lg p-6 shadow-lg"
                            },
                            "children": [
                              {
                                "id": "hours-notification-label",
                                "type": "div",
                                "props": {
                                  "className": "text-gray-400 text-sm font-medium mb-2"
                                },
                                "children": "⏰ Hours to Notification"
                              },
                              {
                                "id": "hours-notification-value",
                                "type": "div",
                                "props": {
                                  "className": "text-red-400 text-3xl font-bold mb-1"
                                },
                                "children": {
                                  "$bind": "legalMetrics.hoursToNotification"
                                }
                              },
                              {
                                "id": "hours-notification-delta",
                                "type": "div",
                                "props": {
                                  "className": "text-green-300 text-sm"
                                },
                                "children": {
                                  "$bind": "legalMetrics.hoursToNotificationDelta"
                                }
                              }
                            ]
                          },
                          {
                            "id": "eu-countries-metric",
                            "type": "div",
                            "props": {
                              "className": "bg-gray-800 border border-blue-500 rounded-lg p-6 shadow-lg"
                            },
                            "children": [
                              {
                                "id": "eu-countries-label",
                                "type": "div",
                                "props": {
                                  "className": "text-gray-400 text-sm font-medium mb-2"
                                },
                                "children": "🌍 EU Countries Affected"
                              },
                              {
                                "id": "eu-countries-value",
                                "type": "div",
                                "props": {
                                  "className": "text-blue-400 text-3xl font-bold mb-1"
                                },
                                "children": {
                                  "$bind": "legalMetrics.euCountriesAffected"
                                }
                              },
                              {
                                "id": "eu-countries-help",
                                "type": "div",
                                "props": {
                                  "className": "text-gray-400 text-xs"
                                },
                                "children": "Data subjects across EU member states"
                              }
                            ]
                          },
                          {
                            "id": "notifications-required-metric",
                            "type": "div",
                            "props": {
                              "className": "bg-gray-800 border border-purple-500 rounded-lg p-6 shadow-lg"
                            },
                            "children": [
                              {
                                "id": "notifications-required-label",
                                "type": "div",
                                "props": {
                                  "className": "text-gray-400 text-sm font-medium mb-2"
                                },
                                "children": "📄 Notifications Required"
                              },
                              {
                                "id": "notifications-required-value",
                                "type": "div",
                                "props": {
                                  "className": "text-purple-400 text-3xl font-bold mb-1"
                                },
                                "children": {
                                  "$bind": "legalMetrics.notificationsRequired"
                                }
                              },
                              {
                                "id": "notifications-required-delta",
                                "type": "div",
                                "props": {
                                  "className": "text-purple-300 text-sm"
                                },
                                "children": {
                                  "$bind": "legalMetrics.notificationsDelta"
                                }
                              }
                            ]
                          }
                        ]
                      },
                      {
                        "id": "gdpr-deadline-alert",
                        "type": "div",
                        "props": {
                          "className": "bg-red-900 border border-red-600 rounded-lg p-6 mb-8 shadow-xl"
                        },
                        "children": [
                          {
                            "id": "gdpr-alert-title",
                            "type": "h4",
                            "props": {
                              "className": "text-xl font-bold text-red-200 mb-4 flex items-center"
                            },
                            "children": "🚨 GDPR 72-Hour Deadline Active"
                          },
                          {
                            "id": "supervisory-authority",
                            "type": "p",
                            "props": {
                              "className": "text-red-100 mb-2"
                            },
                            "children": [
                              {
                                "id": "authority-label",
                                "type": "strong",
                                "props": {
                                  "className": "text-red-200"
                                },
                                "children": "Supervisory Authority:"
                              },
                              {
                                "$exp": "' ' + gdprRequirements.supervisoryAuthority"
                              }
                            ]
                          },
                          {
                            "id": "breach-type",
                            "type": "p",
                            "props": {
                              "className": "text-red-100 mb-2"
                            },
                            "children": [
                              {
                                "id": "breach-type-label",
                                "type": "strong",
                                "props": {
                                  "className": "text-red-200"
                                },
                                "children": "Breach Type:"
                              },
                              {
                                "$exp": "' ' + gdprRequirements.breachType"
                              }
                            ]
                          },
                          {
                            "id": "action-required",
                            "type": "p",
                            "props": {
                              "className": "text-red-100"
                            },
                            "children": [
                              {
                                "id": "action-required-label",
                                "type": "strong",
                                "props": {
                                  "className": "text-red-200"
                                },
                                "children": "Action Required:"
                              },
                              {
                                "$exp": "' ' + gdprRequirements.actionRequired"
                              }
                            ]
                          }
                        ]
                      },
                      {
                        "id": "gdpr-actions",
                        "type": "div",
                        "props": {
                          "className": "grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
                        },
                        "children": [
                          {
                            "id": "gdpr-templates",
                            "type": "div",
                            "props": {
                              "className": "bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg"
                            },
                            "children": [
                              {
                                "id": "templates-title",
                                "type": "h4",
                                "props": {
                                  "className": "text-lg font-bold text-white mb-4 flex items-center"
                                },
                                "children": "📝 Pre-filled GDPR Templates"
                              },
                              {
                                "id": "article-33-btn",
                                "type": "button",
                                "props": {
                                  "className": "w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 mb-3 shadow-lg",
                                  "onClick": {
                                    "$exp": "generateGDPRNotification"
                                  }
                                },
                                "children": "Generate Article 33 Notification"
                              },
                              {
                                "id": "individual-notification-btn",
                                "type": "button",
                                "props": {
                                  "className": "w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg",
                                  "onClick": {
                                    "$exp": "generateIndividualNotification"
                                  }
                                },
                                "children": "Generate Individual Notification"
                              }
                            ]
                          },
                          {
                            "id": "risk-assessment",
                            "type": "div",
                            "props": {
                              "className": "bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg"
                            },
                            "children": [
                              {
                                "id": "risk-title",
                                "type": "h4",
                                "props": {
                                  "className": "text-lg font-bold text-white mb-4 flex items-center"
                                },
                                "children": "⚖️ Risk Assessment"
                              },
                              {
                                "id": "risk-factors",
                                "type": "div",
                                "props": {
                                  "className": "space-y-3"
                                },
                                "children": [
                                  {
                                    "id": "data-sensitivity",
                                    "type": "div",
                                    "props": {
                                      "className": "flex justify-between items-center"
                                    },
                                    "children": [
                                      {
                                        "id": "sensitivity-label",
                                        "type": "span",
                                        "props": {
                                          "className": "text-gray-300"
                                        },
                                        "children": "Data Sensitivity"
                                      },
                                      {
                                        "id": "sensitivity-score",
                                        "type": "span",
                                        "props": {
                                          "className": "text-red-400 font-bold"
                                        },
                                        "children": "9/10"
                                      }
                                    ]
                                  },
                                  {
                                    "id": "subjects-count",
                                    "type": "div",
                                    "props": {
                                      "className": "flex justify-between items-center"
                                    },
                                    "children": [
                                      {
                                        "id": "subjects-label",
                                        "type": "span",
                                        "props": {
                                          "className": "text-gray-300"
                                        },
                                        "children": "Number of Subjects"
                                      },
                                      {
                                        "id": "subjects-score",
                                        "type": "span",
                                        "props": {
                                          "className": "text-orange-400 font-bold"
                                        },
                                        "children": "8/10"
                                      }
                                    ]
                                  },
                                  {
                                    "id": "harm-likelihood",
                                    "type": "div",
                                    "props": {
                                      "className": "flex justify-between items-center"
                                    },
                                    "children": [
                                      {
                                        "id": "harm-label",
                                        "type": "span",
                                        "props": {
                                          "className": "text-gray-300"
                                        },
                                        "children": "Likelihood of Harm"
                                      },
                                      {
                                        "id": "harm-score",
                                        "type": "span",
                                        "props": {
                                          "className": "text-yellow-400 font-bold"
                                        },
                                        "children": "7/10"
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
                        "id": "jurisdictions-section",
                        "type": "div",
                        "props": {
                          "className": "bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg"
                        },
                        "children": [
                          {
                            "id": "jurisdictions-title",
                            "type": "h3",
                            "props": {
                              "className": "text-xl font-bold text-white mb-4 flex items-center"
                            },
                            "children": "🌐 Multi-Jurisdictional Regulatory Conflicts"
                          },
                          {
                            "id": "jurisdictions-subtitle",
                            "type": "h4",
                            "props": {
                              "className": "text-lg font-semibold text-gray-300 mb-4"
                            },
                            "children": "📊 Regulatory Requirement Matrix"
                          },
                          {
                            "id": "jurisdictions-table",
                            "type": "div",
                            "props": {
                              "className": "overflow-x-auto"
                            },
                            "children": {
                              "id": "jurisdictions-table-container",
                              "type": "table",
                              "props": {
                                "className": "w-full text-left border-collapse"
                              },
                              "children": [
                                {
                                  "id": "table-header",
                                  "type": "thead",
                                  "children": {
                                    "id": "header-row",
                                    "type": "tr",
                                    "props": {
                                      "className": "border-b border-gray-600"
                                    },
                                    "children": [
                                      {
                                        "id": "jurisdiction-header",
                                        "type": "th",
                                        "props": {
                                          "className": "text-gray-300 font-medium py-3 px-4"
                                        },
                                        "children": "Jurisdiction"
                                      },
                                      {
                                        "id": "notification-time-header",
                                        "type": "th",
                                        "props": {
                                          "className": "text-gray-300 font-medium py-3 px-4"
                                        },
                                        "children": "Notification Time"
                                      },
                                      {
                                        "id": "individual-notice-header",
                                        "type": "th",
                                        "props": {
                                          "className": "text-gray-300 font-medium py-3 px-4"
                                        },
                                        "children": "Individual Notice"
                                      },
                                      {
                                        "id": "penalty-risk-header",
                                        "type": "th",
                                        "props": {
                                          "className": "text-gray-300 font-medium py-3 px-4"
                                        },
                                        "children": "Penalty Risk"
                                      }
                                    ]
                                  }
                                },
                                {
                                  "id": "table-body",
                                  "type": "tbody",
                                  "for": {
                                    "in": {
                                      "$bind": "jurisdictions"
                                    },
                                    "as": "jurisdiction",
                                    "key": "jurisdiction.jurisdiction"
                                  },
                                  "children": {
                                    "id": "jurisdiction-row",
                                    "type": "tr",
                                    "props": {
                                      "className": "border-b border-gray-700 hover:bg-gray-700 transition-colors"
                                    },
                                    "children": [
                                      {
                                        "id": "jurisdiction-name",
                                        "type": "td",
                                        "props": {
                                          "className": "text-white font-medium py-3 px-4"
                                        },
                                        "children": {
                                          "$bind": "jurisdiction.jurisdiction"
                                        }
                                      },
                                      {
                                        "id": "notification-time",
                                        "type": "td",
                                        "props": {
                                          "className": "text-gray-300 py-3 px-4"
                                        },
                                        "children": {
                                          "$bind": "jurisdiction.notificationTime"
                                        }
                                      },
                                      {
                                        "id": "individual-notice",
                                        "type": "td",
                                        "props": {
                                          "className": "text-gray-300 py-3 px-4"
                                        },
                                        "children": {
                                          "$bind": "jurisdiction.individualNotice"
                                        }
                                      },
                                      {
                                        "id": "penalty-risk",
                                        "type": "td",
                                        "props": {
                                          "className": "text-red-400 font-medium py-3 px-4"
                                        },
                                        "children": {
                                          "$bind": "jurisdiction.penaltyRisk"
                                        }
                                      }
                                    ]
                                  }
                                }
                              ]
                            }
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                "id": "executive-dashboard",
                "type": "div",
                "if": {
                  "$exp": "roles[selectedRole].department === 'Executive'"
                },
                "props": {
                  "className": "p-6"
                },
                "children": [
                  {
                    "id": "executive-header",
                    "type": "div",
                    "props": {
                      "className": "bg-gradient-to-r from-purple-600 to-purple-800 p-6 rounded-lg mb-6 shadow-xl border-l-4 border-purple-400"
                    },
                    "children": {
                      "id": "executive-header-title",
                      "type": "h1",
                      "props": {
                        "className": "text-2xl font-bold text-white"
                      },
                      "children": "👔 Executive Command Center - David Kim (CISO)"
                    }
                  },
                  {
                    "id": "executive-dashboard-section",
                    "type": "div",
                    "children": [
                      {
                        "id": "executive-dashboard-title",
                        "type": "h3",
                        "props": {
                          "className": "text-2xl font-bold text-white mb-6 flex items-center"
                        },
                        "children": "📊 C-Level Crisis Dashboard"
                      },
                      {
                        "id": "executive-metrics-grid",
                        "type": "div",
                        "props": {
                          "className": "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                        },
                        "children": [
                          {
                            "id": "financial-impact-metric",
                            "type": "div",
                            "props": {
                              "className": "bg-gray-800 border border-red-500 rounded-lg p-6 shadow-lg"
                            },
                            "children": [
                              {
                                "id": "financial-impact-label",
                                "type": "div",
                                "props": {
                                  "className": "text-gray-400 text-sm font-medium mb-2"
                                },
                                "children": "💰 Financial Impact"
                              },
                              {
                                "id": "financial-impact-value",
                                "type": "div",
                                "props": {
                                  "className": "text-red-400 text-2xl font-bold mb-1"
                                },
                                "children": {
                                  "$exp": "'$' + (executiveMetrics.financialImpact / 1000000).toFixed(1) + 'M'"
                                }
                              },
                              {
                                "id": "financial-impact-help",
                                "type": "div",
                                "props": {
                                  "className": "text-gray-400 text-xs"
                                },
                                "children": "30-day estimated business impact"
                              }
                            ]
                          },
                          {
                            "id": "affected-customers-metric",
                            "type": "div",
                            "props": {
                              "className": "bg-gray-800 border border-orange-500 rounded-lg p-6 shadow-lg"
                            },
                            "children": [
                              {
                                "id": "affected-customers-label",
                                "type": "div",
                                "props": {
                                  "className": "text-gray-400 text-sm font-medium mb-2"
                                },
                                "children": "👥 Affected Customers"
                              },
                              {
                                "id": "affected-customers-value",
                                "type": "div",
                                "props": {
                                  "className": "text-orange-400 text-2xl font-bold"
                                },
                                "children": {
                                  "$bind": "executiveMetrics.affectedCustomers"
                                }
                              }
                            ]
                          },
                          {
                            "id": "stock-impact-metric",
                            "type": "div",
                            "props": {
                              "className": "bg-gray-800 border border-blue-500 rounded-lg p-6 shadow-lg"
                            },
                            "children": [
                              {
                                "id": "stock-impact-label",
                                "type": "div",
                                "props": {
                                  "className": "text-gray-400 text-sm font-medium mb-2"
                                },
                                "children": "📈 Stock Impact"
                              },
                              {
                                "id": "stock-impact-value",
                                "type": "div",
                                "props": {
                                  "className": "text-blue-400 text-2xl font-bold mb-1"
                                },
                                "children": {
                                  "$bind": "executiveMetrics.stockImpact"
                                }
                              },
                              {
                                "id": "stock-impact-delta",
                                "type": "div",
                                "props": {
                                  "className": "text-blue-300 text-sm"
                                },
                                "children": {
                                  "$bind": "executiveMetrics.stockImpactDelta"
                                }
                              }
                            ]
                          },
                          {
                            "id": "media-mentions-metric",
                            "type": "div",
                            "props": {
                              "className": "bg-gray-800 border border-purple-500 rounded-lg p-6 shadow-lg"
                            },
                            "children": [
                              {
                                "id": "media-mentions-label",
                                "type": "div",
                                "props": {
                                  "className": "text-gray-400 text-sm font-medium mb-2"
                                },
                                "children": "📰 Media Mentions"
                              },
                              {
                                "id": "media-mentions-value",
                                "type": "div",
                                "props": {
                                  "className": "text-purple-400 text-2xl font-bold mb-1"
                                },
                                "children": {
                                  "$bind": "executiveMetrics.mediaMentions"
                                }
                              },
                              {
                                "id": "media-mentions-delta",
                                "type": "div",
                                "props": {
                                  "className": "text-purple-300 text-sm"
                                },
                                "children": {
                                  "$bind": "executiveMetrics.mediaMentionsDelta"
                                }
                              }
                            ]
                          }
                        ]
                      },
                      {
                        "id": "business-impact-chart-section",
                        "type": "div",
                        "props": {
                          "className": "bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg mb-8"
                        },
                        "children": [
                          {
                            "id": "chart-title",
                            "type": "h4",
                            "props": {
                              "className": "text-xl font-bold text-white mb-4"
                            },
                            "children": "💰 Business Impact Breakdown ($41M Total)"
                          },
                          {
                            "id": "business-impact-chart",
                            "type": "div",
                            "props": {
                              "className": "grid grid-cols-1 md:grid-cols-5 gap-4"
                            },
                            "for": {
                              "in": {
                                "$bind": "businessImpact"
                              },
                              "as": "impact",
                              "key": "impact.category"
                            },
                            "children": {
                              "id": "impact-item",
                              "type": "div",
                              "props": {
                                "className": "bg-gray-700 border border-gray-600 rounded-lg p-4 text-center"
                              },
                              "children": [
                                {
                                  "id": "impact-category",
                                  "type": "div",
                                  "props": {
                                    "className": "text-gray-300 text-sm font-medium mb-2"
                                  },
                                  "children": {
                                    "$bind": "impact.category"
                                  }
                                },
                                {
                                  "id": "impact-amount",
                                  "type": "div",
                                  "props": {
                                    "className": "text-white text-lg font-bold"
                                  },
                                  "children": {
                                    "$exp": "'$' + (impact.amount / 1000000).toFixed(1) + 'M'"
                                  }
                                }
                              ]
                            }
                          }
                        ]
                      },
                      {
                        "id": "decision-points",
                        "type": "div",
                        "props": {
                          "className": "bg-red-900 border border-red-600 rounded-lg p-6 shadow-xl"
                        },
                        "children": [
                          {
                            "id": "decision-title",
                            "type": "h4",
                            "props": {
                              "className": "text-xl font-bold text-red-200 mb-4 flex items-center"
                            },
                            "children": "🚨 Immediate Decisions Required"
                          },
                          {
                            "id": "decision-list",
                            "type": "ul",
                            "props": {
                              "className": "list-disc list-inside text-red-100 space-y-2"
                            },
                            "children": [
                              {
                                "id": "decision-1",
                                "type": "li",
                                "children": [
                                  {
                                    "id": "decision-1-label",
                                    "type": "strong",
                                    "props": {
                                      "className": "text-red-200"
                                    },
                                    "children": "Public Disclosure:"
                                  },
                                  " Issue statement within 2 hours"
                                ]
                              },
                              {
                                "id": "decision-2",
                                "type": "li",
                                "children": [
                                  {
                                    "id": "decision-2-label",
                                    "type": "strong",
                                    "props": {
                                      "className": "text-red-200"
                                    },
                                    "children": "Law Enforcement:"
                                  },
                                  " Engage FBI Cyber Division?"
                                ]
                              },
                              {
                                "id": "decision-3",
                                "type": "li",
                                "children": [
                                  {
                                    "id": "decision-3-label",
                                    "type": "strong",
                                    "props": {
                                      "className": "text-red-200"
                                    },
                                    "children": "Board Notification:"
                                  },
                                  " Emergency session recommended"
                                ]
                              },
                              {
                                "id": "decision-4",
                                "type": "li",
                                "children": [
                                  {
                                    "id": "decision-4-label",
                                    "type": "strong",
                                    "props": {
                                      "className": "text-red-200"
                                    },
                                    "children": "Customer Communication:"
                                  },
                                  " Direct outreach to enterprise clients"
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
          }
        ]
      },
      {
        "id": "app-footer",
        "type": "footer",
        "props": {
          "className": "bg-gray-800 border-t border-gray-700 py-8 px-6 text-center"
        },
        "children": [
          {
            "id": "footer-title",
            "type": "div",
            "props": {
              "className": "text-blue-400 text-xl font-bold mb-2"
            },
            "children": "🚀 Powered by Generative UI Technology"
          },
          {
            "id": "footer-description",
            "type": "p",
            "props": {
              "className": "text-gray-300 text-lg mb-2"
            },
            "children": "Enterprise Crisis Response System v2.0 • Demonstrating Adaptive Role-Based Interfaces"
          },
          {
            "id": "footer-tagline",
            "type": "p",
            "props": {
              "className": "text-gray-400 text-sm italic"
            },
            "children": "Same crisis data → Different interfaces based on stakeholder role and context"
          }
        ]
      }
    ]
  }
}