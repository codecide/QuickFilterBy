/**
 * QuickFilterBy - Background Script
 *
 * This background script manages the extension's core functionality:
 * - Context menu creation and management
 * - Menu item click handlers for filtering messages
 * - Alt-click event handling for quick filtering
 * - Tab initialization for all mail tabs
 * - Date-based message filtering
 * - Tag-based message filtering
 * - Attachment status filtering
 * - Read status filtering
 *
 * @file background.js
 * @version 14.0.1
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
// DATE FILTERING
// ============================================================================

/**
 * Helper function to filter messages by date range.
 * Queries messages within date range, then filters by message IDs.
 *
 * @param {Date} start - Start date
 * @param {Date} end - End date
 */
async function filterByDateRange(start, end) {
  try {
    // Query messages within date range
    const messages = await browser.messages.query({
      fromDate: start,
      toDate: end,
    });

    if (messages.messages.length === 0) {
      await browser.notifications.create({
        type: 'basic',
        title: 'No Messages Found',
        message: browser.i18n.getMessage('dateNoMessages'),
      });
      return;
    }

    // Extract message IDs and filter by them
    const messageIds = messages.messages.map(m => m.id);

    await browser.mailTabs.setQuickFilter({
      text: { text: messageIds.join(',') },
    });
  } catch (error) {
    ErrorUtils.logError(error, { context: 'date filter', start, end });
    await ErrorUtils.showErrorNotification(
      'Filter Failed',
      'Could not filter by date. Please try again.',
      { type: 'error' }
    );
  }
}

/**
 * Calculate date range for "Today".
 * @returns {{start: Date, end: Date}}
 */
function getTodayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return { start, end };
}

/**
 * Calculate date range for "This Week".
 * @returns {{start: Date, end: Date}}
 */
function getThisWeekRange() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday
  const start = new Date(now);
  start.setDate(now.getDate() - dayOfWeek);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

/**
 * Calculate date range for "This Month".
 * @returns {{start: Date, end: Date}}
 */
function getThisMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 0, 0);
  end.setMilliseconds(-1);
  return { start, end };
}

/**
 * Calculate date range for last N days.
 * @param {number} days - Number of days
 * @returns {{start: Date, end: Date}}
 */
function getLastDaysRange(days) {
  const now = new Date();
  const start = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
  return { start, end: now };
}

/**
 * Create context menu separator.
 */
browser.menus.create({
  type: "separator",
  contexts: ["message_list"],
});

/**
 * DATE FILTERING - DISABLED
 *
 * Thunderbird's Quick Filter API (browser.mailTabs.setQuickFilter) does NOT support
 * date filtering. The API only supports:
 * - text filtering (author, recipients, subject, body)
 * - tag filtering
 * - flagged status
 * - read status
 * - attachment status
 *
 * Date filtering would require a custom UI to display filtered messages,
 * which is complex to implement. For now, date filters are disabled.
 *
 * Helper functions (getTodayRange, getThisWeekRange, etc.) are kept
 * for future implementation when a custom date picker UI is created.
 *
 * See: https://webextension-api.thunderbird.net/mailTabs.html#setQuickFilter
 */

// Date filter menu items are disabled due to API limitation
// TODO: Implement custom date picker UI for date filtering
// browser.menus.create({
//   id: "date-today",
//   title: browser.i18n.getMessage("dateToday"),
//   contexts: ["message_list"],
//   async onclick(info) {
//     const { start, end } = getTodayRange();
//     await filterByDateRange(start, end);
//   },
// });
//
// ... (other date menu items similarly disabled)

// ============================================================================
// TAG FILTERING
// ============================================================================

/**
 * Filter messages by one or more tags.
 * Uses setQuickFilter with tags parameter.
 *
 * @param {Array<string>} tags - Array of tag keys (e.g., ["$label1", "$label2"])
 * @returns {Promise<void>}
 */
async function filterByTags(tags) {
  try {
    ErrorUtils.validateType(tags, 'array');
    ErrorUtils.validateArrayElements(tags, 'string');

    console.log('[Tag Filter] Attempting to filter by tags:', tags);
    console.log('[Tag Filter] Tags array type:', typeof tags, 'length:', tags.length);
    console.log('[Tag Filter] Calling setQuickFilter with:', { mode: "or", tags: tags });

    await browser.mailTabs.setQuickFilter({
      mode: "or", // Show messages with ANY of the selected tags
      tags: tags
    });

    console.log('[Tag Filter] setQuickFilter completed successfully');
  } catch (error) {
    console.error('[Tag Filter] Error:', error);
    ErrorUtils.logError(error, { context: 'tag filter', tags });
    await ErrorUtils.showErrorNotification(
      'Filter Failed',
      `Could not filter by tags: ${error.message || 'Unknown error'}`,
      { type: 'error' }
    );
  }
}

