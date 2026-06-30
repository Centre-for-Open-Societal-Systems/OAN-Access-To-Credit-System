// Single source of truth for how a failed API call is classified across the app.
//
// Services throw these sentinel strings as the Error message so that:
//   - the global session middleware (store/index.ts) can log out on AUTH, and
//   - feature UIs can decide which state to render (logout vs. AccessDenied vs.
//     a retryable ConnectionError) without each one re-implementing the rules.
//
// The string values are part of the contract (the middleware and persisted
// Redux error state compare against them) — do not change them casually.
export const ApiErrorCode = {
  /** 401 — unauthenticated/expired session. Triggers a global logout. */
  Auth: 'UNAUTHORIZED',
  /** 403 — authenticated but not permitted. Surfaced as Access Denied; never logs out. */
  Forbidden: 'FORBIDDEN',
  /** 5xx / network unreachable (e.g. proxy 502) / timeout. Retryable, not the user's fault. */
  Connection: 'CONNECTION',
} as const;

export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];

// Maps a non-ok HTTP status to a sentinel code, or null for statuses the caller
// should handle itself (e.g. 400 validation, 404 not-found). A 502 from our
// proxy when the backend is down is a normal response with status 502 — it lands
// here as Connection, not as a thrown network error.
export function httpStatusToErrorCode(status: number): ApiErrorCode | null {
  if (status === 401) return ApiErrorCode.Auth;
  if (status === 403) return ApiErrorCode.Forbidden;
  if (status >= 500) return ApiErrorCode.Connection;
  return null;
}

// Classifies a caught/rejected value into a known category so UI can branch on
// it. Accepts an Error, the bare sentinel string (as stored in Redux error
// state), or a raw fetch network failure (TypeError: "Failed to fetch"), all of
// which can reach a component. Returns null when the failure is none of the
// recognized categories (let the caller show a generic message).
export function classifyError(error: unknown): ApiErrorCode | null {
  const message =
    error instanceof Error ? error.message : typeof error === 'string' ? error : '';

  if (message === ApiErrorCode.Auth) return ApiErrorCode.Auth;
  if (message === ApiErrorCode.Forbidden) return ApiErrorCode.Forbidden;
  if (message === ApiErrorCode.Connection) return ApiErrorCode.Connection;

  // An ApiError (from fetchApi) keeps its HTTP status so a 5xx still classifies
  // as Connection while preserving the detailed server message for toasts.
  const status = (error as { status?: unknown })?.status;
  if (typeof status === 'number') {
    const code = httpStatusToErrorCode(status);
    if (code) return code;
  }

  // A raw fetch() rejects with a TypeError when the network/proxy is unreachable;
  // browsers word it differently ("Failed to fetch", "NetworkError", "Load failed").
  if (error instanceof TypeError || /failed to fetch|networkerror|load failed/i.test(message)) {
    return ApiErrorCode.Connection;
  }

  return null;
}
