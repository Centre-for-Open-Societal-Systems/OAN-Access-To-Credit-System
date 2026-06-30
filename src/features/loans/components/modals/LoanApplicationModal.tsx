import { logger } from '@/lib/logger';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, User, Lock, Building2, Loader2, Eye, EyeOff } from 'lucide-react';
import { LoanTableRow } from '../LoanTable';
import { loanService, LoanApplicationFull } from '../../api/loan.service';
import { maskSensitiveId } from '@/lib/utils';

interface LoanApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: LoanTableRow | null;
}

const Field = ({ label, value, sensitive = false }: { label: string; value: string | null | undefined; sensitive?: boolean }) => {
  const [revealed, setRevealed] = useState(false);
  const hasValue = !!value && value.trim() !== '';
  const display = sensitive && hasValue && !revealed ? maskSensitiveId(value) : value;

  return (
    <div className="flex flex-col">
      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</span>
      <span className="text-[15px] font-bold text-gray-800 flex items-center gap-2">
        <span>{hasValue ? display : '—'}</span>
        {sensitive && hasValue && (
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={revealed ? `Hide ${label}` : `Reveal ${label}`}
          >
            {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </span>
    </div>
  );
};

export default function LoanApplicationModal({ isOpen, onClose, data }: LoanApplicationModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fullProfile, setFullProfile] = useState<LoanApplicationFull | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchId = data?.application_id || data?.id;
    if (isOpen && fetchId) {
      setIsLoading(true);
      loanService.getFullProfile(fetchId)
        .then((profileRes) => {
          setFullProfile(profileRes?.data || null);
          setIsLoading(false);
        })
        .catch((err) => {
          logger.error("Failed to fetch full profile:", err);
          setIsLoading(false);
        });
    } else {
      setFullProfile(null);
    }
  }, [isOpen, data?.application_id, data?.id]);

  if (!mounted || !isOpen || !data) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative flex flex-col w-full max-w-[850px] bg-white rounded-[10px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#387f50] px-8 py-5 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Application Summary</h2>
            <p className="text-emerald-100 text-[13px] font-medium tracking-wide">
              ID: {data.id} &bull; Submitted {data.updated}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center h-8 w-8 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Sub-header / Status */}
        <div className="bg-emerald-50/80 px-8 py-4 flex items-center gap-3 border-b border-emerald-100/50">
          <CheckCircle2 size={24} className="text-emerald-500 fill-emerald-100 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-emerald-800">Submitted & {data.status}</h3>
            <p className="text-xs font-medium text-emerald-600">Transmitted to Cooperative Bank of Oromia via SFTP</p>
          </div>
        </div>

        {/* Body content */}
        <div className="px-8 py-8 overflow-y-auto max-h-[60vh] space-y-10 custom-scrollbar">

          {/* Section 1: Farmer Information */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <User size={20} className="text-[#3b5998]" fill="#3b5998" />
              <h4 className="text-[17px] font-bold text-gray-900">Farmer Information</h4>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#387f50]" />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-y-6 gap-x-8">
                <Field label="FULL NAME" value={fullProfile ? `${fullProfile.first_name} ${fullProfile.last_name}` : data.applicant} />
                <Field label="FATHER'S NAME" value={fullProfile?.father_name || null} />
                <Field label="FARMER ID" value={fullProfile?.farmer_id || null} />
                <Field label="DATE OF BIRTH" value={fullProfile?.date_of_birth || null} />
                <Field label="GENDER" value={fullProfile?.gender || null} />
                <Field label="MARITAL STATUS" value={fullProfile?.marital_status || null} />
                <Field label="MOBILE PHONE" value={fullProfile?.phone_number || data.phone || null} />
                <Field label="EDUCATION LEVEL" value={fullProfile?.education_level || null} />
                <Field label="NATIONAL ID" value={fullProfile?.national_id || null} sensitive />
                <Field label="REGION" value={fullProfile?.location || data.region || null} />
                <Field label="WOREDA" value={fullProfile?.woreda || null} />
                <Field label="KEBELE" value={fullProfile?.kebele || null} />
              </div>
            )}
          </section>

          {/* Section 2: Loan Details */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Lock size={20} className="text-[#bfae34]" fill="#bfae34" />
              <h4 className="text-[17px] font-bold text-gray-900">Loan Details</h4>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#387f50]" />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-y-6 gap-x-8">
                <Field label="LOAN TYPE" value={fullProfile?.loan_type || data.type || null} />
                <Field label="PURPOSE" value={fullProfile?.loan_reason || fullProfile?.purpose || null} />
                <Field label="REQUESTED AMOUNT" value={fullProfile?.loan_amount ? `ETB ${fullProfile.loan_amount.toLocaleString()}` : (data.loanAmount || null)} />
                <Field label="DURATION" value={fullProfile?.duration || null} />
                <Field label="PRIMARY CROPS" value={fullProfile?.primary_crops || null} />
                <Field label="CROP VARIETY" value={fullProfile?.crop_variety || null} />
                <Field label="LAND SIZE" value={fullProfile?.farmland_size_hectares ? `${fullProfile.farmland_size_hectares} Hectares` : null} />
                <Field label="EXPECTED YIELD" value={fullProfile?.expected_yield != null ? String(fullProfile.expected_yield) : null} />
              </div>
            )}
          </section>

          {/* Section 3: Banking Information */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Building2 size={20} className="text-[#5f6e7a]" fill="#5f6e7a" />
              <h4 className="text-[17px] font-bold text-gray-900">Banking Information</h4>
            </div>
            <div className="grid grid-cols-3 gap-y-6 gap-x-8">
              <Field label="BANK ACCOUNT NO." value={fullProfile?.bank_account_no || null} />
              <Field label="IFSC / FSC CODE" value={fullProfile?.ifsc_code || null} />
              <Field label="BANK NAME" value={fullProfile?.bank_name || null} />
              <Field label="ACCOUNT HOLDER" value={fullProfile?.account_holder || null} />
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="bg-white px-8 py-5 flex justify-between items-center border-t border-gray-100">
          <span className="text-xs font-medium text-gray-400">
            {mounted ? `Generated on ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` : 'Loading...'}
          </span>
          <button
            onClick={onClose}
            className="bg-[#387f50] hover:bg-[#2c633f] text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors active:scale-95"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
