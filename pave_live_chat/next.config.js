const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  images: {
    domains: [
      'cdn-staging.yourpave.com',
      'cdn-qa.yourpave.com',
      'cdn.yourpave.com',
      'www.yourpave.com',
      'localhost',
    ],
  },
  webpack: (config, { isServer, nextRuntime, webpack }) => {
    // Avoid AWS SDK Node.js require issue
    if (isServer && nextRuntime === 'nodejs')
      config.plugins.push(
        new webpack.IgnorePlugin({ resourceRegExp: /^aws-crt$/ }),
      );
    return config;
  },
};

module.exports = nextConfig;
