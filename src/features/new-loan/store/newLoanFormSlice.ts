import { logger } from '@/lib/logger';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { loanService, type LoanApplicationSummary } from '@/features/loans/api/loan.service';
import { newLeadService } from '@/features/new-lead/api/newLead.service';
import type { RootState } from '../../../store';
import { normalizeLeadId } from '@/lib/utils';

// Highest reachable form step (steps 1–3); step 4 is the post-submit success view.
const MAX_FORM_STEP = 3;

interface ConsentRequestData {
  consent_request: string;
  transaction_id?: string;
  masked_phone?: string;
}

interface SupportingDoc {
  file_id: string;
  file_name: string;
  document_type: string;
  is_verified?: boolean;
}

interface LoanFormState {
  currentStep: number;
  applicationId: string | null;
  consentRequestData: ConsentRequestData | null;
  otpVerified: boolean;
  uploadedDocuments: Record<string, unknown>;
  formData: Record<string, string>;
  loadedSteps: Record<number, boolean>;
  supportingDocs: SupportingDoc[];

  // API loading states
  loadingStates: {
    createApp: boolean;
    sendOtp: boolean;
    verifyOtp: boolean;
    uploadDoc: boolean;
    submitApp: boolean;
    fetchApp: boolean;
  };
  errors: Record<string, string | null>;
}

const loadInitialState = (): LoanFormState => {
  if (typeof window !== 'undefined') {
    const saved = sessionStorage.getItem('loan_form_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          loadingStates: { createApp: false, sendOtp: false, verifyOtp: false, uploadDoc: false, submitApp: false, fetchApp: false },
          errors: {},
          loadedSteps: parsed.loadedSteps || {},
          supportingDocs: parsed.supportingDocs || []
        };
      } catch (e) {
        logger.error('Failed to parse saved loan form state');
      }
    }
  }
  return {
    currentStep: 1,
    applicationId: null,
    consentRequestData: null,
    otpVerified: false,
    uploadedDocuments: {},
    formData: {},
    loadedSteps: {},
    supportingDocs: [],
    loadingStates: { createApp: false, sendOtp: false, verifyOtp: false, uploadDoc: false, submitApp: false, fetchApp: false },
    errors: {},
  };
};

const initialState: LoanFormState = loadInitialState();

// --- ASYNC THUNKS ---

export const createLoanApplicationAPI = createAsyncThunk(
  'loanForm/createApplication',
  async (leadId: string, { rejectWithValue }) => {
    try {
      const response = await loanService.createLoanApplication(leadId);
      const appId = response?.data?.application_id;
      if (!appId) throw new Error('No Application ID returned');
      return appId;
    } catch (err) {
      const error = err as Error & { responseData?: { message?: { name?: string } } };
      if (error.responseData?.message?.name) {
        return rejectWithValue({
          message: error.message || 'Failed to create application',
          name: error.responseData.message.name
        });
      }
      return rejectWithValue(error.message || 'Failed to create application');
    }
  }
);

export const createAndVerifyLoanApplicationThunk = createAsyncThunk<
  string,
  string,
  { state: RootState }
>(
  'loanForm/createAndVerifyLoanApplication',
  async (leadId: string, { dispatch, rejectWithValue }) => {
    try {
      const appId = await dispatch(createLoanApplicationAPI(leadId)).unwrap();
      dispatch(setApplicationId(appId));
      return appId;
    } catch (err) {
      const msg = err instanceof Error ? err.message : (typeof err === 'string' ? err : 'Failed to create and verify loan application');
      return rejectWithValue(msg);
    }
  }
);

export const fetchLoanApplicationAPI = createAsyncThunk<
  LoanApplicationSummary,
  string,
  { state: RootState }
>(
  'loanForm/fetchApplication',
  async (leadId: string, { rejectWithValue }) => {
    try {
      const cleanLeadId = normalizeLeadId(leadId);
      return await loanService.findApplicationByLeadId(cleanLeadId);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch application');
    }
  }
);

