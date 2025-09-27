export const complex_layout_dsl = {
  id: 'dashboard-app',
  name: 'Dashboard with Sidebar and Forms',
  render: {
    id: 'app-container',
    type: 'div',
    props: {
      className: 'flex min-h-screen bg-gray-50'
    },
    children: [
      // Sidebar Navigation
      {
        id: 'sidebar',
        type: 'aside',
        props: {
          className: 'w-64 bg-white shadow-lg border-r border-gray-200'
        },
        children: [
          // Sidebar Header
          {
            id: 'sidebar-header',
            type: 'div',
            props: {
              className: 'p-6 border-b border-gray-200'
            },
            children: [
              {
                id: 'logo',
                type: 'h1',
                props: {
                  className: 'text-xl font-bold text-gray-800'
                },
                children: '🚀 Dashboard'
              },
              {
                id: 'user-info',
                type: 'div',
                props: {
                  className: 'mt-2'
                },
                children: [
                  {
                    id: 'user-name',
                    type: 'p',
                    props: {
                      className: 'text-sm font-medium text-gray-600'
                    },
                    children: {
                      $exp: `'Welcome, ' + currentUser.name`
                    }
                  },
                  {
                    id: 'user-role',
                    type: 'span',
                    props: {
                      className: 'inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800'
                    },
                    children: {
                      $exp: `currentUser.role`
                    }
                  }
                ]
              }
            ]
          },
          // Navigation Menu
          {
            id: 'nav-menu',
            type: 'nav',
            props: {
              className: 'p-4'
            },
            children: [
              {
                id: 'nav-title',
                type: 'h3',
                props: {
                  className: 'text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3'
                },
                children: 'Navigation'
              },
              {
                id: 'nav-list',
                type: 'ul',
                props: {
                  className: 'space-y-2'
                },
                children: [
                  {
                    id: 'nav-dashboard',
                    type: 'li',
                    children: [
                      {
                        id: 'nav-dashboard-link',
                        type: 'a',
                        props: {
                          className: 'flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors',
                          href: '#dashboard'
                        },
                        children: [
                          {
                            id: 'nav-dashboard-icon',
                            type: 'span',
                            props: {
                              className: 'mr-3'
                            },
                            children: '📊'
                          },
                          {
                            id: 'nav-dashboard-text',
                            type: 'span',
                            children: 'Dashboard'
                          }
                        ]
                      }
                    ]
                  },
                  {
                    id: 'nav-profile',
                    type: 'li',
                    children: [
                      {
                        id: 'nav-profile-link',
                        type: 'a',
                        props: {
                          className: 'flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors',
                          href: '#profile'
                        },
                        children: [
                          {
                            id: 'nav-profile-icon',
                            type: 'span',
                            props: {
                              className: 'mr-3'
                            },
                            children: '👤'
                          },
                          {
                            id: 'nav-profile-text',
                            type: 'span',
                            children: 'Profile'
                          }
                        ]
                      }
                    ]
                  },
                  {
                    id: 'nav-settings',
                    type: 'li',
                    children: [
                      {
                        id: 'nav-settings-link',
                        type: 'a',
                        props: {
                          className: 'flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors',
                          href: '#settings'
                        },
                        children: [
                          {
                            id: 'nav-settings-icon',
                            type: 'span',
                            props: {
                              className: 'mr-3'
                            },
                            children: '⚙️'
                          },
                          {
                            id: 'nav-settings-text',
                            type: 'span',
                            children: 'Settings'
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

      // Main Content Area
      {
        id: 'main-content',
        type: 'main',
        props: {
          className: 'flex-1 p-8'
        },
        children: [
          // Page Header
          {
            id: 'page-header',
            type: 'header',
            props: {
              className: 'mb-8'
            },
            children: [
              {
                id: 'page-title',
                type: 'h1',
                props: {
                  className: 'text-3xl font-bold text-gray-900 mb-2'
                },
                children: 'Dashboard Overview'
              },
              {
                id: 'page-description',
                type: 'p',
                props: {
                  className: 'text-gray-600'
                },
                children: 'Manage your account settings and view analytics'
              }
            ]
          },

          // Stats Cards
          {
            id: 'stats-section',
            type: 'section',
            props: {
              className: 'mb-8'
            },
            children: [
              {
                id: 'stats-grid',
                type: 'div',
                props: {
                  className: 'grid grid-cols-1 md:grid-cols-3 gap-6'
                },
                children: [
                  {
                    id: 'stats-users',
                    type: 'div',
                    props: {
                      className: 'bg-white rounded-lg shadow-sm border border-gray-200 p-6'
                    },
                    children: [
                      {
                        id: 'stats-users-header',
                        type: 'div',
                        props: {
                          className: 'flex items-center justify-between'
                        },
                        children: [
                          {
                            id: 'stats-users-title',
                            type: 'h3',
                            props: {
                              className: 'text-sm font-medium text-gray-500'
                            },
                            children: 'Total Users'
                          },
                          {
                            id: 'stats-users-icon',
                            type: 'span',
                            props: {
                              className: 'text-blue-500'
                            },
                            children: '👥'
                          }
                        ]
                      },
                      {
                        id: 'stats-users-value',
                        type: 'p',
                        props: {
                          className: 'text-2xl font-bold text-gray-900 mt-2'
                        },
                        children: {
                          $exp: `dashboardStats.users.toLocaleString()`
                        }
                      }
                    ]
                  },
                  {
                    id: 'stats-projects',
                    type: 'div',
                    props: {
                      className: 'bg-white rounded-lg shadow-sm border border-gray-200 p-6'
                    },
                    children: [
                      {
                        id: 'stats-projects-header',
                        type: 'div',
                        props: {
                          className: 'flex items-center justify-between'
                        },
                        children: [
                          {
                            id: 'stats-projects-title',
                            type: 'h3',
                            props: {
                              className: 'text-sm font-medium text-gray-500'
                            },
                            children: 'Active Projects'
                          },
                          {
                            id: 'stats-projects-icon',
                            type: 'span',
                            props: {
                              className: 'text-green-500'
                            },
                            children: '📊'
                          }
                        ]
                      },
                      {
                        id: 'stats-projects-value',
                        type: 'p',
                        props: {
                          className: 'text-2xl font-bold text-gray-900 mt-2'
                        },
                        children: {
                          $exp: `dashboardStats.projects`
                        }
                      }
                    ]
                  },
                  {
                    id: 'stats-revenue',
                    type: 'div',
                    props: {
                      className: 'bg-white rounded-lg shadow-sm border border-gray-200 p-6'
                    },
                    children: [
                      {
                        id: 'stats-revenue-header',
                        type: 'div',
                        props: {
                          className: 'flex items-center justify-between'
                        },
                        children: [
                          {
                            id: 'stats-revenue-title',
                            type: 'h3',
                            props: {
                              className: 'text-sm font-medium text-gray-500'
                            },
                            children: 'Revenue'
                          },
                          {
                            id: 'stats-revenue-icon',
                            type: 'span',
                            props: {
                              className: 'text-purple-500'
                            },
                            children: '💰'
                          }
                        ]
                      },
                      {
                        id: 'stats-revenue-value',
                        type: 'p',
                        props: {
                          className: 'text-2xl font-bold text-gray-900 mt-2'
                        },
                        children: {
                          $exp: `'$' + dashboardStats.revenue.toLocaleString()`
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          },

          // Forms Section
          {
            id: 'forms-section',
            type: 'section',
            props: {
              className: 'grid grid-cols-1 lg:grid-cols-2 gap-8'
            },
            children: [
              // Profile Form
              {
                id: 'profile-form-container',
                type: 'div',
                props: {
                  className: 'bg-white rounded-lg shadow-sm border border-gray-200'
                },
                children: [
                  {
                    id: 'profile-form-header',
                    type: 'div',
                    props: {
                      className: 'px-6 py-4 border-b border-gray-200'
                    },
                    children: [
                      {
                        id: 'profile-form-title',
                        type: 'h2',
                        props: {
                          className: 'text-lg font-semibold text-gray-900'
                        },
                        children: 'Profile Information'
                      },
                      {
                        id: 'profile-form-subtitle',
                        type: 'p',
                        props: {
                          className: 'text-sm text-gray-600 mt-1'
                        },
                        children: 'Update your personal information'
                      }
                    ]
                  },
                  {
                    id: 'profile-form',
                    type: 'form',
                    props: {
                      className: 'p-6 space-y-4'
                    },
                    children: [
                      {
                        id: 'profile-name-row',
                        type: 'div',
                        props: {
                          className: 'grid grid-cols-1 md:grid-cols-2 gap-4'
                        },
                        children: [
                          {
                            id: 'profile-first-name-group',
                            type: 'div',
                            children: [
                              {
                                id: 'profile-first-name-label',
                                type: 'label',
                                props: {
                                  className: 'block text-sm font-medium text-gray-700 mb-1',
                                  htmlFor: 'firstName'
                                },
                                children: 'First Name'
                              },
                              {
                                id: 'profile-first-name-input',
                                type: 'input',
                                props: {
                                  type: 'text',
                                  id: 'firstName',
                                  name: 'firstName',
                                  className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                                  placeholder: 'Enter first name'
                                }
                              }
                            ]
                          },
                          {
                            id: 'profile-last-name-group',
                            type: 'div',
                            children: [
                              {
                                id: 'profile-last-name-label',
                                type: 'label',
                                props: {
                                  className: 'block text-sm font-medium text-gray-700 mb-1',
                                  htmlFor: 'lastName'
                                },
                                children: 'Last Name'
                              },
                              {
                                id: 'profile-last-name-input',
                                type: 'input',
                                props: {
                                  type: 'text',
                                  id: 'lastName',
                                  name: 'lastName',
                                  className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                                  placeholder: 'Enter last name'
                                }
                              }
                            ]
                          }
                        ]
                      },
                      {
                        id: 'profile-email-group',
                        type: 'div',
                        children: [
                          {
                            id: 'profile-email-label',
                            type: 'label',
                            props: {
                              className: 'block text-sm font-medium text-gray-700 mb-1',
                              htmlFor: 'email'
                            },
                            children: 'Email Address'
                          },
                          {
                            id: 'profile-email-input',
                            type: 'input',
                            props: {
                              type: 'email',
                              id: 'email',
                              name: 'email',
                              className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                              placeholder: 'Enter email address'
                            }
                          }
                        ]
                      },
                      {
                        id: 'profile-phone-group',
                        type: 'div',
                        children: [
                          {
                            id: 'profile-phone-label',
                            type: 'label',
                            props: {
                              className: 'block text-sm font-medium text-gray-700 mb-1',
                              htmlFor: 'phone'
                            },
                            children: 'Phone Number'
                          },
                          {
                            id: 'profile-phone-input',
                            type: 'input',
                            props: {
                              type: 'tel',
                              id: 'phone',
                              name: 'phone',
                              className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                              placeholder: 'Enter phone number'
                            }
                          }
                        ]
                      },
                      {
                        id: 'profile-form-actions',
                        type: 'div',
                        props: {
                          className: 'flex justify-end space-x-3 pt-4'
                        },
                        children: [
                          {
                            id: 'profile-cancel-btn',
                            type: 'button',
                            props: {
                              type: 'button',
                              className: 'px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                            },
                            children: 'Cancel'
                          },
                          {
                            id: 'profile-save-btn',
                            type: 'button',
                            props: {
                              type: 'submit',
                              className: 'px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors'
                            },
                            children: 'Save Changes'
                          }
                        ]
                      }
                    ]
                  }
                ]
              },

              // Settings Form
              {
                id: 'settings-form-container',
                type: 'div',
                props: {
                  className: 'bg-white rounded-lg shadow-sm border border-gray-200'
                },
                children: [
                  {
                    id: 'settings-form-header',
                    type: 'div',
                    props: {
                      className: 'px-6 py-4 border-b border-gray-200'
                    },
                    children: [
                      {
                        id: 'settings-form-title',
                        type: 'h2',
                        props: {
                          className: 'text-lg font-semibold text-gray-900'
                        },
                        children: 'Application Settings'
                      },
                      {
                        id: 'settings-form-subtitle',
                        type: 'p',
                        props: {
                          className: 'text-sm text-gray-600 mt-1'
                        },
                        children: 'Customize your application preferences'
                      }
                    ]
                  },
                  {
                    id: 'settings-form',
                    type: 'form',
                    props: {
                      className: 'p-6 space-y-6'
                    },
                    children: [
                      {
                        id: 'settings-theme-group',
                        type: 'div',
                        children: [
                          {
                            id: 'settings-theme-label',
                            type: 'label',
                            props: {
                              className: 'block text-sm font-medium text-gray-700 mb-2'
                            },
                            children: 'Theme Preference'
                          },
                          {
                            id: 'settings-theme-options',
                            type: 'div',
                            props: {
                              className: 'space-y-2'
                            },
                            children: [
                              {
                                id: 'settings-theme-light',
                                type: 'div',
                                props: {
                                  className: 'flex items-center'
                                },
                                children: [
                                  {
                                    id: 'settings-theme-light-input',
                                    type: 'input',
                                    props: {
                                      type: 'radio',
                                      id: 'theme-light',
                                      name: 'theme',
                                      value: 'light',
                                      className: 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300'
                                    }
                                  },
                                  {
                                    id: 'settings-theme-light-label',
                                    type: 'label',
                                    props: {
                                      htmlFor: 'theme-light',
                                      className: 'ml-3 text-sm text-gray-700'
                                    },
                                    children: 'Light Mode'
                                  }
                                ]
                              },
                              {
                                id: 'settings-theme-dark',
                                type: 'div',
                                props: {
                                  className: 'flex items-center'
                                },
                                children: [
                                  {
                                    id: 'settings-theme-dark-input',
                                    type: 'input',
                                    props: {
                                      type: 'radio',
                                      id: 'theme-dark',
                                      name: 'theme',
                                      value: 'dark',
                                      className: 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300'
                                    }
                                  },
                                  {
                                    id: 'settings-theme-dark-label',
                                    type: 'label',
                                    props: {
                                      htmlFor: 'theme-dark',
                                      className: 'ml-3 text-sm text-gray-700'
                                    },
                                    children: 'Dark Mode'
                                  }
                                ]
                              }
                            ]
                          }
                        ]
                      },
                      {
                        id: 'settings-notifications-group',
                        type: 'div',
                        children: [
                          {
                            id: 'settings-notifications-wrapper',
                            type: 'div',
                            props: {
                              className: 'flex items-center justify-between'
                            },
                            children: [
                              {
                                id: 'settings-notifications-info',
                                type: 'div',
                                children: [
                                  {
                                    id: 'settings-notifications-label',
                                    type: 'label',
                                    props: {
                                      htmlFor: 'notifications',
                                      className: 'text-sm font-medium text-gray-700'
                                    },
                                    children: 'Email Notifications'
                                  },
                                  {
                                    id: 'settings-notifications-description',
                                    type: 'p',
                                    props: {
                                      className: 'text-sm text-gray-500'
                                    },
                                    children: 'Receive email updates about your account'
                                  }
                                ]
                              },
                              {
                                id: 'settings-notifications-toggle',
                                type: 'input',
                                props: {
                                  type: 'checkbox',
                                  id: 'notifications',
                                  name: 'notifications',
                                  className: 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                                }
                              }
                            ]
                          }
                        ]
                      },
                      {
                        id: 'settings-language-group',
                        type: 'div',
                        children: [
                          {
                            id: 'settings-language-label',
                            type: 'label',
                            props: {
                              htmlFor: 'language',
                              className: 'block text-sm font-medium text-gray-700 mb-2'
                            },
                            children: 'Language'
                          },
                          {
                            id: 'settings-language-select',
                            type: 'select',
                            props: {
                              id: 'language',
                              name: 'language',
                              className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                            },
                            children: [
                              {
                                id: 'settings-language-en',
                                type: 'option',
                                props: {
                                  value: 'en'
                                },
                                children: 'English'
                              },
                              {
                                id: 'settings-language-es',
                                type: 'option',
                                props: {
                                  value: 'es'
                                },
                                children: 'Spanish'
                              },
                              {
                                id: 'settings-language-fr',
                                type: 'option',
                                props: {
                                  value: 'fr'
                                },
                                children: 'French'
                              }
                            ]
                          }
                        ]
                      },
                      {
                        id: 'settings-form-actions',
                        type: 'div',
                        props: {
                          className: 'flex justify-end space-x-3 pt-4'
                        },
                        children: [
                          {
                            id: 'settings-reset-btn',
                            type: 'button',
                            props: {
                              type: 'button',
                              className: 'px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                            },
                            children: 'Reset'
                          },
                          {
                            id: 'settings-apply-btn',
                            type: 'button',
                            props: {
                              type: 'submit',
                              className: 'px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 transition-colors'
                            },
                            children: 'Apply Settings'
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },

          // Native Components Section
          {
            id: 'native-components-section',
            type: 'section',
            props: {
              className: 'mt-8'
            },
            children: [
              {
                id: 'native-components-header',
                type: 'div',
                props: {
                  className: 'mb-6'
                },
                children: [
                  {
                    id: 'native-components-title',
                    type: 'h2',
                    props: {
                      className: 'text-2xl font-bold text-gray-900 mb-2'
                    },
                    children: 'Native Components'
                  },
                  {
                    id: 'native-components-description',
                    type: 'p',
                    props: {
                      className: 'text-gray-600'
                    },
                    children: 'Interactive data visualization and mapping components'
                  }
                ]
              },

              // AG Grid Component
              {
                id: 'ag-grid-container',
                type: 'div',
                props: {
                  className: 'bg-white rounded-lg shadow-sm border border-gray-200 mb-8'
                },
                children: [
                  {
                    id: 'ag-grid-header',
                    type: 'div',
                    props: {
                      className: 'px-6 py-4 border-b border-gray-200'
                    },
                    children: [
                      {
                        id: 'ag-grid-title',
                        type: 'h3',
                        props: {
                          className: 'text-lg font-semibold text-gray-900'
                        },
                        children: 'Employee Data Grid'
                      },
                      {
                        id: 'ag-grid-subtitle',
                        type: 'p',
                        props: {
                          className: 'text-sm text-gray-600 mt-1'
                        },
                        children: 'Interactive data table with sorting and filtering'
                      }
                    ]
                  },
                  {
                    id: 'ag-grid-component',
                    type: 'COMP_AGGRID',
                    props: {
                      className: 'ag-theme-alpine',
                      style: { height: '400px', width: '100%' },
                      columnDefs: {
                        $exp: 'gridData.columnDefs'
                      },
                      rowData: {
                        $exp: 'gridData.rowData'
                      },
                      defaultColDef: {
                        $exp: 'gridData.defaultColDef'
                      },
                      pagination: {
                        $exp: 'gridData.pagination'
                      },
                      paginationPageSize: {
                        $exp: 'gridData.paginationPageSize'
                      }
                    }
                  }
                ]
              },

              // Charts Section
              {
                id: 'charts-section',
                type: 'div',
                props: {
                  className: 'grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'
                },
                children: [
                  // Sales Chart
                  {
                    id: 'sales-chart-container',
                    type: 'div',
                    props: {
                      className: 'bg-white rounded-lg shadow-sm border border-gray-200'
                    },
                    children: [
                      {
                        id: 'sales-chart-header',
                        type: 'div',
                        props: {
                          className: 'px-6 py-4 border-b border-gray-200'
                        },
                        children: [
                          {
                            id: 'sales-chart-title',
                            type: 'h3',
                            props: {
                              className: 'text-lg font-semibold text-gray-900'
                            },
                            children: 'Sales Analytics'
                          },
                          {
                            id: 'sales-chart-subtitle',
                            type: 'p',
                            props: {
                              className: 'text-sm text-gray-600 mt-1'
                            },
                            children: 'Monthly revenue and profit trends'
                          }
                        ]
                      },
                      {
                        id: 'sales-chart-component',
                        type: 'COMP_ECHART',
                        props: {
                          style: { height: '350px', width: '100%' },
                          option: {
                            $exp: 'chartData.salesChart'
                          },
                          theme: 'light'
                        }
                      }
                    ]
                  },
                  // Pie Chart
                  {
                    id: 'pie-chart-container',
                    type: 'div',
                    props: {
                      className: 'bg-white rounded-lg shadow-sm border border-gray-200'
                    },
                    children: [
                      {
                        id: 'pie-chart-header',
                        type: 'div',
                        props: {
                          className: 'px-6 py-4 border-b border-gray-200'
                        },
                        children: [
                          {
                            id: 'pie-chart-title',
                            type: 'h3',
                            props: {
                              className: 'text-lg font-semibold text-gray-900'
                            },
                            children: 'Department Overview'
                          },
                          {
                            id: 'pie-chart-subtitle',
                            type: 'p',
                            props: {
                              className: 'text-sm text-gray-600 mt-1'
                            },
                            children: 'Employee distribution by department'
                          }
                        ]
                      },
                      {
                        id: 'pie-chart-component',
                        type: 'COMP_ECHART',
                        props: {
                          style: { height: '350px', width: '100%' },
                          option: {
                            $exp: 'chartData.pieChart'
                          },
                          theme: 'light'
                        }
                      }
                    ]
                  }
                ]
              },

              // Map Component
              {
                id: 'map-container',
                type: 'div',
                props: {
                  className: 'bg-white rounded-lg shadow-sm border border-gray-200'
                },
                children: [
                  {
                    id: 'map-header',
                    type: 'div',
                    props: {
                      className: 'px-6 py-4 border-b border-gray-200'
                    },
                    children: [
                      {
                        id: 'map-title',
                        type: 'h3',
                        props: {
                          className: 'text-lg font-semibold text-gray-900'
                        },
                        children: 'Office Locations'
                      },
                      {
                        id: 'map-subtitle',
                        type: 'p',
                        props: {
                          className: 'text-sm text-gray-600 mt-1'
                        },
                        children: 'Interactive map showing all office locations'
                      }
                    ]
                  },
                  {
                    id: 'map-component',
                    type: 'COMP_LEAFLET',
                    props: {
                      style: { height: '400px', width: '100%' },
                      center: {
                        $exp: 'mapData.center'
                      },
                      zoom: {
                        $exp: 'mapData.zoom'
                      },
                      tileLayer: {
                        $exp: 'mapData.tileLayer'
                      },
                      attribution: {
                        $exp: 'mapData.attribution'
                      },
                      markers: {
                        $exp: 'mapData.markers'
                      }
                    }
                  }
                ]
              },

              // Documentation and 3D Visualization Section
              {
                id: 'docs-3d-section',
                type: 'div',
                props: {
                  className: 'grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8'
                },
                children: [
                  // Markdown Documentation
                  {
                    id: 'markdown-container',
                    type: 'div',
                    props: {
                      className: 'bg-white rounded-lg shadow-sm border border-gray-200'
                    },
                    children: [
                      {
                        id: 'markdown-header',
                        type: 'div',
                        props: {
                          className: 'px-6 py-4 border-b border-gray-200'
                        },
                        children: [
                          {
                            id: 'markdown-title',
                            type: 'h3',
                            props: {
                              className: 'text-lg font-semibold text-gray-900'
                            },
                            children: 'Documentation'
                          },
                          {
                            id: 'markdown-subtitle',
                            type: 'p',
                            props: {
                              className: 'text-sm text-gray-600 mt-1'
                            },
                            children: 'Company information and technical specs'
                          }
                        ]
                      },
                      {
                        id: 'markdown-component',
                        type: 'COMP_MARKDOWN',
                        props: {
                          className: 'p-6 prose prose-sm max-w-none',
                          content: {
                            $exp: 'markdownData.content'
                          },
                          enableMath: true,
                          enableSyntaxHighlighting: true
                        }
                      }
                    ]
                  },

                  // Three.js 3D Scene
                  {
                    id: 'threejs-container',
                    type: 'div',
                    props: {
                      className: 'bg-white rounded-lg shadow-sm border border-gray-200'
                    },
                    children: [
                      {
                        id: 'threejs-header',
                        type: 'div',
                        props: {
                          className: 'px-6 py-4 border-b border-gray-200'
                        },
                        children: [
                          {
                            id: 'threejs-title',
                            type: 'h3',
                            props: {
                              className: 'text-lg font-semibold text-gray-900'
                            },
                            children: '3D Visualization'
                          },
                          {
                            id: 'threejs-subtitle',
                            type: 'p',
                            props: {
                              className: 'text-sm text-gray-600 mt-1'
                            },
                            children: 'Interactive 3D scene with animated objects'
                          }
                        ]
                      },
                      {
                        id: 'threejs-component',
                        type: 'COMP_THREE_SCENE',
                        props: {
                          style: { height: '400px', width: '100%' },
                          scene: {
                            $exp: 'threeSceneData.scene'
                          },
                          camera: {
                            $exp: 'threeSceneData.camera'
                          },
                          lights: {
                            $exp: 'threeSceneData.lights'
                          },
                          objects: {
                            $exp: 'threeSceneData.objects'
                          },
                          controls: {
                            $exp: 'threeSceneData.controls'
                          },
                          renderer: {
                            $exp: 'threeSceneData.renderer'
                          }
                        }
                      }
                    ]
                  }
                ]
              },

              // Additional Native Components Section
              {
                id: 'additional-native-section',
                type: 'div',
                props: {
                  className: 'mt-8'
                },
                children: [
                  {
                    id: 'additional-native-header',
                    type: 'div',
                    props: {
                      className: 'mb-6'
                    },
                    children: [
                      {
                        id: 'additional-native-title',
                        type: 'h2',
                        props: {
                          className: 'text-2xl font-bold text-gray-900 mb-2'
                        },
                        children: 'Additional Native Components'
                      },
                      {
                        id: 'additional-native-description',
                        type: 'p',
                        props: {
                          className: 'text-gray-600'
                        },
                        children: 'Advanced spreadsheet, mapping, PDF viewing, and network visualization components'
                      }
                    ]
                  },

                  // Spreadsheet Components Row
                  {
                    id: 'spreadsheet-components-row',
                    type: 'div',
                    props: {
                      className: 'grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'
                    },
                    children: [
                      // HandsOnTable Component
                      {
                        id: 'handson-table-container',
                        type: 'div',
                        props: {
                          className: 'bg-white rounded-lg shadow-sm border border-gray-200'
                        },
                        children: [
                          {
                            id: 'handson-table-header',
                            type: 'div',
                            props: {
                              className: 'px-6 py-4 border-b border-gray-200'
                            },
                            children: [
                              {
                                id: 'handson-table-title',
                                type: 'h3',
                                props: {
                                  className: 'text-lg font-semibold text-gray-900'
                                },
                                children: 'HandsOnTable Spreadsheet'
                              },
                              {
                                id: 'handson-table-subtitle',
                                type: 'p',
                                props: {
                                  className: 'text-sm text-gray-600 mt-1'
                                },
                                children: 'Advanced spreadsheet with formulas and editing capabilities'
                              }
                            ]
                          },
                          {
                            id: 'handson-table-component',
                            type: 'COMP_HANDSONTABLE',
                            props: {
                              style: { height: '300px', width: '100%' },
                              data: {
                                $exp: 'handsOnTableData'
                              },
                              colHeaders: true,
                              rowHeaders: true,
                              contextMenu: true,
                              formulas: true,
                              autoColumnSize: true
                            }
                          }
                        ]
                      },
                      // Luckysheet Component
                      {
                        id: 'luckysheet-container',
                        type: 'div',
                        props: {
                          className: 'bg-white rounded-lg shadow-sm border border-gray-200'
                        },
                        children: [
                          {
                            id: 'luckysheet-header',
                            type: 'div',
                            props: {
                              className: 'px-6 py-4 border-b border-gray-200'
                            },
                            children: [
                              {
                                id: 'luckysheet-title',
                                type: 'h3',
                                props: {
                                  className: 'text-lg font-semibold text-gray-900'
                                },
                                children: 'Luckysheet Online Spreadsheet'
                              },
                              {
                                id: 'luckysheet-subtitle',
                                type: 'p',
                                props: {
                                  className: 'text-sm text-gray-600 mt-1'
                                },
                                children: 'Feature-rich online spreadsheet with collaborative editing'
                              }
                            ]
                          },
                          {
                            id: 'luckysheet-component',
                            type: 'COMP_LUCKYSHEET',
                            props: {
                              style: { height: '300px', width: '100%' },
                              data: {
                                $exp: 'luckysheetData'
                              }
                            }
                          }
                        ]
                      }
                    ]
                  },

                  // Mapbox and PDF Row
                  {
                    id: 'mapbox-pdf-row',
                    type: 'div',
                    props: {
                      className: 'grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'
                    },
                    children: [
                      // Mapbox Map Component
                      {
                        id: 'mapbox-container',
                        type: 'div',
                        props: {
                          className: 'bg-white rounded-lg shadow-sm border border-gray-200'
                        },
                        children: [
                          {
                            id: 'mapbox-header',
                            type: 'div',
                            props: {
                              className: 'px-6 py-4 border-b border-gray-200'
                            },
                            children: [
                              {
                                id: 'mapbox-title',
                                type: 'h3',
                                props: {
                                  className: 'text-lg font-semibold text-gray-900'
                                },
                                children: 'Mapbox GL Map'
                              },
                              {
                                id: 'mapbox-subtitle',
                                type: 'p',
                                props: {
                                  className: 'text-sm text-gray-600 mt-1'
                                },
                                children: 'High-performance vector maps with custom styling'
                              }
                            ]
                          },
                          {
                            id: 'mapbox-component',
                            type: 'COMP_MAPBOX',
                            props: {
                              style: { height: '350px', width: '100%' },
                              center: {
                                $exp: 'mapboxData.center'
                              },
                              zoom: {
                                $exp: 'mapboxData.zoom'
                              },
                              accessToken: {
                                $exp: 'mapboxData.accessToken'
                              },
                              mapStyle: {
                                $exp: 'mapboxData.mapStyle'
                              },
                              markers: {
                                $exp: 'mapboxData.markers'
                              }
                            }
                          }
                        ]
                      },
                      // PDF Viewer Component
                      {
                        id: 'pdf-viewer-container',
                        type: 'div',
                        props: {
                          className: 'bg-white rounded-lg shadow-sm border border-gray-200'
                        },
                        children: [
                          {
                            id: 'pdf-viewer-header',
                            type: 'div',
                            props: {
                              className: 'px-6 py-4 border-b border-gray-200'
                            },
                            children: [
                              {
                                id: 'pdf-viewer-title',
                                type: 'h3',
                                props: {
                                  className: 'text-lg font-semibold text-gray-900'
                                },
                                children: 'PDF Document Viewer'
                              },
                              {
                                id: 'pdf-viewer-subtitle',
                                type: 'p',
                                props: {
                                  className: 'text-sm text-gray-600 mt-1'
                                },
                                children: 'PDF.js powered document viewer with page navigation'
                              }
                            ]
                          },
                          {
                            id: 'pdf-viewer-component',
                            type: 'COMP_PDF_VIEWER',
                            props: {
                              style: { height: '350px', width: '100%' },
                              url: {
                                $exp: 'pdfViewerData.url'
                              },
                              pageNumber: {
                                $exp: 'pdfViewerData.pageNumber'
                              },
                              scale: {
                                $exp: 'pdfViewerData.scale'
                              }
                            }
                          }
                        ]
                      }
                    ]
                  },

                  // Vis Network Component (full width)
                  {
                    id: 'vis-network-container',
                    type: 'div',
                    props: {
                      className: 'bg-white rounded-lg shadow-sm border border-gray-200 mb-8'
                    },
                    children: [
                      {
                        id: 'vis-network-header',
                        type: 'div',
                        props: {
                          className: 'px-6 py-4 border-b border-gray-200'
                        },
                        children: [
                          {
                            id: 'vis-network-title',
                            type: 'h3',
                            props: {
                              className: 'text-lg font-semibold text-gray-900'
                            },
                            children: 'Organization Network Graph'
                          },
                          {
                            id: 'vis-network-subtitle',
                            type: 'p',
                            props: {
                              className: 'text-sm text-gray-600 mt-1'
                            },
                            children: 'Interactive network visualization showing organizational hierarchy'
                          }
                        ]
                      },
                      {
                        id: 'vis-network-component',
                        type: 'COMP_VIS_NETWORK',
                        props: {
                          style: { height: '400px', width: '100%' },
                          nodes: {
                            $exp: 'visNetworkData.nodes'
                          },
                          edges: {
                            $exp: 'visNetworkData.edges'
                          },
                          options: {
                            $exp: 'visNetworkData.options'
                          }
                        }
                      }
                    ]
                  }
                ]
              },

              // Additional Information Section
              {
                id: 'info-section',
                type: 'div',
                props: {
                  className: 'mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-gray-200'
                },
                children: [
                  {
                    id: 'info-title',
                    type: 'h3',
                    props: {
                      className: 'text-xl font-bold text-gray-900 mb-4'
                    },
                    children: 'Native Component Showcase'
                  },
                  {
                    id: 'info-description',
                    type: 'div',
                    props: {
                      className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                    },
                    children: [
                      {
                        id: 'info-data',
                        type: 'div',
                        props: {
                          className: 'bg-white rounded-lg p-4 shadow-sm'
                        },
                        children: [
                          {
                            id: 'info-data-title',
                            type: 'h4',
                            props: {
                              className: 'font-semibold text-gray-800 mb-2'
                            },
                            children: '📊 Data Visualization'
                          },
                          {
                            id: 'info-data-text',
                            type: 'p',
                            props: {
                              className: 'text-sm text-gray-600'
                            },
                            children: 'Interactive charts and data grids with real-time filtering and sorting capabilities.'
                          }
                        ]
                      },
                      {
                        id: 'info-geo',
                        type: 'div',
                        props: {
                          className: 'bg-white rounded-lg p-4 shadow-sm'
                        },
                        children: [
                          {
                            id: 'info-geo-title',
                            type: 'h4',
                            props: {
                              className: 'font-semibold text-gray-800 mb-2'
                            },
                            children: '🗺️ Geographic Mapping'
                          },
                          {
                            id: 'info-geo-text',
                            type: 'p',
                            props: {
                              className: 'text-sm text-gray-600'
                            },
                            children: 'Interactive maps with custom markers, popups, and location-based services.'
                          }
                        ]
                      },
                      {
                        id: 'info-3d',
                        type: 'div',
                        props: {
                          className: 'bg-white rounded-lg p-4 shadow-sm'
                        },
                        children: [
                          {
                            id: 'info-3d-title',
                            type: 'h4',
                            props: {
                              className: 'font-semibold text-gray-800 mb-2'
                            },
                            children: '🎮 3D Graphics'
                          },
                          {
                            id: 'info-3d-text',
                            type: 'p',
                            props: {
                              className: 'text-sm text-gray-600'
                            },
                            children: 'WebGL-powered 3D scenes with animations, lighting, and interactive controls.'
                          }
                        ]
                      }
                    ]
                  },
                  {
                    id: 'info-stats',
                    type: 'div',
                    props: {
                      className: 'mt-6 pt-4 border-t border-gray-200'
                    },
                    children: [
                      {
                        id: 'info-stats-title',
                        type: 'p',
                        props: {
                          className: 'text-sm font-medium text-gray-700 mb-2'
                        },
                        children: 'Component Statistics:'
                      },
                      {
                        id: 'info-stats-list',
                        type: 'div',
                        props: {
                          className: 'flex flex-wrap gap-4 text-xs text-gray-600'
                        },
                        children: [
                          {
                            id: 'stat-components',
                            type: 'span',
                            children: {
                              $exp: `'🔧 ' + Object.keys(gridData.rowData || {}).length + ' data rows'`
                            }
                          },
                          {
                            id: 'stat-charts',
                            type: 'span',
                            children: '📈 2 interactive charts'
                          },
                          {
                            id: 'stat-markers',
                            type: 'span',
                            children: {
                              $exp: `'📍 ' + (mapData.markers || []).length + ' map markers'`
                            }
                          },
                          {
                            id: 'stat-3d-objects',
                            type: 'span',
                            children: {
                              $exp: `'🎯 ' + (threeSceneData.objects || []).length + ' 3D objects'`
                            }
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
  data: {
    currentUser: { name: 'John Doe', role: 'Admin' },
    dashboardStats: { users: 1250, projects: 42, revenue: 98500 },
    formData: {
      profile: { firstName: '', lastName: '', email: '', phone: '' },
      settings: { theme: 'light', notifications: true, language: 'en' }
    },
    // AG Grid data
    gridData: {
      columnDefs: [
        { headerName: 'ID', field: 'id', width: 70, sortable: true },
        { headerName: 'Name', field: 'name', width: 150, sortable: true, filter: true },
        { headerName: 'Email', field: 'email', width: 200, sortable: true, filter: true },
        { headerName: 'Department', field: 'department', width: 120, sortable: true, filter: true },
        { headerName: 'Salary', field: 'salary', width: 100, sortable: true, filter: 'agNumberColumnFilter', valueFormatter: 'params.value.toLocaleString()' },
        { headerName: 'Start Date', field: 'startDate', width: 120, sortable: true, filter: 'agDateColumnFilter' }
      ],
      rowData: [
        { id: 1, name: 'John Smith', email: 'john.smith@company.com', department: 'Engineering', salary: 75000, startDate: '2022-01-15' },
        { id: 2, name: 'Sarah Johnson', email: 'sarah.johnson@company.com', department: 'Marketing', salary: 65000, startDate: '2021-08-20' },
        { id: 3, name: 'Mike Davis', email: 'mike.davis@company.com', department: 'Sales', salary: 70000, startDate: '2022-03-10' },
        { id: 4, name: 'Emily Chen', email: 'emily.chen@company.com', department: 'HR', salary: 68000, startDate: '2021-11-05' },
        { id: 5, name: 'David Wilson', email: 'david.wilson@company.com', department: 'Engineering', salary: 80000, startDate: '2022-02-28' },
        { id: 6, name: 'Lisa Anderson', email: 'lisa.anderson@company.com', department: 'Finance', salary: 72000, startDate: '2021-09-12' }
      ],
      defaultColDef: {
        resizable: true,
        sortable: true,
        filter: true
      },
      pagination: true,
      paginationPageSize: 10
    },
    // ECharts data
    chartData: {
      salesChart: {
        title: { text: 'Monthly Sales Report', left: 'center' },
        tooltip: { trigger: 'axis' },
        legend: { data: ['Revenue', 'Profit'], bottom: 0 },
        xAxis: {
          type: 'category',
          data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },
        yAxis: { type: 'value', name: 'Amount ($)' },
        series: [
          {
            name: 'Revenue',
            type: 'bar',
            data: [65000, 70000, 68000, 72000, 75000, 78000, 82000, 85000, 88000, 90000, 92000, 95000],
            itemStyle: { color: '#3b82f6' }
          },
          {
            name: 'Profit',
            type: 'line',
            data: [12000, 15000, 13000, 16000, 18000, 20000, 22000, 24000, 26000, 28000, 30000, 32000],
            itemStyle: { color: '#10b981' }
          }
        ]
      },
      pieChart: {
        title: { text: 'Department Distribution', left: 'center' },
        tooltip: { trigger: 'item' },
        series: [{
          name: 'Employees',
          type: 'pie',
          radius: '60%',
          center: ['50%', '60%'],
          data: [
            { value: 35, name: 'Engineering' },
            { value: 25, name: 'Sales' },
            { value: 20, name: 'Marketing' },
            { value: 15, name: 'HR' },
            { value: 10, name: 'Finance' }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      }
    },
    // Leaflet Map data
    mapData: {
      center: [40.7128, -74.0060], // New York City
      zoom: 10,
      markers: [
        {
          position: [40.7589, -73.9851],
          popup: 'Times Square Office',
          tooltip: 'Main Office - 500 employees'
        },
        {
          position: [40.7505, -73.9934],
          popup: 'Manhattan Branch',
          tooltip: 'Branch Office - 150 employees'
        },
        {
          position: [40.6892, -74.0445],
          popup: 'Brooklyn Office',
          tooltip: 'Development Center - 200 employees'
        },
        {
          position: [40.7831, -73.9712],
          popup: 'Central Park Cafe',
          tooltip: 'Meeting Point - Casual meetings'
        }
      ],
      tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    // Markdown data
    markdownData: {
      content: `# Company Documentation

## About Our Organization

Welcome to **SuperAtom Technologies**, a cutting-edge software development company specializing in innovative solutions for modern businesses.

### Our Mission
> To democratize technology and make powerful tools accessible to everyone through intuitive user interfaces and robust backend systems.

### Key Features

#### 🚀 **Performance**
- Lightning-fast response times
- Scalable architecture
- Optimized for high-traffic applications

#### 🛡️ **Security**
- End-to-end encryption
- Multi-factor authentication
- Regular security audits

#### 🎨 **User Experience**
- Intuitive design principles
- Responsive across all devices
- Accessibility-first approach

### Technical Specifications

| Component | Technology | Version |
|-----------|------------|---------|
| Frontend | React + TypeScript | 18.x |
| Backend | Node.js + Express | 20.x |
| Database | PostgreSQL | 15.x |
| Deployment | Docker + Kubernetes | Latest |

### Code Example

Here's how you can integrate our API:

\`\`\`javascript
// Initialize the SuperAtom SDK
import { SuperAtom } from '@superatom/sdk';

const client = new SuperAtom({
  apiKey: 'your-api-key',
  environment: 'production'
});

// Create a new user interface
const ui = await client.ui.create({
  name: 'Dashboard',
  type: 'dashboard',
  components: ['chart', 'table', 'map']
});

console.log('UI created:', ui.id);
\`\`\`

### Mathematical Formulas

Our performance optimization uses advanced algorithms:

$$E = mc^2$$

$$f(x) = \\int_{-\\infty}^{\\infty} \\hat f(\\xi)\\,e^{2 \\pi i \\xi x} \\,d\\xi$$

### Contact Information

- 📧 **Email**: [info@superatom.tech](mailto:info@superatom.tech)
- 🌐 **Website**: [https://superatom.tech](https://superatom.tech)
- 📱 **Phone**: +1 (555) 123-4567
- 📍 **Address**: 123 Tech Street, Innovation City, IC 12345

---

*Last updated: ${new Date().toLocaleDateString()}*
`
    },
    // Three.js Scene data
    threeSceneData: {
      scene: {
        background: '#1a1a2e',
        fog: {
          color: '#1a1a2e',
          near: 10,
          far: 100
        }
      },
      camera: {
        type: 'PerspectiveCamera',
        fov: 75,
        position: [0, 0, 5],
        lookAt: [0, 0, 0]
      },
      lights: [
        {
          type: 'AmbientLight',
          color: '#404040',
          intensity: 0.4
        },
        {
          type: 'DirectionalLight',
          color: '#ffffff',
          intensity: 1,
          position: [5, 5, 5],
          castShadow: true
        }
      ],
      objects: [
        {
          type: 'Mesh',
          geometry: {
            type: 'BoxGeometry',
            args: [1, 1, 1]
          },
          material: {
            type: 'MeshLambertMaterial',
            color: '#00ff88',
            transparent: true,
            opacity: 0.8
          },
          position: [-2, 0, 0],
          rotation: [0, 0, 0],
          animation: {
            type: 'rotation',
            axis: 'y',
            speed: 0.01
          }
        },
        {
          type: 'Mesh',
          geometry: {
            type: 'SphereGeometry',
            args: [0.8, 32, 32]
          },
          material: {
            type: 'MeshPhongMaterial',
            color: '#ff4444',
            shininess: 100
          },
          position: [0, 0, 0],
          animation: {
            type: 'position',
            axis: 'y',
            amplitude: 1,
            speed: 0.02
          }
        },
        {
          type: 'Mesh',
          geometry: {
            type: 'ConeGeometry',
            args: [0.6, 1.5, 8]
          },
          material: {
            type: 'MeshStandardMaterial',
            color: '#4444ff',
            metalness: 0.5,
            roughness: 0.1
          },
          position: [2, 0, 0],
          rotation: [0, 0, Math.PI / 6],
          animation: {
            type: 'rotation',
            axis: 'z',
            speed: -0.015
          }
        }
      ],
      controls: {
        type: 'OrbitControls',
        enabled: true,
        autoRotate: false,
        enableDamping: true,
        dampingFactor: 0.05
      },
      renderer: {
        antialias: true,
        shadowMap: true,
        shadowMapType: 'PCFSoftShadowMap'
      }
    },
    // HandsOnTable data
    handsOnTableData: [
      ['Product', 'Q1 Sales', 'Q2 Sales', 'Q3 Sales', 'Q4 Sales', 'Total'],
      ['Laptop Pro', 1200, 1350, 1100, 1400, '=B2+C2+D2+E2'],
      ['Desktop Elite', 800, 750, 900, 850, '=B3+C3+D3+E3'],
      ['Tablet Max', 600, 800, 750, 900, '=B4+C4+D4+E4'],
      ['Monitor 4K', 450, 500, 480, 520, '=B5+C5+D5+E5'],
      ['Keyboard Pro', 150, 180, 160, 200, '=B6+C6+D6+E6'],
      ['Total', '=SUM(B2:B6)', '=SUM(C2:C6)', '=SUM(D2:D6)', '=SUM(E2:E6)', '=SUM(F2:F6)']
    ],
    // Luckysheet data
    luckysheetData: [
      ['Employee', 'Department', 'Salary', 'Bonus', 'Total Compensation'],
      ['Alice Johnson', 'Engineering', 85000, 8500, '=C2+D2'],
      ['Bob Smith', 'Marketing', 65000, 6500, '=C3+D3'],
      ['Carol Davis', 'Sales', 72000, 9000, '=C4+D4'],
      ['David Wilson', 'Engineering', 90000, 12000, '=C5+D5'],
      ['Eva Brown', 'HR', 68000, 5000, '=C6+D6']
    ],
    // Mapbox data
    mapboxData: {
      center: [-73.9857, 40.7484], // NYC Times Square
      zoom: 12,
      accessToken: 'pk.eyJ1IjoiZ29waW5hZGhiMTIxNCIsImEiOiJjbWZ6Y2pmbWQwMHl4MmpzZzB5M21oYXU1In0.pCSA6lTrXlqkIo07zu-CFA', // Working demo token
      mapStyle: 'mapbox://styles/mapbox/streets-v12',
      markers: [
        { lng: -73.9857, lat: 40.7484, popup: '<strong>Times Square</strong><br>The heart of NYC' },
        { lng: -74.0059, lat: 40.7128, popup: '<strong>NYC Office</strong><br>Main headquarters' },
        { lng: -73.9772, lat: 40.7831, popup: '<strong>Central Park</strong><br>Green oasis' },
        { lng: -74.0445, lat: 40.6892, popup: '<strong>Brooklyn Office</strong><br>Development center' }
      ]
    },
    // PDF Viewer data
    pdfViewerData: {
      url: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
      pageNumber: 1,
      scale: 1.2
    },
    // Vis Network data
    visNetworkData: {
      nodes: [
        { id: 1, label: 'CEO\nJohn Doe', color: '#e74c3c', font: { color: 'white' } },
        { id: 2, label: 'CTO\nAlice Smith', color: '#3498db', font: { color: 'white' } },
        { id: 3, label: 'CMO\nBob Johnson', color: '#2ecc71', font: { color: 'white' } },
        { id: 4, label: 'CFO\nCarol Davis', color: '#f39c12', font: { color: 'white' } },
        { id: 5, label: 'Dev Team\nLead', color: '#9b59b6', font: { color: 'white' } },
        { id: 6, label: 'Marketing\nTeam', color: '#1abc9c', font: { color: 'white' } },
        { id: 7, label: 'Finance\nTeam', color: '#e67e22', font: { color: 'white' } },
        { id: 8, label: 'Engineering\nTeam', color: '#34495e', font: { color: 'white' } }
      ],
      edges: [
        { from: 1, to: 2, label: 'Reports to' },
        { from: 1, to: 3, label: 'Reports to' },
        { from: 1, to: 4, label: 'Reports to' },
        { from: 2, to: 5, label: 'Manages' },
        { from: 2, to: 8, label: 'Oversees' },
        { from: 3, to: 6, label: 'Manages' },
        { from: 4, to: 7, label: 'Manages' },
        { from: 5, to: 8, label: 'Leads' }
      ],
      options: {
        nodes: {
          shape: 'box',
          margin: 10,
          font: { size: 12, face: 'Arial' }
        },
        edges: {
          arrows: { to: true },
          font: { size: 10 }
        },
        physics: {
          enabled: true,
          stabilization: { iterations: 100 }
        },
        layout: {
          hierarchical: {
            direction: 'UD',
            sortMethod: 'directed'
          }
        }
      }
    }
  }
}

export const COMPLEX_DSL = complex_layout_dsl