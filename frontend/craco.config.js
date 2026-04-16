const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const isAnalyze = process.env.ANALYZE === 'true';

module.exports = {
  webpack: {
    plugins: {
      add: isAnalyze ? [new BundleAnalyzerPlugin()] : [],
    },
    configure: (webpackConfig) => {
      // splitChunks uniquement en production — en dev CRA le désactive (false)
      // et l'écraser bloque le webpack-dev-server
      if (webpackConfig.mode === 'production') {
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          splitChunks: {
            ...webpackConfig.optimization?.splitChunks,
            cacheGroups: {
              ...webpackConfig.optimization?.splitChunks?.cacheGroups,
              // Chunk antd stable : change rarement → cache long navigateur
              antd: {
                test: /[\\/]node_modules[\\/](antd|@ant-design|rc-[a-z-]+)[\\/]/,
                name: 'vendor-antd',
                chunks: 'all',
                priority: 20,
                reuseExistingChunk: true,
              },
            },
          },
        };
      }
      return webpackConfig;
    },
    alias: {
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@controls': path.resolve(__dirname, 'src/controls'),
      '@context': path.resolve(__dirname, 'src/context'),
      '@lib': path.resolve(__dirname, 'src/lib'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@api': path.resolve(__dirname, 'src/api'),
      '@routes': path.resolve(__dirname, 'src/routes'),
      '@': path.resolve(__dirname, 'src')
    }
  },
  jest: {
    configure: {
      moduleNameMapper: {
        '^@assets/(.*)$': '<rootDir>/src/assets/$1',
        '^@controls/(.*)$': '<rootDir>/src/controls/$1',
        '^@context/(.*)$': '<rootDir>/src/context/$1',
        '^@lib/(.*)$': '<rootDir>/src/lib/$1',
        '^@utils/(.*)$': '<rootDir>/src/utils/$1',
        '^@api/(.*)$': '<rootDir>/src/api/$1',
        '^@routes/(.*)$': '<rootDir>/src/routes/$1',
        '^@/(.*)$': '<rootDir>/src/$1'
      }
    }
  }
};
