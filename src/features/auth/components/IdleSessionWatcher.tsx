'use client';

import { useIdleSession } from '@/features/auth/hooks/useIdleSession';
import { performGlobalLogout } from '@/features/auth/logout';
import { selectIsAuthenticated } from '@/features/auth/store/authSlice';
import { useModalA11y } from '@/hooks/useModalA11y';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Clock } from 'lucide-react';
import { useCallback, useRef } from 'react';

/**
 * Signs someone out after a period of inactivity, with a warning first.
 *
 * Mounted once inside the authenticated layout. The server enforces the same
 * window independently (see `SESSION_ACTIVITY_COOKIE`), so this is the humane
 * half of the mechanism rather than the security-carrying half: it gives the
 * person a chance to keep working before their session goes, which matters most
 * on the multi-step loan form where a silent expiry discards the draft.
 */
export function IdleSessionWatcher() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // The shared sign-out path — same revoke, same reset, same `/login`
  // destination as the menu item and the 401 middleware. It carries its own
  // in-flight guard, so the interval firing again mid-round-trip (or the person
  // pressing "Sign out now" while it does) can't start a second sign-out.
  const handleExpire = useCallback(
    () => performGlobalLogout(dispatch, 'idle'),
    [dispatch]
  );

  const { isWarning, secondsRemaining, staySignedIn } = useIdleSession(
    isAuthenticated,
    handleExpire
  );

  const isOpen = isAuthenticated && isWarning;
  const staySignedInRef = useRef<HTMLButtonElement>(null);

  // Same dialog behavior as every other modal: Tab is trapped inside, the page
  // behind stops scrolling, and focus returns where it came from on close.
  //
  // Escape maps to "stay signed in" rather than a bare dismiss. Closing this
  // dialog without answering it would leave the countdown running behind an
  // invisible warning, and a keypress *is* the activity the warning is asking
  // for — so the safe reading and the accessible one agree here.
  const dialogRef = useModalA11y<HTMLDivElement>(isOpen, staySignedIn, staySignedInRef);

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="idle-warning-title"
      aria-describedby="idle-warning-body"
      className="fixed inset-0 z-max flex items-center justify-center bg-black/40 p-4"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <Clock size={22} strokeWidth={2.2} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 id="idle-warning-title" className="text-[17px] font-bold text-[#111827]">
              Still there?
            </h2>
            <p id="idle-warning-body" className="mt-1.5 text-[14px] leading-relaxed text-[#4B5563]">
              You have been inactive for a while. For your security you will be signed out in{' '}
              <span className="font-bold tabular-nums text-[#111827]">{secondsRemaining}</span>{' '}
              second{secondsRemaining === 1 ? '' : 's'}. Any unsaved work will be lost.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => void handleExpire()}
            className="rounded-lg border border-[#D1D5DB] px-4 py-2.5 text-[14px] font-semibold text-[#4B5563] transition-colors hover:bg-gray-50"
          >
            <span className='font-semibold'>Sign out now</span>
          </button>
          <button
            type="button"
            ref={staySignedInRef}
            onClick={staySignedIn}
            className="rounded-lg bg-[#16A34A] px-5 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-[#15803d]"
          >
            <span className='font-semibold'>Stay signed in</span>
          </button>
        </div>
      </div>
    </div>
  );
}
