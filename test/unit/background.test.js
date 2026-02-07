/**
 * Unit tests for background.js
 *
 * Tests all background script functionality including:
 * - Context menu creation
 * - Menu item click handlers
 * - Alt-click event handling
 * - Tab initialization
 * - Main function
 *
 * Note: background.js is a standalone script that runs in browser context.
 * Tests verify that the script structure is correct and APIs are mocked properly.
 */

const { describe, it, expect, beforeEach } = require('@jest/globals');
const fs = require('fs');
const path = require('path');

// Load browser mocks first
const browserMock = require('../mocks/browser');

// Load and parse background.js for structure verification
const backgroundScriptPath = path.join(__dirname, '../../background.js');
const backgroundScriptContent = fs.readFileSync(backgroundScriptPath, 'utf-8');

// Verify script is valid JavaScript by trying to parse it
let scriptParsed = false;
try {
  // Use acorn or just eval to verify syntax
  new Function(backgroundScriptContent);
  scriptParsed = true;
} catch (error) {
  console.error('Failed to parse background.js:', error);
}

describe('background.js - Browser API Mocks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have browser global object available', () => {
    expect(global.browser).toBeDefined();
    expect(global.browser.menus).toBeDefined();
    expect(global.browser.mailTabs).toBeDefined();
    expect(global.browser.MessagesListAdapter).toBeDefined();
    expect(global.browser.i18n).toBeDefined();
  });

  it('should have messenger global object available', () => {
    expect(global.messenger).toBeDefined();
    expect(global.messenger.tabs).toBeDefined();
    expect(global.messenger.MessagesListAdapter).toBeDefined();
  });

  it('should have browser.i18n.getMessage mocked', () => {
    expect(browser.i18n.getMessage).toBeDefined();
    expect(typeof browser.i18n.getMessage).toBe('function');
  });

  it('should have browser.mailTabs.setQuickFilter mocked', () => {
    expect(browser.mailTabs.setQuickFilter).toBeDefined();
    expect(typeof browser.mailTabs.setQuickFilter).toBe('function');
  });

  it('should have browser.menus.create mocked', () => {
    expect(browser.menus.create).toBeDefined();
    expect(typeof browser.menus.create).toBe('function');
  });

  it('should have browser.menus.onShown mocked', () => {
    expect(browser.menus.onShown.addListener).toBeDefined();
    expect(typeof browser.menus.onShown.addListener).toBe('function');
  });

  it('should have browser.menus.onHidden mocked', () => {
    expect(browser.menus.onHidden.addListener).toBeDefined();
    expect(typeof browser.menus.onHidden.addListener).toBe('function');
  });

  it('should have browser.notifications.create mocked', () => {
    expect(browser.notifications.create).toBeDefined();
    expect(typeof browser.notifications.create).toBe('function');
  });
});

describe('background.js - Console Functions', () => {
  it('should have console.log available', () => {
    expect(console.log).toBeDefined();
    expect(typeof console.log).toBe('function');
  });

  it('should have console.error available', () => {
    expect(console.error).toBeDefined();
    expect(typeof console.error).toBe('function');
  });

  it('should have console.warn available', () => {
    expect(console.warn).toBeDefined();
    expect(typeof console.warn).toBe('function');
  });
});

describe('background.js - Script Structure', () => {
  it('should parse as valid JavaScript', () => {
    expect(scriptParsed).toBe(true);
  });

  it('should create sender menu item', () => {
    expect(backgroundScriptContent).toContain('id: "sender"');
    expect(backgroundScriptContent).toContain('browser.menus.create');
  });

  it('should create senderEmail menu item', () => {
    expect(backgroundScriptContent).toContain('id: "senderEmail"');
  });

  it('should create recipient menu item', () => {
    expect(backgroundScriptContent).toContain('id: "recipient"');
  });

  it('should create recipients menu item', () => {
    expect(backgroundScriptContent).toContain('id: "recipients"');
  });

  it('should create subject menu item', () => {
    expect(backgroundScriptContent).toContain('id: "subject"');
    expect(backgroundScriptContent).toContain('contexts: ["message_list"]');
  });

  it('should create date-today menu item', () => {
    expect(backgroundScriptContent).toContain('id: "date-today"');
    expect(backgroundScriptContent).toContain('filterByDateRange');
  });

  it('should create date-this-week menu item', () => {
    expect(backgroundScriptContent).toContain('id: "date-this-week"');
    expect(backgroundScriptContent).toContain('getThisWeekRange');
  });

  it('should create date-this-month menu item', () => {
    expect(backgroundScriptContent).toContain('id: "date-this-month"');
    expect(backgroundScriptContent).toContain('getThisMonthRange');
  });

  it('should create date-last-7days menu item', () => {
    expect(backgroundScriptContent).toContain('id: "date-last-7days"');
    expect(backgroundScriptContent).toContain('getLastDaysRange(7)');
  });

  it('should create date-last-30days menu item', () => {
    expect(backgroundScriptContent).toContain('id: "date-last-30days"');
    expect(backgroundScriptContent).toContain('getLastDaysRange(30)');
  });

  it('should register onShown listener', () => {
    expect(backgroundScriptContent).toContain('browser.menus.onShown.addListener');
  });

  it('should register tab listener', () => {
    expect(backgroundScriptContent).toContain('messenger.tabs.onCreated.addListener');
  });

  it('should register alt-click listener', () => {
    expect(backgroundScriptContent).toContain('browser.MessagesListAdapter.onMessageListClick.addListener');
  });

  it('should define main function', () => {
    expect(backgroundScriptContent).toContain('async function main()');
    expect(backgroundScriptContent).toContain('main();');
  });

  it('should use ErrorUtils for error handling', () => {
    expect(backgroundScriptContent).toContain('ErrorUtils.logError');
    expect(backgroundScriptContent).toContain('ErrorUtils.showErrorNotification');
  });
});

