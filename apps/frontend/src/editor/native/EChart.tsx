import React, { useEffect, useRef, useState } from 'react';

// Simple, reliable EChart component
export const EChart: React.FC<{ option?: any; style?: React.CSSProperties }> = ({ 
  option, 
  style = { width: '100%', height: '400px' }
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadAttempted = useRef(false);

  useEffect(() => {
    // Prevent multiple load attempts
    if (loadAttempted.current) {
      return;
    }
    loadAttempted.current = true;

    const loadECharts = async () => {
      try {
        // Check if ECharts is already available
        if ((window as any).echarts) {
          setIsReady(true);
          return;
        }

        // Check if script already exists
        if (document.getElementById('echarts-script')) {
          // Wait for existing script to load
          const checkInterval = setInterval(() => {
            if ((window as any).echarts) {
              clearInterval(checkInterval);
              setIsReady(true);
            }
          }, 100);
          
          // Timeout after 10 seconds
          setTimeout(() => {
            clearInterval(checkInterval);
            if (!(window as any).echarts) {
              setError('ECharts loading timeout');
            }
          }, 10000);
          return;
        }

        // Create script element
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js';
        script.id = 'echarts-script';
        script.async = true;

        const loadPromise = new Promise<void>((resolve, reject) => {
          script.onload = () => {
            if ((window as any).echarts) {
              resolve();
            } else {
              reject(new Error('ECharts not available after script load'));
            }
          };

          script.onerror = () => {
            reject(new Error('Failed to load ECharts script'));
          };

          // Timeout after 10 seconds
          setTimeout(() => {
            if (!(window as any).echarts) {
              reject(new Error('ECharts loading timeout'));
            }
          }, 10000);
        });

        document.head.appendChild(script);
        await loadPromise;
        setIsReady(true);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load ECharts');
      }
    };

    loadECharts();
  }, []);

  useEffect(() => {
    if (isReady && chartRef.current && (window as any).echarts && option) {
      try {
        // Dispose existing instance if any
        if (chartInstance.current) {
          chartInstance.current.dispose();
        }

        // Create fresh instance
        chartInstance.current = (window as any).echarts.init(chartRef.current);
        chartInstance.current.setOption(option, true);

        // Add resize handler
        const handleResize = () => {
          if (chartInstance.current) {
            chartInstance.current.resize();
          }
        };

        window.addEventListener('resize', handleResize);
        
        // Use ResizeObserver if available for container resize
        let resizeObserver: ResizeObserver | null = null;
        if (window.ResizeObserver && chartRef.current) {
          resizeObserver = new ResizeObserver(handleResize);
          resizeObserver.observe(chartRef.current);
        }

        return () => {
          window.removeEventListener('resize', handleResize);
          if (resizeObserver) {
            resizeObserver.disconnect();
          }
        };

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Chart initialization error');
      }
    }
  }, [isReady, option]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
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
          <div><strong>Chart Error:</strong></div>
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
        Loading ECharts...
      </div>
    );
  }

  return (
    <div 
      ref={chartRef} 
      style={{
        ...style,
        border: '1px solid #ddd',
        borderRadius: '4px'
      }}
    />
  );
};