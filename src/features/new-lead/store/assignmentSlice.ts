import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { newLeadService } from '../api/newLead.service';

interface Assignment {
  agentId?: string;
  assigneeName: string;
  region?: string;
}

interface AssignmentState {
  assignment: Assignment | null;
}

const initialState: AssignmentState = {
  assignment: null,
};

export const fetchAssignmentInfoThunk = createAsyncThunk(
  'assignment/fetchAssignmentInfo',
  async (assigneeEmail: string, { rejectWithValue }) => {
    try {
      const response = await newLeadService.getAssignableUsers(assigneeEmail);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Unknown Cause: Failed to fetch assignment info');
    }
  }
);

export const assignLeadThunk = createAsyncThunk(
  'assignment/assignLead',
  async (payload: { leadId: string; assigneeName: string; assigneeId?: string; gender?: string; region?: string; date?: string; email?: string }, { rejectWithValue }) => {
    try {
      const response = await newLeadService.assignLead(payload);
      return { ...response, payload };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Unknown Cause: Failed to assign lead');
    }
  }
);

const assignmentSlice = createSlice({
  name: 'assignment',
  initialState,
  reducers: {
    clearAssignmentState(state) {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(assignLeadThunk.fulfilled, (state, action) => {
        const p = action.payload.payload;
        state.assignment = {
          agentId: p.assigneeId,
          assigneeName: p.assigneeName,
          region: p.region
        };
      })
      .addCase(fetchAssignmentInfoThunk.fulfilled, (state, action) => {
        const results = action.payload.message?.results || action.payload.results || [];
        if (results && results.length > 0) {
          const user = results[0];
          state.assignment = {
            agentId: user.agent_id,
            assigneeName: user.full_name,
            region: user.region
          };
        } else {
          state.assignment = {
            assigneeName: action.meta.arg
          };
        }
      })
      .addCase('newLead/initializeLead', (state) => {
        state.assignment = null;
      })
      .addCase('newLead/clearForm', () => {
        return initialState;
      });
  }
});

export const { clearAssignmentState } = assignmentSlice.actions;
export default assignmentSlice.reducer;
