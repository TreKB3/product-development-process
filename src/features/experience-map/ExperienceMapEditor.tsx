import * as React from 'react';
import { useEffect, useState, useCallback } from 'react';
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
import { 
  fetchExperienceMap, 
  selectPhases, 
  selectPersonas, 
  selectItemsByPhase,
  ExperienceMapPhase,
  ExperienceMapItem as ExperienceMapItemType,
  ExperienceMapPersona
} from '../../store/slices/experienceMapSlice';

// Components
import { ExperienceMapItem } from './components/ExperienceMapItem';
import { PersonaDialog } from './components/PersonaDialog';
import { PhaseDialog } from './components/PhaseDialog';

// Types
interface PhaseColumnProps {
  phase: ExperienceMapPhase;
  onEdit: (phaseId: string) => void;
  onEditItem: (item: ExperienceMapItemType) => void;
  onDeleteItem: (itemId: string) => void;
  selectedPersona: string;
  items: ExperienceMapItemType[];
  moveItem: (dragIndex: number, hoverIndex: number, dragPhaseId: string, hoverPhaseId: string) => void;
}

const ExperienceMapEditor: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  
  // State for managing dialogs and selections
  const [isPersonaDialogOpen, setIsPersonaDialogOpen] = useState(false);
  const [isPhaseDialogOpen, setIsPhaseDialogOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState('');
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  
  // Select data from Redux store
  const phases = useSelector(selectPhases);
  const personas = useSelector(selectPersonas);
  const itemsByPhase = useSelector((state: RootState) => 
    selectItemsByPhase(state, selectedPersona || '')
  ) as ExperienceMapItemType[];

  // Debugging: Log the current state
  useEffect(() => {
    console.log('Personas from Redux:', personas);
    console.log('Phases from Redux:', phases);
    console.log('Items by phase:', itemsByPhase);
    console.log('Selected persona:', selectedPersona);
  }, [personas, phases, itemsByPhase, selectedPersona]);
  
  // Handle item movement (drag and drop)
  const handleMoveItem = useCallback((
    dragIndex: number, 
    hoverIndex: number, 
    dragPhaseId: string, 
    hoverPhaseId: string
  ) => {
    // Implementation for moving items between phases
    console.log('Moving item', { dragIndex, hoverIndex, dragPhaseId, hoverPhaseId });
  }, []);
  
  // Handle editing an item
  const handleEditItem = useCallback((item: ExperienceMapItemType) => {
    // Implementation for editing an item
    console.log('Editing item', item);
  }, []);
  
  // Handle deleting an item
  const handleDeleteItem = useCallback((itemId: string) => {
    // Implementation for deleting an item
    console.log('Deleting item', itemId);
  }, []);
  
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
  
  const handleAddPhase = useCallback(() => {
    setSelectedPhase(null);
    setIsPhaseDialogOpen(true);
  }, []);

  const handleEditPhase = useCallback((phaseId: string) => {
    setSelectedPhase(phaseId);
    setIsPhaseDialogOpen(true);
  }, []);

  const handleClosePhaseDialog = useCallback(() => {
    setSelectedPhase(null);
    setIsPhaseDialogOpen(false);
  }, []);

  const handleAddPersona = useCallback(() => {
    setIsPersonaDialogOpen(true);
  }, []);

  const renderPhaseColumns = useCallback(() => {
    return phases.map((phase) => {
      // Filter items for the current phase
      const phaseItems = itemsByPhase.filter(item => item.phaseId === phase.id);
      
      return (
        <PhaseColumn
          key={phase.id}
          phase={phase}
          onEdit={handleEditPhase}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteItem}
          selectedPersona={selectedPersona}
          items={phaseItems}
          moveItem={handleMoveItem}
        />
      );
    });
  }, [phases, handleEditPhase, handleEditItem, handleDeleteItem, selectedPersona, itemsByPhase, handleMoveItem]);

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
          {renderPhaseColumns()}
          
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
          open={isPersonaDialogOpen}
          onClose={() => setIsPersonaDialogOpen(false)}
          personaId={selectedPersona || undefined}
        />

        <PhaseDialog
          open={isPhaseDialogOpen}
          onClose={handleClosePhaseDialog}
          phaseId={selectedPhase || undefined}
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
  items: ExperienceMapItemType[];
  moveItem: (dragIndex: number, hoverIndex: number, dragPhaseId: string, hoverPhaseId: string) => void;
}

const PhaseColumn: React.FC<PhaseColumnProps> = (props) => {
  const { 
    phase, 
    onEdit, 
    onEditItem, 
    onDeleteItem, 
    selectedPersona,
    items,
    moveItem
  } = props;
  
  const theme = useTheme();
  
  // Filter items for the selected persona if needed
  const filteredItems = selectedPersona 
    ? items.filter(item => item.personaId === selectedPersona)
    : items;
  
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
        {filteredItems.map((item, index) => (
          <div key={item.id}>
            <ExperienceMapItem
              item={item}
              index={index}
              phaseId={phase.id}
              onEdit={onEditItem}
              onDelete={onDeleteItem}
              moveItem={moveItem}
            />
          </div>
        ))}
        
        <Button 
          fullWidth 
          startIcon={<AddIcon />}
          onClick={() => {
            // TODO: Handle add new item
            console.log('Add new item to phase:', phase.id);
          }}
          sx={{ mt: 1 }}
        >
          Add Item
        </Button>
      </Box>
    </Paper>
  );
};

export default ExperienceMapEditor;
