import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { nextStep } from '@/features/new-loan/store/newLoanFormSlice';
import { ArrowRight, Check, X, FileText, Clock, Eye, Upload, Info, Send, Smartphone, Image, Download, Folder } from 'lucide-react';
import type { AppDispatch } from '@/store';

function formatFileSize(bytes: number) {
  if (!bytes) return '0 KB';
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / 1024).toFixed(1) + ' KB';
}

function formatUploadTime(date: Date) {
  if (!date) return '';
  return date.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function ViewFileModal({ entry, label, onClose }: { entry: any, label: string, onClose: () => void }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!entry?.file) return;
    const objectUrl = URL.createObjectURL(entry.file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [entry]);

  if (!entry) return null;
  const isImage = entry.file.type.startsWith('image/');
  const isPdf = entry.file.type === 'application/pdf';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800">{label}</p>
            <p className="max-w-sm truncate text-xs text-gray-500">{entry.file.name} · {formatFileSize(entry.file.size)}</p>
          </div>
          <div className="flex items-center gap-3">
            {url && (
              <a href={url} download={entry.file.name} className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <Download size={12} /> Download
              </a>
            )}
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-100 transition-colors">
              <X size={15} className="text-gray-600" />
            </button>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center overflow-auto bg-gray-50 p-6 min-h-[200px]">
          {!url ? (
            <div className="flex flex-col items-center gap-2">
              <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#4a7c59] border-t-transparent" />
            </div>
          ) : isImage ? (
            <img src={url} alt={entry.file.name} className="max-h-[65vh] max-w-full rounded-xl object-contain shadow" />
          ) : isPdf ? (
            <iframe src={url} title={entry.file.name} className="h-[65vh] w-full rounded-xl border border-gray-200" />
          ) : (
            <div className="flex flex-col items-center gap-4 py-10">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100"><FileText size={32} className="text-gray-400" /></div>
              <p className="text-sm font-medium text-gray-700">{entry.file.name}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DocUploadCard({ doc, entry, onUpload, onRemove, uploadProgress, showCamera = true }: { doc: any, entry: any, onUpload: (file: File) => void, onRemove: () => void, uploadProgress: number, showCamera?: boolean }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [viewing, setViewing] = useState(false);
  const isUploaded = !!entry;
  const isUploading = uploadProgress != null && uploadProgress < 100;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) { onUpload(e.target.files[0]); e.target.value = ''; }
  }

  return (
    <>
      {viewing && <ViewFileModal entry={entry} label={doc.label} onClose={() => setViewing(false)} />}
      <div className={`relative flex flex-col rounded-xl border p-4 transition-all ${isUploaded ? 'border-[#4a7c59]/30 bg-white shadow-sm' : 'border-dashed border-gray-300 bg-gray-50'}`}>
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-gray-800">{doc.label} {doc.required && <span className="text-red-500">*</span>}</p>
            <p className="text-xs text-gray-500">{doc.sub}</p>
          </div>
          {isUploading ? (
            <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              <span className="inline-block h-3 w-3 animate-spin rounded-full border border-blue-500 border-t-transparent" /> Uploading
            </span>
          ) : isUploaded ? (
            <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              <Check size={10} strokeWidth={3} /> Uploaded
            </span>
          ) : null}
        </div>
        {isUploading && (
          <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div className="h-full bg-[#16A34A] transition-all" style={{ width: `${uploadProgress}%` }} />
          </div>
        )}
        {isUploaded && !isUploading && entry && (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <Image size={13} className="shrink-0 text-gray-400" />
              <span className="flex-1 truncate text-xs font-medium text-gray-700">{entry.file.name}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setViewing(true)} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#4a7c59]/40 bg-[#4a7c59]/5 px-3 py-2 text-xs font-semibold text-[#4a7c59] hover:bg-[#4a7c59]/10 transition-colors"><Eye size={12} /> View</button>
              <button onClick={() => onRemove()} className="flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-2.5 py-2 text-xs text-red-500 hover:bg-red-100 transition-colors"><X size={13} /></button>
            </div>
          </div>
        )}
        {!isUploaded && !isUploading && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-4">
            <button onClick={() => fileRef.current?.click()} className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm transition-all">Browse Files</button>
          </div>
        )}
        <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileChange} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
      </div>
    </>
  );
}

const INLINE_DOCS = [
  { id: 'identityDoc', label: 'Identity Document', sub: 'National ID, Passport, or Kebele ID', required: true, showCamera: false },
  { id: 'landOwnerProof', label: 'Land Ownership Proof', sub: 'Title deed or Kebele certificate', required: true, showCamera: true },
];

