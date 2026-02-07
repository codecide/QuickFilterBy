/**
 * Feature flag system for QuickFilterBy extension.
 * Provides runtime feature detection, state management, and conditional functionality.
 *
 * @module features
 */

/**
 * Feature flag definitions.
 * @constant {Object}
 */
const FEATURE_FLAGS = {
  /** Alt-click filtering feature */
  ALT_CLICK: 'ALT_CLICK',

  /** Context menu filtering feature */
  CONTEXT_MENUS: 'CONTEXT_MENUS',

  /** Custom filter combinations feature (Phase 4) */
  CUSTOM_FILTERS: 'CUSTOM_FILTERS',

  /** Date filtering feature (Phase 4) */
  DATE_FILTER: 'DATE_FILTER',

  /** Tag filtering feature (Phase 4) */
  TAG_FILTER: 'TAG_FILTER',

  /** Attachment status filtering feature (Phase 4) */
  ATTACHMENT_FILTER: 'ATTACHMENT_FILTER',

  /** Read/unread filtering feature (Phase 4) */
  READ_STATUS_FILTER: 'READ_STATUS_FILTER',

  /** Filter history feature */
  FILTER_HISTORY: 'FILTER_HISTORY',

  /** Folder/account filtering feature (Phase 4) */
  FOLDER_FILTER: 'FOLDER_FILTER',

  /** Keyboard shortcuts feature (Phase 4) */
  KEYBOARD_SHORTCUTS: 'KEYBOARD_SHORTCUTS'
};

/**
 * Default feature states.
 * @constant {Object}
 */
const DEFAULT_FEATURE_STATES = {
  [FEATURE_FLAGS.ALT_CLICK]: { enabled: true, available: true, failures: 0 },
  [FEATURE_FLAGS.CONTEXT_MENUS]: { enabled: true, available: true, failures: 0 },
  [FEATURE_FLAGS.CUSTOM_FILTERS]: { enabled: false, available: false, failures: 0 },
  [FEATURE_FLAGS.DATE_FILTER]: { enabled: false, available: false, failures: 0 },
  [FEATURE_FLAGS.TAG_FILTER]: { enabled: false, available: false, failures: 0 },
  [FEATURE_FLAGS.ATTACHMENT_FILTER]: { enabled: false, available: false, failures: 0 },
  [FEATURE_FLAGS.READ_STATUS_FILTER]: { enabled: false, available: false, failures: 0 },
  [FEATURE_FLAGS.FILTER_HISTORY]: { enabled: true, available: true, failures: 0 },
  [FEATURE_FLAGS.FOLDER_FILTER]: { enabled: false, available: false, failures: 0 },
  [FEATURE_FLAGS.KEYBOARD_SHORTCUTS]: { enabled: false, available: false, failures: 0 }
};

/**
 * Current feature states.
 * @type {Object<string, Object>}
 */
let featureStates = { ...DEFAULT_FEATURE_STATES };

/**
 * Failure threshold before auto-disabling a feature.
 * @constant {number}
 */
const FAILURE_THRESHOLD = 3;

// ============================================================================
// FEATURE DETECTION
// ============================================================================

/**
 * Detects which features are available in the current environment.
 *
 * @returns {Promise<Object>} Available features
 */
async function detectAvailableFeatures() {
  const available = {};

  // Alt-click requires experimental API and threadPane access
  try {
    available[FEATURE_FLAGS.ALT_CLICK] =
      typeof browser.MessagesListAdapter !== 'undefined';
  } catch (error) {
    available[FEATURE_FLAGS.ALT_CLICK] = false;
  }

  // Context menus require browser.menus API
  try {
    available[FEATURE_FLAGS.CONTEXT_MENUS] =
      typeof browser.menus !== 'undefined';
  } catch (error) {
    available[FEATURE_FLAGS.CONTEXT_MENUS] = false;
  }

  // Quick filter API required for most features
  try {
    const hasQuickFilter = typeof browser.mailTabs?.setQuickFilter !== 'undefined';
    available[FEATURE_FLAGS.FILTER_HISTORY] = hasQuickFilter;
  } catch (error) {
    available[FEATURE_FLAGS.FILTER_HISTORY] = false;
  }

  // Features from Phase 4 are not yet implemented
  available[FEATURE_FLAGS.CUSTOM_FILTERS] = false;
  available[FEATURE_FLAGS.DATE_FILTER] = false;
  available[FEATURE_FLAGS.TAG_FILTER] = false;
  available[FEATURE_FLAGS.ATTACHMENT_FILTER] = false;
  available[FEATURE_FLAGS.READ_STATUS_FILTER] = false;
  available[FEATURE_FLAGS.FOLDER_FILTER] = false;
  available[FEATURE_FLAGS.KEYBOARD_SHORTCUTS] = false;

  console.log('[Features] Detected available features:', available);
  return available;
}

/**
 * Checks if a specific feature is available.
 *
 * @param {string} featureName - Feature flag name
 * @returns {boolean} True if feature is available
 */
function isFeatureAvailable(featureName) {
  return featureStates[featureName]?.available === true;
}

/**
 * Checks if a specific feature is enabled.
 *
 * @param {string} featureName - Feature flag name
 * @returns {boolean} True if feature is enabled
 */
function isFeatureEnabled(featureName) {
  return featureStates[featureName]?.enabled === true &&
         featureStates[featureName]?.available === true;
}

// ============================================================================
// FEATURE STATE MANAGEMENT
// ============================================================================

/**
 * Enables a feature.
 *
 * @param {string} featureName - Feature flag name
 * @returns {boolean} True if feature is now enabled
 */
