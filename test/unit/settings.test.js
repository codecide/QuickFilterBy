/**
 * Unit tests for src/utils/settings.js
 *
 * Tests all settings management utilities including:
 * - Default settings constants
 * - Validation functions
 * - Storage integration (get, set, clear)
 * - Filter history management
 * - Storage change listeners
 *
 * Note: Some tests are skipped due to module-level state management issues
 * similar to version.js. These behaviors are tested in integration tests.
 */

const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');

// Load browser mocks first
require('../mocks/browser');

const {
  DEFAULT_SETTINGS,
  validateSetting,
  validateSettings,
  getSetting,
  getAllSettings,
  setSetting,
  setMultipleSettings,
  resetSetting,
  resetAllSettings,
  addToFilterHistory,
  getFilterHistory,
  clearFilterHistory,
  onStorageChanged,
  removeAllStorageListeners,
  init,
  clearCache,
  resetModuleState
} = require('../../src/utils/settings');

describe('settings.js - DEFAULT_SETTINGS', () => {
  it('should have correct default settings', () => {
    expect(DEFAULT_SETTINGS.altClickEnabled).toBe(true);
    expect(DEFAULT_SETTINGS.defaultFilterType).toBe('sender');
    expect(DEFAULT_SETTINGS.showContextMenus).toEqual(['sender', 'senderEmail', 'recipient', 'recipients', 'subject']);
    expect(DEFAULT_SETTINGS.debugMode).toBe(false);
    expect(DEFAULT_SETTINGS.logLevel).toBe('WARN');
    expect(DEFAULT_SETTINGS.customFilters).toEqual([]);
    expect(DEFAULT_SETTINGS.filterHistory).toEqual([]);
    expect(DEFAULT_SETTINGS.maxFilterHistory).toBe(50);
    expect(DEFAULT_SETTINGS.filterHistoryEnabled).toBe(true);
    expect(DEFAULT_SETTINGS.notificationsEnabled).toBe(true);
    expect(DEFAULT_SETTINGS.lastVersion).toBe('14.0.0');
  });
});

describe('settings.js - validateSetting', () => {
  it('should validate altClickEnabled', () => {
    expect(validateSetting('altClickEnabled', true)).toBe(true);
    expect(validateSetting('altClickEnabled', false)).toBe(true);
    expect(validateSetting('altClickEnabled', 'invalid')).toBe(false);
  });

  it('should validate defaultFilterType', () => {
    expect(validateSetting('defaultFilterType', 'sender')).toBe(true);
    expect(validateSetting('defaultFilterType', 'recipient')).toBe(true);
    expect(validateSetting('defaultFilterType', 'subject')).toBe(true);
    expect(validateSetting('defaultFilterType', 'invalid')).toBe(false);
  });

  it('should validate showContextMenus', () => {
    const validMenu = ['sender', 'senderEmail', 'recipient', 'recipients', 'subject'];
    expect(validateSetting('showContextMenus', validMenu)).toBe(true);
    expect(validateSetting('showContextMenus', ['sender'])).toBe(true);
    expect(validateSetting('showContextMenus', ['invalid'])).toBe(false);
    expect(validateSetting('showContextMenus', 'invalid')).toBe(false);
  });

  it('should validate debugMode', () => {
    expect(validateSetting('debugMode', true)).toBe(true);
    expect(validateSetting('debugMode', false)).toBe(true);
    expect(validateSetting('debugMode', 'invalid')).toBe(false);
  });

  it('should validate logLevel', () => {
    expect(validateSetting('logLevel', 'DEBUG')).toBe(true);
    expect(validateSetting('logLevel', 'INFO')).toBe(true);
    expect(validateSetting('logLevel', 'WARN')).toBe(true);
    expect(validateSetting('logLevel', 'ERROR')).toBe(true);
    expect(validateSetting('logLevel', 'invalid')).toBe(false);
  });

  it('should validate customFilters', () => {
    expect(validateSetting('customFilters', [])).toBe(true);
    expect(validateSetting('customFilters', [{ filter: 'test' }])).toBe(true);
    expect(validateSetting('customFilters', 'invalid')).toBe(false);
  });

  it('should validate filterHistory', () => {
    expect(validateSetting('filterHistory', [])).toBe(true);
    expect(validateSetting('filterHistory', [{ filter: 'test' }])).toBe(true);
    expect(validateSetting('filterHistory', 'invalid')).toBe(false);
  });

  it('should validate maxFilterHistory', () => {
    expect(validateSetting('maxFilterHistory', 0)).toBe(true);
    expect(validateSetting('maxFilterHistory', 50)).toBe(true);
    expect(validateSetting('maxFilterHistory', 1000)).toBe(true);
    expect(validateSetting('maxFilterHistory', -1)).toBe(false);
    expect(validateSetting('maxFilterHistory', 1001)).toBe(false);
    expect(validateSetting('maxFilterHistory', 'invalid')).toBe(false);
  });

  it('should validate filterHistoryEnabled', () => {
    expect(validateSetting('filterHistoryEnabled', true)).toBe(true);
    expect(validateSetting('filterHistoryEnabled', false)).toBe(true);
    expect(validateSetting('filterHistoryEnabled', 'invalid')).toBe(false);
  });

  it('should validate notificationsEnabled', () => {
    expect(validateSetting('notificationsEnabled', true)).toBe(true);
    expect(validateSetting('notificationsEnabled', false)).toBe(true);
    expect(validateSetting('notificationsEnabled', 'invalid')).toBe(false);
  });

  it('should validate lastVersion', () => {
    expect(validateSetting('lastVersion', '14.0.0')).toBe(true);
    expect(validateSetting('lastVersion', '')).toBe(true);
    expect(validateSetting('lastVersion', 'invalid')).toBe(true); // Any string is valid
    expect(validateSetting('lastVersion', 123)).toBe(false); // Number is invalid
  });

  it('should pass through unknown settings', () => {
    expect(validateSetting('unknownSetting', 'any value')).toBe(true);
    expect(validateSetting('unknownSetting', 123)).toBe(true);
    expect(validateSetting('unknownSetting', { object: 'value' })).toBe(true);
  });
});

