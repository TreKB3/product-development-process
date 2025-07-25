import * as React from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { 
  Box, 
  Typography, 
  CircularProgress,
  Paper,
  Button,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  useTheme
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  Timeline as TimelineIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Components
import ExperienceMapEditor from '../features/experience-map/ExperienceMapEditor';
import { PersonaDialog } from '../features/experience-map/components/PersonaDialog';
import { PhaseDialog } from '../features/experience-map/components/PhaseDialog';
import ExperienceMapUploader from '../features/experience-map/components/ExperienceMapUploader';

// Types
import { ExperienceMapPersona } from '../store/slices/experienceMapSlice';

const ExperienceMapPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const theme = useTheme();
  
  // State
  const [activeTab, setActiveTab] = useState('map');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [personaDialogOpen, setPersonaDialogOpen] = useState(false);
  const [phaseDialogOpen, setPhaseDialogOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<ExperienceMapPersona | null>(null);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  
  // Selectors
  const { loading, error, personas, phases } = useSelector((state: RootState) => state.experienceMap);
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
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  const handleAnalysisComplete = () => {
    setUploadDialogOpen(false);
    setActiveTab('map');
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
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            onClick={() => navigate(-1)} 
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {project?.name || 'Experience Map'}
          </Typography>
        </Box>
        
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<UploadIcon />}
            onClick={() => setUploadDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            Import from Documents
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<PersonAddIcon />}
            onClick={() => setPersonaDialogOpen(true)}
            sx={{ mr: 1 }}
            disabled={!phases.length}
          >
            Add Persona
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<TimelineIcon />}
            onClick={() => setPhaseDialogOpen(true)}
            sx={{ mr: 1 }}
            disabled={!personas.length}
          >
            Add Phase
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            disabled={!personas.length || !phases.length}
          >
            Add Experience
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Experience Map" value="map" />
          <Tab label="Personas" value="personas" />
          <Tab label="Phases" value="phases" />
        </Tabs>
      </Paper>
      
      <Divider sx={{ mb: 3 }} />
      
      {/* Main Content */}
      {activeTab === 'map' && (
        <Box sx={{ p: 2, minHeight: '60vh' }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
              <Typography color="error">{error}</Typography>
            </Box>
          ) : (
            <ExperienceMapEditor />
          )}
        </Box>
      )}

      {activeTab === 'personas' && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Personas</Typography>
          {personas.length === 0 ? (
            <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No personas added yet. Add a persona to get started.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, width: '100%' }}>
              {personas.map((persona) => (
                <Box key={persona.id} sx={{
                  width: { xs: '100%', md: 'calc(50% - 16px)', lg: 'calc(33.333% - 16px)' },
                  minWidth: 0,
                  flexShrink: 0
                }}>
                  <Box sx={{ height: '100%' }}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Typography variant="h6">{persona.name}</Typography>
                      <Box>
                        <IconButton size="small" onClick={() => {
                          setSelectedPersona(persona);
                          setPersonaDialogOpen(true);
                        }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {persona.description}
                    </Typography>
                    <Typography variant="subtitle2">Goals:</Typography>
                    <ul style={{ marginTop: 4, marginBottom: 8, paddingLeft: 20 }}>
                      {persona.goals.map((goal, i) => (
                        <li key={i}>
                          <Typography variant="body2">{goal}</Typography>
                        </li>
                      ))}
                    </ul>
                    <Typography variant="subtitle2">Pain Points:</Typography>
                    <ul style={{ marginTop: 4, paddingLeft: 20 }}>
                      {persona.painPoints.map((painPoint, i) => (
                        <li key={i}>
                          <Typography variant="body2">{painPoint}</Typography>
                        </li>
                      ))}
                    </ul>
                    </Paper>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      )}

      {activeTab === 'phases' && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Phases</Typography>
          {phases.length === 0 ? (
            <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No phases added yet. Add a phase to get started.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, width: '100%' }}>
              {[...phases]
                .sort((a, b) => a.order - b.order)
                .map((phase) => (
                  <Box key={phase.id} sx={{
                    width: { xs: '100%', md: 'calc(50% - 16px)', lg: 'calc(33.333% - 16px)' },
                    minWidth: 0,
                    flexShrink: 0
                  }}>
                    <Box sx={{ height: '100%' }}>
                      <Paper 
                        sx={{ 
                          p: 2, 
                          height: '100%',
                          borderLeft: `4px solid ${phase.color || theme.palette.primary.main}`
                        }}
                      >
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Typography variant="h6">{phase.name}</Typography>
                        <Box>
                          <IconButton size="small" onClick={() => {
                            setSelectedPhaseId(phase.id);
                            setPhaseDialogOpen(true);
                          }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {phase.description}
                      </Typography>
                      </Paper>
                    </Box>
                  </Box>
                ))}
            </Box>
          )}
        </Paper>
      )}

      {/* Upload Dialog */}
      <Dialog 
        open={uploadDialogOpen} 
        onClose={() => setUploadDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Generate Experience Map from Documents</DialogTitle>
        <DialogContent>
          <Box 
            sx={{ 
              p: 2, 
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              minHeight: '60vh',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <ExperienceMapUploader 
              projectId={projectId || ''} 
              onAnalysisComplete={handleAnalysisComplete}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Persona Dialog */}
      <PersonaDialog 
        open={personaDialogOpen} 
        onClose={() => setPersonaDialogOpen(false)} 
        personaId={selectedPersona?.id}
      />
      
      {/* Phase Dialog */}
      <PhaseDialog 
        open={phaseDialogOpen} 
        onClose={() => setPhaseDialogOpen(false)} 
        phaseId={selectedPhaseId}
      />
    </Box>
  );
};

export default ExperienceMapPage;
