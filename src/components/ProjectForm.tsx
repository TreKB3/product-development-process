import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
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
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  InputAdornment,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Timeline as TimelineIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { Project, ProjectStatus, TeamMember, Phase, Persona } from '../store/slices/projectSlice';
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
  phases: [],
  personas: [],
  requirements: [],
};

const ProjectForm: React.FC<ProjectFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting = false,
  title = 'Project Configuration',
  submitButtonText = 'Save Project',
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>({
    defaultValues: { 
      ...defaultValues, 
      ...initialData,
      // Ensure arrays are initialized
      phases: initialData?.phases || [],
      personas: initialData?.personas || [],
      requirements: initialData?.requirements || [],
    },
  });

  // Field arrays for different sections
  const { fields: teamMembers, append: appendTeamMember, remove: removeTeamMember } = useFieldArray({
    control,
    name: 'teamMembers',
  });

  const { fields: successMetrics, append: appendSuccessMetric, remove: removeSuccessMetric } = useFieldArray({
    control,
    name: 'assumptions',
  });

  const { fields: phases, append: appendPhase, remove: removePhase } = useFieldArray({
    control,
    name: 'phases',
  });

  const { fields: personas, append: appendPersona, remove: removePersona } = useFieldArray({
    control,
    name: 'personas',
  });

  const { fields: requirements, append: appendRequirement, remove: removeRequirement } = useFieldArray({
    control,
    name: 'requirements',
  });

  // Local state for new items
  const [newTeamMember, setNewTeamMember] = React.useState('');
  const [newSuccessMetric, setNewSuccessMetric] = React.useState('');
  const [newPhase, setNewPhase] = React.useState('');
  const [newPersona, setNewPersona] = React.useState({ name: '', description: '', goals: '', painPoints: '' });
  const [newRequirement, setNewRequirement] = React.useState('');
  const [expanded, setExpanded] = React.useState<string | false>('project-details');

  // Handler for accordion expansion
  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Handler for adding a new phase
  const handleAddPhase = () => {
    if (newPhase.trim()) {
      const [name, ...descParts] = newPhase.split(':');
      const description = descParts.join(':').trim() || 'Phase description';
      
      appendPhase({
        id: uuidv4(),
        name: name.trim(),
        description,
        order: phases.length + 1
      });
      setNewPhase('');
    }
  };

  // Handler for adding a new persona
  const handleAddPersona = () => {
    if (newPersona.name.trim()) {
      appendPersona({
        id: uuidv4(),
        name: newPersona.name.trim(),
        description: newPersona.description.trim() || 'No description provided',
        goals: newPersona.goals.split(',').map(s => s.trim()).filter(Boolean) || [],
        painPoints: newPersona.painPoints.split(',').map(s => s.trim()).filter(Boolean) || []
      });
      setNewPersona({ name: '', description: '', goals: '', painPoints: '' });
    }
  };

  // Handler for adding a new requirement
  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      appendRequirement({
        id: uuidv4(),
        description: newRequirement.trim()
      });
      setNewRequirement('');
    }
  };

  // Handler for adding a team member
  const handleAddTeamMember = () => {
    if (newTeamMember.trim()) {
      const [name, email, role] = newTeamMember.split(',').map(s => s.trim());
      if (name && email) {
        appendTeamMember({ 
          id: uuidv4(), 
          name, 
          email, 
          role: role || 'Team Member' 
        } as TeamMember);
        setNewTeamMember('');
      }
    }
  };

  // Handler for adding a success metric
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

  // Handler for removing items
  const handleRemoveItem = (removeFn: (index: number) => void, index: number) => {
    removeFn(index);
  };
  
  // Alias for specific remove handlers for better type safety
  const handleRemoveTeamMember = (index: number) => removeTeamMember(index);
  const handleRemoveSuccessMetric = (index: number) => removeSuccessMetric(index);
  const handleRemovePhase = (index: number) => removePhase(index);
  const handleRemovePersona = (index: number) => removePersona(index);
  const handleRemoveRequirement = (index: number) => removeRequirement(index);

  const onFormSubmit = (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Ensure all required arrays are initialized
    const formData = {
      ...data,
      teamMembers: data.teamMembers || [],
      successMetrics: data.successMetrics || [],
      assumptions: data.assumptions || [],
      phases: data.phases || [],
      personas: data.personas || [],
      requirements: data.requirements || [],
    };
    onSubmit(formData);
  };

  const renderField = <T extends keyof Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>({
    name,
    label,
    required = false,
    multiline = false,
    rows = 1,
    type = 'text',
    select = false,
    children,
  }: {
    name: T;
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

  // Render a section header with icon
  const renderSectionHeader = (title: string, icon: React.ReactNode, panel: string, children: React.ReactNode) => (
    <Accordion 
      expanded={expanded === panel}
      onChange={handleAccordionChange(panel)}
      elevation={2}
      sx={{ mb: 2 }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {icon}
          <Typography variant="h6">{title}</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {children}
      </AccordionDetails>
    </Accordion>
  );

  // Render form field with label
  const renderFormField = (fieldName: keyof Omit<Project, 'id' | 'createdAt' | 'updatedAt'>, label: string, multiline = false, rows = 1) => (
    <Box mb={2}>
      <Typography variant="subtitle1" gutterBottom>
        {label}
      </Typography>
      <Controller
        name={fieldName}
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            margin="normal"
            multiline={multiline}
            rows={rows}
            placeholder={`Enter ${label.toLowerCase()}...`}
          />
        )}
      />
    </Box>
  );

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>
      
      <form onSubmit={handleSubmit(onFormSubmit)}>
        {/* Project Details Section */}
        {renderSectionHeader(
          'Project Details',
          <AssignmentIcon />,
          'project-details',
          <>
            {renderFormField('name', 'Project Name')}
            {renderFormField('description', 'Description', true, 3)}
            {renderFormField('businessProblem', 'Business Problem', true, 3)}
            {renderFormField('targetAudience', 'Target Audience', true, 2)}
          </>
        )}

        {/* Team Members Section */}
        {renderSectionHeader(
          'Team Members',
          <GroupIcon />,
          'team-members',
          <>
            <Box display="flex" gap={1} mb={2}>
              <TextField
                fullWidth
                value={newTeamMember}
                onChange={(e) => setNewTeamMember(e.target.value)}
                placeholder="Name, Email, Role (optional)"
                size="small"
              />
              <Button
                variant="outlined"
                onClick={handleAddTeamMember}
                disabled={!newTeamMember.trim()}
                startIcon={<AddIcon />}
              >
                Add
              </Button>
            </Box>
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
          </>
        )}

        {/* Success Metrics Section */}
        {renderSectionHeader(
          'Success Metrics',
          <CheckCircleIcon />,
          'success-metrics',
          <>
            <Box display="flex" gap={1} mb={2}>
              <TextField
                fullWidth
                value={newSuccessMetric}
                onChange={(e) => setNewSuccessMetric(e.target.value)}
                placeholder="Add a success metric"
                size="small"
              />
              <Button
                variant="outlined"
                onClick={handleAddSuccessMetric}
                disabled={!newSuccessMetric.trim()}
                startIcon={<AddIcon />}
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
          </>
        )}

        {/* Project Phases Section */}
        {renderSectionHeader(
          'Project Phases',
          <TimelineIcon />,
          'project-phases',
          <>
            <Box display="flex" gap={1} mb={2}>
              <TextField
                fullWidth
                value={newPhase}
                onChange={(e) => setNewPhase(e.target.value)}
                placeholder="Phase Name: Description"
                size="small"
              />
              <Button
                variant="outlined"
                onClick={handleAddPhase}
                disabled={!newPhase.trim()}
                startIcon={<AddIcon />}
              >
                Add Phase
              </Button>
            </Box>
            <List dense>
              {phases.map((phase, index) => (
                <ListItem key={phase.id}>
                  <ListItemText
                    primary={phase.name}
                    secondary={phase.description}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleRemovePhase(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
              {phases.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No phases added yet
                </Typography>
              )}
            </List>
          </>
        )}

        {/* Personas Section */}
        {renderSectionHeader(
          'User Personas',
          <PersonIcon />,
          'user-personas',
          <>
            <Box display="flex" flexDirection="column" gap={2} mb={2}>
              <TextField
                label="Name"
                value={newPersona.name}
                onChange={(e) => setNewPersona({...newPersona, name: e.target.value})}
                size="small"
                fullWidth
              />
              <TextField
                label="Description"
                value={newPersona.description}
                onChange={(e) => setNewPersona({...newPersona, description: e.target.value})}
                size="small"
                multiline
                rows={2}
                fullWidth
              />
              <TextField
                label="Goals (comma separated)"
                value={newPersona.goals}
                onChange={(e) => setNewPersona({...newPersona, goals: e.target.value})}
                size="small"
                fullWidth
              />
              <TextField
                label="Pain Points (comma separated)"
                value={newPersona.painPoints}
                onChange={(e) => setNewPersona({...newPersona, painPoints: e.target.value})}
                size="small"
                fullWidth
              />
              <Button
                variant="outlined"
                onClick={handleAddPersona}
                disabled={!newPersona.name.trim()}
                startIcon={<AddIcon />}
                sx={{ alignSelf: 'flex-start' }}
              >
                Add Persona
              </Button>
            </Box>
            <List dense>
              {personas.map((persona, index) => (
                <ListItem key={persona.id}>
                  <ListItemText
                    primary={persona.name}
                    secondary={
                      <>
                        {persona.description}
                        <br />
                        <strong>Goals:</strong> {Array.isArray(persona.goals) ? persona.goals.join(', ') : ''}
                        <br />
                        <strong>Pain Points:</strong> {Array.isArray(persona.painPoints) ? persona.painPoints.join(', ') : ''}
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleRemovePersona(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
              {personas.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No personas added yet
                </Typography>
              )}
            </List>
          </>
        )}

        {/* Requirements Section */}
        {renderSectionHeader(
          'Requirements',
          <AssignmentIcon />,
          'requirements',
          <>
            <Box display="flex" gap={1} mb={2}>
              <TextField
                fullWidth
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                placeholder="Add a requirement"
                size="small"
              />
              <Button
                variant="outlined"
                onClick={handleAddRequirement}
                disabled={!newRequirement.trim()}
                startIcon={<AddIcon />}
              >
                Add
              </Button>
            </Box>
            <List dense>
              {requirements.map((requirement, index) => (
                <ListItem key={requirement.id}>
                  <ListItemText primary={requirement.description} />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleRemoveRequirement(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
              {requirements.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No requirements added yet
                </Typography>
              )}
            </List>
          </>
        )}

        {/* Form Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
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
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? 'Saving...' : submitButtonText}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default ProjectForm;

