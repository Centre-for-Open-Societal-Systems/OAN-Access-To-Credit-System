import { describe, expect, it } from 'vitest';
import { canAccess, isProtectedRoute, kindFromRoles, readIamRoutingSession, readRoutingSession } from './rbac';

/** Builds an unsigned JWT-shaped token. Signature is never checked here. */
function tokenWith(claims: Record<string, unknown>): string {
  const encode = (obj: unknown) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');
  return `${encode({ alg: 'HS256', kid: 'v1' })}.${encode(claims)}.signature`;
}

const inFuture = Math.floor(Date.now() / 1000) + 900;
const inPast = Math.floor(Date.now() / 1000) - 60;

describe('readRoutingSession', () => {
  it('reports an unexpired token with a known role as active', () => {
    const session = readRoutingSession(tokenWith({ user_type: 'dev_agent', exp: inFuture }));

    expect(session).toEqual({ state: 'active', kind: 'dev_agent' });
  });

  it('reports an expired token as expired but still yields the role', () => {
    // Not the same as signed out: the access token lives 15 minutes while the
    // session lives for days behind the refresh token.
    const session = readRoutingSession(tokenWith({ user_type: 'bank_admin', exp: inPast }));

    expect(session).toEqual({ state: 'expired', kind: 'bank_admin' });
  });

  it('rejects an arbitrary non-empty cookie value', () => {
    // The guard used to accept any non-empty string, so typing a cookie into
    // devtools handed you the authenticated shell.
    expect(readRoutingSession('x')).toEqual({ state: 'none', kind: null });
    expect(readRoutingSession('not.a.jwt')).toEqual({ state: 'none', kind: null });
  });

  it('rejects a token with the wrong number of segments', () => {
    expect(readRoutingSession('aaa.bbb')).toEqual({ state: 'none', kind: null });
  });

  it('rejects a well-formed token that carries no expiry', () => {
    expect(readRoutingSession(tokenWith({ user_type: 'farmer' }))).toEqual({
      state: 'none',
      kind: null,
    });
  });

  it('rejects a well-formed token whose role is not one of ours', () => {
    expect(readRoutingSession(tokenWith({ user_type: 'root', exp: inFuture }))).toEqual({
      state: 'none',
      kind: null,
    });
  });

  it('treats a missing cookie as no session', () => {
    expect(readRoutingSession(undefined)).toEqual({ state: 'none', kind: null });
  });
});

describe('isProtectedRoute', () => {
  it.each([
    '/leads',
    '/leads/LEAD-0001',
    '/dashboard',
    '/farmer-dashboard',
    '/agent-dashboard',
    '/my-applications',
    '/discover-loans',
    '/loan-products',
    '/product-approvals',
    '/kyc-compliance',
    '/loan-application-dashboard',
    '/agent-application-lists',
    '/dev-application-lists',
    '/application-lists',
    '/profile',
  ])('protects %s', (pathname) => {
    expect(isProtectedRoute(pathname)).toBe(true);
  });

  it.each(['/', '/login', '/login/bank-admin', '/create-account', '/reset-password'])(
    'leaves %s open',
    (pathname) => {
      expect(isProtectedRoute(pathname)).toBe(false);
    }
  );
});

describe('canAccess: application lists', () => {
  // The three lists render the same component against the same endpoint, and
  // the endpoint answers differently per role — a bank role sees only its own
  // bank's non-Draft applications, a Development Agent sees the pipeline across
  // banks. Each portal owns its own route, so none may wander into another's.
  it('lets a bank agent reach its own applications list', () => {
    expect(canAccess('bank_agent', '/agent-application-lists')).toBe(true);
  });

  it('keeps every other role out of the bank applications list', () => {
    expect(canAccess('dev_agent', '/agent-application-lists')).toBe(false);
    expect(canAccess('bank_admin', '/agent-application-lists')).toBe(false);
    expect(canAccess('farmer', '/agent-application-lists')).toBe(false);
    expect(canAccess('marketplace', '/agent-application-lists')).toBe(false);
  });

  it('lets a dev agent reach its own applications list', () => {
    expect(canAccess('dev_agent', '/dev-application-lists')).toBe(true);
  });

  it('keeps bank roles out of the dev agent applications list', () => {
    expect(canAccess('bank_agent', '/dev-application-lists')).toBe(false);
    expect(canAccess('bank_admin', '/dev-application-lists')).toBe(false);
    expect(canAccess('farmer', '/dev-application-lists')).toBe(false);
  });

  it('lets a bank admin reach its own applications list', () => {
    expect(canAccess('bank_admin', '/application-lists')).toBe(true);
    expect(canAccess('marketplace', '/application-lists')).toBe(true);
  });

  it('keeps non-admin roles out of the bank admin applications list', () => {
    expect(canAccess('bank_agent', '/application-lists')).toBe(false);
    expect(canAccess('dev_agent', '/application-lists')).toBe(false);
    expect(canAccess('farmer', '/application-lists')).toBe(false);
  });
});

describe('SSO (IAM) sessions', () => {
  it('maps roles to a user kind with the backend priority', () => {
    expect(kindFromRoles(['A2C Development Agent'])).toBe('dev_agent');
    expect(kindFromRoles(['A2C Development Agent', 'A2C Bank Admin'])).toBe('bank_admin');
    expect(kindFromRoles(['Registry Operator'])).toBeNull();
  });

  it('reads an expired SSO token as expired, not as signed out', () => {
    const past = Math.floor(Date.now() / 1000) - 60;

    expect(readIamRoutingSession({ roles: ['A2C Development Agent'], exp: past })).toEqual({
      state: 'expired',
      kind: 'dev_agent',
    });
    expect(readIamRoutingSession({ roles: [], exp: past })).toEqual({ state: 'none', kind: null });
  });
});