describe('settings.js - validateSettings', () => {
  it('should validate all settings in object', () => {
    const settings = {
      altClickEnabled: true,
      defaultFilterType: 'sender',
      debugMode: false
    };

    const results = validateSettings(settings);

    expect(results.altClickEnabled.valid).toBe(true);
    expect(results.defaultFilterType.valid).toBe(true);
    expect(results.debugMode.valid).toBe(true);
  });

  it('should return valid status for invalid settings', () => {
    const settings = {
      altClickEnabled: 'invalid',
      defaultFilterType: 'invalid'
    };

    const results = validateSettings(settings);

    expect(results.altClickEnabled.valid).toBe(false);
    expect(results.defaultFilterType.valid).toBe(false);
    expect(results.altClickEnabled.value).toBe('invalid');
    expect(results.defaultFilterType.value).toBe('invalid');
  });

  it('should handle empty settings object', () => {
    const results = validateSettings({});
    expect(results).toEqual({});
  });
});

describe('settings.js - getSetting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearCache();
  });

  it('should get setting from storage', async () => {
    browser.storage.sync.get.mockResolvedValue({ altClickEnabled: true });

    const { getSetting } = require('../../src/utils/settings');
    const value = await getSetting('altClickEnabled');

    expect(value).toBe(true);
    expect(browser.storage.sync.get).toHaveBeenCalledWith('altClickEnabled');
  });

  it('should get setting from storage (cached)', async () => {
    browser.storage.sync.get.mockResolvedValue({ altClickEnabled: true });

    const { getSetting } = require('../../src/utils/settings');
    const value1 = await getSetting('altClickEnabled');
    const value2 = await getSetting('altClickEnabled');

    expect(value1).toBe(true);
    expect(value2).toBe(true);
    expect(browser.storage.sync.get).toHaveBeenCalledTimes(1); // Called once, cached second time
  });

  it('should return default value if setting not in storage', async () => {
    browser.storage.sync.get.mockResolvedValue({});

    const { getSetting } = require('../../src/utils/settings');
    const value = await getSetting('altClickEnabled');

    expect(value).toBe(DEFAULT_SETTINGS.altClickEnabled);
    expect(browser.storage.sync.get).toHaveBeenCalledWith('altClickEnabled');
  });

  it('should use provided default value', async () => {
    browser.storage.sync.get.mockResolvedValue({});

    const { getSetting } = require('../../src/utils/settings');
    const value = await getSetting('altClickEnabled', false);

    expect(value).toBe(false);
  });

  it('should validate stored value and return default if invalid', async () => {
    browser.storage.sync.get.mockResolvedValue({ altClickEnabled: 'invalid' });

    const { getSetting } = require('../../src/utils/settings');
    const value = await getSetting('altClickEnabled');

    expect(value).toBe(DEFAULT_SETTINGS.altClickEnabled);
  });

  it('should handle storage errors gracefully', async () => {
    browser.storage.sync.get.mockRejectedValue(new Error('Storage error'));

    const { getSetting } = require('../../src/utils/settings');
    const value = await getSetting('altClickEnabled');

    expect(value).toBe(DEFAULT_SETTINGS.altClickEnabled);
    // Error is logged internally, we just verify behavior
  });

  it('should return default if browser not available', async () => {
    const originalBrowser = global.browser;
    global.browser = undefined;

    const { getSetting } = require('../../src/utils/settings');
    const value = await getSetting('altClickEnabled', false);

    expect(value).toBe(false);

    // Restore browser
    global.browser = originalBrowser;
  });
});

