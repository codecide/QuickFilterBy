/**
 * Error handling utilities for QuickFilterBy extension.
 * Provides centralized error logging, user notifications, and async error wrapping.
 *
 * @module errors
 */

/**
 * Error types for categorization
 * @enum {string}
 */
const ErrorType = {
  /** API-related errors (browser APIs not available) */
  API: 'API',

  /** DOM-related errors (elements not found, access denied) */
  DOM: 'DOM',

  /** Validation errors (invalid input, wrong type) */
  VALIDATION: 'VALIDATION',

  /** Network-related errors (if any network operations) */
  NETWORK: 'NETWORK',

  /** Unknown or unclassified errors */
  UNKNOWN: 'UNKNOWN'
};

/**
 * Error severity levels
 * @enum {string}
 */
const ErrorSeverity = {
  /** Critical error that prevents extension from working */
  CRITICAL: 'CRITICAL',

  /** Non-critical error but feature doesn't work */
  HIGH: 'HIGH',

  /** Minor error, extension continues to work */
  MEDIUM: 'MEDIUM',

  /** Informational, warning level */
  LOW: 'LOW'
};

/**
 * Error details object
 * @typedef {Object} ErrorDetails
 * @property {ErrorType} type - Error type
 * @property {ErrorSeverity} severity - Error severity
 * @property {string} message - Human-readable error message
 * @property {Error} [error] - Original error object (if available)
 * @property {Object} [context] - Additional context information
 * @property {string} [module] - Module where error occurred
 */

/**
 * Logs an error to the console with structured information.
 *
 * @param {Error|ErrorDetails} error - Error to log
 * @param {Object} [context={}] - Additional context information
 */
function logError(error, context = {}) {
  // Normalize error input
  const errorDetails = normalizeError(error, context);

  // Build log message
  const timestamp = new Date().toISOString();
  const prefix = `[${errorDetails.severity}] [${errorDetails.type}]`;
  const moduleInfo = errorDetails.module ? ` [${errorDetails.module}]` : '';

  // Log to console
  switch (errorDetails.severity) {
    case ErrorSeverity.CRITICAL:
      console.error(`${timestamp}${prefix}${moduleInfo}`, errorDetails.message, errorDetails.error || '', context);
      break;
    case ErrorSeverity.HIGH:
      console.error(`${timestamp}${prefix}${moduleInfo}`, errorDetails.message, errorDetails.error || '', context);
      break;
    case ErrorSeverity.MEDIUM:
      console.warn(`${timestamp}${prefix}${moduleInfo}`, errorDetails.message, context);
      break;
    case ErrorSeverity.LOW:
      console.info(`${timestamp}${prefix}${moduleInfo}`, errorDetails.message, context);
      break;
    default:
      console.log(`${timestamp}[ERROR]`, errorDetails.message, context);
  }
}

/**
 * Shows a user-friendly error notification.
 *
 * @param {string} title - Notification title
 * @param {string} message - Error message to display to user
 * @param {Object} [options={}] - Additional options
 * @param {string} [options.type='error'] - Notification type ('error', 'warning', 'info')
 * @param {number} [options.timeout=5000] - How long to show notification (ms)
 */
async function showErrorNotification(title, message, options = {}) {
  const { type = 'error', timeout = 5000 } = options;

  try {
    // Use browser.notifications if available (TB 78+)
    if (browser && browser.notifications) {
      await browser.notifications.create({
        type: 'basic',
        iconUrl: browser.runtime.getURL('icon48.png') || '',
        title: title,
        message: message
      });

      // Auto-dismiss after timeout if notifications API doesn't support timeout
      if (timeout > 0) {
        setTimeout(() => {
          // Note: We can't dismiss specific notifications in all TB versions
          // This is a best-effort approach
        }, timeout);
      }
    } else {
      // Fallback: Just log to console
      console.error(`[NOTIFICATION] ${title}: ${message}`);
    }
  } catch (error) {
    // If notifications fail, just log to console
    console.error(`[NOTIFICATION ERROR] Failed to show notification: ${error.message}`);
    console.error(`Original notification: ${title}: ${message}`);
  }
}

