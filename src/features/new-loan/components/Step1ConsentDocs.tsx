import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { nextStepAPI, uploadDocumentAPI, selectLoanFormState } from '@/features/new-loan/store/newLoanFormSlice';
import { loanService } from '@/features/loans/api/loan.service';
import { ArrowRight, CheckCircle2, FileText, Loader2, FolderOpen, Eye, EyeOff, X, Check, ChevronDown, Info } from 'lucide-react';
import type { AppDispatch } from '@/store';

export function Step1ConsentDocs() {
  const dispatch = useDispatch<AppDispatch>();
  const { applicationId } = useSelector(selectLoanFormState);
  const [faydaId, setFaydaId] = useState('**********');
  const [showFaydaId, setShowFaydaId] = useState(false);
  const [showConsentPopup, setShowConsentPopup] = useState(false);
  const [showConsentDocumentPopup, setShowConsentDocumentPopup] = useState(false);

  type SupportingDoc = { id: string | number; type: string; name: string; description: string; file?: File; fileUrl?: string };

  const [showSupportingDocPopup, setShowSupportingDocPopup] = useState(false);
  const [selectedSupportingDoc, setSelectedSupportingDoc] = useState<SupportingDoc | null>(null);
  const [supportPreviewUrl, setSupportPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedSupportingDoc) {
      setSupportPreviewUrl(null);
      return;
    }

    if (selectedSupportingDoc.file) {
      const url = URL.createObjectURL(selectedSupportingDoc.file);
      setSupportPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (selectedSupportingDoc.id) {
      const url = `/api/proxy/api/method/oan_a2c.api.v1.loan_applications.download_supporting_document?file_id=${selectedSupportingDoc.id}&view=1`;
      setSupportPreviewUrl(url);
    } else {
      setSupportPreviewUrl(null);
    }
  }, [selectedSupportingDoc]);

  const [showAddDocPopup, setShowAddDocPopup] = useState(false);
  const [newDocType, setNewDocType] = useState('');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [newDocDesc, setNewDocDesc] = useState('');
  const [newDocFile, setNewDocFile] = useState<File | null>(null);
  const addDocFileRef = useRef<HTMLInputElement>(null);


  const [supportingDocs, setSupportingDocs] = useState<SupportingDoc[]>([]);

  const loadDocs = (appId: string) => {
    loanService.listSupportingDocuments(appId)
      .then(res => {
        if (Array.isArray(res?.data)) {
          const fetchedDocs = res.data.map((f: any) => ({
            id: f.name,
            type: 'Uploaded Document',
            name: f.file_name,
            description: `Uploaded on ${f.creation}`,
          }));
          setSupportingDocs(fetchedDocs);
        }
      })
      .catch(err => console.error('Failed to fetch documents', err));
  };

  useEffect(() => {
    if (applicationId) {
      loadDocs(applicationId);
    }
  }, [applicationId]);

  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const handleSaveDraft = () => {
    setIsSavingDraft(true);
    setTimeout(() => {
      setIsSavingDraft(false);
      const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSaved(`Auto-saved at ${timeString}`);
    }, 1000);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      handleSaveDraft();
    }, 60000); // Auto save every 60 seconds
    return () => clearInterval(timer);
  }, []);

  const consentFileRef = useRef<HTMLInputElement>(null);
  const [consentFile, setConsentFile] = useState<File | null>(null);
  const [isConsentUploading, setIsConsentUploading] = useState(false);
  const [consentProgress, setConsentProgress] = useState(0);
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

  const handleConsentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && applicationId) {
      const file = e.target.files[0];
      setConsentFile(file);
      setIsConsentUploading(true);
      setConsentProgress(10); // initial fake progress while uploading

      try {
        await dispatch(uploadDocumentAPI({
          application_id: applicationId,
          document_type: 'Consent Form',
          file: file
        })).unwrap();
        setConsentProgress(100);
      } catch (err) {
        console.error('Failed to upload consent form', err);
        setConsentProgress(0);
        setConsentFile(null);
      } finally {
        setIsConsentUploading(false);
      }
    }
  };

  const handleRemoveConsentFile = () => {
    setConsentFile(null);
    setConsentProgress(0);
    if (consentFileRef.current) {
      consentFileRef.current.value = '';
    }
  };

  const handleRemoveSupportingDoc = async (id: string | number) => {
    if (!applicationId) return;
    try {
      if (typeof id === 'string') {
        const res = await loanService.deleteSupportingDocument(applicationId, id);
        // Frappe might return status === 'success' or message === 'File deleted successfully' or message.status === 'success'
        const isSuccess = res?.status === 'success' || res?.message === 'File deleted successfully';
        if (isSuccess) {
          setSupportingDocs(docs => docs.filter(doc => doc.id !== id));
        } else {
          console.error('Failed to delete document on server', res);
        }
      } else {
        setSupportingDocs(docs => docs.filter(doc => doc.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete supporting document:', err);
    }
  };

  const handleAddSupportingDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocType || !newDocDesc || !newDocFile || !applicationId) return;

    try {
      await dispatch(uploadDocumentAPI({
        application_id: applicationId,
        document_type: newDocType,
        file: newDocFile
      })).unwrap();

      loadDocs(applicationId);

      setShowAddDocPopup(false);
      setNewDocType('');
      setNewDocDesc('');
      setNewDocFile(null);
    } catch (err) {
      console.error('Failed to upload supporting document', err);
    }
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
        url = `/api/proxy/api/method/oan_a2c.api.v1.loan_applications.download_supporting_document?file_id=${doc.id}&view=0`;
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
      {showAddDocPopup && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[95vh]">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 sm:px-6 py-4 shrink-0">
              <h3 className="text-lg font-bold text-gray-900">Supporting Documents</h3>
              <button type="button" onClick={() => setShowAddDocPopup(false)} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-4 sm:px-6 py-6 overflow-y-auto">
              <form onSubmit={handleAddSupportingDoc} className="space-y-5">
                <div className="relative">
                  <label className="mb-2 block text-[15px] font-medium text-gray-900">Type <span className="text-red-500">*</span></label>
                  <div
                    onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                    className="flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  >
                    <span>{newDocType || 'Select Document'}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {isTypeDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white py-1 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                      {['ID Proof', 'Land Record'].map((type) => (
                        <div
                          key={type}
                          onClick={() => { setNewDocType(type); setIsTypeDropdownOpen(false); }}
                          className="cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700"
                        >
                          {type}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-[15px] font-medium text-gray-900">Description <span className="text-red-500">*</span></label>
                  <textarea
                    value={newDocDesc}
                    onChange={e => setNewDocDesc(e.target.value)}
                    placeholder="Enter Description"
                    rows={4}
                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 resize-none"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[15px] font-medium text-gray-900">Document <span className="text-red-500">*</span></label>
                  <input type="file" ref={addDocFileRef} onChange={e => e.target.files && setNewDocFile(e.target.files?.[0] ?? null)} className="hidden" required />
                  <div
                    onClick={() => addDocFileRef.current?.click()}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2.5 transition-colors hover:bg-gray-50"
                  >
                    <FolderOpen className="h-5 w-5 text-gray-400 fill-gray-400" />
                    <span className="text-[15px] text-gray-400">{newDocFile ? newDocFile.name : 'Browse Files'}</span>
                  </div>
                </div>
                <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
                  <button type="button" onClick={() => setShowAddDocPopup(false)} className="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-[15px] font-medium text-gray-700 hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" className="rounded-md bg-[#16a34a] px-6 py-2.5 text-[15px] font-medium text-white hover:bg-green-700 transition-colors">
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showSupportingDocPopup && selectedSupportingDoc && (() => {
        const fileType = selectedSupportingDoc.file?.type || '';
        const fileName = selectedSupportingDoc.name.toLowerCase();
        const isImage = fileType.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(fileName);
        const isPdf = fileType === 'application/pdf' || fileName.endsWith('.pdf');

        return (
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
                {supportPreviewUrl && isImage ? (
                  <>
                    {/* 
                      Using native <img> instead of next/image here because the source is a local 
                      object URL (blob:) created from file upload. Next.js image optimization is 
                      impossible/irrelevant for temporary client-side blobs, and native <img> 
                      prevents CLS risk without forcing arbitrary fixed width/height ratios.
                    */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={supportPreviewUrl}
                      alt="Document Preview"
                      className="max-w-full rounded shadow-sm border border-gray-200 object-contain max-h-[70vh]"
                    />
                  </>
                ) : supportPreviewUrl && isPdf ? (
                  <iframe src={supportPreviewUrl} className="w-full h-[70vh] border border-gray-200 rounded shadow-sm bg-white" title="Document Preview" />
                ) : (
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
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {showConsentDocumentPopup && consentFile && (
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
      )}

      {showConsentPopup && (
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  'Basic Profile',
                  'Land Information',
                  'Crop and Livestock Information',
                  'Socio Economic Information',
                  'Agronomic Data'
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 rounded-lg border border-[#22c55e] bg-[#f0fdf4] px-4 py-4 shadow-sm">
                    <CheckCircle2 className="h-5 w-5 text-white fill-[#22c55e]" />
                    <span className="text-[15px] font-medium text-[#334155]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 relative z-0">
        {/* Consent Management Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
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
              <div className="flex items-center gap-2 text-sm text-gray-600 font-bold">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <button type="button" onClick={() => setShowConsentPopup(true)} className="font-bold text-green-700">
                  View Consent Details
                </button>
                <span className='font-normal'>provided on May 25, 2026</span>
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
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-bold text-gray-900 pb-4 border-b border-gray-200">
            Supporting Documents <span className="text-red-500">*</span>
          </h2>

          {/* Drag & Drop Area */}
          <div className="mb-6 mx-auto max-w-lg flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50/50 py-8 transition-colors hover:bg-gray-50">
            <div className="mb-3">
              <FolderOpen className="h-8 w-8 text-gray-500 fill-gray-500" />
            </div>
            <p className="mb-1 text-sm font-medium text-gray-900">Drag and drop files here</p>
            <p className="mb-1 text-sm text-gray-500">Or</p>
            <p className="mb-4 text-sm font-medium text-gray-900">Click Browse files to select a file</p>
            <button type="button" onClick={() => setShowAddDocPopup(true)} className="flex items-center gap-1.5 rounded text-sm font-semibold text-green-600 hover:text-green-700 bg-green-100 hover:bg-green-200 px-4 py-1">
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
                          <button type="button" onClick={() => handleRemoveSupportingDoc(doc.id)} className="flex items-center justify-center rounded-md border border-red-300 p-1.5 text-red-500 bg-red-50/50 hover:bg-red-100 transition-colors shrink-0">
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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between rounded-xl border border-gray-200 bg-white px-4 sm:px-6 py-6 shadow-sm font-semibold gap-6 sm:gap-0 mt-8">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 font-normal">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSavingDraft}
              className="flex flex-1 sm:flex-none justify-center items-center gap-2 rounded-md border border-[#16335A] text-[#16335A] px-8 py-2.5 text-sm font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              {isSavingDraft && <Loader2 className="h-4 w-4 animate-spin font-normal" />}
              {isSavingDraft ? 'Saving...' : 'Save Draft'}
            </button>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-[15px] font-normal text-[#16335A]">
              <Check className="h-5 w-5 text-[#16335A]" /> {lastSaved || 'Auto-saved'}
            </div>
          </div>
          <button type="submit" className="flex flex-1 sm:flex-none justify-center items-center gap-2 rounded-md bg-[#16A34A] px-6 py-2.5 text-[15px] font-semibold text-white shadow-sm hover:bg-[#15803d] transition-colors">
            Confirm & Next <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </>
  );
}
