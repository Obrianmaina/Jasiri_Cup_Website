import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Removed unsafe-eval. If TipTap/Slate requires it, scope it to admin only.
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https://res.cloudinary.com https://upload.wikimedia.org",
              "media-src 'self' https://res.cloudinary.com",
              // Allow Anthropic API calls from artifacts
              "connect-src 'self' https://api.cloudinary.com https://api.anthropic.com https://nominatim.openstreetmap.org",
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          // CSRF protection hint
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
      {
        source: '/admin/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, private' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive, nosnippet' },
        ],
      },
    ];
  },

  async redirects() {
    return [
      { source: '/admin', destination: '/admin/dashboard', permanent: true },
      { source: '/.env', destination: '/404', permanent: true },
      { source: '/.env.local', destination: '/404', permanent: true },
      { source: '/package.json', destination: '/404', permanent: true },
    ];
  },

  async rewrites() {
    return [{ source: '/health', destination: '/api/health' }];
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '**',
      },
    ],
    minimumCacheTTL: 60,
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: false,
  },

  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  output: 'standalone',

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },

  serverExternalPackages: ['mongoose'],
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: process.env.NODE_ENV !== 'production' },

  webpack(config, { isServer }) {
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      fs: false,
      net: false,
      tls: false,
    };

    if (isServer && process.env.NODE_ENV === 'development') {
      console.log('\n--- Next.js env check ---');
      console.log('DB_CONNECTION_STRING:', process.env.DB_CONNECTION_STRING ? '✅' : '❌ MISSING');
      console.log('ADMIN_SECRET_TOKEN:  ', process.env.ADMIN_SECRET_TOKEN ? '✅' : '❌ MISSING');
      console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅' : '❌ MISSING');
      console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL ? '✅' : '❌ MISSING');
      console.log('-------------------------\n');
    }

    return config;
  },
};

export default nextConfig;