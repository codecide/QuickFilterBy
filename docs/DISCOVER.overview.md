# QuickFilterBy - Project Discovery Report

## Overview

QuickFilterBy is a Mozilla Thunderbird extension that adds a "Quick Filter By" context menu and alt-click functionality to the messages list, enabling rapid filtering by sender, recipient, or subject text. The functionality mimics the "quick filtering" feature from TheBat! email client.

**Repository**: git@github.com:codecide/QuickFilterBy.git
**Latest Commit**: b8b9f08cebf654d150b59a7864ec14a0e4cf5b0d (2025-07-13)
**Version**: 14
**Files**: 294 lines across 5 core files

---

## Critical Issues

### ❌ No Releases
- **Status**: No git tags or GitHub releases exist
- **Impact**: No versioned releases for users to download
- **Latest Commit Message**: "release: v14" (July 13, 2025) but no actual release created

### ❌ No Prebuilt .xpi
- **Status**: No prebuilt extension package available
- **Impact**: Users must build the extension manually
- **Build System**: Gradle-based (build.gradle)
- **Output**: Creates `QuickFilterBy.xpi` in `/dist/` directory
- **Issue**: `/dist/` is in `.gitignore` and doesn't exist in repository

### ⚠️ Experimental API Usage
The extension relies on **experimental APIs** that access internal Thunderbird structures:

#### MessagesListAdapter (Custom Experiment)
**File**: `api/MessagesListAdapter/implementation.js`

**Internal APIs Used**:
1. **ExtensionCommon.ExtensionAPI** - Thunderbird internal extension framework
2. **ExtensionCommon.EventEmitter** - Internal event system
3. **Services.obs** - Internal Thunderbird observer service
4. **nativeTab.chromeBrowser.contentWindow** - Direct DOM access
5. **threadPane.treeTable** - Internal Thunderbird DOM element
6. **getAbout3PaneWindow()** - Accesses internal tab mode system

**Risks**:
- These internal APIs may change or be removed in future Thunderbird versions
- Direct DOM access (`treeTable.addEventListener`) is fragile
- Column name parsing (`"subjectcol-column"`, `"recipientcol-column"`) depends on internal naming
- The extension may break with Thunderbird UI updates

#### Schema Definition
**File**: `api/MessagesListAdapter/schema.json`
- Defines custom namespace `MessagesListAdapter`
- Exposes `onMessageListClick` event
- Exposes `initTab()` function

---

## Manifest Analysis

### manifest.json
```json
{
  "manifest_version": 2,
  "applications": {
    "gecko": {
      "strict_min_version": "115.0",
      "strict_max_version": "140.*"
    }
  },
  "permissions": ["menus", "messagesRead"],
  "experiment_apis": {
    "MessagesListAdapter": { ... }
  }
}
```

### Compatibility
- **Min Version**: Thunderbird 115.0 (released July 2023)
- **Max Version**: 140.* (future version)
- **Manifest Version**: 2 (still supported but could migrate to v3)

**Status**: ✅ Declared compatibility range is appropriate for current TB versions

### Standard MailExtension APIs Used
The extension correctly uses standard WebExtension APIs:
- `browser.menus.create()` - Context menu creation
- `browser.mailTabs.setQuickFilter()` - Quick filter API
- `browser.tabs.query()` - Tab enumeration
- `browser.menus.onShown` - Menu visibility control
- `browser.menus.update()` - Menu item updates

---

## Code Structure

### Background Script (background.js)
**Lines**: 112
**Purpose**: Handles context menu interactions and quick filter setting

**Features**:
1. 5 context menu items:
   - Sender (full name + email)
   - Sender (email only)
   - First Recipient
   - All Recipients
   - Subject

2. Alt-click handler for message list columns:
   - Detects alt-click on columns
   - Triggers quick filter based on column type

3. Dynamic menu visibility:
   - Shows menu items only when exactly 1 message is selected

### Experiment Implementation (api/MessagesListAdapter/implementation.js)
**Lines**: 98
**Purpose**: Listens for alt-click events on message list

**Functionality**:
1. Attaches click listener to `threadPane.treeTable` DOM element
2. Detects alt-left-click events
3. Identifies column by CSS class name (e.g., `"subjectcol-column"`)
4. Emits event to background script
5. Cleanup on shutdown (removes listeners, invalidates cache)

---

## Build System

