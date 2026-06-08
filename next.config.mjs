const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://a2c-backend.oanstaging.com';

const nextConfig = {
  reactStrictMode: true,

  sassOptions: {
    includePaths: ['./src/assets/styles'],
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_BASE_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;