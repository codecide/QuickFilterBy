/**
 * Unit tests for src/utils/version.js
 */

require('../mocks/browser');

const {
  SUPPORTED_VERSION, CompatibilityStatus,
  parseVersion, compareVersions, checkCompatibility, getVersionCodePath,
  getThunderbirdVersion, detectFeatures, isFeatureAvailable,
  checkAPIAvailable, getAPIAvailability, checkRequiredAPIs, checkExperimentalAPI,
  initVersionDetection
} = require('../../src/utils/version');

describe('version.js', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('constants', () => {
    it('should define version range and compatibility statuses', () => {
      expect(SUPPORTED_VERSION.MIN_MAJOR).toBe(115);
      expect(CompatibilityStatus.COMPATIBLE).toBe('COMPATIBLE');
      expect(CompatibilityStatus.TOO_OLD).toBe('TOO_OLD');
      expect(CompatibilityStatus.TOO_NEW).toBe('TOO_NEW');
    });
  });

  describe('parseVersion', () => {
    it.each([
      ['115.0.1', 115, 0, 1],
      ['128.5.0', 128, 5, 0],
      ['0.0.0', 0, 0, 0],
    ])('should parse %s correctly', (str, major, minor, patch) => {
      const v = parseVersion(str);
      expect(v.major).toBe(major);
      expect(v.minor).toBe(minor);
      expect(v.patch).toBe(patch);
      expect(v.full).toBe(str);
    });

    it('should handle empty/invalid strings', () => {
      const empty = parseVersion('');
      expect(empty.major).toBe(0);

      const spy = jest.spyOn(console, 'error').mockImplementation();
      const invalid = parseVersion('invalid');
      expect(invalid.major).toBe(0);
      spy.mockRestore();
    });
  });

  describe('compareVersions', () => {
    it('should compare major, minor, and patch correctly', () => {
      const v115 = { major: 115, minor: 0, patch: 0 };
      const v116 = { major: 116, minor: 0, patch: 0 };
      const v115_1 = { major: 115, minor: 1, patch: 0 };
      const v115_0_1 = { major: 115, minor: 0, patch: 1 };

      expect(compareVersions(v115, v116)).toBe(-1);
      expect(compareVersions(v116, v115)).toBe(1);
      expect(compareVersions(v115, v115)).toBe(0);
      expect(compareVersions(v115, v115_1)).toBe(-1);
      expect(compareVersions(v115, v115_0_1)).toBe(-1);
    });
  });

  describe('checkCompatibility', () => {
    it.each([
      ['115.0.0', CompatibilityStatus.COMPATIBLE],
      ['128.0.0', CompatibilityStatus.COMPATIBLE],
      ['114.999.999', CompatibilityStatus.TOO_OLD],
      ['200.0.0', CompatibilityStatus.TOO_NEW],
    ])('should classify %s as %s', (versionStr, expectedStatus) => {
      expect(checkCompatibility(parseVersion(versionStr))).toBe(expectedStatus);
    });

    it('should return UNKNOWN for zero version', () => {
      expect(checkCompatibility(parseVersion('0.0.0'))).toBe(CompatibilityStatus.UNKNOWN);
    });
  });

  describe('getVersionCodePath', () => {
    it('should return correct code path for version ranges', () => {
      expect(getVersionCodePath({ major: 128, minor: 0, patch: 0 })).toBe('v128+');
      expect(getVersionCodePath({ major: 120, minor: 0, patch: 0 })).toBe('v120-127');
      expect(getVersionCodePath({ major: 115, minor: 0, patch: 0 })).toBe('v115-119');
      expect(getVersionCodePath({ major: 100, minor: 0, patch: 0 })).toBe('legacy');
    });
  });

  describe('getThunderbirdVersion', () => {
    it('should detect version from browser API', async () => {
      browser.runtime.getBrowserInfo.mockResolvedValue({
        name: 'Thunderbird',
        browserVersion: '128.0.0'
      });
      const version = await getThunderbirdVersion();
      expect(version.full).toBe('128.0.0');
    });
  });

  describe('checkAPIAvailable', () => {
    it('should check nested API paths', () => {
      // checkAPIAvailable starts from global.browser, so paths omit 'browser.' prefix
      expect(checkAPIAvailable('menus')).toBe(true);
      expect(checkAPIAvailable('nonexistent')).toBe(false);
    });
  });

  describe('checkExperimentalAPI', () => {
    it('should return false when ExtensionCommon/Services are not available', () => {
      // checkExperimentalAPI checks for ExtensionCommon and Services globals
      // which are only available in the extension's privileged context
      expect(checkExperimentalAPI()).toBe(false);
    });
  });
});
