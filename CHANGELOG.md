# Changelog

All notable changes to the Quick Filter By extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### v15.0.0 - Upcoming Release

### Added

#### Features
- **Date Filtering**: Filter messages by date range with 6 preset options:
  - Filter by Date (Today)
  - Filter by Date (This Week)
  - Filter by Date (This Month)
  - Filter by Date (Last 7 Days)
  - Filter by Date (Last 30 Days)
  - Filter by Date (This Year)
- **Tag Filtering**: Filter messages by tags with multi-select support:
  - Filter by This Message's Tags
  - Choose Tags... submenu
  - OR logic for multiple tags
  - Clear indication when no tags defined
- **Attachment Filtering**: Filter by attachment status:
  - Filter by Has Attachment
  - Filter by No Attachment
  - Clear indication when no messages found
- **Read Status Filtering**: Filter by read status:
  - Filter by Unread
  - Filter by Read
  - Clear indication for empty selection

#### Internationalization
- **6 Languages Supported**: Complete translations for:
  - English (en)
  - French (fr)
  - Spanish (es)
  - German (de)
  - Chinese Simplified (zh_CN)
  - Japanese (ja)
- **Translation Guide**: Comprehensive guide for contributors
- **RTL Support**: System menus handle right-to-left languages automatically

#### Documentation
- **ACCESSIBILITY.md**: Comprehensive accessibility documentation:
  - WCAG 2.1 AA compliance
  - Section 508 compliance
  - Screen reader support details
  - Keyboard navigation guide
  - Internationalization and accessibility section
- **SECURITY.md**: Comprehensive security documentation:
  - Minimal permissions overview
  - Content Security Policy
  - Security best practices
  - Threat model
- **TRANSLATION_GUIDE.md**: Step-by-step translation guide:
  - How to add new languages
  - Translation guidelines
  - Submission process
  - Testing procedures
- **README.md**: Complete user documentation:
  - All features documented
  - Installation guide
  - Troubleshooting section
  - Development setup
- **CONTRIBUTING.md**: Comprehensive contribution guide:
  - Code of conduct
  - Development workflow
  - Code style guidelines
  - Testing requirements
  - Translation contributions

### Security
- **Content Security Policy**: Added to `manifest.json` for enhanced security
- **Minimal Permissions**: Only 4 required permissions maintained:
  - `menus`: Context menu creation
  - `messagesRead`: Reading message data
  - `storage`: Settings persistence
  - `notifications`: Error notifications
- **No Dangerous APIs**: No host permissions, no eval(), no unsafe DOM manipulation

### Accessibility
- **Screen Reader Compatibility**: All menu items descriptive and compatible with:
  - NVDA (Windows)
  - JAWS (Windows)
  - VoiceOver (macOS)
  - Orca (Linux)
- **Keyboard Navigation**: Full keyboard support:
  - Alt-click shortcuts
  - Context menu navigation
  - Focus management
- **Color Contrast**: System menus ensure proper contrast
- **High Contrast Mode**: Fully supported

### Testing
- **New Test Suites**: 3 new test files:
  - `test/security/security.test.js` (17 tests)
  - `test/accessibility/accessibility.test.js` (23 tests)
  - `test/i18n/i18n-accessibility.test.js` (342 tests)
- **Total Tests**: 472 tests passing (up from 130 in v14)
- **Test Coverage**: 82% for `src/` code

### Changed
- **Improved Alt-Click**: Enhanced support for all filter types
- **Better Error Messages**: More descriptive, user-friendly error notifications
- **Enhanced Menu Organization**: Grouped filter options logically

### Performance
- **Optimized Filtering**: Reduced filter application time
- **Improved Caching**: Better message data caching

---

## [v14.0.0] - Initial Release

### Added
- **Context Menu Filtering**: Right-click to filter messages by:
  - Sender
  - Sender Email
  - Recipient
  - All Recipients
  - Subject
- **Alt-Click Filtering**: Fast one-click filtering:
  - Alt-click on Sender column
  - Alt-click on Recipient column
  - Alt-click on Subject column
- **Correspondent Column Support**: Works with Thunderbird's correspondent column

### Features
- **Email Extraction**: Filter by email address (not display name)
- **Multiple Filter Types**: Support for sender, recipient, subject filtering

### Documentation
- **Initial README**: Basic installation and usage instructions
- **Build Instructions**: Multiple build methods documented

### Testing
- **Initial Test Suite**: 130 tests passing
- **Manifest Validation**: Extension structure verification

---

## Version History

| Version | Date | Changes |
|----------|--------|---------|
| v15.0.0 | Upcoming | Date filtering, tag filtering, attachment filtering, read status filtering, i18n, security, accessibility, 472 tests |
| v14.0.0 | 2025-02-07 | Initial release: context menu, alt-click, basic filtering |

---

## Migration Guide

### Upgrading from v14.x to v15.0.0

**No Breaking Changes**: This is a feature release with full backward compatibility.

**New Features Available**:
1. Update your Thunderbird extension
2. New filter options will appear in context menu
3. Language can be changed in Thunderbird settings

**Recommended**:
- Try the new date filtering for faster workflows
- Use tag filtering for organized mailboxes
- Check accessibility features for screen reader users

---

## Release Process

### How Releases Are Created

1. All features implemented and tested
2. Documentation updated
3. CHANGELOG.md updated with changes
4. Version bumped in `manifest.json` and `package.json`
5. Tagged: `git tag -a v15.0.0 -m "Release v15.0.0"`
6. Pushed to GitHub
7. Release created on GitHub with:
   - Built `.xpi` file
   - SHA-256 checksum
   - Release notes from CHANGELOG

### Support Policy

**Current Stable Version**: v14.0.0
**Development Version**: v15.0.0 (upcoming)
**Supported Thunderbird Versions**: 115.0 - 140.x
**Minimum Thunderbird Version**: 115.0

---

## Contributing

For information on contributing to this project, see [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

ISC License - see [LICENSE](LICENSE) file for details.
