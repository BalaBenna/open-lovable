// Simple in-memory cache for website scraping results
interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

class WebsiteCache {
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes

  set(url: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    const now = Date.now();
    this.cache.set(url, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    });
    
    // Clean up expired entries periodically
    this.cleanup();
  }

  get(url: string): any | null {
    const entry = this.cache.get(url);
    
    if (!entry) {
      return null;
    }
    
    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(url);
      return null;
    }
    
    return entry.data;
  }

  has(url: string): boolean {
    const entry = this.cache.get(url);
    
    if (!entry) {
      return false;
    }
    
    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(url);
      return false;
    }
    
    return true;
  }

  delete(url: string): boolean {
    return this.cache.delete(url);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    
    for (const [url, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(url);
      }
    }
  }

  // Get cache statistics
  getStats(): { size: number; entries: Array<{ url: string; age: number; ttl: number }> } {
    const now = Date.now();
    const entries = [];
    
    for (const [url, entry] of this.cache.entries()) {
      entries.push({
        url,
        age: Math.round((now - entry.timestamp) / 1000), // age in seconds
        ttl: Math.round((entry.expiresAt - now) / 1000) // remaining TTL in seconds
      });
    }
    
    return {
      size: this.cache.size,
      entries
    };
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
