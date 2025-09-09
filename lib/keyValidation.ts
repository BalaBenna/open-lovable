/**
 * Runtime key validation to catch any remaining empty key issues
 */

import React from 'react';
import { createUniqueKey } from './useUniqueKey';

/**
 * Diagnostic utility to find duplicate and empty keys
 */
export function assertUniqueKeys(keys: (string | number | undefined | null)[], label: string = 'keys'): string[] {
  const freq = keys.reduce((acc, k) => { 
    const key = k?.toString() || ''; 
    acc[key] = (acc[key] || 0) + 1; 
    return acc; 
  }, {} as Record<string, number>);
  
  const duplicates = Object.entries(freq).filter(([, c]) => c > 1);
  if (duplicates.length) {
    console.error(`[KeyAssertion] duplicate ${label}:`, duplicates);
    console.error(`[KeyAssertion] full key frequency:`, freq);
  }
  if (Object.keys(freq).some(k => k === '')) {
    console.error(`[KeyAssertion] empty-string key detected in ${label}`);
    console.error(`[KeyAssertion] empty key count:`, freq[''] || 0);
  }
  return duplicates.map(([key]) => key);
}

/**
 * Diagnostic utility to log keys during render
 */
export function logRenderKeys(items: any[], keyExtractor: (item: any, index: number) => string | number | undefined | null, label: string = 'render keys'): void {
  if (process.env.NODE_ENV === 'development') {
    const keys = items.map(keyExtractor);
    console.log(`[KeyDebug] ${label}:`, keys);
    console.log(`[KeyDebug] ${label} frequency:`, keys.reduce((acc, k) => { 
      const key = k?.toString() || ''; 
      acc[key] = (acc[key] || 0) + 1; 
      return acc; 
    }, {} as Record<string, number>));
    assertUniqueKeys(keys, label);
  }
}

// Override console.error to catch React key warnings
const originalConsoleError = console.error;

console.error = (...args: any[]) => {
  // Check if this is a React key warning
  if (args[0] && typeof args[0] === 'string' && args[0].includes('Encountered two children with the same key')) {
    const keyMatch = args[0].match(/key, `([^`]*)`/);
    const keyValue = keyMatch ? keyMatch[1] : 'unknown';
    
    console.warn('🚨 React Key Warning Detected:', {
      message: args[0],
      keyValue: keyValue,
      isEmpty: keyValue === '',
      isDuplicate: keyValue !== '' && keyValue !== 'unknown',
      stack: new Error().stack,
      timestamp: new Date().toISOString()
    });
    
    // Log additional context
    if (keyValue === '') {
      console.warn('❌ Empty key detected! This needs immediate fixing.');
      console.warn('💡 Suggestion: Use globalKeyFix() or safeKeyWithIndex() from lib/globalKeyFix.ts');
    } else if (keyValue !== 'unknown') {
      console.warn('⚠️ Duplicate key detected:', keyValue);
      console.warn('💡 Suggestion: Use createUniqueKey() from lib/useUniqueKey.ts');
    }
    
    console.warn('This indicates there are still empty keys in the codebase. Please check the stack trace above.');
  }
  
  // Call the original console.error
  originalConsoleError.apply(console, args);
};

// Development-only key validation
if (process.env.NODE_ENV === 'development') {
  // Override React.createElement to validate keys
  const originalCreateElement = React.createElement;
  
  if (typeof React !== 'undefined') {
    React.createElement = function(type: any, props: any, ...children: any[]) {
      // Check if this element has a key prop
      if (props && props.key !== undefined) {
        if (props.key === '' || props.key === null || props.key === undefined) {
          console.error('🚨 Empty key detected in React.createElement:', {
            type: typeof type === 'string' ? type : type?.name || 'Component',
            props,
            keyValue: props.key,
            stack: new Error().stack
          });
        } else if (typeof props.key === 'string' && props.key.includes('undefined')) {
          console.warn('⚠️ Key contains undefined:', {
            type: typeof type === 'string' ? type : type?.name || 'Component',
            keyValue: props.key,
            stack: new Error().stack
          });
        }
      }
      
      return originalCreateElement.apply(React, Array.from(arguments));
    };
  }
  
  // Add a global key tracker to detect duplicates
  const keyTracker = new Map();
  
  // Override console.warn to track key usage
  const originalConsoleWarn = console.warn;
  console.warn = (...args: any[]) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('Encountered two children with the same key')) {
      const keyMatch = args[0].match(/key, `([^`]*)`/);
      const keyValue = keyMatch ? keyMatch[1] : 'unknown';
      
      if (keyValue !== 'unknown') {
        const count = keyTracker.get(keyValue) || 0;
        keyTracker.set(keyValue, count + 1);
        
        if (count > 0) {
          console.error('🚨 Duplicate key detected:', {
            keyValue,
            count: count + 1,
            stack: new Error().stack
          });
        }
      }
    }
    
    originalConsoleWarn.apply(console, args);
  };
}

export {};
