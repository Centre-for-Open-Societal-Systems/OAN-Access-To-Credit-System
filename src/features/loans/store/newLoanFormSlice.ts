import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../store';

interface LoanFormState {
  currentStep: number;
  applicationId: string | null;
  formData: Record<string, any>;
  uploads: Record<string, any>;
}

const loadInitialState = (): LoanFormState => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('loan_form_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved loan form state');
      }
    }
  }
  return {
    currentStep: 1,
    applicationId: null,
    formData: {},
    uploads: {},
  };
};

const initialState: LoanFormState = loadInitialState();

export const newLoanFormSlice = createSlice({
  name: 'loanForm',
  initialState,
  reducers: {
    setApplicationId: (state, action: PayloadAction<string>) => {
      state.applicationId = action.payload;
    },
    updateFormData: (state, action: PayloadAction<{ key: string; value: any }>) => {
      state.formData[action.payload.key] = action.payload.value;
    },
    setFormData: (state, action: PayloadAction<Record<string, any>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    setStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    nextStep: (state) => {
      if (state.currentStep < 6) {
        state.currentStep += 1;
      }
    },
    prevStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
      }
    },
    resetForm: () => {
      if (typeof window !== 'undefined') localStorage.removeItem('loan_form_state');
      return {
        currentStep: 1,
        applicationId: null,
        formData: {},
        uploads: {},
      };
    },
  },
});

export const {
  setApplicationId,
  updateFormData,
  setFormData,
  setStep,
  nextStep,
  prevStep,
  resetForm,
} = newLoanFormSlice.actions;

export const selectLoanFormState = (state: RootState) => state.loanForm;
export const selectLoanCurrentStep = (state: RootState) => state.loanForm.currentStep;
export const selectLoanApplicationId = (state: RootState) => state.loanForm.applicationId;
export const selectLoanFormData = (state: RootState) => state.loanForm.formData;

export default newLoanFormSlice.reducer;
