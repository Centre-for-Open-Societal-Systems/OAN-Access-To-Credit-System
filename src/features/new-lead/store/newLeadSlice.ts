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
  farmerId: string;
  farmerDetails: FarmerDetails;
  
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

const initialState: NewLeadState = {
  leadId: '',
  leadSource: '',
  farmerId: '',
  consentDate: null,
  farmerDetails: {
    firstName: '',
    lastName: '',
    location: '',
    phoneNumber: '',
    email: '',
  },
  creditInfo: [
    { id: '1', type: 'Crop Loan', amount: 'ETB 90,0000', purpose: 'Met with farmer at the cooperative office. He has all his land documents ready. Recommended for the Fertilizer 2026 campaign.' }
  ],
  callDetails: [
    { id: '1', status: 'Missed Call', timing: 'May 23, 2026 • 02:30 PM IST' }
  ],
  activities: [
    { id: '1', author: 'Abebe Kebede', type: 'note', content: 'Met with farmer at the cooperative office. He has all his land documents ready. Recommended for the Fertilizer 2026 campaign.', timestamp: 'May 24, 2026 - 10:30 AM' }
  ],
  visitSchedule: null,
  assignment: {
    agentId: 'AG-2024-0156',
    assigneeName: 'Sara Bekele',
    region: 'Oromia',
    date: 'May 15, 2026'
  },
  isLoadingConsent: false,
  consentError: null,
  isVerifyingOtp: false,
  isOtpVerified: false,
  isSubmitting: false,
  consentRequestId: null,
};

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

const newLeadSlice = createSlice({
  name: 'newLead',
  initialState,
  reducers: {
    initializeLead(state, action: PayloadAction<{ id?: string; source?: string; farmerDetails?: Partial<FarmerDetails>; farmerId?: string; consentDate?: string; consentRequestId?: string | null }>) {
      Object.assign(state, initialState);
      if (action.payload.id) state.leadId = action.payload.id;
      if (action.payload.source) state.leadSource = action.payload.source;
      if (action.payload.farmerId) state.farmerId = action.payload.farmerId;
      if (action.payload.consentDate) state.consentDate = action.payload.consentDate;
      if (action.payload.consentRequestId !== undefined) state.consentRequestId = action.payload.consentRequestId;
      if (action.payload.farmerDetails) {
        state.farmerDetails = { ...state.farmerDetails, ...action.payload.farmerDetails };
      }
    },
    setLeadSource(state, action: PayloadAction<string>) {
      state.leadSource = action.payload;
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
    addActivityNote(state, action: PayloadAction<string>) {
      state.activities.unshift({
        id: Date.now().toString(),
        author: 'Current User', // Will be dynamic later
        type: 'note',
        content: action.payload,
        timestamp: new Date().toLocaleString()
      });
    },
    setVisitSchedule(state, action: PayloadAction<string>) {
      state.visitSchedule = { date: action.payload };
    },
    clearForm(state) {
      return { ...initialState, leadId: state.leadId }; // preserve leadId
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
  setFarmerId,
  addCreditInfo,
  updateFarmerDetails,
  addActivityNote,
  setVisitSchedule,
  clearForm
} = newLeadSlice.actions;

export const selectNewLeadState = (state: RootState) => state.newLead;

export default newLeadSlice.reducer;
