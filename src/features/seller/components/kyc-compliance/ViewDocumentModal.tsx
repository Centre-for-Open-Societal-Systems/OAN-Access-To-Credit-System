'use client';
import { Portal } from '@/components/Portal';
import { useModalA11y } from '@/hooks/useModalA11y';
import { Download, FileText, Loader2 } from 'lucide-react';
import { useEffect, useId, useState } from 'react';

interface ViewDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  file?: File | null | undefined;
  fileUrl?: string | null | undefined;
  downloadUrl?: string | null | undefined;
  fileName?: string | null | undefined;
}

export function ViewDocumentModal({
  isOpen,
  onClose,
  file = null,
  fileUrl: externalFileUrl = null,
  downloadUrl: externalDownloadUrl = null,
  fileName: externalFileName = null,
}: ViewDocumentModalProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoadingBlob, setIsLoadingBlob] = useState(false);
  const [blobError, setBlobError] = useState(false);
  const dialogRef = useModalA11y<HTMLDivElement>(isOpen, onClose);
  const titleId = useId();

  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    if (file) {
      createdUrl = URL.createObjectURL(file);
      const url = createdUrl;
      queueMicrotask(() => {
        if (!active) return;
        setBlobUrl(url);
        setIsLoadingBlob(false);
        setBlobError(false);
      });
      return () => {
        active = false;
        URL.revokeObjectURL(url);
      };
    }

    if (externalFileUrl) {
      queueMicrotask(() => {
        if (!active) return;
        setIsLoadingBlob(true);
        setBlobError(false);
      });
      fetch(externalFileUrl, { credentials: 'same-origin' })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to load document');
          return res.blob();
        })
        .then((blob) => {
          if (!active) return;
          createdUrl = URL.createObjectURL(blob);
          setBlobUrl(createdUrl);
          setIsLoadingBlob(false);
        })
        .catch(() => {
          if (!active) return;
          setIsLoadingBlob(false);
          setBlobError(true);
        });
      return () => {
        active = false;
        if (createdUrl) URL.revokeObjectURL(createdUrl);
      };
    }

    queueMicrotask(() => {
      if (!active) return;
      setBlobUrl(null);
      setIsLoadingBlob(false);
      setBlobError(false);
    });
    return () => {
      active = false;
    };
  }, [file, externalFileUrl]);

  if (!isOpen) return null;

  const resolvedUrl = blobUrl ?? externalFileUrl;
  const resolvedDownloadUrl = blobUrl ?? (externalDownloadUrl ?? externalFileUrl);
  const resolvedName = file?.name ?? externalFileName ?? 'Document';
  const isImage = Boolean(file?.type.startsWith('image/') || /\.(png|jpe?g|webp)($|\?)/i.test(resolvedUrl ?? ''));
  const isPdf = Boolean(file?.type === 'application/pdf' || /\.pdf($|\?)/i.test(resolvedUrl ?? '') || (!isImage && Boolean(resolvedUrl)));

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="bg-white rounded-[24px] shadow-xl w-full max-w-[570px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >

        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-[#DBEAFE] rounded-full opacity-50 animate-ping"></div>
            <div className="relative w-full h-full bg-[#EFF6FF] rounded-full flex items-center justify-center shadow-sm border-[6px] border-[#DBEAFE] transform transition-transform hover:scale-110 duration-300">
              <FileText className="w-10 h-10 text-[#3B82F6] animate-pulse" />
            </div>
          </div>
          <h2 id={titleId} className="text-[22px] font-bold text-[#111827] mb-3">
            Document Preview
          </h2>
          <p className="text-[15px] text-[#6B7280] leading-relaxed">
            You are viewing the uploaded document: <br />
            <span className="font-bold text-[#374151]">&quot;{resolvedName}&quot;</span>
          </p>
        </div>

        {/* Document Viewer Area */}
        <div className="px-8 pb-6">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl h-[280px] flex flex-col items-center justify-center overflow-hidden relative">
            {isLoadingBlob ? (
              <div className="flex flex-col items-center justify-center p-4">
                <Loader2 size={32} className="animate-spin text-blue-500 mb-2" />
                <p className="text-sm text-gray-500">Loading document preview...</p>
              </div>
            ) : resolvedUrl && isImage && !blobError ? (
              // eslint-disable-next-line @next/next/no-img-element -- resolvedUrl is a blob: URL from URL.createObjectURL or proxied same-origin URL
              <img src={resolvedUrl} alt={resolvedName} className="w-full h-full object-contain p-2" />
            ) : resolvedUrl && isPdf && !blobError ? (
              <iframe src={`${resolvedUrl}#toolbar=0`} className="w-full h-full" title={resolvedName} />
            ) : (
              <>
                <FileText size={48} className="text-gray-300 mb-4" strokeWidth={1} />
                <p className="text-sm text-gray-500 font-medium">Document preview unavailable</p>
                <p className="text-xs text-gray-400 mt-1">Please download to view the full file.</p>
              </>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="px-8 pb-8 flex items-center space-x-3 w-full">
          <button 
            onClick={onClose} 
            className="flex-1 py-3.5 border border-[#E5E7EB] rounded-2xl text-[15px] font-bold text-[#374151] hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <a 
            href={resolvedDownloadUrl || '#'}
            download={resolvedName}
            className="flex-1 py-3.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-2xl text-[15px] font-bold transition-colors flex items-center justify-center space-x-2 shadow-sm shadow-blue-200"
          >
            <Download size={18} />
            <span>Download</span>
          </a>
        </div>

      </div>
    </div>
    </Portal>
  );
}