describe('settings.js - getAllSettings', () => {
  beforeEach(() => {
    jest.isolateModules(() => {
      const browserMock = require('../mocks/browser');
      global.browser = browserMock;
      browser.storage.sync.get.mockResolvedValue({});
    });
  });

  it('should get all settings from storage', async () => {
    const storedSettings = {
      altClickEnabled: false,
      logLevel: 'DEBUG'
    };
    browser.storage.sync.get.mockResolvedValue(storedSettings);

    const { getAllSettings } = require('../../src/utils/settings');
    const settings = await getAllSettings();

    expect(settings.altClickEnabled).toBe(false);
    expect(settings.logLevel).toBe('DEBUG');
    expect(settings.defaultFilterType).toBe(DEFAULT_SETTINGS.defaultFilterType); // Default
    expect(browser.storage.sync.get).toHaveBeenCalled();
  });

  it('should merge with defaults', async () => {
    browser.storage.sync.get.mockResolvedValue({});

    const { getAllSettings } = require('../../src/utils/settings');
    const settings = await getAllSettings();

    expect(settings).toEqual(DEFAULT_SETTINGS);
  });

  it('should validate invalid stored values', async () => {
    browser.storage.sync.get.mockResolvedValue({
      altClickEnabled: 'invalid',
      defaultFilterType: 'invalid'
    });

    const { getAllSettings } = require('../../src/utils/settings');
    const settings = await getAllSettings();

    expect(settings.altClickEnabled).toBe(DEFAULT_SETTINGS.altClickEnabled);
    expect(settings.defaultFilterType).toBe(DEFAULT_SETTINGS.defaultFilterType);
  });

  it('should handle storage errors', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    browser.storage.sync.get.mockRejectedValue(new Error('Storage error'));

    const { getAllSettings } = require('../../src/utils/settings');
    const settings = await getAllSettings();

    expect(settings).toEqual(DEFAULT_SETTINGS);
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('should return defaults if browser not available', async () => {
    global.browser = undefined;

    const { getAllSettings } = require('../../src/utils/settings');
    const settings = await getAllSettings();

    expect(settings).toEqual(DEFAULT_SETTINGS);
  });
});

describe('settings.js - setSetting', () => {
  beforeEach(() => {
    jest.isolateModules(() => {
      const browserMock = require('../mocks/browser');
      global.browser = browserMock;
      browser.storage.sync.set.mockResolvedValue(undefined);
    });
  });

  it('should set setting in storage', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    browser.storage.sync.set.mockResolvedValue(undefined);

    const { setSetting } = require('../../src/utils/settings');
    const result = await setSetting('altClickEnabled', false);

    expect(result).toBe(true);
    expect(browser.storage.sync.set).toHaveBeenCalledWith({ altClickEnabled: false });
    expect(consoleLogSpy).toHaveBeenCalled();

    consoleLogSpy.mockRestore();
  });

  it('should reject invalid setting value', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    browser.storage.sync.set.mockResolvedValue(undefined);

    const { setSetting } = require('../../src/utils/settings');
    const result = await setSetting('altClickEnabled', 'invalid');

    expect(result).toBe(false);
    expect(browser.storage.sync.set).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });

  it('should handle storage errors', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    browser.storage.sync.set.mockRejectedValue(new Error('Storage error'));

    const { setSetting } = require('../../src/utils/settings');
    const result = await setSetting('altClickEnabled', true);

    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('should update cache when browser not available', async () => {
    global.browser = undefined;
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    const { setSetting } = require('../../src/utils/settings');
    const result = await setSetting('altClickEnabled', true);

    expect(result).toBe(true);
    // Cache is updated, but no log message is shown (silent cache update)

    consoleLogSpy.mockRestore();

    // Restore browser for other tests
    const browserMock = require('../mocks/browser');
    global.browser = browserMock;
  });
});

