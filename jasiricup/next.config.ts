/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // unsafe-inline needed for Next.js
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              "font-src 'self' fonts.gstatic.com",
              "img-src 'self' data: blob: res.cloudinary.com",
              "media-src 'self' res.cloudinary.com",
              "connect-src 'self'",
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests"
            ].join('; ')
          }
        ]
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0'
          },
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow'
          }
        ]
      },
      {
        source: '/admin/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, private'
          },
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive, nosnippet'
          }
        ]
      }
    ];
  },

  // Enable experimental features for better security
  experimental: {
    serverComponentsExternalPackages: ['mongoose']
  },

  // Configure image domains for security (enhanced from your existing config)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '**',
      },
    ],
    // Additional security settings
    domains: ['res.cloudinary.com'], // Backwards compatibility
    minimumCacheTTL: 60, // Cache images for at least 60 seconds
    formats: ['image/webp', 'image/avif'], // Modern formats for better performance
    dangerouslyAllowSVG: false, // Disable SVG uploads for security
    contentDispositionType: 'attachment', // Force download for unknown types
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Disable x-powered-by header
  poweredByHeader: false,

  // Enable compression
  compress: true,

  // Strict mode
  reactStrictMode: true,

  // Security-focused compiler options
  compiler: {
    // Remove console.logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Configure redirects for security and SEO
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: true,
      },
      // Prevent access to sensitive files
      {
        source: '/.env',
        destination: '/404',
        permanent: true,
      },
      {
        source: '/.env.local',
        destination: '/404',
        permanent: true,
      },
      {
        source: '/package.json',
        destination: '/404',
        permanent: true,
      },
    ];
  },

  // Configure rewrites for clean URLs and security
  async rewrites() {
    return [
      // Hide API structure (optional - adds security through obscurity)
      {
        source: '/health',
        destination: '/api/health',
      },
    ];
  },

  // Output configuration for better security in production
  output: 'standalone',

  // Enable SWC minification for better performance and security
  swcMinify: true,

  // TypeScript configuration
  typescript: {
    // Don't build if there are TypeScript errors
    ignoreBuildErrors: false,
  },

  // ESLint configuration  
  eslint: {
    // Don't build if there are ESLint errors in production
    ignoreDuringBuilds: process.env.NODE_ENV !== 'production',
  },

  // Webpack configuration for additional security
  webpack: (config, { dev, isServer }) => {
    // Security headers for webpack dev server
    if (dev && !isServer) {
      config.devServer = {
        ...config.devServer,
        headers: {
          'X-Frame-Options': 'SAMEORIGIN',
          'X-Content-Type-Options': 'nosniff',
        },
      };
    }

    // Additional security configurations
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    return config;
  },

  // Environment variables validation (will run at build time)
  env: {
    // Only expose non-sensitive environment variables
    NODE_ENV: process.env.NODE_ENV,
  },
};

export default nextConfig;