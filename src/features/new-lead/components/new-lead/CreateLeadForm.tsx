'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, User } from 'lucide-react';
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

export function CreateLeadForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const draft = useAppSelector(selectNewLeadDraft);

  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Start from a clean slate every time the create form mounts, so data from a
  // previously viewed lead never leaks into a new submission.
  useEffect(() => {
    dispatch(resetNewLeadDraft());
  }, [dispatch]);

  const handleChange = (field: keyof NewLeadDraft) => (value: string) => {
    dispatch(updateNewLeadDraft({ [field]: value }));
  };

  const handleClear = () => {
    dispatch(resetNewLeadDraft());
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(submitNewLeadThunk()).unwrap();
      setShowSuccessPopup(true);
    } catch (error) {
      logger.error('Failed to create lead:', error);
      setShowErrorPopup(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full h-[42px] rounded-md border border-[#D1D5DB] px-4 text-[15px] text-[#232F34] bg-white focus:outline-none focus:ring-2 focus:ring-[#16335A]/20';

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
        <section className="flex flex-col items-center pb-6 gap-4 w-full bg-white border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] rounded-xl">
          <div className="flex flex-row items-center p-5 w-full border-b border-[#dedede]">
            <h2 className="font-inter font-semibold text-lg leading-7 flex items-center gap-2 text-[#232F34]">
              <FileText size={20} className="text-[#6B7280]" />
              Lead Information
            </h2>
          </div>
          <div className="flex flex-col md:flex-row px-6 gap-4 md:gap-6 w-full">
            <div className="flex flex-col gap-2 w-full md:w-1/2">
              <label className="text-[15px] font-semibold text-[#232F34]">Lead Source</label>
              <input
                type="text"
                value="Agent Entry"
                readOnly
                className="w-full h-[42px] rounded-md border border-gray-200 px-4 text-[15px] text-[#232F34] focus:outline-none bg-gray-50"
              />
            </div>
          </div>
        </section>

        {/* Farmer Details */}
        <section className="flex flex-col items-center pb-6 gap-4 w-full bg-white border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] rounded-xl">
          <div className="flex flex-row items-center p-5 w-full border-b border-[#dedede]">
            <h2 className="font-inter font-semibold text-lg leading-7 flex items-center gap-2 text-[#232F34]">
              <User size={20} className="text-[#6B7280]" />
              Farmer Details
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 px-6 gap-4 md:gap-6 w-full">
            <div className="flex flex-col gap-2">
              <label className="text-[15px] font-semibold text-[#232F34]">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={draft.firstName}
                onChange={(e) => handleChange('firstName')(e.target.value)}
                placeholder="Enter First Name"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[15px] font-semibold text-[#232F34]">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={draft.lastName}
                onChange={(e) => handleChange('lastName')(e.target.value)}
                placeholder="Enter Last Name"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[15px] font-semibold text-[#232F34]">Location</label>
              <input
                type="text"
                value={draft.location}
                onChange={(e) => handleChange('location')(e.target.value)}
                placeholder="Enter Location"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[15px] font-semibold text-[#232F34]">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={draft.phoneNumber}
                onChange={(e) => handleChange('phoneNumber')(e.target.value)}
                placeholder="Enter Phone Number"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[15px] font-semibold text-[#232F34]">Email ID</label>
              <input
                type="email"
                value={draft.email}
                onChange={(e) => handleChange('email')(e.target.value)}
                placeholder="Enter Email ID"
                className={inputClass}
              />
            </div>
          </div>
        </section>

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

        <FeedbackModal
          isOpen={showSuccessPopup}
          onClose={() => { setShowSuccessPopup(false); router.push('/leads'); }}
          type="success"
          title="Lead Created Successfully"
          message="The new lead has been saved to the system."
          buttonText="Go to Lead Dashboard"
          onAction={() => { setShowSuccessPopup(false); router.push('/leads'); }}
        />
      </div>
    </main>
  );
}
