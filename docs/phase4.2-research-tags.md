# Phase 4.2: Filter by Tag - Research & Implementation Plan

## Research Findings

### Thunderbird Tags API

Thunderbird WebExtensions provide a `browser.messages.tags` API for managing message tags:

```javascript
// List all tags
browser.messages.tags.list()
// Returns: Array<MessageTag>

// MessageTag structure:
{
  key: string,      // Unique identifier (e.g., "$label1")
  tag: string,      // Display name (e.g., "Important")
  color: string,    // Hex color code (e.g., "#FF0000")
  ordinal: number   // Sort order
}
```

### setQuickFilter API for Tags

The `browser.mailTabs.setQuickFilter()` function supports tag filtering:

```javascript
browser.mailTabs.setQuickFilter({
  tags: {
    mode: "or" | "and",
    tags: ["$label1", "$label2", ...]
  }
})
```

**Important Notes:**
- Tags parameter uses tag **keys** (not display names)
- Mode can be "or" (any selected tag) or "and" (all selected tags)
- Empty tags array clears tag filter
- Tags are user-defined (default 5 tags + custom tags)

### Messages Query by Tags

Messages can be queried by tags using `browser.messages.query()`:

```javascript
browser.messages.query({
  tags: ["$label1", "$label2"]
})
```

## Implementation Strategy

### Phase 4.2 Implementation Plan

**Core Implementation (High Priority):**

1. **Get All User-Defined Tags** (4.2.3)
   - Use `browser.messages.tags.list()` on startup
   - Cache tags in background script
   - Listen for tag changes via `browser.messages.tags.onCreated/Deleted/Updated`

2. **Add Context Menu Items** (4.2.2)
   - "Filter by This Message's Tags" - filters by tags on clicked message
   - "Filter by Tag..." submenu - shows all available tags
   - Tag colors displayed in menu items

3. **Implement Tag Filtering** (4.2.6)
   - Support single tag filtering
   - Support multi-tag filtering with OR logic
   - Use `setQuickFilter({ tags: { mode: "or", tags: [...] } })`

**Enhanced Features (Medium Priority):**

4. **Tag Selector UI** (4.2.4)
   - Create popup with checkboxes for all tags
   - Show tag colors as background/indicator
   - Select all/deselect all buttons
   - Apply/Cancel buttons

5. **Tag Color Indicators** (4.2.7)
   - Use Thunderbird tag colors in UI
   - Color swatches in menu items
   - High contrast mode support

6. **Alt-Click on Tag Column** (4.2.8)
   - Detect tag column click via DOM
   - Get tags from clicked message
   - Filter by clicked tag(s)
   - Handle multiple tags on single message

7. **Filter Combinations** (4.2.9, 4.2.12)
   - Tags + sender filters
   - Tags + subject filters
   - Tags + date filters (from 4.1)
   - Tags + other filters

## Technical Challenges & Solutions

### Challenge 1: Getting Tags from Context

**Problem:** When user right-clicks on a message, we need to get its tags.

**Solution:**
- Use `info.selectionMessages` from menu click event
- Access `message.tags` property
- Extract tag keys

```javascript
browser.menus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'tags-this-message') {
    const messages = info.selectionMessages;
    if (messages && messages.length > 0) {
      const messageTags = messages[0].tags;
      // Filter by messageTags
    }
  }
});
```

### Challenge 2: Dynamic Tag Menu

**Problem:** Tags are user-defined and can change.

**Solution:**
- Cache tags on startup
- Listen for `browser.messages.tags.onCreated`, `onDeleted`, `onUpdated`
- Rebuild tag menu when tags change
- Show error if no tags available

### Challenge 3: Tag Colors in Menu

**Problem:** Context menus have limited styling support.

**Solution:**
- Use Unicode emojis as color indicators (🔴 🟢 🔵 🟡 🟣)
- Fallback to text labels like "[Red] Important"
- Create custom popup UI for better color display (4.2.4)

### Challenge 4: Multi-Tag Logic

**Problem:** How to handle multiple selected tags?

**Solution:**
- Default to OR logic (show messages with ANY selected tag)
- Consider AND logic option (show messages with ALL selected tags)
- Allow user to select multiple tags in UI

## API Requirements

### Required Permissions

```json
{
  "permissions": [
    "messagesRead",
    "messagesTags",
    "menus"
  ]
}
```

### Required Experiments

```json
{
  "experiment_apis": {
    "MessagesListAdapter": {
      "schema": "...",
      "parent": {
        "scopes": ["addon_parent"],
        "paths": [["MessagesListAdapter"]]
      }
    }
  }
}
```

## Testing Strategy

### Unit Tests
- Test tag caching
- Test menu creation
- Test tag filtering logic
- Test tag change event handling

### Manual Tests (Required)
- Test with no tags
- Test with 1 tag
- Test with multiple tags
- Test tag combinations
- Test alt-click on tag column
- Test with custom tags
- Test tag color display
- Test tag filter persistence

## Performance Considerations

- Tag list is typically small (< 20 tags)
- No performance impact expected
- Cache tags to avoid repeated API calls
- Debounce tag change events if needed

## User Experience

### Workflow 1: Filter by Message's Tags
1. User right-clicks on a message
2. Selects "Filter by This Message's Tags"
3. Extension filters to show all messages with the same tag(s)

### Workflow 2: Filter by Specific Tag
1. User right-clicks in message list
2. Hover over "Filter by Tag..."
3. Selects specific tag from submenu
4. Extension filters to show all messages with that tag

### Workflow 3: Multi-Tag Filter
1. User right-clicks
2. Selects "Filter by Tag..." → "Choose Tags..."
3. Popup opens with all tags
4. User selects multiple tags
5. Extension filters to show messages with any of the selected tags

## Success Criteria

- [ ] Users can filter by single tag
- [ ] Users can filter by multiple tags
- [ ] Tag colors are displayed in UI
- [ ] Alt-click on tag column works
- [ ] Tag filters combine with other filters
- [ ] Tags menu updates when tags change
- [ ] No errors when no tags exist
- [ ] Custom tags work correctly

## References

- Thunderbird Tags API: https://webextension-api.thunderbird.net/en/latest/messages.tags.html
- Thunderbird setQuickFilter: https://webextension-api.thunderbird.net/en/latest/mailTabs.html#setquickfilter
- Tag Documentation: https://support.mozilla.org/kb/organize-your-messages-using-tags
