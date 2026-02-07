/**
 * QuickFilterBy - Options/Settings Page JavaScript
 *
 * Handles user settings interface, loading/saving settings, and UI interactions.
 */

// ============================================================================
// STATE
// ============================================================================

/**
 * Current settings values.
 * @type {Object}
 */
let currentSettings = {};

/**
 * Settings that have been modified but not saved.
 * @type {Set<string>}
 */
let modifiedSettings = new Set();

/**
 * Flag indicating if settings are being loaded.
 * @type {boolean}
 */
let isLoading = true;

// ============================================================================
// DOM ELEMENTS
// ============================================================================

/**
 * DOM element references.
 * @type {Object}
 */
const elements = {};

/**
 * Initializes DOM element references.
 */
function initializeElements() {
  elements.altClickEnabled = document.getElementById('altClickEnabled');
  elements.defaultFilterType = document.getElementById('defaultFilterType');
  elements.showSenderMenu = document.getElementById('showSenderMenu');
  elements.showSenderEmailMenu = document.getElementById('showSenderEmailMenu');
  elements.showRecipientMenu = document.getElementById('showRecipientMenu');
  elements.showRecipientsMenu = document.getElementById('showRecipientsMenu');
  elements.showSubjectMenu = document.getElementById('showSubjectMenu');
  elements.debugMode = document.getElementById('debugMode');
  elements.logLevel = document.getElementById('logLevel');
  elements.showNotifications = document.getElementById('showNotifications');
  elements.filterHistoryEnabled = document.getElementById('filterHistoryEnabled');
  elements.maxFilterHistory = document.getElementById('maxFilterHistory');
  elements.clearFilterHistory = document.getElementById('clearFilterHistory');
  elements.extensionVersion = document.getElementById('extensionVersion');
  elements.saveButton = document.getElementById('saveButton');
  elements.resetButton = document.getElementById('resetButton');
  elements.notificationContainer = document.getElementById('notificationContainer');
}

// ============================================================================
// SETTINGS LOADING
// ============================================================================

/**
 * Loads all settings from storage and populates the UI.
 */
async function loadSettings() {
  isLoading = true;
  updateSaveButton();

  try {
    // Load all settings
    currentSettings = await browser.storage.sync.get();

    console.log('[Options] Loaded settings:', currentSettings);

    // Populate UI elements
    if (elements.altClickEnabled) {
      elements.altClickEnabled.checked = currentSettings.altClickEnabled !== false;
    }

    if (elements.defaultFilterType) {
      elements.defaultFilterType.value = currentSettings.defaultFilterType || 'sender';
    }

    if (elements.showSenderMenu) {
      const showMenus = currentSettings.showContextMenus || DEFAULT_SETTINGS.showContextMenus;
      elements.showSenderMenu.checked = showMenus.includes('sender');
      elements.showSenderEmailMenu.checked = showMenus.includes('senderEmail');
      elements.showRecipientMenu.checked = showMenus.includes('recipient');
      elements.showRecipientsMenu.checked = showMenus.includes('recipients');
      elements.showSubjectMenu.checked = showMenus.includes('subject');
    }

    if (elements.debugMode) {
      elements.debugMode.checked = currentSettings.debugMode === true;
    }

    if (elements.logLevel) {
      elements.logLevel.value = currentSettings.logLevel || 'WARN';
    }

    if (elements.showNotifications) {
      elements.showNotifications.checked = currentSettings.notificationsEnabled !== false;
    }

    if (elements.filterHistoryEnabled) {
      elements.filterHistoryEnabled.checked = currentSettings.filterHistoryEnabled !== false;
    }

    if (elements.maxFilterHistory) {
      elements.maxFilterHistory.value = currentSettings.maxFilterHistory || 50;
    }

    // Load extension version
    if (elements.extensionVersion && currentSettings.lastVersion) {
      elements.extensionVersion.textContent = currentSettings.lastVersion;
    }

    // Clear modified set
    modifiedSettings.clear();

    isLoading = false;
    updateSaveButton();

  } catch (error) {
    console.error('[Options] Error loading settings:', error);
    showNotification('error', 'Failed to load settings');
    isLoading = false;
    updateSaveButton();
  }
}

// ============================================================================
// SETTINGS SAVING
// ============================================================================

/**
 * Gets the current values from UI elements.
 *
 * @returns {Object} Current settings values from UI
 */
function getUISettings() {
  const settings = {};

  if (elements.altClickEnabled) {
    settings.altClickEnabled = elements.altClickEnabled.checked;
  }

  if (elements.defaultFilterType) {
    settings.defaultFilterType = elements.defaultFilterType.value;
  }

  if (elements.showSenderMenu && elements.showSenderEmailMenu &&
      elements.showRecipientMenu && elements.showRecipientsMenu &&
      elements.showSubjectMenu) {
    const showMenus = [];
    if (elements.showSenderMenu.checked) showMenus.push('sender');
    if (elements.showSenderEmailMenu.checked) showMenus.push('senderEmail');
    if (elements.showRecipientMenu.checked) showMenus.push('recipient');
    if (elements.showRecipientsMenu.checked) showMenus.push('recipients');
    if (elements.showSubjectMenu.checked) showMenus.push('subject');
    settings.showContextMenus = showMenus;
  }

  if (elements.debugMode) {
    settings.debugMode = elements.debugMode.checked;
  }

  if (elements.logLevel) {
    settings.logLevel = elements.logLevel.value;
  }

  if (elements.showNotifications) {
    settings.notificationsEnabled = elements.showNotifications.checked;
  }

  if (elements.filterHistoryEnabled) {
    settings.filterHistoryEnabled = elements.filterHistoryEnabled.checked;
  }

  if (elements.maxFilterHistory) {
    const maxHistory = parseInt(elements.maxFilterHistory.value, 10);
    settings.maxFilterHistory = Math.max(1, Math.min(100, maxHistory));
  }

  // Update last version
  const manifest = browser.runtime.getManifest();
  settings.lastVersion = manifest.version;

  return settings;
}