function enableFeature(featureName) {
  if (!featureStates[featureName]) {
    console.warn(`[Features] Unknown feature: ${featureName}`);
    return false;
  }

  if (!featureStates[featureName].available) {
    console.warn(`[Features] Cannot enable unavailable feature: ${featureName}`);
    return false;
  }

  featureStates[featureName].enabled = true;
  featureStates[featureName].failures = 0; // Reset failures on enable

  console.log(`[Features] Enabled feature: ${featureName}`);
  return true;
}

/**
 * Disables a feature.
 *
 * @param {string} featureName - Feature flag name
 * @returns {boolean} True if feature is now disabled
 */
function disableFeature(featureName) {
  if (!featureStates[featureName]) {
    console.warn(`[Features] Unknown feature: ${featureName}`);
    return false;
  }

  featureStates[featureName].enabled = false;

  console.log(`[Features] Disabled feature: ${featureName}`);
  return true;
}

/**
 * Toggles a feature on/off.
 *
 * @param {string} featureName - Feature flag name
 * @returns {boolean} New enabled state
 */
function toggleFeature(featureName) {
  if (isFeatureEnabled(featureName)) {
    return !disableFeature(featureName);
  } else {
    return enableFeature(featureName);
  }
}

/**
 * Records a feature failure.
 * Auto-disables feature after threshold.
 *
 * @param {string} featureName - Feature flag name
 * @returns {boolean} True if feature is still enabled, false if auto-disabled
 */
function recordFeatureFailure(featureName) {
  if (!featureStates[featureName]) {
    return false;
  }

  const state = featureStates[featureName];
  state.failures++;

  console.warn(`[Features] Feature failure: ${featureName} (${state.failures}/${FAILURE_THRESHOLD})`);

  // Auto-disable after threshold
  if (state.failures >= FAILURE_THRESHOLD) {
    disableFeature(featureName);
    console.error(`[Features] Auto-disabled feature after ${FAILURE_THRESHOLD} failures: ${featureName}`);
    return false;
  }

  return true;
}

/**
 * Resets failure count for a feature.
 *
 * @param {string} featureName - Feature flag name
 */
function resetFeatureFailures(featureName) {
  if (featureStates[featureName]) {
    featureStates[featureName].failures = 0;
    console.log(`[Features] Reset failures for: ${featureName}`);
  }
}

/**
 * Gets the current state of all features.
 *
 * @returns {Object>} Current feature states
 */
function getAllFeatureStates() {
  return { ...featureStates };
}

/**
 * Gets the state of a specific feature.
 *
 * @param {string} featureName - Feature flag name
 * @returns {Object|null} Feature state or null
 */
function getFeatureState(featureName) {
  return featureStates[featureName] || null;
}

// ============================================================================
// CONDITIONAL FUNCTIONALITY
// ============================================================================

/**
 * Executes a function only if a feature is enabled.
 *
 * @param {string} featureName - Feature flag name
 * @param {Function} fn - Function to execute
 * @param {*} [fallback] - Fallback value if feature is disabled
 * @returns {*} Result of function or fallback
 */
function withFeature(featureName, fn, fallback = undefined) {
  if (!isFeatureEnabled(featureName)) {
    if (typeof fallback !== 'undefined') {
      return fallback;
    }
    console.warn(`[Features] Feature disabled, skipping: ${featureName}`);
    return null;
  }

  try {
    return fn();
  } catch (error) {
    console.error(`[Features] Error in feature ${featureName}:`, error);
    recordFeatureFailure(featureName);
    return fallback;
  }
}

/**
 * Executes an async function only if a feature is enabled.
 *
 * @param {string} featureName - Feature flag name
 * @param {Function} fn - Async function to execute
 * @param {*} [fallback] - Fallback value if feature is disabled
 * @returns {Promise<*>} Result of function or fallback
 */
async function withFeatureAsync(featureName, fn, fallback = undefined) {
  if (!isFeatureEnabled(featureName)) {
    if (typeof fallback !== 'undefined') {
      return fallback;
    }
    console.warn(`[Features] Feature disabled, skipping: ${featureName}`);
    return null;
  }

  try {
    return await fn();
  } catch (error) {
    console.error(`[Features] Error in feature ${featureName}:`, error);
    recordFeatureFailure(featureName);
    return fallback;
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initializes feature flag system.
 * Detects available features and loads saved states.
 *
 * @returns {Promise<Object>} Initialization result
 */
async function init() {
  try {
    // Detect available features
    const available = await detectAvailableFeatures();

    // Update feature states with availability
    for (const [featureName, isAvailable] of Object.entries(available)) {
      if (featureStates[featureName]) {
        featureStates[featureName].available = isAvailable;
      }
    }

    console.log('[Features] Initialization complete');
    console.log('[Features] Feature states:', getAllFeatureStates());

    return {
      features: getAllFeatureStates(),
      available,
      initialized: true
    };
  } catch (error) {
    console.error('[Features] Initialization failed:', error);
    return {
      features: getAllFeatureStates(),
      error: error.message,
      initialized: false
    };
  }
}

// Export all functions and constants
const features = {
  // Constants
  FEATURE_FLAGS,
  DEFAULT_FEATURE_STATES,
  FAILURE_THRESHOLD,

  // Feature detection
  detectAvailableFeatures,
  isFeatureAvailable,
  isFeatureEnabled,

  // Feature state management
  enableFeature,
  disableFeature,
  toggleFeature,
  recordFeatureFailure,
  resetFeatureFailures,
  getAllFeatureStates,
  getFeatureState,

  // Conditional functionality
  withFeature,
  withFeatureAsync,

  // Initialization
  init
};

// For use in browser extension context
if (typeof module !== 'undefined' && module.exports) {
  module.exports = features;
}

// Export for ES6 modules
if (typeof window !== 'undefined') {
  window.QuickFilterByFeatures = features;
}
