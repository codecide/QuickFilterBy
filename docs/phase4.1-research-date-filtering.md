# Phase 4.1: Filter by Date Research

## Objective

Research Thunderbird's quick filter API to understand how to implement date-based filtering for QuickFilterBy extension.

## Current Implementation Analysis

### Existing Pattern

Current filtering implementation uses `browser.mailTabs.setQuickFilter()`:

```javascript
await browser.mailTabs.setQuickFilter({
  text: {
    text: message.author,  // or message.subject, etc.
    author: true,          // filter by sender
    recipients: true,      // filter by recipients
    subject: true,          // filter by subject
  },
});
```

### Current Filters
1. **Filter by Sender**: Sets `text` + `author: true`
2. **Filter by Sender Email**: Sets `text` + `author: true`
3. **Filter by Recipient**: Sets `text` + `recipients: true`
4. **Filter by Subject**: Sets `text` + `subject: true`

## Thunderbird Quick Filter API Research

### Required Research Tasks

- [ ] **4.1.1.1 Read MDN Documentation**
  - URL: https://thunderbird-webextensions.readthedocs.io/en/latest/
  - API: `browser.mailTabs.setQuickFilter()`
  - Look for date/time filter parameters
  - Document all available filter options

- [ ] **4.1.1.2 Check Thunderbird Source Code**
  - Thunderbird GitHub: https://github.com/thunderbird/thunderbird
  - Look for setQuickFilter implementation
  - Identify date filter support
  - Check for date range options

- [ ] **4.1.1.3 Review Extensions Using Date Filters**
  - Search for Thunderbird extensions with date filtering
  - Analyze their implementation patterns
  - Learn from existing solutions

- [ ] **4.1.1.4 Test in Development Environment**
  - Check if date filtering works natively
  - Test with JavaScript console in TB
  - Document actual API behavior

## Date Filter Implementation Options

### Option A: Date Range Parameters (If Supported)

If `setQuickFilter()` supports date parameters:

```javascript
await browser.mailTabs.setQuickFilter({
  date: {
    start: new Date('2024-01-01'),
    end: new Date('2024-01-31'),
  },
});
```

### Option B: Filter by Text with Date Format

If date must be converted to text search:

```javascript
await browser.mailTabs.setQuickFilter({
  text: {
    text: '2024-01',  // Search for date in headers
  },
});
```

### Option C: Use search.query() Instead

If `setQuickFilter()` doesn't support dates:

```javascript
// Alternative: Use search API
const messages = await browser.messages.query({
  dateRange: {
    start: startDate,
    end: endDate,
  },
});
```

## Preset Date Filter Scenarios

### Today Filter
- Calculate today's start: `new Date().setHours(0, 0, 0, 0)`
- Calculate today's end: `new Date().setHours(23, 59, 59, 999)`
- Filter messages within this range

### This Week Filter
- Calculate week start (Sunday or Monday depending on locale)
- Calculate week end (Saturday or Sunday)
- Filter messages within this range

### This Month Filter
- Calculate month start: `new Date(year, month, 1)`
- Calculate month end: `new Date(year, month + 1, 0) - 1`
- Filter messages within this range

### Last 7 Days / Last 30 Days
- Calculate end date: `new Date()`
- Calculate start date: `end - (7 or 30) * 24 * 60 * 60 * 1000`
- Filter messages within this range

### This Year Filter
- Calculate year start: `new Date(year, 0, 1)`
- Calculate year end: `new Date(year, 11, 31, 23, 59, 59, 999)`
- Filter messages within this range

## Date Column Detection for Alt-Click

### Identify Date Columns

Potential column names (from Thunderbird):
- `datecol-column`
- `receivedcol-column`
- `dateCol` / `receivedCol`

Detection strategy:
```javascript
const isDateColumn = columnName.includes('date') ||
                     columnName.includes('Date') ||
                     columnName.includes('received') ||
                     columnName.includes('Received');
```

### Get Cell Date Content

```javascript
const dateCell = event.target;
const dateText = dateCell.textContent || dateCell.innerText;
const clickedDate = new Date(dateText);

// Validate date
if (isNaN(clickedDate.getTime())) {
  // Invalid date - show error or do nothing
  return;
}
```

## Technical Challenges & Solutions

### Challenge 1: Timezone Handling

**Problem**: Dates may be in different timezones
**Solutions**:
- Use UTC dates where possible
- Parse dates with timezone awareness
- Store dates in ISO 8601 format

```javascript
// ISO 8601 format example
const isoDate = '2024-01-15T14:30:00Z';
const dateObj = new Date(isoDate);
```

### Challenge 2: Date Format Variations

**Problem**: Date formats vary (MM/DD/YYYY, DD/MM/YYYY, etc.)
**Solutions**:
- Use `Date.parse()` for flexibility
- Try multiple format parsers
- Use Thunderbird's internal date format

```javascript
// Try parsing with common formats
function parseDate(text) {
  const date = new Date(text);
  if (!isNaN(date.getTime())) {
    return date;
  }
  // Try alternative formats...
  return null;
}
```

### Challenge 3: User Localization

**Problem**: Week starts on Sunday or Monday depending on locale
**Solutions**:
- Use `Intl.DateTimeFormat` for locale-aware dates
- Respect user's locale settings
- Document week start day for each locale

```javascript
const locale = navigator.language || 'en-US';
const options = { weekday: 'long' };
const formatter = new Intl.DateTimeFormat(locale, options);
```

## Context Menu Items Design

### Menu Structure

```
Filter by Date
  ├─ Today
  ├─ This Week
  ├─ This Month
  ├─ This Year
  ├─ Last 7 Days
  ├─ Last 30 Days
  └─ Date Range...
```

### Menu Item IDs

