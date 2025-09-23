export const complex_layout_dsl = {
  id: 'dashboard-app',
  name: 'Dashboard with Sidebar and Forms',
  data: {
    currentUser: { name: 'John Doe', role: 'Admin' },
    dashboardStats: { users: 1250, projects: 42, revenue: 98500 },
    formData: {
      profile: { firstName: '', lastName: '', email: '', phone: '' },
      settings: { theme: 'light', notifications: true, language: 'en' }
    }
  },
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
          }
        ]
      }
    ]
  }
}

export const COMPLEX_DSL = complex_layout_dsl