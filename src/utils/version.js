/**
 * Version detection and compatibility utilities for QuickFilterBy extension.
 * Provides Thunderbird version detection, feature capability checking, and compatibility management.
 *
 * @module version
 */

/**
 * Thunderbird version object structure.
 * @typedef {Object} Version
 * @property {number} major - Major version number
 * @property {number} minor - Minor version number
 * @property {number} patch - Patch version number
 * @property {string} full - Full version string
 * @property {string} comparison - Comparison string (for comparisons)
 */

/**
 * Supported Thunderbird version range.
 * @constant {Object}
 */
const SUPPORTED_VERSION = {
  MIN_MAJOR: 115,
  MIN_MINOR: 0,
  MAX_MAJOR: 140,
  MAX_MINOR: 999
};

/**
 * Feature capability flags.
 * @typedef {Object} FeatureCapabilities
 * @property {boolean} threadPane - ThreadPane DOM access available
 * @property {boolean} quickFilter - Quick filter API available
 * @property {boolean} menus - Context menus API available
 * @property {boolean} storage - Storage API available
 * @property {boolean} experimentalAPI - Experimental API system available
 * @property {boolean} altClick - Alt-click functionality available
 */

/**
 * API availability flags.
 * @typedef {Object} APIAvailability
 * @property {boolean} browser - Browser APIs available
 * @property {boolean} mailTabs - Mail tabs API available
 * @property {boolean} menus - Menus API available
 * @property {boolean} storage - Storage API available
 * @property {boolean} runtime - Runtime API available
 * @property {boolean} extensionCommon - ExtensionCommon available
 * @property {boolean} services - Services available
 */

/**
 * Compatibility status levels.
 * @enum {string}
 */
const CompatibilityStatus = {
  /** Extension fully compatible */
  COMPATIBLE: 'COMPATIBLE',

  /** Extension below minimum version */
  TOO_OLD: 'TOO_OLD',

  /** Extension above maximum version */
  TOO_NEW: 'TOO_NEW',

  /** Unknown version (can't determine) */
  UNKNOWN: 'UNKNOWN',

  /** Some features not available */
  DEGRADED: 'DEGRADED'
};

// ============================================================================
// VERSION DETECTION
// ============================================================================

/**
 * Current detected Thunderbird version.
 * Cached after first detection.
 *
 * @type {Version|null}
 */
let currentVersion = null;

/**
 * Gets the current Thunderbird version.
 * Caches the result for subsequent calls.
 *
 * @returns {Promise<Version>} Thunderbird version object
 */
async function getThunderbirdVersion() {
  if (currentVersion) {
    return currentVersion;
  }

  try {
    const browserInfo = await browser.runtime.getBrowserInfo();
    const versionString = browserInfo.version || browserInfo.browserVersion || '0.0.0';

    currentVersion = parseVersion(versionString);
    return currentVersion;
  } catch (error) {
    console.error('[Version] Failed to get Thunderbird version:', error);
    return {
      major: 0,
      minor: 0,
      patch: 0,
      full: '0.0.0',
      comparison: '0.0.0'
    };
  }
}

/**
 * Parses a version string into version object.
 *
 * @param {string} versionString - Version string (e.g., "115.0.1")
 * @returns {Version} Parsed version object
 */
function parseVersion(versionString) {
  try {
    const parts = versionString.split('.').map(p => parseInt(p, 10) || 0);
    const [major = 0, minor = 0, patch = 0] = parts;

    return {
      major,
      minor,
      patch,
      full: versionString,
      comparison: `${major}.${minor}.${patch}`
    };
  } catch (error) {
    console.error('[Version] Failed to parse version string:', versionString, error);
    return {
      major: 0,
      minor: 0,
      patch: 0,
      full: versionString,
      comparison: '0.0.0'
    };
  }
}

/**
 * Compares two version objects.
 *
 * @param {Version} version1 - First version to compare
 * @param {Version} version2 - Second version to compare
 * @returns {number} -1 if version1 < version2, 0 if equal, 1 if version1 > version2
 */
function compareVersions(version1, version2) {
  if (version1.major !== version2.major) {
    return version1.major < version2.major ? -1 : 1;
  }
  if (version1.minor !== version2.minor) {
    return version1.minor < version2.minor ? -1 : 1;
  }
  if (version1.patch !== version2.patch) {
    return version1.patch < version2.patch ? -1 : 1;
  }
  return 0;
}

/**
 * Checks if current version is within supported range.
 *
 * @param {Version} version - Version to check
 * @returns {CompatibilityStatus} Compatibility status
 */
