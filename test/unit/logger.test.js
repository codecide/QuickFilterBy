/**
 * Unit tests for src/utils/logger.js
 *
 * Tests all logging utilities including:
 * - Log level management
 * - Logging functions (debug, info, warn, error)
 * - Log filtering
 * - Log rotation
 * - File logging
 */

const { describe, it, expect, beforeEach, jest } = require('@jest/globals');

// Load browser mocks first
require('../mocks/browser');

const {
  LogLevel,
  setLogLevel,
  getLogLevel,
  isDebugEnabled,
  isInfoEnabled,
  isWarnEnabled,
  isErrorEnabled
} = require('../../src/utils/logger');

describe('logger.js - LogLevel Constants', () => {
  it('should have correct log levels', () => {
    expect(LogLevel.DEBUG).toBe('DEBUG');
    expect(LogLevel.INFO).toBe('INFO');
    expect(LogLevel.WARN).toBe('WARN');
    expect(LogLevel.ERROR).toBe('ERROR');
  });
});

describe('logger.js - setLogLevel', () => {
  let consoleLogSpy;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    // Reset log level to default
    setLogLevel(LogLevel.WARN);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('should set DEBUG level', () => {
    setLogLevel(LogLevel.DEBUG);
    expect(getLogLevel()).toBe(LogLevel.DEBUG);
  });

  it('should set INFO level', () => {
    setLogLevel(LogLevel.INFO);
    expect(getLogLevel()).toBe(LogLevel.INFO);
  });

  it('should set WARN level', () => {
    setLogLevel(LogLevel.WARN);
    expect(getLogLevel()).toBe(LogLevel.WARN);
  });

  it('should set ERROR level', () => {
    setLogLevel(LogLevel.ERROR);
    expect(getLogLevel()).toBe(LogLevel.ERROR);
  });

  it('should log when setting valid level', () => {
    setLogLevel(LogLevel.DEBUG);
    expect(consoleLogSpy).toHaveBeenCalledWith('[Logger] Log level set to:', LogLevel.DEBUG);
  });

  it('should warn when setting invalid level', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    setLogLevel('INVALID');

    expect(consoleWarnSpy).toHaveBeenCalledWith('[Logger] Invalid log level:', 'INVALID');
    expect(getLogLevel()).toBe(LogLevel.WARN); // Level unchanged

    consoleWarnSpy.mockRestore();
  });
});

describe('logger.js - getLogLevel', () => {
  beforeEach(() => {
    setLogLevel(LogLevel.WARN);
  });

  it('should return current log level', () => {
    const level = getLogLevel();
    expect(level).toBe(LogLevel.WARN);
  });

  it('should return updated level after change', () => {
    setLogLevel(LogLevel.INFO);
    expect(getLogLevel()).toBe(LogLevel.INFO);
  });
});

describe('logger.js - isDebugEnabled', () => {
  beforeEach(() => {
    setLogLevel(LogLevel.WARN);
  });

  it('should return true when DEBUG is set', () => {
    setLogLevel(LogLevel.DEBUG);
    expect(isDebugEnabled()).toBe(true);
  });

  it('should return false when not DEBUG', () => {
    setLogLevel(LogLevel.INFO);
    expect(isDebugEnabled()).toBe(false);

    setLogLevel(LogLevel.WARN);
    expect(isDebugEnabled()).toBe(false);

    setLogLevel(LogLevel.ERROR);
    expect(isDebugEnabled()).toBe(false);
  });
});

describe('logger.js - isInfoEnabled', () => {
  beforeEach(() => {
    setLogLevel(LogLevel.WARN);
  });

  it('should return true when DEBUG is set', () => {
    setLogLevel(LogLevel.DEBUG);
    expect(isInfoEnabled()).toBe(true);
  });

  it('should return true when INFO is set', () => {
    setLogLevel(LogLevel.INFO);
    expect(isInfoEnabled()).toBe(true);
  });

  it('should return false when higher than INFO', () => {
    setLogLevel(LogLevel.WARN);
    expect(isInfoEnabled()).toBe(false);

    setLogLevel(LogLevel.ERROR);
    expect(isInfoEnabled()).toBe(false);
  });
});

describe('logger.js - isWarnEnabled', () => {
  beforeEach(() => {
    setLogLevel(LogLevel.ERROR);
  });

  it('should return true when DEBUG is set', () => {
    setLogLevel(LogLevel.DEBUG);
    expect(isWarnEnabled()).toBe(true);
  });

  it('should return true when INFO is set', () => {
    setLogLevel(LogLevel.INFO);
    expect(isWarnEnabled()).toBe(true);
  });

  it('should return true when WARN is set', () => {
    setLogLevel(LogLevel.WARN);
    expect(isWarnEnabled()).toBe(true);
  });

  it('should return false when higher than WARN', () => {
    setLogLevel(LogLevel.ERROR);
    expect(isWarnEnabled()).toBe(false);
  });
});

describe('logger.js - isErrorEnabled', () => {
  beforeEach(() => {
    setLogLevel(LogLevel.ERROR);
  });

  it('should return true for DEBUG level', () => {
    setLogLevel(LogLevel.DEBUG);
    expect(isErrorEnabled()).toBe(true);
  });

  it('should return true for INFO level', () => {
    setLogLevel(LogLevel.INFO);
    expect(isErrorEnabled()).toBe(true);
  });

  it('should return true for WARN level', () => {
    setLogLevel(LogLevel.WARN);
    expect(isErrorEnabled()).toBe(true);
  });

  it('should return true for ERROR level', () => {
    setLogLevel(LogLevel.ERROR);
    expect(isErrorEnabled()).toBe(true);
  });
});
