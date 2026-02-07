/**
 * QuickFilterBy - Background Script
 *
 * This background script manages the extension's core functionality:
 * - Context menu creation and management
 * - Menu item click handlers for filtering messages
 * - Alt-click event handling for quick filtering
 * - Tab initialization for all mail tabs
 *
 * @file background.js
 * @version 14.0.0
 * @license ISC
 */

// Import error handling utilities (if running in bundler context)
// Note: In production, errors.js will be loaded before this file
let ErrorUtils;
try {
  ErrorUtils = window.QuickFilterByErrors;
} catch (e) {
  // Fallback if error utils not available
  ErrorUtils = {
    logError: console.error,
    showErrorNotification: async () => {},
    wrapAsync: (fn) => fn,
    validateNotNull: (v) => v,
    validateType: (v, t) => v,
    validateString: (v) => v
  };
}

// ============================================================================
// CONTEXT MENU CREATION
// ============================================================================

/**
 * Create context menu item for filtering by sender.
 * This menu item filters messages by the sender's display name.
 *
 * @type {browser.menus.CreateItemType}
 */
browser.menus.create({
  id: "sender",
  title: browser.i18n.getMessage("sender"),
  contexts: ["message_list"],
  async onclick(info) {
    try {
      ErrorUtils.validateNotNull(info, 'info');
      ErrorUtils.validateNotNull(info.selectedMessages, 'info.selectedMessages');

      const message = info.selectedMessages.messages[0];
      ErrorUtils.validateNotNull(message, 'message');

      await browser.mailTabs.setQuickFilter({
        text: {
          text: message.author,
          author: true,
        },
      });
    } catch (error) {
      ErrorUtils.logError(error, { context: 'sender menu item' });
      await ErrorUtils.showErrorNotification(
        'Filter Failed',
        'Could not filter by sender. Please try again.',
        { type: 'error' }
      );
    }
  },
});

/**
 * Create context menu item for filtering by sender email only.
 * This menu item extracts only the email address (not display name).
 *
 * @type {browser.menus.CreateItemType}
 */
browser.menus.create({
  id: "senderEmail",
  title: browser.i18n.getMessage("senderEmail"),
  contexts: ["message_list"],
  async onclick(info) {
    try {
      ErrorUtils.validateNotNull(info, 'info');
      ErrorUtils.validateNotNull(info.selectedMessages, 'info.selectedMessages');

      const message = info.selectedMessages.messages[0];
      ErrorUtils.validateNotNull(message, 'message');

      // Extracting email only, if name is present
      let author = message.author;
      ErrorUtils.validateString(author, 'message.author');

      if (author.indexOf("<") > 0 && author.indexOf(">") > 0) {
        author = author.substring(author.indexOf("<") + 1, author.lastIndexOf(">"));
      }

      await browser.mailTabs.setQuickFilter({
        text: {
          text: author,
          author: true,
        },
      });
    } catch (error) {
      ErrorUtils.logError(error, { context: 'senderEmail menu item' });
      await ErrorUtils.showErrorNotification(
        'Filter Failed',
        'Could not filter by sender email. Please try again.',
        { type: 'error' }
      );
    }
  },
});

/**
 * Create context menu item for filtering by recipient.
 * This menu item filters messages by the first recipient.
 *
 * @type {browser.menus.CreateItemType}
 */
browser.menus.create({
  id: "recipient",
  title: browser.i18n.getMessage("recipient"),
  contexts: ["message_list"],
  async onclick(info) {
    try {
      ErrorUtils.validateNotNull(info, 'info');
      ErrorUtils.validateNotNull(info.selectedMessages, 'info.selectedMessages');

      const message = info.selectedMessages.messages[0];
      ErrorUtils.validateNotNull(message, 'message');

      await browser.mailTabs.setQuickFilter({
        text: {
          text: message.recipients.join(", "),
          recipients: true,
        },
      });
    } catch (error) {
      ErrorUtils.logError(error, { context: 'recipient menu item' });
      await ErrorUtils.showErrorNotification(
        'Filter Failed',
        'Could not filter by recipient. Please try again.',
        { type: 'error' }
      );
    }
  },
});

/**
 * Create context menu item for filtering by recipients.
 * This menu item filters messages by all recipients.
 *
 * @type {browser.menus.CreateItemType}
 */
browser.menus.create({
  id: "recipients",
  title: browser.i18n.getMessage("recipients"),
  contexts: ["message_list"],
  async onclick(info) {
    try {
      ErrorUtils.validateNotNull(info, 'info');
      ErrorUtils.validateNotNull(info.selectedMessages, 'info.selectedMessages');

      const message = info.selectedMessages.messages[0];
      ErrorUtils.validateNotNull(message, 'message');

      await browser.mailTabs.setQuickFilter({
        text: {
          text: message.recipients.join(", "),
          recipients: true,
        },
      });
    } catch (error) {
      ErrorUtils.logError(error, { context: 'recipients menu item' });
      await ErrorUtils.showErrorNotification(
        'Filter Failed',
        'Could not filter by recipients. Please try again.',
        { type: 'error' }
      );
    }
  },
});

/**
 * Create context menu item for filtering by subject.
 * This menu item filters messages by the subject text.
 *
 * @type {browser.menus.CreateItemType}
 */
