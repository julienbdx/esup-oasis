const path = require('path');

module.exports = {
  webpack: {
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
