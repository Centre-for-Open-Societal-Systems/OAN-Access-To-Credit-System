import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from './route';

function iamToken(expOffsetSeconds: number, roles = ['A2C Development Agent']): string {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'RS256' })}.${encode({
    sub: 'kc-user-1',
    exp: Math.floor(Date.now() / 1000) + expOffsetSeconds,
    resource_access: { 'oan-a2c': { roles } },
  })}.sig`;
}

function get(cookies: Record<string, string>) {
  const cookie = Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
  return GET(new NextRequest('http://localhost:3000/api/proxy/v1/leads', { headers: { cookie } }), {
    params: Promise.resolve({ path: ['v1', 'leads'] }),
  });
}

const fetchMock = vi.fn();

describe('/api/proxy with an SSO (IAM) session', () => {
  beforeEach(() => {
    process.env.API_BASE_URL = 'http://api.internal';
    process.env.IAM_BASE_URL = 'http://iam.internal:8020';
    process.env.IAM_LOGIN_PROVIDER_ID = '1';
    process.env.IAM_APPLICATION = 'oan-a2c';
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    delete process.env.API_BASE_URL;
    delete process.env.IAM_BASE_URL;
    delete process.env.IAM_LOGIN_PROVIDER_ID;
    delete process.env.IAM_APPLICATION;
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it("sends IAM's access token to the backend as a Bearer token", async () => {
    const token = iamToken(300);
    fetchMock.mockResolvedValue(new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } }));

    const res = await get({ 'X-Access-Token': token, 'X-Session-Id': 'sid' });

    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]![0]).toBe('http://api.internal/v1/leads');
    expect(new Headers(fetchMock.mock.calls[0]![1].headers).get('authorization')).toBe(`Bearer ${token}`);
  });

  it('renews an expired token through IAM before calling the backend, and relays the new cookie', async () => {
    const expired = iamToken(-60);
    const fresh = iamToken(300);
    fetchMock
      .mockResolvedValueOnce(
        new Response('{}', { status: 200, headers: { 'set-cookie': `X-Access-Token=${fresh}; Path=/; Max-Age=2100` } })
      )
      .mockResolvedValueOnce(new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } }));

    const res = await get({ 'X-Access-Token': expired, 'X-Session-Id': 'sid' });

    expect(fetchMock.mock.calls[0]![0]).toBe('http://iam.internal:8020/auth/get_user_profile');
    expect(new Headers(fetchMock.mock.calls[1]![1].headers).get('authorization')).toBe(`Bearer ${fresh}`);
    expect(res.headers.getSetCookie().join('\n')).toContain(`X-Access-Token=${fresh}`);
  });

  it('ignores an IAM session that holds no role of this app', async () => {
    fetchMock.mockResolvedValue(new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } }));

    await get({ 'X-Access-Token': iamToken(300, ['Registry Operator']), 'X-Session-Id': 'sid' });

    expect(new Headers(fetchMock.mock.calls[0]![1].headers).get('authorization')).toBeNull();
  });

  it('prefers a local session over an IAM session', async () => {
    fetchMock.mockResolvedValue(new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } }));

    await get({
      auth_token: 'local.jwt.token',
      session_activity: '1',
      'X-Access-Token': iamToken(300),
      'X-Session-Id': 'sid',
    });

    expect(new Headers(fetchMock.mock.calls[0]![1].headers).get('authorization')).toBe('Bearer local.jwt.token');
  });
});