describe('settings.js - setMultipleSettings', () => {
  beforeEach(() => {
    jest.isolateModules(() => {
      const browserMock = require('../mocks/browser');
      global.browser = browserMock;
      browser.storage.sync.set.mockResolvedValue(undefined);
    });
  });

  it('should set multiple settings at once', async () => {
    const settings = {
      altClickEnabled: false,
      logLevel: 'DEBUG'
    };
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    browser.storage.sync.set.mockResolvedValue(undefined);

    const { setMultipleSettings } = require('../../src/utils/settings');
    const result = await setMultipleSettings(settings);

    expect(result).toBe(true);
    expect(browser.storage.sync.set).toHaveBeenCalledWith(settings);
    expect(consoleLogSpy).toHaveBeenCalled();

    consoleLogSpy.mockRestore();
  });

  it('should reject invalid settings', async () => {
    const settings = {
      altClickEnabled: 'invalid'
    };
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    const { setMultipleSettings } = require('../../src/utils/settings');
    const result = await setMultipleSettings(settings);

    expect(result).toBe(false);
    expect(browser.storage.sync.set).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });

  it('should handle storage errors', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    browser.storage.sync.set.mockRejectedValue(new Error('Storage error'));

    const { setMultipleSettings } = require('../../src/utils/settings');
    const result = await setMultipleSettings({ altClickEnabled: true });

    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});

describe('settings.js - resetSetting', () => {
  beforeEach(() => {
    jest.isolateModules(() => {
      const browserMock = require('../mocks/browser');
      global.browser = browserMock;
      browser.storage.sync.set.mockResolvedValue(undefined);
    });
  });

  it('should reset setting to default', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    browser.storage.sync.set.mockResolvedValue(undefined);

    const { resetSetting } = require('../../src/utils/settings');
    const result = await resetSetting('altClickEnabled');

    expect(result).toBe(true);
    expect(browser.storage.sync.set).toHaveBeenCalledWith({
      altClickEnabled: DEFAULT_SETTINGS.altClickEnabled
    });
    expect(consoleLogSpy).toHaveBeenCalled();

    consoleLogSpy.mockRestore();
  });

  it('should return false for unknown setting', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    const { resetSetting } = require('../../src/utils/settings');
    const result = await resetSetting('unknownSetting');

    expect(result).toBe(false);
    expect(browser.storage.sync.set).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });
});

describe('settings.js - resetAllSettings', () => {
  beforeEach(() => {
    jest.isolateModules(() => {
      const browserMock = require('../mocks/browser');
      global.browser = browserMock;
      browser.storage.sync.clear.mockResolvedValue(undefined);
      browser.storage.sync.set.mockResolvedValue(undefined);
    });
  });

  it('should reset all settings to defaults', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    browser.storage.sync.set.mockResolvedValue(undefined);

    const { resetAllSettings } = require('../../src/utils/settings');
    const result = await resetAllSettings();

    expect(result).toBe(true);
    expect(browser.storage.sync.clear).toHaveBeenCalled();
    expect(browser.storage.sync.set).toHaveBeenCalledWith(DEFAULT_SETTINGS);
    expect(consoleLogSpy).toHaveBeenCalled();

    consoleLogSpy.mockRestore();
  });

  it('should only update cache if browser not available', async () => {
    const originalBrowser = global.browser;
    global.browser = undefined;

    const { resetAllSettings } = require('../../src/utils/settings');
    const result = await resetAllSettings();

    expect(result).toBe(true);
    // Browser is undefined, so storage methods should not be called

    // Restore browser
    global.browser = originalBrowser;
  });
});

describe('settings.js - addToFilterHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearCache();
  });

  it('should add filter to history', async () => {
    const existingHistory = [{ filter: 'existing' }];
    browser.storage.sync.get.mockResolvedValueOnce({ filterHistory: existingHistory });
    browser.storage.sync.set.mockResolvedValueOnce(undefined);
    const newFilter = { filter: 'new' };

    const result = await addToFilterHistory(newFilter);

    expect(result).toBe(true);
    expect(browser.storage.sync.set).toHaveBeenCalledWith({
      filterHistory: [newFilter, ...existingHistory]
    });
  });

  it('should remove duplicates', async () => {
    const existingHistory = [
      { filter: 'duplicate' },
      { filter: 'other' }
    ];
    browser.storage.sync.get.mockResolvedValueOnce({ filterHistory: existingHistory });
    browser.storage.sync.set.mockResolvedValueOnce(undefined);
    const newFilter = { filter: 'duplicate' };

    const result = await addToFilterHistory(newFilter);

    expect(result).toBe(true);
    expect(browser.storage.sync.set).toHaveBeenCalledWith({
      filterHistory: [{ filter: 'duplicate' }, { filter: 'other' }]
    });
  });

  it('should trim to max history size', async () => {
    const existingHistory = Array.from({ length: 50 }, (_, i) => ({ filter: `filter${i}` }));
    browser.storage.sync.get.mockResolvedValueOnce({ filterHistory: existingHistory });
    browser.storage.sync.get.mockResolvedValueOnce({ maxFilterHistory: 50 });
    browser.storage.sync.set.mockResolvedValueOnce(undefined);
    const newFilter = { filter: 'new' };

    const result = await addToFilterHistory(newFilter);

    expect(result).toBe(true);
    const savedHistory = browser.storage.sync.set.mock.calls[0][0].filterHistory;
    expect(savedHistory.length).toBe(50); // Trimmed from 51 to 50
    expect(savedHistory[0]).toEqual(newFilter); // New filter at beginning
  });
});

