import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Grid,
  Typography,
  IconButton,
  InputAdornment,
  Chip,
} from '@mui/material';
import { 
  Title as TitleIcon,
  Description as DescriptionIcon,
  Flag as FlagIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import PriorityChip from './PriorityChip';
import StatusChip from './StatusChip';

type Priority = 'high' | 'medium' | 'low';
type Status = 'todo' | 'in-progress' | 'done';

interface StoryDialogProps {
  open: boolean;
  onClose: () => void;
  story: {
    id?: string;
    title: string;
    description?: string;
    status: Status;
    priority: Priority;
    points?: number;
    epicId?: string;
  } | null;
  onSave: (story: { 
    title: string; 
    description?: string; 
    status: Status; 
    priority: Priority; 
    points?: number;
    epicId?: string;
    id?: string;
  }) => void;
}

const StoryDialog: React.FC<StoryDialogProps> = ({ open, onClose, story, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Status>('todo');
  const [priority, setPriority] = useState<Priority>('medium');
  const [points, setPoints] = useState<number | undefined>(undefined);
  const [errors, setErrors] = useState({ title: '' });

  useEffect(() => {
    if (story) {
      setTitle(story.title);
      setDescription(story.description || '');
      setStatus(story.status || 'todo');
      setPriority(story.priority || 'medium');
      setPoints(story.points);
    } else {
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
      setPoints(undefined);
    }
    setErrors({ title: '' });
  }, [story, open]);

  const validate = () => {
    const newErrors = { title: '' };
    let isValid = true;

    if (!title.trim()) {
      newErrors.title = 'Story title is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const storyData = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      points: points && points > 0 ? points : undefined,
      epicId: story?.epicId,
    };

    onSave(storyData);
  };

  const handleStatusChange = (event: SelectChangeEvent<Status>) => {
    setStatus(event.target.value as Status);
  };

  const handlePriorityChange = (event: SelectChangeEvent<Priority>) => {
    setPriority(event.target.value as Priority);
  };

  const handlePointsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    setPoints(isNaN(value) ? undefined : value);
  };

  const renderPointsSelect = () => {
    const pointsList = [1, 2, 3, 5, 8, 13, 21];
    
    return (
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {pointsList.map((point) => (
          <Chip
            key={point}
            label={point}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setPoints(points === point ? undefined : point);
            }}
            onDelete={points === point ? () => setPoints(undefined) : undefined}
            variant={points === point ? 'filled' : 'outlined'}
            color={points === point ? 'primary' : 'default'}
            sx={{ 
              minWidth: 40,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          />
        ))}
        <TextField
          type="number"
          size="small"
          value={points || ''}
          onChange={handlePointsChange}
          placeholder="Custom"
          InputProps={{
            inputProps: { min: 1, max: 100 },
            sx: { width: 100 },
          }}
        />
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TitleIcon color="primary" />
        {story?.id ? 'Edit User Story' : 'Create New User Story'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Story Title"
            fullWidth
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={!!errors.title}
            helperText={errors.title}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TitleIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                  <DescriptionIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <FormControl fullWidth margin="dense">
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                value={status}
                label="Status"
                onChange={handleStatusChange}
                startAdornment={
                  <InputAdornment position="start">
                    <StatusChip status={status} size="small" />
                  </InputAdornment>
                }
              >
                <MenuItem value="todo">
                  <StatusChip status="todo" label="To Do" size="small" />
                </MenuItem>
                <MenuItem value="in-progress">
                  <StatusChip status="in-progress" label="In Progress" size="small" />
                </MenuItem>
                <MenuItem value="done">
                  <StatusChip status="done" label="Done" size="small" />
                </MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel id="priority-label">Priority</InputLabel>
              <Select
                labelId="priority-label"
                value={priority}
                label="Priority"
                onChange={handlePriorityChange}
                startAdornment={
                  <InputAdornment position="start">
                    <PriorityChip priority={priority} size="small" />
                  </InputAdornment>
                }
              >
                <MenuItem value="high">
                  <PriorityChip priority="high" label="High" size="small" />
                </MenuItem>
                <MenuItem value="medium">
                  <PriorityChip priority="medium" label="Medium" size="small" />
                </MenuItem>
                <MenuItem value="low">
                  <PriorityChip priority="low" label="Low" size="small" />
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Story Points
            </Typography>
            {renderPointsSelect()}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={!title.trim()}
        >
          {story?.id ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StoryDialog;
