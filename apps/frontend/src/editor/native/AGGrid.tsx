import React, { useEffect, useRef, useState } from 'react';

// AGGrid data grid component
export const AGGrid: React.FC<{ 
  columnDefs?: any[];
  rowData?: any[];
  style?: React.CSSProperties;
  [key: string]: any;
}> = ({ 
  columnDefs = [],
  rowData = [],
  style = { width: '100%', height: '400px' },
  ...gridOptions
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const gridApi = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadAttempted = useRef(false);

  useEffect(() => {
    if (loadAttempted.current) return;
    loadAttempted.current = true;

    const loadAGGrid = async () => {
      try {
        // Check if AG Grid is already available
        if ((window as any).agGrid) {
          setIsReady(true);
          return;
        }

        // Check if script already exists
        if (document.getElementById('ag-grid-script')) {
          const checkInterval = setInterval(() => {
            if ((window as any).agGrid) {
              clearInterval(checkInterval);
              setIsReady(true);
            }
          }, 100);
          
          setTimeout(() => {
            clearInterval(checkInterval);
            if (!(window as any).agGrid) {
              setError('AG Grid loading timeout');
            }
          }, 10000);
          return;
        }

        // Create script element
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/ag-grid-community/dist/ag-grid-community.min.js';
        script.id = 'ag-grid-script';
        script.async = true;

        const loadPromise = new Promise<void>((resolve, reject) => {
          script.onload = () => {
            if ((window as any).agGrid) {
              resolve();
            } else {
              reject(new Error('AG Grid not available after script load'));
            }
          };

          script.onerror = () => {
            reject(new Error('Failed to load AG Grid script'));
          };

          setTimeout(() => {
            if (!(window as any).agGrid) {
              reject(new Error('AG Grid loading timeout'));
            }
          }, 10000);
        });

        document.head.appendChild(script);
        await loadPromise;
        setIsReady(true);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load AG Grid');
      }
    };

    loadAGGrid();
  }, []);

  useEffect(() => {
    if (isReady && gridRef.current && (window as any).agGrid) {
      try {
        // Dispose existing grid if any
        if (gridApi.current) {
          gridApi.current.destroy();
        }

        // Create grid options
        const options = {
          columnDefs,
          rowData,
          domLayout: 'normal',
          ...gridOptions
        };

        // Create new grid
        gridApi.current = (window as any).agGrid.createGrid(gridRef.current, options);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Grid initialization error');
      }
    }
  }, [isReady, columnDefs, rowData, gridOptions]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (gridApi.current) {
        gridApi.current.destroy();
      }
    };
  }, []);

  if (error) {
    return (
      <div style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid #ef4444',
        borderRadius: '8px',
        backgroundColor: '#fef2f2',
        color: '#dc2626',
        padding: '16px',
        textAlign: 'center'
      }}>
        <div>
          <div><strong>AG Grid Error:</strong></div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px dashed #ccc',
        borderRadius: '4px',
        color: '#666',
        backgroundColor: '#fafafa'
      }}>
        Loading AG Grid...
      </div>
    );
  }

  return (
    <div 
      ref={gridRef} 
      style={{
        ...style,
        border: '1px solid #ddd',
        borderRadius: '4px'
      }}
      className="ag-theme-alpine"
    />
  );
};