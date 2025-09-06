import { NextRequest, NextResponse } from 'next/server';
import { redisCache } from '@/lib/redis-cache';
import { websiteCache } from '@/lib/website-cache';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();

    // Get system metrics
    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    };

    // Get cache statistics
    let cacheStats;
    try {
      cacheStats = await Promise.all([
        redisCache.getStats(),
        websiteCache.getStats(),
      ]);
    } catch (cacheError) {
      console.warn('[system-health] Cache stats error:', cacheError);
      cacheStats = [null, null];
    }

    // Calculate response time
    const responseTime = Date.now() - startTime;

    // Get environment info
    const environment = {
      nodeEnv: process.env.NODE_ENV,
      hasRedis: !!process.env.REDIS_URL,
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      hasAnthropic: !!process.env.ANTHROPIC_API_KEY,
      hasGoogle: !!(process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY),
      hasGroq: !!process.env.GROQ_API_KEY,
      hasFirecrawl: !!process.env.FIRECRAWL_API_KEY,
      hasE2B: !!process.env.E2B_API_KEY,
    };

    // System health indicators
    const health = {
      status: 'healthy',
      issues: [] as string[],
      warnings: [] as string[],
    };

    // Check memory usage
    const memoryUsagePercent = (metrics.memory.heapUsed / metrics.memory.heapTotal) * 100;
    if (memoryUsagePercent > 90) {
      health.status = 'critical';
      health.issues.push('High memory usage (>90%)');
    } else if (memoryUsagePercent > 70) {
      health.status = 'warning';
      health.warnings.push('Elevated memory usage (>70%)');
    }

    // Check response time
    if (responseTime > 1000) {
      health.status = health.status === 'critical' ? 'critical' : 'warning';
      health.warnings.push('Slow response time (>1s)');
    }

    // Check required services
    if (!environment.hasE2B) {
      health.issues.push('E2B API key not configured');
      health.status = 'critical';
    }

    if (!environment.hasFirecrawl) {
      health.warnings.push('Firecrawl API key not configured - website scraping disabled');
      if (health.status === 'healthy') health.status = 'warning';
    }

    const aiProviders = [
      environment.hasOpenAI,
      environment.hasAnthropic,
      environment.hasGoogle,
      environment.hasGroq
    ].filter(Boolean).length;

    if (aiProviders === 0) {
      health.issues.push('No AI providers configured');
      health.status = 'critical';
    } else if (aiProviders === 1) {
      health.warnings.push('Only one AI provider configured - consider adding backup');
      if (health.status === 'healthy') health.status = 'warning';
    }

    const response = {
      health,
      metrics: {
        ...metrics,
        responseTime,
        memoryUsagePercent: Math.round(memoryUsagePercent * 100) / 100,
      },
      cache: {
        redis: cacheStats[0],
        website: cacheStats[1],
      },
      environment,
      performance: {
        responseTime,
        memoryEfficiency: Math.round((1 - memoryUsagePercent / 100) * 100),
        uptime: Math.round(metrics.uptime),
      }
    };

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('[system-health] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get system health',
      health: {
        status: 'critical',
        issues: ['System health check failed'],
        warnings: []
      }
    }, { status: 500 });
  }
}

// Get detailed metrics for monitoring dashboard
export async function POST(request: NextRequest) {
  try {
    const { timeRange = '1h' } = await request.json();

    // This would typically fetch from a time-series database
    // For now, we'll return current metrics with some historical simulation
    const currentMetrics = await GET(request);
    const currentData = await currentMetrics.json();

    if (!currentData.success) {
      return currentData;
    }

    // Simulate historical data (in a real implementation, this would come from a database)
    const generateHistoricalData = (points: number) => {
      const data = [];
      const now = Date.now();
      const interval = timeRange === '1h' ? 60000 : timeRange === '24h' ? 3600000 : 300000; // 1min, 1hr, 5min

      for (let i = points - 1; i >= 0; i--) {
        const timestamp = new Date(now - (i * interval));
        data.push({
          timestamp: timestamp.toISOString(),
          responseTime: Math.random() * 200 + 100, // 100-300ms
          memoryUsage: Math.random() * 30 + 40, // 40-70%
          cacheHitRate: Math.random() * 20 + 80, // 80-100%
          requestCount: Math.floor(Math.random() * 50 + 10), // 10-60 requests
        });
      }

      return data;
    };

    const points = timeRange === '1h' ? 60 : timeRange === '24h' ? 24 : 12;
    const historicalData = generateHistoricalData(points);

    return NextResponse.json({
      success: true,
      data: {
        current: currentData.data,
        historical: historicalData,
        timeRange,
        summary: {
          avgResponseTime: historicalData.reduce((sum, d) => sum + d.responseTime, 0) / historicalData.length,
          avgMemoryUsage: historicalData.reduce((sum, d) => sum + d.memoryUsage, 0) / historicalData.length,
          avgCacheHitRate: historicalData.reduce((sum, d) => sum + d.cacheHitRate, 0) / historicalData.length,
          totalRequests: historicalData.reduce((sum, d) => sum + d.requestCount, 0),
        }
      }
    });

  } catch (error) {
    console.error('[system-health] Detailed metrics error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get detailed metrics'
    }, { status: 500 });
  }
}
