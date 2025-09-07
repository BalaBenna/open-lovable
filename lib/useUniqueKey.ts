/**
 * Hook for generating unique keys that prevents duplicates
 */

import { useRef } from 'react';

// Global counter for unique key generation
let globalKeyCounter = 0;

/**
 * Hook that generates unique keys for React components
 * @param prefix - Optional prefix for the key
 * @returns A function that generates unique keys
 */
export function useUniqueKey(prefix: string = 'key') {
  const localCounter = useRef(0);
  
  return (value?: string | number | null | undefined, fallbackPrefix?: string) => {
    if (value && value.toString().trim() !== '') {
      return value.toString();
    }
    
    const keyPrefix = fallbackPrefix || prefix;
    const uniqueId = `${keyPrefix}-${++globalKeyCounter}-${++localCounter.current}-${Date.now()}`;
    return uniqueId;
  };
}

/**
 * Utility function to create a unique key without hooks
 * @param value - The value to use as key
 * @param prefix - Optional prefix for the fallback key
 * @returns A unique key string
 */
export function createUniqueKey(value?: string | number | null | undefined, prefix: string = 'key'): string {
  if (value && value.toString().trim() !== '') {
    return value.toString();
  }
  
  return `${prefix}-${++globalKeyCounter}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
