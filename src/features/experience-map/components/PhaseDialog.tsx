import * as React from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  IconButton,
  Typography,
  Box,
  InputAdornment,
  TextFieldProps,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  FormHelperText,
  Divider,
  Chip,
} from '@mui/material';
import { 
  Close as CloseIcon,
  Timeline as TimelineIcon,
  Palette as PaletteIcon,
  FormatListNumbered as OrderIcon,
} from '@mui/icons-material';
import { ChromePicker, ColorResult } from 'react-color';
import { v4 as uuidv4 } from 'uuid';

import { 
  ExperienceMapPhase,
  addPhase, 
  updatePhase,
  selectPhaseById,
  selectPhases 
} from '../../../store/slices/experienceMapSlice';

interface PhaseDialogProps {
  open: boolean;
  onClose: () => void;
  phaseId?: string | null;
}

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  description: yup.string(),
  order: yup.number().required('Order is required').min(1, 'Order must be at least 1'),
  color: yup.string(),
});

export const PhaseDialog: React.FC<PhaseDialogProps> = ({ 
  open, 
  onClose,
  phaseId
}) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const phase = useSelector((state: any) => 
    phaseId ? selectPhaseById(state, phaseId) : null
  );
  const phases = useSelector(selectPhases);
  
  const { 
    control, 
    handleSubmit, 
    reset, 
    formState: { errors },
    setValue,
    watch,
  } = useForm<yup.InferType<typeof schema> & { id?: string }>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      id: '',
      name: '',
      description: '',
      order: phases.length > 0 ? Math.max(...phases.map(p => p.order)) + 1 : 1,
      color: theme.palette.primary.main,
    },
  });
  
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const selectedColor = watch('color');
  
  // Reset form when opening/closing or when phase changes
  useEffect(() => {
    if (open) {
      if (phase) {
        // Edit mode - populate with existing phase data
        reset({
          ...phase,
        });
      } else {
        // New phase - reset to defaults
        reset({
          id: uuidv4(),
          name: '',
          description: '',
          order: phases.length > 0 ? Math.max(...phases.map(p => p.order)) + 1 : 1,
          color: theme.palette.primary.main,
        });
      }
    }
  }, [open, phase, reset, phases, theme.palette.primary.main]);
  
  const handleColorChange = (color: ColorResult) => {
    setValue('color', color.hex);
  };
  
  const handleOrderChange = (e: SelectChangeEvent<number>) => {
    setValue('order', Number(e.target.value));
  };
  
  const onSubmit = (data: yup.InferType<typeof schema> & { id?: string }) => {
    const phaseData: ExperienceMapPhase = {
      id: data.id || uuidv4(),
      name: data.name,
      description: data.description || '',
      order: data.order,
      color: data.color || '#ffffff',
      items: phase?.items || [], // Preserve existing items or initialize as empty array
    };

    if (phase) {
      dispatch(updatePhase(phaseData));
    } else {
      dispatch(addPhase(phaseData));
    }
    onClose();
  };
  
  // Generate order options
  const orderOptions = Array.from({ length: Math.max(phases.length + 1, 5) }, (_, i) => i + 1);
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{phase ? 'Edit Phase' : 'Add New Phase'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Phase Name"
                    fullWidth
                    margin="normal"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <TimelineIcon color="action" />
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
              
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: 1, alignItems: 'center' }}>
                <Box sx={{ width: '100%', [theme.breakpoints.up('sm')]: { width: '50%' } }}>
                  <Controller
                    name="order"
                    control={control}
                    render={({ field }) => (
                      <FormControl 
                        fullWidth 
                        margin="normal"
                        error={!!errors.order}
                      >
                        <InputLabel id="phase-order-label">Display Order</InputLabel>
                        <Select
                          {...field}
                          labelId="phase-order-label"
                          id="phase-order"
                          value={field.value}
                          onChange={handleOrderChange}
                          label="Display Order"
                          startAdornment={
                            <InputAdornment position="start">
                              <OrderIcon color="action" />
                            </InputAdornment>
                          }
                        >
                          {orderOptions.map((order) => (
                            <MenuItem key={order} value={order}>
                              {order}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.order && (
                          <FormHelperText>{errors.order.message}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Box>
                
                <Box sx={{ width: '100%', [theme.breakpoints.up('sm')]: { width: '50%' } }}>
                  <Box mt={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Phase Color
                    </Typography>
                    <Box 
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <Box
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          bgcolor: selectedColor,
                          border: `1px solid ${theme.palette.divider}`,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          '&:hover': {
                            borderColor: theme.palette.primary.main,
                          },
                        }}
                      >
                        <PaletteIcon 
                          sx={{ 
                            color: 'white',
                            filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))',
                          }} 
                        />
                      </Box>
                      
                      <Box sx={{ flexGrow: 1 }}>
                        <TextField
                          value={selectedColor}
                          onChange={(e) => setValue('color', e.target.value)}
                          fullWidth
                          size="small"
                          placeholder="#hex color"
                        />
                      </Box>
                    </Box>
                    
                    {showColorPicker && (
                      <Box mt={2} position="relative">
                        <Box position="absolute" zIndex={10}>
                          <ChromePicker
                            color={selectedColor}
                            onChange={handleColorChange}
                          />
                        </Box>
                      </Box>
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
            sx={{
              bgcolor: selectedColor,
              '&:hover': {
                bgcolor: selectedColor,
                opacity: 0.9,
              },
            }}
          >
            {phase ? 'Update Phase' : 'Create Phase'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PhaseDialog;
