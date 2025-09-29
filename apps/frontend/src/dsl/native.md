# Native Components Documentation

Native components are  accessed using the `COMP_` prefix in the `type` field.

## Chart Components

### ECharts (COMP_ECHART)
Advanced charting library for creating interactive visualizations.

```json
{
  "id": "sales-chart",
  "type": "COMP_ECHART",
  "props": {
    "option": {
      "title": {
        "text": "Monthly Sales"
      },
      "xAxis": {
        "type": "category",
        "data": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
      },
      "yAxis": {
        "type": "value"
      },
      "series": [{
        "data": [120, 200, 150, 80, 70, 110],
        "type": "bar"
      }]
    },
    "style": {
      "width": "100%",
      "height": "400px"
    }
  }
}
```

#### Dynamic Chart with Data Binding
```json
{
  "id": "dynamic-chart",
  "type": "COMP_ECHART",
  "props": {
    "option": {
      "$exp": "{ title: { text: chartTitle }, xAxis: { type: 'category', data: categories }, yAxis: { type: 'value' }, series: [{ data: salesData, type: 'line' }] }",
      "$deps": ["chartTitle", "categories", "salesData"]
    },
    "style": {
      "width": "100%",
      "height": "300px"
    }
  }
}
```

## Table Components

### AG Grid (COMP_AGGRID)
Enterprise-grade data grid with advanced features.

```json
{
  "id": "users-grid",
  "type": "COMP_AGGRID",
  "props": {
    "columnDefs": [
      {
        "headerName": "Name",
        "field": "name",
        "sortable": true,
        "filter": true
      },
      {
        "headerName": "Email",
        "field": "email",
        "sortable": true,
        "filter": true
      },
      {
        "headerName": "Role",
        "field": "role",
        "sortable": true
      }
    ],
    "rowData": {
      "$bind": "users"
    },
    "style": {
      "width": "100%",
      "height": "400px"
    }
  }
}
```

### HandsOnTable (COMP_HANDSONTABLE)
Spreadsheet-like data grid with Excel-like editing capabilities.

```json
{
  "id": "spreadsheet",
  "type": "COMP_HANDSONTABLE",
  "props": {
    "data": {
      "$bind": "spreadsheetData"
    },
    "colHeaders": ["Product", "Q1", "Q2", "Q3", "Q4"],
    "rowHeaders": true,
    "width": "100%",
    "height": 300,
    "licenseKey": "non-commercial-and-evaluation"
  }
}
```

### Luckysheet (COMP_LUCKYSHEET)
Full-featured online spreadsheet application.

```json
{
  "id": "excel-editor",
  "type": "COMP_LUCKYSHEET",
  "props": {
    "containerId": "luckysheet-container",
    "options": {
      "container": "luckysheet-container",
      "title": "Budget Spreadsheet",
      "lang": "en"
    },
    "style": {
      "width": "100%",
      "height": "500px"
    }
  }
}
```

## Map Components

### Leaflet Maps (COMP_LEAFLET)
Open-source interactive maps.

```json
{
  "id": "location-map",
  "type": "COMP_LEAFLET",
  "props": {
    "center": [51.505, -0.09],
    "zoom": 13,
    "markers": [
      {
        "position": [51.5, -0.09],
        "popup": "London"
      }
    ],
    "style": {
      "width": "100%",
      "height": "400px"
    }
  }
}
```

#### Dynamic Map with User Location
```json
{
  "id": "user-map",
  "type": "COMP_LEAFLET",
  "props": {
    "center": {
      "$bind": "userLocation.coordinates"
    },
    "zoom": 15,
    "markers": {
      "$exp": "nearbyLocations.map(loc => ({ position: loc.coords, popup: loc.name }))",
      "$deps": ["nearbyLocations"]
    },
    "style": {
      "width": "100%",
      "height": "300px"
    }
  }
}
```

### Mapbox GL (COMP_MAPBOX)
Advanced vector maps with WebGL rendering.

```json
{
  "id": "mapbox-view",
  "type": "COMP_MAPBOX",
  "props": {
    "accessToken": {
      "$bind": "mapboxToken"
    },
    "style": "mapbox://styles/mapbox/streets-v11",
    "center": [-74.006, 40.7128],
    "zoom": 12,
    "style": {
      "width": "100%",
      "height": "400px"
    }
  }
}
```

## Document Components

### PDF Viewer (COMP_PDF_VIEWER)
Display PDF documents with navigation controls.

```json
{
  "id": "document-viewer",
  "type": "COMP_PDF_VIEWER",
  "props": {
    "url": {
      "$bind": "documentUrl"
    },
    "scale": 1.0,
    "style": {
      "width": "100%",
      "height": "600px",
      "border": "1px solid #ccc"
    }
  }
}
```

### Markdown Renderer (COMP_MARKDOWN)
Render Markdown content with syntax highlighting and math support.

```json
{
  "id": "readme-content",
  "type": "COMP_MARKDOWN",
  "props": {
    "content": {
      "$bind": "readmeText"
    },
    "enableMath": true,
    "enableGfm": true,
    "theme": "github",
    "className": "markdown-body"
  }
}
```

