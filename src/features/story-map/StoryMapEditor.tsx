import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  Box, 
  Typography, 
  Paper, 
  IconButton, 
  Tooltip,
  Divider,
  Button,
  useTheme,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  InputAdornment,
} from '@mui/material';
import { 
  Add as AddIcon, 
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragHandleIcon,
  Timeline as TimelineIcon,
  Flag as FlagIcon,
  Label as LabelIcon,
  Person as PersonIcon,
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
} from '@mui/icons-material';

// Redux
import { 
  fetchStoryMap, 
  selectReleases, 
  selectEpicsByReleaseId, 
  selectUserStoriesByEpicId,
  selectStoryMapStatus,
  selectStoryMapError,
  addRelease,
  updateRelease,
  removeRelease,
  addEpic,
  updateEpic,
  removeEpic,
  addUserStory,
  updateUserStory,
  removeUserStory,
  reorderReleases,
  reorderEpics,
  reorderUserStories,
  moveUserStory,
  Release,
  Epic,
  UserStory,
} from '../../store/slices/storyMapSlice';

// Components
import PriorityChip from './components/PriorityChip';
import StatusChip from './components/StatusChip';
import ReleaseDialog from './components/ReleaseDialog';
import EpicDialog from './components/EpicDialog';
import StoryDialog from './components/StoryDialog';

// Types
type DragItem = {
  type: string;
  id: string;
  index: number;
  releaseId?: string;
  epicId?: string;
};

