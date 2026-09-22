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
  details?: Record<string, unknown>;
  error?: string;
}

/** Narrows an unknown JSON body to the envelope shape (never null). */
export function readAuthEnvelope(data: unknown): AuthEnvelope {
  if (!data || typeof data !== 'object') return {};
  const record = data as Record<string, unknown>;
  const status = typeof record.status === 'string' ? record.status : undefined;
  const message = typeof record.message === 'string' ? record.message : undefined;
  const code = typeof record.code === 'string' ? record.code : undefined;
  const error = typeof record.error === 'string' ? record.error : undefined;
  const details =
    record.details && typeof record.details === 'object' && !Array.isArray(record.details)
      ? (record.details as Record<string, unknown>)
      : undefined;

  return {
    ...(status !== undefined ? { status } : {}),
    ...(message !== undefined ? { message } : {}),
    ...(code !== undefined ? { code } : {}),
    ...(error !== undefined ? { error } : {}),
    ...(details !== undefined ? { details } : {}),
  };
}

/** Extracts a human-readable error message from an envelope payload, if present. */
export function extractErrorMessage(data: unknown): string | null {
  const envelope = readAuthEnvelope(data);
  if (envelope.details) {
    const detailEntries = Object.entries(envelope.details).filter(([, v]) => Boolean(v));
    if (detailEntries.length > 0) {
      return detailEntries
        .map(([k, v]) => `${k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}: ${v}`)
        .join('. ');
    }
  }
  if (envelope.message) return envelope.message;
  if (envelope.error) return envelope.error;
  return null;
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

