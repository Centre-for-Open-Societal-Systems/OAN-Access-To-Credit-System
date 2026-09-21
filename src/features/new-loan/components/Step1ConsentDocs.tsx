'use client';

import { Portal } from '@/components/Portal';
import { UndoToast } from '@/components/ui/UndoToast';
// eslint-disable-next-line boundaries/dependencies -- TODO (2026-08-23): needs to be fixed later; hiding for now as this existed before our changes
import { loanService, type SupportingDocument } from '@/features/loans/api/loan.service';
// eslint-disable-next-line boundaries/dependencies -- TODO (2026-08-23): needs to be fixed later; hiding for now as this existed before our changes
import { newLeadService, type FarmerDetails } from '@/features/new-lead/api/newLead.service';
import { nextStepAPI, selectLoanFormState } from '@/features/new-loan/store/newLoanFormSlice';
import { logger } from '@/lib/logger';
import type { AppDispatch } from '@/store';
import { AlertTriangle, ArrowRight, Check, CheckCircle2, Eye, EyeOff, FileText, FolderOpen, Info, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AddSupportingDocModal } from './AddSupportingDocModal';

export function Step1ConsentDocs({ leadId }: { leadId?: string | undefined }) {
  const dispatch = useDispatch<AppDispatch>();
  const { applicationId } = useSelector(selectLoanFormState);

  const [faydaId, setFaydaId] = useState('');
  const [showFaydaId, setShowFaydaId] = useState(true);
  const [showConsentPopup, setShowConsentPopup] = useState(false);
  const [showConsentDocumentPopup, setShowConsentDocumentPopup] = useState(false);

  type SupportingDoc = { id: string | number; type: string; name: string; description: string; file?: File; fileUrl?: string };

  const [showSupportingDocPopup, setShowSupportingDocPopup] = useState(false);
  const [selectedSupportingDoc, setSelectedSupportingDoc] = useState<SupportingDoc | null>(null);
  const [supportPreviewUrl, setSupportPreviewUrl] = useState<string | null>(null);

  const [farmerDetails, setFarmerDetails] = useState<FarmerDetails | null>(null);

  useEffect(() => {
    if (leadId) {
      newLeadService.getLeadDetails(leadId)
        .then(res => {
          setFarmerDetails(res);
          if (res.faydaId) setFaydaId(res.faydaId);
        })
        .catch(err => logger.error('Failed to get lead details', err));
    }
  }, [leadId]);

  const consentFields = farmerDetails?.requested_data_fields?.length
    ? farmerDetails.requested_data_fields.map(f => f.field_name)
    : [];

  const consentDate = farmerDetails?.validity_from
    ? new Date(farmerDetails.validity_from).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  useEffect(() => {
    if (!selectedSupportingDoc) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSupportPreviewUrl(null);
      return;
    }

    if (selectedSupportingDoc.file) {
      // URL.createObjectURL/revokeObjectURL is an imperative browser API with
      // required cleanup — can't be computed during render, has to live in an effect.
      const url = URL.createObjectURL(selectedSupportingDoc.file);
      setSupportPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (selectedSupportingDoc.id) {
      const targetAppId = applicationId || 'current';
      const url = `/api/proxy/v1/loan-applications/${encodeURIComponent(targetAppId)}/documents/${encodeURIComponent(selectedSupportingDoc.id)}/content?view=1`;
      setSupportPreviewUrl(url);
    } else {
      setSupportPreviewUrl(null);
    }
  }, [selectedSupportingDoc, applicationId]);

  const [showAddDocPopup, setShowAddDocPopup] = useState(false);


  const [supportingDocs, setSupportingDocs] = useState<SupportingDoc[]>([]);

  const loadDocs = (appId: string) => {
    loanService.listSupportingDocuments(appId)
      .then(res => {
        if (Array.isArray(res?.data)) {
          const fetchedDocs = res.data.map((f: SupportingDocument) => ({
            id: f.name,
            type: 'Uploaded Document',
            name: f.file_name,
            description: `Uploaded on ${f.creation}`,
          }));
          setSupportingDocs(fetchedDocs);
        }
      })
      .catch(err => logger.error('Failed to fetch documents', err));
  };

  useEffect(() => {
    if (applicationId) {
      loadDocs(applicationId);
    }
  }, [applicationId]);

  // Document removal is confirm-gated, then optimistic with an undo window:
  // `docPendingConfirm` holds the id awaiting the confirm dialog; once confirmed
  // the row is removed from the list immediately and `docPendingRemoval` drives
  // the undo toast. The real delete only fires when the undo window elapses.
  const [docPendingConfirm, setDocPendingConfirm] = useState<SupportingDoc | null>(null);
  const [docPendingRemoval, setDocPendingRemoval] = useState<SupportingDoc | null>(null);

  const [consentFile] = useState<File | null>(null);
  const [previewUrl] = useState<string | null>(null);

  // Step 1: user clicks remove → ask for confirmation.
  const requestRemoveSupportingDoc = (doc: SupportingDoc) => setDocPendingConfirm(doc);

  // Step 2: confirmed → optimistically drop the row and open the undo window.
  const confirmRemoveSupportingDoc = () => {
    if (!docPendingConfirm) return;
    const doc = docPendingConfirm;
    setSupportingDocs(docs => docs.filter(d => d.id !== doc.id));
    setDocPendingConfirm(null);
    setDocPendingRemoval(doc);
  };

  // Step 3a: undo window elapsed → actually delete on the server. A client-only
  // doc (numeric id, never persisted) needs no API call.
  const commitRemoveSupportingDoc = async () => {
    const doc = docPendingRemoval;
    setDocPendingRemoval(null);
    if (!doc) return;
    if (typeof doc.id !== 'string' || !applicationId) return;
    try {
      const res = await loanService.deleteSupportingDocument(applicationId, doc.id);
      // The backend may return status === 'success' or message === 'File deleted successfully'.
      const isSuccess = res?.status === 'success' || res?.message === 'File deleted successfully';
      if (!isSuccess) {
        logger.error('Failed to delete document on server', res);
        setSupportingDocs(docs => [...docs, doc]); // restore on failure
      }
    } catch (err) {
      logger.error('Failed to delete supporting document:', err);
      setSupportingDocs(docs => [...docs, doc]); // restore on failure
    }
  };

  // Step 3b: user clicked Undo → restore the row, no server call.
  const undoRemoveSupportingDoc = () => {
    if (docPendingRemoval) {
      setSupportingDocs(docs => [...docs, docPendingRemoval]);
    }
    setDocPendingRemoval(null);
  };


  const handleViewDoc = (doc: SupportingDoc) => {
    const fileType = doc.file?.type || '';
    const fileName = doc.name.toLowerCase();
    const isImage = fileType.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(fileName);
    const isPdf = fileType === 'application/pdf' || fileName.endsWith('.pdf');

    if (isImage || isPdf) {
      setSelectedSupportingDoc(doc);
      setShowSupportingDocPopup(true);
    } else {
      let url = '';
      if (doc.file) {
        url = URL.createObjectURL(doc.file);
      } else if (doc.id) {
        const targetAppId = applicationId || 'current';
        url = `/api/proxy/v1/loan-applications/${encodeURIComponent(targetAppId)}/documents/${encodeURIComponent(doc.id)}/content?view=0`;
      }

      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        if (doc.file) {
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
      }
    }
  };


  const handleSubmit = (e: React.FormEvent) => {

    e.preventDefault();
    dispatch(nextStepAPI());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <AddSupportingDocModal
        isOpen={showAddDocPopup}
        onClose={() => setShowAddDocPopup(false)}
        applicationId={applicationId || ''}
        onSuccess={() => applicationId && loadDocs(applicationId)}
      />

      {showSupportingDocPopup && selectedSupportingDoc && (
        <Portal>
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-4xl rounded-xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-white shrink-0">
                <h3 className="text-lg font-medium text-gray-900">{selectedSupportingDoc.name}</h3>
                <div className="flex items-center gap-2">
                  {supportPreviewUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = supportPreviewUrl;
                        link.download = selectedSupportingDoc.name;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors"
                    >
                      Download
                    </button>
                  )}
                  <button type="button" onClick={() => setShowSupportingDocPopup(false)} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-gray-100 p-6 overflow-auto flex items-center justify-center min-h-[500px]">
                {(() => {
                  const fileType = selectedSupportingDoc.file?.type || '';
                  const fileName = selectedSupportingDoc.name.toLowerCase();
                  const isImage = fileType.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(fileName);
                  const isPdf = fileType === 'application/pdf' || fileName.endsWith('.pdf');

                  if (supportPreviewUrl && isImage) {
                    return (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={supportPreviewUrl}
                        alt="Document Preview"
                        className="max-w-full rounded shadow-sm border border-gray-200 object-contain max-h-[70vh]"
                      />
                    );
                  } else if (supportPreviewUrl && isPdf) {
                    return <iframe src={supportPreviewUrl} className="w-full h-[70vh] border border-gray-200 rounded shadow-sm bg-white" title="Document Preview" />;
                  } else {
                    return (
                      <div className="bg-white p-8 shadow-sm text-center w-full max-w-2xl min-h-[600px] border border-gray-200 flex flex-col items-center justify-center rounded-lg">
                        <FileText className="h-16 w-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg font-medium">Document Preview</p>
                        <p className="text-gray-400 text-sm mt-2">({selectedSupportingDoc.name})</p>
                        <p className="text-gray-400 text-xs mt-1 mb-4">Preview not available for this file type.</p>
                        {supportPreviewUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = supportPreviewUrl;
                              link.download = selectedSupportingDoc.name;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md bg-green-600 hover:bg-green-700 text-white shadow-sm transition-colors"
                          >
                            Download Document
                          </button>
                        )}
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          </div>
        </Portal>
      )}

      {showConsentDocumentPopup && consentFile && (
        <Portal>
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-4xl rounded-xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-white shrink-0">
              <h3 className="text-lg font-medium text-gray-900">{consentFile.name}</h3>
              <button type="button" onClick={() => setShowConsentDocumentPopup(false)} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 bg-gray-100 p-6 overflow-auto flex items-center justify-center min-h-[500px]">
              {previewUrl && consentFile.type.startsWith('image/') ? (
                <>
                  {/* 
                    Using native <img> instead of next/image here because the source is a local 
                    object URL (blob:) created from file upload. Next.js image optimization is 
                    impossible/irrelevant for temporary client-side blobs, and native <img> 
                    prevents CLS risk without forcing arbitrary fixed width/height ratios.
                  */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Document Preview"
                    className="max-w-full rounded shadow-sm border border-gray-200 object-contain max-h-[70vh]"
                  />
                </>
              ) : previewUrl && consentFile.type === 'application/pdf' ? (
                <iframe src={previewUrl} className="w-full h-[70vh] border border-gray-200 rounded shadow-sm bg-white" title="Document Preview" />
              ) : (
                <div className="bg-white p-8 shadow-sm text-center w-full max-w-2xl min-h-[600px] border border-gray-200 flex flex-col items-center justify-center rounded-lg">
                  <FileText className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg font-medium">Document Preview</p>
                  <p className="text-gray-400 text-sm mt-2">({consentFile.name})</p>
                  <p className="text-gray-400 text-xs mt-1">Preview not available for this file type.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        </Portal>
      )}

      {showConsentPopup && (
        <Portal>
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">Signed Consent Form</h3>
              <button type="button" onClick={() => setShowConsentPopup(false)} className="text-gray-900 hover:text-gray-500 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-6">
              <p className="mb-4 text-[15px] font-medium text-gray-900">Data shared as part of Agri Loan consent:</p>
              {consentFields.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {consentFields.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 rounded-lg border border-[#22c55e] bg-[#f0fdf4] px-4 py-4 shadow-sm">
                      <CheckCircle2 className="h-5 w-5 text-white fill-[#22c55e]" />
                      <span className="text-[15px] font-medium text-[#334155]">{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 text-center shadow-sm">
                  <p className="text-sm font-medium text-gray-500">No specific consent fields found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        </Portal>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 relative z-0">
        {/* Consent Management Section */}
        <div className="bg-white p-6 border border-[#F1F3F4] rounded-xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <h2 className="mb-6 text-lg font-bold text-gray-900 pb-4 border-b border-gray-200">Consent Management</h2>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Left Column */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Farmer ID / Fayda ID</label>
                <div className="relative">
                  <input
                    type={showFaydaId ? "text" : "password"}
                    value={faydaId}
                    onChange={(e) => setFaydaId(e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 pr-10 text-sm text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button type="button" onClick={() => setShowFaydaId(!showFaydaId)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showFaydaId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 text-sm w-full">
                <div className="flex items-center gap-2 font-bold text-gray-600">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                  <button type="button" onClick={() => setShowConsentPopup(true)} className="font-bold text-green-700 text-left hover:underline">
                    View Consent Details
                  </button>
                </div>
                {consentDate && <span className="font-normal text-gray-500 sm:text-right pl-7 sm:pl-0">provided on {consentDate}</span>}
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-[#f4f8ff] p-4">
                <Info className="mt-0.5 shrink-0 text-blue-500" size={18} />
                <div>
                  <p className="text-sm font-semibold text-[#2563eb]">Consent Authorization</p>
                  <p className="mt-1 text-xs text-blue-700/80 leading-relaxed">By requesting OTP, you confirm the farmer is present and has verbally agreed to share their registry data with AgriBank.</p>
                </div>
              </div>
            </div>


          </div>
        </div>

        {/* Supporting Documents Section */}
        <div className="bg-white p-6 border border-[#F1F3F4] rounded-xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <h2 className="mb-6 text-lg font-bold text-gray-900 pb-4 border-b border-gray-200">
            Supporting Documents
          </h2>

          {/* Drag & Drop Area */}
          <div className="mb-6 mx-auto max-w-lg flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50/50 py-8 px-4 text-center transition-colors hover:bg-gray-50 overflow-hidden">
            <div className="mb-3">
              <FolderOpen className="h-8 w-8 text-gray-500 fill-gray-500" />
            </div>
            <p className="mb-1 text-sm font-medium text-gray-900">Drag and drop files here</p>
            <p className="mb-1 text-sm text-gray-500">Or</p>
            <p className="mb-4 text-sm font-medium text-gray-900 break-words w-full">Click Browse files to select a file</p>
            <button type="button" onClick={() => setShowAddDocPopup(true)} className="flex items-center justify-center gap-1.5 rounded text-sm font-semibold text-green-600 hover:text-green-700 bg-green-100 hover:bg-green-200 px-4 py-1.5 whitespace-nowrap">
              <span className="text-lg">+</span> Browse Files
            </button>
          </div>

          {/* Documents Table */}
          {supportingDocs.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-gray-100 bg-gray-50/50">
              <table className="min-w-[600px] w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Description</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {supportingDocs.map((doc) => (
                    <tr key={doc.id}>
                      <td className="px-4 py-4 w-1/3">
                        <div className="flex items-center gap-3">
                          <div className="text-gray-400 rounded border border-gray-200 p-1 bg-gray-50"><FileText className="h-5 w-5" /></div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{doc.type}</p>
                            <p className="text-xs text-gray-500">{doc.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 w-1/3 break-words max-w-[200px]">{doc.description}</td>
                      <td className="px-4 py-4 text-right w-1/3">
                        <div className="flex items-center justify-end gap-3">
                          <button type="button" onClick={() => handleViewDoc(doc)} className="flex items-center gap-1.5 rounded-md border border-green-300 px-3 py-1.5 text-xs font-semibold text-green-600 bg-green-50/50 hover:bg-green-100 transition-colors">
                            <Eye className="h-4 w-4" /> View
                          </button>
                          <button type="button" onClick={() => requestRemoveSupportingDoc(doc)} className="flex items-center justify-center rounded-md border border-red-300 p-1.5 text-red-500 bg-red-50/50 hover:bg-red-100 transition-colors shrink-0">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-white px-4 sm:px-6 py-6 font-semibold gap-6 sm:gap-0 mt-8 border border-[#F1F3F4] rounded-xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 font-normal">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-[15px] font-normal text-[#16335A]">
              <Check className="h-5 w-5 text-[#16335A]" /> Your progress is saved automatically
            </div>
          </div>
          <button type="submit" className="flex flex-1 sm:flex-none justify-center items-center gap-2 rounded-md bg-[#16A34A] px-6 py-2.5 text-[15px] font-semibold text-white shadow-sm hover:bg-[#15803d] transition-colors">
            Confirm & Next <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>

      {/* Confirm removal dialog */}
      {docPendingConfirm && (
        <Portal>
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden text-center p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
              <AlertTriangle className="h-8 w-8 text-red-600" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Remove this document?</h3>
            <p className="text-[15px] text-gray-600 mb-8">
              &ldquo;{docPendingConfirm.name}&rdquo; will be removed. You&rsquo;ll have a few seconds to undo.
            </p>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-center gap-3">
              <button
                type="button"
                onClick={() => setDocPendingConfirm(null)}
                className="rounded-md border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRemoveSupportingDoc}
                className="rounded-md bg-red-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
        </Portal>
      )}

      {/* Undo window for an optimistically removed document */}
      {docPendingRemoval && (
        <UndoToast
          message="Document removed"
          onUndo={undoRemoveSupportingDoc}
          onCommit={commitRemoveSupportingDoc}
        />
      )}
    </>
  );
}
