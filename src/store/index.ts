import { configureStore, Middleware } from '@reduxjs/toolkit';
import authReducer from '../features/auth/store/authSlice';
import leadReducer from '../features/leads/store/leadSlice';
import loanFormReducer from '../features/loans/store/loanFormSlice';

const AUTH_ACTIONS = ['auth/login/fulfilled', 'auth/logout', 'auth/hydrate'];

const authStorageMiddleware: Middleware = (store) => (next) => (action: any) => {
  const result = next(action);
  if (typeof window !== 'undefined' && AUTH_ACTIONS.includes(action.type)) {
    const user = store.getState().auth.user;
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth_user');
    }
  }
  return result;
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    leads: leadReducer,
    loanForm: loanFormReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authStorageMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
