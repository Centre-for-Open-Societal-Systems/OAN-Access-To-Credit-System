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
};

export default nextConfig;