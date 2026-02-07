/**
 * DOM access utilities for QuickFilterBy extension.
 * Provides safe DOM element lookup with retries, column detection, and mutation observation.
 *
 * @module dom
 */

/**
 * Column name mapping.
 * Maps detected column classes to standardized column types.
 *
 * @typedef {Object} ColumnMapping
 * @property {string} subject - Subject column class
 * @property {string} recipient - Recipient column class
 * @property {string} sender - Sender column class
 * @property {string} correspondent - Correspondent column class
 */

/**
 * Cached column mapping.
 *
 * @type {ColumnMapping|null}
 */
let columnMapping = null;

/**
 * Listener registry for cleanup.
 *
 * @type {Map<string, {target: EventTarget, type: string, listener: Function, options: any}>}
 */
const listenerRegistry = new Map();

/**
 * Mutation observer registry for cleanup.
 *
 * @type {Set<MutationObserver>}
 */
const observerRegistry = new Set();

// ============================================================================
// SAFE DOM LOOKUP WITH RETRIES
// ============================================================================

/**
 * Finds a DOM element with retries and timeout.
 * Useful for finding elements that may not be immediately available.
 *
 * @param {Window} window - Window to search in
 * @param {string} selector - CSS selector to match
 * @param {Object} [options={}] - Options for lookup
 * @param {number} [options.maxRetries=5] - Maximum number of retries
 * @param {number} [options.retryDelay=100] - Delay between retries (ms)
 * @param {number} [options.timeout=1000] - Maximum time to wait (ms)
 * @returns {Promise<Element|null>} Found element or null if not found
 */
async function findElement(window, selector, options = {}) {
  const {
    maxRetries = 5,
    retryDelay = 100,
    timeout = 1000
  } = options;

  const startTime = Date.now();

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const element = window.document.querySelector(selector);
      if (element) {
        console.log(`[DOM] Element found on attempt ${attempt + 1}:`, selector);
        return element;
      }

      // Check timeout
      if (Date.now() - startTime > timeout) {
        console.warn(`[DOM] Element lookup timeout:`, selector);
        return null;
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    } catch (error) {
      console.error(`[DOM] Error finding element on attempt ${attempt + 1}:`, selector, error);
    }
  }

  console.warn(`[DOM] Element not found after ${maxRetries} attempts:`, selector);
  return null;
}

/**
 * Finds multiple DOM elements matching a selector.
 *
 * @param {Window} window - Window to search in
 * @param {string} selector - CSS selector to match
 * @returns {NodeList|Array>} Found elements
 */
function findElements(window, selector) {
  try {
    return window.document.querySelectorAll(selector);
  } catch (error) {
    console.error('[DOM] Error finding elements:', selector, error);
    return [];
  }
}

// ============================================================================
// COLUMN NAME DISCOVERY
// ============================================================================

/**
 * Discovers column names from the message list DOM.
 * Scans for elements ending with "-column" and maps them to column types.
 *
 * @param {Window} window - About:3pane window
 * @returns {Promise<ColumnMapping>} Discovered column mapping
 */
async function discoverColumns(window) {
  try {
    // If we have a cached mapping, return it
    if (columnMapping) {
      return columnMapping;
    }

    console.log('[DOM] Discovering column names...');

    // Get threadPane
    const threadPane = window.threadPane;
    if (!threadPane) {
      console.warn('[DOM] ThreadPane not available');
      columnMapping = { subject: null, recipient: null, sender: null, correspondent: null };
      return columnMapping;
    }

    // Get table headers
    const headers = findElements(window, 'th.headerCell');
    const mapping = {
      subject: null,
      recipient: null,
      sender: null,
      correspondent: null
    };

    // Scan headers for column classes
    headers.forEach(header => {
      const classNames = header.classList || [];
      classNames.forEach(className => {
        // Check for -column suffix
        if (className.endsWith('-column')) {
          // Determine column type
          if (className.includes('subject')) {
            mapping.subject = className;
          } else if (className.includes('recipient')) {
            mapping.recipient = className;
          } else if (className.includes('sender') || className.includes('correspondent')) {
            mapping.sender = className;
            mapping.correspondent = className;
          }
        }
      });
    });

    columnMapping = mapping;
    console.log('[DOM] Column mapping discovered:', mapping);
    return mapping;
  } catch (error) {
    console.error('[DOM] Error discovering columns:', error);
    columnMapping = { subject: null, recipient: null, sender: null, correspondent: null };
    return columnMapping;
  }
}

/**
 * Gets the column type from a column class name.
 *
 * @param {string} columnClass - Column class name (e.g., "subjectcol-column")
 * @returns {string|null} Column type ('subject', 'recipient', 'sender', 'correspondent') or null
 */