/**
 * Validates settings before saving.
 *
 * @param {Object} settings - Settings to validate
 * @returns {Object} Validation result with valid flag and errors
 */
function validateSettings(settings) {
  const errors = [];

  // Validate max filter history
  if (settings.maxFilterHistory !== undefined) {
    const maxHistory = parseInt(settings.maxFilterHistory, 10);
    if (isNaN(maxHistory) || maxHistory < 1 || maxHistory > 100) {
      errors.push('Maximum filter history must be between 1 and 100');
    }
  }

  // Validate default filter type
  if (settings.defaultFilterType !== undefined) {
    const validTypes = ['sender', 'recipient', 'subject'];
    if (!validTypes.includes(settings.defaultFilterType)) {
      errors.push('Invalid default filter type');
    }
  }

  // Validate log level
  if (settings.logLevel !== undefined) {
    const validLevels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    if (!validLevels.includes(settings.logLevel)) {
      errors.push('Invalid log level');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Saves current settings to storage.
 */
async function saveSettings() {
  if (isLoading) {
    return;
  }

  try {
    // Get settings from UI
    const settings = getUISettings();

    // Validate
    const validation = validateSettings(settings);
    if (!validation.valid) {
      console.warn('[Options] Settings validation failed:', validation.errors);
      showNotification('error', validation.errors.join(', '));
      return;
    }

    // Save to storage
    await browser.storage.sync.set(settings);

    // Update current settings
    currentSettings = settings;
    modifiedSettings.clear();

    console.log('[Options] Settings saved:', settings);
    showNotification('success', 'Settings saved successfully');

    updateSaveButton();

  } catch (error) {
    console.error('[Options] Error saving settings:', error);
    showNotification('error', 'Failed to save settings');
  }
}

/**
 * Resets all settings to defaults.
 */
async function resetSettings() {
  if (!confirm('Are you sure you want to reset all settings to their defaults?')) {
    return;
  }

  try {
    // Reset to defaults
    await browser.storage.sync.clear();
    await browser.storage.sync.set(DEFAULT_SETTINGS);

    console.log('[Options] Settings reset to defaults');
    showNotification('success', 'Settings reset to defaults');

    // Reload settings
    await loadSettings();

  } catch (error) {
    console.error('[Options] Error resetting settings:', error);
    showNotification('error', 'Failed to reset settings');
  }
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Tracks when a setting is modified.
 */
function trackModification() {
  if (!isLoading) {
    updateSaveButton();
  }
}

/**
 * Handles save button click.
 */
async function handleSave() {
  await saveSettings();
}

/**
 * Handles reset button click.
 */
async function handleReset() {
  await resetSettings();
}

/**
 * Handles clear filter history button click.
 */
async function handleClearFilterHistory() {
  if (!confirm('Are you sure you want to clear the filter history?')) {
    return;
  }

  try {
    await browser.storage.sync.set({ filterHistory: [] });
    showNotification('success', 'Filter history cleared');
  } catch (error) {
    console.error('[Options] Error clearing filter history:', error);
    showNotification('error', 'Failed to clear filter history');
  }
}

/**
 * Updates save button state based on whether settings are modified.
 */
function updateSaveButton() {
  if (elements.saveButton) {
    if (isLoading) {
      elements.saveButton.disabled = true;
      elements.saveButton.textContent = 'Loading...';
    } else if (modifiedSettings.size > 0) {
      elements.saveButton.disabled = false;
      elements.saveButton.textContent = 'Save Settings';
    } else {
      elements.saveButton.disabled = true;
      elements.saveButton.textContent = 'No Changes';
    }
  }
}

/**
 * Attaches event listeners to UI elements.
 */
function attachEventListeners() {
  // Track modifications
  const inputs = document.querySelectorAll('input, select');
  inputs.forEach(input => {
    input.addEventListener('change', () => {
      modifiedSettings.add(input.id);
      trackModification();
    });
  });

  // Save button
  if (elements.saveButton) {
    elements.saveButton.addEventListener('click', handleSave);
  }

  // Reset button
  if (elements.resetButton) {
    elements.resetButton.addEventListener('click', handleReset);
  }

  // Clear filter history button
  if (elements.clearFilterHistory) {
    elements.clearFilterHistory.addEventListener('click', handleClearFilterHistory);
  }

  // Handle storage changes from other tabs
  browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync' && Object.keys(changes).length > 0) {
      console.log('[Options] Settings changed externally, reloading...');
      loadSettings();
    }
  });
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

/**
 * Shows a notification to the user.
 *
 * @param {string} type - Notification type ('success', 'error', 'warning')
 * @param {string} message - Notification message
 */
function showNotification(type, message) {
  if (!elements.notificationContainer) return;

  const notification = document.createElement('div');
  notification.className = `notification ${type}`;

  const icon = document.createElement('span');
  icon.className = 'notification-icon';
  icon.textContent = type === 'success' ? '✓' : type === 'error' ? '✕' : '⚠';

  const text = document.createElement('span');
  text.className = 'notification-message';
  text.textContent = message;

  notification.appendChild(icon);
  notification.appendChild(text);
  elements.notificationContainer.appendChild(notification);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease-in reverse';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 5000);
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initializes the options page.
 */
async function init() {
  console.log('[Options] Initializing options page...');

  // Initialize DOM references
  initializeElements();

  // Load settings
  await loadSettings();

  // Attach event listeners
  attachEventListeners();

  console.log('[Options] Options page initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
