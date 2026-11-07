'use client';

import { isValidLoginIdentifier, normalizeLoginIdentifierInput, toCanonicalLoginIdentifier } from '@/lib/validation/phone';
import { PartnerBanks } from '@/app/(portal-account)/components/PartnerBanks';
import { SessionEndedNotice } from '@/components/SessionEndedNotice';
import { Button } from '@/components/ui/Button';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { ForgotPasswordModal } from '@/features/auth/components/ForgotPasswordModal';
import { SetInitialPasswordForm } from '@/features/auth/components/SetInitialPasswordForm';
import { clearSession } from '@/features/auth/logout';
import type { UserKind } from '@/features/auth/rbac';
import { clearAuthError, loginThunk } from '@/features/auth/store/authSlice';
import type { User as AuthUser } from '@/features/auth/types/auth.types';
import { useAutofillGuard } from '@/hooks/useAutofillGuard';
import { AUTH_MESSAGES } from '@/lib/authMessages';
import { useAppDispatch } from '@/store/hooks';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Lock, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';

export interface PortalLoginFormProps {
  /** Heading above the subtitle */
  heading?: string;
  /** Title shown below the heading */
  subtitle: string;
  /** Label for the identifier field. Portals that accept only one kind of
   *  identifier should say so — "Phone Number or Email" on a form that only
   *  accepts an email is an invitation to type the wrong thing. */
  usernameLabel?: string;
  /** `email` gets the right mobile keyboard and browser-level format checking.
   *  Defaults to `text` because most portals still accept a phone number too. */
  usernameType?: 'text' | 'email';
  /** Placeholder for the username/phone field */
  usernamePlaceholder?: string;
  /** Roles allowed to log in via this portal */
  allowedKinds: UserKind[];
  /** Where to redirect after successful login */
  redirectTo: (user: AuthUser) => string;
  /** Show the "Register account" link below the submit button */
  showRegisterLink?: boolean;
  /** Where that link goes. Farmers self-register on a different form from the
   *  bank-side seller onboarding, so this is not always /create-account. */
  registerHref?: string;
  /** Show partner banks section at the bottom */
  showPartnerBanks?: boolean;
  /** Rendered between the messages and the form: the portal's IAM login options. */
  beforeForm?: ReactNode;
}

export function PortalLoginForm({
  heading = 'Welcome to the Portal',
  subtitle,
  usernameLabel = 'Phone Number or Email',
  usernameType = 'text',
  usernamePlaceholder = '+251-912345678',
  allowedKinds,
  redirectTo,
  showRegisterLink = false,
  registerHref = '/create-account',
  showPartnerBanks = true,
  beforeForm,
}: PortalLoginFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameReadOnly, unlockUsername] = useAutofillGuard();
  const [passwordReadOnly, unlockPassword] = useAutofillGuard();
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

  // Drop any sign-in failure left in the store by the portal the user just came
  // from. This form shows its own `errorMessage`, which resets on mount anyway —
  // but the store's copy outlives the navigation, and the Development Agent
  // portal reads it, so leaving one behind puts a stale error on a fresh form.
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const returnToSignIn = () => {
    setPendingPasswordChange(null);
    setPassword('');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setNotice(null);
    if (!isValidLoginIdentifier(username)) {
      setErrorMessage('Enter a valid email or a 9-digit phone number.');
      return;
    }
    setIsLoading(true);
    dispatch(clearAuthError());

    try {
      const result = await dispatch(loginThunk({ usr: toCanonicalLoginIdentifier(username), pwd: password, rememberMe }));
      if (loginThunk.fulfilled.match(result)) {
        if (result.payload.outcome === 'password_change_required') {
          setPendingPasswordChange({ usr: result.payload.usr, temporaryPassword: password });
          return;
        }
        const user = result.payload.user;
        if (allowedKinds.includes(user.kind)) {
          router.push(redirectTo(user));
        } else {
          // Valid credentials, wrong portal. The half-session must not survive,
          // but the person stays on this form — so this clears without
          // redirecting, unlike `performGlobalLogout`.
          await clearSession(dispatch);
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
          await clearSession(dispatch);
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
          {heading}
        </h2>
        <p className="text-[#6B7280] text-[14px] sm:text-[15px] font-medium px-2 sm:px-0 w-full sm:w-auto sm:whitespace-nowrap md:whitespace-normal md:max-w-[280px] mx-auto">{subtitle}</p>
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

      {/* Explains an idle timeout or an expired session, from the `reason` the
          shared sign-out path puts on the URL. Suppressed while the form has
          something more immediate to say. */}
      <SessionEndedNotice suppressed={!!errorMessage || !!notice} />

      {errorMessage && <ErrorAlert className="mb-6">{errorMessage}</ErrorAlert>}

      {beforeForm}

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6" autoComplete="off">
        <div className="flex flex-col gap-5">
          <label className="flex flex-col gap-2.5">
            <span className="text-[14px] font-semibold text-[#374151]">{usernameLabel}</span>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                <User size={18} strokeWidth={2} />
              </div>
              <input
                type={usernameType}
                autoComplete="off"
                readOnly={usernameReadOnly}
                onFocus={unlockUsername}
                value={username}
                onChange={(e) => setUsername(normalizeLoginIdentifierInput(e.target.value))}
                placeholder={usernamePlaceholder}
                required
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#D1D5DB] rounded-xl text-[14px] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all placeholder:text-[#9CA3AF] font-medium shadow-sm"
              />
            </div>
          </label>

          <label className="flex flex-col gap-2.5">
            <span className="text-[14px] font-semibold text-[#374151]">Password</span>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                <Lock size={18} strokeWidth={2} />
              </div>
              <input
                ref={passwordInputRef}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                readOnly={passwordReadOnly}
                onFocus={unlockPassword}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-12 py-3 bg-white border border-[#D1D5DB] rounded-xl text-[14px] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all placeholder:text-[#9CA3AF] font-medium shadow-sm"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowPassword(!showPassword);
                }}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#9CA3AF] hover:text-[#4B5563] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
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

        {/* size="none" because the padding and text size here are this button's
            own; everything else — the green, the focus ring, the spinner and the
            disabled state while the request is in flight — comes from Button. */}
        <Button
          type="submit"
          size="none"
          isLoading={isLoading}
          className="w-full py-4 text-[14px] space-x-2 active:scale-[0.98]"
        >
          <span className="font-semibold">{isLoading ? 'Signing in…' : 'Continue to Sign In'}</span>
          {!isLoading && <ArrowRight size={18} strokeWidth={2.5} />}
        </Button>

        <div className={`text-center text-[14px] font-medium text-[#6B7280] ${showRegisterLink ? 'opacity-100' : 'opacity-0 pointer-events-none select-none'}`}>
          New to OAN?{' '}
          <Link href={registerHref} className="text-[#16A34A] font-bold hover:underline" tabIndex={showRegisterLink ? 0 : -1}>
            <span className='text-[#16A34A]'>Register account</span>
          </Link>
        </div>
      </form>

      {showPartnerBanks && <PartnerBanks />}

      <ForgotPasswordModal isOpen={isForgotOpen} onClose={() => setIsForgotOpen(false)} />
    </div>
  );
}
