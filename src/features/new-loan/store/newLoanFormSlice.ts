import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { loanService } from '@/features/loans/api/loan.service';
import type { RootState } from '../../../store';

interface LoanFormState {
  currentStep: number;
  applicationId: string | null;
  consentRequestData: any | null;
  otpVerified: boolean;
  uploadedDocuments: Record<string, any>;
  formData: Record<string, any>;
  farmerData: Record<string, any> | null;
  
  // API loading states
  loadingStates: {
    sendOtp: boolean;
    verifyOtp: boolean;
    uploadDoc: boolean;
    saveFarmer: boolean;
    submitApp: boolean;
  };
  errors: Record<string, string | null>;
}

const loadInitialState = (): LoanFormState => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('loan_form_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          loadingStates: { sendOtp: false, verifyOtp: false, uploadDoc: false, saveFarmer: false, submitApp: false },
          errors: {}
        };
      } catch (e) {
        console.error('Failed to parse saved loan form state');
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
    farmerData: null,
    loadingStates: { sendOtp: false, verifyOtp: false, uploadDoc: false, saveFarmer: false, submitApp: false },
    errors: {},
  };
};

const initialState: LoanFormState = loadInitialState();

// --- ASYNC THUNKS ---

export const sendOtpAPI = createAsyncThunk(
  'loanForm/sendOtp',
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await loanService.sendOtpAndCreateConsent(payload);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to send OTP');
    }
  }
);

export const verifyOtpAPI = createAsyncThunk(
  'loanForm/verifyOtp',
  async (payload: { consent_request: string; otp_code: string }, { rejectWithValue }) => {
    try {
      const response = await loanService.verifyOtp(payload);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to verify OTP');
    }
  }
);

export const uploadDocumentAPI = createAsyncThunk(
  'loanForm/uploadDocument',
  async (payload: { application_id: string; document_type: string; file: File }, { rejectWithValue }) => {
    try {
      const response = await loanService.uploadSupportingDocument(payload.application_id, payload.document_type, payload.file);
      return { document_type: payload.document_type, data: response };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to upload document');
    }
  }
);

export const saveFarmerDetailsAPI = createAsyncThunk(
  'loanForm/saveFarmerDetails',
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await loanService.saveFarmerDetails(payload);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to save farmer details');
    }
  }
);

export const submitApplicationAPI = createAsyncThunk(
  'loanForm/submitApplication',
  async (applicationId: string, { rejectWithValue }) => {
    try {
      const response = await loanService.submitApplication(applicationId);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to submit application');
    }
  }
);

// --- SLICE ---

export const newLoanFormSlice = createSlice({
  name: 'loanForm',
  initialState,
  reducers: {
    setFormData: (state, action: PayloadAction<Record<string, any>>) => {
      state.formData = { ...state.formData, ...action.payload };
      if (typeof window !== 'undefined') localStorage.setItem('loan_form_state', JSON.stringify(state));
    },
    setApplicationId: (state, action: PayloadAction<string>) => {
      state.applicationId = action.payload;
      if (typeof window !== 'undefined') localStorage.setItem('loan_form_state', JSON.stringify(state));
    },
    setStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
      if (typeof window !== 'undefined') localStorage.setItem('loan_form_state', JSON.stringify(state));
    },
    nextStep: (state) => {
      if (state.currentStep < 3) {
        state.currentStep += 1;
        if (typeof window !== 'undefined') localStorage.setItem('loan_form_state', JSON.stringify(state));
      }
    },
    prevStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
        if (typeof window !== 'undefined') localStorage.setItem('loan_form_state', JSON.stringify(state));
      }
    },
    resetForm: () => {
      if (typeof window !== 'undefined') localStorage.removeItem('loan_form_state');
      return { 
        currentStep: 1,
        applicationId: null,
        consentRequestData: null,
        otpVerified: false,
        uploadedDocuments: {},
        formData: {},
        farmerData: null,
        loadingStates: { sendOtp: false, verifyOtp: false, uploadDoc: false, saveFarmer: false, submitApp: false }, 
        errors: {} 
      };
    },
    clearError: (state, action: PayloadAction<string>) => {
      state.errors[action.payload] = null;
    }
  },
  extraReducers: (builder) => {
    // sendOtp
    builder.addCase(sendOtpAPI.pending, (state) => { state.loadingStates.sendOtp = true; state.errors.sendOtp = null; });
    builder.addCase(sendOtpAPI.fulfilled, (state, action) => {
      state.loadingStates.sendOtp = false;
      state.consentRequestData = action.payload; // Usually contains the consent_request ID
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

    // saveFarmerDetails
    builder.addCase(saveFarmerDetailsAPI.pending, (state) => { state.loadingStates.saveFarmer = true; state.errors.saveFarmer = null; });
    builder.addCase(saveFarmerDetailsAPI.fulfilled, (state, action) => {
      state.loadingStates.saveFarmer = false;
      state.farmerData = action.meta.arg; // save the local state payload into global Redux
    });
    builder.addCase(saveFarmerDetailsAPI.rejected, (state, action) => { state.loadingStates.saveFarmer = false; state.errors.saveFarmer = action.payload as string; });

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
  clearError
} = newLoanFormSlice.actions;

export const selectLoanFormState = (state: RootState) => state.loanForm;
export const selectLoanCurrentStep = (state: RootState) => state.loanForm.currentStep;

export default newLoanFormSlice.reducer;
