import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV !== 'production';

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';
const apiOrigin = new URL(apiBase).origin;

// Hosts that serve uploaded images (API in dev, R2 public bucket in prod),
// comma-separated origins, e.g. "https://images.example.com".
const imageOrigins = (process.env.NEXT_PUBLIC_IMAGE_ORIGINS ?? apiOrigin)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
  .map((s) => new URL(s).origin);

const formspreeOrigin = 'https://formspree.io';

// Next.js App Router injects inline bootstrap scripts, so script-src needs
// 'unsafe-inline' unless every page is rendered dynamically with a nonce
// (which would disable ISR). Everything else is locked down; markdown is
// rendered without raw HTML, so user content can't inject scripts.
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? ` 'unsafe-eval'` : ''}`,
  `style-src 'self' 'unsafe-inline'`,
  // https: lets markdown embed external images (worst case: a tracking pixel; no script risk).
  `img-src 'self' data: blob: https: ${imageOrigins.join(' ')}`,
  `font-src 'self' data:`,
  `connect-src 'self' ${apiOrigin} ${formspreeOrigin}${isDev ? ' ws:' : ''}`,
  `frame-ancestors 'none'`,
  `form-action 'self' ${formspreeOrigin}`,
  `base-uri 'self'`,
  `object-src 'none'`,
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  ...(isDev ? [] : [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]),
];

const nextConfig: NextConfig = {
  // Pin the workspace root (a stray lockfile higher up would otherwise confuse Turbopack).
  turbopack: { root: __dirname },
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    remotePatterns: imageOrigins.map((origin) => {
      const u = new URL(origin);
      return {
        protocol: u.protocol.replace(':', '') as 'http' | 'https',
        hostname: u.hostname,
        port: u.port,
        pathname: '/**',
      };
    }),
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // Admin pages are per-user and must never be cached or indexed.
      {
        source: '/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ];
  },
};

export default nextConfig;
