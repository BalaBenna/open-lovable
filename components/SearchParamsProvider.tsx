'use client';

import { useSearchParams } from 'next/navigation';
import { createContext, useContext, ReactNode, Suspense } from 'react';

interface SearchParamsContextType {
  searchParams: URLSearchParams;
  get: (key: string) => string | null;
  has: (key: string) => boolean;
}

const SearchParamsContext = createContext<SearchParamsContextType | null>(null);

export function useSearchParamsContext() {
  const context = useContext(SearchParamsContext);
  if (!context) {
    throw new Error('useSearchParamsContext must be used within a SearchParamsProvider');
  }
  return context;
}

function SearchParamsContent({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  
  const contextValue: SearchParamsContextType = {
    searchParams,
    get: (key: string) => searchParams.get(key),
    has: (key: string) => searchParams.has(key),
  };

  return (
    <SearchParamsContext.Provider value={contextValue}>
      {children}
    </SearchParamsContext.Provider>
  );
}

export function SearchParamsProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>}>
      <SearchParamsContent>{children}</SearchParamsContent>
    </Suspense>
  );
}

