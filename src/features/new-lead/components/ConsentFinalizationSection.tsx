import { useEffect, useState, useRef, ChangeEvent } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { submitConsentThunk, selectConsentState } from '../store/consentSlice';
import { selectIsPollingLong } from '../store/farmerSlice';
import { ProfileSyncLoadingModal } from './modals/ProfileSyncLoadingModal';
import { Calendar, FileText, CheckSquare, Square, ShieldCheck, Loader2, Sparkles, Folder, Eye, X, Upload, AlertCircle } from 'lucide-react';
import { useParams } from 'next/navigation';
import { newLeadService, ConsentReason, AllowedDataField } from '../api/newLead.service';

export function ConsentFinalizationSection() {
  const dispatch = useAppDispatch();
  const params = useParams();
  const leadId = params?.id as string || '';

  const { isOtpVerified, consentDate, isSubmittingConsent, consentError } = useAppSelector(selectConsentState);
  const isPollingLong = useAppSelector(selectIsPollingLong);

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Fetch metadata options on mount if OTP is verified
  useEffect(() => {
    let active = true;
    const fetchMetadata = async () => {
      try {
        setIsLoadingMetadata(true);
        setMetadataError(null);
        const [reasons, fields] = await Promise.all([
          newLeadService.get_consent_reasons(),
          newLeadService.get_consent_allowed_fields(),
        ]);
        if (active) {
          setConsentReasons(reasons);
          setAllowedFieldsList(fields);
        }
      } catch (err) {
        if (active) {
          setMetadataError('Failed to fetch consent configuration options.');
        }
      } finally {
        if (active) {
          setIsLoadingMetadata(false);
        }
      }
    };

    if (isOtpVerified && !consentDate) {
      fetchMetadata();
    }

    return () => {
      active = false;
    };
  }, [isOtpVerified, consentDate]);

  useEffect(() => {
    if (consentFile) {
      const url = URL.createObjectURL(consentFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [consentFile]);

  // Only display if OTP is verified but final consent has not yet been submitted/approved
  if (!isOtpVerified || !!consentDate) {
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
        const base64Data = result.split(',')[1] || '';
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleToggleField = (fieldId: number) => {
    if (consentType === 'baseline') return; // Cannot edit under baseline consent
    if (selectedFieldIds.includes(fieldId)) {
      setSelectedFieldIds(selectedFieldIds.filter(id => id !== fieldId));
    } else {
      setSelectedFieldIds([...selectedFieldIds, fieldId]);
    }
  };

  const handleSubmit = async () => {
    setLocalError(null);
    const activeFields = consentType === 'baseline' ? allowedFieldsList.map(f => f.id) : selectedFieldIds;

    if (!consentFile) {
      setLocalError('Please upload the signed consent form PDF.');
      return;
    }
    if (activeFields.length === 0) {
      setLocalError('At least one registry field must be permitted.');
      return;
    }
    if (!leadId) {
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
      const base64Data = await convertToBase64(consentFile);
      await dispatch(submitConsentThunk({
        leadId,
        consent_type: consentType,
        consent_reason_id: selectedReasonId,
        validity_months: selectedDuration,
        allowed_data_field_ids: activeFields,
        consentFormFilename: consentFile.name,
        consentFormBase64: base64Data
      }));
    } catch (err) {
      setLocalError('Failed to process consent form file.');
    }
  };

  const isFieldDisabled = consentType === 'baseline';
  const displayedFieldIds = isFieldDisabled ? allowedFieldsList.map(f => f.id) : selectedFieldIds;

  return (
    <>
      <section className="flex flex-col items-center pb-6 gap-4 w-full bg-white border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-xl">
        {/* Header */}
        <div className="flex flex-row items-center p-5 w-full border-b border-[#dedede]">
          <h2 className="font-inter font-semibold text-lg leading-7 flex items-center gap-2 text-[#232F34]">
            <ShieldCheck size={20} className="text-[#16A34A]" />
            Finalize Consent Scope & Submission
          </h2>
        </div>

        <div className="flex flex-col gap-5 px-6 w-full mt-2">
          {/* Helper Banner */}
          <div className="p-3.5 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-[13px] text-green-800 leading-5 m-0 font-medium">
              OTP verification successful. Please upload the signed physical consent form, configure the validity range, and allowed registry fields below to submit everything to the registry.
            </p>
          </div>

          {/* Dynamic File Upload & Consent reason in side-by-side or clean row layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
            {/* Left Column: Details & Reason */}
            <div className="flex flex-col gap-4">
              {/* Consent Reason / Purpose */}
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-[#374151] flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#16A34A]" />
                  Consent Reason / Purpose
                </label>
                <div className="relative">
                  <select
                    value={selectedReasonId || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedReasonId(val ? Number(val) : undefined);
                    }}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D1D5DB] rounded-lg text-sm text-[#374151] focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A] outline-none transition-all appearance-none cursor-pointer pr-10"
                  >
                    <option value="" disabled>Select a reason...</option>
                    {consentReasons.map((reason) => (
                      <option key={reason.id} value={reason.id}>
                        {reason.name} {reason.description && reason.description !== reason.name ? `— ${reason.description}` : ''}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-[#6B7280]">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
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
              <label className="text-[14px] font-semibold text-[#374151] flex items-center gap-1.5">
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
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-4 border border-dashed border-[#D1D5DB] hover:border-[#16A34A] rounded-lg bg-white hover:bg-gray-50 transition-all cursor-pointer min-h-[110px]"
                  >
                    <div className="flex justify-center items-center w-10 h-10 bg-gray-50 rounded-full shadow-[0px_1px_2px_rgba(0,0,0,0.05)] mb-2">
                      <Folder size={18} className="text-[#9CA3AF] fill-current" />
                    </div>
                    <span className="font-medium text-xs sm:text-sm text-center text-[#111827]">
                      Click or drag & drop to upload signed consent PDF
                    </span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="application/pdf,image/*"
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
              Consent Validity Duration
            </label>
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex flex-wrap gap-2">
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
                      onClick={() => setSelectedDuration(preset.value)}
                      className={`px-4 py-2 text-sm font-medium rounded-md border transition-all ${isActive
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
                className="flex flex-row justify-center items-center px-6 py-[10px] bg-[#16A34A] hover:bg-[#15803D] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-md font-inter font-medium text-[14px] leading-5 text-white transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmittingConsent ? 'Submitting Consent...' : 'Confirm & Submit Consent'}
              </button>
            </div>

            {(localError || consentError) && (
              <p className="text-red-500 text-[14px] font-medium m-0 mt-1">
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
                    <button
                      key={field.id}
                      type="button"
                      disabled={isFieldDisabled}
                      onClick={() => handleToggleField(field.id)}
                      className={`flex items-center gap-2 text-left hover:bg-gray-100 p-1.5 rounded transition-colors ${isFieldDisabled ? 'opacity-85 cursor-not-allowed' : ''
                        }`}
                    >
                      {isChecked ? (
                        <CheckSquare size={18} className="text-[#16A34A]" />
                      ) : (
                        <Square size={18} className="text-[#9CA3AF]" />
                      )}
                      <span className="text-[13px] font-medium text-[#374151]">
                        {field.name}
                      </span>
                    </button>
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
