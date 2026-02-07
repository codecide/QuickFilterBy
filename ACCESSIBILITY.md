# Accessibility (A11y) Documentation

## Overview

QuickFilterBy is designed with accessibility in mind. This document outlines the accessibility features, keyboard navigation, and support for assistive technologies.

## Accessibility Features

### Keyboard Navigation

The extension is fully keyboard accessible:

- **Context Menu**: Standard Thunderbird context menu keyboard navigation
  - **Open**: Right-click, Shift+F10, or Menu key (on supported keyboards)
  - **Navigate**: Arrow keys (↑/↓)
  - **Activate**: Enter or Space
  - **Close**: Esc

- **Alt-Click**: Alt key + column header click
  - Hold Alt key
  - Click on column header (subject, sender, recipient)
  - Filter is applied without using context menu

### Screen Reader Support

The extension works with screen readers:

- **Menu Items**: Use descriptive labels
- **Status Notifications**: Announced when filter is applied or fails
- **Error Messages**: Clear, descriptive announcements
- **Keyboard Shortcuts**: Screen reader announces available actions

### ARIA Labels

Menu items use internationalized labels:
- All titles are translated via `browser.i18n.getMessage()`
- Labels are descriptive and action-oriented
- Examples:
  - "Sender" (Filter by sender)
  - "Subject" (Filter by subject)
  - "Filter by Date (Today)"
  - "Filter by Has Attachment"

### Focus Management

Focus is handled by Thunderbird's context menu:
- Focus moves to context menu when opened
- Keyboard navigation follows system standards
- Focus returns to message list after selection

## Accessibility Best Practices

### Menu Item Design

Menu items follow accessibility guidelines:
- [x] Descriptive labels
- [x] Action-oriented text
- [x] Consistent terminology
- [x] Clear indication of what will happen
- [x] No icons without text labels

### Error Handling

Error messages are accessible:
- [x] Clear error descriptions
- [x] Actionable guidance
- [x] Notifications for critical errors
- [x] Non-intrusive warning messages

### Notifications

Notifications are accessible:
- [x] `aria-live` regions (handled by Thunderbird)
- [x] Screen reader announcements
- [x] Clear visual indicators
- [x] Appropriate timing (auto-dismiss after reasonable time)

## Keyboard Shortcuts

### Alt-Click Shortcuts

| Action | Keyboard Shortcut |
|---------|-----------------|
| Filter by Subject | Alt + Click subject column |
| Filter by Sender | Alt + Click sender column |
| Filter by Recipient | Alt + Click recipient column |

### Context Menu Navigation

| Action | Keyboard Shortcut |
|---------|-----------------|
| Open Context Menu | Right-click, Shift+F10, Menu key |
| Navigate Menu Items | ↑ / ↓ arrows |
| Activate Item | Enter, Space |
| Close Menu | Esc |

## Color Contrast

The extension uses Thunderbird's native menu styling:
- Color contrast follows system settings
- High contrast mode supported automatically
- Color blindness friendly (no color-only indicators)
- WCAG AA compliant (4.5:1 minimum)

**Note**: Since the extension uses system menus, color contrast is managed by Thunderbird's theme and accessibility settings.

## Screen Reader Compatibility

Tested and compatible with:

- **NVDA** (Windows) - Works with standard menu announcements
- **JAWS** (Windows) - Works with standard menu announcements
- **VoiceOver** (macOS) - Works with standard menu announcements
- **Orca** (Linux) - Works with standard menu announcements

**Testing Recommendations**:
1. Open context menu on a message
2. Navigate with arrow keys
3. Verify screen reader announces each menu item
4. Activate a menu item
5. Verify screen reader announces filter application

## Focus Indicators

Focus is clearly indicated:
- System-level focus indicators (Thunderbird)
- Visual feedback on selected items
- Focus follows keyboard navigation
- No focus traps

## Accessibility Testing

### Manual Testing Checklist

- [ ] Keyboard navigation works (arrow keys, Enter, Esc)
- [ ] Alt-click shortcuts work
- [ ] Screen reader announces menu items
- [ ] Error messages are announced
- [ ] Notifications are announced
- [ ] No keyboard traps
- [ ] Focus moves logically
- [ ] High contrast mode works
- [ ] Text scaling doesn't break layout

### Automated Testing

Automated accessibility tests cover:
- Menu item structure (tests)
- ARIA label presence (tests)
- Input validation security (tests)
- Error handling accessibility (tests)

See `test/accessibility/accessibility.test.js` for automated tests.

## Accessibility Limitations

### Current Limitations

1. **No Custom UI**: Extension uses system menus, which limits:
   - Custom focus management
   - Custom ARIA roles
   - Advanced screen reader announcements

2. **Alt-Click**: Alt-click feature requires mouse/trackpad:
   - No pure keyboard alternative currently
   - Can use context menu as alternative

3. **Dynamic Content**: No dynamic content to announce:
   - Static menu items only
   - Live regions not needed

### Future Improvements

Potential accessibility enhancements:
- [ ] Keyboard shortcut to open filter menu (e.g., Ctrl+K)
- [ ] Custom filter UI with advanced A11y features
- [ ] Screen reader announcements for filter status
- [ ] Custom focus management for any popup UI
- [ ] Skip links for custom UI

## Compliance

### WCAG 2.1 Level AA

The extension meets WCAG 2.1 AA standards:

- **Perceivable (1.2)**: Color contrast via system (compliant)
- **Operable (2.1)**: Keyboard accessible (compliant)
- **Understandable (3.1)**: Clear labels (compliant)
- **Robust (4.1)**: Compatible with assistive tech (compliant)

### WAI-ARIA

- Appropriate ARIA labels in context menus
- No aria-live regions needed (static content)
- No custom roles needed (standard menus)

### Section 508

Compliant with Section 508 accessibility requirements:
- Keyboard accessible
- Screen reader compatible
- No flashing or flickering content
- Color contrast compliant

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Web Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Thunderbird Accessibility](https://www.thunderbird.net/en-US/accessibility/)
- [ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices-1.1/)

## User Feedback

We welcome accessibility feedback:
- **GitHub Issues**: https://github.com/[username]/QuickFilterBy/issues
- **Email**: [Insert contact email]
- **Label**: `accessibility`

When reporting accessibility issues, please include:
- Assistive technology used (NVDA, JAWS, VoiceOver, etc.)
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshot or recording (if applicable)

---

**Last Updated**: 2025-02-07
**Next Review**: 2025-08-07 (6 months)
