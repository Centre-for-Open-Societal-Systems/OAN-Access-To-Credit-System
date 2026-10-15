import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { GET } from './route';

function iamToken(roles: string[]): string {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'RS256' })}.${encode({
    sub: 'kc-user-1',
    exp: Math.floor(Date.now() / 1000) + 300,
    resource_access: { 'oan-a2c': { roles } },
  })}.sig`;
}

function complete(cookies: Record<string, string>) {
  const cookie = Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
  return GET(new NextRequest('http://localhost:3000/api/auth/sso/complete', { headers: { cookie } }));
}

describe('/api/auth/sso/complete', () => {
  beforeEach(() => {
    process.env.IAM_BASE_URL = 'http://iam.internal:8020';
    process.env.IAM_LOGIN_PROVIDER_ID = '1';
    process.env.IAM_APPLICATION = 'oan-a2c';
  });

  afterEach(() => {
    delete process.env.IAM_BASE_URL;
    delete process.env.IAM_LOGIN_PROVIDER_ID;
    delete process.env.IAM_APPLICATION;
  });

  it("sends a Development Agent to their home route and drops any local session", async () => {
    const res = await complete({ 'X-Access-Token': iamToken(['A2C Development Agent']), auth_token: 'old' });

    expect(res.status).toBe(200);
    expect(await res.text()).toContain('url=/leads');
    expect(res.headers.getSetCookie().join('\n')).toMatch(/auth_token=;.*Max-Age=0/);
  });

  it('refuses a user with no role on this app', async () => {
    const res = await complete({ 'X-Access-Token': iamToken(['Registry Operator']) });

    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe('http://localhost:3000/login/development-agent?reason=sso_no_access');
  });

  it('reports a failed sign-in when IAM set no session', async () => {
    const res = await complete({});

    expect(res.headers.get('location')).toBe('http://localhost:3000/login/development-agent?reason=sso_failed');
  });

  it('reports SSO as unavailable when IAM is not configured', async () => {
    delete process.env.IAM_BASE_URL;

    const res = await complete({ 'X-Access-Token': iamToken(['A2C Development Agent']) });

    expect(res.headers.get('location')).toBe('http://localhost:3000/login/development-agent?reason=sso_unavailable');
  });
});
