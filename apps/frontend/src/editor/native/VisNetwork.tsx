import React, { useEffect, useRef, useState } from 'react';

// Vis.js Network visualization component
export const VisNetwork: React.FC<{ 
  nodes?: Array<{id: string | number, label?: string, [key: string]: any}>;
  edges?: Array<{from: string | number, to: string | number, [key: string]: any}>;
  options?: any;
  style?: React.CSSProperties;
  [key: string]: any;
}> = ({ 
  nodes = [
    { id: 1, label: 'Node 1' },
    { id: 2, label: 'Node 2' },
    { id: 3, label: 'Node 3' }
  ],
  edges = [
    { from: 1, to: 2 },
    { from: 2, to: 3 }
  ],
  options = {},
  style = { width: '100%', height: '400px' },
  ...networkOptions
}) => {
  const networkRef = useRef<HTMLDivElement>(null);
  const networkInstance = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadAttempted = useRef(false);

  useEffect(() => {
    if (loadAttempted.current) return;
    loadAttempted.current = true;

    const loadVisNetwork = async () => {
      try {
        // Check if vis-network is already available
        if ((window as any).vis) {
          setIsReady(true);
          return;
        }

        // Check if script already exists
        const existingScript = document.getElementById('vis-network-script');
        
        if (existingScript) {
          const checkInterval = setInterval(() => {
            if ((window as any).vis) {
              clearInterval(checkInterval);
              setIsReady(true);
            }
          }, 100);
          
          setTimeout(() => {
            clearInterval(checkInterval);
            if (!(window as any).vis) {
              setError('Vis Network loading timeout');
            }
          }, 10000);
          return;
        }

        // Load JavaScript
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/vis-network/standalone/umd/vis-network.min.js';
        script.id = 'vis-network-script';
        script.async = true;

        const loadPromise = new Promise<void>((resolve, reject) => {
          script.onload = () => {
            if ((window as any).vis) {
              resolve();
            } else {
              reject(new Error('Vis Network not available after script load'));
            }
          };

          script.onerror = () => {
            reject(new Error('Failed to load Vis Network script'));
          };

          setTimeout(() => {
            if (!(window as any).vis) {
              reject(new Error('Vis Network loading timeout'));
            }
          }, 10000);
        });

        document.head.appendChild(script);
        await loadPromise;
        setIsReady(true);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Vis Network');
      }
    };

    loadVisNetwork();
  }, []);

  useEffect(() => {
    if (isReady && networkRef.current && (window as any).vis) {
      try {
        // Destroy existing network if any
        if (networkInstance.current) {
          networkInstance.current.destroy();
        }

        const vis = (window as any).vis;
        
        // Prepare data
        const data = {
          nodes: new vis.DataSet(nodes),
          edges: new vis.DataSet(edges)
        };

        // Merge options
        const finalOptions = {
          ...options,
          ...networkOptions
        };

        // Create new network
        networkInstance.current = new vis.Network(networkRef.current, data, finalOptions);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network initialization error');
      }
    }
  }, [isReady, nodes, edges, options, networkOptions]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (networkInstance.current) {
        networkInstance.current.destroy();
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
          <div><strong>Vis Network Error:</strong></div>
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
        Loading Vis Network...
      </div>
    );
  }

  return (
    <div 
      ref={networkRef} 
      style={{
        ...style,
        border: '1px solid #ddd',
        borderRadius: '4px'
      }}
    />
  );
};