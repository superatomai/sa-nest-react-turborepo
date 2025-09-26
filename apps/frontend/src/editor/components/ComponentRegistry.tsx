import React, { useEffect, useState } from 'react';
import { AGGrid } from '../native/AGGrid';
import { HandsOnTable } from '../native/HandsOnTable';
import { LeafletMap } from '../native/LeafletMap';
import { MapboxMap } from '../native/MapboxMap';
import { VisNetwork } from '../native/VisNetwork';
import { ThreeScene } from '../native/ThreeScene';
import { PDFViewer } from '../native/PDFViewer';
import { Luckysheet } from '../native/Luckysheet';
import { Markdown } from '../native/Markdown';
import { DuckDBFileUploadComponent } from '../native/DuckDBFileUpload';
import { DuckDBQuery } from '../native/DuckDBQuery';
import { DuckDB } from '../native/DuckDB';
import { EChart } from '../native/EChart';

// Component registry type definitions
export interface ComponentDefinition {
  id: string;
  name: string;
  head: string; // HTML to inject into head (script/link tags)
  COMP: React.ComponentType<any>;
  dependencies?: string[]; // Other components this depends on
  version?: string;
}

export interface ComponentRegistryType {
  [key: string]: ComponentDefinition;
}

// Global state for tracking loaded components with error isolation
const loadedComponents = new Set<string>();
const loadingComponents = new Map<string, Promise<void>>();
const failedComponents = new Set<string>(); // Track failed components separately

// Debug utility to check component states
export const getComponentStates = () => ({
  loaded: Array.from(loadedComponents),
  loading: Array.from(loadingComponents.keys()),
  failed: Array.from(failedComponents)
});

// Reset failed components (for debugging/recovery)
export const resetFailedComponent = (componentId: string) => {
  failedComponents.delete(componentId);
  console.log(`Reset failed state for ${componentId}`);
};

// Reset all failed components
export const resetAllFailedComponents = () => {
  const count = failedComponents.size;
  failedComponents.clear();
  console.log(`Reset ${count} failed components`);
  return count;
};

// Utility to inject HTML into head
const injectToHead = (html: string, id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Clean up any failed elements with the same ID first
    const existingElement = document.getElementById(id);
    if (existingElement) {
      if (existingElement.getAttribute('data-failed') === 'true') {
        console.log(`Removing previously failed element with id ${id}`);
        existingElement.remove();
      } else {
        console.log(`Element with id ${id} already exists and is valid`);
        resolve();
        return;
      }
    }

    console.log(`Injecting elements for ${id}:`, html);
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html.trim();
    
    const elements = Array.from(tempDiv.children);
    
    if (elements.length === 0) {
      resolve();
      return;
    }
    
    let loadedCount = 0;
    let scriptElement: HTMLScriptElement | null = null;
    const totalElements = elements.length;
    
    // Process all elements
    elements.forEach((element, index) => {
      const elementId = `${id}-${index}`;
      
      if (element.tagName === 'SCRIPT') {
        const script = document.createElement('script');
        script.id = elementId;
        scriptElement = script;
        
        // Copy attributes
        Array.from(element.attributes).forEach(attr => {
          script.setAttribute(attr.name, attr.value);
        });
        
        // Set up loading handlers for script
        script.onload = () => {
          console.log(`Script loaded successfully for ${elementId}`);
          loadedCount++;
          if (loadedCount === totalElements) {
            resolve();
          }
        };
        
        script.onerror = (error) => {
          console.error(`Script failed to load for ${elementId}:`, error);
          script.setAttribute('data-failed', 'true');
          reject(new Error(`Failed to load script for ${elementId}`));
        };
        
        document.head.appendChild(script);
      } else if (element.tagName === 'LINK') {
        // For CSS link elements
        const link = document.createElement('link');
        link.id = elementId;
        
        // Copy attributes
        Array.from(element.attributes).forEach(attr => {
          link.setAttribute(attr.name, attr.value);
        });
        
        // CSS links don't have reliable load events, so just count them as loaded
        document.head.appendChild(link);
        console.log(`CSS link added to head for ${elementId}`);
        loadedCount++;
        
        if (loadedCount === totalElements) {
          resolve();
        }
      } else {
        // For other elements
        const clonedElement = element.cloneNode(true) as HTMLElement;
        clonedElement.id = elementId;
        document.head.appendChild(clonedElement);
        loadedCount++;
        
        if (loadedCount === totalElements) {
          resolve();
        }
      }
    });
    
    // Set timeout for script loading
    if (scriptElement) {
      setTimeout(() => {
        if (loadedCount < totalElements) {
          console.warn(`Loading timeout for ${id}`);
          if (scriptElement) {
            scriptElement.setAttribute('data-failed', 'true');
          }
          reject(new Error(`Loading timeout for ${id}`));
        }
      }, 10000); // 10 second timeout
    }
  });
};

