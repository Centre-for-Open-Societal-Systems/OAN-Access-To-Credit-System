import React, { useState } from 'react';
import { User, FileText, Calendar, Download, LayoutDashboard, Check, X, Lock, Building } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { resetForm, setStep } from '@/features/new-loan/store/newLoanFormSlice';
import type { RootState } from '@/store';

export function Step4Success() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [showSummaryPopup, setShowSummaryPopup] = useState(false);
  const formData = useSelector((state: RootState) => state.loanForm.formData);

  const newLoanApplicationData = {
    farmerInformation: [
      { label: "Full Name", value: formData.firstName && formData.lastName ? `${formData.firstName} ${formData.lastName}` : "—" },
      { label: "Father's Name", value: formData.fatherName || "—" },
      { label: "Farmer ID", value: formData.farmId || "FR - 1234567890" },
      { label: "Date of Birth", value: formData.dateOfBirth || "—" },
      { label: "Gender", value: formData.gender || "—" },
      { label: "Marital Status", value: formData.maritalStatus || "—" },
      { label: "Mobile Phone", value: formData.mobilePhone || "—" },
      { label: "Education Level", value: formData.educationLevel || "—" },
      { label: "National ID", value: formData.idNumber || "—" },
      { label: "Region", value: formData.region || "Oromia" },
      { label: "Woreda", value: formData.woreda || "Bishoftu" },
      { label: "Kebele", value: formData.kebele || "—" },
    ],
    loanDetails: [
      { label: "Loan Type", value: formData.loanType || "input" },
      { label: "Purpose", value: formData.purpose || "Agro-processing (e.g., milling grain)" },
      { label: "Requested Amount", value: formData.requestedAmount || "—" },
      { label: "Duration", value: formData.duration || "12 Months (1 Year)" },
      { label: "Primary Crops", value: formData.primaryCrop || "Teff" },
      { label: "Crop Variety", value: formData.cropVariety || "Seed + S-Hela/Acherr + Stellar Star" },
      { label: "Land Size", value: formData.landSize || "—" },
      { label: "Expected Yield", value: formData.expectedYield || "—" },
    ],
    bankingInformation: [
      { label: "Bank Account No.", value: formData.accountNumber || "—" },
      { label: "IFSC / FSC Code", value: formData.ifscCode || "—" },
      { label: "Bank Name", value: formData.bankName || "—" },
      { label: "Account Holder", value: formData.accountName || "—" },
    ]
  };

  const handleReturnToDashboard = () => {
    dispatch(resetForm());
    window.scrollTo({ top: 0, behavior: 'smooth' });
    router.push('/loans/new-loan-application'); // Ensure we are on the right route
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
          The loan application for <span className="font-bold text-white">Abebe Bekele Tadesse</span> has been securely transmitted to Coop Bank.
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
              <h3 className="text-[15px] font-bold text-gray-900">Abebe Bekele Tadesse</h3>
              <p className="text-[13px] text-gray-500 font-medium mt-0.5">Input Loan - Seed Loan</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 pr-6 shadow-sm min-w-[200px]">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-green-50 text-[#16A34A]">
                <FileText size={16} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Application ID</p>
                <p className="text-sm font-bold text-gray-900">APP-2026-2676</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 pr-6 shadow-sm min-w-[200px]">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-green-50 text-[#16A34A]">
                <Calendar size={16} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Submitted On</p>
                <p className="text-sm font-bold text-gray-900">Jun 2, 2026 05:27 PM</p>
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

      {showSummaryPopup && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[95vh] overflow-hidden">
            {/* Header */}
            <div className="bg-[#2E7250] px-6 py-5 flex items-start justify-between shrink-0 rounded-t-xl">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Application Summary</h3>
                <p className="text-xs text-green-100 font-medium">ID: APP-2026-6579 • Submitted May 14, 2026 at 08:03 PM</p>
              </div>
              <button onClick={() => setShowSummaryPopup(false)} className="rounded p-1 text-white/70 hover:bg-white/10 hover:text-white transition-colors border border-white/20 bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Status Banner */}
            <div className="bg-[#F0FDF4] px-6 py-4 flex items-center gap-3 border-b border-green-100 shrink-0">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#16A34A] text-white shadow-sm">
                <Check size={14} strokeWidth={3} />
              </div>
              <div>
                <p className="text-[15px] font-bold text-[#16A34A]">Submitted & Pending Review</p>
                <p className="text-[13px] text-green-600 font-medium">Transmitted to Cooperative Bank of Oromia via SFTP</p>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-8 flex-1">
              
              {/* Farmer Information */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-[#2E7250] fill-[#2E7250]/10" />
                  <h4 className="text-[15px] font-bold text-gray-900">Farmer Information</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-6 gap-x-4">
                  {newLoanApplicationData.farmerInformation.map((field, idx) => (
                    <div key={idx}>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">{field.label}</p>
                      <p className="text-sm font-bold text-gray-900">{field.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Loan Details */}
              <div className="border-t border-gray-100 pt-8">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="h-5 w-5 text-yellow-600 fill-yellow-600/10" />
                  <h4 className="text-[15px] font-bold text-gray-900">Loan Details</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-6 gap-x-4">
                  {newLoanApplicationData.loanDetails.map((field, idx) => (
                    <div key={idx}>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">{field.label}</p>
                      <p className="text-sm font-bold text-gray-900">{field.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Banking Information */}
              <div className="border-t border-gray-100 pt-8 pb-4">
                <div className="flex items-center gap-2 mb-4">
                  <Building className="h-5 w-5 text-[#2E7250] fill-[#2E7250]/10" />
                  <h4 className="text-[15px] font-bold text-gray-900">Banking Information</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-6 gap-x-4">
                  {newLoanApplicationData.bankingInformation.map((field, idx) => (
                    <div key={idx}>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">{field.label}</p>
                      <p className="text-sm font-bold text-gray-900">{field.value}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between shrink-0 bg-white rounded-b-xl gap-4 sm:gap-0">
              <p className="text-xs text-gray-400">Generated on May 14, 2026 • 08:03 PM</p>
              <button 
                onClick={() => setShowSummaryPopup(false)}
                className="w-full sm:w-auto px-8 py-2.5 bg-[#2E7250] text-white text-sm font-bold rounded-md hover:bg-[#23583e] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
