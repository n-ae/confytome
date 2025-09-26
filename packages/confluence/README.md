# @confytome/confluence

Cross-platform Pandoc-style Markdown generator for Confluence with clipboard integration. Generates clean markdown from OpenAPI specifications and copies it directly to your clipboard for seamless pasting into Confluence pages.

## What It Does

**@confytome/confluence** generates Confluence-ready markdown documentation from OpenAPI specifications and automatically copies the result to your clipboard. Simply run the command, then paste directly into any Confluence page editor.

## Key Features

- 🔄 **Cross-platform** - Works on Windows, macOS, and Linux
- 📋 **Clipboard Integration** - Automatically copies generated content to clipboard
- 🎯 **Confluence Optimized** - Produces clean markdown optimized for Confluence editors
- 🏷️ **Tag-based Organization** - Groups endpoints by OpenAPI tags for logical structure
- 📖 **Parameter Examples** - Displays multiple parameter examples with descriptions
- 🔗 **Hierarchical Navigation** - Creates nested Quick Reference with proper anchor links
- 🔐 **Authentication First** - Prioritizes authentication sections in documentation
- 🌍 **Unicode Support** - Full UTF-8 support including Turkish characters
- 🚀 **Standalone** - Works independently with minimal dependencies

## Installation

```bash
npm install @confytome/confluence
```

## Quick Start

### Generate from OpenAPI Specification

```bash
# Generate from existing OpenAPI spec
npx @confytome/confluence --spec api-spec.json

# Generate from JSDoc comments
npx @confytome/confluence --config confytome.json

# Skip clipboard and save to file only
npx @confytome/confluence --spec api-spec.json --no-clipboard
```

### Workflow

1. **Generate**: Run the confluence generator with your OpenAPI spec
2. **Copy**: Markdown is automatically copied to your clipboard
3. **Paste**: Open Confluence page editor and paste (Ctrl+V / Cmd+V)
4. **Done**: Content appears with proper formatting, navigation, and examples

## CLI Options

| Option | Description | Default |
|--------|-------------|---------|
| `-s, --spec <path>` | OpenAPI specification file | `./api-spec.json` |
| `-c, --config <path>` | Config file for generating spec from JSDoc | |
| `-o, --output <dir>` | Output directory | `./confytome` |
| `--no-clipboard` | Skip copying to clipboard | |
| `--no-brand` | Exclude confytome branding | |
| `--no-url-encode` | Disable URL encoding of anchors | |

## Generated Documentation Structure

The generator creates well-organized documentation with:

- **Title and Version** - API name and version from OpenAPI spec
- **Quick Reference** - Hierarchical navigation with nested endpoints
- **Tag-based Sections** - Endpoints grouped by OpenAPI tags
- **Parameter Examples** - Multiple examples with summaries and descriptions
- **Response Information** - Status codes and descriptions
- **Code Samples** - curl examples for each endpoint

## Architecture

This package follows the Confytome dependency pattern for optimal code reuse:

```
@confytome/confluence → @confytome/markdown → @confytome/core
```

- **@confytome/confluence** handles clipboard integration and Confluence workflow
- **@confytome/markdown** generates the markdown content with templates
- **@confytome/core** processes OpenAPI specifications and extracts documentation data

## Programmatic Usage

```javascript
import { StandaloneConfluenceGenerator } from '@confytome/confluence';

const generator = new StandaloneConfluenceGenerator('./output', {
  specPath: './api-spec.json',
  excludeBrand: false,
  urlEncodeAnchors: true
});

const result = await generator.generate({
  copyToClipboard: true
});

if (result.success) {
  console.log('Documentation generated and copied to clipboard!');
  console.log('Output file:', result.outputPath);
}
```

## Confluence Integration Tips

- **Pasting**: Use Ctrl+V (Windows/Linux) or Cmd+V (macOS) to paste
- **Headers**: Confluence automatically formats markdown headers
- **Code Blocks**: Markdown code blocks render as Confluence code macros
- **Links**: Anchor links work within the same page
- **Tables**: Parameter tables render as native Confluence tables

## Advanced Features

### Tag-based Organization

Endpoints are automatically grouped by their OpenAPI tags:

```yaml
# OpenAPI spec
paths:
  /users:
    get:
      tags: [Users]  # Creates "Users" section
  /auth/login:
    post:
      tags: [Authentication]  # Creates "Authentication" section (appears first)
```

### Parameter Examples

Multiple examples are displayed with rich formatting:

```yaml
# OpenAPI spec
parameters:
  - name: userId
    examples:
      valid_user:
        summary: "Valid user ID"
        description: "A typical user ID that exists in the system"
        value: 12345
      admin_user:
        summary: "Admin user ID"
        description: "An admin user with special permissions"
        value: 1
```

## License

MIT

## Related Packages

- [@confytome/core](../core) - Core OpenAPI generator and processing
- [@confytome/markdown](../markdown) - Markdown documentation generator
- [@confytome/html](../html) - HTML documentation generator
- [@confytome/swagger](../swagger) - Interactive Swagger UI generator