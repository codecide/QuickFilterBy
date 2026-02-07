/**
 * Unit tests for src/utils/version.js
 *
 * Tests all version detection and compatibility utilities including:
 * - Version parsing and comparison
 * - Thunderbird version detection
 * - Compatibility checking
 * - Feature capability detection
 * - API availability checking
 * - Code path detection
 */

const { describe, it, expect, beforeEach } = require('@jest/globals');
const {
  SUPPORTED_VERSION,
  CompatibilityStatus,
  getThunderbirdVersion,
  parseVersion,
  compareVersions,
  checkCompatibility,
  getCompatibilityStatus,
  enforceVersion,
  getVersionCodePath,
  getCodePath,
  detectFeatures,
  isFeatureAvailable,
  checkAPIAvailable,
  getAPIAvailability,
  checkRequiredAPIs,
  checkExperimentalAPI,
  initVersionDetection
} = require('../../src/utils/version');

// Load browser mocks
require('../mocks/browser');

describe('version.js - Constants', () => {
  it('should have correct SUPPORTED_VERSION constants', () => {
    expect(SUPPORTED_VERSION.MIN_MAJOR).toBe(115);
    expect(SUPPORTED_VERSION.MIN_MINOR).toBe(0);
    expect(SUPPORTED_VERSION.MAX_MAJOR).toBe(140);
    expect(SUPPORTED_VERSION.MAX_MINOR).toBe(999);
  });

  it('should have correct CompatibilityStatus constants', () => {
    expect(CompatibilityStatus.COMPATIBLE).toBe('COMPATIBLE');
    expect(CompatibilityStatus.TOO_OLD).toBe('TOO_OLD');
    expect(CompatibilityStatus.TOO_NEW).toBe('TOO_NEW');
    expect(CompatibilityStatus.UNKNOWN).toBe('UNKNOWN');
    expect(CompatibilityStatus.DEGRADED).toBe('DEGRADED');
  });
});

describe('version.js - parseVersion', () => {
  it('should parse standard version string', () => {
    const version = parseVersion('115.0.1');
    expect(version.major).toBe(115);
    expect(version.minor).toBe(0);
    expect(version.patch).toBe(1);
    expect(version.full).toBe('115.0.1');
    expect(version.comparison).toBe('115.0.1');
  });

  it('should parse version with two parts', () => {
    const version = parseVersion('115.0');
    expect(version.major).toBe(115);
    expect(version.minor).toBe(0);
    expect(version.patch).toBe(0);
  });

  it('should parse version with one part', () => {
    const version = parseVersion('115');
    expect(version.major).toBe(115);
    expect(version.minor).toBe(0);
    expect(version.patch).toBe(0);
  });

  it('should handle version with extra parts', () => {
    const version = parseVersion('115.0.1.2.3');
    expect(version.major).toBe(115);
    expect(version.minor).toBe(0);
    expect(version.patch).toBe(1);
  });

  it('should handle non-numeric version parts', () => {
    const version = parseVersion('115.0.1-beta');
    expect(version.major).toBe(115);
    expect(version.minor).toBe(0);
    expect(version.patch).toBe(1); // NaN coerced to 0
  });

  it('should handle empty version string', () => {
    const version = parseVersion('');
    expect(version.major).toBe(0);
    expect(version.minor).toBe(0);
    expect(version.patch).toBe(0);
    expect(version.full).toBe('');
  });

  it('should handle invalid version string', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const version = parseVersion('invalid');

    expect(version.major).toBe(0);
    expect(version.minor).toBe(0);
    expect(version.patch).toBe(0);
    expect(version.full).toBe('invalid');

    consoleErrorSpy.mockRestore();
  });
});

