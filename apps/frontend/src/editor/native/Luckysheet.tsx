import React, { useEffect, useRef, useState } from 'react';

// Luckysheet spreadsheet component - relies on ComponentRegistry for loading
export const Luckysheet: React.FC<{ 
  data?: any[][];
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
  [key: string]: any;
}> = ({ 
  data = [
    ['Product', 'Q1', 'Q2', 'Q3', 'Q4'],
    ['Laptop', 1200, 1350, 1100, 1400],
    ['Desktop', 800, 750, 900, 850],
    ['Tablet', 600, 800, 750, 900]
  ],
  width = '100%',
  height = 400,
  style = {}
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkLuckysheet = () => {
      if ((window as any).luckysheet) {
        setTimeout(() => {
          setIsReady(true);
        }, 100);
        return;
      }

      // Check periodically for Luckysheet to be loaded by ComponentRegistry
      const checkInterval = setInterval(() => {
        if ((window as any).luckysheet) {
          clearInterval(checkInterval);
          setTimeout(() => {
            setIsReady(true);
          }, 100);
        }
      }, 100);

      // Timeout after 15 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!(window as any).luckysheet) {
          setError('Luckysheet not loaded - ComponentRegistry should handle loading');
        }
      }, 15000);
    };

    checkLuckysheet();
  }, []);

  useEffect(() => {
    if (isReady && containerRef.current && (window as any).luckysheet) {
      try {
        const container = containerRef.current;
        
        // Create unique ID for this instance
        const containerId = `luckysheet-${Date.now()}`;
        container.id = containerId;

        // Initialize Luckysheet
        (window as any).luckysheet.create({
          container: containerId,
          data: [{
            name: "Sheet1",
            data: data
          }],
          title: "Spreadsheet",
          lang: 'en'
        });

      } catch (err) {
        console.error('Luckysheet initialization error:', err);
        setError(err instanceof Error ? err.message : 'Luckysheet initialization error');
      }
    }
  }, [isReady, data]);

  // Cleanup
  useEffect(() => {
    return () => {
      if ((window as any).luckysheet && (window as any).luckysheet.destroy) {
        try {
          (window as any).luckysheet.destroy();
        } catch (err) {
          console.log('Luckysheet cleanup error:', err);
        }
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
          <div><strong>Luckysheet Error:</strong></div>
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
        Loading Luckysheet...
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="luckysheet-container"
      style={{
        ...style,
        width: width || '100%',
        height: height || 400
      }}
    />
  );
};