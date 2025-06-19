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
  IconButton,
  Typography,
  useTheme,
} from '@mui/material';
import { ChromePicker, ColorResult } from 'react-color';
import { ColorLens as ColorLensIcon } from '@mui/icons-material';

interface EpicDialogProps {
  open: boolean;
  onClose: () => void;
  epic: {
    id?: string;
    title: string;
    description?: string;
    color?: string;
    releaseId?: string;
  } | null;
  onSave: (epic: { 
    title: string; 
    description?: string; 
    color: string; 
    releaseId?: string;
    id?: string;
  }) => void;
}

const EpicDialog: React.FC<EpicDialogProps> = ({ open, onClose, epic, onSave }) => {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(theme.palette.primary.main);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [errors, setErrors] = useState({ title: '' });

  useEffect(() => {
    if (epic) {
      setTitle(epic.title);
      setDescription(epic.description || '');
      setColor(epic.color || theme.palette.primary.main);
    } else {
      setTitle('');
      setDescription('');
      setColor(theme.palette.primary.main);
    }
    setShowColorPicker(false);
    setErrors({ title: '' });
  }, [epic, open, theme.palette.primary.main]);

  const validate = () => {
    const newErrors = { title: '' };
    let isValid = true;

    if (!title.trim()) {
      newErrors.title = 'Epic title is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const epicData = {
      title: title.trim(),
      description: description.trim(),
      color,
      releaseId: epic?.releaseId,
    };

    onSave(epicData);
  };

  const handleColorChange = (newColor: ColorResult) => {
    setColor(newColor.hex);
  };

  const toggleColorPicker = () => {
    setShowColorPicker(!showColorPicker);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{epic?.id ? 'Edit Epic' : 'Create New Epic'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              <TextField
                autoFocus
                margin="dense"
                label="Epic Title"
                fullWidth
                variant="outlined"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
                required
              />
            </Box>
            <Box>
              <InputLabel sx={{ fontSize: '0.75rem', mb: 0.5, color: 'text.secondary' }}>
                Color
              </InputLabel>
              <IconButton
                onClick={toggleColorPicker}
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: color,
                  borderRadius: 1,
                  '&:hover': {
                    opacity: 0.9,
                  },
                }}
              >
                <ColorLensIcon sx={{ color: 'white' }} />
              </IconButton>
            </Box>
          </Box>

          {showColorPicker && (
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
              <ChromePicker
                color={color}
                onChange={handleColorChange}
                disableAlpha
              />
            </Box>
          )}
          
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={!title.trim()}
          sx={{ backgroundColor: color, '&:hover': { backgroundColor: color, opacity: 0.9 } }}
        >
          {epic?.id ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EpicDialog;
