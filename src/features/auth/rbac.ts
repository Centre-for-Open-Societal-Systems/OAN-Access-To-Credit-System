// Single source of truth for frontend role-based routing.
//
// IMPORTANT: This is routing/UX, NOT authorization. The security boundary is the
// backend, which verifies the signed JWT and authorizes every API call per role.
// Here we only decide which portal/route a given user_type is allowed to *see*,
// so wrong-portal logins and URL-hacking land users where they belong instead of
// in a broken shell. A forged/unsigned token can bypass this, but every API call
// it makes is still rejected by the backend.

export type UserKind = 'bank_admin' | 'bank_agent' | 'dev_agent' | 'marketplace' | 'farmer';

// Where each role goes after login / when bounced from a disallowed route.
const HOME_ROUTE: Record<UserKind, string> = {
  bank_admin: '/dashboard',
  bank_agent: '/agent-dashboard',
  dev_agent: '/leads',
  marketplace: '/dashboard',
  farmer: '/farmer-dashboard',
};

export function homeRouteFor(kind: UserKind): string {
  return HOME_ROUTE[kind];
}

/**
 * The one place a signed-out person lands, whatever role they held.
 *
 * There are per-role sign-in pages (`/login/farmer`, `/login/bank-admin`, …) and
 * sign-out used to return people to the one matching the role they just left.
 * That was wrong in both directions: someone who signs out on a shared machine
 * is shown, and leaves behind, the portal for a role that is no longer theirs to
 * pick — and someone whose session expired mid-task lands on a page that assumes
 * they know which of five portals they belong to. `/login` is the role chooser,
 * so it is the only correct destination for *leaving* a session. The per-role
 * pages remain reachable, as deep links from the chooser.
 */
export const LOGIN_ROUTE = '/login';

/** Why a session ended, surfaced on the login page so the sign-out is explained. */
export type LogoutReason = 'idle' | 'session';

/** `/login`, carrying the reason the previous session ended when there is one. */
export function loginRouteFor(reason?: LogoutReason): string {
  return reason ? `${LOGIN_ROUTE}?reason=${reason}` : LOGIN_ROUTE;
}

// Route prefix -> roles allowed to access it.
//
// Ordering matters: the guard picks the FIRST prefix that matches, so more
// specific prefixes (e.g. /agent-loan-products) must precede shorter ones that
// would also match. Keys are matched with startsWith against the pathname.
//
// bank_agent is treated as a restricted bank_admin: it may reach the shared
// loan-product views and its own agent-* routes, but not admin-only areas
// (product approvals, KYC compliance, the admin dashboard).
const ROUTE_ACCESS: ReadonlyArray<readonly [string, ReadonlyArray<UserKind>]> = [
  // --- Bank agent (restricted admin) ---
  ['/agent-dashboard', ['bank_agent']],
  ['/agent-loan-products', ['bank_agent']],
  ['/agent-application-lists', ['bank_agent']],

  // --- Bank admin (+ marketplace share the admin surface) ---
  ['/dashboard', ['bank_admin', 'marketplace']],
  ['/loan-products', ['bank_admin', 'marketplace', 'bank_agent']],
  ['/application-lists', ['bank_admin', 'marketplace']],
  ['/product-approvals', ['bank_admin', 'marketplace']],
  ['/kyc-compliance', ['bank_admin', 'marketplace']],

  // --- Dev agent (field/back-office loan pipeline) ---
  ['/leads', ['dev_agent']],
  ['/loan-application-dashboard', ['dev_agent']],
  ['/dev-application-lists', ['dev_agent']],
  ['/update-loan-application-status', ['dev_agent']],
  ['/loans', ['dev_agent']],

  // Dev agent only, matching the backend: `list_catalog` and
  // `get_catalog_facets` are @require_role([FARMER_ROLE, DEVELOPMENT_AGENT_ROLE]).
  // bank_agent used to be listed here and the agent nav linked to it, so the page
  // opened and then 403'd on every request. Farmers browse the same catalog at
  // /discover-loans; bank agents see their own bank's at /agent-loan-products.
  ['/loan-discovery', ['dev_agent']],

  // --- Farmer (marketplace applicant) ---
  ['/farmer-dashboard', ['farmer']],
  ['/discover-loans', ['farmer']],
  ['/my-applications', ['farmer']],
];

// Returns true if `kind` may access `pathname`. Paths with no policy entry are
// treated as unguarded (shared/neutral routes) and allowed.
export function canAccess(kind: UserKind, pathname: string): boolean {
  const match = ROUTE_ACCESS.find(([prefix]) => pathname.startsWith(prefix));
  if (!match) return true;
  return match[1].includes(kind);
}

// Routes that require a session but belong to no single role — every signed-in
// kind may reach them. Kept separate from ROUTE_ACCESS, which answers "which
// roles?", because the answer here is "any, as long as they are signed in".
const SHARED_AUTHENTICATED_PREFIXES: ReadonlyArray<string> = ['/profile'];

