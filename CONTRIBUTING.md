# Contributing to Quick Filter By

Thank you for your interest in contributing to Quick Filter By! This document provides guidelines for contributing code, translations, documentation, and bug reports.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Commit Message Conventions](#commit-message-conventions)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Translation Contributions](#translation-contributions)
- [Bug Reports](#bug-reports)
- [Feature Requests](#feature-requests)

---

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other contributors

---

## Getting Started

### Prerequisites

- Node.js 16 or later
- npm package manager
- Git version control
- Thunderbird 115+ for testing
- Text editor (VS Code recommended)
- Thunderbird Add-on Debugger extension (optional but helpful)

### Clone and Setup

```bash
# Clone the repository
git clone https://github.com/codecide/QuickFilterBy.git
cd QuickFilterBy

# Install dependencies
npm install

# Run tests to verify setup
npm test
```

### Development Environment

1. **Install Thunderbird Add-on Debugger** from Firefox Add-ons store or Thunderbird Add-ons Manager
2. **Load extension for development**:
   - Open Thunderbird
   - Navigate to `about:debugging`
   - Click "This Thunderbird"
   - Click "Load Temporary Add-on..."
   - Select the `manifest.json` file in the repository
3. **Make code changes**
4. **Build**: `npm run build`
5. **Reload extension** in about:debugging (click the refresh icon)

---

## Development Workflow

### 1. Choose or Create an Issue

Before making changes, check [GitHub Issues](https://github.com/codecide/QuickFilterBy/issues) to:
- Confirm someone else hasn't already started
- Get feedback on your approach
- Coordinate with maintainers

### 2. Create a Branch

```bash
# Create a new branch from master
git checkout -b feature/your-feature-name

# Or for bug fixes:
git checkout -b fix/your-bug-name
```

Branch naming conventions:
- `feature/` - For new features
- `fix/` - For bug fixes
- `docs/` - For documentation changes
- `refactor/` - For code refactoring
- `test/` - For test additions/changes

### 3. Make Changes

- Write clean, well-documented code
- Add tests for new functionality
- Update relevant documentation
- Follow code style guidelines

### 4. Build and Test

```bash
# Build the extension
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

Ensure all tests pass before submitting PRs.

### 5. Commit Changes

```bash
# Stage your changes
git add .

# Commit with conventional commit message
git commit -m "feat: add filtering by attachment status"
```

See [Commit Message Conventions](#commit-message-conventions) below.

### 6. Push and Create Pull Request

```bash
# Push to GitHub
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

---

## Code Style Guidelines

### JavaScript Standards

- Use ES6+ features (const, let, arrow functions)
- Follow JSDoc documentation style
- Use meaningful variable and function names
- Keep functions small and focused
- Prefer readability over cleverness
- Handle errors appropriately

### JSDoc Comments

```javascript
/**
 * Filters messages by sender
 * @param {Object} message - The message to filter by
 * @param {string} sender - The sender email to filter
 * @returns {Promise<void>} - Resolves when filter is applied
 */
async function filterBySender(message, sender) {
  // Implementation
}
```

All public functions should have JSDoc comments with:
- Description
- `@param` for each parameter with type
- `@returns` with type and description
- `@throws` if applicable

### Error Handling

Use the error utilities in `src/utils/errors.js`:

```javascript
import { logError, showErrorNotification } from './utils/errors';

async function riskyOperation() {
  try {
    // Risky operation
  } catch (error) {
    logError('Failed to perform operation', error);
    showErrorNotification('Operation failed');
  }
}
```

### Module Structure

The project uses a modular structure:

```
src/
├── utils/        # Reusable utility modules
│   ├── errors.js
│   ├── features.js
│   ├── logger.js
│   ├── settings.js
│   ├── version.js
│   └── dom.js
└── modules/      # Feature-specific modules
```

Import modules correctly:
```javascript
// Good
import { logError } from './utils/errors';
import { detectAvailableFeatures } from './utils/features';

// Bad
import logError from './utils/errors.js';
```

### Testing

Write tests for all new functionality:

```javascript
// test/unit/errors.test.js
describe('errors module', () => {
  test('logError should log error', () => {
    const result = logError('Test error', new Error('Test'));
    expect(result).toBe(true);
  });
});
```

Target: 80%+ test coverage for `src/` code.

---

## Commit Message Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring without functionality change
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `security`: Security-related changes

### Examples

```bash
# Feature
git commit -m "feat: add filtering by attachment status"

# Bug fix
git commit -m "fix: resolve alt-click not working on correspondent column"

# Documentation
git commit -m "docs: update README with new features"

# Breaking change
git commit -m "feat!: change API signature for filter functions"
```

### Breaking Changes

If your change breaks existing functionality:
1. Add `!` after the type (e.g., `feat!:`)
2. Clearly describe the breaking change in the body
3. Provide migration instructions if applicable

---

## Pull Request Process

### Before Submitting

1. **Search for existing PRs**: Avoid duplicating work
2. **Ensure tests pass**: Run `npm test` locally
3. **Check test coverage**: Ensure new code has tests
4. **Update documentation**: Modify README, docs, or comments as needed
5. **Self-review**: Review your own changes before submitting

### PR Template

When creating a PR, provide:

**Title**: Brief description of changes
**Description**:
- What problem does this solve?
- How does this solve it?
- Are there any side effects?
- Any relevant issues referenced (e.g., "Fixes #123")

**Checklist**:
- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings/errors

### Review Process

1. **Automated checks**: CI will run tests and linting
2. **Code review**: Maintainers will review your code
3. **Feedback**: Address review comments promptly
4. **Approval**: Wait for approval before merging

### Merging

Once approved:
1. Squash commits if needed
2. Rebase onto master if requested
3. Merge commit message will be generated automatically
4. Branch will be deleted after merge

---

## Testing Requirements

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- test/unit/errors.test.js

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm test -- --watch
```

### Test Requirements

- All tests must pass before PR can be merged
- New features must have tests
- Bug fixes should include regression tests
- Maintain 80%+ code coverage

### Test Categories

- **Unit Tests**: Test individual functions and modules (`test/unit/`)
- **Integration Tests**: Test component interactions (`test/integration/`)
- **Accessibility Tests**: Verify A11y compliance (`test/accessibility/`)
- **Security Tests**: Verify security measures (`test/security/`)

### Current Test Status

- **Total tests**: 472 tests passing
- **Coverage**: 82% for `src/` code

---

## Translation Contributions

We welcome translations! See [TRANSLATION_GUIDE.md](docs/TRANSLATION_GUIDE.md) for detailed instructions.

### Quick Start

1. Check if your language already exists in `_locales/`
2. If not, create a new locale directory (e.g., `_locales/it/`)
3. Copy `en/messages.json` as template
4. Translate all message strings
5. Test your translations
6. Submit PR

### Translation Guidelines

- Use action-oriented language (e.g., "Filter by Sender")
- Be concise but descriptive
- Ensure screen reader compatibility
- Test with screen readers when possible
- Follow established terminology in existing translations

### Current Supported Languages

| Language | Code | Status |
|----------|------|--------|
| English | `en` | ✅ Complete |
| French | `fr` | ✅ Complete |
| Spanish | `es` | ✅ Complete |
| German | `de` | ✅ Complete |
| Chinese (Simplified) | `zh_CN` | ✅ Complete |
| Japanese | `ja` | ✅ Complete |

See [TRANSLATION_GUIDE.md](docs/TRANSLATION_GUIDE.md) for full details.

---

## Bug Reports

### Before Reporting

1. **Search existing issues**: Avoid duplicates
2. **Check recent commits**: Issue may already be fixed
3. **Try latest version**: Issue may be resolved

### Bug Report Template

When reporting a bug, include:

**Title**: Brief, descriptive title

**Description**:
- What happened?
- What did you expect to happen?
- Steps to reproduce

**Environment**:
- Thunderbird version
- Extension version
- Operating system
- Other extensions installed (if relevant)

**Additional Info**:
- Screenshots (if applicable)
- Error messages from console
- Sample messages (if applicable)

**Label the issue** with:
- `bug`
- Relevant component (e.g., `context-menu`, `alt-click`, `date-filter`)

---

## Feature Requests

### Feature Request Template

**Title**: Brief, descriptive title

**Description**:
- What problem does this solve?
- How would you use it?
- Why is it important?

**Proposed Solution** (optional):
- How should it work?
- UI suggestions
- Alternative approaches

**Additional Info**:
- Use cases
- Related issues or PRs
- Would you be willing to implement?

**Label the request** with:
- `enhancement`
- Relevant category

---

## Getting Help

If you need help:

- **GitHub Discussions**: [https://github.com/codecide/QuickFilterBy/discussions](https://github.com/codecide/QuickFilterBy/discussions)
- **Tag your question**: e.g., `question:installation`, `question:usage`

---

## Recognition

Contributors will be recognized in:
- Release notes
- CONTRIBUTING.md contributors section
- GitHub profile (via commits)

Thank you for contributing! 🙏
