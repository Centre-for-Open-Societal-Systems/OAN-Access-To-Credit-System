import { configureStore, Middleware, isRejectedWithValue, UnknownAction } from '@reduxjs/toolkit';
import authReducer, { logout } from '../features/auth/store/authSlice';
import leadReducer from '../features/leads/store/leadSlice';
import loanFormReducer from '../features/new-loan/store/newLoanFormSlice';
import loanDashboardReducer from '../features/loans/store/loanDashboardSlice';
import newLeadReducer from '../features/new-lead/store/newLeadSlice';
import farmerReducer from '../features/new-lead/store/farmerSlice';
import consentReducer from '../features/new-lead/store/consentSlice';
import visitReducer from '../features/new-lead/store/visitSlice';
import assignmentReducer from '../features/new-lead/store/assignmentSlice';

const AUTH_ACTIONS = ['auth/login/fulfilled', 'auth/logout', 'auth/hydrate'];

const storageMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  const unknownAction = action as UnknownAction;
  if (typeof window !== 'undefined') {
    // Handle Auth Persistence (stored in sessionStorage to avoid localStorage PII)
    if (AUTH_ACTIONS.includes(unknownAction.type)) {
      const user = (store.getState() as RootState).auth.user;
      if (user) {
        sessionStorage.setItem('auth_user', JSON.stringify(user));
      } else {
        sessionStorage.removeItem('auth_user');
      }
    }
    
    // Handle Loan Form Persistence (stored in sessionStorage to avoid localStorage PII)
    if (unknownAction.type === 'loanForm/resetForm') {
      sessionStorage.removeItem('loan_form_state');
    } else if (unknownAction.type.startsWith('loanForm/')) {
      const loanState = (store.getState() as RootState).loanForm;
      sessionStorage.setItem('loan_form_state', JSON.stringify(loanState));
    }
  }
  return result;
};

// Centralized session expiration middleware.
// Intercepts only UNAUTHORIZED (401) errors to trigger a global logout redirect,
// avoiding accidental logouts during transient network issues or generic server errors.
const unauthenticatedMiddleware: Middleware = (api) => (next) => (action) => {
  const unknownAction = action as UnknownAction;
  if (isRejectedWithValue(unknownAction) || unknownAction.type.endsWith('/rejected')) {
    const payload = unknownAction.payload;
    const error = unknownAction.error;
    if (
      payload === 'UNAUTHORIZED' ||
      (payload as { message?: string })?.message === 'UNAUTHORIZED' ||
      (error as { message?: string })?.message === 'UNAUTHORIZED'
    ) {
      api.dispatch(logout());
      if (typeof window !== 'undefined') {
        // Clear HttpOnly cookie on the server before redirecting.
        // We use a fire-and-forget .catch(() => {}) block to guarantee the client-side session
        // is cleared and redirect occurs even if the server is offline or unreachable.
        fetch('/api/auth/logout', { method: 'POST' })
          .catch(() => {}) 
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
    farmer: farmerReducer,
    consent: consentReducer,
    visit: visitReducer,
    assignment: assignmentReducer,
    loanForm: loanFormReducer,
    loanDashboard: loanDashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(storageMiddleware, unauthenticatedMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