export function Step1ConsentDocs() {
  const dispatch = useDispatch<AppDispatch>();
  const [farmerIdSearch, setFarmerIdSearch] = useState('');
  const [isFarmerFound, setIsFarmerFound] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpStatus, setOtpStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [uploads, setUploads] = useState<Record<string, any>>({});
  const [progress, setProgress] = useState<Record<string, number>>({});
  const consentInputRef = useRef<HTMLInputElement>(null);

  function handleUpload(docId: string, file: File) {
    setProgress(p => ({ ...p, [docId]: 0 }));
    setUploads((prev: any) => ({ ...prev, [docId]: { file, uploadedAt: new Date() } }));
    let v = 0;
    const iv = setInterval(() => {
      v += Math.random() * 30 + 10;
      if (v >= 100) { clearInterval(iv); setProgress(p => { const n = { ...p }; delete n[docId]; return n; }); }
      else setProgress(p => ({ ...p, [docId]: Math.min(v, 99) }));
    }, 300);
  }

  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpInputRefs.current[index + 1]?.focus();
  }

  function handleVerifyOtp() {
    if (otp.join('') === '123456') {
      setOtpStatus('success');
      setTimeout(() => {
        dispatch(nextStep());
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 1000);
    } else {
      setOtpStatus('error');
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploads['identityDoc'] || !uploads['landOwnerProof']) {
      alert("Please upload all required documents first.");
      return;
    }
    if (otpStatus !== 'success') {
      alert("Please verify the farmer's Fayda OTP first.");
      return;
    }
    dispatch(nextStep());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-5 shadow-sm sm:px-6">
        <h2 className="mb-5 border-b border-gray-200 pb-4 text-base font-semibold text-gray-800">Consent Form & OTP</h2>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Farmer ID / Fayda ID</label>
              <div className="flex gap-3">
                <input type="text" placeholder="Search ID" value={farmerIdSearch} onChange={e => setFarmerIdSearch(e.target.value)} disabled={isFarmerFound} className="w-full rounded-lg border px-3 py-2.5 text-sm" />
                <button type="button" onClick={() => setIsFarmerFound(true)} className="rounded-lg bg-[#16A34A] px-4 py-2.5 text-sm text-white">Search</button>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-[#f4f8ff] p-4">
              <Info className="mt-0.5 shrink-0 text-blue-500" size={18} />
              <div>
                <p className="text-sm font-semibold text-[#2563eb]">Consent Authorization</p>
                <p className="mt-1 text-xs text-blue-700/80 leading-relaxed">By requesting OTP, you confirm the farmer is present and has verbally agreed to share their registry data with AgriBank.</p>
              </div>
            </div>

            <button type="button" onClick={() => setShowOtpVerification(true)} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#16A34A] py-3 text-sm text-white shadow-sm hover:bg-[#15803d]">
              <Send size={16} /> Send OTP Request
            </button>
          </div>

          {showOtpVerification && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-[#f9fafb] p-8 h-full">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100">
                <Smartphone className="text-[#16A34A] animate-bounce" size={24} />
              </div>
              <h3 className="mb-3 text-lg font-bold text-gray-800">Fayda OTP Verification</h3>
              <p className="text-center text-sm text-gray-500">OTP sent to 091****645</p>

              <div className="mt-6 flex justify-center gap-2">
                {otp.map((digit, i) => (
                  <input key={i} type="text" maxLength={1} value={digit} onChange={e => handleOtpChange(i, e.target.value)} ref={el => { otpInputRefs.current[i] = el; }} className="h-12 w-10 sm:h-14 sm:w-12 rounded-lg border text-center text-xl font-semibold text-gray-800 shadow-sm" />
                ))}
              </div>

              {otpStatus === 'error' && <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-2 rounded-lg">Incorrect OTP. Please try again.</p>}
              {otpStatus === 'success' && <p className="mt-4 text-sm text-green-600 bg-green-50 border border-green-100 px-4 py-2 rounded-lg">OTP Verified!</p>}

              <button type="button" onClick={handleVerifyOtp} className="mt-6 w-full rounded-lg bg-[#16A34A] py-3 text-sm font-medium text-white shadow-sm hover:bg-[#15803d]">Verify Code</button>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-5 shadow-sm sm:px-6">
        <h2 className="mb-5 flex items-center gap-1 text-base font-semibold text-gray-800 pb-4 border-b border-gray-200"><span className="text-red-500">*</span> Required Documents</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {INLINE_DOCS.map(doc => (
            <DocUploadCard key={doc.id} doc={doc} entry={uploads[doc.id]} uploadProgress={progress[doc.id]} onUpload={f => handleUpload(doc.id, f)} onRemove={() => setUploads(p => { const n = { ...p }; delete n[doc.id]; return n; })} showCamera={doc.showCamera} />
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-6">
        <button type="submit" className="flex items-center gap-2 rounded-xl bg-[#16A34A] px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#15803d] transition-all">
          Verify & Next <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
}
