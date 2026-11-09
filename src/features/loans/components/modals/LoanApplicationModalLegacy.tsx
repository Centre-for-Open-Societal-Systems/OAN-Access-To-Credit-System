'use client';

import { Portal } from '@/components/Portal';
import { useModalA11y } from '@/hooks/useModalA11y';
import { CheckCircle2, Info, Loader2, Lock, User, X } from 'lucide-react';
import { LoanTableRow } from '../LoanTable';
import { PINNED_OR_META_KEYS, useLoanApplicationModal } from './useLoanApplicationModal';

type LoanApplicationModalLegacyProps = {
  isOpen: boolean;
  onClose: () => void;
} & ({ data: LoanTableRow | null; applicationId?: never } | { applicationId: string; data?: never });

const Field = ({ label, value }: { label: string; value: string | null | undefined }) => (
  <div className="flex flex-col">
    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</span>
    <span className="text-[15px] font-bold text-gray-800">
      {value && value.trim() !== '' ? value : '—'}
    </span>
  </div>
);

export default function LoanApplicationModalLegacy({ isOpen, onClose, data, applicationId }: LoanApplicationModalLegacyProps) {
  const reference = applicationId ? { id: applicationId } : data ?? null;
  const { isLoading, fullProfile, error } = useLoanApplicationModal(isOpen, reference);
  const dialogRef = useModalA11y<HTMLDivElement>(isOpen, onClose);

  if (!isOpen || !reference) return null;

  const extraEntries = fullProfile
    ? Object.entries(fullProfile).filter(
      ([key, value]) =>
        !PINNED_OR_META_KEYS.has(key) &&
        value !== null &&
        value !== undefined &&
        value !== '' &&
        typeof value !== 'object'
    )
    : [];

  const fullName = fullProfile?.first_name || fullProfile?.last_name
    ? `${fullProfile.first_name || ''} ${fullProfile.last_name || ''}`.trim()
    : data?.applicant;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-sm overflow-y-auto">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="loan-application-legacy-modal-title"
        tabIndex={-1}
        className="relative flex flex-col w-full max-w-[850px] bg-white rounded-[10px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#16A34A] px-5 sm:px-8 py-5 flex justify-between items-start gap-4 shrink-0">
          <div className="min-w-0 flex-1">
            <h2 id="loan-application-legacy-modal-title" className="text-xl font-bold text-white mb-1">Application Summary</h2>
            <p className="text-emerald-100 text-[13px] font-medium tracking-wide">
              ID: {reference.id} &bull; Submitted {data?.updated ?? (fullProfile?.creation ? new Date(fullProfile.creation).toLocaleString() : '—')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center h-8 w-8 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors cursor-pointer"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Sub-header / Status */}
        <div className="bg-emerald-50/80 px-8 py-4 flex items-center gap-3 border-b border-emerald-100/50">
          <CheckCircle2 size={24} className="text-emerald-500 fill-emerald-100 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-[#16A34A]">{data?.status ?? fullProfile?.status}</h3>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-8 overflow-y-auto max-h-[60vh] space-y-8 custom-scrollbar">
          {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : <>

          {/* Section 1: Farmer Information */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <User size={18} className="text-[#3b5998]" fill="#3b5998" />
              <h4 className="text-[15px] font-bold text-gray-900">Farmer Information</h4>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-[#387f50]" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6">
                <Field label="FULL NAME" value={fullName} />
                <Field label="MOBILE PHONE" value={fullProfile?.phone_number || data?.phone || null} />
                <Field label="FARMER ID" value={fullProfile?.farmer_id} />
                <Field
                  label="LOAN OFFICER"
                  value={fullProfile?.loan_officer_name || fullProfile?.loan_officer || 'Unassigned'}
                />
              </div>
            )}
          </section>

          {/* Section 2: Loan Details */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Lock size={18} className="text-[#bfae34]" fill="#bfae34" />
              <h4 className="text-[15px] font-bold text-gray-900">Loan Details</h4>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-[#387f50]" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6">
                <Field label="LOAN PRODUCT" value={fullProfile?.loan_product_name || fullProfile?.loan_product || null} />
                <Field
                  label="REQUESTED AMOUNT"
                  value={
                    fullProfile?.loan_amount
                      ? `ETB ${fullProfile.loan_amount.toLocaleString()}`
                      : data?.loanAmount && data.loanAmount !== '—'
                        ? (data.loanAmount.startsWith('ETB') ? data.loanAmount : `ETB ${data.loanAmount}`)
                        : null
                  }
                />
                <Field label="PURPOSE / REASON" value={fullProfile?.loan_reason || fullProfile?.purpose || null} />
              </div>
            )}
          </section>

          {/* Section 3: Additional Information (dynamic — renders any extra API fields) */}
          {extraEntries.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Info size={18} className="text-[#6366f1]" fill="#6366f1" />
                <h4 className="text-[15px] font-bold text-gray-900">Additional Information</h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6">
                {extraEntries.map(([key, value]) => (
                  <Field key={key} label={key.replace(/_/g, ' ')} value={String(value)} />
                ))}
              </div>
            </section>
          )}
          </>}
        </div>

        {/* Footer */}
        <div className="bg-white px-5 sm:px-8 py-5 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4 sm:gap-0 border-t border-gray-100">
          <span className="text-sm font-medium text-gray-400">
            {`Generated on ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
          </span>
          <button
            onClick={onClose}
            className="bg-[#16A34A] hover:bg-[#10883c] text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors active:scale-95 cursor-pointer"
          >
            <span className='font-semibold'>Close</span>
          </button>
        </div>

      </div>
    </div>
  );

  return <Portal>{modalContent}</Portal>;
}
