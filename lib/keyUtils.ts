/**
 * Utility functions for ensuring React keys are never empty
 */

// Global counter for unique key generation
let keyCounter = 0;
let lastTimestamp = 0;

/**
 * Generates a unique key using a counter and microsecond precision to prevent duplicates
 * @param prefix - Prefix for the key
 * @returns A unique key string
 */
function generateUniqueKey(prefix: string = 'key'): string {
  const now = Date.now();
  
  // If we're in the same millisecond, increment the counter
  if (now === lastTimestamp) {
    keyCounter++;
  } else {
    // Reset counter for new timestamp
    keyCounter = 1;
    lastTimestamp = now;
  }
  
  // Use performance.now() for microsecond precision if available
  const microTime = typeof performance !== 'undefined' ? 
    Math.floor(performance.now() * 1000) : 
    now * 1000 + keyCounter;
  
  return `${prefix}-${microTime}-${keyCounter}`;
}

/**
 * Creates a safe key with fallback that prevents duplicates
 * @param value - The value to use as key
 * @param fallbackPrefix - Optional prefix for the fallback key
 * @returns A safe key string
 */
export function createSafeKeyWithFallback(value: string | number | undefined | null, fallbackPrefix: string = 'key'): string {
  if (value && value.toString().trim() !== '') {
    return value.toString();
  }
  
  return generateUniqueKey(fallbackPrefix);
}

/**
 * Ensures a React key is never empty by providing a fallback
 * @param key - The potential key value
 * @param fallbackPrefix - Optional prefix for the fallback key
 * @returns A non-empty key string
 */
export function ensureKey(key: string | undefined | null, fallbackPrefix: string = 'key'): string {
  if (key && key.trim() !== '') {
    return key;
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.warn('ensureKey: Empty or undefined key detected, using fallback:', {
      key,
      fallbackPrefix,
      stack: new Error().stack
    });
  }
  
  return generateUniqueKey(fallbackPrefix);
}

/**
 * Creates a safe key from multiple parts, ensuring no part is empty
 * @param parts - Array of key parts
 * @param separator - Separator between parts (default: '-')
 * @returns A safe key string
 */
export function createSafeKey(parts: (string | number | undefined | null)[], separator: string = '-'): string {
  const safeParts = parts
    .map(part => part?.toString() || '')
    .filter(part => part.trim() !== '')
    .join(separator);
  
  if (safeParts) {
    return safeParts;
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.warn('createSafeKey: All parts were empty, using fallback:', {
      parts,
      separator,
      stack: new Error().stack
    });
  }
  
  return generateUniqueKey('key');
}

/**
 * Creates a safe key with index fallback
 * @param value - The value to use as key
 * @param index - The index as fallback
 * @param prefix - Optional prefix
 * @returns A safe key string
 */
export function createIndexedKey(value: string | undefined | null, index: number, prefix: string = 'item'): string {
  if (value && value.trim() !== '') {
    return value;
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.warn('createIndexedKey: Empty value detected, using index fallback:', {
      value,
      index,
      prefix,
      stack: new Error().stack
    });
  }
  
  return `${prefix}-${index}`;
}

/**
 * Validates that a key is not empty and logs warnings in development
 * @param key - The key to validate
 * @param context - Context for debugging
 * @returns The key if valid, or a warning in development
 */
export function validateKey(key: string | number | undefined | null, context: string = 'unknown'): string | number {
  if (key && key.toString().trim() !== '') {
    return key;
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.error('validateKey: Empty key detected in context:', {
      key,
      context,
      stack: new Error().stack
    });
  }
  
  return key;
}
