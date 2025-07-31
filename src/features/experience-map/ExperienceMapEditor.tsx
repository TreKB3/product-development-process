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
import { useDrop, useDrag, useDragLayer } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { v4 as uuidv4 } from 'uuid';
import { animated, useSpring } from '@react-spring/web';
import { CSS } from '@dnd-kit/utilities';
import { 
  fetchExperienceMap, 
  selectPhases, 
  selectPersonas, 
  selectItemsByPhase,
  updatePhase,
  updatePersona,
  ExperienceMapPhase,
  ExperienceMapItem as ExperienceMapItemType,
  ExperienceMapPersona,
  updateItem,
  updatePhases,
  updatePersonas
} from '../../store/slices/experienceMapSlice';

// Components
import { ExperienceMapItem } from './components/ExperienceMapItem';
import PhaseDialog from './components/PhaseDialog';
import PersonaDialog from './components/PersonaDialog';

// Types

const CustomDragLayer = () => {
  const { itemType, isDragging, item, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    isDragging: monitor.isDragging(),
    currentOffset: monitor.getClientOffset(),
  }));

  if (!isDragging || !currentOffset) {
    return null;
  }

  const transform = `translate(${currentOffset.x}px, ${currentOffset.y}px)`;

  return (
    <div
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 1000,
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
      }}
    >
      <div
        style={{
          transform,
          opacity: 0.9,
          backgroundColor: 'white',
          padding: '8px 16px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          border: '1px solid #ccc',
          width: '200px',
        }}
      >
        {item?.phase?.name}
      </div>
    </div>
  );
};

