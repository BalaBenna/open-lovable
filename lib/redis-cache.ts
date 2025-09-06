import { createClient, RedisClientType } from 'redis';

interface CacheConfig {
  url?: string;
  defaultTTL?: number;
  maxRetries?: number;
  retryDelay?: number;
}

class RedisCache {
  private client: RedisClientType | null = null;
  private isConnected = false;
  private config: CacheConfig;
  private fallbackCache = new Map<string, { data: any; expiresAt: number }>();

  constructor(config: CacheConfig = {}) {
    this.config = {
      url: config.url || process.env.REDIS_URL || 'redis://localhost:6379',
      defaultTTL: config.defaultTTL || 30 * 60, // 30 minutes in seconds
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
    };
  }

  async connect(): Promise<void> {
    if (this.isConnected && this.client) {
      return;
    }

    try {
      this.client = createClient({
        url: this.config.url,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > (this.config.maxRetries || 3)) {
              console.warn('[RedisCache] Max retries reached, falling back to memory cache');
              return false;
            }
            return Math.min(retries * (this.config.retryDelay || 1000), 3000);
          }
        }
      });

      this.client.on('error', (err) => {
        // Only log Redis errors once to avoid spam
        if (this.isConnected) {
          console.warn('[RedisCache] Redis connection lost, falling back to memory cache');
        }
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('[RedisCache] Connected to Redis');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        console.log('[RedisCache] Disconnected from Redis');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      console.error('[RedisCache] Failed to connect to Redis:', error);
      console.log('[RedisCache] Falling back to in-memory cache');
      this.isConnected = false;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    const actualTTL = ttl || this.config.defaultTTL || 1800;
    
    try {
      if (this.isConnected && this.client) {
        await this.client.setEx(key, actualTTL, JSON.stringify(value));
        return true;
      } else {
        // Fallback to in-memory cache
        this.fallbackCache.set(key, {
          data: value,
          expiresAt: Date.now() + (actualTTL * 1000)
        });
        return true;
      }
    } catch (error) {
      console.error('[RedisCache] Error setting cache:', error);
      // Fallback to in-memory cache
      this.fallbackCache.set(key, {
        data: value,
        expiresAt: Date.now() + (actualTTL * 1000)
      });
      return false;
    }
  }

  async get(key: string): Promise<any | null> {
    try {
      if (this.isConnected && this.client) {
        const value = await this.client.get(key);
        return value ? JSON.parse(value) : null;
      } else {
        // Fallback to in-memory cache
        const entry = this.fallbackCache.get(key);
        if (!entry) return null;
        
        if (Date.now() > entry.expiresAt) {
          this.fallbackCache.delete(key);
          return null;
        }
        
        return entry.data;
      }
    } catch (error) {
      console.error('[RedisCache] Error getting cache:', error);
      
      // Try fallback cache
      const entry = this.fallbackCache.get(key);
      if (!entry) return null;
      
      if (Date.now() > entry.expiresAt) {
        this.fallbackCache.delete(key);
        return null;
      }
      
      return entry.data;
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      if (this.isConnected && this.client) {
        const exists = await this.client.exists(key);
        return exists === 1;
      } else {
        // Fallback to in-memory cache
        const entry = this.fallbackCache.get(key);
        if (!entry) return false;
        
        if (Date.now() > entry.expiresAt) {
          this.fallbackCache.delete(key);
          return false;
        }
        
        return true;
      }
    } catch (error) {
      console.error('[RedisCache] Error checking cache existence:', error);
      
      // Try fallback cache
      const entry = this.fallbackCache.get(key);
      if (!entry) return false;
      
      if (Date.now() > entry.expiresAt) {
        this.fallbackCache.delete(key);
        return false;
      }
      
      return true;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      if (this.isConnected && this.client) {
        await this.client.del(key);
      }
      
      // Also delete from fallback cache
      this.fallbackCache.delete(key);
      return true;
    } catch (error) {
      console.error('[RedisCache] Error deleting cache:', error);
      this.fallbackCache.delete(key);
      return false;
    }
  }

  async clear(): Promise<boolean> {
    try {
      if (this.isConnected && this.client) {
        await this.client.flushDb();
      }
      
      // Also clear fallback cache
      this.fallbackCache.clear();
      return true;
    } catch (error) {
      console.error('[RedisCache] Error clearing cache:', error);
      this.fallbackCache.clear();
      return false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.client && this.isConnected) {
        await this.client.disconnect();
      }
      this.isConnected = false;
      this.client = null;
    } catch (error) {
      console.error('[RedisCache] Error disconnecting:', error);
    }
  }

  // Get cache statistics
  async getStats(): Promise<{ 
    isRedisConnected: boolean; 
    fallbackCacheSize: number;
    redisInfo?: any;
  }> {
    const stats = {
      isRedisConnected: this.isConnected,
      fallbackCacheSize: this.fallbackCache.size,
      redisInfo: null as any
    };

    try {
      if (this.isConnected && this.client) {
        stats.redisInfo = await this.client.info('memory');
      }
    } catch (error) {
      console.error('[RedisCache] Error getting Redis stats:', error);
    }

    return stats;
  }

  // Cleanup expired entries from fallback cache
  private cleanupFallbackCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.fallbackCache.entries()) {
      if (now > entry.expiresAt) {
        this.fallbackCache.delete(key);
      }
    }
  }

  // Start periodic cleanup
  startPeriodicCleanup(intervalMs: number = 5 * 60 * 1000): void {
    setInterval(() => {
      this.cleanupFallbackCache();
    }, intervalMs);
  }
}

// Create a singleton instance
export const redisCache = new RedisCache();

// Auto-connect and start cleanup on import
redisCache.connect().catch(console.error);
redisCache.startPeriodicCleanup();

// Cache key generators
export const CacheKeys = {
  website: (url: string) => `website:${Buffer.from(url).toString('base64')}`,
  aiResponse: (prompt: string, model: string) => `ai:${model}:${Buffer.from(prompt).toString('base64').slice(0, 50)}`,
  fileContent: (path: string) => `file:${Buffer.from(path).toString('base64')}`,
  designPatterns: (url: string) => `patterns:${Buffer.from(url).toString('base64')}`,
} as const;

export type CacheKeyType = keyof typeof CacheKeys;
