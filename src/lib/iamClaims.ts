// Reads the claims of an access token issued through the OpenG2P IAM service
// (a Keycloak token today). A plain base64url decode, NOT a signature check:
// these values are used for routing only. oan_auth_service verifies every API
// call by asking IAM.
//
// Roles sit per client under `resource_access`. `application` picks the client
// whose roles count — the same list oan_auth_service syncs onto the local user
// — so routing here and authorization in the backend agree.

export interface IamClaims {
  /** The email (or username) when the token carries one, else IAM's opaque `sub`. Display only. */
  sub: string;
  roles: string[];
  /** Epoch seconds. */
  exp: number;
}

// `atob`/`TextDecoder`, not `Buffer`: this also runs in the Edge runtime (the
// routing middleware), where `Buffer` does not exist.
function base64UrlDecode(segment: string): string {
  const padded = segment
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(segment.length / 4) * 4, '=');
  const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
  return new TextDecoder('utf-8').decode(bytes);
}

/** Returns the claims, or null if the token is malformed. Does not check expiry. */
export function decodeIamAccessToken(token: string, application: string): IamClaims | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(parts[1]!)) as Record<string, unknown>;
    if (typeof payload.sub !== 'string' || typeof payload.exp !== 'number') return null;

    const resourceAccess = payload.resource_access as Record<string, { roles?: unknown }> | undefined;
    const roles = resourceAccess?.[application]?.roles;
    const display = [payload.email, payload.preferred_username].find((v): v is string => typeof v === 'string');

    return {
      sub: display ?? payload.sub,
      roles: Array.isArray(roles) ? roles.filter((r): r is string => typeof r === 'string') : [],
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

export function isIamTokenExpired(claims: IamClaims, skewSeconds = 5): boolean {
  return claims.exp <= Date.now() / 1000 + skewSeconds;
}
