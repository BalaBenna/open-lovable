import { useState, useEffect } from 'react';
import { Loader2, ExternalLink, RefreshCw, Terminal } from 'lucide-react';

interface SandboxPreviewProps {
  sandboxId: string;
  port: number;
  type: 'vite' | 'nextjs' | 'console';
  output?: string;
  isLoading?: boolean;
  previewUrl?: string;
  onRefresh?: () => void;
  onToggleConsole?: () => void;
  onOpenInNewTab?: () => void;
}

export default function SandboxPreview({
  sandboxId,
  port,
  type,
  output,
  isLoading = false,
  previewUrl: propPreviewUrl,
  onRefresh,
  onToggleConsole,
  onOpenInNewTab
}: SandboxPreviewProps) {
  const [showConsole, setShowConsole] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [iframeError, setIframeError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Validate port number - ensure it's a valid number
  const isValidPort = typeof port === 'number' && !isNaN(port) && port > 0 && port < 65536;

  // Use the passed previewUrl or generate one if not provided (no blob/localhost fallbacks)
  const generatedUrl = (sandboxId && type !== 'console' && isValidPort ? `https://${sandboxId}-${port}.e2b.dev` : '');
  const displayUrl = propPreviewUrl || generatedUrl;

  // Debug logging (keep concise and only defined vars)
  console.log('SandboxPreview Debug:', {
    sandboxId,
    port,
    type,
    isValidPort,
    propPreviewUrl,
    generatedPreviewUrl: generatedUrl,
    displayUrl
  });

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
    setIframeError(null);
    setRetryCount(0);
    onRefresh?.();
  };

  const handleToggleConsole = () => {
    setShowConsole(!showConsole);
    onToggleConsole?.();
  };

  const handleOpenInNewTab = () => {
    if (displayUrl) {
      window.open(displayUrl, '_blank', 'noopener,noreferrer');
    }
    onOpenInNewTab?.();
  };

  const handleIframeError = () => {
    console.error('Iframe failed to load:', displayUrl);
    setIframeError('Failed to load preview. The server may not be ready yet.');

    // Auto-retry up to 3 times with increasing delays
    if (retryCount < 3) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setIframeKey(prev => prev + 1);
        console.log(`Retrying iframe load (attempt ${retryCount + 1})`);
      }, (retryCount + 1) * 2000); // 2s, 4s, 6s delays
    }
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
    <div className="h-full flex flex-col">
      {/* Main Preview - Full height without white container */}
      <div className="relative flex-1 bg-gray-900 rounded-lg overflow-hidden">
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
        
        {displayUrl && displayUrl.trim() ? (
          <>
            {iframeError && (
              <div className="absolute top-4 left-4 right-4 bg-red-900/90 text-red-100 p-3 rounded-lg z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-sm font-medium">
                      {iframeError}
                      {retryCount > 0 && ` (Retry ${retryCount}/3)`}
                    </span>
                  </div>
                  <button
                    onClick={handleRefresh}
                    className="text-red-200 hover:text-white"
                    title="Retry"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            <iframe
              key={iframeKey}
              src={displayUrl}
              className="w-full h-full bg-white"
              title={`${type} preview`}
              sandbox="allow-scripts allow-same-origin allow-forms"
              onError={handleIframeError}
              onLoad={() => {
                setIframeError(null);
                setRetryCount(0);
              }}
            />
          </>
        ) : null}
      </div>

    </div>
  );
}