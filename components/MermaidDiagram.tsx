import React, { useEffect, useRef } from 'react';

interface MermaidDiagramProps {
  chart: string;
  id?: string;
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart, id = 'mermaid-diagram' }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    let mermaid: any;
    
    const loadMermaid = async () => {
      try {
        // Dynamically import mermaid
        const mermaidModule = await import('mermaid');
        mermaid = mermaidModule.default;
        
        // Initialize mermaid with configuration
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: 'inherit',
          fontSize: 14,
          darkMode: false,
          background: 'transparent',
          primaryColor: '#hsl(var(--primary))',
          primaryTextColor: '#hsl(var(--foreground))',
          primaryBorderColor: '#hsl(var(--border))',
          lineColor: '#hsl(var(--border))',
          secondaryColor: '#hsl(var(--secondary))',
          tertiaryColor: '#hsl(var(--muted))',
        });
        
        setIsLoaded(true);
      } catch (err) {
        console.error('Failed to load Mermaid:', err);
        setError('Failed to load diagram renderer');
      }
    };

    loadMermaid();
  }, []);

  useEffect(() => {
    if (!isLoaded || !elementRef.current || !chart.trim()) return;

    const renderDiagram = async () => {
      try {
        const mermaidModule = await import('mermaid');
        const mermaid = mermaidModule.default;
        
        // Clear previous content
        if (elementRef.current) {
          elementRef.current.innerHTML = '';
          
          // Generate unique ID for this diagram
          const diagramId = `${id}-${Date.now()}`;
          
          // Render the diagram
          const { svg } = await mermaid.render(diagramId, chart);
          
          if (elementRef.current) {
            elementRef.current.innerHTML = svg;
            
            // Apply some styling to the SVG
            const svgElement = elementRef.current.querySelector('svg');
            if (svgElement) {
              svgElement.style.maxWidth = '100%';
              svgElement.style.height = 'auto';
            }
          }
        }
      } catch (err) {
        console.error('Mermaid render error:', err);
        setError('Failed to render diagram');
        if (elementRef.current) {
          elementRef.current.innerHTML = `
            <div class="p-4 border border-red-200 rounded-lg bg-red-50 text-red-700">
              <p class="font-medium">Diagram Render Error</p>
              <p class="text-sm mt-1">Please check the diagram syntax</p>
            </div>
          `;
        }
      }
    };

    renderDiagram();
  }, [isLoaded, chart, id]);

  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50 text-red-700">
        <p className="font-medium">Error</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-300 h-4 w-4"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mermaid-container my-4">
      <div 
        ref={elementRef}
        className="mermaid-diagram border border-gray-200 rounded-lg p-4 bg-white overflow-x-auto"
        style={{
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      />
    </div>
  );
};

export default MermaidDiagram;
