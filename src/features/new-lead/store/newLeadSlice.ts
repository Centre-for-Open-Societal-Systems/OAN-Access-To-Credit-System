import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { newLeadService } from '../api/newLead.service';

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
  type: 'note' | 'activity';
  content: string;
  timestamp: string;
}

export interface FarmerDetails {
  firstName: string;
  lastName: string;
  location: string;
  phoneNumber: string;
  email: string;
}

interface NewLeadState {
  // Form fields
  leadId: string;
  leadSource: string;
  leadStatus: string;
  farmerId: string;
  farmerDetails: FarmerDetails;

  // Metadata options
  leadSourcesOptions: string[];
  leadStatusesOptions: string[];

  // Child sections (dummy data for now)
  creditInfo: CreditInfo[];
  callDetails: CallDetail[];
  activities: Activity[];
  visitSchedule: { date: string } | null;
  assignment: { agentId: string; assigneeName: string; region: string; date: string } | null;

  // UI state
  isLoadingConsent: boolean;
  consentError: string | null;
  isVerifyingOtp: boolean;
  isOtpVerified: boolean;
  isSubmitting: boolean;
  consentRequestId: string | null;
  consentDate: string | null;
}

const getInitialState = (): NewLeadState => ({
  leadId: '',
  leadSource: '',
  leadStatus: '',
  farmerId: '',
  consentDate: null,
  farmerDetails: {
    firstName: '',
    lastName: '',
    location: '',
    phoneNumber: '',
    email: '',
  },
  leadSourcesOptions: [],
  leadStatusesOptions: [],
  creditInfo: [],
  callDetails: [],
  activities: [],
  visitSchedule: null,
  assignment: null,
  isLoadingConsent: false,
  consentError: null,
  isVerifyingOtp: false,
  isOtpVerified: false,
  isSubmitting: false,
  consentRequestId: null,
});

const initialState: NewLeadState = getInitialState();

export const searchFarmerConsent = createAsyncThunk(
  'newLead/searchConsent',
  async (farmerId: string, { rejectWithValue }) => {
    try {
      const response = await newLeadService.sendOtpAndCreateConsent({ farmerId });
      // The backend response structure for this API is assumed to contain a success flag and possibly a consent_request id
      return response as { success: boolean; consent_request?: string; farmer?: Partial<FarmerDetails> };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to search farmer');
    }
  }
);

