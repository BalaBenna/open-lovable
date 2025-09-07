'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  RefreshCw, 
  Zap, 
  CheckCircle, 
  XCircle,
  Clock,
  TrendingUp,
  Settings,
  Bug,
  Wifi,
  Server,
  Code2,
  Brain,
  Shield,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface ErrorDetails {
  id: string;
  type: 'network' | 'api' | 'generation' | 'parsing' | 'timeout' | 'quota' | 'unknown';
  message: string;
  timestamp: Date;
  context?: {
    model?: string;
    prompt?: string;
    attempt?: number;
    maxAttempts?: number;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
  autoRetry: boolean;
}

interface RecoveryStrategy {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  automated: boolean;
  estimatedTime: string;
  successRate: number;
}

interface ErrorRecoverySystemProps {
  error: ErrorDetails;
  onRetry: (strategy?: string) => Promise<void>;
  onDismiss: () => void;
  isRetrying?: boolean;
  className?: string;
}

const ErrorRecoverySystem: React.FC<ErrorRecoverySystemProps> = ({
  error,
  onRetry,
  onDismiss,
  isRetrying = false,
  className = ''
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [retryHistory, setRetryHistory] = useState<{ strategy: string; success: boolean; timestamp: Date }[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'strategies']));
  const [autoRetryCountdown, setAutoRetryCountdown] = useState<number>(0);

  // Auto-retry countdown for recoverable errors
  useEffect(() => {
    if (error.autoRetry && error.recoverable && !isRetrying && autoRetryCountdown === 0) {
      setAutoRetryCountdown(10); // 10 second countdown
    }
  }, [error, isRetrying]);

  useEffect(() => {
    if (autoRetryCountdown > 0) {
      const timer = setTimeout(() => {
        if (autoRetryCountdown === 1) {
          handleRetry('auto');
        } else {
          setAutoRetryCountdown(autoRetryCountdown - 1);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoRetryCountdown]);

  const getRecoveryStrategies = (errorType: ErrorDetails['type']): RecoveryStrategy[] => {
    const baseStrategies: RecoveryStrategy[] = [
      {
        id: 'auto',
        name: 'Smart Auto-Retry',
        description: 'Automatically retry with optimized parameters based on the error type',
        icon: <Zap className="w-4 h-4" />,
        automated: true,
        estimatedTime: '10-30 seconds',
        successRate: 85
      },
      {
        id: 'manual',
        name: 'Manual Retry',
        description: 'Retry the exact same request without modifications',
        icon: <RefreshCw className="w-4 h-4" />,
        automated: false,
        estimatedTime: '5-15 seconds',
        successRate: 60
      }
    ];

    switch (errorType) {
      case 'network':
        return [
          ...baseStrategies,
          {
            id: 'network-optimize',
            name: 'Network Optimization',
            description: 'Retry with smaller payload and timeout adjustments',
            icon: <Wifi className="w-4 h-4" />,
            automated: true,
            estimatedTime: '15-45 seconds',
            successRate: 75
          }
        ];
      
      case 'api':
        return [
          ...baseStrategies,
          {
            id: 'fallback-model',
            name: 'Fallback Model',
            description: 'Switch to an alternative AI model for this request',
            icon: <Brain className="w-4 h-4" />,
            automated: true,
            estimatedTime: '20-60 seconds',
            successRate: 90
          }
        ];
      
      case 'generation':
        return [
          ...baseStrategies,
          {
            id: 'prompt-optimize',
            name: 'Prompt Optimization',
            description: 'Simplify and optimize the prompt for better generation',
            icon: <Code2 className="w-4 h-4" />,
            automated: true,
            estimatedTime: '30-90 seconds',
            successRate: 80
          },
          {
            id: 'chunk-generation',
            name: 'Chunked Generation',
            description: 'Break down the request into smaller, manageable parts',
            icon: <Settings className="w-4 h-4" />,
            automated: true,
            estimatedTime: '60-180 seconds',
            successRate: 95
          }
        ];
      
      case 'timeout':
        return [
          ...baseStrategies,
          {
            id: 'extended-timeout',
            name: 'Extended Timeout',
            description: 'Retry with increased timeout limits for complex requests',
            icon: <Clock className="w-4 h-4" />,
            automated: true,
            estimatedTime: '120-300 seconds',
            successRate: 70
          }
        ];
      
      case 'quota':
        return [
          {
            id: 'wait-and-retry',
            name: 'Wait and Retry',
            description: 'Wait for quota reset and automatically retry',
            icon: <Clock className="w-4 h-4" />,
            automated: true,
            estimatedTime: '1-60 minutes',
            successRate: 95
          },
          {
            id: 'alternative-provider',
            name: 'Alternative Provider',
            description: 'Switch to a different AI provider with available quota',
            icon: <Server className="w-4 h-4" />,
            automated: true,
            estimatedTime: '30-90 seconds',
            successRate: 85
          }
        ];
      
      default:
        return baseStrategies;
    }
  };

  const handleRetry = async (strategyId: string) => {
    try {
      await onRetry(strategyId);
      setRetryHistory(prev => [...prev, { 
        strategy: strategyId, 
        success: true, 
        timestamp: new Date() 
      }]);
    } catch (error) {
      setRetryHistory(prev => [...prev, { 
        strategy: strategyId, 
        success: false, 
        timestamp: new Date() 
      }]);
    }
  };

  const cancelAutoRetry = () => {
    setAutoRetryCountdown(0);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const getErrorIcon = (type: ErrorDetails['type']) => {
    switch (type) {
      case 'network':
        return <Wifi className="w-5 h-5" />;
      case 'api':
        return <Server className="w-5 h-5" />;
      case 'generation':
        return <Brain className="w-5 h-5" />;
      case 'parsing':
        return <Code2 className="w-5 h-5" />;
      case 'timeout':
        return <Clock className="w-5 h-5" />;
      case 'quota':
        return <Shield className="w-5 h-5" />;
      default:
        return <Bug className="w-5 h-5" />;
    }
  };

  const getSeverityColor = (severity: ErrorDetails['severity']) => {
    switch (severity) {
      case 'low':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'critical':
        return 'text-red-800 bg-red-100 border-red-300';
    }
  };

  const strategies = getRecoveryStrategies(error.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white border border-red-200 rounded-lg shadow-lg ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
              {getErrorIcon(error.type)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">Generation Failed</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(error.severity)}`}>
                  {error.severity}
                </span>
              </div>
              <p className="text-sm text-gray-600">{error.message}</p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Auto-retry countdown */}
        {autoRetryCountdown > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-blue-700 text-sm font-medium">
                  Auto-retry in {autoRetryCountdown} seconds
                </span>
              </div>
              <button
                onClick={cancelAutoRetry}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Error Details */}
        <div>
          <button
            onClick={() => toggleSection('details')}
            className="flex items-center gap-2 w-full text-left mb-2"
          >
            {expandedSections.has('details') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <h4 className="font-medium text-gray-900">Error Details</h4>
          </button>
          <AnimatePresence>
            {expandedSections.has('details') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 text-sm text-gray-600"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Type:</span> {error.type}
                  </div>
                  <div>
                    <span className="font-medium">Time:</span> {error.timestamp.toLocaleTimeString()}
                  </div>
                  {error.context?.model && (
                    <div>
                      <span className="font-medium">Model:</span> {error.context.model}
                    </div>
                  )}
                  {error.context?.attempt && (
                    <div>
                      <span className="font-medium">Attempt:</span> {error.context.attempt}/{error.context.maxAttempts}
                    </div>
                  )}
                </div>
                {error.context?.prompt && (
                  <div>
                    <span className="font-medium">Prompt:</span>
                    <div className="mt-1 p-2 bg-gray-100 rounded text-xs font-mono">
                      {error.context.prompt.length > 200 
                        ? error.context.prompt.substring(0, 200) + '...'
                        : error.context.prompt
                      }
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Recovery Strategies */}
        {error.recoverable && (
          <div>
            <button
              onClick={() => toggleSection('strategies')}
              className="flex items-center gap-2 w-full text-left mb-3"
            >
              {expandedSections.has('strategies') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <h4 className="font-medium text-gray-900">Recovery Options</h4>
            </button>
            <AnimatePresence>
              {expandedSections.has('strategies') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  {strategies.map(strategy => (
                    <div
                      key={strategy.id || strategy.name || `strategy-${Math.random()}`}
                      className={`border rounded-lg p-3 cursor-pointer transition-all ${
                        selectedStrategy === strategy.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedStrategy(strategy.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                          {strategy.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="font-medium text-gray-900">{strategy.name}</h5>
                            <div className="flex items-center gap-2">
                              {strategy.automated && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                  Auto
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                {strategy.successRate}% success
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{strategy.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{strategy.estimatedTime}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              <span>{strategy.successRate}% success rate</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Retry History */}
        {retryHistory.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection('history')}
              className="flex items-center gap-2 w-full text-left mb-2"
            >
              {expandedSections.has('history') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <h4 className="font-medium text-gray-900">Retry History</h4>
            </button>
            <AnimatePresence>
              {expandedSections.has('history') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  {retryHistory.map((attempt, index) => (
                    <div key={"error-" + (index || Math.random())} className="flex items-center gap-3 text-sm">
                      {attempt.success ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-gray-600">
                        {attempt.strategy} - {attempt.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Action Buttons */}
        {error.recoverable && (
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => handleRetry(selectedStrategy || 'auto')}
              disabled={isRetrying}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRetrying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Retrying...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry {selectedStrategy ? strategies.find(s => s.id === selectedStrategy)?.name : 'Auto'}</span>
                </>
              )}
            </button>
            <button
              onClick={onDismiss}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Non-recoverable error message */}
        {!error.recoverable && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-red-700 text-sm font-medium">
                This error cannot be automatically recovered. Please try a different approach.
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ErrorRecoverySystem;
