/**
 * Logging utilities for QuickFilterBy extension.
 * Provides configurable log levels, file logging, and log export functionality.
 *
 * @module logger
 */

/**
 * Log level constants.
 * @enum {string}
 */
const LogLevel = {
  /** Debug-level messages (detailed info) */
  DEBUG: 'DEBUG',

  /** Info-level messages (general info) */
  INFO: 'INFO',

  /** Warning-level messages (potential issues) */
  WARN: 'WARN',

  /** Error-level messages (errors and failures) */
  ERROR: 'ERROR'
};

/**
 * Current log level.
 * @type {string}
 */
let currentLogLevel = LogLevel.WARN;

/**
 * In-memory log buffer.
 * @type {Array<Object>}
 */
const logBuffer = [];

/**
 * Maximum log entries to keep in buffer.
 * @constant {number}
 */
const MAX_LOG_ENTRIES = 1000;

/**
 * Maximum log buffer size in bytes.
 * @constant {number}
 */
const MAX_LOG_SIZE = 1024 * 1024; // 1MB

// ============================================================================
// LOG LEVEL MANAGEMENT
// ============================================================================

/**
 * Sets the current log level.
 * Only messages at this level or higher will be logged.
 *
 * @param {string} level - Log level (DEBUG, INFO, WARN, ERROR)
 */
function setLogLevel(level) {
  if (!Object.values(LogLevel).includes(level)) {
    console.warn('[Logger] Invalid log level:', level);
    return;
  }

  currentLogLevel = level;
  console.log('[Logger] Log level set to:', level);
}

/**
 * Gets the current log level.
 *
 * @returns {string} Current log level
 */
function getLogLevel() {
  return currentLogLevel;
}

/**
 * Checks if DEBUG level is enabled.
 *
 * @returns {boolean} True if DEBUG is enabled
 */
function isDebugEnabled() {
  return currentLogLevel === LogLevel.DEBUG;
}

/**
 * Checks if INFO level is enabled.
 *
 * @returns {boolean} True if INFO or higher is enabled
 */
function isInfoEnabled() {
  return currentLogLevel === LogLevel.DEBUG || currentLogLevel === LogLevel.INFO;
}

/**
 * Checks if WARN level is enabled.
 *
 * @returns {boolean} True if WARN or higher is enabled
 */
function isWarnEnabled() {
  return currentLogLevel === LogLevel.DEBUG ||
         currentLogLevel === LogLevel.INFO ||
         currentLogLevel === LogLevel.WARN;
}

// ============================================================================
// LOGGING FUNCTIONS
// ============================================================================

/**
 * Adds a log entry to the buffer.
 * Handles rotation if buffer is too large.
 *
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} [context={}] - Additional context
 * @param {Error} [error=null] - Error object if applicable
 */
function addToBuffer(level, message, context = {}, error = null) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
    error: error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : null
  };

  // Add to buffer
  logBuffer.push(entry);

  // Prune buffer if too large
  pruneBuffer();
}

/**
 * Prunes the log buffer if it exceeds limits.
 */
function pruneBuffer() {
  // Remove oldest entries if too many
  while (logBuffer.length > MAX_LOG_ENTRIES) {
    logBuffer.shift();
  }

  // Calculate size and remove if too large
  let size = JSON.stringify(logBuffer).length;
  while (size > MAX_LOG_SIZE && logBuffer.length > 0) {
    logBuffer.shift();
    size = JSON.stringify(logBuffer).length;
  }
}

/**
 * Logs a DEBUG level message.
 *
 * @param {string} message - Message to log
 * @param {Object} [context={}] - Additional context
 */
function debug(message, context = {}) {
  if (isDebugEnabled()) {
    const prefix = '[DEBUG]';
    console.log(prefix, message, context);
    addToBuffer(LogLevel.DEBUG, message, context);
  }
}

/**
 * Logs an INFO level message.
 *
 * @param {string} message - Message to log
 * @param {Object} [context={}] - Additional context
 */
function info(message, context = {}) {
  if (isInfoEnabled()) {
    const prefix = '[INFO]';
    console.info(prefix, message, context);
    addToBuffer(LogLevel.INFO, message, context);
  }
}

/**
 * Logs a WARN level message.
 *
 * @param {string} message - Message to log
 * @param {Object} [context={}] - Additional context
 */
