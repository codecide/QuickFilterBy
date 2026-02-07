# Translation Guide

## Overview

QuickFilterBy is designed to be easily translatable. This guide explains how to add a new language, translate messages, and submit translations.

## Getting Started

### What Needs Translation?

All user-facing strings are in `_locales/en/messages.json`. You'll need to translate:

- Menu item labels (e.g., "Sender", "Subject", "Filter by Date")
- Error messages (e.g., "Filter Failed", "No messages found")
- Description strings

### File Structure

```
QuickFilterBy/
└── _locales/
    ├── en/
    │   └── messages.json        # English (reference)
    ├── fr/
    │   └── messages.json        # French
    ├── es/
    │   └── messages.json        # Spanish
    ├── de/
    │   └── messages.json        # German
    ├── zh_CN/
    │   └── messages.json        # Chinese Simplified
    ├── ja/
    │   └── messages.json        # Japanese
    └── [your_locale]/
        └── messages.json        # Your language
```

## Adding a New Language

### Step 1: Choose a Locale Code

Use [IETF BCP 47 language tags](https://www.iana.org/assignments/language-subtag-registry):
- `fr` - French
- `es` - Spanish
- `de` - German
- `zh_CN` - Chinese Simplified
- `ja` - Japanese
- `pt_BR` - Portuguese (Brazil)
- `ru` - Russian
- `it` - Italian
- `nl` - Dutch
- And more...

### Step 2: Create Locale Directory

```bash
mkdir -p _locales/[your_locale]
```

### Step 3: Copy English Template

Copy `_locales/en/messages.json` to your locale directory:
```bash
cp _locales/en/messages.json _locales/[your_locale]/messages.json
```

### Step 4: Translate Messages

Open `messages.json` and translate each `message` value:

```json
{
  "sender": {
    "message": "Absender"  // Translate this
  },
  "subject": {
    "message": "Betreff"  // Translate this
  }
}
```

**Important:**
- **Keep the keys** (e.g., `"sender"`) - these are internal IDs
- **Only translate the `message` values**
- Maintain JSON structure and formatting

## Translation Guidelines

### 1. Be Concise

Menu items should be short and clear:
- ✅ Good: "Filter by Sender" (13 characters)
- ✅ Good: "Sender" (7 characters)
- ❌ Bad: "Filter messages by the person who sent them" (40 characters)

### 2. Use Action-Oriented Language

Tell users what will happen:
- ✅ Good: "Filter by Date"
- ❌ Bad: "Date Filter"

### 3. Maintain Consistency

Use the same terms throughout:
- If "Filter" is "Filtrar" in one place, use "Filtrar" everywhere
- Follow Thunderbird's terminology when possible

### 4. Consider Context

Some strings have context hints:
- `sender`: The email sender (From field)
- `recipient`: The email recipient (To field)
- `subject`: Email subject line
- `attachment`: Email attachment

### 5. Accessibility

Screen readers should read labels naturally:
- ✅ Good: "Filter by Unread" (clear, action-oriented)
- ❌ Bad: "Unread Filt" (unclear)
- ❌ Bad: "Unread ▲" (screen reader won't read symbol)

### 6. Cultural Considerations

- Date formats (some cultures use DMY, others MDY)
- Formal vs informal language
- Address book terminology
- Common phrases in your language

### 7. Don't Translate Internal Keys

Never translate the JSON keys (property names):
```json
{
  "sender": {              // ❌ Don't translate "sender"
    "message": "Absender"  // ✅ Only translate the message
  }
}
```

### 8. Preserve Placeholders

Some messages may have placeholders:
```json
{
  "noMessages": {
    "message": "No messages found in {range}"  // Keep {range}
  }
}
```

## Special Messages

### Meta Messages (Optional)

These are for documentation only:
```json
{
  "_translator_credit": {
    "message": "German translation - [Your Name Here]"
  },
  "_last_updated": {
    "message": "2025-02-07"
  }
}
```

- Add your name as translator credit (optional)
- Update the `_last_updated` date when you submit

### Keys with Context

Some keys describe specific fields:
- `senderEmail`: Filter by email address only
- `sender`: Filter by display name (may include name and email)
- `tagsThisMessage`: Filter by tags on currently selected message
- `tagsChooseTags`: Open UI to select tags manually

## Testing Translations

### 1. Validate JSON Format

Ensure your `messages.json` is valid JSON:
```bash
# Validate with jq (if available)
jq . _locales/[your_locale]/messages.json

# Or use online validator
# https://jsonlint.com/
```

### 2. Check for Missing Keys

Ensure all English keys are present in your translation:
```bash
# Get English keys
jq 'keys' _locales/en/messages.json > en_keys.txt

# Get your locale keys
jq 'keys' _locales/[your_locale]/messages.json > your_keys.txt

# Compare
diff en_keys.txt your_keys.txt
```

### 3. Test in Thunderbird

1. Build the extension:
   ```bash
   npm run build
   # or
   make build
   ```

2. Load in Thunderbird:
   - Open Thunderbird
   - Go to Tools → Add-ons and Themes
   - Click gear → Install Add-on From File...
   - Select QuickFilterBy.xpi

3. Change Thunderbird language:
   - Settings → General → Language
   - Select your language
   - Restart Thunderbird

4. Test all menu items:
   - Right-click on a message
   - Verify menu items are in your language
   - Try each filter option
   - Verify error messages

### 4. Check for Truncation

Some locales have longer text. Watch for:
- Truncated menu items
- Overlapping text
- Broken layouts

If text is too long:
- Use shorter alternatives
- Use abbreviations
- Remove filler words

## Tools and Resources

### Translation Tools

**Online Platforms:**
- [Weblate](https://weblate.org/) - Open source translation platform
- [Crowdin](https://crowdin.com/) - Commercial platform
- [Transifex](https://www.transifex.com/) - Popular for extensions

**Desktop Tools:**
- [Poedit](https://poedit.net/) - Translation editor
- [OmegaT](https://omegat.org/) - Translation memory tool
- [Lokalise](https://www.lokalise.com/) - CAT tool

**Firefox/Thunderbird Specific:**
- [Mozilla Pontoon](https://pontoon.mozilla.org/) - Mozilla's translation platform
- [Thunderbird Translations](https://hg.mozilla.org/l10n-central/) - TB translations repo

### Resources

- [Mozilla Style Guide](https://mozilla-l10n.github.io/styleguide/)
- [W3C i18n Guide](https://www.w3.org/International/)
- [Google Translate Toolkit](https://translate.google.com/toolkit)
- [Mozilla Add-ons Localization](https://extensionworkshop.com/documentation/publish/localization/)

## Common Translation Issues

### Issue 1: Gendered Language

Some languages have gender. Use:
- Gender-neutral forms when possible
- Follow Thunderbird's conventions
- Use placeholders if needed

### Issue 2: Plural Forms

Handle singular/plural:
```json
{
  "message": {
    "message": "No messages found"  // English uses plural
  }
}
```

If your language needs separate singular/plural, check with maintainers.

### Issue 3: RTL (Right-to-Left) Languages

For Arabic, Hebrew, Farsi, etc.:
- System menus handle RTL automatically
- No special translation needed
- Test in RTL Thunderbird build

### Issue 4: Special Characters

- Use UTF-8 encoding
- Include diacritics as needed (é, ñ, ü, etc.)
- Use native characters when possible

## Submitting Translations

### Option 1: Pull Request

Best for community contributions:

1. Fork the repository:
   ```bash
   # On GitHub
   # Click "Fork" button
   ```

2. Clone your fork:
   ```bash
   git clone https://github.com/[your-username]/QuickFilterBy.git
   ```

3. Create a branch:
   ```bash
   cd QuickFilterBy
   git checkout -b translate-[language]
   ```

4. Add your translation:
   ```bash
   cp your/messages.json _locales/[language]/
   git add _locales/[language]/
   ```

5. Commit:
   ```bash
   git commit -m "i18n: add [language] translation"
   ```

6. Push:
   ```bash
   git push origin translate-[language]
   ```

7. Create Pull Request:
   - Go to GitHub
   - Click "New Pull Request"
   - Describe what you translated
   - Test instructions (language, Thunderbird version)

### Option 2: Email

If you don't use GitHub:

1. Email translations to:
   ```
   [Insert contact email]
   ```

2. Include:
   - Language name
   - Attached messages.json file
   - Translator name (for credit, optional)
   - Any notes or questions

### Option 3: Issue Tracker

1. Go to [GitHub Issues](https://github.com/[username]/QuickFilterBy/issues)
2. Create new issue with label `translation`
3. Attach or paste your translation
4. We'll review and merge

## Translation Review

### What We Check

When reviewing translations, we check:
- ✅ All keys translated
- ✅ JSON format is valid
- ✅ No placeholder errors
- ✅ Consistent terminology
- ✅ Appropriate length (no truncation)
- ✅ Cultural appropriateness

### Feedback Process

1. Review takes 1-2 weeks
2. We may request changes
3. Once approved, translation merged
4. Credit added to locale file

## Getting Help

### Ask Questions

If you're unsure about a translation:

- Open an issue with label `translation-help`
- Provide context: "How should I translate 'sender' - is it 'from' or 'by'?"
- Include alternatives you're considering

### Report Issues

Found a translation issue?

- Open issue with label `translation-bug`
- Include: locale, key, current text, expected text
- Provide screenshot if helpful

## Maintaining Translations

### Updating Existing Translations

When new strings are added:
1. We'll update English (`en/messages.json`)
2. We'll add `_new` tag to new keys
3. Translators: check for `_new` keys
4. Translate and submit PR

### Removing Deprecated Strings

When messages are removed:
1. We'll update all locale files
2. No action needed from translators
3. Next release will have clean translations

## Recognition

### Translator Credits

Contributors are recognized in:
- Release notes (your name)
- Locale file (`_translator_credit` field)
- GitHub contributors list

Thank you for helping make QuickFilterBy accessible to everyone! 🌍

---

**Last Updated**: 2025-02-07
**Next Review**: 2025-08-07
