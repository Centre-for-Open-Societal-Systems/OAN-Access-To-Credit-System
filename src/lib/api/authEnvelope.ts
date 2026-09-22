/**
 * The `{ status, message, code }` envelope oan_a2c's REST auth endpoints reply
 * with, on both success and failure.
 *
 * This is deliberately separate from `fetchApi`'s error handling: the auth
 * routes are Next route handlers talking to the backend directly, without a
 * session or the proxy in front of them, so they can't reuse the client helper.
 * They can, however, share one reading of the envelope — hand-rolling the same
 * `typeof data?.message === 'string'` check in each route is how they drifted.
 */
export interface AuthEnvelope {
  status?: string;
  message?: string;
  code?: string;
}

/** Narrows an unknown JSON body to the envelope shape (never null). */
export function readAuthEnvelope(data: unknown): AuthEnvelope {
  if (!data || typeof data !== 'object') return {};
  const { status, message, code } = data as Record<string, unknown>;
  return {
    ...(typeof status === 'string' ? { status } : {}),
    ...(typeof message === 'string' ? { message } : {}),
    ...(typeof code === 'string' ? { code } : {}),
  };
}

/**
 * The backend's own reason for a failure, for the *log line only*.
 *
 * Never returned to the caller on the login/refresh paths — relaying it is what
 * turns a login form into an enumeration oracle. Falls back to dumping the raw
 * body so a non-envelope failure (an HTML error page, a bare string) is still
 * diagnosable.
 */
export function authEnvelopeLogMessage(data: unknown): string {
  return readAuthEnvelope(data).message ?? JSON.stringify(data);
}
