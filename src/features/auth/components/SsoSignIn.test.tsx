import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SsoSignIn } from './SsoSignIn';

const assign = vi.fn();

// Outside Next there is no router context: the query each test wants is set here.
let search = '';
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(search),
}));

describe('SsoSignIn after an SSO sign-in with no access here', () => {
  beforeEach(() => {
    search = '?reason=sso_no_access';
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: { ...window.location, assign },
    });
    assign.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("ends the SSO session and follows the identity provider's logout URL", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, redirectTo: 'https://keycloak.example.org/logout' }))
    );
    global.fetch = fetchMock;
    render(<SsoSignIn subtitle="x" />);

    fireEvent.click(await screen.findByRole('button', { name: 'Sign out and use a different account' }));

    await vi.waitFor(() => expect(assign).toHaveBeenCalledWith('https://keycloak.example.org/logout'));
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/logout',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ returnTo: '/login/development-agent' }) })
    );
  });

  it('says so when the provider session could not be ended', async () => {
    global.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, redirectTo: null })));
    render(<SsoSignIn subtitle="x" />);

    fireEvent.click(await screen.findByRole('button', { name: 'Sign out and use a different account' }));

    expect(await screen.findByText(/Could not sign you out of the SSO account/)).toBeInTheDocument();
    expect(assign).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Sign out and use a different account' })).not.toBeInTheDocument();
  });

  it('does not offer it for other SSO failures', () => {
    search = '?reason=sso_failed';
    render(<SsoSignIn subtitle="x" />);

    expect(screen.queryByRole('button', { name: 'Sign out and use a different account' })).not.toBeInTheDocument();
  });
});
