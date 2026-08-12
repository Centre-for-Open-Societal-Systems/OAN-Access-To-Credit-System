
import { rawUserResponseSchema, validateResponse, type RawUserResponse } from '@/lib/api/api.schemas';
import { fetchApi } from '@/lib/api/fetchApi';

// `RawUserResponse` is the validated `get_me` shape; its single source of truth
// is the Zod schema in `@/lib/api/api.schemas`.
export type { RawUserResponse };

export interface LoginApiResponse {
  success?: boolean;
  message?: string;
  user?: RawUserResponse;
}

interface LoginCredentials {
  usr: string;
  pwd: string;
  rememberMe?: boolean | undefined;
}

export async function loginUser({ usr, pwd, rememberMe }: LoginCredentials): Promise<RawUserResponse> {
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

  if (!res.ok) {
    throw new Error(data.message || 'Invalid credentials. Please try again.');
  }

  if (!data.user) {
    throw new Error('Malformed API response: message.user is missing');
  }

  return data.user;
}

// Clears the server-side session cookies. Best-effort — callers should still
// reset client auth state (dispatch(logout())) regardless of the outcome.
export async function logoutUser(): Promise<void> {
  await fetch(`/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  }).catch(() => {
    // Swallow network errors: the client-side reset is what matters here.
  });
}

export async function getMe(): Promise<RawUserResponse> {
  const data = await fetchApi('oan_a2c.api.auth.get_me', {
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
  const res = await fetchApi('oan_a2c.api.auth.get_user_profile', {
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
  const res = await fetchApi('oan_a2c.api.auth.update_profile', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const data = res.data as UserProfileResponse;
  if (data?.personal_information?.user_image) {
    data.personal_information.user_image = normalizeFileUrl(data.personal_information.user_image);
  }
  return data;
}

export async function forgotPassword(email: string): Promise<void> {
  await fetchApi('oan_a2c.api.auth.forgot_password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(email: string, key: string, new_password: string): Promise<void> {
  await fetchApi('oan_a2c.api.auth.reset_password', {
    method: 'POST',
    body: JSON.stringify({ email, key, new_password }),
  });
}

export async function changePassword(current_password: string, new_password: string): Promise<void> {
  await fetchApi('oan_a2c.api.auth.change_password', {
    method: 'POST',
    body: JSON.stringify({ current_password, new_password }),
  });
}
