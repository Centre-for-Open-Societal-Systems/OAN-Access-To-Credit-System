import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { selectLoanTypesOptions } from '../../store/newLeadSlice';
import { SelectField } from '@/components/ui/SelectField';
import { creditInfoSchema, type CreditInfoFormData } from '../../schemas/credit.schema';

interface CreditInformationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreditInfoFormData) => Promise<void>;
}

export function CreditInformationModal({ isOpen, onClose, onSubmit }: CreditInformationModalProps) {
  const loanTypesOptions = useAppSelector(selectLoanTypesOptions);

  const [loanType, setLoanType] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [purposeMessage, setPurposeMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setLoanType('');
      setLoanAmount('');
      setPurposeMessage('');
      setError(null);
      setFieldErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async () => {
    // 1. Run local Zod schema validation
    const validationResult = creditInfoSchema.safeParse({ loanType, loanAmount, purposeMessage });
    if (!validationResult.success) {
      // Set field errors from Zod validation
      const issues = validationResult.error.flatten().fieldErrors;
      const formattedErrors: Record<string, string> = {};
      for (const [key, messages] of Object.entries(issues)) {
        if (messages && messages.length > 0 && messages[0] !== undefined) {
          formattedErrors[key] = messages[0];
        }
      }
      setFieldErrors(formattedErrors);
      setError('Please correct the validation errors below.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      await onSubmit(validationResult.data);
    } catch (err: any) {
      setIsSubmitting(false);
      const serverMessage = err?.message?.message || (typeof err === 'string' ? err : 'Failed to add credit information');
      setError(serverMessage);
      
      if (err?.message?.details) {
        setFieldErrors(err.message.details);
      }
    }
  };

  const amountError = fieldErrors.loan_amount || fieldErrors.loanAmount;
  const typeError = fieldErrors.loan_type || fieldErrors.loanType;
  const purposeError = fieldErrors.purpose_message || fieldErrors.purposeMessage;

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal Container */}
        <div
          className="relative flex flex-col items-start p-0 w-[95%] sm:w-[799px] max-w-full bg-white rounded-[10px] shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="box-border flex flex-row justify-between items-center p-6 w-full h-[77px] border-b border-[#E5E7EB]">
            <h2 className="font-inter font-semibold text-[18px] leading-[28px] tracking-[-0.439453px] text-[#0A0A0A]">
              Credit Information
            </h2>
            <button
              onClick={onClose}
              className="flex flex-col items-start p-[4px_4px_0px] w-[28px] h-[28px] rounded-[4px] hover:bg-gray-100 transition-colors"
            >
              <X size={20} color="#0A0A0A" strokeWidth={1.66667} />
            </button>
          </div>

          {/* Body */}
          <div className="flex flex-col items-start p-[24px_24px_0px] gap-[16px] w-full">
            {/* General Error Banner */}
            {error && (
              <div className="w-full flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm font-roboto leading-5 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>{error}</span>
              </div>
            )}

            {/* Form Fields Container */}
            <div className="flex flex-col sm:flex-row flex-wrap items-start content-start p-0 gap-[24px] w-full">

              {/* Loan Type Row */}
              <div className="flex flex-col items-start p-0 gap-[6px] w-full sm:w-[358px]">
                <label className="font-roboto font-medium text-[14px] leading-[20px] text-[#111827]">
                  Loan Type <span className="text-red-500">*</span>
                </label>
                <div className="w-full relative z-50">
                  <SelectField
                    options={loanTypesOptions}
                    value={loanType}
                    onChange={setLoanType}
                    error={typeError}
                    placeholder="Select Loan Type"
                  />
                </div>
              </div>

              {/* Loan Amount Row */}
              <div className="flex flex-col items-start p-0 gap-[6px] w-full sm:w-[358px]">
                <label className="font-roboto font-medium text-[14px] leading-[20px] text-[#111827]">
                  Loan Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="Enter Loan Amount"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className={`box-border flex flex-row items-center p-[8px_16px] w-full h-[44px] bg-white border rounded-[8px] font-roboto font-normal text-[14px] leading-[16px] text-[#111827] placeholder:text-[#C6C6C6] outline-none focus:ring-1 ${
                    amountError
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-[#D1D5DB] focus:border-[#3B82F6] focus:ring-[#3B82F6]'
                  }`}
                />
                {amountError && (
                  <span className="text-red-500 font-roboto text-xs mt-1">
                    {amountError}
                  </span>
                )}
              </div>

              {/* Purpose Message Row */}
              <div className="flex flex-col items-start p-0 gap-[6px] w-full">
                <label className="font-roboto font-medium text-[14px] leading-[20px] text-[#111827]">
                  Purpose Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Enter purpose message"
                  value={purposeMessage}
                  onChange={(e) => setPurposeMessage(e.target.value)}
                  className={`box-border flex flex-row justify-center items-start p-[12px_16px] w-full h-[140px] bg-white border rounded-[8px] font-roboto font-normal text-[14px] leading-[16px] text-[#111827] placeholder:text-[#C6C6C6] outline-none focus:ring-1 resize-none ${
                    purposeError
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-[#D1D5DB] focus:border-[#3B82F6] focus:ring-[#3B82F6]'
                  }`}
                />
                {purposeError && (
                  <span className="text-red-500 font-roboto text-xs mt-1">
                    {purposeError}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="box-border flex flex-row justify-end items-center p-[24px] gap-[12px] w-full h-[87px] border-t border-[#E5E7EB] mt-[24px]">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="box-border flex flex-col justify-center items-center p-[8px_16px] w-[76.86px] h-[40px] bg-white border border-[#D4D4D4] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[8px] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="font-roboto font-medium text-[14px] leading-[20px] text-center text-[#111827]">
                Cancel
              </span>
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !loanType || !loanAmount || !purposeMessage}
              className="relative flex flex-row justify-center items-center p-[10px_24px] min-w-[93px] h-[40px] bg-[#16A34A] rounded-[8px] hover:bg-[#15803d] transition-colors overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#16A34A]"
            >
              <div className="absolute inset-0 bg-white/0 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] rounded-[8px]" />
              <span className="relative z-10 font-roboto font-semibold text-[14px] leading-[20px] text-center text-white flex items-center gap-2">
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit'
                )}
              </span>
            </button>
          </div>

        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
