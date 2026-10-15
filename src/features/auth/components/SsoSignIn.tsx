'use client';

import { SessionEndedNotice } from '@/components/SessionEndedNotice';
import { Button } from '@/components/ui/Button';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { endServerSession } from '@/features/auth/api/authApi';
import { ArrowRight, LogOut } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

// Why `/api/auth/sso/*` sent the person back here (see lib/ssoRedirect.ts).
const SSO_ERRORS: Record<string, string> = {
  sso_unavailable: 'Single sign-on is not available right now. Please try again shortly.',
  sso_failed: 'We could not complete your sign-in. Please try again.',
  sso_no_access: 'Your account is not set up for the Field Agent Portal. Ask your administrator for access.',
};

const SWITCH_FAILED =
  'Could not sign you out of the SSO account. Sign out from the other OpenG2P app, then try again.';

/** Where the identity provider returns the browser after the logout. */
const RETURN_TO = '/login/development-agent';

export interface SsoSignInProps {
  heading?: string | undefined;
  subtitle: string;
}

/**
 * Sign-in for portals whose users authenticate only through the OpenG2P IAM
 * service (single sign-on). There is no password here: the button is a page
 * navigation to `/api/auth/sso/login`, which sends the browser on to the
 * identity provider and, after sign-in, back into the app.
 */
export function SsoSignIn({ heading = 'Welcome Back', subtitle }: SsoSignInProps) {
  const reason = useSearchParams().get('reason');
  const [switchFailed, setSwitchFailed] = useState(false);
  const errorMessage = switchFailed ? SWITCH_FAILED : reason ? SSO_ERRORS[reason] : undefined;
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  // Signed in at IAM with an account that has no role here: SSO would sign the
  // same account straight back in, so the way out has to end that session first.
  const showSwitch = reason === 'sso_no_access' && !switchFailed;

  // Ends the SSO session at IAM and Keycloak, which then send the browser back to
  // a clean login page. Without a provider logout URL (IAM unreachable) the
  // Keycloak session lives on, so say so instead of pretending it worked.
  const switchAccount = async () => {
    setIsSwitching(true);
    const { redirectTo } = await endServerSession(RETURN_TO);
    if (redirectTo) {
      window.location.assign(redirectTo);
      return;
    }
    setIsSwitching(false);
    setSwitchFailed(true);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full px-0 sm:px-0 max-w-lg mx-auto w-full">
      <div className="w-full flex flex-col items-center text-center mb-8">
        <h2 className="text-[28px] sm:text-[32px] font-bold text-[#1F2937] mb-2 tracking-tight">{heading}</h2>
        <p className="text-[#6B7280] text-[14px] sm:text-[15px] font-medium px-2 sm:px-0 w-full sm:w-auto md:max-w-[280px] mx-auto">
          {subtitle}
        </p>
      </div>

      <SessionEndedNotice suppressed={!!errorMessage} />

      {errorMessage && <ErrorAlert className="mb-6 w-full">{errorMessage}</ErrorAlert>}

      {showSwitch && (
        <div className="w-full mb-6 flex flex-col gap-3">
          <p className="text-[13px] text-[#6B7280]">
            You are signed in with an SSO account that has no access here. Signing out also signs you out of the
            registry and other OpenG2P apps.
          </p>
          <Button
            type="button"
            variant="outline"
            size="none"
            isLoading={isSwitching}
            onClick={() => void switchAccount()}
            className="w-full py-3 text-[14px] space-x-2"
          >
            {!isSwitching && <LogOut size={18} strokeWidth={2.25} aria-hidden="true" />}
            <span className="font-semibold">{isSwitching ? 'Signing out…' : 'Sign out and use a different account'}</span>
          </Button>
        </div>
      )}

      <Button
        as="a"
        href="/api/auth/sso/login"
        size="none"
        isLoading={isNavigating}
        onClick={() => setIsNavigating(true)}
        className="w-full py-4 text-[14px] space-x-2 active:scale-[0.98]"
      >
        <span className="font-semibold">{isNavigating ? 'Redirecting…' : 'Sign in with SSO'}</span>
        {!isNavigating && <ArrowRight size={18} strokeWidth={2.5} />}
      </Button>
    </div>
  );
}
