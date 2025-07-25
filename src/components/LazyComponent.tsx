import React, { Suspense } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { Box, CircularProgress } from '@mui/material';

interface LazyComponentProps {
  /**
   * The component to be lazily loaded
   * Should be a dynamic import: () => import('./Component')
   */
  component: () => Promise<{ default: React.ComponentType<any> }>;
  
  /**
   * Optional fallback UI to show while loading
   */
  fallback?: React.ReactNode;
  
  /**
   * Optional error message to show when component fails to load
   */
  errorMessage?: string;
  
  /**
   * Optional props to pass to the component
   */
  componentProps?: Record<string, any>;
}

/**
 * A component that handles lazy loading with error boundaries and loading states.
 * Wraps the lazy-loaded component with ErrorBoundary and Suspense.
 */
const LazyComponent: React.FC<LazyComponentProps> = ({
  component,
  fallback = (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
      <CircularProgress />
    </Box>
  ),
  errorMessage = 'Failed to load component. Please try again.',
  componentProps = {},
}) => {
  const LazyLoadedComponent = React.lazy(component);

  return (
    <ErrorBoundary
      fallback={
        <Box p={3} color="error.main">
          {errorMessage}
        </Box>
      }
    >
      <Suspense fallback={fallback}>
        <LazyLoadedComponent {...componentProps} />
      </Suspense>
    </ErrorBoundary>
  );
};

export default LazyComponent;
