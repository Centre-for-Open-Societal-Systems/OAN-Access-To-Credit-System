// eslint-disable-next-line boundaries/dependencies -- TODO (2026-08-23): needs to be fixed later; hiding for now as this existed before our changes
import { selectOfficerName } from '@/features/auth/store/authSlice';
import { logger } from '@/lib/logger';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { AlertCircle, CheckCircle2, RotateCcw, ShieldCheck } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { searchFarmerConsent, selectConsentState, type ConsentAudience } from '../store/consentSlice';
import { isConsentApproved } from '../utils/isConsentApproved';
// eslint-disable-next-line boundaries/dependencies -- TODO (2026-08-23): needs to be fixed later; hiding for now as this existed before our changes
import { searchFarmerThunk, selectFarmerState, setFarmerId } from '@/features/new-lead/store/farmerSlice';
// eslint-disable-next-line boundaries/dependencies -- TODO (2026-08-23): needs to be fixed later; hiding for now as this existed before our changes
import { selectVerificationBlocked } from '@/features/new-lead/store/newLeadSlice';

const OTPVerificationModal = dynamic(() => import('./modals/OTPVerificationModal').then(mod => mod.OTPVerificationModal), {
  ssr: false,
});
const ConsentDetailsModal = dynamic(() => import('./modals/ConsentDetailsModal').then(mod => mod.ConsentDetailsModal), {
  ssr: false,
});

interface ConsentManagementSectionProps {
  /**
   * The lead the consent is anchored on. Optional so the Development Agent's
   * `/leads/[id]` route keeps reading it from the route param; the farmer's
   * apply page has no such param and passes its own lead explicitly.
   */
  leadId?: string | undefined;
  audience?: ConsentAudience | undefined;
}

