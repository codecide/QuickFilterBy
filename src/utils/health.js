/**
 * Health check utilities for QuickFilterBy extension.
 * Provides startup and periodic health checks, issue detection, and notifications.
 *
 * @module health
 */

/**
 * Health check categories.
 * @enum {string}
 */
const HealthCategory = {
  /** DOM access health */
  DOM: 'DOM',

  /** API availability health */
  API: 'API',

  /** Storage access health */
  STORAGE: 'STORAGE',

  /** Feature functionality health */
  FEATURE: 'FEATURE',

  /** Overall extension health */
  GENERAL: 'GENERAL'
};

/**
 * Health status levels.
 * @enum {string}
 */
const HealthStatus = {
  /** Everything is working correctly */
  HEALTHY: 'HEALTHY',

  /** Some issues detected but extension still works */
  DEGRADED: 'DEGRADED',

  /** Critical issues - extension may not work */
  CRITICAL: 'CRITICAL',

  /** Unknown status */
  UNKNOWN: 'UNKNOWN'
};

/**
 * Last health check results.
 * @type {Object|null}
 */
let lastHealthCheck = null;

/**
 * Periodic health check interval ID.
 * @type {number|null}
 */
let healthCheckInterval = null;

/**
 * Health check interval in milliseconds.
 * @constant {number}
 */
const HEALTH_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// HEALTH CHECK FUNCTIONS
// ============================================================================

/**
 * Performs a comprehensive health check.
 *
 * @returns {Promise<Object>} Health check results
 */
async function checkHealth() {
  const results = {
    timestamp: new Date().toISOString(),
    checks: {},
    overall: {
      status: HealthStatus.HEALTHY,
      issues: [],
      warnings: []
    }
  };

  // Check DOM access
  results.checks.dom = await checkDOMHealth();

  // Check API availability
  results.checks.api = await checkAPIHealth();

  // Check storage access
  results.checks.storage = await checkStorageHealth();

  // Check feature health
  results.checks.features = await checkFeatureHealth();

  // Determine overall status
  results.overall = determineOverallStatus(results);

  // Store results
  lastHealthCheck = results;

  // Log results
  logHealthResults(results);

  return results;
}

/**
 * Checks DOM access health.
 *
 * @returns {Promise<Object>} DOM health check result
 */
async function checkDOMHealth() {
  const result = {
    category: HealthCategory.DOM,
    status: HealthStatus.HEALTHY,
    issues: [],
    checks: {}
  };

  try {
    // Check if we can access about:3pane window
    const tabs = await browser.tabs.query({}).catch(() => []);
    if (tabs.length === 0) {
      result.issues.push('No mail tabs found');
      result.status = HealthStatus.DEGRADED;
    }

    // Check MessagesListAdapter
    result.checks.experimentalAPI = {
      available: typeof browser.MessagesListAdapter !== 'undefined',
      message: 'Experimental API availability'
    };

    if (!result.checks.experimentalAPI.available) {
      result.issues.push('Experimental API not available');
      result.status = HealthStatus.CRITICAL;
    }

  } catch (error) {
    result.issues.push(`DOM check failed: ${error.message}`);
    result.status = HealthStatus.CRITICAL;
  }

  return result;
}

/**
 * Checks API availability health.
 *
 * @returns {Promise<Object>} API health check result
 */
async function checkAPIHealth() {
  const result = {
    category: HealthCategory.API,
    status: HealthStatus.HEALTHY,
    issues: [],
    checks: {}
  };

  // Check required APIs
  const requiredAPIs = [
    { name: 'runtime', available: typeof browser.runtime !== 'undefined' },
    { name: 'mailTabs', available: typeof browser.mailTabs !== 'undefined' },
    { name: 'menus', available: typeof browser.menus !== 'undefined' },
    { name: 'storage', available: typeof browser.storage !== 'undefined' },
    { name: 'tabs', available: typeof browser.tabs !== 'undefined' }
  ];

  requiredAPIs.forEach(api => {
    result.checks[api.name] = {
      available: api.available,
      message: `${api.name} API availability`
    };

    if (!api.available) {
      result.issues.push(`Required API ${api.name} not available`);
      result.status = HealthStatus.CRITICAL;
    }
  });

  // Check quick filter API
  result.checks.quickFilter = {
    available: typeof browser.mailTabs?.setQuickFilter !== 'undefined',
    message: 'Quick filter API availability'
  };

  if (!result.checks.quickFilter.available) {
    result.issues.push('Quick filter API not available');
    result.status = HealthStatus.CRITICAL;
  }

  return result;
}

