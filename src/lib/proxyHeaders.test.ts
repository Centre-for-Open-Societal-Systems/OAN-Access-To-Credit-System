import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  buildClientResponse,
  buildUpstreamHeaders,
  rewriteLocation,
  sanitizeResponseHeaders,
} from './proxyHeaders';

const BACKEND = 'http://127.0.0.1:8000';
const previousApiBaseUrl = process.env.API_BASE_URL;

beforeAll(() => {
  process.env.API_BASE_URL = BACKEND;
});

afterAll(() => {
  process.env.API_BASE_URL = previousApiBaseUrl;
});

const redirectResponse = (location: string, status = 302) =>
  new Response(null, { status, headers: { location } });

const jsonResponse = (body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status: 500,
    headers: { 'content-type': 'application/json', ...headers },
  });

describe('buildUpstreamHeaders', () => {
  it('overwrites a caller-supplied X-Forwarded-For with the trusted value', () => {
    // Frappe reads the leftmost entry into frappe.local.request_ip, which keys
    // its rate limit and login-attempt tracker — relaying this verbatim handed
    // the caller control of its own identity.
    const request = new Request('https://a2c.example.com/api/proxy/api/method/x', {
      headers: { 'x-forwarded-for': '1.1.1.1, 203.0.113.9' },
    });

    expect(buildUpstreamHeaders(request).get('x-forwarded-for')).toBe('203.0.113.9');
  });

  it('drops headers outside the allowlist', () => {
    const request = new Request('https://a2c.example.com/api/proxy/api/method/x', {
      headers: {
        cookie: 'auth_token=secret',
        'x-real-ip': '1.1.1.1',
        authorization: 'Bearer attacker-supplied',
        'x-frappe-cmd': 'frappe.desk.doctype',
        accept: 'application/json',
      },
    });

    const headers = buildUpstreamHeaders(request);

    expect(headers.get('cookie')).toBeNull();
    expect(headers.get('x-frappe-cmd')).toBeNull();
    expect(headers.get('accept')).toBe('application/json');
  });

  it('injects the Authorization header from the server-held token, not the caller', () => {
    const request = new Request('https://a2c.example.com/api/proxy/api/method/x', {
      headers: { authorization: 'Bearer attacker-supplied' },
    });

    expect(buildUpstreamHeaders(request, 'real-jwt').get('authorization')).toBe('Bearer real-jwt');
  });

  it('forwards the range headers a resumable download depends on', () => {
    // accept-ranges/content-range were already relayed back, so dropping these
    // advertised resumable downloads and then ignored the request to resume.
    const request = new Request('https://a2c.example.com/api/files/loan.pdf', {
      headers: {
        range: 'bytes=200-1023',
        'if-range': '"etag-abc"',
      },
    });

    const headers = buildUpstreamHeaders(request);

    expect(headers.get('range')).toBe('bytes=200-1023');
    expect(headers.get('if-range')).toBe('"etag-abc"');
  });

  it('forwards the conditional headers that make a relayed ETag useful', () => {
    const request = new Request('https://a2c.example.com/api/files/loan.pdf', {
      headers: {
        'if-none-match': '"etag-abc"',
        'if-modified-since': 'Wed, 21 Oct 2026 07:28:00 GMT',
      },
    });

    const headers = buildUpstreamHeaders(request);

    expect(headers.get('if-none-match')).toBe('"etag-abc"');
    expect(headers.get('if-modified-since')).toBe('Wed, 21 Oct 2026 07:28:00 GMT');
  });
});

describe('sanitizeResponseHeaders', () => {
  it('drops Set-Cookie so the backend cannot shadow the session cookies', () => {
    const source = new Headers({
      'set-cookie': 'sid=abc; Path=/',
      'content-type': 'application/json',
    });

    const headers = sanitizeResponseHeaders(source);

    expect(headers.get('set-cookie')).toBeNull();
    expect(headers.get('content-type')).toBe('application/json');
  });

  it('drops tech-disclosure headers', () => {
    const source = new Headers({
      server: 'Werkzeug/3.0.1 Python/3.11',
      'x-powered-by': 'Frappe',
      'x-frappe-request-id': 'abc',
    });

    const headers = sanitizeResponseHeaders(source);

    expect([...headers.keys()]).toEqual([]);
  });

  it('keeps the headers a download depends on', () => {
    const source = new Headers({
      'content-disposition': 'attachment; filename="loan.pdf"',
      'content-range': 'bytes 0-99/100',
      'accept-ranges': 'bytes',
    });

    const headers = sanitizeResponseHeaders(source);

    expect(headers.get('content-disposition')).toBe('attachment; filename="loan.pdf"');
    expect(headers.get('content-range')).toBe('bytes 0-99/100');
    expect(headers.get('accept-ranges')).toBe('bytes');
  });
});

