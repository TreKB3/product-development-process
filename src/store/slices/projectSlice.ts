import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Types
export type ProjectStatus = 'planning' | 'draft' | 'in-progress' | 'review' | 'completed';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
}

export interface Velocity {
  android: number[];
  ios: number[];
  web: number[];
}

export interface ProjectMetadata {
  aiGenerated?: boolean;
  sourceDocuments?: string[];
  analysis?: {
    phases?: Array<{ name: string; description: string }>;
    personas?: Array<{ name: string; description: string; goals: string[]; painPoints: string[] }>;
    requirements?: Array<{ id: string; description: string }>;
  };
  [key: string]: any; // For additional metadata
}

export interface Phase {
  id: string;
  name: string;
  description: string;
  order: number;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  goals: string[];
  painPoints: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  teamMembers: TeamMember[];
  velocity?: Velocity;
  metadata?: ProjectMetadata;
  // AI-analyzed fields
  phases: Phase[];
  personas: Persona[];
  requirements: Array<{ id: string; description: string }>;
  // Additional fields
  businessProblem?: string;
  targetAudience?: string;
  successMetrics: string[];
  assumptions: {
    id: string;
    description: string;
    risk: 'low' | 'medium' | 'high';
    validationStatus: 'not-validated' | 'in-progress' | 'validated' | 'invalidated';
  }[];
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  filter: {
    status: ProjectStatus | 'all';
    search: string;
  };
  lastUpdated: number | null;
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
  filter: {
    status: 'all',
    search: '',
  },
  lastUpdated: null,
};

