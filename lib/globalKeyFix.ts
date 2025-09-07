/**
 * Global key fix utilities for systematic key replacement
 */

import { createUniqueKey } from './useUniqueKey';

// Global key registry to prevent duplicates
const keyRegistry = new Set<string>();

/**
 * Creates a globally unique key that's never been used before
 * @param prefix - Prefix for the key
 * @returns A globally unique key
 */
export function globalKeyFix(prefix: string = 'key'): string {
  let attempts = 0;
  let key: string;
  
  do {
    key = createUniqueKey(prefix);
    attempts++;
    
    // Prevent infinite loops
    if (attempts > 100) {
      key = `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      break;
    }
  } while (keyRegistry.has(key));
  
  keyRegistry.add(key);
  return key;
}

/**
 * Creates a safe key with index that's guaranteed to be unique
 * @param value - The value to use as key
 * @param index - The index as fallback
 * @param prefix - Optional prefix
 * @returns A safe, unique key
 */
export function safeKeyWithIndex(value: string | undefined | null, index: number, prefix: string = 'item'): string {
  if (value && value.trim() !== '') {
    // Check if this value is already used
    if (keyRegistry.has(value)) {
      return globalKeyFix(`${prefix}-${value}`);
    }
    keyRegistry.add(value);
    return value;
  }
  
  return globalKeyFix(`${prefix}-${index}`);
}

/**
 * Creates a safe key from multiple parts with global uniqueness
 * @param parts - Array of key parts
 * @param separator - Separator between parts
 * @returns A safe, unique key
 */
export function safeKeyFromParts(parts: (string | number | undefined | null)[], separator: string = '-'): string {
  const safeParts = parts
    .map(part => part?.toString() || '')
    .filter(part => part.trim() !== '')
    .join(separator);
  
  if (safeParts && !keyRegistry.has(safeParts)) {
    keyRegistry.add(safeParts);
    return safeParts;
  }
  
  return globalKeyFix('key');
}

/**
 * Clears the key registry (useful for testing or reset)
 */
export function clearKeyRegistry(): void {
  keyRegistry.clear();
}

/**
 * Gets the current key registry size (for debugging)
 */
export function getKeyRegistrySize(): number {
  return keyRegistry.size;
}

/**
 * Checks if a key is already in use
 */
export function isKeyInUse(key: string): boolean {
  return keyRegistry.has(key);
}