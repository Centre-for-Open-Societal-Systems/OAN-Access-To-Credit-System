const API_BASE_URL = process.env.API_BASE_URL;

// Build-time validation: fail the build/dev start immediately if the backend
// URL is missing or malformed, rather than at the first request.
if (!API_BASE_URL) {
  throw new Error('[next.config] Missing required environment variable: API_BASE_URL');
}
try {
  new URL(API_BASE_URL);
} catch {
  throw new Error(`[next.config] API_BASE_URL is not a valid URL: "${API_BASE_URL}"`);
}

const nextConfig = {
  reactStrictMode: true,

  sassOptions: {
    includePaths: ['./src/assets/styles'],
    silenceDeprecations: ['import'],
  },
  turbopack: {
    root: process.cwd(),
  },

  async rewrites() {
    return {
      fallback: [
        {
          source: '/api/:path*',
          destination: `${API_BASE_URL}/api/:path*`,
        },
      ],
    };
  },

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
            value: 'max-age=15768000; includeSubDomains',
          },
        ],
      },
    ];
  },
};

export default nextConfig;