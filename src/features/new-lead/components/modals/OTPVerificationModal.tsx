import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'next/navigation';
import { X, ShieldCheck, Check } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { verifyOtpThunk, selectNewLeadState } from '../../store/newLeadSlice';

interface OTPVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmerId: string;
  maskedPhone?: string;
}

export function OTPVerificationModal({ isOpen, onClose, farmerId, maskedPhone }: OTPVerificationModalProps) {
  const dispatch = useAppDispatch();
  const { isVerifyingOtp, consentRequestId, farmerDetails } = useAppSelector(selectNewLeadState);
  const params = useParams();
  const leadId = params?.id as string || '';

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setOtp(Array(6).fill(''));
      setError(null);
      // Auto-focus first input when opened
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-advance to next input
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6).split('');
    if (pastedData.some(char => isNaN(Number(char)))) return;

    const newOtp = [...otp];
    pastedData.forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);

    // Focus last filled input
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    setError(null);
    if (!leadId) {
      alert("Missing Lead ID. Please try again.");
      return;
    }

    const result = await dispatch(verifyOtpThunk({ otp_code: code, leadId }));
    if (verifyOtpThunk.fulfilled.match(result)) {
      onClose(); // Verification successful, close modal
    } else {
      setError(result.payload as string || 'Verification failed. Try again.');
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm p-4">
      <div className="relative flex flex-col bg-white rounded-[10px] w-full max-w-[605px] overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex flex-row justify-between items-center px-6 h-[77px] border-b border-[#E5E7EB]">
          <h2 className="font-roboto font-bold text-[18px] leading-7 text-[#111827] m-0">
            OTP Verification
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded border border-[#0A0A0A] hover:bg-gray-100 transition-colors"
          >
            <X size={16} className="text-[#0A0A0A]" />
          </button>
        </div>

        {/* Body Container */}
        <div className="flex flex-col px-6 pt-6 gap-4 pb-6">

          {/* Consent Summary */}
          <div className="flex flex-col items-start p-4 bg-[#EFF6FF] border border-[#DBEAFE] rounded-lg">
            <div className="flex flex-row items-start gap-3">
              <div className="mt-[2px] shrink-0 text-[#3B82F6]">
                <ShieldCheck size={16} className="fill-[#3B82F6] text-white" />
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="font-inter font-medium text-[14px] leading-5 text-[#1E3A8A] m-0">
                  Consent Authorization
                </h4>
                <p className="font-inter font-normal text-[12px] leading-5 text-[#1E40AF] m-0">
                  By requesting OTP, you confirm the farmer is present and has verbally agreed to share their registry data with AgriBank for the purpose of this loan application.
                </p>
              </div>
            </div>
          </div>

          {/* OTP Verification Area */}
          <div className="flex flex-col justify-center items-center p-6 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl h-[387.5px]">
            <div className="flex flex-col items-center gap-2 max-w-[384px] w-full">

              {/* Icon Circle */}
              <div className="flex justify-center items-center w-16 h-16 bg-white border border-[#F3F4F6] rounded-full shadow-[0px_1px_2px_rgba(0,0,0,0.05)] mb-2">
                <Check size={24} className="text-[#22C55E]" strokeWidth={3} />
              </div>

              {/* Text */}
              <h3 className="font-inter font-bold text-[18px] leading-7 text-center text-[#111827] m-0">
                Enter Verification Code
              </h3>
              <p className="font-inter font-normal text-[14px] leading-5 text-center text-[#6B7280] m-0">
                A 6-digit code has been sent to the farmer's registered phone {maskedPhone}.
              </p>

              {/* Inputs */}
              <div className="flex flex-row justify-center items-center py-4 gap-1 sm:gap-2 w-full">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="flex flex-col items-center justify-center w-10 sm:w-12 h-12 sm:h-14 bg-white border border-[#D1D5DB] rounded-lg font-inter font-bold text-[16px] sm:text-[20px] leading-6 text-center text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-[#16A34A] transition-all"
                  />
                ))}
              </div>

              {error && (
                <p className="text-red-500 text-sm font-medium -mt-2 mb-2">{error}</p>
              )}

              {/* Verify Button */}
              <button
                onClick={handleVerify}
                disabled={isVerifyingOtp}
                className="flex flex-row justify-center items-center px-4 py-[10px] w-full h-[42px] bg-[#16A34A] hover:bg-[#15803D] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-md font-inter font-medium text-[14px] leading-5 text-white transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
              </button>

              {/* Resend */}
              <div className="flex flex-row items-center justify-center gap-1 mt-2">
                <span className="font-inter font-normal text-[14px] leading-5 text-[#6B7280]">
                  Didn't receive the code?
                </span>
                <button type="button" className="font-inter font-medium text-[14px] leading-5 text-[#9CA3AF] hover:text-[#4B5563] transition-colors">
                  Resend Code
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
