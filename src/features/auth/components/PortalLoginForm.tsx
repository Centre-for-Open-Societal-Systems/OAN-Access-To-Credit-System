'use client';

import { logoutUser } from '@/features/auth/api/authApi';
import { ForgotPasswordModal } from '@/features/auth/components/ForgotPasswordModal';
import type { UserKind } from '@/features/auth/rbac';
import { clearAuthError, loginThunk, logout } from '@/features/auth/store/authSlice';
import type { User as AuthUser } from '@/features/auth/types/auth.types';
import { useAppDispatch } from '@/store/hooks';
import { ArrowRight, Eye, EyeOff, Lock, ShieldCheck, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface PortalLoginFormProps {
  /** Title shown below the heading */
  subtitle: string;
  /** Placeholder for the username/phone field */
  usernamePlaceholder?: string;
  /** Roles allowed to log in via this portal */
  allowedKinds: UserKind[];
  /** Where to redirect after successful login */
  redirectTo: (user: AuthUser) => string;
  /** Show "Register account" link pointing to /create-account */
  showRegisterLink?: boolean;
  /** Show partner banks section at the bottom */
  showPartnerBanks?: boolean;
}

const PARTNER_BANKS = ['CBE', 'Dashen', 'Awash', 'CBO', 'Abyssinia', 'OIB'];

export function PortalLoginForm({
  subtitle,
  usernamePlaceholder = '+251 911 234 567',
  allowedKinds,
  redirectTo,
  showRegisterLink = false,
  showPartnerBanks = true,
}: PortalLoginFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    dispatch(clearAuthError());

    try {
      const result = await dispatch(loginThunk({ usr: username, pwd: password, rememberMe }));
      if (loginThunk.fulfilled.match(result)) {
        const user = result.payload;
        if (allowedKinds.includes(user.kind)) {
          router.push(redirectTo(user));
        } else {
          await logoutUser();
          dispatch(logout());
          setErrorMessage('These credentials are not valid for this portal. Please use your designated login page.');
        }
      } else {
        setErrorMessage((result.payload as string) || 'Invalid credentials or login failed.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full px-0 sm:px-0 max-w-lg mx-auto w-full">
      <div className="w-full flex flex-col items-center text-center mb-8">
        <h2 className="text-[28px] sm:text-[32px] font-bold text-[#1F2937] mb-2 tracking-tight">
          Welcome to the Portal
        </h2>
        <p className="text-[#6B7280] text-[15px] font-medium max-w-[280px]">{subtitle}</p>
      </div>

      {errorMessage && (
        <div className="w-full mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full space-y-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[14px] font-semibold text-[#374151]">Phone Number or Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                <User size={18} strokeWidth={2} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={usernamePlaceholder}
                required
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#D1D5DB] rounded-xl text-[14px] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all placeholder:text-[#9CA3AF] font-medium shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[14px] font-semibold text-[#374151]">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                <Lock size={18} strokeWidth={2} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-12 py-3 bg-white border border-[#D1D5DB] rounded-xl text-[14px] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all placeholder:text-[#9CA3AF] font-medium shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#9CA3AF] hover:text-[#4B5563] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2.5 cursor-pointer group">
            <div className="relative flex items-center justify-center w-5 h-5">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="peer appearance-none w-5 h-5 border-2 border-[#D1D5DB] rounded-[6px] bg-white checked:bg-[#16A34A] checked:border-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 transition-all duration-300 cursor-pointer hover:border-[#16A34A]/50 active:scale-90 checked:scale-110"
              />
              <svg
                className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 scale-50 peer-checked:opacity-100 peer-checked:scale-100 transition-all duration-300"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-[14px] font-medium text-[#4B5563] group-hover:text-[#1F2937] transition-colors">
              Remember me
            </span>
          </label>
          <button
            type="button"
            onClick={() => setIsForgotOpen(true)}
            className="text-[14px] font-bold text-[#1F2937] hover:text-[#16A34A] transition-colors bg-transparent border-none p-0 cursor-pointer"
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#16A34A] hover:bg-[#15803d] text-white py-4 rounded-xl font-bold text-[14px] flex items-center justify-center space-x-2 transition-all active:scale-[0.98] shadow-sm disabled:opacity-70"
        >
          <span>{isLoading ? 'Signing in…' : 'Continue to Sign In'}</span>
          {!isLoading && <ArrowRight size={18} strokeWidth={2.5} />}
        </button>

        {showRegisterLink && (
          <div className="text-center text-[14px] font-medium text-[#6B7280]">
            New to OAN?{' '}
            <Link href="/create-account" className="text-[#16A34A] font-bold hover:underline">
              Register account
            </Link>
          </div>
        )}
      </form>

      <div className="mt-6 w-full bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl p-3 flex items-start space-x-3">
        <ShieldCheck className="text-[#16A34A] mt-0.5 shrink-0" size={18} strokeWidth={2.5} />
        <p className="text-[14px] font-medium text-[#166534] leading-relaxed">
          <strong className="font-bold">Secured by FaydaPass — </strong>
          All sessions authenticated via Ethiopia National ID (Fayda Auth API)
        </p>
      </div>

      {showPartnerBanks && (
        <div className="mt-8 w-full flex flex-col items-center">
          <span className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-3">
            Partner Banks
          </span>
          <div className="flex flex-wrap justify-center gap-1.5">
            {PARTNER_BANKS.map((bank) => (
              <div
                key={bank}
                className="px-4 py-1.5 rounded-full border border-[#16A34A]/30 text-[11px] font-bold text-[#16A34A] cursor-default bg-[#F7FFFB]"
              >
                {bank}
              </div>
            ))}
          </div>
        </div>
      )}

      <ForgotPasswordModal isOpen={isForgotOpen} onClose={() => setIsForgotOpen(false)} />
    </div>
  );
}
