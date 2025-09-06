// Performance Monitoring System for AI Code Generation
// Tracks and optimizes performance metrics across the application

import { redisCache } from './redis-cache';
import { appConfig } from '@/config/app.config';

interface PerformanceMetric {
  id: string;
  timestamp: number;
  operation: string;
  duration: number;
  success: boolean;
  metadata?: Record<string, any>;
}

interface GenerationMetrics {
  requestId: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  duration: number;
  cacheHit: boolean;
  filesGenerated: number;
  success: boolean;
  errorType?: string;
}

interface SystemMetrics {
  timestamp: number;
  memoryUsage: NodeJS.MemoryUsage;
  activeConnections: number;
  cacheHitRate: number;
  averageResponseTime: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private generationMetrics: GenerationMetrics[] = [];
  private systemMetrics: SystemMetrics[] = [];
  private startTime = Date.now();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  constructor() {
    // Start system metrics collection
    if (appConfig.dev.enablePerformanceMonitoring) {
      this.startSystemMetricsCollection();
    }
  }

  // Track AI code generation performance
  async trackGeneration(metrics: Omit<GenerationMetrics, 'requestId'>): Promise<void> {
    const generationMetric: GenerationMetrics = {
      requestId: `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...metrics
    };

    this.generationMetrics.push(generationMetric);

    // Keep only last 100 generation metrics
    if (this.generationMetrics.length > 100) {
      this.generationMetrics = this.generationMetrics.slice(-100);
    }

    // Store in Redis for persistence
    await redisCache.set(
      `perf:generation:${generationMetric.requestId}`,
      generationMetric,
      3600 // 1 hour TTL
    );

    // Log performance issues
    if (metrics.duration > 30000) { // > 30 seconds
      console.warn('[PerformanceMonitor] Slow generation detected:', {
        model: metrics.model,
        duration: metrics.duration,
        tokens: metrics.totalTokens
      });
    }
  }

  // Track general operation performance
  trackOperation(operation: string, duration: number, success: boolean, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      operation,
      duration,
      success,
      metadata
    };

    this.metrics.push(metric);

    // Keep only last 500 metrics
    if (this.metrics.length > 500) {
      this.metrics = this.metrics.slice(-500);
    }

    // Log slow operations
    if (duration > 5000) { // > 5 seconds
      console.warn('[PerformanceMonitor] Slow operation detected:', {
        operation,
        duration,
        success,
        metadata
      });
    }
  }

  // Create a timer for tracking operations
  createTimer(operation: string): {
    end: (success?: boolean, metadata?: Record<string, any>) => void;
  } {
    const startTime = Date.now();
    
    return {
      end: (success = true, metadata) => {
        const duration = Date.now() - startTime;
        this.trackOperation(operation, duration, success, metadata);
      }
    };
  }

  // Get performance analytics
  getAnalytics(): {
    generation: {
      averageDuration: number;
      averageTokens: number;
      successRate: number;
      cacheHitRate: number;
      slowGenerations: number;
    };
    operations: {
      averageDuration: number;
      successRate: number;
      slowOperations: number;
      operationBreakdown: Record<string, { count: number; averageDuration: number }>;
    };
    system: {
      uptime: number;
      memoryUsage: NodeJS.MemoryUsage | null;
      averageResponseTime: number;
    };
  } {
    // Generation analytics
    const generations = this.generationMetrics;
    const generationAnalytics = {
      averageDuration: generations.length > 0 
        ? generations.reduce((sum, g) => sum + g.duration, 0) / generations.length 
        : 0,
      averageTokens: generations.length > 0
        ? generations.reduce((sum, g) => sum + g.totalTokens, 0) / generations.length
        : 0,
      successRate: generations.length > 0
        ? generations.filter(g => g.success).length / generations.length
        : 0,
      cacheHitRate: generations.length > 0
        ? generations.filter(g => g.cacheHit).length / generations.length
        : 0,
      slowGenerations: generations.filter(g => g.duration > 30000).length
    };

    // Operations analytics
    const operations = this.metrics;
    const operationBreakdown: Record<string, { count: number; averageDuration: number }> = {};
    
    operations.forEach(op => {
      if (!operationBreakdown[op.operation]) {
        operationBreakdown[op.operation] = { count: 0, averageDuration: 0 };
      }
      operationBreakdown[op.operation].count++;
      operationBreakdown[op.operation].averageDuration = 
        (operationBreakdown[op.operation].averageDuration * (operationBreakdown[op.operation].count - 1) + op.duration) 
        / operationBreakdown[op.operation].count;
    });

    const operationAnalytics = {
      averageDuration: operations.length > 0
        ? operations.reduce((sum, op) => sum + op.duration, 0) / operations.length
        : 0,
      successRate: operations.length > 0
        ? operations.filter(op => op.success).length / operations.length
        : 0,
      slowOperations: operations.filter(op => op.duration > 5000).length,
      operationBreakdown
    };

    // System analytics
    const latestSystemMetric = this.systemMetrics[this.systemMetrics.length - 1];
    const systemAnalytics = {
      uptime: Date.now() - this.startTime,
      memoryUsage: latestSystemMetric?.memoryUsage || null,
      averageResponseTime: latestSystemMetric?.averageResponseTime || 0
    };

    return {
      generation: generationAnalytics,
      operations: operationAnalytics,
      system: systemAnalytics
    };
  }

  // Get recent performance issues
  getRecentIssues(): {
    slowGenerations: GenerationMetrics[];
    slowOperations: PerformanceMetric[];
    failures: (GenerationMetrics | PerformanceMetric)[];
  } {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    const recentGenerations = this.generationMetrics.filter(g => 
      g.timestamp ? g.timestamp > oneHourAgo : true
    );
    const recentOperations = this.metrics.filter(m => m.timestamp > oneHourAgo);

    return {
      slowGenerations: recentGenerations.filter(g => g.duration > 30000),
      slowOperations: recentOperations.filter(op => op.duration > 5000),
      failures: [
        ...recentGenerations.filter(g => !g.success),
        ...recentOperations.filter(op => !op.success)
      ]
    };
  }

  // Start collecting system metrics
  private startSystemMetricsCollection(): void {
    setInterval(() => {
      const systemMetric: SystemMetrics = {
        timestamp: Date.now(),
        memoryUsage: process.memoryUsage(),
        activeConnections: 0, // Would need to track this from server
        cacheHitRate: this.calculateCacheHitRate(),
        averageResponseTime: this.calculateAverageResponseTime()
      };

      this.systemMetrics.push(systemMetric);

      // Keep only last 100 system metrics
      if (this.systemMetrics.length > 100) {
        this.systemMetrics = this.systemMetrics.slice(-100);
      }
    }, 60000); // Collect every minute
  }

  private calculateCacheHitRate(): number {
    const recentGenerations = this.generationMetrics.slice(-50); // Last 50 generations
    if (recentGenerations.length === 0) return 0;
    
    return recentGenerations.filter(g => g.cacheHit).length / recentGenerations.length;
  }

  private calculateAverageResponseTime(): number {
    const recentOperations = this.metrics.slice(-100); // Last 100 operations
    if (recentOperations.length === 0) return 0;
    
    return recentOperations.reduce((sum, op) => sum + op.duration, 0) / recentOperations.length;
  }

  // Export metrics for external analysis
  async exportMetrics(): Promise<{
    generations: GenerationMetrics[];
    operations: PerformanceMetric[];
    system: SystemMetrics[];
    exportedAt: number;
  }> {
    return {
      generations: this.generationMetrics,
      operations: this.metrics,
      system: this.systemMetrics,
      exportedAt: Date.now()
    };
  }

  // Clear old metrics
  clearOldMetrics(olderThanMs: number = 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - olderThanMs;
    
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
    this.systemMetrics = this.systemMetrics.filter(m => m.timestamp > cutoff);
    
    // Generation metrics don't have timestamp by default, so we keep all recent ones
    // In a real implementation, you'd add timestamp to GenerationMetrics
  }

  // Health check based on performance metrics
  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
  } {
    const analytics = this.getAnalytics();
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check generation performance
    if (analytics.generation.averageDuration > 45000) {
      issues.push('AI generation taking too long (>45s average)');
      recommendations.push('Consider using faster models or optimizing prompts');
    }

    if (analytics.generation.successRate < 0.9) {
      issues.push('High AI generation failure rate');
      recommendations.push('Review error patterns and improve error handling');
    }

    if (analytics.generation.cacheHitRate < 0.3) {
      issues.push('Low cache hit rate for AI responses');
      recommendations.push('Optimize caching strategy and prompt standardization');
    }

    // Check system performance
    if (analytics.system.memoryUsage) {
      const memoryUsagePercent = (analytics.system.memoryUsage.heapUsed / analytics.system.memoryUsage.heapTotal) * 100;
      if (memoryUsagePercent > 85) {
        issues.push('High memory usage detected');
        recommendations.push('Consider implementing memory cleanup and optimization');
      }
    }

    if (analytics.operations.averageDuration > 3000) {
      issues.push('Slow average operation response time');
      recommendations.push('Profile and optimize slow operations');
    }

    // Determine status
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (issues.length > 0) {
      status = issues.some(issue => 
        issue.includes('critical') || 
        issue.includes('failure rate') ||
        analytics.generation.successRate < 0.7
      ) ? 'critical' : 'warning';
    }

    return { status, issues, recommendations };
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
