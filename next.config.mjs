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

    typescript: {
      ignoreBuildErrors: true,
    },

    allowedDevOrigins: ['192.168.3.1'],

    sassOptions: {
      includePaths: ['./src/assets/styles'],
      silenceDeprecations: ['import'],
    },
    turbopack: {
      root: process.cwd(),
    },

    async rewrites() {
      return [];
    },

    async headers() {
      // Note: Content-Security-Policy is set per-request in `src/proxy.ts`
      // (middleware) so it can carry a per-request nonce. The static headers
      // below apply to every route, including API and static assets.
      return [
        {
          source: '/:path*',
          headers: [
            { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
            {
              key: 'Permissions-Policy',
              value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
            },
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=15768000; includeSubDomains',
            },
          ],
        },
      ];
    },
  };
}