/**
 * Wraps an async function in a try-catch block and logs errors.
 * This is a higher-order function that returns a wrapped version of the input function.
 *
 * @template {Function} T
 * @param {T} fn - Async function to wrap
 * @param {Object} [options={}] - Options for wrapping
 * @param {string} [options.module=''] - Module name for logging
 * @param {ErrorSeverity} [options.severity=ErrorSeverity.HIGH] - Default severity
 * @param {string} [options.defaultMessage='An error occurred'] - Default error message
 * @returns {T} Wrapped function that catches and logs errors
 */
function wrapAsync(fn, options = {}) {
  const { module = '', severity = ErrorSeverity.HIGH, defaultMessage = 'An error occurred' } = options;

  return async function(...args) {
    try {
      return await fn.apply(this, args);
    } catch (error) {
      const errorDetails = {
        type: ErrorType.UNKNOWN,
        severity: severity,
        message: defaultMessage,
        error: error,
        context: { function: fn.name, args: args },
        module: module
      };

      logError(errorDetails);
      return null; // Return null on error (can be customized)
    }
  };
}

/**
 * Wraps a sync function in a try-catch block and logs errors.
 *
 * @template {Function} T
 * @param {T} fn - Function to wrap
 * @param {Object} [options={}] - Options for wrapping
 * @param {string} [options.module=''] - Module name for logging
 * @param {ErrorSeverity} [options.severity=ErrorSeverity.HIGH] - Default severity
 * @param {string} [options.defaultMessage='An error occurred'] - Default error message
 * @returns {T} Wrapped function that catches and logs errors
 */
function wrapSync(fn, options = {}) {
  const { module = '', severity = ErrorSeverity.HIGH, defaultMessage = 'An error occurred' } = options;

  return function(...args) {
    try {
      return fn.apply(this, args);
    } catch (error) {
      const errorDetails = {
        type: ErrorType.UNKNOWN,
        severity: severity,
        message: defaultMessage,
        error: error,
        context: { function: fn.name, args: args },
        module: module
      };

      logError(errorDetails);
      return null; // Return null on error (can be customized)
    }
  };
}

/**
 * Validates that a value is not null or undefined.
 *
 * @param {*} value - Value to validate
 * @param {string} [name='value'] - Name of the value (for error message)
 * @throws {Error} If value is null or undefined
 */
function validateNotNull(value, name = 'value') {
  if (value === null || value === undefined) {
    throw new Error(`Validation failed: ${name} is null or undefined`);
  }
  return value;
}

/**
 * Validates that a value is of the expected type.
 *
 * @param {*} value - Value to validate
 * @param {string} expectedType - Expected type name
 * @param {string} [name='value'] - Name of the value (for error message)
 * @throws {Error} If value is not of expected type
 */
function validateType(value, expectedType, name = 'value') {
  let actualType = typeof value;
  
  if (expectedType === 'array') {
    actualType = Array.isArray(value) ? 'array' : actualType;
  }
  
  if (actualType !== expectedType) {
    throw new Error(`Validation failed: ${name} should be ${expectedType}, but got ${actualType}`);
  }
  return value;
}

/**
 * Validates that a value is a non-empty string.
 *
 * @param {*} value - Value to validate
 * @param {string} [name='value'] - Name of the value (for error message)
 * @throws {Error} If value is not a non-empty string
 */
function validateString(value, name = 'value') {
  validateType(value, 'string', name);
  if (value.trim() === '') {
    throw new Error(`Validation failed: ${name} is an empty string`);
  }
  return value;
}

/**
 * Validates that a value is a number within a range.
 *
 * @param {*} value - Value to validate
 * @param {number} [min=0] - Minimum value (inclusive)
 * @param {number} [max=Infinity] - Maximum value (inclusive)
 * @param {string} [name='value'] - Name of the value (for error message)
 * @throws {Error} If value is not a number in the specified range
 */
