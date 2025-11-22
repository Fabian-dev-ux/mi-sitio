// next.config.js (VERSIÓN FINAL Y OPTIMIZADA)

import type { NextConfig } from 'next'

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  
  // Optimizaciones de imágenes se mantienen
  images: {
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Configuración del compilador se mantiene
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },
  
  // ===================================================================
  //  SECCIÓN 'webpack' ELIMINADA
  //  Hemos quitado la configuración personalizada de 'splitChunks'
  //  para permitir que la estrategia por defecto de Next.js, que sí 
  //  respeta 'next/dynamic', tome el control.
  // ===================================================================

  // El resto de la configuración se mantiene
  poweredByHeader: false,
  reactStrictMode: true,
  
  distDir: 'out',
  
  serverExternalPackages: ["sharp"],
  
  experimental: {
    scrollRestoration: true,
    turbo: {
      // Configuración de Turbopack
    }
  }
}

export default withBundleAnalyzer(nextConfig)