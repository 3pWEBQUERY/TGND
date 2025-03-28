/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'uk0ion1rrnjceue5.public.blob.vercel-storage.com'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Längerer Timeout für die Generierung von statischen Seiten
  staticPageGenerationTimeout: 120,
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
    turbotrace: {
      logLevel: 'error'
    },
    optimizeCss: true,
    // Aktiviere schnellere Builds
    optimizePackageImports: ['@prisma/client'],
  },
  // Cache-Konfiguration
  distDir: '.next',
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
};

module.exports = nextConfig;
