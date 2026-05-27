import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/store/authSlice';
import leadReducer from '../features/leads/store/leadSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    leads: leadReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
