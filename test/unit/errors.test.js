/**
 * Unit tests for src/utils/errors.js
 *
 * Tests all error handling utilities including:
 * - Error type and severity constants
 * - Error logging
 * - User notifications
 * - Async/sync function wrappers
 * - Validation functions
 * - Error creation and normalization
 * - API availability checks
 * - Assertions
 */

// Load browser mocks first (before requiring errors.js)
require('../mocks/browser');

const { describe, it, expect, beforeEach } = require('@jest/globals');
const {
  ErrorType,
  ErrorSeverity,
  logError,
  showErrorNotification,
  wrapAsync,
  wrapSync,
  validateNotNull,
  validateType,
  validateString,
  validateNumber,
  createError,
  normalizeError,
  isApiAvailable,
  assert
} = require('../../src/utils/errors');

// Load browser mocks
require('../mocks/browser');

describe('errors.js - Error Constants', () => {
  it('should have correct error types', () => {
    expect(ErrorType.API).toBe('API');
    expect(ErrorType.DOM).toBe('DOM');
    expect(ErrorType.VALIDATION).toBe('VALIDATION');
    expect(ErrorType.NETWORK).toBe('NETWORK');
    expect(ErrorType.UNKNOWN).toBe('UNKNOWN');
  });

  it('should have correct error severities', () => {
    expect(ErrorSeverity.CRITICAL).toBe('CRITICAL');
    expect(ErrorSeverity.HIGH).toBe('HIGH');
    expect(ErrorSeverity.MEDIUM).toBe('MEDIUM');
    expect(ErrorSeverity.LOW).toBe('LOW');
  });
});

describe('errors.js - createError', () => {
  it('should create error object with all properties', () => {
    const error = createError(
      ErrorType.API,
      ErrorSeverity.CRITICAL,
      'Test error message',
      { module: 'test' }
    );

    expect(error.type).toBe(ErrorType.API);
    expect(error.severity).toBe(ErrorSeverity.CRITICAL);
    expect(error.message).toBe('Test error message');
    expect(error.context).toEqual({ module: 'test' });
    expect(error.error).toBeNull();
    expect(error.module).toBe('test');
  });

  it('should create error without context', () => {
    const error = createError(ErrorType.UNKNOWN, ErrorSeverity.MEDIUM, 'No context');

    expect(error.type).toBe(ErrorType.UNKNOWN);
    expect(error.severity).toBe(ErrorSeverity.MEDIUM);
    expect(error.message).toBe('No context');
    expect(error.context).toEqual({});
    expect(error.error).toBeNull();
    expect(error.module).toBe('');
  });
});

describe('errors.js - normalizeError', () => {
  it('should normalize error details object', () => {
    const errorDetails = {
      type: ErrorType.DOM,
      severity: ErrorSeverity.HIGH,
      message: 'DOM error',
      error: new Error('Original'),
      context: { element: 'div' },
      module: 'dom-module'
    };

    const normalized = normalizeError(errorDetails, { additional: 'info' });

    expect(normalized.type).toBe(ErrorType.DOM);
    expect(normalized.severity).toBe(ErrorSeverity.HIGH);
    expect(normalized.message).toBe('DOM error');
    expect(normalized.error).toBeInstanceOf(Error);
    expect(normalized.context).toEqual({ element: 'div', additional: 'info' });
    expect(normalized.module).toBe('dom-module');
  });

  it('should normalize standard Error object', () => {
    const originalError = new Error('Standard error');
    const normalized = normalizeError(originalError, { module: 'test' });

    expect(normalized.type).toBe(ErrorType.UNKNOWN);
    expect(normalized.severity).toBe(ErrorSeverity.HIGH);
    expect(normalized.message).toBe('Standard error');
    expect(normalized.error).toBe(originalError);
    expect(normalized.context).toEqual({ module: 'test' });
    expect(normalized.module).toBe('test');
  });

  it('should normalize string error', () => {
    const normalized = normalizeError('String error', { key: 'value' });

    expect(normalized.type).toBe(ErrorType.UNKNOWN);
    expect(normalized.severity).toBe(ErrorSeverity.MEDIUM);
    expect(normalized.message).toBe('String error');
    expect(normalized.error).toBeNull();
    expect(normalized.context).toEqual({ key: 'value' });
  });

  it('should normalize number error', () => {
    const normalized = normalizeError(12345);

    expect(normalized.type).toBe(ErrorType.UNKNOWN);
    expect(normalized.severity).toBe(ErrorSeverity.MEDIUM);
    expect(normalized.message).toBe('12345');
    expect(normalized.error).toBeNull();
  });

  it('should normalize error without message', () => {
    const error = new Error();
    const normalized = normalizeError(error);

    expect(normalized.message).toBe('An unknown error occurred');
  });
});

