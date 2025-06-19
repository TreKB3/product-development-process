import { configureStore } from '@reduxjs/toolkit';
import projectReducer from './slices/projectSlice';
import experienceMapReducer from './slices/experienceMapSlice';
import storyMapReducer from './slices/storyMapSlice';

export const store = configureStore({
  reducer: {
    projects: projectReducer,
    experienceMap: experienceMapReducer,
    storyMap: storyMapReducer,
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
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