// ECharts Component (replaced with SimpleEChart for debugging)

// Iconify Icon Component (using iconify-icon web component)
const IconifyIconComponent: React.FC<{
  icon: string;
  width?: number | string;
  height?: number | string;
  color?: string;
  className?: string;
  [key: string]: any;
}> = ({ icon, width = 24, height = 24, color, className, ...props }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {

    if (customElements.get('iconify-icon')) {
      setIsReady(true);
    } else {
      // Wait for the web component to be defined
      customElements.whenDefined('iconify-icon').then(() => {
        setIsReady(true);
      });
      
      // Timeout after 5 seconds
      const timeout = setTimeout(() => {
        console.warn('iconify-icon web component loading timeout');
        setIsReady(true); // Set ready to show fallback
      }, 5000);
      
      return () => {
        clearTimeout(timeout);
      };
    }
  }, []);

  if (!isReady) {
    return <span style={{ width, height, display: 'inline-block' }}>⏳</span>;
  }

  // Use React.createElement to create the web component
  return React.createElement('iconify-icon', {
    icon,
    width,
    height,
    style: color ? { color } : undefined,
    className,
    ...props
  });
};

// Component Registry
export const COMP_REGISTRY: ComponentRegistryType = {
  COMP_ECHART: {
    id: 'echarts',
    name: 'ECharts',
    head: `<script src="https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js"></script>`,
    COMP: EChart
  },
  
  COMP_AGGRID: {
    id: 'aggrid',
    name: 'AG Grid',
    head: `<script src="https://cdn.jsdelivr.net/npm/ag-grid-community/dist/ag-grid-community.min.js"></script>`,
    COMP: AGGrid
  },

  COMP_HANDSONTABLE: {
    id: 'handsontable',
    name: 'HandsOnTable',
    head: `<script src="https://cdn.jsdelivr.net/npm/handsontable/dist/handsontable.full.min.js"></script>
           <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/handsontable/styles/handsontable.min.css">
           <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/handsontable/styles/ht-theme-main.min.css">`,
    COMP: HandsOnTable
  },

  COMP_LEAFLET: {
    id: 'leaflet',
    name: 'Leaflet Maps',
    head: `<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="anonymous">
           <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin="anonymous"></script>`,
    COMP: LeafletMap
  },

  COMP_MAPBOX: {
    id: 'mapbox',
    name: 'Mapbox GL',
    head: `<link href="https://api.mapbox.com/mapbox-gl-js/v3.14.0/mapbox-gl.css" rel="stylesheet">
           <script src="https://api.mapbox.com/mapbox-gl-js/v3.14.0/mapbox-gl.js"></script>`,
    COMP: MapboxMap
  },

  COMP_VIS_NETWORK: {
    id: 'vis-network',
    name: 'Vis Network',
    head: `<script src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>`,
    COMP: VisNetwork
  },

  COMP_THREE_SCENE: {
    id: 'threejs',
    name: 'Three.js Scene',
    head: `<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r123/three.min.js"></script>`,
    COMP: ThreeScene
  },

  COMP_PDF_VIEWER: {
    id: 'pdfjs',
    name: 'PDF Viewer',
    head: `<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.min.js"></script>`,
    COMP: PDFViewer
  },
  
  COMP_ICONIFY_ICON: {
    id: 'iconify',
    name: 'Iconify Icons',
    head: `<script src="https://code.iconify.design/iconify-icon/2.0.0/iconify-icon.min.js"></script>`,
    COMP: IconifyIconComponent
  },

  COMP_LUCKYSHEET: {
    id: 'luckysheet',
    name: 'Luckysheet Spreadsheet',
    head: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/plugins/css/pluginsCss.css">
           <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/plugins/plugins.css">
           <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/css/luckysheet.css">
           <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/assets/iconfont/iconfont.css">
           <script src="https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/plugins/js/plugin.js"></script>
           <script src="https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/luckysheet.umd.js"></script>`,
    COMP: Luckysheet
  },

  COMP_MARKDOWN: {
    id: 'markdown',
    name: 'Markdown Renderer',
    head: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css">`,
    COMP: Markdown
  },

  COMP_DUCKDB_UPLOAD: {
    id: 'duckdb-upload',
    name: 'DuckDB File Upload',
    head: `<!-- No external dependencies required -->`,
    COMP: DuckDBFileUploadComponent
  },

  COMP_DUCKDB: {
    id: 'duckdb',
    name: 'DuckDB Query',
    head: `<!-- No external dependencies required -->`,
    COMP: DuckDBQuery
  },

  COMP_DUCKDB_INTERFACE: {
    id: 'duckdb-interface',
    name: 'DuckDB Interface',
    head: `<!-- No external dependencies required -->`,
    COMP: DuckDB
  }
};

