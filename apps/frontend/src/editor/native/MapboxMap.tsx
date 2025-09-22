import React, { useEffect, useRef, useState } from 'react';

// Mapbox GL JS maps component
export const MapboxMap: React.FC<{ 
  center?: [number, number];
  zoom?: number;
  accessToken: string;
  style?: React.CSSProperties;
  mapStyle?: string;
  markers?: Array<{lng: number, lat: number, popup?: string}>;
  [key: string]: any;
}> = ({ 
  center = [-74.5, 40],
  zoom = 9,
  accessToken,
  style = { width: '100%', height: '400px' },
  mapStyle = 'mapbox://styles/mapbox/streets-v12',
  markers = [],
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

    const loadMapbox = async () => {
      try {
        // Check if access token is provided
        if (!accessToken) {
          setError('Mapbox access token is required');
          return;
        }

        // Check if Mapbox GL is already available
        if ((window as any).mapboxgl) {
          setIsReady(true);
          return;
        }

        // Check if scripts already exist
        const existingScript = document.getElementById('mapbox-script');
        const existingCSS = document.getElementById('mapbox-css');
        
        if (existingScript && existingCSS) {
          const checkInterval = setInterval(() => {
            if ((window as any).mapboxgl) {
              clearInterval(checkInterval);
              setIsReady(true);
            }
          }, 100);
          
          setTimeout(() => {
            clearInterval(checkInterval);
            if (!(window as any).mapboxgl) {
              setError('Mapbox GL loading timeout');
            }
          }, 10000);
          return;
        }

        // Load CSS first
        if (!existingCSS) {
          const cssLink = document.createElement('link');
          cssLink.rel = 'stylesheet';
          cssLink.href = 'https://api.mapbox.com/mapbox-gl-js/v3.14.0/mapbox-gl.css';
          cssLink.id = 'mapbox-css';
          document.head.appendChild(cssLink);
        }

        // Load JavaScript
        if (!existingScript) {
          const script = document.createElement('script');
          script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.14.0/mapbox-gl.js';
          script.id = 'mapbox-script';
          script.async = true;

          const loadPromise = new Promise<void>((resolve, reject) => {
            script.onload = () => {
              if ((window as any).mapboxgl) {
                resolve();
              } else {
                reject(new Error('Mapbox GL not available after script load'));
              }
            };

            script.onerror = () => {
              reject(new Error('Failed to load Mapbox GL script'));
            };

            setTimeout(() => {
              if (!(window as any).mapboxgl) {
                reject(new Error('Mapbox GL loading timeout'));
              }
            }, 10000);
          });

          document.head.appendChild(script);
          await loadPromise;
        }

        setIsReady(true);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Mapbox GL');
      }
    };

    loadMapbox();
  }, [accessToken]);

  useEffect(() => {
    if (isReady && mapRef.current && (window as any).mapboxgl) {
      try {
        // Remove existing map if any
        if (mapInstance.current) {
          mapInstance.current.remove();
        }

        const mapboxgl = (window as any).mapboxgl;
        
        // Set access token
        mapboxgl.accessToken = accessToken;

        // Create new map
        mapInstance.current = new mapboxgl.Map({
          container: mapRef.current,
          style: mapStyle,
          center: center,
          zoom: zoom,
          ...mapOptions
        });

        // Add markers
        markers.forEach(marker => {
          const mapboxMarker = new mapboxgl.Marker()
            .setLngLat([marker.lng, marker.lat])
            .addTo(mapInstance.current);

          if (marker.popup) {
            const popup = new mapboxgl.Popup({ offset: 25 })
              .setHTML(marker.popup);
            mapboxMarker.setPopup(popup);
          }
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Map initialization error');
      }
    }
  }, [isReady, center, zoom, accessToken, mapStyle, markers, mapOptions]);

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
          <div><strong>Mapbox GL Error:</strong></div>
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
        Loading Mapbox GL...
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
};