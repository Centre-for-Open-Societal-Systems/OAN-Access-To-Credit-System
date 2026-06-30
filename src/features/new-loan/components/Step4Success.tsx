'use client';

import { useState } from 'react';
import { User, FileText, Calendar, Download, LayoutDashboard, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { resetForm } from '@/features/new-loan/store/newLoanFormSlice';
import type { RootState } from '@/store';
import LoanApplicationModal from '@/features/loans/components/modals/LoanApplicationModal';
import { LoanTableRow } from '@/features/loans/components/LoanTable';

export function Step4Success() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [showSummaryPopup, setShowSummaryPopup] = useState(false);
  const formData = useSelector((state: RootState) => state.loanForm.formData);
  const applicationId = useSelector((state: RootState) => state.loanForm.applicationId);

  const farmerName = `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || "—";

  const formattedSubmittedDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) + ' ' + new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const modalData: LoanTableRow = {
    id: applicationId || '—',
    applicant: farmerName,
    type: formData.loanType || "—",
    status: "Pending Review",
    statusTone: "neutral",
    updated: formattedSubmittedDate,
    amount: formData.requestedAmount ? `ETB ${parseFloat(formData.requestedAmount).toLocaleString()}` : "—",
    phone: formData.mobilePhone || "—",
    region: formData.region || "—",
    loanTerm: formData.duration || "—",
    loanAmount: formData.requestedAmount ? `ETB ${parseFloat(formData.requestedAmount).toLocaleString()}` : "—",
    action: "view",
    timestamp: Date.now(),
  };

  const handleReturnToDashboard = () => {
    dispatch(resetForm());
    window.scrollTo({ top: 0, behavior: 'smooth' });
    router.push('/loan-application-dashboard');
  };

  return (
    <>
      <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center w-full shadow-lg rounded-2xl">
        {/* Top Green Banner */}
        <div className="w-full bg-[#16A34A] rounded-t-2xl px-6 py-12 flex flex-col items-center text-center text-white relative overflow-hidden">
          {/* Abstract circles */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-green-500 rounded-full mix-blend-multiply filter blur-2xl opacity-50 -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-green-700 rounded-full mix-blend-multiply filter blur-2xl opacity-50 translate-x-1/2 translate-y-1/2"></div>

          <div className="relative z-10 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#1bc65b] mb-6 border-4 border-[#32cd6d] shadow-sm">
            <Check className="h-8 w-8 text-white" strokeWidth={4} />
          </div>

          <h2 className="text-[28px] font-bold mb-3 relative z-10 tracking-tight">Application Submitted Successfully!</h2>
          <p className="text-green-50 text-[15px] max-w-xl mb-6 relative z-10">
            The loan application for <span className="font-bold text-white">{farmerName}</span> has been securely transmitted to Coop Bank.
          </p>

          <div className="relative z-10 flex items-center gap-1.5 rounded-full bg-[#117b38] px-4 py-1.5 text-xs font-bold text-white shadow-inner">
            <Check size={14} strokeWidth={3} /> Verified & Submitted
          </div>
        </div>

        {/* Main Content Area */}
        <div className="w-full bg-white rounded-b-2xl border-x border-b border-gray-200 p-8 space-y-10">

          {/* Info Cards */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border border-gray-100 bg-gray-50/50 rounded-xl p-4">

            <div className="flex items-center gap-4 pl-2">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                <User size={24} />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-gray-900">{farmerName}</h3>
                <p className="text-[13px] text-gray-500 font-medium mt-0.5">{formData.loanType || "—"} - {formData.purpose || "—"}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 pr-6 shadow-sm min-w-[200px]">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-green-50 text-[#16A34A]">
                  <FileText size={16} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Application ID</p>
                  <p className="text-sm font-bold text-gray-900">{applicationId || '—'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 pr-6 shadow-sm min-w-[200px]">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-green-50 text-[#16A34A]">
                  <Calendar size={16} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Submitted On</p>
                  <p className="text-sm font-bold text-gray-900">{formattedSubmittedDate}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-4 pb-2">
            <button className="flex flex-1 sm:flex-none justify-center items-center gap-2 rounded-md border border-gray-300 bg-white px-6 py-2.5 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
              <Download size={16} /> Download PDF
            </button>
            <button
              onClick={() => setShowSummaryPopup(true)}
              className="flex flex-1 sm:flex-none justify-center items-center gap-2 rounded-md border border-[#16A34A] bg-white px-6 py-2.5 text-sm font-bold text-[#16A34A] shadow-sm hover:bg-green-50 transition-colors"
            >
              View Summary
            </button>
            <button
              onClick={handleReturnToDashboard}
              className="flex flex-1 sm:flex-none justify-center items-center gap-2 rounded-md bg-[#16A34A] px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#15803d] transition-colors"
            >
              <LayoutDashboard size={16} /> Return to Dashboard
            </button>
          </div>

        </div>
      </div>

      <LoanApplicationModal
        isOpen={showSummaryPopup}
        onClose={() => setShowSummaryPopup(false)}
        data={modalData}
      />
    </>
  );
}
