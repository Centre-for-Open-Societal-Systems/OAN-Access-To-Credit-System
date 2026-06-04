import React, { useEffect, useState } from 'react';
import { Loader2, ArrowLeft, Check } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { selectLoanCurrentStep, setStep, resetForm } from '@/features/new-loan/store/newLoanFormSlice';
import { NewLoanProgressBar } from './NewLoanProgressBar';
import { Step1ConsentDocs } from './Step1ConsentDocs';
import { Step2FarmerDetails } from './Step2FarmerDetails';
import { Step3ReviewSubmit } from './Step3ReviewSubmit';
import { Step4Success } from './Step4Success';

const STEP_META = [
  { title: 'Consent & Supporting Documents', subtitle: "Obtain farmer's consent and upload required documents" },
  { title: 'Farmer Details', subtitle: "Capture information about the requested loan and farming activities." },
  { title: 'Review Application', subtitle: "Please review all information before final submission. Resolve any warnings or missing info." },
];

export function NewLoanOrchestrator() {
  const currentStep = useSelector(selectLoanCurrentStep);
  const dispatch = useDispatch();
  // For step 4, we keep the Step 3 metadata
  const meta = STEP_META[currentStep > 3 ? 2 : currentStep - 1] || STEP_META[0];

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveDraft = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };


  // Optional: Reset form on unmount to prevent stale data
  useEffect(() => {
    return () => {
      // dispatch(resetForm());
    };
  }, [dispatch]);

  return (
    <div className="mx-auto max-w-full space-y-6 pb-4 font-semibold">
      {/* Back Button (hide on success) */}
      {currentStep < 4 && (
        <div className="mb-4">
          <button
            onClick={() => {
              if (currentStep > 1) {
                dispatch(setStep(currentStep - 1));
              } else {
                window.history.back();
              }
            }}
            className="flex items-center gap-2 text-[15px] font-medium text-[#16335A] hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>
      )}

      {/* Header Container */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl bg-white px-4 sm:px-6 py-5 shadow-sm border border-gray-200 space-y-4 sm:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white ${currentStep === 4 ? 'bg-[#509f6e]' : 'bg-[#475569]'}`}>
              {currentStep === 4 ? <Check strokeWidth={3} className="h-6 w-6" /> : currentStep}
            </div>
            <div className="sm:hidden">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">{meta.title}</h1>
              </div>
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">{meta.title}</h1>
            </div>
            <p className="text-sm text-gray-500">{meta.subtitle}</p>
          </div>
          <p className="sm:hidden text-sm text-gray-500 mt-1">{meta.subtitle}</p>
        </div>

        {/* Header Actions (hidden on success) */}
        {currentStep < 4 && (
          <div className="flex w-full sm:w-auto items-center justify-between sm:justify-start gap-3 mt-4 sm:mt-0">
            <button className="flex-1 sm:flex-none rounded-md border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="flex-1 sm:flex-none justify-center flex items-center gap-2 rounded-md border border-[#16335A] px-5 py-2 text-sm font-semibold text-[#16335A] hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
          </div>
        )}
      </div>

      <NewLoanProgressBar currentStep={currentStep} />

      <div className="relative min-h-[400px]">
        {currentStep === 1 && <Step1ConsentDocs />}
        {currentStep === 2 && <Step2FarmerDetails />}
        {currentStep === 3 && <Step3ReviewSubmit />}
        {currentStep === 4 && <Step4Success />}
      </div>
    </div>
  );
}
