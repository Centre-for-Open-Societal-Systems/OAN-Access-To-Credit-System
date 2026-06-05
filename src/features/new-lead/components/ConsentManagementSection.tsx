import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectNewLeadState, setFarmerId, searchFarmerConsent } from '../store/newLeadSlice';
import { OTPVerificationModal } from './modals/OTPVerificationModal';
import { Eye, X, FileText, CheckCircle2, Folder } from 'lucide-react';

export function ConsentManagementSection() {
  const dispatch = useAppDispatch();
  const { leadId, farmerId, isLoadingConsent, consentError, isOtpVerified, consentDate, consentRequestId } = useAppSelector(selectNewLeadState);
  const consent_id = consentRequestId;
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

      {leadId ? (
        <div className="flex flex-col md:flex-row items-start px-6 gap-12 w-full">
          {/* Left Column: Request Details */}
          <div className="flex flex-col items-start gap-1 w-full md:w-[351px]">
            <label className="text-[14px] font-medium text-[#374151] mb-1">
              Farmer ID / Fayda ID <span className="text-red-500">*</span>
            </label>
            <div className="w-full bg-[#F9FAFB] border border-[#D1D5DB] rounded-md shadow-sm h-[42px] px-4 flex items-center mb-1">
              <span className="text-[14px] text-gray-900/40">{farmerId || '***********'}</span>
            </div>
            <div className="flex flex-row items-center gap-1.5 mt-1">
              <CheckCircle2 size={20} className="text-[#16A34A]" fill="#16A34A" color="white" />
              <span className="text-[12px] font-bold text-[#16A34A] leading-[20px]">View Consent Details</span>
              <span className="text-[12px] font-medium text-[#6B7280] leading-[20px] ml-1">provided on {consentDate || 'N/A'}</span>
            </div>
          </div>

          {/* Right Column: Signed Consent Form */}
          <div className="flex flex-col items-start p-4 gap-3 w-full md:w-[340px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg mt-4 md:mt-0">
            {consent_id ? (
              <>
                <div className="flex flex-row justify-between items-start w-full">
                  <div className="flex flex-col items-start gap-0">
                    <h5 className="font-inter font-medium text-[14px] leading-5 text-[#111827]">Signed Consent Form</h5>
                    <p className="font-inter font-normal text-[12px] leading-4 text-[#6B7280]">Physical copy signed by farmer</p>
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <button className="flex flex-row justify-center items-center px-3 py-1 gap-1.5 h-8 bg-[#EEF3F3] border border-[#16A34A] rounded-lg hover:bg-[#dcfce7] transition-colors">
                      <Eye size={14} className="text-[#16A34A]" />
                      <span className="font-roboto font-bold text-[12px] leading-[24px] text-[#16A34A]">View</span>
                    </button>
                    <button className="flex flex-row justify-center items-center w-8 h-8 bg-[#FFF3F2] border border-[#FF666C] rounded-lg hover:bg-[#fee2e2] transition-colors">
                      <X size={16} className="text-[#FF666C]" />
                    </button>
                  </div>
                </div>

                {/* File progress block */}
                <div className="flex flex-col items-start p-3 gap-2 w-full bg-white border border-[#E5E7EB] rounded-md mt-1">
                  <div className="flex flex-row items-center gap-3 w-full">
                    <div className="flex justify-center items-center w-10 h-10 bg-[#FEF2F2] rounded-md shrink-0">
                      <FileText size={18} className="text-[#DC2626]" />
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0">
                      <span className="font-inter font-medium text-[14px] leading-5 text-[#111827] truncate w-full">consent_signed_2024.pdf</span>
                      <div className="flex flex-row justify-between items-center w-full mt-0.5">
                        <span className="font-inter font-normal text-[12px] leading-4 text-[#6B7280]">1.2 MB / 4.5 MB</span>
                        <span className="font-inter font-normal text-[12px] leading-4 text-[#6B7280]">100%</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-[#16A34A] rounded-full w-full"></div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col items-start gap-0 w-full">
                  <h5 className="font-inter font-medium text-[14px] leading-5 text-[#111827]">Signed Consent Form</h5>
                  <p className="font-inter font-normal text-[12px] leading-4 text-[#6B7280]">Physical copy signed by farmer</p>
                </div>
                
                {/* Upload Dropzone */}
                <div className="flex flex-row items-center p-[12px_8px] gap-[10px] w-full bg-white border border-[#E5E7EB] rounded-[4px] mt-1 h-[86px] box-border cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex justify-center items-center w-[64px] h-[64px] bg-[#F5F5F5] rounded-full shadow-[0px_1px_2px_rgba(0,0,0,0.05)] shrink-0">
                    <Folder size={24} className="text-[#9CA3AF] fill-current" />
                  </div>
                  <div className="flex flex-col items-center justify-center flex-1 h-[60px] pb-1">
                    <span className="font-inter font-medium text-[14px] leading-[20px] text-center text-[#111827]">
                      Drag and drop files here<br />Or<br />Click Browse files to select a file
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
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
      )}

      <OTPVerificationModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        farmerId={farmerId}
      />
    </section>
  );
}