function getColumnType(columnClass) {
  if (!columnClass) return null;

  const cls = columnClass.toLowerCase();

  if (cls.includes('subject')) {
    return 'subject';
  } else if (cls.includes('recipient')) {
    return 'recipient';
  } else if (cls.includes('sender')) {
    return 'sender';
  } else if (cls.includes('correspondent')) {
    return 'correspondent';
  }

  return null;
}

/**
 * Gets cached column mapping.
 *
 * @returns {ColumnMapping|null} Cached column mapping or null
 */
function getColumnMapping() {
  return columnMapping;
}

/**
 * Clears the cached column mapping.
 * Use this when DOM structure changes.
 */
function clearColumnCache() {
  console.log('[DOM] Clearing column cache');
  columnMapping = null;
}

/**
 * Invalidates the column cache and rediscovers columns.
 *
 * @param {Window} window - About:3pane window
 * @returns {Promise<ColumnMapping>} New column mapping
 */
async function refreshColumnCache(window) {
  clearColumnCache();
  return discoverColumns(window);
}

// ============================================================================
// EVENT LISTENER MANAGEMENT
// ============================================================================

/**
 * Generates a unique listener ID.
 *
 * @returns {string} Unique ID
 */
function generateListenerId() {
  return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Registers an event listener with a unique ID for later cleanup.
 *
 * @param {EventTarget} target - Target to attach listener to
 * @param {string} type - Event type (e.g., 'click')
 * @param {Function} listener - Event listener function
 * @param {Object} [options] - Event listener options
 * @returns {string} Unique listener ID
 */
function addListener(target, type, listener, options) {
  const id = generateListenerId();

  try {
    target.addEventListener(type, listener, options);
    listenerRegistry.set(id, { target, type, listener, options });
    console.log(`[DOM] Added listener:`, id, type);
    return id;
  } catch (error) {
    console.error(`[DOM] Error adding listener:`, type, error);
    return null;
  }
}

/**
 * Removes a registered listener by ID.
 *
 * @param {string} id - Listener ID to remove
 * @returns {boolean} True if listener was removed
 */
function removeListener(id) {
  const entry = listenerRegistry.get(id);
  if (!entry) {
    console.warn(`[DOM] Listener not found:`, id);
    return false;
  }

  try {
    entry.target.removeEventListener(entry.type, entry.listener, entry.options);
    listenerRegistry.delete(id);
    console.log(`[DOM] Removed listener:`, id);
    return true;
  } catch (error) {
    console.error(`[DOM] Error removing listener:`, id, error);
    return false;
  }
}

/**
 * Removes all registered listeners.
 * Should be called on extension shutdown.
 */
function removeAllListeners() {
  console.log(`[DOM] Removing ${listenerRegistry.size} listeners...`);

  listenerRegistry.forEach((entry, id) => {
    try {
      entry.target.removeEventListener(entry.type, entry.listener, entry.options);
    } catch (error) {
      console.error(`[DOM] Error removing listener:`, id, error);
    }
  });

  listenerRegistry.clear();
  console.log('[DOM] All listeners removed');
}

/**
 * Gets the number of registered listeners.
 *
 * @returns {number} Number of listeners
 */
function getListenerCount() {
  return listenerRegistry.size;
}

// ============================================================================
// MUTATION OBSERVER
// ============================================================================

/**
 * Creates and registers a MutationObserver.
 *
 * @param {Element} target - Element to observe
 * @param {MutationCallback} callback - Callback for mutations
 * @param {Object} [options] - Observer options
 * @param {boolean} [options.childList=true] - Observe child node changes
 * @param {boolean} [options.attributes=true] - Observe attribute changes
 * @param {boolean} [options.subtree=true] - Observe all descendants
 * @returns {MutationObserver|null} Created observer or null on error
 */
function createObserver(target, callback, options = {}) {
  const observerOptions = {
    childList: options.childList !== false,
    attributes: options.attributes !== false,
    subtree: options.subtree !== false
  };

  try {
    const observer = new MutationObserver(callback);
    observer.observe(target, observerOptions);
    observerRegistry.add(observer);
    console.log('[DOM] Created MutationObserver');
    return observer;
  } catch (error) {
    console.error('[DOM] Error creating MutationObserver:', error);
    return null;
  }
}

/**
 * Disconnects all registered MutationObservers.
 */
function disconnectAllObservers() {
  console.log(`[DOM] Disconnecting ${observerRegistry.size} observers...`);

  observerRegistry.forEach(observer => {
    try {
      observer.disconnect();
    } catch (error) {
      console.error('[DOM] Error disconnecting observer:', error);
    }
  });

  observerRegistry.clear();
  console.log('[DOM] All observers disconnected');
}

/**
 * Creates a debounced function.
 *
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, delay) {
  let timeoutId;

  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// ============================================================================
// DOM MUTATION HANDLING
// ============================================================================

/**
 * Sets up DOM mutation observer for column changes.
 * Monitors for column reordering, hiding, or showing.
 *
 * @param {Window} window - About:3pane window
 * @param {Function} onChange - Callback when columns change
 * @returns {MutationObserver|null} Created observer or null
 */
function observeColumnChanges(window, onChange) {
  try {
    const threadPane = window.threadPane;
    if (!threadPane || !threadPane.treeTable) {
      console.warn('[DOM] ThreadPane or treeTable not available for observation');
      return null;
    }

    // Debounce the callback
    const debouncedCallback = debounce(() => {
      console.log('[DOM] Column changes detected');
      refreshColumnCache(window);
      if (onChange) onChange();
    }, 500);

    // Create observer
    const observer = new MutationObserver(mutations => {
      // Check if mutations affect column headers
      const affectsColumns = mutations.some(mutation => {
        return Array.from(mutation.addedNodes).some(node =>
          node.nodeType === Node.ELEMENT_NODE &&
          (node.classList?.contains('headerCell') || node.querySelector?.('.headerCell'))
        ) || Array.from(mutation.removedNodes).some(node =>
          node.nodeType === Node.ELEMENT_NODE &&
          (node.classList?.contains('headerCell') || node.querySelector?.('.headerCell'))
        );
      });

      if (affectsColumns) {
        debouncedCallback();
      }
    });

    // Start observing
    observer.observe(threadPane.treeTable, {
      childList: true,
      subtree: true,
      attributes: true
    });

    observerRegistry.add(observer);
    console.log('[DOM] Column change observer started');
    return observer;
  } catch (error) {
    console.error('[DOM] Error observing column changes:', error);
    return null;
  }
}

/**
 * Handles layout changes (theme, window resize, etc.).
 * Re-discovers columns when layout changes.
 *
 * @param {Window} window - About:3pane window
 * @param {Function} onChange - Callback when layout changes
 * @returns {Object} Object with cleanup function
 */
function observeLayoutChanges(window, onChange) {
  const debouncedCallback = debounce(() => {
    console.log('[DOM] Layout changes detected');
    refreshColumnCache(window);
    if (onChange) onChange();
  }, 500);

  // Listen for resize
  const resizeListener = () => debouncedCallback();
  window.addEventListener('resize', resizeListener);
  const resizeId = addListener(window, 'resize', resizeListener);

  // Listen for theme changes (if supported)
  let themeListener = null;
  if (window.matchMedia) {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = () => debouncedCallback();

    if (darkModeQuery.addEventListener) {
      darkModeQuery.addEventListener('change', handleThemeChange);
      themeListener = {
        remove: () => darkModeQuery.removeEventListener('change', handleThemeChange)
      };
    }
  }

  console.log('[DOM] Layout change observer started');

  return {
    cleanup: () => {
      if (resizeId) removeListener(resizeId);
      if (themeListener) themeListener.remove();
      console.log('[DOM] Layout change observer stopped');
    }
  };
}

// ============================================================================
// CLEANUP UTILITIES
// ============================================================================

/**
 * Performs full cleanup of all DOM resources.
 * Removes all listeners, observers, and clears caches.
 */
function cleanup() {
  console.log('[DOM] Performing full cleanup...');

  // Remove all listeners
  removeAllListeners();

  // Disconnect all observers
  disconnectAllObservers();

  // Clear column cache
  clearColumnCache();

  console.log('[DOM] Cleanup complete');
}

// ============================================================================
// EXPORT
// ============================================================================

// Export all functions
const dom = {
  // Safe DOM lookup
  findElement,
  findElements,

  // Column discovery
  discoverColumns,
  getColumnType,
  getColumnMapping,
  clearColumnCache,
  refreshColumnCache,

  // Listener management
  addListener,
  removeListener,
  removeAllListeners,
  getListenerCount,

  // Mutation observers
  createObserver,
  disconnectAllObservers,
  debounce,

  // DOM change handlers
  observeColumnChanges,
  observeLayoutChanges,

  // Cleanup
  cleanup
};

// For use in browser extension context
if (typeof module !== 'undefined' && module.exports) {
  module.exports = dom;
}

// Export for ES6 modules
if (typeof window !== 'undefined') {
  window.QuickFilterByDOM = dom;
}