export const nextStepAPI = createAsyncThunk<number, void, { state: RootState }>(
  'loanForm/nextStep',
  async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const { currentStep, applicationId } = state.loanForm;
    const nextStepVal = currentStep + 1;
    if (nextStepVal > MAX_FORM_STEP) return currentStep;

    try {
      if (applicationId) {
        await loanService.updateLoanStep(applicationId, nextStepVal);
      }
      return nextStepVal;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to update step');
    }
  }
);

export const prevStepAPI = createAsyncThunk<number, void, { state: RootState }>(
  'loanForm/prevStep',
  async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const { currentStep, applicationId } = state.loanForm;
    const prevStepVal = currentStep - 1;
    if (prevStepVal < 1) return currentStep;

    try {
      if (applicationId) {
        await loanService.updateLoanStep(applicationId, prevStepVal);
      }
      return prevStepVal;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to update step');
    }
  }
);

export const setStepAPI = createAsyncThunk<number, number, { state: RootState }>(
  'loanForm/setStep',
  async (step: number, { getState, rejectWithValue }) => {
    const state = getState();
    const { applicationId } = state.loanForm;
    try {
      if (applicationId) {
        await loanService.updateLoanStep(applicationId, step);
      }
      return step;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to update step');
    }
  }
);

// The request_otp endpoint only creates the consent request; the consent form
// document is uploaded separately and persisted at submit time. Only farmerId /
// leadId are sent here, so the payload type is scoped to what the service accepts
// to avoid silently dropping any extra fields.
export const sendOtpAPI = createAsyncThunk(
  'loanForm/sendOtp',
  async (payload: { farmerId: string; leadId?: string }, { rejectWithValue }) => {
    try {
      const response = await newLeadService.sendOtpAndCreateConsent(payload);
      return response;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to send OTP');
    }
  }
);

export const verifyOtpAPI = createAsyncThunk<
  any,
  { leadId?: string; otp_code: string },
  { state: RootState }
>(
  'loanForm/verifyOtp',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const consentRequest = state.loanForm.consentRequestData?.consent_request;
      if (!consentRequest) {
        throw new Error('No active consent request found. Please request OTP again.');
      }
      const response = await newLeadService.verifyOtp({
        ...(payload.leadId ? { leadId: payload.leadId } : {}),
        consent_request: consentRequest,
        otp_code: payload.otp_code
      });
      return response;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to verify OTP');
    }
  }
);

export const uploadDocumentAPI = createAsyncThunk(
  'loanForm/uploadDocument',
  async (payload: { application_id: string; document_type: string; file: File }, { rejectWithValue }) => {
    try {
      const response = await loanService.uploadSupportingDocument(payload.application_id, payload.document_type, payload.file);
      return { document_type: payload.document_type, data: response };
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to upload document');
    }
  }
);

export const submitApplicationAPI = createAsyncThunk(
  'loanForm/submitApplication',
  async (applicationId: string, { rejectWithValue }) => {
    try {
      const response = await loanService.submitApplication(applicationId);
      return response;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to submit application');
    }
  }
);

// --- SLICE ---

