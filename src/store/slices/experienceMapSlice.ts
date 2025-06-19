import { createSlice, PayloadAction, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

export interface ExperienceMapPersona {
  id: string;
  name: string;
  description: string;
  goals: string[];
  painPoints: string[];
  demographics: {
    age?: string;
    occupation?: string;
    techSavviness?: 'low' | 'medium' | 'high';
  };
}

export interface ExperienceMapPhase {
  id: string;
  name: string;
  description: string;
  order: number;
  color?: string;
}

export interface ExperienceMapItem {
  id: string;
  phaseId: string;
  personaId: string;
  title: string;
  description: string;
  emotion: 'happy' | 'neutral' | 'frustrated' | 'angry' | 'delighted';
  order: number;
  evidence?: {
    type: 'research' | 'assumption' | 'data';
    content: string;
    source?: string;
  }[];
  opportunities: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ExperienceMapState {
  personas: ExperienceMapPersona[];
  phases: ExperienceMapPhase[];
  items: ExperienceMapItem[];
  currentMapId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: ExperienceMapState = {
  personas: [
    {
      id: 'persona-1',
      name: 'Primary User',
      description: 'Main target user for this experience',
      goals: ['Complete tasks efficiently', 'Have a seamless experience'],
      painPoints: ['Frustration with complex interfaces', 'Time constraints'],
      demographics: {
        age: '25-40',
        techSavviness: 'high'
      }
    }
  ],
  phases: [
    { id: 'phase-1', name: 'Discovery', description: 'Initial awareness and research', order: 1, color: '#4e79a7' },
    { id: 'phase-2', name: 'Consideration', description: 'Evaluation of options', order: 2, color: '#f28e2b' },
    { id: 'phase-3', name: 'Acquisition', description: 'Purchase or signup', order: 3, color: '#e15759' },
    { id: 'phase-4', name: 'Onboarding', description: 'First-time setup', order: 4, color: '#76b7b2' },
    { id: 'phase-5', name: 'Retention', description: 'Ongoing usage', order: 5, color: '#59a14f' },
  ],
  items: [],
  currentMapId: null,
  loading: false,
  error: null
};

// Async thunks
export const fetchExperienceMap = createAsyncThunk<
  { personas: ExperienceMapPersona[], phases: ExperienceMapPhase[], items: ExperienceMapItem[] },
  string,
  { state: RootState }
>(
  'experienceMap/fetch',
  async (projectId, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // const response = await api.get(`/api/projects/${projectId}/experience-map`);
      // return response.data;
      
      // Mock data for now
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            personas: [...initialState.personas],
            phases: [...initialState.phases],
            items: []
          });
        }, 500);
      });
    } catch (error) {
      return rejectWithValue('Failed to fetch experience map');
    }
  }
);

const experienceMapSlice = createSlice({
  name: 'experienceMap',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setCurrentMap: (state, action: PayloadAction<string | null>) => {
      state.currentMapId = action.payload;
    },
    addPersona: (state, action: PayloadAction<Omit<ExperienceMapPersona, 'id' | 'goals' | 'painPoints' | 'demographics'>>) => {
      const newPersona: ExperienceMapPersona = {
        ...action.payload,
        id: `persona-${Date.now()}`,
        goals: [],
        painPoints: [],
        demographics: {}
      };
      state.personas.push(newPersona);
    },
    updatePersona: (state, action: PayloadAction<{id: string} & Partial<ExperienceMapPersona>>) => {
      const index = state.personas.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.personas[index] = { ...state.personas[index], ...action.payload };
      }
    },
    addPhase: (state, action: PayloadAction<Omit<ExperienceMapPhase, 'id'>>) => {
      const newPhase: ExperienceMapPhase = {
        ...action.payload,
        id: `phase-${Date.now()}`,
      };
      state.phases.push(newPhase);
    },
    updatePhase: (state, action: PayloadAction<{id: string} & Partial<ExperienceMapPhase>>) => {
      const index = state.phases.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.phases[index] = { ...state.phases[index], ...action.payload };
      }
    },
    addItem: (state, action: PayloadAction<Omit<ExperienceMapItem, 'id' | 'createdAt' | 'updatedAt' | 'evidence' | 'opportunities'>>) => {
      const newItem: ExperienceMapItem = {
        ...action.payload,
        id: `item-${Date.now()}`,
        evidence: [],
        opportunities: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      state.items.push(newItem);
    },
    updateItem: (state, action: PayloadAction<{id: string} & Partial<ExperienceMapItem>>) => {
      const index = state.items.findIndex(i => i.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { 
          ...state.items[index], 
          ...action.payload,
          updatedAt: new Date().toISOString()
        };
      }
    },
    deleteItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    reorderItems: (state, action: PayloadAction<{itemId: string, phaseId: string, newOrder: number}>) => {
      const { itemId, phaseId, newOrder } = action.payload;
      const item = state.items.find(i => i.id === itemId);
      
      if (item) {
        // Update the order of all items in the same phase
        state.items = state.items.map(i => {
          if (i.phaseId === phaseId) {
            if (i.id === itemId) {
              return { ...i, order: newOrder };
            }
            // Adjust order of other items if needed
            if (i.order >= newOrder) {
              return { ...i, order: i.order + 1 };
            }
          }
          return i;
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExperienceMap.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExperienceMap.fulfilled, (state, action) => {
        state.loading = false;
        state.personas = action.payload.personas;
        state.phases = action.payload.phases;
        state.items = action.payload.items;
      })
      .addCase(fetchExperienceMap.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Selectors
export const selectExperienceMapState = (state: RootState) => state.experienceMap;

export const selectPersonas = createSelector(
  [selectExperienceMapState],
  (state) => state.personas
);

export const selectPhases = createSelector(
  [selectExperienceMapState],
  (state) => [...state.phases].sort((a, b) => a.order - b.order)
);

export const selectItems = createSelector(
  [selectExperienceMapState],
  (state) => [...state.items].sort((a, b) => a.order - b.order)
);

export const selectItemsByPhase = createSelector(
  [selectItems, (_, phaseId: string) => phaseId],
  (items, phaseId) => items.filter(item => item.phaseId === phaseId)
);

export const selectPersonaById = createSelector(
  [selectPersonas, (_, personaId: string) => personaId],
  (personas, personaId) => personas.find(p => p.id === personaId)
);

export const selectPhaseById = createSelector(
  [selectPhases, (_, phaseId: string) => phaseId],
  (phases, phaseId) => phases.find(p => p.id === phaseId)
);

// Export actions
export const {
  setLoading,
  setError,
  setCurrentMap,
  addPersona,
  updatePersona,
  addPhase,
  updatePhase,
  addItem,
  updateItem,
  deleteItem,
  reorderItems,
} = experienceMapSlice.actions;

export default experienceMapSlice.reducer;