// Mock API calls
const fetchProjects = createAsyncThunk<Project[]>(
  'projects/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      const mockProjects: Project[] = [
        {
          id: '1',
          name: 'E-commerce Platform',
          description: 'Next generation e-commerce platform with AI recommendations',
          status: 'in-progress',
          createdAt: '2023-01-15T00:00:00Z',
          updatedAt: new Date().toISOString(),
          teamMembers: [
            { id: '1', name: 'John Doe', role: 'Product Manager', email: 'john@example.com' },
            { id: '2', name: 'Jane Smith', role: 'Lead Developer', email: 'jane@example.com' },
            { id: '3', name: 'Alex Johnson', role: 'UX Designer', email: 'alex@example.com' },
          ],
          phases: [
            { id: 'phase-1', name: 'Discovery', description: 'Initial research and requirements gathering', order: 1 },
            { id: 'phase-2', name: 'Design', description: 'UI/UX and system design', order: 2 },
            { id: 'phase-3', name: 'Development', description: 'Implementation and coding', order: 3 },
          ],
          personas: [
            {
              id: 'persona-1',
              name: 'Mobile Shopper',
              description: 'Tech-savvy shopper who primarily uses mobile devices',
              goals: ['Quick checkout', 'Easy navigation', 'Secure payments'],
              painPoints: ['Slow loading times', 'Complicated checkout', 'Limited payment options']
            }
          ],
          requirements: [
            { id: 'req-1', description: 'Responsive mobile design' },
            { id: 'req-2', description: 'One-click checkout' },
            { id: 'req-3', description: 'Multiple payment options' },
            { id: 'req-4', description: 'Product recommendations' },
            { id: 'req-5', description: 'User reviews and ratings' }
          ],
          businessProblem: 'Low conversion rates on mobile devices',
          targetAudience: 'Mobile-first shoppers aged 25-40',
          successMetrics: ['Increase mobile conversion by 20%', 'Reduce cart abandonment by 15%'],
          assumptions: [
            {
              id: 'a1',
              description: 'Users will adopt the new mobile-first approach',
              risk: 'high',
              validationStatus: 'not-validated'
            },
            {
              id: 'a2',
              description: 'Users don\'t use financial planning due to complex UI',
              risk: 'medium',
              validationStatus: 'in-progress'
            }
          ],
          velocity: {
            android: [5, 8, 7, 10],
            ios: [3, 5, 6, 7],
            web: [8, 10, 9, 11],
          },
        },
        {
          id: '2',
          name: 'Mobile Banking App',
          description: 'Redesign of the mobile banking application',
          status: 'review',
          createdAt: '2023-02-10T00:00:00Z',
          updatedAt: '2023-03-15T00:00:00Z',
          teamMembers: [
            { id: '4', name: 'Sarah Williams', role: 'Product Owner', email: 'sarah@example.com' },
            { id: '5', name: 'Mike Brown', role: 'iOS Developer', email: 'mike@example.com' },
            { id: '6', name: 'Emma Davis', role: 'Android Developer', email: 'emma@example.com' },
          ],
          phases: [
            { id: 'phase-1', name: 'Research', description: 'User research and market analysis', order: 1 },
            { id: 'phase-2', name: 'Design', description: 'UI/UX design and prototyping', order: 2 },
            { id: 'phase-3', name: 'Development', description: 'App development and testing', order: 3 },
          ],
          personas: [
            {
              id: 'persona-4',
              name: 'Busy Professional',
              description: 'Uses the app to manage finances on-the-go',
              goals: ['Easy access to account information', 'Quick transactions', 'Secure login'],
              painPoints: ['Slow login', 'Difficulty navigating the app', 'Limited transaction options']
            }
          ],
          requirements: [
            { id: 'req-6', description: 'Streamlined login process' },
            { id: 'req-7', description: 'Improved navigation and information architecture' },
            { id: 'req-8', description: 'Enhanced transaction capabilities' },
            { id: 'req-9', description: 'Personalized financial insights' },
            { id: 'req-10', description: 'Integration with wearable devices' }
          ],
          businessProblem: 'Low user engagement with financial planning features',
          targetAudience: 'Young professionals aged 25-35',
          successMetrics: ['Increase feature usage by 30%', 'Improve NPS score by 15 points'],
          assumptions: [
            {
              id: 'a3',
              description: 'Users want personalized financial recommendations',
              risk: 'medium',
              validationStatus: 'not-validated'
            }
          ]
        },
        {
          id: '3',
          name: 'Health & Fitness Tracker',
          description: 'Comprehensive health and fitness tracking application',
          status: 'draft',
          createdAt: '2023-03-20T00:00:00Z',
          updatedAt: '2023-03-25T00:00:00Z',
          teamMembers: [
            { id: '7', name: 'David Wilson', role: 'Product Manager', email: 'david@example.com' },
            { id: '8', name: 'Lisa Chen', role: 'UX Designer', email: 'lisa@example.com' },
          ],
          phases: [
            { id: 'phase-1', name: 'Research', description: 'User research and market analysis', order: 1 },
            { id: 'phase-2', name: 'Design', description: 'UI/UX design and prototyping', order: 2 },
            { id: 'phase-3', name: 'Development', description: 'App development and testing', order: 3 },
          ],
          personas: [
            {
              id: 'persona-5',
              name: 'Fitness Enthusiast',
              description: 'Regularly exercises and tracks fitness goals',
              goals: ['Track progress', 'Set goals', 'Stay motivated'],
              painPoints: ['Limited tracking features', 'No personalized recommendations', 'No social sharing']
            },
            {
              id: 'persona-6',
              name: 'Casual User',
              description: 'Occasionally uses the app to track basic health metrics',
              goals: ['Easy to use', 'Basic tracking features', 'No overwhelming data'],
              painPoints: ['Too much data', 'Difficult to navigate', 'No clear value']
            }
          ],
          requirements: [
            { id: 'req-11', description: 'Real-time activity tracking' },
            { id: 'req-12', description: 'Integration with wearables' },
            { id: 'req-13', description: 'Nutrition tracking' },
            { id: 'req-14', description: 'Personalized workout plans' },
            { id: 'req-15', description: 'Progress analytics' }
          ],
          businessProblem: 'Users struggle to maintain fitness routines',
          targetAudience: 'Health-conscious individuals aged 20-45',
          successMetrics: ['Increase monthly active users by 25%', 'Improve 30-day retention by 20%'],
          assumptions: [
            {
              id: 'a4',
              description: 'Personalized workout plans will increase engagement',
              risk: 'low',
              validationStatus: 'not-validated'
            }
          ]
        },
        {
          id: '4',
          name: 'Performance Optimization',
          description: 'Improve application performance and reduce load times',
          status: 'in-progress',
          createdAt: '2023-04-05T00:00:00Z',
          updatedAt: new Date().toISOString(),
          teamMembers: [
            { id: '1', name: 'John Doe', role: 'Product Manager', email: 'john@example.com' },
            { id: '2', name: 'Jane Smith', role: 'Lead Developer', email: 'jane@example.com' },
            { id: '6', name: 'Robert Johnson', role: 'DevOps Engineer', email: 'robert@example.com' },
          ],
          phases: [
            { id: 'phase-1', name: 'Audit', description: 'Performance audit and bottleneck identification', order: 1 },
            { id: 'phase-2', name: 'Optimization', description: 'Implement performance improvements', order: 2 },
            { id: 'phase-3', name: 'Testing', description: 'Performance testing and validation', order: 3 },
            { id: 'phase-4', name: 'Monitoring', description: 'Monitor performance in production', order: 4 },
          ],
          personas: [
            {
              id: 'persona-7',
              name: 'Impatient User',
              description: 'Leaves if pages don\'t load quickly',
              goals: ['Fast page loads', 'Smooth interactions', 'No lag'],
              painPoints: ['Slow performance', 'Unresponsive UI', 'Long wait times']
            },
            {
              id: 'persona-8',
              name: 'Power User',
              description: 'Uses the app intensively every day',
              goals: ['Efficiency', 'Reliability', 'Consistent performance'],
              painPoints: ['Performance degradation', 'Timeouts', 'Inefficient workflows']
            }
          ],
          requirements: [
            { id: 'req-16', description: 'Performance monitoring' },
            { id: 'req-17', description: 'Code optimization' },
            { id: 'req-18', description: 'Caching implementation' },
            { id: 'req-19', description: 'Database query optimization' },
            { id: 'req-20', description: 'Frontend bundle optimization' }
          ],
          velocity: {
            android: [12, 14, 15, 16, 17],
            ios: [10, 11, 12, 13, 14],
            web: [8, 9, 10, 11, 12],
          },
          businessProblem: 'Slow application performance affecting user retention',
          targetAudience: 'All application users',
          successMetrics: ['Reduce page load time by 50%', 'Improve API response time by 70%'],
          assumptions: [
            {
              id: 'a5',
              description: 'Users will notice improved performance',
              risk: 'medium',
              validationStatus: 'not-validated'
            }
          ]
        }
      ];
      return mockProjects;
    } catch (error) {
      return rejectWithValue('Failed to fetch projects');
    }
  }
);

