import { redisCache, CacheKeys } from './redis-cache';

class WebsiteCache {
  private readonly DEFAULT_TTL = 30 * 60; // 30 minutes in seconds

  async set(url: string, data: any, ttl: number = this.DEFAULT_TTL): Promise<void> {
    const cacheKey = CacheKeys.website(url);
    await redisCache.set(cacheKey, data, ttl);
  }

  async get(url: string): Promise<any | null> {
    const cacheKey = CacheKeys.website(url);
    return await redisCache.get(cacheKey);
  }

  async has(url: string): Promise<boolean> {
    const cacheKey = CacheKeys.website(url);
    return await redisCache.has(cacheKey);
  }

  async delete(url: string): Promise<boolean> {
    const cacheKey = CacheKeys.website(url);
    return await redisCache.delete(cacheKey);
  }

  async clear(): Promise<void> {
    await redisCache.clear();
  }

  // Get cache statistics
  async getStats(): Promise<any> {
    return await redisCache.getStats();
  }
}

// Export a singleton instance
export const websiteCache = new WebsiteCache();

// Helper function to generate cache key from URL
export function generateCacheKey(url: string): string {
  try {
    const urlObj = new URL(url);
    // Normalize URL by removing unnecessary parts
    return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}${urlObj.search}`;
  } catch {
    return url;
  }
}
