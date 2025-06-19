import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Snackbar, 
  Alert,
  Button
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import ProjectForm from '../components/ProjectForm';
import { updateProject, fetchProjectById, selectAllProjects } from '../store/slices/projectSlice';
import { AppDispatch, RootState } from '../store/store';
import { Project, TeamMember } from '../store/slices/projectSlice';

const EditProject: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  // Get the project using the selector and ensure it has all required fields
  const project = useSelector((state: RootState) => {
    if (!id) return null;
    const projects = selectAllProjects(state);
    const selectedProject = projects.find((p: Project) => p.id === id);
    
    if (!selectedProject) return null;
    
    // Create a new object with all required fields and defaults
    return {
      ...selectedProject,
      teamMembers: (selectedProject.teamMembers || []) as TeamMember[],
      businessProblem: selectedProject.businessProblem || '',
      targetAudience: selectedProject.targetAudience || '',
      successMetrics: selectedProject.successMetrics || [],
      assumptions: selectedProject.assumptions || [],
      createdAt: selectedProject.createdAt || new Date().toISOString(),
      updatedAt: selectedProject.updatedAt || new Date().toISOString(),
      velocity: selectedProject.velocity || { android: [], ios: [], web: [] }
    };
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Fetch project data if not already loaded
  useEffect(() => {
    if (id && !project) {
      const loadProject = async () => {
        try {
          setIsSubmitting(true);
          const resultAction = await dispatch(fetchProjectById(id));
          if (fetchProjectById.rejected.match(resultAction)) {
            setNotFound(true);
          }
        } catch (err) {
          console.error('Failed to load project:', err);
          setError('Failed to load project data');
        } finally {
          setIsSubmitting(false);
        }
      };
      loadProject();
    }
  }, [id, project, dispatch]);

  const handleSubmit = async (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!id || !project) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // In a real app, this would be an API call
      const updatedProject: Project = {
        ...data,
        id,
        teamMembers: data.teamMembers || [],
        businessProblem: data.businessProblem || '',
        targetAudience: data.targetAudience || '',
        successMetrics: data.successMetrics || [],
        assumptions: data.assumptions || [],
        velocity: project.velocity || { android: [], ios: [], web: [] },
        createdAt: project.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      dispatch(updateProject(updatedProject));
      
      // Navigate back to the project
      navigate(`/projects/${id}`);
    } catch (err) {
      console.error('Failed to update project:', err);
      setError('Failed to update project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
  };

  if (notFound) {
    return (
      <Box textAlign="center" py={5}>
        <Typography variant="h5" gutterBottom>
          Project not found
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/projects')}
          startIcon={<ArrowBack />}
          sx={{ mt: 2 }}
        >
          Back to Projects
        </Button>
      </Box>
    );
  }

  if (!project && isSubmitting) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!project) {
    return null; // or a loading state
  }

  return (
    <Box>
      <Box mb={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/projects/${id}`)}
          sx={{ mb: 2 }}
        >
          Back to Project
        </Button>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Project
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Update the project details below.
        </Typography>
      </Box>
      
      <ProjectForm
        initialData={{
          name: project.name,
          description: project.description,
          status: project.status,
          teamMembers: project.teamMembers,
          businessProblem: project.businessProblem || '',
          targetAudience: project.targetAudience || '',
          successMetrics: project.successMetrics || [],
          assumptions: project.assumptions || [],
        }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        title="Edit Project"
        submitButtonText="Save Changes"
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

export default EditProject;
