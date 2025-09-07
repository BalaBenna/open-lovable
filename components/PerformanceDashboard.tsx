'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface HealthData {
  health: {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    warnings: string[];
  };
  metrics: {
    uptime: number;
    responseTime: number;
    memoryUsagePercent: number;
    memoryEfficiency: number;
  };
  cache: {
    redis: any;
    website: any;
  };
  environment: {
    nodeEnv: string;
    hasRedis: boolean;
    hasOpenAI: boolean;
    hasAnthropic: boolean;
    hasGoogle: boolean;
    hasGroq: boolean;
    hasFirecrawl: boolean;
    hasE2B: boolean;
  };
}

const PerformanceDashboard: React.FC = () => {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchHealthData = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/system-health');
      const result = await response.json();

      if (result.success) {
        setHealthData(result.data);
      } else {
        setError(result.error || 'Failed to fetch health data');
      }
    } catch (err) {
      console.error('Health check error:', err);
      setError('Failed to connect to health service');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh) {
      interval = setInterval(fetchHealthData, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'critical':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-900">System Health</h2>
          {healthData && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(healthData.health.status)}`}>
              {getStatusIcon(healthData.health.status)}
              {healthData.health.status.toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
          >
            {autoRefresh ? 'Auto Refresh ON' : 'Auto Refresh OFF'}
          </Button>
          <Button
            onClick={fetchHealthData}
            disabled={isLoading}
            size="sm"
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="outline"
            size="sm"
          >
            {isExpanded ? 'Collapse' : 'Details'}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center gap-2 text-red-700">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Stats */}
      {healthData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-white border border-gray-200 rounded-lg">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Uptime</div>
            <div className="text-lg font-semibold text-gray-900">
              {formatUptime(healthData.metrics.uptime)}
            </div>
          </div>
          
          <div className="p-3 bg-white border border-gray-200 rounded-lg">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Response Time</div>
            <div className="text-lg font-semibold text-gray-900">
              {healthData.metrics.responseTime}ms
            </div>
          </div>
          
          <div className="p-3 bg-white border border-gray-200 rounded-lg">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Memory Usage</div>
            <div className="text-lg font-semibold text-gray-900">
              {healthData.metrics.memoryUsagePercent.toFixed(1)}%
            </div>
          </div>
          
          <div className="p-3 bg-white border border-gray-200 rounded-lg">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Cache Status</div>
            <div className="text-lg font-semibold text-gray-900">
              {healthData.cache.redis?.isRedisConnected ? 'Redis' : 'Memory'}
            </div>
          </div>
        </div>
      )}

      {/* Issues and Warnings */}
      {healthData && (healthData.health.issues.length > 0 || healthData.health.warnings.length > 0) && (
        <div className="space-y-2">
          {healthData.health.issues.map((issue, index) => (
            <div key={"issue-" + (index || Math.random())} className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Issue:</span>
                <span className="text-sm">{issue}</span>
              </div>
            </div>
          ))}
          
          {healthData.health.warnings.map((warning, index) => (
            <div key={"warning-" + (index || Math.random())} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-700">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Warning:</span>
                <span className="text-sm">{warning}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Information */}
      <AnimatePresence>
        {isExpanded && healthData && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {/* Environment Status */}
            <div className="p-4 bg-white border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Configuration</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(healthData.environment).map(([key, value]) => {
                  if (key === 'nodeEnv') return null;
                  
                  const label = key.replace(/^has/, '').replace(/([A-Z])/g, ' $1').trim();
                  return (
                    <div key={key || `env-${Math.random()}`} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-sm text-gray-700">{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cache Statistics */}
            {healthData.cache.redis && (
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Cache Statistics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Redis Connected:</span>
                    <span className={healthData.cache.redis.isRedisConnected ? 'text-green-600' : 'text-red-600'}>
                      {healthData.cache.redis.isRedisConnected ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fallback Cache Size:</span>
                    <span className="text-gray-900">{healthData.cache.redis.fallbackCacheSize} items</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PerformanceDashboard;
