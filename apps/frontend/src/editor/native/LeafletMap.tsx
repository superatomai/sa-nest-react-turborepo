import React, { useEffect, useRef, useState } from 'react';

// Leaflet maps component
export const LeafletMap = React.memo<{ 
  center?: [number, number];
  zoom?: number;
  markers?: Array<{lat: number, lng: number, popup?: string}>;
  style?: React.CSSProperties;
  [key: string]: any;
}>(({ 
  center = [51.505, -0.09],
  zoom = 13,
  markers = [],
  style = { width: '100%', height: '400px' },
  ...mapOptions
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadAttempted = useRef(false);

  useEffect(() => {
    if (loadAttempted.current) return;
    loadAttempted.current = true;

    const loadLeaflet = async () => {
      try {
        // Check if Leaflet is already available
        if ((window as any).L) {
          setIsReady(true);
          return;
        }

        // Check if scripts already exist
        const existingScript = document.getElementById('leaflet-script');
        const existingCSS = document.getElementById('leaflet-css');
        
        if (existingScript && existingCSS) {
          const checkInterval = setInterval(() => {
            if ((window as any).L) {
              clearInterval(checkInterval);
              setIsReady(true);
            }
          }, 100);
          
          setTimeout(() => {
            clearInterval(checkInterval);
            if (!(window as any).L) {
              setError('Leaflet loading timeout');
            }
          }, 10000);
          return;
        }

        // Load CSS first
        if (!existingCSS) {
          const cssLink = document.createElement('link');
          cssLink.rel = 'stylesheet';
          cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          cssLink.id = 'leaflet-css';
          cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          cssLink.crossOrigin = 'anonymous';
          document.head.appendChild(cssLink);
        }

        // Load JavaScript
        if (!existingScript) {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.id = 'leaflet-script';
          script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
          script.crossOrigin = 'anonymous';
          script.async = true;

          const loadPromise = new Promise<void>((resolve, reject) => {
            script.onload = () => {
              if ((window as any).L) {
                resolve();
              } else {
                reject(new Error('Leaflet not available after script load'));
              }
            };

            script.onerror = () => {
              reject(new Error('Failed to load Leaflet script'));
            };

            setTimeout(() => {
              if (!(window as any).L) {
                reject(new Error('Leaflet loading timeout'));
              }
            }, 10000);
          });

          document.head.appendChild(script);
          await loadPromise;
        }

        setIsReady(true);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Leaflet');
      }
    };

    loadLeaflet();
  }, []);

  useEffect(() => {
    if (isReady && mapRef.current && (window as any).L) {
      try {
        // Remove existing map if any
        if (mapInstance.current) {
          mapInstance.current.remove();
        }

        // Create new map
        const L = (window as any).L;
        mapInstance.current = L.map(mapRef.current, {
          center: center,
          zoom: zoom,
          ...mapOptions
        });

        // Add tile layer
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(mapInstance.current);

        // Add markers
        markers.forEach(marker => {
          const leafletMarker = L.marker([marker.lat, marker.lng]).addTo(mapInstance.current);
          if (marker.popup) {
            leafletMarker.bindPopup(marker.popup);
          }
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Map initialization error');
      }
    }
  }, [isReady, center, zoom, markers, mapOptions]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
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
          <div><strong>Leaflet Map Error:</strong></div>
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
        Loading Leaflet Map...
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      style={{
        ...style,
        border: '1px solid #ddd',
        borderRadius: '4px'
      }}
    />
  );
});