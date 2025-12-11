const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
module.exports = withBundleAnalyzer({
  productionBrowserSourceMaps: false,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'cdn-staging.yourpave.com',
      'cdn-qa.yourpave.com',
      'cdn.yourpave.com',
      'cdn.chaaat.io',
      'localhost',
      'pave-prd.s3.ap-southeast-1.amazonaws.com',
      'pave-stg.s3.ap-southeast-1.amazonaws.com',
      'pave-qa.s3.ap-southeast-1.amazonaws.com',
      'i3.ytimg.com',
      'vumbnail.com',
    ],
  },
  webpack5: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false, child_process: false };

    return config;
  },
});
