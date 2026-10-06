
import { rawUserResponseSchema, validateResponse, type RawUserResponse } from '@/lib/api/api.schemas';
import { fetchApi } from '@/lib/api/fetchApi';
import { AUTH_MESSAGES } from '@/lib/authMessages';
import { logger } from '@/lib/logger';

// `RawUserResponse` is the validated `get_me` shape; its single source of truth
// is the Zod schema in `@/lib/api/api.schemas`.
export type { RawUserResponse };

export interface LoginApiResponse {
  success?: boolean;
  message?: string;
  user?: RawUserResponse;
  code?: string;
  usr?: string;
}

interface LoginCredentials {
  usr: string;
  pwd: string;
  /**
   * Whether the "Remember me" box was ticked. Decides the session lifetime the
   * login route writes onto the cookies (30 days vs 24 hours) and is passed on
   * to the backend, which stores it against the refresh token so every later
   * rotation keeps the same terms.
   */
  rememberMe?: boolean;
}

/**
 * Correct credentials do not always mean a session.
 *
 * When an admin issued the password — a new team member, or a reset for a
 * forgotten one — the backend authenticates the request but returns no token
 * until the user picks a password of their own. That is a distinct outcome, not
 * a failure, so it is modelled as one rather than smuggled through a thrown
 * error or a null user.
 */
export type LoginResult =
  | { outcome: 'authenticated'; user: RawUserResponse }
  | { outcome: 'password_change_required'; usr: string };

export async function loginUser({ usr, pwd, rememberMe = false }: LoginCredentials): Promise<LoginResult> {
  const res = await fetch(`/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ usr, pwd, rememberMe }),
  });

  const data = (await res.json().catch(() => ({}))) as LoginApiResponse;

  // Checked before res.ok: this arrives as a 403, but it is an actionable step
  // in the login flow rather than a rejection.
  if (data.code === 'PASSWORD_CHANGE_REQUIRED') {
    return { outcome: 'password_change_required', usr: data.usr || usr };
  }

  if (!res.ok) {
    // The route has already reduced every failure to safe, uniform copy (see
    // lib/authMessages.ts); the fallback only covers a response that carried no
    // body at all.
    throw new Error(data.message || AUTH_MESSAGES.invalidCredentials);
  }

  if (!data.user) {
    // A shape violation is an integration bug, not something the person signing
    // in can act on — log the detail and show them the generic message.
    logger.error('Malformed login response: message.user is missing');
    throw new Error(AUTH_MESSAGES.signInUnavailable);
  }

  return { outcome: 'authenticated', user: data.user };
}

interface SetInitialPasswordParams {
  /** Email or phone, exactly as typed at login — the backend resolves either. */
  usr: string;
  /** The temporary password the admin issued; re-verified server-side. */
  currentPassword: string;
  newPassword: string;
}

/**
 * Replaces an admin-issued temporary password with one only the user knows.
 *
 * Deliberately not routed through `fetchApi`: that maps a 401 to the
 * `ApiErrorCode.Auth` sentinel and discards the server's message, but here the
 * message ("Incorrect email or password.") is the entire point of the response.
 * It would also fire a pointless token refresh for an account that has no
 * session yet by definition.
 *
 * It is equally deliberately NOT routed through /api/proxy: this call verifies
 * the temporary password, so it needs the same per-IP throttle every other
 * credential-checking route has. /api/proxy has none. See
 * app/api/auth/set-initial-password/route.ts.
 */
export async function setInitialPassword({
  usr,
  currentPassword,
  newPassword,
}: SetInitialPasswordParams): Promise<string> {
  const res = await fetch('/api/auth/set-initial-password', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ usr, current_password: currentPassword, new_password: newPassword }),
  });

  const body = (await res.json().catch(() => null)) as {
    message?: EnvelopeMessage | string;
  } | null;

  // Route handlers that reject before reaching the backend (429 from the rate
  // limiter, 403 from the CSRF guard) reply with a bare string message rather
  // than the backend envelope, so both shapes have to be readable here.
  const envelope = typeof body?.message === 'string' ? { message: body.message } : body?.message;

  if (!res.ok || envelope?.status === 'error') {
    throw new Error(envelope?.message || 'Could not set your password. Please try again.');
  }

  return envelope?.message || 'Password set successfully. Please sign in with your new password.';
}

/** The `{ status, message, data }` envelope every oan_a2c endpoint replies with. */
interface EnvelopeMessage {
  status?: string;
  message?: string;
  code?: string;
}

/**
 * Clears the server-side session cookies.
 *
 * Returns whether the server confirmed it. Callers should still reset client
 * auth state either way, but `false` means something stronger: the httpOnly
 * cookies are still set, JS cannot remove them, and the middleware will send the
 * person back into the dashboard on the next navigation. That is worth a hard
 * reload rather than a client-side route change.
 *
 * This used to resolve `void` and swallow everything but a network error, which
 * was accurate when the route could only fail by being unreachable. It now has a
 * CSRF guard and a rate limiter in front of it, so a response that is not `ok`
 * is a real outcome and no longer a synonym for success.
 */
export async function logoutUser(): Promise<boolean> {
  try {
    const res = await fetch(`/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!res.ok) {
      logger.security(`Logout refused by the server with status ${res.status}`);
      return false;
    }

    return true;
  } catch (error) {
    // The cookies are httpOnly, so an unreachable route leaves the session live
    // server-side. Report that honestly rather than reporting success.
    logger.error('Logout request failed:', error);
    return false;
  }
}

export async function getMe(): Promise<RawUserResponse> {
  const data = await fetchApi('v1/me', {
    method: 'GET',
  });

  if (!data?.data) {
    throw new Error('Malformed get_me API response');
  }

  return validateResponse(rawUserResponseSchema, data.data, 'auth.get_me');
}

export interface UserProfileResponse {
  personal_information: {
    user_image: string | null;
    full_name: string;
    email_address: string;
    gender: string;
    phone_number: string;
    language: string;
  };
  account_information: {
    user_role: string;
    organization: string;
    employee_id: string;
    member_since: string;
  };
}

function normalizeFileUrl(url: string | null | undefined): string | null {
  if (!url) return url ?? null;
  return url.replace(/^https?:\/\/[^/]+\/files\//, '/api/files/');
}

export async function getUserProfile(): Promise<UserProfileResponse> {
  const res = await fetchApi('v1/me/profile', {
    method: 'GET',
  });
  const data = res.data as UserProfileResponse;
  if (data?.personal_information?.user_image) {
    data.personal_information.user_image = normalizeFileUrl(data.personal_information.user_image);
  }
  return data;
}


export interface UpdateProfilePayload {
  full_name?: string;
  phone_number?: string;
  language?: string;
  gender?: string;
  user_image?: string;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<UserProfileResponse> {
  const res = await fetchApi('v1/me/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  const data = res.data as UserProfileResponse;
  if (data?.personal_information?.user_image) {
    data.personal_information.user_image = normalizeFileUrl(data.personal_information.user_image);
  }
  return data;
}

export async function forgotPassword(email: string): Promise<void> {
  await fetchApi('v1/auth/password/forgot', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(email: string, key: string, new_password: string): Promise<void> {
  await fetchApi('v1/auth/password/reset', {
    method: 'POST',
    body: JSON.stringify({ email, key, new_password }),
  });
}

export async function changePassword(current_password: string, new_password: string): Promise<void> {
  await fetchApi('v1/me/password', {
    method: 'PATCH',
    body: JSON.stringify({ current_password, new_password }),
  });
}
