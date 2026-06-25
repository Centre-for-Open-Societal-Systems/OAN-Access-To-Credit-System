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

export async function fetchApi(path: string, options: RequestInit = {}) {
  const url = new URL(`/api/proxy/api/method/${path}`, BASE_URL);
  
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url.toString(), {
    ...options,
    headers,
  });

  let responseData;
  try {
    responseData = await response.json();
  } catch (e) {
    if (!response.ok) throw new Error(`API Request failed with status ${response.status}`);
    return null;
  }

  if (!response.ok) {
    // 401 = unauthenticated (expired/invalid session) → triggers global logout.
    // 403 = authenticated but not permitted → surfaced as an error, NOT a logout.
    const authCode = httpStatusToErrorCode(response.status);
    if (authCode === ApiErrorCode.Auth || authCode === ApiErrorCode.Forbidden) {
      throw new Error(authCode);
    }
    // 5xx still throws an ApiError carrying the parsed server message (callers may
    // surface it in a toast); classifyError(error) recognizes it via .status.
    let errorMsg = `API Request failed with status ${response.status}`;
    if (responseData?._server_messages) {
      try {
        const msgs = JSON.parse(responseData._server_messages);
        if (Array.isArray(msgs) && msgs.length > 0) {
          const firstMsg = typeof msgs[0] === 'string' ? JSON.parse(msgs[0]) : msgs[0];
          if (firstMsg?.message) {
            errorMsg = firstMsg.message;
          }
        }
      } catch (e) {
        // ignore
      }
    } else if (responseData?.message?.message) {
      errorMsg = responseData.message.message;
    } else if (responseData?.message) {
      errorMsg = typeof responseData.message === 'string' ? responseData.message : JSON.stringify(responseData.message);
    }
    throw new ApiError(errorMsg, responseData, response.status);
  }

  // Handle Frappe's "200 OK" application-level errors
  if (responseData?.message?.status === 'error') {
    throw new ApiError(responseData.message.message || 'Application Error', responseData);
  }

  return responseData?.message ?? responseData;
}
