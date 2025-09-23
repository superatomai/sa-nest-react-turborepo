export const arrow_keys = {
  id: 'root-container',
  name: 'ExampleApp',
  render: {
    id: 'root-div',
    type: 'div',
    props: {
      className: 'p-6 space-y-4 bg-gray-50 min-h-screen'
    },
    children: [
      {
        id: 'header',
        type: 'header',
        props: {
          className: 'bg-blue-500 text-white p-4 rounded'
        },
        children: 'Header Section'
      },
      {
        id: 'nav',
        type: 'nav',
        props: {
          className: 'bg-green-500 text-white p-4 rounded'
        },
        children: 'Navigation Section'
      },
      {
        id: 'main-content',
        type: 'main',
        props: {
          className: 'bg-yellow-100 p-4 rounded space-y-2'
        },
        children: [
          {
            id: 'content-title',
            type: 'h2',
            props: {
              className: 'text-xl font-bold'
            },
            children: 'Main Content'
          },
          {
            id: 'content-paragraph',
            type: 'p',
            props: {
              className: 'text-gray-700'
            },
            children: 'This is some example content. Try selecting elements and using arrow keys to navigate!'
          },
          {
            id: 'button-container',
            type: 'div',
            props: {
              className: 'flex space-x-2'
            },
            children: [
              {
                id: 'btn-1',
                type: 'button',
                props: {
                  className: 'bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
                },
                children: 'Button 1'
              },
              {
                id: 'btn-2',
                type: 'button',
                props: {
                  className: 'bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600'
                },
                children: 'Button 2'
              },
              {
                id: 'btn-3',
                type: 'button',
                props: {
                  className: 'bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600'
                },
                children: 'Button 3'
              }
            ]
          }
        ]
      },
      {
        id: 'sidebar',
        type: 'aside',
        props: {
          className: 'bg-purple-500 text-white p-4 rounded'
        },
        children: 'Sidebar Section'
      },
      {
        id: 'footer',
        type: 'footer',
        props: {
          className: 'bg-gray-600 text-white p-4 rounded'
        },
        children: 'Footer Section'
      }
    ]
  }
}

