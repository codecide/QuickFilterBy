# QuickFilterBy - API Changes and Compatibility

This document tracks all API changes, Thunderbird version compatibility, and internal dependencies used by QuickFilterBy.

---

## Table of Contents

1. [Compatibility Matrix](#compatibility-matrix)
2. [WebExtension APIs Used](#webextension-apis-used)
3. [Experimental APIs Used](#experimental-apis-used)
4. [Internal DOM Dependencies](#internal-dom-dependencies)
5. [Version-Specific Changes](#version-specific-changes)
6. [Migration Guide](#migration-guide)
7. [Future API Plans](#future-api-plans)

---

## Compatibility Matrix

| Feature | TB 115 | TB 120-128 | TB 129+ | Notes |
|---------|--------|------------|---------|-------|
| Context Menus | ✅ | ✅ | ✅ | Standard WebExtension API |
| Alt-Click Filtering | ✅ | ✅ | ✅ | Requires experimental API |
| browser.menus | ✅ | ✅ | ✅ | Available in all supported versions |
| browser.mailTabs | ✅ | ✅ | ✅ | Available in all supported versions |
| MessagesListAdapter API | ✅ | ✅ | ✅ | Experimental API, stable across versions |
| threadPane DOM access | ✅ | ✅ | ⚠️ | May change in future TB versions |

**Supported Thunderbird Versions**: 115.0 - 140.x (inclusive)

**Minimum Version**: 115.0 (Supernova)

**Maximum Version**: 140.x (allows room for future releases)

---

## WebExtension APIs Used

### browser.menus

**Purpose**: Create and manage context menu items

**API Stability**: Stable

**Availability**: All Thunderbird versions (60+)

**Documentation**: [MDN browser.menus](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/menus)

**Methods Used**:

| Method | Usage | Stability |
|--------|-------|-----------|
| `create()` | Create context menu items | Stable |
| `update()` | Update menu properties | Stable |
| `refresh()` | Refresh menu display | Stable |

**Events Used**:

| Event | Usage | Stability |
|-------|-------|-----------|
| `onShown` | Update menu visibility based on selection | Stable |
| `onclick` | Handle menu item clicks | Stable |

**Version Notes**:
- No changes planned
- Fully compatible across all supported TB versions

---

### browser.mailTabs

**Purpose**: Access and manipulate mail tabs

**API Stability**: Stable

**Availability**: Thunderbird 78+ (improved in 115+)

**Documentation**: [Thunderbird browser.mailTabs](https://webextension-api.thunderbird.net/en/latest/mailTabs.html)

**Methods Used**:

| Method | Usage | Stability |
|--------|-------|-----------|
| `setQuickFilter()` | Apply quick filter to message list | Stable |

**Parameters**:

```javascript
setQuickFilter({
  text: {
    text: string,        // Filter text
    author: boolean,     // Filter by sender
    recipients: boolean, // Filter by recipients
    subject: boolean     // Filter by subject
  }
})
```

**Version Notes**:
- Introduced in Thunderbird 78
- Enhanced in Thunderbird 115 with additional filter options
- No breaking changes expected

---

### browser.tabs

**Purpose**: Access and manage browser tabs

**API Stability**: Stable

**Availability**: All Thunderbird versions (60+)

**Documentation**: [MDN browser.tabs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs)

**Methods Used**:

| Method | Usage | Stability |
|--------|-------|-----------|
| `query()` | Get all tabs for initialization | Stable |

**Events Used**:

| Event | Usage | Stability |
|-------|-------|-----------|
| `onCreated` | Initialize new tabs with event listeners | Stable |

**Version Notes**:
- No changes planned
- Fully compatible across all supported TB versions

---

### browser.i18n

**Purpose**: Internationalization (i18n) support

**API Stability**: Stable

**Availability**: All Thunderbird versions (60+)

**Documentation**: [MDN browser.i18n](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/i18n)

**Methods Used**:

| Method | Usage | Stability |
|--------|-------|-----------|
| `getMessage()` | Get localized strings for UI | Stable |

**Version Notes**:
- No changes planned
- Fully compatible across all supported TB versions

---

## Experimental APIs Used

### MessagesListAdapter

**Purpose**: Access message list DOM events (not available via standard WebExtensions)

**API Stability**: Experimental

**Availability**: Thunderbird 115+ (Supernova and later)

**Rationale for Experimental API**:
- Standard WebExtensions do not provide access to message list DOM events
- Alt-click functionality requires listening to column click events
- Column name detection requires DOM introspection
- This API provides safe, sandboxed access to required events

**Schema File**: `api/MessagesListAdapter/schema.json`

**Implementation File**: `api/MessagesListAdapter/implementation.js`

**Methods**:

| Method | Parameters | Returns | Stability |
|--------|-----------|---------|-----------|
| `initTab(tabId)` | tabId (number) | void | Experimental |
| `onShutdown()` | none | void | Experimental |

**Events**:

| Event | Parameters | Description | Stability |
|-------|-----------|-------------|-----------|
| `onMessageListClick` | columnName (string), columnText (string) | Fired when user alt-clicks on column | Experimental |

**API Definition**:

```javascript
{
  "namespace": "MessagesListAdapter",
  "types": [],
  "functions": [
    {
      "name": "initTab",
      "type": "function",
      "async": false,
      "parameters": [
        {
          "name": "tabId",
          "type": "integer"
        }
      ]
    }
  ],
  "events": [
    {
      "name": "onMessageListClick",
      "type": "function",
      "extraParameters": [
        {
          "name": "columnName",
          "type": "string"
        },
        {
          "name": "columnText",
          "type": "string"
        }
      ]
    }
  ]
}
```

**Version Notes**:
- Introduced in Thunderbird 115 (Supernova)
- Relies on ExtensionCommon internal API
- Requires access to about:3pane window internals
- May need updates if Thunderbird's DOM structure changes
- Considered stable within Thunderbird 115-140 range

**Deprecation Risk**: Low, but requires monitoring for TB DOM changes

---

## Internal DOM Dependencies

### about:3pane Window

**Purpose**: Thunderbird's main mail window (three-pane layout)

**Access Method**:
```javascript
const about3Pane = getAbout3PaneWindow(nativeTab);
```

**Properties Accessed**:

| Property | Type | Usage | Stability |
|----------|------|-------|-----------|
| `threadPane` | Object | Access message list container | Medium |
| `threadPane.treeTable` | HTMLTableElement | Message list table DOM element | Medium |
| `document` | Document | DOM document for event access | High |

**Stability Considerations**:
- `about:3pane` is Thunderbird's standard mail view (introduced in TB 115)
- `threadPane` is a stable API for accessing the message list
- `treeTable` may change if Thunderbird's UI is redesigned
- Need to monitor TB release notes for UI changes

---

### Column Class Names

**Purpose**: Identify columns in the message list

**Class Names Used**:

| Class Name | Column Type | Stability |
|------------|-------------|-----------|
| `subjectcol-column` | Subject | High |
| `recipientcol-column` | Recipient | High |
| `sendercol-column` | Sender | High |
| `correspondentcol-column` | Correspondent (combined) | High |

**Detection Logic**:
```javascript
const columnCell = row.querySelector("td.headerCell");
const columnName = columnCell.className;
```

**Stability Considerations**:
- Column class names have been stable across multiple TB versions
- Naming convention (col-name + "-column") is consistent
- Future TB versions may rename columns, requiring updates
- Plan to implement dynamic column discovery (Phase 2)

---

### Event Listeners

**DOM Events Used**:

| Event | Target Element | Usage | Stability |
|-------|----------------|-------|-----------|
| `click` | threadPane.treeTable | Detect alt-click on columns | High |

**Listener Pattern**:
```javascript
treeTable.addEventListener("click", (event) => {
  // Handle click
});
```

**Stability Considerations**:
- Standard DOM event, no changes expected
- Event capture/propagation may change in future TB versions
- Current implementation works reliably in TB 115-140

---

### ExtensionCommon

**Purpose**: Thunderbird internal API for implementing experimental APIs

**Components Used**:

| Component | Usage | Stability |
|-----------|-------|-----------|
| `ExtensionCommon.ExtensionAPI` | Base class for experimental API | Medium |
| `ExtensionCommon.EventEmitter` | Event emission system | Medium |
| `ExtensionCommon.EventManager` | Event lifecycle management | Medium |

**Version Notes**:
- Internal Thunderbird API
- May change between major TB versions
- Requires updates when migrating to Manifest V3
- Currently stable in TB 115-140

---

## Version-Specific Changes

### Thunderbird 115 (Supernova) - Initial Version

**New Features**:
- Introduction of about:3pane window (modern mail UI)
- ExtensionCommon API for experimental extensions
- Enhanced quick filter API
- Improved WebExtension support

**Impact on QuickFilterBy**:
- Extension was designed for TB 115+
- Relies on about:3pane DOM structure
- Uses ExtensionCommon for experimental API

**Changes from TB 78-102**:
- about:message replaced by about:3pane
- Significant DOM changes in message list
- Experimental API system introduced
- All extensions required migration to TB 115 APIs

---

### Thunderbird 120-128

**Minor Updates**:
- Bug fixes to ExtensionCommon
- Performance improvements in mailTabs API
- No breaking changes affecting QuickFilterBy

**Compatibility**:
- Full backward compatibility maintained
- No changes required to extension code
- All features work as expected

---

### Thunderbird 129+ (Future)

**Potential Changes**:
- May introduce Manifest V3 support
- Possible UI refinements to about:3pane
- Potential changes to ExtensionCommon API
- Improved WebExtension capabilities

**Impact on QuickFilterBy**:
- May require migration to Manifest V3
- May need updates to experimental API
- Planned in Phase 5 of upgrade plan

---

## Migration Guide

### Migrating from Thunderbird < 115

QuickFilterBy is not compatible with Thunderbird versions prior to 115. Users must upgrade to Thunderbird 115 or later.

**Migration Steps**:
1. Update Thunderbird to latest version (115+)
2. Install latest version of QuickFilterBy
3. No migration of settings required (extension has no persistent state in v14)

---

### Future Migration to Manifest V3 (Planned)

Planned for Phase 5 of upgrade plan.

**Breaking Changes**:
- `background.scripts` → `background.service_worker`
- Event listener lifecycle changes
- CSP restrictions
- Permission system changes

**Migration Steps** (planned):
1. Update manifest.json to version 3
2. Convert background.js to service worker
3. Remove setTimeout/setInterval (use alarms API)
4. Update experimental API for service worker compatibility
5. Test all features in TB 128+

---

## Future API Plans

### Phase 1 (Current)
- Stabilize current APIs
- Monitor TB releases for changes
- Document all API usage

### Phase 2 (Robustness)
- Implement dynamic column discovery
- Add API availability detection
- Implement graceful degradation
- Add error handling for API failures

### Phase 3 (Testing)
- Create API mocks for testing
- Test against multiple TB versions
- Document version-specific differences
- Create compatibility tests

### Phase 5 (Modernization)
- Migrate to Manifest V3
- Update experimental API for V3
- Remove deprecated API usage
- Update documentation

### Phase 6 (Internationalization)
- Add browser.i18n for all UI strings
- Support multiple languages
- Document i18n requirements

---

## API Deprecation and Replacement

### Currently Deprecated

None

### At Risk of Deprecation

1. **ExtensionCommon API**
   - **Risk**: Medium
   - **Reason**: Internal Thunderbird API, may change
   - **Timeline**: TB 140+ may introduce replacement
   - **Mitigation**: Monitor TB release notes, prepare migration

2. **about:3pane threadPane.treeTable**
   - **Risk**: Low
   - **Reason**: DOM structure may change with UI redesigns
   - **Timeline**: No specific timeline
   - **Mitigation**: Implement dynamic column discovery (Phase 2)

---

## API Security Considerations

### WebExtension API Security

- All API calls are made within extension's security context
- No cross-origin requests
- No access to arbitrary web content
- Content Security Policy (CSP) enforced

### Experimental API Security

- Runs in sandboxed environment
- Limited DOM access (only about:3pane)
- No access to user data outside extension scope
- Subject to Thunderbird security policies

### Internal DOM Access

- Access is limited to Thunderbird's internal mail window
- No access to web content or user data
- Event listeners are properly scoped
- Cleanup on shutdown prevents memory leaks

---

## API Performance

### browser.menus

- **Performance**: Excellent
- **Overhead**: Minimal (event-driven)
- **Caching**: None needed
- **Optimization**: Not required

### browser.mailTabs

- **Performance**: Excellent
- **Overhead**: Minimal (async API)
- **Caching**: Not applicable
- **Optimization**: Not required

### MessagesListAdapter (Experimental)

- **Performance**: Good
- **Overhead**: Low (single event listener per tab)
- **Caching**: None needed
- **Optimization**: Planned in Phase 4 (performance optimization)

---

## API Monitoring and Maintenance

### What to Monitor

1. **Thunderbird Release Notes**
   - Monitor for API changes
   - Track deprecated features
   - Note breaking changes

2. **WebExtension API Updates**
   - MDN documentation updates
   - Thunderbird WebExtension API changes
   - Standards updates

3. **Experimental API Stability**
   - ExtensionCommon changes
   - about:3pane DOM changes
   - Threadpane API changes

### Maintenance Schedule

- **Weekly**: Monitor TB release notes
- **Monthly**: Test on latest TB stable
- **Quarterly**: Review API documentation
- **Per Release**: Test compatibility with new TB version

---

## References

- [Thunderbird WebExtension API Documentation](https://webextension-api.thunderbird.net/)
- [Thunderbird Experimental API Guide](https://developer.thunderbird.net/add-ons/experiments)
- [MDN WebExtensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Thunderbird Release Notes](https://www.thunderbird.net/en-US/thunderbird/releases/)
- [Thunderbird Developer Documentation](https://developer.thunderbird.net/)

---

## Changelog

### Version 14
- Initial API documentation
- Compatible with Thunderbird 115-140
- Uses MessagesListAdapter experimental API
- Documented all WebExtension API usage
