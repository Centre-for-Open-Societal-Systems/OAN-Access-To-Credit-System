import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { leadService } from '../../../services/lead.service';
import type { Lead, GetLeadsParams } from '../../../types/leads.types';
import type { RootState } from '../../../store';

interface LeadState {
  leads: Lead[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: LeadState = {
  leads: [],
  status: 'idle',
  error: null,
};

export const fetchLeadsThunk = createAsyncThunk<
  Lead[],
  GetLeadsParams | undefined,
  { rejectValue: string }
>(
  'leads/fetchLeads',
  async (params, { rejectWithValue }) => {
    try {
      const data = await leadService.getLeads(params);
      return data;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message || 'Failed to fetch leads.');
      }
      return rejectWithValue('Failed to fetch leads.');
    }
  }
);

const leadSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    clearLeadsStatus(state) {
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeadsThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchLeadsThunk.fulfilled, (state, action: PayloadAction<Lead[]>) => {
        state.status = 'succeeded';
        state.leads = action.payload;
      })
      .addCase(fetchLeadsThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Something went wrong.';
      });
  },
});

export const { clearLeadsStatus } = leadSlice.actions;

export const selectAllLeads = (state: RootState) => state.leads.leads;
export const selectLeadsStatus = (state: RootState) => state.leads.status;
export const selectLeadsError = (state: RootState) => state.leads.error;

export default leadSlice.reducer;
