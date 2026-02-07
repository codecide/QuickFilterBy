# Security Policy

## Overview

QuickFilterBy is designed with security as a core principle. This document outlines the security measures implemented, threat model, and procedures for handling security concerns.

## Security Features

### Input Validation

All user inputs are validated before use:

- **Settings validation**: Type checking via `ErrorUtils.validateType()`
- **Filter values**: Validated before applying to Quick Filter API
- **Message data**: Null checks via `ErrorUtils.validateNotNull()`
- **String inputs**: Sanitized via `ErrorUtils.validateString()`

Example validation in `src/utils/errors.js`:
```javascript
ErrorUtils.validateNotNull(message, 'message');
ErrorUtils.validateType(hasAttachment, 'boolean');
```

### Content Security Policy (CSP)

Extension pages enforce strict CSP:
- **Script sources**: Only self (no external scripts)
- **Object sources**: None (prevents plugin/embed attacks)
- **Inline scripts**: Disabled

### Secure Storage

Extension uses Thunderbird's secure storage APIs:
- **browser.storage.sync**: User preferences
- **browser.storage.local**: Cached data
- **No sensitive data**: No passwords, tokens, or private keys stored

### Error Handling

Errors are handled securely:
- **No sensitive data**: Error messages don't expose user data
- **Sanitized errors**: Stack traces logged only in debug mode
- **User notifications**: Generic error messages shown to users

### Minimal Permissions

Extension requests only necessary permissions:
- **menus**: Create context menu items
- **messagesRead**: Read message metadata (author, subject, etc.)
- **storage**: Save user preferences
- **notifications**: Show error/warning notifications

No permissions requested for:
- Network access
- Private browsing data
- Bookmarks/history
- Tabs management

## Threat Model

### Potential Threats

1. **XSS (Cross-Site Scripting)**
   - **Mitigation**: No HTML rendering, CSP enforced, no innerHTML usage
   - **Risk Level**: Low

2. **Injection Attacks**
   - **Mitigation**: Input validation, type checking, no code execution
   - **Risk Level**: Low

3. **Data Exfiltration**
   - **Mitigation**: No network access, no external resource loading
   - **Risk Level**: Very Low

4. **Privilege Escalation**
   - **Mitigation**: Minimal permissions, no host permissions
   - **Risk Level**: Low

5. **Malicious Message Content**
   - **Mitigation**: Only reads message metadata, doesn't render content
   - **Risk Level**: Very Low

### Security Boundaries

- **Extension Context**: Isolated from web pages
- **Background Scripts**: Cannot access DOM of web pages
- **Content Scripts**: None (no web page manipulation)
- **Storage**: Encrypted by Thunderbird

## Security Best Practices

### Code Review Checklist

When reviewing code for security issues:

- [ ] All user inputs validated
- [ ] No direct DOM manipulation of external content
- [ ] No use of eval() or similar functions
- [ ] No inline scripts/styles
- [ ] Error messages don't leak sensitive data
- [ ] Permissions are minimal and justified
- [ ] CSP is enforced
- [ ] No hardcoded secrets or API keys

### Development Guidelines

1. **Never use `eval()` or `innerHTML`**
   - Use `textContent` for text content
   - Use createElement for DOM construction

2. **Validate all external data**
   - Message metadata from Thunderbird API
   - User settings from storage
   - API responses

3. **Sanitize error messages**
   - Log full errors in debug mode only
   - Show generic errors to users
   - Don't expose internal state

4. **Minimize data collection**
   - Only collect necessary metadata
   - Don't collect message bodies
   - Don't track user behavior

## Vulnerability Reporting

### Reporting Process

If you discover a security vulnerability, please report it responsibly:

1. **Email**: security@extensions.thunderbird.net (placeholder - update)
2. **PGP Key**: [Insert PGP key if available]
3. **Subject**: Security Vulnerability - QuickFilterBy

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Affected versions
- Impact assessment
- Proof of concept (if available)

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 7 days
- **Fix Development**: Within 30 days
- **Public Disclosure**: After fix is released

### Safe Harbor

Security researchers who:
- Follow responsible disclosure
- Provide sufficient details
- Allow reasonable time for fixes
- Do not exploit the vulnerability

...will be recognized and credited in the release notes.

## Security Updates

### Version History

**v14.0.0** (Current)
- Added Content Security Policy
- Implemented input validation via ErrorUtils
- Documented security practices
- Minimal permissions maintained

## Compliance

### Standards

- **WCAG 2.1**: Accessibility compliance
- **Mozilla WebExtension Guidelines**: Compliance with extension guidelines
- **Thunderbird Add-on Policies**: Compliance with store policies

### Data Protection

- **GDPR**: No personal data collected
- **CCPA**: No data sold or shared
- **Data Minimization**: Only necessary metadata accessed
- **User Control**: Users control all settings

## Additional Resources

- [Mozilla WebExtensions Security](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Security_best_practices)
- [Thunderbird Extension Security](https://developer.thunderbird.net/add-ons/extension-guidelines/security-review)
- [OWASP Web Security](https://owasp.org/www-project-web-security-testing-guide/)

## Contact

For security questions or concerns:
- **Security Email**: [Insert security contact email]
- **GitHub Issues**: https://github.com/[username]/QuickFilterBy/issues
- **Documentation**: https://github.com/[username]/QuickFilterBy

---

**Last Updated**: 2025-02-07
**Next Review**: 2025-08-07 (6 months)
