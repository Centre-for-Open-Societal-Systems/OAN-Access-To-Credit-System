"use client";

import { Send, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { toast } from '@/lib/toast';
import { logger } from '@/lib/logger';
import { useAppSelector } from '@/store/hooks';
import { selectConsentState } from '@/features/consent';
import { startApplication, submitApplication } from '../../api/farmerApi';
import type { DetailedLoanProduct } from '../../types';

interface CreditInformationProps {
  product: DetailedLoanProduct;
}

export default function CreditInformation({ product }: CreditInformationProps) {
  const router = useRouter();
  const { consentDate } = useAppSelector(selectConsentState);

  const isConsentCompleted = !!consentDate;

  const defaultAmount = product.min_amount ? String(product.min_amount) : '100000';

  const [requestedAmount, setRequestedAmount] = useState(defaultAmount);
  const [loanPurpose, setLoanPurpose] = useState('');

  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const getNumericAmount = (): number => {
    const raw = requestedAmount.replace(/[^0-9.]/g, '');
    const val = Number(raw);
    return isNaN(val) ? 0 : val;
  };

  const handleSaveDraft = async () => {
    if (!product.name) {
      toast.error('Missing loan product reference.');
      return;
    }
    const amount = getNumericAmount();
    if (amount <= 0) {
      toast.error('Please enter a valid loan amount.');
      return;
    }

    setActionError(null);
    setIsSavingDraft(true);
    try {
      const purposeText = loanPurpose.trim() || 'General agricultural input and operations';
      await startApplication({
        loan_product: product.name,
        requested_amount: amount,
        loan_reason: purposeText,
      });

      toast.success('Application saved as draft!');
      router.push('/my-applications');
    } catch (err) {
      logger.error('Failed to save draft application', err);
      const msg = err instanceof Error ? err.message : 'Failed to save draft application.';
      setActionError(msg);
      toast.error(msg);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmitApplication = async () => {
    if (!product.name) {
      toast.error('Missing loan product reference.');
      return;
    }

    if (!isConsentCompleted) {
      setActionError('Consent authorization is required before submitting your application. Please complete the consent section above.');
      toast.error('Please complete consent authorization before submitting.');
      return;
    }

    const amount = getNumericAmount();
    if (amount <= 0) {
      toast.error('Please enter a valid loan amount.');
      return;
    }

    setActionError(null);
    setIsSubmitting(true);
    try {
      const purposeText = loanPurpose.trim() || 'General agricultural input and operations';
      
      // Step 1: Create application draft
      const createRes = await startApplication({
        loan_product: product.name,
        requested_amount: amount,
        loan_reason: purposeText,
      });

      const rawData = createRes.data ?? createRes;
      const appId = (rawData as { application_id?: string })?.application_id || (rawData as unknown as string);

      if (!appId) {
        throw new Error('Application created but application_id was not returned.');
      }

      // Step 2: Submit application to bank
      await submitApplication(appId);

      toast.success('Loan application submitted successfully!');
      router.push('/my-applications');
    } catch (err) {
      logger.error('Failed to submit loan application', err);
      const msg = err instanceof Error ? err.message : 'Failed to submit loan application.';
      setActionError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 mb-6 border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
      <div className="border-b border-gray-200 pb-4 mb-6 -mx-6 px-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Credit Information</h3>
          <p className="text-xs text-gray-500 mt-0.5">Specify your requested loan amount and business purpose.</p>
        </div>
      </div>

      <div className="flex flex-col gap-5 mb-6">
        <div>
          <label htmlFor="loan-amount-input" className="block text-sm font-medium text-gray-700 mb-2">
            Requested Amount (ETB) <span className="text-red-500">*</span>
          </label>
          <input
            id="loan-amount-input"
            type="text"
            value={requestedAmount}
            onChange={(e) => setRequestedAmount(e.target.value)}
            placeholder="e.g. 150000"
            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-[#16A34A] placeholder:text-gray-400 transition-all"
          />
          {product.min_amount !== undefined && product.max_amount !== undefined && (
            <p className="text-[11px] text-gray-400 mt-1">
              Min: ETB {product.min_amount.toLocaleString()} - Max: ETB {product.max_amount.toLocaleString()}
            </p>
          )}
        </div>

        <div className="w-full">
          <label htmlFor="loan-purpose-input" className="block text-sm font-medium text-gray-700 mb-2">Loan Purpose <span className="text-red-500">*</span></label>
          <textarea
            id="loan-purpose-input"
            value={loanPurpose}
            onChange={(e) => setLoanPurpose(e.target.value)}
            placeholder="e.g. Seeds, fertilizer, and irrigation equipment"
            rows={3}
            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-[#16A34A] placeholder:text-gray-400 transition-all resize-y"
          />
        </div>
      </div>

      {actionError && <ErrorAlert className="mb-6">{actionError}</ErrorAlert>}

      {/* Submission Actions Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
        <div className="text-xs text-gray-500 flex items-center gap-2">
          {!isConsentCompleted ? (
            <span className="flex items-center gap-1.5 text-amber-600 font-medium">
              <AlertCircle size={14} /> Consent authorization pending
            </span>
          ) : (
            <span className="text-emerald-600 font-medium">
              ✓ Ready for submission
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSavingDraft || isSubmitting}
            className="flex-1 sm:flex-none px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-sm rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSavingDraft ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            Save as Draft
          </button>

          <button
            type="button"
            onClick={handleSubmitApplication}
            disabled={isSubmitting || isSavingDraft}
            className="flex-1 sm:flex-none px-6 py-2.5 bg-[#16A34A] hover:bg-green-700 text-white font-bold text-sm rounded-xl shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Application
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

