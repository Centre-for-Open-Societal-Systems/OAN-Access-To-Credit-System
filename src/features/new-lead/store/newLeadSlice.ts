import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import {
  newLeadService,
  SpecificLeadAPI,
  GetLeadMetadataResponse,
  GetCallDetailsResponse,
  GetActivitiesResponse,
  AddActivityNoteResponse,
  CreditInfoAPI,
  AddCreditInfoResponse,
  CreateLeadResponse,
  UpdateLeadStatusResponse
} from '../api/newLead.service';
import { formatTiming } from './helpers';
import { fetchAssignmentInfoThunk } from './assignmentSlice';
import { initializeLead, clearForm, InitializeLeadPayload } from './actions';
import { normalizeLeadId } from '@/lib/utils';



export interface CreditInfo {
  id: string;
  type: string;
  amount: string;
  purpose: string;
}

export interface CallDetail {
  id: string;
  status: string;
  timing: string;
}

export interface Activity {
  id: string;
  author: string;
  type: string;
  title?: string;
  content: string;
  timestamp: string;
}

interface NewLeadState {
  activeLeadId: string | null;
  leadSource: string;
  leadStatus: string;
  leadSourcesOptions: string[];
  leadStatusesOptions: string[];
  loanTypesOptions: string[];
  creditInfo: CreditInfo[];
  callDetails: CallDetail[];
  activities: Activity[];
  isSubmitting: boolean;
}

const getInitialState = (): NewLeadState => ({
  activeLeadId: null,
  leadSource: '',
  leadStatus: '',
  leadSourcesOptions: [],
  leadStatusesOptions: [],
  loanTypesOptions: [],
  creditInfo: [],
  callDetails: [],
  activities: [],
  isSubmitting: false,
});

const initialState: NewLeadState = getInitialState();

export const fetchLeadMetadataThunk = createAsyncThunk<
  GetLeadMetadataResponse | null,
  void
>(
  'newLead/fetchMetadata',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    if (
      state.newLead.leadSourcesOptions?.length > 0 &&
      state.newLead.leadStatusesOptions?.length > 0
    ) {
      return null;
    }
    try {
      return await newLeadService.getLeadMetadata();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown Cause: Failed to fetch lead metadata');
    }
  }
);

export const fetchCallDetailsThunk = createAsyncThunk<
  GetCallDetailsResponse,
  string
>(
  'newLead/fetchCallDetails',
  async (leadId, { rejectWithValue }) => {
    try {
      return await newLeadService.getCallDetails(leadId);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown Cause: Failed to fetch call details');
    }
  }
);

export const fetchActivitiesThunk = createAsyncThunk<
  GetActivitiesResponse,
  string
>(
  'newLead/fetchActivities',
  async (leadId, { rejectWithValue }) => {
    try {
      return await newLeadService.getActivities(leadId);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown Cause: Failed to fetch activities');
    }
  }
);

export const addActivityNoteThunk = createAsyncThunk<
  { response: AddActivityNoteResponse; content: string; officerName: string },
  { leadId: string; content: string }
>(
  'newLead/addActivityNote',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const response = await newLeadService.addActivityNote(payload);
      const state = getState() as RootState;
      const officerName = state.auth?.user?.officerName || 'Current User';
      return { response, content: payload.content, officerName };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown Cause: Failed to add note');
    }
  }
);

export const fetchSpecificLeadThunk = createAsyncThunk<SpecificLeadAPI[], string>(
  'newLead/fetchSpecificLead',
  async (leadId: string, { dispatch, rejectWithValue }) => {
    try {
      const leads = await newLeadService.getSpecificLead(leadId);
      if (leads.length > 0) {
        const lead = leads[0];
        if (lead && lead.assigned_to) {
          dispatch(fetchAssignmentInfoThunk(lead.assigned_to));
        }
      }
      return leads;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown Cause: Failed to fetch specific lead');
    }
  }
);

export const fetchCreditInfoThunk = createAsyncThunk<
  CreditInfoAPI[],
  string
>(
  'newLead/fetchCreditInfo',
  async (leadId, { rejectWithValue }) => {
    try {
      return await newLeadService.getCreditInfo(leadId);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown Cause: Failed to fetch credit info');
    }
  }
);

export const addCreditInfoThunk = createAsyncThunk<
  { response: AddCreditInfoResponse; payload: { leadId: string; loan_type: string; loan_amount: number | string; purpose_message?: string } },
  { leadId: string; loan_type: string; loan_amount: number | string; purpose_message?: string }
>(
  'newLead/addCreditInfo',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await newLeadService.addCreditInfo({
        lead_id: normalizeLeadId(payload.leadId),
        loan_type: payload.loan_type,
        loan_amount: Number(payload.loan_amount),
        ...(payload.purpose_message !== undefined ? { purpose_message: payload.purpose_message } : {})
      });
      return { response, payload };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown Cause: Failed to add credit info');
    }
  }
);

export const submitNewLeadThunk = createAsyncThunk<
  CreateLeadResponse,
  void
>(
  'newLead/submitLead',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = (getState() as RootState).farmer;

      const payload = {
        phone_number: state.farmerDetails.phoneNumber,
        first_name: state.farmerDetails.firstName,
        last_name: state.farmerDetails.lastName,
        email: state.farmerDetails.email,
        lead_source: 'Agent Entry',
        external_id: '',
      };

      return await newLeadService.createLead(payload);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown Cause: Failed to create lead');
    }
  }
);

export const updateLeadStatusThunk = createAsyncThunk<
  { response: UpdateLeadStatusResponse; payload: { leadId: string; status: string; reason: string } },
  { leadId: string; status: string; reason: string }
