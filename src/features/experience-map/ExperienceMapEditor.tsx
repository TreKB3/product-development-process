import * as React from 'react';
import { useEffect, useState, useCallback, useMemo } from 'react';
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
  Chip,
  Tabs,
  Tab,
  styled
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
  ExperienceMapPersona,
  updateItem
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
  const [activeView, setActiveView] = useState<'single' | 'all'>('all');
  
  const handleClosePhaseDialog = useCallback(() => {
    setIsPhaseDialogOpen(false);
    setSelectedPhase(null);
  }, []);
  
  // Select data from Redux store
  const phases = useSelector(selectPhases);
  const personas = useSelector(selectPersonas);
  const allItems = useSelector((state: RootState) => state.experienceMap.items);
  
  // Get all items for the selected persona across all phases
  const allItemsForPersona = useSelector((state: RootState) => 
    selectItemsByPhase(state, '', selectedPersona || '')
  ) as ExperienceMapItemType[];
  
  // Create a map of phaseId to items for the selected persona
  const itemsByPhase = useMemo(() => {
    const phaseMap = new Map<string, ExperienceMapItemType[]>();
    
    phases.forEach(phase => {
      const items = allItemsForPersona
        .filter(item => item.phaseId === phase.id)
        .sort((a, b) => a.order - b.order);
      phaseMap.set(phase.id, items);
    });
    
    return phaseMap;
  }, [phases, allItemsForPersona]);
  
  // Create a map of personaId to phaseId to items for the unified view
  const itemsByPersonaAndPhase = useMemo(() => {
    const map = new Map<string, Map<string, ExperienceMapItemType[]>>();
    
    personas.forEach(persona => {
      const phaseMap = new Map<string, ExperienceMapItemType[]>();
      phases.forEach(phase => {
        const items = allItems
          .filter(item => item.personaId === persona.id && item.phaseId === phase.id)
          .sort((a, b) => a.order - b.order);
        phaseMap.set(phase.id, items);
      });
      map.set(persona.id, phaseMap);
    });
    
    return map;
  }, [personas, phases, allItems]);
  
  // Handle item move between phases or reorder within phase
  const moveItem = useCallback((
    dragIndex: number,
    hoverIndex: number,
    dragPhaseId: string,
    hoverPhaseId: string
  ) => {
    if (!selectedPersona) return;
    
    // Get the item being dragged
    const dragItems = itemsByPhase.get(dragPhaseId) || [];
    const dragItem = dragItems[dragIndex];
    
    if (!dragItem) return;
    
    // Dispatch action to update the item's phase and order
    dispatch(updateItem({
      id: dragItem.id,
      phaseId: hoverPhaseId,
      order: hoverIndex,
      updatedAt: new Date().toISOString()
    }));
    
    // Update the order of other items in the source and target phases
    const updatedDragItems = [...dragItems];
    updatedDragItems.splice(dragIndex, 1);
    
    const hoverItems = [...(itemsByPhase.get(hoverPhaseId) || [])];
    hoverItems.splice(hoverIndex, 0, dragItem);
    
    // Update the local state for a smoother UI update
    itemsByPhase.set(dragPhaseId, updatedDragItems);
    itemsByPhase.set(hoverPhaseId, hoverItems);
  }, [dispatch, selectedPersona, itemsByPhase]);

  // Styled components for the unified view
  const StyledGrid = styled(Grid)(({ theme }) => ({
    '& .phase-header': {
      backgroundColor: theme.palette.grey[100],
      padding: theme.spacing(1, 2),
      borderBottom: `1px solid ${theme.palette.divider}`,
      position: 'sticky',
      top: 0,
      zIndex: 2,
    },
    '& .persona-cell': {
      borderRight: `1px solid ${theme.palette.divider}`,
      minHeight: '100px',
      padding: theme.spacing(1),
      '&:last-child': {
        borderRight: 'none',
      },
    },
    '& .phase-cell': {
      borderBottom: `1px solid ${theme.palette.divider}`,
      minHeight: '150px',
      padding: theme.spacing(1),
      backgroundColor: theme.palette.background.paper,
      '&:last-child': {
        borderBottom: 'none',
      },
    },
  }));
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
    console.group('ExperienceMapEditor - useEffect[projectId]');
    try {
      if (projectId) {
        console.log('Fetching experience map data for project:', projectId);
        dispatch(fetchExperienceMap(projectId))
          .unwrap()
          .then((result) => {
            console.log('Successfully fetched experience map data:', {
              personas: result.personas?.length || 0,
              phases: result.phases?.length || 0,
              items: result.items?.length || 0
            });
          })
          .catch((error) => {
            console.error('Error fetching experience map data:', error);
          });
      }
    } catch (error) {
      console.error('Error in ExperienceMapEditor useEffect[projectId]:', error);
    } finally {
      console.groupEnd();
    }
  }, [dispatch, projectId]);
  
  // Set default selected persona
  useEffect(() => {
    console.group('ExperienceMapEditor - useEffect[personas, selectedPersona]');
    try {
      console.log('Current personas:', personas);
      console.log('Current selectedPersona:', selectedPersona);
      
      if (personas.length > 0 && !selectedPersona) {
        console.log('Setting default selected persona to first persona:', personas[0].id);
        setSelectedPersona(personas[0].id);
      }
      
      console.log('Current itemsByPhase:', itemsByPhase);
    } catch (error) {
      console.error('Error in ExperienceMapEditor useEffect:', error);
    } finally {
      console.groupEnd();
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

  const handleAddPersona = useCallback(() => {
    setIsPersonaDialogOpen(true);
  }, []);

  const renderPhaseColumns = useCallback(() => {
    if (!selectedPersona) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            Please select a persona to view the experience map
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', overflowX: 'auto', p: 2, gap: 3 }}>
        {phases.map((phase) => (
          <PhaseColumn
            key={phase.id}
            phase={phase}
            onEdit={handleEditPhase}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
            selectedPersona={selectedPersona}
            items={itemsByPhase.get(phase.id) || []}
            moveItem={handleMoveItem}
          />
        ))}
      </Box>
    );
  }, [phases, handleEditPhase, handleEditItem, handleDeleteItem, selectedPersona, itemsByPhase, handleMoveItem]);

  return (
    <DndProvider backend={HTML5Backend}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Toolbar */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h2">
            Experience Map
          </Typography>
          
          <Box>
            <Tabs 
              value={activeView} 
              onChange={(_, newValue) => setActiveView(newValue)}
              sx={{ mb: 2, display: 'inline-flex' }}
            >
              <Tab label="Unified View" value="all" />
              <Tab label="Single Persona" value="single" />
            </Tabs>
            
            <Button
              variant="outlined"
              startIcon={<PersonAddIcon />}
              onClick={() => setIsPersonaDialogOpen(true)}
              sx={{ mr: 1, ml: 2 }}
            >
              Add Persona
            </Button>
            <Button
              variant="outlined"
              startIcon={<TimelineIcon />}
              onClick={() => setIsPhaseDialogOpen(true)}
              sx={{ mr: 1 }}
            >
              Add Phase
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setSelectedPhase(phases[0]?.id || null)}
              disabled={!phases.length || !personas.length}
            >
              Add Experience
            </Button>
          </Box>
        </Box>
        
        {activeView === 'single' ? (
          <>
            {/* Persona Selector */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Select Persona
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {personas.map((persona) => (
                  <Chip
                    key={persona.id}
                    label={persona.name}
                    onClick={() => setSelectedPersona(persona.id)}
                    color={selectedPersona === persona.id ? 'primary' : 'default'}
                    variant={selectedPersona === persona.id ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Box>
            
            {/* Single Persona View */}
            {!selectedPersona ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '200px',
                border: '2px dashed', 
                borderColor: 'divider',
                borderRadius: 1
              }}>
                <Typography color="textSecondary">
                  Select a persona to view their experience map
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
                {phases.map((phase) => {
                  const items = itemsByPhase.get(phase.id) || [];
                  return (
                    <PhaseColumn
                      key={phase.id}
                      phase={phase}
                      items={items}
                      selectedPersona={selectedPersona}
                      onEdit={setSelectedPhase}
                      onEditItem={() => {}}
                      onDeleteItem={() => {}}
                      moveItem={moveItem}
                    />
                  );
                })}
              </Box>
            )}
          </>
        ) : (
          /* Unified View */
          <Paper sx={{ width: '100%', overflow: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: `200px repeat(${phases.length}, minmax(300px, 1fr))` }}>
              {/* Header Row */}
              <Box sx={{ gridColumn: '1 / -1', display: 'contents' }}>
                <Box display="flex">
                  <Box width={200} className="phase-header" sx={{ position: 'sticky', left: 0, zIndex: 3 }}>
                    <Typography variant="subtitle2" fontWeight="bold">Persona / Phase</Typography>
                  </Box>
                  {phases.map(phase => (
                    <Box 
                      key={phase.id} 
                      flex={1} 
                      minWidth={300} 
                      className="phase-header"
                      sx={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 1,
                        backgroundColor: 'grey.100',
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold">
                        {phase.name}
                      </Typography>
                      <Tooltip title="Add Experience">
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            setSelectedPhase(phase.id);
                            setActiveView('single');
                          }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ))}
                </Box>
              </Box>
              
              {/* Persona Rows */}
              {personas.map(persona => (
                <Box key={persona.id} sx={{ display: 'contents' }}>
                  <Box display="flex">
                    <Box 
                      width={200} 
                      className="persona-cell" 
                      sx={{ 
                        position: 'sticky', 
                        left: 0, 
                        zIndex: 2, 
                        backgroundColor: 'background.paper',
                        borderRight: `1px solid ${theme.palette.divider}`,
                        display: 'flex',
                        alignItems: 'center',
                        padding: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" fontWeight="medium">
                          {persona.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {persona.description}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {phases.map(phase => {
                      const items = itemsByPersonaAndPhase.get(persona.id)?.get(phase.id) || [];
                      return (
                        <Box 
                          key={`${persona.id}-${phase.id}`} 
                          flex={1} 
                          minWidth={300} 
                          className="phase-cell"
                          onClick={() => {
                            setSelectedPersona(persona.id);
                            setActiveView('single');
                          }}
                          sx={{ 
                            cursor: 'pointer', 
                            '&:hover': { backgroundColor: 'action.hover' },
                            padding: 1,
                            borderRight: '1px solid',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            minHeight: '120px'
                          }}
                        >
                          {items.map((item, index) => (
                            <Box key={item.id} mb={1}>
                              <ExperienceMapItem
                                item={item}
                                phaseId={phase.id}
                                index={index}
                                moveItem={moveItem}
                                onEdit={() => {}}
                                onDelete={() => {}}
                              />
                            </Box>
                          ))}
                          {items.length === 0 && (
                            <Typography 
                              variant="caption" 
                              color="textSecondary"
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                minHeight: '80px'
                              }}
                            >
                              No items
                            </Typography>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        )}
      </Box>
      
      {/* Dialogs */}
      <PersonaDialog
        open={isPersonaDialogOpen}
        onClose={() => setIsPersonaDialogOpen(false)}
        personaId={selectedPersona}
      />
      
      <PhaseDialog
        open={isPhaseDialogOpen}
        onClose={handleClosePhaseDialog}
        phaseId={selectedPhase || undefined}
      />
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
    items = [], // Default to empty array if undefined
    moveItem
  } = props;
  
  const theme = useTheme();
  
  // Log the items being passed to this component
  React.useEffect(() => {
    console.log(`PhaseColumn[${phase.name}] items:`, items);
  }, [phase.name, items]);
  
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
        {items.map((item: ExperienceMapItemType, index: number) => (
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
