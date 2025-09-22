import React, { useEffect, useRef, useState } from 'react';

// HandsOnTable spreadsheet component - relies on ComponentRegistry for loading
export const HandsOnTable: React.FC<{ 
  data?: any[][];
  colHeaders?: string[] | boolean;
  rowHeaders?: string[] | boolean;
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
  [key: string]: any;
}> = ({ 
  data = [['', '', ''], ['', '', ''], ['', '', '']],
  colHeaders = true,
  rowHeaders = true,
  width = '100%',
  height = 400,
  style = {},
  ...hotOptions
}) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const hotInstance = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkHandsOnTable = () => {
      if ((window as any).Handsontable) {
        // Add small delay to ensure CSS is fully applied
        setTimeout(() => {
          setIsReady(true);
        }, 100);
        return;
      }

      // Check periodically for HandsOnTable to be loaded by ComponentRegistry
      const checkInterval = setInterval(() => {
        if ((window as any).Handsontable) {
          clearInterval(checkInterval);
          // Add small delay to ensure CSS is fully applied
          setTimeout(() => {
            setIsReady(true);
          }, 100);
        }
      }, 100);

      // Timeout after 15 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!(window as any).Handsontable) {
          setError('HandsOnTable not loaded - ComponentRegistry should handle loading');
        }
      }, 15000);
    };

    checkHandsOnTable();
  }, []);

  useEffect(() => {
    if (isReady && tableRef.current && (window as any).Handsontable && data) {
      try {
        // Dispose existing instance
        if (hotInstance.current) {
          hotInstance.current.destroy();
        }

        const container = tableRef.current;
        const Handsontable = (window as any).Handsontable;

        // Create HandsOnTable instance
        hotInstance.current = new Handsontable(container, {
          data,
          colHeaders,
          rowHeaders,
          width,
          height,
          stretchH: 'all',
          autoWrapRow: true,
          autoWrapCol: true,
          licenseKey: 'non-commercial-and-evaluation', // For evaluation purposes
          ...hotOptions
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'HandsOnTable initialization error');
      }
    }
  }, [isReady, data, colHeaders, rowHeaders, width, height, hotOptions]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (hotInstance.current) {
        hotInstance.current.destroy();
      }
    };
  }, []);

  if (error) {
    return (
      <div style={{
        ...style,
        width: width || '100%',
        height: height || 400,
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
          <div><strong>HandsOnTable Error:</strong></div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div style={{
        ...style,
        width: width || '100%',
        height: height || 400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px dashed #ccc',
        borderRadius: '4px',
        color: '#666',
        backgroundColor: '#fafafa'
      }}>
        Loading HandsOnTable...
      </div>
    );
  }

  return (
    <div 
      ref={tableRef}
      className="handsontable-container"
      style={{
        ...style,
        width: width || '100%',
        height: height || 400
      }}
    />
  );
};