function checkCompatibility(version) {
  if (!version || version.major === 0) {
    return CompatibilityStatus.UNKNOWN;
  }

  // Check minimum version
  const minVersion = {
    major: SUPPORTED_VERSION.MIN_MAJOR,
    minor: SUPPORTED_VERSION.MIN_MINOR,
    patch: 0,
    full: `${SUPPORTED_VERSION.MIN_MAJOR}.${SUPPORTED_VERSION.MIN_MINOR}.0`,
    comparison: `${SUPPORTED_VERSION.MIN_MAJOR}.${SUPPORTED_VERSION.MIN_MINOR}.0`
  };

  if (compareVersions(version, minVersion) < 0) {
    return CompatibilityStatus.TOO_OLD;
  }

  // Check maximum version
  const maxVersion = {
    major: SUPPORTED_VERSION.MAX_MAJOR,
    minor: SUPPORTED_VERSION.MAX_MINOR,
    patch: 0,
    full: `${SUPPORTED_VERSION.MAX_MAJOR}.${SUPPORTED_VERSION.MAX_MINOR}.0`,
    comparison: `${SUPPORTED_VERSION.MAX_MAJOR}.${SUPPORTED_VERSION.MAX_MINOR}.0`
  };

  if (compareVersions(version, maxVersion) > 0) {
    return CompatibilityStatus.TOO_NEW;
  }

  return CompatibilityStatus.COMPATIBLE;
}

/**
 * Gets compatibility status for current Thunderbird version.
 *
 * @returns {Promise<Object>} Compatibility information
 */
async function getCompatibilityStatus() {
  const version = await getThunderbirdVersion();
  const status = checkCompatibility(version);

  return {
    version,
    status,
    isCompatible: status === CompatibilityStatus.COMPATIBLE || status === CompatibilityStatus.DEGRADED,
    minVersion: `${SUPPORTED_VERSION.MIN_MAJOR}.${SUPPORTED_VERSION.MIN_MINOR}.0`,
    maxVersion: `${SUPPORTED_VERSION.MAX_MAJOR}.999.0`
  };
}

/**
 * Enforces minimum version requirement.
 * Shows warning if version is too old or too new.
 *
 * @returns {Promise<boolean>} True if version is compatible
 */
async function enforceVersion() {
  const compat = await getCompatibilityStatus();

  switch (compat.status) {
    case CompatibilityStatus.TOO_OLD:
      console.warn('[Version] Thunderbird version too old:', compat.version.full);
      console.warn('[Version] Minimum required:', compat.minVersion);
      if (browser.notifications) {
        await browser.notifications.create({
          type: 'basic',
          iconUrl: browser.runtime.getURL('icon48.png') || '',
          title: 'QuickFilterBy - Incompatible Version',
          message: `Thunderbird ${compat.version.full} is not supported. Please upgrade to ${compat.minVersion} or later.`
        });
      }
      return false;

    case CompatibilityStatus.TOO_NEW:
      console.warn('[Version] Thunderbird version too new:', compat.version.full);
      console.warn('[Version] Maximum supported:', compat.maxVersion);
      if (browser.notifications) {
        await browser.notifications.create({
          type: 'basic',
          iconUrl: browser.runtime.getURL('icon48.png') || '',
          title: 'QuickFilterBy - Incompatible Version',
          message: `Thunderbird ${compat.version.full} is not yet supported. Maximum supported: ${compat.maxVersion}.`
        });
      }
      return false;

    case CompatibilityStatus.UNKNOWN:
      console.warn('[Version] Could not determine Thunderbird version');
      // Don't show notification for unknown - might be a test environment
      return true;

    default:
      console.log('[Version] Thunderbird version compatible:', compat.version.full);
      return true;
  }
}

/**
 * Gets version-specific code path to use.
 * Some features may need different implementations for different TB versions.
 *
 * @param {Version} version - Thunderbird version
 * @returns {string} Code path identifier
 */
function getVersionCodePath(version) {
  if (version.major >= 128) {
    return 'v128+';
  } else if (version.major >= 120) {
    return 'v120-127';
  } else if (version.major >= 115) {
    return 'v115-119';
  } else {
    return 'legacy';
  }
}

// ============================================================================
// FEATURE CAPABILITY DETECTION
// ============================================================================

/**
 * Current detected feature capabilities.
 * Cached after first detection.
 *
 * @type {FeatureCapabilities|null}
 */
let featureCapabilities = null;

/**
 * Detects available features based on TB version and API availability.
 *
 * @returns {Promise<FeatureCapabilities>} Detected feature capabilities
 */
async function detectFeatures() {
  if (featureCapabilities) {
    return featureCapabilities;
  }

  const version = await getThunderbirdVersion();
  const capabilities = {
    threadPane: version.major >= 115, // about:3pane introduced in TB 115
    quickFilter: true, // Always true in supported versions
    menus: checkAPIAvailable('browser.menus'),
    storage: checkAPIAvailable('browser.storage'),
    experimentalAPI: version.major >= 115, // Experimental APIs available in TB 115+
    altClick: version.major >= 115 // Alt-click needs experimental API
  };

  featureCapabilities = capabilities;
  return capabilities;
}

