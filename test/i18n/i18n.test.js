/**
 * i18n validation tests
 *
 * Tests for internationalization features including:
 * - All locales have required keys
 * - JSON format validation
 * - No missing translations
 * - Translation consistency
 *
 * Note: These tests verify the i18n framework is properly set up
 */

const { describe, it, expect } = require('@jest/globals');
const fs = require('fs');
const path = require('path');

// Load English messages (reference)
const enMessagesPath = path.join(__dirname, '../../_locales/en/messages.json');
const enMessagesContent = fs.readFileSync(enMessagesPath, 'utf-8');
const enMessages = JSON.parse(enMessagesContent);

// Get all locale directories
const localesDir = path.join(__dirname, '../../_locales');
const locales = fs.readdirSync(localesDir).filter(dir => {
  const localePath = path.join(localesDir, dir);
  return fs.statSync(localePath).isDirectory();
});

describe('i18n - Locale Structure', () => {
  it('should have English locale directory', () => {
    expect(fs.existsSync(enMessagesPath)).toBe(true);
  });

  it('should have multiple locale directories', () => {
    expect(locales.length).toBeGreaterThan(1); // At least en and one other
  });

  it('should have all expected locale directories', () => {
    const expectedLocales = ['en', 'fr', 'es', 'de', 'zh_CN', 'ja'];
    expectedLocales.forEach(locale => {
      expect(locales).toContain(locale);
    });
  });
});

describe('i18n - English Reference', () => {
  it('should have valid JSON format for English', () => {
    expect(() => JSON.parse(enMessagesContent)).not.toThrow();
  });

  it('should have all required keys', () => {
    const requiredKeys = [
      'extensionName',
      'extensionDescription',
      'sender',
      'subject',
      'date',
      'tags',
      'attachment',
      'readStatus'
    ];

    requiredKeys.forEach(key => {
      expect(enMessages).toHaveProperty(key);
    });
  });

  it('should have message format for all keys', () => {
    Object.keys(enMessages).forEach(key => {
      expect(enMessages[key]).toHaveProperty('message');
      expect(enMessages[key].message).toBeDefined();
    });
  });
});

describe('i18n - Locale Validation', () => {
  const otherLocales = locales.filter(locale => locale !== 'en');

  otherLocales.forEach(locale => {
    const localePath = path.join(localesDir, locale, 'messages.json');

    it(`should have messages.json for ${locale}`, () => {
      expect(fs.existsSync(localePath)).toBe(true);
    });

    it(`should have valid JSON for ${locale}`, () => {
      const content = fs.readFileSync(localePath, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it(`should have all English keys in ${locale}`, () => {
      const content = fs.readFileSync(localePath, 'utf-8');
      const messages = JSON.parse(content);

      // Check that all English keys exist
      Object.keys(enMessages).forEach(key => {
        expect(messages).toHaveProperty(key);
      });
    });

    it(`should have message property for all keys in ${locale}`, () => {
      const content = fs.readFileSync(localePath, 'utf-8');
      const messages = JSON.parse(content);

      Object.keys(messages).forEach(key => {
        expect(messages[key]).toHaveProperty('message');
        expect(messages[key].message).toBeDefined();
      });
    });

    it(`should have non-empty messages in ${locale}`, () => {
      const content = fs.readFileSync(localePath, 'utf-8');
      const messages = JSON.parse(content);

      Object.keys(messages).forEach(key => {
        if (!key.startsWith('_')) { // Skip metadata keys
          expect(messages[key].message.length).toBeGreaterThan(0);
        }
      });
    });
  });
});

describe('i18n - Translation Completeness', () => {
  it('should have same number of keys across all locales', () => {
    const enKeyCount = Object.keys(enMessages).length;

    locales.forEach(locale => {
      const localePath = path.join(localesDir, locale, 'messages.json');
      const content = fs.readFileSync(localePath, 'utf-8');
      const messages = JSON.parse(content);
      const localeKeyCount = Object.keys(messages).length;

      // Allow metadata keys (starting with _) in non-English locales
      const enRegularKeys = Object.keys(enMessages).filter(k => !k.startsWith('_'));
      const localeRegularKeys = Object.keys(messages).filter(k => !k.startsWith('_'));

      expect(localeRegularKeys.length).toBe(enRegularKeys.length);
    });
  });
});

describe('i18n - Translation Guide', () => {
  it('should have TRANSLATION_GUIDE.md documentation', () => {
    const guidePath = path.join(__dirname, '../../docs/TRANSLATION_GUIDE.md');
    expect(fs.existsSync(guidePath)).toBe(true);

    const guideContent = fs.readFileSync(guidePath, 'utf-8');
    expect(guideContent).toContain('Translation Guide');
    expect(guideContent).toContain('Adding a New Language');
    expect(guideContent).toContain('Translation Guidelines');
  });

  it('should document locale codes', () => {
    const guidePath = path.join(__dirname, '../../docs/TRANSLATION_GUIDE.md');
    const guideContent = fs.readFileSync(guidePath, 'utf-8');

    expect(guideContent).toContain('IETF BCP 47');
    expect(guideContent).toContain('language tags');
  });

  it('should document testing procedures', () => {
    const guidePath = path.join(__dirname, '../../docs/TRANSLATION_GUIDE.md');
    const guideContent = fs.readFileSync(guidePath, 'utf-8');

    expect(guideContent).toContain('Testing Translations');
    expect(guideContent).toContain('Validate JSON');
  });

  it('should document submission process', () => {
    const guidePath = path.join(__dirname, '../../docs/TRANSLATION_GUIDE.md');
    const guideContent = fs.readFileSync(guidePath, 'utf-8');

    expect(guideContent).toContain('Pull Request');
    expect(guideContent).toContain('Email');
    expect(guideContent).toContain('GitHub Issues');
  });
});

describe('i18n - Accessibility in Translations', () => {
  it('should have action-oriented labels', () => {
    // Check that menu items use action words
    const actionKeys = [
      'dateToday',
      'tagsThisMessage',
      'attachmentHas',
      'readUnread'
    ];

    actionKeys.forEach(key => {
      if (enMessages[key]) {
        const message = enMessages[key].message.toLowerCase();
        // Should contain action words
        const hasAction = message.includes('filter') ||
                          message.includes('by') ||
                          message.includes('show');
        expect(hasAction).toBe(true);
      }
    });
  });

  it('should have clear, descriptive labels', () => {
    const descriptiveKeys = [
      'sender',
      'subject',
      'date'
    ];

    descriptiveKeys.forEach(key => {
      if (enMessages[key]) {
        const message = enMessages[key].message;
        // Labels should be meaningful (not single letters)
        expect(message.length).toBeGreaterThan(3);
      }
    });
  });
});
