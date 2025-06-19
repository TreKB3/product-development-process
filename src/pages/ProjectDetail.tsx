import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  useTheme,
  alpha,
  Stack,
  Grid
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Map as MapIcon,
  Timeline as TimelineIcon,
  Code as CodeIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { AppDispatch, RootState } from '../store/store';
import { fetchProjectById } from '../store/slices/projectSlice';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3, flexGrow: 1 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `project-tab-${index}`,
    'aria-controls': `project-tabpanel-${index}`,
  };
}

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentProject, loading, error } = useSelector((state: RootState) => state.projects);
  const [tabValue, setTabValue] = React.useState(0);

  useEffect(() => {
    if (id) {
      dispatch(fetchProjectById(id));
    }
  }, [dispatch, id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
        <Button onClick={() => navigate('/projects')} sx={{ mt: 2 }}>
          Back to Projects
        </Button>
      </Paper>
    );
  }

  if (!currentProject) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Project not found</Typography>
        <Button onClick={() => navigate('/projects')} sx={{ mt: 2 }}>
          Back to Projects
        </Button>
      </Paper>
    );
  }

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          {currentProject.name}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {currentProject.description}
        </Typography>
        <Box display="flex" gap={2} mt={2}>
          <Typography variant="body2" color="text.secondary">
            Status: {currentProject.status}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Created: {new Date(currentProject.createdAt).toLocaleDateString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Last Updated: {new Date(currentProject.updatedAt).toLocaleDateString()}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="project detail tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<DescriptionIcon />} label="Overview" {...a11yProps(0)} />
            <Tab icon={<MapIcon />} label="Experience Map" {...a11yProps(1)} />
            <Tab icon={<TimelineIcon />} label="Story Map" {...a11yProps(2)} />
            <Tab icon={<CodeIcon />} label="Technical Specs" {...a11yProps(3)} />
            <Tab icon={<AssessmentIcon />} label="Metrics" {...a11yProps(4)} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <Box sx={{ width: { xs: '100%', md: '50%' } }}>
              <Paper elevation={3} sx={{ height: '100%' }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Project Details
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {currentProject.description || 'No additional details provided.'}
                    </Typography>
                    <Button 
                      variant="outlined" 
                      onClick={() => setTabValue(1)}
                      startIcon={<MapIcon />}
                      sx={{ mr: 2, mb: 2 }}
                    >
                      Go to Experience Map
                    </Button>
                    <Button 
                      variant="outlined" 
                      onClick={() => setTabValue(2)}
                      startIcon={<TimelineIcon />}
                    >
                      Go to Story Map
                    </Button>
                  </CardContent>
                </Card>
              </Paper>
            </Box>
            <Box sx={{ width: { xs: '100%', md: '50%' } }} component={Paper}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Team Members
                  </Typography>
                  {currentProject.teamMembers && currentProject.teamMembers.length > 0 ? (
                    <ul style={{ paddingLeft: '20px' }}>
                      {currentProject.teamMembers.map((member) => (
                        <li key={member.id}>
                          <Typography>
                            <strong>{member.name}</strong> - {member.role}
                            <br />
                            <Typography variant="body2" color="text.secondary">
                              {member.email}
                            </Typography>
                          </Typography>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <Typography>No team members assigned.</Typography>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Stack>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Paper sx={{ p: 3, textAlign: 'center', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Experience Map
              </Typography>
              <Typography color="text.secondary" paragraph>
                Experience map content will be displayed here.
              </Typography>
              <Button variant="contained">
                Edit Experience Map
              </Button>
            </Box>
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Paper sx={{ p: 3, textAlign: 'center', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Story Map
              </Typography>
              <Typography color="text.secondary" paragraph>
                Story map content will be displayed here.
              </Typography>
              <Button variant="contained">
                Edit Story Map
              </Button>
            </Box>
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Paper sx={{ p: 3, textAlign: 'center', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h6">
              Technical Specifications will be displayed here
            </Typography>
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Paper sx={{ p: 3, textAlign: 'center', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h6">
              Project Metrics will be displayed here
            </Typography>
          </Paper>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default ProjectDetail;
