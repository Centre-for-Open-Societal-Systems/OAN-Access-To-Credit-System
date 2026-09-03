import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toast } from '@/lib/toast';
import { AlertCircle, Calendar, Eye, FileText, Folder, Loader2, Sparkles, Upload, X } from 'lucide-react';
import { useParams } from 'next/navigation';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { AllowedDataField, ConsentReason, consentService } from '../api/consent.service';
import { selectConsentState, submitConsentThunk, type ConsentAudience } from '../store/consentSlice';
import { isConsentApproved } from '../utils/isConsentApproved';
// eslint-disable-next-line boundaries/dependencies -- TODO (2026-08-23): needs to be fixed later; hiding for now as this existed before our changes
import { selectFarmerState, selectIsPollingLong } from '@/features/new-lead/store/farmerSlice';
// eslint-disable-next-line boundaries/dependencies -- reuses the shared magic-header PDF validator rather than duplicating a weaker check here
import { PdfValidationError, validateAndEncodePdf } from '@/features/seller/utils/pdf-validation';
import { ProfileSyncLoadingModal } from './modals/ProfileSyncLoadingModal';
import { SelectField } from '@/components/ui/SelectField';

interface ConsentFinalizationSectionProps {
  /**
   * The lead the consent is anchored on. Optional so the Development Agent's
   * `/leads/[id]` route keeps reading it from the route param; the farmer's
   * apply page has no such param and passes its own lead explicitly.
   */
  leadId?: string | undefined;
  audience?: ConsentAudience | undefined;
}

