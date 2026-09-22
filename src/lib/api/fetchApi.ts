// In the browser, requests are same-origin. On the server (SSR), there is no
// origin, so prefer an explicit deployment URL and fall back to localhost on
// the actual configured port rather than a hardcoded 3000.
const BASE_URL =
  typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_SITE_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;

import { ApiErrorCode, httpStatusToErrorCode } from './apiErrors';

export class ApiError extends Error {
  responseData: unknown;
  /** HTTP status that produced this error, so callers can classify it (e.g. 5xx → Connection). */
  status?: number;

  constructor(message: string, responseData?: unknown, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.responseData = responseData;
    if (status !== undefined) this.status = status;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Field-level validation errors out of an error envelope.
 *
 * The REST backend replies flat — `{ message: string, details: { field: msg } }`
 * — which is the shape `fetchApi` below reads. The older Frappe-method envelope
 * nested the same payload one level deeper under `message`, so both are accepted:
 * some endpoints have not been migrated, and an `ApiError` can also be
 * constructed from a Next route handler that still forwards the nested form.
 *
 * Accepts any thrown value so callers can pass a bare `unknown` from `catch`.
 */
export function extractFieldErrors(error: unknown): Record<string, string> {
  const responseData = (error as { responseData?: unknown } | null | undefined)?.responseData;
  if (!responseData || typeof responseData !== 'object') return {};
  const envelope = responseData as { details?: unknown; message?: { details?: unknown } };
  const details =
    envelope.details ??
    (typeof envelope.message === 'object' ? envelope.message?.details : undefined);
  if (!details || typeof details !== 'object') return {};
  return Object.fromEntries(
    Object.entries(details).filter(([, v]) => typeof v === 'string')
  ) as Record<string, string>;
}

/**
 * Fallback copy for a failed request, used when the response carries no usable
 * application message.
 *
 * The old fallback was `API Request failed with status <n>`, which told the
 * reader nothing they could act on. These say what happened in terms of what to
 * do next, and none of them reveal anything about the backend.
 */
function genericMessageForStatus(status: number): string {
  if (status === 429) return 'Too many requests. Please wait a moment and try again.';
  if (status === 404) return 'We could not find what you were looking for.';
  if (status >= 500) return 'The server ran into a problem. Please try again shortly.';
  if (status >= 400) return 'We could not complete that request. Please check your input and try again.';
  return 'Something went wrong. Please try again.';
}

let activeRefresh: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.ok;
  } catch {
    return false;
  }
}
/**
 * Same-origin GET that participates in the shared 401 → refresh → retry flow,
 * but hands back the raw `Response` instead of parsed JSON.
 *
 * `fetchApi` always parses the body as JSON, so it can't be used to pull a file
 * down as a blob. Without this, binary reads (PDF/image previews through
 * `/api/proxy/...`) were plain `fetch()` calls that simply failed on an expired
 * access token while every other request on the page silently recovered.
 */
export async function fetchFileWithAuthRetry(url: string, init: RequestInit = {}): Promise<Response> {
  const options: RequestInit = { credentials: 'same-origin', ...init };
  let response = await fetch(url, options);

  if (response.status === 401 && typeof window !== 'undefined') {
    if (!activeRefresh) {
      activeRefresh = refreshSession().then(
        (success) => {
          activeRefresh = null;
          return success;
        },
        () => {
          activeRefresh = null;
          return false;
        }
      );
    }
    if (await activeRefresh) {
      response = await fetch(url, options);
    }
  }

  return response;
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(new Error('TimeoutError')), timeoutMs);
  
  if (options.signal) {
    if (options.signal.aborted) {
      controller.abort(options.signal.reason);
    } else {
      options.signal.addEventListener('abort', () => controller.abort(options.signal?.reason));
    }
  }

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    const err = error as { name?: string; message?: string };
    if (err.name === 'AbortError' && options.signal?.aborted) {
      throw error; // Intentional abort from frontend (e.g. unmount)
    }
    if (err.message === 'TimeoutError' || err.name === 'TimeoutError' || err.name === 'AbortError') {
      throw new ApiError('The server is taking too long to respond. Please try again.', null, 408);
    }
    throw new ApiError('Network error. Please check your connection.', null, 0);
  }
}

