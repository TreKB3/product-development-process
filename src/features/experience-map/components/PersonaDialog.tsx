import * as React from 'react';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Typography,
  Divider,
  Chip,
  Box,
  Tooltip,
  InputAdornment,
  useTheme,
  MenuItem,
} from '@mui/material';
import { 
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  EmojiEmotions as EmojiIcon,
  SentimentVeryDissatisfied as PainPointIcon,
  Grade as GoalIcon,
} from '@mui/icons-material';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { v4 as uuidv4 } from 'uuid';

import { 
  ExperienceMapPersona,
  addPersona, 
  updatePersona,
  selectPersonaById 
} from '../../../store/slices/experienceMapSlice';

interface PersonaDialogProps {
  open: boolean;
  onClose: () => void;
  personaId?: string;
}

type PersonaFormData = {
  id: string;
  name: string;
  description: string;
  goals: string[];
  painPoints: string[];
  demographics: {
    age: string;
    occupation: string;
    techSavviness?: 'low' | 'medium' | 'high';
  };
};

const schema = yup.object().shape({
  id: yup.string().required(),
  name: yup.string().required('Name is required'),
  description: yup.string().required('Description is required'),
  goals: yup.array().of(yup.string().required('Goal cannot be empty')).default([]),
  painPoints: yup.array().of(yup.string().required('Pain point cannot be empty')).default([]),
  demographics: yup.object({
    age: yup.string().default(''),
    occupation: yup.string().default(''),
    techSavviness: yup.string().oneOf(['low', 'medium', 'high', undefined]).optional(),
  }).default({}),
});

export const PersonaDialog: React.FC<PersonaDialogProps> = ({ 
  open, 
  onClose,
  personaId
}) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const persona = useSelector((state: any) => 
    personaId ? selectPersonaById(state, personaId) : null
  );
  
  const { 
    control, 
    handleSubmit, 
    reset, 
    formState: { errors },
    setValue,
    watch,
  } = useForm<PersonaFormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      id: '',
      name: '',
      description: '',
      goals: [],
      painPoints: [],
      demographics: {
        age: '',
        occupation: '',
        techSavviness: undefined,
      },
    },
  });
  
  const [newGoal, setNewGoal] = useState('');
  const [newPainPoint, setNewPainPoint] = useState('');
  
  const goals = watch('goals') || [];
  const painPoints = watch('painPoints') || [];
  
  // Reset form when opening/closing or when persona changes
  useEffect(() => {
    if (open) {
      if (persona) {
        // Edit mode - populate with existing persona data
        reset({
          id: persona.id,
          name: persona.name,
          description: persona.description,
          goals: [...(persona.goals || [])],
          painPoints: [...(persona.painPoints || [])],
          demographics: {
            age: persona.demographics?.age || '',
            occupation: persona.demographics?.occupation || '',
            techSavviness: persona.demographics?.techSavviness || undefined,
          },
        });
      } else {
        // New persona - reset to defaults
        reset({
          id: uuidv4(),
          name: '',
          description: '',
          goals: [],
          painPoints: [],
          demographics: {
            age: '',
            occupation: '',
            techSavviness: undefined,
          },
        });
      }
    }
  }, [open, persona, reset]);
  
  const handleAddGoal = () => {
    if (newGoal.trim()) {
      const updatedGoals = [...goals, newGoal.trim()];
      setValue('goals', updatedGoals);
      setNewGoal('');
    }
  };
  
  const handleRemoveGoal = (index: number) => {
    const updatedGoals = [...goals];
    updatedGoals.splice(index, 1);
    setValue('goals', updatedGoals);
  };
  
  const handleAddPainPoint = () => {
    if (newPainPoint.trim()) {
      const updatedPainPoints = [...painPoints, newPainPoint.trim()];
      setValue('painPoints', updatedPainPoints);
      setNewPainPoint('');
    }
  };
  
  const handleRemovePainPoint = (index: number) => {
    const updatedPainPoints = [...painPoints];
    updatedPainPoints.splice(index, 1);
    setValue('painPoints', updatedPainPoints);
  };
  
  const onSubmit: SubmitHandler<PersonaFormData> = (data: PersonaFormData) => {
    const personaData: ExperienceMapPersona = {
      ...data,
      phaseIds: persona?.phaseIds || [], // Preserve existing phaseIds or initialize as empty array
      demographics: {
        age: data.demographics.age,
        occupation: data.demographics.occupation,
        techSavviness: data.demographics.techSavviness,
      },
    };
    
    if (persona) {
      dispatch(updatePersona(personaData));
    } else {
      dispatch(addPersona(personaData));
    }
    onClose();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent, callback: () => void) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      callback();
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '60vh',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: 'primary.main',
        color: 'white',
        py: 1.5,
      }}>
        <Box display="flex" alignItems="center">
          <PersonIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            {persona ? 'Edit Persona' : 'Create New Persona'}
          </Typography>
        </Box>
        <IconButton 
          onClick={onClose} 
          size="small" 
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers sx={{ p: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            {/* Left Column - Basic Info */}
            <Box>
              <Box mb={3}>
                <Typography variant="subtitle1" fontWeight={500} mb={2}>
                  Basic Information
                </Typography>
                
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Persona Name"
                      fullWidth
                      margin="normal"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
                
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Description"
                      fullWidth
                      multiline
                      rows={3}
                      margin="normal"
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />
                
                <Divider sx={{ my: 3 }} />
                
                <Box>
                  <Box display="flex" mb={1}>
                    <TextField
                      value={newPainPoint}
                      onChange={(e) => setNewPainPoint(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, handleAddPainPoint)}
                      placeholder="Add a pain point..."
                      fullWidth
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PainPointIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title="Add Pain Point">
                              <IconButton 
                                onClick={handleAddPainPoint}
                                disabled={!newPainPoint.trim()}
                                size="small"
                                edge="end"
                              >
                                <AddIcon />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                  
                  <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                    {painPoints.map((painPoint, index) => (
                      <Chip
                        key={index}
                        label={painPoint}
                        onDelete={() => handleRemovePainPoint(index)}
                        color="error"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                    
                    {painPoints.length === 0 && (
                      <Typography variant="body2" color="text.secondary" fontStyle="italic">
                        No pain points added yet
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button 
            onClick={onClose} 
            variant="outlined" 
            color="inherit"
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
          >
            {persona ? 'Update Persona' : 'Create Persona'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PersonaDialog;