describe('errors.js - logError', () => {
  let consoleErrorSpy;
  let consoleWarnSpy;
  let consoleInfoSpy;
  let consoleLogSpy;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it('should log CRITICAL errors to console.error', () => {
    const error = createError(ErrorType.API, ErrorSeverity.CRITICAL, 'Critical error');
    logError(error);

    expect(consoleErrorSpy).toHaveBeenCalled();
    const callArgs = consoleErrorSpy.mock.calls[0][0];
    expect(callArgs).toContain('[CRITICAL]');
    expect(callArgs).toContain('[API]');
  });

  it('should log HIGH errors to console.error', () => {
    const error = createError(ErrorType.DOM, ErrorSeverity.HIGH, 'High severity error');
    logError(error);

    expect(consoleErrorSpy).toHaveBeenCalled();
    const callArgs = consoleErrorSpy.mock.calls[0][0];
    expect(callArgs).toContain('[HIGH]');
    expect(callArgs).toContain('[DOM]');
  });

  it('should log MEDIUM errors to console.warn', () => {
    const error = createError(ErrorType.VALIDATION, ErrorSeverity.MEDIUM, 'Medium error');
    logError(error);

    expect(consoleWarnSpy).toHaveBeenCalled();
    const callArgs = consoleWarnSpy.mock.calls[0][0];
    expect(callArgs).toContain('[MEDIUM]');
    expect(callArgs).toContain('[VALIDATION]');
  });

  it('should log LOW errors to console.info', () => {
    const error = createError(ErrorType.UNKNOWN, ErrorSeverity.LOW, 'Low severity error');
    logError(error);

    expect(consoleInfoSpy).toHaveBeenCalled();
    const callArgs = consoleInfoSpy.mock.calls[0][0];
    expect(callArgs).toContain('[LOW]');
    expect(callArgs).toContain('[UNKNOWN]');
  });

  it('should include module name in log if provided', () => {
    const error = createError(ErrorType.API, ErrorSeverity.HIGH, 'Error with module');
    error.module = 'test-module';
    logError(error);

    expect(consoleErrorSpy).toHaveBeenCalled();
    const callArgs = consoleErrorSpy.mock.calls[0][0];
    expect(callArgs).toContain('[test-module]');
  });

  it('should include timestamp in log', () => {
    const error = createError(ErrorType.API, ErrorSeverity.HIGH, 'Timestamp test');
    logError(error);

    expect(consoleErrorSpy).toHaveBeenCalled();
    const callArgs = consoleErrorSpy.mock.calls[0][0];
    expect(callArgs).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO timestamp format
  });

  it('should include context in log', () => {
    const error = createError(ErrorType.API, ErrorSeverity.HIGH, 'Context test');
    const context = { key1: 'value1', key2: 'value2' };
    logError(error, context);

    expect(consoleErrorSpy).toHaveBeenCalled();
    const args = consoleErrorSpy.mock.calls[0];
    expect(args).toContainEqual(context);
  });
});

describe('errors.js - showErrorNotification', () => {
  beforeEach(() => {
    // Reset browser mocks
    if (global.browser && global.browser._resetMocks) {
      global.browser._resetMocks();
    }
  });

  it('should create notification using browser API', async () => {
    await showErrorNotification('Test Title', 'Test Message');

    expect(browser.notifications.create).toHaveBeenCalledWith({
      type: 'basic',
      iconUrl: expect.any(String),
      title: 'Test Title',
      message: 'Test Message'
    });
  });

  it('should use default options if not provided', async () => {
    await showErrorNotification('Title', 'Message');

    expect(browser.notifications.create).toHaveBeenCalledWith({
      type: 'basic',
      iconUrl: expect.any(String),
      title: 'Title',
      message: 'Message'
    });
  });

  it('should use custom options if provided', async () => {
    await showErrorNotification('Title', 'Message', {
      type: 'warning',
      timeout: 10000
    });

    expect(browser.notifications.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Title',
        message: 'Message',
        type: 'basic' // notifications API doesn't support 'warning' type
      })
    );
  });

  it('should log to console if browser API not available', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    global.browser.notifications = null;

    await showErrorNotification('Title', 'Message');

    expect(consoleErrorSpy).toHaveBeenCalledWith('[NOTIFICATION] Title: Message');

    consoleErrorSpy.mockRestore();
  });

  it('should handle notification API errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    browser.notifications = {
      create: jest.fn().mockRejectedValue(new Error('Notification failed'))
    };

    await showErrorNotification('Title', 'Message');

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('NOTIFICATION ERROR')
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Original notification: Title: Message')
    );

    consoleErrorSpy.mockRestore();
    // Reset browser.notifications
    const browserMock = require('../mocks/browser');
    browser.notifications = browserMock.notifications;
  });
});

