import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Snackbar, 
  Alert, 
  Button, 
  Paper, 
  ToggleButton, 
  ToggleButtonGroup,
  Divider
} from '@mui/material';
import { AutoAwesome, Create } from '@mui/icons-material';
import ProjectForm from '../components/ProjectForm';
import AIAssistant from '../features/ai-assistant/AIAssistant';
import { addProject } from '../store/slices/projectSlice';
import { Project } from '../store/slices/projectSlice';

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creationMethod, setCreationMethod] = useState<'manual' | 'ai'>('manual');

  const handleSubmit = async (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // In a real app, this would be an API call
      const newProject: Project = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      dispatch(addProject(newProject));
      
      // Navigate to the new project
      navigate(`/projects/${newProject.id}`);
    } catch (err) {
      console.error('Failed to create project:', err);
      setError('Failed to create project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAIGeneratedProject = async (projectData: any) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // In a real app, you might want to map the AI data to your project structure
      // Map requirements to the new format if they exist
      const requirements = Array.isArray(projectData.requirements) 
        ? projectData.requirements.map((req: string | { id?: string; description: string }) => ({
            id: typeof req === 'string' ? `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` : (req.id || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`),
            description: typeof req === 'string' ? req : req.description
          }))
        : [];

      const newProject: Project = {
        id: Date.now().toString(),
        name: projectData.projectName || 'AI-Generated Project',
        description: projectData.description || 'Project generated using AI',
        status: 'planning',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        teamMembers: [],
        successMetrics: [],
        assumptions: [],
        phases: Array.isArray(projectData.phases) ? projectData.phases : [],
        personas: Array.isArray(projectData.personas) ? projectData.personas : [],
        requirements,
        // Add any additional fields from AI analysis
        metadata: {
          aiGenerated: true,
          sourceDocuments: Array.isArray(projectData.sourceDocuments) ? projectData.sourceDocuments : [],
          analysis: {
            phases: projectData.phases,
            personas: projectData.personas,
            requirements: projectData.requirements
          }
        }
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      dispatch(addProject(newProject));
      
      // Navigate to the new project
      navigate(`/projects/${newProject.id}`);
    } catch (err) {
      console.error('Failed to create AI-generated project:', err);
      setError('Failed to create project from AI analysis. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
  };

  const handleCreationMethodChange = (
    event: React.MouseEvent<HTMLElement>,
    newMethod: 'manual' | 'ai' | null,
  ) => {
    if (newMethod !== null) {
      setCreationMethod(newMethod);
    }
  };

  if (isSubmitting) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Project
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Choose how you'd like to create your project:
        </Typography>
        
        <Box display="flex" justifyContent="center" mb={4}>
          <ToggleButtonGroup
            value={creationMethod}
            exclusive
            onChange={handleCreationMethodChange}
            aria-label="project creation method"
            sx={{ mt: 2 }}
          >
            <ToggleButton value="manual" aria-label="manual creation">
              <Create sx={{ mr: 1 }} />
              Create Manually
            </ToggleButton>
            <ToggleButton value="ai" aria-label="AI assistant">
              <AutoAwesome sx={{ mr: 1 }} />
              AI Assistant
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        
        <Divider sx={{ my: 3 }} />
      </Box>
      
      {creationMethod === 'manual' ? (
        <ProjectForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          title="New Project"
          submitButtonText="Create Project"
        />
      ) : (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <AIAssistant 
            onProjectGenerated={handleAIGeneratedProject}
            onCancel={() => setCreationMethod('manual')}
          />
        </Paper>
      )}
      
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateProject;