export function ConsentManagementSection({ leadId: leadIdProp, audience = 'agent' }: ConsentManagementSectionProps = {}) {
  const dispatch = useAppDispatch();
  const { farmerId, isSearchingFarmer, searchedFarmer, farmerDetails, searchError } = useAppSelector(selectFarmerState);
  const { isLoadingConsent, consentError, isOtpVerified, consentDate } = useAppSelector(selectConsentState);
  const verificationBlocked = useAppSelector(selectVerificationBlocked);
  const officerName = useAppSelector(selectOfficerName) || 'AgriBank';
  const params = useParams();
  const leadId = leadIdProp || (audience === 'agent' ? (params?.id as string) : undefined);
  const isFarmer = audience === 'farmer';
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [isRedoingConsent, setIsRedoingConsent] = useState(false);
  const [maskedPhone, setMaskedPhone] = useState<string>('');

  const isApproved = isFarmer
    ? !!consentDate
    : isConsentApproved(farmerDetails, consentDate);

  const isOtpVerifiedReady = isFarmer
    ? isOtpVerified
    : (isOtpVerified || farmerDetails?.consent_request_otp_verified === true);

  const isVerified = !isRedoingConsent && (isApproved || isOtpVerifiedReady);

  // Highlight as a verification blocker only if a verify attempt failed and consent is not yet approved.
  const isMissingForVerification = verificationBlocked && !isApproved;

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

  const displayFaydaId = farmerId || farmerDetails?.faydaId || '***********';

  return (
    <section className={`flex flex-col items-center pb-6 gap-4 w-full bg-white border shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-xl ${isMissingForVerification ? 'border-[#EF4444] border-l-4' : 'border-[#F1F3F4]'}`}>
      <div className="flex flex-row items-center justify-between p-5 w-full border-b border-[#dedede]">
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
        {isApproved && !isRedoingConsent && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-full">
            <CheckCircle2 size={13} /> Consent Active
          </span>
        )}
        {!isApproved && isOtpVerifiedReady && !isRedoingConsent && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-full">
            <CheckCircle2 size={13} /> OTP Verified • Finalization Pending
          </span>
        )}
      </div>

      <div className="flex flex-col items-start px-4 sm:px-6 w-full max-w-2xl gap-1">
        <label htmlFor="consent-farmer-id" className="text-[14px] font-medium text-[#374151] mb-1">
          {isFarmer ? "Your Fayda ID / National ID" : "Farmer ID / Fayda ID"} <span className="text-red-500">*</span>
        </label>
        {isVerified ? (
          <div className="w-full flex flex-col gap-3">
            <div className="w-full bg-[#F9FAFB] border border-[#D1D5DB] rounded-md shadow-sm h-[42px] px-4 flex items-center justify-between">
              <span className="text-[14px] font-medium text-gray-700">{displayFaydaId}</span>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 size={14} /> {isApproved ? 'Verified' : 'OTP Verified'}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-[#16A34A] shrink-0" fill="#16A34A" color="white" />
                {isApproved && farmerDetails?.requested_data_fields && farmerDetails.requested_data_fields.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsConsentModalOpen(true)}
                    className="text-[14px] font-bold text-[#16A34A] leading-[20px] hover:underline cursor-pointer focus:outline-none"
                  >
                    View Consent Details
                  </button>
                )}
                <span className="text-[13px] font-medium text-[#6B7280]">
                  {isApproved
                    ? consentDate
                      ? `provided on ${consentDate}`
                      : farmerDetails?.validity_from
                        ? `valid until ${farmerDetails.validity_to || 'expiry'}`
                        : 'verified via registry'
                    : 'OTP verified. Please complete and submit final consent below.'}
                </span>
              </div>
            </div>

            {/* Bottom Redo Action Footer */}
            <div className="w-full pt-3 mt-1 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {isApproved ? 'Need to update permissions or re-verify?' : 'Need to use a different ID?'}
              </span>
              <button
                type="button"
                onClick={() => setIsRedoingConsent(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-lg shadow-sm transition-colors"
              >
                <RotateCcw size={13} />
                <span className='font-medium'>{isApproved ? 'Redo Consent' : 'Restart Verification'}</span>

              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 w-full">
            {isRedoingConsent && isApproved && (
              <div className="flex items-center justify-between p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 mb-1">
                <span>Re-authorizing consent will update your registry permissions.</span>
                <button
                  type="button"
                  onClick={() => setIsRedoingConsent(false)}
                  className="font-bold underline text-blue-900 hover:text-blue-700"
                >
                  Cancel & Keep Existing
                </button>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <input
                id="consent-farmer-id"
                type="text"
                value={farmerId}
                onChange={(e) => dispatch(setFarmerId(e.target.value))}
                placeholder={isFarmer ? "Enter your Fayda ID or National ID" : "Search by Farmer ID or National ID"}
                className="flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm shadow-sm transition-all focus:outline-none focus-visible:ring-[0.02rem] focus-visible:ring-green-600 focus-visible:ring-offset-0 border-gray-200 hover:border-green-600 bg-white ring-1 ring-green-600/15"
              />
              <button
                type="button"
                onClick={() => {
                  if (farmerId?.trim()) {
                    dispatch(searchFarmerThunk(farmerId.trim()));
                  }
                }}
                disabled={!farmerId?.trim() || isLoadingConsent || isSearchingFarmer}
                className="w-full sm:w-auto h-[44px] min-h-[42px] px-6 rounded-md border border-[#16A34A] text-[15px] font-bold text-[#16A34A] hover:bg-[#F0FDFA] transition-colors bg-white shadow-sm flex items-center justify-center shrink-0 disabled:opacity-50"
              >
                {isSearchingFarmer ? 'Searching...' : 'Search'}
              </button>
            </div>
            {searchedFarmer?.firstName && (
              <div className="text-[13px] text-green-600 font-medium bg-[#F0FDFA] border border-[#DCFCE7] rounded px-3 py-1.5 w-full break-all">
                {isFarmer ? 'Matched: ' : 'Farmer: '}{searchedFarmer.firstName} {searchedFarmer.lastName} ({searchedFarmer.phoneNumber})
              </div>
            )}
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={!searchedFarmer?.firstName || isLoadingConsent || isSearchingFarmer}
              className="w-full h-[42px] rounded-md bg-[#16A34A] text-[15px] font-bold text-white hover:bg-[#15803d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center"
            >
              <span className='font-semibold'>{isLoadingConsent ? 'Sending...' : 'Send OTP'}</span>

            </button>
            {(consentError || searchError) && (
              <div role="alert" aria-live="assertive" className="flex items-start gap-2 w-full mt-1 bg-[#FEF2F2] text-[#DC2626] p-3 rounded-md border border-[#FECACA]">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p className="text-[14px] font-medium leading-[20px]">{consentError || searchError}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <OTPVerificationModal
        isOpen={isOtpModalOpen}
        onClose={() => {
          setIsOtpModalOpen(false);
          setIsRedoingConsent(false);
        }}
        farmerId={farmerId}
        maskedPhone={maskedPhone}
        onResend={requestOtp}
        leadId={leadId}
        audience={audience}
      />

      <ConsentDetailsModal
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        requestedDataFields={farmerDetails?.requested_data_fields ?? []}
        purpose={farmerDetails?.purpose}
        validityFrom={farmerDetails?.validity_from}
        validityTo={farmerDetails?.validity_to}
      />
    </section>
  );
}
