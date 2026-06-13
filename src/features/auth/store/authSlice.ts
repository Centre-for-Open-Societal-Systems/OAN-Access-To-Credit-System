import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { loginUser } from '../api/authApi';
import type { RootState } from '../../../store';
import type { User, AuthState } from '../types/auth.types';

export const loginThunk = createAsyncThunk<
  User,
  { usr: string; pwd: string },
  { rejectValue: string }
>(
  'auth/login',
  async ({ usr, pwd }, { rejectWithValue }) => {
    try {
      const loginData = await loginUser({ usr, pwd });

      return {
        username: loginData.email,
        officerName: loginData.full_name || usr,
        roles: Array.isArray(loginData.roles) ? loginData.roles : [],
        mobileNo: null,
        userType: null,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown Cause. Please Try Again Later';
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? 'Something went wrong.';
      });
  },
});

export const { logout, clearAuthError, hydrate } = authSlice.actions;

export const selectOfficerName = (state: RootState) => state.auth.user?.officerName ?? null;
export const selectOfficerRole = (state: RootState) => state.auth.user?.roles?.[0] ?? null;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectIsAuthenticated = (state: RootState) => state.auth.user !== null;

export default authSlice.reducer;
