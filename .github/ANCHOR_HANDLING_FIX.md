# 🔗 Anchor Handling Fix - UTF Character Preservation

**⚠️ CRITICAL:** This document records a recurring issue with anchor generation that has been fixed multiple times. Please read this carefully before modifying `createAnchor()` method.

## 🚨 The Problem

The `createAnchor()` method in `packages/markdown/utils/OpenApiProcessor.js` has repeatedly had issues with UTF character handling, specifically with Turkish and other international characters.

### What Keeps Breaking

The recurring mistake is using JavaScript's `[^\w\s-]` regex to "remove special characters" in the `--no-url-encode` mode. This regex **INCORRECTLY REMOVES UTF CHARACTERS** because JavaScript's `\w` class only matches ASCII word characters.

**❌ BROKEN CODE (DO NOT USE):**
```javascript
// This REMOVES Turkish characters like ı, ş, ğ, ü, etc.
.replace(/[^\w\s-]/g, '') // ❌ WRONG! Removes UTF chars
```

**Examples of what breaks:**
- `Kullanıcı Girişi` → `kullanc girii` (characters missing!)
- `José María` → `Jos Mara` (accents removed!)
- `北京` → `` (completely removed!)

## ✅ The Correct Solution

**Both modes must preserve UTF characters. The ONLY difference should be case handling.**

### Default Behavior (URL encoding enabled)
```javascript
// Preserve case AND UTF characters
anchor = text
  .replace(/\s+/g, '-') // Replace spaces with hyphens
  .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
  .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
```

### `--no-url-encode` Flag
```javascript
// Lowercase but PRESERVE UTF characters
anchor = text
  .toLowerCase() // Only difference: convert to lowercase
  .replace(/\s+/g, '-') // Replace spaces with hyphens
  .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
  .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
```

## 🎯 Expected Behavior

### Turkish Example
```javascript
const text = 'Kullanıcı Girişi ve Token Alımı';

// Default: #Kullanıcı-Girişi-ve-Token-Alımı (case preserved)
// --no-url-encode: #kullanıcı-girişi-ve-token-alımı (lowercase)
```

### Spanish Example
```javascript
const text = 'José María Configuración';

// Default: #José-María-Configuración (case preserved)
// --no-url-encode: #josé-maría-configuración (lowercase)
```

### Chinese Example
```javascript
const text = '用户登录和令牌获取';

// Default: #用户登录和令牌获取 (case preserved - no case change in Chinese)
// --no-url-encode: #用户登录和令牌获取 (same result)
```

## 🔧 Implementation Location

**File:** `packages/markdown/utils/OpenApiProcessor.js`
**Method:** `createAnchor(method, path, summary)`
**Lines:** ~924-956

## 🧪 Testing

Always test with international characters when modifying anchor generation:

```javascript
// Test cases that MUST work
const testCases = [
  'Kullanıcı Girişi ve Token Alımı', // Turkish
  'José María Configuración',        // Spanish
  '用户登录和令牌获取',                // Chinese
  'Здравствуй мир',                  // Russian
  'مرحبا بالعالم',                   // Arabic
];

testCases.forEach(text => {
  const defaultAnchor = createAnchor('', '', text, { urlEncodeAnchors: true });
  const noEncodeAnchor = createAnchor('', '', text, { urlEncodeAnchors: false });
  
  console.log(`${text}:`);
  console.log(`  Default: #${defaultAnchor}`);
  console.log(`  No encode: #${noEncodeAnchor}`);
  
  // Verify UTF characters are preserved
  assert(!defaultAnchor.includes('undefined'));
  assert(!noEncodeAnchor.includes('undefined'));
});
```

## 📊 Historical Failures

This issue has occurred at least **3 times**:

1. **Initial Implementation**: Used `encodeURIComponent()` which broke links
2. **First Fix Attempt**: Used `[^\w\s-]` regex which removed UTF characters
3. **Second Fix Attempt**: Applied URL encoding incorrectly
4. **Final Fix**: Preserve UTF in both modes, only differ by case

## 🔍 Why This Keeps Happening

1. **JavaScript `\w` is ASCII-only**: Developers expect `\w` to match international characters, but it doesn't
2. **Markdown anchor complexity**: Different markdown parsers handle anchors differently
3. **Case sensitivity confusion**: Mixing up case preservation with character preservation
4. **Testing with English only**: International character issues don't surface

## 🛡️ Prevention Checklist

Before modifying `createAnchor()`:

- [ ] Test with Turkish characters (`ı`, `ş`, `ğ`, `ü`)
- [ ] Test with Spanish characters (`ñ`, `é`, `á`)  
- [ ] Test with Chinese characters (`你`, `好`)
- [ ] Verify both default and `--no-url-encode` modes preserve UTF
- [ ] Ensure Quick Reference links match section headers
- [ ] Run full test suite including `npm run test:standalone-markdown`

## 🎯 The Golden Rule

> **UTF characters must ALWAYS be preserved in both modes. The only difference between default and `--no-url-encode` should be case handling.**

## 📝 Related Files

- **Implementation**: `packages/markdown/utils/OpenApiProcessor.js`
- **Template**: `packages/markdown/templates/main.mustache`
- **CLI**: `packages/markdown/cli.js` (flag handling)
- **Documentation**: `CLAUDE.md` (user-facing docs)
- **Tests**: `packages/core/test/anchor-utf-preservation.test.js` (UTF preservation tests)
- **Tests**: `tests/standalone-markdown.test.js` (integration tests)

## 🖥️ Windows Compatibility Fix

**Issue**: Windows CI fails with `'NODE_OPTIONS' is not recognized as an internal or external command`

**Solution**: Updated npm scripts to use `cross-env` for cross-platform compatibility:
```json
// Before (Unix only)
"test": "NODE_OPTIONS='--experimental-vm-modules' jest"

// After (Cross-platform)
"test": "cross-env NODE_OPTIONS='--experimental-vm-modules' jest"
```

**Files Updated**:
- `package.json` (root workspace)
- `packages/core/package.json` 
- `tests/run-all-tests.js`

**Dependencies Added**: 
- `cross-env@^10.0.0` (dev dependency)

## 🔗 Link Generation Process

1. **Quick Reference**: Uses `createAnchor()` to generate `#anchor-links`
2. **Section Headers**: Markdown parsers auto-generate anchors from `## Section Title`
3. **Compatibility**: Our anchors must match what parsers generate
4. **UTF Support**: Critical for international users (Turkish, Spanish, Chinese, etc.)

---

**⚠️ Remember:** When you see anchor-related issues, UTF character preservation is likely the root cause. Always preserve UTF characters, only modify case handling between the two modes.

**🔄 Last Updated:** 2025-09-13 - After 3rd fix of this recurring issue