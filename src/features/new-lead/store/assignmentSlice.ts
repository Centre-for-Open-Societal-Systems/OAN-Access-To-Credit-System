import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { newLeadService, AssignableUserAPI, AssignLeadResponse } from '../api/newLead.service';
import { initializeLead, clearForm } from './actions';
import type { RootState } from '@/store';

interface Assignment {
  agentId: string;
  assigneeName: string;
  region: string;
}

interface AssignmentState {
  assignment: Assignment | null;
}

const initialState: AssignmentState = {
  assignment: null,
};

export const fetchAssignmentInfoThunk = createAsyncThunk<AssignableUserAPI[], string>(
  'assignment/fetchAssignmentInfo',
  async (assigneeEmail: string, { rejectWithValue }) => {
    try {
      const response = await newLeadService.getAssignableUsers(assigneeEmail);
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown Cause: Failed to fetch assignment info');
    }
  }
);

export const assignLeadThunk = createAsyncThunk<
  AssignLeadResponse,
  { leadId: string; assigneeName: string; assigneeId?: string; gender?: string; region?: string; date?: string; email?: string }
>(
  'assignment/assignLead',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await newLeadService.assignLead(payload);
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown Cause: Failed to assign lead');
    }
  }
);

const assignmentSlice = createSlice({
  name: 'assignment',
  initialState,
  reducers: {
    clearAssignmentState() {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(assignLeadThunk.fulfilled, (state, action) => {
        const p = action.payload.payload;
        state.assignment = {
          agentId: p.assigneeId || '',
          assigneeName: p.assigneeName,
          region: p.region || ''
        };
      })
      .addCase(fetchAssignmentInfoThunk.fulfilled, (state, action) => {
        const results = action.payload;
        if (results && results.length > 0) {
          const user = results[0];
          if (user) {
            state.assignment = {
              agentId: user.agent_id || '',
              assigneeName: user.full_name || '',
              region: user.region || ''
            };
          }
        } else {
          state.assignment = {
            agentId: '',
            assigneeName: action.meta.arg,
            region: ''
          };
        }
      })
      .addCase(initializeLead, (state) => {
        state.assignment = null;
      })
      .addCase(clearForm, () => {
        return initialState;
      });
  }
});

export const { clearAssignmentState } = assignmentSlice.actions;
export const assignmentReducer = assignmentSlice.reducer;

export const selectAssignmentState = (state: RootState) => state.assignment;

