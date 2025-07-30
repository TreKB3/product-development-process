import { createSlice, PayloadAction, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { DocumentAnalysisResult } from '../../api/ai/documentService';
import { v4 as uuidv4 } from 'uuid';

export interface ExperienceMapPersona {
  id: string;
  name: string;
  description: string;
  goals: string[];
  painPoints: string[];
  phaseIds: string[]; // Array of phase IDs associated with this persona
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
  items: ExperienceMapItem[]; // Items within this phase
  personaId?: string; // Optional reference to persona this phase belongs to
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
      phaseIds: ['phase-1', 'phase-2', 'phase-3', 'phase-4', 'phase-5'],
      demographics: {
        age: '25-40',
        techSavviness: 'high'
      }
    }
  ],
  phases: [
    { id: 'phase-1', name: 'Discovery', description: 'Initial awareness and research', order: 1, color: '#4e79a7', items: [], personaId: 'persona-1' },
    { id: 'phase-2', name: 'Consideration', description: 'Evaluation of options', order: 2, color: '#f28e2b', items: [], personaId: 'persona-1' },
    { id: 'phase-3', name: 'Acquisition', description: 'Purchase or signup', order: 3, color: '#e15759', items: [], personaId: 'persona-1' },
    { id: 'phase-4', name: 'Onboarding', description: 'First-time setup', order: 4, color: '#76b7b2', items: [], personaId: 'persona-1' },
    { id: 'phase-5', name: 'Retention', description: 'Ongoing usage', order: 5, color: '#59a14f', items: [], personaId: 'persona-1' },
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
    console.group('fetchExperienceMap thunk');
    try {
      console.log('Fetching experience map for project:', projectId);
      
      // In a real app, this would be an API call
      // const response = await api.get(`/api/projects/${projectId}/experience-map`);
      // return response.data;
      
      // Mock data for now
      return new Promise(resolve => {
        setTimeout(() => {
          const mockData = {
            personas: [...initialState.personas],
            phases: [...initialState.phases],
            items: []
          };
          
          console.log('Returning mock data:', {
            personas: mockData.personas.length,
            phases: mockData.phases.length,
            items: mockData.items.length
          });
          
          resolve(mockData);
        }, 500);
      });
    } catch (error) {
      console.error('Error in fetchExperienceMap:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch experience map');
    } finally {
      console.groupEnd();
    }
  }
);

// Async thunk for processing AI analysis
export const processAIAnalysis = createAsyncThunk<DocumentAnalysisResult, DocumentAnalysisResult>(
  'experienceMap/processAIAnalysis',
  async (analysisResult, { rejectWithValue, getState }) => {
    try {
      console.group('processAIAnalysis Thunk');
      console.log('Processing AI Analysis:', analysisResult);
      
      // Validate the input
      if (!analysisResult) {
        throw new Error('No analysis result provided');
      }
      
      const { personas = [], phases = [], requirements = [] } = analysisResult;
      
      // Log the current state before updating
      const currentState = (getState() as RootState).experienceMap;
      console.log('Current state before update:', {
        currentPersonas: currentState.personas,
        currentPhases: currentState.phases
      });
      
      // Log the new data being added
      console.log('New data to be added:', {
        personas: Array.isArray(personas) ? personas : [],
        phases: Array.isArray(phases) ? phases : [],
        requirements: Array.isArray(requirements) ? requirements : []
      });
      
      // Return the validated result
      const result = {
        ...analysisResult,
        personas: Array.isArray(personas) ? personas : [],
        phases: Array.isArray(phases) ? phases : [],
        requirements: Array.isArray(requirements) ? requirements : []
      };
      
      console.log('Returning validated result:', result);
      return result;
    } catch (error) {
      console.error('Error in processAIAnalysis thunk:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to process AI analysis');
    } finally {
      console.groupEnd();
    }
  }
);

