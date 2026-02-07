/**
 * Unit tests for features.js
 */

// Mock browser APIs before importing features module
global.browser = {
  MessagesListAdapter: {},
  menus: {},
  mailTabs: {
    setQuickFilter: jest.fn()
  }
};

// Mock console methods to avoid noise
global.console = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn()
};

const features = require('../../src/utils/features');
const { FEATURE_FLAGS, FAILURE_THRESHOLD } = features;

describe('features.js', () => {
  // Reset feature states before each test
  beforeEach(() => {
    jest.resetModules();
    // Re-require to get fresh state
    const freshFeatures = require('../../src/utils/features');
    Object.assign(features, freshFeatures);
    jest.clearAllMocks();
  });

  describe('Constants', () => {
    test('FEATURE_FLAGS should contain all expected features', () => {
      expect(features.FEATURE_FLAGS.ALT_CLICK).toBe('ALT_CLICK');
      expect(features.FEATURE_FLAGS.CONTEXT_MENUS).toBe('CONTEXT_MENUS');
      expect(features.FEATURE_FLAGS.CUSTOM_FILTERS).toBe('CUSTOM_FILTERS');
      expect(features.FEATURE_FLAGS.DATE_FILTER).toBe('DATE_FILTER');
      expect(features.FEATURE_FLAGS.TAG_FILTER).toBe('TAG_FILTER');
      expect(features.FEATURE_FLAGS.ATTACHMENT_FILTER).toBe('ATTACHMENT_FILTER');
      expect(features.FEATURE_FLAGS.READ_STATUS_FILTER).toBe('READ_STATUS_FILTER');
      expect(features.FEATURE_FLAGS.FILTER_HISTORY).toBe('FILTER_HISTORY');
      expect(features.FEATURE_FLAGS.FOLDER_FILTER).toBe('FOLDER_FILTER');
      expect(features.FEATURE_FLAGS.KEYBOARD_SHORTCUTS).toBe('KEYBOARD_SHORTCUTS');
    });

    test('FAILURE_THRESHOLD should be 3', () => {
      expect(features.FAILURE_THRESHOLD).toBe(3);
    });

    test('DEFAULT_FEATURE_STATES should contain all features', () => {
      const states = features.DEFAULT_FEATURE_STATES;
      expect(Object.keys(states)).toContain('ALT_CLICK');
      expect(Object.keys(states)).toContain('CONTEXT_MENUS');
      expect(Object.keys(states)).toContain('CUSTOM_FILTERS');
      expect(Object.keys(states)).toContain('DATE_FILTER');
      expect(Object.keys(states)).toContain('TAG_FILTER');
      expect(Object.keys(states)).toContain('ATTACHMENT_FILTER');
      expect(Object.keys(states)).toContain('READ_STATUS_FILTER');
      expect(Object.keys(states)).toContain('FILTER_HISTORY');
      expect(Object.keys(states)).toContain('FOLDER_FILTER');
      expect(Object.keys(states)).toContain('KEYBOARD_SHORTCUTS');
    });

    test('DEFAULT_FEATURE_STATES should have proper structure', () => {
      const states = features.DEFAULT_FEATURE_STATES;
      Object.values(states).forEach(state => {
        expect(state).toHaveProperty('enabled', expect.any(Boolean));
        expect(state).toHaveProperty('available', expect.any(Boolean));
        expect(state).toHaveProperty('failures', 0);
      });
    });
  });

  describe('detectAvailableFeatures', () => {
    test('should detect ALT_CLICK feature when MessagesListAdapter is available', async () => {
      global.browser.MessagesListAdapter = { test: true };
      const available = await features.detectAvailableFeatures();
      expect(available[FEATURE_FLAGS.ALT_CLICK]).toBe(true);
    });

    test('should not detect ALT_CLICK feature when MessagesListAdapter is not available', async () => {
      delete global.browser.MessagesListAdapter;
      const available = await features.detectAvailableFeatures();
      expect(available[FEATURE_FLAGS.ALT_CLICK]).toBe(false);
    });

    test('should detect CONTEXT_MENUS feature when browser.menus is available', async () => {
      global.browser.menus = { test: true };
      const available = await features.detectAvailableFeatures();
      expect(available[FEATURE_FLAGS.CONTEXT_MENUS]).toBe(true);
    });

    test('should not detect CONTEXT_MENUS feature when browser.menus is not available', async () => {
      global.browser.menus = undefined;
      const available = await features.detectAvailableFeatures();
      expect(available[FEATURE_FLAGS.CONTEXT_MENUS]).toBe(false);
    });

    test('should detect FILTER_HISTORY feature when mailTabs.setQuickFilter is available', async () => {
      global.browser.mailTabs = { setQuickFilter: jest.fn() };
      const available = await features.detectAvailableFeatures();
      expect(available[FEATURE_FLAGS.FILTER_HISTORY]).toBe(true);
    });

    test('should not detect FILTER_HISTORY feature when mailTabs.setQuickFilter is not available', async () => {
      global.browser.mailTabs = {};
      const available = await features.detectAvailableFeatures();
      expect(available[FEATURE_FLAGS.FILTER_HISTORY]).toBe(false);
    });

    test('should not detect Phase 4 features', async () => {
      const available = await features.detectAvailableFeatures();
      expect(available[FEATURE_FLAGS.CUSTOM_FILTERS]).toBe(false);
      expect(available[FEATURE_FLAGS.DATE_FILTER]).toBe(false);
      expect(available[FEATURE_FLAGS.TAG_FILTER]).toBe(false);
      expect(available[FEATURE_FLAGS.ATTACHMENT_FILTER]).toBe(false);
      expect(available[FEATURE_FLAGS.READ_STATUS_FILTER]).toBe(false);
      expect(available[FEATURE_FLAGS.FOLDER_FILTER]).toBe(false);
      expect(available[FEATURE_FLAGS.KEYBOARD_SHORTCUTS]).toBe(false);
    });

    test('should handle errors gracefully', async () => {
      global.browser.mailTabs = null;
      const available = await features.detectAvailableFeatures();
      expect(available).toBeDefined();
      expect(typeof available).toBe('object');
    });
  });

  describe('isFeatureAvailable', () => {
    test('should return true for available feature', () => {
      features.enableFeature(FEATURE_FLAGS.ALT_CLICK);
      expect(features.isFeatureAvailable(FEATURE_FLAGS.ALT_CLICK)).toBe(true);
    });

    test('should return false for unavailable feature', () => {
      expect(features.isFeatureAvailable(FEATURE_FLAGS.CUSTOM_FILTERS)).toBe(false);
    });

    test('should return false for unknown feature', () => {
      expect(features.isFeatureAvailable('UNKNOWN_FEATURE')).toBe(false);
    });

    test('should handle undefined feature states', () => {
      expect(features.isFeatureAvailable(undefined)).toBe(false);
      expect(features.isFeatureAvailable(null)).toBe(false);
    });
  });

  describe('isFeatureEnabled', () => {
    test('should return true for enabled and available feature', () => {
      features.enableFeature(FEATURE_FLAGS.ALT_CLICK);
      expect(features.isFeatureEnabled(FEATURE_FLAGS.ALT_CLICK)).toBe(true);
    });

    test('should return false for disabled feature', () => {
      features.disableFeature(FEATURE_FLAGS.ALT_CLICK);
      expect(features.isFeatureEnabled(FEATURE_FLAGS.ALT_CLICK)).toBe(false);
    });

    test('should return false for unavailable feature', () => {
      expect(features.isFeatureEnabled(FEATURE_FLAGS.CUSTOM_FILTERS)).toBe(false);
    });

    test('should return false for unknown feature', () => {
      expect(features.isFeatureEnabled('UNKNOWN_FEATURE')).toBe(false);
    });

    test('should handle undefined feature states', () => {
      expect(features.isFeatureEnabled(undefined)).toBe(false);
      expect(features.isFeatureEnabled(null)).toBe(false);
    });
  });

  describe('enableFeature', () => {
    test('should enable available feature', () => {
      const result = features.enableFeature(FEATURE_FLAGS.ALT_CLICK);
      expect(result).toBe(true);
      expect(features.isFeatureEnabled(FEATURE_FLAGS.ALT_CLICK)).toBe(true);
    });

    test('should not enable unavailable feature', () => {
      const result = features.enableFeature(FEATURE_FLAGS.CUSTOM_FILTERS);
      expect(result).toBe(false);
      expect(features.isFeatureEnabled(FEATURE_FLAGS.CUSTOM_FILTERS)).toBe(false);
    });

    test('should warn when enabling unknown feature', () => {
      const result = features.enableFeature('UNKNOWN_FEATURE');
      expect(result).toBe(false);
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Unknown feature'));
    });

    test('should reset failures on enable', () => {
      features.recordFeatureFailure(FEATURE_FLAGS.ALT_CLICK);
      features.recordFeatureFailure(FEATURE_FLAGS.ALT_CLICK);
      features.enableFeature(FEATURE_FLAGS.ALT_CLICK);
      const state = features.getFeatureState(FEATURE_FLAGS.ALT_CLICK);
      expect(state.failures).toBe(0);
    });

    test('should log when enabling feature', () => {
      features.enableFeature(FEATURE_FLAGS.ALT_CLICK);
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Enabled feature'));
    });
  });

  describe('disableFeature', () => {
    test('should disable feature', () => {
      features.enableFeature(FEATURE_FLAGS.ALT_CLICK);
      const result = features.disableFeature(FEATURE_FLAGS.ALT_CLICK);
      expect(result).toBe(true);
      expect(features.isFeatureEnabled(FEATURE_FLAGS.ALT_CLICK)).toBe(false);
    });

    test('should warn when disabling unknown feature', () => {
      const result = features.disableFeature('UNKNOWN_FEATURE');
      expect(result).toBe(false);
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Unknown feature'));
    });

    test('should log when disabling feature', () => {
      features.enableFeature(FEATURE_FLAGS.ALT_CLICK);
      features.disableFeature(FEATURE_FLAGS.ALT_CLICK);
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Disabled feature'));
    });
  });

  describe('toggleFeature', () => {
    test('should disable enabled feature', () => {
      features.enableFeature(FEATURE_FLAGS.ALT_CLICK);
      const result = features.toggleFeature(FEATURE_FLAGS.ALT_CLICK);
      expect(result).toBe(false);
      expect(features.isFeatureEnabled(FEATURE_FLAGS.ALT_CLICK)).toBe(false);
    });

    test('should enable disabled available feature', () => {
      features.disableFeature(FEATURE_FLAGS.ALT_CLICK);
      const result = features.toggleFeature(FEATURE_FLAGS.ALT_CLICK);
      expect(result).toBe(true);
      expect(features.isFeatureEnabled(FEATURE_FLAGS.ALT_CLICK)).toBe(true);
    });

    test('should not enable unavailable feature', () => {
      const result = features.toggleFeature(FEATURE_FLAGS.CUSTOM_FILTERS);
      expect(result).toBe(false);
    });
  });

  describe('recordFeatureFailure', () => {
    test('should record first failure', () => {
      const result = features.recordFeatureFailure(FEATURE_FLAGS.ALT_CLICK);
      expect(result).toBe(true);
      const state = features.getFeatureState(FEATURE_FLAGS.ALT_CLICK);
      expect(state.failures).toBe(1);
    });

    test('should record multiple failures', () => {
      features.recordFeatureFailure(FEATURE_FLAGS.ALT_CLICK);
      features.recordFeatureFailure(FEATURE_FLAGS.ALT_CLICK);
      const state = features.getFeatureState(FEATURE_FLAGS.ALT_CLICK);
      expect(state.failures).toBe(2);
    });

    test('should auto-disable feature after threshold', () => {
      features.enableFeature(FEATURE_FLAGS.ALT_CLICK);
      features.recordFeatureFailure(FEATURE_FLAGS.ALT_CLICK);
      features.recordFeatureFailure(FEATURE_FLAGS.ALT_CLICK);
      const result = features.recordFeatureFailure(FEATURE_FLAGS.ALT_CLICK);
      expect(result).toBe(false);
      expect(features.isFeatureEnabled(FEATURE_FLAGS.ALT_CLICK)).toBe(false);
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Auto-disabled feature'));
    });

    test('should continue counting failures even after auto-disable', () => {
      features.enableFeature(FEATURE_FLAGS.ALT_CLICK);
      features.recordFeatureFailure(FEATURE_FLAGS.ALT_CLICK);
      features.recordFeatureFailure(FEATURE_FLAGS.ALT_CLICK);
      features.recordFeatureFailure(FEATURE_FLAGS.ALT_CLICK);
      features.recordFeatureFailure(FEATURE_FLAGS.ALT_CLICK);
      const state = features.getFeatureState(FEATURE_FLAGS.ALT_CLICK);
      expect(state.failures).toBe(4); // Counter continues to increment
      expect(features.isFeatureEnabled(FEATURE_FLAGS.ALT_CLICK)).toBe(false);
    });

    test('should log warning on each failure', () => {
      features.recordFeatureFailure(FEATURE_FLAGS.ALT_CLICK);
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Feature failure'));
    });

    test('should return false for unknown feature', () => {
      const result = features.recordFeatureFailure('UNKNOWN_FEATURE');
      expect(result).toBe(false);
    });
  });

  describe('resetFeatureFailures', () => {
    test('should reset failure count', () => {
      features.recordFeatureFailure(FEATURE_FLAGS.ALT_CLICK);
      features.recordFeatureFailure(FEATURE_FLAGS.ALT_CLICK);
      features.resetFeatureFailures(FEATURE_FLAGS.ALT_CLICK);
      const state = features.getFeatureState(FEATURE_FLAGS.ALT_CLICK);
      expect(state.failures).toBe(0);
    });

    test('should not error for unknown feature', () => {
      expect(() => {
        features.resetFeatureFailures('UNKNOWN_FEATURE');
      }).not.toThrow();
    });

    test('should log when resetting failures', () => {
      features.recordFeatureFailure(FEATURE_FLAGS.ALT_CLICK);
      features.resetFeatureFailures(FEATURE_FLAGS.ALT_CLICK);
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Reset failures'));
    });
  });

  describe('getAllFeatureStates', () => {
    test('should return all feature states', () => {
      const states = features.getAllFeatureStates();
      expect(Object.keys(states)).toContain('ALT_CLICK');
      expect(Object.keys(states)).toContain('CONTEXT_MENUS');
      expect(Object.keys(states)).toContain('CUSTOM_FILTERS');
    });

    test('should return copy of states (not reference)', () => {
      const states1 = features.getAllFeatureStates();
      const states2 = features.getAllFeatureStates();
      expect(states1).not.toBe(states2);
      expect(states1).toEqual(states2);
    });

    test('should reflect current state', () => {
      features.enableFeature(FEATURE_FLAGS.ALT_CLICK);
      const states = features.getAllFeatureStates();
      expect(states[FEATURE_FLAGS.ALT_CLICK].enabled).toBe(true);
    });
  });

  describe('getFeatureState', () => {
    test('should return feature state', () => {
      const state = features.getFeatureState(FEATURE_FLAGS.ALT_CLICK);
      expect(state).toHaveProperty('enabled');
      expect(state).toHaveProperty('available');
      expect(state).toHaveProperty('failures');
    });

    test('should return null for unknown feature', () => {
      const state = features.getFeatureState('UNKNOWN_FEATURE');
      expect(state).toBeNull();
    });

    test('should handle undefined feature names', () => {
      const state = features.getFeatureState(undefined);
      expect(state).toBeNull();
    });
  });

  describe('withFeature', () => {
    test('should execute function when feature is enabled', () => {
      features.enableFeature(FEATURE_FLAGS.ALT_CLICK);
      const fn = jest.fn(() => 'result');
      const result = features.withFeature(FEATURE_FLAGS.ALT_CLICK, fn);
      expect(fn).toHaveBeenCalled();
      expect(result).toBe('result');
    });

    test('should return null when feature is disabled without fallback', () => {
      features.disableFeature(FEATURE_FLAGS.ALT_CLICK);
      const fn = jest.fn(() => 'result');
      const result = features.withFeature(FEATURE_FLAGS.ALT_CLICK, fn);
      expect(fn).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    test('should return fallback when feature is disabled', () => {
      features.disableFeature(FEATURE_FLAGS.ALT_CLICK);
      const fn = jest.fn(() => 'result');
      const result = features.withFeature(FEATURE_FLAGS.ALT_CLICK, fn, 'fallback');
      expect(fn).not.toHaveBeenCalled();
      expect(result).toBe('fallback');
    });

    test('should handle errors and record failure', () => {
      features.enableFeature(FEATURE_FLAGS.ALT_CLICK);
      const fn = jest.fn(() => { throw new Error('Test error'); });
      const result = features.withFeature(FEATURE_FLAGS.ALT_CLICK, fn, 'fallback');
      expect(fn).toHaveBeenCalled();
      expect(result).toBe('fallback');
      expect(console.error).toHaveBeenCalled();
      const state = features.getFeatureState(FEATURE_FLAGS.ALT_CLICK);
      expect(state.failures).toBe(1);
    });

    test('should log warning when skipping disabled feature', () => {
      features.disableFeature(FEATURE_FLAGS.ALT_CLICK);
      features.withFeature(FEATURE_FLAGS.ALT_CLICK, jest.fn());
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Feature disabled'));
    });

    test('should handle undefined fallback', () => {
      features.disableFeature(FEATURE_FLAGS.ALT_CLICK);
      const result = features.withFeature(FEATURE_FLAGS.ALT_CLICK, jest.fn());
      expect(result).toBeNull();
    });

    test('should handle function returning undefined', () => {
      features.enableFeature(FEATURE_FLAGS.ALT_CLICK);
      const result = features.withFeature(FEATURE_FLAGS.ALT_CLICK, () => undefined);
      expect(result).toBeUndefined();
    });
  });

  describe('withFeatureAsync', () => {
    test('should execute async function when feature is enabled', async () => {
      features.enableFeature(FEATURE_FLAGS.ALT_CLICK);
      const fn = jest.fn(async () => 'result');
      const result = await features.withFeatureAsync(FEATURE_FLAGS.ALT_CLICK, fn);
      expect(fn).toHaveBeenCalled();
      expect(result).toBe('result');
    });

    test('should return null when feature is disabled without fallback', async () => {
      features.disableFeature(FEATURE_FLAGS.ALT_CLICK);
      const fn = jest.fn(async () => 'result');
      const result = await features.withFeatureAsync(FEATURE_FLAGS.ALT_CLICK, fn);
      expect(fn).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    test('should return fallback when feature is disabled', async () => {
      features.disableFeature(FEATURE_FLAGS.ALT_CLICK);
      const fn = jest.fn(async () => 'result');
      const result = await features.withFeatureAsync(FEATURE_FLAGS.ALT_CLICK, fn, 'fallback');
      expect(fn).not.toHaveBeenCalled();
      expect(result).toBe('fallback');
    });

    test('should handle async errors and record failure', async () => {
      features.enableFeature(FEATURE_FLAGS.ALT_CLICK);
      const fn = jest.fn(async () => { throw new Error('Test error'); });
      const result = await features.withFeatureAsync(FEATURE_FLAGS.ALT_CLICK, fn, 'fallback');
      expect(fn).toHaveBeenCalled();
      expect(result).toBe('fallback');
      expect(console.error).toHaveBeenCalled();
      const state = features.getFeatureState(FEATURE_FLAGS.ALT_CLICK);
      expect(state.failures).toBe(1);
    });

    test('should log warning when skipping disabled feature', async () => {
      features.disableFeature(FEATURE_FLAGS.ALT_CLICK);
      await features.withFeatureAsync(FEATURE_FLAGS.ALT_CLICK, jest.fn());
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Feature disabled'));
    });
  });

  describe('init', () => {
    test('should initialize successfully', async () => {
      const result = await features.init();
      expect(result.initialized).toBe(true);
      expect(result.features).toBeDefined();
      expect(result.available).toBeDefined();
    });

    test('should detect available features', async () => {
      global.browser.MessagesListAdapter = { test: true };
      global.browser.menus = { test: true };
      global.browser.mailTabs = { setQuickFilter: jest.fn() };

      const result = await features.init();
      expect(result.available).toBeDefined();
      expect(typeof result.available).toBe('object');
    });

    test('should update feature states with availability', async () => {
      global.browser.MessagesListAdapter = { test: true };
      await features.init();
      expect(features.isFeatureAvailable(FEATURE_FLAGS.ALT_CLICK)).toBe(true);
    });

    test('should return all feature states', async () => {
      const result = await features.init();
      expect(Object.keys(result.features)).toContain('ALT_CLICK');
      expect(Object.keys(result.features)).toContain('CONTEXT_MENUS');
    });

    test('should log successful initialization', async () => {
      await features.init();
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Initialization complete'));
    });
  });

  describe('Module State Management', () => {
    test('should initialize feature states correctly on load', () => {
      const freshFeatures = require('../../src/utils/features');
      const states = freshFeatures.getAllFeatureStates();
      expect(Object.keys(states)).toHaveLength(10);
      expect(states).toHaveProperty('ALT_CLICK');
      expect(states).toHaveProperty('CONTEXT_MENUS');
    });
  });
});
