"use client";
import { Portal } from '@/components/Portal';
import { useModalA11y } from '@/hooks/useModalA11y';
import { Building2, Calendar, DollarSign, FileText, Loader2, Send, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from '@/lib/toast';
import { logger } from '@/lib/logger';
import { getApplication, submitApplication } from '../../api/farmerApi';
import { isDraftApplication, type FarmerLoanApplication } from '../../types';
import { themeForApplication } from './ApplicationCard';

interface ApplicationActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId?: string | undefined;
  application: FarmerLoanApplication;
  title: string;
  subtitle: string;
  maxAmount: string;
  interest: string;
  tenure: string;
  repayment: string;
  modalTitle: string;
  onApplicationUpdated?: (() => void) | undefined;
}

export default function ApplicationActionModal({
  isOpen,
  onClose,
  applicationId,
  application,
  title,
  subtitle,
  maxAmount,
  interest,
  tenure,
  repayment,
  modalTitle,
  onApplicationUpdated,
}: ApplicationActionModalProps) {
  const dialogRef = useModalA11y<HTMLDivElement>(isOpen, onClose);
  const [details, setDetails] = useState<FarmerLoanApplication | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Prefer the freshly fetched document over the row that opened the modal: the
  // bank may have moved the application on since the list was loaded.
  const current = details ?? application;
  const statusLabel = current.status;
  // After a successful submit the application is no longer a draft, but the list
  // behind us has not refetched yet — so stop offering to submit it again.
  const canSubmit = !hasSubmitted && isDraftApplication(current);

  useEffect(() => {
    if (!isOpen || !applicationId) return;

    let isMounted = true;
    const fetchApp = async () => {
      setIsLoading(true);
      try {
        // No cast: `getApplication` parses the payload now, so `res.data` is
        // already a `FarmerLoanApplication` — the old `as unknown as` was
        // asserting a shape nothing had checked.
        const res = await getApplication(applicationId);
        if (isMounted && res.data) {
          setDetails(res.data);
        }
      } catch (err) {
        logger.warn('Failed to load application details', { applicationId, error: err });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchApp();
    return () => {
      isMounted = false;
    };
  }, [isOpen, applicationId]);

  if (!isOpen) return null;

  // Same archetype-keyed theme the card uses, so opening one never changes how
  // the application is presented.
  const theme = themeForApplication(current);
  const Icon = theme.icon;

  const handleSubmitDraft = async () => {
    if (!applicationId) return;
    setIsSubmitting(true);
    try {
      await submitApplication(applicationId);
      toast.success('Application submitted successfully!');
      setHasSubmitted(true);
      onApplicationUpdated?.();
      onClose();
    } catch (err) {
      logger.error('Failed to submit application', err);
      // The endpoint rejects two things the farmer can act on — an application
      // that is no longer a draft, and a missing or unapproved consent — and
      // says which in the message. Passing it through beats a generic failure
      // that leaves them with nothing to do about it.
      toast.error(err instanceof Error ? err.message : 'Failed to submit application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="application-action-modal-title"
          tabIndex={-1}
          className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <div>
              <h2 id="application-action-modal-title" className="text-xl font-bold text-gray-900">{modalTitle}</h2>
              {applicationId && (
                <p className="text-xs font-semibold text-gray-500 mt-0.5">Application #{applicationId}</p>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors group"
            >
              <X className="w-5 h-5 text-gray-500 group-hover:text-gray-900 transition-all duration-300" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Replicated Card Header */}
            <div className={`rounded-xl p-5 border ${theme.wrapper}`}>
              <div className="flex items-start gap-3 mb-6">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${theme.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 text-sm truncate">{title}</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${theme.wrapper} ${theme.statValue}`}>
                      {isDraftApplication(current) ? 'Draft' : statusLabel}
                    </span>
                  </div>
                  <p className={`text-xs font-medium ${theme.subtitle} mt-0.5`}>{subtitle}</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="bg-white rounded-lg p-2.5 text-center shadow-sm border border-gray-100">
                  <h4 className={`text-sm font-bold mb-1 ${theme.statValue}`}>{maxAmount}</h4>
                  <p className="text-[10px] text-gray-400 font-medium leading-tight">Requested</p>
                </div>
                <div className="bg-white rounded-lg p-2.5 text-center shadow-sm border border-gray-100">
                  <h4 className={`text-sm font-bold mb-1 ${theme.statValue}`}>{interest}</h4>
                  <p className="text-[10px] text-gray-400 font-medium leading-tight">Interest p.a</p>
                </div>
                <div className="bg-white rounded-lg p-2.5 text-center shadow-sm border border-gray-100">
                  <h4 className={`text-sm font-bold mb-1 ${theme.statValue}`}>{tenure}</h4>
                  <p className="text-[10px] text-gray-400 font-medium leading-tight">Tenure</p>
                </div>
                <div className="bg-white rounded-lg p-2.5 text-center shadow-sm border border-gray-100">
                  <h4 className={`text-sm font-bold mb-1 ${theme.statValue}`}>{repayment}</h4>
                  <p className="text-[10px] text-gray-400 font-medium leading-tight">Repayment</p>
                </div>
              </div>
            </div>

            {/* Application Extended Details */}
            {isLoading ? (
              <div className="py-6 flex items-center justify-center gap-2 text-gray-500 text-sm">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                Loading application details...
              </div>
            ) : details ? (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3 text-xs">
                <h4 className="font-bold text-gray-700 uppercase tracking-wider text-[11px]">Application Info</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <div>
                      <span className="text-gray-400 block">Bank</span>
                      <span className="font-semibold text-gray-800">{details.bank || '—'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <div>
                      <span className="text-gray-400 block">Requested Amount</span>
                      <span className="font-semibold text-gray-800">
                        {details.requested_amount != null ? `ETB ${details.requested_amount.toLocaleString()}` : maxAmount}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <span className="text-gray-400 block">Created On</span>
                      <span className="font-semibold text-gray-800">{details.creation || subtitle}</span>
                    </div>
                  </div>
                </div>

                {details.loan_reason && (
                  <div className="pt-2 border-t border-gray-200/60">
                    <span className="text-gray-400 block flex items-center gap-1 mb-0.5">
                      <FileText className="w-3.5 h-3.5" /> Purpose / Reason
                    </span>
                    <p className="text-gray-700 font-medium leading-relaxed bg-white p-2.5 rounded-lg border border-gray-100">
                      {details.loan_reason}
                    </p>
                  </div>
                )}
              </div>
            ) : null}

            {/* Action Buttons. Offered for a draft — an application sitting on no
                stage — not for the label 'Draft', which this API never sends:
                the pre-submission status is called `Active`, so this gate was
                never true and the Submit button never appeared. */}
            {canSubmit && (
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-sm rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSubmitDraft}
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#16A34A] hover:bg-green-700 text-white font-bold text-sm rounded-lg shadow-sm transition-all disabled:opacity-60 flex items-center gap-2"
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
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}
