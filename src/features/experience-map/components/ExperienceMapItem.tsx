import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { 
  Card, 
  CardContent, 
  Typography, 
  IconButton, 
  Box, 
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  useTheme
} from '@mui/material';
import { 
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragHandleIcon
} from '@mui/icons-material';
import { ExperienceMapItem as ExperienceMapItemType } from '../../../store/slices/experienceMapSlice';

interface DragItem {
  type: string;
  id: string;
  index: number;
  phaseId: string;
}

interface ExperienceMapItemProps {
  item: ExperienceMapItemType;
  phaseId: string;
  index: number;
  moveItem?: (dragIndex: number, hoverIndex: number, dragPhaseId: string, hoverPhaseId: string) => void;
  onEdit?: (item: ExperienceMapItemType) => void;
  onDelete?: (id: string) => void;
}

export const ExperienceMapItem: React.FC<ExperienceMapItemProps> = ({
  item,
  phaseId,
  index,
  moveItem,
  onEdit,
  onDelete
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  
  // Set up drag and drop
  const [{ isDragging }, drag] = useDrag({
    type: 'EXPERIENCE_ITEM',
    item: { type: 'EXPERIENCE_ITEM', id: item.id, index, phaseId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  const [, drop] = useDrop({
    accept: 'EXPERIENCE_ITEM',
    hover(dragItem: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      
      const dragIndex = dragItem.index;
      const hoverIndex = index;
      const dragPhaseId = dragItem.phaseId;
      const hoverPhaseId = phaseId;
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex && dragPhaseId === hoverPhaseId) {
        return;
      }
      
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      
      // Time to actually perform the action
      if (moveItem) {
        moveItem(dragIndex, hoverIndex, dragPhaseId, hoverPhaseId);
      }
      
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      dragItem.index = hoverIndex;
      dragItem.phaseId = hoverPhaseId;
    },
  });
  
  const opacity = isDragging ? 0.5 : 1;
  
  // Combine drag and drop refs
  const dragDropRef = (el: HTMLDivElement | null) => {
    drag(el);
    drop(el);
    ref.current = el;
  };
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleEdit = () => {
    handleMenuClose();
    if (onEdit) onEdit(item);
  };
  
  const handleDelete = () => {
    handleMenuClose();
    if (onDelete) onDelete(item.id);
  };
  
  const getEmotionColor = () => {
    switch (item.emotion) {
      case 'happy':
        return theme.palette.success.main;
      case 'delighted':
        return theme.palette.success.dark;
      case 'frustrated':
        return theme.palette.warning.main;
      case 'angry':
        return theme.palette.error.main;
      case 'neutral':
      default:
        return theme.palette.grey[500];
    }
  };
  
  return (
    <>
      <Card 
        ref={dragDropRef}
        sx={{ 
          mb: 1, 
          cursor: 'move',
          opacity,
          '&:hover': {
            boxShadow: theme.shadows[4],
          },
        }}
        elevation={1}
      >
        <CardContent sx={{ p: 2, pb: '16px !important' }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box flexGrow={1}>
              <Box display="flex" alignItems="center" mb={1}>
                <DragHandleIcon 
                  sx={{ 
                    color: 'action.active', 
                    mr: 1, 
                    cursor: 'move',
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }} 
                />
                <Typography variant="subtitle2" fontWeight={500}>
                  {item.title}
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 1 }}>
                {item.description}
              </Typography>
              
              <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                <Chip 
                  label={item.emotion} 
                  size="small"
                  sx={{
                    backgroundColor: `${getEmotionColor()}22`,
                    color: getEmotionColor(),
                    border: `1px solid ${getEmotionColor()}66`,
                    textTransform: 'capitalize',
                    fontWeight: 500,
                  }}
                />
                
                {item.evidence && item.evidence.length > 0 && (
                  <Chip 
                    label={`${item.evidence.length} evidence`} 
                    size="small"
                    variant="outlined"
                  />
                )}
                
                {item.opportunities && item.opportunities.length > 0 && (
                  <Chip 
                    label={`${item.opportunities.length} opportunities`} 
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
            
            <IconButton 
              size="small" 
              onClick={handleMenuOpen}
              sx={{ ml: 1 }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default ExperienceMapItem;