export const keyboard_navigation_test = {
  id: 'keyboard-test-app',
  name: 'KeyboardNavigationTest',
  data: {
    users: [
      { id: 'user-1', name: 'Alice Johnson', role: 'Admin', active: true },
      { id: 'user-2', name: 'Bob Smith', role: 'User', active: true },
      { id: 'user-3', name: 'Carol Davis', role: 'Manager', active: false },
      { id: 'user-4', name: 'David Wilson', role: 'User', active: true }
    ],
    products: [
      { id: 'prod-1', name: 'Laptop Pro', price: 1299, category: 'Electronics' },
      { id: 'prod-2', name: 'Wireless Mouse', price: 29, category: 'Accessories' },
      { id: 'prod-3', name: 'Monitor 4K', price: 449, category: 'Electronics' },
      { id: 'prod-4', name: 'Keyboard Mechanical', price: 129, category: 'Accessories' }
    ],
    categories: ['Electronics', 'Accessories', 'Software', 'Books']
  },
  render: {
    id: 'app-root',
    type: 'div',
    props: {
      className: 'p-6 bg-gray-50 min-h-screen space-y-6'
    },
    children: [
      {
        id: 'app-header',
        type: 'header',
        props: {
          className: 'bg-blue-100 text-blue-800 p-4 rounded-lg shadow-md'
        },
        children: [
          {
            id: 'header-title',
            type: 'h1',
            props: {
              className: 'text-2xl font-bold'
            },
            children: '🎹 Keyboard Navigation Test App'
          },
          {
            id: 'header-subtitle',
            type: 'p',
            props: {
              className: 'text-blue-600 mt-2'
            },
            children: 'Test all keyboard navigation features with Tab, Enter, Arrow keys, and Ctrl+D'
          }
        ]
      },
      {
        id: 'main-container',
        type: 'main',
        props: {
          className: 'grid grid-cols-1 md:grid-cols-2 gap-6'
        },
        children: [
          {
            id: 'users-section',
            type: 'section',
            props: {
              className: 'bg-white p-6 rounded-lg shadow-md'
            },
            children: [
              {
                id: 'users-title',
                type: 'h2',
                props: {
                  className: 'text-xl font-semibold mb-4 text-gray-800'
                },
                children: '👥 Users List (For Loop)'
              },
              {
                id: 'users-list',
                type: 'div',
                props: {
                  className: 'space-y-3'
                },
                for: {
                  in: { $bind: 'users' },
                  as: 'user',
                  key: 'user.id'
                },
                children: {
                  id: 'user-card',
                  type: 'div',
                  props: {
                    className: {
                      $exp: `'p-4 border rounded-lg ' + (user.active ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50')`
                    }
                  },
                  children: [
                    {
                      id: 'user-name',
                      type: 'h3',
                      props: {
                        className: 'font-medium text-gray-900'
                      },
                      children: { $bind: 'user.name' }
                    },
                    {
                      id: 'user-details',
                      type: 'div',
                      props: {
                        className: 'flex justify-between items-center mt-2'
                      },
                      children: [
                        {
                          id: 'user-role',
                          type: 'span',
                          props: {
                            className: 'text-sm text-gray-600'
                          },
                          children: { $bind: 'user.role' }
                        },
                        {
                          id: 'user-status',
                          type: 'span',
                          props: {
                            className: {
                              $exp: `'px-2 py-1 text-xs rounded-full ' + (user.active ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800')`
                            }
                          },
                          children: {
                            $exp: `user.active ? 'Active' : 'Inactive'`
                          }
                        }
                      ]
                    }
                  ]
                }
              }
            ]
          },
          {
            id: 'products-section',
            type: 'section',
            props: {
              className: 'bg-white p-6 rounded-lg shadow-md'
            },
            children: [
              {
                id: 'products-title',
                type: 'h2',
                props: {
                  className: 'text-xl font-semibold mb-4 text-gray-800'
                },
                children: '🛍️ Products Grid (For Loop)'
              },
              {
                id: 'products-grid',
                type: 'div',
                props: {
                  className: 'grid grid-cols-1 sm:grid-cols-2 gap-4'
                },
                for: {
                  in: { $bind: 'products' },
                  as: 'product',
                  key: 'product.id'
                },
                children: {
                  id: 'product-card',
                  type: 'div',
                  props: {
                    className: 'border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'
                  },
                  children: [
                    {
                      id: 'product-name',
                      type: 'h3',
                      props: {
                        className: 'font-medium text-gray-900 mb-2'
                      },
                      children: { $bind: 'product.name' }
                    },
                    {
                      id: 'product-info',
                      type: 'div',
                      props: {
                        className: 'space-y-1'
                      },
                      children: [
                        {
                          id: 'product-price',
                          type: 'p',
                          props: {
                            className: 'text-lg font-bold text-green-700'
                          },
                          children: {
                            $exp: `'$' + product.price`
                          }
                        },
                        {
                          id: 'product-category',
                          type: 'p',
                          props: {
                            className: 'text-sm text-gray-500'
                          },
                          children: { $bind: 'product.category' }
                        }
                      ]
                    }
                  ]
                }
              }
            ]
          }
        ]
      },
      {
        id: 'actions-section',
        type: 'section',
        props: {
          className: 'bg-white p-6 rounded-lg shadow-md'
        },
        children: [
          {
            id: 'actions-title',
            type: 'h2',
            props: {
              className: 'text-xl font-semibold mb-4 text-gray-800'
            },
            children: '⚡ Action Buttons'
          },
          {
            id: 'actions-grid',
            type: 'div',
            props: {
              className: 'grid grid-cols-2 md:grid-cols-4 gap-4'
            },
            children: [
              {
                id: 'btn-add',
                type: 'button',
                props: {
                  className: 'bg-green-100 text-green-800 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors border border-green-300'
                },
                children: '➕ Add'
              },
              {
                id: 'btn-edit',
                type: 'button',
                props: {
                  className: 'bg-blue-100 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors border border-blue-300'
                },
                children: '✏️ Edit'
              },
              {
                id: 'btn-delete',
                type: 'button',
                props: {
                  className: 'bg-red-100 text-red-800 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors border border-red-300'
                },
                children: '🗑️ Delete'
              },
              {
                id: 'btn-save',
                type: 'button',
                props: {
                  className: 'bg-purple-100 text-purple-800 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors border border-purple-300'
                },
                children: '💾 Save'
              }
            ]
          }
        ]
      },
      {
        id: 'categories-section',
        type: 'section',
        props: {
          className: 'bg-white p-6 rounded-lg shadow-md'
        },
        children: [
          {
            id: 'categories-title',
            type: 'h2',
            props: {
              className: 'text-xl font-semibold mb-4 text-gray-800'
            },
            children: '🏷️ Categories (Simple For Loop)'
          },
          {
            id: 'categories-list',
            type: 'div',
            props: {
              className: 'flex flex-wrap gap-2'
            },
            for: {
              in: { $bind: 'categories' },
              as: 'category',
              key: 'category'
            },
            children: {
              id: 'category-tag',
              type: 'span',
              props: {
                className: 'px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium'
              },
              children: { $bind: 'category' }
            }
          }
        ]
      },
      {
        id: 'app-footer',
        type: 'footer',
        props: {
          className: 'bg-gray-100 text-gray-800 p-4 rounded-lg text-center border border-gray-300'
        },
        children: [
          {
            id: 'footer-text',
            type: 'p',
            props: {
              className: 'text-sm'
            },
            children: '🧪 Keyboard Navigation Testing Environment'
          },
          {
            id: 'footer-instructions',
            type: 'p',
            props: {
              className: 'text-xs text-gray-600 mt-1'
            },
            children: 'Use Tab/Shift+Tab, Enter/Shift+Enter, Arrow keys, and Ctrl+D to test navigation'
          }
        ]
      }
    ]
  }
}

export const TEST_DSL = keyboard_navigation_test
