import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // Optimizaciones para reducir uso de memoria en build
  experimental: {
    // Optimizar imports de paquetes grandes
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'framer-motion',
      'recharts',
    ],
  },
  // Configuración de webpack para optimizar build
  webpack: (config, { isServer }) => {
    // Optimizar chunks para reducir memoria
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            // Separar librerías pesadas en chunks individuales
            three: {
              test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
              name: 'three',
              priority: 10,
              reuseExistingChunk: true,
            },
            motion: {
              test: /[\\/]node_modules[\\/](framer-motion|motion)[\\/]/,
              name: 'motion',
              priority: 10,
              reuseExistingChunk: true,
            },
            charts: {
              test: /[\\/]node_modules[\\/](recharts)[\\/]/,
              name: 'charts',
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
