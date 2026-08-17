'use client';

import { logoutUser } from '@/features/auth/api/authApi';
import { ForgotPasswordModal } from '@/features/auth/components/ForgotPasswordModal';
import { SetInitialPasswordForm } from '@/features/auth/components/SetInitialPasswordForm';
import type { UserKind } from '@/features/auth/rbac';
import { clearAuthError, loginThunk, logout } from '@/features/auth/store/authSlice';
import type { User as AuthUser } from '@/features/auth/types/auth.types';
import { AUTH_MESSAGES } from '@/lib/authMessages';
import { useAppDispatch } from '@/store/hooks';
import { ArrowRight, CheckCircle2, Clock, Eye, EyeOff, Lock, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

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
  // Set by IdleSessionWatcher and by the middleware's idle check, so the sign-out
  // is explained on arrival rather than looking like a session that just vanished.
  const wasSignedOutForIdling = useSearchParams().get('reason') === 'idle';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // Sent to /api/auth/login, which uses it to pick the session lifetime (30 days
  // vs 24 hours). Until it was wired up the box rendered but was never read, so
  // every session got the same treatment whatever the person chose.
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  // Set when the backend accepts the credentials but refuses to open a session
  // because the password was issued by an admin. Held in component state only —
  // a temporary password must never reach Redux, sessionStorage or a cookie.
  const [pendingPasswordChange, setPendingPasswordChange] = useState<{
    usr: string;
    temporaryPassword: string;
  } | null>(null);
  // Confirmation carried back from the set-password step. Rendered on the form
  // itself rather than as a toast: the user has to type their new password here,
  // so the instruction needs to still be on screen while they do it.
  const [notice, setNotice] = useState<string | null>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Put the cursor where the user's next action is — the username is already
  // filled in, so the only thing left to type is the password they just chose.
  useEffect(() => {
    if (notice) passwordInputRef.current?.focus();
  }, [notice]);

  const returnToSignIn = () => {
    setPendingPasswordChange(null);
    setPassword('');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setNotice(null);
    dispatch(clearAuthError());

    try {
      const result = await dispatch(loginThunk({ usr: username, pwd: password, rememberMe }));
      if (loginThunk.fulfilled.match(result)) {
        if (result.payload.outcome === 'password_change_required') {
          setPendingPasswordChange({ usr: result.payload.usr, temporaryPassword: password });
          return;
        }
        const user = result.payload.user;
        if (allowedKinds.includes(user.kind)) {
          router.push(redirectTo(user));
        } else {
          await logoutUser();
          dispatch(logout());
          setErrorMessage(AUTH_MESSAGES.wrongPortal);
        }
      } else {
        setErrorMessage((result.payload as string) || AUTH_MESSAGES.invalidCredentials);
      }
    } catch {
      setErrorMessage(AUTH_MESSAGES.unexpected);
    } finally {
      setIsLoading(false);
    }
  };

  if (pendingPasswordChange) {
    return (
      <SetInitialPasswordForm
        usr={pendingPasswordChange.usr}
        temporaryPassword={pendingPasswordChange.temporaryPassword}
        onDone={async (successMessage) => {
          // No session was ever created, but clear any stale cookie/state anyway
          // so the user lands on a genuinely clean sign-in.
          await logoutUser();
          dispatch(logout());
          returnToSignIn();
          setNotice(successMessage);
        }}
        onCancel={returnToSignIn}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full px-0 sm:px-0 max-w-lg mx-auto w-full">
      <div className="w-full flex flex-col items-center text-center mb-8">
        <h2 className="text-[28px] sm:text-[32px] font-bold text-[#1F2937] mb-2 tracking-tight">
          Welcome to the Portal
        </h2>
        <p className="text-[#6B7280] text-[15px] font-medium max-w-[280px]">{subtitle}</p>
      </div>

      {notice && (
        <div
          role="status"
          className="w-full mb-6 p-4 bg-brand-green-surface border border-brand-green-border rounded-xl flex items-start gap-3 animate-fade-in-down"
        >
          <CheckCircle2 className="mt-0.5 shrink-0 text-brand-green" size={18} strokeWidth={2.5} />
          <div>
            <p className="text-sm font-bold text-brand-green-strong">Password updated</p>
            <p className="mt-0.5 text-sm font-medium text-brand-green-strong/90">{notice}</p>
          </div>
        </div>
      )}

      {wasSignedOutForIdling && !errorMessage && !notice && (
        <div
          role="status"
          className="w-full mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3"
        >
          <Clock className="mt-0.5 shrink-0 text-amber-600" size={18} strokeWidth={2.5} />
          <div>
            <p className="text-sm font-bold text-amber-900">Signed out for inactivity</p>
            <p className="mt-0.5 text-sm font-medium text-amber-900/90">
              Your session ended because it was left idle. Please sign in again to continue.
            </p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="w-full mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full space-y-6" autoComplete="off">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[14px] font-semibold text-[#374151]">Phone Number or Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                <User size={18} strokeWidth={2} />
              </div>
              <input
                type="text"
                autoComplete="off"
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
                ref={passwordInputRef}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
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
            <span className='text-[#16A34A] font-bold text-[14px]'>Forgot Password?</span>
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#16A34A] hover:bg-[#15803d] text-white py-4 rounded-xl font-bold text-[14px] flex items-center justify-center space-x-2 transition-all active:scale-[0.98] shadow-sm disabled:opacity-70"
        >
          <span className='font-semibold'>{isLoading ? 'Signing in…' : 'Continue to Sign In'}</span>
          {!isLoading && <ArrowRight size={18} strokeWidth={2.5} />}
        </button>

        {showRegisterLink && (
          <div className="text-center text-[14px] font-medium text-[#6B7280]">
            New to OAN?{' '}
            <Link href="/create-account" className="text-[#16A34A] font-bold hover:underline">
              <span className='text-[#16A34A]'>Register account</span>
            </Link>
          </div>
        )}
      </form>

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
