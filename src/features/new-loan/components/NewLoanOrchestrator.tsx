'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectLoanCurrentStep, setStep, resetForm } from '@/features/new-loan/store/newLoanFormSlice';
import { NewLoanProgressBar } from './NewLoanProgressBar';
import { Step1ConsentDocs } from './Step1ConsentDocs';
import { Step2FarmerDetails } from './Step2FarmerDetails';
import { Step3ReviewSubmit } from './Step3ReviewSubmit';

const STEP_META = [
  { title: 'Consent & Supporting Documents', subtitle: "Obtain farmer's consent and upload required documents" },
  { title: 'Farmer Details', subtitle: "Capture information about the requested loan and farming activities." },
  { title: 'Review Application', subtitle: "Please review all information before final submission. Resolve any warnings or missing info." },
];

export function NewLoanOrchestrator() {
  const currentStep = useSelector(selectLoanCurrentStep);
  const dispatch = useDispatch();
  const meta = STEP_META[currentStep - 1] || STEP_META[0];

  // Optional: Reset form on unmount to prevent stale data
  useEffect(() => {
    return () => {
      // dispatch(resetForm());
    };
  }, [dispatch]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="rounded-2xl bg-white px-6 py-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#16A34A]/30 transition-all duration-300">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-gray-900">{meta.title}</h1>
          <p className="text-sm text-gray-500">{meta.subtitle}</p>
        </div>
      </div>

      <NewLoanProgressBar currentStep={currentStep} onStepClick={(step) => dispatch(setStep(step))} />

      <div className="relative min-h-[400px]">
        {currentStep === 1 && <Step1ConsentDocs />}
        {currentStep === 2 && <Step2FarmerDetails />}
        {currentStep === 3 && <Step3ReviewSubmit />}
      </div>
    </div>
  );
}
