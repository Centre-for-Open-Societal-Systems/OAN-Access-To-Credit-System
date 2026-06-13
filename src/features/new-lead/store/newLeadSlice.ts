import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { newLeadService } from '../api/newLead.service';
import { formatTiming, extractList, extractData } from './helpers';
import { fetchAssignmentInfoThunk } from './assignmentSlice';

// Re-export thunks & actions from farmerSlice
export {
  searchFarmerThunk,
  fetchLeadDetailsThunk,
  setFarmerId,
  updateFarmerDetails,
  clearFarmerState
} from './farmerSlice';

// Re-export thunks & actions from consentSlice
export {
  searchFarmerConsent,
  verifyOtpThunk,
  clearConsentState
} from './consentSlice';

// Re-export thunks & actions from visitSlice
export {
  fetchVisitSchedulesThunk,
  scheduleVisitThunk,
  updateVisitScheduleStatusThunk,
  setVisitSchedule,
  clearVisitState
} from './visitSlice';

// Re-export thunks & actions from assignmentSlice
export {
  fetchAssignmentInfoThunk,
  assignLeadThunk,
  clearAssignmentState
} from './assignmentSlice';

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

export const fetchLeadMetadataThunk = createAsyncThunk(
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
      const response = await newLeadService.getLeadMetadata();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Unknown Cause: Failed to fetch lead metadata');
    }
  }
);