// ============================================================================
// TAG FILTERING
// ============================================================================

/**
 * Create context menu separator for tag filters.
 */
browser.menus.create({
  type: "separator",
  contexts: ["message_list"],
});

/**
 * Create context menu item for filtering by this message's tags.
 * Filters messages to show all messages with the same tags as the selected message.
 */
browser.menus.create({
  id: "tags-this-message",
  title: browser.i18n.getMessage("tagsThisMessage"),
  contexts: ["message_list"],
  async onclick(info) {
    try {
      ErrorUtils.validateNotNull(info, 'info');
      ErrorUtils.validateNotNull(info.selectedMessages, 'info.selectedMessages');

      const message = info.selectedMessages.messages[0];
      ErrorUtils.validateNotNull(message, 'message');

      console.log('[Tags-This-Message] Message object:', message);
      console.log('[Tags-This-Message] Message.tags:', message.tags);

      // Get tags from the selected message
      const tags = message.tags || [];
      console.log('[Tags-This-Message] Extracted tags array:', tags);
      console.log('[Tags-This-Message] Tags length:', tags.length);

      if (tags.length === 0) {
        console.log('[Tags-This-Message] No tags found, showing notification');
        await ErrorUtils.showErrorNotification(
          'No Tags',
          'This message has no tags. Please add tags to the message first.',
          { type: 'info' }
        );
        return;
      }

      // Extract tag keys if tags are objects
      const tagKeys = tags.map(tag => typeof tag === 'string' ? tag : tag.key);
      console.log('[Tags-This-Message] Tag keys:', tagKeys);

      await filterByTags(tagKeys);
    } catch (error) {
      console.error('[Tags-This-Message] Error:', error);
      ErrorUtils.logError(error, { context: 'tags-this-message menu item' });
      await ErrorUtils.showErrorNotification(
        'Filter Failed',
        'Could not filter by this message\'s tags. Please try again.',
        { type: 'error' }
      );
    }
  },
});

/**
 * Create context menu item for filtering by specific tag (placeholder).
 * This will be dynamically populated with available tags.
 * Note: Full tag submenu implementation requires tag caching and dynamic menu building.
 * This is a simplified version that filters by a predefined tag or shows error.
 */
browser.menus.create({
  id: "tags-placeholder",
  title: browser.i18n.getMessage("tagsChooseTags"),
  contexts: ["message_list"],
  async onclick(info) {
    try {
      console.log('[Tags-Choose] Attempting to get all tags...');

      // Try to get all tags
      let tags;
      try {
        tags = await browser.messages.tags.list();
        console.log('[Tags-Choose] Got tags from API:', tags);
        console.log('[Tags-Choose] Tags count:', tags?.length);
      } catch (e) {
        console.error('[Tags-Choose] Error getting tags:', e);
        // Tags API might not be available
        await ErrorUtils.showErrorNotification(
          'Tags Not Available',
          'Tag filtering requires Thunderbird 115+ with messagesRead permission.',
          { type: 'error' }
        );
        return;
      }

      if (!tags || tags.length === 0) {
        console.log('[Tags-Choose] No tags defined');
        await ErrorUtils.showErrorNotification(
          browser.i18n.getMessage("tagsNoTags"),
          'Please create tags in Thunderbird first: Tools > Message Tags.',
          { type: 'info' }
        );
        return;
      }

      // For now, just filter by the first tag as a demo
      // Full implementation would show a popup UI with all tags
      const firstTag = tags[0];
      console.log('[Tags-Choose] Using first tag:', firstTag);
      console.log('[Tags-Choose] First tag key:', firstTag.key);

      await filterByTags([firstTag.key]);

    } catch (error) {
      console.error('[Tags-Choose] Error:', error);
      ErrorUtils.logError(error, { context: 'tags-choose-tags menu item' });
      await ErrorUtils.showErrorNotification(
        'Filter Failed',
        'Could not access tags. Please try again.',
        { type: 'error' }
      );
    }
  },
});

// ============================================================================
// ATTACHMENT STATUS FILTERING
// ============================================================================