function warn(message, context = {}) {
  if (isWarnEnabled()) {
    const prefix = '[WARN]';
    console.warn(prefix, message, context);
    addToBuffer(LogLevel.WARN, message, context);
  }
}

/**
 * Logs an ERROR level message.
 *
 * @param {string} message - Message to log
 * @param {Error} [error=null] - Error object
 * @param {Object} [context={}] - Additional context
 */
function error(message, error = null, context = {}) {
  const prefix = '[ERROR]';
  console.error(prefix, message, error || '', context);
  addToBuffer(LogLevel.ERROR, message, context, error);
}

// ============================================================================
// SETTINGS INTEGRATION
// ============================================================================

/**
 * Loads log level from storage.
 * Should be called on extension startup.
 */
async function loadLogLevelFromSettings() {
  try {
    if (!browser || !browser.storage) {
      return;
    }

    const result = await browser.storage.sync.get('logLevel');
    if (result.logLevel && Object.values(LogLevel).includes(result.logLevel)) {
      setLogLevel(result.logLevel);
    }
  } catch (error) {
    console.error('[Logger] Error loading log level from settings:', error);
  }
}

/**
 * Saves log level to storage.
 *
 * @param {string} level - Log level to save
 */
async function saveLogLevelToSettings(level) {
  try {
    if (!browser || !browser.storage) {
      return;
    }

    await browser.storage.sync.set({ logLevel: level });
    setLogLevel(level);
  } catch (error) {
    console.error('[Logger] Error saving log level to settings:', error);
  }
}

// ============================================================================
// LOG EXPORT
// ============================================================================

/**
 * Gets all log entries from buffer.
 *
 * @returns {Array<Object>} All log entries
 */
function getLogs() {
  return [...logBuffer];
}

/**
 * Clears the log buffer.
 */
function clearLogs() {
  logBuffer.length = 0;
  console.log('[Logger] Log buffer cleared');
}

/**
 * Exports logs as JSON string.
 *
 * @returns {string} JSON string of all logs
 */
function exportLogsAsJSON() {
  return JSON.stringify(logBuffer, null, 2);
}

/**
 * Exports logs as formatted text.
 *
 * @returns {string} Formatted text of all logs
 */
function exportLogsAsText() {
  return logBuffer.map(entry => {
    let text = `[${entry.timestamp}] [${entry.level}] ${entry.message}`;

    if (entry.context && Object.keys(entry.context).length > 0) {
      text += ` ${JSON.stringify(entry.context)}`;
    }

    if (entry.error) {
      text += `\n  Error: ${entry.error.message}`;
      if (entry.error.stack) {
        text += `\n  Stack: ${entry.error.stack}`;
      }
    }

    return text;
  }).join('\n');
}

/**
 * Downloads logs as a file.
 *
 * @param {string} format - Export format ('json' or 'text')
 */
async function downloadLogs(format = 'text') {
  try {
    const content = format === 'json' ? exportLogsAsJSON() : exportLogsAsText();
    const filename = `quickfilterby-logs-${new Date().toISOString().replace(/[:.]/g, '-')}.${format}`;

    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
    console.log('[Logger] Logs downloaded:', filename);
  } catch (error) {
    console.error('[Logger] Error downloading logs:', error);
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initializes the logger.
 * Loads settings and sets initial log level.
 */
async function init() {
  await loadLogLevelFromSettings();
  console.log('[Logger] Initialized with log level:', currentLogLevel);
}

// Export all functions and constants
const logger = {
  // Constants
  LogLevel,

  // Log level management
  setLogLevel,
  getLogLevel,
  isDebugEnabled,
  isInfoEnabled,
  isWarnEnabled,

  // Logging functions
  debug,
  info,
  warn,
  error,

  // Settings integration
  loadLogLevelFromSettings,
  saveLogLevelToSettings,

  // Log export
  getLogs,
  clearLogs,
  exportLogsAsJSON,
  exportLogsAsText,
  downloadLogs,

  // Initialization
  init
};

// For use in browser extension context
if (typeof module !== 'undefined' && module.exports) {
  module.exports = logger;
}

// Export for ES6 modules
if (typeof window !== 'undefined') {
  window.QuickFilterByLogger = logger;
}