// Draggable Story Card
const StoryCard: React.FC<{
  story: UserStory;
  index: number;
  epicId: string;
  onEdit: (story: UserStory) => void;
  onDelete: (id: string) => void;
}> = ({ story, index, epicId, onEdit, onDelete }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'STORY',
    item: { type: 'STORY' as const, id: story.id, index, epicId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'STORY',
    hover: (item: DragItem) => {
      if (item.id === story.id) return;
      // Reordering logic would be handled by the parent
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const setRefs = (node: HTMLDivElement | null) => {
    drag(node);
    drop(node);
  };

  return (
    <div ref={setRefs} style={{ opacity: isDragging ? 0.5 : 1, marginBottom: 8 }}>
      <Card 
        variant="outlined" 
        sx={{ 
          cursor: 'move',
          '&:hover': {
            boxShadow: 1,
          },
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box flexGrow={1}>
              <Typography variant="subtitle2" gutterBottom>
                {story.title}
              </Typography>
              {story.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {story.description}
                </Typography>
              )}
              <Box display="flex" gap={1} flexWrap="wrap">
                <StatusChip status={story.status} />
                <PriorityChip priority={story.priority} />
                {story.points && (
                  <Chip 
                    size="small" 
                    label={`${story.points} pts`} 
                    variant="outlined" 
                    sx={{ borderRadius: 1 }} 
                  />
                )}
              </Box>
            </Box>
            <Box display="flex" flexDirection="column">
              <IconButton size="small" onClick={() => onEdit(story)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => onDelete(story.id)}>
                <DeleteIcon fontSize="small" color="error" />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </div>
  );
};

// Epic Column
const EpicColumn: React.FC<{
  epic: Epic;
  index: number;
  releaseId: string;
  onEdit: (epic: Epic) => void;
  onDelete: (id: string) => void;
  onAddStory: (epicId: string) => void;
  onEditStory: (story: UserStory) => void;
  onDeleteStory: (id: string) => void;
}> = ({ 
  epic, 
  index, 
  releaseId, 
  onEdit, 
  onDelete, 
  onAddStory,
  onEditStory,
  onDeleteStory,
}) => {
  const theme = useTheme();
  const stories = useSelector((state: RootState) => 
    selectUserStoriesByEpicId(state, epic.id)
  );

  const [{ isOver }, drop] = useDrop({
    accept: ['EPIC', 'STORY'],
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Create a ref callback to handle both the drop ref and the Paper ref
  const setRefs = (node: HTMLDivElement | null) => {
    // Call the drop ref
    const dropRef = drop as (node: HTMLDivElement | null) => void;
    dropRef(node);
  };

  return (
    <Paper 
      ref={setRefs}
      sx={{ 
        minWidth: 300,
        maxWidth: 300,
        backgroundColor: isOver ? 'action.hover' : 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      <Box 
        sx={{ 
          p: 2, 
          backgroundColor: epic.color || theme.palette.primary.main,
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="subtitle1" fontWeight={500}>
          {epic.title}
        </Typography>
        <Box>
          <IconButton 
            size="small" 
            sx={{ color: 'white' }}
            onClick={() => onEdit(epic)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            sx={{ color: 'white' }}
            onClick={() => onDelete(epic.id)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <Box sx={{ p: 2, maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
        {stories.map((story, index) => (
          <StoryCard
            key={story.id}
            story={story}
            index={index}
            epicId={epic.id}
            onEdit={onEditStory}
            onDelete={onDeleteStory}
          />
        ))}
        <Button
          fullWidth
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => onAddStory(epic.id)}
          sx={{ mt: 1 }}
        >
          Add Story
        </Button>
      </Box>
    </Paper>
  );
};

// Release Row
const ReleaseRow: React.FC<{
  release: Release;
  index: number;
  onEdit: (release: Release) => void;
  onDelete: (id: string) => void;
  onAddEpic: (releaseId: string) => void;
  onEditEpic: (epic: Epic) => void;
  onDeleteEpic: (id: string) => void;
  onAddStory: (epicId: string) => void;
  onEditStory: (story: UserStory) => void;
  onDeleteStory: (id: string) => void;
}> = ({ 
  release, 
  index, 
  onEdit, 
  onDelete, 
  onAddEpic, 
  onEditEpic, 
  onDeleteEpic,
  onAddStory,
  onEditStory,
  onDeleteStory,
}) => {
  const theme = useTheme();
  const epics = useSelector((state: RootState) => 
    selectEpicsByReleaseId(state, release.id)
  );
  const [expanded, setExpanded] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    onEdit(release);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete(release.id);
    handleMenuClose();
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Paper 
        elevation={1}
        sx={{ 
          p: 2, 
          mb: 1,
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <IconButton size="small" sx={{ mr: 1 }}>
          {expanded ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
        </IconButton>
        <Box flexGrow={1} display="flex" alignItems="center">
          <FlagIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            {release.name}
          </Typography>
          {release.targetDate && (
            <Chip 
              label={`Target: ${new Date(release.targetDate).toLocaleDateString()}`}
              size="small"
              sx={{ ml: 1 }}
              variant="outlined"
            />
          )}
        </Box>
        <Box>
          <IconButton onClick={handleMenuClick}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            onClick={(e) => e.stopPropagation()}
          >
            <MenuItem onClick={handleEdit}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit Release</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleDelete}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText sx={{ color: 'error.main' }}>Delete Release</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Paper>
      
      {expanded && (
        <Box sx={{ ml: 4 }}>
          <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2, minHeight: 200 }}>
            {epics.length > 0 ? (
              epics.map((epic, index) => (
                <EpicColumn
                  key={epic.id}
                  epic={epic}
                  index={index}
                  releaseId={release.id}
                  onEdit={onEditEpic}
                  onDelete={onDeleteEpic}
                  onAddStory={onAddStory}
                  onEditStory={onEditStory}
                  onDeleteStory={onDeleteStory}
                />
              ))
            ) : (
              <Box sx={{ p: 2, display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                <Typography>No epics yet. </Typography>
                <Button 
                  size="small" 
                  startIcon={<AddIcon />} 
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddEpic(release.id);
                  }}
                >
                  Add Epic
                </Button>
              </Box>
            )}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={(e) => {
                e.stopPropagation();
                onAddEpic(release.id);
              }}
              sx={{ minWidth: 200, height: 'fit-content', alignSelf: 'flex-start' }}
            >
              Add Epic
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

// Main StoryMapEditor Component
const StoryMapEditor: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  
  // Selectors
  const releases = useSelector(selectReleases);
  const status = useSelector(selectStoryMapStatus);
  const error = useSelector(selectStoryMapError);
  
  // State
  const [releaseDialogOpen, setReleaseDialogOpen] = useState(false);
  const [epicDialogOpen, setEpicDialogOpen] = useState(false);
  const [storyDialogOpen, setStoryDialogOpen] = useState(false);
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const [selectedEpic, setSelectedEpic] = useState<Epic | null>(null);
  const [selectedStory, setSelectedStory] = useState<UserStory | null>(null);
  
  // Load data when component mounts
  useEffect(() => {
    if (projectId) {
      dispatch(fetchStoryMap(projectId));
    }
  }, [dispatch, projectId]);
  
  // Handlers
  const handleAddRelease = () => {
    setSelectedRelease(null);
    setReleaseDialogOpen(true);
  };
  
  const handleEditRelease = (release: Release) => {
    setSelectedRelease(release);
    setReleaseDialogOpen(true);
  };
  
  const handleDeleteRelease = (id: string) => {
    if (window.confirm('Are you sure you want to delete this release? This will also delete all associated epics and stories.')) {
      dispatch(removeRelease(id));
    }
  };
  
  const handleAddEpic = (releaseId: string) => {
    setSelectedEpic({
      id: '',
      title: '',
      description: '',
      releaseId,
      order: 0,
      color: theme.palette.primary.main,
    });
    setEpicDialogOpen(true);
  };
  
  const handleEditEpic = (epic: Epic) => {
    setSelectedEpic(epic);
    setEpicDialogOpen(true);
  };
  
  const handleDeleteEpic = (id: string) => {
    if (window.confirm('Are you sure you want to delete this epic? This will also delete all associated stories.')) {
      dispatch(removeEpic(id));
    }
  };
  
  const handleAddStory = (epicId: string) => {
    setSelectedStory({
      id: '',
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      points: 1,
      epicId,
      order: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setStoryDialogOpen(true);
  };
  
  const handleEditStory = (story: UserStory) => {
    setSelectedStory(story);
    setStoryDialogOpen(true);
  };
  
  const handleDeleteStory = (id: string) => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      dispatch(removeUserStory(id));
    }
  };
  
  const handleSaveRelease = (release: Omit<Release, 'id' | 'order'>) => {
    if (selectedRelease && selectedRelease.id) {
      dispatch(updateRelease({ id: selectedRelease.id, ...release }));
    } else {
      dispatch(addRelease(release));
    }
    setReleaseDialogOpen(false);
  };
  
  const handleSaveEpic = (epic: { 
    title: string; 
    description?: string; 
    color: string; 
    releaseId?: string;
    id?: string;
  }) => {
    if (epic.id) {
      dispatch(updateEpic({ id: epic.id, ...epic }));
    } else {
      const { id, ...newEpic } = epic;
      dispatch(addEpic(newEpic as Omit<Epic, 'id' | 'order'>));
    }
    setEpicDialogOpen(false);
  };
  
  const handleSaveStory = (story: { 
    title: string; 
    description?: string; 
    status: 'todo' | 'in-progress' | 'done'; 
    priority: 'high' | 'medium' | 'low';
    points?: number;
    epicId?: string;
    id?: string;
  }) => {
    if (story.id) {
      dispatch(updateUserStory({ id: story.id, ...story }));
    } else {
      const { id, ...newStory } = story;
      dispatch(addUserStory(newStory as Omit<UserStory, 'id' | 'createdAt' | 'updatedAt' | 'order'>));
    }
    setStoryDialogOpen(false);
  };
  
  // Loading and error states
  if (status === 'loading') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading story map: {error}
      </Alert>
    );
  }
  
  return (
    <DndProvider backend={HTML5Backend}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Story Map
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleAddRelease}
          >
            Add Release
          </Button>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Releases */}
        {releases.length > 0 ? (
          releases.map((release, index) => (
            <ReleaseRow
              key={release.id}
              release={release}
              index={index}
              onEdit={handleEditRelease}
              onDelete={handleDeleteRelease}
              onAddEpic={handleAddEpic}
              onEditEpic={handleEditEpic}
              onDeleteEpic={handleDeleteEpic}
              onAddStory={handleAddStory}
              onEditStory={handleEditStory}
              onDeleteStory={handleDeleteStory}
            />
          ))
        ) : (
          <Box sx={{ textAlign: 'center', p: 4, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
            <TimelineIcon color="disabled" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Releases Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Create your first release to start building your story map
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleAddRelease}
            >
              Add Release
            </Button>
          </Box>
        )}
        
        {/* Dialogs */}
        <ReleaseDialog
          open={releaseDialogOpen}
          onClose={() => setReleaseDialogOpen(false)}
          release={selectedRelease}
          onSave={handleSaveRelease}
        />
        
        <EpicDialog
          open={epicDialogOpen}
          onClose={() => setEpicDialogOpen(false)}
          epic={selectedEpic}
          onSave={handleSaveEpic}
        />
        
        <StoryDialog
          open={storyDialogOpen}
          onClose={() => setStoryDialogOpen(false)}
          story={selectedStory}
          onSave={handleSaveStory}
        />
      </Box>
    </DndProvider>
  );
};

export default StoryMapEditor;
