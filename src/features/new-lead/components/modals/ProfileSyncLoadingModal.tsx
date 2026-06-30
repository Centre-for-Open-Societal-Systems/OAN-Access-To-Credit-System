import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, CheckCircle2, Circle, AlertTriangle } from 'lucide-react';

interface ProfileSyncLoadingModalProps {
  isOpen: boolean;
}

export function ProfileSyncLoadingModal({ isOpen }: ProfileSyncLoadingModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-md p-4">
      <div className="relative flex flex-col bg-white rounded-2xl w-full max-w-[500px] overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Decorative top accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500" />

        {/* Body Container */}
        <div className="flex flex-col items-center px-8 pt-8 pb-8 text-center">
          
          {/* Main Visual Indicator */}
          <div className="relative flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-full mb-6">
            <Loader2 className="animate-spin text-emerald-600" size={40} strokeWidth={2.5} />
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/10 animate-ping duration-1000 pointer-events-none" />
          </div>

          {/* Text Section */}
          <h3 className="font-inter font-bold text-xl leading-7 text-[#1F2937] m-0 mb-2">
            Retrieving Farmer Profile
          </h3>
          <p className="font-inter font-normal text-sm leading-6 text-[#6B7280] m-0 mb-6 max-w-[360px]">
            We are fetching the updated profile details from the national registry. This takes a few moments to sync securely.
          </p>

          {/* Progress Tracker Cards */}
          <div className="w-full bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl p-4 flex flex-col gap-3.5 text-left mb-6">
            
            {/* Step 1 */}
            <div className="flex items-center gap-3">
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0" fill="#10B981" color="white" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#111827] leading-none">
                  Registry Upload
                </span>
                <span className="text-[10px] text-[#6B7280] mt-0.5 leading-none">
                  Consent documents verified and uploaded
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-200/60 ml-7" />

            {/* Step 2 */}
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-[18px] h-[18px] shrink-0">
                <Loader2 className="animate-spin text-emerald-600" size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#111827] leading-none">
                  Demographic Sync
                </span>
                <span className="text-[10px] text-[#6B7280] mt-0.5 leading-none">
                  Fetching validated demographic profile (In Progress)
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-200/60 ml-7" />

            {/* Step 3 */}
            <div className="flex items-center gap-3">
              <Circle size={18} className="text-gray-300 shrink-0" strokeWidth={2} />
              <div className="flex flex-col opacity-65">
                <span className="text-xs font-semibold text-[#374151] leading-none">
                  Finalization
                </span>
                <span className="text-[10px] text-[#9CA3AF] mt-0.5 leading-none">
                  Activating lead for credit eligibility assessment
                </span>
              </div>
            </div>

          </div>

          {/* Attention Message */}
          <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-left w-full">
            <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={15} />
            <p className="text-[11px] font-medium text-amber-800 leading-4 m-0">
              Please do not close or refresh this page. The system is actively waiting for the registry response and will proceed automatically.
            </p>
          </div>

        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
