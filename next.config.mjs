/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Allow all origins for Replit development AND Vercel production
  allowedDevOrigins: [
    '*.replit.dev',
    '*.repl.co',
    '*.pike.replit.dev',
    '*.vercel.app',
    'localhost:5000',
    '127.0.0.1:5000'
  ],
  experimental: {
    serverActions: {
      allowedOrigins: [
        '*.replit.dev',
        '*.repl.co',
        '*.pike.replit.dev',
        '*.vercel.app',
        'localhost:5000'
      ]
    }
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,POST,PUT,DELETE,OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ]
  },
}

export default nextConfig