export function ConsentFinalizationSection({ leadId: leadIdProp, audience = 'agent' }: ConsentFinalizationSectionProps = {}) {
  const dispatch = useAppDispatch();
  const params = useParams();
  const leadId = leadIdProp || (audience === 'agent' ? (params?.id as string) : undefined) || '';
  const isFarmer = audience === 'farmer';

  const { isOtpVerified, consentDate, isSubmittingConsent, consentError } = useAppSelector(selectConsentState);
  const isPollingLong = useAppSelector(selectIsPollingLong);
  const { farmerId, farmerDetails, searchedFarmer } = useAppSelector(selectFarmerState);

  // Dynamic Metadata State
  const [consentReasons, setConsentReasons] = useState<ConsentReason[]>([]);
  const [allowedFieldsList, setAllowedFieldsList] = useState<AllowedDataField[]>([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState<boolean>(true);
  const [metadataError, setMetadataError] = useState<string | null>(null);

  // Form State
  const [consentType, setConsentType] = useState<string>('specific');
  const [selectedReasonId, setSelectedReasonId] = useState<number | undefined>(undefined);
  const [selectedDuration, setSelectedDuration] = useState<number | undefined>(undefined);
  const [selectedFieldIds, setSelectedFieldIds] = useState<number[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);

  // Signed Consent Form State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [consentFile, setConsentFile] = useState<File | null>(null);
  // Base64 payload produced once, at validation time, so submit doesn't re-read the file.
  const [consentFileData, setConsentFileData] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Handle to the in-flight consent submission (which chains a demographic-sync
  // poll lasting up to 2 minutes) so it can be cancelled if the user navigates away.
  const submitRequestRef = useRef<{ abort: () => void } | null>(null);
  useEffect(() => {
    return () => {
      submitRequestRef.current?.abort();
    };
  }, []);

  const isApproved = isFarmer
    ? !!consentDate
    : isConsentApproved(farmerDetails, consentDate);

  const isOtpVerifiedReady = isFarmer
    ? isOtpVerified
    : (isOtpVerified || farmerDetails?.consent_request_otp_verified === true);

  // Fetch metadata options on mount if OTP is verified
  useEffect(() => {
    let active = true;
    const fetchMetadata = async () => {
      try {
        setIsLoadingMetadata(true);
        setMetadataError(null);
        const [reasons, fields] = await Promise.all([
          consentService.get_consent_reasons(),
          consentService.get_consent_allowed_fields(),
        ]);
        if (active) {
          setConsentReasons(reasons);
          setAllowedFieldsList(fields);
        }
      } catch {
        if (active) {
          setMetadataError('Failed to fetch consent configuration options.');
        }
      } finally {
        if (active) {
          setIsLoadingMetadata(false);
        }
      }
    };

    if (isOtpVerifiedReady && !isApproved) {
      fetchMetadata();
    }

    return () => {
      active = false;
    };
  }, [isOtpVerifiedReady, isApproved]);

  useEffect(() => {
    if (consentFile) {
      // URL.createObjectURL/revokeObjectURL is an imperative browser API with
      // required cleanup — can't be computed during render, has to live in an effect.
      const url = URL.createObjectURL(consentFile);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [consentFile]);

  // Only display if OTP is verified but final consent has not yet been submitted/approved
  if (!isOtpVerifiedReady || isApproved) {
    return null;
  }

  if (metadataError) {
    return (
      <section className="flex flex-col items-center py-8 px-6 gap-3 w-full bg-white border border-red-100 rounded-xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)]">
        <AlertCircle className="text-red-500" size={32} />
        <p className="text-sm font-semibold text-red-700 text-center">{metadataError}</p>
      </section>
    );
  }

  if (isLoadingMetadata) {
    return (
      <section className="flex flex-col items-center py-12 gap-3 w-full bg-white border border-[#F1F3F4] rounded-xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)]">
        <Loader2 className="animate-spin text-[#16A34A]" size={32} />
        <p className="text-sm font-medium text-[#4B5563]">Loading consent reasons and registry fields...</p>
      </section>
    );
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Extension/MIME are just a quick UX hint — the real check is the %PDF-
      // magic-header + size/encoding validation below, which a renamed or
      // MIME-spoofed non-PDF file cannot pass.
      const { filedata } = await validateAndEncodePdf(file);
      setConsentFile(file);
      setConsentFileData(filedata);
      if (localError) setLocalError(null);
    } catch (err) {
      const errorMsg = err instanceof PdfValidationError
        ? err.message
        : 'Failed to validate the selected PDF file.';
      setLocalError(errorMsg);
      toast.error(errorMsg);
      setConsentFile(null);
      setConsentFileData(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveConsentFile = () => {
    setConsentFile(null);
    setConsentFileData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleToggleField = (fieldId: number) => {
    if (consentType === 'baseline') return; // Cannot edit under baseline consent
    if (selectedFieldIds.includes(fieldId)) {
      setSelectedFieldIds(selectedFieldIds.filter(id => id !== fieldId));
    } else {
      setSelectedFieldIds([...selectedFieldIds, fieldId]);
      if (localError) setLocalError(null);
    }
  };

  const handleSubmit = async () => {
    setLocalError(null);
    const activeFields = consentType === 'baseline' ? allowedFieldsList.map(f => f.id) : selectedFieldIds;

    if (!consentFile || !consentFileData) {
      setLocalError('Please upload the signed consent form PDF.');
      return;
    }
    if (activeFields.length === 0) {
      setLocalError('At least one registry field must be permitted.');
      return;
    }
    if (audience === 'agent' && !leadId) {
      setLocalError('Missing Lead ID.');
      return;
    }
    if (!selectedReasonId) {
      setLocalError('Please select a consent reason.');
      return;
    }
    if (!selectedDuration) {
      setLocalError('Please select a consent validity duration.');
      return;
    }

    try {
      const request = dispatch(submitConsentThunk({
        leadId: leadId || undefined,
        consent_type: consentType,
        consent_reason_id: selectedReasonId,
        validity_months: selectedDuration,
        allowed_data_field_ids: activeFields,
        consentFormFilename: consentFile.name,
        consentFormBase64: consentFileData
      }));
      submitRequestRef.current = request;
      await request;
    } catch {
      setLocalError('Failed to process consent form file.');
    }
  };

  const isFieldDisabled = consentType === 'baseline';
  const displayedFieldIds = isFieldDisabled ? allowedFieldsList.map(f => f.id) : selectedFieldIds;

  return (
    <>
      <section className="flex flex-col items-center pb-6 gap-4 w-full bg-white border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-xl">
        {/* Header */}
        <div className="flex flex-col p-5 w-full border-b border-[#dedede] gap-1">
          <h2 className="font-inter font-bold text-[17px] text-[#232F34]">
            Consent Details
          </h2>
          <p className="text-[13.5px] text-[#4B5563]">
            {isFarmer
              ? 'Your identity is verified. Choose what you are sharing, for how long, and upload your signed consent form.'
              : 'Verification has succeeded. You can now complete and submit the consent request.'}
          </p>
        </div>

        <div className="flex flex-col gap-5 px-6 w-full mt-4">
          {/* Farmer Details Box */}
          <div className="flex flex-row justify-between items-center p-4 border border-[#E5E7EB] rounded-xl bg-[#F9FAFB]">
            <div className="flex flex-row gap-4 items-center">
              {(farmerDetails?.profileImageUrl || searchedFarmer?.profileImageUrl) && (
                <div className="flex-shrink-0">
                  {/* TODO: profileImageUrl isn't run through toProxiedFileUrl (see @/lib/utils) — if it's
                      an absolute external host, the CSP's img-src 'self' already blocks it in production,
                      same underlying issue as the dicebear avatars elsewhere. Not converting to next/image
                      here since that wouldn't fix the actual problem. */}
                  {/* eslint-disable-next-line @next/next/no-img-element -- see TODO above */}
                  <img
                    src={farmerDetails?.profileImageUrl || searchedFarmer?.profileImageUrl}
                    alt="Farmer Profile"
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#16A34A] shadow-sm bg-white"
                  />
                </div>
              )}
              <div className="flex flex-col gap-2 items-start">
                <span className="px-2 py-0.5 bg-[#E8F5E9] text-[#16A34A] text-[10px] font-bold tracking-wider rounded uppercase">
                  {isFarmer ? 'APPLICANT' : 'SELECTED FARMER'}
                </span>
                <div className="flex flex-col gap-1.5">
                  <span className="font-bold text-[#1F2937] text-lg bg-[#E0E7FF] px-1.5 rounded-sm w-fit leading-tight uppercase">
                    {farmerDetails?.firstName || searchedFarmer?.firstName || ''} {farmerDetails?.lastName || searchedFarmer?.lastName || ''}
                  </span>
                  <span className="text-sm text-[#6B7280]">
                    Farmer ID: <span className="bg-[#E0E7FF] px-1 rounded-sm font-medium text-[#4B5563] ml-1">{farmerId || '—'}</span>
                  </span>
                  {(farmerDetails?.phoneNumber || searchedFarmer?.phoneNumber) && (
                    <span className="text-sm text-[#6B7280]">
                      Phone: <span className="font-medium text-[#4B5563] ml-1">{farmerDetails?.phoneNumber || searchedFarmer?.phoneNumber}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic File Upload & Consent reason in side-by-side or clean row layout */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 w-full">
            {/* Left Column: Details & Reason */}
            <div className="flex flex-col gap-4">
              {/* Consent Reason / Purpose */}
              <div className="flex flex-col gap-2">
                <label htmlFor="consent-reason-select" className="text-[14px] font-semibold text-[#374151] flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#16A34A]" />
                  Consent Reason / Purpose <span className="text-red-500">*</span>
                </label>
                <div className="relative z-50">
                  <SelectField
                    options={consentReasons.map(r => ({
                      label: r.name + (r.description && r.description !== r.name ? ` — ${r.description}` : ''),
                      value: String(r.id)
                    }))}
                    value={selectedReasonId ? String(selectedReasonId) : ''}
                    onChange={(val) => {
                      setSelectedReasonId(Number(val));
                      if (localError) setLocalError(null);
                    }}
                    placeholder="Select a reason..."
                  />
                </div>
              </div>

              {/* Consent Type */}
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-[#374151]">Consent Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setConsentType('specific')}
                    className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all ${consentType === 'specific'
                      ? 'border-[#16A34A] bg-[#F0FDFA] ring-1 ring-[#16A34A]'
                      : 'border-[#E5E7EB] bg-white hover:bg-gray-50'
                      }`}
                  >
                    <span className="font-semibold text-[13px] sm:text-[14px] text-[#111827]">Specific Consent</span>
                    <span className="text-[11px] sm:text-[12px] text-[#6B7280] mt-1 leading-4">
                      Share selected registry fields only.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsentType('baseline')}
                    className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all ${consentType === 'baseline'
                      ? 'border-[#16A34A] bg-[#F0FDFA] ring-1 ring-[#16A34A]'
                      : 'border-[#E5E7EB] bg-white hover:bg-gray-50'
                      }`}
                  >
                    <span className="font-semibold text-[13px] sm:text-[14px] text-[#111827]">Baseline</span>
                    <span className="text-[11px] sm:text-[12px] text-[#6B7280] mt-1 leading-4">
                      Share all demographic data.
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Upload signed consent form */}
            <div className="flex flex-col gap-2">
              <label htmlFor="consent-form-upload" className="text-[14px] font-semibold text-[#374151] flex items-center gap-1.5">
                <Upload size={14} className="text-[#6B7280]" />
                Signed Consent Form PDF <span className="text-red-500">*</span>
              </label>
              <div className="flex-1 flex flex-col justify-center p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg">
                {consentFile ? (
                  <div className="flex flex-col gap-3 w-full">
                    <div className="flex items-center justify-between bg-white border border-[#E5E7EB] rounded-md p-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex justify-center items-center w-9 h-9 bg-[#FEF2F2] rounded-md shrink-0">
                          <FileText size={16} className="text-[#DC2626]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-xs sm:text-sm text-[#111827] truncate max-w-[180px] sm:max-w-[220px]">
                            {consentFile.name}
                          </p>
                          <p className="text-[11px] text-[#6B7280] mt-0.5">
                            {(consentFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {previewUrl && (
                          <a
                            href={previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center p-1.5 border border-[#E5E7EB] rounded-md hover:bg-gray-50 text-gray-600"
                          >
                            <Eye size={14} />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={handleRemoveConsentFile}
                          className="flex items-center justify-center p-1.5 border border-red-200 text-red-600 rounded-md hover:bg-red-50"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                    className="flex flex-col items-center justify-center p-4 border border-dashed border-[#D1D5DB] hover:border-[#16A34A] rounded-lg bg-white hover:bg-gray-50 transition-all cursor-pointer min-h-[110px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A] focus-visible:ring-offset-2"
                  >
                    <div className="flex justify-center items-center w-10 h-10 bg-gray-50 rounded-full shadow-[0px_1px_2px_rgba(0,0,0,0.05)] mb-2">
                      <Folder size={18} className="text-[#9CA3AF] fill-current" />
                    </div>
                    <span className="font-medium text-xs sm:text-sm text-center text-[#111827]">
                      Click or drag & drop to upload signed consent PDF
                    </span>
                    <input
                      id="consent-form-upload"
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,application/pdf"
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Consent Validity Duration & Submit Button */}
          <div className="flex flex-col gap-3 pt-2">
            <label className="text-[14px] font-semibold text-[#374151] flex items-center gap-1.5">
              <Calendar size={14} className="text-[#6B7280]" />
              Consent Validity Duration <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full xl:w-auto">
                {[
                  { label: '1 Month', value: 1 },
                  { label: '3 Months', value: 3 },
                  { label: '6 Months', value: 6 },
                  { label: '1 Year', value: 12 },
                ].map((preset) => {
                  const isActive = selectedDuration === preset.value;
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => {
                        setSelectedDuration(preset.value);
                        if (localError && localError !== 'At least one registry field must be permitted.') setLocalError(null);
                      }}
                      className={`px-4 py-2 text-sm font-medium rounded-md border transition-all flex items-center justify-center ${isActive
                        ? 'border-[#16A34A] bg-[#F0FDFA] text-[#15803D] ring-1 ring-[#16A34A]'
                        : 'border-[#D1D5DB] bg-white text-[#374151] hover:bg-gray-50'
                        }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmittingConsent}
                className="w-full xl:w-auto shrink-0 flex flex-row justify-center items-center px-6 py-[10px] bg-[#16A34A] hover:bg-[#15803D] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-md font-inter font-medium text-[14px] leading-5 text-white transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span className='font-semibold'>{isSubmittingConsent ? 'Submitting Consent...' : 'Confirm & Submit Consent'}</span>
              </button>
            </div>

            {(localError || consentError) && (
              <p role="alert" aria-live="assertive" className="text-red-500 text-[14px] font-medium m-0 mt-1">
                {localError || consentError}
              </p>
            )}
          </div>

          {/* Permitted Data Fields */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-[#374151] flex items-center gap-1.5">
              <FileText size={14} className="text-[#6B7280]" />
              Permitted Registry Fields
            </label>
            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {allowedFieldsList.map((field) => {
                  const isChecked = displayedFieldIds.includes(field.id);
                  return (
                    <label
                      key={field.id}
                      className={`flex items-center gap-2.5 text-left hover:bg-gray-100 p-2 rounded-md transition-colors ${isFieldDisabled ? 'opacity-85 cursor-not-allowed pointer-events-none' : 'cursor-pointer'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleField(field.id)}
                        disabled={isFieldDisabled}
                        className="cursor-pointer shrink-0"
                      />
                      <span className="text-[13px] font-medium text-[#374151]">
                        {field.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
      <ProfileSyncLoadingModal isOpen={isPollingLong} />
    </>
  );
}
