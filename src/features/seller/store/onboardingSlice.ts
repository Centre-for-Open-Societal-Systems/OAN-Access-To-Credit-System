// eslint-disable-next-line boundaries/dependencies -- TODO (2026-08-23): needs to be fixed later; hiding for now as this existed before our changes
import { getMeThunk } from '@/features/auth/store/authSlice';
import { logger } from '@/lib/logger';
import type { RootState } from '@/store';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { onboardingService, type BankProfile } from '../api/onboarding.service';
import type {
    RegisterBankPayload,
    RegisterSellerPayload,
    SaveOrgContactsPayload, UploadKycDocumentPayload
} from '../types/onboarding.types';

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';
// saveOrgContacts and uploadKycDocument share the same mutationStatus/mutationError
// pair below. This records which of them most recently set it, so components
// driven by a different action on the same page (e.g. the KYC document card vs.
// the contacts card) don't both surface an error that belongs to their sibling.
type MutationSource = 'contacts' | 'document' | null;

interface OnboardingState {
  bankProfile: BankProfile | null;
  profileStatus: AsyncStatus;
  profileError: string | null;
  registrationStatus: AsyncStatus;
  mutationStatus: AsyncStatus;
  registrationError: string | null;
  mutationError: string | null;
  mutationSource: MutationSource;
}

const initialState: OnboardingState = {
  bankProfile: null,
  profileStatus: 'idle',
  profileError: null,
  registrationStatus: 'idle',
  mutationStatus: 'idle',
  registrationError: null,
  mutationError: null,
  mutationSource: null,
};

export const registerBank = createAsyncThunk(
  'sellerOnboarding/registerBank',
  async (payload: RegisterBankPayload, { dispatch, rejectWithValue }) => {
    try {
      const response = await onboardingService.registerBank(payload);
      // The bank is now provisioned server-side, but our cached session still
      // has `bankId: null`. Refresh it before resolving so the dashboard's
      // onboarding gate (which redirects null-bankId admins back to /onboarding)
      // lets the user through once they leave this page.
      await dispatch(getMeThunk());
      return response.data;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to register bank organisation';
      logger.error('registerBank thunk failed', msg);
      return rejectWithValue(msg);
    }
  }
);

export const registerSeller = createAsyncThunk(
  'sellerOnboarding/registerSeller',
  async (payload: RegisterSellerPayload, { rejectWithValue }) => {
    try {
      const response = await onboardingService.registerSeller(payload);
      return response.data;
    } catch (error) {
      // Pass the error itself (not `{ error }`) so the console shows its message
      // and stack instead of serializing to an empty `{}`.
      logger.error('registerSeller thunk failed', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to register seller account');
    }
  }
);

export const saveOrgContacts = createAsyncThunk(
  'sellerOnboarding/saveOrgContacts',
  async (payload: SaveOrgContactsPayload, { rejectWithValue }) => {
    try {
      const response = await onboardingService.saveOrgContacts(payload);
      return response.data;
    } catch (error) {
      logger.error('saveOrgContacts thunk failed', { payload, error });
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to save organization contacts');
    }
  }
);

export const uploadKycDocument = createAsyncThunk(
  'sellerOnboarding/uploadKycDocument',
  async (payload: UploadKycDocumentPayload, { rejectWithValue }) => {
    try {
      const response = await onboardingService.uploadKycDocument(payload);
      return response.data;
    } catch (error) {
      logger.error('uploadKycDocument thunk failed', { filename: payload.filename, error });
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to upload KYC document');
    }
  }
);

export const fetchBankProfile = createAsyncThunk(
  'sellerOnboarding/fetchBankProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await onboardingService.getBankProfile();
      return response.data;
    } catch (error) {
      logger.error('fetchBankProfile thunk failed', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to load bank profile');
    }
  }
);

const onboardingSlice = createSlice({
  name: 'sellerOnboarding',
  initialState,
  reducers: {
    clearOnboardingErrors(state) {
      state.mutationError = null;
      state.mutationSource = null;
      state.registrationError = null;
      state.profileError = null;
      state.mutationStatus = 'idle';
      state.registrationStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerBank.pending, (s) => { s.registrationStatus = 'loading'; s.registrationError = null; })
      .addCase(registerBank.fulfilled, (s) => { s.registrationStatus = 'succeeded'; })
      .addCase(registerBank.rejected, (s, action) => { s.registrationStatus = 'failed'; s.registrationError = action.payload as string; })
      .addCase(registerSeller.pending, (s) => { s.registrationStatus = 'loading'; s.registrationError = null; })
      .addCase(registerSeller.fulfilled, (s) => { s.registrationStatus = 'succeeded'; })
      .addCase(registerSeller.rejected, (s, action) => { s.registrationStatus = 'failed'; s.registrationError = action.payload as string; })
      .addCase(saveOrgContacts.pending, (s) => { s.mutationStatus = 'loading'; s.mutationError = null; s.mutationSource = 'contacts'; })
      .addCase(saveOrgContacts.fulfilled, (s, action) => {
        s.mutationStatus = 'succeeded';
        if (s.bankProfile) {
          s.bankProfile.org_grievance_updated = true;
          s.bankProfile.gro_name = action.meta.arg.gro_name;
          s.bankProfile.gro_mobile = action.meta.arg.gro_mobile;
          s.bankProfile.ops_name = action.meta.arg.ops_name;
          s.bankProfile.ops_mobile = action.meta.arg.ops_mobile;
        }
      })
      .addCase(saveOrgContacts.rejected, (s, action) => { s.mutationStatus = 'failed'; s.mutationError = action.payload as string; s.mutationSource = 'contacts'; })
      .addCase(uploadKycDocument.pending, (s) => { s.mutationStatus = 'loading'; s.mutationError = null; s.mutationSource = 'document'; })
      .addCase(uploadKycDocument.fulfilled, (s, action) => {
        s.mutationStatus = 'succeeded';
        if (s.bankProfile) {
          s.bankProfile.kyc_document = action.payload.file_url;
          s.bankProfile.kyc_document_uploaded = true;
        }
      })
      .addCase(uploadKycDocument.rejected, (s, action) => { s.mutationStatus = 'failed'; s.mutationError = action.payload as string; s.mutationSource = 'document'; })
      .addCase(fetchBankProfile.pending, (s) => {
        s.profileStatus = 'loading';
        s.profileError = null;
      })
      .addCase(fetchBankProfile.fulfilled, (s, action) => {
        s.profileStatus = 'succeeded';
        s.bankProfile = action.payload;
      })
      .addCase(fetchBankProfile.rejected, (s, action) => {
        s.profileStatus = 'failed';
        s.profileError = action.payload as string;
      });
  },
});

export const { clearOnboardingErrors } = onboardingSlice.actions;
export const sellerOnboardingReducer = onboardingSlice.reducer;
export default onboardingSlice.reducer;

export const selectOnboardingRegistrationStatus = (state: RootState) => state.sellerOnboarding.registrationStatus;
export const selectOnboardingRegistrationError = (state: RootState) => state.sellerOnboarding.registrationError;
export const selectOnboardingMutationStatus = (state: RootState) => state.sellerOnboarding.mutationStatus;
export const selectOnboardingMutationError = (state: RootState) => state.sellerOnboarding.mutationError;
export const selectOnboardingMutationSource = (state: RootState) => state.sellerOnboarding.mutationSource;
export const selectBankProfile = (state: RootState) => state.sellerOnboarding.bankProfile;
export const selectBankProfileStatus = (state: RootState) => state.sellerOnboarding.profileStatus;
export const selectBankProfileError = (state: RootState) => state.sellerOnboarding.profileError;