// Hook to load component dynamically
export const useDynamicComponent = (componentType: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadComponent = async () => {
      const definition = COMP_REGISTRY[componentType];
      if (!definition) {
        setError(`Component ${componentType} not found in registry`);
        return;
      }

      // Check if already loaded
      if (loadedComponents.has(definition.id)) {
        setIsLoaded(true);
        return;
      }

      // Check if previously failed - don't retry immediately
      if (failedComponents.has(definition.id)) {
        setError(`Component ${definition.name} previously failed to load`);
        return;
      }

      // Check if already loading
      if (loadingComponents.has(definition.id)) {
        try {
          await loadingComponents.get(definition.id);
          if (loadedComponents.has(definition.id)) {
            setIsLoaded(true);
          } else {
            setError('Component loading completed but not available');
          }
          return;
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Loading failed');
          return;
        }
      }

      setIsLoading(true);
      setError(null);

      const loadPromise = injectToHead(definition.head, definition.id)
        .then(() => {
          loadedComponents.add(definition.id);
          console.log(`Component ${definition.name} loaded successfully`);
        })
        .catch((err) => {
          console.error(`Failed to load component ${definition.name}:`, err);
          failedComponents.add(definition.id); // Mark as failed
          throw err;
        });

      loadingComponents.set(definition.id, loadPromise);

      try {
        await loadPromise;
        setIsLoaded(true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Loading failed';
        console.error(`Component ${definition.name} failed:`, errorMessage);
        setError(errorMessage);
        failedComponents.add(definition.id); // Ensure it's marked as failed
      } finally {
        setIsLoading(false);
        loadingComponents.delete(definition.id);
      }
    };

    if (componentType.startsWith('COMP_')) {
      loadComponent();
    }
  }, [componentType]);

  return { isLoading, isLoaded, error };
};

// Dynamic Component Wrapper
export const DynamicComponent: React.FC<{
  type: string;
  props?: any;
  children?: React.ReactNode;
}> = ({ type, props = {}, children }) => {
  // Special handling for components that manage their own loading
  if (type === 'COMP_ECHART' || type === 'COMP_THREE_SCENE' || type === 'COMP_PDF_VIEWER') {
    const definition = COMP_REGISTRY[type];
    if (definition) {
      const ComponentToRender = definition.COMP;
      return <ComponentToRender {...props}>{children}</ComponentToRender>;
    }
  }

  // Use registry loading for other components
  return <DynamicComponentWithRegistry type={type} props={props}>{children}</DynamicComponentWithRegistry>;
};

// Separate component for registry-based loading (to avoid hook calls for COMP_ECHART)
const DynamicComponentWithRegistry: React.FC<{
  type: string;
  props?: any;
  children?: React.ReactNode;
}> = ({ type, props = {}, children }) => {
  // Each component has completely isolated state
  const { isLoading, isLoaded, error } = useDynamicComponent(type);

  if (!type.startsWith('COMP_')) {
    return <div>Invalid component type: {type}</div>;
  }

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div style={{
          border: '2px dashed #ef4444',
          padding: '16px',
          borderRadius: '8px',
          backgroundColor: '#fef2f2',
          color: '#dc2626'
        }}>
          <strong>Component Load Error:</strong> {error}
          <br />
          <small>Component: {type}</small>
          <br />
          <small>Other components remain unaffected</small>
        </div>
      );
    }
    return <div>Component unavailable</div>;
  }

  if (isLoading) {
    return (
      <div style={{
        padding: '16px',
        textAlign: 'center',
        color: '#666',
        border: '1px dashed #ccc',
        borderRadius: '4px'
      }}>
        Loading {COMP_REGISTRY[type]?.name || type}...
      </div>
    );
  }

  if (!isLoaded) {
    return <div>Initializing component...</div>;
  }

  const definition = COMP_REGISTRY[type];
  if (!definition) {
    return <div>Component definition not found: {type}</div>;
  }

  const ComponentToRender = definition.COMP;

  return <ComponentToRender {...props}>{children}</ComponentToRender>;
};