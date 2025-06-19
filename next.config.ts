import type { NextConfig } from 'next'

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  
  // Optimizaciones de imágenes (aunque esté unoptimized, estas configuraciones ayudan)
  images: {
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Configuración del compilador para mejor optimización
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    // Elimina imports no utilizados
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },
  
  // Optimizaciones de webpack
  webpack: (config, { isServer }) => {
    // Optimización para sitios estáticos
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    // Optimización de chunks
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    }
    
    return config
  },
  
  // Configuración para optimizar el bundle
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Configuración específica para export estático
  distDir: 'out',
  
  serverExternalPackages: ["sharp"],
  
  experimental: {
    // Optimización CSS removida para evitar dependencias faltantes
    // optimizeCss: true, // Comentado - causaba error con critters
    scrollRestoration: true,
    turbo: {
      // Configuración de Turbopack
    }
  }
}

export default withBundleAnalyzer(nextConfig)