>(
  'newLead/updateLeadStatus',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await newLeadService.updateLeadStatus({
        lead_id: payload.leadId,
        status: payload.status,
        reason: payload.reason
      });
      return { response, payload };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown Cause: Failed to update lead status');
    }
  }
);

const newLeadSlice = createSlice({
  name: 'newLead',
  initialState,
  reducers: {
    setLeadSource(state, action: PayloadAction<string>) {
      state.leadSource = action.payload;
    },
    setLeadStatus(state, action: PayloadAction<string>) {
      state.leadStatus = action.payload;
    },
    addCreditInfo(state, action: PayloadAction<Omit<CreditInfo, 'id'>>) {
      const newCreditInfo: CreditInfo = {
        id: `CI-${Math.floor(Math.random() * 10000)}`,
        ...action.payload
      };
      state.creditInfo.push(newCreditInfo);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeLead, (state, action) => {
        const isSameLead = action.payload.id === state.activeLeadId;
        state.activeLeadId = action.payload.id || null;
        state.leadStatus = action.payload.status || '';
        state.leadSource = action.payload.source || '';

        if (!isSameLead) {
          state.creditInfo = [];
          state.callDetails = [];
          state.activities = [];
        }
        state.isSubmitting = false;
      })
      .addCase(clearForm, () => {
        return getInitialState();
      })
      .addCase(fetchLeadMetadataThunk.fulfilled, (state, action) => {
        if (!action.payload) return;
        const payload = action.payload;
        state.leadSourcesOptions = payload.sources || [];
        state.leadStatusesOptions = payload.statuses || [];
        state.loanTypesOptions = payload.loan_types || [];
      })
      .addCase(fetchCallDetailsThunk.fulfilled, (state, action) => {
        const logsArray = action.payload.call_logs || [];
        state.callDetails = logsArray.map((log, index: number) => ({
          id: log.ref_id ? `${log.ref_id}-${index}` : `call-${index}`,
          status: log.source || 'Unknown',
          timing: formatTiming(log.timestamp || '', ' • ', true)
        }));
      })
      .addCase(fetchActivitiesThunk.fulfilled, (state, action) => {
        const timeline = action.payload.timeline || [];
        state.activities = timeline.map((item, index: number) => ({
          id: item.name || `unknown_activity-${index}`,
          author: item.owner || 'unknown',
          type: item.event_type || 'unknown',
          title: item.event_title || 'unknown',
          content: item.event_description || 'unknown',
          timestamp: formatTiming(item.creation || '', ' - ', false)
        }));
      })
      .addCase(fetchCreditInfoThunk.fulfilled, (state, action) => {
        const info = action.payload || [];
        state.creditInfo = info.map((item, index: number) => ({
          id: item.name || `cr-${index}`,
          type: item.loan_type || 'Unknown',
          amount: String(item.loan_amount || '0'),
          purpose: item.purpose_message || ''
        }));
      })
      .addCase(fetchSpecificLeadThunk.fulfilled, (state, action) => {
        const leads = action.payload;
        if (leads.length > 0) {
          const lead = leads[0];
          if (lead) {
            if (lead.status) state.leadStatus = lead.status;
            if (lead.lead_source) state.leadSource = lead.lead_source;
          }
        }
      })
      .addCase(addCreditInfoThunk.fulfilled, (state, action) => {
        const { payload } = action.payload;
        state.creditInfo.push({
          id: `cr-${Date.now()}`,
          type: payload.loan_type,
          amount: String(payload.loan_amount),
          purpose: payload.purpose_message || ''
        });
      })
      .addCase(addActivityNoteThunk.fulfilled, (state, action) => {
        const payload = action.payload as { response?: { comment_id?: string; message?: { name?: string } }; content: string } | null;
        const { response = {}, content } = payload || {};
        state.activities.unshift({
          id: response.comment_id || response.message?.name || `new-${Date.now()}`,
          author: 'Current User',
          type: 'Commented',
          content: content || '',
          timestamp: formatTiming(new Date().toISOString(), ' - ', false)
        });
      })
      .addCase(submitNewLeadThunk.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(submitNewLeadThunk.fulfilled, (state) => {
        state.isSubmitting = false;
      })
      .addCase(submitNewLeadThunk.rejected, (state) => {
        state.isSubmitting = false;
      })
      .addCase(updateLeadStatusThunk.fulfilled, (state, action) => {
        state.leadStatus = action.payload.payload.status;
      });
  }
});

export const {
  setLeadSource,
  setLeadStatus,
  addCreditInfo
} = newLeadSlice.actions;

export { initializeLead, clearForm };

export const selectNewLeadState = (state: RootState) => state.newLead;

export const selectActiveLeadId = (state: RootState) => state.newLead.activeLeadId;
export const selectLeadSource = (state: RootState) => state.newLead.leadSource;
export const selectLeadStatus = (state: RootState) => state.newLead.leadStatus;
export const selectLeadSourcesOptions = (state: RootState) => state.newLead.leadSourcesOptions;
export const selectLeadStatusesOptions = (state: RootState) => state.newLead.leadStatusesOptions;
export const selectLoanTypesOptions = (state: RootState) => state.newLead.loanTypesOptions;
export const selectCreditInfo = (state: RootState) => state.newLead.creditInfo;
export const selectCallDetails = (state: RootState) => state.newLead.callDetails;
export const selectActivities = (state: RootState) => state.newLead.activities;
export const selectIsSubmitting = (state: RootState) => state.newLead.isSubmitting;

export const selectIsLeadFinalized = (state: RootState) => {
  const status = state.newLead.leadStatus?.toLowerCase() || '';
  return ['rejected', 'processed', 'granted'].includes(status);
};

export default newLeadSlice.reducer;
