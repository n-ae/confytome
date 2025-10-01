# CLI Command Consistency

**Date:** 2025-10-01
**Status:** Standardized across all generators

## Overview

All generator packages (@confytome/markdown, @confytome/html, @confytome/swagger, @confytome/postman, @confytome/confluence) now follow a consistent CLI interface pattern for ease of use and maintainability.

## Standard Command Structure

All generators support three commands:

### 1. `generate` - Generate documentation from OpenAPI spec

**Common Options (All Generators):**
```bash
-s, --spec <path>       # Path to OpenAPI spec file (default: "./api-spec.json")
-o, --output <path>     # Output directory (default: "./confytome")
--no-brand              # Exclude confytome branding
```

**Advanced Options (Markdown & Confluence Only):**
```bash
-c, --config <path>     # Server config JSON for generating spec from JSDoc
-f, --files <files...>  # JSDoc files to process
--no-url-encode         # Disable URL encoding for anchor links
```

**Confluence-Specific:**
```bash
--no-clipboard          # Skip copying markdown to clipboard
```

### 2. `validate` - Validate OpenAPI spec file

**Options:**
```bash
-s, --spec <path>       # Path to OpenAPI spec file (default: "./api-spec.json")
```

### 3. `info` - Show generator information

**No options** - Displays package metadata, version, and features

## Usage Examples

### Markdown Generator
```bash
# Generate from existing spec
npx @confytome/markdown generate -s api-spec.json -o docs

# Generate from JSDoc (with spec generation)
npx @confytome/markdown generate -c server.js -f routes/*.js -o docs

# Validate spec
npx @confytome/markdown validate -s api-spec.json

# Show info
npx @confytome/markdown info
```

### HTML Generator
```bash
# Generate from spec
npx @confytome/html generate -s api-spec.json -o docs

# Validate spec
npx @confytome/html validate -s api-spec.json

# Show info
npx @confytome/html info
```

### Swagger Generator
```bash
# Generate Swagger UI
npx @confytome/swagger generate -s api-spec.json -o docs

# Validate spec
npx @confytome/swagger validate -s api-spec.json

# Show info
npx @confytome/swagger info
```

### Postman Generator
```bash
# Generate Postman collection
npx @confytome/postman generate -s api-spec.json -o docs

# Validate spec
npx @confytome/postman validate -s api-spec.json

# Show info
npx @confytome/postman info
```

### Confluence Generator
```bash
# Generate for Confluence (with clipboard)
npx @confytome/confluence generate -s api-spec.json -o docs

# Generate without clipboard
npx @confytome/confluence generate -s api-spec.json -o docs --no-clipboard

# Generate with custom anchor format
npx @confytome/confluence generate -s api-spec.json --no-url-encode

# Validate spec
npx @confytome/confluence validate -s api-spec.json

# Show info
npx @confytome/confluence info
```

## Feature Matrix

| Feature | Markdown | HTML | Swagger | Postman | Confluence |
|---------|----------|------|---------|---------|------------|
| **generate command** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **validate command** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **info command** | ✅ | ✅ | ✅ | ✅ | ✅ |
| `-s, --spec` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `-o, --output` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `--no-brand` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `-c, --config` | ✅ | ❌ | ❌ | ❌ | ✅ |
| `-f, --files` | ✅ | ❌ | ❌ | ❌ | ✅ |
| `--no-url-encode` | ✅ | ❌ | ❌ | ❌ | ✅ |
| `--no-clipboard` | ❌ | ❌ | ❌ | ❌ | ✅ |

## Design Decisions

### Why Three Commands?

1. **`generate`** - Primary use case: create documentation
2. **`validate`** - Debug/verify specs before generation
3. **`info`** - Quick metadata lookup without reading docs

### Why Different Options Per Generator?

**JSDoc Integration (`-c, --config`, `-f, --files`):**
- Only markdown and confluence generators support this
- These formats are the most common for internal API documentation
- HTML/Swagger/Postman assume you already have an OpenAPI spec

**Anchor Encoding (`--no-url-encode`):**
- Only relevant for markdown-based formats (markdown, confluence)
- Controls whether anchors use URL encoding or preserve case
- HTML/Swagger/Postman use their own anchor systems

**Clipboard Integration (`--no-clipboard`):**
- Unique to confluence generator
- Confluence users typically paste content directly into the editor
- Other formats generate files that users save/upload

### Backward Compatibility

The confluence generator previously used a default action (no command required):
```bash
# Old (still works via commander's default command handling)
npx @confytome/confluence -s api-spec.json

# New (recommended)
npx @confytome/confluence generate -s api-spec.json
```

Both syntaxes work, but the new syntax is recommended for consistency.

## Implementation Details

### Code Structure

All CLI files follow this pattern:

```javascript
#!/usr/bin/env node

import { program } from 'commander';
import fs from 'node:fs';
import path from 'node:path';
import { StandaloneXGenerator } from './standalone-generator.js';

const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

program
  .name('@confytome/X')
  .description('...')
  .version(pkg.version);

program
  .command('generate')
  .description('...')
  .option('-s, --spec <path>', '...', './api-spec.json')
  .option('-o, --output <path>', '...', './confytome')
  .option('--no-brand', '...')
  // ... package-specific options
  .action(async(options) => { /* ... */ });

program
  .command('validate')
  .description('...')
  .option('-s, --spec <path>', '...', './api-spec.json')
  .action(async(options) => { /* ... */ });

program
  .command('info')
  .description('...')
  .action(() => { /* ... */ });

program.parse();
```

### Testing

All commands are tested in the generator test suites:
- `packages/confluence/test/header-parameters.test.js` (16 tests)
- `packages/confluence/test/components-and-refs.test.js` (9 tests)
- `tests/standalone-markdown.test.js` (10 tests)

## Future Enhancements

Potential features for future versions:

1. **Watch Mode** - `--watch` flag to regenerate on spec changes
2. **Dry Run** - `--dry-run` flag to preview without writing files
3. **Format Option** - Allow multiple output formats in one command
4. **Config Files** - Support `.confytomerc` for default options

## Maintenance Guidelines

When adding new options:

1. **Add to all generators** if it's format-agnostic (like `--theme`)
2. **Add to specific generators** if it's format-specific (like `--css-file` for HTML)
3. **Update this document** with the new option in the feature matrix
4. **Add tests** to verify the option works correctly
5. **Update CLAUDE.md** with usage examples

## Related Documents

- [ADR-018: Dependency Architecture Simplification](./adrs/adr-018-dependency-architecture-simplification.md)
- [ADR-019: Maintainability Assessment - Dependency Architecture](./adrs/adr-019-maintainability-assessment-dependency-architecture.md)
- [ADR-020: Confluence Generator Dependency Architecture](./adrs/adr-020-confluence-generator-dependency-architecture.md)
- [ADR-021: Maintainability Assessment - Post Test Suite Enhancement](./adrs/adr-021-maintainability-assessment-post-test-enhancement-2025-10.md)
- [CLAUDE.md](../CLAUDE.md) - Project documentation and commands
