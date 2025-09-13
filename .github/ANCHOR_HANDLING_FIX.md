# 🔗 UTF Anchor Fix - Critical Reference

**⚠️ CRITICAL:** This `createAnchor()` method has failed 3 times due to UTF handling.

## 🚨 The Problem
Never use `[^\w\s-]` regex - it removes Turkish `ı`, `ş`, Spanish `ñ`, Chinese characters, etc.

## ✅ Correct Implementation
```javascript
if (this.options.urlEncodeAnchors === false) {
  // --no-url-encode: lowercase, preserve UTF
  anchor = text.toLowerCase().replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
} else {
  // Default: preserve case AND UTF
  anchor = text.replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
}
```

## 🎯 Expected Results
- Turkish: `Kullanıcı Girişi` → `Kullanıcı-Girişi` (default) / `kullanıcı-girişi` (--no-url-encode)
- Spanish: `José María` → `José-María` (default) / `josé-maría` (--no-url-encode)

## 🛡️ Prevention
- Test with Turkish (`ı`, `ş`), Spanish (`ñ`), Chinese characters
- Run `packages/core/test/anchor-utf-preservation.test.js` (20 test cases)
- **Golden Rule**: Only difference should be case, never remove UTF characters

**Location**: `packages/markdown/utils/OpenApiProcessor.js:924-956`