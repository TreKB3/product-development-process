import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CircularProgress,
  Grid,
  Typography,
  Paper,
  Divider,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { AppDispatch, RootState } from '../store/store';
import { fetchProjects, ProjectStatus, setFilterStatus, setSearchTerm, selectFilteredProjects } from '../store/slices/projectSlice';

const Projects: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { loading, error, filter } = useSelector((state: RootState) => state.projects);
  const projects = useSelector(selectFilteredProjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setSearchTerm(searchQuery));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, dispatch]);

  useEffect(() => {
    dispatch(setFilterStatus(statusFilter));
  }, [statusFilter, dispatch]);

  const handleCreateNew = () => {
    navigate('/projects/new');
  };

  const handleViewProject = (id: string) => {
    navigate(`/projects/${id}`);
  };

  const handleEditProject = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigate(`/projects/${id}/edit`);
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'primary';
      case 'review':
        return 'warning';
      case 'draft':
      default:
        return 'default';
    }
  };

  if (loading && projects.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
        <Button onClick={() => dispatch(fetchProjects())} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Paper>
    );
  }

  return (
    <Box>
      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1">
            Projects
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateNew}
            size="large"
          >
            New Project
          </Button>
        </Box>
        
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <Box sx={{ flex: 1, minWidth: '200px', maxWidth: '400px' }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box sx={{ minWidth: '200px', maxWidth: '300px' }}>
              <FormControl fullWidth>
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterListIcon color="action" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="review">In Review</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Paper>
      </Box>

      {projects.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Box py={4}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {filter.search || filter.status !== 'all' 
                ? 'No projects match your filters.' 
                : 'No projects found.'}
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              {filter.search || filter.status !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Create your first project to get started.'}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateNew}
              sx={{ mt: 2 }}
            >
              Create Project
            </Button>
          </Box>
        </Paper>
      ) : (
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          gap: 3,
          width: '100%'
        }}>
          {projects.map((project) => (
              <Card 
                onClick={() => handleViewProject(project.id)}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardHeader
                  title={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" component="div" noWrap>
                        {project.name}
                      </Typography>
                      <Chip 
                        label={project.status.replace('-', ' ')}
                        color={getStatusColor(project.status)}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  }
                  subheader={
                    <Box mt={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        Created: {new Date(project.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  }
                  sx={{ pb: 1 }}
                />
                <CardContent sx={{ flexGrow: 1, pt: 0, pb: 1 }}>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      mb: 1.5,
                    }}
                  >
                    {project.description || 'No description provided.'}
                  </Typography>
                  
                  {project.teamMembers && project.teamMembers.length > 0 && (
                    <Box mt={1.5}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        Team ({project.teamMembers.length})
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {project.teamMembers.slice(0, 3).map((member) => (
                          <Chip 
                            key={member.id}
                            label={member.name.split(' ')[0]}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              fontSize: '0.7rem',
                              height: 24,
                              '& .MuiChip-label': { px: 1 },
                            }}
                          />
                        ))}
                        {project.teamMembers.length > 3 && (
                          <Chip 
                            label={`+${project.teamMembers.length - 3} more`}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              fontSize: '0.7rem',
                              height: 24,
                              '& .MuiChip-label': { px: 1 },
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}>
                  <Box>
                    {project.updatedAt && (
                      <Typography variant="caption" color="text.secondary">
                        Updated: {new Date(project.updatedAt).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                  <Box>
                    <Tooltip title="Edit Project">
                      <IconButton 
                        size="small" 
                        onClick={(e) => handleEditProject(e, project.id)}
                        aria-label="edit project"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Details">
                      <IconButton 
                        size="small" 
                        onClick={() => handleViewProject(project.id)}
                        aria-label="view details"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardActions>
              </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Projects;
