const BASE_URL = process.env.API_BASE_URL ?? '';

interface LoginCredentials {
  usr: string;
  pwd: string;
}

export async function loginUser({ usr, pwd }: LoginCredentials): Promise<any> {
  const res = await fetch(`/api/auth/login`, {
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

  let userPayload = data.user || data;
  
  // Frappe often nests data deeply, e.g., { message: { user: { full_name: ... } } }
  if (userPayload?.message?.user) {
    userPayload = userPayload.message.user;
  } else if (userPayload?.message && typeof userPayload.message === 'object') {
    userPayload = userPayload.message;
  } else if (userPayload?.user) {
    userPayload = userPayload.user;
  }

  return userPayload;
}