const fetchProjectById = createAsyncThunk<Project, string>(
  'projects/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      const mockProject: Project = {
        id: '4',
        name: 'Performance Optimization',
        description: 'Improve application performance and reduce load times',
        status: 'in-progress',
        createdAt: '2023-04-05T00:00:00Z',
        updatedAt: new Date().toISOString(),
        teamMembers: [
          { id: '1', name: 'John Doe', role: 'Product Manager', email: 'john@example.com' },
          { id: '2', name: 'Jane Smith', role: 'Lead Developer', email: 'jane@example.com' },
          { id: '6', name: 'Robert Johnson', role: 'DevOps Engineer', email: 'robert@example.com' },
        ],
        phases: [
          { id: 'phase-1', name: 'Audit', description: 'Performance audit and bottleneck identification', order: 1 },
          { id: 'phase-2', name: 'Optimization', description: 'Implement performance improvements', order: 2 },
          { id: 'phase-3', name: 'Testing', description: 'Performance testing and validation', order: 3 },
          { id: 'phase-4', name: 'Monitoring', description: 'Monitor performance in production', order: 4 },
        ],
        personas: [
          {
            id: 'persona-7',
            name: 'Impatient User',
            description: 'Leaves if pages don\'t load quickly',
            goals: ['Fast page loads', 'Smooth interactions', 'No lag'],
            painPoints: ['Slow performance', 'Unresponsive UI', 'Long wait times']
          },
          {
            id: 'persona-8',
            name: 'Power User',
            description: 'Uses the app intensively every day',
            goals: ['Efficiency', 'Reliability', 'Consistent performance'],
            painPoints: ['Performance degradation', 'Timeouts', 'Inefficient workflows']
          }
        ],
        requirements: [
          { id: 'req-31', description: 'Optimize database queries' },
          { id: 'req-32', description: 'Implement caching strategy' },
          { id: 'req-33', description: 'Reduce bundle size' },
          { id: 'req-34', description: 'Lazy load non-critical assets' },
          { id: 'req-35', description: 'Optimize images and media' },
          { id: 'req-36', description: 'Implement CDN' }
        ],
        velocity: {
          android: [12, 14, 15, 16, 17],
          ios: [10, 11, 12, 13, 14],
          web: [8, 9, 10, 11, 12],
        },
        businessProblem: 'Slow application performance affecting user retention',
        targetAudience: 'All application users',
        successMetrics: ['Reduce page load time by 50%', 'Improve API response time by 70%'],
        assumptions: [
          {
            id: '1',
            description: 'Users want AI-powered product recommendations',
            risk: 'medium',
            validationStatus: 'in-progress',
          },
        ],
      };
      return mockProject;
    } catch (error) {
      return rejectWithValue('Failed to fetch project');
    }
  }
);

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload;
      state.lastUpdated = Date.now();
    },
    setCurrentProject: (state, action: PayloadAction<Project | null>) => {
      state.currentProject = action.payload;
    },
    addProject: (state, action: PayloadAction<Project>) => {
      state.projects.push({
        ...action.payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      state.lastUpdated = Date.now();
    },
    updateProject: (state, action: PayloadAction<Project>) => {
      const index = state.projects.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = {
          ...state.projects[index],
          ...action.payload,
          updatedAt: new Date().toISOString()
        };
        state.lastUpdated = Date.now();
      }
    },
    deleteProject: (state, action: PayloadAction<string>) => {
      const index = state.projects.findIndex(p => p.id === action.payload);
      if (index !== -1) {
        state.projects.splice(index, 1);
        state.lastUpdated = Date.now();
      }
    },
    setFilterStatus: (state, action: PayloadAction<ProjectStatus | 'all'>) => {
      state.filter.status = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.filter.search = action.payload.toLowerCase();
    },
    resetFilters: (state) => {
      state.filter = {
        status: 'all',
        search: ''
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
        state.lastUpdated = Date.now();
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProjectById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = action.payload;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  setLoading,
  setError,
  setProjects,
  setCurrentProject,
  addProject,
  updateProject,
  deleteProject,
  setFilterStatus,
  setSearchTerm,
  resetFilters,
} = projectSlice.actions;

// Export async thunks
export { fetchProjects, fetchProjectById };

// Selectors
export const selectProjectsState = (state: RootState) => state.projects;

export const selectAllProjects = createSelector(
  [selectProjectsState],
  (projectsState: { projects: Project[] }) => projectsState.projects
);

export const selectProjectById = (projectId: string) => 
  createSelector(
    [selectAllProjects],
    (projects: Project[]) => projects.find(project => project.id === projectId)
  );

export const selectProjectTeamMembers = (projectId: string) =>
  createSelector(
    [selectProjectById(projectId)],
    (project: Project | undefined) => project?.teamMembers || []
  );

export const selectProjectAssumptions = (projectId: string) =>
  createSelector(
    [selectProjectById(projectId)],
    (project: Project | undefined) => project?.assumptions || []
  );

export const selectProjectByStatus = (status: ProjectStatus | 'all') =>
  createSelector(
    [selectAllProjects],
    (projects: Project[]) => projects.filter(project => status === 'all' || project.status === status)
  );

export const selectFilteredProjects = createSelector(
  [selectProjectsState],
  (state: { projects: Project[], filter: { status: ProjectStatus | 'all', search: string } }) => {
    const { projects, filter } = state;
    const { status, search } = filter;

    return projects.filter((project: Project) => {
      const matchesStatus = status === 'all' || project.status === status;
      
      if (!search) return matchesStatus;
      
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        project.name.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower) ||
        (project.teamMembers || []).some(member => 
          member.name.toLowerCase().includes(searchLower) ||
          member.role.toLowerCase().includes(searchLower)
        ) ||
        (project.businessProblem?.toLowerCase().includes(searchLower) || false) ||
        (project.targetAudience?.toLowerCase().includes(searchLower) || false);
      
      return matchesStatus && matchesSearch;
    });
  }
);

export const selectProjectStats = createSelector(
  [selectAllProjects],
  (projects: Project[]) => ({
    total: projects.length,
    inProgress: projects.filter((p: Project) => p.status === 'in-progress').length,
    inReview: projects.filter((p: Project) => p.status === 'review').length,
    completed: projects.filter((p: Project) => p.status === 'completed').length,
    draft: projects.filter((p: Project) => p.status === 'draft').length,
  })
);

export const selectRecentProjects = createSelector(
  [selectAllProjects],
  (projects: Project[]) => {
    return [...projects]
      .sort((a: Project, b: Project) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }
);

export default projectSlice.reducer;
