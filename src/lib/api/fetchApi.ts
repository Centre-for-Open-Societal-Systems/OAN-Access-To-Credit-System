const BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

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
    if (response.status === 401 || response.status === 403) {
      throw new Error('UNAUTHORIZED');
    }
    let errorMsg = `API Request failed with status ${response.status}`;
    if (responseData?.message?.message) {
      errorMsg = responseData.message.message;
    } else if (responseData?.message) {
      errorMsg = typeof responseData.message === 'string' ? responseData.message : JSON.stringify(responseData.message);
    }
    const err = new Error(errorMsg);
    (err as any).responseData = responseData;
    throw err;
  }

  // Handle Frappe's "200 OK" application-level errors
  if (responseData?.message?.status === 'error') {
    const err = new Error(responseData.message.message || 'Application Error');
    (err as any).responseData = responseData;
    throw err;
  }

  return responseData?.message ?? responseData;
}