/**
 * Checks if a specific feature is available.
 *
 * @param {string} featureName - Name of feature to check
 * @returns {Promise<boolean>} True if feature is available
 */
async function isFeatureAvailable(featureName) {
  const features = await detectFeatures();
  return features[featureName] === true;
}

/**
 * Gets version-specific code path.
 *
 * @returns {Promise<string>} Code path identifier
 */
async function getCodePath() {
  const version = await getThunderbirdVersion();
  return getVersionCodePath(version);
}

// ============================================================================
// API AVAILABILITY TESTING
// ============================================================================

/**
 * Checks if a browser API is available.
 * Uses duck typing to safely check nested API paths.
 *
 * @param {string} apiPath - Path to browser API (e.g., 'browser.menus')
 * @returns {boolean} True if API is available
 */
function checkAPIAvailable(apiPath) {
  try {
    if (!browser) {
      return false;
    }

    const parts = apiPath.split('.');
    let current = browser;

    for (const part of parts) {
      if (!current || !current[part]) {
        return false;
      }
      current = current[part];
    }

    return true;
  } catch (error) {
    console.warn('[Version] API check failed for', apiPath, error);
    return false;
  }
}

/**
 * Gets current API availability status.
 *
 * @returns {Promise<APIAvailability>} API availability object
 */
async function getAPIAvailability() {
  return {
    browser: typeof browser !== 'undefined',
    mailTabs: checkAPIAvailable('browser.mailTabs'),
    menus: checkAPIAvailable('browser.menus'),
    storage: checkAPIAvailable('browser.storage'),
    runtime: checkAPIAvailable('browser.runtime'),
    tabs: checkAPIAvailable('browser.tabs'),
    i18n: checkAPIAvailable('browser.i18n'),
    notifications: checkAPIAvailable('browser.notifications'),
    extensionCommon: typeof ExtensionCommon !== 'undefined', // Checked in MessagesListAdapter
    services: typeof Services !== 'undefined' // Checked in MessagesListAdapter
  };
}

/**
 * Checks if all required APIs are available.
 *
 * @returns {Promise<boolean>} True if all required APIs available
 */
async function checkRequiredAPIs() {
  const availability = await getAPIAvailability();
  const required = ['browser', 'runtime', 'mailTabs', 'menus'];

  return required.every(api => availability[api] === true);
}

/**
 * Checks if experimental API system is available.
 * This is checked in the MessagesListAdapter implementation.
 *
 * @returns {boolean} True if experimental API system is available
 */
function checkExperimentalAPI() {
  try {
    return (
      typeof ExtensionCommon !== 'undefined' &&
      typeof ExtensionCommon.ExtensionAPI !== 'undefined' &&
      typeof Services !== 'undefined'
    );
  } catch (error) {
    console.warn('[Version] Experimental API check failed:', error);
    return false;
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initializes version detection.
 * Should be called on extension startup.
 *
 * @returns {Promise<Object>} Initialization result
 */
async function initVersionDetection() {
  try {
    const version = await getThunderbirdVersion();
    const features = await detectFeatures();
    const apiStatus = await getAPIAvailability();
    const compatibility = await getCompatibilityStatus();
    const isCompatible = await enforceVersion();

    console.log('[Version] Initialization complete:');
    console.log('  Version:', version.full);
    console.log('  Compatibility:', compatibility.status);
    console.log('  Features:', JSON.stringify(features));
    console.log('  APIs:', JSON.stringify(apiStatus));

    return {
      version,
      features,
      apiStatus,
      compatibility,
      isCompatible
    };
  } catch (error) {
    console.error('[Version] Initialization failed:', error);
    return {
      error: error.message,
      isCompatible: true // Assume compatible on error to avoid blocking
    };
  }
}

// Export all functions and constants
const version = {
  // Constants
  SUPPORTED_VERSION,
  CompatibilityStatus,

  // Version detection
  getThunderbirdVersion,
  parseVersion,
  compareVersions,
  checkCompatibility,
  getCompatibilityStatus,
  enforceVersion,
  getVersionCodePath,
  getCodePath,

  // Feature detection
  detectFeatures,
  isFeatureAvailable,

  // API availability
  checkAPIAvailable,
  getAPIAvailability,
  checkRequiredAPIs,
  checkExperimentalAPI,

  // Initialization
  initVersionDetection
};

// For use in browser extension context
if (typeof module !== 'undefined' && module.exports) {
  module.exports = version;
}

// Export for ES6 modules
if (typeof window !== 'undefined') {
  window.QuickFilterByVersion = version;
}
