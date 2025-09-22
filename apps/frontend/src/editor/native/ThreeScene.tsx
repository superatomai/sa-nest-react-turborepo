import React, { useEffect, useRef, useState } from 'react';

// Three.js 3D scene component (without React Three Fiber due to CDN limitations)
export const ThreeScene: React.FC<{ 
  backgroundColor?: string;
  cameraPosition?: [number, number, number];
  objects?: Array<{
    type: 'box' | 'sphere' | 'cylinder';
    position?: [number, number, number];
    color?: string;
    size?: number | [number, number, number];
  }>;
  style?: React.CSSProperties;
  [key: string]: any;
}> = ({ 
  backgroundColor = '#f0f0f0',
  cameraPosition = [0, 0, 5],
  objects = [
    { type: 'box', position: [0, 0, 0], color: '#ff6b6b', size: 1 }
  ],
  style = { width: '100%', height: '400px' },
  ...sceneOptions
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const animationRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadAttempted = useRef(false);

  useEffect(() => {
    if (loadAttempted.current) return;
    loadAttempted.current = true;

    const loadThreeJS = async () => {
      try {
        // Check if Three.js is already available
        if ((window as any).THREE) {
          setIsReady(true);
          return;
        }

        // Check if script already exists
        const existingScript = document.getElementById('threejs-script');
        
        if (existingScript) {
          const checkInterval = setInterval(() => {
            if ((window as any).THREE) {
              clearInterval(checkInterval);
              setIsReady(true);
            }
          }, 100);
          
          setTimeout(() => {
            clearInterval(checkInterval);
            if (!(window as any).THREE) {
              setError('Three.js loading timeout');
            }
          }, 10000);
          return;
        }

        // Load Three.js and OrbitControls
        const loadMainLibrary = async () => {
          const cdnUrls = [
            'https://cdnjs.cloudflare.com/ajax/libs/three.js/r123/three.min.js',
            'https://unpkg.com/three@0.123.0/build/three.min.js',
            'https://cdn.jsdelivr.net/npm/three@0.123.0/build/three.min.js'
          ];
          
          for (const url of cdnUrls) {
            try {
              await new Promise<void>((resolve, reject) => {
                const script = document.createElement('script');
                script.src = url;
                script.id = 'threejs-script';
                script.async = true;
                script.crossOrigin = 'anonymous';

                script.onload = () => {
                  if ((window as any).THREE) {
                    resolve();
                  } else {
                    reject(new Error('Three.js not available after script load'));
                  }
                };

                script.onerror = () => {
                  script.remove();
                  reject(new Error(`Failed to load from ${url}`));
                };

                setTimeout(() => {
                  if (!(window as any).THREE) {
                    script.remove();
                    reject(new Error(`Timeout loading from ${url}`));
                  }
                }, 8000);

                document.head.appendChild(script);
              });

              console.log(`✅ Successfully loaded Three.js from ${url}`);
              return; // Success, exit loop
            } catch (err) {
              console.warn(`❌ Failed to load Three.js from ${url}:`, err);
              const failedScript = document.getElementById('threejs-script');
              if (failedScript) failedScript.remove();
            }
          }
          throw new Error('All Three.js CDN sources failed');
        };

        // Load OrbitControls after Three.js
        const loadOrbitControls = async () => {
          const orbitUrls = [
            'https://cdn.jsdelivr.net/npm/three@0.123.0/examples/js/controls/OrbitControls.js',
            'https://unpkg.com/three@0.123.0/examples/js/controls/OrbitControls.js'
          ];
          
          for (const url of orbitUrls) {
            try {
              await new Promise<void>((resolve, reject) => {
                const script = document.createElement('script');
                script.src = url;
                script.id = 'orbit-controls-script';
                script.async = true;
                script.crossOrigin = 'anonymous';

                script.onload = () => {
                  if ((window as any).THREE && (window as any).THREE.OrbitControls) {
                    resolve();
                  } else {
                    reject(new Error('OrbitControls not available after script load'));
                  }
                };

                script.onerror = () => {
                  script.remove();
                  reject(new Error(`Failed to load OrbitControls from ${url}`));
                };

                setTimeout(() => {
                  if (!(window as any).THREE || !(window as any).THREE.OrbitControls) {
                    script.remove();
                    reject(new Error(`OrbitControls timeout from ${url}`));
                  }
                }, 8000);

                document.head.appendChild(script);
              });

              console.log(`✅ Successfully loaded OrbitControls from ${url}`);
              return; // Success
            } catch (err) {
              console.warn(`❌ Failed to load OrbitControls from ${url}:`, err);
              const failedScript = document.getElementById('orbit-controls-script');
              if (failedScript) failedScript.remove();
            }
          }
          // OrbitControls is optional, so don't throw error
          console.warn('⚠️ OrbitControls not loaded, scene will work without camera controls');
        };

        await loadMainLibrary();
        await loadOrbitControls();
        setIsReady(true);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Three.js');
      }
    };

    loadThreeJS();
  }, []);

  useEffect(() => {
    if (isReady && mountRef.current && (window as any).THREE) {
      try {
        const THREE = (window as any).THREE;
        
        // Cleanup existing scene
        if (rendererRef.current) {
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }
          mountRef.current.removeChild(rendererRef.current.domElement);
          rendererRef.current.dispose();
        }

        // Get container dimensions
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight || 400;

        // Create scene
        sceneRef.current = new THREE.Scene();
        sceneRef.current.background = new THREE.Color(backgroundColor);

        // Create camera
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.set(...cameraPosition);

        // Create renderer
        rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
        rendererRef.current.setSize(width, height);
        rendererRef.current.setPixelRatio(window.devicePixelRatio);
        mountRef.current.appendChild(rendererRef.current.domElement);

        // Add OrbitControls if available
        let controls = null;
        if ((window as any).THREE.OrbitControls) {
          controls = new (window as any).THREE.OrbitControls(camera, rendererRef.current.domElement);
          controls.enableDamping = true; // Smooth camera movements
          controls.dampingFactor = 0.25;
          controls.enableZoom = true;
          controls.autoRotate = true;
          controls.autoRotateSpeed = 2.0;
          console.log('✅ OrbitControls enabled');
        } else {
          console.warn('⚠️ OrbitControls not available, using automatic rotation');
        }

        // Add lights
        const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
        sceneRef.current.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        sceneRef.current.add(directionalLight);

        // Add second directional light for better lighting
        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight2.position.set(-5, -5, -5);
        sceneRef.current.add(directionalLight2);

        // Add objects
        objects.forEach(obj => {
          let geometry;
          let material = new THREE.MeshLambertMaterial({ color: obj.color || '#ff6b6b' });

          switch (obj.type) {
            case 'sphere':
              const sphereSize = typeof obj.size === 'number' ? obj.size : 1;
              geometry = new THREE.SphereGeometry(sphereSize, 32, 32);
              break;
            case 'cylinder':
              const cylinderSize = typeof obj.size === 'number' ? obj.size : 1;
              geometry = new THREE.CylinderGeometry(cylinderSize, cylinderSize, cylinderSize * 2, 32);
              break;
            case 'box':
            default:
              const boxSize = Array.isArray(obj.size) 
                ? obj.size 
                : [obj.size || 1, obj.size || 1, obj.size || 1];
              geometry = new THREE.BoxGeometry(...boxSize);
              break;
          }

          const mesh = new THREE.Mesh(geometry, material);
          if (obj.position) {
            mesh.position.set(...obj.position);
          }
          sceneRef.current.add(mesh);
        });

        // Animation loop
        const animate = () => {
          animationRef.current = requestAnimationFrame(animate);
          
          // Update controls if available
          if (controls) {
            controls.update();
          }
          
          // Add rotation animation only if no controls (fallback)
          if (!controls) {
            sceneRef.current.traverse((child: any) => {
              if (child.isMesh) {
                child.rotation.x += 0.005;
                child.rotation.y += 0.01;
              }
            });
          }

          rendererRef.current.render(sceneRef.current, camera);
        };

        animate();

        // Handle resize
        const handleResize = () => {
          if (mountRef.current && rendererRef.current) {
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight || 400;
            
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            rendererRef.current.setSize(width, height);
          }
        };

        window.addEventListener('resize', handleResize);
        
        return () => {
          window.removeEventListener('resize', handleResize);
        };

      } catch (err) {
        setError(err instanceof Error ? err.message : '3D scene initialization error');
      }
    }
  }, [isReady, backgroundColor, cameraPosition, objects, sceneOptions]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
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
          <div><strong>Three.js Scene Error:</strong></div>
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
        Loading Three.js Scene...
      </div>
    );
  }

  return (
    <div 
      ref={mountRef} 
      style={{
        ...style,
        border: '1px solid #ddd',
        borderRadius: '4px'
      }}
    />
  );
};