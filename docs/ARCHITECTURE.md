# QuickFilterBy - Architecture Documentation

This document provides an in-depth technical overview of the QuickFilterBy extension architecture, including component diagrams, data flow, API dependencies, and implementation details.

---

## Table of Contents

1. [Overview](#overview)
2. [Component Diagram](#component-diagram)
3. [Data Flow](#data-flow)
4. [API Dependencies](#api-dependencies)
5. [Thunderbird Internal APIs](#thunderbird-internal-apis)
6. [Extension Structure](#extension-structure)
7. [Key Components](#key-components)
8. [Event Handling](#event-handling)
9. [Filter Application](#filter-application)

---

## Overview

QuickFilterBy is a Thunderbird WebExtension that provides quick filtering capabilities through two primary mechanisms:

1. **Context Menus**: Right-click filtering from message list
2. **Alt-Click Filtering**: Click with Alt key modifier on message list columns

The extension uses Thunderbird's experimental API system to access message list events that are not available through standard WebExtension APIs.

### Technical Stack

- **Language**: JavaScript (ES2020+)
- **Manifest Version**: 2 (will migrate to V3)
- **Build System**: npm, Make, Gradle
- **Extension APIs**: WebExtensions API + Experimental APIs

---

## Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Thunderbird Host Application               │
│                                                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           WebExtension Runtime Environment                 │ │
│  │                                                         │ │
│  │  ┌──────────────┐         ┌──────────────────────────┐  │ │
│  │  │  background  │         │  MessagesListAdapter      │  │ │
│  │  │  .js        │◄────────┤  (Experimental API)     │  │ │
│  │  │             │         │                          │  │ │
│  │  │  - Menus    │         │  - DOM Event Listener    │  │ │
│  │  │  - Filters  │         │  - Column Detection      │  │ │
│  │  │  - Handlers │         │  - Click Capture         │  │ │
│  │  └──────┬─────┘         └──────────┬───────────────┘  │ │
│  │         │                            │                    │ │
│  │         │                            │                    │ │
│  │  ┌──────▼────────────────────────────────▼────────┐   │ │
│  │  │         WebExtension APIs                       │   │ │
│  │  │                                                │   │ │
│  │  │  • browser.menus (context menus)              │   │ │
│  │  │  • browser.mailTabs (filtering)               │   │ │
│  │  │  • browser.tabs (tab management)              │   │ │
│  │  │  • browser.i18n (internationalization)        │   │ │
│  │  │  • browser.storage (settings)                 │   │ │
│  │  └────────────────────────────────────────────────┘   │ │
│  │                                                     │ │
│  └─────────────────────────────────────────────────────┘     │
│                                                            │
└────────────────────────────────────────────────────────────────┘

                    │
                    ▼
         ┌──────────────────────┐
         │  Thunderbird UI      │
         │                     │
         │  • Message List    │
         │  • Context Menus   │
         │  • Quick Filter    │
         └──────────────────────┘
```

---

## Data Flow

### Context Menu Filtering Flow

```
User Action: Right-click on message
            │
            ▼
┌─────────────────────────────┐
│  browser.menus.onShown   │  Trigger: Context menu opened
│  Event Listener         │  Action: Check message selection
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Menu Visibility Check    │  Logic: Show only if 1 message selected
│  background.js:77-85     │  Action: Update menu visibility
└──────────┬──────────────┘
           │
           ▼
User Action: Select menu item (e.g., "Filter by Sender")
            │
            ▼
┌─────────────────────────────┐
│  browser.menus.onclick    │  Trigger: Menu item clicked
│  Event Handler           │  Action: Extract message data
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Extract Message Data    │  Data: author, recipients, subject
│  background.js:5-75      │  Action: Parse and clean values
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Apply Quick Filter      │  API: browser.mailTabs.setQuickFilter()
│  background.js:7-12     │  Parameters: text, author/recipient/subject
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Message List Updated    │  Result: Filter applied, view updated
│  Thunderbird UI         │  Action: Show filtered messages
└─────────────────────────────┘
```

### Alt-Click Filtering Flow

```
User Action: Alt + Click on column (e.g., Sender)
            │
            ▼
┌─────────────────────────────┐
│  DOM Event Capture      │  Source: Message List DOM
│  MessagesListAdapter     │  Event: Click on column element
│  implementation.js     │  Context: Alt key pressed
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Column Detection       │  Logic: Find clicked column class
│  implementation.js      │  Mapping: Class name → Column type
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Extract Column Text    │  Data: Text content of column
│  implementation.js      │  Action: Get innerText/textContent
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Emit Custom Event     │  Event: onMessageListClick
│  ExtensionCommon        │  Data: columnName, columnText
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Event Listener in     │  Trigger: onMessageListClick
│  background.js:87-99   │  Handler: Alt-click event
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Determine Filter Type  │  Logic: Column name → Filter type
│  background.js:91-97     │  Mapping: sendercol → author, etc.
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Apply Quick Filter      │  API: browser.mailTabs.setQuickFilter()
│  background.js:91-98     │  Parameters: text, author/recipient/subject
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Message List Updated    │  Result: Filter applied, view updated
│  Thunderbird UI         │  Action: Show filtered messages
└─────────────────────────────┘
```

---

## API Dependencies

### WebExtension APIs

#### browser.menus

**Purpose**: Create and manage context menu items

**Usage in Extension**:
```javascript
browser.menus.create({
  id: "sender",
  title: browser.i18n.getMessage("sender"),
  contexts: ["message_list"],
  async onclick(info) {
    // Handle click
  }
});
```

**Events Used**:
- `onShown`: Update menu visibility based on message selection
- `onclick`: Handle menu item clicks

**Dependencies**: None

---

#### browser.mailTabs

**Purpose**: Access and manipulate mail tabs, including quick filtering

**Usage in Extension**:
```javascript
await browser.mailTabs.setQuickFilter({
  text: {
    text: "sender@example.com",
    author: true,
  },
});
```

**Parameters**:
- `text`: Filter text configuration
  - `text`: The filter text string
  - `author`: Filter by sender (boolean)
  - `recipients`: Filter by recipients (boolean)
  - `subject`: Filter by subject (boolean)

**Dependencies**: None

---

#### browser.tabs

**Purpose**: Access and manage browser tabs

**Usage in Extension**:
```javascript
let tabs = await browser.tabs.query({});
for (let tab of tabs) {
  messenger.MessagesListAdapter.initTab(tab.id);
}
```

**Events Used**:
- `onCreated`: Initialize new tabs

**Dependencies**: None

---

#### browser.i18n

**Purpose**: Internationalization (i18n) support

**Usage in Extension**:
```javascript
browser.i18n.getMessage("sender")  // Get localized string
```

**Dependencies**: None

---

### Experimental APIs

#### MessagesListAdapter

**Purpose**: Access message list DOM events (not available via standard WebExtensions)

**Rationale for Experimental API**:
- Standard WebExtensions do not provide access to message list DOM events
- Alt-click functionality requires listening to column click events
- Column name detection requires DOM introspection
- This API provides safe, sandboxed access to required events

**Schema**: `api/MessagesListAdapter/schema.json`

**Implementation**: `api/MessagesListAdapter/implementation.js`

**Methods**:
- `initTab(tabId)`: Initialize event listeners for a tab
- `onShutdown()`: Clean up event listeners on extension shutdown
- `onMessageListClick`: Event triggered when user clicks on message list column

**Events**:
- `onMessageListClick(columnName, columnText)`: Emitted when column is clicked

**Dependencies**:
- `ExtensionCommon.ExtensionAPI`: Thunderbird internal API
- `ExtensionCommon.EventEmitter`: Event system
- DOM access to Thunderbird's message list (threadPane)

---

## Thunderbird Internal APIs

### ExtensionCommon

**Purpose**: Base class for implementing experimental APIs

**Usage**:
```javascript
class MessagesListAdapter extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    return {
      MessagesListAdapter: {
        initTab: (tabId) => this.initTab(tabId),
        // ...
      }
    };
  }
}
```

**Components**:
- `ExtensionCommon.ExtensionAPI`: Base class for experimental APIs
- `ExtensionCommon.EventEmitter`: Event emission system
- `ExtensionCommon.EventManager`: Event lifecycle management

---

### getAbout3PaneWindow()

**Purpose**: Get the Thunderbird main window (about:3pane)

**Usage**:
```javascript
const about3Pane = getAbout3PaneWindow(nativeTab);
const threadPane = about3Pane.threadPane;
```

**Returns**: Thunderbird's main mail window object

**Properties Accessed**:
- `threadPane`: Message list container
- `threadPane.treeTable`: Table element for message list
- `document`: DOM document

---

### DOM Elements Accessed

#### threadPane.treeTable

**Purpose**: Access the message list table DOM element

**Usage**:
```javascript
const treeTable = about3Pane.threadPane.treeTable;
treeTable.addEventListener("click", eventListener);
```

**Properties**:
- `addEventListener()`: Attach event listeners
- `removeEventListener()`: Remove event listeners

---

### Column Detection

**Column Classes**:
- `subjectcol-column`: Subject column
- `recipientcol-column`: Recipient column
- `sendercol-column`: Sender column
- `correspondentcol-column`: Correspondent column (combined sender/recipient)

**Detection Logic**:
```javascript
const clickedElement = event.composedTarget;
const row = clickedElement.closest("tr");
const cell = clickedElement.closest("td");
const columnCell = row.querySelector("td.headerCell");
const columnName = columnCell.className;
```

**Rationale**: Class names are used to identify columns. This approach works across different Thunderbird versions and UI customizations.

---

## Extension Structure

```
QuickFilterBy/
├── manifest.json                 # Extension manifest (V2)
├── background.js                # Background script
│   ├── Context menu creation    # browser.menus.create() calls
│   ├── Menu visibility handler  # browser.menus.onShown listener
│   ├── Alt-click handler      # browser.MessagesListAdapter.onMessageListClick
│   └── Tab initialization    # Tab initialization logic
├── api/
│   └── MessagesListAdapter/
│       ├── schema.json         # API schema definition
│       └── implementation.js # Experimental API implementation
│           ├── onStartup()    # Extension startup handler
│           ├── onShutdown()   # Extension shutdown handler
│           ├── getAPI()       # API method exposure
│           ├── initTab()      # Tab initialization
│           ├── onMessageListClick() # Event handler
│           └── getAbout3PaneWindow() # Helper function
├── _locales/
│   └── en/
│       └── messages.json     # English translations
├── package.json              # npm configuration
├── build.gradle             # Gradle build configuration
├── Makefile                 # Make targets
├── scripts/
│   ├── build.sh            # Unix/Linux build script
│   └── build.bat           # Windows build script
└── docs/                   # Documentation
```

---

## Key Components

### Context Menu System

**File**: `background.js` (lines 1-85)

**Responsibilities**:
1. Create context menu items for filtering
2. Update menu visibility based on message selection
3. Handle menu item clicks

**Menu Items**:
1. Filter by Sender
2. Filter by Sender Email (email address only)
3. Filter by Recipient
4. Filter by Recipients (all recipients)
5. Filter by Subject

**Logic**:
- Menus only show when exactly one message is selected
- Email extraction removes display name, keeping only email address
- Filters use `browser.mailTabs.setQuickFilter()` API

---

### Alt-Click Handler

**File**: `background.js` (lines 87-99)

**Responsibilities**:
1. Listen for alt-click events from MessagesListAdapter
2. Map column names to filter types
3. Apply quick filter based on clicked column

**Column Mapping**:
- `subjectcol-column` → `subject: true`
- `recipientcol-column` → `recipients: true`
- `sendercol-column` → `author: true`
- `correspondentcol-column` → `author: true`

**Logic**:
- Receives column name and text from experimental API
- Determines which filter parameter to set
- Applies filter using `browser.mailTabs.setQuickFilter()`

---

### Experimental API Implementation

**File**: `api/MessagesListAdapter/implementation.js`

**Responsibilities**:
1. Access Thunderbird's internal DOM (message list)
2. Listen for click events on message list columns
3. Emit custom events to background script
4. Manage tab lifecycle and cleanup

**Key Functions**:

#### onStartup()

```javascript
onStartup() {
  // Called when extension starts
  // Initialize for existing tabs
}
```

#### initTab(tabId)

```javascript
initTab(tabId) {
  // Get tab from tab manager
  // Get about:3pane window
  // Attach click listener to threadPane.treeTable
  // Store listener reference for cleanup
}
```

#### onMessageListClick(event)

```javascript
onMessageListClick(event) {
  // Capture click event
  // Detect if Alt key is pressed
  // Find clicked column
  // Extract column name and text
  // Emit event to background script
}
```

#### getAbout3PaneWindow(nativeTab)

```javascript
getAbout3PaneWindow(nativeTab) {
  // Get Thunderbird's main mail window
  // Access internal properties (mode, window)
  // Return window object
}
```

#### onShutdown()

```javascript
onShutdown() {
  // Remove all event listeners
  // Clean up for each initialized tab
  // Remove threadPane references
}
```

---

## Event Handling

### Event Lifecycle

1. **Extension Startup** (`background.js` main function)
   - Initialize tabs using `browser.tabs.query()`
   - Initialize MessagesListAdapter for each tab
   - Attach tab creation listener

2. **Tab Creation** (`background.js` onCreated listener)
   - Call `MessagesListAdapter.initTab(tabId)`
   - Attach DOM event listeners

3. **Tab Initialization** (`MessagesListAdapter.initTab`)
   - Get tab from tab manager
   - Get about:3pane window
   - Access threadPane and treeTable
   - Attach click event listener to treeTable
   - Store listener for cleanup

4. **User Interaction** (alt-click or context menu)
   - Capture event (via DOM or browser.menus)
   - Extract relevant data
   - Emit event or execute handler
   - Apply filter

5. **Extension Shutdown** (`MessagesListAdapter.onShutdown`)
   - Remove all event listeners
   - Clean up DOM references
   - Release memory

---

## Filter Application

### Quick Filter API Usage

**Function**: `browser.mailTabs.setQuickFilter(params)`

**Parameters**:

```javascript
{
  text: {
    text: string,        // Filter text
    author: boolean,     // Filter by sender
    recipients: boolean, // Filter by recipients
    subject: boolean     // Filter by subject
  }
}
```

**Examples**:

Filter by sender:
```javascript
await browser.mailTabs.setQuickFilter({
  text: {
    text: "sender@example.com",
    author: true,
  },
});
```

Filter by subject:
```javascript
await browser.mailTabs.setQuickFilter({
  text: {
    text: "Meeting tomorrow",
    subject: true,
  },
});
```

Filter by recipient:
```javascript
await browser.mailTabs.setQuickFilter({
  text: {
    text: "recipient@example.com",
    recipients: true,
  },
});
```

### Filter Combination

Currently, filters replace each other. Future versions will support filter combination (AND/OR logic).

---

## Performance Considerations

### DOM Access

- Event listeners are attached only once per tab during initialization
- Listeners are properly cleaned up on extension shutdown to prevent memory leaks
- DOM queries are minimized - only necessary elements are accessed

### API Calls

- Quick filter calls are made asynchronously
- No polling or periodic checks - everything is event-driven
- Minimal use of browser.storage (not used in current version)

### Memory Management

- Event references are stored for cleanup
- All event listeners are removed on shutdown
- DOM element references are released when no longer needed

---

## Security Considerations

### Content Security

- No inline scripts or styles
- All user input is validated before use
- No eval() or similar dangerous functions

### Permissions

Extension requires minimal permissions:
- `menus`: Required for context menu creation
- `messagesRead`: Required for accessing message data

### Experimental API Safety

- Experimental API runs in a sandboxed environment
- DOM access is limited to Thunderbird's internal mail window
- No access to arbitrary web content

---

## Future Architecture Changes

### Planned Enhancements

1. **Modularization**:
   - Separate concerns into distinct modules
   - Implement dependency injection
   - Improve testability

2. **TypeScript Migration**:
   - Add type annotations
   - Create type definitions for experimental APIs
   - Improve code reliability

3. **Manifest V3 Migration**:
   - Migrate to service workers
   - Update permission system
   - Maintain compatibility

4. **Enhanced Error Handling**:
   - Centralized error handling
   - Graceful degradation
   - User-friendly error messages

---

## References

- [Thunderbird WebExtension API Documentation](https://webextension-api.thunderbird.net/)
- [Thunderbird Experimental API Guide](https://developer.thunderbird.net/add-ons/experiments)
- [MDN WebExtensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
