# Quick Filter By

Mozilla Thunderbird extension that adds a "Quick Filter By" messages list context menu which greatly speeds up creation of a Quick Filter for the most common use cases.

Supports filtering by sender, recipient and a subject text either via a context menu or simply by alt-clicking on on of those fields right in the messages list.

> The above functionality mimics "quick filtering" from TheBat! e-mail client.

---

## Quick Start Guide

### Installation

#### From GitHub Release

1. Go to the [Releases page](https://github.com/codecide/QuickFilterBy/releases)
2. Download the latest `QuickFilterBy.xpi` file
3. In Thunderbird, open the Add-ons Manager (Tools → Add-ons and Themes)
4. Click the gear icon → "Install Add-on From File..."
5. Select the downloaded `.xpi` file
6. Confirm installation

#### Requirements

- Thunderbird 115.0 or later
- Up to Thunderbird 140.x

### Basic Usage

#### Using Context Menu (Right-Click)

1. Select a message in the message list
2. Right-click on the message
3. Choose one of the filtering options:
   - **Filter by Sender**: Filter messages from the same sender
   - **Filter by Sender Email**: Filter by email address only
   - **Filter by Recipient**: Filter by the same recipient
   - **Filter by Recipients**: Filter by any of the recipients
   - **Filter by Subject**: Filter by the same subject text

#### Using Alt-Click

Simply hold the `Alt` key and click on:
- The **Sender** column to filter by that sender
- The **Recipient** column to filter by that recipient
- The **Subject** column to filter by that subject text

This is the fastest way to filter - no menus needed!

---

## Feature Overview

### Current Features

| Feature | Description | Usage |
|---------|-------------|-------|
| **Context Menu Filtering** | Right-click to filter messages | Right-click on message → select filter option |
| **Alt-Click Filtering** | Click with Alt key to filter | Alt + Click on sender/recipient/subject column |
| **Multiple Filter Types** | Filter by sender, recipient, subject | Select from context menu or alt-click |
| **Email Extraction** | Filter by email only (not name) | Use "Filter by Sender Email" option |
| **Correspondent Column** | Works with Thunderbird's correspondent column | Alt-click on correspondent column |

### Comparison with Thunderbird Built-in Quick Filter

| Feature | Thunderbird Quick Filter | Quick Filter By |
|---------|-------------------------|-----------------|
| Filter by sender | ✓ Manual typing required | ✓ One-click (alt-click or menu) |
| Filter by recipient | ✓ Manual typing required | ✓ One-click (alt-click or menu) |
| Filter by subject | ✓ Manual typing required | ✓ One-click (alt-click or menu) |
| Multiple message selection | ✓ | Coming soon |
| Date filtering | ✓ | Coming soon |
| Tag filtering | ✓ | Coming soon |
| Custom filter combinations | Limited | Coming soon |

---

## Build Instructions

### Prerequisites

- Node.js 16+ and npm
- (Optional) Gradle for alternative build method
- (Optional) Make for Unix/Linux

### Build Methods

#### Method 1: Using npm (Recommended)

```bash
# Clone the repository
git clone https://github.com/codecide/QuickFilterBy.git
cd QuickFilterBy

# Install dependencies (for development)
npm install

# Build the extension
npm run build

# The .xpi file will be in dist/QuickFilterBy.xpi
```

#### Method 2: Using Make (Unix/Linux)

```bash
# Clone the repository
git clone https://github.com/codecide/QuickFilterBy.git
cd QuickFilterBy

# Build the extension
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
# Clone the repository
git clone https://github.com/codecide/QuickFilterBy.git
cd QuickFilterBy

# Build with Gradle
gradle build

# The .xpi file will be in dist/QuickFilterBy.xpi
```

### Verification

All build methods produce identical `.xpi` files. You can verify the SHA-256 checksum:

```bash
sha256sum dist/QuickFilterBy.xpi
```

### Platform-Specific Notes

#### Windows
- Use `scripts\build.bat` for Windows-native builds
- Ensure PowerShell is available for checksum generation

#### macOS
- All build methods work natively
- Ensure you have Xcode command line tools for make

#### Linux
- All build methods work natively
- Ensure you have zip and make installed

---

## Installation Guide

### Manual Installation

1. Download `QuickFilterBy.xpi` from the [latest release](https://github.com/codecide/QuickFilterBy/releases)
2. In Thunderbird:
   - Open Add-ons Manager: Tools → Add-ons and Themes
   - Click the gear icon (⋮)
   - Select "Install Add-on From File..."
   - Navigate to and select the `.xpi` file
3. Confirm installation in the popup

### Store Installation (When Available)

Once published to the Thunderbird Add-ons store:

1. Open Thunderbird
2. Go to Tools → Add-ons and Themes
3. Search for "Quick Filter By"
4. Click "Add to Thunderbird"
5. Wait for installation to complete

### Enable Installation (if needed)

If you encounter installation issues:

1. Open Thunderbird Preferences/Settings
2. Go to General → Config Editor
3. Search for `xpinstall.signatures.required`
4. Set to `false` (not recommended for general use)
5. Try installation again
6. Set back to `true` after installation

### Verify Installation

1. Open a mail folder in Thunderbird
2. Right-click on a message
3. You should see "Quick Filter By" options in the context menu
4. Alternatively, hold Alt and click on the sender/recipient/subject columns

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
- Ensure the extension is enabled in Add-ons Manager
- Restart Thunderbird
- Check that you're selecting exactly one message
- Verify the extension has necessary permissions

#### Alt-Click Not Working

**Problem**: Alt-clicking on columns doesn't filter messages.

**Solutions**:
- Ensure the extension is enabled
- Check if the column names match (sender, recipient, subject)
- Try right-click context menu as alternative
- Check Thunderbird console for errors

#### Filters Not Applied

**Problem**: Clicking filter options doesn't filter the message list.

**Solutions**:
- Ensure the Quick Filter bar is visible (View → Toolbars → Quick Filter Bar)
- Try clearing existing filters first
- Restart Thunderbird
- Check Thunderbird console for errors

#### Extension Shows as Incompatible

**Problem**: Thunderbird shows "Incompatible" for this extension.

**Solutions**:
- Update Thunderbird to the latest version
- Check if your TB version is outside the supported range (115.0-140.x)
- Report the issue on GitHub with your TB version

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

1. **Clone the repository**:
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
   - Install the Thunderbird Add-on Debugger extension

### Code Structure

```
QuickFilterBy/
├── manifest.json           # Extension manifest
├── background.js           # Background script (context menus, event handlers)
├── package.json           # npm configuration
├── build.gradle          # Gradle build configuration
├── Makefile              # Make targets
├── api/
│   └── MessagesListAdapter/
│       ├── schema.json   # Experimental API schema
│       └── implementation.js  # Experimental API implementation
├── _locales/
│   └── en/
│       └── messages.json # English translations
├── scripts/              # Build scripts
│   ├── build.sh         # Unix/Linux build script
│   └── build.bat        # Windows build script
├── docs/                # Documentation
└── dist/                # Build output (created during build)
```

### Running Tests

```bash
# Run tests (when implemented)
npm test

# Run tests with coverage (when implemented)
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
4. Test the changes
5. Commit changes
6. Repeat

---

## Architecture

For detailed architecture information, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

### Key Components

- **Context Menu System**: Creates and manages context menu items for filtering
- **Alt-Click Handler**: Listens for clicks with Alt modifier on message list columns
- **Experimental API**: Uses Thunderbird's experimental API to access message list events
- **Filter Application**: Applies filters using `browser.mailTabs.setQuickFilter()`

---

## API Changes

For information about API changes and Thunderbird version compatibility, see [docs/API_CHANGES.md](docs/API_CHANGES.md).

---

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

ISC License - see LICENSE file for details

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

## Support

- **GitHub Issues**: [https://github.com/codecide/QuickFilterBy/issues](https://github.com/codecide/QuickFilterBy/issues)
- **Discussions**: [https://github.com/codecide/QuickFilterBy/discussions](https://github.com/codecide/QuickFilterBy/discussions)

---

## Acknowledgments

This extension is inspired by the quick filtering functionality from TheBat! e-mail client.
