import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../../../store';

// Keeping the slice minimal — leads data fetching is now handled by TanStack Query.
// This slice can be used for client-side lead state if needed in the future
// (e.g., selected leads, UI filters, etc.)

interface LeadState {
  selectedLeadIds: string[];
}

const initialState: LeadState = {
  selectedLeadIds: [],
};

const leadSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    toggleLeadSelection(state, action) {
      const id = action.payload;
      const idx = state.selectedLeadIds.indexOf(id);
      if (idx >= 0) {
        state.selectedLeadIds.splice(idx, 1);
      } else {
        state.selectedLeadIds.push(id);
      }
    },
    clearLeadSelection(state) {
      state.selectedLeadIds = [];
    },
  },
});

export const { toggleLeadSelection, clearLeadSelection } = leadSlice.actions;

export const selectSelectedLeadIds = (state: RootState) => state.leads.selectedLeadIds;

export default leadSlice.reducer;
