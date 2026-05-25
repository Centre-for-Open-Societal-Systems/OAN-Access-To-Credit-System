import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { loginUser } from '../api/authApi.js';

// ---------------------------------------------------------------------------
// Async thunk — calls the Frappe login endpoint, then fetches the user profile
// ---------------------------------------------------------------------------

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ usr, pwd }, { rejectWithValue }) => {
    const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

    try {
      // Step 1: Authenticate — Frappe sets a session cookie
      const loginData = await loginUser({ usr, pwd });

      // Step 2: Resolve the actual username (email) for the current session.
      // GET /api/method/frappe.auth.get_logged_user → { message: "user@email.com" }
      const sessionRes = await fetch(
        `${BASE_URL}/api/method/frappe.auth.get_logged_user`,
        { headers: { Accept: 'application/json' }, credentials: 'include' },
      );
      const sessionData = await sessionRes.json().catch(() => ({}));
      const username = sessionData.message ?? usr;

      // Step 3: Fetch the full Frappe User document for the officer's profile.
      // GET /api/resource/User/{username} → { data: { full_name, email, ... } }
      const userRes = await fetch(
        `${BASE_URL}/api/resource/User/${encodeURIComponent(username)}`,
        { headers: { Accept: 'application/json' }, credentials: 'include' },
      );
      const userData = await userRes.json().catch(() => ({}));
      const userDoc = userData.data ?? {};

      return {
        /** The Frappe username / login identifier (usually an email address) */
        username,
        /** Officer's display name as stored in the Frappe User document */
        officerName: userDoc.full_name ?? loginData.full_name ?? username,
        /** Additional profile fields */
        email: userDoc.email ?? username,
        mobileNo: userDoc.mobile_no ?? '',
        userType: userDoc.user_type ?? '',
        homePage: loginData.home_page ?? '/',
      };
    } catch (err) {
      return rejectWithValue(err.message ?? 'Login failed. Please try again.');
    }
  },
);

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const initialState = {
  /** Logged-in user profile. null when not authenticated. */
  user: null,
  /** 'idle' | 'loading' | 'succeeded' | 'failed' */
  status: 'idle',
  /** Error message string when status === 'failed' */
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
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
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Something went wrong.';
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

export const selectUser = (state) => state.auth.user;
export const selectUsername = (state) => state.auth.user?.username ?? null;
export const selectOfficerName = (state) => state.auth.user?.officerName ?? null;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
export const selectIsAuthenticated = (state) => state.auth.user !== null;

export default authSlice.reducer;
