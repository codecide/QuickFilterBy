# QuickFilterBy Manual Testing Checklist

## Overview

This document provides a comprehensive manual testing checklist for QuickFilterBy extension.
Use this checklist during development, release preparation, and bug verification.

## Pre-Test Setup

### Environment Requirements
- [ ] Thunderbird 115+ installed
- [ ] QuickFilterBy extension installed (development or release build)
- [ ] Test email account configured
- [ ] Test data available (50+ messages across multiple folders)
- [ ] Clear test profile (optional, for clean testing)

### Test Data Preparation
Create or ensure presence of:
- [ ] At least 3 email accounts
- [ ] Messages from various senders (10+ unique senders)
- [ ] Messages with multiple recipients
- [ ] Messages with various subjects
- [ ] Messages organized in folders (Inbox, Sent, custom folders)
- [ ] Messages with tags/labels (if applicable)
- [ ] Threaded conversation threads
- [ ] Messages with attachments

## Core Functionality Tests

### 1. Context Menu Tests

#### Menu Appearance
- [ ] Right-click on a single message
- [ ] Verify "Filter by Sender" menu item appears
- [ ] Verify "Filter by Sender Email" menu item appears
- [ ] Verify "Filter by Recipient" menu item appears
- [ ] Verify "Filter by Recipients" menu item appears
- [ ] Verify "Filter by Subject" menu item appears
- [ ] Menu items are visible (not grayed out)

#### Menu Visibility
- [ ] Right-click on NO messages selected
- [ ] Verify all menu items are HIDDEN or grayed out
- [ ] Right-click on SINGLE message selected
- [ ] Verify all menu items are VISIBLE
- [ ] Right-click on MULTIPLE messages selected
- [ ] Verify all menu items are HIDDEN or grayed out

#### Menu Labels (Internationalization)
- [ ] Change Thunderbird language to English
- [ ] Verify menu labels are in English
- [ ] Change Thunderbird language to Spanish (if available)
- [ ] Verify menu labels are in Spanish
- [ ] Test other supported languages

### 2. Filtering Tests

#### Filter by Sender
- [ ] Right-click on message from "John Doe"
- [ ] Click "Filter by Sender"
- [ ] Verify only messages from "John Doe" are shown
- [ ] Verify quick filter bar shows filter
- [ ] Verify filter shows: "sender" enabled
- [ ] Verify quick filter text shows sender name

#### Filter by Sender Email
- [ ] Right-click on message from "John Doe <john@example.com>"
- [ ] Click "Filter by Sender Email"
- [ ] Verify only messages from "john@example.com" are shown
- [ ] Verify quick filter text shows: "john@example.com"
- [ ] Test with display name containing special characters

#### Filter by Recipient
- [ ] Right-click on message sent to "user@example.com"
- [ ] Click "Filter by Recipient"
- [ ] Verify only messages to "user@example.com" are shown
- [ ] Verify quick filter shows: "recipients" enabled

#### Filter by Recipients (All)
- [ ] Right-click on message with multiple recipients
- [ ] Click "Filter by Recipients"
- [ ] Verify messages to any recipient are shown
- [ ] Verify quick filter text shows recipient list

#### Filter by Subject
- [ ] Right-click on message with subject "Project Update"
- [ ] Click "Filter by Subject"
- [ ] Verify only messages with "Project Update" in subject are shown
- [ ] Verify quick filter shows: "subject" enabled
- [ ] Test with special characters in subject
- [ ] Test with long subjects

### 3. Alt-Click Tests (Experimental Feature)

#### Alt-Click on Subject Column
- [ ] Hold Alt key
- [ ] Click on subject column for message "Test Subject"
- [ ] Verify quick filter is applied
- [ ] Verify "subject" filter is enabled
- [ ] Verify quick filter text shows: "Test Subject"
- [ ] Messages matching subject are shown

#### Alt-Click on Recipient Column
- [ ] Hold Alt key
- [ ] Click on recipient column
- [ ] Verify quick filter is applied
- [ ] Verify "recipients" filter is enabled
- [ ] Messages to clicked recipient are shown

#### Alt-Click on Sender Column
- [ ] Hold Alt key
- [ ] Click on sender column
- [ ] Verify quick filter is applied
- [ ] Verify "author" filter is enabled
- [ ] Messages from clicked sender are shown

#### Alt-Click on Correspondent Column
- [ ] Hold Alt key
- [ ] Click on correspondent column
- [ ] Verify quick filter is applied
- [ ] Verify appropriate filter is enabled

#### Alt-Click on Unknown Column
- [ ] Hold Alt key
- [ ] Click on non-filterable column (e.g., date, size)
- [ ] Verify no filter is applied
- [ ] Check console for warning message (if applicable)

### 4. Quick Filter Interaction Tests

#### Filter Persistence Within Session
- [ ] Apply filter by subject
- [ ] Navigate to different folder
- [ ] Verify filter is cleared (TB default behavior)
- [ ] Navigate back
- [ ] Apply filter again
- [ ] Verify filter works

#### Filter Combinations
- [ ] Apply filter by sender using context menu
- [ ] Manually add additional filter term in quick filter bar
- [ ] Verify both conditions are respected (AND logic)