export const fetchCallDetailsThunk = createAsyncThunk(
  'newLead/fetchCallDetails',
  async (leadId: string, { rejectWithValue }) => {
    try {
      const response = await newLeadService.getCallDetails(leadId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Unknown Cause: Failed to fetch call details');
    }
  }
);

export const fetchActivitiesThunk = createAsyncThunk(
  'newLead/fetchActivities',
  async (leadId: string, { rejectWithValue }) => {
    try {
      const response = await newLeadService.getActivities(leadId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Unknown Cause: Failed to fetch activities');
    }
  }
);

export const addActivityNoteThunk = createAsyncThunk(
  'newLead/addActivityNote',
  async (payload: { leadId: string; content: string }, { getState, rejectWithValue }) => {
    try {
      const response = await newLeadService.addActivityNote(payload);
      const state = getState() as RootState;
      const officerName = state.auth?.user?.officerName || 'Current User';
      return { response, content: payload.content, officerName };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Unknown Cause: Failed to add note');
    }
  }
);

export const fetchSpecificLeadThunk = createAsyncThunk(
  'newLead/fetchSpecificLead',
  async (leadId: string, { dispatch, rejectWithValue }) => {
    try {
      const response = await newLeadService.getSpecificLead(leadId);
      const leads = extractList(response, 'results');
      if (leads && leads.length > 0) {
        const lead = leads[0];
        if (lead.assigned_to) {
          dispatch(fetchAssignmentInfoThunk(lead.assigned_to));
        }
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Unknown Cause: Failed to fetch specific lead');
    }
  }
);

export const fetchCreditInfoThunk = createAsyncThunk(
  'newLead/fetchCreditInfo',
  async (leadId: string, { rejectWithValue }) => {
    try {
      const response = await newLeadService.getCreditInfo(leadId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Unknown Cause: Failed to fetch credit info');
    }
  }
);

export const addCreditInfoThunk = createAsyncThunk(
  'newLead/addCreditInfo',
  async (payload: { leadId: string; loan_type: string; loan_amount: number | string; purpose_message?: string }, { rejectWithValue }) => {
    try {
      const response = await newLeadService.addCreditInfo({
        lead_id: decodeURIComponent(payload.leadId).replace(/^#/, ''),
        ...payload
      });
      return { response, payload };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add credit info');
    }
  }
);

export const submitNewLeadThunk = createAsyncThunk(
  'newLead/submitLead',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = (getState() as RootState).farmer;
      const newLeadState = (getState() as RootState).newLead;

      const payload = {
        phone_number: state.farmerDetails.phoneNumber,
        first_name: state.farmerDetails.firstName,
        last_name: state.farmerDetails.lastName,
        email: state.farmerDetails.email,
        lead_source: 'Agent Entry',
        external_id: '',
      };

      const response = await newLeadService.createLead(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Unknown Cause: Failed to create lead');
    }
  }
);

export const updateLeadStatusThunk = createAsyncThunk(
  'newLead/updateLeadStatus',
  async (payload: { leadId: string; status: string; reason: string }, { rejectWithValue }) => {
    try {
      const response = await newLeadService.updateLeadStatus({
        lead_id: payload.leadId,
        status: payload.status,
        reason: payload.reason
      });
      return { response, payload };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Unknown Cause: Failed to update lead status');
    }
  }
);

const newLeadSlice = createSlice({
  name: 'newLead',
  initialState,
  reducers: {
    initializeLead(state, action: PayloadAction<{ id?: string; source?: string; status?: string; farmerDetails?: any; farmerId?: string; consentDate?: string; consentRequestId?: string | null }>) {
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
    },
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
    },
    clearForm(state) {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeadMetadataThunk.fulfilled, (state, action) => {
        if (!action.payload) return;
        const payload = extractData(action.payload);
        if (payload.status === 'success' || payload.loan_types) {
          state.leadSourcesOptions = payload.sources || [];
          state.leadStatusesOptions = payload.statuses || [];
          state.loanTypesOptions = payload.loan_types || [];
        }
      })
      .addCase(fetchCallDetailsThunk.fulfilled, (state, action) => {
        const logsArray = extractList(action.payload, 'call_logs');
        state.callDetails = logsArray.map((log: any, index: number) => ({
          id: log.ref_id ? `${log.ref_id}-${index}` : log.name || log.id || `call-${index}`,
          status: log.source || log.comment_type || log.status || 'Unknown',
          timing: formatTiming(log.timestamp || '', ' • ', true)
        }));
      })
      .addCase(fetchActivitiesThunk.fulfilled, (state, action) => {
        const timeline = extractList(action.payload, 'timeline');
        state.activities = timeline.map((item: any, index: number) => ({
          id: item.name || `unknown_activity-${index}`,
          author: item.owner || 'unknown',
          type: item.event_type || 'unknown',
          title: item.event_title || 'unknown',
          content: item.event_description || 'unknown',
          timestamp: formatTiming(item.creation || item.timestamp || '', ' - ', false)
        }));
      })
      .addCase(fetchCreditInfoThunk.fulfilled, (state, action) => {
        const info = extractList(action.payload, 'credit_info');
        state.creditInfo = info.map((item: any, index: number) => ({
          id: item.name || `cr-${index}`,
          type: item.loan_type || 'Unknown',
          amount: item.loan_amount || '0',
          purpose: item.purpose_message || ''
        }));
      })
      .addCase(fetchSpecificLeadThunk.fulfilled, (state, action) => {
        const leads = extractList(action.payload, 'results');
        if (leads && leads.length > 0) {
          const lead = leads[0];
          if (lead.status) state.leadStatus = lead.status;
          if (lead.lead_source) state.leadSource = lead.lead_source;
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
        const { response = {}, content } = action.payload || {};
        state.activities.unshift({
          id: response.comment_id || response.message?.name || `new-${Date.now()}`,
          author: 'Current User',
          type: 'Commented',
          content: content,
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
  initializeLead,
  setLeadSource,
  setLeadStatus,
  addCreditInfo,
  clearForm
} = newLeadSlice.actions;

export const selectNewLeadState = (state: RootState) => ({
  ...state.newLead,
  ...state.farmer,
  ...state.consent,
  ...state.visit,
  ...state.assignment,
});

export const selectIsLeadFinalized = (state: RootState) => {
  const status = state.newLead.leadStatus?.toLowerCase() || '';
  return ['rejected', 'processed', 'granted'].includes(status);
};

export default newLeadSlice.reducer;
