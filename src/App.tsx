import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from './store/store';
import Layout from './layouts/Layout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import CreateProject from './pages/CreateProject';
import EditProject from './pages/EditProject';
import ExperienceMapPage from './pages/ExperienceMapPage';
import StoryMap from './features/story-map/StoryMapEditor';
import Documentation from './pages/Documentation';
import AIAssistant from './features/ai-assistant/AIAssistant';

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

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/new" element={<CreateProject />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/projects/:id/edit" element={<EditProject />} />
              <Route path="/projects/:projectId/experience-map" element={<ExperienceMapPage />} />
              <Route path="/projects/:id/story-map" element={<StoryMap />} />
              <Route path="/projects/:id/documentation" element={<Documentation />} />
              {/* Add the missing routes with redirects */}
              <Route path="/ai-assistant" element={
                <AIAssistant 
                  onProjectGenerated={(projectData) => {
                    // Handle project generation (e.g., navigate to project detail)
                    console.log('Project generated:', projectData);
                  }} 
                  onCancel={() => window.history.back()} 
                />
              } />
              <Route path="/documentation" element={<Navigate to="/" replace />} />
              <Route path="/story-maps" element={<Navigate to="/" replace />} />
              <Route path="/experience-maps" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
