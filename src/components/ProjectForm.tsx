import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller, useFieldArray, Control, FieldValues, useFormContext } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  Paper,
  TextField,
  Typography,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  InputAdornment,
  TextFieldProps,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Project, ProjectStatus, TeamMember } from '../store/slices/projectSlice';
import { v4 as uuidv4 } from 'uuid';

interface ProjectFormProps {
  initialData?: Partial<Project>;
  onSubmit: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  isSubmitting?: boolean;
  title?: string;
  submitButtonText?: string;
}

const defaultValues: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  description: '',
  status: 'draft' as ProjectStatus,
  teamMembers: [],
  businessProblem: '',
  targetAudience: '',
  successMetrics: [],
  assumptions: [],
};

const ProjectForm: React.FC<ProjectFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting = false,
  title = 'Create Project',
  submitButtonText = 'Create Project',
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    register,
    reset,
  } = useForm<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>({
    defaultValues: { ...defaultValues, ...initialData },
  });

  // Field array for team members
  const { fields: teamMembers, append: appendTeamMember, remove: removeTeamMember } = useFieldArray({
    control,
    name: 'teamMembers' as const,
  });

  // Field array for success metrics (using assumptions field)
  const { fields: successMetrics, append: appendSuccessMetric, remove: removeSuccessMetric } = useFieldArray({
    control,
    name: 'assumptions' as const,
  });

  // Ensure assumptions is always an array
  React.useEffect(() => {
    if (initialData?.assumptions === undefined) {
      setValue('assumptions', []);
    }
  }, [initialData, setValue]);

  const [newTeamMember, setNewTeamMember] = React.useState('');
  const [newSuccessMetric, setNewSuccessMetric] = React.useState('');

  const handleAddTeamMember = () => {
    if (newTeamMember.trim()) {
      const [name, email, role] = newTeamMember.split(',').map(s => s.trim());
      if (name && email && role) {
        appendTeamMember({ id: uuidv4(), name, email, role } as TeamMember);
        setNewTeamMember('');
      }
    }
  };

  const handleRemoveTeamMember = (index: number) => {
    removeTeamMember(index);
  };

  const handleAddSuccessMetric = () => {
    if (newSuccessMetric.trim()) {
      appendSuccessMetric({ 
        id: uuidv4(), 
        description: newSuccessMetric.trim(),
        risk: 'medium' as const,
        validationStatus: 'not-validated' as const
      });
      setNewSuccessMetric('');
    }
  };

  const handleRemoveSuccessMetric = (index: number) => {
    removeSuccessMetric(index);
  };

  const onFormSubmit = (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    onSubmit(data);
  };

  const renderField = ({
    name,
    label,
    required = false,
    multiline = false,
    rows = 1,
    type = 'text',
    select = false,
    children,
  }: {
    name: keyof Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;
    label: string;
    required?: boolean;
    multiline?: boolean;
    rows?: number;
    type?: string;
    select?: boolean;
    children?: React.ReactNode;
  }) => (
    <Box>
      <Controller
        name={name}
        control={control}
        rules={required ? { required: `${label} is required` } : {}}
        render={({ field }) => (
          <TextField
            {...field}
            label={label}
            fullWidth
            margin="normal"
            required={required}
            error={!!errors[name]}
            helperText={errors[name]?.message as string}
            multiline={multiline}
            rows={rows}
            type={type}
            select={select}
          >
            {children}
          </TextField>
        )}
      />
    </Box>
  );

  return (
    <Paper elevation={2} sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h5" component="h1" gutterBottom>
        {title}
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit(onFormSubmit)} noValidate>
        <Stack spacing={3}>
          {renderField({
            name: 'name',
            label: 'Project Name',
            required: true
          })}
          
          {renderField({
            name: 'description',
            label: 'Description',
            required: true,
            multiline: true,
            rows: 4
          })}
          
          <Box sx={{ width: { xs: '100%', md: '50%' } }}>
            {renderField({
              name: 'status',
              label: 'Status',
              select: true,
              children: ['draft', 'in_progress', 'on_hold', 'completed', 'cancelled'].map((status) => (
                <MenuItem key={status} value={status}>
                  {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </MenuItem>
              ))
            })}
          </Box>
          
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Business Problem
            </Typography>
            <Controller
              name="businessProblem"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  multiline
                  rows={3}
                  fullWidth
                  margin="normal"
                  placeholder="Describe the business problem this project aims to solve..."
                />
              )}
            />
          </Box>
          
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Target Audience
            </Typography>
            <Controller
              name="targetAudience"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  margin="normal"
                  placeholder="Who is the target audience for this project?"
                />
              )}
            />
          </Box>
          
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Success Metrics
            </Typography>
            <Box display="flex" gap={1} mb={1}>
              <TextField
                value={newSuccessMetric}
                onChange={(e) => setNewSuccessMetric(e.target.value)}
                placeholder="Add a success metric"
                fullWidth
                size="small"
              />
              <Button
                variant="outlined"
                onClick={handleAddSuccessMetric}
                startIcon={<AddIcon />}
                disabled={!newSuccessMetric.trim()}
              >
                Add
              </Button>
            </Box>
            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
              {successMetrics.map((metric, index) => (
                <Chip
                  key={metric.id}
                  label={metric.description}
                  onDelete={() => handleRemoveSuccessMetric(index)}
                  color="primary"
                  variant="outlined"
                />
              ))}
              {successMetrics.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No success metrics added yet
                </Typography>
              )}
            </Box>
          </Box>
          
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Team Members
            </Typography>
            <List dense>
              {teamMembers.map((member, index) => (
                <ListItem key={member.id}>
                  <ListItemText
                    primary={member.name}
                    secondary={`${member.role} • ${member.email}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleRemoveTeamMember(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
              {teamMembers.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No team members added yet
                </Typography>
              )}
            </List>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/projects')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : submitButtonText}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
};

export default ProjectForm;
