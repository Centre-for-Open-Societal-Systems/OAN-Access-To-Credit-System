import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { newLeadService, SendOtpAndCreateConsentResponse } from '../api/newLead.service';
import { fetchLeadDetailsThunk } from './farmerSlice';
import { initializeLead, clearForm, InitializeLeadPayload } from './actions';
import type { RootState } from '@/store';

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

export const searchFarmerConsent = createAsyncThunk<
  SendOtpAndCreateConsentResponse,
  { farmerId: string; consentFormFilename: string; consentFormBase64: string; partnerName: string; leadId: string }
>(
  'consent/searchConsent',
  async ({ farmerId, consentFormFilename, consentFormBase64, partnerName, leadId }, { rejectWithValue }) => {
    try {
      return await newLeadService.sendOtpAndCreateConsent({ farmerId, consentFormFilename, consentFormBase64, partnerName, leadId });
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown Cause: Failed to request consent');
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
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown Cause: Verification failed');
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
        state.consentRequestId = action.payload.consent_request;
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
      .addCase(initializeLead, (state, action) => {
        const payload = action.payload ?? {};
        state.consentDate = payload.consentDate || null;
        state.consentRequestId = payload.consentRequestId ?? null;
        state.isLoadingConsent = false;
        state.consentError = null;
        state.isVerifyingOtp = false;
        state.isOtpVerified = false;
      })
      .addCase(clearForm, () => {
        return initialState;
      });
  }
});

export const { clearConsentState } = consentSlice.actions;

export const selectConsentState = (state: RootState) => state.consent;

export default consentSlice.reducer;