/**
 * Filter messages by attachment status.
 * Uses setQuickFilter with attachment status parameter.
 *
 * @param {boolean} hasAttachment - true for has attachment, false for no attachment
 * @returns {Promise<void>}
 */
async function filterByAttachmentStatus(hasAttachment) {
  try {
    ErrorUtils.validateType(hasAttachment, 'boolean');

    await browser.mailTabs.setQuickFilter({
      attachmentStatus: hasAttachment ? "attached" : "missing",
    });
    console.log('[Attachment Filter] Filtered by attachment status:', hasAttachment ? 'has attachment' : 'no attachment');
  } catch (error) {
    ErrorUtils.logError(error, { context: 'attachment filter', hasAttachment });
    await ErrorUtils.showErrorNotification(
      'Filter Failed',
      'Could not filter by attachment status. Please try again.',
      { type: 'error' }
    );
  }
}

/**
 * ATTACHMENT FILTERING - DISABLED
 *
 * Thunderbird's Quick Filter API (browser.mailTabs.setQuickFilter) does NOT support
 * attachment filtering via the WebExtension API. The built-in Quick Filter bar
 * has an attachment toggle, but the API doesn't expose a parameter for it.
 *
 * This is another API limitation, similar to date filtering.
 *
 * Helper function filterByAttachmentStatus() is kept for future implementation
 * if/when the API is updated.
 *
 * See: https://webextension-api.thunderbird.net/mailTabs.html#method-setQuickFilter
 */

// Attachment filter menu items are disabled due to API limitation
// TODO: Re-enable when browser.mailTabs.setQuickFilter supports attachment parameter
// browser.menus.create({
//   type: "separator",
//   contexts: ["message_list"],
// });
//
// browser.menus.create({
//   id: "attachment-filter-menu",
//   title: browser.i18n.getMessage("attachment"),
//   contexts: ["message_list"],
// });
//
// browser.menus.create({
//   id: "attachment-has",
//   title: browser.i18n.getMessage("attachmentHas"),
//   contexts: ["message_list"],
//   parentId: "attachment-filter-menu",
//   async onclick(info) {
//     await filterByAttachmentStatus(true);
//   },
// });
//
// browser.menus.create({
//   id: "attachment-none",
//   title: browser.i18n.getMessage("attachmentNone"),
//   contexts: ["message_list"],
//   parentId: "attachment-filter-menu",
//   async onclick(info) {
//     await filterByAttachmentStatus(false);
//   },
// });

// ============================================================================
// READ/UNREAD STATUS FILTERING
// ============================================================================

/**
 * Filter messages by read status (unread or read).
 * Uses setQuickFilter with unread parameter.
 *
 * @param {boolean} isUnread - true for unread, false for read
 * @returns {Promise<void>}
 */
async function filterByReadStatus(isUnread) {
  try {
    ErrorUtils.validateType(isUnread, 'boolean');

    await browser.mailTabs.setQuickFilter({
      unread: isUnread
    });
    console.log('[Read Status Filter] Filtered by read status:', isUnread ? 'unread' : 'read');
  } catch (error) {
    ErrorUtils.logError(error, { context: 'read status filter', isUnread });
    await ErrorUtils.showErrorNotification(
      browser.i18n.getMessage('readFailed'),
      error.message,
      { type: 'error' }
    );
  }
}

/**
 * Create context menu separator for read status filters.
 */
browser.menus.create({
  type: "separator",
  contexts: ["message_list"],
});

/**
 * Create context menu for read status filters.
 */
browser.menus.create({
  id: "read-status-menu",
  title: browser.i18n.getMessage("readStatus"),
  contexts: ["message_list"],
});

/**
 * Create context menu item for filtering unread messages.
 */
browser.menus.create({
  id: "read-unread",
  title: browser.i18n.getMessage("readUnread"),
  contexts: ["message_list"],
  parentId: "read-status-menu",
  async onclick(info) {
    await filterByReadStatus(true);
  },
});

/**
 * Create context menu item for filtering read messages.
 */
browser.menus.create({
  id: "read-read",
  title: browser.i18n.getMessage("readRead"),
  contexts: ["message_list"],
  parentId: "read-status-menu",
  async onclick(info) {
    await filterByReadStatus(false);
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
    // Note: Date and attachment filter menu items are disabled due to API limitations
    const menuIds = [
      "sender", "senderEmail", "recipient", "recipients", "subject",
      "tags-this-message", "tags-placeholder",
      "read-status-menu", "read-unread", "read-read"
    ];
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
