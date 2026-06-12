import { configureStore, Middleware, isRejectedWithValue } from '@reduxjs/toolkit';
import authReducer, { logout } from '../features/auth/store/authSlice';
import leadReducer from '../features/leads/store/leadSlice';
import loanFormReducer from '../features/new-loan/store/newLoanFormSlice';
import loanDashboardReducer from '../features/loans/store/loanDashboardSlice';
import newLeadReducer from '../features/new-lead/store/newLeadSlice';

const AUTH_ACTIONS = ['auth/login/fulfilled', 'auth/logout', 'auth/hydrate'];

const storageMiddleware: Middleware = (store) => (next) => (action: any) => {
  const result = next(action);
  if (typeof window !== 'undefined') {
    // Handle Auth Persistence
    if (AUTH_ACTIONS.includes(action.type)) {
      const user = store.getState().auth.user;
      if (user) {
        localStorage.setItem('auth_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('auth_user');
      }
    }
    
    // Handle Loan Form Persistence
    if (action.type.startsWith('loanForm/')) {
      const loanState = store.getState().loanForm;
      localStorage.setItem('loan_form_state', JSON.stringify(loanState));
    }
  }
  return result;
};

const unauthenticatedMiddleware: Middleware = (api) => (next) => (action: any) => {
  if (isRejectedWithValue(action) || action.type.endsWith('/rejected')) {
    if (
      action.payload === 'UNAUTHORIZED' ||
      action.payload?.message === 'UNAUTHORIZED' ||
      action.error?.message === 'UNAUTHORIZED'
    ) {
      api.dispatch(logout());
      if (typeof window !== 'undefined') {
        // Clear HttpOnly cookie on the server before redirecting
        fetch('/api/auth/logout', { method: 'POST' })
          .catch(() => {}) // Ignore errors if server is unreachable
          .finally(() => {
            window.location.href = '/login';
          });
      }
    }
  }
  return next(action);
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    leads: leadReducer,
    newLead: newLeadReducer,
    loanForm: loanFormReducer,
    loanDashboard: loanDashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(storageMiddleware, unauthenticatedMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
