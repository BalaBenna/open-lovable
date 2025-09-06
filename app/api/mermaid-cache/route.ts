import { NextRequest, NextResponse } from 'next/server';
import { redisCache } from '@/lib/redis-cache';

export async function POST(request: NextRequest) {
  try {
    const { action, key, data, ttl } = await request.json();

    if (!key) {
      return NextResponse.json({
        success: false,
        error: 'Cache key is required'
      }, { status: 400 });
    }

    switch (action) {
      case 'get':
        try {
          const cachedData = await redisCache.get(`mermaid:${key}`);
          return NextResponse.json({
            success: true,
            data: cachedData
          });
        } catch (error) {
          console.error('[mermaid-cache] Get error:', error);
          return NextResponse.json({
            success: false,
            data: null
          });
        }

      case 'set':
        if (!data) {
          return NextResponse.json({
            success: false,
            error: 'Data is required for set operation'
          }, { status: 400 });
        }

        try {
          await redisCache.set(`mermaid:${key}`, data, ttl || 3600);
          return NextResponse.json({
            success: true,
            message: 'Data cached successfully'
          });
        } catch (error) {
          console.error('[mermaid-cache] Set error:', error);
          return NextResponse.json({
            success: false,
            error: 'Failed to cache data'
          }, { status: 500 });
        }

      case 'delete':
        try {
          await redisCache.delete(`mermaid:${key}`);
          return NextResponse.json({
            success: true,
            message: 'Cache entry deleted'
          });
        } catch (error) {
          console.error('[mermaid-cache] Delete error:', error);
          return NextResponse.json({
            success: false,
            error: 'Failed to delete cache entry'
          }, { status: 500 });
        }

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use "get", "set", or "delete"'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('[mermaid-cache] API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
