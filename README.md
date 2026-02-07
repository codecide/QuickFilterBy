# Quick Filter By

Mozilla Thunderbird extension that adds "Quick Filter By" context menu options to dramatically speed up filtering messages by common criteria. One-click filtering for senders, recipients, subjects, dates, tags, attachments, and read status.

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Thunderbird Version](https://img.shields.io/badge/Thunderbird-115%2B--140.x-green.svg)](https://www.thunderbird.net/)
[![Tests](https://img.shields.io/badge/tests-472%20passing-brightgreen.svg)](test/)
[![Languages](https://img.shields.io/badge/languages-6-blue.svg)](#internationalization)

> **Inspired by**: TheBat! e-mail client's quick filtering feature

---

## Features

### Core Filtering Options

| Filter Type | Description | Usage |
|-------------|-------------|---------|
| **Filter by Sender** | Filter messages from the same sender | Right-click → "Filter by Sender" or Alt+click sender column |
| **Filter by Sender Email** | Filter by email address only | Right-click → "Filter by Sender (Email)" |
| **Filter by First Recipient** | Filter by first recipient | Right-click → "Filter by Recipient" |
| **Filter by All Recipients** | Filter by any recipient | Right-click → "Filter by Recipients" |
| **Filter by Subject** | Filter by same subject text | Right-click → "Filter by Subject" or Alt+click subject column |

### Advanced Filtering

| Feature | Description |
|----------|-------------|
| **Date Filtering** | Filter messages by date range (Today, This Week, This Month, Last 7 Days, Last 30 Days, This Year) |
| **Tag Filtering** | Filter by message tags (multi-select support, OR logic) |
| **Attachment Filtering** | Filter by attachment status (Has Attachment / No Attachment) |
| **Read Status Filtering** | Filter by read status (Unread / Read) |
| **Correspondent Column** | Works with Thunderbird's correspondent column (Alt-click support) |

### Keyboard Shortcuts

| Action | Keyboard Shortcut |
|---------|-----------------|
| Filter by column | Hold **Alt** + **Click** on sender/recipient/subject column |
| Open context menu | **Right-click**, **Shift+F10**, or **Menu key** |
| Navigate menu | **↑ / ↓** arrow keys |
| Activate menu item | **Enter** or **Space** |
| Close menu | **Esc** |

### Accessibility

- ✅ **Screen Reader Support**: All menu items have descriptive labels compatible with NVDA, JAWS, VoiceOver, Orca
- ✅ **Keyboard Navigation**: Full keyboard support for all features
- ✅ **WCAG 2.1 AA Compliant**: Meets accessibility standards
- ✅ **Section 508 Compliant**: Follows accessibility requirements
- ✅ **Color Contrast**: System menus ensure proper contrast, high contrast mode supported
- ✅ **Internationalization**: 6 languages supported (English, French, Spanish, German, Chinese Simplified, Japanese)

For detailed accessibility information, see [ACCESSIBILITY.md](ACCESSIBILITY.md)

### Security

- ✅ **Minimal Permissions**: Only 4 permissions (menus, messagesRead, storage, notifications)
- ✅ **Content Security Policy**: Secure by default, no dangerous APIs
- ✅ **Input Validation**: All inputs validated before processing
- ✅ **Error Handling**: Secure error messages that don't expose sensitive data
- ✅ **No Third-Party Services**: 100% offline, no data collection

For detailed security information, see [SECURITY.md](SECURITY.md)

---

## Quick Start Guide

### Installation

#### From GitHub Release

1. Go to [Releases page](https://github.com/codecide/QuickFilterBy/releases)
2. Download the latest `QuickFilterBy.xpi` file
3. In Thunderbird, open **Add-ons Manager** (Tools → Add-ons and Themes)
4. Click the gear icon → **"Install Add-on From File..."**
5. Select the downloaded `.xpi` file
6. Confirm installation

#### Requirements

- **Thunderbird 115.0 or later** (up to 140.x)
- Compatible with all major platforms (Windows, macOS, Linux)

### Basic Usage

#### Using Context Menu (Right-Click)

1. Select a message in the message list
2. Right-click on the message
3. Choose one of the filtering options:

**Basic Filters:**
   - **Filter by Sender**: Filter messages from the same sender
   - **Filter by Sender (Email)**: Filter by email address only
   - **Filter by First Recipient**: Filter by the first recipient
   - **Filter by All Recipients**: Filter by any of the recipients
   - **Filter by Subject**: Filter by same subject text

**Advanced Filters:**
   - **Filter by Date** → Choose date range:
     - Filter by Date (Today)
     - Filter by Date (This Week)
     - Filter by Date (This Month)
     - Filter by Date (Last 7 Days)
     - Filter by Date (Last 30 Days)
     - Filter by Date (This Year)
   - **Filter by Tag** → Select tags to filter
   - **Filter by Attachment** → Has Attachment / No Attachment
   - **Filter by Read Status** → Unread / Read

#### Using Alt-Click (Fastest Method)

Hold `Alt` key and click on:
- **The Sender column** to filter by that sender
- **The Recipient column** to filter by that recipient
- **The Subject column** to filter by that subject text

**This is the fastest way to filter** - no menus needed!

---

## Feature Overview

### Complete Feature List

| Feature | Status | Usage |
|----------|--------|---------|
| **Context Menu Filtering** | ✅ | Right-click to filter messages |
| **Alt-Click Filtering** | ✅ | Alt + Click on column headers |
| **Filter by Sender** | ✅ | Context menu or alt-click |
| **Filter by Sender Email** | ✅ | Context menu only |
| **Filter by Recipients** | ✅ | Context menu or alt-click |
| **Filter by Subject** | ✅ | Context menu or alt-click |
| **Filter by Date** | ✅ | Context menu (6 presets) |
| **Filter by Tags** | ✅ | Context menu (multi-select) |
| **Filter by Attachment** | ✅ | Context menu (2 options) |
| **Filter by Read Status** | ✅ | Context menu (2 options) |
| **Correspondent Column** | ✅ | Alt-click support |
| **Internationalization** | ✅ | 6 languages (en, fr, es, de, zh_CN, ja) |

### Comparison with Thunderbird Built-in Quick Filter

| Feature | Thunderbird Quick Filter | Quick Filter By |
|---------|-------------------------|-----------------|
| Filter by sender | Manual typing required | ✓ One-click (alt-click or menu) |
| Filter by recipient | Manual typing required | ✓ One-click (alt-click or menu) |
| Filter by subject | Manual typing required | ✓ One-click (alt-click or menu) |
| Filter by date | ✓ | ✓ One-click with presets |
| Filter by tags | ✓ | ✓ One-click with multi-select |
| Filter by attachments | ✓ | ✓ One-click |
| Filter by read status | ✓ | ✓ One-click |
| Multiple message selection | ✓ | Planned for future |
| Custom filter combinations | ✓ | ✓ Via multiple menu clicks |

---

## Build Instructions

### Prerequisites

- Node.js 16+ and npm
- (Optional) Gradle for alternative build method
- (Optional) Make for Unix/Linux

### Build Methods

#### Method 1: Using npm (Recommended)

```bash
# Clone repository
git clone https://github.com/codecide/QuickFilterBy.git
cd QuickFilterBy

# Install dependencies (for development)
npm install

# Build extension
npm run build

# The .xpi file will be in dist/QuickFilterBy.xpi
```

#### Method 2: Using Make (Unix/Linux)

```bash
# Clone repository
git clone https://github.com/codecide/QuickFilterBy.git
cd QuickFilterBy

# Build extension
make build

# Clean build artifacts
make clean

# The .xpi file will be in dist/QuickFilterBy.xpi
```

#### Method 3: Using Build Scripts

```bash
# On Unix/Linux
./scripts/build.sh build

# On Windows
scripts\build.bat build
```

#### Method 4: Using Gradle

```bash
# Clone repository
git clone https://github.com/codecide/QuickFilterBy.git
cd QuickFilterBy

# Build with Gradle
gradle build

# The .xpi file will be in dist/QuickFilterBy.xpi
```

### Verification

All build methods produce identical `.xpi` files. You can verify with SHA-256 checksum:

```bash
sha256sum dist/QuickFilterBy.xpi
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

**Test Status**: 472 tests passing ✅
- Unit tests: 388 tests
- Accessibility tests: 40 tests
- Security tests: 17 tests
- Manifest tests: 17 tests
- Integration tests: 10 tests

---

## Troubleshooting

### Common Issues

#### Installation Fails

**Problem**: Thunderbird refuses to install the `.xpi` file.

**Solutions**:
- Verify Thunderbird version is 115.0 or later
- Check that the `.xpi` file is not corrupted (verify checksum)
- Try installing in a new Thunderbird profile
- Check Thunderbird error console (Tools → Developer Tools → Error Console)

#### Context Menu Not Appearing

**Problem**: Right-clicking on a message doesn't show Quick Filter By options.

**Solutions**:
- Ensure that extension is enabled in Add-ons Manager
- Restart Thunderbird
- Check that you're selecting exactly one message
- Verify that extension has necessary permissions

#### Alt-Click Not Working

**Problem**: Alt-clicking on columns doesn't filter messages.

**Solutions**:
- Ensure that extension is enabled
- Check if column names match (sender, recipient, subject)
- Try right-click context menu as alternative
- Check Thunderbird console for errors

#### Filters Not Applied

**Problem**: Clicking filter options doesn't filter the message list.

**Solutions**:
- Ensure that Quick Filter bar is visible (View → Toolbars → Quick Filter Bar)
- Try clearing existing filters first
- Restart Thunderbird
- Check Thunderbird console for errors

#### Extension Shows as Incompatible

**Problem**: Thunderbird shows "Incompatible" for this extension.

**Solutions**:
- Update Thunderbird to the latest version
- Check if your TB version is outside supported range (115.0-140.x)
- Report an issue on GitHub with your TB version

### Debug Mode

To enable debug mode:

1. Open Thunderbird Error Console (Tools → Developer Tools → Error Console)
2. Look for extension-related errors
3. Copy error messages for bug reports

### Collecting Logs

If you need to report a bug:

1. Open Thunderbird Error Console
2. Click "Clear" to remove old messages
3. Reproduce the issue
4. Copy all relevant error messages
5. Include in your bug report along with:
   - Thunderbird version
   - Extension version
   - Operating system
   - Steps to reproduce

---

## Development Setup

### Environment Setup

1. **Clone repository**:
   ```bash
   git clone https://github.com/codecide/QuickFilterBy.git
   cd QuickFilterBy
   ```

2. **Install dependencies** (for development):
   ```bash
   npm install
   ```

3. **Set up your development environment**:
   - Ensure Node.js 16+ is installed
   - Install your preferred code editor (VS Code recommended)
   - Install Thunderbird Add-on Debugger extension

### Code Structure

```
QuickFilterBy/
├── manifest.json           # Extension manifest
├── background.js           # Background script (context menus, event handlers)
├── package.json           # npm configuration
├── build.gradle          # Gradle build configuration
├── Makefile              # Make targets
├── src/                  # Source code
│   ├── utils/           # Utility modules (errors, features, logger, etc.)
│   │   ├── errors.js      # Error handling
│   │   ├── features.js    # Feature flags
│   │   ├── logger.js      # Logging
│   │   ├── settings.js    # Settings management
│   │   ├── version.js     # Version detection
│   │   └── dom.js         # DOM access utilities
│   └── modules/        # Feature modules
├── api/
│   └── MessagesListAdapter/
│       ├── schema.json   # Experimental API schema
│       └── implementation.js  # Experimental API implementation
├── _locales/             # Translations
│   ├── en/            # English
│   ├── fr/            # French
│   ├── es/            # Spanish
│   ├── de/            # German
│   ├── zh_CN/         # Chinese Simplified
│   └── ja/            # Japanese
├── scripts/              # Build scripts
│   ├── build.sh         # Unix/Linux build script
│   └── build.bat        # Windows build script
├── test/                 # Test suite
│   ├── unit/           # Unit tests
│   ├── integration/     # Integration tests
│   ├── accessibility/   # Accessibility tests
│   ├── security/        # Security tests
│   └── mocks/          # Test mocks
├── docs/                 # Documentation
│   ├── ARCHITECTURE.md  # Architecture documentation
│   ├── API_CHANGES.md   # API compatibility
│   ├── SECURITY.md      # Security documentation
│   ├── ACCESSIBILITY.md  # Accessibility documentation
│   ├── TRANSLATION_GUIDE.md  # Translation guide
│   └── TODO.upgrade.md  # Upgrade plan
└── dist/                # Build output (created during build)
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Building for Development

```bash
# Build extension
npm run build

# Load in Thunderbird for development
# 1. Go to about:debugging
# 2. Click "This Thunderbird"
# 3. Click "Load Temporary Add-on..."
# 4. Select manifest.json
```

### Development Workflow

1. Make code changes
2. Build the extension: `npm run build`
3. Load in Thunderbird via about:debugging
4. Test changes
5. Commit changes
6. Repeat

For detailed contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md)

---

## Documentation

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Component architecture and data flow
- **[API_CHANGES.md](docs/API_CHANGES.md)** - Thunderbird API compatibility
- **[SECURITY.md](SECURITY.md)** - Security features and best practices
- **[ACCESSIBILITY.md](ACCESSIBILITY.md)** - Accessibility compliance and features
- **[TRANSLATION_GUIDE.md](docs/TRANSLATION_GUIDE.md)** - How to contribute translations
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines

---

## Internationalization

The extension supports 6 languages with full translations for all UI elements:

| Language | Code | Status |
|----------|------|--------|
| English | `en` | ✅ Complete |
| French | `fr` | ✅ Complete |
| Spanish | `es` | ✅ Complete |
| German | `de` | ✅ Complete |
| Chinese (Simplified) | `zh_CN` | ✅ Complete |
| Japanese | `ja` | ✅ Complete |

### Contributing Translations

Want to help translate Quick Filter By into your language? See our comprehensive [Translation Guide](docs/TRANSLATION_GUIDE.md) for step-by-step instructions.

**Translation Guidelines:**
- All translations are accessible-friendly for screen readers
- Consistent action-oriented language
- Clear, descriptive labels
- No cryptic abbreviations
- Screen reader verified

---

## License

ISC License - see [LICENSE](LICENSE) file for details

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and recent changes.

### Recent Highlights

**v15.0.0** (Upcoming):
- ✨ New: Date filtering with 6 presets
- ✨ New: Tag filtering with multi-select
- ✨ New: Attachment filtering (Has/No)
- ✨ New: Read status filtering (Unread/Read)
- ✨ New: Internationalization support (6 languages)
- 🔒 Security: Content Security Policy added
- ♿ Accessibility: Comprehensive A11y documentation and tests
- 🧪 Tests: 472 tests passing (100+ new tests added)

**v14.0.0** (Current):
- Initial release with core filtering features

---

## Support

- **GitHub Issues**: [https://github.com/codecide/QuickFilterBy/issues](https://github.com/codecide/QuickFilterBy/issues)
- **Discussions**: [https://github.com/codecide/QuickFilterBy/discussions](https://github.com/codecide/QuickFilterBy/discussions)

When reporting issues, please include:
- Thunderbird version
- Extension version
- Operating system
- Steps to reproduce
- Any error messages from console

---

## Acknowledgments

This extension is inspired by the quick filtering functionality from TheBat! e-mail client.

---

**Made with ❤️ for the Thunderbird community**
