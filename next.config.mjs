import { PHASE_PRODUCTION_BUILD } from 'next/constants.js';

export default function config(phase) {
  const API_BASE_URL = process.env.API_BASE_URL;

  // During `next build` the URL isn't required — it's injected at runtime via
  // docker-compose. src/lib/env.ts validates it on server startup.
  // For dev and server start, fail fast if it's missing or malformed.
  if (phase !== PHASE_PRODUCTION_BUILD) {
    if (!API_BASE_URL) {
      throw new Error('[next.config] Missing required environment variable: API_BASE_URL');
    }
    try {
      new URL(API_BASE_URL);
    } catch {
      throw new Error(`[next.config] API_BASE_URL is not a valid URL: "${API_BASE_URL}"`);
    }
  }

  return {
    reactStrictMode: true,

    // Next 16.3 appends a managed block to AGENTS.md (and creates CLAUDE.md) on
    // `next dev` when it detects an AI coding agent, pointing at the
    // version-matched docs in node_modules/next/dist/docs/. Disabled here: this
    // repo's AGENTS.md is hand-written and reviewed, and a file that rewrites
    // itself on every `pnpm dev` shows up as an uncommitted change for whoever
    // happens to run the dev server next.
    agentRules: false,

    typescript: {
      ignoreBuildErrors: false,
    },

    allowedDevOrigins: ['192.168.3.1'],

    sassOptions: {
      includePaths: ['./src/assets/styles'],
      silenceDeprecations: ['import'],
    },
    turbopack: {
      root: process.cwd(),
    },

    // NOTE: there is deliberately no `rewrites()` fallback here.
    //
    // A `/api/:path*` -> `${API_BASE_URL}/api/:path*` fallback used to catch
    // every /api/ path with no explicit route handler and hand it straight to
    // the bench. Anything reaching the backend that way skipped all three of the
    // protections the BFF exists to apply: no Authorization header injected from
    // the httpOnly cookie, no CSRF origin check on mutating verbs, and no header
    // or body sanitization in either direction. It was a way around the proxy
    // that happened to be reachable from the browser.
    //
    // All backend traffic now goes through an explicit handler
    // (src/app/api/proxy, src/app/api/files, src/app/api/auth); an unmatched
    // /api/ path 404s, which is the correct answer.

    async headers() {
      // Note: Content-Security-Policy is set per-request in `src/proxy.ts`
      // (middleware) so it can carry a per-request nonce. The static headers
      // below apply to every route, including API and static assets.
      return [
        {
          source: '/:path*',
          headers: [
            { key: 'X-Frame-Options', value: 'DENY' },
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
            {
              key: 'Permissions-Policy',
              value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
            },
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=31536000; includeSubDomains; preload',
            },
          ],
        },
        {
          source: '/api/proxy/:path*',
          headers: [
            { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          ],
        },
        {
          source: '/api/files/:path*',
          headers: [
            { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          ],
        },
      ];
    },
  };
}
