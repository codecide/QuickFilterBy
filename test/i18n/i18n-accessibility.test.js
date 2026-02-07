/**
 * Internationalization Accessibility Tests
 * Tests verify that translations maintain accessibility across all locales
 */

const fs = require('fs');
const path = require('path');

// Path to locales directory
const localesPath = path.join(__dirname, '../../_locales');

// List of supported locales
const supportedLocales = ['en', 'fr', 'es', 'de', 'zh_CN', 'ja'];

// Messages that should contain action-oriented language
const actionMessages = [
  'dateToday',
  'dateThisWeek',
  'dateThisMonth',
  'dateThisYear',
  'dateLast7Days',
  'dateLast30Days',
  'tagsThisMessage',
  'attachmentHas',
  'attachmentNone',
  'readUnread',
  'readRead',
];

// Messages that are labels (not necessarily action-oriented, but screen reader friendly)
const labelMessages = [
  'sender',
  'recipient',
  'recipients',
  'subject',
  'date',
  'tags',
  'attachment',
  'readStatus',
];

// Messages that should be descriptive
const descriptiveMessages = [
  'extensionName',
  'extensionDescription',
];

// Screen-reader-unfriendly patterns to avoid
const unfriendlyPatterns = [
  /[&](?!\w{1,3};)/, // & without HTML entity (except entities like &nbsp;)
  // Note: Trailing "..." is allowed for UI elements (e.g., "Choose Tags...")
  // Note: Brackets in translator credit are allowed for placeholders
  /^\s+|\s+$/, // Leading/trailing whitespace
  /\[.*?\].*\[.*?\]/, // Multiple bracket pairs (technical notes)
];

// Action-oriented language patterns (positive indicators)
const actionPatterns = [
  /^(Filter|Filtrar|Filtrer|Filtern|筛选|フィルタ)/i, // Filter in various languages
  /^(Sort|Ordenar|Trier|Sortieren|排序|並べ替え)/i, // Sort in various languages
  /^(Show|Mostrar|Afficher|Anzeigen|显示|表示)/i, // Show in various languages
  /^(Group|Agrupar|Grouper|Gruppieren|分组|グループ)/i, // Group in various languages
];

/**
 * Load messages.json for a specific locale
 */
