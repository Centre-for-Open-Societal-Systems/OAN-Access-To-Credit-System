const API_BASE_URL = process.env.API_BASE_URL;

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
    const csp = [
      "default-src 'self'",
      // Next.js requires 'unsafe-inline'/'unsafe-eval' for its runtime; tighten with nonces later.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      `connect-src 'self' ${API_BASE_URL ?? ''}`.trim(),
      "font-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
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