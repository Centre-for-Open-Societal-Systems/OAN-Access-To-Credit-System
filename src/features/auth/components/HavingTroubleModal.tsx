'use client';

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

interface HavingTroubleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HavingTroubleModal({ isOpen, onClose }: HavingTroubleModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scrolling
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setInputValue('');
        setIsSuccess(false);
        setIsSubmitting(false);
      }, 300); // Wait for modal fade out animation
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-[448px] rounded-[16px] bg-white p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 sm:right-6 sm:top-6 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-4 sm:py-8 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#16A34A]/10 mb-5">
              <Check className="h-8 w-8 text-[#16A34A]" strokeWidth={3} />
            </div>
            <h3 className="mb-2 text-[20px] sm:text-[24px] font-bold text-[#111827]">Check your inbox</h3>
            <p className="mb-8 text-[#6B7280] text-[14px] sm:text-[16px] leading-relaxed">
              We've sent a recovery link to <span className="font-semibold text-gray-900 break-all">{inputValue}</span>. Please check your messages.
            </p>
            <button
              onClick={onClose}
              className="w-full h-[46px] rounded-lg bg-[#16A34A] text-white font-bold text-[14px] transition-colors hover:bg-[#10883c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A34A] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <>
            <h2 id="modal-title" className="text-[24px] sm:text-[28px] font-bold text-[#111827] leading-tight mb-2">
              Account Recovery
            </h2>
            <p className="text-[#6B7280] text-[14px] sm:text-[16px] leading-relaxed mb-6">
              Enter your registered phone number or email to receive a recovery link.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="recovery-input" className="sr-only">Phone Number or Email</label>
                <input
                  id="recovery-input"
                  type="text"
                  placeholder="Enter phone number or email"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full h-[48px] rounded-lg bg-[#F3F4F6] border-0 px-4 text-[14px] text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#16A34A] transition-shadow"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row-reverse gap-3 mt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !inputValue.trim()}
                  className="w-full sm:w-auto sm:min-w-[140px] h-[40px] rounded-lg bg-[#16A34A] text-white font-medium text-[14px] transition-colors hover:bg-[#10883c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A34A] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send Recovery Link'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto sm:min-w-[100px] h-[40px] rounded-lg border border-[#D1D5DB] bg-white text-[#374151] font-medium text-[14px] transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#374151]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