#### Filter Removal
- [ ] Apply any filter
- [ ] Click "Clear Filter" button in quick filter bar
- [ ] Verify all messages are shown
- [ ] Verify filter bar is empty

#### Unread Status After Filter
- [ ] Filter messages
- [ ] Mark a filtered message as read
- [ ] Clear filter
- [ ] Verify read status is persisted

### 5. Multi-Tab Scenarios

#### Independent Filters per Tab
- [ ] Open multiple mail tabs
- [ ] Apply different filters in each tab
- [ ] Switch between tabs
- [ ] Verify each tab maintains its filter
- [ ] Verify filters don't interfere

#### Tab Navigation
- [ ] Apply filter in Tab 1
- [ ] Open new mail tab
- [ ] Verify new tab has no filter (default)
- [ ] Return to Tab 1
- [ ] Verify filter is still active

### 6. Settings Persistence Tests

#### Extension Loading
- [ ] Install extension fresh
- [ ] Restart Thunderbird
- [ ] Verify extension loads without errors
- [ ] Verify context menus appear

#### Settings After Restart
- [ ] (If extension adds settings) Change a setting
- [ ] Close Thunderbird
- [ ] Reopen Thunderbird
- [ ] Verify setting is persisted

### 7. Error Handling Tests

#### Edge Cases: Missing Message Data
- [ ] Select message with missing/malformed sender
- [ ] Try to filter by sender
- [ ] Verify extension handles gracefully
- [ ] Check for error notifications

#### Edge Cases: Unicode Characters
- [ ] Test with emoji in sender name
- [ ] Test with Unicode characters in subject
- [ ] Test with special characters
- [ ] Verify filtering works correctly

#### Edge Cases: Empty Results
- [ ] Filter by term with no matches
- [ ] Verify "No messages found" or similar appears
- [ ] Verify no crash or error
- [ ] Clear filter works correctly

### 8. Performance Tests

#### Large Message List
- [ ] Open folder with 500+ messages
- [ ] Apply filter
- [ ] Verify UI remains responsive
- [ ] Verify filter applies within 2 seconds

#### Rapid Filtering
- [ ] Apply filter rapidly (5+ times in 10 seconds)
- [ ] Verify no performance degradation
- [ ] Verify no errors occur

### 9. Accessibility Tests

#### Keyboard Navigation
- [ ] Navigate to message list using keyboard
- [ ] Right-click (context menu key)
- [ ] Navigate menu with keyboard
- [ ] Activate filter with Enter key

#### Screen Reader Compatibility
- [ ] Use screen reader (if available)
- [ ] Verify context menu items are announced
- [ ] Verify filter application is announced

### 10. Cross-Platform Tests

#### Windows
- [ ] Test on Windows 10/11
- [ ] Verify all core functionality works
- [ ] Check for Windows-specific issues

#### macOS
- [ ] Test on macOS (if available)
- [ ] Verify all core functionality works
- [ ] Check for macOS-specific issues

#### Linux
- [ ] Test on Linux (Ubuntu/Debian/Fedora)
- [ ] Verify all core functionality works
- [ ] Check for Linux-specific issues

### 11. Thunderbird Version Tests

#### Minimum Supported Version
- [ ] Test on Thunderbird 115
- [ ] Verify all features work
- [ ] Check for deprecation warnings

#### Latest Stable Version
- [ ] Test on latest Thunderbird release
- [ ] Verify all features work
- [ ] Check for API changes

### 12. Regression Tests

#### Known Issues
- [ ] Verify previous bugs are still fixed
- [ ] Test with scenarios that caused issues before
- [ ] Verify fixes are still effective

## Release-Specific Tests

### Pre-Release
- [ ] All smoke tests pass
- [ ] No console errors
- [ ] Extension loads in fresh profile
- [ ] Manual testing checklist complete

### Post-Release
- [ ] Users can install .xpi
- [ ] Extension updates correctly
- [ ] Settings migrate correctly
- [ ] No critical bugs reported within 24 hours

## Test Results Template

### Test Session Details
- Date: ___________
- Tester: ___________
- Thunderbird Version: ___________
- QuickFilterBy Version: ___________
- Operating System: ___________

### Results Summary
- Total Tests: __ / ____
- Passed: __
- Failed: __
- Blocked: __

### Issues Found
1. _____________________________________________________________________
   Severity: [ ] Critical [ ] High [ ] Medium [ ] Low
   Steps to Reproduce:
   Expected Behavior:
   Actual Behavior:

2. _____________________________________________________________________
   Severity: [ ] Critical [ ] High [ ] Medium [ ] Low
   Steps to Reproduce:
   Expected Behavior:
   Actual Behavior:

3. _____________________________________________________________________
   Severity: [ ] Critical [ ] High [ ] Medium [ ] Low
   Steps to Reproduce:
   Expected Behavior:
   Expected Behavior:
   Actual Behavior:

## Conclusion

**Overall Status: [ ] PASS [ ] FAIL**

**Notes**: ___________________________________________________________________
_________________________________________________________________________

**Recommendation**: [ ] Ready for release [ ] Needs fixes [ ] Requires more testing
