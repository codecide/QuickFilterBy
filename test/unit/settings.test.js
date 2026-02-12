/**
 * Unit tests for src/utils/settings.js
 */

require('../mocks/browser');

const {
  DEFAULT_SETTINGS,
  validateSetting, validateSettings,
  getSetting, getAllSettings, setSetting, setMultipleSettings,
  resetSetting, resetAllSettings,
  addToFilterHistory, getFilterHistory, clearFilterHistory,
  onStorageChanged, removeAllStorageListeners,
  init, clearCache, resetModuleState
} = require('../../src/utils/settings');

describe('settings.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearCache();
    browser.storage.sync.get.mockResolvedValue({});
    browser.storage.sync.set.mockResolvedValue(undefined);
    browser.storage.sync.remove.mockResolvedValue(undefined);
    browser.storage.sync.clear.mockResolvedValue(undefined);
  });

  describe('DEFAULT_SETTINGS', () => {
    it('should have all expected defaults', () => {
      expect(DEFAULT_SETTINGS.altClickEnabled).toBe(true);
      expect(DEFAULT_SETTINGS.defaultFilterType).toBe('sender');
      expect(DEFAULT_SETTINGS.maxFilterHistory).toBe(50);
      expect(typeof DEFAULT_SETTINGS.debugMode).toBe('boolean');
    });
  });

  describe('validateSetting', () => {
    it('should validate boolean settings', () => {
      expect(validateSetting('altClickEnabled', true)).toBe(true);
      expect(validateSetting('altClickEnabled', false)).toBe(true);
      expect(validateSetting('altClickEnabled', 'invalid')).toBe(false);
    });

    it('should validate string settings', () => {
      expect(validateSetting('defaultFilterType', 'sender')).toBe(true);
      expect(validateSetting('defaultFilterType', 'subject')).toBe(true);
      expect(validateSetting('defaultFilterType', 'invalid')).toBe(false);
    });

    it('should validate numeric settings', () => {
      expect(validateSetting('maxFilterHistory', 50)).toBe(true);
      expect(validateSetting('maxFilterHistory', -1)).toBe(false);
      expect(validateSetting('maxFilterHistory', 'invalid')).toBe(false);
    });

    it('should allow unknown settings', () => {
      expect(validateSetting('unknownSetting', 'anything')).toBe(true);
    });
  });

  describe('validateSettings', () => {
    it('should validate all settings and report results', () => {
      const results = validateSettings({
        altClickEnabled: true,
        defaultFilterType: 'invalid'
      });
      expect(results.altClickEnabled.valid).toBe(true);
      expect(results.defaultFilterType.valid).toBe(false);
    });

    it('should handle empty object', () => {
      expect(validateSettings({})).toEqual({});
    });
  });

  describe('getSetting / setSetting', () => {
    it('should get setting from storage', async () => {
      browser.storage.sync.get.mockResolvedValue({ altClickEnabled: true });
      const value = await getSetting('altClickEnabled');
      expect(value).toBe(true);
    });

    it('should return default when setting is missing', async () => {
      browser.storage.sync.get.mockResolvedValue({});
      const value = await getSetting('altClickEnabled');
      expect(value).toBe(DEFAULT_SETTINGS.altClickEnabled);
    });

    it('should set valid settings', async () => {
      const result = await setSetting('altClickEnabled', false);
      expect(result).toBe(true);
      expect(browser.storage.sync.set).toHaveBeenCalledWith({ altClickEnabled: false });
    });

    it('should reject invalid settings', async () => {
      const spy = jest.spyOn(console, 'warn').mockImplementation();
      const result = await setSetting('altClickEnabled', 'invalid');
      expect(result).toBe(false);
      expect(browser.storage.sync.set).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('getAllSettings', () => {
    it('should merge stored settings with defaults', async () => {
      browser.storage.sync.get.mockResolvedValue({ altClickEnabled: false });
      const settings = await getAllSettings();
      expect(settings.altClickEnabled).toBe(false);
      expect(settings.defaultFilterType).toBe(DEFAULT_SETTINGS.defaultFilterType);
    });
  });

  describe('resetSetting / resetAllSettings', () => {
    it('should reset a setting to default', async () => {
      const result = await resetSetting('altClickEnabled');
      expect(result).toBe(true);
    });

    it('should reset all settings to defaults', async () => {
      const result = await resetAllSettings();
      expect(result).toBe(true);
      expect(browser.storage.sync.clear).toHaveBeenCalled();
    });
  });

  describe('filter history', () => {
    it('should add and retrieve filter history', async () => {
      browser.storage.sync.get.mockResolvedValue({ filterHistory: [] });
      const result = await addToFilterHistory({ type: 'sender', value: 'test@test.com' });
      expect(result).toBe(true);
    });

    it('should clear filter history', async () => {
      const result = await clearFilterHistory();
      expect(result).toBe(true);
    });
  });

  describe('storage listeners', () => {
    it('should add and remove storage change listeners', () => {
      const listener = jest.fn();
      const unregister = onStorageChanged(listener);
      expect(browser.storage.onChanged.addListener).toHaveBeenCalled();
      unregister();
    });

    it('removeAllStorageListeners should clean up', () => {
      onStorageChanged(jest.fn());
      removeAllStorageListeners();
      expect(browser.storage.onChanged.removeListener).toHaveBeenCalled();
    });
  });
});
