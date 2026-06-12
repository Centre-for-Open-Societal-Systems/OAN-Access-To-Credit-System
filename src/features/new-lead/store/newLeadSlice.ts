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
  type: string;
  title?: string;
  content: string;
  timestamp: string;
}

export interface FarmerDetails {
  firstName: string;
  lastName: string;
  location: string;
  phoneNumber: string;
  email: string;
  gender?: string;
}

interface NewLeadState {
  activeLeadId: string | null;
  // Form fields
  leadSource: string;
  leadStatus: string;
  farmerId: string;
  farmerDetails: FarmerDetails;

  // Metadata options
  leadSourcesOptions: string[];
  leadStatusesOptions: string[];
  loanTypesOptions: string[];

  // Child sections (dummy data for now)
  creditInfo: CreditInfo[];
  callDetails: CallDetail[];
  activities: Activity[];
  visitSchedule: { id?: string; date: string; location?: string } | null;
  assignment: { agentId?: string; assigneeName: string; region?: string; date?: string } | null;

  // UI state
  isLoadingConsent: boolean;
  isSearchingFarmer: boolean;
  searchedFarmer: FarmerDetails | null;
  consentError: string | null;
  isVerifyingOtp: boolean;
  isOtpVerified: boolean;
  isSubmitting: boolean;
  consentRequestId: string | null;
  consentDate: string | null;
}

const getInitialState = (): NewLeadState => ({
  activeLeadId: null,
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
  loanTypesOptions: [],
  creditInfo: [],
  callDetails: [],
  activities: [],
  visitSchedule: null,
  assignment: null,
  isLoadingConsent: false,
  isSearchingFarmer: false,
  searchedFarmer: null,
  consentError: null,
  isVerifyingOtp: false,
  isOtpVerified: false,
  isSubmitting: false,
  consentRequestId: null,
});

const initialState: NewLeadState = getInitialState();

export const searchFarmerThunk = createAsyncThunk(
  'newLead/searchFarmer',
  async (faydaId: string, { rejectWithValue }) => {
    try {
      const response = await newLeadService.searchFarmer(faydaId);
      return response;
    } catch (error) {
      const err = error as Error & { responseData?: { exc_type?: string } };
      if (err.responseData?.exc_type === 'DoesNotExistError') {
        return rejectWithValue(`Farmer with Fayda ID '${faydaId}' not found.`);
      }
      return rejectWithValue(err.message || 'Unknown Cause: Farmer search failed.');
    }
  }
);

export const searchFarmerConsent = createAsyncThunk(
  'newLead/searchConsent',
  async ({ farmerId, consentFormFilename, consentFormBase64, partnerName, leadId }: { farmerId: string; consentFormFilename: string; consentFormBase64: string; partnerName?: string; leadId?: string }, { rejectWithValue }) => {
    try {
      const response = await newLeadService.sendOtpAndCreateConsent({ farmerId, consentFormFilename, consentFormBase64, partnerName, leadId });
      // The backend response structure for this API is assumed to contain a success flag and possibly a consent_request id
      return response as { success: boolean; consent_request?: string; masked_phone?: string; };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Unknown Cause: Failed to search farmer');
    }
  }
);
export const verifyOtpThunk = createAsyncThunk(
  'newLead/verifyOtp',
  async (payload: { otp_code: string; leadId: string }, { dispatch, rejectWithValue }) => {
    try {
      const response = await newLeadService.verifyOtp({
        leadId: payload.leadId,
        otp_code: payload.otp_code
      });
      await dispatch(fetchLeadDetailsThunk(payload.leadId));
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Unknown Cause: Verification failed');
    }
  }
);

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

