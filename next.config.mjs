/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    includePaths: ['./src/assets/styles'],
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
};

export default nextConfig;
