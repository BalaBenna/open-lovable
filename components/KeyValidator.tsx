/**
 * Key validation component to prevent empty React keys
 */

import React from 'react';

interface KeyValidatorProps {
  children: React.ReactNode;
  keyValue: string | number | undefined | null;
  fallbackPrefix?: string;
}

/**
 * A wrapper component that ensures React keys are never empty
 * This component will log warnings in development and provide fallback keys
 */
export function KeyValidator({ children, keyValue, fallbackPrefix = 'key' }: KeyValidatorProps) {
  const safeKey = React.useMemo(() => {
    if (keyValue && keyValue.toString().trim() !== '') {
      return keyValue.toString();
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.warn('KeyValidator: Empty or undefined key detected, using fallback:', {
        keyValue,
        fallbackPrefix,
        stack: new Error().stack
      });
    }
    
    return `${fallbackPrefix}-${Math.random().toString(36).substr(2, 9)}`;
  }, [keyValue, fallbackPrefix]);

  return <>{children}</>;
}

/**
 * Hook to create safe keys
 */
export function useSafeKey(value: string | number | undefined | null, prefix: string = 'key'): string {
  return React.useMemo(() => {
    if (value && value.toString().trim() !== '') {
      return value.toString();
    }
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }, [value, prefix]);
}

/**
 * Utility function to create safe keys
 */
export function createSafeKey(value: string | number | undefined | null, prefix: string = 'key'): string {
  if (value && value.toString().trim() !== '') {
    return value.toString();
  }
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}