export const fetchVisitSchedulesThunk = createAsyncThunk(
  'newLead/fetchVisitSchedules',
  async (leadId: string, { rejectWithValue }) => {
    try {
      const response = await newLeadService.getVisitSchedules(leadId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Unknown Cause: Failed to fetch visit schedules');
    }
  }
);

export const fetchLeadDetailsThunk = createAsyncThunk(
  'newLead/fetchLeadDetails',
  async (leadId: string, { rejectWithValue }) => {
    try {
      const response = await newLeadService.getLeadDetails(leadId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Unknown Cause: Failed to fetch lead details');
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

export const fetchAssignmentInfoThunk = createAsyncThunk(
  'newLead/fetchAssignmentInfo',
  async (assigneeEmail: string, { rejectWithValue }) => {
    try {
      const response = await newLeadService.getAssignableUsers(assigneeEmail);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Unknown Cause: Failed to fetch assignment info');
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
      return rejectWithValue(error.message || 'Unknown Cause: Failed to create lead');
    }
  }
);

export const assignLeadThunk = createAsyncThunk(
  'newLead/assignLead',
  async (payload: { leadId: string; assigneeName: string; assigneeId?: string; gender?: string; region?: string; date?: string; email?: string }, { rejectWithValue }) => {
    try {
      const response = await newLeadService.assignLead(payload);
      // Pass the payload down so we can update local state
      return { ...response, payload };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Unknown Cause: Failed to assign lead');
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

export const scheduleVisitThunk = createAsyncThunk(
  'newLead/scheduleVisit',
  async (payload: { leadId: string; date: string; time?: string; location?: string; agenda?: string; region?: string; zone?: string; woreda?: string; kebele?: string; address?: string; }, { rejectWithValue }) => {
    try {
      let formattedTime = "09:00:00";
      if (payload.time) {
        if (payload.time.includes('M')) {
          const [timePart, modifier] = payload.time.split(' ');
          const [hoursStr, minutes] = timePart.split(':');
          let hours = parseInt(hoursStr, 10);

          if (hours === 12) hours = 0;
          if (modifier.toUpperCase() === 'PM') hours += 12;

          formattedTime = `${hours.toString().padStart(2, '0')}:${minutes}:00`;
        } else {
          // Fallback in case it's already HH:mm or HH:mm:ss
          formattedTime = payload.time.length === 5 ? `${payload.time}:00` : payload.time;
        }
      }

      const apiPayload = {
        lead_id: decodeURIComponent(payload.leadId).replace(/^#/, ''),
        visit_date: payload.date,
        visit_time: formattedTime,
        region: payload.region,
        zone: payload.zone,
        woreda: payload.woreda,
        kebele: payload.kebele,
        meeting_location: payload.location,
        notes: payload.agenda,
      };
      const response = await newLeadService.scheduleVisit(apiPayload);
      return { ...response, payload };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Unknown Cause: Failed to schedule visit');
    }
  }
);

export const updateVisitScheduleStatusThunk = createAsyncThunk(
  'newLead/updateVisitScheduleStatus',
  async (payload: { leadId: string; scheduleId: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await newLeadService.updateVisitScheduleStatus({
        schedule_id: payload.scheduleId,
        status: payload.status,
      });
      return { response, payload };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Unknown Cause: Failed to update visit schedule status');
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

// Helpers for robust Frappe API payload extraction
const extractList = (payload: any, key: string): any[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload[key])) return payload[key];
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload.message)) return payload.message;
  if (payload.message && Array.isArray(payload.message[key])) return payload.message[key];
  if (payload.data && Array.isArray(payload.data[key])) return payload.data[key];

  // Fallback: if it's an object with exactly one key that is an array, return it
  const values = Object.values(payload);
  if (values.length === 1 && Array.isArray(values[0])) return values[0];

  return [];
};

const extractData = (payload: any): any => {
  if (!payload) return {};
  if (Array.isArray(payload)) return payload;
  return payload.data || payload.results || payload;
};

const newLeadSlice = createSlice({
  name: 'newLead',
  initialState,
  reducers: {
    initializeLead(state, action: PayloadAction<{ id?: string; source?: string; status?: string; farmerDetails?: Partial<FarmerDetails>; farmerId?: string; consentDate?: string; consentRequestId?: string | null }>) {
      const freshState = getInitialState();
      const isSameLead = action.payload.id === state.activeLeadId;

      state.activeLeadId = action.payload.id || null;

      // Explicitly mutate properties instead of returning a completely new object to guarantee immer proxy updates
      state.farmerDetails = {
        ...freshState.farmerDetails,
        ...(action.payload.farmerDetails || {})
      };
      state.leadStatus = action.payload.status || '';
      state.farmerId = action.payload.farmerId || '';
      state.consentDate = action.payload.consentDate || null;
      state.consentRequestId = action.payload.consentRequestId !== undefined ? action.payload.consentRequestId : null;

      if (!isSameLead) {
        state.creditInfo = [];
        state.callDetails = [];
        state.activities = [];
        state.visitSchedule = null;
        state.assignment = null;
      }

      state.isLoadingConsent = false;
      state.searchedFarmer = null;
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
      state.searchedFarmer = null;
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
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchFarmerThunk.pending, (state) => {
        state.isSearchingFarmer = true;
        state.searchedFarmer = null;
        state.consentError = null;
      })
      .addCase(searchFarmerThunk.fulfilled, (state, action) => {
        state.isSearchingFarmer = false;
        const payload = action.payload;
        if (payload && (payload.status === 'success' || payload.farmer)) {
          const farmerObj = payload.farmer || payload;
          const nameParts = farmerObj.name?.split(' ') || [];
          state.searchedFarmer = {
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            phoneNumber: farmerObj.phone || farmerObj.mobile || '',
            email: farmerObj.email || '',
            location: farmerObj.location || '',
          };
          state.consentError = null;
        } else {
          state.searchedFarmer = null;
          state.consentError = (payload && typeof payload.message === 'string') ? payload.message : 'Farmer not found.';
        }
      })
      .addCase(searchFarmerThunk.rejected, (state, action) => {
        state.isSearchingFarmer = false;
        state.searchedFarmer = null;
        state.consentError = action.payload as string || 'Farmer not found.';
      })
      .addCase(searchFarmerConsent.pending, (state) => {
        state.isLoadingConsent = true;
        state.consentError = null;
      })
      .addCase(searchFarmerConsent.fulfilled, (state, action) => {
        state.isLoadingConsent = false;
        const payload = extractData(action.payload);

        if (payload.consent_request) {
          state.consentRequestId = payload.consent_request;
        }

        if (payload.farmer) {
          state.farmerDetails = {
            ...state.farmerDetails,
            ...payload.farmer
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
      .addCase(verifyOtpThunk.fulfilled, (state) => {
        state.isVerifyingOtp = false;
        state.isOtpVerified = true;
      })
      .addCase(verifyOtpThunk.rejected, (state) => {
        state.isVerifyingOtp = false;
      })
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
      .addCase(fetchLeadDetailsThunk.fulfilled, (state, action) => {
        const lead = extractData(action.payload);
        if (lead && Object.keys(lead).length > 0 && !Array.isArray(lead)) {
          state.farmerDetails = {
            firstName: lead.first_name || '',
            lastName: lead.last_name || '',
            phoneNumber: lead.phone_number || '',
            location: lead.location || '',
            email: lead.email || '',
            gender: lead.gender || ''
          };
          state.farmerId = lead.farmer_id || '';
        }
      })
      .addCase(fetchSpecificLeadThunk.fulfilled, (state, action) => {
        const leads = extractList(action.payload, 'results');
        if (leads && leads.length > 0) {
          const lead = leads[0];
          if (lead.status) state.leadStatus = lead.status;
          if (lead.lead_source) state.leadSource = lead.lead_source;
        }
      })
      .addCase(fetchVisitSchedulesThunk.fulfilled, (state, action) => {
        let schedules = extractData(action.payload);

        if (!Array.isArray(schedules) && schedules && Object.keys(schedules).length > 0) {
          schedules = [schedules];
        }

        if (Array.isArray(schedules) && schedules.length > 0) {
          // Sort descending by creation date using string comparison to avoid NaN issues in JS Date parsing
          const sortedSchedules = [...schedules].sort((a, b) => {
            const dateA = a.creation || '';
            const dateB = b.creation || '';
            return dateB.localeCompare(dateA);
          });

          // Filter out completed schedules so they don't count as active scheduled visits
          const activeSchedules = sortedSchedules.filter((s: any) => s.status !== 'Completed');

          if (activeSchedules.length > 0) {
            const latest = activeSchedules[0];
            state.visitSchedule = {
              id: latest.name,
              date: latest.visit_date,
              location: latest.meeting_location || (latest.region ? `${latest.region}, ${latest.zone}` : '')
            };
          } else {
            state.visitSchedule = null;
          }
        } else {
          state.visitSchedule = null;
        }
      })
      .addCase(updateVisitScheduleStatusThunk.fulfilled, (state, action) => {
        const { status } = action.payload.payload;
        if (status === 'Completed') {
          state.visitSchedule = null;
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
        // Since the API request succeeded, we can safely add the activity
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
        // state.leadId is removed, rely on URL redirect instead
      })
      .addCase(submitNewLeadThunk.rejected, (state) => {
        state.isSubmitting = false;
        // Could store error state here if needed
      })
      .addCase(assignLeadThunk.fulfilled, (state, action) => {
        const p = action.payload.payload;
        state.assignment = {
          agentId: p.assigneeId,
          assigneeName: p.assigneeName,
          region: p.region,
          date: p.date
        };
      })
      .addCase(scheduleVisitThunk.fulfilled, (state, action) => {
        const p = action.payload.payload;
        state.visitSchedule = {
          date: p.date,
          location: p.location || (p.region ? `${p.region}, ${p.zone}` : '')
        };
      })
      .addCase(updateLeadStatusThunk.fulfilled, (state, action) => {
        state.leadStatus = action.payload.payload.status;
      })
      .addCase(fetchAssignmentInfoThunk.fulfilled, (state, action) => {
        const results = action.payload.message?.results || action.payload.results || [];
        if (results && results.length > 0) {
          const user = results[0];
          state.assignment = {
            agentId: user.agent_id,
            assigneeName: user.full_name,
            region: user.region,
            date: undefined
          };
        } else {
          state.assignment = {
            assigneeName: action.meta.arg
          };
        }
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

export const selectIsLeadFinalized = (state: RootState) => {
  const status = state.newLead.leadStatus?.toLowerCase() || '';
  return ['rejected', 'processed', 'granted'].includes(status);
};

export default newLeadSlice.reducer;