// True when `pathname` requires a session.
//
// Derived from the policy above rather than restated as its own list. The guard
// previously hardcoded four prefixes, which meant /dashboard, /farmer-dashboard,
// /agent-dashboard, /my-applications, /discover-loans, /loan-products,
// /product-approvals and /kyc-compliance rendered their shell to anonymous
// visitors — every new route was opt-in to being protected, and easy to forget.
// Now a route is protected the moment it appears in the access policy.
export function isProtectedRoute(pathname: string): boolean {
  return (
    ROUTE_ACCESS.some(([prefix]) => pathname.startsWith(prefix)) ||
    SHARED_AUTHENTICATED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

// Decodes (does NOT verify) the JWT payload segment. Verification is
// intentionally omitted: the frontend has no signing secret/JWKS, and these
// values are used only for routing. The backend verifies the signature.
function decodeJwtClaims(token: string): { user_type?: string; exp?: number } | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    // base64url -> base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json =
      typeof atob === 'function'
        ? atob(base64)
        : Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(json) as { user_type?: string; exp?: number };
  } catch {
    return null;
  }
}

// Narrows the raw user_type claim to a known UserKind (or null).
function toUserKind(userType: string | undefined): UserKind | null {
  if (
    userType === 'bank_admin' ||
    userType === 'bank_agent' ||
    userType === 'dev_agent' ||
    userType === 'marketplace' ||
    userType === 'farmer'
  ) {
    return userType;
  }
  return null;
}

/**
 * What the access-token cookie says about the session, for routing purposes.
 *
 *  - `none`    — no cookie, or its contents are not a usable JWT. Not signed in.
 *  - `active`  — decodes, carries the claims we need, and has not expired.
 *  - `expired` — decodes, but `exp` has passed. NOT the same as signed out: the
 *                access token lives 15 minutes while the session lives for days
 *                behind the refresh token, so this is the normal steady state
 *                between refreshes.
 */
export type SessionState = 'none' | 'active' | 'expired';

export interface RoutingSession {
  state: SessionState;
  /** The role, when one could be read. Available for `expired` too. */
  kind: UserKind | null;
}

const NO_SESSION: RoutingSession = { state: 'none', kind: null };

/**
 * Reads the session signal from the access-token cookie.
 *
 * This is routing/UX, NOT authorization — the signature is not verified here
 * (the frontend holds no signing secret) and the backend re-verifies every API
 * call regardless. What it does buy is that an arbitrary non-empty cookie value
 * no longer counts as a session: the guard used to accept `auth_token=x`, so
 * anyone could hand themselves the authenticated shell of any role by typing a
 * cookie into devtools. A structurally invalid or claim-less token now reads as
 * `none`, and expiry is surfaced instead of ignored.
 */
export function readRoutingSession(token: string | undefined): RoutingSession {
  if (!token) return NO_SESSION;

  // A JWT is exactly three dot-separated segments. Checking first keeps a
  // stray cookie value from being probed as base64.
  if (token.split('.').length !== 3) return NO_SESSION;

  const claims = decodeJwtClaims(token);
  if (!claims) return NO_SESSION;

  const kind = toUserKind(claims.user_type);

  // Tokens this app issues always carry both claims. Missing either means the
  // value did not come from our backend, whatever else it may decode to.
  if (!kind || typeof claims.exp !== 'number') return NO_SESSION;

  const isExpired = claims.exp * 1000 <= Date.now();
  return { state: isExpired ? 'expired' : 'active', kind };
}

// Frappe role names, as the backend's `_classify_user_type` (oan_a2c/api/auth.py)
// reads them. Same priority order: the bank-scoped roles first.
const ROLE_KINDS: ReadonlyArray<readonly [string, UserKind]> = [
  ['A2C Bank Admin', 'bank_admin'],
  ['A2C Bank Agent', 'bank_agent'],
  ['A2C Development Agent', 'dev_agent'],
  ['A2C Administrator', 'marketplace'],
  ['A2C Farmer', 'farmer'],
];

/**
 * The user kind for a role list. For SSO (IAM) sessions only: their tokens are
 * issued by the identity provider and carry roles, not our `user_type` claim.
 * Returns null when no role belongs to this app.
 */
export function kindFromRoles(roles: ReadonlyArray<string>): UserKind | null {
  return ROLE_KINDS.find(([role]) => roles.includes(role))?.[1] ?? null;
}

/**
 * `readRoutingSession` for an SSO session. `canRenew` is whether IAM can still
 * hand out a fresh token (both its cookies are present): an expired token then
 * counts as the normal state between renewals, exactly like a local session
 * with a refresh token.
 */
export function readIamRoutingSession(
  claims: { roles: string[]; exp: number } | null,
): RoutingSession {
  if (!claims) return NO_SESSION;
  const kind = kindFromRoles(claims.roles);
  if (!kind) return NO_SESSION;
  return { state: claims.exp * 1000 <= Date.now() ? 'expired' : 'active', kind };
}

// Reads the user_type claim for routing, REGARDLESS of token expiry.
//
// The access token's 15-min `exp` governs API-call validity, not login state —
// the session stays alive via the refresh token for days. For routing (e.g.
// bouncing a signed-in visitor off /login) we only need the role, and an expired
// JWT is still parseable. This must never be used for authorization.
export function readUserKindForRouting(token: string): UserKind | null {
  return readRoutingSession(token).kind;
}
