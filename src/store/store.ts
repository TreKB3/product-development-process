import { configureStore, isRejectedWithValue, Middleware, MiddlewareAPI } from '@reduxjs/toolkit';
import projectReducer from './slices/projectSlice';
import experienceMapReducer from './slices/experienceMapSlice';
import storyMapReducer from './slices/storyMapSlice';
import aiReducer from './slices/aiSlice';
import debugMiddleware from './debugMiddleware';

export const store = configureStore({
  reducer: {
    projects: projectReducer,
    experienceMap: experienceMapReducer,
    storyMap: storyMapReducer,
    ai: aiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'experienceMap/addItem', 
          'experienceMap/updateItem',
          'storyMap/addUserStory',
          'storyMap/updateUserStory',
        ],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['experienceMap.items', 'storyMap.userStories'],
      },
    })
    .concat(debugMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
