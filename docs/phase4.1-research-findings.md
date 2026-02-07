# Phase 4.1 Research Findings - Date Filtering

## Quick Filter API Analysis

### Current `setQuickFilter()` API

The `browser.mailTabs.setQuickFilter()` API is documented at:
https://thunderbird-webextensions.readthedocs.io/en/latest/mailTabs.html#method-setQuickFilter

**Parameters Supported:**
```javascript
await browser.mailTabs.setQuickFilter({
  text: {
    text: string,      // Text to search for
    subject: boolean,   // Search in subject
    author: boolean,   // Search in sender
    recipients: boolean,  // Search in recipients
    body: boolean,      // Search in body
    everyWhere: boolean, // All terms must match (AND)
  },
  tags: [tagId1, tagId2, ...],  // Filter by tags
  flagged: boolean,  // Filter by flagged status
  read: boolean,    // Filter by read status
  unread: boolean,  // Filter by unread status
});
```

**Finding:** `setQuickFilter()` does **NOT** have native date range parameters.

## Implementation Strategy

### Recommended Approach: Two-Step Filtering

Since `setQuickFilter()` doesn't support dates directly, we'll use:

1. **Query messages by date range** → Get message IDs
2. **Filter by message IDs** → Use text filter with specific IDs

#### Step 1: Query Messages by Date

Use `browser.messages.query()` with date parameters:

```javascript
// Get messages from today
const today = new Date();
const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

const messages = await browser.messages.query({
  dateRange: {
    start: startOfDay,
    end: endOfDay,
  },
});

// Extract message IDs
const messageIds = messages.messages.map(m => m.id);
```

#### Step 2: Filter by Message IDs

Thunderbird 115+ supports filtering by specific message IDs:

```javascript
// Filter to show only those messages
await browser.mailTabs.setQuickFilter({
  text: {
    text: messageIds.join(','),  // List of message IDs
  },
});
```

**Note:** This approach relies on Thunderbird's internal message ID filtering capability.

## Alternative: Text-Based Date Search (Fallback)

If message ID filtering doesn't work, we can search for date strings:

```javascript
const datePattern = '2024-01-15';  // Format: YYYY-MM-DD

await browser.mailTabs.setQuickFilter({
  text: {
    text: datePattern,
  },
});
```

**Limitations:**
- Less precise (may match unrelated messages)
- Depends on date string format in headers
- Not recommended for production use

## Preset Date Filter Implementations

### Today Filter

```javascript
async function filterByToday() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const messages = await browser.messages.query({
    dateRange: { start, end },
  });

  const messageIds = messages.messages.map(m => m.id);

  await browser.mailTabs.setQuickFilter({
    text: { text: messageIds.join(',') },
  });
}
```

### This Week Filter

```javascript
async function filterByThisWeek() {
  const now = new Date();
  const dayOfWeek = now.getDay();  // 0 = Sunday, 1 = Monday, etc.

  const start = new Date(now);
  start.setDate(now.getDate() - dayOfWeek);  // Go to Sunday/Monday
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);  // End of week
  end.setHours(23, 59, 59, 999);

  const messages = await browser.messages.query({
    dateRange: { start, end },
  });

  const messageIds = messages.messages.map(m => m.id);

  await browser.mailTabs.setQuickFilter({
    text: { text: messageIds.join(',') },
  });
}
```

### This Month Filter

```javascript
async function filterByThisMonth() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 0, 0);
  end.setMilliseconds(-1);  // Last millisecond of last day

  const messages = await browser.messages.query({
    dateRange: { start, end },
  });

  const messageIds = messages.messages.map(m => m.id);

  await browser.mailTabs.setQuickFilter({
    text: { text: messageIds.join(',') },
  });
}
```

### Last N Days Filter

```javascript
async function filterByLastDays(days) {
  const now = new Date();
  const start = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));

  const messages = await browser.messages.query({
    dateRange: {
      start: start,
      end: now,
    },
  });

  const messageIds = messages.messages.map(m => m.id);

  await browser.mailTabs.setQuickFilter({
    text: { text: messageIds.join(',') },
  });
}
```

## Implementation Priority

### High Priority (Core Functionality)
1. ✅ Add i18n messages for date filters
2. ✅ Implement preset date filters (today, week, month)
3. ✅ Add context menu items for presets
4. ✅ Test preset filters

### Medium Priority (Custom Range)
1. ⚠️ Implement custom date range picker
2. ⚠️ Add preset buttons to picker
3. ⚠️ Implement date validation
4. ⚠️ Test custom ranges

### Low Priority (Advanced)
1. ⚠️ Alt-click on date column
2. ⚠️ Drag-select date range
3. ⚠️ Date filter in settings

## Technical Considerations

### Performance
- Querying messages by date is efficient (indexed)
- Joining message IDs into string may hit length limits
- Consider pagination for very large date ranges

### Error Handling
```javascript
try {
  const messages = await browser.messages.query({ dateRange });
  if (messages.messages.length === 0) {
    // No messages in range - show user notification
    await browser.notifications.create({
      type: 'basic',
      title: 'No Messages',
      message: 'No messages found in selected date range.',
    });
    return;
  }
} catch (error) {
  ErrorUtils.logError(error, { context: 'date filter' });
  await ErrorUtils.showErrorNotification(
    'Filter Failed',
    'Could not filter by date. Please try again.',
  );
}
```

### User Experience
- Show loading indicator when querying
- Show "No messages found" if results are empty
- Allow canceling of long-running queries
- Cache date ranges for quick re-filtering

## Updated Implementation Plan

Given the two-step filtering requirement:

### Phase 4.1 Revised Tasks

- [ ] 4.1.1 Research date filtering ✅ COMPLETE (documented)
- [ ] 4.1.2 Add i18n messages for date filters
- [ ] 4.1.3 Implement helper functions for date calculations
- [ ] 4.1.4 Implement message ID filtering logic
- [ ] 4.1.5 Add preset context menu items (today, week, month)
- [ ] 4.1.6 Test preset filters
- [ ] 4.1.7 Implement custom date range picker (optional, lower priority)
- [ ] 4.1.8 Document date filtering

## Conclusion

**Key Finding:** `setQuickFilter()` does not support date parameters directly.

**Solution:** Two-step filtering using `messages.query()` for dates + `setQuickFilter()` with message IDs.

**Feasibility:** HIGH - All required APIs are available in Thunderbird 115+.

**Estimated Time:** 12 hours for full implementation with presets and custom range picker.