describe('errors.js - wrapAsync', () => {
  it('should wrap async function that succeeds', async () => {
    const asyncFn = async (value) => value * 2;
    const wrapped = wrapAsync(asyncFn, { module: 'test' });

    const result = await wrapped(5);

    expect(result).toBe(10);
  });

  it('should catch and log async errors', async () => {
    const asyncFn = async () => {
      throw new Error('Async error');
    };
    const wrapped = wrapAsync(asyncFn, { module: 'test', defaultMessage: 'Default error' });

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const result = await wrapped();

    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalled();
    // Check that the message was logged (it's in the 2nd argument)
    expect(consoleErrorSpy.mock.calls[0][1]).toBe('Default error');

    consoleErrorSpy.mockRestore();
  });

  it('should pass arguments to wrapped function', async () => {
    const asyncFn = async (a, b, c) => a + b + c;
    const wrapped = wrapAsync(asyncFn);

    const result = await wrapped(1, 2, 3);

    expect(result).toBe(6);
  });

  it('should use default severity', async () => {
    const asyncFn = async () => {
      throw new Error('Test error');
    };
    const wrapped = wrapAsync(asyncFn);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    await wrapped();

    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('should use custom severity', async () => {
    const asyncFn = async () => {
      throw new Error('Test error');
    };
    const wrapped = wrapAsync(asyncFn, { severity: ErrorSeverity.LOW });

    const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    await wrapped();

    expect(consoleInfoSpy).toHaveBeenCalled();

    consoleInfoSpy.mockRestore();
  });
});

describe('errors.js - wrapSync', () => {
  it('should wrap sync function that succeeds', () => {
    const syncFn = (value) => value * 2;
    const wrapped = wrapSync(syncFn, { module: 'test' });

    const result = wrapped(5);

    expect(result).toBe(10);
  });

  it('should catch and log sync errors', () => {
    const syncFn = () => {
      throw new Error('Sync error');
    };
    const wrapped = wrapSync(syncFn, { module: 'test', defaultMessage: 'Default sync error' });

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const result = wrapped();

    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalled();
    // Check that the message was logged (it's in the 2nd argument)
    expect(consoleErrorSpy.mock.calls[0][1]).toBe('Default sync error');

    consoleErrorSpy.mockRestore();
  });

  it('should pass arguments to wrapped sync function', () => {
    const syncFn = (a, b, c) => a + b + c;
    const wrapped = wrapSync(syncFn);

    const result = wrapped(1, 2, 3);

    expect(result).toBe(6);
  });

  it('should use default severity', () => {
    const syncFn = () => {
      throw new Error('Test error');
    };
    const wrapped = wrapSync(syncFn);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    wrapped();

    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('should use custom severity', () => {
    const syncFn = () => {
      throw new Error('Test error');
    };
    const wrapped = wrapSync(syncFn, { severity: ErrorSeverity.LOW });

    const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    wrapped();

    expect(consoleInfoSpy).toHaveBeenCalled();

    consoleInfoSpy.mockRestore();
  });
});

describe('errors.js - validateNotNull', () => {
  it('should return value if not null or undefined', () => {
    expect(validateNotNull(0)).toBe(0);
    expect(validateNotNull('')).toBe('');
    expect(validateNotNull(false)).toBe(false);
    expect(validateNotNull({})).toEqual({});
    expect(validateNotNull([])).toEqual([]);
  });

  it('should throw error for null', () => {
    expect(() => validateNotNull(null)).toThrow('value is null or undefined');
  });

  it('should throw error for undefined', () => {
    expect(() => validateNotNull(undefined)).toThrow('value is null or undefined');
  });

  it('should use custom name in error message', () => {
    expect(() => validateNotNull(null, 'customValue')).toThrow('customValue is null or undefined');
  });
});

describe('errors.js - validateType', () => {
  it('should return value if type matches', () => {
    expect(validateType('string', 'string')).toBe('string');
    expect(validateType(123, 'number')).toBe(123);
    expect(validateType(true, 'boolean')).toBe(true);
    expect(validateType({}, 'object')).toEqual({});
    expect(validateType([], 'object')).toEqual([]);
  });

  it('should throw error for mismatched type', () => {
    expect(() => validateType('string', 'number')).toThrow('should be number, but got string');
    expect(() => validateType(123, 'string')).toThrow('should be string, but got number');
  });

  it('should use custom name in error message', () => {
    expect(() => validateType(123, 'string', 'myVar')).toThrow('myVar should be string');
  });
});

describe('errors.js - validateString', () => {
  it('should return value if non-empty string', () => {
    expect(validateString('hello')).toBe('hello');
    expect(validateString('hello world')).toBe('hello world');
    expect(validateString('a')).toBe('a');
  });

  it('should throw error for non-string', () => {
    expect(() => validateString(123)).toThrow('should be string');
    expect(() => validateString(null)).toThrow('should be string');
    expect(() => validateString({})).toThrow('should be string');
  });

  it('should throw error for empty string', () => {
    expect(() => validateString('')).toThrow('is an empty string');
    expect(() => validateString('   ')).toThrow('is an empty string'); // Trimmed
  });

  it('should throw error for whitespace-only string', () => {
    expect(() => validateString(' ')).toThrow('is an empty string');
    expect(() => validateString('   ')).toThrow('is an empty string');
  });

  it('should use custom name in error message', () => {
    expect(() => validateString('', 'myString')).toThrow('myString is an empty string');
  });
});

describe('errors.js - validateNumber', () => {
  it('should return value if number in range', () => {
    expect(validateNumber(0)).toBe(0);
    expect(validateNumber(5, 0, 10)).toBe(5);
    expect(validateNumber(10, 0, 10)).toBe(10);
    expect(validateNumber(-5, -10, 10)).toBe(-5);
  });

  it('should throw error for non-number', () => {
    expect(() => validateNumber('123')).toThrow('should be number');
    expect(() => validateNumber(null)).toThrow('should be number');
    expect(() => validateNumber({})).toThrow('should be number');
  });

  it('should throw error for number below minimum', () => {
    expect(() => validateNumber(-1, 0, 10)).toThrow('should be between 0 and 10');
    expect(() => validateNumber(5, 10, 20)).toThrow('should be between 10 and 20');
  });

  it('should throw error for number above maximum', () => {
    expect(() => validateNumber(11, 0, 10)).toThrow('should be between 0 and 10');
    expect(() => validateNumber(25, 10, 20)).toThrow('should be between 10 and 20');
  });

  it('should use custom name in error message', () => {
    expect(() => validateNumber(25, 0, 10, 'myNumber')).toThrow('myNumber should be between 0 and 10');
  });

  it('should use default min and max', () => {
    expect(validateNumber(100)).toBe(100);
    expect(() => validateNumber(-1)).toThrow('should be between 0 and Infinity');
  });
});

describe('errors.js - isApiAvailable', () => {
  it('should return true for available API', () => {
    // Reload errors.js module after browser is set up
    jest.isolateModules(() => {
      const browserMock = require('../mocks/browser');
      global.browser = browserMock;

      const {
        isApiAvailable
      } = require('../../src/utils/errors');

      // Note: isApiAvailable expects paths like 'menus', not 'browser.menus'
      expect(isApiAvailable('menus')).toBe(true);
      expect(isApiAvailable('tabs')).toBe(true);
      expect(isApiAvailable('storage')).toBe(true);
    });
  });

  it('should return false for unavailable API', () => {
    jest.isolateModules(() => {
      // Set up minimal browser mock
      global.browser = {
        menus: { create: jest.fn() }
      };

      const {
        isApiAvailable
      } = require('../../src/utils/errors');

      expect(isApiAvailable('nonexistent')).toBe(false);
      expect(isApiAvailable('menus.nonexistent')).toBe(false);
    });
  });

  it('should handle deep API paths', () => {
    jest.isolateModules(() => {
      const browserMock = require('../mocks/browser');
      global.browser = browserMock;

      const {
        isApiAvailable
      } = require('../../src/utils/errors');

      expect(isApiAvailable('storage.local')).toBe(true);
      expect(isApiAvailable('storage.nonexistent')).toBe(false);
    });
  });

  it('should return false if browser is undefined', () => {
    jest.isolateModules(() => {
      global.browser = undefined;

      const {
        isApiAvailable
      } = require('../../src/utils/errors');

      expect(isApiAvailable('menus')).toBe(false);
    });
  });

  it('should handle API access errors', () => {
    jest.isolateModules(() => {
      global.browser = {
        get menus() {
          throw new Error('Access denied');
        }
      };

      const {
        isApiAvailable
      } = require('../../src/utils/errors');

      expect(isApiAvailable('menus')).toBe(false);
    });
  });
});

describe('errors.js - assert', () => {
  it('should not throw if condition is true', () => {
    expect(() => assert(true)).not.toThrow();
    expect(() => assert(1)).not.toThrow();
    expect(() => assert('string')).not.toThrow();
    expect(() => assert({})).not.toThrow();
  });

  it('should throw error if condition is false', () => {
    expect(() => assert(false)).toThrow('Assertion failed');
  });

  it('should throw error with custom message', () => {
    expect(() => assert(false, 'Custom message')).toThrow('Custom message');
  });

  it('should throw error for falsy values', () => {
    expect(() => assert(0)).toThrow();
    expect(() => assert('')).toThrow();
    expect(() => assert(null)).toThrow();
    expect(() => assert(undefined)).toThrow();
  });
});
