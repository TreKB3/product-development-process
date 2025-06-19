import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Box, Typography, CircularProgress, Snackbar, Alert } from '@mui/material';
import ProjectForm from '../components/ProjectForm';
import { addProject } from '../store/slices/projectSlice';
import { Project } from '../store/slices/projectSlice';

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleCloseSnackbar = () => {
    setError(null);
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
        <Typography variant="body1" color="text.secondary">
          Fill in the details below to create a new project.
        </Typography>
      </Box>
      
      <ProjectForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        title="New Project"
        submitButtonText="Create Project"
      />
      
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
