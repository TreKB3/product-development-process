import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Grid,
  Paper, 
  Typography, 
  Box, 
  CircularProgress, 
  Divider, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Avatar, 
  useTheme,
  alpha,
  Chip,
  SxProps,
  Theme,
  ListItemButton,
  Stack
} from '@mui/material';
import {
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  Build as BuildIcon,
  RateReview as ReviewIcon,
  Drafts as DraftsIcon,
  AccessTime as InProgressIcon,
  Group as TeamIcon,
  TrendingUp as TrendingUpIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { fetchProjects, selectProjectStats, selectRecentProjects } from '../store/slices/projectSlice';
import { AppDispatch } from '../store/store';

// Helper function to format dates
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Status badge component
const StatusBadge = ({ status, count }: { status: string, count: number }) => {
  const theme = useTheme();
  
  const getStatusConfig = () => {
    switch (status) {
      case 'in-progress':
        return {
          icon: <InProgressIcon />,
          color: theme.palette.primary.main,
          bgColor: alpha(theme.palette.primary.main, 0.1),
          label: 'In Progress'
        };
      case 'review':
        return {
          icon: <ReviewIcon />,
          color: theme.palette.warning.main,
          bgColor: alpha(theme.palette.warning.main, 0.1),
          label: 'In Review'
        };
      case 'completed':
        return {
          icon: <CheckCircleIcon />,
          color: theme.palette.success.main,
          bgColor: alpha(theme.palette.success.main, 0.1),
          label: 'Completed'
        };
      case 'draft':
      default:
        return {
          icon: <DraftsIcon />,
          color: theme.palette.text.secondary,
          bgColor: alpha(theme.palette.text.secondary, 0.1),
          label: 'Draft'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Paper 
      sx={{ 
        p: 2, 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        borderLeft: `4px solid ${config.color}`,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
          transition: 'all 0.3s ease-in-out'
        }
      }}
    >
      <Box display="flex" alignItems="center" mb={1}>
        <Avatar sx={{ bgcolor: config.bgColor, color: config.color, mr: 1.5 }}>
          {config.icon}
        </Avatar>
        <Typography variant="h6" color="text.secondary">
          {config.label}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontWeight: 'bold',
        color: config.color
      }}>
        {count}
      </Typography>
    </Paper>
  );
};

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const stats = useSelector(selectProjectStats);
  const recentProjects = useSelector(selectRecentProjects);
  const loading = false; // Add loading state from Redux if needed
  const [teamActivities] = React.useState<Array<{user: string; action: string; time: string}>>([]);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Welcome Card */}
      <Paper 
        sx={{ 
          p: 4, 
          mb: 3, 
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          borderRadius: 2,
          boxShadow: theme.shadows[4]
        }}
      >
        <Typography component="h1" variant="h5" fontWeight="bold" gutterBottom>
          Welcome to Product Development Process Manager
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: '800px' }}>
          Track and manage your product development process from ideation to delivery. 
          Get insights into your team's progress and keep everyone aligned on goals and deadlines.
        </Typography>
      </Paper>
      
      {/* Stats Grid */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3, width: '100%' }}>
        {/* Total Projects */}
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 12px)' } }}>
          <Paper sx={{ p: 3, height: '100%', borderLeft: `4px solid ${theme.palette.primary.main}` }}>
            <Box display="flex" alignItems="center" mb={1}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, mr: 1.5 }}>
                <WorkIcon />
              </Avatar>
              <Typography variant="h6" color="text.secondary">
                Total Projects
              </Typography>
            </Box>
            <Typography variant="h3" component="div" fontWeight="bold" color="primary">
              {stats.total}
            </Typography>
          </Paper>
        </Box>
        
        {/* Status Badges */}
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 12px)' } }}>
          <StatusBadge status="in-progress" count={stats.inProgress} />
        </Box>
        
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 12px)' } }}>
          <StatusBadge status="review" count={stats.inReview} />
        </Box>
        
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 12px)' } }}>
          <StatusBadge status="completed" count={stats.completed} />
        </Box>
      </Box>
      
      {/* Recent Projects & Team Activity */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ width: '100%' }}>
        {/* Recent Projects */}
        <Box sx={{ width: { xs: '100%', md: '66.6667%' } }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography component="h3" variant="h6">
                Recently Updated Projects
              </Typography>
              <TrendingUpIcon color="action" />
            </Box>
            
            {recentProjects && recentProjects.length > 0 ? (
              <List disablePadding>
                {recentProjects.map((project, index) => (
                  <React.Fragment key={project.id}>
                    <ListItemButton sx={{
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}>
                      <ListItemIcon>
                        <WorkIcon color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary={project.name}
                        secondary={`Updated ${formatDate(project.updatedAt)}`}
                        primaryTypographyProps={{
                          fontWeight: 500,
                          color: 'text.primary'
                        }}
                      />
                      <Chip 
                        label={project.status.replace('-', ' ')}
                        size="small"
                        variant="outlined"
                        sx={{
                          textTransform: 'capitalize',
                          borderColor: 
                            project.status === 'in-progress' ? 'primary.main' :
                            project.status === 'review' ? 'warning.main' :
                            project.status === 'completed' ? 'success.main' : 'default',
                          ml: 2
                        }}
                      />
                    </ListItemButton>
                    {index < recentProjects.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box textAlign="center" py={4}>
                <EventIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                <Typography color="text.secondary">
                  No recent projects to display
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
        
        {/* Team Activity */}
        <Box sx={{ width: { xs: '100%', md: '33.3333%' } }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" mb={3}>
              <TeamIcon color="action" sx={{ mr: 1 }} />
              <Typography component="h3" variant="h6">
                Team Activity
              </Typography>
            </Box>
            
            <Box textAlign="center" py={4}>
              <TeamIcon color="disabled" sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
              <Typography color="text.secondary" variant="body2">
                Team activity feed coming soon
              </Typography>
              <Typography color="text.secondary" variant="caption" display="block">
                Track updates, comments, and more
              </Typography>
            </Box>
            
            {/* Placeholder for team activity items */}
            {/* 
            <List>
              {teamActivities.map((activity, index) => (
                <React.Fragment key={index}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar>{activity.user.charAt(0)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.action}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {activity.user}
                          </Typography>
                          {` — ${activity.time} ago`}
                        </>
                      }
                    />
                  </ListItem>
                  {index < teamActivities.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
            */}
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
};

export default Dashboard;
