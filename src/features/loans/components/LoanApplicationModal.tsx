import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, User, Lock, Building2 } from 'lucide-react';
import { LoanTableRow } from './LoanTable';

interface LoanApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: LoanTableRow | null;
}

const Field = ({ label, value }: { label: string; value: string | null | undefined }) => (
  <div className="flex flex-col">
    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</span>
    <span className="text-[15px] font-bold text-gray-800">
      {value && value.trim() !== '' ? value : '—'}
    </span>
  </div>
);

export default function LoanApplicationModal({ isOpen, onClose, data }: LoanApplicationModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen || !data) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="w-full max-w-[850px] bg-white rounded-xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#387f50] px-8 py-5 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Application Summary</h2>
            <p className="text-emerald-100 text-sm font-medium tracking-wide">
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
            <div className="grid grid-cols-3 gap-y-6 gap-x-8">
              <Field label="FULL NAME" value={data.applicant} />
              <Field label="FATHER'S NAME" value={null} />
              <Field label="FARMER ID" value="FR - 1234567890" />
              <Field label="DATE OF BIRTH" value={null} />
              <Field label="GENDER" value={null} />
              <Field label="MARITAL STATUS" value={null} />
              <Field label="MOBILE PHONE" value={data.phone} />
              <Field label="EDUCATION LEVEL" value={null} />
              <Field label="NATIONAL ID" value={null} />
              <Field label="REGION" value="Oromia" />
              <Field label="WOREDA" value="Bishoftu" />
              <Field label="KEBELE" value={null} />
            </div>
          </section>

          {/* Section 2: Loan Details */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Lock size={20} className="text-[#bfae34]" fill="#bfae34" />
              <h4 className="text-[17px] font-bold text-gray-900">Loan Details</h4>
            </div>
            <div className="grid grid-cols-3 gap-y-6 gap-x-8">
              <Field label="LOAN TYPE" value={data.type} />
              <Field label="PURPOSE" value="Agro-processing (e.g., milling grain)" />
              <Field label="REQUESTED AMOUNT" value={data.loanAmount} />
              <Field label="DURATION" value="12 Months (1 Year)" />
              <Field label="PRIMARY CROPS" value="Teff" />
              <Field label="CROP VARIETY" value="Seed + S-Hela/Acherr + Stellar Star" />
              <Field label="LAND SIZE" value={null} />
              <Field label="EXPECTED YIELD" value={null} />
            </div>
          </section>

          {/* Section 3: Banking Information */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Building2 size={20} className="text-[#5f6e7a]" fill="#5f6e7a" />
              <h4 className="text-[17px] font-bold text-gray-900">Banking Information</h4>
            </div>
            <div className="grid grid-cols-3 gap-y-6 gap-x-8">
              <Field label="BANK ACCOUNT NO." value={null} />
              <Field label="IFSC / FSC CODE" value={null} />
              <Field label="BANK NAME" value={null} />
              <Field label="ACCOUNT HOLDER" value={null} />
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