const DraggablePhaseCard: React.FC<{
  phase: ExperienceMapPhase;
  index: number;
  personaId: string;
  onEdit: (phaseId: string) => void;
  onDuplicate: (phase: ExperienceMapPhase) => void;
  onDelete: (phaseId: string) => void;
  onMovePhase: (dragIndex: number, hoverIndex: number, dragPersonaId: string, hoverPersonaId: string) => void;
}> = ({ phase, index, personaId, onEdit, onDuplicate, onDelete, onMovePhase }) => {
  const [{ isDragging }, dragRef] = useDrag({
    type: 'PHASE',
    item: { type: 'PHASE', id: phase.id, index, personaId, phase },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver, canDrop }, dropRef] = useDrop({
    accept: 'PHASE',
    hover: (item: { id: string; index: number; personaId: string }, monitor) => {
      if (!monitor.isOver({ shallow: true })) return;
      
      const dragIndex = item.index;
      const hoverIndex = index;
      const dragPersonaId = item.personaId;
      const hoverPersonaId = personaId;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex && dragPersonaId === hoverPersonaId) {
        return;
      }

      // Time to actually perform the action
      onMovePhase(dragIndex, hoverIndex, dragPersonaId, hoverPersonaId);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
      item.personaId = hoverPersonaId;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  // Animation for drag state
  const [{ scale }, set] = useSpring(() => ({
    scale: 1,
    config: { tension: 300, friction: 20 },
  }));

  // Update animation when drag state changes
  React.useEffect(() => {
    if (isOver) {
      set({ scale: 1.03 });
    } else {
      set({ scale: 1 });
    }
  }, [isOver, set]);

  const opacity = isDragging ? 0.5 : 1;
  const borderColor = isOver ? '#4caf50' : 'transparent';
  const backgroundColor = isOver ? 'rgba(76, 175, 80, 0.1)' : 'transparent';
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
    if (dragPhaseId === hoverPhaseId) {
      // Reorder within the same phase
      const newPhases = phases.map((phase) => {
        if (phase.id === dragPhaseId) {
          const newItems = [...phase.items];
          const [removed] = newItems.splice(dragIndex, 1);
          newItems.splice(hoverIndex, 0, removed);
          return { ...phase, items: newItems };
        }
        return phase;
      });
      dispatch(updatePhases(newPhases));
    } else {
      // Move between phases
      const sourcePhase = phases.find((p) => p.id === dragPhaseId);
      const targetPhase = phases.find((p) => p.id === hoverPhaseId);
      
      if (sourcePhase && targetPhase) {
        const newSourceItems = [...sourcePhase.items];
        const [movedItem] = newSourceItems.splice(dragIndex, 1);
        
        const newTargetItems = [...targetPhase.items];
        newTargetItems.splice(hoverIndex, 0, movedItem);
        
        const newPhases = phases.map((phase) => {
          if (phase.id === dragPhaseId) {
            return { ...phase, items: newSourceItems };
          }
          if (phase.id === hoverPhaseId) {
            return { ...phase, items: newTargetItems };
          }
          return phase;
        });
        
        dispatch(updatePhases(newPhases));
      }
    }
  },
  [phases, dispatch]
);

  // Move phase within or between personas
  const movePhase = useCallback(
    (dragIndex: number, hoverIndex: number, dragPersonaId: string, hoverPersonaId: string) => {
      const dragPersona = personas.find(p => p.id === dragPersonaId);
      const hoverPersona = personas.find(p => p.id === hoverPersonaId);
      
      if (!dragPersona || !hoverPersona) return;
      
      // Get the phase being dragged
      const phaseIdToMove = dragPersona.phaseIds[dragIndex];
      if (!phaseIdToMove) return;
      
      // Create new phase IDs array for drag persona
      const newDragPhaseIds = [...dragPersona.phaseIds];
      newDragPhaseIds.splice(dragIndex, 1);
      
      // Create new phase IDs array for hover persona
      const newHoverPhaseIds = [...hoverPersona.phaseIds];
      newHoverPhaseIds.splice(hoverIndex, 0, phaseIdToMove);
      
      // Update the phase's persona reference if moving between personas
      if (dragPersonaId !== hoverPersonaId) {
        const phaseToUpdate = phases.find(p => p.id === phaseIdToMove);
        if (phaseToUpdate) {
          dispatch(updatePhase({
            id: phaseIdToMove,
            personaId: hoverPersonaId
          }));
        }
      }
      
      // Update the personas with new phase orders
      dispatch(updatePersona({
        id: dragPersonaId,
        phaseIds: newDragPhaseIds
      }));
      
      if (dragPersonaId !== hoverPersonaId) {
        dispatch(updatePersona({
          id: hoverPersonaId,
          phaseIds: newHoverPhaseIds
        }));
      }
    },
    [personas, phases, dispatch]
  );

  // Handle phase duplication
  const handleDuplicatePhase = useCallback((phase: ExperienceMapPhase) => {
    const newPhase = {
      ...phase,
      id: uuidv4(),
      name: `${phase.name} (Copy)`,
      items: [...phase.items.map(item => ({ ...item, id: uuidv4() }))]
    };
    
    // Add the new phase to the store
    dispatch(updatePhase(newPhase));
    
    // Add the phase to the current persona's phaseIds
    if (selectedPersona && selectedPersona !== 'all') {
      const persona = personas.find(p => p.id === selectedPersona);
      if (persona) {
        dispatch(updatePersona({
          id: selectedPersona,
          phaseIds: [...persona.phaseIds, newPhase.id]
        }));
      }
    }
  }, [phases, personas, selectedPersona, dispatch]);

  // Handle phase deletion
  const handleDeletePhase = useCallback((phaseId: string) => {
    if (window.confirm('Are you sure you want to delete this phase? This will also remove all items in this phase.')) {
      // Remove phase from all personas' phaseIds
      personas.forEach(persona => {
        if (persona.phaseIds.includes(phaseId)) {
          dispatch(updatePersona({
            id: persona.id,
            phaseIds: persona.phaseIds.filter(id => id !== phaseId)
          }));
        }
      });
      
      // The phase will be automatically removed from the phases array by the Redux reducer
      // since it's no longer referenced by any persona
    }
  }, [personas, dispatch]);

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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {selectedPersona === 'all' ? (
          // Unified view with all personas and phases
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {personas.map((persona) => (
              <Paper key={persona.id} sx={{ p: 2, mb: 3, backgroundColor: 'background.paper' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {persona.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {persona.phaseIds.length} phases
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {persona.phaseIds
                    .map(phaseId => phases.find(p => p.id === phaseId))
                    .filter((phase): phase is ExperienceMapPhase => phase !== undefined)
                    .map((phase, index) => (
                      <DraggablePhaseCard
                        key={phase.id}
                        phase={phase}
                        index={index}
                        personaId={persona.id}
                        onMovePhase={movePhase}
                        onEdit={handleEditPhase}
                        onDuplicate={handleDuplicatePhase}
                        onDelete={handleDeletePhase}
                      />
                    ))}
                </Box>
              </Paper>
            ))}
          </Box>
        ) : (
          // Single persona view
          phases
            .filter((phase) => phase.personaId === selectedPersona)
            .map((phase, index) => (
              <DraggablePhaseCard
                key={phase.id}
                phase={phase}
                index={index}
                personaId={selectedPersona}
                onMovePhase={movePhase}
                onEdit={handleEditPhase}
                onDuplicate={handleDuplicatePhase}
                onDelete={handleDeletePhase}
              />
            ))
        )}
      </Box>
    );
  }, [phases, handleEditPhase, handleEditItem, handleDeleteItem, selectedPersona, itemsByPhase, handleMoveItem]);

  return (
    <DndProvider backend={HTML5Backend}>
      <CustomDragLayer />
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
                        backgroundColor: phase.color || 'grey.100',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        color: phase.color ? 'white' : 'inherit'
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
                            padding: 1,
                            borderRight: '1px solid',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            minHeight: '150px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                            overflow: 'auto',
                            '&:hover': { 
                              backgroundColor: 'action.hover',
                              '& .experience-item': {
                                boxShadow: 1,
                                transform: 'translateY(-2px)'
                              }
                            }
                          }}
                        >
                          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto', py: 1 }}>
                            {items.map((item, index) => (
                              <Box 
                                key={item.id} 
                                className="experience-item"
                                sx={{
                                  transition: 'all 0.2s ease-in-out',
                                  borderRadius: 1,
                                  overflow: 'hidden',
                                  borderLeft: `3px solid ${phase.color || theme.palette.primary.main}`,
                                  '&:hover': {
                                    boxShadow: 2,
                                    transform: 'translateY(-2px)'
                                  }
                                }}
                              >
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
                          </Box>
                          {items.length === 0 && (
                            <Box 
                              sx={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: '100px',
                                border: '1px dashed',
                                borderColor: 'divider',
                                borderRadius: 1,
                                backgroundColor: 'background.default'
                              }}
                            >
                              <Typography 
                                variant="caption" 
                                color="textSecondary"
                                align="center"
                                sx={{ p: 1 }}
                              >
                                Drop items here or click to add
                              </Typography>
                            </Box>
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

const ExperienceMapEditor: React.FC = () => {
  // ... existing component code ...
  
  return (
    <DndProvider backend={HTML5Backend}>
      {/* ... existing JSX ... */}
    </DndProvider>
  );
};

export default ExperienceMapEditor;
