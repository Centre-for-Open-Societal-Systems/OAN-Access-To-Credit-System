// In development Vite proxies /api → https://a2c-backend-development.oanstaging.com
// In production point this to the real origin.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

/**
 * Authenticate a user against the Frappe backend.
 * Uses session-cookie auth — the browser handles the cookie automatically.
 *
 * @param {{ usr: string, pwd: string }} credentials
 * @returns {Promise<{ message: string, home_page: string, full_name: string }>}
 */
export async function loginUser({ usr, pwd }) {
  const res = await fetch(`${BASE_URL}/api/method/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ usr, pwd }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Invalid credentials. Please try again.');
  }

  return data;
}