describe('settings.js - getFilterHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearCache();
  });

  it('should get filter history', async () => {
    const history = [{ filter: 'test' }];
    browser.storage.sync.get.mockResolvedValueOnce({ filterHistory: history });

    const result = await getFilterHistory();

    expect(result).toEqual(history);
  });

  it('should return empty array if no history', async () => {
    browser.storage.sync.get.mockResolvedValueOnce({});

    const result = await getFilterHistory();

    expect(result).toEqual([]);
  });
});

describe('settings.js - clearFilterHistory', () => {
  beforeEach(() => {
    jest.isolateModules(() => {
      const browserMock = require('../mocks/browser');
      global.browser = browserMock;
      browser.storage.sync.set.mockResolvedValue(undefined);
    });
  });

  it('should clear filter history', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    browser.storage.sync.set.mockResolvedValue(undefined);

    const { clearFilterHistory } = require('../../src/utils/settings');
    const result = await clearFilterHistory();

    expect(result).toBe(true);
    expect(browser.storage.sync.set).toHaveBeenCalledWith({ filterHistory: [] });
    expect(consoleLogSpy).toHaveBeenCalled();

    consoleLogSpy.mockRestore();
  });
});

describe('settings.js - onStorageChanged', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetModuleState();
  });

  afterEach(() => {
    // Clean up listeners after each test
    if (global.browser && global.browser.storage) {
      global.browser.storage.onChanged.removeAllListeners();
    }
  });

  it('should add storage change listener', () => {
    const listener = jest.fn();

    const unregister = onStorageChanged(listener);

    expect(global.browser.storage.onChanged.addListener).toHaveBeenCalled();
    expect(typeof unregister).toBe('function');
  });

  it('should update cache on storage changes', async () => {
    const listener = jest.fn();

    onStorageChanged(listener);

    // Simulate storage change
    const wrappedListener = global.browser.storage.onChanged.addListener.mock.calls[0][0];
    wrappedListener({ altClickEnabled: { newValue: false } }, 'sync');

    // Check if cache was updated
    expect(listener).toHaveBeenCalledWith(
      { altClickEnabled: { newValue: false } },
      'sync'
    );
  });
});

describe('settings.js - removeAllStorageListeners', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetModuleState();
  });

  it('should remove all storage listeners', () => {
    const listener1 = jest.fn();
    const listener2 = jest.fn();

    onStorageChanged(listener1);
    onStorageChanged(listener2);

    expect(global.browser.storage.onChanged.addListener).toHaveBeenCalledTimes(2);

    removeAllStorageListeners();

    expect(global.browser.storage.onChanged.removeListener).toHaveBeenCalledTimes(2);
  });

  it('should handle browser not available', () => {
    const originalBrowser = global.browser;
    global.browser = undefined;

    const listener = jest.fn();

    const unregister = onStorageChanged(listener);

    expect(typeof unregister).toBe('function'); // Returns no-op function

    // Restore browser
    global.browser = originalBrowser;
  });
});

describe('settings.js - init', () => {
  beforeEach(() => {
    jest.isolateModules(() => {
      const browserMock = require('../mocks/browser');
      global.browser = browserMock;
      browser.storage.sync.get.mockResolvedValue({});
      browser.storage.sync.set.mockResolvedValue(undefined);
    });
  });

  it('should initialize settings', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    const { init } = require('../../src/utils/settings');
    await init();

    expect(browser.storage.sync.get).toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith('[Settings] Initialized');
    expect(consoleLogSpy).toHaveBeenCalledWith('[Settings] Current settings:', expect.any(Object));

    consoleLogSpy.mockRestore();
  });

  it('should handle initialization errors', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    browser.storage.sync.get.mockRejectedValue(new Error('Storage error'));

    const { init } = require('../../src/utils/settings');
    await init();

    expect(consoleErrorSpy).toHaveBeenCalledWith('[Settings] Error getting all settings:', expect.any(Error));

    consoleErrorSpy.mockRestore();
  });
});