describe('version.js - compareVersions', () => {
  const v115_0_0 = { major: 115, minor: 0, patch: 0 };
  const v115_0_1 = { major: 115, minor: 0, patch: 1 };
  const v115_1_0 = { major: 115, minor: 1, patch: 0 };
  const v116_0_0 = { major: 116, minor: 0, patch: 0 };

  it('should return 0 for equal versions', () => {
    expect(compareVersions(v115_0_0, v115_0_0)).toBe(0);
    expect(compareVersions(v115_0_1, v115_0_1)).toBe(0);
  });

  it('should return -1 when first version is lower', () => {
    expect(compareVersions(v115_0_0, v115_0_1)).toBe(-1);
    expect(compareVersions(v115_0_1, v115_1_0)).toBe(-1);
    expect(compareVersions(v115_1_0, v116_0_0)).toBe(-1);
  });

  it('should return 1 when first version is higher', () => {
    expect(compareVersions(v115_0_1, v115_0_0)).toBe(1);
    expect(compareVersions(v115_1_0, v115_0_1)).toBe(1);
    expect(compareVersions(v116_0_0, v115_1_0)).toBe(1);
  });

  it('should compare major versions correctly', () => {
    const v114 = { major: 114, minor: 999, patch: 999 };
    const v115 = { major: 115, minor: 0, patch: 0 };
    expect(compareVersions(v114, v115)).toBe(-1);
    expect(compareVersions(v115, v114)).toBe(1);
  });

  it('should compare minor versions correctly', () => {
    const v115_0 = { major: 115, minor: 0, patch: 999 };
    const v115_1 = { major: 115, minor: 1, patch: 0 };
    expect(compareVersions(v115_0, v115_1)).toBe(-1);
    expect(compareVersions(v115_1, v115_0)).toBe(1);
  });

  it('should compare patch versions correctly', () => {
    const v115_0_0 = { major: 115, minor: 0, patch: 0 };
    const v115_0_1 = { major: 115, minor: 0, patch: 1 };
    expect(compareVersions(v115_0_0, v115_0_1)).toBe(-1);
    expect(compareVersions(v115_0_1, v115_0_0)).toBe(1);
  });
});

describe('version.js - checkCompatibility', () => {
  it('should return COMPATIBLE for supported versions', () => {
    const v115 = parseVersion('115.0.0');
    expect(checkCompatibility(v115)).toBe(CompatibilityStatus.COMPATIBLE);

    const v128 = parseVersion('128.0.0');
    expect(checkCompatibility(v128)).toBe(CompatibilityStatus.COMPATIBLE);

    const v140 = parseVersion('140.0.0');
    expect(checkCompatibility(v140)).toBe(CompatibilityStatus.COMPATIBLE);
  });

  it('should return TOO_OLD for versions below minimum', () => {
    const v114 = parseVersion('114.0.0');
    expect(checkCompatibility(v114)).toBe(CompatibilityStatus.TOO_OLD);

    const v100 = parseVersion('100.0.0');
    expect(checkCompatibility(v100)).toBe(CompatibilityStatus.TOO_OLD);
  });

  it('should return TOO_NEW for versions above maximum', () => {
    const v141 = parseVersion('141.0.0');
    expect(checkCompatibility(v141)).toBe(CompatibilityStatus.TOO_NEW);

    const v200 = parseVersion('200.0.0');
    expect(checkCompatibility(v200)).toBe(CompatibilityStatus.TOO_NEW);
  });

  it('should return UNKNOWN for zero version', () => {
    const v0 = parseVersion('0.0.0');
    expect(checkCompatibility(v0)).toBe(CompatibilityStatus.UNKNOWN);
  });

  it('should handle boundary versions correctly', () => {
    const v115 = parseVersion('115.0.0');
    expect(checkCompatibility(v115)).toBe(CompatibilityStatus.COMPATIBLE);

    const v114_999 = parseVersion('114.999.999');
    expect(checkCompatibility(v114_999)).toBe(CompatibilityStatus.TOO_OLD);

    const v140_999 = parseVersion('140.999.999');
    expect(checkCompatibility(v140_999)).toBe(CompatibilityStatus.COMPATIBLE);

    const v141_0 = parseVersion('141.0.0');
    expect(checkCompatibility(v141_0)).toBe(CompatibilityStatus.TOO_NEW);
  });
});

