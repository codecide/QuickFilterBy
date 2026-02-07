/**
 * QuickFilterBy - MessagesListAdapter Experimental API Implementation
 *
 * This experimental API provides access to message list DOM events
 * for alt-click filtering functionality. It listens to click events
 * on the message list table and emits custom events when user alt-clicks
 * on columns.
 *
 * @file api/MessagesListAdapter/implementation.js
 * @version 14.0.0
 * @license ISC
 * @requires ExtensionCommon
 * @requires Services
 */

"use strict";

/* globals ExtensionCommon, Services */

// Using a closure to not leak anything but API to the outside world.
(function (exports) {

  /**
   * Set of threadPanes that have active event listeners.
   * Used for cleanup on shutdown.
   *
   * @type {Set<Object>}
   */
  const listenerThreadPanes = new Set();

  /**
   * EventEmitter for message list click events.
   * Emits events to registered listeners.
   *
   * @type {ExtensionCommon.EventEmitter}
   */
  const messageListListener = new ExtensionCommon.EventEmitter();

  // ============================================================================
  // MAIN API CLASS
  // ============================================================================

  /**
   * Main API class for MessagesListAdapter.
   * Extends ExtensionCommon.ExtensionAPI to integrate with Thunderbird's
   * experimental API system.
   *
   * @class
   * @extends {ExtensionCommon.ExtensionAPI}
   */
  class MessagesListAdapter extends ExtensionCommon.ExtensionAPI {

    /**
     * Called when the extension is installed or updated.
     * Logs initialization status.
     */
    onStartup() {
      try {
        console.log("[QuickFilterBy] MessagesListAdapter experimental API initialized");
        // Note: Original line kept for reference: //console.log("QFB: MessagesListAdapter Init 5")
      } catch (error) {
        console.error("[QuickFilterBy] Error in onStartup:", error);
      }
    }

    /**
     * Called when the extension is shut down (disabled, removed, or Thunderbird closed).
     * Cleans up all event listeners and releases DOM references.
     *
     * @param {boolean} isAppShutdown - True if Thunderbird is closing
     */
    onShutdown(isAppShutdown) {
      try {
        // If the application is shutting down, no need to clean up
        if (isAppShutdown) {
          return; // application gets unloaded anyway
        }

        console.log("[QuickFilterBy] Cleaning up MessagesListAdapter...");

        // Removing previously set onClick listeners
        for (const threadPane of listenerThreadPanes.values()) {
          try {
            if (threadPane && threadPane.treeTable) {
              threadPane.treeTable.removeEventListener("click", onMessageListClick, true);
            }
          } catch (error) {
            console.error("[QuickFilterBy] Error removing listener from threadPane:", error);
          }
        }

        // Clear all listeners
        listenerThreadPanes.clear();

        // Flush all caches
        try {
          Services.obs.notifyObservers(null, "startupcache-invalidate");
        } catch (error) {
          console.error("[QuickFilterBy] Error invalidating cache:", error);
        }

        console.log("[QuickFilterBy] MessagesListAdapter cleanup completed");
      } catch (error) {
        console.error("[QuickFilterBy] Error in onShutdown:", error);
      }
    }

    /**
     * Returns the API object exposed to WebExtension code.
     * Provides methods for initializing tabs and event listeners.
     *
     * @param {Object} context - Extension context (tabManager, etc.)
     * @returns {Object} API object with methods
     */
    getAPI(context) {
      try {
        return {
          MessagesListAdapter: {
            /**
             * Event listener for message list clicks.
             * Allows WebExtension to subscribe to alt-click events.
             *
             * @type {ExtensionCommon.EventManager}
             */
            onMessageListClick: new ExtensionCommon.EventManager({
              context,
              name: "MessagesListAdapter.onMessageListClick",

              /**
               * Register callback for message list click events.
               *
               * @param {Function} fire - Event emitter function
               * @returns {Function} Unregister function
               */
              register(fire) {
                /**
                 * Callback that fires event to WebExtension.
                 * Wraps fire.async for error handling.
                 *
                 * @param {Event} event - DOM click event
                 * @param {string} columnName - Name of column clicked
                 * @param {string} columnText - Text content of column
                 */
                function callback(event, columnName, columnText) {
                  try {
                    return fire.async(columnName, columnText);
                  } catch (error) {
                    console.error("[QuickFilterBy] Error in event callback:", error);
                  }
                }

                // Register callback with event emitter
                messageListListener.on("messagelist-clicked", callback);

                // Return unregister function
                return function () {
                  try {
                    messageListListener.off("messagelist-clicked", callback);
                  } catch (error) {
                    console.error("[QuickFilterBy] Error unregistering callback:", error);
                  }
                };
              },
            }).api(),

            /**
             * Initialize a tab for message list click detection.
             * Sets up event listener on the tab's message list table.
             *
             * @param {number} tabId - The ID of the tab to initialize
             * @returns {Promise<void>}
             */
            initTab: async function (tabId) {
              try {
                // Validate inputs
                if (!tabId || typeof tabId !== 'number') {
                  console.error("[QuickFilterBy] Invalid tabId:", tabId);
                  return;
                }

                // Get native tab object from tab manager
                let { nativeTab } = context.extension.tabManager.get(tabId);
                if (!nativeTab) {
                  console.warn("[QuickFilterBy] Could not get nativeTab for tabId:", tabId);
                  return;
                }

                // Get the about:3pane window
                let about3PaneWindow = getAbout3PaneWindow(nativeTab);
                if (!about3PaneWindow) {
                  console.warn("[QuickFilterBy] Could not get about3pane window for tabId:", tabId);
                  return;
                }

                // Get threadPane (message list container)
                let threadPane = about3PaneWindow.threadPane;
                if (!threadPane) {
                  console.warn("[QuickFilterBy] Could not get threadPane for tabId:", tabId);
                  return;
                }

                // Check if treeTable exists
                if (!threadPane.treeTable) {
                  console.warn("[QuickFilterBy] Could not get treeTable for tabId:", tabId);
                  return;
                }

                // Add click event listener to message list table
                threadPane.treeTable.addEventListener("click", onMessageListClick, true);
                listenerThreadPanes.add(threadPane);

                console.log("[QuickFilterBy] Initialized tab:", tabId);
              } catch (error) {
                console.error("[QuickFilterBy] Error in initTab for tabId", tabId, ":", error);
              }
            }
          },
        };
      } catch (error) {
        console.error("[QuickFilterBy] Error in getAPI:", error);
        return {};
      }
    }
  }

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Gets the about:3pane window from a native tab.
   * The about:3pane window is Thunderbird's main mail window.
   *
   * @param {Object} nativeTab - Native tab object from Thunderbird
   * @returns {Object|null} The about:3pane window object, or null if not found
   */
  function getAbout3PaneWindow(nativeTab) {
    try {
      if (!nativeTab) {
        return null;
      }

      // Check if tab is a mail3PaneTab (main mail view)
      if (nativeTab.mode && nativeTab.mode.name == "mail3PaneTab") {
        return nativeTab.chromeBrowser.contentWindow;
      }

      return null;
    } catch (error) {
      console.error("[QuickFilterBy] Error in getAbout3PaneWindow:", error);
      return null;
    }
  }

  /**
   * Event handler for message list click events.
   * Detects alt-click on columns and emits event to WebExtension.
   *
   * @param {Event} event - DOM click event
   */
  function onMessageListClick(event) {
    try {
      // Only process left-click with Alt key modifier
      if (event.button != 0 || !event.altKey) {
        return;
      }

      // Validate event target
      let target = event.composedTarget;
      if (!target) {
        console.warn("[QuickFilterBy] Click event has no target");
        return;
      }

      // Find the closest table cell (td element)
      let box = target.closest("td");
      if (!box) {
        console.warn("[QuickFilterBy] Could not find table cell for click");
        return;
      }

      // Find column name by looking for class ending with "-column"
      let columnName = null;
      try {
        columnName = [...box.classList.values()].find(e => e.endsWith("-column"));
      } catch (error) {
        console.error("[QuickFilterBy] Error getting classList:", error);
      }

      // Get column text (prefer title attribute, fallback to textContent)
      let columnText = box.title || box.textContent || '';

      // Only proceed if we found a column
      if (columnName) {
        // Emit event to WebExtension through custom event
        // This allows background.js to use the mailTabs API to set quick filter
        messageListListener.emit("messagelist-clicked", columnName, columnText);
      } else {
        console.warn("[QuickFilterBy] Could not determine column for click");
      }
    } catch (error) {
      console.error("[QuickFilterBy] Error in onMessageListClick:", error);
    }
  }

  // ============================================================================
  // EXPORT
  // ============================================================================

  // Export api by assigning to the exports parameter of anonymous closure function,
  // which is the global this.
  exports.MessagesListAdapter = MessagesListAdapter;

})(this)
