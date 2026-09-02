'use client';
import { clearOnboardingErrors, selectOnboardingMutationError, selectOnboardingMutationSource, selectOnboardingMutationStatus, selectUploadedFileUrl, uploadKycDocument } from '@/features/seller/store/onboardingSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { FileText, Loader2, Upload } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { DeleteDocumentModal } from './DeleteDocumentModal';
import { ViewDocumentModal } from './ViewDocumentModal';

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Unable to read the selected file.'));
        return;
      }
      const base64 = result.includes(',') ? result.split(',')[1] ?? '' : result;
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error ?? new Error('Unable to read the selected file.'));
    reader.readAsDataURL(file);
  });
}

export function OrganisationDocumentsCard() {
  const dispatch = useAppDispatch();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mutationStatus = useAppSelector(selectOnboardingMutationStatus);
  const mutationErrorRaw = useAppSelector(selectOnboardingMutationError);
  const mutationSource = useAppSelector(selectOnboardingMutationSource);
  // mutationError is shared with the contacts card's saveOrgContacts
  // call — only surface it here when this card's own upload actually caused it.
  const mutationError = mutationSource === 'document' ? mutationErrorRaw : null;
  const uploadedFileUrl = useAppSelector(selectUploadedFileUrl);

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setLocalError(null);
    if (file && file.type !== 'application/pdf') {
      setUploadedFile(null);
      setLocalError('Only PDF documents are accepted.');
      event.target.value = '';
      return;
    }
    setUploadedFile(file);
  };

  const handleUpload = async () => {
    if (!uploadedFile) {
      setLocalError('Select a PDF before uploading.');
      return;
    }

    try {
      setLocalError(null);
      dispatch(clearOnboardingErrors());
      const filedata = await readFileAsBase64(uploadedFile);
      // Uploading the KYC document only persists the file. Activation happens
      // separately when the organization contacts are saved (by then the KYC
      // doc exists, so the backend's "KYC required" guard is satisfied).
      await dispatch(
        uploadKycDocument({
          filename: uploadedFile.name,
          filedata,
        })
      );
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Unable to upload document.');
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setIsDeleteModalOpen(false);
    setLocalError(null);
    dispatch(clearOnboardingErrors());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isUploading = mutationStatus === 'loading' && mutationSource === 'document';

  return (
    <>
      <div className="flex h-full w-full flex-col rounded-xl border border-[#F1F3F4] bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="flex items-center gap-4 border-b border-gray-200 p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
            <FileText size={20} />
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-gray-900">Organisation Documents</h2>
            <p className="text-[14px] text-gray-500">Upload the required tax registration certificate as a PDF.</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <label className="mb-3 block text-[14px] font-bold text-gray-700">
            Tax Registration Certificate <span className="text-red-500">*</span>
          </label>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,application/pdf"
          />

          {!uploadedFile ? (
            <button
              type="button"
              onClick={handleBoxClick}
              className="flex h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-8 text-center transition-colors duration-300 hover:border-green-300 hover:bg-green-50/50"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:scale-110 hover:border-green-200 hover:shadow-md">
                <Upload size={20} className="text-gray-500 transition-all duration-300 hover:-translate-y-1 hover:text-green-500" />
              </div>
              <span className="mb-1 text-[14px] font-bold text-gray-900 transition-colors duration-300 hover:text-green-700">Click to upload</span>
              <span className="text-[12px] text-gray-500">PDF only, max 10 MB recommended</span>
            </button>
          ) : (
            <div className="rounded-xl border border-[#DCFCE7] bg-[#F0FDF4] p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#DCFCE7]">
                    <FileText size={24} className="text-[#16A34A]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[15px] font-bold leading-tight text-gray-900">{uploadedFile.name}</span>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
                      <span className="text-[14px] font-medium text-[#16A34A]">
                        {uploadedFileUrl ? 'Uploaded to backend' : 'Ready to upload'}
                      </span>
                    </div>
                    {uploadedFileUrl ? (
                      <span className="mt-1 break-all text-[12px] text-gray-500">File URL: {uploadedFileUrl}</span>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsViewModalOpen(true)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-500 transition-colors hover:bg-blue-100"
                    aria-label="Preview uploaded document"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500 transition-colors hover:bg-red-100"
                    aria-label="Remove selected document"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-[13px] text-gray-600">
                  You can preview the selected file before uploading it to the backend.
                </p>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#16A34A] px-4 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-[#15803d] disabled:cursor-not-allowed disabled:opacity-80"
                >
                  {isUploading ? <Loader2 size={18} className="animate-spin" /> : null}
                  <span>{isUploading ? 'Uploading...' : 'Upload PDF'}</span>
                </button>
              </div>
            </div>
          )}

          {localError || mutationError ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
              {localError ?? mutationError}
            </div>
          ) : null}
        </div>
      </div>

      <ViewDocumentModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        file={uploadedFile}
      />

      <DeleteDocumentModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleRemoveFile}
        fileName={uploadedFile?.name || null}
      />
    </>
  );
}
