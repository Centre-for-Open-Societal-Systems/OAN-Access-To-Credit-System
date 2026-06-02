/** @type {import('next').NextConfig} */
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
          destination: `${process.env.API_BASE_URL}/api/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
