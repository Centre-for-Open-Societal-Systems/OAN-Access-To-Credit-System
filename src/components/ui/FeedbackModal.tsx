'use client';
import { createPortal } from 'react-dom';

export type FeedbackModalType = 'success' | 'error';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: FeedbackModalType;
  title: string;
  message: string;
  buttonText?: string;
  onAction?: () => void;
}

export function FeedbackModal({
  isOpen,
  onClose,
  type,
  title,
  message,
  buttonText,
  onAction
}: FeedbackModalProps) {
  if (!isOpen || typeof document === 'undefined') return null;

  const isSuccess = type === 'success';

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      onClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-[400px] p-6 flex flex-col items-center text-center animate-in fade-in zoom-in duration-200">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isSuccess ? 'bg-green-100' : 'bg-red-100'}`}>
          {isSuccess ? (
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <span className="text-red-600 font-bold text-2xl">!</span>
          )}
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        
        <button 
          onClick={handleAction} 
          className={`w-full py-2.5 font-medium rounded-lg transition-colors text-white ${
            isSuccess 
              ? 'bg-[#16A34A] hover:bg-[#15803d]' 
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {buttonText || (isSuccess ? 'Okay' : 'Close')}
        </button>
      </div>
    </div>,
    document.body
  );
}
