import { ExternalLink, RefreshCw, Terminal } from 'lucide-react';

interface PreviewControlsProps {
  onRefresh: () => void;
  onToggleConsole: () => void;
  onOpenInNewTab: () => void;
  previewUrl?: string;
  isLoading?: boolean;
}

export default function PreviewControls({
  onRefresh,
  onToggleConsole,
  onOpenInNewTab,
  previewUrl,
  isLoading = false
}: PreviewControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onToggleConsole}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        title="Toggle console"
        disabled={isLoading}
      >
        <Terminal className="w-4 h-4 text-gray-600" />
      </button>
      <button
        onClick={onRefresh}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        title="Refresh preview"
        disabled={isLoading}
      >
        <RefreshCw className={`w-4 h-4 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
      </button>
      <button
        onClick={onOpenInNewTab}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        title="Open in new tab"
        disabled={!previewUrl || isLoading}
      >
        <ExternalLink className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );
}