export const verifyOtpThunk = createAsyncThunk(
  'newLead/verifyOtp',
  async (payload: { otp_code: string; consent_request: string }, { rejectWithValue }) => {
    try {
      const response = await newLeadService.verifyOtp({
        consent_request: payload.consent_request,
        otp_code: payload.otp_code
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Verification failed');
    }
  }
);

export const fetchLeadMetadataThunk = createAsyncThunk(
  'newLead/fetchMetadata',
  async (_, { rejectWithValue }) => {
    try {
      const response = await newLeadService.getLeadMetadata();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch lead metadata');
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
      return rejectWithValue(error.message || 'Failed to fetch call details');
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
      return rejectWithValue(error.message || 'Failed to fetch activities');
    }
  }
);

export const addActivityNoteThunk = createAsyncThunk(
  'newLead/addActivityNote',
  async (payload: { leadId: string; content: string }, { rejectWithValue }) => {
    try {
      const response = await newLeadService.addActivityNote(payload);
      return { response, content: payload.content };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add note');
    }
  }
);

export const submitNewLeadThunk = createAsyncThunk(
  'newLead/submitLead',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = (getState() as RootState).newLead;

      const payload = {
        phone_number: state.farmerDetails.phoneNumber,
        first_name: state.farmerDetails.firstName,
        last_name: state.farmerDetails.lastName,
        email: state.farmerDetails.email,
        lead_source: state.leadSource || 'Agent Entry',
        external_id: state.farmerId || undefined,
      };

      const response = await newLeadService.createLead(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create lead');
    }
  }
);

export const assignLeadThunk = createAsyncThunk(
  'newLead/assignLead',
  async (payload: { leadId: string; assigneeName: string; assigneeId?: string; gender?: string; region?: string; date?: string }, { rejectWithValue }) => {
    try {
      const response = await newLeadService.assignLead(payload);
      // Pass the payload down so we can update local state
      return { ...response, payload };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to assign lead');
    }
  }
);

export const scheduleVisitThunk = createAsyncThunk(
  'newLead/scheduleVisit',
  async (payload: { leadId: string; date: string; time?: string; location?: string; agenda?: string; region?: string; zone?: string; woreda?: string; kebele?: string; address?: string; }, { rejectWithValue }) => {
    try {
      const response = await newLeadService.scheduleVisit({ leadId: payload.leadId, date: payload.date });
      return { ...response, payload };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to schedule visit');
    }
  }
);

// Helper function to handle strict browser parsing and format dates consistently
const formatTiming = (rawDateStr: string, separator: string = ' - ', appendIST: boolean = false) => {
  if (!rawDateStr) return 'Unknown time';
  const safeDateStr = rawDateStr.replace(' ', 'T');
  const date = new Date(safeDateStr);
  
  if (isNaN(date.getTime())) return rawDateStr;
  
  const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
  const formattedString = `${formattedDate}${separator}${formattedTime}`;
  return appendIST ? `${formattedString} IST` : formattedString;
};

const newLeadSlice = createSlice({
  name: 'newLead',
  initialState,
  reducers: {
    initializeLead(state, action: PayloadAction<{ id?: string; source?: string; status?: string; farmerDetails?: Partial<FarmerDetails>; farmerId?: string; consentDate?: string; consentRequestId?: string | null }>) {
      const freshState = getInitialState();
      
      // Explicitly mutate properties instead of returning a completely new object to guarantee immer proxy updates
      state.leadId = action.payload.id || '';
      state.leadSource = action.payload.source || '';
      state.leadStatus = action.payload.status || 'Open';
      state.farmerId = action.payload.farmerId || '';
      state.consentDate = action.payload.consentDate || null;
      state.consentRequestId = action.payload.consentRequestId !== undefined ? action.payload.consentRequestId : null;
      
      state.farmerDetails = {
        ...freshState.farmerDetails,
        ...(action.payload.farmerDetails || {})
      };
      
      state.creditInfo = [];
      state.callDetails = [];
      state.activities = [];
      state.visitSchedule = null;
      state.assignment = null;
      
      state.isLoadingConsent = false;
      state.consentError = null;
      state.isVerifyingOtp = false;
      state.isOtpVerified = false;
      state.isSubmitting = false;
    },
    setLeadSource(state, action: PayloadAction<string>) {
      state.leadSource = action.payload;
    },
    setLeadStatus(state, action: PayloadAction<string>) {
      state.leadStatus = action.payload;
    },
    setFarmerId(state, action: PayloadAction<string>) {
      state.farmerId = action.payload;
    },
    addCreditInfo(state, action: PayloadAction<Omit<CreditInfo, 'id'>>) {
      const newCreditInfo: CreditInfo = {
        id: `CI-${Math.floor(Math.random() * 10000)}`,
        ...action.payload
      };
      state.creditInfo.push(newCreditInfo);
    },
    updateFarmerDetails(state, action: PayloadAction<Partial<FarmerDetails>>) {
      state.farmerDetails = { ...state.farmerDetails, ...action.payload };
    },
    setVisitSchedule(state, action: PayloadAction<string>) {
      state.visitSchedule = { date: action.payload };
    },
    clearForm(state) {
      const currentLeadId = state.leadId;
      const freshState = getInitialState();
      
      // Keep the current ID but clear everything else
      Object.assign(state, freshState);
      state.leadId = currentLeadId;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchFarmerConsent.pending, (state) => {
        state.isLoadingConsent = true;
        state.consentError = null;
      })
      .addCase(searchFarmerConsent.fulfilled, (state, action) => {
        state.isLoadingConsent = false;

        if (action.payload?.consent_request) {
          state.consentRequestId = action.payload.consent_request;
        }

        // Mock setting details from response if they exist.
        // In reality, map response to state.farmerDetails here.
        if (action.payload?.farmer) {
          state.farmerDetails = {
            ...state.farmerDetails,
            ...action.payload.farmer
          }
        }
      })
      .addCase(searchFarmerConsent.rejected, (state, action) => {
        state.isLoadingConsent = false;
        state.consentError = action.payload as string;
      })
      .addCase(verifyOtpThunk.pending, (state) => {
        state.isVerifyingOtp = true;
      })
      .addCase(verifyOtpThunk.fulfilled, (state, action) => {
        state.isVerifyingOtp = false;
        state.isOtpVerified = true;
        state.farmerDetails.firstName = action.payload.firstName;
        state.farmerDetails.lastName = action.payload.lastName;
        state.farmerDetails.phoneNumber = action.payload.phoneNumber;
      })
      .addCase(verifyOtpThunk.rejected, (state) => {
        state.isVerifyingOtp = false;
      })
      .addCase(fetchLeadMetadataThunk.fulfilled, (state, action) => {
        const message = action.payload?.message;
        if (message?.status === 'success') {
          state.leadSourcesOptions = message.sources || [];
          state.leadStatusesOptions = message.statuses || [];
        }
      })
      .addCase(fetchCallDetailsThunk.fulfilled, (state, action) => {
        // Prevent race conditions where old thunk resolves after user navigates to a new lead
        if (state.leadId === '' || (state.leadId.replace('#', '') !== action.meta.arg.replace('#', ''))) return;

        const logsArray = action.payload?.message?.call_logs;
        if (logsArray) {
          state.callDetails = logsArray.map((log: any, index: number) => {
            return {
              id: log.ref_id ? `${log.ref_id}-${index}` : log.name || log.id || `call-${index}`,
              status: log.source || log.comment_type || log.status || 'Unknown',
              timing: formatTiming(log.timestamp || '', ' • ', true)
            };
          });
        }
      })
      .addCase(fetchActivitiesThunk.fulfilled, (state, action) => {
        // Prevent race conditions where old thunk resolves after user navigates to a new lead
        if (state.leadId === '' || (state.leadId.replace('#', '') !== action.meta.arg.replace('#', ''))) return;

        const timeline = action.payload?.message?.timeline;
        if (timeline) {
          state.activities = timeline.map((item: any, index: number) => {
            return {
              id: item.name || `activity-${index}`,
              author: item.comment_by || 'System',
              type: item.comment_type === 'Comment' ? 'note' : 'activity',
              content: item.content || '',
              timestamp: formatTiming(item.creation || item.timestamp || '', ' - ', false)
            };
          });
        }
      })
      .addCase(addActivityNoteThunk.fulfilled, (state, action) => {
        const { response, content } = action.payload;
        if (response?.message?.status === 'success') {
          state.activities.unshift({
            id: response.message.comment_id || `new-${Date.now()}`,
            author: 'Current User', // Will be dynamic later
            type: 'note',
            content: content,
            timestamp: formatTiming(new Date().toISOString(), ' - ', false)
          });
        }
      })
      .addCase(submitNewLeadThunk.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(submitNewLeadThunk.fulfilled, (state, action) => {
        state.isSubmitting = false;
        if (action.payload?.message?.lead_id) {
          state.leadId = action.payload.message.lead_id;
        }
      })
      .addCase(submitNewLeadThunk.rejected, (state, action) => {
        state.isSubmitting = false;
        // Could store error state here if needed
      })
      .addCase(assignLeadThunk.fulfilled, (state, action) => {
        const p = action.payload.payload;
        state.assignment = {
          agentId: p.assigneeId || 'AG-0000-0000',
          assigneeName: p.assigneeName,
          region: p.region || 'Addis Ababa',
          date: p.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };
      })
      .addCase(scheduleVisitThunk.fulfilled, (state, action) => {
        const p = action.payload.payload;
        // The time is not stored in the state definition currently, but date is.
        // We'll format the date string to be shown in the UI.
        const formattedDate = p.time ? `${p.date} • ${p.time}` : p.date;
        state.visitSchedule = { date: formattedDate };
      });
  }
});

export const {
  initializeLead,
  setLeadSource,
  setLeadStatus,
  setFarmerId,
  addCreditInfo,
  updateFarmerDetails,
  setVisitSchedule,
  clearForm
} = newLeadSlice.actions;

export const selectNewLeadState = (state: RootState) => state.newLead;

export default newLeadSlice.reducer;
