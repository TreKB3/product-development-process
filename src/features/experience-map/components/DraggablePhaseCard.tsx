import * as React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Box, Paper, Typography, IconButton, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DragIndicator, ContentCopy, Delete } from '@mui/icons-material';
import { ExperienceMapPhase } from '../../../store/slices/experienceMapSlice';

interface DraggablePhaseCardProps {
  phase: ExperienceMapPhase;
  index: number;
  personaId: string;
  movePhase: (dragIndex: number, hoverIndex: number, dragPersonaId: string, hoverPersonaId: string) => void;
  onEdit: (phaseId: string) => void;
  onDuplicate: (phase: ExperienceMapPhase) => void;
  onDelete: (phaseId: string) => void;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
  personaId: string;
  phase: ExperienceMapPhase;
}

export const DraggablePhaseCard: React.FC<DraggablePhaseCardProps> = ({
  phase,
  index,
  personaId,
  movePhase,
  onEdit,
  onDuplicate,
  onDelete
}) => {
  const theme = useTheme();
  const ref = React.useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'phase',
    item: { type: 'phase', id: phase.id, index, personaId, phase },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'phase',
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      const dragPersonaId = item.personaId;
      const hoverPersonaId = personaId;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex && dragPersonaId === hoverPersonaId) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      
      // Get pixels to the top
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      movePhase(dragIndex, hoverIndex, dragPersonaId, hoverPersonaId);
      
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
      item.personaId = hoverPersonaId;
    },
  });

  const opacity = isDragging ? 0.4 : 1;
  drag(drop(ref));

  return (
    <div ref={ref} style={{ opacity, cursor: 'move', marginBottom: theme.spacing(2) }}>
      <Paper 
        elevation={2}
        sx={{
          borderLeft: `4px solid ${phase.color || theme.palette.primary.main}`,
          '&:hover': {
            boxShadow: 3,
          },
        }}
      >
        <Box 
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 1,
            backgroundColor: phase.color ? `${phase.color}22` : 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <DragIndicator 
            fontSize="small" 
            color="action" 
            sx={{ 
              mr: 1, 
              cursor: 'move',
              '&:hover': {
                color: 'primary.main',
              }
            }} 
          />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {phase.name}
            </Typography>
            {phase.description && (
              <Typography variant="caption" color="textSecondary">
                {phase.description}
              </Typography>
            )}
          </Box>
          <Box>
            <Tooltip title="Duplicate Phase">
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(phase);
                }}
              >
                <ContentCopy fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Phase">
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(phase.id);
                }}
                color="error"
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>
    </div>
  );
};

export default DraggablePhaseCard;
