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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

interface ReleaseDialogProps {
  open: boolean;
  onClose: () => void;
  release: {
    id?: string;
    name: string;
    description?: string;
    targetDate?: string;
    status?: string;
  } | null;
  onSave: (release: { 
    name: string; 
    description?: string; 
    targetDate?: string; 
    status?: string;
    id?: string;
  }) => void;
}

const ReleaseDialog: React.FC<ReleaseDialogProps> = ({ open, onClose, release, onSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [status, setStatus] = useState('planned');
  const [errors, setErrors] = useState({ name: '' });

  useEffect(() => {
    if (release) {
      setName(release.name);
      setDescription(release.description || '');
      setTargetDate(release.targetDate ? new Date(release.targetDate) : null);
      setStatus(release.status || 'planned');
    } else {
      setName('');
      setDescription('');
      setTargetDate(null);
      setStatus('planned');
    }
    setErrors({ name: '' });
  }, [release, open]);

  const validate = () => {
    const newErrors = { name: '' };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = 'Release name is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const releaseData = {
      name: name.trim(),
      description: description.trim(),
      targetDate: targetDate ? format(targetDate, 'yyyy-MM-dd') : undefined,
      status,
    };

    onSave(releaseData);
  };

  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatus(event.target.value);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{release?.id ? 'Edit Release' : 'Create New Release'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Release Name"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            required
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
          />
          
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Target Date"
              value={targetDate}
              onChange={(newValue) => setTargetDate(newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: 'normal' as const,
                },
              }}
            />
          </LocalizationProvider>
          
          <FormControl fullWidth margin="dense">
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              value={status}
              label="Status"
              onChange={handleStatusChange}
            >
              <MenuItem value="planned">Planned</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="released">Released</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={!name.trim()}
        >
          {release?.id ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReleaseDialog;
