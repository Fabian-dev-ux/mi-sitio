/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  output: 'export', // Necesario para generar sitio estático
  trailingSlash: true, // Mejora compatibilidad con hosting estático
  images: {
    unoptimized: true // Necesario para export estático
  },
  serverExternalPackages: ["sharp"], // Mantén esto si procesas imágenes
  experimental: {
    turbo: {
      // Opciones específicas de Turbopack (si las necesitas)
    }
  }
};

module.exports = withBundleAnalyzer(nextConfig);