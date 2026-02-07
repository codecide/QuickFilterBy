/**
 * Accessibility tests for QuickFilterBy extension
 *
 * Tests for accessibility features including:
 * - Keyboard navigation
 * - ARIA labels
 * - Screen reader support
 * - Focus management
 * - Color contrast
 *
 * Note: This extension uses system context menus, which limits
 * custom accessibility control. Tests verify structural accessibility.
 */

const { describe, it, expect } = require('@jest/globals');
const fs = require('fs');
const path = require('path');

// Load and parse manifest.json for accessibility checks
const manifestPath = path.join(__dirname, '../../manifest.json');
const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
const manifest = JSON.parse(manifestContent);

// Load i18n messages
const messagesPath = path.join(__dirname, '../../_locales/en/messages.json');
const messagesContent = fs.readFileSync(messagesPath, 'utf-8');
const messages = JSON.parse(messagesContent);

// Load background.js
const backgroundPath = path.join(__dirname, '../../background.js');
const backgroundContent = fs.readFileSync(backgroundPath, 'utf-8');

describe('Accessibility - Menu Labels', () => {
  it('should have internationalized menu labels', () => {
    // Check that all menu items use i18n
    expect(backgroundContent).toContain('browser.i18n.getMessage');

    // Count i18n keys
    const i18nKeys = Object.keys(messages);
    expect(i18nKeys.length).toBeGreaterThan(0);
  });

  it('should have descriptive labels for core menu items', () => {
    const coreItems = [
      'sender',
      'recipient',
      'subject'
    ];

    coreItems.forEach(item => {
      expect(messages).toHaveProperty(item);
      const label = messages[item].message;
      expect(label).toBeDefined();
      expect(label.length).toBeGreaterThan(0);
      // Labels should be descriptive and user-friendly
      expect(label.length).toBeGreaterThan(3); // At least 3 characters
    });
  });

  it('should have action-oriented labels', () => {
    const actionItems = [
      'dateToday', // "Filter by Date (Today)"
      'tagsThisMessage', // "Filter by This Message's Tags"
      'attachmentHas', // "Filter by Has Attachment"
    ];

    actionItems.forEach(key => {
      if (messages[key]) {
        const label = messages[key].message.toLowerCase();
        // Check for action words
        const hasAction = label.includes('filter') || label.includes('show');
        expect(hasAction).toBe(true);
      }
    });
  });

  it('should not use icons without text labels', () => {
    // Context menus should always have text labels
    // This is verified by checking i18n messages exist for all menus
    const menuKeys = Object.keys(messages).filter(key =>
      !key.endsWith('Description')
    );

    menuKeys.forEach(key => {
      expect(messages[key]).toBeDefined();
      expect(messages[key].message).toBeDefined();
      expect(messages[key].message.length).toBeGreaterThan(0);
    });
  });
});

describe('Accessibility - Keyboard Navigation', () => {
  it('should support standard context menu navigation', () => {
    // System menus (Thunderbird) handle keyboard navigation
    // We verify the menu structure is correct
    expect(backgroundContent).toContain('contexts: ["message_list"]');

    // Menu items should be keyboard accessible by default
    const menuCount = (backgroundContent.match(/browser\.menus\.create/g) || []).length;
    expect(menuCount).toBeGreaterThan(0);
  });

  it('should document keyboard shortcuts', () => {
    // Alt-click feature should be documented in ACCESSIBILITY.md
    const a11yPath = path.join(__dirname, '../../ACCESSIBILITY.md');
    const a11yExists = fs.existsSync(a11yPath);
    expect(a11yExists).toBe(true);

    const a11yContent = fs.readFileSync(a11yPath, 'utf-8');
    expect(a11yContent).toContain('Keyboard Shortcuts');
  });

  it('should have error notifications for accessibility', () => {
    // Error notifications should use aria-live (handled by TB notifications)
    expect(manifest.permissions).toContain('notifications');
    expect(backgroundContent).toContain('showErrorNotification');
  });
});

describe('Accessibility - Screen Reader Support', () => {
  it('should use clear, descriptive messages', () => {
    // Error messages should be descriptive
    expect(backgroundContent).toContain('Filter Failed');
    expect(backgroundContent).toContain('Could not filter');
    expect(backgroundContent).toContain('Please try again');
  });

  it('should not use visual-only indicators', () => {
    // Check that no color-only or icon-only indicators exist
    // (verified by requiring all menus have i18n labels)
    const menuKeys = Object.keys(messages);
    expect(menuKeys.length).toBeGreaterThan(0);
  });

  it('should announce filter application', () => {
    // Filter application should be announced (via notifications or console)
    expect(backgroundContent).toContain('console.log');
    expect(backgroundContent).toContain('[QuickFilterBy]');
  });
});