const experienceMapSlice = createSlice({
  name: 'experienceMap',
  initialState,
  reducers: {
    // Action to generate initial experience map items based on analysis
    generateInitialExperienceMap: (state, action: PayloadAction<{
      personaId: string;
      phaseId: string;
      title: string;
      description: string;
      emotion: ExperienceMapItem['emotion'];
    }>) => {
      const { personaId, phaseId, title, description, emotion } = action.payload;
      
      // Check if an item already exists for this persona and phase
      const existingItem = state.items.find(
        item => item.personaId === personaId && item.phaseId === phaseId
      );
      
      if (!existingItem) {
        const newItem: ExperienceMapItem = {
          id: uuidv4(),
          phaseId,
          personaId,
          title,
          description,
          emotion,
          order: state.items.filter(item => item.phaseId === phaseId).length,
          opportunities: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        state.items.push(newItem);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setCurrentMap: (state, action: PayloadAction<string | null>) => {
      state.currentMapId = action.payload;
    },
    addPersona: (state, action: PayloadAction<Omit<ExperienceMapPersona, 'id' | 'goals' | 'painPoints' | 'demographics' | 'phaseIds'>>) => {
      const newPersona: ExperienceMapPersona = {
        id: uuidv4(),
        goals: [],
        painPoints: [],
        demographics: {},
        phaseIds: [],
        ...action.payload
      };
      state.personas.push(newPersona);
    },
    updatePersona(state, action: PayloadAction<{id: string} & Partial<ExperienceMapPersona>>) {
      const index = state.personas.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.personas[index] = { 
          ...state.personas[index], 
          ...action.payload,
          phaseIds: action.payload.phaseIds ?? state.personas[index].phaseIds
        };
      }
    },
    updatePersonas(state, action: PayloadAction<ExperienceMapPersona[]>) {
      state.personas = action.payload;
    },
    updatePhases(state, action: PayloadAction<ExperienceMapPhase[]>) {
      state.phases = action.payload;
    },
    addPhase: (state, action: PayloadAction<Omit<ExperienceMapPhase, 'id' | 'items'>>) => {
      const newPhase: ExperienceMapPhase = {
        id: uuidv4(),
        items: [],
        ...action.payload
      };
      state.phases.push(newPhase);
    },
    updatePhase(state, action: PayloadAction<{id: string} & Partial<ExperienceMapPhase>>) {
      const index = state.phases.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.phases[index] = { 
          ...state.phases[index], 
          ...action.payload,
          items: action.payload.items ?? state.phases[index].items,
          personaId: action.payload.personaId ?? state.phases[index].personaId
        };
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
      .addCase(processAIAnalysis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processAIAnalysis.fulfilled, (state, action) => {
        console.group('processAIAnalysis Reducer');
        try {
          const { personas = [], phases = [] } = action.payload;
          
          // Process personas
          if (Array.isArray(personas)) {
            personas.forEach(persona => {
              if (persona?.name && !state.personas.some(p => p.name.toLowerCase() === persona.name.toLowerCase())) {
                state.personas.push({
                  id: uuidv4(),
                  name: persona.name,
                  description: persona.description || `Persona: ${persona.name}`,
                  goals: Array.isArray(persona.goals) ? persona.goals : [],
                  painPoints: Array.isArray(persona.painPoints) ? persona.painPoints : [],
                  phaseIds: [], // Initialize with empty phaseIds array
                  demographics: { 
                    techSavviness: 'medium' as const,
                    age: persona.demographics?.age,
                    occupation: persona.demographics?.occupation
                  }
                });
              }
            });
          }
          
          // Process phases
          if (Array.isArray(phases)) {
            phases.forEach((phase: { name: string; description?: string; order?: number; color?: string }, index) => {
              if (phase?.name && !state.phases.some(p => p.name.toLowerCase() === phase.name.toLowerCase())) {
                state.phases.push({
                  id: uuidv4(),
                  name: phase.name,
                  description: phase.description || `Phase: ${phase.name}`,
                  order: typeof phase.order === 'number' ? phase.order : state.phases.length + index,
                  color: phase.color || `hsl(${Math.floor(Math.random() * 360)}, 70%, 80%)`,
                  items: [], // Initialize with empty items array
                  personaId: undefined // Will be set when added to a persona
                });
              }
            });
          }
          
          state.loading = false;
          state.error = null;
        } catch (error) {
          console.error('Error in processAIAnalysis reducer:', error);
          state.loading = false;
          state.error = error instanceof Error ? error.message : 'Failed to process AI analysis';
        } finally {
          console.groupEnd();
        }
      })
      .addCase(processAIAnalysis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to process AI analysis';
        console.error('Error in processAIAnalysis:', action.error);
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
  [
    selectItems, 
    (_, phaseId: string, personaId?: string) => ({ phaseId, personaId })
  ],
  (items, { phaseId, personaId }) => {
    return items.filter(item => {
      const matchesPhase = phaseId ? item.phaseId === phaseId : true;
      const matchesPersona = personaId ? item.personaId === personaId : true;
      return matchesPhase && matchesPersona;
    });
  }
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
  setError,
  setCurrentMap,
  addPersona,
  updatePersona,
  updatePersonas,
  updatePhase,
  updatePhases,
  addItem,
  updateItem,
  deleteItem,
  reorderItems,
} = experienceMapSlice.actions;

export default experienceMapSlice.reducer;
