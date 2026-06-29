import { logger } from '@/lib/logger';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectFarmerState, setFarmerId, searchFarmerThunk } from '../store/farmerSlice';
import { selectConsentState, searchFarmerConsent } from '../store/consentSlice';
import { selectOfficerName } from '@/features/auth/store/authSlice';
import { CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const OTPVerificationModal = dynamic(() => import('./modals/OTPVerificationModal').then(mod => mod.OTPVerificationModal), {
  ssr: false,
});
const ConsentDetailsModal = dynamic(() => import('./modals/ConsentDetailsModal').then(mod => mod.ConsentDetailsModal), {
  ssr: false,
});

export function ConsentManagementSection() {
  const dispatch = useAppDispatch();
  const { farmerId, isSearchingFarmer, searchedFarmer, farmerDetails, searchError } = useAppSelector(selectFarmerState);
  const { isLoadingConsent, consentError, isOtpVerified, consentDate } = useAppSelector(selectConsentState);
  const officerName = useAppSelector(selectOfficerName) || 'AgriBank';
  const params = useParams();
  const leadId = params?.id as string;
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [maskedPhone, setMaskedPhone] = useState<string>('');

  const isVerified = isOtpVerified || !!consentDate || !!farmerDetails?.firstName;

  // Dispatches an OTP request and refreshes the masked phone. Returns true on success.
  const requestOtp = async (): Promise<boolean> => {
    if (!farmerId) return false;
    try {
      const resultAction = await dispatch(searchFarmerConsent({
        farmerId,
        partnerName: officerName,
        leadId
      }));
      if (searchFarmerConsent.fulfilled.match(resultAction)) {
        const payload = resultAction.payload;
        if (payload?.masked_phone) {
          setMaskedPhone(payload.masked_phone);
        }
        return true;
      }
      return false;
    } catch (e) {
      logger.error('Failed to request OTP', e);
      return false;
    }
  };

  const handleSendOtp = async () => {
    if (await requestOtp()) {
      setIsOtpModalOpen(true);
    }
  };

  return (
    <section className="flex flex-col items-center pb-6 gap-4 w-full bg-white border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-xl">
      <div className="flex flex-row items-center p-5 w-full border-b border-[#dedede]">
        <h2 className="font-inter font-semibold text-lg leading-7 flex items-center gap-2 text-[#232F34]">
          <ShieldCheck size={20} className="text-[#6B7280]" />
          Consent Management
        </h2>
      </div>

      <div className="flex flex-col items-start px-4 sm:px-6 w-full max-w-2xl gap-1">
        <label className="text-[14px] font-medium text-[#374151] mb-1">
          Farmer ID / Fayda ID <span className="text-red-500">*</span>
        </label>
        {isVerified ? (
          <div className="w-full flex flex-col gap-3">
            <div className="w-full bg-[#F9FAFB] border border-[#D1D5DB] rounded-md shadow-sm h-[42px] px-4 flex items-center">
              <span className="text-[14px] text-gray-900/40">{farmerId || '***********'}</span>
            </div>
            <div className="flex flex-row items-center gap-1.5">
              <CheckCircle2 size={20} className="text-[#16A34A]" fill="#16A34A" color="white" />
              <button
                type="button"
                onClick={() => setIsConsentModalOpen(true)}
                className="text-[14px] font-bold text-[#16A34A] leading-[20px] hover:underline cursor-pointer focus:outline-none"
              >
                View Consent Details
              </button>
              <span className="text-[14px] font-medium text-[#6B7280] leading-[20px] ml-1">
                {consentDate ? `provided on ${consentDate}` : 'verified via registry'}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 w-full">
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <input
                type="text"
                value={farmerId}
                onChange={(e) => dispatch(setFarmerId(e.target.value))}
                placeholder="Search by Farmer ID or National ID"
                className="flex-1 h-[42px] rounded-md border border-[#D1D5DB] px-4 text-[15px] shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 bg-white min-w-0"
              />
              <button
                type="button"
                onClick={() => {
                  if (farmerId?.trim()) {
                    dispatch(searchFarmerThunk(farmerId.trim()));
                  }
                }}
                disabled={!farmerId?.trim() || isLoadingConsent || isSearchingFarmer}
                className="h-[42px] px-6 rounded-md border border-[#16A34A] text-[15px] font-medium text-[#16A34A] hover:bg-[#F0FDFA] transition-colors bg-white shadow-sm flex items-center justify-center shrink-0 disabled:opacity-50"
              >
                {isSearchingFarmer ? 'Searching...' : 'Search'}
              </button>
            </div>
            {searchedFarmer?.firstName && (
              <div className="text-[13px] text-green-600 font-medium bg-[#F0FDFA] border border-[#DCFCE7] rounded px-3 py-1.5 w-full">
                Farmer: {searchedFarmer.firstName} {searchedFarmer.lastName} ({searchedFarmer.phoneNumber})
              </div>
            )}
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={!searchedFarmer?.firstName || isLoadingConsent || isSearchingFarmer}
              className="w-full h-[42px] rounded-md bg-[#16A34A] text-[15px] font-medium text-white hover:bg-[#15803d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center"
            >
              {isLoadingConsent ? 'Sending...' : 'Send OTP'}
            </button>
            {(consentError || searchError) && (
              <div className="flex items-start gap-2 w-full mt-1 bg-[#FEF2F2] text-[#DC2626] p-3 rounded-md border border-[#FECACA]">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p className="text-[14px] font-medium leading-[20px]">{consentError || searchError}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <OTPVerificationModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        farmerId={farmerId}
        maskedPhone={maskedPhone}
        onResend={requestOtp}
      />

      <ConsentDetailsModal
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        requestedDataFields={farmerDetails?.requested_data_fields ?? []}
      />
    </section>
  );
}