- `date-today`
- `date-this-week`
- `date-this-month`
- `date-this-year`
- `date-last-7days`
- `date-last-30days`
- `date-range`

### i18n Keys

Add to `_locales/en/messages.json`:
```json
{
  "date": "Filter by Date",
  "dateToday": "Filter by Date (Today)",
  "dateThisWeek": "Filter by Date (This Week)",
  "dateThisMonth": "Filter by Date (This Month)",
  "dateThisYear": "Filter by Date (This Year)",
  "dateLast7Days": "Filter by Date (Last 7 Days)",
  "dateLast30Days": "Filter by Date (Last 30 Days)",
  "dateRange": "Filter by Date Range...",
  "dateRangeTitle": "Select Date Range",
  "dateRangeStart": "Start Date",
  "dateRangeEnd": "End Date",
  "dateRangeApply": "Apply",
  "dateRangeCancel": "Cancel",
  "dateRangePresetLast7": "Last 7 Days",
  "dateRangePresetLast30": "Last 30 Days",
  "dateRangePresetThisYear": "This Year"
}
```

## Date Range Picker UI Design

### HTML Structure

```html
<div class="date-range-picker">
  <h2 class="picker-title">Select Date Range</h2>

  <div class="date-inputs">
    <div class="date-input-group">
      <label for="start-date">Start Date:</label>
      <input type="date" id="start-date" name="startDate">
    </div>
    <div class="date-input-group">
      <label for="end-date">End Date:</label>
      <input type="date" id="end-date" name="endDate">
    </div>
  </div>

  <div class="preset-buttons">
    <button class="preset-btn" data-preset="last7">Last 7 Days</button>
    <button class="preset-btn" data-preset="last30">Last 30 Days</button>
    <button class="preset-btn" data-preset="thisYear">This Year</button>
  </div>

  <div class="action-buttons">
    <button class="apply-btn">Apply</button>
    <button class="cancel-btn">Cancel</button>
  </div>
</div>
```

### CSS Styling (Basic)

```css
.date-range-picker {
  padding: 20px;
  min-width: 300px;
  font-family: -moz-system-font;
}

.picker-title {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: bold;
}

.date-inputs {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.date-input-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.date-input-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.preset-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.preset-btn {
  flex: 1;
  padding: 8px 12px;
  background: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}

.preset-btn:hover {
  background: #e0e0e0;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.apply-btn {
  background: #0060df;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background: transparent;
  color: #333;
  padding: 10px 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}
```

## Implementation Checklist

### Research Phase (4.1.1)
- [ ] Read browser.mailTabs.setQuickFilter() API docs
- [ ] Identify date filter parameters (if any)
- [ ] Test date filter functionality in TB console
- [ ] Document all findings
- [ ] Document date filter options

### Context Menu Phase (4.1.2)
- [ ] Add "Filter by Date (Today)" menu item
- [ ] Add "Filter by Date (This Week)" menu item
- [ ] Add "Filter by Date (This Month)" menu item
- [ ] Add "Filter by Date (This Year)" menu item
- [ ] Add "Filter by Date (Last 7 Days)" menu item
- [ ] Add "Filter by Date (Last 30 Days)" menu item
- [ ] Add "Filter by Date Range..." menu item
- [ ] Add icons for date menu items
- [ ] Add i18n messages for all date strings

### Preset Implementation Phase (4.1.3-4.1.5)
- [ ] Implement today date filter
- [ ] Implement this week date filter
- [ ] Implement this month date filter
- [ ] Test preset filters

### Date Range Picker Phase (4.1.6-4.1.8)
- [ ] Create popup HTML
- [ ] Add start date input
- [ ] Add end date input
- [ ] Add preset buttons
- [ ] Add apply button
- [ ] Add cancel button
- [ ] Create CSS for picker
- [ ] Create JS logic for picker

### Date Range Logic Phase (4.1.8)
- [ ] Create date range picker JS
- [ ] Parse date inputs
- [ ] Validate date range (start <= end)
- [ ] Call setQuickFilter with custom range
- [ ] Close picker on apply
- [ ] Close picker on cancel

### Preset Buttons Phase (4.1.9)
- [ ] Add preset button logic
- [ ] Handle "Last 7 Days"
- [ ] Handle "Last 30 Days"
- [ ] Handle "This Year"
- [ ] Test all presets

### Alt-Click Support Phase (4.1.10)
- [ ] Add column detection for date column
- [ ] Get clicked date from cell
- [ ] Filter by that date (full day)
- [ ] Test alt-click on various dates
- [ ] Handle invalid dates

### Settings Integration Phase (4.1.13)
- [ ] Add date filter settings (if needed)
- [ ] Store user preferences
- [ ] Implement settings persistence

### Testing Phase (4.1.14)
- [ ] Test all preset filters
- [ ] Test custom date range
- [ ] Test edge cases (today, week boundaries, month boundaries)
- [ ] Test timezone handling
- [ ] Test alt-click on date column

### Documentation Phase (4.1.15)
- [ ] Document date filtering features
- [ ] Update README.md
- [ ] Add screenshots
- [ ] Create usage examples

## Research Questions to Answer

1. **Does `setQuickFilter()` support date parameters?**
   - If yes: What is the parameter structure?
   - If no: What are the workarounds?

2. **What is the date format in message headers?**
   - ISO 8601?
   - Locale-dependent?
   - Internal TB format?

3. **How does TB's native quick filter handle dates?**
   - Date range inputs?
   - Preset buttons?
   - Alt-click on date column?

4. **Are there extensions with similar features?**
   - How do they implement date filtering?
   - What can we learn from them?

## Next Steps

1. Complete research (4.1.1)
2. Document findings
3. Begin implementation based on API support
4. Commit after each major milestone
5. Update TODO.upgrade.md with progress