### build.gradle
```gradle
task build(type: Zip) {
  from '/'
  include '*.js'
  include '*.json'
  include '_locales/**'
  include 'api/**'
  archiveName 'QuickFilterBy.xpi'
  destinationDir(file('/dist/'))
}
```

**Issue**: No build instructions in README

**Usage** (assumed):
```bash
gradle build
```

**Output**: `dist/QuickFilterBy.xpi`

---

## Potential Issues & Risks

### 1. **Internal API Dependencies**
   - `threadPane.treeTable` - DOM structure may change
   - Column class names (`"-column"` suffix) - may be renamed
   - `nativeTab.mode.name == "mail3PaneTab"` - tab mode may change
   - `Services.obs.notifyObservers` - Observer service API may change

### 2. **No Error Handling**
   - No try-catch blocks in event handlers
   - No validation of DOM elements before access
   - Example: `threadPane.treeTable.addEventListener` could fail if threadPane doesn't exist

### 3. **Hardcoded Column Names**
   - `"subjectcol-column"`, `"recipientcol-column"`, `"sendercol-column"`, `"correspondentcol-column"`
   - These names are not verified against actual DOM
   - Could break if Thunderbird renames these classes

### 4. **No Migration Path to Manifest V3**
   - Still using manifest_version 2
   - V3 is the future and may be required eventually
   - No deprecation warnings in code

### 5. **No Testing**
   - No test files present
   - No CI/CD configuration
   - No automated validation

### 6. **Incomplete Localization**
   - Only `_locales/en/messages.json` exists
   - No translations for other languages

---

## Recommendations

### Immediate Actions
1. **Create GitHub Release v14** with prebuilt .xpi
2. **Add Build Instructions** to README
3. **Add Error Handling** to experiment implementation
4. **Document Internal API Dependencies** in code comments

### Medium-Term
1. **Add Automated Tests** for critical functionality
2. **Implement Version Check** for internal API compatibility
3. **Add Graceful Degradation** if internal APIs fail
4. **Create Migration Plan** to manifest v3

### Long-Term
1. **Evaluate Alternative Approaches** to avoid internal APIs
2. **Monitor Thunderbird Releases** for API changes
3. **Establish CI/CD Pipeline** for automated builds and tests
4. **Add More Translations** for broader accessibility

---

## Feature Analysis

### Functionality Summary
✅ Context menu filtering by sender (name+email)
✅ Context menu filtering by sender (email only)
✅ Context menu filtering by first recipient
✅ Context menu filtering by all recipients
✅ Context menu filtering by subject
✅ Alt-click on sender column → filter by author
✅ Alt-click on recipient column → filter by recipients
✅ Alt-click on subject column → filter by subject
✅ Alt-click on correspondent column → filter by author
✅ Dynamic menu visibility (only shown for single message selection)

### Missing Features
❌ Filter by date
❌ Filter by tag
❌ Filter by attachment status
❌ Filter by read/unread status
❌ Filter by folder/account
❌ Custom filter combinations

---

## Technical Debt

1. **Code Comments**: Minimal documentation
2. **Error Handling**: Virtually non-existent
3. **Logging**: Commented out debug statements (line 13)
4. **Type Safety**: No TypeScript or JSDoc annotations
5. **Code Organization**: Single-file implementations (could benefit from modularization)

---

## Compatibility Assessment

| Aspect | Status | Notes |
|--------|--------|-------|
| Manifest Version 2 | ✅ Supported | Consider v3 migration |
| MailExtension APIs | ✅ Used Correctly | All APIs are standard |
| Experiment APIs | ⚠️ High Risk | Uses internal structures |
| Thunderbird 115+ | ✅ Compatible | Minimum version met |
| Thunderbird 128+ | ✅ Compatible | Updated in commit aee7c81 |
| Thunderbird 140 | ❓ Unknown | Future version |

---

## Conclusion

QuickFilterBy is a **functional but fragile** extension that provides useful quick filtering capabilities. The extension correctly uses standard MailExtension APIs but relies heavily on **experimental/internal APIs** that are subject to change.

**Primary Obstacles for Users**:
1. No prebuilt .xpi available
2. No documented build process
3. No releases on GitHub

**Primary Technical Risks**:
1. Internal API dependencies may break with Thunderbird updates
2. No error handling or graceful degradation
3. Hardcoded column names and DOM assumptions

**Overall Assessment**: The extension works but requires manual building and may break in future Thunderbird versions due to internal API usage. Recommended for advanced users comfortable with potential issues.
