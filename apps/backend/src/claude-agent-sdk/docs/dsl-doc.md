# DSL Schema Documentation

This document provides examples and usage patterns for the DSL schemas to be generated

## Expressions

Expressions are JavaScript expressions that can be evaluated dynamically. Use `$exp` for any valid JavaScript expression and `$deps` to specify which data variables the expression depends on.

```json
{
  "$exp": "user.name + ' is logged in'",
  "$deps": ["user"]
}
```

The expression can be any valid JavaScript code - mathematical operations, conditionals, array methods, string manipulation, etc.

## Bindings

Bindings connect data sources to UI elements using dot notation paths.

### Simple Binding
```json
{
  "$bind": "user.profile.email"
}
```

### Binding with Transformations (Planned)
```json
{
  "$bind": "user.name",
  "$transform": [
    {
      "name": "uppercase"
    },
    {
      "name": "truncate",
      "args": [20]
    }
  ]
}
```
*Note: Transformations are not fully implemented in current renderer*

### String Interpolation
The renderer supports both `${}` and `{{}}` syntax for string interpolation:

```json
{
  "children": "Hello ${user.name}, you have {{notifications.length}} messages"
}
```

## For Directives

For directives enable iteration over collections and are rendered as container elements with loop items inside.

### Basic Loop
```json
{
  "id": "user-list",
  "type": "div",
  "for": {
    "in": {
      "$bind": "users"
    },
    "as": "user"
  },
  "children": {
    "id": "user-item",
    "type": "div",
    "props": {
      "className": "user-card"
    },
    "children": {
      "$bind": "user.name"
    }
  }
}
```

### Loop with Index and Key
```json
{
  "id": "product-grid",
  "type": "div",
  "for": {
    "in": {
      "$bind": "products"
    },
    "as": "product",
    "index": "idx",
    "key": "product.id"
  },
  "children": {
    "id": "product-card",
    "type": "div",
    "props": {
      "className": "product-item"
    },
    "children": [
      {
        "id": "product-name",
        "type": "h3",
        "children": {
          "$bind": "product.name"
        }
      },
      {
        "id": "product-index",
        "type": "span",
        "children": {
          "$exp": "'Item #' + (idx + 1)",
          "$deps": ["idx"]
        }
      }
    ]
  }
}
```

## Query Specifications

Query specifications define data fetching operations (integrated with component data).

### GraphQL Query
```json
{
  "query": {
    "graphql": "query GetUser($id: ID!) { user(id: $id) { name email avatar } }",
    "variables": {
      "id": {
        "$bind": "selectedUserId"
      }
    },
    "key": "user-profile",
    "refetchPolicy": "cache-first"
  }
}
```

### SQL Query
```json
{
  "query": {
    "sql": "SELECT * FROM orders WHERE user_id = $1 AND status = $2",
    "params": {
      "1": {
        "$bind": "currentUser.id"
      },
      "2": "completed"
    },
    "key": "user-orders"
  }
}
```

## UI Elements

UI elements are the building blocks rendered by the UpdatedDSLRenderer.

### Basic HTML Elements

#### Text Element
```json
{
  "id": "welcome-text",
  "type": "div",
  "props": {
    "className": "welcome-message"
  },
  "children": "Welcome to our app!"
}
```

#### Dynamic Text with Expression
```json
{
  "id": "user-greeting",
  "type": "span",
  "children": {
    "$exp": "'Hello, ' + user.name + '!'",
    "$deps": ["user"]
  }
}
```

#### Button with Click Handler
```json
{
  "id": "submit-btn",
  "type": "button",
  "props": {
    "className": "btn btn-primary",
    "onClick": "handleSubmit"
  },
  "children": "Submit"
}
```

### Conditional Rendering

Conditionals support both **expressions** (`$exp`) and **bindings** (`$bind`).

#### Simple Variable Check (using $bind)
```json
{
  "id": "form-container",
  "type": "div",
  "if": {
    "$bind": "isVisible"
  },
  "children": "Form content"
}
```

#### Expression Check (using $exp)
```json
{
  "id": "admin-panel",
  "type": "div",
  "if": {
    "$exp": "user.role === 'admin'",
    "$deps": ["user"]
  },
  "else": {
    "id": "access-denied",
    "type": "div",
    "children": "Access denied"
  },
  "children": {
    "id": "admin-content",
    "type": "div",
    "children": "Admin panel content"
  }
}
```

#### ElseIf Conditions
```json
{
  "id": "status-message",
  "type": "div",
  "if": {
    "$exp": "status === 'loading'",
    "$deps": ["status"]
  },
  "elseIf": {
    "$exp": "status === 'error'",
    "$deps": ["status"]
  },
  "else": {
    "id": "success",
    "type": "div",
    "children": "Success!"
  },
  "children": "Loading..."
}
```