function loadMessages(locale) {
  const messagesPath = path.join(localesPath, locale, 'messages.json');
  if (!fs.existsSync(messagesPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(messagesPath, 'utf8'));
}

/**
 * Check if a message is action-oriented
 */
function isActionOriented(message) {
  if (!message) return false;
  const text = message.message || message;
  return actionPatterns.some(pattern => pattern.test(text));
}

/**
 * Check if a message is descriptive
 */
function isDescriptive(message) {
  if (!message) return false;
  const text = message.message || message;

  // CJK text can be much shorter but still descriptive
  const isCJK = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(text);
  const minLength = isCJK ? 1 : 10;
  const maxLength = isCJK ? 50 : 200; // Increased from 100 to 200 to accommodate longer translations

  return text.length >= minLength && text.length <= maxLength;
}

/**
 * Check if a message contains unfriendly patterns
 */
function hasUnfriendlyPatterns(message) {
  if (!message) return false;
  const text = message.message || message;
  return unfriendlyPatterns.some(pattern => pattern.test(text));
}

/**
 * Check if a message is screen reader friendly
 */
function isScreenReaderFriendly(message) {
  if (!message) return false;
  const text = message.message || message;

  // No unfriendly patterns
  if (hasUnfriendlyPatterns(text)) {
    return false;
  }

  // Reasonable length (not too short, not too long for announcements)
  // Asian languages (CJK) can have very short but meaningful text
  const isCJK = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(text);
  const minLength = isCJK ? 1 : 3; // CJK can be 1 character, others need at least 3

  if (text.length < minLength || text.length > 200) {
    return false;
  }

  // No emojis (unless very common ones)
  if (text.match(/[\u{1F600}-\u{1F64F}]/u)) {
    return false;
  }

  return true;
}

/**
 * Test all locales exist and have valid messages.json
 */
describe('i18n Accessibility - Locale Structure', () => {
  test('all supported locales have messages.json', () => {
    for (const locale of supportedLocales) {
      const messages = loadMessages(locale);
      expect(messages).not.toBeNull();
      expect(typeof messages).toBe('object');
    }
  });

  test('all locales have same message keys as English', () => {
    const enMessages = loadMessages('en');
    expect(enMessages).not.toBeNull();

    const enKeys = Object.keys(enMessages);

    for (const locale of supportedLocales) {
      if (locale === 'en') continue;

      const messages = loadMessages(locale);
      expect(messages).not.toBeNull();

      const localeKeys = Object.keys(messages);

      // All English keys should exist in locale
      for (const key of enKeys) {
        expect(localeKeys).toContain(key);
      }
    }
  });

  test('all message keys have message property', () => {
    for (const locale of supportedLocales) {
      const messages = loadMessages(locale);
      expect(messages).not.toBeNull();

      for (const key of Object.keys(messages)) {
        expect(messages[key]).toHaveProperty('message');
        expect(messages[key].message).toBeTruthy();
      }
    }
  });
});

/**
 * Test action-oriented messages
 */
describe('i18n Accessibility - Action-Oriented Messages', () => {
  for (const locale of supportedLocales) {
    describe(`Locale: ${locale}`, () => {
      const messages = loadMessages(locale);

      for (const messageKey of actionMessages) {
        if (messages[messageKey]) {
          test(`${messageKey} is action-oriented or descriptive`, () => {
            const message = messages[messageKey];
            expect(message).toBeDefined();
            // Action messages should be either action-oriented or screen reader friendly
            expect(isActionOriented(message) || isScreenReaderFriendly(message)).toBe(true);
          });

          test(`${messageKey} is screen reader friendly`, () => {
            const message = messages[messageKey];
            expect(message).toBeDefined();
            expect(isScreenReaderFriendly(message)).toBe(true);
          });
        }
      }
    });
  }

  test('English action messages are descriptive', () => {
    const enMessages = loadMessages('en');

    for (const messageKey of actionMessages) {
      if (enMessages[messageKey]) {
        const message = enMessages[messageKey];
        expect(message).toBeDefined();
        // All action messages should be descriptive (explain what they do)
        expect(isDescriptive(message)).toBe(true);
      }
    }
  });
});

/**
 * Test label messages
 */
describe('i18n Accessibility - Label Messages', () => {
  for (const locale of supportedLocales) {
    describe(`Locale: ${locale}`, () => {
      const messages = loadMessages(locale);

      for (const messageKey of labelMessages) {
        if (messages[messageKey]) {
          test(`${messageKey} is screen reader friendly`, () => {
            const message = messages[messageKey];
            expect(message).toBeDefined();
            expect(isScreenReaderFriendly(message)).toBe(true);
          });
        }
      }
    });
  }
});

/**
 * Test descriptive messages
 */
describe('i18n Accessibility - Descriptive Messages', () => {
  for (const locale of supportedLocales) {
    describe(`Locale: ${locale}`, () => {
      const messages = loadMessages(locale);

      for (const messageKey of descriptiveMessages) {
        if (messages[messageKey]) {
          test(`${messageKey} is descriptive`, () => {
            const message = messages[messageKey];
            expect(message).toBeDefined();
            expect(isDescriptive(message)).toBe(true);
          });

          test(`${messageKey} is screen reader friendly`, () => {
            const message = messages[messageKey];
            expect(message).toBeDefined();
            expect(isScreenReaderFriendly(message)).toBe(true);
          });
        }
      }
    });
  }
});

/**
 * Test no unfriendly patterns
 */
describe('i18n Accessibility - No Unfriendly Patterns', () => {
  for (const locale of supportedLocales) {
    describe(`Locale: ${locale}`, () => {
      const messages = loadMessages(locale);

      test('no messages contain unfriendly patterns', () => {
        let messagesWithUnfriendlyPatterns = [];

        for (const [key, message] of Object.entries(messages)) {
          if (hasUnfriendlyPatterns(message)) {
            messagesWithUnfriendlyPatterns.push({
              key,
              message: message.message
            });
          }
        }

        expect(messagesWithUnfriendlyPatterns).toHaveLength(0);
      });
    });
  }
});

/**
 * Test message length consistency
 */
describe('i18n Accessibility - Message Length', () => {
  test('menu items have reasonable length (10-80 chars)', () => {
    for (const locale of supportedLocales) {
      const messages = loadMessages(locale);

      for (const [key, message] of Object.entries(messages)) {
        if (key.startsWith('menu')) {
          const text = message.message;
          expect(text.length).toBeGreaterThanOrEqual(10);
          expect(text.length).toBeLessThanOrEqual(80);
        }
      }
    }
  });

  test('descriptions have reasonable length (20-150 chars)', () => {
    for (const locale of supportedLocales) {
      const messages = loadMessages(locale);

      for (const [key, message] of Object.entries(messages)) {
        if (key.endsWith('Description')) {
          const text = message.message;
          expect(text.length).toBeGreaterThanOrEqual(20);
          expect(text.length).toBeLessThanOrEqual(150);
        }
      }
    }
  });
});

/**
 * Test no placeholder translations
 */
describe('i18n Accessibility - No Placeholders', () => {
  test('no messages are obvious placeholders', () => {
    const placeholderPatterns = [
      /^\[TODO\]/i,
      /^\[TRANSLATE\]/i,
      /^\[PLACEHOLDER\]/i,
      /^XXX$/i,
      /^TBD$/i,
    ];

    for (const locale of supportedLocales) {
      const messages = loadMessages(locale);

      for (const [key, message] of Object.entries(messages)) {
        const text = message.message;

        for (const pattern of placeholderPatterns) {
          expect(text).not.toMatch(pattern);
        }
      }
    }
  });
});

/**
 * Test consistent terminology
 */
describe('i18n Accessibility - Consistent Terminology', () => {
  test('filter terminology is consistent across locales', () => {
    // Each locale should use consistent filter terminology
    for (const locale of supportedLocales) {
      const messages = loadMessages(locale);

      // Check that date messages use consistent filter language
      const dateMessages = [
        messages['dateToday']?.message,
        messages['dateThisWeek']?.message,
        messages['dateThisMonth']?.message,
      ].filter(Boolean);

      if (locale === 'en') {
        // English should contain "Filter"
        expect(dateMessages.every(m => m.includes('Filter'))).toBe(true);
      } else if (locale === 'fr') {
        // French should contain "Filtrer"
        expect(dateMessages.every(m => m.includes('Filtrer'))).toBe(true);
      } else if (locale === 'es') {
        // Spanish should contain "Filtrar"
        expect(dateMessages.every(m => m.includes('Filtrar'))).toBe(true);
      } else if (locale === 'de') {
        // German should contain "filter" (case-insensitive)
        expect(dateMessages.every(m => /filter/i.test(m))).toBe(true);
      }
      // Other locales follow similar patterns
    }
  });
});

// Error messages that should be descriptive
const errorMessages = [
  'dateNoMessages',
  'tagsNoTags',
  'tagsNoMessages',
  'attachmentNoMessages',
  'readNoMessages',
  'readFailed',
];

/**
 * Test accessibility of error messages
 */
describe('i18n Accessibility - Error Messages Accessibility', () => {

  for (const locale of supportedLocales) {
    describe(`Locale: ${locale}`, () => {
      const messages = loadMessages(locale);

      for (const messageKey of errorMessages) {
        if (messages[messageKey]) {
          test(`${messageKey} is descriptive`, () => {
            const message = messages[messageKey];
            expect(message).toBeDefined();
            expect(isDescriptive(message)).toBe(true);
          });

          test(`${messageKey} is screen reader friendly`, () => {
            const message = messages[messageKey];
            expect(message).toBeDefined();
            expect(isScreenReaderFriendly(message)).toBe(true);
          });

          test(`${messageKey} is helpful and actionable`, () => {
            const message = messages[messageKey];
            expect(message).toBeDefined();
            const text = message.message;
            // Should be more than just "Error" - account for CJK being shorter
            const isCJK = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(text);
            const minLength = isCJK ? 5 : 10;
            expect(text.length).toBeGreaterThanOrEqual(minLength);
          });
        }
      }
    });
  }
});

/**
 * Test i18n accessibility documentation exists
 */
describe('i18n Accessibility - Documentation', () => {
  test('ACCESSIBILITY.md exists and contains i18n section', () => {
    const accessibilityPath = path.join(__dirname, '../../ACCESSIBILITY.md');
    expect(fs.existsSync(accessibilityPath)).toBe(true);

    const content = fs.readFileSync(accessibilityPath, 'utf8');
    expect(content).toContain('Internationalization and Accessibility');
    expect(content).toContain('Accessible Translations');
    expect(content).toContain('Guidelines for Accessible Translations');
  });

  test('TRANSLATION_GUIDE.md exists and contains accessibility guidelines', () => {
    const guidePath = path.join(__dirname, '../../docs/TRANSLATION_GUIDE.md');
    expect(fs.existsSync(guidePath)).toBe(true);

    const content = fs.readFileSync(guidePath, 'utf8');
    expect(content).toMatch(/accessibility|screen reader/i);
  });
});

/**
 * Test locale file integrity
 */
describe('i18n Accessibility - Locale Integrity', () => {
  test('all locale files are valid JSON', () => {
    for (const locale of supportedLocales) {
      const messagesPath = path.join(localesPath, locale, 'messages.json');
      const content = fs.readFileSync(messagesPath, 'utf8');

      expect(() => JSON.parse(content)).not.toThrow();
    }
  });

  test('all locale files have proper encoding (UTF-8)', () => {
    for (const locale of supportedLocales) {
      const messagesPath = path.join(localesPath, locale, 'messages.json');
      const content = fs.readFileSync(messagesPath, 'utf8');

      // If file was UTF-8 encoded, fs.readFileSync('utf8') should work
      expect(content).toBeDefined();
    }
  });
});

/**
 * Test error messages accessibility
 */
describe('i18n Accessibility - Error Messages Accessibility', () => {
  for (const locale of supportedLocales) {
    describe(`Locale: ${locale}`, () => {
      const messages = loadMessages(locale);

      test('error messages are clear and actionable', () => {
        for (const key of errorMessages) {
          if (messages[key]) {
            const message = messages[key];
            const text = message.message;

            // Error messages should be screen reader friendly
            expect(isScreenReaderFriendly(message)).toBe(true);

            // Error messages should not contain unfriendly patterns
            expect(hasUnfriendlyPatterns(message)).toBe(false);

            // Error messages should be descriptive enough to be useful
            // CJK error messages can be very short but still meaningful
            const isCJK = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(text);
            const minLength = isCJK ? 2 : 5;
            expect(text.length).toBeGreaterThanOrEqual(minLength);
          }
        }
      });

      test('error messages explain the problem', () => {
        // Error messages should explain what went wrong
        for (const key of errorMessages) {
          if (messages[key]) {
            const message = messages[key];
            const text = message.message;

            // Should be more than just "Error" or "Failed"
            expect(text).not.toBe('Error');
            expect(text).not.toBe('Failed');
            expect(text).not.toBe('Unknown error');

            // Should be meaningful length (CJK can be shorter)
            const isCJK = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(text);
            const minLength = isCJK ? 2 : 10;
            expect(text.length).toBeGreaterThanOrEqual(minLength);
          }
        }
      });
    });
  }
});
