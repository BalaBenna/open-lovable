'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader2, AlertCircle, Play, Pause, RotateCcw } from 'lucide-react';

interface ProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  duration?: number;
  error?: string;
}

interface CodeApplicationProgressProps {
  steps: ProgressStep[];
  isVisible: boolean;
  onRetry?: () => void;
  onCancel?: () => void;
  className?: string;
}

const CodeApplicationProgress: React.FC<CodeApplicationProgressProps> = ({
  steps,
  isVisible,
  onRetry,
  onCancel,
  className = ''
}) => {
  const [isPaused, setIsPaused] = useState(false);

  if (!isVisible) return null;

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  const currentStep = steps.find(step => step.status === 'running');
  const hasErrors = steps.some(step => step.status === 'error');

  const getStepIcon = (status: ProgressStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-400 rounded-full" />;
    }
  };

  const getStepColor = (status: ProgressStep['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'running':
        return 'text-blue-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white border border-gray-200 rounded-lg shadow-lg ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Play className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Code Application Progress</h3>
              <p className="text-sm text-gray-600">
                Applying {totalSteps} code changes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {completedSteps}/{totalSteps}
            </span>
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-sm text-gray-600">
              {Math.round(progressPercentage)}%
            </span>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="p-4 max-h-96 overflow-y-auto">
        <div className="space-y-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.id || `step-${index}-${Math.random()}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg border border-gray-200"
            >
              <div className="flex-shrink-0 mt-0.5">
                {getStepIcon(step.status)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className={`font-medium ${getStepColor(step.status)}`}>
                    {step.label}
                  </h4>
                  {step.duration && (
                    <span className="text-xs text-gray-500">
                      {step.duration}ms
                    </span>
                  )}
                </div>

                {step.error && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    {step.error}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {(hasErrors || currentStep) && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentStep && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing: {currentStep.label}</span>
                </div>
              )}
              {hasErrors && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>Errors detected</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {onRetry && hasErrors && (
                <button
                  onClick={onRetry}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retry Failed
                </button>
              )}
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                >
                  <Pause className="w-4 h-4" />
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CodeApplicationProgress;