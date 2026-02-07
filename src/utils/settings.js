/**
 * Settings management utilities for QuickFilterBy extension.
 * Provides user preference storage with validation and persistence.
 *
 * @module settings
 */

/**
 * Default settings object.
 * @constant {Object}
 */
const DEFAULT_SETTINGS = {
  /** Enable alt-click functionality */
  altClickEnabled: true,

  /** Default filter type (sender, recipient, subject) */
  defaultFilterType: 'sender',

  /** Which context menus to show */
  showContextMenus: ['sender', 'senderEmail', 'recipient', 'recipients', 'subject'],

  /** Debug mode flag */
  debugMode: false,

  /** Log level (DEBUG, INFO, WARN, ERROR) */
  logLevel: 'WARN',

  /** Custom saved filters */
  customFilters: [],

  /** Filter history */
  filterHistory: [],

  /** Maximum filter history size */
  maxFilterHistory: 50,

  /** Enable filter history */
  filterHistoryEnabled: true,

  /** Enable notifications */
  notificationsEnabled: true,

  /** Last updated version (for migration) */
  lastVersion: '14.0.0'
};

/**
 * Settings cache.
 * Avoids repeated storage reads.
 * @type {Object|null}
 */
let settingsCache = null;

/**
 * Storage change listeners.
 * @type {Array<Function>}
 */
const storageListeners = [];

// ============================================================================
// SETTINGS VALIDATION
// ============================================================================

/**
 * Validates a setting value.
 *
 * @param {string} key - Setting key
 * @param {*} value - Value to validate
 * @returns {boolean} True if value is valid
 */
function validateSetting(key, value) {
  switch (key) {
    case 'altClickEnabled':
      return typeof value === 'boolean';

    case 'defaultFilterType':
      return ['sender', 'recipient', 'subject'].includes(value);

    case 'showContextMenus':
      return Array.isArray(value) &&
             value.every(item => ['sender', 'senderEmail', 'recipient', 'recipients', 'subject'].includes(item));

    case 'debugMode':
      return typeof value === 'boolean';

    case 'logLevel':
      return ['DEBUG', 'INFO', 'WARN', 'ERROR'].includes(value);

    case 'customFilters':
      return Array.isArray(value);

    case 'filterHistory':
      return Array.isArray(value);

    case 'maxFilterHistory':
      return typeof value === 'number' && value >= 0 && value <= 1000;

    case 'filterHistoryEnabled':
      return typeof value === 'boolean';

    case 'notificationsEnabled':
      return typeof value === 'boolean';

    case 'lastVersion':
      return typeof value === 'string';

    default:
      return true; // Unknown settings pass through
  }
}

/**
 * Validates all settings in an object.
 *
 * @param {Object} settings - Settings object to validate
 * @returns {Object} Object with validation results
 */
function validateSettings(settings) {
  const results = {};
  for (const [key, value] of Object.entries(settings)) {
    results[key] = {
      valid: validateSetting(key, value),
      value
    };
  }
  return results;
}

// ============================================================================
// SETTINGS STORAGE
// ============================================================================

/**
 * Gets a single setting value.
 *
 * @param {string} key - Setting key
 * @param {*} [defaultValue] - Default value if not found
 * @returns {Promise<*>} Setting value
 */
async function getSetting(key, defaultValue) {
  try {
    // Check cache first
    if (settingsCache && settingsCache.hasOwnProperty(key)) {
      return settingsCache[key];
    }

    if (!browser || !browser.storage) {
      return DEFAULT_SETTINGS[key] || defaultValue;
    }

    // Read from storage
    const result = await browser.storage.sync.get(key);

    // Get value or default
    let value = result[key];

    if (value === undefined || value === null) {
      value = DEFAULT_SETTINGS[key] || defaultValue;
    }

    // Validate value
    if (!validateSetting(key, value)) {
      console.warn(`[Settings] Invalid value for ${key}:`, value);
      value = DEFAULT_SETTINGS[key] || defaultValue;
    }

    // Update cache
    if (!settingsCache) settingsCache = {};
    settingsCache[key] = value;

    return value;
  } catch (error) {
    console.error(`[Settings] Error getting ${key}:`, error);
    return DEFAULT_SETTINGS[key] || defaultValue;
  }
}

/**
 * Gets all settings.
 *
 * @returns {Promise<Object>} All settings
 */
