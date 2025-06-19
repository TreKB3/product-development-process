import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { 
  Box, 
  Typography, 
  CircularProgress,
  Paper,
  Grid,
  Button,
  useTheme,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  Timeline as TimelineIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Components
import ExperienceMapEditor from '../features/experience-map/ExperienceMapEditor';
import { PersonaDialog } from '../features/experience-map/components/PersonaDialog';
import { PhaseDialog } from '../features/experience-map/components/PhaseDialog';

// Types
import { ExperienceMapPersona } from '../store/slices/experienceMapSlice';

const ExperienceMapPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const theme = useTheme();
  
  // State
  const [personaDialogOpen, setPersonaDialogOpen] = React.useState(false);
  const [phaseDialogOpen, setPhaseDialogOpen] = React.useState(false);
  const [selectedPersona, setSelectedPersona] = React.useState<ExperienceMapPersona | null>(null);
  const [selectedPhaseId, setSelectedPhaseId] = React.useState<string | null>(null);
  
  // Selectors
  const { loading, error } = useSelector((state: RootState) => state.experienceMap);
  const project = useSelector((state: RootState) => 
    state.projects.projects.find(p => p.id === projectId)
  );
  
  // Load data when component mounts
  useEffect(() => {
    if (projectId) {
      // Load experience map data
      // This would be handled by the ExperienceMapEditor component
    }
  }, [dispatch, projectId]);
  
  const handleBackToProject = () => {
    navigate(`/projects/${projectId}`);
  };
  
  const handleAddPersona = () => {
    setSelectedPersona(null);
    setPersonaDialogOpen(true);
  };
  
  const handleEditPersona = (persona: ExperienceMapPersona) => {
    setSelectedPersona(persona);
    setPersonaDialogOpen(true);
  };
  
  const handleAddPhase = () => {
    setSelectedPhaseId(null);
    setPhaseDialogOpen(true);
  };
  
  const handleEditPhase = (phaseId: string) => {
    setSelectedPhaseId(phaseId);
    setPhaseDialogOpen(true);
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" gutterBottom>
          Error loading experience map: {error}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Paper>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Back to project">
            <IconButton 
              onClick={handleBackToProject} 
              sx={{ mr: 2 }}
              aria-label="Back to project"
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <div>
            <Typography variant="h4" component="h1">
              {project?.name || 'Experience Map'}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Create and manage your experience map
            </Typography>
          </div>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<PersonAddIcon />}
            onClick={handleAddPersona}
          >
            Add Persona
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<TimelineIcon />}
            onClick={handleAddPhase}
          >
            Add Phase
          </Button>
        </Box>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {/* Main Content */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          minHeight: '60vh',
        }}
      >
        <ExperienceMapEditor />
      </Paper>
      
      {/* Dialogs */}
      <PersonaDialog 
        open={personaDialogOpen} 
        onClose={() => setPersonaDialogOpen(false)} 
        personaId={selectedPersona?.id}
      />
      
      <PhaseDialog 
        open={phaseDialogOpen} 
        onClose={() => setPhaseDialogOpen(false)} 
        phaseId={selectedPhaseId}
      />
    </Box>
  );
};

export default ExperienceMapPage;
