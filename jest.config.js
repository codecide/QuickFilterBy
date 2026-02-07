module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Test file patterns
  testMatch: [
    '**/test/**/*.test.js',
    '**/test/**/*.spec.js'
  ],

  // Coverage collection
  // Note: Exclude browser-specific scripts (background.js, api/) from coverage
  // as they require complex DOM/Browser API mocking that's not practical in Node.js tests
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!**/node_modules/**',
    '!**/test/**'
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // Coverage report format
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json'
  ],

  // Coverage directory
  coverageDirectory: 'coverage',

  // Module paths
  moduleDirectories: ['node_modules', '.'],

  // Transform files with Babel if needed (for future ES6+)
  transform: {},

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],

  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Verbose output
  verbose: true,

  // Timeout for async tests
  testTimeout: 10000,

  // Maximum workers for parallel tests
  maxWorkers: 4,

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],

  // Module name mapper for imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@api/(.*)$': '<rootDir>/api/$1',
    '^@test/(.*)$': '<rootDir>/test/$1'
  },

  // Global variables
  globals: {
    'ts-jest': {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true
      }
    }
  }
};
