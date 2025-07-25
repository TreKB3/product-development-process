import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { store } from './store/store';
import Layout from './layouts/Layout';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load all page components
const LazyDashboard = lazy(() => import('./pages/Dashboard'));
const LazyProjects = lazy(() => import('./pages/Projects'));
const LazyProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const LazyCreateProject = lazy(() => import('./pages/CreateProject'));
const LazyEditProject = lazy(() => import('./pages/EditProject'));
const LazyExperienceMapPage = lazy(() => import('./pages/ExperienceMapPage'));
const LazyStoryMap = lazy(() => import('./features/story-map/StoryMapEditor'));
const LazyDocumentation = lazy(() => import('./pages/Documentation'));
const LazyAIAssistant = lazy(() => import('./features/ai-assistant/AIAssistant'));

// Loading fallback component
const LoadingFallback = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
    <CircularProgress />
  </Box>
);

// Error fallback component
const ErrorFallback = ({ 
  error, 
  errorInfo,
  resetErrorBoundary 
}: { 
  error: Error | null; 
  errorInfo: React.ErrorInfo | null;
  resetErrorBoundary: () => void;
}) => (
  <Box p={3} textAlign="center">
    <Typography variant="h5" color="error" gutterBottom>
      Something went wrong
    </Typography>
    {error && (
      <pre style={{ color: 'red', textAlign: 'left' }}>
        {error.message}
        {errorInfo?.componentStack && (
          <div style={{ marginTop: '1rem' }}>
            <div>Component Stack:</div>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{errorInfo.componentStack}</pre>
          </div>
        )}
      </pre>
    )}
    <Button 
      variant="contained" 
      color="primary" 
      onClick={resetErrorBoundary}
      sx={{ mt: 2 }}
    >
      Try again
    </Button>
  </Box>
);

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

// Component to wrap routes with ErrorBoundary and Suspense
const RouteWithErrorBoundary = ({ element: Element }: { element: React.ComponentType }) => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <Suspense fallback={<LoadingFallback />}>
      <Element />
    </Suspense>
  </ErrorBoundary>
);

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Layout>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<RouteWithErrorBoundary element={LazyDashboard} />} />
                  <Route path="/projects" element={<RouteWithErrorBoundary element={LazyProjects} />} />
                  <Route path="/projects/new" element={<RouteWithErrorBoundary element={LazyCreateProject} />} />
                  <Route path="/projects/:id" element={<RouteWithErrorBoundary element={LazyProjectDetail} />} />
                  <Route path="/projects/:id/edit" element={<RouteWithErrorBoundary element={LazyEditProject} />} />
                  <Route 
                    path="/projects/:projectId/experience-map" 
                    element={<RouteWithErrorBoundary element={LazyExperienceMapPage} />} 
                  />
                  <Route 
                    path="/projects/:id/story-map" 
                    element={<RouteWithErrorBoundary element={LazyStoryMap} />} 
                  />
                  <Route 
                    path="/projects/:id/documentation" 
                    element={<RouteWithErrorBoundary element={LazyDocumentation} />} 
                  />
                  <Route 
                    path="/ai-assistant" 
                    element={
                      <ErrorBoundary FallbackComponent={ErrorFallback}>
                        <Suspense fallback={<LoadingFallback />}>
                          <LazyAIAssistant 
                            onProjectGenerated={(projectData: any) => {
                              // Handle project generation (e.g., navigate to project detail)
                              console.log('Project generated:', projectData);
                            }} 
                            onCancel={() => window.history.back()} 
                          />
                        </Suspense>
                      </ErrorBoundary>
                    } 
                  />
                  <Route path="/documentation" element={<Navigate to="/" replace />} />
                  <Route path="/story-maps" element={<Navigate to="/" replace />} />
                  <Route path="/experience-maps" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </Layout>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
