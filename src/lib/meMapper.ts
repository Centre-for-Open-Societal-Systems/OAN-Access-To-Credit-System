// Maps the `GET /v1/auth/me` payload (served by oan_auth_service) onto the flat
// shape the rest of the app was written against: identity at the top level, and
// the a2c-specific user type and bank binding lifted out of `profiles.a2c`.
//
// Shared by the login route (server) and `getMe` (browser), so it must stay free
// of browser-only and server-only imports.

interface MePayload {
  user?: string;
  full_name?: string | null;
  login_email?: string | null;
  roles?: string[];
  profiles?: {
    a2c?: {
      user_type?: string | null;
      bank?: string | null;
      bank_id?: string | null;
      bank_code?: string | null;
      bank_name?: string | null;
      bank_status?: string | null;
    };
  };
}

export function flattenMe(me: MePayload | null | undefined): Record<string, unknown> | null {
  if (!me || !me.user) return null;

  const a2c = me.profiles?.a2c ?? {};

  return {
    // Accounts made by an admin keep their email as the user id; self-registered
    // ones have a synthetic id and carry the real address as `login_email`.
    email: me.login_email ?? me.user,
    full_name: me.full_name ?? '',
    roles: me.roles ?? [],
    user_type: a2c.user_type ?? null,
    bank: a2c.bank ?? null,
    bank_id: a2c.bank_id ?? null,
    bank_code: a2c.bank_code ?? null,
    bank_name: a2c.bank_name ?? null,
    bank_status: a2c.bank_status ?? null,
  };
}
