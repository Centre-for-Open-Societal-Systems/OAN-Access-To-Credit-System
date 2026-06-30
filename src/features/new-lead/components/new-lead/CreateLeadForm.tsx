'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectNewLeadDraft,
  updateNewLeadDraft,
  resetNewLeadDraft,
  submitNewLeadThunk,
  type NewLeadDraft,
} from '@/features/new-lead/store/newLeadSlice';
import { FeedbackModal } from '@/components/ui/FeedbackModal';
import { logger } from '@/lib/logger';
import { LeadInfoSection } from '../LeadInfoSection';
import { createLeadSchema } from '@/features/new-lead/schemas/lead.schema';


export function CreateLeadForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const draft = useAppSelector(selectNewLeadDraft);

  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Start from a clean slate every time the create form mounts, so data from a
  // previously viewed lead never leaks into a new submission.
  useEffect(() => {
    dispatch(resetNewLeadDraft());
  }, [dispatch]);

  const handleChange = (field: keyof NewLeadDraft) => (value: string) => {
    setValidationError(null); // Clear error on edit
    dispatch(updateNewLeadDraft({ [field]: value }));
  };

  const handleClear = () => {
    setValidationError(null);
    dispatch(resetNewLeadDraft());
  };

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async () => {
    // 1. Zod Validation
    const validationResult = createLeadSchema.safeParse({ phoneNumber: draft.phoneNumber });

    if (!validationResult.success) {
      const errorMsg = validationResult.error.issues[0]?.message || 'Invalid phone number';
      setValidationError(errorMsg);
      logger.warn('Frontend validation failed:', errorMsg);
      return; // Stop early, no API call
    }

    setValidationError(null);
    setIsSubmitting(true);
    try {
      const response = await dispatch(submitNewLeadThunk()).unwrap();
      router.push(response?.lead_id ? `/leads/${response.lead_id}` : '/leads');
    } catch (error) {
      logger.error('Failed to create lead (Backend/System Error):', error);
      setShowErrorPopup(true);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <main className="flex flex-col items-start flex-1 w-full">
      <div className="flex flex-col items-start gap-6 w-full">
        {/* Back Nav */}
        <button
          onClick={() => router.back()}
          className="flex flex-row justify-center items-center gap-2 h-6 text-[#374151] hover:text-[#111827] transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="text-base leading-6 font-semibold">Back</span>
        </button>

        {/* Title Banner */}
        <div className="flex flex-row justify-between items-center p-6 w-full bg-white border border-[#F1F3F4] rounded-xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)]">
          <div className="flex flex-col items-start gap-1">
            <h1 className="font-roboto font-bold text-2xl leading-8 text-[#111827]">
              Create New Lead
            </h1>
            <p className="font-roboto font-normal text-sm leading-5 text-[#6B7280]">
              Manually enter lead details to begin the qualification process.
            </p>
          </div>
        </div>

        {/* Lead Information */}
        <LeadInfoSection
          isEditable={true}
          phoneNumber={draft.phoneNumber}
          onPhoneNumberChange={handleChange('phoneNumber')}
          phoneError={validationError || undefined}
        />

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row justify-end items-center p-4 sm:p-6 w-full bg-white border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] rounded-xl gap-4 font-semibold">
          <button
            onClick={handleClear}
            className="flex justify-center items-center px-5 py-2.5 w-full sm:w-auto bg-white border border-[#D1D5DC] rounded-[10px] text-[#364153] font-inter font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            Clear Form
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex justify-center items-center px-5 py-2.5 w-full sm:w-auto bg-[#16A34A] rounded-[10px] text-white font-inter font-medium text-sm shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] hover:bg-[#15803d] transition-colors disabled:opacity-70"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Lead'}
          </button>
        </div>

        <FeedbackModal
          isOpen={showErrorPopup}
          onClose={() => setShowErrorPopup(false)}
          type="error"
          title="Error"
          message="Failed to submit the form. Please check your inputs."
          buttonText="Close"
        />
      </div>
    </main>
  );
}
