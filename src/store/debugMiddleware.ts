import { Middleware } from '@reduxjs/toolkit';

const debugMiddleware: Middleware = (store) => (next) => (action) => {
  const actionWithType = action as { type: string; payload?: any };
  
  console.groupCollapsed(`Dispatching action: ${actionWithType.type}`);
  console.log('Action payload:', actionWithType.payload);
  
  const result = next(action);
  
  console.log('Next state:', store.getState());
  console.groupEnd();
  
  return result;
};

export default debugMiddleware;
