import React, { useEffect, useRef, useState } from 'react';

// PDF.js PDF viewer component
export const PDFViewer: React.FC<{ 
  url: string;
  pageNumber?: number;
  scale?: number;
  style?: React.CSSProperties;
  [key: string]: any;
}> = ({ 
  url,
  pageNumber = 1,
  scale = 1.5,
  style = { width: '100%', height: '600px' },
  ...viewerOptions
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const loadAttempted = useRef(false);

  useEffect(() => {
    if (loadAttempted.current) return;
    loadAttempted.current = true;

    const loadPDFJS = async () => {
      try {
        // Check if PDF.js is already available
        if ((window as any).pdfjsLib) {
          setIsReady(true);
          return;
        }

        // Check if script already exists
        const existingScript = document.getElementById('pdfjs-script');
        
        if (existingScript) {
          const checkInterval = setInterval(() => {
            if ((window as any).pdfjsLib) {
              clearInterval(checkInterval);
              setIsReady(true);
            }
          }, 100);
          
          setTimeout(() => {
            clearInterval(checkInterval);
            if (!(window as any).pdfjsLib) {
              setError('PDF.js loading timeout');
            }
          }, 10000);
          return;
        }

        // Use working CDNJS URL for PDF.js
        const cdnUrls = [
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.min.js',
          'https://cdn.jsdelivr.net/npm/[email protected]/build/pdf.min.js'
        ];

        let lastError = null;
        
        for (const url of cdnUrls) {
          try {
            await new Promise<void>((resolve, reject) => {
              const script = document.createElement('script');
              script.src = url;
              script.id = 'pdfjs-script';
              script.async = true;

              script.onload = () => {
                if ((window as any).pdfjsLib) {
                  // Set worker source based on which CDN we're using
                  if (url.includes('cdnjs.cloudflare.com')) {
                    (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 
                      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js';
                  } else {
                    (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 
                      'https://cdn.jsdelivr.net/npm/[email protected]/build/pdf.worker.min.js';
                  }
                  console.log(`✅ Successfully loaded PDF.js from ${url}`);
                  resolve();
                } else {
                  reject(new Error('PDF.js not available after script load'));
                }
              };

              script.onerror = () => {
                script.remove();
                reject(new Error(`Failed to load PDF.js from ${url}`));
              };

              setTimeout(() => {
                if (!(window as any).pdfjsLib) {
                  script.remove();
                  reject(new Error(`PDF.js loading timeout from ${url}`));
                }
              }, 10000);

              document.head.appendChild(script);
            });

            // If we get here, loading succeeded
            setIsReady(true);
            return;

          } catch (err) {
            lastError = err;
            console.warn(`❌ Failed to load PDF.js from ${url}:`, err);
            const failedScript = document.getElementById('pdfjs-script');
            if (failedScript) {
              failedScript.remove();
              console.log(`🧹 Removed failed PDF.js script for ${url}`);
            }
          }
        }

        // If all CDNs failed
        throw lastError || new Error('All PDF.js CDN sources failed');

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load PDF.js');
      }
    };

    loadPDFJS();
  }, []);

  useEffect(() => {
    if (isReady && url && (window as any).pdfjsLib) {
      const loadPDF = async () => {
        try {
          const pdfjsLib = (window as any).pdfjsLib;
          
          // Load PDF document
          const loadingTask = pdfjsLib.getDocument(url);
          pdfDocRef.current = await loadingTask.promise;
          
          setNumPages(pdfDocRef.current.numPages);
          setError(null);
          
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load PDF document');
        }
      };

      loadPDF();
    }
  }, [isReady, url]);

  useEffect(() => {
    if (pdfDocRef.current && canvasRef.current && pageNumber) {
      const renderPage = async () => {
        try {
          // Get page
          const page = await pdfDocRef.current.getPage(pageNumber);
          
          const canvas = canvasRef.current;
          if (!canvas) return;
          
          const context = canvas.getContext('2d');
          if (!context) return;
          
          // Calculate viewport
          const viewport = page.getViewport({ scale });
          
          // Set canvas dimensions
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          // Render page
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
            ...viewerOptions
          };
          
          await page.render(renderContext).promise;
          
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to render PDF page');
        }
      };

      renderPage();
    }
  }, [pdfDocRef.current, pageNumber, scale, viewerOptions]);

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
          <div><strong>PDF Viewer Error:</strong></div>
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
        Loading PDF.js...
      </div>
    );
  }

  if (!url) {
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
        Please provide a PDF URL
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      style={{
        ...style,
        border: '1px solid #ddd',
        borderRadius: '4px',
        overflow: 'auto',
        padding: '8px'
      }}
    >
      <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
        {numPages > 0 && `Page ${pageNumber} of ${numPages}`}
      </div>
      <canvas 
        ref={canvasRef} 
        style={{
          maxWidth: '100%',
          height: 'auto'
        }}
      />
    </div>
  );
};