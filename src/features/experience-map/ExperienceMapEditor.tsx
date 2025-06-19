import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { 
  Box, 
  Typography, 
  Paper, 
  IconButton, 
  Tooltip,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  useTheme,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Chip
} from '@mui/material';
import { 
  Add as AddIcon, 
  PersonAdd as PersonAddIcon, 
  Timeline as TimelineIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragHandleIcon
} from '@mui/icons-material';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { fetchExperienceMap, selectPhases, selectPersonas, selectItemsByPhase } from '../../store/slices/experienceMapSlice';

// Components
import { ExperienceMapItem } from './components/ExperienceMapItem';
import { PersonaDialog } from './components/PersonaDialog';
import { PhaseDialog } from './components/PhaseDialog';

const ExperienceMapEditor: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  
  // Selectors
  const phases = useSelector(selectPhases);
  const personas = useSelector(selectPersonas);
  const [selectedPersona, setSelectedPersona] = useState<string>('');
  
  // Dialogs state
  const [personaDialogOpen, setPersonaDialogOpen] = useState(false);
  const [phaseDialogOpen, setPhaseDialogOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  
  // Handle editing an item
  const handleEditItem = (item: ExperienceMapItemType) => {
    // TODO: Implement item edit dialog
    console.log('Edit item:', item);
  };
  
  // Handle deleting an item
  const handleDeleteItem = (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      // @ts-ignore - deleteItem expects a payload with id
      dispatch(deleteItem(itemId));
    }
  };
  
  // Load experience map data when component mounts
  useEffect(() => {
    if (projectId) {
      dispatch(fetchExperienceMap(projectId));
    }
  }, [dispatch, projectId]);
  
  // Set default selected persona
  useEffect(() => {
    if (personas.length > 0 && !selectedPersona) {
      setSelectedPersona(personas[0].id);
    }
  }, [personas, selectedPersona]);
  
  const handlePersonaChange = (event: SelectChangeEvent) => {
    setSelectedPersona(event.target.value);
  };
  
  const handleAddPhase = () => {
    setSelectedPhase(null);
    setPhaseDialogOpen(true);
  };
  
  const handleEditPhase = (phaseId: string) => {
    setSelectedPhase(phaseId);
    setPhaseDialogOpen(true);
  };
  
  const handleAddPersona = () => {
    setPersonaDialogOpen(true);
  };
  
  return (
    <DndProvider backend={HTML5Backend}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Experience Map
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="persona-select-label">Persona</InputLabel>
              <Select
                labelId="persona-select-label"
                id="persona-select"
                value={selectedPersona}
                label="Persona"
                onChange={handlePersonaChange}
                startAdornment={
                  <PersonAddIcon 
                    color="primary" 
                    sx={{ mr: 1, cursor: 'pointer' }} 
                    onClick={handleAddPersona}
                  />
                }
              >
                {personas.map((persona) => (
                  <MenuItem key={persona.id} value={persona.id}>
                    {persona.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={handleAddPhase}
            >
              Add Phase
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Phases */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          overflowX: 'auto',
          pb: 2,
          '&::-webkit-scrollbar': {
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: theme.palette.grey[200],
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.grey[400],
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: theme.palette.grey[500],
            },
          },
        }}>
          {phases.map((phase) => (
            <PhaseColumn 
              key={phase.id} 
              phase={phase} 
              onEdit={handleEditPhase}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
              selectedPersona={selectedPersona} 
            />
          ))}
          
          {/* Add Phase Button */}
          <Button
            variant="outlined"
            onClick={handleAddPhase}
            sx={{
              minWidth: 250,
              height: 'fit-content',
              borderStyle: 'dashed',
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover',
              },
              py: 3,
            }}
          >
            <AddIcon /> Add Phase
          </Button>
        </Box>
        
        {/* Dialogs */}
        <PersonaDialog 
          open={personaDialogOpen} 
          onClose={() => setPersonaDialogOpen(false)} 
        />
        
        <PhaseDialog 
          open={phaseDialogOpen} 
          onClose={() => setPhaseDialogOpen(false)} 
          phaseId={selectedPhase}
        />
      </Box>
    </DndProvider>
  );
};

// Phase Column Component
interface PhaseColumnProps {
  phase: ExperienceMapPhase;
  onEdit: (phaseId: string) => void;
  onEditItem: (item: ExperienceMapItemType) => void;
  onDeleteItem: (itemId: string) => void;
  selectedPersona: string;
}

const PhaseColumn: React.FC<PhaseColumnProps> = ({ 
  phase, 
  onEdit, 
  onEditItem, 
  onDeleteItem, 
  selectedPersona 
}) => {
  const items = useSelector((state: RootState) => 
    selectItemsByPhase(state, phase.id).filter(item => item.personaId === selectedPersona)
  );
  
  return (
    <Paper 
      sx={{ 
        minWidth: 300, 
        maxWidth: 300,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      {/* Phase Header */}
      <Box 
        sx={{ 
          p: 2, 
          bgcolor: phase.color || 'primary.main',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold">
          {phase.name}
        </Typography>
        <Box>
          <Tooltip title="Edit Phase">
            <IconButton 
              size="small" 
              sx={{ color: 'white' }}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(phase.id);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Phase Description */}
      {phase.description && (
        <Box sx={{ p: 2, bgcolor: 'background.default' }}>
          <Typography variant="body2" color="text.secondary">
            {phase.description}
          </Typography>
        </Box>
      )}
      
      {/* Items List */}
      <Box 
        sx={{ 
          p: 1, 
          flexGrow: 1, 
          minHeight: 150,
          bgcolor: 'background.default',
          overflowY: 'auto',
        }}
      >
        {items.map((item, index) => (
          <div key={item.id}>
            <ExperienceMapItemComponent 
              item={item} 
              phaseId={phase.id}
              index={index}
              onEdit={() => onEditItem(item)}
              onDelete={() => onDeleteItem(item.id)}
            />
          </div>
        ))}
        
        <Button 
          fullWidth 
          startIcon={<AddIcon />} 
          sx={{ mt: 1 }}
          // onClick={handleAddItem}
        >
          Add Item
        </Button>
      </Box>
    </Paper>
  );
};

export default ExperienceMapEditor;
