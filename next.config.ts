import type { NextConfig } from 'next'

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  serverExternalPackages: ["sharp"],
  experimental: {
    turbo: {
      // Opciones específicas de Turbopack
    }
  }
}

export default withBundleAnalyzer(nextConfig)