function validateNumber(value, min = 0, max = Infinity, name = 'value') {
  validateType(value, 'number', name);
  if (value < min || value > max) {
    throw new Error(`Validation failed: ${name} should be between ${min} and ${max}, but got ${value}`);
  }
  return value;
}

/**
 * Validates that an array contains only elements of the expected type.
 *
 * @param {Array} array - Array to validate
 * @param {string} expectedType - Expected type of array elements
 * @param {string} [name='array'] - Name of the array (for error message)
 * @throws {Error} If array is not an array or contains elements of wrong type
 */
function validateArrayElements(array, expectedType, name = 'array') {
  validateType(array, 'array', name);
  
  for (let i = 0; i < array.length; i++) {
    const element = array[i];
    const actualType = typeof element;
    
    if (expectedType === 'array') {
      if (!Array.isArray(element)) {
        throw new Error(`Validation failed: ${name}[${i}] should be array, but got ${actualType}`);
      }
    } else if (actualType !== expectedType) {
      throw new Error(`Validation failed: ${name}[${i}] should be ${expectedType}, but got ${actualType}`);
    }
  }
  
  return array;
}

/**
 * Creates a standardized error object.
 *
 * @param {ErrorType} type - Error type
 * @param {ErrorSeverity} severity - Error severity
 * @param {string} message - Error message
 * @param {Object} [context={}] - Additional context
 * @returns {ErrorDetails} Standardized error object
 */
function createError(type, severity, message, context = {}) {
  return {
    type,
    severity,
    message,
    error: null,
    context,
    module: context.module || ''
  };
}

/**
 * Normalizes an error into a standard error details object.
 *
 * @param {Error|ErrorDetails} error - Error to normalize
 * @param {Object} [context={}] - Additional context
 * @returns {ErrorDetails} Normalized error details
 */
function normalizeError(error, context = {}) {
  // If it's already an error details object, return it
  if (error && typeof error === 'object' && error.type && error.severity) {
    return {
      ...error,
      context: { ...error.context, ...context }
    };
  }

  // If it's a standard Error object
  if (error instanceof Error) {
    return {
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.HIGH,
      message: error.message || 'An unknown error occurred',
      error: error,
      context: context,
      module: context.module || ''
    };
  }

  // If it's a string or other type
  return {
    type: ErrorType.UNKNOWN,
    severity: ErrorSeverity.MEDIUM,
    message: String(error),
    error: null,
    context: context,
    module: context.module || ''
  };
}

/**
 * Checks if browser API is available.
 *
 * @param {string} apiPath - Path to browser API (e.g., 'browser.menus')
 * @returns {boolean} True if API is available
 */
function isApiAvailable(apiPath) {
  try {
    const parts = apiPath.split('.');
    let current = browser;
    for (const part of parts) {
      if (!current[part]) {
        return false;
      }
      current = current[part];
    }
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Asserts that a condition is true, throws an error if not.
 *
 * @param {boolean} condition - Condition to assert
 * @param {string} [message='Assertion failed'] - Error message if assertion fails
 * @throws {Error} If condition is false
 */
function assert(condition, message = 'Assertion failed') {
  if (!condition) {
    throw new Error(message);
  }
}

// Export all functions and constants
const errors = {
  ErrorType,
  ErrorSeverity,
  logError,
  showErrorNotification,
  wrapAsync,
  wrapSync,
  validateNotNull,
  validateType,
  validateArrayElements,
  validateString,
  validateNumber,
  createError,
  normalizeError,
  isApiAvailable,
  assert
};

// For use in browser extension context
if (typeof module !== 'undefined' && module.exports) {
  module.exports = errors;
}

// Export for ES6 modules
if (typeof window !== 'undefined') {
  window.QuickFilterByErrors = errors;
}