describe('buildClientResponse', () => {
  it('strips Frappe debug fields from a JSON error body', async () => {
    const response = jsonResponse({
      exc_type: 'ValidationError',
      exc: 'Traceback (most recent call last): File "/home/frappe/apps/oan_a2c/...", line 212',
      _server_messages: '[{"message": "SELECT * FROM `tabA2C Lead`"}]',
      message: { status: 'error', message: 'Could not save the lead.' },
    });

    const { body } = await buildClientResponse(response, 'https://bench/api/method/x');
    const parsed = JSON.parse(String(body));

    expect(parsed._server_messages).toBeUndefined();
    expect(parsed.exc).toBeUndefined();
    // Kept on purpose: a bare class name with no path or query in it, which the
    // app branches on for legitimate UX (DoesNotExistError -> "not found").
    expect(parsed.exc_type).toBe('ValidationError');
    expect(parsed.message.message).toBe('Could not save the lead.');
  });

  it('leaves a clean payload byte-identical', async () => {
    const payload = { message: { status: 'success', data: { name: 'LEAD-0001' } } };

    const { body } = await buildClientResponse(jsonResponse(payload), 'https://bench/x');

    expect(body).toBe(JSON.stringify(payload));
  });

  it('replaces an unparseable body that claims to be JSON', async () => {
    // An HTML error page served with a JSON content type is exactly where a
    // stack trace shows up.
    const response = new Response('<html><body>Traceback: /home/frappe/apps/...</body></html>', {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });

    const { body } = await buildClientResponse(response, 'https://bench/x');

    expect(String(body)).not.toContain('/home/frappe');
    expect(JSON.parse(String(body)).message).toBe('The server returned an unexpected response.');
  });

  it('streams a non-JSON body through without buffering it', async () => {
    const response = new Response('binary-pdf-bytes', {
      status: 200,
      headers: { 'content-type': 'application/pdf' },
    });

    const { body, init } = await buildClientResponse(response, 'https://bench/files/x.pdf');

    expect(body).toBe(response.body);
    expect(new Headers(init.headers).get('content-type')).toBe('application/pdf');
  });

  it('preserves the upstream status', async () => {
    const { init } = await buildClientResponse(jsonResponse({ message: 'nope' }), 'https://bench/x');

    expect(init.status).toBe(500);
  });

  it('returns a clean 2xx payload without re-serializing it', async () => {
    const payload = { message: { status: 'success', data: { name: 'LEAD-0001' } } };
    const response = new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });

    const { body } = await buildClientResponse(response, 'https://bench/x');

    expect(body).toBe(JSON.stringify(payload));
  });

  it('still strips debug fields from a 2xx that carries them', async () => {
    // The fast path is a substring pre-check, not a status check — a 200 with
    // _server_messages on it is parsed and sanitized like any other.
    const response = new Response(
      JSON.stringify({ _server_messages: '["SELECT * FROM `tabA2C Lead`"]', message: 'ok' }),
      { status: 200, headers: { 'content-type': 'application/json' } }
    );

    const { body } = await buildClientResponse(response, 'https://bench/x');

    expect(JSON.parse(String(body))._server_messages).toBeUndefined();
    expect(JSON.parse(String(body)).message).toBe('ok');
  });

  it('keeps replacing an unparseable error body even though it has no debug field in it', async () => {
    // The fast path must not swallow this case: an HTML stack-trace page served
    // with a JSON content type contains none of the debug field names, so a
    // substring scan alone would have relayed it verbatim.
    const response = new Response('<html><body>Traceback: /home/frappe/apps/...</body></html>', {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });

    const { body } = await buildClientResponse(response, 'https://bench/x');

    expect(String(body)).not.toContain('/home/frappe');
  });

  it('relays a 3xx with a Location the browser can follow', async () => {
    // Regression: /api/proxy uses `redirect: 'manual'`, so the 3xx arrives here
    // intact. The response allowlist alone dropped Location and the browser was
    // left with a redirect and no destination.
    const response = redirectResponse(`${BACKEND}/v1/leads/L-1`);

    const { init } = await buildClientResponse(response, `${BACKEND}/v1/leads`, {
      proxyPrefix: '/api/proxy',
    });

    expect(init.status).toBe(302);
    expect(new Headers(init.headers).get('location')).toBe(
      '/api/proxy/v1/leads/L-1'
    );
  });

  it('drops a Location pointing off the backend origin rather than relaying an open redirect', async () => {
    const response = redirectResponse('https://attacker.example.com/phish');

    const { init } = await buildClientResponse(response, `${BACKEND}/api/method/x`, {
      proxyPrefix: '/api/proxy',
    });

    expect(new Headers(init.headers).get('location')).toBeNull();
  });

  it('drops a Location when the route follows redirects upstream and passes no prefix', async () => {
    const response = redirectResponse(`${BACKEND}/files/loan.pdf`);

    const { init } = await buildClientResponse(response, `${BACKEND}/files/loan.pdf`);

    expect(new Headers(init.headers).get('location')).toBeNull();
  });
});

describe('rewriteLocation', () => {
  it('rewrites an absolute backend URL onto the proxy prefix', () => {
    expect(rewriteLocation(`${BACKEND}/api/method/x?a=1`, '/api/proxy')).toBe(
      '/api/proxy/api/method/x?a=1'
    );
  });

  it('resolves a relative Location against the backend origin', () => {
    expect(rewriteLocation('/api/method/x', '/api/proxy')).toBe('/api/proxy/api/method/x');
  });

  it('never leaks the backend hostname to the browser', () => {
    const rewritten = rewriteLocation(`${BACKEND}/api/method/x`, '/api/proxy');

    expect(rewritten).not.toContain('127.0.0.1');
    expect(rewritten?.startsWith('/api/proxy/')).toBe(true);
  });

  it('refuses a cross-origin redirect', () => {
    expect(rewriteLocation('https://attacker.example.com/phish', '/api/proxy')).toBeNull();
  });

  it('refuses a protocol-relative URL that would escape the origin', () => {
    // `//attacker.example.com/x` resolves to https://attacker.example.com/x —
    // the classic open-redirect payload that looks like a path.
    expect(rewriteLocation('//attacker.example.com/x', '/api/proxy')).toBeNull();
  });
});