describe('version.js - getVersionCodePath', () => {
  it('should return v128+ for versions >= 128', () => {
    const v128 = { major: 128, minor: 0, patch: 0 };
    expect(getVersionCodePath(v128)).toBe('v128+');

    const v130 = { major: 130, minor: 0, patch: 0 };
    expect(getVersionCodePath(v130)).toBe('v128+');

    const v140 = { major: 140, minor: 0, patch: 0 };
    expect(getVersionCodePath(v140)).toBe('v128+');
  });

  it('should return v120-127 for versions >= 120 and < 128', () => {
    const v120 = { major: 120, minor: 0, patch: 0 };
    expect(getVersionCodePath(v120)).toBe('v120-127');

    const v125 = { major: 125, minor: 0, patch: 0 };
    expect(getVersionCodePath(v125)).toBe('v120-127');

    const v127 = { major: 127, minor: 0, patch: 0 };
    expect(getVersionCodePath(v127)).toBe('v120-127');
  });

  it('should return v115-119 for versions >= 115 and < 120', () => {
    const v115 = { major: 115, minor: 0, patch: 0 };
    expect(getVersionCodePath(v115)).toBe('v115-119');

    const v117 = { major: 117, minor: 0, patch: 0 };
    expect(getVersionCodePath(v117)).toBe('v115-119');

    const v119 = { major: 119, minor: 0, patch: 0 };
    expect(getVersionCodePath(v119)).toBe('v115-119');
  });

  it('should return legacy for versions < 115', () => {
    const v114 = { major: 114, minor: 0, patch: 0 };
    expect(getVersionCodePath(v114)).toBe('legacy');

    const v100 = { major: 100, minor: 0, patch: 0 };
    expect(getVersionCodePath(v100)).toBe('legacy');
  });
});

