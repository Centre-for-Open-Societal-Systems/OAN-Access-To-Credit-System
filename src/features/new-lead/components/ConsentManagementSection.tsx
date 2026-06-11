import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectNewLeadState, setFarmerId, searchFarmerThunk, searchFarmerConsent, fetchLeadDetailsThunk } from '../store/newLeadSlice';
import { selectOfficerName } from '@/features/auth/store/authSlice';
import { newLeadService } from '../api/newLead.service';
import { OTPVerificationModal } from './modals/OTPVerificationModal';
import { Eye, X, FileText, CheckCircle2, Folder, Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';

export function ConsentManagementSection() {
  const dispatch = useAppDispatch();
  const { farmerId, isLoadingConsent, consentError, isOtpVerified, consentDate, consentRequestId, farmerDetails } = useAppSelector(selectNewLeadState);
  const officerName = useAppSelector(selectOfficerName) || 'AgriBank';
  const params = useParams();
  const leadId = params?.id as string;
  const consent_id = consentRequestId;
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

  const isVerified = isOtpVerified || !!consentDate;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [consentFile, setConsentFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (consentFile) {
      const url = URL.createObjectURL(consentFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [consentFile]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setConsentFile(e.target.files[0]);
    }
  };

  const handleRemoveConsentFile = () => {
    setConsentFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Extract the base64 content after the comma
        const base64Data = result.split(',')[1] || '';
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSendOtp = async () => {
    if (!farmerId || !consentFile) return;
    try {
      const base64Data = await convertToBase64(consentFile);
      const resultAction = await dispatch(searchFarmerConsent({
        farmerId,
        consentFormFilename: consentFile.name,
        consentFormBase64: base64Data,
        partnerName: officerName,
        leadId
      }));
      if (searchFarmerConsent.fulfilled.match(resultAction)) {
        setIsOtpModalOpen(true);
      }
    } catch (e) {
      console.error('Failed to convert file to base64', e);
    }
  };

  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulateWebhook = async () => {
    if (!leadId || isSimulating) return;
    setIsSimulating(true);
    try {
      await newLeadService.simulateWebhook(leadId);
      // Give the backend a second to process the webhook and then refetch
      setTimeout(() => {
        dispatch(fetchLeadDetailsThunk(leadId));
        setIsSimulating(false);
      }, 1000);
    } catch (e) {
      console.error('Webhook simulation failed', e);
      setIsSimulating(false);
    }
  };

  return (
    <section className="flex flex-col items-center pb-6 gap-4 w-full bg-white border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] rounded-xl">
      <div className="flex flex-row items-center p-5 w-full border-b border-[#dedede]">
        <h2 className="font-inter font-semibold text-lg leading-7 flex items-center text-[#232F34]">
          Consent Management
        </h2>
      </div>

      <div className="flex flex-col md:flex-row items-start px-6 gap-12 w-full">
        {/* Left Column: Request Details */}
        <div className="flex flex-col items-start gap-1 flex-1 w-full">
          <label className="text-[14px] font-medium text-[#374151] mb-1">
            Farmer ID / Fayda ID <span className="text-red-500">*</span>
          </label>
          {isVerified ? (
            <>
              <div className="w-full bg-[#F9FAFB] border border-[#D1D5DB] rounded-md shadow-sm h-[42px] px-4 flex items-center mb-1">
                <span className="text-[14px] text-gray-900/40">{farmerId || '***********'}</span>
              </div>
              <div className="flex flex-row items-center gap-1.5 mt-1">
                <CheckCircle2 size={20} className="text-[#16A34A]" fill="#16A34A" color="white" />
                <span className="text-[12px] font-bold text-[#16A34A] leading-[20px]">View Consent Details</span>
                <span className="text-[12px] font-medium text-[#6B7280] leading-[20px] ml-1">provided on {consentDate || 'N/A'}</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3 w-full">
              <div className="flex flex-row gap-3 w-full">
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
                  disabled={!farmerId?.trim() || isLoadingConsent}
                  className="h-[42px] px-6 rounded-md border border-[#16A34A] text-[15px] font-medium text-[#16A34A] hover:bg-[#F0FDFA] transition-colors bg-white shadow-sm flex items-center justify-center shrink-0 disabled:opacity-50"
                >
                  Search
                </button>
              </div>
              {farmerDetails?.firstName && (
                <div className="text-[13px] text-green-600 font-medium bg-[#F0FDFA] border border-[#DCFCE7] rounded px-3 py-1.5 w-full">
                  Farmer: {farmerDetails.firstName} {farmerDetails.lastName} ({farmerDetails.phoneNumber})
                </div>
              )}
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={!farmerId || isLoadingConsent || !consentFile}
                className="w-full h-[42px] rounded-md bg-[#16A34A] text-[15px] font-medium text-white hover:bg-[#15803d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center"
              >
                {isLoadingConsent ? 'Sending...' : 'Send OTP'}
              </button>
              {consentError && (
                <p className="text-sm text-red-500 mt-1">{consentError}</p>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Signed Consent Form */}
        <div className="flex flex-col items-start p-4 gap-3 flex-1 w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg mt-4 md:mt-0">
          {(consentFile || consent_id) ? (
            <>
              <div className="flex flex-row justify-between items-start w-full">
                <div className="flex flex-col items-start gap-0">
                  <h5 className="font-inter font-medium text-[14px] leading-5 text-[#111827]">Signed Consent Form</h5>
                  <p className="font-inter font-normal text-[12px] leading-4 text-[#6B7280]">Physical copy signed by farmer</p>
                </div>
                <div className="flex flex-row items-center gap-2">
                  {previewUrl && (
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-row justify-center items-center px-3 py-1 gap-1.5 h-8 bg-[#EEF3F3] border border-[#16A34A] rounded-lg hover:bg-[#dcfce7] transition-colors"
                    >
                      <Eye size={14} className="text-[#16A34A]" />
                      <span className="font-roboto font-bold text-[12px] leading-[24px] text-[#16A34A]">View</span>
                    </a>
                  )}
                  {!isVerified && (
                    <button
                      onClick={handleRemoveConsentFile}
                      className="flex flex-row justify-center items-center w-8 h-8 bg-[#FFF3F2] border border-[#FF666C] rounded-lg hover:bg-[#fee2e2] transition-colors"
                    >
                      <X size={16} className="text-[#FF666C]" />
                    </button>
                  )}
                </div>
              </div>

              {/* File progress block */}
              <div className="flex flex-col items-start p-3 gap-2 w-full bg-white border border-[#E5E7EB] rounded-md mt-1">
                <div className="flex flex-row items-center gap-3 w-full">
                  <div className="flex justify-center items-center w-10 h-10 bg-[#FEF2F2] rounded-md shrink-0">
                    <FileText size={18} className="text-[#DC2626]" />
                  </div>
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className="font-inter font-medium text-[14px] leading-5 text-[#111827] truncate w-full">
                      {consentFile ? consentFile.name : 'consent_signed_2024.pdf'}
                    </span>
                    <div className="flex flex-row justify-between items-center w-full mt-0.5">
                      <span className="font-inter font-normal text-[12px] leading-4 text-[#6B7280]">
                        {consentFile ? `${(consentFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.2 MB'}
                      </span>
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
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-row items-center p-[12px_8px] gap-[10px] w-full bg-white border border-dashed border-[#D1D5DB] hover:border-[#16A34A] rounded-[4px] mt-1 h-[86px] box-border cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-center items-center w-[64px] h-[64px] bg-[#F5F5F5] rounded-full shadow-[0px_1px_2px_rgba(0,0,0,0.05)] shrink-0">
                  <Folder size={24} className="text-[#9CA3AF] fill-current" />
                </div>
                <div className="flex flex-col items-center justify-center flex-1 h-[60px] pb-1">
                  <span className="font-inter font-medium text-[14px] leading-[20px] text-center text-[#111827]">
                    Drag and drop files here<br />Or<br />Click to Browse files
                  </span>
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf,image/*"
                className="hidden"
              />
            </>
          )}
        </div>
      </div>

      <OTPVerificationModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        farmerId={farmerId}
      />
    </section>
  );
}
