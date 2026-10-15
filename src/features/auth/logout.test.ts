import { beforeEach, describe, expect, it, vi } from 'vitest';

// The real module talks to /api/auth/logout; what matters here is what the
// sign-out path does with the result, not the request itself.
const logoutUser = vi.fn<() => Promise<boolean>>();
// Set by a test to stand in for an SSO session, whose logout answers with the
// identity provider's logout URL.
let providerLogoutUrl: string | null = null;
vi.mock('@/features/auth/api/authApi', () => ({
  logoutUser: () => logoutUser(),
  endServerSession: async () => ({ cleared: await logoutUser(), redirectTo: providerLogoutUrl }),
}));

const assign = vi.fn();

function stubLocation(pathname: string) {
  Object.defineProperty(window, 'location', {
    configurable: true,
    writable: true,
    value: { ...window.location, pathname, assign },
  });
}

/**
 * `performGlobalLogout` holds a module-level in-flight guard, so each test needs
 * a module instance of its own rather than one shared across the file.
 */
async function loadLogoutModule() {
  vi.resetModules();
  return import('./logout');
}

beforeEach(() => {
  vi.clearAllMocks();
  logoutUser.mockResolvedValue(true);
  providerLogoutUrl = null;
  assign.mockReset();
});

describe('performGlobalLogout', () => {
  it('sends every role to the /login chooser, not to a role-specific portal', async () => {
    // The bug this covers: sign-out used to redirect to the login page matching
    // the role being left — /login/bank-admin, /login/development-agent, and `/`
    // for farmers. Whichever portal someone signed out of, they land here.
    for (const from of ['/dashboard', '/agent-dashboard', '/leads', '/farmer-dashboard']) {
      const { performGlobalLogout } = await loadLogoutModule();
      stubLocation(from);
      assign.mockReset();

      await performGlobalLogout(vi.fn());

      expect(assign).toHaveBeenCalledWith('/login');
    }
  });

  it('sends an SSO session to the identity provider to end its session there', async () => {
    const { performGlobalLogout } = await loadLogoutModule();
    stubLocation('/leads');
    providerLogoutUrl = 'https://keycloak.example.org/logout?post_logout_redirect_uri=x';

    await performGlobalLogout(vi.fn());

    expect(assign).toHaveBeenCalledWith('https://keycloak.example.org/logout?post_logout_redirect_uri=x');
  });

  it('carries the reason so the login page can explain the sign-out', async () => {
    const { performGlobalLogout } = await loadLogoutModule();
    stubLocation('/leads');

    await performGlobalLogout(vi.fn(), 'idle');

    expect(assign).toHaveBeenCalledWith('/login?reason=idle');
  });

  it('revokes the session server-side and resets the store before redirecting', async () => {
    const { performGlobalLogout } = await loadLogoutModule();
    stubLocation('/leads');
    const dispatch = vi.fn();

    await performGlobalLogout(dispatch);

    expect(logoutUser).toHaveBeenCalledTimes(1);
    const dispatched = dispatch.mock.calls.map(([action]) => (action as { type: string }).type);
    // The overlay goes up first, then state is reset — both before navigating.
    expect(dispatched).toEqual(['loading/startBlocking', 'auth/logout']);
    expect(assign).toHaveBeenCalledTimes(1);
  });

  it('still redirects when the server refuses to revoke the token', async () => {
    // Cookies are httpOnly, so a refused revoke leaves the session live server
    // side. Keeping someone in a dashboard they asked to leave is the worse
    // outcome — the full page load re-runs the middleware against real cookies.
    const { performGlobalLogout } = await loadLogoutModule();
    stubLocation('/dashboard');
    logoutUser.mockResolvedValue(false);

    await performGlobalLogout(vi.fn());

    expect(assign).toHaveBeenCalledWith('/login');
  });

  it('still redirects when the revoke request throws', async () => {
    const { performGlobalLogout } = await loadLogoutModule();
    stubLocation('/dashboard');
    logoutUser.mockRejectedValue(new Error('network down'));

    await expect(performGlobalLogout(vi.fn())).rejects.toThrow('network down');

    // The redirect is in a `finally`, so an unreachable bench can't trap someone
    // in a session they have already been signed out of locally.
    expect(assign).toHaveBeenCalledWith('/login');
  });

  it('ignores a second sign-out while the first is still in flight', async () => {
    // Reachable in practice: the idle timeout firing while a 401 is being
    // handled, or an impatient double click on the menu item.
    const { performGlobalLogout } = await loadLogoutModule();
    stubLocation('/leads');
    let release!: (value: boolean) => void;
    logoutUser.mockReturnValue(new Promise<boolean>((resolve) => { release = resolve; }));

    const first = performGlobalLogout(vi.fn());
    await performGlobalLogout(vi.fn());
    release(true);
    await first;

    expect(logoutUser).toHaveBeenCalledTimes(1);
    expect(assign).toHaveBeenCalledTimes(1);
  });
});

describe('clearSession', () => {
  it('revokes and resets without navigating', async () => {
    // Used where the person stays put — signing in through the wrong portal, or
    // finishing a forced password change.
    const { clearSession } = await loadLogoutModule();
    stubLocation('/login/farmer');
    const dispatch = vi.fn();

    const cleared = await clearSession(dispatch);

    expect(cleared).toBe(true);
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'auth/logout' }));
    expect(assign).not.toHaveBeenCalled();
  });

  it('reports a refused revoke instead of resolving as success', async () => {
    const { clearSession } = await loadLogoutModule();
    logoutUser.mockResolvedValue(false);

    await expect(clearSession(vi.fn())).resolves.toBe(false);
  });
});
