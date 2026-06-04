const withNextIntl = require('next-intl/plugin')(
  './src/i18n.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Avoid stale vendor-chunks during dev HMR (split chunks outliving .next cache).
  experimental: {
    serverComponentsExternalPackages: [
      '@supabase/supabase-js',
      '@supabase/ssr',
      '@formatjs/ecma402-abstract',
      '@formatjs/icu-messageformat-parser',
      '@formatjs/intl-localematcher',
      '@formatjs/fast-memoize',
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        // Exclude heavy snapshot/archive folders from file watching.
        ignored: [
          '**/node_modules/**',
          '**/.next/**',
          '**/Perfect_Blue_16_Jan_Init_MVP_ready/**',
          '**/Perfect_Blue_25_feb/**',
          '**/Municipis_Catalunya/**',
        ],
      };
    }

    return config;
  },
};

module.exports = withNextIntl(nextConfig);