describe('version.js - getThunderbirdVersion', () => {
  beforeEach(() => {
    // Clear cache
    delete require.cache[require.resolve('../../src/utils/version')];
    // Reset browser mocks
    if (global.browser && global.browser._resetMocks) {
      global.browser._resetMocks();
    }
  });

  it('should get version from browser.runtime.getBrowserInfo', async () => {
    browser.runtime.getBrowserInfo.mockResolvedValue({
      version: '128.0.0',
      name: 'Thunderbird'
    });

    const { getThunderbirdVersion } = require('../../src/utils/version');
    const version = await getThunderbirdVersion();

    expect(version.major).toBe(128);
    expect(version.minor).toBe(0);
    expect(version.patch).toBe(0);
    expect(version.full).toBe('128.0.0');
    expect(browser.runtime.getBrowserInfo).toHaveBeenCalled();
  });

  it('should handle browserVersion field', async () => {
    delete require.cache[require.resolve('../../src/utils/version')];
    browser.runtime.getBrowserInfo.mockResolvedValue({
      browserVersion: '115.5.0',
      name: 'Thunderbird'
    });

    const { getThunderbirdVersion } = require('../../src/utils/version');
    const version = await getThunderbirdVersion();

    expect(version.full).toBe('115.5.0');
  });

  it('should handle missing version gracefully', async () => {
    delete require.cache[require.resolve('../../src/utils/version')];
    browser.runtime.getBrowserInfo.mockResolvedValue({
      name: 'Thunderbird'
    });

    const { getThunderbirdVersion } = require('../../src/utils/version');
    const version = await getThunderbirdVersion();

    expect(version.full).toBe('0.0.0');
  });

  it('should handle API errors gracefully', async () => {
    delete require.cache[require.resolve('../../src/utils/version')];
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    browser.runtime.getBrowserInfo.mockRejectedValue(new Error('API error'));

    const { getThunderbirdVersion } = require('../../src/utils/version');
    const version = await getThunderbirdVersion();

    expect(version.full).toBe('0.0.0');
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('should cache version result', async () => {
    delete require.cache[require.resolve('../../src/utils/version')];
    browser.runtime.getBrowserInfo.mockResolvedValue({
      version: '128.0.0',
      name: 'Thunderbird'
    });

    const { getThunderbirdVersion } = require('../../src/utils/version');

    const version1 = await getThunderbirdVersion();
    const version2 = await getThunderbirdVersion();

    expect(version1).toBe(version2);
    expect(browser.runtime.getBrowserInfo).toHaveBeenCalledTimes(1);
  });
});

describe('version.js - getCompatibilityStatus', () => {
  beforeEach(() => {
    delete require.cache[require.resolve('../../src/utils/version')];
    if (global.browser && global.browser._resetMocks) {
      global.browser._resetMocks();
    }
  });

  it('should return compatibility for compatible version', async () => {
    browser.runtime.getBrowserInfo.mockResolvedValue({
      version: '128.0.0',
      name: 'Thunderbird'
    });

    const { getCompatibilityStatus } = require('../../src/utils/version');
    const compat = await getCompatibilityStatus();

    expect(compat.status).toBe(CompatibilityStatus.COMPATIBLE);
    expect(compat.isCompatible).toBe(true);
    expect(compat.version.major).toBe(128);
    expect(compat.minVersion).toBe('115.0.0');
    expect(compat.maxVersion).toBe('140.999.0');
  });

  it('should return TOO_OLD status', async () => {
    browser.runtime.getBrowserInfo.mockResolvedValue({
      version: '114.0.0',
      name: 'Thunderbird'
    });

    const { getCompatibilityStatus } = require('../../src/utils/version');
    const compat = await getCompatibilityStatus();

    expect(compat.status).toBe(CompatibilityStatus.TOO_OLD);
    expect(compat.isCompatible).toBe(false);
  });

  it('should return TOO_NEW status', async () => {
    browser.runtime.getBrowserInfo.mockResolvedValue({
      version: '141.0.0',
      name: 'Thunderbird'
    });

    const { getCompatibilityStatus } = require('../../src/utils/version');
    const compat = await getCompatibilityStatus();

    expect(compat.status).toBe(CompatibilityStatus.TOO_NEW);
    expect(compat.isCompatible).toBe(false);
  });

  it('should return UNKNOWN status', async () => {
    browser.runtime.getBrowserInfo.mockResolvedValue({
      version: '0.0.0',
      name: 'Thunderbird'
    });

    const { getCompatibilityStatus } = require('../../src/utils/version');
    const compat = await getCompatibilityStatus();

    expect(compat.status).toBe(CompatibilityStatus.UNKNOWN);
  });
});

describe('version.js - enforceVersion', () => {
  beforeEach(() => {
    delete require.cache[require.resolve('../../src/utils/version')];
    if (global.browser && global.browser._resetMocks) {
      global.browser._resetMocks();
    }
  });

  it('should return true for compatible version', async () => {
    browser.runtime.getBrowserInfo.mockResolvedValue({
      version: '128.0.0',
      name: 'Thunderbird'
    });

    const { enforceVersion } = require('../../src/utils/version');
    const result = await enforceVersion();

    expect(result).toBe(true);
    expect(browser.notifications.create).not.toHaveBeenCalled();
  });

  it('should show notification and return false for too old version', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    browser.runtime.getBrowserInfo.mockResolvedValue({
      version: '114.0.0',
      name: 'Thunderbird'
    });

    const { enforceVersion } = require('../../src/utils/version');
    const result = await enforceVersion();

    expect(result).toBe(false);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('too old')
    );
    expect(browser.notifications.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'QuickFilterBy - Incompatible Version'
      })
    );

    consoleWarnSpy.mockRestore();
  });

  it('should show notification and return false for too new version', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    browser.runtime.getBrowserInfo.mockResolvedValue({
      version: '141.0.0',
      name: 'Thunderbird'
    });

    const { enforceVersion } = require('../../src/utils/version');
    const result = await enforceVersion();

    expect(result).toBe(false);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('too new')
    );
    expect(browser.notifications.create).toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });

  it('should return true for unknown version', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    browser.runtime.getBrowserInfo.mockResolvedValue({
      version: '0.0.0',
      name: 'Thunderbird'
    });

    const { enforceVersion } = require('../../src/utils/version');
    const result = await enforceVersion();

    expect(result).toBe(true);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Could not determine')
    );
    expect(browser.notifications.create).not.toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });
});

describe('version.js - checkAPIAvailable', () => {
  beforeEach(() => {
    // Reset browser mock
    if (global.browser && global.browser._resetMocks) {
      global.browser._resetMocks();
    }
  });

  it('should return true for available API', () => {
    expect(checkAPIAvailable('browser.menus')).toBe(true);
    expect(checkAPIAvailable('browser.storage')).toBe(true);
    expect(checkAPIAvailable('browser.runtime')).toBe(true);
  });

  it('should return false for unavailable API', () => {
    expect(checkAPIAvailable('browser.nonexistent')).toBe(false);
    expect(checkAPIAvailable('browser.menus.nonexistent')).toBe(false);
  });

  it('should return false if browser is undefined', () => {
    const originalBrowser = global.browser;
    global.browser = undefined;

    expect(checkAPIAvailable('browser.menus')).toBe(false);

    global.browser = originalBrowser;
  });

  it('should handle API path errors', () => {
    const originalBrowser = global.browser;
    global.browser = {
      get menus() {
        throw new Error('Access denied');
      }
    };

    expect(checkAPIAvailable('browser.menus')).toBe(false);

    global.browser = originalBrowser;
  });
});

