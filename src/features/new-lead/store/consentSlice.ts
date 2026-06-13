import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { newLeadService } from '../api/newLead.service';
import { extractData } from './helpers';
import { fetchLeadDetailsThunk } from './farmerSlice';

interface ConsentState {
  isLoadingConsent: boolean;
  consentError: string | null;
  isVerifyingOtp: boolean;
  isOtpVerified: boolean;
  consentRequestId: string | null;
  consentDate: string | null;
}

const initialState: ConsentState = {
  isLoadingConsent: false,
  consentError: null,
  isVerifyingOtp: false,
  isOtpVerified: false,
  consentRequestId: null,
  consentDate: null,
};

export const searchFarmerConsent = createAsyncThunk(
  'consent/searchConsent',
  async ({ farmerId, consentFormFilename, consentFormBase64, partnerName, leadId }: { farmerId: string; consentFormFilename: string; consentFormBase64: string; partnerName: string; leadId: string }, { rejectWithValue }) => {
    try {
      const response = await newLeadService.sendOtpAndCreateConsent({ farmerId, consentFormFilename, consentFormBase64, partnerName, leadId });
      return response as { success: boolean; consent_request: string; masked_phone: string };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Unknown Cause: Failed to request consent');
    }
  }
);

export const verifyOtpThunk = createAsyncThunk(
  'consent/verifyOtp',
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

const consentSlice = createSlice({
  name: 'consent',
  initialState,
  reducers: {
    clearConsentState(state) {
      return initialState;
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
        const payload = extractData(action.payload);
        if (payload.consent_request) {
          state.consentRequestId = payload.consent_request;
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
      .addCase('newLead/initializeLead', (state, action: any) => {
        const payload = action.payload;
        state.consentDate = payload.consentDate || null;
        state.consentRequestId = payload.consentRequestId !== undefined ? payload.consentRequestId : null;
        state.isLoadingConsent = false;
        state.consentError = null;
        state.isVerifyingOtp = false;
        state.isOtpVerified = false;
      })
      .addCase('newLead/clearForm', () => {
        return initialState;
      });
  }
});

export const { clearConsentState } = consentSlice.actions;
export default consentSlice.reducer;
