/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    includePaths: ['./src/assets/styles'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://a2c-backend-development.oanstaging.com/api/:path*',
      },
    ];
  },
};

export default nextConfig;
