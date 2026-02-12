/**
 * Unit tests for src/utils/errors.js
 */

// Load browser mocks
require('../mocks/browser');

const {
  ErrorType, ErrorSeverity,
  createError, normalizeError, logError,
  showErrorNotification, wrapAsync, wrapSync,
  validateNotNull, validateType, validateString, validateNumber,
  validateArrayElements, isApiAvailable, assert
} = require('../../src/utils/errors');

describe('errors.js', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('constants', () => {
    it('should define error types and severities', () => {
      expect(Object.keys(ErrorType)).toEqual(
        expect.arrayContaining(['API', 'DOM', 'VALIDATION', 'NETWORK', 'UNKNOWN'])
      );
      expect(Object.keys(ErrorSeverity)).toEqual(
        expect.arrayContaining(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'])
      );
    });
  });

  describe('createError', () => {
    it('should create a structured error object', () => {
      const error = createError(ErrorType.API, ErrorSeverity.HIGH, 'Test error', { module: 'test' });
      expect(error).toMatchObject({
        type: ErrorType.API,
        severity: ErrorSeverity.HIGH,
        message: 'Test error',
        module: 'test',
      });
    });
  });

  describe('normalizeError', () => {
    it('should normalize Error instances', () => {
      const orig = new Error('Original');
      const normalized = normalizeError(orig, { key: 'val' });
      expect(normalized.message).toBe('Original');
      expect(normalized.error).toBe(orig);
      expect(normalized.context).toEqual({ key: 'val' });
    });

    it('should normalize string errors', () => {
      const normalized = normalizeError('String error');
      expect(normalized.message).toBe('String error');
      expect(normalized.type).toBe(ErrorType.UNKNOWN);
    });

    it('should normalize null/undefined to default message', () => {
      const normalized = normalizeError(null);
      expect(normalized.message).toBeTruthy();
    });
  });

  describe('logError', () => {
    it('should log to console without throwing', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation();
      const error = createError(ErrorType.DOM, ErrorSeverity.HIGH, 'DOM error');
      expect(() => logError(error)).not.toThrow();
      spy.mockRestore();
    });
  });

  describe('showErrorNotification', () => {
    it('should call browser.notifications.create', async () => {
      await showErrorNotification('Title', 'Message');
      expect(browser.notifications.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Title', message: 'Message' })
      );
    });
  });

  describe('wrapAsync', () => {
    it('should pass through successful results', async () => {
      const fn = async (x) => x * 2;
      const wrapped = wrapAsync(fn);
      expect(await wrapped(5)).toBe(10);
    });

    it('should catch errors and return null', async () => {
      const spy = jest.spyOn(console, 'error').mockImplementation();
      const fn = async () => { throw new Error('fail'); };
      const wrapped = wrapAsync(fn);
      expect(await wrapped()).toBeNull();
      spy.mockRestore();
    });
  });

  describe('wrapSync', () => {
    it('should pass through successful results', () => {
      const fn = (x) => x + 1;
      const wrapped = wrapSync(fn);
      expect(wrapped(5)).toBe(6);
    });

    it('should catch errors and return null', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation();
      const fn = () => { throw new Error('fail'); };
      const wrapped = wrapSync(fn);
      expect(wrapped()).toBeNull();
      spy.mockRestore();
    });
  });

  describe('validators', () => {
    it('validateNotNull should throw on null/undefined', () => {
      expect(() => validateNotNull(null)).toThrow();
      expect(() => validateNotNull(undefined)).toThrow();
      expect(() => validateNotNull('ok')).not.toThrow();
    });

    it('validateType should throw on wrong type', () => {
      expect(() => validateType([], 'array')).not.toThrow();
      expect(() => validateType('str', 'string')).not.toThrow();
      expect(() => validateType(123, 'string')).toThrow();
    });

    it('validateString should throw on non-string or empty', () => {
      expect(() => validateString('hello')).not.toThrow();
      expect(() => validateString('')).toThrow();
      expect(() => validateString(123)).toThrow();
    });

    it('validateNumber should throw on out-of-range', () => {
      expect(() => validateNumber(5, 0, 10)).not.toThrow();
      expect(() => validateNumber(-1, 0, 10)).toThrow();
      expect(() => validateNumber('x')).toThrow();
    });

    it('validateArrayElements should throw on wrong element types', () => {
      expect(() => validateArrayElements(['a', 'b'], 'string')).not.toThrow();
      expect(() => validateArrayElements([1, 'a'], 'string')).toThrow();
      expect(() => validateArrayElements('not-array', 'string')).toThrow();
    });
  });

  describe('assert', () => {
    it('should throw on false condition', () => {
      expect(() => assert(true)).not.toThrow();
      expect(() => assert(false, 'Nope')).toThrow('Nope');
    });
  });

  describe('isApiAvailable', () => {
    it('should check API paths', () => {
      // isApiAvailable starts from global.browser, so paths omit 'browser.' prefix
      expect(isApiAvailable('menus')).toBe(true);
      expect(isApiAvailable('nonexistent')).toBe(false);
    });
  });
});