/**
 * Checks storage access health.
 *
 * @returns {Promise<Object>} Storage health check result
 */
async function checkStorageHealth() {
  const result = {
    category: HealthCategory.STORAGE,
    status: HealthStatus.HEALTHY,
    issues: [],
    checks: {}
  };

  try {
    // Test reading from sync storage
    result.checks.syncStorage = {
      available: typeof browser.storage?.sync !== 'undefined',
      message: 'Sync storage availability'
    };

    if (!result.checks.syncStorage.available) {
      result.issues.push('Sync storage not available');
      result.status = HealthStatus.DEGRADED;
    } else {
      // Try actual read/write
      await browser.storage.sync.set({ _healthCheck: Date.now() });
      await browser.storage.sync.remove('_healthCheck');
      result.checks.syncStorage.working = true;
    }

  } catch (error) {
    result.issues.push(`Storage check failed: ${error.message}`);
    result.status = HealthStatus.CRITICAL;
  }

  return result;
}

/**
 * Checks feature functionality health.
 *
 * @returns {Promise<Object>} Feature health check result
 */
async function checkFeatureHealth() {
  const result = {
    category: HealthCategory.FEATURE,
    status: HealthStatus.HEALTHY,
    issues: [],
    checks: {}
  };

  // Check alt-click feature
  result.checks.altClick = {
    enabled: typeof browser.MessagesListAdapter !== 'undefined',
    message: 'Alt-click feature availability'
  };

  if (!result.checks.altClick.enabled) {
    result.issues.push('Alt-click feature not available (degraded mode)');
    result.status = HealthStatus.DEGRADED;
  }

  // Check context menu feature
  result.checks.contextMenus = {
    enabled: typeof browser.menus !== 'undefined',
    message: 'Context menu feature availability'
  };

  if (!result.checks.contextMenus.enabled) {
    result.issues.push('Context menu feature not available (degraded mode)');
    result.status = HealthStatus.DEGRADED;
  }

  return result;
}

// ============================================================================
// STATUS DETERMINATION
// ============================================================================

/**
 * Determines overall health status from individual checks.
 *
 * @param {Object} results - Health check results
 * @returns {Object} Overall status with issues and warnings
 */
function determineOverallStatus(results) {
  const overall = {
    status: HealthStatus.HEALTHY,
    issues: [],
    warnings: []
  };

  // Collect all issues
  for (const [category, check] of Object.entries(results.checks)) {
    if (check.status === HealthStatus.CRITICAL) {
      overall.status = HealthStatus.CRITICAL;
      overall.issues.push(...check.issues);
    } else if (check.status === HealthStatus.DEGRADED) {
      if (overall.status !== HealthStatus.CRITICAL) {
        overall.status = HealthStatus.DEGRADED;
      }
      overall.warnings.push(...check.issues);
    }
  }

  return overall;
}

// ============================================================================
// LOGGING
// ============================================================================

/**
 * Logs health check results to console.
 *
 * @param {Object} results - Health check results
 */
function logHealthResults(results) {
  console.log('[Health] Health Check Results:');
  console.log('  Timestamp:', results.timestamp);
  console.log('  Overall Status:', results.overall.status);

  if (results.overall.issues.length > 0) {
    console.error('[Health] Critical Issues:');
    results.overall.issues.forEach(issue => console.error('   -', issue));
  }

  if (results.overall.warnings.length > 0) {
    console.warn('[Health] Warnings:');
    results.overall.warnings.forEach(warning => console.warn('   -', warning));
  }

  console.log('[Health] Detailed Checks:');
  for (const [category, check] of Object.entries(results.checks)) {
    console.log(`  [${category}] Status: ${check.status}`);
    if (check.issues.length > 0) {
      console.log(`    Issues:`, check.issues);
    }
  }
}

/**
 * Gets last health check results.
 *
 * @returns {Object|null} Last health check results
 */
function getLastHealthCheck() {
  return lastHealthCheck;
}

// ============================================================================
// PERIODIC HEALTH CHECKS
// ============================================================================

/**
 * Starts periodic health checks.
 *
 * @param {number} [interval=HEALTH_CHECK_INTERVAL] - Check interval in milliseconds
 */
function startPeriodicHealthChecks(interval = HEALTH_CHECK_INTERVAL) {
  if (healthCheckInterval) {
    console.warn('[Health] Periodic health checks already running');
    return;
  }

  console.log('[Health] Starting periodic health checks (every', interval / 60000, 'minutes)');
  healthCheckInterval = setInterval(() => {
    checkHealth().catch(error => {
      console.error('[Health] Periodic health check failed:', error);
    });
  }, interval);
}

