import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

// Types
export interface UserStory {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  points?: number;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
  epicId: string;
  order: number;
}

export interface Epic {
  id: string;
  title: string;
  description: string;
  color: string;
  order: number;
  releaseId: string;
}

export interface Release {
  id: string;
  name: string;
  description?: string;
  targetDate?: string;
  order: number;
}

export interface StoryMapState {
  releases: Release[];
  epics: Epic[];
  userStories: UserStory[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Initial state
const initialState: StoryMapState = {
  releases: [
    {
      id: 'release-1',
      name: 'Release 1.0',
      description: 'Initial release',
      order: 0,
    },
  ],
  epics: [
    {
      id: 'epic-1',
      title: 'User Authentication',
      description: 'Allow users to sign up, log in, and manage their accounts',
      color: '#4caf50',
      order: 0,
      releaseId: 'release-1',
    },
    {
      id: 'epic-2',
      title: 'Dashboard',
      description: 'Main dashboard with key metrics and recent activity',
      color: '#2196f3',
      order: 1,
      releaseId: 'release-1',
    },
  ],
  userStories: [
    {
      id: 'story-1',
      title: 'User can sign up with email and password',
      description: 'As a new user, I want to create an account using my email and password',
      status: 'todo',
      priority: 'high',
      points: 3,
      epicId: 'epic-1',
      order: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'story-2',
      title: 'User can log in',
      description: 'As a registered user, I want to log in to access my account',
      status: 'todo',
      priority: 'high',
      points: 2,
      epicId: 'epic-1',
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'story-3',
      title: 'View key metrics on dashboard',
      description: 'As a user, I want to see important metrics on my dashboard',
      status: 'todo',
      priority: 'medium',
      points: 5,
      epicId: 'epic-2',
      order: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  status: 'idle',
  error: null,
};

// Async thunks
export const fetchStoryMap = createAsyncThunk(
  'storyMap/fetchStoryMap',
  async (projectId: string, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      // In a real app, you would fetch from your API:
      // const response = await api.get(`/api/projects/${projectId}/story-map`);
      // return response.data;
      
      // For now, return the initial state
      return {
        releases: initialState.releases,
        epics: initialState.epics,
        userStories: initialState.userStories,
      };
    } catch (error) {
      return rejectWithValue('Failed to fetch story map');
    }
  }
);

// Slice
const storyMapSlice = createSlice({
  name: 'storyMap',
  initialState,
  reducers: {
    // Release actions
    addRelease: (state, action: PayloadAction<Omit<Release, 'id' | 'order'>>) => {
      const newRelease: Release = {
        id: `release-${uuidv4()}`,
        order: state.releases.length,
        ...action.payload,
      };
      state.releases.push(newRelease);
    },
    
    updateRelease: (state, action: PayloadAction<{id: string} & Partial<Release>>) => {
      const { id, ...updates } = action.payload;
      const existingRelease = state.releases.find(r => r.id === id);
      if (existingRelease) {
        Object.assign(existingRelease, { ...updates, updatedAt: new Date().toISOString() });
      }
    },
    
    removeRelease: (state, action: PayloadAction<string>) => {
      const releaseId = action.payload;
      state.releases = state.releases.filter(r => r.id !== releaseId);
      state.epics = state.epics.filter(e => e.releaseId !== releaseId);
      state.userStories = state.userStories.filter(us => 
        !state.epics.some(e => e.id === us.epicId && e.releaseId === releaseId)
      );
    },
    
    // Epic actions
    addEpic: (state, action: PayloadAction<Omit<Epic, 'id' | 'order'>>) => {
      const newEpic: Epic = {
        id: `epic-${uuidv4()}`,
        order: state.epics.filter(e => e.releaseId === action.payload.releaseId).length,
        ...action.payload,
      };
      state.epics.push(newEpic);
    },
    
    updateEpic: (state, action: PayloadAction<{id: string} & Partial<Epic>>) => {
      const { id, ...updates } = action.payload;
      const existingEpic = state.epics.find(e => e.id === id);
      if (existingEpic) {
        Object.assign(existingEpic, updates);
      }
    },
    
    removeEpic: (state, action: PayloadAction<string>) => {
      const epicId = action.payload;
      state.epics = state.epics.filter(e => e.id !== epicId);
      state.userStories = state.userStories.filter(us => us.epicId !== epicId);
    },
    
    // User Story actions
    addUserStory: (state, action: PayloadAction<Omit<UserStory, 'id' | 'createdAt' | 'updatedAt' | 'order'>>) => {
      const newUserStory: UserStory = {
        id: `story-${uuidv4()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        order: state.userStories.filter(us => us.epicId === action.payload.epicId).length,
        ...action.payload,
      };
      state.userStories.push(newUserStory);
    },
    
    updateUserStory: (state, action: PayloadAction<{id: string} & Partial<UserStory>>) => {
      const { id, ...updates } = action.payload;
      const existingStory = state.userStories.find(us => us.id === id);
      if (existingStory) {
        Object.assign(existingStory, { ...updates, updatedAt: new Date().toISOString() });
      }
    },
    
    removeUserStory: (state, action: PayloadAction<string>) => {
      state.userStories = state.userStories.filter(us => us.id !== action.payload);
    },
    
    // Reordering
    reorderReleases: (state, action: PayloadAction<{fromIndex: number; toIndex: number}>) => {
      const { fromIndex, toIndex } = action.payload;
      const [removed] = state.releases.splice(fromIndex, 1);
      state.releases.splice(toIndex, 0, removed);
      
      // Update order
      state.releases.forEach((release, index) => {
        release.order = index;
      });
    },
    
    reorderEpics: (state, action: PayloadAction<{releaseId: string; fromIndex: number; toIndex: number}>) => {
      const { releaseId, fromIndex, toIndex } = action.payload;
      const releaseEpics = state.epics.filter(e => e.releaseId === releaseId);
      const [removed] = releaseEpics.splice(fromIndex, 1);
      releaseEpics.splice(toIndex, 0, removed);
      
      // Update order
      releaseEpics.forEach((epic, index) => {
        const epicToUpdate = state.epics.find(e => e.id === epic.id);
        if (epicToUpdate) {
          epicToUpdate.order = index;
        }
      });
    },
    
    reorderUserStories: (state, action: PayloadAction<{epicId: string; fromIndex: number; toIndex: number}>) => {
      const { epicId, fromIndex, toIndex } = action.payload;
      const epicStories = state.userStories.filter(us => us.epicId === epicId);
      const [removed] = epicStories.splice(fromIndex, 1);
      epicStories.splice(toIndex, 0, removed);
      
      // Update order
      epicStories.forEach((story, index) => {
        const storyToUpdate = state.userStories.find(us => us.id === story.id);
        if (storyToUpdate) {
          storyToUpdate.order = index;
        }
      });
    },
    
    // Move story between epics
    moveUserStory: (
      state, 
      action: PayloadAction<{
        storyId: string;
        sourceEpicId: string;
        targetEpicId: string;
        targetIndex: number;
      }>
    ) => {
      const { storyId, sourceEpicId, targetEpicId, targetIndex } = action.payload;
      
      // Update the epic ID
      const story = state.userStories.find(us => us.id === storyId);
      if (story) {
        story.epicId = targetEpicId;
        
        // Reorder stories in target epic
        const targetEpicStories = state.userStories
          .filter(us => us.epicId === targetEpicId)
          .sort((a, b) => a.order - b.order);
          
        // Remove the story from the array to reinsert it
        const storyIndex = targetEpicStories.findIndex(us => us.id === storyId);
        if (storyIndex !== -1) {
          targetEpicStories.splice(storyIndex, 1);
        }
        
        // Insert at new position
        targetEpicStories.splice(targetIndex, 0, story);
        
        // Update orders
        targetEpicStories.forEach((us, index) => {
          us.order = index;
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStoryMap.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchStoryMap.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.releases = action.payload.releases;
        state.epics = action.payload.epics;
        state.userStories = action.payload.userStories;
      })
      .addCase(fetchStoryMap.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to load story map';
      });
  },
});

// Export actions
export const {
  addRelease,
  updateRelease,
  removeRelease,
  addEpic,
  updateEpic,
  removeEpic,
  addUserStory,
  updateUserStory,
  removeUserStory,
  reorderReleases,
  reorderEpics,
  reorderUserStories,
  moveUserStory,
} = storyMapSlice.actions;

// Selectors
export const selectReleases = (state: { storyMap: StoryMapState }) => 
  [...state.storyMap.releases].sort((a, b) => a.order - b.order);

export const selectEpics = (state: { storyMap: StoryMapState }) => 
  [...state.storyMap.epics].sort((a, b) => a.order - b.order);

export const selectUserStories = (state: { storyMap: StoryMapState }) => 
  [...state.storyMap.userStories].sort((a, b) => a.order - b.order);

export const selectEpicsByReleaseId = (state: { storyMap: StoryMapState }, releaseId: string) =>
  selectEpics(state).filter(epic => epic.releaseId === releaseId);

export const selectUserStoriesByEpicId = (state: { storyMap: StoryMapState }, epicId: string) =>
  selectUserStories(state).filter(story => story.epicId === epicId);

export const selectStoryMapStatus = (state: { storyMap: StoryMapState }) => state.storyMap.status;
export const selectStoryMapError = (state: { storyMap: StoryMapState }) => state.storyMap.error;

// Export the reducer
export default storyMapSlice.reducer;
