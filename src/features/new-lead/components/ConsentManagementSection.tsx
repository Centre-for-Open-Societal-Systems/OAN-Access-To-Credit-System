import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectNewLeadState, setFarmerId, searchFarmerConsent } from '../store/newLeadSlice';
import { OTPVerificationModal } from './OTPVerificationModal';

export function ConsentManagementSection() {
  const dispatch = useAppDispatch();
  const { farmerId, isLoadingConsent, consentError, isOtpVerified } = useAppSelector(selectNewLeadState);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

  const handleSendOtp = async () => {
    if (!farmerId) return;
    const resultAction = await dispatch(searchFarmerConsent(farmerId));
    if (searchFarmerConsent.fulfilled.match(resultAction)) {
      setIsOtpModalOpen(true);
    }
  };

  return (
    <section className="flex flex-col items-center pb-6 gap-6 w-full bg-white border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] rounded-xl">
      <div className="flex flex-row items-center p-5 w-full border-b border-[#F1F3F4]">
        <h2 className="font-inter font-semibold text-lg leading-7 flex items-center text-[#232F34]">
          Consent Management
        </h2>
      </div>

      <div className="flex flex-col justify-end items-center px-[23px] gap-12 w-full">
        <div className="flex flex-row items-start w-full gap-10">
          <div className="flex flex-row justify-between items-end w-full gap-6">
            <div className="flex flex-col items-start gap-6 flex-1">
              <div className="flex flex-col items-start gap-1 w-full max-w-[296px]">
                <label className="text-sm font-medium text-gray-700 font-inter">
                  Farmer ID / Fayda ID <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-row items-start gap-4 w-full">
                  <input
                    type="text"
                    value={farmerId}
                    onChange={(e) => dispatch(setFarmerId(e.target.value))}
                    placeholder="Search by Farmer ID or National ID"
                    className="w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-[#16A34A] focus:ring-[#16A34A]/20 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {/* Mock search if needed */}}
                    className="flex flex-row justify-center items-center px-4 py-[10px] w-[98px] h-[42px] bg-white border border-[rgba(22,163,74,0.73)] shadow-sm rounded-md text-[#16A34A] font-inter font-medium text-sm hover:bg-[#F0FDFA] transition-colors"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={!farmerId || isLoadingConsent}
              className="flex flex-row justify-center items-center px-4 py-[10px] gap-2 w-[241px] h-[42px] bg-[#16A34A] shadow-sm rounded-md text-white font-inter font-medium text-sm hover:bg-[#15803d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
            >
              {isLoadingConsent ? 'Sending...' : 'Send OTP'}
            </button>
          </div>
        </div>
        {consentError && (
            <p className="text-sm text-red-500">{consentError}</p>
        )}
      </div>

      <OTPVerificationModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        farmerId={farmerId}
      />
    </section>
  );
}