browser.menus.create({
  id: "subject",
  title: browser.i18n.getMessage("subject"),
  contexts: ["message_list"],
  async onclick(info) {
    try {
      ErrorUtils.validateNotNull(info, 'info');
      ErrorUtils.validateNotNull(info.selectedMessages, 'info.selectedMessages');

      const message = info.selectedMessages.messages[0];
      ErrorUtils.validateNotNull(message, 'message');

      await browser.mailTabs.setQuickFilter({
        text: {
          text: message.subject,
          subject: true,
        },
      });
    } catch (error) {
      ErrorUtils.logError(error, { context: 'subject menu item' });
      await ErrorUtils.showErrorNotification(
        'Filter Failed',
        'Could not filter by subject. Please try again.',
        { type: 'error' }
      );
    }
  },
});

// ============================================================================
// MENU VISIBILITY HANDLER
// ============================================================================

/**
 * Listener for when context menu is shown.
 * Updates the visibility of menu items based on selection state.
 * Menu items are only shown when exactly one message is selected.
 *
 * @param {browser.menus.OnShownInfoType} info - Information about where the menu was shown
 */
browser.menus.onShown.addListener((info) => {
  try {
    ErrorUtils.validateNotNull(info, 'info');

    // Check if exactly one message is selected
    const oneMessage = info.selectedMessages && info.selectedMessages.messages.length == 1;

    // Update visibility for all menu items
    const menuIds = ["sender", "senderEmail", "recipient", "recipients", "subject"];
    for (const menuId of menuIds) {
      browser.menus.update(menuId, { visible: oneMessage });
    }
    browser.menus.refresh();
  } catch (error) {
    ErrorUtils.logError(error, { context: 'menu visibility handler' });
    // Don't show notification for menu visibility errors to avoid spam
  }
});

// ============================================================================
// ALT-CLICK EVENT HANDLER
// ============================================================================

/**
 * Listener for alt-click events on message list columns.
 * This event is emitted by the MessagesListAdapter experimental API.
 * Filters messages based on the column that was clicked.
 *
 * @param {string} columnName - The name of the column that was clicked
 * @param {string} columnText - The text content of the clicked cell
 */
browser.MessagesListAdapter.onMessageListClick.addListener((columnName, columnText) => {
  try {
    ErrorUtils.validateNotNull(columnName, 'columnName');
    ErrorUtils.validateNotNull(columnText, 'columnText');
    ErrorUtils.validateString(columnName, 'columnName');
    ErrorUtils.validateString(columnText, 'columnText');

    // Determine filter type based on column name
    // Note: Column names depend on Thunderbird's internal class naming
    // Common values: subjectcol-column, recipientcol-column, sendercol-column, correspondentcol-column
    const isSubject = columnName == "subjectcol-column";
    const isRecipient = columnName == "recipientcol-column";
    const isSender = columnName == "sendercol-column" || columnName == "correspondentcol-column";

    if (!isSubject && !isRecipient && !isSender) {
      // Unknown column - log and return
      console.warn(`[Alt-Click] Unknown column type: ${columnName}`);
      return;
    }

    // Apply quick filter
    browser.mailTabs.setQuickFilter({
      text: {
        text: columnText,
        subject: isSubject,
        recipients: isRecipient,
        author: isSender
      },
    }).catch((error) => {
      ErrorUtils.logError(error, { context: 'alt-click filter application', columnName, columnText });
      ErrorUtils.showErrorNotification(
        'Filter Failed',
        'Could not apply filter. Please try using the context menu instead.',
        { type: 'warning' }
      );
    });
  } catch (error) {
    ErrorUtils.logError(error, { context: 'alt-click event handler', columnName, columnText });
    ErrorUtils.showErrorNotification(
      'Filter Failed',
      'An error occurred while processing alt-click. Please try the context menu.',
      { type: 'error' }
    );
  }
});

// ============================================================================
// TAB INITIALIZATION
// ============================================================================

/**
 * Main initialization function.
 * Initializes the MessagesListAdapter for all existing tabs
 * and sets up listeners for new tabs.
 *
 * @returns {Promise<void>}
 */
async function main() {
  try {
    // Add listener for new tabs
    messenger.tabs.onCreated.addListener((tab) => {
      try {
        ErrorUtils.validateNotNull(tab, 'tab');
        ErrorUtils.validateNotNull(tab.id, 'tab.id');
        messenger.MessagesListAdapter.initTab(tab.id);
      } catch (error) {
        ErrorUtils.logError(error, { context: 'tab creation listener', tabId: tab?.id });
      }
    });

    // Initialize all existing tabs
    const tabs = await browser.tabs.query({});
    for (const tab of tabs) {
      try {
        ErrorUtils.validateNotNull(tab, 'tab');
        ErrorUtils.validateNotNull(tab.id, 'tab.id');
        messenger.MessagesListAdapter.initTab(tab.id);
      } catch (error) {
        ErrorUtils.logError(error, { context: 'tab initialization', tabId: tab?.id });
        // Continue with other tabs even if one fails
      }
    }

    console.log('[QuickFilterBy] Extension initialized successfully');
  } catch (error) {
    ErrorUtils.logError(error, { context: 'main initialization' });
    await ErrorUtils.showErrorNotification(
      'Initialization Failed',
      'QuickFilterBy could not initialize properly. Some features may not work.',
      { type: 'error' }
    );
  }
}

// Initialize extension
main();