### Navigation with link-to

#### Simple Navigation
```json
{
  "id": "profile-button",
  "type": "button",
  "props": {
    "className": "nav-button"
  },
  "children": "View Profile",
  "link-to": "user-profile"
}
```

#### Navigation with Parameters
```json
{
  "id": "edit-product",
  "type": "button",
  "children": "Edit",
  "link-to": {
    "ui": "product-editor",
    "params": {
      "productId": {
        "$bind": "product.id"
      },
      "mode": "edit"
    }
  }
}
```

### Platform Overrides

```json
{
  "id": "responsive-text",
  "type": "div",
  "props": {
    "className": "base-text"
  },
  "children": "Default content",
  "platform": {
    "web": {
      "props": {
        "style": {
          "fontSize": "16px"
        }
      }
    },
    "ios": {
      "props": {
        "style": {
          "fontSize": "18px"
        }
      }
    },
    "android": {
      "props": {
        "style": {
          "fontSize": "17px"
        }
      }
    }
  }
}
```

## UI Components

UI Components are reusable units with their own props, state, methods, and render tree.

### Basic Component
```json
{
  "id": "counter-component",
  "name": "Counter",
  "props": {
    "initialValue": 0,
    "step": 1
  },
  "states": {
    "count": {
      "$bind": "initialValue"
    }
  },
  "data": {
    "theme": "default"
  },
  "methods": {
    "increment": {
      "fn": "() => setState('count', count + step)"
    },
    "decrement": {
      "fn": "() => setState('count', count - step)"
    }
  },
  "render": {
    "id": "counter-view",
    "type": "div",
    "props": {
      "className": "counter-widget"
    },
    "children": [
      {
        "id": "count-display",
        "type": "span",
        "props": {
          "className": "count-value"
        },
        "children": {
          "$bind": "count"
        }
      },
      {
        "id": "increment-btn",
        "type": "button",
        "props": {
          "onClick": "increment"
        },
        "children": "+"
      },
      {
        "id": "decrement-btn",
        "type": "button",
        "props": {
          "onClick": "decrement"
        },
        "children": "-"
      }
    ]
  }
}
```

### Component with Effects
```json
{
  "id": "data-fetcher",
  "name": "DataFetcher",
  "props": {
    "url": "",
    "autoFetch": true
  },
  "states": {
    "data": null,
    "loading": false,
    "error": null
  },
  "effects": [
    {
      "fn": "() => { if (autoFetch && url) fetchData(); }",
      "deps": ["url", "autoFetch"]
    }
  ],
  "methods": {
    "fetchData": {
      "fn": "async () => { setState('loading', true); try { const response = await fetch(url); const data = await response.json(); setState('data', data); } catch (err) { setState('error', err.message); } finally { setState('loading', false); } }"
    }
  },
  "render": {
    "id": "data-view",
    "type": "div",
    "if": {
      "$exp": "!loading && !error",
      "$deps": ["loading", "error"]
    },
    "else": {
      "id": "loading-state",
      "type": "div",
      "children": {
        "$exp": "loading ? 'Loading...' : error",
        "$deps": ["loading", "error"]
      }
    },
    "children": {
      "id": "data-content",
      "type": "pre",
      "children": {
        "$exp": "JSON.stringify(data, null, 2)",
        "$deps": ["data"]
      }
    }
  }
}
```

## Supported HTML Elements

The renderer supports these HTML element types (mapped via `actualElement.type.toLowerCase()`):

- **Containers**: `div`, `view`, `section`, `header`, `footer`
- **Text**: `span`, `text`, `h1`, `h2`, `h3`, `p`
- **Forms**: `button`, `input`, `select`, `option`
- **Lists**: `ul`, `li`
- **Media**: `img`
- **Links**: `a`
- **Tables**: `table`, `thead`, `tbody`, `tr`, `th`, `td`
- **SVG**: `svg`, `path`, `circle`, `rect`, `line`, `polygon`, `polyline`, `g`

Unknown types default to `div` elements.

## Implementation Notes

### Data Context Resolution
The renderer creates a full context from:
```javascript
const fullContext = {
  ...uiComponent.data || {},      // Static data
  states: uiComponent.states || {}, // Component state
  props: uiComponent.props || {}    // Component props
}
```

### Expression Evaluation
- Uses safe `new Function()` evaluation with controlled context
- Supports Math, Date, Array methods, and data flattening
- Expressions are evaluated with access to component data, states, and props

### Loop Implementation
- Creates container element with original props and classes
- Loop items are rendered as React Fragments with unique keys
- Each loop iteration gets its own context with loop variable
