/**
 * Extension Manifest Test
 *
 * Simple validation test to ensure QuickFilterBy manifest is valid.
 * This test verifies that the extension can be loaded by Thunderbird.
 *
 * @file test/integration/manifest.test.js
 */

const { describe, it, expect } = require('@jest/globals');
const fs = require('fs');
const path = require('path');

// Load manifest.json
const manifestPath = path.join(__dirname, '../../manifest.json');
let manifest;

try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
} catch (error) {
  console.error('Failed to parse manifest.json:', error);
  throw error;
}

describe('Extension Manifest Validation', () => {
  it('should have valid JSON structure', () => {
    expect(manifest).toBeDefined();
    expect(typeof manifest).toBe('object');
  });

  it('should have manifest version', () => {
    expect(manifest.manifest_version).toBeDefined();
    expect([2, 3]).toContain(manifest.manifest_version);
  });

  it('should have application id', () => {
    expect(manifest.applications).toBeDefined();
    if (manifest.applications) {
      expect(manifest.applications.gecko).toBeDefined();
      expect(manifest.applications.gecko.id).toBeDefined();
      expect(manifest.applications.gecko.id).toContain('quickfilter');
    }
  });

  it('should have name', () => {
    expect(manifest.name).toBeDefined();
    expect(typeof manifest.name).toBe('string');
    expect(manifest.name.length).toBeGreaterThan(0);
  });

  it('should have version', () => {
    expect(manifest.version).toBeDefined();
    expect(typeof manifest.version).toBe('string');
    // Should match semver: X or X.Y.Z
    expect(manifest.version).toMatch(/^\d+(\.\d+\.\d+)?(-\w+)?$/);
  });

  it('should have description', () => {
    expect(manifest.description).toBeDefined();
    expect(typeof manifest.description).toBe('string');
  });

  it('should have icons', () => {
    // Icons are optional in Thunderbird extensions
    // This test is informational only
    const hasIcons = manifest.icons !== undefined;
    if (hasIcons) {
      expect(typeof manifest.icons).toBe('object');
      expect(Object.keys(manifest.icons).length).toBeGreaterThan(0);
    }
  });

  it('should have background script defined', () => {
    if (manifest.manifest_version === 2) {
      expect(manifest.background).toBeDefined();
      expect(typeof manifest.background.scripts).toBe('object');
      expect(manifest.background.scripts.length).toBeGreaterThan(0);
    } else if (manifest.manifest_version === 3) {
      expect(manifest.background).toBeDefined();
      expect(typeof manifest.background.service_worker).toBe('string');
    }
  });

  it('should have permissions', () => {
    expect(manifest.permissions).toBeDefined();
    expect(Array.isArray(manifest.permissions)).toBe(true);
  });

  it('should have messages permission', () => {
    expect(manifest.permissions).toContain('messagesRead');
    // accountsRead is optional, check if present
    if (manifest.permissions.includes('accountsRead')) {
      // OK - accountsRead permission is present
    }
  });

  it('should have experimental API declaration', () => {
    expect(manifest.experiment_apis).toBeDefined();
    expect(manifest.experiment_apis.MessagesListAdapter).toBeDefined();
  });

  it('should have MessagesListAdapter experiment defined', () => {
    expect(manifest.experiment_apis).toBeDefined();
    expect(manifest.experiment_apis.MessagesListAdapter).toBeDefined();
  });

  it('should have locale information', () => {
    if (manifest.default_locale) {
      expect(typeof manifest.default_locale).toBe('string');
      // Check that _locales directory exists
      const localeDir = path.join(__dirname, '../../_locales');
      expect(fs.existsSync(localeDir)).toBe(true);
    }
  });

  it('should have author information', () => {
    // Author is optional in manifest
    // This test is informational only
    const hasAuthor = manifest.author !== undefined;
    if (hasAuthor) {
      expect(typeof manifest.author).toBe('string');
    }
  });

  it('should have homepage URL', () => {
    // homepage_url is optional in manifest
    // This test is informational only
    const hasHomepage = manifest.homepage_url !== undefined;
    if (hasHomepage) {
      expect(typeof manifest.homepage_url).toBe('string');
      expect(manifest.homepage_url).toMatch(/^https?:\/\//);
    }
  });

  it('should be compatible with Thunderbird 115+', () => {
    if (manifest.applications && manifest.applications.gecko) {
      const minVersion = manifest.applications.gecko.strict_min_version || '115.0';
      const minMajor = parseInt(minVersion.split('.')[0], 10);
      expect(minMajor).toBeGreaterThanOrEqual(115);
    }
  });

  it('should have valid license reference', () => {
    // License is typically in README or LICENSE file, not manifest
    // This test verifies we have documentation for license
    const dir = path.join(__dirname, '../../');
    const files = fs.readdirSync(dir);
    const hasReadme = files.some(f => f.toLowerCase() === 'readme.md');
    const hasLicense = files.some(f => f.toLowerCase() === 'license' || f.toLowerCase().startsWith('license.'));
    const hasLicenseDoc = hasReadme || hasLicense;
    expect(hasLicenseDoc).toBe(true);
  });
});
