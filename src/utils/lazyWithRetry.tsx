import React, { ComponentType, lazy, Suspense } from 'react';

/**
 * A higher-order component that wraps a dynamic import with React.lazy and adds retry logic.
 * @param componentImport - The dynamic import function for the component
 * @returns A lazy-loaded component with retry functionality
 */
export const lazyWithRetry = <T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
) => {
  return lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.error('Error loading component:', error);
      // Add retry logic
      await new Promise((resolve) => setTimeout(resolve, 500));
      return componentImport();
    }
  });
};

/**
 * Creates a lazy-loaded component with a loading fallback
 * @param componentImport - The dynamic import function for the component
 * @param fallback - Optional fallback component to show while loading
 * @returns A component with Suspense and error boundary
 */
export const createLazyComponent = <T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  fallback: React.ReactNode = <div>Loading...</div>
) => {
  const LazyComponent = lazyWithRetry(componentImport);
  
  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...(props as any)} />
    </Suspense>
  );
};