async function getAllSettings() {
  try {
    if (!browser || !browser.storage) {
      return { ...DEFAULT_SETTINGS };
    }

    // Read all from storage
    const stored = await browser.storage.sync.get();

    // Merge with defaults
    const settings = { ...DEFAULT_SETTINGS, ...stored };

    // Validate all settings
    const results = validateSettings(settings);
    for (const [key, result] of Object.entries(results)) {
      if (!result.valid) {
        settings[key] = DEFAULT_SETTINGS[key];
        console.warn(`[Settings] Invalid value for ${key}:`, result.value);
      }
    }

    // Update cache
    settingsCache = { ...settings };

    return settings;
  } catch (error) {
    console.error('[Settings] Error getting all settings:', error);
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Sets a single setting value.
 *
 * @param {string} key - Setting key
 * @param {*} value - Value to set
 * @returns {Promise<boolean>} True if successful
 */
async function setSetting(key, value) {
  try {
    // Validate value
    if (!validateSetting(key, value)) {
      console.warn(`[Settings] Invalid value for ${key}:`, value);
      return false;
    }

    if (!browser || !browser.storage) {
      // Update cache only
      if (!settingsCache) settingsCache = {};
      settingsCache[key] = value;
      return true;
    }

    // Save to storage
    await browser.storage.sync.set({ [key]: value });

    // Update cache
    if (!settingsCache) settingsCache = {};
    settingsCache[key] = value;

    console.log(`[Settings] Set ${key}:`, value);
    return true;
  } catch (error) {
    console.error(`[Settings] Error setting ${key}:`, error);
    return false;
  }
}

/**
 * Sets multiple settings at once.
 *
 * @param {Object} settings - Settings object to set
 * @returns {Promise<boolean>} True if all successful
 */
async function setMultipleSettings(settings) {
  try {
    // Validate all values
    const results = validateSettings(settings);
    const invalid = Object.entries(results)
      .filter(([_, result]) => !result.valid);

    if (invalid.length > 0) {
      console.warn('[Settings] Invalid settings:', invalid);
      return false;
    }

    if (!browser || !browser.storage) {
      // Update cache only
      if (!settingsCache) settingsCache = {};
      Object.assign(settingsCache, settings);
      return true;
    }

    // Save to storage
    await browser.storage.sync.set(settings);

    // Update cache
    if (!settingsCache) settingsCache = {};
    Object.assign(settingsCache, settings);

    console.log('[Settings] Set multiple settings:', Object.keys(settings));
    return true;
  } catch (error) {
    console.error('[Settings] Error setting multiple settings:', error);
    return false;
  }
}

/**
 * Resets a setting to its default value.
 *
 * @param {string} key - Setting key to reset
 * @returns {Promise<boolean>} True if successful
 */
async function resetSetting(key) {
  if (DEFAULT_SETTINGS.hasOwnProperty(key)) {
    return setSetting(key, DEFAULT_SETTINGS[key]);
  }
  console.warn('[Settings] Unknown setting to reset:', key);
  return false;
}

/**
 * Resets all settings to defaults.
 *
 * @returns {Promise<boolean>} True if successful
 */
async function resetAllSettings() {
  if (!browser || !browser.storage) {
    settingsCache = { ...DEFAULT_SETTINGS };
    return true;
  }

  await browser.storage.sync.clear();
  await browser.storage.sync.set(DEFAULT_SETTINGS);
  settingsCache = { ...DEFAULT_SETTINGS };

  console.log('[Settings] Reset all settings to defaults');
  return true;
}

// ============================================================================
// FILTER HISTORY MANAGEMENT
// ============================================================================

/**
 * Adds a filter to history.
 *
 * @param {Object} filter - Filter object to add
 * @returns {Promise<boolean>} True if successful
 */
async function addToFilterHistory(filter) {
  try {
    const history = await getSetting('filterHistory', []);
    const maxHistory = await getSetting('maxFilterHistory', 50);

    // Remove duplicates
    const filtered = history.filter(f => JSON.stringify(f) !== JSON.stringify(filter));

    // Add new filter at beginning
    filtered.unshift(filter);

    // Trim to max size
    while (filtered.length > maxHistory) {
      filtered.pop();
    }

    return setSetting('filterHistory', filtered);
  } catch (error) {
    console.error('[Settings] Error adding to filter history:', error);
    return false;
  }
}

/**
 * Gets filter history.
 *
 * @returns {Promise<Array>} Filter history
 */
async function getFilterHistory() {
  return getSetting('filterHistory', []);
}

/**
 * Clears filter history.
 *
 * @returns {Promise<boolean>} True if successful
 */
async function clearFilterHistory() {
  return setSetting('filterHistory', []);
}

// ============================================================================
// STORAGE LISTENERS
// ============================================================================

/**
 * Adds a storage change listener.
 *
 * @param {Function} listener - Callback function(changes, areaName)
 * @returns {Function} Unregister function
 */
function onStorageChanged(listener) {
  if (!browser || !browser.storage) {
    return () => {};
  }

  const wrapped = (changes, areaName) => {
    // Update cache on changes
    for (const [key, change] of Object.entries(changes)) {
      if (change.newValue !== undefined) {
        if (!settingsCache) settingsCache = {};
        settingsCache[key] = change.newValue;
      }
    }

    listener(changes, areaName);
  };

  browser.storage.onChanged.addListener(wrapped);
  storageListeners.push(wrapped);

  // Return unregister function
  return () => {
    const index = storageListeners.indexOf(wrapped);
    if (index > -1) {
      storageListeners.splice(index, 1);
      browser.storage.onChanged.removeListener(wrapped);
    }
  };
}

/**
 * Removes all storage change listeners.
 */
function removeAllStorageListeners() {
  if (!browser || !browser.storage) {
    storageListeners.length = 0;
    return;
  }

  storageListeners.forEach(listener => {
    browser.storage.onChanged.removeListener(listener);
  });

  storageListeners.length = 0;
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initializes settings.
 * Loads settings from storage and validates them.
 */
async function init() {
  try {
    await getAllSettings();
    console.log('[Settings] Initialized');
    console.log('[Settings] Current settings:', settingsCache);
  } catch (error) {
    console.error('[Settings] Initialization failed:', error);
  }
}

// Export all functions and constants
const settings = {
  // Constants
  DEFAULT_SETTINGS,

  // Settings storage
  getSetting,
  getAllSettings,
  setSetting,
  setMultipleSettings,
  resetSetting,
  resetAllSettings,

  // Filter history
  addToFilterHistory,
  getFilterHistory,
  clearFilterHistory,

  // Storage listeners
  onStorageChanged,
  removeAllStorageListeners,

  // Validation
  validateSetting,
  validateSettings,

  // Initialization
  init
};

// For use in browser extension context
if (typeof module !== 'undefined' && module.exports) {
  module.exports = settings;
}

// Export for ES6 modules
if (typeof window !== 'undefined') {
  window.QuickFilterBySettings = settings;
}
