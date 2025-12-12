/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn-staging.yourpave.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn-qa.yourpave.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.yourpave.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.chaaat.io',
      },
      {
        protocol: 'https',
        hostname: 'pave-prd.s3.ap-southeast-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'pave-stg.s3.ap-southeast-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'pave-qa.s3.ap-southeast-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'i3.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'scontent.whatsapp.net',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        child_process: false,
        tls: false,
      };
    }
    return config;
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

module.exports = nextConfig;
