import { NextRequest, NextResponse } from 'next/server';
import { performanceMonitor } from '@/lib/performance-monitor';
import { promptOptimizer } from '@/lib/prompt-optimizer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    switch (type) {
      case 'analytics':
        const analytics = performanceMonitor.getAnalytics();
        const promptAnalytics = promptOptimizer.getAnalytics();
        
        return NextResponse.json({
          success: true,
          data: {
            performance: analytics,
            prompts: promptAnalytics,
            timestamp: Date.now()
          }
        });

      case 'health':
        const healthStatus = performanceMonitor.getHealthStatus();
        
        return NextResponse.json({
          success: true,
          data: healthStatus
        });

      case 'issues':
        const issues = performanceMonitor.getRecentIssues();
        
        return NextResponse.json({
          success: true,
          data: issues
        });

      case 'export':
        const exportData = await performanceMonitor.exportMetrics();
        
        return NextResponse.json({
          success: true,
          data: exportData
        });

      default:
        // Return comprehensive performance data
        const comprehensiveData = {
          analytics: performanceMonitor.getAnalytics(),
          health: performanceMonitor.getHealthStatus(),
          issues: performanceMonitor.getRecentIssues(),
          prompts: promptOptimizer.getAnalytics()
        };

        return NextResponse.json({
          success: true,
          data: comprehensiveData
        });
    }
  } catch (error) {
    console.error('[performance-analytics] Error:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    switch (action) {
      case 'clear-cache':
        await promptOptimizer.clearCache();
        
        return NextResponse.json({
          success: true,
          message: 'Cache cleared successfully'
        });

      case 'clear-old-metrics':
        const { olderThanHours = 24 } = await request.json();
        performanceMonitor.clearOldMetrics(olderThanHours * 60 * 60 * 1000);
        
        return NextResponse.json({
          success: true,
          message: `Metrics older than ${olderThanHours} hours cleared`
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('[performance-analytics] POST Error:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}