describe('version.js - getAPIAvailability', () => {
  it('should return correct API availability', async () => {
    const availability = await getAPIAvailability();

    expect(availability.browser).toBe(true);
    expect(availability.mailTabs).toBe(true);
    expect(availability.menus).toBe(true);
    expect(availability.storage).toBe(true);
    expect(availability.runtime).toBe(true);
    expect(availability.tabs).toBe(true);
    expect(availability.notifications).toBe(true);
  });
});

describe('version.js - checkRequiredAPIs', () => {
  it('should return true when all required APIs are available', async () => {
    const result = await checkRequiredAPIs();
    expect(result).toBe(true);
  });

  it('should return false when a required API is missing', async () => {
    const originalMenus = global.browser.menus;
    global.browser.menus = null;

    const result = await checkRequiredAPIs();
    expect(result).toBe(false);

    global.browser.menus = originalMenus;
  });
});

describe('version.js - checkExperimentalAPI', () => {
  it('should return true when ExtensionCommon is available', () => {
    // Load ExtensionCommon mocks
    require('../mocks/ExtensionCommon');

    const result = checkExperimentalAPI();
    expect(result).toBe(true);
  });

  it('should return false when ExtensionCommon is not available', () => {
    const originalExtensionCommon = global.ExtensionCommon;
    global.ExtensionCommon = undefined;

    const result = checkExperimentalAPI();
    expect(result).toBe(false);

    global.ExtensionCommon = originalExtensionCommon;
  });
});

describe('version.js - detectFeatures', () => {
  beforeEach(() => {
    delete require.cache[require.resolve('../../src/utils/version')];
    if (global.browser && global.browser._resetMocks) {
      global.browser._resetMocks();
    }
  });

  it('should detect features for TB 128', async () => {
    browser.runtime.getBrowserInfo.mockResolvedValue({
      version: '128.0.0',
      name: 'Thunderbird'
    });

    const { detectFeatures } = require('../../src/utils/version');
    const features = await detectFeatures();

    expect(features.threadPane).toBe(true);
    expect(features.quickFilter).toBe(true);
    expect(features.menus).toBe(true);
    expect(features.storage).toBe(true);
    expect(features.experimentalAPI).toBe(true);
    expect(features.altClick).toBe(true);
  });

  it('should detect features for TB 115', async () => {
    browser.runtime.getBrowserInfo.mockResolvedValue({
      version: '115.0.0',
      name: 'Thunderbird'
    });

    const { detectFeatures } = require('../../src/utils/version');
    const features = await detectFeatures();

    expect(features.threadPane).toBe(true);
    expect(features.quickFilter).toBe(true);
    expect(features.experimentalAPI).toBe(true);
    expect(features.altClick).toBe(true);
  });

  it('should disable alt-click for TB < 115', async () => {
    browser.runtime.getBrowserInfo.mockResolvedValue({
      version: '114.0.0',
      name: 'Thunderbird'
    });

    const { detectFeatures } = require('../../src/utils/version');
    const features = await detectFeatures();

    expect(features.threadPane).toBe(false);
    expect(features.experimentalAPI).toBe(false);
    expect(features.altClick).toBe(false);
  });

  it('should cache feature detection result', async () => {
    browser.runtime.getBrowserInfo.mockResolvedValue({
      version: '128.0.0',
      name: 'Thunderbird'
    });

    const { detectFeatures } = require('../../src/utils/version');

    const features1 = await detectFeatures();
    const features2 = await detectFeatures();

    expect(features1).toBe(features2);
    expect(browser.runtime.getBrowserInfo).toHaveBeenCalledTimes(1);
  });
});

