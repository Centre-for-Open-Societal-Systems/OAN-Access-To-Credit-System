const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

interface LoginCredentials {
  usr: string;
  pwd: string;
}

export async function loginUser({ usr, pwd }: LoginCredentials): Promise<any> {
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
