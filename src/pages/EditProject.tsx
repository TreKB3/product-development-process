import React, { useEffect, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
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
import { 
  updateProject, 
  fetchProjectById, 
  selectAllProjects,
  Project,
  TeamMember
} from '../store/slices/projectSlice';
import { AppDispatch, RootState } from '../store/store';

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

  type FormData = Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'velocity'> & {
    successMetrics: string[];
    teamMembers: TeamMember[];
    businessProblem: string;
    targetAudience: string;
    assumptions: Array<{
      id?: string;
      description: string;
      risk: 'low' | 'medium' | 'high';
      validationStatus: 'not-validated' | 'in-progress' | 'validated' | 'invalidated';
    }>;
  };

  const handleSubmit = useCallback(async (formData: FormData) => {
    if (!id || !project) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Transform form data to match Project type
      const updatedProject: Project = {
        ...formData,
        id: id,
        status: formData.status,
        teamMembers: formData.teamMembers,
        businessProblem: formData.businessProblem,
        targetAudience: formData.targetAudience,
        successMetrics: formData.successMetrics,
        assumptions: formData.assumptions.map(assumption => ({
          id: assumption.id || uuidv4(),
          description: assumption.description,
          risk: assumption.risk,
          validationStatus: assumption.validationStatus
        })),
        velocity: project.velocity || { android: [], ios: [], web: [] },
        createdAt: project.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        await dispatch(updateProject(updatedProject));
      } catch (err) {
        console.error('Failed to update project:', err);
        throw new Error('Failed to update project. Please try again.');
      }
      
      // Navigate back to the project
      navigate(`/projects/${id}`);
    } catch (err) {
      console.error('Failed to update project:', err);
      setError('Failed to update project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [dispatch, id, navigate, project]);

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
          teamMembers: project.teamMembers || [],
          businessProblem: project.businessProblem || '',
          targetAudience: project.targetAudience || '',
          successMetrics: project.successMetrics || [],
          assumptions: (project.assumptions || []).map(a => ({
            id: a.id,
            description: a.description,
            risk: a.risk,
            validationStatus: a.validationStatus
          }))
        }}
        onSubmit={handleSubmit as any}
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