#### Dynamic Markdown with Template
```json
{
  "id": "report-template",
  "type": "COMP_MARKDOWN",
  "props": {
    "content": {
      "$exp": "`# ${reportTitle}\\n\\n## Summary\\n${reportSummary}\\n\\n## Data\\n${reportData}`",
      "$deps": ["reportTitle", "reportSummary", "reportData"]
    },
    "enableMath": true,
    "theme": "default"
  }
}
```

## Visualization Components

### Vis Network (COMP_VIS_NETWORK)
Interactive network graph visualization.

```json
{
  "id": "network-graph",
  "type": "COMP_VIS_NETWORK",
  "props": {
    "nodes": [
      {"id": 1, "label": "Node 1"},
      {"id": 2, "label": "Node 2"},
      {"id": 3, "label": "Node 3"}
    ],
    "edges": [
      {"from": 1, "to": 2},
      {"from": 1, "to": 3}
    ],
    "options": {
      "width": "100%",
      "height": "400px",
      "nodes": {
        "color": "#97C2FC"
      }
    }
  }
}
```

#### Dynamic Network with Data Binding
```json
{
  "id": "org-chart",
  "type": "COMP_VIS_NETWORK",
  "props": {
    "nodes": {
      "$bind": "employees"
    },
    "edges": {
      "$bind": "relationships"
    },
    "options": {
      "layout": {
        "hierarchical": {
          "direction": "UD"
        }
      }
    }
  }
}
```

### Three.js Scene (COMP_THREE_SCENE)
3D graphics and animations.

```json
{
  "id": "3d-model",
  "type": "COMP_THREE_SCENE",
  "props": {
    "scene": {
      "background": "#f0f0f0",
      "objects": [
        {
          "type": "cube",
          "position": [0, 0, 0],
          "rotation": [0, 0, 0],
          "color": "#ff6600"
        }
      ]
    },
    "camera": {
      "position": [0, 0, 5],
      "fov": 75
    },
    "style": {
      "width": "100%",
      "height": "400px"
    }
  }
}
```

## Database Components

### DuckDB Interface (COMP_DUCKDB_INTERFACE)
Complete database interface with query execution.

```json
{
  "id": "data-explorer",
  "type": "COMP_DUCKDB_INTERFACE",
  "props": {
    "defaultQuery": "SELECT * FROM uploaded_data LIMIT 100",
    "showTables": true,
    "allowExport": true
  }
}
```

### DuckDB Query (COMP_DUCKDB)
Execute SQL queries against DuckDB.

```json
{
  "id": "query-results",
  "type": "COMP_DUCKDB",
  "props": {
    "query": {
      "$bind": "sqlQuery"
    },
    "params": {
      "$bind": "queryParams"
    },
    "onResult": "handleQueryResult",
    "onError": "handleQueryError"
  }
}
```

### DuckDB File Upload (COMP_DUCKDB_UPLOAD)
Upload and import files into DuckDB.

```json
{
  "id": "file-uploader",
  "type": "COMP_DUCKDB_UPLOAD",
  "props": {
    "acceptedTypes": [".csv", ".json", ".parquet"],
    "onUpload": "handleFileUpload",
    "maxFileSize": "10MB",
    "tableName": {
      "$bind": "targetTable"
    }
  }
}
```

## Icon Components

### Iconify Icons (COMP_ICONIFY_ICON)
Comprehensive icon library with web components.

```json
{
  "id": "save-icon",
  "type": "COMP_ICONIFY_ICON",
  "props": {
    "icon": "mdi:content-save",
    "width": 24,
    "height": 24,
    "color": "#2196F3"
  }
}
```

#### Dynamic Icons
```json
{
  "id": "status-icon",
  "type": "COMP_ICONIFY_ICON",
  "props": {
    "icon": {
      "$exp": "status === 'success' ? 'mdi:check-circle' : status === 'error' ? 'mdi:alert-circle' : 'mdi:loading'",
      "$deps": ["status"]
    },
    "color": {
      "$exp": "status === 'success' ? '#4CAF50' : status === 'error' ? '#F44336' : '#2196F3'",
      "$deps": ["status"]
    },
    "width": 20,
    "height": 20
  }
}
```

## Advanced Usage Patterns

### Nested Native Components
```json
{
  "id": "dashboard",
  "type": "div",
  "props": {
    "className": "dashboard-grid"
  },
  "children": [
    {
      "id": "metrics-chart",
      "type": "COMP_ECHART",
      "props": {
        "option": {
          "$bind": "metricsChartConfig"
        }
      }
    },
    {
      "id": "data-table",
      "type": "COMP_AGGRID",
      "props": {
        "columnDefs": {
          "$bind": "tableColumns"
        },
        "rowData": {
          "$bind": "tableData"
        }
      }
    }
  ]
}
```

### Component with Loading States
```json
{
  "id": "map-container",
  "type": "div",
  "if": {
    "$exp": "!isLoadingMapData",
    "$deps": ["isLoadingMapData"]
  },
  "else": {
    "id": "loading-message",
    "type": "div",
    "children": "Loading map data..."
  },
  "children": {
    "id": "location-map",
    "type": "COMP_LEAFLET",
    "props": {
      "center": {
        "$bind": "mapCenter"
      },
      "markers": {
        "$bind": "mapMarkers"
      }
    }
  }
}
```