describe('version.js - isFeatureAvailable', () => {
  beforeEach(() => {
    delete require.cache[require.resolve('../../src/utils/version')];
    if (global.browser && global.browser._resetMocks) {
      global.browser._resetMocks();
    }
  });

  it('should return true for available feature', async () => {
    browser.runtime.getBrowserInfo.mockResolvedValue({
      version: '128.0.0',
      name: 'Thunderbird'
    });

    const { isFeatureAvailable } = require('../../src/utils/version');
    const available = await isFeatureAvailable('quickFilter');

    expect(available).toBe(true);
  });

  it('should return false for unavailable feature', async () => {
    browser.runtime.getBrowserInfo.mockResolvedValue({
      version: '114.0.0',
      name: 'Thunderbird'
    });

    const { isFeatureAvailable } = require('../../src/utils/version');
    const available = await isFeatureAvailable('altClick');

    expect(available).toBe(false);
  });

  it('should return false for non-existent feature', async () => {
    browser.runtime.getBrowserInfo.mockResolvedValue({
      version: '128.0.0',
      name: 'Thunderbird'
    });

    const { isFeatureAvailable } = require('../../src/utils/version');
    const available = await isFeatureAvailable('nonexistent');

    expect(available).toBe(false);
  });
});

describe('version.js - getCodePath', () => {
  beforeEach(() => {
    delete require.cache[require.resolve('../../src/utils/version')];
    if (global.browser && global.browser._resetMocks) {
      global.browser._resetMocks();
    }
  });

  it('should return v128+ for TB 128', async () => {
    browser.runtime.getBrowserInfo.mockResolvedValue({
      version: '128.0.0',
      name: 'Thunderbird'
    });

    const { getCodePath } = require('../../src/utils/version');
    const codePath = await getCodePath();

    expect(codePath).toBe('v128+');
  });

  it('should return v120-127 for TB 125', async () => {
    browser.runtime.getBrowserInfo.mockResolvedValue({
      version: '125.0.0',
      name: 'Thunderbird'
    });

    const { getCodePath } = require('../../src/utils/version');
    const codePath = await getCodePath();

    expect(codePath).toBe('v120-127');
  });

  it('should return v115-119 for TB 115', async () => {
    browser.runtime.getBrowserInfo.mockResolvedValue({
      version: '115.0.0',
      name: 'Thunderbird'
    });

    const { getCodePath } = require('../../src/utils/version');
    const codePath = await getCodePath();

    expect(codePath).toBe('v115-119');
  });

  it('should return legacy for TB 100', async () => {
    browser.runtime.getBrowserInfo.mockResolvedValue({
      version: '100.0.0',
      name: 'Thunderbird'
    });

    const { getCodePath } = require('../../src/utils/version');
    const codePath = await getCodePath();

    expect(codePath).toBe('legacy');
  });
});

describe('version.js - initVersionDetection', () => {
  beforeEach(() => {
    delete require.cache[require.resolve('../../src/utils/version')];
    if (global.browser && global.browser._resetMocks) {
      global.browser._resetMocks();
    }
  });

  it('should initialize successfully with compatible version', async () => {
    browser.runtime.getBrowserInfo.mockResolvedValue({
      version: '128.0.0',
      name: 'Thunderbird'
    });

    const { initVersionDetection } = require('../../src/utils/version');
    const result = await initVersionDetection();

    expect(result.version.major).toBe(128);
    expect(result.isCompatible).toBe(true);
    expect(result.features).toBeDefined();
    expect(result.apiStatus).toBeDefined();
    expect(result.compatibility.status).toBe(CompatibilityStatus.COMPATIBLE);
  });

  it('should handle initialization errors gracefully', async () => {
    browser.runtime.getBrowserInfo.mockRejectedValue(new Error('API error'));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const { initVersionDetection } = require('../../src/utils/version');
    const result = await initVersionDetection();

    expect(result.error).toBeDefined();
    expect(result.isCompatible).toBe(true); // Should assume compatible on error

    consoleErrorSpy.mockRestore();
  });

  it('should detect incompatible version', async () => {
    browser.runtime.getBrowserInfo.mockResolvedValue({
      version: '114.0.0',
      name: 'Thunderbird'
    });

    const { initVersionDetection } = require('../../src/utils/version');
    const result = await initVersionDetection();

    expect(result.isCompatible).toBe(false);
    expect(result.compatibility.status).toBe(CompatibilityStatus.TOO_OLD);
  });
});
