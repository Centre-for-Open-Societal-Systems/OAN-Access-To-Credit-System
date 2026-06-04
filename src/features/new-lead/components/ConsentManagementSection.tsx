import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectNewLeadState, setFarmerId, searchFarmerConsent } from '../store/newLeadSlice';
import { OTPVerificationModal } from './modals/OTPVerificationModal';

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
    <section className="flex flex-col items-center pb-6 gap-4 w-full bg-white border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] rounded-xl">
      <div className="flex flex-row items-center p-5 w-full border-b border-[#dedede]">
        <h2 className="font-inter font-semibold text-lg leading-7 flex items-center text-[#232F34]">
          Consent Management
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap justify-between items-start sm:items-end content-start px-6 gap-4 sm:gap-6 w-full">
        <div className="flex-1 w-full min-w-[200px]">
          <label className="mb-2 block text-[15px] font-medium text-gray-900">
            Farmer ID / Fayda ID <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
            <input
              type="text"
              value={farmerId}
              onChange={(e) => dispatch(setFarmerId(e.target.value))}
              placeholder="Search by Farmer ID or National ID"
              className="flex-1 w-full h-[42px] rounded-md border border-[#D1D5DB] px-4 text-[15px] shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 bg-white"
            />
            <button
              type="button"
              onClick={() => {/* Mock search if needed */ }}
              className="w-full sm:w-auto h-[42px] px-6 rounded-md border border-[rgba(22,163,74,0.73)] text-[15px] font-medium text-[#16A34A] hover:bg-[#F0FDFA] transition-colors bg-white shadow-sm flex items-center justify-center shrink-0"
            >
              Search
            </button>
          </div>
        </div>

        <div className="w-full sm:w-auto mt-2 sm:mt-0">
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={!farmerId || isLoadingConsent}
            className="w-full sm:w-[241px] h-[42px] rounded-md bg-[#16A34A] text-[15px] font-medium text-white hover:bg-[#15803d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center"
          >
            {isLoadingConsent ? 'Sending...' : 'Send OTP'}
          </button>
        </div>
        {consentError && (
          <p className="text-sm text-red-500 md:col-span-2 mt-[-1rem]">{consentError}</p>
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
