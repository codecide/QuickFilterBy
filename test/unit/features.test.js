/**
 * Unit tests for src/utils/features.js
 */

global.browser = {
  MessagesListAdapter: {},
  menus: {},
  mailTabs: { setQuickFilter: jest.fn() }
};
global.console = { log: jest.fn(), warn: jest.fn(), error: jest.fn(), info: jest.fn() };

const features = require('../../src/utils/features');
const { FEATURE_FLAGS, FAILURE_THRESHOLD } = features;

describe('features.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Re-init to fresh state
    features.enableFeature(FEATURE_FLAGS.ALT_CLICK);
  });

  describe('constants', () => {
    it('should define all expected feature flags', () => {
      const flags = Object.values(FEATURE_FLAGS);
      expect(flags).toContain('ALT_CLICK');
      expect(flags).toContain('CONTEXT_MENUS');
      expect(flags).toContain('FILTER_HISTORY');
      expect(flags.length).toBeGreaterThanOrEqual(5);
    });

    it('should have FAILURE_THRESHOLD of 3', () => {
      expect(FAILURE_THRESHOLD).toBe(3);
    });

    it('should have DEFAULT_FEATURE_STATES with correct shape', () => {
      const states = features.DEFAULT_FEATURE_STATES;
      Object.values(states).forEach(state => {
        expect(state).toHaveProperty('enabled');
        expect(state).toHaveProperty('available');
        expect(state).toHaveProperty('failures', 0);
      });
    });
  });

  describe('detectAvailableFeatures', () => {
    it('should detect available APIs as features', async () => {
      global.browser.MessagesListAdapter = { test: true };
      global.browser.menus = { create: jest.fn() };
      global.browser.mailTabs = { setQuickFilter: jest.fn() };

      const available = await features.detectAvailableFeatures();
      expect(available[FEATURE_FLAGS.ALT_CLICK]).toBe(true);
      expect(available[FEATURE_FLAGS.CONTEXT_MENUS]).toBe(true);
    });

    it('should mark features unavailable when APIs are missing', async () => {
      global.browser.MessagesListAdapter = undefined;
      const available = await features.detectAvailableFeatures();
      expect(available[FEATURE_FLAGS.ALT_CLICK]).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      global.browser.mailTabs = null;
      const available = await features.detectAvailableFeatures();
      expect(available).toBeDefined();
    });
  });

  describe('feature state management', () => {
    it('isFeatureEnabled should return true for enabled features', () => {
      features.enableFeature(FEATURE_FLAGS.ALT_CLICK);
      expect(features.isFeatureEnabled(FEATURE_FLAGS.ALT_CLICK)).toBe(true);
    });

    it('disableFeature should disable a feature', () => {
      features.enableFeature(FEATURE_FLAGS.ALT_CLICK);
      features.disableFeature(FEATURE_FLAGS.ALT_CLICK);
      expect(features.isFeatureEnabled(FEATURE_FLAGS.ALT_CLICK)).toBe(false);
    });

    it('toggleFeature should flip enabled state', () => {
      features.enableFeature(FEATURE_FLAGS.ALT_CLICK);
      const result = features.toggleFeature(FEATURE_FLAGS.ALT_CLICK);
      expect(result).toBe(false);
    });

    it('should return false for null/undefined feature names', () => {
      expect(features.isFeatureEnabled(null)).toBe(false);
      expect(features.isFeatureAvailable(undefined)).toBe(false);
    });
  });

  describe('recordFeatureFailure', () => {
    it('should auto-disable feature after threshold failures', () => {
      features.enableFeature(FEATURE_FLAGS.ALT_CLICK);
      for (let i = 0; i < FAILURE_THRESHOLD; i++) {
        features.recordFeatureFailure(FEATURE_FLAGS.ALT_CLICK);
      }
      expect(features.isFeatureEnabled(FEATURE_FLAGS.ALT_CLICK)).toBe(false);
    });

    it('should keep feature enabled below threshold', () => {
      features.enableFeature(FEATURE_FLAGS.ALT_CLICK);
      features.recordFeatureFailure(FEATURE_FLAGS.ALT_CLICK);
      expect(features.isFeatureEnabled(FEATURE_FLAGS.ALT_CLICK)).toBe(true);
    });
  });

  describe('resetFeatureFailures', () => {
    it('should reset failure count', () => {
      features.enableFeature(FEATURE_FLAGS.ALT_CLICK);
      features.recordFeatureFailure(FEATURE_FLAGS.ALT_CLICK);
      features.resetFeatureFailures(FEATURE_FLAGS.ALT_CLICK);
      const state = features.getFeatureState(FEATURE_FLAGS.ALT_CLICK);
      expect(state.failures).toBe(0);
    });
  });

  describe('getAllFeatureStates / getFeatureState', () => {
    it('should return all feature states', () => {
      const states = features.getAllFeatureStates();
      expect(Object.keys(states).length).toBeGreaterThan(0);
    });

    it('should return null for unknown feature', () => {
      expect(features.getFeatureState('NONEXISTENT')).toBeNull();
    });
  });

  describe('withFeature', () => {
    it('should execute function when feature is enabled', () => {
      features.enableFeature(FEATURE_FLAGS.ALT_CLICK);
      const result = features.withFeature(FEATURE_FLAGS.ALT_CLICK, () => 42);
      expect(result).toBe(42);
    });

    it('should return fallback when feature is disabled', () => {
      features.disableFeature(FEATURE_FLAGS.ALT_CLICK);
      const result = features.withFeature(FEATURE_FLAGS.ALT_CLICK, () => 42, 'fallback');
      expect(result).toBe('fallback');
    });
  });

  describe('withFeatureAsync', () => {
    it('should execute async function when feature is enabled', async () => {
      features.enableFeature(FEATURE_FLAGS.ALT_CLICK);
      const result = await features.withFeatureAsync(FEATURE_FLAGS.ALT_CLICK, async () => 42);
      expect(result).toBe(42);
    });

    it('should return fallback when feature is disabled', async () => {
      features.disableFeature(FEATURE_FLAGS.ALT_CLICK);
      const result = await features.withFeatureAsync(FEATURE_FLAGS.ALT_CLICK, async () => 42, 'fallback');
      expect(result).toBe('fallback');
    });
  });
});
