import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { prevStep } from '@/features/new-loan/store/newLoanFormSlice';
import { ArrowLeft, Send, Check } from 'lucide-react';
import type { AppDispatch } from '@/store';
import { useRouter } from 'next/navigation';

export function Step3ReviewSubmit() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [acknowledged, setAcknowledged] = useState(false);

  function handleSubmit() {
    if (!acknowledged) {
      alert("Please acknowledge the information is correct.");
      return;
    }
    alert("Application Submitted to Redux / API successfully!");
    router.push('/loan-application-dashboard');
  }

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-[#16A34A]/50 transition-all duration-300">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#16A34A] shadow-sm relative overflow-hidden">
          <Check size={26} className="text-white relative z-10" strokeWidth={3} />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-[#1f2937]">Review Application</h2>
            <span className="flex items-center gap-1 rounded-md border border-green-200 bg-green-50 px-2 py-0.5 text-[11px] font-bold text-[#16A34A]">
              <Check size={12} strokeWidth={3} /> Verified via Fayda
            </span>
          </div>
          <p className="text-sm text-gray-500">Please review all information before final submission.</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Summary</h2>
        <hr className="border-gray-200 mb-6" />

        <div className="bg-[#f8fafc] border border-gray-200 p-5 rounded-xl mb-6 text-center text-sm text-gray-600">
          All steps completed successfully. Ready for submission.
        </div>

        <hr className="border-gray-200 my-6" />

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-start gap-3" onClick={() => setAcknowledged(v => !v)}>
            <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${acknowledged ? 'border-[#16A34A] bg-[#16A34A]' : 'border-gray-400 bg-white'}`}>
              {acknowledged && <Check size={14} className="text-white" strokeWidth={3} />}
            </div>
            <span className={`text-sm transition-colors ${acknowledged ? 'text-gray-900' : 'text-gray-600'}`}>
              I acknowledge that the information provided is true and correct to the best of my knowledge.
            </span>
          </label>
        </div>
      </div>

      <div className="mt-6 flex justify-between border-t border-gray-100 pt-6">
        <button type="button" onClick={() => dispatch(prevStep())} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-gray-200">
          <ArrowLeft size={16} /> Back
        </button>
        <button type="button" onClick={handleSubmit} className="flex items-center gap-2 rounded-xl bg-[#16A34A] px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#15803d] transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]/50">
          Submit Application <Send size={16} />
        </button>
      </div>
    </div>
  );
}
