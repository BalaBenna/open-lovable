'use client';

import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
  id?: string;
  className?: string;
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({
  chart,
  id = 'mermaid-diagram',
  className = ''
}) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      mermaid.initialize({
        startOnLoad: true,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: 'arial',
        fontSize: 14,
      });

      mermaid.render(id, chart).then((result) => {
        if (elementRef.current) {
          elementRef.current.innerHTML = result.svg;
        }
      }).catch((error) => {
        console.error('Mermaid rendering error:', error);
        if (elementRef.current) {
          elementRef.current.innerHTML = `<div class="text-red-500 p-4">Error rendering diagram: ${error.message}</div>`;
        }
      });
    }
  }, [chart, id]);

  return (
    <div
      ref={elementRef}
      className={`mermaid-diagram ${className}`}
      id={id}
    />
  );
};

export default MermaidDiagram;