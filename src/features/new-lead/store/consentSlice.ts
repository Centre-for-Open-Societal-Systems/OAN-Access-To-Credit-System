import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { newLeadService, SendOtpAndCreateConsentResponse, SubmitConsentResponse } from '../api/newLead.service';
import { fetchLeadDetailsThunk } from './farmerSlice';
import { initializeLead, clearForm, InitializeLeadPayload } from './actions';
import type { RootState } from '@/store';

interface ConsentState {
  isLoadingConsent: boolean;
  consentError: string | null;
  isVerifyingOtp: boolean;
  isOtpVerified: boolean;
  isSubmittingConsent: boolean;
  consentRequestId: string | null;
  consentDate: string | null;
  consentFormFilename: string | null;
  consentFormBase64: string | null;
}

const initialState: ConsentState = {
  isLoadingConsent: false,
  consentError: null,
  isVerifyingOtp: false,
  isOtpVerified: false,
  isSubmittingConsent: false,
  consentRequestId: null,
  consentDate: null,
  consentFormFilename: null,
  consentFormBase64: null,
};

export const searchFarmerConsent = createAsyncThunk<
  SendOtpAndCreateConsentResponse,
  { farmerId: string; partnerName: string; leadId: string }
>(
  'consent/searchConsent',
  async ({ farmerId, leadId }, { rejectWithValue }) => {
    try {
      return await newLeadService.sendOtpAndCreateConsent({ farmerId, leadId });
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown Cause: Failed to request consent');
    }
  }
);

export const verifyOtpThunk = createAsyncThunk<
  any,
  { otp_code: string; leadId: string },
  { state: RootState }
>(
  'consent/verifyOtp',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const consentRequestId = state.consent.consentRequestId;
      if (!consentRequestId) {
        throw new Error('No active consent request found. Please request OTP again.');
      }
      return await newLeadService.verifyOtp({
        leadId: payload.leadId,
        consent_request: consentRequestId,
        otp_code: payload.otp_code
      });
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown Cause: Verification failed');
    }
  }
);

export const submitConsentThunk = createAsyncThunk<
  SubmitConsentResponse,
  {
    leadId: string;
    consent_type?: string;
    consent_reason_id?: number;
    validity_months?: number;
    allowed_data_field_ids?: (number | string)[];
    consentFormFilename: string;
    consentFormBase64: string;
  },
  { state: RootState }
>(
  'consent/submitConsent',
  async (payload, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState();
      const consentRequestId = state.consent.consentRequestId;
      
      if (!consentRequestId) {
        throw new Error('Missing active consent request.');
      }
      
      const response = await newLeadService.submitConsent({
        lead_id: payload.leadId,
        consent_request: consentRequestId,
        consent_type: payload.consent_type,
        consent_reason_id: payload.consent_reason_id,
        validity_months: payload.validity_months,
        consent_form_filename: payload.consentFormFilename,
        consent_form_base64: payload.consentFormBase64,
        allowed_data_field_ids: payload.allowed_data_field_ids,
      });
      
      await dispatch(fetchLeadDetailsThunk({ leadId: payload.leadId, shouldPoll: true }));
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to submit consent details');
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
      .addCase(verifyOtpThunk.rejected, (state, action) => {
        state.isVerifyingOtp = false;
        state.consentError = action.payload as string;
      })
      .addCase(submitConsentThunk.pending, (state) => {
        state.isSubmittingConsent = true;
        state.consentError = null;
      })
      .addCase(submitConsentThunk.fulfilled, (state) => {
        state.isSubmittingConsent = false;
        state.consentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      })
      .addCase(submitConsentThunk.rejected, (state, action) => {
        state.isSubmittingConsent = false;
        state.consentError = action.payload as string;
      })
      .addCase(initializeLead, (state, action) => {
        const payload = action.payload ?? {};
        state.consentDate = payload.consentDate || null;
        state.consentRequestId = payload.consentRequestId ?? null;
        state.isLoadingConsent = false;
        state.consentError = null;
        state.isVerifyingOtp = false;
        state.isOtpVerified = false;
        state.isSubmittingConsent = false;
        state.consentFormFilename = null;
        state.consentFormBase64 = null;
      })
      .addCase(clearForm, () => {
        return initialState;
      });
  }
});

export const { clearConsentState } = consentSlice.actions;

export const selectConsentState = (state: RootState) => state.consent;

export const consentReducer = consentSlice.reducer;