/**
 * Stops periodic health checks.
 */
function stopPeriodicHealthChecks() {
  if (!healthCheckInterval) {
    return;
  }

  console.log('[Health] Stopping periodic health checks');
  clearInterval(healthCheckInterval);
  healthCheckInterval = null;
}

/**
 * Checks if periodic health checks are running.
 *
 * @returns {boolean} True if running
 */
function isPeriodicHealthChecksRunning() {
  return healthCheckInterval !== null;
}

// ============================================================================
// ISSUE NOTIFICATIONS
// ============================================================================

/**
 * Shows notification for health issues.
 *
 * @param {string} title - Notification title
 * @param {string} message - Issue message
 * @param {HealthStatus} status - Health status level
 * @param {Object} [options] - Additional options
 */
async function notifyIssue(title, message, status, options = {}) {
  if (!browser.notifications) {
    console.warn('[Health] Notifications not available');
    return;
  }

  const notificationId = `health-${Date.now()}`;

  await browser.notifications.create(notificationId, {
    type: 'basic',
    iconUrl: browser.runtime.getURL('icon48.png') || '',
    title: title,
    message: message,
    priority: status === HealthStatus.CRITICAL ? 2 : 1
  });
}

/**
 * Shows notification for critical health issues.
 *
 * @param {Array<string>} issues - List of critical issues
 */
async function notifyCriticalIssues(issues) {
  if (issues.length === 0) {
    return;
  }

  const message = issues.length === 1
    ? issues[0]
    : `${issues[0]} and ${issues.length - 1} more issues.`;

  await notifyIssue(
    'QuickFilterBy - Critical Issues Detected',
    message,
    HealthStatus.CRITICAL,
    options
  );
}

/**
 * Shows notification for degraded functionality.
 *
 * @param {Array<string>} warnings - List of warnings
 */
async function notifyDegradedMode(warnings) {
  if (warnings.length === 0) {
    return;
  }

  const message = warnings.length === 1
    ? warnings[0]
    : `${warnings[0]} and ${warnings.length - 1} more warnings.`;

  await notifyIssue(
    'QuickFilterBy - Degraded Mode',
    `Some features are not working: ${message}`,
    HealthStatus.DEGRADED,
    options
  );
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initializes health check system.
 * Performs startup check and starts periodic checks.
 *
 * @returns {Promise<Object>} Initialization result
 */
async function init() {
  try {
    console.log('[Health] Initializing health check system...');

    // Perform startup health check
    const results = await checkHealth();

    // Show notifications for critical issues
    if (results.overall.status === HealthStatus.CRITICAL && results.overall.issues.length > 0) {
      await notifyCriticalIssues(results.overall.issues);
    }

    // Show notification for degraded mode
    if (results.overall.status === HealthStatus.DEGRADED && results.overall.warnings.length > 0) {
      await notifyDegradedMode(results.overall.warnings);
    }

    // Start periodic health checks
    startPeriodicHealthChecks();

    console.log('[Health] Health check system initialized');
    return {
      initialized: true,
      lastCheck: results,
      periodic: true
    };
  } catch (error) {
    console.error('[Health] Initialization failed:', error);
    return {
      initialized: false,
      error: error.message
    };
  }
}

/**
 * Cleanup health check system.
 * Stops periodic checks.
 */
function cleanup() {
  console.log('[Health] Cleaning up health check system...');
  stopPeriodicHealthChecks();
  console.log('[Health] Health check system cleaned up');
}

// Export all functions and constants
const health = {
  // Constants
  HealthCategory,
  HealthStatus,
  HEALTH_CHECK_INTERVAL,

  // Health checks
  checkHealth,
  checkDOMHealth,
  checkAPIHealth,
  checkStorageHealth,
  checkFeatureHealth,

  // Status determination
  determineOverallStatus,

  // Logging
  logHealthResults,
  getLastHealthCheck,

  // Periodic checks
  startPeriodicHealthChecks,
  stopPeriodicHealthChecks,
  isPeriodicHealthChecksRunning,

  // Notifications
  notifyIssue,
  notifyCriticalIssues,
  notifyDegradedMode,

  // Initialization
  init,
  cleanup
};

// For use in browser extension context
if (typeof module !== 'undefined' && module.exports) {
  module.exports = health;
}

// Export for ES6 modules
if (typeof window !== 'undefined') {
  window.QuickFilterByHealth = health;
}