export function resolveProxyPath(path: string): string {
  if (path.startsWith('/api/proxy/')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const finalPath = cleanPath.startsWith('v1/') ? cleanPath : `v1/${cleanPath}`;
  return `/api/proxy/${finalPath}`;
}

export async function fetchApi(path: string, options: RequestInit = {}) {
  const proxyPath = resolveProxyPath(path);
  const url = new URL(proxyPath, BASE_URL);
  
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  let response = await fetchWithTimeout(url.toString(), {
    ...options,
    headers,
  });

  if (response.status === 401 && typeof window !== 'undefined') {
    if (!activeRefresh) {
      activeRefresh = refreshSession().then(
        (success) => {
          activeRefresh = null;
          return success;
        },
        () => {
          activeRefresh = null;
          return false;
        }
      );
    }
    const success = await activeRefresh;
    if (success) {
      response = await fetchWithTimeout(url.toString(), {
        ...options,
        headers,
      });
    }
  }

  let responseData;
  try {
    responseData = await response.json();
  } catch (error) {
    // A caller abort that lands after the response headers but before the body
    // has been read rejects *here*, not in `fetchWithTimeout` — that fetch already
    // resolved and cleared its timeout, so the only signal still able to error the
    // body stream is the caller's. Swallowing it returned `null`, and callers read
    // `null?.data` as a missing field — so a cancelled request surfaced as an
    // '[API Contract Violation]' rather than as an abort. React StrictMode's
    // double-mount makes this fire on the first render of any list that aborts its
    // in-flight request on effect cleanup.
    //
    // `signal.aborted` alone is not the test, though: a caller can abort in the
    // same tick that an empty 2xx body fails to parse, and that SyntaxError is
    // not a cancellation — rethrowing it raw puts a parse error in front of the
    // user instead of the contract-violation path below. The error has to be the
    // abort itself, which is the check `fetchWithTimeout` above already makes.
    const abortReason = options.signal?.aborted ? options.signal.reason : undefined;
    const isAbort = (error as { name?: string } | null)?.name === 'AbortError' || error === abortReason;
    if (options.signal?.aborted && isAbort) throw error;
    if (!response.ok) throw new ApiError(genericMessageForStatus(response.status), null, response.status);
    return null;
  }

  if (!response.ok) {
    // 401 = unauthenticated (expired/invalid session) → triggers global logout.
    // 403 = authenticated but not permitted → surfaced as an error, NOT a logout.
    const authCode = httpStatusToErrorCode(response.status);
    if (authCode === ApiErrorCode.Auth || authCode === ApiErrorCode.Forbidden) {
      throw new Error(authCode);
    }
    let errorMsg = genericMessageForStatus(response.status);
    // On 5xx, preserve genericMessageForStatus so backend internals, tracebacks,
    // and database errors are never exposed in user-facing error messages.
    // For 4xx client errors, extract structured validation details or messages.
    if (response.status < 500) {
      if (responseData?.details && typeof responseData.details === 'object') {
        const detailEntries = Object.entries(responseData.details).filter(([, v]) => Boolean(v));
        if (detailEntries.length > 0) {
          errorMsg = detailEntries
            .map(([k, v]) => `${k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}: ${v}`)
            .join('. ');
        } else if (typeof responseData.message === 'string') {
          errorMsg = responseData.message;
        }
      } else if (typeof responseData?.message === 'string') {
        errorMsg = responseData.message;
      } else if (typeof responseData?.error === 'string') {
        errorMsg = responseData.error;
      }
    }
    throw new ApiError(errorMsg, responseData, response.status);
  }

  // Handle "200 OK" application-level errors
  if (responseData?.status === 'error') {
    let errorMsg = responseData.message || 'Application Error';
    if (responseData.details && typeof responseData.details === 'object') {
      const detailEntries = Object.entries(responseData.details).filter(([, v]) => Boolean(v));
      if (detailEntries.length > 0) {
        errorMsg = detailEntries
          .map(([k, v]) => `${k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}: ${v}`)
          .join('. ');
      }
    }
    throw new ApiError(errorMsg, responseData);
  }

  return responseData;
}
