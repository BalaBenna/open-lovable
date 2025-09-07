/**
 * Global key replacement utility to fix duplicate and empty keys
 */

import { createUniqueKey } from './useUniqueKey';

/**
 * Creates a safe key that prevents duplicates and empty values
 * @param value - The value to use as key
 * @param prefix - Optional prefix for the fallback key
 * @returns A safe key string
 */
export function safeKey(value?: string | number | null | undefined, prefix: string = 'key'): string {
  return createUniqueKey(value, prefix);
}

/**
 * Creates a safe key with index fallback
 * @param value - The value to use as key
 * @param index - The index as fallback
 * @param prefix - Optional prefix
 * @returns A safe key string
 */
export function safeKeyWithIndex(value?: string | number | null | undefined, index?: number, prefix: string = 'item'): string {
  if (value && value.toString().trim() !== '') {
    return value.toString();
  }
  
  if (index !== undefined && index !== null) {
    return `${prefix}-${index}`;
  }
  
  return createUniqueKey(value, prefix);
}

/**
 * Creates a safe key from multiple parts
 * @param parts - Array of key parts
 * @param separator - Separator between parts (default: '-')
 * @returns A safe key string
 */
export function safeKeyFromParts(parts: (string | number | undefined | null)[], separator: string = '-'): string {
  const safeParts = parts
    .map(part => part?.toString() || '')
    .filter(part => part.trim() !== '')
    .join(separator);
  
  if (safeParts) {
    return safeParts;
  }
  
  return createUniqueKey(undefined, 'key');
}
