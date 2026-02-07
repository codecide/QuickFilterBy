/**
 * Jest setup file
 *
 * This file is run before each test file to set up the testing environment.
 * It configures global mocks and utilities for testing WebExtension APIs.
 */

// Set up global test timeout
jest.setTimeout(10000);

// Mock console methods to reduce test noise
global.console = {
  ...console,
  // Uncomment to hide logs during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Mock timers for async tests
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

// Global test utilities
global.testUtils = {
  /**
   * Wait for a specified number of milliseconds
   * @param {number} ms - Milliseconds to wait
   * @returns {Promise<void>}
   */
  waitFor: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),

  /**
   * Wait for a promise to resolve or timeout
   * @param {Promise} promise - Promise to wait for
   * @param {number} timeoutMs - Timeout in milliseconds
   * @returns {Promise<*>}
   */
  waitForPromise: (promise, timeoutMs = 5000) => {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Promise timed out')), timeoutMs)
      ),
    ]);
  },

  /**
   * Create a mock function that returns a value
   * @param {*} value - Value to return
   * @returns {Function}
   */
  mockReturn: (value) => jest.fn().mockReturnValue(value),

  /**
   * Create a mock function that resolves a value
   * @param {*} value - Value to resolve
   * @returns {Function}
   */
  mockResolve: (value) => jest.fn().mockResolvedValue(value),

  /**
   * Create a mock function that rejects an error
   * @param {Error} error - Error to reject
   * @returns {Function}
   */
  mockReject: (error) => jest.fn().mockRejectedValue(error),
};

// Export for use in tests
module.exports = {};
