import { useState, useEffect } from 'react';
import { Loader2, ExternalLink, RefreshCw, Terminal } from 'lucide-react';

interface SandboxPreviewProps {
  sandboxId: string;
  port: number;
  type: 'vite' | 'nextjs' | 'console';
  output?: string;
  isLoading?: boolean;
  previewUrl?: string;
}

export default function SandboxPreview({
  sandboxId,
  port,
  type,
  output,
  isLoading = false,
  previewUrl: propPreviewUrl
}: SandboxPreviewProps) {
  const [showConsole, setShowConsole] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  // Validate port number - ensure it's a valid number
  const isValidPort = typeof port === 'number' && !isNaN(port) && port > 0 && port < 65536;

  // Use the passed previewUrl or generate one if not provided
  const generatedUrl = (sandboxId && type !== 'console' && isValidPort ? `https://${sandboxId}-${port}.e2b.dev` : '');
  const previewUrl = propPreviewUrl || generatedUrl;

  // Fallback URL if port is invalid but we have a sandboxId
  const fallbackUrl = (!isValidPort && sandboxId && type !== 'console') ?
    `https://${sandboxId}-5173.e2b.dev` : previewUrl;

  // Use fallback URL if original URL is empty or invalid
  const finalUrl = previewUrl || fallbackUrl;

  // Debug logging
  console.log('SandboxPreview Debug:', {
    sandboxId,
    port,
    type,
    isValidPort,
    propPreviewUrl,
    generatedPreviewUrl: generatedUrl,
    fallbackUrl,
    finalUrl
  });

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  if (type === 'console') {
    return (
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="font-mono text-sm whitespace-pre-wrap text-gray-300">
          {output || 'No output yet...'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Preview Controls */}
      <div className="flex items-center justify-between bg-gray-800 rounded-lg p-3 border border-gray-700">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">
                {type === 'vite' ? '⚡ Vite + React + TypeScript' : type === 'nextjs' ? '▲ Next.js' : '📦 Console'} Preview
              </span>
          <code className={`text-xs bg-gray-900 px-2 py-1 rounded ${finalUrl ? 'text-blue-400' : 'text-red-400'}`}>
            {finalUrl || 'No preview URL available'}
          </code>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConsole(!showConsole)}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            title="Toggle console"
          >
            <Terminal className="w-4 h-4" />
          </button>
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            title="Refresh preview"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <a
            href={finalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Main Preview */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center z-10">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-400">
              {type === 'vite' ? 'Starting Vite dev server with React + TypeScript...' : type === 'nextjs' ? 'Starting Next.js dev server...' : 'Loading...'}
            </p>
            </div>
          </div>
        )}
        
        {finalUrl && finalUrl.trim() ? (
          <iframe
            key={iframeKey}
            src={finalUrl}
            className="w-full h-[600px] bg-white"
            title={`${type} preview`}
            sandbox="allow-scripts allow-same-origin allow-forms"
            onError={(e) => {
              console.error('Preview iframe error:', e);
            }}
          />
        ) : (
          <div className="w-full h-[600px] bg-gray-100 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              {!isValidPort ? (
                <p className="text-sm text-red-500">Invalid sandbox port configuration</p>
              ) : (
                <p className="text-sm">Preview will appear here after code generation</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Console Output (Toggle) */}
      {showConsole && output && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-400">Console Output</span>
          </div>
          <div className="font-mono text-xs whitespace-pre-wrap text-gray-300 max-h-48 overflow-y-auto">
            {output}
          </div>
        </div>
      )}
    </div>
  );
}