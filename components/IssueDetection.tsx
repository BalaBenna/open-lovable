import React from 'react';
import { AlertTriangle, CheckCircle, Copy, MessageSquare } from 'lucide-react';

interface Issue {
  id: string;
  type: 'import' | 'syntax' | 'type' | 'warning' | 'error';
  line: number;
  status: 'detected' | 'auto-fixed' | 'pending';
  description: string;
  suggestedFix: string;
  file?: string;
}

interface IssueDetectionProps {
  issues: Issue[];
  onAskToFix: (issue: Issue) => void;
  onDismiss: (issueId: string) => void;
  isVisible: boolean;
}

const IssueDetection: React.FC<IssueDetectionProps> = ({
  issues,
  onAskToFix,
  onDismiss,
  isVisible
}) => {
  if (!isVisible || issues.length === 0) {
    return null;
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'import': return 'bg-blue-500';
      case 'syntax': return 'bg-red-500';
      case 'type': return 'bg-purple-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'auto-fixed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'detected': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'auto-fixed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <AlertTriangle className="w-4 h-4" />;
      case 'detected': return <AlertTriangle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed top-4 right-4 w-96 max-h-96 overflow-y-auto z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <span className="text-orange-500 font-semibold">
            {issues.length} issue{issues.length !== 1 ? 's' : ''} detected
          </span>
        </div>

        {/* Issues List */}
        <div className="space-y-3">
          {issues.map((issue, index) => {
            // Ensure we always have a valid key - never empty
            const issueKey = issue.id && issue.id.trim() !== '' 
              ? issue.id 
              : `issue-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            // Debug logging to catch empty keys
            if (!issueKey || issueKey.trim() === '') {
              console.error('Empty issue key detected:', { issue, index, issueKey });
            }
            
            return (
              <div
                key={issueKey}
                className="bg-amber-50 border border-amber-200 rounded-lg p-3"
              >
              {/* Issue Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getTypeColor(issue.type)}`}>
                    {issue.type}
                  </span>
                  <span className="text-amber-700 text-sm">
                    Line {issue.line}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1 ${getStatusColor(issue.status)}`}>
                    {getStatusIcon(issue.status)}
                    {issue.status === 'auto-fixed' ? 'Auto-fixed' : 
                     issue.status === 'pending' ? 'Pending' : 'Detected'}
                  </span>
                </div>
              </div>

              {/* Issue Description */}
              <div className="mb-3">
                <p className="text-gray-800 font-medium text-sm mb-1">
                  {issue.description}
                </p>
                {issue.suggestedFix && (
                  <div className="bg-gray-100 rounded p-2 text-xs font-mono text-gray-700">
                    <span className="text-green-600">Add:</span> {issue.suggestedFix}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {issue.status !== 'auto-fixed' && (
                  <button
                    onClick={() => onAskToFix(issue)}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                  >
                    <MessageSquare className="w-3 h-3" />
                    Ask to Fix
                  </button>
                )}
                <button
                  onClick={() => onDismiss(issue.id)}
                  className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Issues are automatically detected</span>
            <button
              onClick={() => issues.forEach(issue => onDismiss(issue.id))}
              className="text-blue-500 hover:text-blue-600"
            >
              Dismiss All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetection;
