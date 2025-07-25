import React, { Suspense, ComponentType, ReactNode } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import { Box, CircularProgress } from '@mui/material';

interface WithErrorBoundaryProps {
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  loadingFallback?: ReactNode;
}

/**
 * A higher-order component that wraps a component with ErrorBoundary and Suspense
 * for better error handling and loading states.
 * 
 * @param WrappedComponent - The component to wrap with error boundary and suspense
 * @param options - Configuration options for the HOC
 * @returns A component wrapped with ErrorBoundary and Suspense
 */
const withErrorBoundary = <P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithErrorBoundaryProps = {}
) => {
  const {
    fallback,
    onError,
    loadingFallback = (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    ),
  } = options;

  const ComponentWithErrorBoundary: React.FC<P> = (props) => {
    return (
      <ErrorBoundary fallback={fallback} onError={onError}>
        <Suspense fallback={loadingFallback}>
          <WrappedComponent {...(props as P)} />
        </Suspense>
      </ErrorBoundary>
    );
  };

  // Format for display in DevTools
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;

  return ComponentWithErrorBoundary;
};

export default withErrorBoundary;
