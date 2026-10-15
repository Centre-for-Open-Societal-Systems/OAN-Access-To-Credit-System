import { endServerSession, logoutUser } from '@/features/auth/api/authApi';
import { loginRouteFor, type LogoutReason } from '@/features/auth/rbac';
import { logout } from '@/features/auth/store/authSlice';
import { startBlocking } from '@/store/loadingSlice';
import type { UnknownAction } from '@reduxjs/toolkit';

/**
 * The single way a session ends in this app.
 *
 * Sign-out used to be re-implemented at each call site — the dashboard header,
 * the idle watcher, and the 401 middleware each did their own revoke/reset/
 * redirect, and each picked their own destination. The header sent people to the
 * per-role login page for the role they had just left (and farmers to `/`),
 * while the other two sent everyone to `/login`. Same act, three answers.
 *
 * Now every path runs through here, so:
 *   - the refresh token is always revoked server-side before the cookies go,
 *   - Redux is always reset (the root reducer wipes every slice on `logout`),
 *   - and everybody lands on `/login`, the role chooser — never a role-specific
 *     portal.
 */

/**
 * The narrow slice of `dispatch` this module needs.
 *
 * Typed structurally rather than as `AppDispatch` so `store/index.ts` can call it
 * from inside a middleware — where `AppDispatch` is still being inferred — without
 * a circular type reference.
 */
type Dispatch = (action: UnknownAction) => unknown;

/**
 * Ends the session without navigating: revokes the refresh token server-side and
 * resets client state.
 *
 * For the case where the person stays on the page they are on — signing in
 * through the wrong portal, or finishing a forced password change, where a
 * half-session exists that must not survive but there is nowhere to send them.
 *
 * Returns whether the server confirmed it cleared the cookies.
 */
export async function clearSession(dispatch: Dispatch): Promise<boolean> {
  const clearedServerSide = await logoutUser();
  dispatch(logout());
  return clearedServerSide;
}

/**
 * Guards against a second sign-out being started while the first is still in
 * flight — an idle-timeout expiry racing a 401, or an impatient double click on
 * the menu item. Never reset: the page is on its way to a full document load, and
 * the module instance goes with it.
 */
let isSigningOut = false;

/**
 * Signs the current user out and sends them to `/login`.
 *
 * The redirect is a full document load rather than `router.push`, for two
 * reasons. If the revoke call failed the cookies are still set, and a client-side
 * route change would be bounced straight back into the dashboard by the proxy
 * middleware, which reads those cookies — a hard load at least re-runs that
 * decision against real state. And a new document guarantees nothing from the
 * previous session survives in memory, which a client transition cannot promise.
 *
 * The blocking overlay is raised first so the dashboard isn't left interactive,
 * and stays up until the new document paints. `logout` resets the store, so the
 * root reducer deliberately carries the loading slice across that reset — see
 * `rootReducer` in `store/index.ts`.
 */
export async function performGlobalLogout(
  dispatch: Dispatch,
  reason?: LogoutReason
): Promise<void> {
  if (isSigningOut) return;
  isSigningOut = true;

  dispatch(startBlocking('Signing you out…'));

  // An SSO session also has to end at the identity provider, which the server
  // answers with a URL for; the provider then returns the browser to /login.
  let providerLogoutUrl: string | null = null;
  try {
    providerLogoutUrl = (await endServerSession()).redirectTo;
    dispatch(logout());
  } finally {
    if (typeof window !== 'undefined') {
      window.location.assign(providerLogoutUrl ?? loginRouteFor(reason));
    } else {
      // No document to navigate; leave the flag down so a later browser-side
      // call can still run rather than being swallowed by the guard.
      isSigningOut = false;
    }
  }
}
