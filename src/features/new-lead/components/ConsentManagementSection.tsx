import { selectOfficerName } from '@/features/auth/store/authSlice';
import { logger } from '@/lib/logger';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { searchFarmerConsent, selectConsentState } from '../store/consentSlice';
import { searchFarmerThunk, selectFarmerState, setFarmerId } from '../store/farmerSlice';
import { selectVerificationBlocked } from '../store/newLeadSlice';

const OTPVerificationModal = dynamic(() => import('./modals/OTPVerificationModal').then(mod => mod.OTPVerificationModal), {
  ssr: false,
});
const ConsentDetailsModal = dynamic(() => import('./modals/ConsentDetailsModal').then(mod => mod.ConsentDetailsModal), {
  ssr: false,
});

export function ConsentManagementSection() {
  const dispatch = useAppDispatch();
  const { farmerId, isSearchingFarmer, searchedFarmer, farmerDetails, searchError, detailsError } = useAppSelector(selectFarmerState);
  const { isLoadingConsent, consentError, isOtpVerified, consentDate } = useAppSelector(selectConsentState);
  const verificationBlocked = useAppSelector(selectVerificationBlocked);
  const officerName = useAppSelector(selectOfficerName) || 'AgriBank';
  const params = useParams();
  const leadId = params?.id as string;
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [maskedPhone, setMaskedPhone] = useState<string>('');

  const isProfileCreated = !!farmerDetails?.farmer_profile_created || !!farmerDetails?.firstName;
  const isFinalizingConsent = isOtpVerified && !consentDate;

  // Only consider sync in progress if we are actively tracking it in this session (isOtpVerified = true)
  const isSyncInProgress = isOtpVerified &&
    farmerDetails?.consent_request_status !== 'Pending OTP' &&
    farmerDetails?.consent_request_otp_verified === true &&
    farmerDetails?.farmer_profile_created === false;

  const isVerified = isProfileCreated || isFinalizingConsent || (isSyncInProgress && !detailsError);

  // Highlight as a verification blocker only if a verify attempt failed and consent is not yet approved.
  const isMissingForVerification = verificationBlocked && !isVerified;

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
    <section className={`flex flex-col items-center pb-6 gap-4 w-full bg-white border shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-xl ${isMissingForVerification ? 'border-[#EF4444] border-l-4' : 'border-[#F1F3F4]'}`}>
      <div className="flex flex-row items-center p-5 w-full border-b border-[#dedede]">
        <h2 className="font-inter font-semibold text-lg leading-7 flex items-center gap-2 text-[#232F34]">
          <ShieldCheck size={20} className="text-[#6B7280]" />
          Consent Management
          {isMissingForVerification && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FEF2F2] border border-[#FECACA] rounded-md text-[#DC2626] text-xs font-medium">
              <AlertCircle size={12} />
              Required for verification
            </span>
          )}
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
              {farmerDetails?.requested_data_fields && farmerDetails.requested_data_fields.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsConsentModalOpen(true)}
                  className="text-[14px] font-bold text-[#16A34A] leading-[20px] hover:underline cursor-pointer focus:outline-none"
                >
                  View Consent Details
                </button>
              )}
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
              <div className="text-[13px] text-green-600 font-medium bg-[#F0FDFA] border border-[#DCFCE7] rounded px-3 py-1.5 w-full break-all ">
                Farmer: {searchedFarmer.firstName} {searchedFarmer.lastName} ({searchedFarmer.phoneNumber})
              </div>
            )}
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={!searchedFarmer?.firstName || isLoadingConsent || isSearchingFarmer}
              className="w-full h-[42px] rounded-md bg-[#16A34A] text-[15px] font-bold  text-white hover:bg-[#15803d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center"
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