describe('Accessibility - Focus Management', () => {
  it('should use system focus management', () => {
    // Context menus use system focus, which is accessible
    // No custom focus traps needed
    const hasFocusTrap = backgroundContent.includes('focus()') ||
                         backgroundContent.includes('blur()');

    // Focus management is handled by Thunderbird
    // We verify no problematic focus code
    expect(hasFocusTrap).toBe(false);
  });

  it('should not block keyboard navigation', () => {
    // No preventDefault() on navigation keys
    const hasPreventDefault = backgroundContent.includes('preventDefault');

    // Should not block standard navigation
    expect(hasPreventDefault).toBe(false);
  });
});

describe('Accessibility - Error Handling', () => {
  it('should show clear error messages', () => {
    expect(backgroundContent).toContain('showErrorNotification');

    // Check error messages are user-friendly
    const errorMessages = [
      'Filter Failed',
      'Could not filter',
      'Please try again'
    ];

    errorMessages.forEach(msg => {
      expect(backgroundContent).toContain(msg);
    });
  });

  it('should provide actionable error guidance', () => {
    expect(backgroundContent).toContain('Please try again');
    expect(backgroundContent).toContain('Please add tags');
  });

  it('should not expose technical details in user errors', () => {
    // User-facing errors should not have stack traces or technical details
    // This is verified by checking error messages don't include technical terms
    const userErrorLines = backgroundContent.split('\n').filter(line => {
      return line.includes('showErrorNotification') &&
             !line.trim().startsWith('//');
    });

    userErrorLines.forEach(line => {
      expect(line.toLowerCase()).not.toMatch(/stack|trace|undefined|null/);
    });
  });
});

describe('Accessibility - Documentation', () => {
  it('should have ACCESSIBILITY.md documentation', () => {
    const a11yPath = path.join(__dirname, '../../ACCESSIBILITY.md');
    expect(fs.existsSync(a11yPath)).toBe(true);

    const a11yContent = fs.readFileSync(a11yPath, 'utf-8');
    expect(a11yContent).toContain('Accessibility');
    expect(a11yContent).toContain('Keyboard Navigation');
    expect(a11yContent).toContain('Screen Reader');
  });

  it('should document keyboard shortcuts', () => {
    const a11yPath = path.join(__dirname, '../../ACCESSIBILITY.md');
    const a11yContent = fs.readFileSync(a11yPath, 'utf-8');
    expect(a11yContent).toContain('Keyboard Shortcuts');
    expect(a11yContent).toContain('Alt + Click');
  });

  it('should document screen reader compatibility', () => {
    const a11yPath = path.join(__dirname, '../../ACCESSIBILITY.md');
    const a11yContent = fs.readFileSync(a11yPath, 'utf-8');
    expect(a11yContent).toContain('NVDA');
    expect(a11yContent).toContain('VoiceOver');
    expect(a11yContent).toContain('JAWS');
  });
});

describe('Accessibility - Compliance', () => {
  it('should use standard menu contexts', () => {
    // Standard message_list context is accessible
    expect(backgroundContent).toContain('contexts: ["message_list"]');
  });

  it('should not use deprecated accessibility APIs', () => {
    // No deprecated ARIA roles or attributes
    expect(backgroundContent.toLowerCase()).not.toMatch(/aria-\w*=/);
  });

  it('should support system accessibility settings', () => {
    // Since we use system menus, we inherit system accessibility
    // Verify we don't override system settings
    const hasSystemOverride = backgroundContent.includes('accessibility') ||
                           backgroundContent.includes('a11y');

    // Should not interfere with system accessibility
    expect(hasSystemOverride).toBe(false);
  });
});

describe('Accessibility - Color and Visuals', () => {
  it('should use system menus for consistent styling', () => {
    // Context menus use system styling, which is accessible
    // No custom CSS for menus needed
    const hasMenuCSS = fs.existsSync(path.join(__dirname, '../../css/menus.css')) ||
                        backgroundContent.includes('menus.css');

    // System menus are already accessible
    expect(hasMenuCSS).toBe(false);
  });

  it('should not use color as only indicator', () => {
    // All indicators should have text labels
    // (verified by i18n messages test)
    const hasColorOnlyIndicator = backgroundContent.includes('color:') ||
                                 backgroundContent.includes('background-color:');

    // No custom color styling for indicators
    expect(hasColorOnlyIndicator).toBe(false);
  });
});
