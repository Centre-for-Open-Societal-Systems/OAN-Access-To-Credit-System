'use client';

import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { X, ChevronDown, FolderOpen, Loader2, AlertTriangle } from 'lucide-react';
import { uploadDocumentAPI } from '@/features/new-loan/store/newLoanFormSlice';
import type { AppDispatch } from '@/store';
import { logger } from '@/lib/logger';

interface AddSupportingDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  onSuccess: () => void;
}

export function AddSupportingDocModal({
  isOpen,
  onClose,
  applicationId,
  onSuccess,
}: AddSupportingDocModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [isUploading, setIsUploading] = useState(false);
  const [newDocType, setNewDocType] = useState('');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [newDocDesc, setNewDocDesc] = useState('');
  const [newDocFile, setNewDocFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const addDocFileRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAddSupportingDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    if (isUploading) return;
    if (!newDocType || !newDocDesc || !newDocFile || !applicationId) return;

    setIsUploading(true);
    try {
      await dispatch(
        uploadDocumentAPI({
          application_id: applicationId,
          document_type: newDocType,
          file: newDocFile,
        })
      ).unwrap();

      onSuccess();
      onClose();
      // Reset form states
      setNewDocType('');
      setNewDocDesc('');
      setNewDocFile(null);
    } catch (err) {
      logger.error('Failed to upload supporting document', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
          ? err
          : 'Failed to upload document.';
      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[95vh]">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 sm:px-6 py-4 shrink-0">
          <h3 className="text-lg font-bold text-gray-900">Supporting Documents</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-4 sm:px-6 py-6 overflow-y-auto">
          <form onSubmit={handleAddSupportingDoc} className="space-y-5">
            {uploadError && (
              <div className="mb-2 rounded-md bg-red-50 p-3 border border-red-200 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Upload Failed</h3>
                  <p className="mt-1 text-sm text-red-700">{uploadError}</p>
                </div>
              </div>
            )}
            <div className="relative">
              <label className="mb-2 block text-[15px] font-medium text-gray-900">
                Type <span className="text-red-500">*</span>
              </label>
              <div
                onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                className="flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <span>{newDocType || 'Select Document'}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isTypeDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>
              {isTypeDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white py-1 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                  {['ID Proof', 'Land Record'].map((type) => (
                    <div
                      key={type}
                      onClick={() => {
                        setNewDocType(type);
                        setIsTypeDropdownOpen(false);
                      }}
                      className="cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700"
                    >
                      {type}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="mb-2 block text-[15px] font-medium text-gray-900">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={newDocDesc}
                onChange={(e) => setNewDocDesc(e.target.value)}
                placeholder="Enter Description"
                rows={4}
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 resize-none"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-[15px] font-medium text-gray-900">
                Document <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                ref={addDocFileRef}
                onChange={(e) =>
                  e.target.files && setNewDocFile(e.target.files?.[0] ?? null)
                }
                className="hidden"
                required
              />
              <div
                onClick={() => addDocFileRef.current?.click()}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2.5 transition-colors hover:bg-gray-50"
              >
                <FolderOpen className="h-5 w-5 text-gray-400 fill-gray-400" />
                <span className="text-[15px] text-gray-400">
                  {newDocFile ? newDocFile.name : 'Browse Files'}
                </span>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                disabled={isUploading}
                onClick={onClose}
                className="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-[15px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="flex items-center justify-center gap-2 rounded-md bg-[#16a34a] px-6 py-2.5 text-[15px] font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isUploading ? 'Uploading...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
