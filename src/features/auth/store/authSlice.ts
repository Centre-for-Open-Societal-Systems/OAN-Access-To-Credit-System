import { AUTH_MESSAGES } from '@/lib/authMessages';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../store';
import { getMe, loginUser } from '../api/authApi';
import { classifyUser, type AuthState, type LoginOutcome, type User } from '../types/auth.types';

export const loginThunk = createAsyncThunk<
  LoginOutcome,
  { usr: string; pwd: string; rememberMe?: boolean },
  { rejectValue: string }
>(
  'auth/login',
  async ({ usr, pwd, rememberMe = false }, { rejectWithValue }) => {
    try {
      const result = await loginUser({ usr, pwd, rememberMe });
      if (result.outcome === 'password_change_required') {
        return { outcome: 'password_change_required', usr: result.usr };
      }
      return { outcome: 'authenticated', user: classifyUser(result.user) };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : AUTH_MESSAGES.unexpected;
      return rejectWithValue(message);
    }
  },
);

export const getMeThunk = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const raw = await getMe();
      return classifyUser(raw);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : AUTH_MESSAGES.sessionExpired;
      return rejectWithValue(message);
    }
  },
);

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    hydrate(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.status = 'succeeded';
    },
    logout(state) {
      state.user = null;
      state.status = 'idle';
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
    },
    setUserImage(state, action: PayloadAction<string | null>) {
      if (state.user) {
        state.user.userImage = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action: PayloadAction<LoginOutcome>) => {
        if (action.payload.outcome === 'password_change_required') {
          // Authenticated, but no session exists until the temporary password is
          // rotated. Returning to 'idle' rather than 'succeeded' keeps every
          // `user !== null` guard in the app honest.
          state.status = 'idle';
          state.user = null;
          return;
        }
        state.status = 'succeeded';
        state.user = action.payload.user;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? 'Something went wrong.';
      })
      .addCase(getMeThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getMeThunk.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(getMeThunk.rejected, (state) => {
        state.status = 'failed';
        state.user = null;
      });
  },
});

export const { logout, clearAuthError, hydrate, setUserImage } = authSlice.actions;

export const selectUser = (state: RootState) => state.auth.user;
export const selectOfficerName = (state: RootState) => state.auth.user?.name ?? null;
export const selectBankCode = (state: RootState) => {
  const user = state.auth.user;
  if (user?.kind === 'bank_admin' || user?.kind === 'bank_agent') return user.bankCode;
  return null;
};
export const selectBankId = (state: RootState) => {
  const user = state.auth.user;
  if (user?.kind === 'bank_admin' || user?.kind === 'bank_agent') return user.bankId;
  return null;
};
export const selectBankName = (state: RootState) => {
  const user = state.auth.user;
  if (user?.kind === 'bank_admin' || user?.kind === 'bank_agent') return user.bankName;
  return null;
};
export const selectBankStatus = (state: RootState) => {
  const user = state.auth.user;
  if (user?.kind === 'bank_admin' || user?.kind === 'bank_agent') return user.bankStatus;
  return null;
};
export const selectUserEmail = (state: RootState) => state.auth.user?.email ?? null;
export const selectUserImage = (state: RootState) => state.auth.user?.userImage ?? null;
export const selectUserKind = (state: RootState) => state.auth.user?.kind ?? null;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectIsAuthenticated = (state: RootState) => state.auth.user !== null;

export const authReducer = authSlice.reducer;
