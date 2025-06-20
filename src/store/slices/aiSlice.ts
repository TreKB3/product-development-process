import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  DocumentAnalysisResult, 
  analyzeDocuments, 
  mockAnalyzeDocuments,
  ProgressCallback,
  UploadProgressEvent 
} from '../../api/ai/documentService';

export interface AIState {
  isProcessing: boolean;
  progress: number;
  error: string | null;
  result: DocumentAnalysisResult | null;
  uploadedFiles: File[];
  currentFile: string | null;
  isMock: boolean;
}

const initialState: AIState = {
  isProcessing: false,
  progress: 0,
  error: null,
  result: null,
  uploadedFiles: [],
  currentFile: null,
  isMock: false, // Disable mock mode by default when API key is present
};

// Create an AbortController instance to handle cancellation
let abortController: AbortController | null = null;

export const processDocuments = createAsyncThunk<
  DocumentAnalysisResult,
  { files: File[]; useMock?: boolean },
  { rejectValue: string; state: { ai: AIState } }
>(
  'ai/processDocuments',
  async ({ files, useMock }, { rejectWithValue, dispatch, getState }) => {
    // Cancel any existing requests
    if (abortController) {
      abortController.abort();
    }
    
    abortController = new AbortController();
    const signal = abortController.signal;
    
    try {
      const onProgress: ProgressCallback = (progressEvent: UploadProgressEvent) => {
        // Update progress in the store
        dispatch(setProgress({
          progress: progressEvent.progress,
          currentFile: progressEvent.file,
        }));
      };
      
      // Use mock in development mode or when explicitly requested
      const shouldUseMock = useMock || getState().ai.isMock;
      
      const result = shouldUseMock
        ? await mockAnalyzeDocuments(onProgress)
        : await analyzeDocuments(files, onProgress, signal);
      
      return result;
    } catch (error) {
      // Don't treat aborted requests as errors
      if (signal.aborted) {
        throw new Error('Document processing was cancelled');
      }
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to process documents';
        
      return rejectWithValue(errorMessage);
    } finally {
      abortController = null;
    }
  }
);

export const cancelProcessing = createAsyncThunk(
  'ai/cancelProcessing',
  async (_, { dispatch }) => {
    if (abortController) {
      abortController.abort();
      abortController = null;
      dispatch(clearAIState());
      return true;
    }
    return false;
  }
);

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    setUploadedFiles: (state, action: PayloadAction<File[]>) => {
      state.uploadedFiles = action.payload;
    },
    setProgress: (state, action: PayloadAction<{ progress: number; currentFile?: string }>) => {
      state.progress = action.payload.progress;
      if (action.payload.currentFile !== undefined) {
        state.currentFile = action.payload.currentFile;
      }
    },
    setMockMode: (state, action: PayloadAction<boolean>) => {
      state.isMock = action.payload;
    },
    clearAIState: (state) => {
      state.isProcessing = false;
      state.progress = 0;
      state.error = null;
      state.result = null;
      state.currentFile = null;
      state.uploadedFiles = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(processDocuments.pending, (state) => {
        state.isProcessing = true;
        state.progress = 0;
        state.error = null;
        state.result = null;
        state.currentFile = 'Starting upload...';
      })
      .addCase(processDocuments.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.progress = 100;
        state.result = action.payload;
        state.currentFile = 'Analysis complete';
      })
      .addCase(processDocuments.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload || 'An unknown error occurred';
        state.progress = 0;
        state.currentFile = null;
      })
      .addCase(cancelProcessing.fulfilled, (state) => {
        state.isProcessing = false;
        state.progress = 0;
        state.currentFile = null;
      });
  },
});

export const { 
  setUploadedFiles, 
  clearAIState, 
  setProgress, 
  setMockMode 
} = aiSlice.actions;

export default aiSlice.reducer;