export const newLoanFormSlice = createSlice({
  name: 'loanForm',
  initialState,
  reducers: {
    setFormData: (state, action: PayloadAction<Record<string, string>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    setApplicationId: (state, action: PayloadAction<string>) => {
      state.applicationId = action.payload;
    },
    setStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    nextStep: (state) => {
      if (state.currentStep < 3) {
        state.currentStep += 1;
      }
    },
    prevStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
      }
    },
    markStepLoaded: (state, action: PayloadAction<number>) => {
      state.loadedSteps[action.payload] = true;
    },
    setSupportingDocs: (state, action: PayloadAction<SupportingDoc[]>) => {
      state.supportingDocs = action.payload;
    },
    resetForm: () => {
      return {
        currentStep: 1,
        applicationId: null,
        consentRequestData: null,
        otpVerified: false,
        uploadedDocuments: {},
        formData: {},
        loadedSteps: {},
        supportingDocs: [],
        loadingStates: { createApp: false, sendOtp: false, verifyOtp: false, uploadDoc: false, submitApp: false, fetchApp: false },
        errors: {}
      };
    },
    clearError: (state, action: PayloadAction<string>) => {
      state.errors[action.payload] = null;
    }
  },
  extraReducers: (builder) => {
    // createApplication
    builder.addCase(createLoanApplicationAPI.pending, (state) => { state.loadingStates.createApp = true; state.errors.createApp = null; });
    builder.addCase(createLoanApplicationAPI.fulfilled, (state, action) => {
      state.loadingStates.createApp = false;
      state.applicationId = action.payload;
    });
    builder.addCase(createLoanApplicationAPI.rejected, (state, action) => { state.loadingStates.createApp = false; state.errors.createApp = action.payload as string; });

    // fetchLoanApplicationAPI
    builder.addCase(fetchLoanApplicationAPI.pending, (state) => { state.loadingStates.fetchApp = true; state.errors.fetchApp = null; });
    builder.addCase(fetchLoanApplicationAPI.fulfilled, (state, action) => {
      state.loadingStates.fetchApp = false;
      if (action.payload) {
        const app = action.payload as { application_id?: string; step?: number };
        state.applicationId = app.application_id || null;
        if (app.step && typeof app.step === 'number') {
          state.currentStep = app.step;
        }
      } else {
        // Clear applicationId to avoid stale state from previous lead
        state.applicationId = null;
        state.currentStep = 1;
      }
    });
    builder.addCase(fetchLoanApplicationAPI.rejected, (state, action) => { state.loadingStates.fetchApp = false; state.errors.fetchApp = action.payload as string; });

    // nextStepAPI
    builder.addCase(nextStepAPI.fulfilled, (state, action) => {
      state.currentStep = action.payload;
    });

    // prevStepAPI
    builder.addCase(prevStepAPI.fulfilled, (state, action) => {
      state.currentStep = action.payload;
    });

    // setStepAPI
    builder.addCase(setStepAPI.fulfilled, (state, action) => {
      state.currentStep = action.payload;
    });

    // sendOtp
    builder.addCase(sendOtpAPI.pending, (state) => { state.loadingStates.sendOtp = true; state.errors.sendOtp = null; });
    builder.addCase(sendOtpAPI.fulfilled, (state, action) => {
      state.loadingStates.sendOtp = false;
      state.consentRequestData = action.payload as ConsentRequestData; // Usually contains the consent_request ID
    });
    builder.addCase(sendOtpAPI.rejected, (state, action) => { state.loadingStates.sendOtp = false; state.errors.sendOtp = action.payload as string; });

    // verifyOtp
    builder.addCase(verifyOtpAPI.pending, (state) => { state.loadingStates.verifyOtp = true; state.errors.verifyOtp = null; });
    builder.addCase(verifyOtpAPI.fulfilled, (state) => {
      state.loadingStates.verifyOtp = false;
      state.otpVerified = true;
    });
    builder.addCase(verifyOtpAPI.rejected, (state, action) => { state.loadingStates.verifyOtp = false; state.errors.verifyOtp = action.payload as string; });

    // uploadDoc
    builder.addCase(uploadDocumentAPI.pending, (state) => { state.loadingStates.uploadDoc = true; state.errors.uploadDoc = null; });
    builder.addCase(uploadDocumentAPI.fulfilled, (state, action) => {
      state.loadingStates.uploadDoc = false;
      state.uploadedDocuments[action.payload.document_type] = action.payload.data;
    });
    builder.addCase(uploadDocumentAPI.rejected, (state, action) => { state.loadingStates.uploadDoc = false; state.errors.uploadDoc = action.payload as string; });

    // submitApplication
    builder.addCase(submitApplicationAPI.pending, (state) => { state.loadingStates.submitApp = true; state.errors.submitApp = null; });
    builder.addCase(submitApplicationAPI.fulfilled, (state) => {
      state.loadingStates.submitApp = false;
    });
    builder.addCase(submitApplicationAPI.rejected, (state, action) => { state.loadingStates.submitApp = false; state.errors.submitApp = action.payload as string; });
  }
});

export const {
  setFormData,
  setApplicationId,
  setStep,
  nextStep,
  prevStep,
  resetForm,
  clearError,
  markStepLoaded,
  setSupportingDocs
} = newLoanFormSlice.actions;

export const selectLoanFormState = (state: RootState) => state.loanForm;
export const selectLoanCurrentStep = (state: RootState) => state.loanForm.currentStep;

export const loanFormReducer = newLoanFormSlice.reducer;
